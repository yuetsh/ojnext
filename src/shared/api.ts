import http from "utils/http"

export function login(data: { username: string; password: string }) {
  return http.post("login", data)
}

export function logout() {
  return http.get("logout")
}

export function getProfile(username: string = "") {
  return http.get("profile", { params: { username } })
}
