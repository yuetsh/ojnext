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

  function enqueue(items: PendingAchievement[]) {
    if (!items?.length) return
    // 去重：WebSocket 推来的和 pending 拉来的可能是同一批
    const known = new Set([
      ...queue.value.map((i) => i.id),
      ...(current.value ? [current.value.id] : []),
    ])
    queue.value.push(...items.filter((i) => !known.has(i.id)))
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

  async function markRead(id: number) {
    try {
      await markAchievementsRead([id])
    } catch {
      // 标记失败下次会重复弹一次，可接受
    }
  }

  return { queue, current, enqueue, fetchPending, next, markRead }
})
