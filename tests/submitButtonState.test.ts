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
  assert.deepEqual(getSubmitButtonState({ ...idleInput, isFormatting: true }), {
    disabled: true,
    label: "格式化中",
    icon: "eos-icons:loading",
  })
})

test("shows submitting immediately after formatting", () => {
  assert.deepEqual(getSubmitButtonState({ ...idleInput, isSubmitting: true }), {
    disabled: true,
    label: "正在提交",
    icon: "eos-icons:loading",
  })
})

test("preserves existing login, judging, cooldown, and idle states", () => {
  assert.deepEqual(getSubmitButtonState({ ...idleInput, isAuthed: false }), {
    disabled: true,
    label: "请先登录",
    icon: "ph:play-fill",
  })
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
