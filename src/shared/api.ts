import http from "utils/http"
import { Profile, Tag } from "utils/types"

export function login(data: { username: string; password: string }) {
  return http.post("login", data)
}

export function signup(data: {
  username: string
  email: string
  password: string
  captcha: string
}) {
  return http.post("register", data)
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

export function getCaptcha() {
  return http.get("captcha")
}

export function getHitokoto() {
  return http.get("hitokoto")
}

export function getClassUsernames(classroom: string) {
  return http.get("class_usernames", { params: { classroom: classroom } })
}
