<template>
  <div 
    class="node-actions"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <button 
      class="action-btn delete-btn"
      @click.stop="$emit('delete')"
      title="删除节点"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  delete: []
  mouseenter: []
  mouseleave: []
}>()
</script>

<style scoped>
.node-actions {
  position: absolute;
  top: -40px;
  right: -20px;
  padding: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  font-size: 10px;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}
</style>
