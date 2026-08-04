<script setup lang="ts">
import { useAchievementStore } from "shared/store/achievement"

const store = useAchievementStore()
const { current, queue } = storeToRefs(store)
const visible = ref(false)

const RARITY_COLOR: Record<string, string> = {
  bronze: "#b87333",
  silver: "#9fa6b2",
  gold: "#e0a300",
  platinum: "#7dd3fc",
}

let timer: ReturnType<typeof setTimeout> | null = null
let gapTimer: ReturnType<typeof setTimeout> | null = null

// 多个同时解锁时排队依次弹出，不重叠堆积
function playNext() {
  const item = store.next()
  if (!item) return
  visible.value = true
  timer = setTimeout(async () => {
    visible.value = false
    await store.markRead(item.id)
    gapTimer = setTimeout(playNext, 400)
  }, 3000)
}

watch(
  () => queue.value.length,
  (len) => {
    if (len > 0 && !visible.value) playNext()
  },
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (gapTimer) clearTimeout(gapTimer)
})
</script>

<template>
  <Transition name="slide">
    <div
      v-if="visible && current"
      class="toast"
      :style="{ borderColor: RARITY_COLOR[current.rarity] }"
    >
      <div class="icon">{{ current.icon }}</div>
      <div class="body">
        <div class="label">成就解锁</div>
        <div class="name">{{ current.name }}</div>
        <div class="desc">{{ current.description }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  border-radius: 10px;
  border: 2px solid;
  background: var(--n-color, rgba(24, 24, 28, 0.95));
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  min-width: 260px;
}
.icon {
  font-size: 34px;
}
.label {
  font-size: 11px;
  letter-spacing: 2px;
  opacity: 0.6;
}
.name {
  font-weight: 700;
  margin-top: 2px;
}
.desc {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 2px;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
