import { getTime, intervalToDuration, parseISO, type Duration } from "date-fns"
import { User } from "./types"
import { USER_TYPE } from "./constants"
import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate"
import copyTextFallback from "copy-text-to-clipboard"
import { customAlphabet } from "nanoid"

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

/**
 * 复制文本到剪贴板
 * 优先使用 Clipboard API（支持在 modal 中使用），失败时回退到 copy-text-to-clipboard
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.warn("Clipboard API 复制失败，尝试使用回退方法:", error)
    }
  }

  // 回退到 copy-text-to-clipboard
  try {
    const success = copyTextFallback(text)
    return success
  } catch (error) {
    console.error("复制失败:", error)
    return false
  }
}

export function getRandomId() {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz")
  return nanoid()
}

/**
 * 恶搞效果函数 - 随机触发不同的页面恶搞效果
 */
export function trickOrTreat() {
  const effects = [
    // 效果1: 中文乱码
    () => {
      document.body.innerHTML = document.body.innerHTML.replace(
        /[\u4e00-\u9fa5]/g,
        function (c) {
          return String.fromCharCode(c.charCodeAt(0) ^ 0xa5) // 将中文字符转为乱码
        },
      )
    },
    // 效果2: 页面一直缩放
    () => {
      const style = document.createElement("style")
      style.id = "trick-scale-style"
      style.textContent = `
        body {
          animation: trickScale 0.5s ease-in-out infinite alternate;
        }
        @keyframes trickScale {
          from { transform: scale(0.8); }
          to { transform: scale(1.2); }
        }
      `
      document.head.appendChild(style)
    },
    // 效果3: 页面左右颠倒
    () => {
      document.body.style.transform = "scaleX(-1)"
    },
    // 效果4: 去掉鼠标
    () => {
      const style = document.createElement("style")
      style.id = "trick-cursor-none-style"
      style.textContent = `
        * {
          cursor: none !important;
        }
      `
      document.head.appendChild(style)
    },
    // 效果5: 页面一直旋转
    () => {
      const style = document.createElement("style")
      style.id = "trick-rotate-style"
      style.textContent = `
        body {
          animation: trickRotate 2s linear infinite;
        }
        @keyframes trickRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    },
    // 效果6: 页面上下颠倒
    () => {
      document.body.style.transform = "scaleY(-1)"
    },
    // 效果7: 页面颜色反转（反色）
    () => {
      const style = document.createElement("style")
      style.id = "trick-invert-style"
      style.textContent = `
        body {
          filter: invert(1) !important;
        }
      `
      document.head.appendChild(style)
    },
    // 效果8: 页面抖动/震动
    () => {
      const style = document.createElement("style")
      style.id = "trick-shake-style"
      style.textContent = `
        body {
          animation: trickShake 0.1s ease-in-out infinite;
        }
        @keyframes trickShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, -5px); }
          50% { transform: translate(5px, 5px); }
          75% { transform: translate(-5px, 5px); }
        }
      `
      document.head.appendChild(style)
    },
    // 效果9: 页面模糊
    () => {
      const style = document.createElement("style")
      style.id = "trick-blur-style"
      style.textContent = `
        body {
          filter: blur(5px) !important;
        }
      `
      document.head.appendChild(style)
    },
    // 效果10: 点击哪里，哪里的DOM就飞掉
    () => {
      // 添加CSS动画样式
      const style = document.createElement("style")
      style.id = "trick-flyaway-style"
      style.textContent = `
        .trick-flyaway {
          animation: trickFlyAway 0.5s ease-out forwards !important;
          pointer-events: none !important;
        }
        @keyframes trickFlyAway {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--fly-x, 500px), var(--fly-y, -500px)) rotate(720deg);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)

      // 添加全局点击事件监听器
      const clickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // 跳过body和html元素，以及已经飞走的元素
        if (
          target === document.body ||
          target === document.documentElement ||
          target.classList.contains("trick-flyaway")
        ) {
          return
        }

        // 获取点击位置相对于视口的位置
        const rect = target.getBoundingClientRect()
        const clickX = e.clientX - rect.left - rect.width / 2
        const clickY = e.clientY - rect.top - rect.height / 2

        // 计算飞出方向（随机方向）
        const angle = Math.random() * Math.PI * 2
        const distance = 1000 + Math.random() * 500
        const flyX = Math.cos(angle) * distance
        const flyY = Math.sin(angle) * distance

        // 设置CSS变量
        target.style.setProperty("--fly-x", `${flyX}px`)
        target.style.setProperty("--fly-y", `${flyY}px`)

        // 添加飞走动画类
        target.classList.add("trick-flyaway")

        // 动画结束后移除元素或隐藏
        setTimeout(() => {
          target.style.display = "none"
        }, 500)
      }

      document.addEventListener("click", clickHandler, true)
    },
    // 效果11: 页面元素随机位置
    () => {
      const style = document.createElement("style")
      style.id = "trick-random-position-style"
      style.textContent = `
        * {
          position: relative !important;
        }
      `
      document.head.appendChild(style)

      // 随机移动所有元素
      const allElements = document.querySelectorAll("*")
      allElements.forEach((el) => {
        if (el === document.body || el === document.documentElement) return
        const element = el as HTMLElement
        const randomX = (Math.random() - 0.5) * 200
        const randomY = (Math.random() - 0.5) * 200
        element.style.transform = `translate(${randomX}px, ${randomY}px)`
      })
    },
    // 效果12: 页面变成3D倾斜效果
    () => {
      const style = document.createElement("style")
      style.id = "trick-3d-tilt-style"
      style.textContent = `
        body {
          perspective: 1000px;
          transform-style: preserve-3d;
          animation: trick3DTilt 3s ease-in-out infinite alternate;
        }
        @keyframes trick3DTilt {
          0% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: perspective(1000px) rotateX(15deg) rotateY(-15deg);
          }
          50% {
            transform: perspective(1000px) rotateX(-15deg) rotateY(15deg);
          }
          75% {
            transform: perspective(1000px) rotateX(15deg) rotateY(15deg);
          }
          100% {
            transform: perspective(1000px) rotateX(-15deg) rotateY(-15deg);
          }
        }
      `
      document.head.appendChild(style)
    },
    // 效果13: 页面所有链接失效
    () => {
      const clickHandler = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // 检查是否是链接或按钮
        if (
          target.tagName === "A" ||
          target.closest("a") ||
          (target.tagName === "BUTTON" && !target.closest("n-button"))
        ) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      }
      document.addEventListener("click", clickHandler, true)
    },
    // 效果14: 页面变成波浪效果
    () => {
      const style = document.createElement("style")
      style.id = "trick-wave-style"
      style.textContent = `
        body {
          animation: trickWave 2s ease-in-out infinite;
        }
        @keyframes trickWave {
          0%, 100% {
            transform: translateY(0) scaleY(1);
          }
          25% {
            transform: translateY(-10px) scaleY(1.02);
          }
          50% {
            transform: translateY(0) scaleY(1);
          }
          75% {
            transform: translateY(10px) scaleY(0.98);
          }
        }
      `
      document.head.appendChild(style)
    },
    // 效果15: 页面变成故障效果（Glitch）
    () => {
      const style = document.createElement("style")
      style.id = "trick-glitch-style"
      style.textContent = `
        body {
          animation: trickGlitch 0.3s infinite;
        }
        @keyframes trickGlitch {
          0% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          20% {
            transform: translate(-2px, 2px);
            filter: hue-rotate(90deg);
          }
          40% {
            transform: translate(-2px, -2px);
            filter: hue-rotate(180deg);
          }
          60% {
            transform: translate(2px, 2px);
            filter: hue-rotate(270deg);
          }
          80% {
            transform: translate(2px, -2px);
            filter: hue-rotate(360deg);
          }
          100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
        }
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 0, 0, 0.03) 2px,
              rgba(255, 0, 0, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 255, 0.03) 2px,
              rgba(0, 255, 255, 0.03) 4px
            );
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
        }
      `
      document.head.appendChild(style)
    },
  ]

  // 随机选择一种效果
  const randomEffect = effects[Math.floor(Math.random() * effects.length)]
  randomEffect()
}

// function getChromeVersion() {
//   var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)
//   return raw ? parseInt(raw[2], 10) : 0
// }

// export const isLowVersion = getChromeVersion() < 80

// export const protocol = isLowVersion ? "http" : "https"
