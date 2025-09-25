import { PROBLEM_PERMISSION, STORAGE_KEY, USER_TYPE } from "utils/constants"
import storage from "utils/storage"
import { Profile, User } from "~/utils/types"
import { getProfile } from "../api"

export const useUserStore = defineStore("user", () => {
  const profile = ref<Profile | null>(null)
  const [isFinished] = useToggle(false)
  const user = computed<User | null>(() => profile.value?.user ?? null)
  const isAuthed = computed(() => !!user.value?.email)
  const isAdminRole = computed(
    () =>
      user.value?.admin_type === USER_TYPE.ADMIN ||
      user.value?.admin_type === USER_TYPE.SUPER_ADMIN,
  )
  const isTheAdmin = computed(
    () => user.value?.admin_type === USER_TYPE.ADMIN,
  )
  const isSuperAdmin = computed(
    () => user.value?.admin_type === USER_TYPE.SUPER_ADMIN,
  )
  const hasProblemPermission = computed(
    () => user.value?.problem_permission !== PROBLEM_PERMISSION.NONE,
  )

  async function getMyProfile() {
    isFinished.value = false
    const res = await getProfile()
    profile.value = res.data
    isFinished.value = true
    storage.set(STORAGE_KEY.AUTHED, !!user.value?.email)
  }

  function clearProfile() {
    profile.value = null
    storage.clear()
  }
  return {
    profile,
    isFinished,
    user,
    isAdminRole,
    isTheAdmin,
    isSuperAdmin,
    hasProblemPermission,
    isAuthed,
    getMyProfile,
    clearProfile,
  }
})
