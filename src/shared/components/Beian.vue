<template>
  <n-flex
    v-if="!hiddenICP"
    justify="center"
    align="center"
    :vertical="isMobile"
    class="beian"
  >
    <n-flex justify="center" align="center" :vertical="isMobile" size="small">
      <n-text>&copy; 2022 - 2026 判题狗 保留所有权利</n-text>
      <n-flex justify="center" align="center" size="small">
        <n-text>采用</n-text>
        <n-button text @click="goCC">CC BY-NC 4.0</n-button>
        <n-text>许可协议</n-text>
      </n-flex>
    </n-flex>
    <n-button text @click="goICP">浙ICP备2023044109号</n-button>
    <n-button text @click="goPublicSecurity">
      浙公网安备33100402331786号
    </n-button>
  </n-flex>
</template>
<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"

const route = useRoute()
const { isMobile } = useBreakpoints()
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
