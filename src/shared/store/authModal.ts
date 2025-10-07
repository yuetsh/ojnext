import { defineStore } from "pinia"

/**
 * 认证状态管理 Store
 * 统一管理登录、注册相关的模态框状态和表单状态
 */
export const useAuthModalStore = defineStore("authModal", () => {
  // ==================== 模态框状态 ====================
  const loginModalOpen = ref(false)
  const signupModalOpen = ref(false)

  // ==================== 登录表单状态 ====================
  const loginForm = reactive({
    class: "",
    username: "",
    password: "",
  })

  const loginLoading = ref(false)
  const loginError = ref("")

  // ==================== 注册表单状态 ====================
  const signupForm = reactive({
    username: "",
    email: "",
    password: "",
    passwordAgain: "",
    captcha: "",
  })

  const signupLoading = ref(false)
  const signupError = ref("")

  // ==================== 验证码 ====================
  const captchaSrc = ref("")

  // ==================== 模态框操作 ====================
  /**
   * 打开登录模态框
   */
  function openLoginModal() {
    loginModalOpen.value = true
  }

  /**
   * 关闭登录模态框
   */
  function closeLoginModal() {
    loginModalOpen.value = false
  }

  /**
   * 打开注册模态框
   */
  function openSignupModal() {
    signupModalOpen.value = true
  }

  /**
   * 关闭注册模态框
   */
  function closeSignupModal() {
    signupModalOpen.value = false
  }

  /**
   * 从登录切换到注册
   */
  function switchToSignup() {
    closeLoginModal()
    openSignupModal()
  }

  /**
   * 从注册切换到登录
   */
  function switchToLogin() {
    closeSignupModal()
    openLoginModal()
  }

  // ==================== 登录表单操作 ====================
  /**
   * 设置登录加载状态
   */
  function setLoginLoading(loading: boolean) {
    loginLoading.value = loading
  }

  /**
   * 设置登录错误信息
   */
  function setLoginError(error: string) {
    loginError.value = error
  }

  /**
   * 清空登录错误
   */
  function clearLoginError() {
    loginError.value = ""
  }

  // ==================== 注册表单操作 ====================
  /**
   * 设置注册加载状态
   */
  function setSignupLoading(loading: boolean) {
    signupLoading.value = loading
  }

  /**
   * 设置注册错误信息
   */
  function setSignupError(error: string) {
    signupError.value = error
  }

  /**
   * 清空注册错误
   */
  function clearSignupError() {
    signupError.value = ""
  }

  /**
   * 设置验证码图片地址
   */
  function setCaptchaSrc(src: string) {
    captchaSrc.value = src
  }

  return {
    // 模态框状态
    loginModalOpen,
    signupModalOpen,

    // 登录表单状态
    loginForm,
    loginLoading,
    loginError,

    // 注册表单状态
    signupForm,
    signupLoading,
    signupError,

    // 验证码
    captchaSrc,

    // 模态框操作
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    closeSignupModal,
    switchToSignup,
    switchToLogin,

    // 登录表单操作
    setLoginLoading,
    setLoginError,
    clearLoginError,

    // 注册表单操作
    setSignupLoading,
    setSignupError,
    clearSignupError,
    setCaptchaSrc,
  }
})
