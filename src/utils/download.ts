import axios from "axios"

const http = axios.create({
  baseURL: "/api/admin",
  responseType: "blob",
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
})

async function download(url: string) {
  const res = await http.get(url)
  const headers = res.headers
  const link = document.createElement("a")
  link.href = window.URL.createObjectURL(
    new window.Blob([res.data], { type: headers["content-type"] })
  )
  link.download = (headers["content-disposition"] || "").split("filename=")[1]
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export default download
