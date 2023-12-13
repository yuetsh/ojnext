<template>
  <n-space v-if="!hiddenICP" justify="center" class="beian">
    <n-button text @click="goICP">浙ICP备2023044109号</n-button>
    <div>
      <img src="/备案图标.png" alt="备案图标" />
      <n-button text @click="goPublicSecurity">
        浙公网安备33100402331786号
      </n-button>
    </div>
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

.beian img {
  width: 14px;
  height: 14px;
  transform: translateY(2px);
  margin-right: 4px;
}
</style>
