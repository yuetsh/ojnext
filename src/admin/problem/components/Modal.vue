<script lang="ts" setup>
import { getProblemList } from "~/admin/api"
import { AdminProblemFiltered } from "~/utils/types"
import Pagination from "~/shared/components/Pagination.vue"
import AddButton from "./AddButton.vue"

interface Props {
  show: boolean
  count: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:show", value: boolean): void
  (e: "change"): void
}>()

const route = useRoute()

const query = reactive({
  page: 1,
  limit: 10,
  keyword: "",
})
const total = ref(0)
const problems = shallowRef<AdminProblemFiltered[]>([])

const columns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "编号", key: "_id", width: 80 },
  { title: "标题", key: "title" },
  {
    title: "选项",
    key: "add",
    render: (row) =>
      h(AddButton, {
        problemID: row.id,
        contestID: <string>route.params.contestID,
        onAdded: () => emit("change"),
      }),
    width: 60,
  },
]

async function getList() {
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(
    offset,
    query.limit,
    query.keyword,
    "",
    "ACM",
  )
  total.value = res.total
  problems.value = res.results
}
watch(
  () => props.show,
  (value) => {
    if (value) getList()
  },
)
watch(query, getList, { deep: true })
</script>
<template>
  <n-modal
    :mask-closable="false"
    :show="props.show"
    preset="card"
    style="width: 600px"
    title="从题库中添加"
    @close="$emit('update:show', false)"
  >
    <n-input
      class="search"
      v-model:value="query.keyword"
      placeholder="搜索标题或编号"
    />
    <n-data-table striped :columns="columns" :data="problems" />
    <Pagination
      :total="total"
      v-model:limit="query.limit"
      v-model:page="query.page"
    />
  </n-modal>
</template>
<style scoped>
.search {
  margin-bottom: 20px;
}
</style>
