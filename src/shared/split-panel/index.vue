<template>
  <div
    :style="{ cursor, userSelect }"
    class="vue-splitter-container clearfix"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <Pane
      class="splitter-pane splitter-paneL"
      :split="split"
      :style="{ [type]: percent + '%' }"
    >
      <slot name="panel"></slot>
    </Pane>

    <Resizer
      :className="className"
      :style="{ [resizeType]: percent + '%' }"
      :split="split"
      @mousedown.native="onMouseDown"
      @click.native="onClick"
    ></Resizer>

    <Pane
      class="splitter-pane splitter-paneR"
      :split="split"
      :style="{ [type]: 100 - percent + '%' }"
    >
      <slot name="paner"></slot>
    </Pane>
    <div class="vue-splitter-container-mask" v-if="active"></div>
  </div>
</template>

<script setup lang="ts">
import Resizer from "./resizer.vue"
import Pane from "./pane.vue"
import { computed, ref } from "vue"

const {
  minPercent = 10,
  defaultPercent = 50,
  split,
  className,
} = defineProps<{
  minPercent?: number
  defaultPercent?: number
  split: "vertical" | "horizontal"
  className?: string
}>()

const emit = defineEmits(["resize"])

const active = ref(false)
const hasMoved = ref(false)
const percent = ref(defaultPercent)
const type = ref(split === "vertical" ? "width" : "height")
const resizeType = ref(split === "vertical" ? "left" : "top")

const userSelect = computed(() => (active.value ? "none" : "auto"))
const cursor = computed(() =>
  active.value ? (split === "vertical" ? "col-resize" : "row-resize") : ""
)

// watch(
//   () => defaultPercent,
//   (newValue) => {
//     percent.value = newValue
//   }
// )

function onClick() {
  if (!hasMoved.value) {
    percent.value = 50
    emit("resize", percent.value)
  }
}
function onMouseDown() {
  active.value = true
  hasMoved.value = false
}
function onMouseUp() {
  active.value = false
}
function onMouseMove(e: any) {
  if (e.buttons === 0) {
    active.value = false
  }
  if (active.value) {
    let offset = 0
    let target = e.currentTarget
    if (split === "vertical") {
      while (target) {
        offset += target.offsetLeft
        target = target.offsetParent
      }
    } else {
      while (target) {
        offset += target.offsetTop
        target = target.offsetParent
      }
    }
    const currentPage = split === "vertical" ? e.pageX : e.pageY
    const targetOffset =
      split === "vertical"
        ? e.currentTarget.offsetWidth
        : e.currentTarget.offsetHeight
    const newPercent =
      Math.floor(((currentPage - offset) / targetOffset) * 10000) / 100
    if (newPercent > minPercent && newPercent < 100 - minPercent) {
      percent.value = newPercent
    }
    emit("resize", newPercent)
    hasMoved.value = true
  }
}
</script>

<style scoped>
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}
.vue-splitter-container {
  height: 100%;
  position: relative;
}
.vue-splitter-container-mask {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
