import { useAxios } from "@vueuse/integrations/useAxios"
import http from "../utils/http"

export function login(data: { username: string; password: string }) {
  return useAxios("login", { method: "post", data }, http, {
    immediate: false,
  })
}

export function logout() {
  return http.get("logout")
}

export function getUserInfo(username: string) {
  return useAxios("profile", { method: "get", params: { username } }, http, {
    immediate: false,
  })
}
