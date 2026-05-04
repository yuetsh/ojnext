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
    <span class="from">{{ "来自 " + hitokoto.from }}</span>
    <span class="sentence">{{ hitokoto.sentence }}</span>
  </div>
</template>
<style scoped>
.hitokoto {
  cursor: pointer;
  height: 36px;
  min-width: 0;
  display: flow-root;
  overflow: hidden;
  text-align: right;
  line-height: 18px;
  word-break: break-all;
}

.hitokoto::before {
  content: "";
  float: right;
  width: 0;
  height: 18px;
}

.hitokoto .sentence {
  text-align: right;
}

.hitokoto .from {
  float: right;
  clear: right;
  max-width: min(45%, 260px);
  margin-left: 8px;
  text-align: right;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  line-height: 18px;
  color: grey;
}
</style>
