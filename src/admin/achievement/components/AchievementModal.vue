<script setup lang="ts">
import {
  createAchievement,
  getMetricOptions,
  updateAchievement,
  type AdminAchievement,
  type MetricOption,
} from "admin/api"
import AchievementIcon from "shared/components/AchievementIcon.vue"

const props = defineProps<{
  show: boolean
  editing: AdminAchievement | null
}>()
const emit = defineEmits<{ "update:show": [boolean]; saved: [] }>()

const message = useMessage()
const metrics = ref<MetricOption[]>([])
const saving = ref(false)

function emptyForm() {
  return {
    name: "",
    description: "",
    icon: "noto:trophy",
    rarity: "bronze",
    hidden: false,
    metric: "",
    operator: "gte" as "gte" | "lte",
    threshold: 1,
    visible: true,
    order: 0,
  }
}

const form = ref(emptyForm())

const metricOptions = computed(() =>
  metrics.value.map((m) => ({ label: `${m.name}（${m.key}）`, value: m.key })),
)

const metricHelp = computed(
  () => metrics.value.find((m) => m.key === form.value.metric)?.help_text ?? "",
)

watch(
  () => props.show,
  async (show) => {
    if (!show) return
    if (!metrics.value.length) {
      const res = await getMetricOptions()
      metrics.value = res.data
    }
    if (props.editing) {
      form.value = { ...emptyForm(), ...props.editing }
    } else {
      form.value = { ...emptyForm(), metric: metrics.value[0]?.key ?? "" }
    }
  },
)

async function save() {
  if (!form.value.name || !form.value.metric) {
    message.error("名称和指标不能为空")
    return
  }
  saving.value = true
  try {
    if (props.editing) {
      await updateAchievement({ ...form.value, id: props.editing.id })
    } else {
      await createAchievement(form.value)
    }
    message.success("保存成功")
    emit("update:show", false)
    emit("saved")
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 560px"
    :title="editing ? '编辑成就' : '新建成就'"
    @update:show="emit('update:show', $event)"
  >
    <n-form label-placement="left" :label-width="80">
      <n-form-item label="名称" required>
        <n-input v-model:value="form.name" placeholder="成就名称" />
      </n-form-item>
      <n-form-item label="描述" required>
        <n-input
          v-model:value="form.description"
          type="textarea"
          placeholder="达成条件的描述，展示给学生看"
        />
      </n-form-item>
      <n-form-item label="图标">
        <n-flex vertical :size="4" style="flex: 1">
          <n-flex align="center" :size="10" :wrap="false">
            <div class="icon-preview">
              <AchievementIcon :icon="form.icon" :size="28" />
            </div>
            <n-input
              v-model:value="form.icon"
              placeholder="iconify 图标名，例如 noto:owl"
            />
          </n-flex>
          <n-text depth="3" style="font-size: 12px">
            填 iconify 图标名（推荐 noto: 开头的彩色 emoji 图标），左侧是实时
            预览；预览不出来说明名字写错了。图标名可在 icon-sets.iconify.design
            搜索。
          </n-text>
        </n-flex>
      </n-form-item>
      <n-form-item label="稀有度">
        <n-select
          v-model:value="form.rarity"
          :options="[
            { label: '青铜', value: 'bronze' },
            { label: '白银', value: 'silver' },
            { label: '黄金', value: 'gold' },
            { label: '白金', value: 'platinum' },
          ]"
        />
      </n-form-item>
      <n-form-item label="指标" required>
        <n-select
          v-model:value="form.metric"
          :options="metricOptions"
          filterable
        />
      </n-form-item>
      <n-form-item v-if="metricHelp" label=" ">
        <n-text depth="3">{{ metricHelp }}</n-text>
      </n-form-item>
      <n-form-item label="条件">
        <n-flex align="center">
          <n-select
            v-model:value="form.operator"
            style="width: 130px"
            :options="[
              { label: '大于等于', value: 'gte' },
              { label: '小于等于', value: 'lte' },
            ]"
          />
          <n-input-number v-model:value="form.threshold" :min="0" />
        </n-flex>
      </n-form-item>
      <n-form-item label="隐藏成就">
        <n-switch v-model:value="form.hidden" />
        <n-text depth="3" style="margin-left: 12px">
          未解锁时学生只能看到 ???
        </n-text>
      </n-form-item>
      <n-form-item label="上架">
        <n-switch v-model:value="form.visible" />
      </n-form-item>
      <n-form-item label="排序">
        <n-input-number v-model:value="form.order" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="saving" @click="save">
          保存
        </n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

<style scoped>
.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 34px;
  flex: none;
}
</style>
