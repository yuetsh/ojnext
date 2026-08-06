<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useThemeVars } from "naive-ui"
import { storeToRefs } from "pinia"
import { getReaction, setReaction } from "oj/api"
import { useProblemStore } from "oj/store/problem"
import { useUserStore } from "shared/store/user"
import { REACTIONS } from "utils/constants"
import type { ReactionCounts, ReactionKey } from "utils/types"

const emit = defineEmits<{ submitted: [] }>()

const userStore = useUserStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const message = useMessage()
const theme = useThemeVars()
const headingId = useId()

const mine = ref<ReactionKey | null>(null)
const counts = ref<ReactionCounts | null>(null)
const loading = ref(false)
// 正在提交的 key，用来锁住整组并只在当前选项显示进度。
const submitting = ref<ReactionKey | null>(null)
let loadSequence = 0

const solved = computed(() => problem.value?.my_status === 0)
const locked = computed(() => mine.value !== null)
const selectedLabel = computed(
  () => REACTIONS.find((item) => item.key === mine.value)?.label ?? "",
)
const totalCount = computed(() => {
  if (!counts.value) return 0
  return Object.values(counts.value).reduce((sum, count) => sum + count, 0)
})

const heading = computed(() => {
  if (!solved.value) return "通关后，再回来聊聊这道题"
  if (locked.value) return "你的第一印象，已经记下来了"
  return "这道题给你什么感觉？"
})

const description = computed(() => {
  if (!solved.value) return "先专注完成解题，判题通过后点评入口会自动开放。"
  if (locked.value) return "看看大家的感受，也许你们对这道题有相同的判断。"
  return "选出最贴切的一项，反馈会帮助老师继续优化题目。"
})

const state = computed(() => {
  if (loading.value) return { icon: "ph:spinner-gap-bold", label: "读取中" }
  if (submitting.value) return { icon: "ph:spinner-gap-bold", label: "记录中" }
  if (!solved.value) return { icon: "ph:lock-key-bold", label: "完成后开放" }
  if (locked.value) return { icon: "ph:check-circle-fill", label: "已提交" }
  return { icon: "ph:cursor-click-bold", label: "等待选择" }
})

const statusText = computed(() => {
  if (loading.value) return "正在读取点评记录"
  if (!solved.value) return "判题结果通过后即可参与点评"
  if (locked.value) return `你选择了「${selectedLabel.value}」`
  if (submitting.value) return "正在记录你的点评"
  return "点击即提交，点评提交后不能修改"
})

const reactionStyle = computed(() => ({
  "--reaction-accent": theme.value.primaryColor,
  "--reaction-accent-hover": theme.value.primaryColorHover,
  "--reaction-accent-pressed": theme.value.primaryColorPressed,
  "--reaction-card": theme.value.cardColor,
  "--reaction-canvas": theme.value.bodyColor,
  "--reaction-text": theme.value.textColor1,
  "--reaction-text-muted": theme.value.textColor2,
  "--reaction-text-faint": theme.value.textColor3,
  "--reaction-divider": theme.value.dividerColor,
  "--reaction-success": theme.value.successColor,
}))

function optionAriaLabel(key: ReactionKey, label: string) {
  const count = counts.value?.[key]
  const countText = count === undefined ? "" : `，${count} 人选择`
  const selectedText = mine.value === key ? "，你的选择" : ""
  return `${label}${countText}${selectedText}`
}

async function pick(key: ReactionKey) {
  if (
    !problem.value ||
    !solved.value ||
    locked.value ||
    loading.value ||
    submitting.value
  )
    return

  submitting.value = key
  try {
    const res = await setReaction(problem.value.id, key)
    mine.value = res.data.mine
    counts.value = res.data.counts
    emit("submitted")
  } catch {
    message.error("提交失败，请重试")
  } finally {
    submitting.value = null
  }
}

async function load(problemId: number) {
  const sequence = ++loadSequence
  loading.value = true
  try {
    const res = await getReaction(problemId)
    if (sequence !== loadSequence) return
    mine.value = res.data.mine
    counts.value = res.data.counts
  } catch {
    if (sequence === loadSequence) message.error("暂时无法读取题目点评")
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

watch(
  [() => userStore.isAuthed, () => problem.value?.id],
  ([isAuthed, problemId]) => {
    mine.value = null
    counts.value = null
    submitting.value = null

    if (!isAuthed || problemId === undefined) {
      loadSequence += 1
      loading.value = false
      return
    }
    load(problemId)
  },
  { immediate: true },
)
</script>

<template>
  <section
    class="reaction-panel"
    :style="reactionStyle"
    :aria-labelledby="headingId"
  >
    <header class="reaction-header">
      <div class="reaction-heading">
        <div class="reaction-kicker">
          <span class="kicker-icon" aria-hidden="true">
            <Icon icon="ph:chat-circle-text-fill" />
          </span>
          <span>题目点评</span>
          <span v-if="counts" class="response-total">
            {{ totalCount }} 次反馈
          </span>
        </div>
        <h2 :id="headingId">{{ heading }}</h2>
        <p>{{ description }}</p>
      </div>

      <div class="state-chip" :class="{ 'is-complete': locked }">
        <Icon
          :icon="state.icon"
          :class="{ 'is-spinning': loading || !!submitting }"
          aria-hidden="true"
        />
        <span>{{ state.label }}</span>
      </div>
    </header>

    <div v-if="!userStore.isAuthed" class="signed-out-state">
      <span class="signed-out-icon" aria-hidden="true">
        <Icon icon="ph:user-circle-dashed" />
      </span>
      <div>
        <strong>登录后参与点评</strong>
        <p>完成题目后，你可以留下自己的第一印象。</p>
      </div>
    </div>

    <template v-else>
      <div
        class="reaction-grid"
        role="group"
        aria-label="选择一项题目点评，点击后立即提交"
        :aria-busy="loading || !!submitting"
      >
        <button
          v-for="item in REACTIONS"
          :key="item.key"
          type="button"
          class="reaction-option"
          :class="{
            'is-selected': mine === item.key,
            'is-submitting': submitting === item.key,
            'is-muted': locked && mine !== item.key,
            'is-unavailable': !solved || loading,
          }"
          :disabled="!solved || locked || loading || !!submitting"
          :aria-pressed="mine === item.key"
          :aria-label="optionAriaLabel(item.key, item.label)"
          @click="pick(item.key)"
        >
          <span class="option-icon" aria-hidden="true">
            <Icon
              :icon="
                submitting === item.key
                  ? 'svg-spinners:180-ring-with-bg'
                  : item.icon
              "
            />
          </span>

          <span class="option-copy">
            <span class="option-label">{{ item.label }}</span>
            <span v-if="counts" class="option-count">
              {{ counts[item.key] }} 人
            </span>
          </span>

          <span
            v-if="mine === item.key"
            class="selected-mark"
            aria-hidden="true"
          >
            <Icon icon="ph:check-bold" />
          </span>
        </button>
      </div>

      <footer class="reaction-status" aria-live="polite">
        <Icon
          :icon="
            locked
              ? 'ph:check-circle-bold'
              : solved
                ? 'ph:info-bold'
                : 'ph:lock-simple-bold'
          "
          aria-hidden="true"
        />
        <span>{{ statusText }}</span>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.reaction-panel {
  width: min(100%, 880px);
  box-sizing: border-box;
  container-type: inline-size;
  margin: clamp(16px, 3vw, 32px) auto;
  padding: clamp(16px, 3.5vw, 32px);
  color: var(--reaction-text);
}

.reaction-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.reaction-heading {
  min-width: 0;
}

.reaction-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--reaction-accent);
  font-size: 13px;
  font-weight: 650;
}

.kicker-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  background: color-mix(in srgb, var(--reaction-accent) 12%, transparent);
  font-size: 17px;
}

.response-total {
  padding-left: 8px;
  border-left: 1px solid var(--reaction-divider);
  color: var(--reaction-text-faint);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.reaction-heading h2 {
  margin: 0;
  color: var(--reaction-text);
  font-size: clamp(22px, 4.5cqi, 30px);
  font-weight: 720;
  line-height: 1.25;
  text-wrap: balance;
}

.reaction-heading p {
  max-width: 54ch;
  margin: 9px 0 0;
  color: var(--reaction-text-muted);
  font-size: 14px;
  line-height: 1.75;
  text-wrap: pretty;
}

.state-chip {
  display: inline-flex;
  min-height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--reaction-text-faint) 8%, transparent);
  color: var(--reaction-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.state-chip.is-complete {
  background: color-mix(in srgb, var(--reaction-success) 12%, transparent);
  color: var(--reaction-success);
}

.state-chip svg {
  font-size: 15px;
}

.reaction-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.reaction-option {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 82px;
  align-items: center;
  gap: 11px;
  box-sizing: border-box;
  padding: 14px;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: var(--reaction-card);
  box-shadow:
    inset 0 0 0 1px var(--reaction-divider),
    0 1px 3px rgba(15, 23, 42, 0.1);
  color: var(--reaction-text);
  font: inherit;
  text-align: left;
  touch-action: manipulation;
  cursor: pointer;
  transition-property: transform, box-shadow, background-color, opacity;
  transition-duration: 140ms;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.reaction-option:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--reaction-accent) 36%, transparent);
  outline-offset: 2px;
}

.reaction-option:active:not(:disabled) {
  transform: scale(0.97);
  background: color-mix(
    in srgb,
    var(--reaction-accent-pressed) 7%,
    var(--reaction-card)
  );
}

.reaction-option:disabled {
  cursor: not-allowed;
}

.reaction-option.is-unavailable {
  opacity: 0.58;
}

.reaction-option.is-muted {
  opacity: 0.48;
}

.reaction-option.is-selected {
  background: color-mix(
    in srgb,
    var(--reaction-accent) 10%,
    var(--reaction-card)
  );
  box-shadow:
    inset 0 0 0 2px var(--reaction-accent),
    0 5px 16px color-mix(in srgb, var(--reaction-accent) 15%, transparent);
  opacity: 1;
}

.reaction-option.is-submitting {
  background: color-mix(
    in srgb,
    var(--reaction-accent) 8%,
    var(--reaction-card)
  );
  box-shadow: inset 0 0 0 2px var(--reaction-accent);
  opacity: 1;
}

.option-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 10px;
  background: var(--reaction-canvas);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--reaction-divider) 70%, transparent);
  font-size: 27px;
}

.option-icon svg {
  width: 27px;
  height: 27px;
}

.option-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.option-label {
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-count {
  color: var(--reaction-text-faint);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

.selected-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: var(--reaction-accent);
  color: var(--reaction-card);
  font-size: 12px;
}

.reaction-status {
  display: flex;
  min-height: 24px;
  align-items: center;
  gap: 7px;
  margin-top: 16px;
  color: var(--reaction-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.reaction-status svg {
  flex: 0 0 auto;
  font-size: 15px;
}

.signed-out-state {
  display: flex;
  min-height: 128px;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
  padding: 22px;
  border-radius: 12px;
  background: color-mix(
    in srgb,
    var(--reaction-text-faint) 6%,
    var(--reaction-card)
  );
  box-shadow: inset 0 0 0 1px var(--reaction-divider);
}

.signed-out-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border-radius: 12px;
  background: var(--reaction-canvas);
  color: var(--reaction-text-muted);
  font-size: 28px;
}

.signed-out-state strong {
  display: block;
  margin-bottom: 4px;
  color: var(--reaction-text);
  font-size: 15px;
}

.signed-out-state p {
  margin: 0;
  color: var(--reaction-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.is-spinning {
  animation: reaction-spin 850ms linear infinite;
}

@media (hover: hover) {
  .reaction-option:hover:not(:disabled) {
    transform: translateY(-2px);
    background: color-mix(
      in srgb,
      var(--reaction-accent-hover) 6%,
      var(--reaction-card)
    );
    box-shadow:
      inset 0 0 0 1px
        color-mix(in srgb, var(--reaction-accent) 55%, var(--reaction-divider)),
      0 7px 18px rgba(15, 23, 42, 0.12);
  }
}

@container (min-width: 480px) {
  .reaction-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .reaction-option {
    min-height: 116px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
}

@container (max-width: 440px) {
  .reaction-header {
    flex-direction: column;
    gap: 14px;
  }

  .state-chip {
    align-self: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reaction-option {
    transition-duration: 0.01ms;
  }

  .is-spinning {
    animation-duration: 1.8s;
  }
}

@keyframes reaction-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
