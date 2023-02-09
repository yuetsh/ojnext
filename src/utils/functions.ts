import { intervalToDuration } from "date-fns"
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

export function getTagColor(
  tag: "Low" | "Mid" | "High" | "简单" | "中等" | "困难"
) {
  return <"success" | "info" | "error">{
    Low: "success",
    Mid: "info",
    High: "error",
    简单: "success",
    中等: "info",
    困难: "error",
  }[tag]
}

export function parseTime(utc: Date, format = "YYYY年M月D日") {
  const time = useDateFormat(utc, format, { locales: "zh-CN" })
  return time.value
}

export function duration(start: Date, end: Date): string {
  const duration = intervalToDuration({
    start: Date.parse(start.toString()),
    end: Date.parse(end.toString()),
  })
  let result = ""
  if (duration.years) {
    result += duration.years + "年"
  }
  if (duration.months) {
    result += duration.months + "月"
  }
  if (duration.days) {
    result += duration.days + "天"
  }
  if (duration.hours) {
    result += duration.hours + "小时"
  }
  if (duration.minutes) {
    result += duration.minutes + "分钟"
  }
  return result
}

export function secondsToDuration(seconds: number): string {
  const epoch = new Date(0)
  const secondsAfterEpoch = new Date(seconds * 1000)
  const duration = intervalToDuration({
    start: epoch,
    end: secondsAfterEpoch,
  })
  return [duration.hours, duration.minutes, duration.seconds].join(":")
}

export function submissionMemoryFormat(memory: number | string | undefined) {
  if (memory === undefined) return "--"
  // 1048576 = 1024 * 1024
  let t = parseInt(memory + "") / 1048576
  return String(t.toFixed(0)) + "MB"
}

export function submissionTimeFormat(time: number | string | undefined) {
  if (time === undefined) return "--"
  return time + "ms"
}

export function debounce(fn: Function, n = 100) {
  let handle: any
  return (...args: any[]) => {
    if (handle) clearTimeout(handle)
    handle = setTimeout(() => {
      fn(...args)
    }, n)
  }
}
