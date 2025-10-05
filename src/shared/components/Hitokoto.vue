<script setup lang="ts">
import { getHitokoto } from "../api"

const hitokoto = reactive({
  sentence: "",
  from: "",
})

async function receive() {
  try {
    const res = await getHitokoto()
    hitokoto.sentence = res.data.hitokoto
    hitokoto.from = res.data.from
  } catch (error) {
    hitokoto.sentence = "获取一言失败，请点击重试"
    hitokoto.from = "DEV"
  }
}

onMounted(receive)
</script>
<template>
  <div class="hitokoto" @click="receive" v-if="hitokoto.sentence">
    <div class="sentence">{{ hitokoto.sentence }}</div>
    <div class="from">{{ "来自 " + hitokoto.from }}</div>
  </div>
</template>
<style scoped>
.hitokoto {
  cursor: pointer;
  height: 34px;
}

.hitokoto .sentence {
  max-width: 400px;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
}

.hitokoto .from {
  float: right;
  font-size: 12px;
  color: grey;
}
</style>
