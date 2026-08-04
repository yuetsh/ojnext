import {
  getPendingAchievements,
  markAchievementsRead,
} from "oj/achievement/api"
import type { PendingAchievement } from "utils/types"

/**
 * 成就解锁弹窗队列。
 *
 * 通知走推拉结合，后端的 UserAchievement.notified 是唯一真相来源：
 * - 拉（主）：布局层每次路由切换拉一次 pending，覆盖全部场景，绝不丢
 * - 推（增强）：WebSocket 只在用户当场停留在问题页时把延迟压到几百毫秒
 *
 * 之所以不能只靠推：前端 WebSocket 不是常驻连接，只在问题页且有提交监听时
 * 才建连，纯推会丢消息（尤其是题单奖章，那些页面根本没建连接）。
 */
export const useAchievementStore = defineStore("achievement", () => {
  const queue = ref<PendingAchievement[]>([])
  const current = ref<PendingAchievement | null>(null)

  // 成就和题单奖章的 id 来自两张不同的表，数值会重叠，
  // 只按 id 去重会让奖章 5 把成就 5 挤掉
  function keyOf(item: PendingAchievement) {
    return `${item.kind ?? "achievement"}:${item.id}`
  }

  function enqueue(items: PendingAchievement[]) {
    if (!items?.length) return
    // 去重：WebSocket 推来的和 pending 拉来的可能是同一批
    const known = new Set([
      ...queue.value.map(keyOf),
      ...(current.value ? [keyOf(current.value)] : []),
    ])
    queue.value.push(...items.filter((i) => !known.has(keyOf(i))))
  }

  async function fetchPending() {
    try {
      // http 客户端返回 ApiResponse<T>，真实载荷在 .data 里
      const res = await getPendingAchievements()
      enqueue(res.data ?? [])
    } catch {
      // 拉取失败静默处理，下次路由切换会再拉
    }
  }

  function next() {
    current.value = queue.value.shift() ?? null
    return current.value
  }

  async function markRead(item: PendingAchievement) {
    // 奖章不在 UserAchievement 表里，它的 id 传给标记接口会被当成成就 id，
    // 把一个恰好同号、还没弹过的成就静默标记为已弹——那个奖杯就再也不会出现
    if (item.kind === "badge") return
    try {
      await markAchievementsRead([item.id])
    } catch {
      // 标记失败下次会重复弹一次，可接受
    }
  }

  return { queue, current, enqueue, fetchPending, next, markRead }
})
