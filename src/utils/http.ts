import axios from "axios"
import storage from "./storage"
import { STORAGE_KEY } from "./constants"

const http = axios.create({
  baseURL: "/api",
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
})

http.interceptors.response.use(
  (res) => {
    if (res.data.error) {
      if (res.data.data && res.data.data.startsWith("Please login")) {
        storage.remove(STORAGE_KEY.AUTHED)
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
