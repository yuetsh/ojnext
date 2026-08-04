import http from "utils/http"
import type {
  Achievement,
  AchievementSummary,
  PendingAchievement,
} from "utils/types"

export function getAchievements(name?: string) {
  return http.get<{ username: string; achievements: Achievement[] }>(
    "achievements",
    { params: name ? { name } : {} },
  )
}

export function getAchievementSummary(name?: string) {
  return http.get<AchievementSummary>("achievements/summary", {
    params: name ? { name } : {},
  })
}

export function getPendingAchievements() {
  return http.get<PendingAchievement[]>("achievements/pending")
}

export function markAchievementsRead(ids: number[]) {
  return http.post("achievements/pending", { ids })
}
