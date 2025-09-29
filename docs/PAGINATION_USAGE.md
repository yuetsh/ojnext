# 分页 Composable 使用指南

## 概述

`usePagination` composable 是为了减少重复的分页和 URL 同步代码而创建的。它自动处理：

- 分页状态管理（页码、每页条数）
- URL 查询参数同步
- 查询条件变化时的页码重置
- 防抖和监听逻辑

## 基本用法

### 1. 简单分页（只有分页功能）

```vue
<script setup lang="ts">
import { usePagination } from "~/shared/composables/pagination"
import Pagination from "~/shared/components/Pagination.vue"

// 只使用基本分页功能
const { query } = usePagination()

// 获取数据
async function loadData() {
  const offset = (query.page - 1) * query.limit
  // 调用 API...
}

// 监听分页变化
watch([() => query.page, () => query.limit], loadData)
</script>

<template>
  <div>
    <!-- 你的数据展示 -->
    <Pagination
      :total="total"
      v-model:page="query.page"
      v-model:limit="query.limit"
    />
  </div>
</template>
```

### 2. 带查询条件的分页

```vue
<script setup lang="ts">
import { usePagination } from "~/shared/composables/pagination"

interface SearchQuery {
  keyword: string
  status: string
  category: string
}

// 定义查询条件的初始值
const { query, clearQuery } = usePagination<SearchQuery>({
  keyword: "",
  status: "",
  category: "",
})

async function loadData() {
  const offset = (query.page - 1) * query.limit
  const res = await api.getData({
    offset,
    limit: query.limit,
    keyword: query.keyword,
    status: query.status,
    category: query.category,
  })
  // 处理返回数据...
}

// 监听所有查询条件变化（会自动重置页码）
watch([
  () => query.page,
  () => query.limit,
  () => query.keyword,
  () => query.status,
  () => query.category,
], loadData)

// 对于需要防抖的搜索
watchDebounced(
  () => query.keyword,
  loadData,
  { debounce: 500 }
)

function handleSearch() {
  // 手动触发搜索，会自动重置到第一页
}

function handleClear() {
  // 清空所有查询条件
  clearQuery()
}
</script>

<template>
  <div>
    <!-- 搜索表单 -->
    <n-form inline>
      <n-form-item>
        <n-input v-model:value="query.keyword" placeholder="搜索关键词" />
      </n-form-item>
      <n-form-item>
        <n-select v-model:value="query.status" :options="statusOptions" />
      </n-form-item>
      <n-form-item>
        <n-button @click="handleSearch">搜索</n-button>
        <n-button @click="handleClear">清空</n-button>
      </n-form-item>
    </n-form>

    <!-- 数据展示 -->
    <!-- ... -->

    <!-- 分页组件 -->
    <Pagination
      :total="total"
      v-model:page="query.page"
      v-model:limit="query.limit"
    />
  </div>
</template>
```

## 配置选项

```typescript
const { query } = usePagination(
  {
    // 查询条件初始值
    keyword: "",
    status: "",
  },
  {
    defaultLimit: 20,           // 默认每页条数，默认 10
    defaultPage: 1,             // 默认页码，默认 1
    resetPageOnChange: true,    // 查询条件变化时是否重置页码，默认 true
  }
)
```

## 返回值说明

```typescript
const {
  query,        // 响应式查询对象，包含 page、limit 和自定义查询条件
  updateRoute,  // 手动更新 URL（通常不需要调用）
  resetPage,    // 重置页码到第一页
  clearQuery,   // 清空所有查询条件
  syncFromRoute // 从 URL 同步到本地状态（通常不需要调用）
} = usePagination()
```

## 迁移指南

### 迁移前（旧代码）

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const query = reactive({
  page: parseInt(route.query.page) || 1,
  limit: parseInt(route.query.limit) || 10,
  keyword: route.query.keyword ?? "",
  status: route.query.status ?? "",
})

function routerPush() {
  router.push({
    path: route.path,
    query: filterEmptyValue(query),
  })
}

function clear() {
  query.keyword = ""
  query.status = ""
}

// 大量的 watch 逻辑
watch(() => query.page, routerPush)
watch(() => [query.limit, query.status], () => {
  query.page = 1
  routerPush()
})
watchDebounced(() => query.keyword, () => {
  query.page = 1
  routerPush()
}, { debounce: 500 })
</script>
```

### 迁移后（新代码）

```vue
<script setup lang="ts">
const { query, clearQuery } = usePagination({
  keyword: "",
  status: "",
})

function clear() {
  clearQuery()
}

// 简化的监听逻辑
watchDebounced(() => query.keyword, loadData, { debounce: 500 })
watch([() => query.page, () => query.limit, () => query.status], loadData)
</script>
```

## 优势

1. **减少重复代码**：URL 同步逻辑自动处理
2. **统一行为**：所有分页组件行为一致
3. **类型安全**：完整的 TypeScript 支持
4. **灵活配置**：支持自定义默认值和行为
5. **易于维护**：集中管理分页逻辑

## 注意事项

1. 查询条件变化时会自动重置页码（可通过 `resetPageOnChange: false` 禁用）
2. URL 同步是自动的，无需手动调用 `router.push`
3. 组件挂载时会自动从 URL 同步初始状态
4. 支持浏览器前进后退按钮
