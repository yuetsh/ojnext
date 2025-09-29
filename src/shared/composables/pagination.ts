import { filterEmptyValue } from "~/utils/functions"

export interface PaginationQuery {
  page: number
  limit: number
  [key: string]: any
}

export interface UsePaginationOptions {
  /** 默认每页条数 */
  defaultLimit?: number
  /** 默认页码 */
  defaultPage?: number
  /** 当其他查询条件变化时是否重置页码 */
  resetPageOnChange?: boolean
}

/**
 * 分页相关的 composable，处理分页状态和 URL 同步
 * @param initialQuery 初始查询参数对象
 * @param options 配置选项
 */
export function usePagination<T extends Record<string, any>>(
  initialQuery: Omit<T, "page" | "limit"> = {} as Omit<T, "page" | "limit">,
  options: UsePaginationOptions = {},
) {
  const {
    defaultLimit = 10,
    defaultPage = 1,
    resetPageOnChange = true,
  } = options

  const route = useRoute()
  const router = useRouter()

  // 从 URL 查询参数初始化状态
  const query = reactive({
    page: parseInt(<string>route.query.page) || defaultPage,
    limit: parseInt(<string>route.query.limit) || defaultLimit,
    ...initialQuery,
  }) as unknown as T & PaginationQuery

  // 同步 URL 查询参数到本地状态
  function syncFromRoute() {
    ;(query as any).page = parseInt(<string>route.query.page) || defaultPage
    ;(query as any).limit = parseInt(<string>route.query.limit) || defaultLimit

    // 同步其他查询参数
    Object.keys(initialQuery).forEach((key) => {
      const value = route.query[key]
      if (value !== undefined) {
        // 处理不同类型的参数
        if (typeof initialQuery[key] === "boolean") {
          ;(query as any)[key] = value === "1" || value === "true"
        } else if (typeof initialQuery[key] === "number") {
          ;(query as any)[key] = parseInt(<string>value) || initialQuery[key]
        } else {
          ;(query as any)[key] = <string>value || initialQuery[key]
        }
      }
    })
  }

  // 更新 URL
  function updateRoute() {
    const newQuery = filterEmptyValue(query)
    router.push({
      path: route.path,
      query: newQuery,
    })
  }

  // 重置页码到第一页
  function resetPage() {
    ;(query as any).page = defaultPage
  }

  // 清空所有查询条件（除了分页参数）
  function clearQuery() {
    Object.keys(initialQuery).forEach((key) => {
      const initialValue = initialQuery[key]
      if (typeof initialValue === "string") {
        ;(query as any)[key] = ""
      } else if (typeof initialValue === "boolean") {
        ;(query as any)[key] = false
      } else if (typeof initialValue === "number") {
        ;(query as any)[key] = 0
      } else {
        ;(query as any)[key] = initialValue
      }
    })
    resetPage()
  }

  // 监听页码变化，同步到 URL
  watch(() => query.page, updateRoute)

  // 监听每页条数变化，重置页码并同步到 URL
  watch(
    () => query.limit,
    () => {
      if (resetPageOnChange) {
        resetPage()
      }
      updateRoute()
    },
  )

  // 监听其他查询条件变化，重置页码并同步到 URL
  if (resetPageOnChange && Object.keys(initialQuery).length > 0) {
    const otherQueryKeys = Object.keys(initialQuery)
    watch(
      () => otherQueryKeys.map((key) => query[key]),
      () => {
        resetPage()
        updateRoute()
      },
      { deep: true },
    )
  }

  // 监听路由变化，同步到本地状态
  watch(
    () => route.query,
    () => {
      syncFromRoute()
    },
    { deep: true },
  )

  return {
    query,
    updateRoute,
    resetPage,
    clearQuery,
    syncFromRoute,
  }
}

/**
 * 简化版本的分页 composable，只处理基本的分页逻辑
 * @param defaultLimit 默认每页条数
 * @param defaultPage 默认页码
 */
export function useSimplePagination(defaultLimit = 10, defaultPage = 1) {
  return usePagination(
    {},
    { defaultLimit, defaultPage, resetPageOnChange: false },
  )
}
