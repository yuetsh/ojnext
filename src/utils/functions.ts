import { useDateFormat } from "@vueuse/core"
import { STORAGE_KEY } from "./constants"

export function getACRate(acCount: number, totalCount: number) {
  let rate = totalCount === 0 ? 0.0 : ((acCount / totalCount) * 100).toFixed(2)
  return `${rate}%`
}

export function filterEmptyValue(object: any) {
  let query: any = {}
  Object.keys(object).forEach((key) => {
    if (object[key] || object[key] === 0 || object[key] === false) {
      query[key] = object[key]
    }
  })
  return query
}

export function buildProblemCodeKey(problemID: string, contestID = "") {
  if (contestID) {
    return `${STORAGE_KEY.PROBLEM_CODE}_${contestID}_${problemID}`
  }
  return `${STORAGE_KEY.PROBLEM_CODE}_NaN_${problemID}`
}

export function getTagColor(tag: string) {
  return {
    Low: "success",
    Mid: "",
    High: "danger",
    简单: "success",
    中等: "",
    困难: "danger",
  }[tag]
}

export function parseTime(utc: Date, format = "YYYY年M月D日") {
  const time = useDateFormat(utc, format, { locales: "zh-CN" })
  return time.value
}
