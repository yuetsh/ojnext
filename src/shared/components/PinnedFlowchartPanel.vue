<template>
  <div
    v-if="store.isPinned"
    ref="panel"
    class="pinned-panel"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <n-card size="small" :content-style="collapsed ? 'display:none' : 'padding:8px'">
      <template #header>
        <div ref="handle" class="pinned-handle">
          <n-flex align="center" :size="8">
            <Icon icon="mdi:pin" style="font-size: 14px" />
            <n-text strong style="font-size: 13px">流程图预览</n-text>
          </n-flex>
        </div>
      </template>
      <template #header-extra>
        <n-flex :size="4">
          <n-button quaternary size="small" @click="collapsed = !collapsed">
            <template #icon>
              <Icon :icon="collapsed ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
            </template>
          </n-button>
          <n-button quaternary size="small" @click="store.unpin()">
            <template #icon>
              <Icon icon="mdi:close" />
            </template>
          </n-button>
        </n-flex>
      </template>
      <n-alert v-if="renderError" type="error" title="渲染失败" size="small">
        {{ renderError }}
      </n-alert>
      <div v-else ref="mermaidContainer" class="mermaid-area"></div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { usePinnedFlowchartStore } from "shared/store/pinnedFlowchart"
import { useMermaid } from "shared/composables/useMermaid"

const store = usePinnedFlowchartStore()
const { renderError, renderFlowchart, clearError } = useMermaid()

const panelRef = useTemplateRef<HTMLElement>("panel")
const handleRef = useTemplateRef<HTMLElement>("handle")
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")
const collapsed = ref(false)

const { x, y } = useDraggable(panelRef, {
  handle: handleRef,
  initialValue: {
    x: window.innerWidth - 440,
    y: window.innerHeight - 400,
  },
})

watch(
  () => store.mermaidCode,
  async (code) => {
    if (!code || collapsed.value) return
    await nextTick()
    await renderFlowchart(mermaidContainer.value, code)
  },
  { immediate: true },
)

watch(collapsed, async (val) => {
  if (val) {
    clearError()
  } else if (store.mermaidCode) {
    await nextTick()
    await renderFlowchart(mermaidContainer.value, store.mermaidCode)
  }
})
</script>

<style scoped>
.pinned-panel {
  position: fixed;
  z-index: 1000;
  width: 420px;
}

.pinned-handle {
  cursor: grab;
  user-select: none;
}

.pinned-handle:active {
  cursor: grabbing;
}

.mermaid-area {
  height: 340px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

:deep(.mermaid-area > svg) {
  max-width: 100%;
  max-height: 100%;
}
</style>
