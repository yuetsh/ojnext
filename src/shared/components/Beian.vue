<template>
  <n-space v-if="!hiddenICP" justify="center" class="beian">
    <div>
      &copy; 2022 - 2026 判题狗 保留所有权利 采用
      <n-button text @click="goCC">CC BY-NC 4.0</n-button> 许可协议
    </div>
    <n-button text @click="goICP">浙ICP备2023044109号</n-button>
    <n-button text @click="goPublicSecurity">
      浙公网安备33100402331786号
    </n-button>
  </n-space>
</template>
<script lang="ts" setup>
const route = useRoute()
const hiddenICP = computed(() =>
  ["problem", "contest problem"].includes(<string>route.name),
)

function goICP() {
  window.open("https://beian.miit.gov.cn", "_blank")
}

function goCC() {
  window.open(
    "https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans",
    "_blank",
  )
}

function goPublicSecurity() {
  window.open(
    "https://beian.mps.gov.cn/#/query/webSearch?code=33100402331786",
    "_blank",
  )
}
</script>
<style scoped>
.beian {
  margin-bottom: 12px;
}
</style>
