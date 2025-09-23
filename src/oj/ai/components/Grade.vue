<template>
  <img src="/S.png" alt="S Grade" v-if="props.grade === 'S'" />
  <img src="/A.png" alt="A Grade" v-if="props.grade === 'A'" />
  <img src="/B.png" alt="B Grade" v-if="props.grade === 'B'" />
  <img src="/C.png" alt="C Grade" v-if="props.grade === 'C'" />
</template>
<script setup lang="ts">
const props = defineProps<{
  grade: "S" | "A" | "B" | "C"
}>()
</script>
<style scoped>
img {
  animation: shake 0.5s infinite;
  width: 30px;
  height: 30px;
  margin: 0 10px -10px;
}

@keyframes shake {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
</style>
