<template>
  <n-popover trigger="hover" placement="top">
    <template #trigger>
      <div class="badge-container">
        <img
          :src="badge.badge.icon"
          :alt="badge.badge.name"
          class="badge-icon"
          @error="handleImageError"
        />
      </div>
    </template>
    <n-card size="small" class="badge-popover">
      <n-flex vertical>
        <n-text strong>{{ badge.badge.name }}</n-text>
        <n-tag type="info"> 获得条件：{{ getConditionText() }} </n-tag>
        <n-text depth="3">
          获得时间：{{ parseTime(badge.earned_time, "YYYY-MM-DD HH:mm:ss") }}
        </n-text>
      </n-flex>
    </n-card>
  </n-popover>
</template>

<script setup lang="ts">
import { UserBadge } from "utils/types"
import { parseTime } from "utils/functions"
interface Props {
  badge: UserBadge
}

const props = defineProps<Props>()

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // 如果图片加载失败，显示默认图标
  img.src = "/badge-1.png" // 使用默认徽章图标
}

function getConditionText() {
  const { condition_type, condition_value } = props.badge.badge

  switch (condition_type) {
    case "all_problems":
      return "完成所有题目"
    case "problem_count":
      return `完成 ${condition_value} 道题目`
    case "score":
      return `获得 ${condition_value} 分`
    default:
      return "未知条件"
  }
}
</script>

<style scoped>
.badge-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 44px;
  height: 44px;
}

.badge-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.badge-icon:hover {
  transform: scale(1.1);
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.badge-popover {
  max-width: 280px;
}

.badge-popover .n-space {
  gap: 6px;
}
</style>
