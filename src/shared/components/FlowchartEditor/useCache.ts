import { ref, watch, type Ref, type MaybeRefOrGetter } from "vue"
import { useStorage, useDebounceFn } from "@vueuse/core"
import type { Node, Edge } from "@vue-flow/core"

/**
 * 缓存管理 - 使用 @vueuse 的 useStorage
 */
export function useCache(
  nodes: Ref<Node[]>,
  edges: Ref<Edge[]>,
  storageKey: MaybeRefOrGetter<string> = "flowchart-editor-data",
) {
  const isSaving = ref(false)
  const lastSaved = ref<Date | null>(null)
  const hasUnsavedChanges = ref(false)

  // 使用 useStorage 管理数据存储，支持响应式 key（题目 ID 异步加载时自动切换）
  const storedData = useStorage<{
    nodes: Node[]
    edges: Edge[]
    timestamp: string
  }>(storageKey, {
    nodes: [],
    edges: [],
    timestamp: "",
  })

  // 防抖保存：isSaving 在 watch 中置 true，保存完成后置 false，使 UI 能感知保存中状态
  const debouncedSave = useDebounceFn(() => {
    storedData.value.nodes = nodes.value
    storedData.value.edges = edges.value
    storedData.value.timestamp = new Date().toISOString()
    lastSaved.value = new Date()
    hasUnsavedChanges.value = false
    isSaving.value = false
  }, 500)

  // 立即保存
  const saveToCache = () => {
    isSaving.value = true
    storedData.value.nodes = nodes.value
    storedData.value.edges = edges.value
    storedData.value.timestamp = new Date().toISOString()
    lastSaved.value = new Date()
    hasUnsavedChanges.value = false
    isSaving.value = false
  }

  // 从缓存加载数据
  const loadFromCache = () => {
    if (storedData.value.nodes?.length || storedData.value.edges?.length) {
      nodes.value = storedData.value.nodes
      edges.value = storedData.value.edges
      lastSaved.value = storedData.value.timestamp
        ? new Date(storedData.value.timestamp)
        : null
      hasUnsavedChanges.value = false
      return true
    }
    return false
  }

  // 清除缓存数据
  const clearCache = () => {
    storedData.value = { nodes: [], edges: [], timestamp: "" }
    lastSaved.value = null
    hasUnsavedChanges.value = false
  }

  // 监听节点和边的变化，isSaving 在此置 true 以覆盖防抖等待窗口
  watch(
    [nodes, edges],
    () => {
      hasUnsavedChanges.value = true
      isSaving.value = true
      debouncedSave()
    },
    { deep: true },
  )

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveToCache,
    loadFromCache,
    clearCache,
  }
}
