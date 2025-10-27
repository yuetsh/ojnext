<template>
  <div class="badge-item">
    <img
      :src="groupedBadge.icon"
      :alt="groupedBadge.badges[0].badge.name"
      class="badge-icon"
      @error="handleImageError"
    />
    <div v-if="groupedBadge.count > 1" class="badge-count">
      ×{{ groupedBadge.count }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface GroupedBadge {
  icon: string
  count: number
  badges: any[]
  latestEarnedTime: Date
}

interface Props {
  groupedBadge: GroupedBadge
}

defineProps<Props>()

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = "/badge-1.png"
}
</script>

<style scoped>
.badge-item {
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

.badge-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
