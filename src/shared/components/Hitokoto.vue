<script setup lang="ts">
import { getHitokoto } from "../api"

const hitokoto = reactive({
  sentence: "",
  from: "",
})

async function receive() {
  const res = await getHitokoto()
  hitokoto.sentence = res.data.hitokoto
  hitokoto.from = res.data.from
}

onMounted(receive)
</script>
<template>
  <div class="hitokoto" @click="receive">
    <div class="sentence">{{ hitokoto.sentence }}</div>
    <div class="from">{{ "from " + hitokoto.from }}</div>
  </div>
</template>
<style scoped>
.hitokoto {
  cursor: pointer;
  height: 34px;
}

.hitokoto .sentence {
  max-width: 500px;
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
