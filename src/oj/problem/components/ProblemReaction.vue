<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useThemeVars } from "naive-ui"
import { storeToRefs } from "pinia"
import type { CSSProperties } from "vue"
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

const mine = ref<ReactionKey | null>(null)
const counts = ref<ReactionCounts | null>(null)
const loading = ref(false)
// 正在提交的 key，用来锁住整组并只在当前选项显示进度。
const submitting = ref<ReactionKey | null>(null)
const activeIndex = ref<number | null>(null)
const keyboardActive = ref(false)
const wheelRef = ref<HTMLElement | null>(null)
let loadSequence = 0

const wheelGeometry = {
  startAngle: -90,
  contentRadius: 34.5,
  pushRadius: 4.5,
  outerRadius: 50,
  gapAngle: 1.15,
  arcPointCount: 9,
  hitInnerRadius: 0.18,
  hitOuterRadius: 0.49,
} as const

const sliceAngle = 360 / REACTIONS.length

function pointOnCircle(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: 50 + Math.cos(radians) * radius,
    y: 50 + Math.sin(radians) * radius,
  }
}

function getWheelItemStyle(index: number): CSSProperties {
  const centerAngle = wheelGeometry.startAngle + index * sliceAngle
  const startAngle = centerAngle - sliceAngle / 2 + wheelGeometry.gapAngle
  const endAngle = centerAngle + sliceAngle / 2 - wheelGeometry.gapAngle
  const position = pointOnCircle(centerAngle, wheelGeometry.contentRadius)
  const push = pointOnCircle(centerAngle, wheelGeometry.pushRadius)
  const arcPoints = Array.from(
    { length: wheelGeometry.arcPointCount },
    (_, pointIndex) => {
      const progress = pointIndex / (wheelGeometry.arcPointCount - 1)
      const angle = startAngle + (endAngle - startAngle) * progress
      const point = pointOnCircle(angle, wheelGeometry.outerRadius)
      return `${point.x.toFixed(3)}% ${point.y.toFixed(3)}%`
    },
  )

  return {
    "--segment-path": `polygon(50% 50%, ${arcPoints.join(", ")})`,
    "--content-x": `${position.x}%`,
    "--content-y": `${position.y}%`,
    "--push-x": `${push.x - 50}px`,
    "--push-y": `${push.y - 50}px`,
  }
}

const wheelItems = REACTIONS.map((item, index) => ({
  ...item,
  index,
  style: getWheelItemStyle(index),
}))

const solved = computed(() => problem.value?.my_status === 0)
const locked = computed(() => mine.value !== null)
const canInteract = computed(
  () =>
    userStore.isAuthed &&
    !!problem.value &&
    solved.value &&
    !locked.value &&
    !loading.value &&
    !submitting.value,
)

const wheelCenter = computed(() => {
  if (loading.value) {
    return {
      icon: "ph:spinner-gap-bold",
      eyebrow: "正在读取",
      label: "题目点评",
      spinning: true,
    }
  }

  if (submitting.value) {
    const item = REACTIONS.find((reaction) => reaction.key === submitting.value)
    return {
      icon: "svg-spinners:180-ring-with-bg",
      eyebrow: "正在记录",
      label: item?.label ?? "提交点评",
      spinning: false,
    }
  }

  if (mine.value) {
    const item = REACTIONS.find((reaction) => reaction.key === mine.value)
    return {
      icon: "ph:check-bold",
      eyebrow: "你的选择",
      label: item?.label ?? "已提交",
      spinning: false,
    }
  }

  if (!userStore.isAuthed) {
    return {
      icon: "ph:user-circle-dashed",
      eyebrow: "登录后开放",
      label: "登录后点评",
      spinning: false,
    }
  }

  if (activeIndex.value !== null) {
    const item = wheelItems[activeIndex.value]
    const count = counts.value?.[item.key]
    return {
      icon: item.icon,
      eyebrow: count === undefined ? "选择这项" : `${count} 人选择`,
      label: item.label,
      spinning: false,
    }
  }

  if (!solved.value) {
    return {
      icon: "ph:lock-simple-bold",
      eyebrow: "完成后开放",
      label: "通关后点评",
      spinning: false,
    }
  }

  return {
    icon: "ph:cursor-click-bold",
    eyebrow: "移动到扇区",
    label: "选择点评",
    spinning: false,
  }
})

const reactionStyle = computed(() => ({
  "--reaction-accent": theme.value.primaryColor,
  "--reaction-card": theme.value.cardColor,
  "--reaction-action": theme.value.actionColor,
  "--reaction-hover": theme.value.hoverColor,
  "--reaction-border": theme.value.borderColor,
  "--reaction-rail": theme.value.railColor,
  "--reaction-shadow": theme.value.boxShadow1,
  "--reaction-text": theme.value.textColor1,
  "--reaction-text-faint": theme.value.textColor3,
}))

function optionAriaLabel(key: ReactionKey, label: string) {
  const count = counts.value?.[key]
  const countText = count === undefined ? "" : `，${count} 人选择`
  const selectedText = mine.value === key ? "，你的选择" : ""
  return `${label}${countText}${selectedText}`
}

function getPointerIndex(event: PointerEvent | MouseEvent) {
  const wheel = wheelRef.value
  if (!wheel) return null

  const bounds = wheel.getBoundingClientRect()
  const x = event.clientX - (bounds.left + bounds.width / 2)
  const y = event.clientY - (bounds.top + bounds.height / 2)
  const distance = Math.hypot(x, y)

  if (
    distance < bounds.width * wheelGeometry.hitInnerRadius ||
    distance > bounds.width * wheelGeometry.hitOuterRadius
  ) {
    return null
  }

  const angle = (Math.atan2(y, x) * 180) / Math.PI
  const rawIndex = Math.round((angle - wheelGeometry.startAngle) / sliceAngle)
  return (
    ((rawIndex % wheelItems.length) + wheelItems.length) % wheelItems.length
  )
}

function preview(index: number, fromKeyboard = false) {
  if (!canInteract.value) return
  keyboardActive.value = fromKeyboard
  activeIndex.value = index
}

function clearPreview() {
  if (locked.value) return
  activeIndex.value = null
  keyboardActive.value = false
}

function onWheelPointerMove(event: PointerEvent) {
  if (!canInteract.value) return
  keyboardActive.value = false
  activeIndex.value = getPointerIndex(event)
}

function onWheelClick(event: MouseEvent) {
  if (!canInteract.value) return
  const target = event.target
  if (target instanceof Element && target.closest(".reaction-option")) return

  const index = getPointerIndex(event)
  if (index !== null) pick(wheelItems[index].key)
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

  activeIndex.value = null
  keyboardActive.value = false
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
    activeIndex.value = null
    keyboardActive.value = false

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
  <section class="reaction-panel" :style="reactionStyle" aria-label="题目点评">
    <div class="wheel-stage">
      <div
        ref="wheelRef"
        class="reaction-wheel"
        :class="{
          'has-selection': locked,
          'is-disabled': !canInteract,
          'is-keyboard-active': keyboardActive,
        }"
        role="group"
        aria-label="选择一项题目点评，点击后立即提交"
        :aria-busy="loading || !!submitting"
        @pointermove="onWheelPointerMove"
        @pointerleave="clearPreview"
        @click="onWheelClick"
      >
          <span
            v-for="item in wheelItems"
            :key="`${item.key}-face`"
            class="segment-face"
            :class="{
              'is-active': activeIndex === item.index,
              'is-selected': mine === item.key,
              'is-submitting': submitting === item.key,
            }"
            :style="item.style"
            aria-hidden="true"
          />

          <button
            v-for="item in wheelItems"
            :key="item.key"
            type="button"
            class="reaction-option"
            :class="{
              'is-active': activeIndex === item.index,
              'is-selected': mine === item.key,
              'is-submitting': submitting === item.key,
              'is-muted': locked && mine !== item.key,
              'is-unavailable': !userStore.isAuthed || !solved || loading,
            }"
            :style="item.style"
            :disabled="!canInteract"
            :aria-pressed="mine === item.key"
            :aria-label="optionAriaLabel(item.key, item.label)"
            @focus="preview(item.index, true)"
            @blur="clearPreview"
            @click.stop="pick(item.key)"
          >
            <span class="option-content">
              <span class="option-icon" aria-hidden="true">
                <Icon
                  :icon="
                    submitting === item.key
                      ? 'svg-spinners:180-ring-with-bg'
                      : item.icon
                  "
                />
              </span>
              <span class="option-label">{{ item.label }}</span>
              <span v-if="counts" class="option-count">
                {{ counts[item.key] }} 人
              </span>
            </span>
          </button>

          <div class="wheel-core" aria-hidden="true">
            <div class="core-content">
              <Icon
                class="core-icon"
                :class="{ 'is-spinning': wheelCenter.spinning }"
                :icon="wheelCenter.icon"
              />
              <span class="core-eyebrow">{{ wheelCenter.eyebrow }}</span>
              <strong class="core-label">{{ wheelCenter.label }}</strong>
            </div>
          </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reaction-panel {
  width: min(100%, 880px);
  box-sizing: border-box;
  container-type: inline-size;
  margin: 0 auto;
  padding: clamp(16px, 3.5vw, 32px);
  color: var(--reaction-text);
}

.wheel-stage {
  display: grid;
  place-items: center;
  padding: 4px 0 12px;
}

.reaction-wheel {
  position: relative;
  width: min(100%, 440px);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
  background: var(--reaction-rail);
  box-shadow:
    var(--reaction-shadow),
    inset 0 0 0 1px var(--reaction-border),
    inset 0 0 0 10px var(--reaction-card),
    inset 0 0 0 11px var(--reaction-border);
  isolation: isolate;
}

.reaction-wheel::before {
  position: absolute;
  z-index: 8;
  inset: 9px;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1px var(--reaction-border),
    inset 0 0 10px color-mix(in srgb, var(--reaction-text) 7%, transparent);
  pointer-events: none;
  content: "";
}

.segment-face {
  position: absolute;
  inset: 13px;
  overflow: hidden;
  background: var(--reaction-action);
  clip-path: var(--segment-path);
  transform: translate(0, 0) scale(1);
  transform-origin: center;
  pointer-events: none;
  transition:
    transform 150ms cubic-bezier(0, 0, 0.2, 1),
    background-color 150ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 150ms ease-out,
    filter 150ms ease-out;
}

.segment-face:is(.is-active, .is-submitting, .is-selected) {
  z-index: 2;
  background: color-mix(
    in srgb,
    var(--reaction-accent) 9%,
    var(--reaction-hover)
  );
}

.segment-face.is-active,
.segment-face.is-submitting {
  transform: translate(calc(var(--push-x) * 0.67), calc(var(--push-y) * 0.67))
    scale(1.02);
}

.segment-face.is-selected {
  z-index: 3;
  background: color-mix(
    in srgb,
    var(--reaction-accent) 18%,
    var(--reaction-hover)
  );
  transform: translate(calc(var(--push-x) * 0.9), calc(var(--push-y) * 0.9))
    scale(1.03);
}

.reaction-wheel.has-selection .segment-face:not(.is-selected) {
  opacity: 0.44;
  filter: saturate(0.45);
}

.reaction-wheel.is-disabled:not(.has-selection) .segment-face {
  opacity: 0.68;
}

.reaction-option {
  position: absolute;
  z-index: 9;
  top: var(--content-y);
  left: var(--content-x);
  display: flex;
  width: clamp(68px, 21%, 90px);
  min-height: clamp(56px, 17%, 72px);
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--reaction-text);
  font: inherit;
  transform: translate(-50%, -50%);
  touch-action: manipulation;
  cursor: pointer;
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

.reaction-option:is(.is-selected, .is-submitting) {
  opacity: 1;
}

.reaction-option:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--reaction-accent) 45%, transparent);
  outline-offset: 2px;
}

.option-content {
  display: flex;
  width: 100%;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  border-radius: 10px;
  transform: translate(var(--push-x), var(--push-y));
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.reaction-option:active:not(:disabled) .option-content {
  transform: translate(var(--push-x), var(--push-y)) scale(0.94);
}

.option-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  font-size: 27px;
  line-height: 1;
  transform: translateY(0) scale(1);
  transform-origin: center;
  transition: transform 170ms cubic-bezier(0, 0, 0.2, 1);
}

.option-icon svg {
  width: 27px;
  height: 27px;
}

.reaction-option:is(.is-active, .is-submitting) .option-icon {
  transform: translateY(-4px) scale(1.45);
}

.reaction-option.is-selected .option-icon {
  transform: translateY(-5px) scale(1.58);
}

.option-label {
  font-size: 13px;
  font-weight: 720;
  line-height: 1.25;
  transform: scale(1);
  transform-origin: center;
  transition: transform 170ms cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
}

.option-count {
  color: var(--reaction-text-faint);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  transform: scale(1);
  transform-origin: center;
  transition: transform 170ms cubic-bezier(0, 0, 0.2, 1);
}

.reaction-option:is(.is-active, .is-submitting) .option-label {
  transform: scale(1.16);
}

.reaction-option:is(.is-active, .is-submitting) .option-count {
  transform: scale(1.08);
}

.reaction-option.is-selected .option-label {
  transform: scale(1.22);
}

.reaction-option.is-selected .option-count {
  color: var(--reaction-text);
  transform: scale(1.1);
}

.wheel-core {
  position: absolute;
  z-index: 12;
  top: 50%;
  left: 50%;
  display: grid;
  width: 34%;
  aspect-ratio: 1;
  place-items: center;
  padding: 14px;
  border-radius: 50%;
  background: var(--reaction-card);
  box-shadow:
    0 0 0 1px var(--reaction-border),
    var(--reaction-shadow);
  color: var(--reaction-text);
  text-align: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.core-content {
  display: grid;
  justify-items: center;
  gap: 5px;
}

.core-icon {
  width: clamp(24px, 6cqi, 34px);
  height: clamp(24px, 6cqi, 34px);
  font-size: clamp(24px, 6cqi, 34px);
}

.core-eyebrow {
  color: var(--reaction-text-faint);
  font-size: clamp(9px, 2.3cqi, 11px);
  font-weight: 650;
}

.core-label {
  font-size: clamp(13px, 3.1cqi, 17px);
  font-weight: 760;
  line-height: 1.2;
  text-wrap: balance;
}

.reaction-wheel.is-keyboard-active
  :is(.segment-face, .option-icon, .option-label, .option-count) {
  transition-duration: 0.01ms;
}


.is-spinning {
  animation: reaction-spin 850ms linear infinite;
}

@container (max-width: 440px) {
  .wheel-stage {
    padding-top: 0;
  }

  .segment-face {
    inset: 10px;
  }

  .segment-face.is-active,
  .segment-face.is-submitting {
    transform: translate(calc(var(--push-x) * 0.34), calc(var(--push-y) * 0.34))
      scale(1.01);
  }

  .segment-face.is-selected {
    transform: translate(calc(var(--push-x) * 0.5), calc(var(--push-y) * 0.5))
      scale(1.018);
  }

  .reaction-option {
    width: clamp(62px, 21%, 72px);
    min-height: clamp(50px, 17%, 58px);
  }

  .option-content {
    gap: 2px;
  }

  .option-icon {
    width: 28px;
    height: 28px;
    font-size: 23px;
  }

  .option-icon svg {
    width: 23px;
    height: 23px;
  }

  .option-label {
    font-size: 11px;
  }

  .option-count {
    font-size: 11px;
  }

  .wheel-core {
    padding: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .segment-face,
  .option-content,
  .option-icon,
  .option-label,
  .option-count {
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
