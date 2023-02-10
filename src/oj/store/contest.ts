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
  const message = useMessage()
  const [access, toggleAccess] = useToggle()
  const contest = ref<Contest>()
  const problems = ref<Problem[]>([])

  const contestStatus = computed(() => {
    return false
  })

  const isContestAdmin = computed(
    () =>
      userStore.isSuperAdmin ||
      (userStore.isAuthed && contest.value?.created_by.id === userStore.user.id)
  )

  const isPrivate = computed(
    () => contest.value?.contest_type === ContestType.private
  )

  async function init(contestID: string) {
    const res = await getContest(contestID)
    contest.value = res.data
    if (contest.value?.contest_type === ContestType.private) {
      const res = await getContestAccess(contestID)
      toggleAccess(res.data.access)
    }
    _getProblems(contestID)
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
    problems.value = []
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
    init,
    checkPassword,
  }
})
