<script setup lang="ts">
import { h } from "vue"
import { NDataTable, NButton, NFlex } from "naive-ui"
import { ProblemSetProblem } from "utils/types"

interface Props {
  problems: ProblemSetProblem[]
}

interface Emits {
  (e: "add-problem"): void
  (e: "edit-problem", problem: ProblemSetProblem): void
  (e: "remove-problem", problemSetProblemId: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div>
    <n-flex
      justify="space-between"
      align="center"
      style="margin-bottom: 16px"
    >
      <h3>题目列表</h3>
      <n-button type="primary" @click="$emit('add-problem')">
        添加题目
      </n-button>
    </n-flex>
    <n-data-table
      :columns="[
        { title: '题目ID', key: 'problem._id', width: 80 },
        { title: '题目标题', key: 'problem.title', minWidth: 200 },
        { title: '顺序', key: 'order', width: 80 },
        {
          title: '必做',
          key: 'is_required',
          width: 80,
          render: (row) => (row.is_required ? '是' : '否'),
        },
        { title: '分数', key: 'score', width: 80 },
        { title: '提示', key: 'hint', minWidth: 200 },
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
                  onClick: () => $emit('edit-problem', row),
                },
                { default: () => '编辑' },
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  secondary: true,
                  onClick: () => $emit('remove-problem', row.id),
                },
                { default: () => '移除' },
              ),
            ]),
        },
      ]"
      :data="problems"
    />
  </div>
</template>
