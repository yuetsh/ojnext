# 前端权限控制说明

本文档说明了前端如何根据后端权限设计实现权限控制。

## 权限等级

### 1. 普通用户 (Regular User)
- admin_type: "Regular User"
- problem_permission: "None"
- 只能访问前台功能，无法进入管理后台

### 2. 管理员 (Admin)
- admin_type: "Admin"  
- problem_permission: "None" | "Own" | "All"
- 可以访问部分管理功能

### 3. 超级管理员 (Super Admin)
- admin_type: "Super Admin"
- problem_permission: "All" (自动设置)
- 可以访问所有管理功能

## 权限控制实现

### 1. 用户状态管理 (`src/shared/store/user.ts`)
```typescript
const isAdminRole = computed(() => 
  user.value?.admin_type === USER_TYPE.ADMIN ||
  user.value?.admin_type === USER_TYPE.SUPER_ADMIN
)
const isSuperAdmin = computed(() => 
  user.value?.admin_type === USER_TYPE.SUPER_ADMIN
)
const hasProblemPermission = computed(() => 
  user.value?.problem_permission !== PROBLEM_PERMISSION.NONE
)
```

### 2. 权限工具函数 (`src/utils/permissions.ts`)
提供了一系列权限检查函数：
- `canManageUsers`: 只有super_admin可以管理用户
- `canManageProblems`: 需要题目权限
- `canManageSystemConfig`: 只有super_admin可以管理系统配置
- 等等...

### 3. 路由权限控制 (`src/main.ts`)
在路由守卫中检查权限：
- `requiresAdmin`: 需要admin或super_admin权限
- `requiresSuperAdmin`: 只有super_admin可以访问
- `requiresProblemPermission`: 需要题目管理权限

### 4. 菜单权限控制 (`src/shared/layout/admin.vue`)
根据用户权限动态显示菜单项：
- admin和super_admin都可以看到：题目管理
- 只有super_admin可以看到：比赛管理、用户管理、系统设置、公告管理、评论管理、教程管理

## 各功能模块权限说明

### 用户管理 (需要 super_admin)
- 创建、编辑、删除用户
- 重置用户密码
- 封禁/解封用户
- 批量导入用户

### 题目管理 (需要 problem_permission)
- `problem_permission = "None"`: 无法管理题目
- `problem_permission = "Own"`: 只能管理自己创建的题目
- `problem_permission = "All"`: 可以管理所有题目

### 比赛管理 (super_admin)
- 创建、编辑、删除比赛
- 管理比赛题目
- 查看比赛数据

### 系统配置 (需要 super_admin)
- SMTP邮件配置
- 判题服务器管理
- 网站基本设置
- 测试用例清理

### 公告管理 (需要 super_admin)
- 创建、编辑、删除公告

### 评论管理 (需要 super_admin)
- 查看、删除用户评论

### 教程管理 (需要 super_admin)
- 创建、编辑、删除教程

## 权限检查流程

1. **路由级权限检查**: 在 `main.ts` 的路由守卫中进行
2. **组件级权限检查**: 在组件内部使用 `usePermissions()` 进行检查
3. **UI权限控制**: 根据权限动态显示/隐藏UI元素

## 使用示例

```vue
<script setup lang="ts">
import { usePermissions } from "~/utils/permissions"

const { canManageUsers, isSuperAdmin } = usePermissions()

// 权限检查
if (!canManageUsers.value) {
  message.error("您没有权限访问此页面")
  router.push("/admin")
}
</script>

<template>
  <!-- 根据权限显示不同内容 -->
  <n-button v-if="isSuperAdmin" type="primary">
    超级管理员专用功能
  </n-button>
</template>
```

## 注意事项

1. **前端权限控制只是UI层面的限制**，真正的权限控制在后端
2. **所有API调用都会在后端进行权限验证**
3. **权限信息来自后端用户接口**，前端不应该缓存或修改权限信息
4. **路由权限检查是异步的**，需要等待用户信息加载完成
