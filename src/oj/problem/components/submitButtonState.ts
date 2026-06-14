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
