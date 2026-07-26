<template>
  <n-flex
    v-if="!hiddenICP"
    justify="center"
    align="center"
    :size="isMobile ? 4 : 'medium'"
    :wrap="false"
    class="beian"
    :class="{ 'beian--mobile': isMobile }"
  >
    <n-flex justify="center" align="center" :size="isMobile ? 4 : 'small'">
      <n-text>{{ copyrightText }}</n-text>
      <n-button text @click="goCC">CC BY-NC 4.0</n-button>
    </n-flex>
    <template v-if="!isMobile">
      <n-button text @click="goICP">浙ICP备2023044109号-1</n-button>
      <n-button text @click="goPublicSecurity">
        浙公网安备33100402331786号
      </n-button>
    </template>
  </n-flex>
</template>
<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"

const route = useRoute()
const { isMobile } = useBreakpoints()
const hiddenICP = computed(() =>
  ["problem", "contest problem"].includes(route.name as string),
)

const currentYear = new Date().getFullYear()
const copyrightText = `© 2022 - ${currentYear} 判题狗 保留所有权利`

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
  margin: 12px 0;
}

.beian--mobile {
  font-size: 12px;
  max-width: 100%;
  overflow-x: auto;
  padding: 0 8px;
}

.beian--mobile :deep(.n-button__content),
.beian--mobile :deep(.n-text) {
  font-size: 12px;
}
</style>
