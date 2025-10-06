import { DetailsData, DurationData } from "utils/types"
import { consumeJSONEventStream } from "utils/stream"
import { getAIDetailData, getAIDurationData, getAIHeatmapData } from "../api"
import { getCSRFToken } from "utils/functions"

export const useAIStore = defineStore("ai", () => {
  const duration = ref("months:6")
  const durationData = ref<DurationData[]>([])
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
  const heatmapData = ref<{ timestamp: number; value: number }[]>([])

  const loading = reactive({
    fetching: false, // 合并 details 和 duration 的 loading
    ai: false,
    heatmap: false,
  })

  const mdContent = ref("")

  async function fetchDetailsData(start: string, end: string) {
    const res = await getAIDetailData(start, end)
    detailsData.start = res.data.start
    detailsData.end = res.data.end
    detailsData.solved = res.data.solved
    detailsData.grade = res.data.grade
    detailsData.class_name = res.data.class_name
    detailsData.tags = res.data.tags
    detailsData.difficulty = res.data.difficulty
    detailsData.contest_count = res.data.contest_count
  }

  async function fetchDurationData(end: string, duration: string) {
    const res = await getAIDurationData(end, duration)
    durationData.value = res.data
  }

  async function fetchHeatmapData() {
    loading.heatmap = true
    const res = await getAIHeatmapData()
    heatmapData.value = res.data
    loading.heatmap = false
  }

  // 统一获取分析数据（details + duration）
  async function fetchAnalysisData(
    start: string,
    end: string,
    duration: string,
  ) {
    loading.fetching = true
    try {
      await Promise.all([
        fetchDetailsData(start, end),
        fetchDurationData(end, duration),
      ])
    } finally {
      loading.fetching = false
    }
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
          duration: durationData.value,
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
    fetchAnalysisData,
    fetchHeatmapData,
    fetchAIAnalysis,
    durationData,
    detailsData,
    heatmapData,
    duration,
    loading,
    mdContent,
  }
})
