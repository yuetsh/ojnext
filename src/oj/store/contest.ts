import { useUserStore } from "~/shared/store/user"
import { ContestType } from "~/utils/constants"
import { Contest, Problem } from "~/utils/types"
import {
  getContest,
  getContestAccess,
  getContestProblems,
  checkContestPassword,
} from "../api"

export const useContestStore = defineStore("contest", () => {
  const userStore = useUserStore()
  const contest = ref<Contest>()
  const [access, toggleAccsess] = useToggle()
  const problems = ref<Problem[]>([])
  const message = useMessage()

  const contestStatus = computed(() => {
    return false
  })

  const isContestAdmin = computed(
    () =>
      userStore.isSuperAdmin ||
      (userStore.isAuthed && contest.value?.created_by.id === userStore.user.id)
  )

  async function init(contestID: string) {
    const res = await getContest(contestID)
    contest.value = res.data
    if (contest.value?.contest_type === ContestType.private) {
      const res = await getContestAccess(contestID)
      toggleAccsess(res.data.access)
    }
    _getProblems(contestID)
  }

  async function checkPassword(contestID: string, password: string) {
    try {
      const res = await checkContestPassword(contestID, password)
      toggleAccsess(res.data)
      if (res.data) {
        _getProblems(contestID)
      }
    } catch (err) {
      toggleAccsess(false)
      message.error("密码错误")
    }
  }

  async function _getProblems(contestID: string) {
    problems.value = []
    try {
      problems.value = await getContestProblems(contestID)
    } catch (err) {
      problems.value = []
      toggleAccsess(false)
    }
  }

  return {
    contest,
    contestStatus,
    isContestAdmin,
    access,
    problems,
    init,
    checkPassword,
  }
})
