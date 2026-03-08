# Tasks: BRSMS MVP Demo

## Phase 1: 项目初始化

### 后端初始化
- [x] **T1.1** 创建 Spring Boot 项目骨架
  - 使用 Spring Initializr 或 Maven archetype
  - 依赖: web, data-jpa, websocket, lombok, h2/sqlite

- [x] **T1.2** 配置 SQLite 数据源
  - 添加 SQLite JDBC 依赖
  - 配置 application.yml

- [x] **T1.3** 初始化数据库 Schema
  - 创建 schema.sql
  - 配置自动执行

### 前端初始化
- [x] **T1.4** 创建 Vue3 项目
  - 使用 `npm create vue@latest`
  - 选择 TypeScript + Pinia

- [x] **T1.5** 配置前端基础结构
  - 创建目录结构
  - 配置 Vite 代理

---

## Phase 2: 后端开发

### 数据层
- [x] **T2.1** 创建 Team 实体和 Repository
- [x] **T2.2** 创建 Match 实体和 Repository
- [x] **T2.3** 创建 Event 实体和 Repository

### 业务层
- [x] **T2.4** 实现 MatchService
  - 创建比赛
  - 查询比赛
  - 更新比赛状态

- [x] **T2.5** 实现 ScoreService
  - 记录得分（1/2/3分）
  - 撤销操作
  - 切换节次

- [x] **T2.6** 实现 WebSocketService
  - 广播比分更新
  - 心跳机制

### 控制层
- [x] **T2.7** 实现 MatchController
  - REST API 端点
  - 统一响应格式

- [x] **T2.8** 实现 WebSocketHandler
  - WebSocket 配置
  - 消息编解码

---

## Phase 3: 前端开发

### 状态管理
- [x] **T3.1** 实现 matchStore
  - 比赛数据状态
  - 计分操作 actions

- [x] **T3.2** 实现 websocketStore
  - WebSocket 连接管理
  - 消息处理

### 页面开发
- [x] **T3.3** 实现 ScoreboardView（大屏显示）
  - 比分显示
  - 节次显示
  - 时间显示

- [x] **T3.4** 实现 ControlView（计分控制）
  - 得分按钮
  - 撤销按钮
  - 节次切换

- [x] **T3.5** 实现 MatchSetupView（比赛设置）
  - 球队选择
  - 创建比赛

---

## Phase 4: 集成测试

- [x] **T4.1** 端到端测试
  - 创建比赛流程
  - 计分流程
  - 大屏实时更新验证

- [x] **T4.2** 边界测试
  - 撤销操作
  - 节次切换
  - 断线重连

- [x] **T4.3** 性能验证
  - WebSocket 延迟测试

---

## Phase 5: 文档与交付

- [x] **T5.1** 编写 README.md
  - 项目介绍
  - 快速启动指南
  - 技术栈说明

- [x] **T5.2** 更新 OpenSpec 状态
  - 标记任务完成
  - 归档变更

---

## Task Dependencies

```
T1.1 ──→ T1.2 ──→ T1.3 ──→ T2.1 ──→ T2.4 ──→ T2.7
                                      ↓
                                 T2.5 ──→ T2.6 ──→ T2.8

T1.4 ──→ T1.5 ──→ T3.1 ──→ T3.3
                 ↓
            T3.2 ──→ T3.4
                     ↓
                 T3.5

后端完成 + 前端完成 ──→ T4.1 ──→ T4.2 ──→ T4.3 ──→ T5.1 ──→ T5.2
```

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 5 tasks | 4 hours |
| Phase 2 | 8 tasks | 8 hours |
| Phase 3 | 5 tasks | 6 hours |
| Phase 4 | 3 tasks | 3 hours |
| Phase 5 | 2 tasks | 2 hours |
| **Total** | **23 tasks** | **~23 hours** |