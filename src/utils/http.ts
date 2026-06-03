import axios from "axios"
import { createDiscreteApi } from "naive-ui"
import { useAuthModalStore } from "shared/store/authModal"
import storage from "./storage"
import { STORAGE_KEY } from "./constants"

const { message } = createDiscreteApi(["message"])

const http = axios.create({
  baseURL: "/api",
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
})

http.interceptors.response.use(
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

export default http
