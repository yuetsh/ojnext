<template>
  <!-- 开始节点：只有输出 handle -->
  <template v-if="nodeType === 'start'">
    <Handle
      type="source"
      :position="Position.Bottom"
      :style="getHandleStyle('#10b981', { bottom: '-10px' })"
    />
  </template>

  <!-- 结束节点：只有输入 handle -->
  <template v-else-if="nodeType === 'end'">
    <Handle
      type="target"
      :position="Position.Top"
      :style="getHandleStyle('#ef4444', { top: '-10px' })"
    />
  </template>

  <!-- 选择判断节点：一个输入 + 两个输出（是/否） -->
  <template v-else-if="nodeType === 'decision'">
    <Handle
      type="target"
      :position="Position.Top"
      :style="getHandleStyle('#f59e0b', { top: '-16px' })"
    />
    <Handle
      type="source"
      :position="Position.Left"
      id="yes"
      :style="{
        background: '#10b981',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        zIndex: 10,
        left: '-10px',
        top: '50%',
        transform: 'translateY(-50%)'
      }"
    />
    <Handle
      type="source"
      :position="Position.Right"
      id="no"
      :style="{
        background: '#ef4444',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        zIndex: 10,
        right: '-10px',
        top: '50%',
        transform: 'translateY(-50%)'
      }"
    />
    
    <!-- 是/否标签 -->
    <div class="decision-labels">
      <span class="decision-label decision-label-yes">是</span>
      <span class="decision-label decision-label-no">否</span>
    </div>
  </template>

  <!-- 循环判断节点：两个输入 + 两个输出（进入/循环体返回 + 继续/退出） -->
  <template v-else-if="nodeType === 'loop'">
    <!-- 进入循环的输入 -->
    <Handle
      type="target"
      :position="Position.Top"
      id="enter"
      :style="getHandleStyle('#f59e0b', { top: '-16px' })"
    />
    <!-- 循环体返回的输入 -->
    <Handle
      type="target"
      :position="Position.Bottom"
      id="return"
      :style="
        getHandleStyle('#8b5cf6', {
          bottom: '-16px',
        })
      "
    />
    <!-- 继续执行循环体 -->
    <Handle
      type="source"
      :position="Position.Right"
      id="continue"
      :style="
        getHandleStyle('#10b981', {
          right: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
        })
      "
    />
    <!-- 退出循环 -->
    <Handle
      type="source"
      :position="Position.Left"
      id="exit"
      :style="
        getHandleStyle('#ef4444', {
          left: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
        })
      "
    />
    
    <!-- 标签 -->
    <div class="loop-labels">
      <span class="loop-label loop-label-enter">进入</span>
      <span class="loop-label loop-label-return">返回</span>
      <span class="loop-label loop-label-continue">继续</span>
      <span class="loop-label loop-label-exit">退出</span>
    </div>
  </template>

  <!-- 上下两个 handle -->
  <template v-else>
    <Handle
      type="target"
      :position="Position.Top"
      :style="getHandleStyle(nodeConfig.color, { top: '-10px' })"
    />
    <Handle
      type="source"
      :position="Position.Bottom"
      :style="getHandleStyle(nodeConfig.color, { bottom: '-10px' })"
    />
  </template>
</template>

<script lang="ts" setup>
import { Handle, Position } from "@vue-flow/core"

interface Props {
  nodeType: string
  nodeConfig: {
    color: string
    label: string
  }
}

defineProps<Props>()

// 获取 handle 样式
const getHandleStyle = (color: string, position: Record<string, string>) => ({
  background: color,
  width: "12px",
  height: "12px",
  border: "2px solid white",
  zIndex: 10,
  ...position,
})
</script>

<style scoped>
/* 判断节点标签样式 */
.decision-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.decision-label {
  position: absolute;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.decision-label-yes {
  left: -25px;
  top: -20px;
}

.decision-label-no {
  right: -25px;
  top: -20px;
}

/* 循环节点标签样式 */
.loop-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.loop-label {
  position: absolute;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.loop-label-enter {
  right: 20px;
  top: -45px;
}

.loop-label-return {
  right: 20px;
  bottom: -45px;
}

.loop-label-continue {
  right: -40px;
  top: -16px;
  transform: translateY(-50%);
}

.loop-label-exit {
  left: -40px;
  top: -16px;
  transform: translateY(-50%);
}
</style>
