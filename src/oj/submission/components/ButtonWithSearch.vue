<script lang="ts" setup>
import Filter from "~/shared/icons/Filter.vue"

defineEmits(["click", "search"])
</script>
<template>
  <n-flex align="center">
    <n-button text type="info" @click="$emit('click')"><slot></slot></n-button>
    <n-button text @click="$emit('search')">
      <template #icon>
        <n-icon color="#ccc">
          <Filter />
        </n-icon>
      </template>
    </n-button>
  </n-flex>
</template>
