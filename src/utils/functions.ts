import { getTime, intervalToDuration, parseISO } from "date-fns"
import { User } from "./types"

export function getACRate(acCount: number, totalCount: number) {
  let rate = ""
  if (totalCount === 0) rate = "0.00"
  else {
    if (acCount >= totalCount) rate = "100.00"
    else rate = ((acCount / totalCount) * 100).toFixed(2)
  }
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

export function getTagColor(
  tag: "Low" | "Mid" | "High" | "简单" | "中等" | "困难",
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

// 2023-04-03T02:43:28.673156Z
export function parseTime(utc: Date | string, format = "YYYY年M月D日") {
  const time = useDateFormat(utc, format, { locales: "zh-CN" })
  return time.value
}

export function duration(
  start: Date | string,
  end: Date | string,
  showSeconds = false,
): string {
  const duration = intervalToDuration({
    start: getTime(parseISO(start.toString())),
    end: getTime(parseISO(end.toString())),
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
  if (showSeconds && duration.seconds) {
    result += duration.seconds + "秒"
  }
  return result
}

export function secondsToDuration(seconds: number): string {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  })
  return [
    duration.hours ?? 0,
    duration.minutes ?? 0,
    duration.seconds ?? 0,
  ].join(":")
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

export function getUserRole(role: User["admin_type"]): {
  type: "default" | "info" | "error"
  tagString: "普通" | "管理员" | "超管"
} {
  const obj: {
    type: "default" | "info" | "error"
    tagString: "普通" | "管理员" | "超管"
  } = { type: "default", tagString: "普通" }
  switch (role) {
    case "Regular User":
      obj.type = "default"
      obj.tagString = "普通"
      break
    case "Admin":
      obj.type = "info"
      obj.tagString = "管理员"
      break
    case "Super Admin":
      obj.type = "error"
      obj.tagString = "超管"
      break
  }
  return obj
}

export function unique<T>(arr: T[]) {
  return arr.reduce((prev: T[], curr: T) => {
    if (!prev.includes(curr)) {
      prev.push(curr)
    }
    return prev
  }, [])
}

export function encode(string?: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(string ?? "")))
}

export function decode(bytes?: string) {
  const latin = atob(bytes ?? "")
  return new TextDecoder("utf-8").decode(
    Uint8Array.from({ length: latin.length }, (_, index) =>
      latin.charCodeAt(index),
    ),
  )
}

// function getChromeVersion() {
//   var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)
//   return raw ? parseInt(raw[2], 10) : 0
// }

// export const isLowVersion = getChromeVersion() < 80

// export const protocol = isLowVersion ? "http" : "https"
