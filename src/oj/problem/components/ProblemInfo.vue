<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { problem } from "oj/composables/problem"
import { DIFFICULTY, JUDGE_STATUS } from "utils/constants"
import { getACRateNumber, getTagColor, parseTime } from "utils/functions"
import { Pie } from "vue-chartjs"
import { getProblemBeatRate } from "~/oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import { registerChart } from "~/utils/registerChart"

const beatRate = ref("0")

const data = computed(() => {
  const status = problem.value!.statistic_info
  const labels = []
  for (let i in status) {
    if (status[i] !== 0) {
      // @ts-ignore
      labels.push(JUDGE_STATUS[i]["name"])
    }
  }
  return {
    labels,
    datasets: [
      { data: Object.values(status), hoverOffset: 5, borderRadius: 10 },
    ],
  }
})

const numbers = computed(() => {
  return [
    {
      icon: "streamline-emojis:scroll",
      title: problem.value?.submission_number ?? 0,
      content: "总提交",
      int: true,
      suffix: "",
    },
    {
      icon: "streamline-emojis:woman-raising-hand-2",
      title: problem.value?.accepted_number ?? 0,
      content: "通过数",
      int: true,
      suffix: "",
    },
    {
      icon: "emojione:chart-increasing",
      title: getACRateNumber(
        problem.value?.accepted_number ?? 0,
        problem.value?.submission_number ?? 0,
      ),
      content: "通过率",
      int: false,
      suffix: "%",
    },
    {
      icon: "streamline-emojis:sparkles",
      title: parseFloat(beatRate.value),
      content: "击败用户",
      int: false,
      suffix: "%",
    },
  ]
})

const options = {
  plugins: {
    title: { text: "提交结果的比例", display: true, font: { size: 20 } },
  },
}

async function getBeatRate() {
  const res = await getProblemBeatRate(problem.value!.id)
  beatRate.value = res.data
}

onBeforeMount(registerChart)
onMounted(getBeatRate)
</script>

<template>
  <n-descriptions
    bordered
    label-placement="left"
    :column="isDesktop ? 3 : 1"
    v-if="problem"
  >
    <n-descriptions-item label="编号">
      {{ problem._id }}
    </n-descriptions-item>
    <n-descriptions-item label="出题人">
      {{ problem.created_by.username }}
    </n-descriptions-item>
    <n-descriptions-item label="创建时间">
      {{ parseTime(problem.create_time) }}
    </n-descriptions-item>
    <n-descriptions-item label="难度">
      <n-tag :type="getTagColor(problem.difficulty)">
        {{ DIFFICULTY[problem.difficulty] }}
      </n-tag>
    </n-descriptions-item>
    <n-descriptions-item :span="2" label="标签">
      <n-flex>
        <n-tag type="info" v-for="tag in problem.tags" :key="tag">
          {{ tag }}
        </n-tag>
      </n-flex>
    </n-descriptions-item>
  </n-descriptions>
  <n-grid :cols="isDesktop ? 4 : 2" :x-gap="10" :y-gap="10" class="cards">
    <n-gi v-for="item in numbers" :key="item.content">
      <n-card hoverable>
        <n-flex align="center">
          <Icon v-if="isDesktop" :icon="item.icon" width="40" />
          <div>
            <n-h2 class="number">
              <n-number-animation
                :to="item.title"
                :precision="item.int ? 0 : 2"
              />
              <span v-if="item.suffix">{{ item.suffix }}</span>
            </n-h2>
            <n-h4 class="number-label">{{ item.content }}</n-h4>
          </div>
        </n-flex>
      </n-card>
    </n-gi>
  </n-grid>
  <div class="pie" v-if="problem && problem.submission_number > 0">
    <Pie :data="data" :options="options" />
  </div>
</template>
<style scoped>
.cards {
  margin-top: 24px;
}

.number {
  margin-bottom: 0;
  font-weight: bold;
}

.number-label {
  margin: 0;
}

.pie {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
}
</style>
