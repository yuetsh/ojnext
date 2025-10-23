<template>
  <n-tooltip trigger="hover" :show-arrow="false">
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
    <div class="badge-tooltip">
      <div class="badge-name">{{ badge.badge.name }}</div>
      <div class="badge-description">{{ badge.badge.description }}</div>
      <div class="badge-time">获得时间：{{ formatTime(badge.earned_time) }}</div>
    </div>
  </n-tooltip>
</template>

<script setup lang="ts">
import { UserBadge } from "utils/types"

interface Props {
  badge: UserBadge
}

const props = defineProps<Props>()

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // 如果图片加载失败，显示默认图标
  img.src = '/badge-1.png' // 使用默认徽章图标
}

function formatTime(date: Date) {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.badge-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
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


.badge-tooltip {
  max-width: 250px;
}

.badge-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #1890ff;
}

.badge-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}

.badge-time {
  font-size: 11px;
  color: #999;
}
</style>
