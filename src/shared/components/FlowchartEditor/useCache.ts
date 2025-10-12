import { ref, watch } from 'vue'
import { useStorage, useDebounceFn } from '@vueuse/core'
import type { Node, Edge } from '@vue-flow/core'

/**
 * 缓存管理 - 使用 @vueuse 的 useStorage
 */
export function useCache(
  nodes: any,
  edges: any,
  storageKey: string = 'flowchart-editor-data'
) {
  const isSaving = ref(false)
  const lastSaved = ref<Date | null>(null)
  const hasUnsavedChanges = ref(false)

  // 使用 useStorage 管理数据存储
  const storedData = useStorage<{
    nodes: Node[]
    edges: Edge[]
    timestamp: string
  }>(storageKey, {
    nodes: [],
    edges: [],
    timestamp: ''
  })

  // 防抖保存
  const debouncedSave = useDebounceFn(() => {
    isSaving.value = true
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
      lastSaved.value = storedData.value.timestamp ? new Date(storedData.value.timestamp) : null
      hasUnsavedChanges.value = false
      return true
    }
    return false
  }

  // 清除缓存数据
  const clearCache = () => {
    storedData.value = { nodes: [], edges: [], timestamp: '' }
    lastSaved.value = null
    hasUnsavedChanges.value = false
  }

  // 监听节点和边的变化
  watch([nodes, edges], () => {
    hasUnsavedChanges.value = true
    debouncedSave()
  }, { deep: true })

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveToCache,
    loadFromCache,
    clearCache
  }
}
