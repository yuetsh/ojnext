import { getAILoginSummary } from "oj/api"
import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"

interface LoginSummary {
  start: string
  end: string
  new_problem_count: number
  submission_count: number
  accepted_count: number
  solved_count: number
  flowchart_submission_count: number
}

export const useLoginSummaryStore = defineStore("loginSummary", () => {
  const show = ref(false)
  const loading = ref(false)
  const summary = ref<LoginSummary | null>(null)
  const analysis = ref("")
  const analysisError = ref("")

  function getTodayKey() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  async function fetchSummary() {
    loading.value = true
    analysis.value = ""
    analysisError.value = ""
    try {
      const res = await getAILoginSummary()
      summary.value = res.data.summary
      analysis.value = res.data.analysis || ""
      analysisError.value = res.data.analysis_error || ""
    } catch (err) {
      analysisError.value = "获取登录统计失败，请稍后再试"
    } finally {
      loading.value = false
    }
  }

  async function open() {
    const today = getTodayKey()
    const lastShown = storage.get(STORAGE_KEY.LOGIN_SUMMARY_LAST_SHOWN)
    if (lastShown === today) {
      return
    }
    storage.set(STORAGE_KEY.LOGIN_SUMMARY_LAST_SHOWN, today)
    show.value = true
    await fetchSummary()
  }

  function close() {
    show.value = false
  }

  return {
    show,
    loading,
    summary,
    analysis,
    analysisError,
    fetchSummary,
    open,
    close,
  }
})
