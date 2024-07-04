<template>
  <n-alert type="error" v-if="!userStore.isAuthed" title="请先登录" />
  <div v-else>
    <n-alert
      v-if="problem?.my_status !== 0"
      class="title"
      type="error"
      title="请先完成该题"
    ></n-alert>
    <div v-else>
      <n-alert class="title" type="success" :title="title"></n-alert>
      <n-form>
        <n-form-item
          label-width="220"
          label-align="left"
          label="题目是否描述清楚"
          label-placement="left"
        >
          <Icon
            v-if="hasCommented"
            icon="noto:star"
            :width="24"
            v-for="(_, i) in description_rating"
            :key="i"
          />
          <n-rate v-else size="large" v-model:value="description_rating" />
        </n-form-item>
        <n-form-item
          label-width="220"
          label-align="left"
          :label="
            '难度是否匹配（此题是' + DIFFICULTY[problem.difficulty] + '的）'
          "
          label-placement="left"
        >
          <Icon
            v-if="hasCommented"
            icon="noto:star"
            :width="24"
            v-for="(_, i) in difficulty_rating"
            :key="i"
          />
          <n-rate v-else size="large" v-model:value="difficulty_rating" />
        </n-form-item>
        <n-form-item
          label-width="220"
          label-align="left"
          label="综合评分"
          label-placement="left"
        >
          <Icon
            v-if="hasCommented"
            icon="noto:star"
            :width="24"
            v-for="(_, i) in difficulty_rating"
            :key="i"
          />
          <n-rate v-else size="large" v-model:value="comprehensive_rating" />
        </n-form-item>
        <n-form-item
          v-if="!hasCommented"
          label="对这道题的评价（可选，注意文明用语）"
        >
          <n-input v-model:value="content" type="textarea" />
        </n-form-item>
        <n-form-item v-if="hasCommented && content" label="你对这道题的评价：">
          {{ content }}
        </n-form-item>
        <n-button
          v-if="hasCommented && props.showStatistics"
          type="primary"
          @click="getComments"
        >
          查看统计
        </n-button>
        <n-button v-if="!hasCommented" type="primary" @click="submit"
          >提交</n-button
        >
      </n-form>
      <div v-if="props.showStatistics">
        <n-descriptions
          class="list"
          v-if="count"
          :column="4"
          bordered
          label-placement="left"
        >
          <n-descriptions-item label="评论总数">
            {{ count }}
          </n-descriptions-item>
          <n-descriptions-item label="描述评分">
            {{ rating.description }}
          </n-descriptions-item>
          <n-descriptions-item label="难度评分">
            {{ rating.difficulty }}
          </n-descriptions-item>
          <n-descriptions-item label="综合评分">
            {{ rating.comprehensive }}
          </n-descriptions-item>
        </n-descriptions>
        <n-list class="list" v-if="count && contentList.length">
          <div>以下是一些评论留言：</div>
          <n-list-item v-for="(item, i) in contentList" :key="i">
            {{ item }}
          </n-list-item>
        </n-list>
        <n-empty class="list" v-if="show && count === 0">
          暂无记录，快去评论吧
        </n-empty>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { problem } from "oj/composables/problem"
import { DIFFICULTY } from "utils/constants"
import { createComment, getComment, getCommentStatistics } from "~/oj/api"
import { useUserStore } from "~/shared/store/user"

interface Props {
  showStatistics?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatistics: true,
})

const userStore = useUserStore()

const message = useMessage()

const content = ref("")
const description_rating = ref(0)
const difficulty_rating = ref(0)
const comprehensive_rating = ref(0)

const [show, toggleShow] = useToggle()
const [hasCommented, toggleHasCommented] = useToggle()
const contentList = ref([])
const count = ref(0)
const rating = reactive({
  description: 0,
  difficulty: 0,
  comprehensive: 0,
})

const title = computed(() => {
  if (hasCommented.value) return "这道题你已经打过分了，你的评分如下："
  return "你已经完成了这道题，请给这道题打分吧！"
})

async function submit() {
  if (
    description_rating.value === 0 ||
    difficulty_rating.value === 0 ||
    comprehensive_rating.value === 0
  ) {
    message.error("请完成打分")
    return
  }
  const data = {
    problem_id: problem.value!.id,
    content: content.value,
    description_rating: description_rating.value,
    difficulty_rating: difficulty_rating.value,
    comprehensive_rating: comprehensive_rating.value,
  }
  await createComment(data)
  toggleHasCommented(true)
  message.success("提交成功")
}

async function getComments() {
  const res = await getCommentStatistics(problem.value!.id)
  toggleShow(true)
  if (!res.data) return
  count.value = res.data.count
  rating.description = res.data.rating.description
  rating.difficulty = res.data.rating.difficulty
  rating.comprehensive = res.data.rating.comprehensive
  contentList.value = res.data.contents
}

async function getMyComment() {
  const res = await getComment(problem.value!.id)
  if (!res.data) return
  content.value = res.data.content
  description_rating.value = res.data.description_rating
  difficulty_rating.value = res.data.difficulty_rating
  comprehensive_rating.value = res.data.comprehensive_rating
  toggleHasCommented(true)
}

onMounted(getMyComment)
</script>
<style scoped>
.title {
  margin-bottom: 24px;
}
.list {
  margin-top: 24px;
}
</style>
