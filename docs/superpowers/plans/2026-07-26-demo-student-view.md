# 学生视角（演示模式）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 超级管理员在右上角下拉菜单点一下，整站界面变成普通学生看到的样子，再点一下恢复。

**Architecture:** 纯前端伪装。全站 40 多处权限判断读的都是 `shared/store/user.ts` 里的 6 个角色 getter，没有一处直接读 `user.admin_type`。在 store 里加一个 `demoMode` 开关，给每个 getter 加 `!demoMode.value &&` 前缀，全站自动跟随。路由守卫（`src/main.ts`）、权限工具（`src/utils/permissions.ts`）、各页面 `v-if` 零改动。

**Tech Stack:** Vue 3 `<script setup>` + TypeScript，Pinia setup store，Naive UI（`n-dropdown` / `DropdownOption`），Vite。

**Spec:** `docs/superpowers/specs/2026-07-26-demo-student-view-design.md`

## Global Constraints

- **不写测试。** 项目根 CLAUDE.md 明确规定 "Do not write new tests"，且 ojnext 无测试框架。本计划的验证步骤全部是 `npm run build` 冒烟 + 浏览器手工核对。
- **不改后端。** 演示模式是界面伪装，登录态仍是超管，接口权限不变。
- 仅超级管理员可见此开关。教师管理员、学生管理员不提供。
- 自动导入已配置：`ref` / `computed` / `useRouter` / `useRoute` / Naive UI 组件与类型（`DropdownOption`）均**不需要手写 import**。
- 存储 key 常量统一放 `src/utils/constants.ts` 的 `STORAGE_KEY`，读写走 `src/utils/storage.ts` 默认导出（内部做 JSON 序列化）。
- 提交前跑 `npm fmt`（Prettier）。
- 中文注释、中文 UI 文案，与现有代码一致。

---

## File Structure

| 文件 | 职责 | 本次改动 |
|---|---|---|
| `src/utils/constants.ts` | 全局常量 | `STORAGE_KEY` 增加一个键 |
| `src/shared/store/user.ts` | 用户身份与角色判断的唯一来源 | 新增 `demoMode` 状态与伪装逻辑（改动主体） |
| `src/shared/components/Header.vue` | 顶栏与用户下拉菜单 | 新增菜单项与切换处理函数 |

不新建文件。`demoMode` 放进已有的 `user` store 而不是单开一个 store —— 它伪装的就是这个 store 的输出，分开会让两个 store 循环依赖。

---

### Task 1: store 层伪装开关

**Files:**
- Modify: `src/utils/constants.ts:147-153`
- Modify: `src/shared/store/user.ts`

**Interfaces:**
- Consumes: 无（第一个任务）
- Produces: `useUserStore()` 新增三个成员，供 Task 2 使用：
  - `demoMode: boolean` — 当前是否处于演示模式（store 解包后为布尔值）
  - `canToggleDemoMode: boolean` — 是否显示切换入口（真实超管身份，不受伪装影响）
  - `toggleDemoMode(): void` — 翻转开关并写入 localStorage

- [ ] **Step 1: 在 `STORAGE_KEY` 增加常量**

打开 `src/utils/constants.ts`，把 `STORAGE_KEY` 改成：

```ts
export const STORAGE_KEY = {
  AUTHED: "authed",
  LANGUAGE: "problemLanguage",
  LEARN_CURRENT_STEP: "learnStep",
  ADMIN_PROBLEM: "adminProblem",
  ADMIN_PROBLEM_TAGS: "adminProblemTags",
  DEMO_MODE: "demoMode",
}
```

- [ ] **Step 2: 在 user store 加入 `demoMode` 与真实身份 getter**

打开 `src/shared/store/user.ts`。在 `const isAuthed = ...` 那一行之后、`const isAdminRole = ...` 之前，插入：

```ts
  // 演示模式：超管临时把界面伪装成普通学生，方便上课投屏
  const demoMode = ref<boolean>(storage.get(STORAGE_KEY.DEMO_MODE) ?? false)

  // 不受伪装影响的真实身份，只用于判断能否切换演示模式。
  // 若这里用被伪装后的 isSuperAdmin，一进入演示模式入口就消失了，退不出来。
  const realIsSuperAdmin = computed(
    () => user.value?.admin_type === USER_TYPE.SUPER_ADMIN,
  )
```

`storage` 和 `STORAGE_KEY` 文件顶部已经 import 过，不需要新增 import。

- [ ] **Step 3: 给 6 个角色 getter 加上伪装前缀**

把 `src/shared/store/user.ts` 中原有的 6 个 getter（`isAdminRole`、`isStudentAdmin`、`isTeacherAdmin`、`isTeacherOrAbove`、`isSuperAdmin`、`hasProblemPermission`）整段替换为：

```ts
  const isAdminRole = computed(
    () =>
      !demoMode.value &&
      (user.value?.admin_type === USER_TYPE.STUDENT_ADMIN ||
        user.value?.admin_type === USER_TYPE.TEACHER_ADMIN ||
        user.value?.admin_type === USER_TYPE.SUPER_ADMIN),
  )
  const isStudentAdmin = computed(
    () => !demoMode.value && user.value?.admin_type === USER_TYPE.STUDENT_ADMIN,
  )
  const isTeacherAdmin = computed(
    () => !demoMode.value && user.value?.admin_type === USER_TYPE.TEACHER_ADMIN,
  )
  const isTeacherOrAbove = computed(
    () =>
      !demoMode.value &&
      (user.value?.admin_type === USER_TYPE.TEACHER_ADMIN ||
        user.value?.admin_type === USER_TYPE.SUPER_ADMIN),
  )
  const isSuperAdmin = computed(() => !demoMode.value && realIsSuperAdmin.value)
  const hasProblemPermission = computed(
    () =>
      !demoMode.value &&
      user.value?.problem_permission !== PROBLEM_PERMISSION.NONE,
  )
```

注意：`isAdminRole` 和 `isTeacherOrAbove` 原本是多个 `||` 连成的表达式，加前缀时**必须给原表达式套一层括号**，否则 `&&` 的优先级会让第一个 `||` 分支逃过伪装。

- [ ] **Step 4: 加入切换能力与切换函数**

紧接在 `hasProblemPermission` 之后插入：

```ts
  const canToggleDemoMode = computed(() => realIsSuperAdmin.value)

  function toggleDemoMode() {
    demoMode.value = !demoMode.value
    storage.set(STORAGE_KEY.DEMO_MODE, demoMode.value)
  }
```

- [ ] **Step 5: 退出登录时重置内存中的开关**

`storage.clear()` 会清掉 localStorage 里的标记，但内存中的 ref 还留着，同一次会话里换账号登录会带过去。把 `clearProfile` 改成：

```ts
  function clearProfile() {
    profile.value = null
    demoMode.value = false
    storage.clear()
  }
```

- [ ] **Step 6: 导出新成员**

在 store 末尾的 `return { ... }` 里加入三项（放在 `hasProblemPermission` 之后）：

```ts
    demoMode,
    canToggleDemoMode,
    toggleDemoMode,
```

- [ ] **Step 7: 格式化并冒烟构建**

```bash
cd ojnext
npm fmt
npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 8: 手工验证伪装生效（此时还没有 UI 入口，用 localStorage 模拟）**

启动 `npm start`，用超管账号登录，然后在浏览器 DevTools Console 执行：

```js
localStorage.setItem("demoMode", "true")
location.reload()
```

逐项核对：
- 顶栏「后台」菜单项消失
- 地址栏直接输入 `/admin` → 被弹回首页
- 题目详情页不再出现管理员专属按钮

再执行 `localStorage.setItem("demoMode", "false"); location.reload()`，确认上述内容全部恢复。

- [ ] **Step 9: 提交**

```bash
cd ojnext
git add src/utils/constants.ts src/shared/store/user.ts
git commit -m "feat(user): store 层加入演示模式伪装开关

超管开启后所有角色 getter 降级为普通学生，全站权限判断自动跟随。
realIsSuperAdmin 保留真实身份，用于判断能否切换。"
```

---

### Task 2: 下拉菜单切换入口

**Files:**
- Modify: `src/shared/components/Header.vue:109-113`（新增函数）、`:178-227`（`options` 改为 computed 并增加菜单项）

**Interfaces:**
- Consumes: Task 1 提供的 `userStore.demoMode`、`userStore.canToggleDemoMode`、`userStore.toggleDemoMode()`
- Produces: 无后续任务依赖

- [ ] **Step 1: 把 `options` 从普通数组改为 computed**

`src/shared/components/Header.vue` 第 178 行现在是：

```ts
const options: Array<DropdownOption | DropdownDividerOption> = [
```

改为：

```ts
const options = computed<Array<DropdownOption | DropdownDividerOption>>(() => [
```

并把第 227 行的结尾 `]` 改为 `])`。

**这一步是必需的，不是风格偏好**：原来的 `options` 是普通数组，只在 setup 时求值一次。新菜单项的 `label`（「学生视角」/「退出学生视角」）和 `show` 都要跟随状态变化，留在普通数组里永远不会更新。同文件的 `menus`（第 119 行）本来就是 computed，改完两者一致。

模板里 `:options="options"`（第 280 行）不用动，computed 在模板中自动解包。

- [ ] **Step 2: 加入切换处理函数**

在 `handleLogout`（第 109-113 行）之后插入：

```ts
function handleToggleDemoMode() {
  const entering = !userStore.demoMode
  userStore.toggleDemoMode()
  // 进入演示模式时若正停在后台页面，当前界面已经失去权限，必须主动退出去
  if (entering && route.path.startsWith("/admin")) {
    router.push("/")
  }
}
```

`route` 和 `router` 在第 16-17 行已经拿到，`userStore` 在第 12 行已经拿到，无需新增。

- [ ] **Step 3: 在下拉菜单中加入菜单项**

在 `options` 数组里、`{ type: "divider" }`（第 220 行）**之前**插入：

```ts
  {
    label: userStore.demoMode ? "退出学生视角" : "学生视角",
    key: "demo-mode",
    show: userStore.canToggleDemoMode,
    icon: renderIcon("fluent-emoji:graduation-cap"),
    props: { onClick: handleToggleDemoMode },
  },
```

文案本身就是状态指示器：看到「退出学生视角」说明当前正处于演示模式。按设计不额外加横幅。

- [ ] **Step 4: 格式化并冒烟构建**

```bash
cd ojnext
npm fmt
npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 5: 手工验证完整流程**

先清掉 Task 1 遗留的手工标记：DevTools Console 执行 `localStorage.removeItem("demoMode")`，刷新。

用超管账号登录，逐项核对：

1. 右上角用户名下拉菜单出现「学生视角」，图标正常显示（不是空白方块）
2. 点击 →「后台」菜单项消失，下拉菜单文案变为「退出学生视角」
3. 刷新页面 → 仍是学生界面，菜单仍显示「退出学生视角」
4. 地址栏直接输入 `/admin` → 弹回首页
5. 点「退出学生视角」→「后台」入口恢复，文案变回「学生视角」
6. 进入 `/admin/problem/list`，打开下拉菜单点「学生视角」→ 自动跳回首页
7. 退出登录后重新用超管登录 → 演示模式已重置为关闭状态
8. 用教师管理员账号登录 → 下拉菜单中**没有**这一项

- [ ] **Step 6: 提交**

```bash
cd ojnext
git add src/shared/components/Header.vue
git commit -m "feat(header): 用户下拉菜单加入学生视角开关

仅超管可见。进入演示模式时若停在后台页面则跳回首页。
options 改为 computed，否则菜单文案与显示条件不会随状态更新。"
```

---

## 完成后

两个任务都提交后，整个特性即完成。回读一遍 spec 的「连带影响」章节，确认这些变化在实机上都是预期的：

- 提交列表的教师筛选与额外列消失，`showSubmissions` 改为跟随站点配置
- 比赛失去超管免密码特权
- 协同代码编辑（`shared/composables/sync.ts`）的超管特殊颜色与提示一并变为学生行为 —— **已确认不做豁免**
