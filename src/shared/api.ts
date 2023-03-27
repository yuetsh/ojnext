import http from "utils/http"
import { Profile, Tag } from "~/utils/types"

export function login(data: { username: string; password: string }) {
  return http.post("login", data)
}

export function logout() {
  return http.get("logout")
}

export function getProfile(username: string = "") {
  return http.get<Profile>("profile", { params: { username } })
}

export function getProblemTagList() {
  return http.get<Tag[]>("problem/tags")
}
