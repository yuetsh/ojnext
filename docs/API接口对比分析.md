# API接口对比分析

## 一、前端已使用的API接口

### 1. 用户认证相关（shared/api.ts）
- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册
- `GET /api/logout` - 用户登出
- `GET /api/profile` - 获取用户资料
- `GET /api/captcha` - 获取验证码

### 2. OJ普通用户API（oj/api.ts）
#### 2.1 网站配置
- `GET /api/website` - 获取网站配置
- `GET /api/hitokoto` - 获取一言

#### 2.2 题目相关
- `GET /api/problem` - 获取题目列表
- `GET /api/problem` - 获取单个题目
- `GET /api/problem/tags` - 获取题目标签列表
- `GET /api/problem/author` - 获取题目作者列表
- `GET /api/problem/beat_count` - 获取题目击败率
- `GET /api/pickone` - 随机获取题目
- `GET /api/contest/problem` - 获取竞赛题目

#### 2.3 提交相关
- `GET /api/submission` - 获取单个提交
- `POST /api/submission` - 提交代码
- `GET /api/submissions` - 获取提交列表
- `GET /api/submissions/today_count` - 获取今日提交数
- `GET /api/contest_submissions` - 获取竞赛提交列表

#### 2.4 排名相关
- `GET /api/user_rank` - 获取用户排名
- `GET /api/user_activity_rank` - 获取活跃度排名
- `GET /api/user_problem_rank` - 获取题目排名
- `GET /api/contest_rank` - 获取竞赛排名

#### 2.5 竞赛相关
- `GET /api/contests` - 获取竞赛列表
- `GET /api/contest` - 获取单个竞赛
- `GET /api/contest/access` - 获取竞赛访问权限
- `POST /api/contest/password` - 验证竞赛密码

#### 2.6 公告相关
- `GET /api/announcement` - 获取公告列表/单个公告

#### 2.7 消息相关
- `POST /api/message` - 创建消息
- `GET /api/message` - 获取消息列表

#### 2.8 评论相关
- `POST /api/comment` - 创建评论
- `GET /api/comment` - 获取评论
- `GET /api/comment/statistics` - 获取评论统计

#### 2.9 用户相关
- `POST /api/upload_avatar` - 上传头像
- `PUT /api/profile` - 更新用户资料
- `GET /api/profile/fresh_display_id` - 刷新用户题目显示ID
- `GET /api/metrics` - 获取用户统计数据

#### 2.10 教程相关
- `GET /api/tutorial` - 获取单个教程
- `GET /api/tutorials` - 获取教程列表

#### 2.11 AI分析相关
- `GET /api/ai/detail` - 获取AI详细数据
- `GET /api/ai/weekly` - 获取AI周数据
- `GET /api/ai/heatmap` - 获取AI热力图数据
- `POST /api/ai/analysis` - AI分析生成（使用fetch直接调用，流式响应）

### 3. 管理员API（admin/api.ts）
#### 3.1 仪表板
- `GET /api/admin/dashboard_info` - 获取仪表板信息
- `GET /api/admin/random_user` - 随机获取用户

#### 3.2 题目管理
- `GET /api/admin/problem` - 获取题目列表/单个题目
- `POST /api/admin/problem` - 创建题目
- `PUT /api/admin/problem` - 编辑题目
- `PUT /api/admin/problem/visible` - 切换题目可见性
- `DELETE /api/admin/problem` - 删除题目
- `GET /api/admin/contest/problem` - 获取竞赛题目
- `POST /api/admin/contest/problem` - 创建竞赛题目
- `PUT /api/admin/contest/problem` - 编辑竞赛题目
- `DELETE /api/admin/contest/problem` - 删除竞赛题目
- `POST /api/admin/contest/add_problem_from_public` - 从公开题库添加题目到竞赛

#### 3.3 用户管理
- `GET /api/admin/user` - 获取用户列表
- `POST /api/admin/user` - 导入用户
- `PUT /api/admin/user` - 编辑用户
- `DELETE /api/admin/user` - 删除用户
- `POST /api/admin/reset_password` - 重置用户密码

#### 3.4 竞赛管理
- `GET /api/admin/contest` - 获取竞赛列表/单个竞赛
- `POST /api/admin/contest` - 创建竞赛
- `PUT /api/admin/contest` - 编辑竞赛
- `GET /api/admin/contest/acm_helper` - 获取ACM比赛辅助检查列表
- `PUT /api/admin/contest/acm_helper` - 更新ACM比赛辅助检查状态

#### 3.5 测试用例管理
- `POST /api/admin/test_case` - 上传测试用例
- `GET /api/admin/prune_test_case` - 列出无效测试用例
- `DELETE /api/admin/prune_test_case` - 清理无效测试用例

#### 3.6 题目管理扩展
- `POST /api/admin/contest_problem/make_public` - 将竞赛题目转为公开题目

#### 3.7 判题服务器管理
- `GET /api/admin/judge_server` - 获取判题服务器列表
- `DELETE /api/admin/judge_server` - 删除判题服务器

#### 3.8 公告管理
- `GET /api/admin/announcement` - 获取公告列表/单个公告
- `POST /api/admin/announcement` - 创建公告
- `PUT /api/admin/announcement` - 编辑公告
- `DELETE /api/admin/announcement` - 删除公告

#### 3.9 评论管理
- `GET /api/admin/comment` - 获取评论列表
- `DELETE /api/admin/comment` - 删除评论

#### 3.10 网站配置
- `GET /api/admin/website` - 获取网站配置
- `POST /api/admin/website` - 更新网站配置

#### 3.11 文件上传
- `POST /api/admin/upload_image` - 上传图片（富文本编辑器、Markdown编辑器使用）

#### 3.12 提交管理
- `GET /api/admin/submission/rejudge` - 重新判题
- `GET /api/admin/submission/statistics` - 获取提交统计

#### 3.13 教程管理
- `GET /api/admin/tutorial` - 获取教程列表/单个教程
- `POST /api/admin/tutorial` - 创建教程
- `PUT /api/admin/tutorial` - 更新教程
- `DELETE /api/admin/tutorial` - 删除教程
- `PUT /api/admin/tutorial/visibility` - 设置教程可见性

---

## 二、后端提供但前端未使用的API接口

### 1. 用户认证相关（account）
- `POST /api/change_password` - 修改密码
- `POST /api/change_email` - 修改邮箱
- `POST /api/apply_reset_password` - 申请重置密码
- `POST /api/reset_password` - 重置密码
- `GET /api/check_username_or_email` - 检查用户名或邮箱是否存在
- `GET /api/tfa_required` - 检查是否需要双因素认证
- `POST /api/two_factor_auth` - 双因素认证
- `GET /api/sessions` - 会话管理
- `GET /api/open_api_appkey` - OpenAPI密钥管理
- `GET /api/sso` - 单点登录

### 2. 用户管理（admin）
- `GET /api/admin/generate_user` - 生成用户

### 3. 网站配置相关
- `GET /api/languages` - 获取支持的编程语言列表

### 4. 判题服务器内部接口（不需要前端实现）
- ❌ `POST /api/judge_server_heartbeat/` - 判题服务器心跳
  - **标记为不需要**
  - **原因**: 此接口由 JudgeServer Docker 容器调用，用于向后端报告服务器状态
  - **使用方**: 判题服务器（非前端）
  - **数据内容**: hostname, judger_version, CPU/内存使用率等
  - **认证方式**: 使用特殊的 judge_server_token，非用户认证

### 5. 管理员配置相关
- `GET /api/admin/smtp` - SMTP配置
- `POST /api/admin/smtp_test` - SMTP测试
- `GET /api/admin/versions` - 版本信息

### 6. 题目管理相关（admin）
- `POST /api/admin/compile_spj` - 编译Special Judge
- `POST /api/admin/export_problem` - 导出题目
- `POST /api/admin/import_problem` - 导入题目
- `POST /api/admin/import_fps` - 导入FPS格式题目

### 7. 竞赛相关（admin）
- `GET /api/contest/announcement` - 获取竞赛公告列表（OJ端）
- `GET /api/admin/contest/announcement` - 获取竞赛公告（管理端）
- `GET /api/admin/download_submissions` - 下载竞赛提交

### 8. 提交相关（不必要的接口）
- ❌ `GET /api/submission_exists` - 检查提交是否存在
  - **标记为不需要**
  - **原因**: 题目接口返回的 `my_status` 字段已完整包含此信息
  - **替代方案**: 直接判断 `my_status` 的值（0=已通过，非零=已尝试未通过，null=未尝试）
  - **优势**: 零额外请求，性能更优

### 9. 文件上传相关（admin）
- `POST /api/admin/upload_file` - 上传文件（任意格式）
  - **说明**: 前端已使用 `upload_image`（仅图片），`upload_file` 可上传任意文件
  - **当前状态**: 未使用（前端暂无上传非图片文件的需求）
  - **潜在场景**: 题目附件、教程资料、作业提交等

---

## 三、统计总结

### 前端已使用接口统计
- **OJ普通用户接口**: 38个（包括1个直接用fetch调用的流式接口）
- **管理员接口**: 35个
- **共享接口**: 5个
- **总计**: 78个API调用

### 后端未被使用接口统计
- **用户认证相关**: 10个
- **网站配置相关**: 2个（languages）
- **题目管理相关**: 3个
- **竞赛管理相关**: 3个
- **其他**: 1个
- **标记为不需要**: 2个
  - submission_exists（数据冗余）
  - judge_server_heartbeat（内部接口）
- **总计**: 21个API端点（其中2个不需要前端实现）

### 未使用接口占比
约 **21%** 的后端API接口前端尚未使用
- **需要考虑实现**: 19个接口
- **不必要实现**: 2个接口（submission_exists, judge_server_heartbeat）

**备注**: 本次更新新增了 ACM 比赛辅助检查功能（2个接口），用于赛后人工审核代码。

---

## 四、建议

### 1. 高优先级需要实现的功能
- **密码管理**: change_password, apply_reset_password, reset_password
- **邮箱管理**: change_email
- **用户名/邮箱检查**: check_username_or_email（注册时实时验证）
- **编程语言列表**: languages（显示支持的编程语言）
- **题目导入导出**: export_problem, import_problem（方便题库管理）

### 2. 中等优先级功能
- **双因素认证**: tfa_required, two_factor_auth（增强安全性）
- **会话管理**: sessions（多设备登录管理）
- **竞赛公告**: contest/announcement（OJ端，增强竞赛体验）

### 3. 低优先级功能
- **SSO单点登录**: sso（如需要集成其他系统）
- **OpenAPI**: open_api_appkey（如需要开放API）
- **SMTP配置**: smtp, smtp_test（管理员配置）
- **版本信息**: versions（显示系统版本）
- **FPS导入**: import_fps（特定格式题目导入）
- **文件上传**: upload_file（目前只有图片上传）
- **Special Judge编译**: compile_spj（高级题目功能）

### 4. 可选功能
- **生成用户**: generate_user（批量生成测试用户）
- **下载提交**: download_submissions（下载竞赛所有提交）

---

## 五、接口使用率分析

| 模块 | 后端提供 | 前端使用 | 使用率 |
|------|---------|---------|--------|
| 用户认证 | 17 | 7 | 41% |
| 题目管理 | 14 | 11 | 79% |
| 提交管理 | 7 | 6 | 86% |
| 竞赛管理 | 12 | 9 | 75% |
| 公告管理 | 4 | 4 | 100% |
| 评论管理 | 4 | 4 | 100% |
| 消息管理 | 1 | 1 | 100% |
| 教程管理 | 4 | 4 | 100% |
| AI分析 | 4 | 4 | 100% ✅ |
| 配置管理 | 9 | 3 | 33% ⚠️（1个为内部接口） |

**总体使用率约为 79%**（已实现ACM比赛辅助检查功能，竞赛管理使用率提升至75%）

### 特殊说明

#### 1. 流式接口
`POST /api/ai/analysis` 接口使用了**流式响应（Server-Sent Events）**，因此没有在 `oj/api.ts` 中定义封装函数，而是在 `oj/store/ai.ts` 中直接使用 `fetch` API 调用，用于实时流式输出AI生成的分析内容。

#### 2. ACM 比赛辅助检查功能 ✨

**功能说明**: 用于赛后人工审核 ACM 模式比赛的代码，检查是否存在抄袭、作弊等行为。

**涉及接口**:
- `GET /api/admin/contest/acm_helper` - 获取比赛中所有 AC 的提交记录
  - **返回数据**: 用户名、题目ID、AC时间、错误次数、检查状态等
- `PUT /api/admin/contest/acm_helper` - 更新提交的检查状态
  - **参数**: contest_id, rank_id, problem_id, checked

**使用场景**:
1. 管理员进入比赛详情页，点击"审核"按钮进入辅助检查页面
2. 系统展示所有 AC 提交的列表（按用户和题目分组）
3. 管理员可以：
   - 查看每个提交的代码详情
   - 标记已检查的提交
   - 批量标记所有提交为已检查
   - 按用户名、题目、检查状态筛选
4. 实时显示检查进度统计（总计/已检查/未检查）

**实现位置**:
- 页面: `src/admin/contest/helper.vue`
- 路由: `/admin/contest/:contestID/helper`
- API: `src/admin/api.ts` (getACMHelperList, updateACMHelperChecked)

#### 3. 前端不需要的接口 ❌

##### 3.1 数据冗余接口
**`GET /api/submission_exists`** - 此接口**无需实现**

**分析结论**：
- 后端题目接口（`GET /api/problem`）已返回 `my_status` 字段
- `my_status` 完整记录了用户的做题状态：
  - `0` (JudgeStatus.ACCEPTED) = 已通过 ✅
  - `-1` (JudgeStatus.WRONG_ANSWER) = 答案错误 ❌
  - `-2` (JudgeStatus.COMPILE_ERROR) = 编译错误 ❌
  - `1` (JudgeStatus.TIME_LIMIT_EXCEEDED) = 超时 ❌
  - 其他非零值 = 其他失败原因 ❌
  - `null/undefined` = 从未提交 ⭕

**前端实现**：
```typescript
// 仅需一个计算属性即可判断
const hasTriedButNotPassed = computed(() => {
  return problem.value?.my_status !== undefined &&
         problem.value?.my_status !== null &&
         problem.value?.my_status !== 0
})
```

**优势对比**：
| 方案 | API请求 | 代码复杂度 | 性能 |
|------|---------|-----------|------|
| ❌ 使用 submission_exists | +1 | 高（需异步+状态管理） | 慢（额外网络请求） |
| ✅ 使用 my_status | 0 | 低（3行计算属性） | 快（本地计算） |

**经验教训**：
- 实现新功能前应充分了解后端现有数据结构
- 避免创建冗余接口，优先利用现有数据
- 简单的解决方案往往是最好的

---

##### 3.2 内部系统接口
**`POST /api/judge_server_heartbeat/`** - 此接口**无需前端实现**

**接口说明**：
- **用途**: 判题服务器（JudgeServer）向后端报告健康状态
- **调用方**: JudgeServer Docker 容器（非前端）
- **调用频率**: 每隔几秒自动调用一次
- **认证方式**: 使用 `judge_server_token`（特殊令牌，非用户认证）

**报告的数据**：
```python
{
  "hostname": "judge-server-1",
  "judger_version": "2.0.4",
  "cpu_core": 4,
  "cpu": 45.2,           # CPU使用率
  "memory": 60.5,        # 内存使用率
  "service_url": "http://judger:8080"
}
```

**后端使用场景**：
- 监控判题服务器在线状态
- 显示服务器资源使用情况（仅在管理后台显示）
- 负载均衡分配判题任务

**前端已有接口**：
前端查看判题服务器状态使用的是：
- `GET /api/admin/judge_server` - 获取所有判题服务器列表及状态

**结论**：
此接口是系统内部通信接口，前端完全不需要调用。类似的内部接口还可能存在于分布式系统的其他服务间通信中。

