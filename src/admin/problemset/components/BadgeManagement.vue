<script setup lang="ts">
import { h } from "vue"
import { ProblemSetBadge } from "utils/types"
import { NButton, NImage } from "naive-ui"

interface Props {
  badges: ProblemSetBadge[]
}

interface Emits {
  (e: "add-badge"): void
  (e: "edit-badge", badge: ProblemSetBadge): void
  (e: "delete-badge", badgeId: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div>
    <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
      <h3>奖章列表</h3>
      <n-button type="primary" @click="$emit('add-badge')"> 添加奖章 </n-button>
    </n-flex>
    <n-data-table
      :columns="[
        {
          title: '图标',
          key: 'icon',
          render: (row) =>
            h(NImage, {
              src: row.icon,
              width: 40,
              height: 40,
              objectFit: 'cover',
              previewDisabled: true,
              style: 'border-radius: 4px; border: 1px solid #d9d9d9',
            }),
        },
        { title: '名称', key: 'name' },
        {
          title: '条件类型',
          key: 'condition_type',
          render: (row) => {
            const typeMap: Record<string, string> = {
              all_problems: '完成所有题目',
              problem_count: '完成指定数量题目',
              score: '达到指定分数',
            }
            return typeMap[row.condition_type] || row.condition_type
          },
        },
        {
          title: '条件值',
          key: 'condition_value',
          render: (row) => {
            return row.condition_type === 'all_problems'
              ? '-'
              : row.condition_value
          },
        },
        { title: '描述', key: 'description' },
        {
          title: '操作',
          key: 'actions',
          width: 160,
          render: (row) =>
            h('div', { style: 'display: flex; gap: 8px;' }, [
              h(
                NButton,
                {
                  size: 'small',
                  type: 'primary',
                  secondary: true,
                  onClick: () => $emit('edit-badge', row),
                },
                { default: () => '编辑' },
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  secondary: true,
                  onClick: () => $emit('delete-badge', row.id),
                },
                { default: () => '删除' },
              ),
            ]),
        },
      ]"
      :data="badges"
    />
  </div>
</template>
