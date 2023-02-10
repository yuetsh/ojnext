<script setup lang="ts">
import { Bar } from "vue-chartjs"
import { Rank } from "~/utils/types"

const props = defineProps<{ rankData: Rank[] }>()

const data = computed(() => ({
  labels: props.rankData.map((rank) => rank.user.username),
  datasets: [
    {
      label: "已解决",
      data: props.rankData.map((rank) => rank.accepted_number),
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(55, 66, 250, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(48, 51, 107, 0.2)",
        "rgba(249, 202, 36, 0.2)",
        "rgba(106, 176, 76, 0.2)",
        "rgba(119, 139, 235, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(255, 159, 64, 0.6)",
        "rgba(55, 66, 250, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(48, 51, 107, 0.6)",
        "rgba(249, 202, 36, 0.6)",
        "rgba(106, 176, 76, 0.6)",
        "rgba(119, 139, 235, 0.6)",
      ],
      hoverBackgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(255, 159, 64, 0.8)",
        "rgba(55, 66, 250, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(48, 51, 107, 0.8)",
        "rgba(249, 202, 36, 0.8)",
        "rgba(106, 176, 76, 0.8)",
        "rgba(119, 139, 235, 0.8)",
      ],
      hoverBorderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(55, 66, 250, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(48, 51, 107, 1)",
        "rgba(249, 202, 36, 1)",
        "rgba(106, 176, 76, 1)",
        "rgba(119, 139, 235, 1)",
      ],
      borderWidth: 2,
    },
    {
      label: "总提交数",
      data: props.rankData.map((rank) => rank.submission_number),
      hidden: true,
    },
  ],
}))

const options = ref({
  plugins: {
    title: {
      text: "全校前十名的用户（不包括超管）",
      display: true,
      font: { size: 20 },
    },
  },
})
</script>
<template>
  <Bar class="chart" :data="data" :options="options" />
</template>
<style scoped>
.chart {
  margin-bottom: 24px;
}
</style>
