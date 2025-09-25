import { getTime, intervalToDuration, parseISO, type Duration } from "date-fns"
import { User } from "./types"
import { USER_TYPE } from "./constants"
import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate"

function calculateACRate(acCount: number, totalCount: number): string {
  if (totalCount === 0) return "0.00"
  if (acCount >= totalCount) return "100.00"
  return ((acCount / totalCount) * 100).toFixed(2)
}

export function getACRate(acCount: number, totalCount: number): string {
  return `${calculateACRate(acCount, totalCount)}%`
}

export function getACRateNumber(acCount: number, totalCount: number): number {
  return parseFloat(calculateACRate(acCount, totalCount))
}

export function filterEmptyValue<T extends Record<string, any>>(
  object: T,
): Partial<T> {
  return Object.entries(object).reduce((query, [key, value]) => {
    if (value != null && value !== "" && value !== undefined) {
      query[key as keyof T] = value
    }
    return query
  }, {} as Partial<T>)
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

function getDurationObject(start: Date | string, end: Date | string) {
  return intervalToDuration({
    start: getTime(parseISO(start.toString())),
    end: getTime(parseISO(end.toString())),
  })
}

function formatDurationUnits(
  duration: Duration,
  units: Array<{ key: keyof Duration; suffix: string }>,
): string {
  return units
    .filter(({ key }) => duration[key])
    .map(({ key, suffix }) => duration[key] + suffix)
    .join("")
}

export function duration(
  start: Date | string,
  end: Date | string,
  showSeconds = false,
): string {
  const durationObj = getDurationObject(start, end)
  const units = [
    { key: "years" as const, suffix: "年" },
    { key: "months" as const, suffix: "月" },
    { key: "days" as const, suffix: "天" },
    { key: "hours" as const, suffix: "小时" },
    { key: "minutes" as const, suffix: "分钟" },
    ...(showSeconds ? [{ key: "seconds" as const, suffix: "秒" }] : []),
  ]
  return formatDurationUnits(durationObj, units)
}

export function durationToDays(
  start: Date | string,
  end: Date | string,
): string {
  const durationObj = getDurationObject(start, end)
  const units = [
    { key: "years" as const, suffix: "年" },
    { key: "months" as const, suffix: "月" },
    { key: "days" as const, suffix: "天" },
  ]
  const result = formatDurationUnits(durationObj, units)
  return result || "一天以内"
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

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 100,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function getUserRole(role: User["admin_type"]): {
  type: "default" | "info" | "error"
  label: "普通" | "管理员" | "超管"
} {
  const roleMap = {
    [USER_TYPE.REGULAR_USER]: {
      type: "default" as const,
      label: "普通" as const,
    },
    [USER_TYPE.ADMIN]: { type: "info" as const, label: "管理员" as const },
    [USER_TYPE.SUPER_ADMIN]: {
      type: "error" as const,
      label: "超管" as const,
    },
  }

  return roleMap[role] || roleMap[USER_TYPE.REGULAR_USER]
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function encode(string?: string): string {
  try {
    return btoa(String.fromCharCode(...new TextEncoder().encode(string ?? "")))
  } catch (error) {
    console.error("编码失败:", error)
    return ""
  }
}

export function decode(bytes?: string): string {
  try {
    if (!bytes) return ""
    const latin = atob(bytes)
    return new TextDecoder("utf-8").decode(
      Uint8Array.from({ length: latin.length }, (_, index) =>
        latin.charCodeAt(index),
      ),
    )
  } catch (error) {
    console.error("解码失败:", error)
    return ""
  }
}

export function getCSRFToken(): string {
  if (typeof document === "undefined") {
    return ""
  }
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ""
}

export function utoa(data: string): string {
  const buffer = strToU8(data)
  const zipped = zlibSync(buffer, { level: 9 })
  const binary = strFromU8(zipped, true)
  return btoa(binary)
}

export function atou(base64: string): string {
  const binary = atob(base64)
  const buffer = strToU8(binary, true)
  const unzipped = unzlibSync(buffer)
  return strFromU8(unzipped)
}

// function getChromeVersion() {
//   var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)
//   return raw ? parseInt(raw[2], 10) : 0
// }

// export const isLowVersion = getChromeVersion() < 80

// export const protocol = isLowVersion ? "http" : "https"
