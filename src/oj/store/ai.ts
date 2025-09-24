import { DetailsData, WeeklyData } from "~/utils/types"
import { getAIAnalysis, getAIDetailData, getAIWeeklyData } from "../api"

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

  async function fetchAIAnalysis() {
    loading.ai = true
    const res = await getAIAnalysis(detailsData, weeklyData.value)
    console.log(res.data)
    loading.ai = false
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
  }
})
