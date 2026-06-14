# Submit Formatting Button State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show `格式化中` on the submit button during automatic formatting, then show `正在提交` continuously while the submission request is pending.

**Architecture:** Extract the button presentation rules into a small pure TypeScript function so the state priority can be tested without adding a frontend test framework. Keep formatter and submission-request flags local to `SubmitCode.vue`, with `finally` blocks ensuring both flags clear on every outcome.

**Tech Stack:** Vue 3 Composition API, TypeScript, Node.js built-in test runner, Rsbuild

---

### Task 1: Define and test submit button presentation rules

**Files:**
- Create: `tests/submitButtonState.test.ts`
- Create: `src/oj/problem/components/submitButtonState.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/submitButtonState.test.ts`:

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { getSubmitButtonState } from "../src/oj/problem/components/submitButtonState.ts"

const idleInput = {
  isAuthed: true,
  hasCode: true,
  isFormatting: false,
  isSubmitting: false,
  isJudging: false,
  isCooldown: false,
}

test("shows a disabled loading state while formatting", () => {
  assert.deepEqual(
    getSubmitButtonState({ ...idleInput, isFormatting: true }),
    {
      disabled: true,
      label: "格式化中",
      icon: "eos-icons:loading",
    },
  )
})

test("shows submitting immediately after formatting", () => {
  assert.deepEqual(
    getSubmitButtonState({ ...idleInput, isSubmitting: true }),
    {
      disabled: true,
      label: "正在提交",
      icon: "eos-icons:loading",
    },
  )
})

test("preserves existing login, judging, cooldown, and idle states", () => {
  assert.deepEqual(
    getSubmitButtonState({ ...idleInput, isAuthed: false }),
    {
      disabled: true,
      label: "请先登录",
      icon: "ph:play-fill",
    },
  )
  assert.deepEqual(getSubmitButtonState({ ...idleInput, isJudging: true }), {
    disabled: true,
    label: "正在评分",
    icon: "eos-icons:loading",
  })
  assert.deepEqual(getSubmitButtonState({ ...idleInput, isCooldown: true }), {
    disabled: true,
    label: "正在冷却",
    icon: "ph:lightbulb-fill",
  })
  assert.deepEqual(getSubmitButtonState(idleInput), {
    disabled: false,
    label: "提交代码",
    icon: "ph:play-fill",
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/submitButtonState.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `submitButtonState.ts`.

- [ ] **Step 3: Implement the pure state function**

Create `src/oj/problem/components/submitButtonState.ts`:

```ts
export interface SubmitButtonStateInput {
  isAuthed: boolean
  hasCode: boolean
  isFormatting: boolean
  isSubmitting: boolean
  isJudging: boolean
  isCooldown: boolean
}

export interface SubmitButtonState {
  disabled: boolean
  label: string
  icon: string
}

export function getSubmitButtonState({
  isAuthed,
  hasCode,
  isFormatting,
  isSubmitting,
  isJudging,
  isCooldown,
}: SubmitButtonStateInput): SubmitButtonState {
  const disabled =
    !isAuthed ||
    !hasCode ||
    isFormatting ||
    isSubmitting ||
    isJudging ||
    isCooldown

  let label = "提交代码"
  if (!isAuthed) {
    label = "请先登录"
  } else if (isFormatting) {
    label = "格式化中"
  } else if (isSubmitting) {
    label = "正在提交"
  } else if (isJudging) {
    label = "正在评分"
  } else if (isCooldown) {
    label = "正在冷却"
  }

  const icon =
    isFormatting || isSubmitting || isJudging
      ? "eos-icons:loading"
      : isCooldown
        ? "ph:lightbulb-fill"
        : "ph:play-fill"

  return { disabled, label, icon }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node --test tests/submitButtonState.test.ts
```

Expected: 3 tests pass.

### Task 2: Connect formatting and submission request lifecycle to the button

**Files:**
- Modify: `src/oj/problem/components/SubmitCode.vue`

- [ ] **Step 1: Add local request states and computed presentation**

Import `getSubmitButtonState`, add `isFormatting` and `isSubmittingRequest` refs, and replace the three existing button computed properties with:

```ts
const buttonState = computed(() =>
  getSubmitButtonState({
    isAuthed: userStore.isAuthed,
    hasCode: codeStore.code.value.trim() !== "",
    isFormatting: isFormatting.value,
    isSubmitting: isSubmittingRequest.value || submitting.value,
    isJudging: judging.value || pending.value,
    isCooldown: isCooldown.value,
  }),
)
```

Use `buttonState.disabled`, `buttonState.icon`, and `buttonState.label` in the template.

- [ ] **Step 2: Guard and track the formatting request**

At the start of `submit`, return when `buttonState.value.disabled` is true. Around `formatCode`, set `isFormatting.value = true` before the request and clear it in `finally`:

```ts
isFormatting.value = true
try {
  const res = await formatCode({
    code: codeStore.code.value,
    language: formatLang,
  })
  codeStore.setCode(res.data.code)
} catch (e: any) {
  if (e?.error === "format-error") {
    message.warning(`代码格式化失败：${e.data}，请检查代码后重试`)
    return
  }
} finally {
  isFormatting.value = false
}
```

- [ ] **Step 3: Track the submission API request**

Set `isSubmittingRequest.value = true` immediately before `submitCode`, keep the existing success flow inside the `try`, and clear the request state in `finally`:

```ts
isSubmittingRequest.value = true
try {
  const res = await submitCode(data)
  console.log(`[Submit] 代码已提交: ID=${res.data.submission_id}`)

  startCooldown()
  startMonitoring(res.data.submission_id)
  showResult.value = true
} finally {
  isSubmittingRequest.value = false
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
node --test tests/submitButtonState.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: Rsbuild exits with status 0.

- [ ] **Step 6: Check the final diff**

Run:

```bash
git diff --check
git diff -- src/oj/problem/components/SubmitCode.vue src/oj/problem/components/submitButtonState.ts tests/submitButtonState.test.ts
```

Expected: no whitespace errors; diff is limited to the button state feature and its test.
