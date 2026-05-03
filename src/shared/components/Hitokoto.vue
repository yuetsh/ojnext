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
  <div
    class="hitokoto"
    :title="hitokoto.sentence"
    @click="receive"
    v-if="hitokoto.sentence"
  >
    <div class="sentence">{{ hitokoto.sentence }}</div>
    <div class="from">{{ "来自 " + hitokoto.from }}</div>
  </div>
</template>
<style scoped>
.hitokoto {
  cursor: pointer;
  height: 34px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  text-align: right;
}

.hitokoto .sentence {
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
  line-height: 18px;
}

.hitokoto .from {
  width: 100%;
  text-align: right;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  line-height: 16px;
  color: grey;
}
</style>
