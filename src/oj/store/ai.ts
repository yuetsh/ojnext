import { DetailsData, WeeklyData } from "~/utils/types"
import { consumeJSONEventStream } from "~/utils/stream"
import { getAIDetailData, getAIWeeklyData } from "../api"
import { getCSRFToken } from "~/utils/functions"

export const useAIStore = defineStore("ai", () => {
  const duration = ref("months:6")
  const username = ref("")
  const weeklyData = ref<WeeklyData[]>([])
  const detailsData = reactive<DetailsData>({
    start: "",
    end: "",
    grade: "B",
    class_name: "",
    tags: {},
    difficulty: {},
    contest_count: 0,
    solved: [],
  })

  const loading = reactive({
    details: false,
    weekly: false,
    ai: false,
  })

  const mdContent = ref("")

  const theFirstPerson = computed(() => {
    return !!username.value ? username.value : "你"
  })

  async function fetchDetailsData(
    start: string,
    end: string,
    username?: string,
  ) {
    loading.details = true
    const res = await getAIDetailData(start, end, username)
    detailsData.start = res.data.start
    detailsData.end = res.data.end
    detailsData.solved = res.data.solved
    detailsData.grade = res.data.grade
    detailsData.class_name = res.data.class_name
    detailsData.tags = res.data.tags
    detailsData.difficulty = res.data.difficulty
    detailsData.contest_count = res.data.contest_count
    loading.details = false
  }

  async function fetchWeeklyData(
    end: string,
    duration: string,
    username?: string,
  ) {
    loading.weekly = true
    const res = await getAIWeeklyData(end, duration, username)
    weeklyData.value = res.data
    loading.weekly = false
  }

  let aiController: AbortController | null = null

  async function fetchAIAnalysis() {
    if (aiController) {
      aiController.abort()
    }
    const controller = new AbortController()
    aiController = controller

    loading.ai = true
    mdContent.value = ""

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const csrfToken = getCSRFToken()
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken
    }

    try {
      const response = await fetch("/api/ai/analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({
          details: detailsData,
          weekly: weeklyData.value,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error("AI 分析生成失败")
      }

      let hasStarted = false

      await consumeJSONEventStream(response, {
        signal: controller.signal,
        onEvent(event) {
          if (event === "end" && !hasStarted) {
            loading.ai = false
          }
        },
        onMessage(payload) {
          const parsed = payload as {
            type?: string
            content?: string
            message?: string
          }

          if (parsed.type === "delta" && parsed.content) {
            if (!hasStarted) {
              hasStarted = true
              loading.ai = false
            }
            mdContent.value += parsed.content
          } else if (parsed.type === "error") {
            throw new Error(parsed.message || "AI 服务异常")
          } else if (parsed.type === "done" && !hasStarted) {
            loading.ai = false
          }
        },
      })
    } catch (error: any) {
      if (controller.signal.aborted) {
        return
      }
      console.error("生成 AI 分析失败", error)
      const message = error?.message || "生成失败，请稍后再试"
      mdContent.value = `生成失败：${message}`
    } finally {
      if (aiController === controller) {
        aiController = null
        loading.ai = false
      }
    }
  }

  return {
    fetchWeeklyData,
    fetchDetailsData,
    fetchAIAnalysis,
    weeklyData,
    detailsData,
    duration,
    username,
    theFirstPerson,
    loading,
    mdContent,
  }
})
