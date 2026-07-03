<script setup lang="ts">
import type { SQLDisplayColumn } from "utils/types"

defineProps<{
  columns: SQLDisplayColumn[]
  rows: (string | number | null)[][]
  totalRows?: number
  truncated?: boolean
}>()
</script>

<template>
  <n-table class="sqlTable" size="small" :single-line="false">
    <thead>
      <tr>
        <th v-for="(col, i) in columns" :key="i">
          {{ col.name }}
          <span v-if="col.type" class="colType">{{ col.type }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="rows.length === 0">
        <td :colspan="columns.length" class="nullCell">（空表）</td>
      </tr>
      <tr v-for="(row, i) in rows" :key="i">
        <td v-for="(v, j) in row" :key="j" :class="{ nullCell: v === null }">
          {{ v === null ? "NULL" : v }}
        </td>
      </tr>
    </tbody>
  </n-table>
  <p v-if="truncated" class="truncNote">
    共 {{ totalRows }} 行，仅展示前 {{ rows.length }} 行
  </p>
</template>

<style scoped>
.sqlTable {
  margin-bottom: 8px;
}

.colType {
  font-size: 12px;
  opacity: 0.55;
  margin-left: 4px;
  font-weight: normal;
}

.nullCell {
  opacity: 0.45;
  font-style: italic;
}

.truncNote {
  font-size: 13px;
  opacity: 0.65;
  margin: 0 0 8px;
}
</style>
