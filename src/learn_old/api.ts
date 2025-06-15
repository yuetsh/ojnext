import http from "utils/http"

export async function list() {
  const res = await http.get("tutorials")
  return res.data
}


export async function get(id: string) {
  const res = await http.get(`tutorial/${id}`)
  return res.data
}