import axios from "axios"

const http = axios.create({
  baseURL: "/api",
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
})

http.interceptors.response.use(
  (res) => {
    if (res.data.error) {
      // // TODO: 若后端返回为登录，则为session失效，应退出当前登录用户
      if (res.data.data.startsWith("Please login")) {
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
