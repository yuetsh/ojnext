import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  PROBLEM_PERMISSION,
  STORAGE_KEY,
  USER_TYPE,
} from "../../utils/constants";
import storage from "../../utils/storage";
import { getUserInfo } from "../api";

export const useUserStore = defineStore("user", () => {
  const profile = ref<any>({});
  const isLoaded = ref(false);
  const user = computed(() => profile.value.user || {});
  const isAuthed = computed(() => !!user.value.email);
  const isAdminRole = computed(
    () =>
      user.value.admin_type === USER_TYPE.ADMIN ||
      user.value.admin_type === USER_TYPE.SUPER_ADMIN
  );
  const isSuperAdmin = computed(
    () => user.value.admin_type === USER_TYPE.SUPER_ADMIN
  );
  const hasProblemPermission = computed(
    () => user.value.problem_permission !== PROBLEM_PERMISSION.NONE
  );

  async function getMyProfile() {
    isLoaded.value = false;
    const res = await getUserInfo("");
    isLoaded.value = true;
    profile.value = res.data || {};
    storage.set(STORAGE_KEY.AUTHED, !!user.value.email);
  }

  function clearMyProfile() {
    profile.value = {};
    storage.clear();
  }
  return {
    profile,
    isLoaded,
    user,
    isAdminRole,
    isSuperAdmin,
    hasProblemPermission,
    isAuthed,
    getMyProfile,
    clearMyProfile,
  };
});
