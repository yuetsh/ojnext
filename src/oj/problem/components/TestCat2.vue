<script lang="ts" setup>
// import { LANGUAGE } from "~/utils/types"

// interface Props {
//   lang: LANGUAGE
//   input: string
// }
// const props = withDefaults(defineProps<Props>(), {
//   lang: "C",
//   input: "",
// })
function gotoTestCat() {
  const url = "https://code.hyyz.izhai.net/"
  // let id = 50
  // const lang = props.lang
  // if (lang === "Python3") id = 71
  // if (lang === "Java") id = 62
  // const payload = { input: props.input || "", id }
  // try {
  //   const encoded = window.btoa(encodeURIComponent(JSON.stringify(payload)))
  //   window.open(`${url}?stdin=${encoded}`, "_blank")
  // } catch (e) {
  //   window.open(url, "_blank")
  // }
  window.open(url, "_blank")
}
</script>
<template>
  <n-button @click="gotoTestCat">自测猫</n-button>
</template>
