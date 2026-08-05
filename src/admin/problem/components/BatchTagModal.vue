<script setup lang="ts">
import type { AdminTag } from "utils/types"
import { batchTagProblems, getTagAdminList } from "admin/api"

interface Props {
  show: boolean
  problemIds: number[]
  action: "add" | "remove"
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:show": [value: boolean]
  done: []
}>()

const message = useMessage()

const tags = ref<AdminTag[]>([])
const selected = ref<string[]>([])
const newTags = ref<string[]>([])

const title = computed(() =>
  props.action === "add" ? "批量添加标签" : "批量移除标签",
)

const selectedSet = computed(() => new Set(selected.value))

const names = computed(() =>
  props.action === "add"
    ? Array.from(new Set([...selected.value, ...newTags.value]))
    : selected.value,
)

function toggleTag(name: string) {
  const set = new Set(selected.value)
  if (set.has(name)) set.delete(name)
  else set.add(name)
  selected.value = Array.from(set)
}

async function listTags() {
  const res = await getTagAdminList()
  tags.value = res.data
}

function close() {
  emit("update:show", false)
}

async function submit() {
  if (!names.value.length) {
    message.error("请先选择标签")
    return
  }
  const res = await batchTagProblems(
    props.problemIds,
    names.value,
    props.action,
  )
  const verb = props.action === "add" ? "添加" : "移除"
  message.success(
    `已为 ${res.data.problem_count} 道题${verb} ${res.data.tag_count} 个标签`,
  )
  close()
  emit("done")
}

watch(
  () => props.show,
  (show) => {
    if (!show) return
    selected.value = []
    newTags.value = []
    listTags()
  },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    style="width: 600px"
    :mask-closable="false"
    @close="close"
  >
    <n-flex vertical size="large">
      <div>已选中 {{ problemIds.length }} 道题目</div>
      <n-flex size="small">
        <n-tag
          v-for="tag in tags"
          :key="tag.id"
          checkable
          :checked="selectedSet.has(tag.name)"
          @update:checked="toggleTag(tag.name)"
        >
          {{ tag.name }}（{{ tag.problem_count }}）
        </n-tag>
      </n-flex>
      <n-dynamic-tags v-if="action === 'add'" v-model:value="newTags" />
      <n-flex justify="end">
        <n-button @click="close">取消</n-button>
        <n-button type="primary" @click="submit">确定</n-button>
      </n-flex>
    </n-flex>
  </n-modal>
</template>
