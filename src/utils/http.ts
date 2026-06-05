import axios, { type AxiosRequestConfig } from "axios"
import { createDiscreteApi } from "naive-ui"
import { useAuthModalStore } from "shared/store/authModal"
import storage from "./storage"
import { STORAGE_KEY } from "./constants"

const { message } = createDiscreteApi(["message"])

// 后端统一返回 { error, data } 信封；拦截器剥掉 axios 外层后，
// 调用方拿到的就是这个信封，data 才是真正的业务数据。
export interface ApiResponse<T = any> {
  error: string | null
  data: T
}

// 让 http.get<T>() 的类型真实反映"解包后返回信封"这件事，
// 调用方 res.data 直接拿到带类型的 T，不再依赖 axios 的 AxiosResponse 巧合对齐。
interface Http {
  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>
  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>
  post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>
  put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>
}

const instance = axios.create({
  baseURL: "/api",
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
})

// 统一剥掉空字符串 / null / undefined 的 query 参数，
// 各 api 函数不必再手写过滤逻辑（保留 0、false）。
instance.interceptors.request.use((config) => {
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(
        ([, v]) => v !== "" && v !== null && v !== undefined,
      ),
    )
  }
  return config
})

instance.interceptors.response.use(
  (res) => {
    if (res.data.error) {
      if (res.data.error === "login-required") {
        storage.remove(STORAGE_KEY.AUTHED)
        useAuthModalStore().openLoginModal()
      } else if (res.data.error === "permission-denied") {
        message.error(res.data.data || "权限不足")
      }
      return Promise.reject(res.data)
    } else {
      return Promise.resolve(res.data)
    }
  },
  (err) => {
    return Promise.reject(err)
  },
)

const http = instance as unknown as Http

export default http
