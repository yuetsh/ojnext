# 学生视角（演示模式）设计

日期：2026-07-26
范围：仅前端（ojnext）

## 背景

超级管理员给学生上课演示时，界面上到处是管理员才可见的入口和按钮（后台菜单、题目编辑、提交列表的额外操作列等）。这些东西对学生是噪音，也容易误点。需要一个一键开关，把界面临时切换成普通学生看到的样子。

## 目标

- 超管点一下，全站界面变成普通学生的样子
- 再点一下恢复
- 刷新页面不丢状态
- 改动集中，不散落到几十个页面

## 非目标

- 不改后端。演示模式是纯界面伪装，登录态仍然是超管，接口权限不变。目的是演示，不是权限隔离。
- 不做审计日志、不做时长限制。
- 教师管理员、学生管理员不提供此功能。

## 机制

全站所有权限判断都读 `shared/store/user.ts` 里的几个 getter，没有任何一处直接读 `user.admin_type`。因此在 store 层加一个开关，就能一次性覆盖全部调用点。

```ts
// shared/store/user.ts
const demoMode = ref<boolean>(storage.get(STORAGE_KEY.DEMO_MODE) ?? false)

// 不受伪装影响的真实身份，只用于决定是否显示切换入口
const realIsSuperAdmin = computed(
  () => user.value?.admin_type === USER_TYPE.SUPER_ADMIN,
)

const isSuperAdmin = computed(() => !demoMode.value && realIsSuperAdmin.value)
const isAdminRole = computed(() => !demoMode.value && (/* 原逻辑 */))
const isStudentAdmin = computed(() => !demoMode.value && (/* 原逻辑 */))
const isTeacherAdmin = computed(() => !demoMode.value && (/* 原逻辑 */))
const isTeacherOrAbove = computed(() => !demoMode.value && (/* 原逻辑 */))
const hasProblemPermission = computed(() => !demoMode.value && (/* 原逻辑 */))

const canToggleDemoMode = computed(() => realIsSuperAdmin.value)

function toggleDemoMode() {
  demoMode.value = !demoMode.value
  storage.set(STORAGE_KEY.DEMO_MODE, demoMode.value)
}
```

`realIsSuperAdmin` 是关键：如果切换入口的显示条件用被伪装后的 `isSuperAdmin`，一进入演示模式入口自己就消失了，退不出来。

## 改动清单

| 文件 | 改动 |
|---|---|
| `src/utils/constants.ts` | `STORAGE_KEY` 增加 `DEMO_MODE: "demoMode"` |
| `src/shared/store/user.ts` | 新增 `demoMode`、`realIsSuperAdmin`、`canToggleDemoMode`、`toggleDemoMode`；6 个角色 getter 加 `!demoMode.value &&` 前缀；导出新成员 |
| `src/shared/components/Header.vue` | 用户下拉菜单 `options` 增加一项「学生视角 / 退出学生视角」 |

**不改**：`src/main.ts` 路由守卫、`src/utils/permissions.ts`、以及所有页面级的 `v-if` 判断。它们读的都是上述 getter，自动跟随。

## 交互

**入口**：右上角用户头像下拉菜单，与「我的主页」「我的提交」并列。

- 显示条件：`userStore.canToggleDemoMode`
- 文案随状态翻转：未开启显示「学生视角」，已开启显示「退出学生视角」
- 该文案本身就是状态指示器，不额外加横幅或角标

**点击行为**：

1. 调用 `toggleDemoMode()`
2. 如果是**进入**演示模式，且当前路由属于 `admins` 分支，执行 `router.push("/")`。否则页面会停在一个已失去权限的后台界面上。
3. 退出演示模式不需要跳转，留在当前页即可。

## 连带影响（均为预期行为）

- **后台入口消失**（`Header.vue:165-175`）。手动输入 `/admin/*` 地址也会被 `main.ts` 守卫弹回首页，因为守卫读的是被伪装后的 getter。
- **提交列表**（`submission/list.vue`）的教师专属筛选、额外列隐藏；`showSubmissions` 改为跟随站点配置 `submission_list_show_all`，而不是无条件为 true。
- **题目编辑表单**（`problem/components/Form.vue`）的管理员字段隐藏。
- **比赛访问**（`oj/store/contest.ts:49`）失去超管免密码特权，需按学生流程输密码。演示时更真实。
- **协同代码编辑**（`shared/composables/sync.ts`）的超管特殊颜色与提示一并变为学生行为。**确认不做豁免**——演示场景不涉及协同编辑功能。

## 持久化与清理

- 存 `localStorage`，key 为 `demoMode`
- store 初始化时从 storage 读取，刷新后保持
- 退出登录时 `clearProfile()` 调用 `storage.clear()`，会一并清除，不会残留到下一个登录用户

## 验证方式

手工验证（本项目不写测试）：

1. 超管登录 → 下拉菜单出现「学生视角」
2. 点击 → 顶栏「后台」消失，菜单文案变为「退出学生视角」
3. 停在 `/admin/problem/list` 时点击 → 跳回首页
4. 地址栏直接输 `/admin` → 弹回首页
5. 刷新页面 → 仍是学生界面
6. 点「退出学生视角」→ 后台入口恢复
7. 退出登录再登录 → 演示模式已重置为关闭
8. 用教师管理员账号登录 → 菜单中无此项
