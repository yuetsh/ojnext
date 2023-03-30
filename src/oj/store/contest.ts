import { formatISO, getTime, parseISO } from "date-fns"
import { useUserStore } from "~/shared/store/user"
import { ContestStatus, ContestType } from "~/utils/constants"
import { duration } from "~/utils/functions"
import { Contest, Problem } from "~/utils/types"
import {
  getContest,
  getContestAccess,
  getContestProblems,
  checkContestPassword,
} from "../api"

export const useContestStore = defineStore("contest", () => {
  const userStore = useUserStore()
  const message = useMessage()
  const [access, toggleAccess] = useToggle(false)
  const contest = ref<Contest | null>(null)
  const problems = ref<Problem[]>([])
  const now = ref(0)

  let timer = 0

  const contestStatus = computed<ContestStatus>(() => {
    const start = getTime(parseISO(contest.value!.start_time.toString()))
    const end = getTime(parseISO(contest.value!.end_time.toString()))
    if (start > now.value) {
      return ContestStatus.not_started
    } else if (end < now.value) {
      return ContestStatus.finished
    } else {
      return ContestStatus.underway
    }
  })

  const countdown = computed(() => {
    if (contestStatus.value === ContestStatus.finished) {
      return "已结束"
    } else if (contestStatus.value === ContestStatus.not_started) {
      const d = duration(formatISO(now.value), contest.value!.start_time, true)
      return "距离比赛开始 " + d
    } else {
      const d = duration(formatISO(now.value), contest.value!.end_time, true)
      return "距离比赛结束 " + d
    }
  })

  const isContestAdmin = computed(
    () =>
      userStore.isSuperAdmin ||
      (userStore.isAuthed &&
        contest.value?.created_by.id === userStore.user!.id)
  )

  const isPrivate = computed(
    () => contest.value!.contest_type === ContestType.private
  )

  async function init(contestID: string) {
    problems.value = []
    const res = await getContest(contestID)
    contest.value = res.data
    now.value = getTime(parseISO(res.data.now))
    if (contestStatus.value !== ContestStatus.finished) {
      timer = setInterval(() => {
        now.value = now.value + 1000
      }, 1000)
    }
    if (contest.value?.contest_type === ContestType.private) {
      const res = await getContestAccess(contestID)
      toggleAccess(res.data.access)
    }
    _getProblems(contestID)
  }

  function clear() {
    contest.value = null
    problems.value = []
    toggleAccess(false)
    now.value = 0
    if (timer) clearInterval(timer)
  }

  async function checkPassword(contestID: string, password: string) {
    try {
      const res = await checkContestPassword(contestID, password)
      toggleAccess(res.data)
      if (res.data) {
        _getProblems(contestID)
      }
    } catch (err) {
      toggleAccess(false)
      message.error("密码错误")
    }
  }

  async function _getProblems(contestID: string) {
    try {
      problems.value = await getContestProblems(contestID)
    } catch (err) {
      problems.value = []
      toggleAccess(false)
    }
  }

  return {
    contest,
    contestStatus,
    isContestAdmin,
    access,
    problems,
    isPrivate,
    countdown,
    init,
    clear,
    checkPassword,
  }
})
