<template>
  <n-list v-if="messages.length">
    <n-list-item
      :style="{ overflow: 'auto' }"
      v-for="(item, index) in messages"
      :key="index"
    >
      <n-flex size="large" vertical>
        <n-flex align="center">
          <div>发送时间</div>
          <div>{{ parseTime(item.create_time, "YYYY年M月D日 HH:mm:ss") }}</div>
          <div>发送者</div>
          <div>{{ item.sender.username }}</div>
        </n-flex>
        <n-flex align="center">
          <div>题目序号</div>
          <n-button
            text
            type="info"
            @click="router.push('/problem/' + item.submission.problem)"
          >
            {{ item.submission.problem }}
          </n-button>
          <n-tag
            :bordered="false"
            :type="JUDGE_STATUS[item.submission.result]['type']"
          >
            {{ JUDGE_STATUS[item.submission.result]["name"] }}
          </n-tag>
          <Copy :value="item.submission.code" />
        </n-flex>
        <n-code
          :language="LANGUAGE_FORMAT_VALUE[item.submission.language]"
          :code="item.submission.code"
          show-line-numbers
        />
        <div v-html="item.message"></div>
      </n-flex>
    </n-list-item>
  </n-list>
  <n-empty v-else description="没有消息"></n-empty>
  <Pagination
    v-model:limit="query.limit"
    v-model:page="query.page"
    :total="total"
  />
</template>
<script lang="ts" setup>
import { getMessageList } from "oj/api"
import { Message } from "~/utils/types"
import { parseTime } from "~/utils/functions"
import { LANGUAGE_FORMAT_VALUE, JUDGE_STATUS } from "utils/constants"
import Pagination from "~/shared/components/Pagination.vue"
import Copy from "~/shared/components/Copy.vue"

const router = useRouter()
const messages = ref<Message[]>([])
const total = ref(0)

const query = reactive({
  limit: 10,
  page: 1,
})

async function listMessages() {
  const offset = (query.page - 1) * query.limit
  const res = await getMessageList(offset, query.limit)
  total.value = res.data.total
  messages.value = res.data.results
}

onMounted(listMessages)
watch(query, listMessages, { deep: true })
</script>
