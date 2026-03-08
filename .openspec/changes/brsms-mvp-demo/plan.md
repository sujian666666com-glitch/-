# Plan: BRSMS MVP Demo

## Implementation Phases

### Phase 1: 项目初始化（Day 1）

**目标**: 搭建项目骨架，验证技术栈

#### 1.1 后端项目初始化
- 创建 Spring Boot 项目（Maven）
- 配置 SQLite 数据源
- 初始化数据库 Schema
- 编写基础实体类

#### 1.2 前端项目初始化
- 创建 Vue3 项目（Vite）
- 配置 Pinia 状态管理
- 创建基础页面路由
- 配置 WebSocket 连接

---

### Phase 2: 核心后端开发（Day 2-3）

**目标**: 实现 REST API 和 WebSocket

#### 2.1 数据层
- [ ] Team 实体和 Repository
- [ ] Match 实体和 Repository
- [ ] Event 实体和 Repository

#### 2.2 业务层
- [ ] MatchService - 比赛管理
- [ ] ScoreService - 计分逻辑
- [ ] WebSocketService - 实时推送

#### 2.3 控制层
- [ ] MatchController - REST API
- [ ] ScoreWebSocketHandler - WebSocket 处理

---

### Phase 3: 前端开发（Day 4-5）

**目标**: 实现大屏显示和计分界面

#### 3.1 状态管理
- [ ] matchStore - 比赛数据状态
- [ ] websocketStore - WebSocket 连接管理

#### 3.2 页面组件
- [ ] ScoreboardView - 大屏显示页面
- [ ] ControlView - 计分控制页面
- [ ] MatchSetupView - 比赛设置页面

#### 3.3 通用组件
- [ ] ScoreDisplay - 比分显示组件
- [ ] TimerDisplay - 计时器组件
- [ ] TeamInfo - 球队信息组件

---

### Phase 4: 集成与测试（Day 6）

**目标**: 确保功能完整可用

#### 4.1 集成测试
- [ ] 端到端测试：创建比赛 → 计分 → 大屏显示
- [ ] WebSocket 连接稳定性测试
- [ ] 边界情况测试（撤销、节次切换）

#### 4.2 优化与修复
- [ ] 性能优化
- [ ] Bug 修复
- [ ] 代码清理

---

### Phase 5: 文档与交付（Day 7）

**目标**: 完善文档，准备演示

#### 5.1 文档
- [ ] README.md - 项目说明和启动指南
- [ ] API 文档
- [ ] 更新 OpenSpec 变更状态

#### 5.2 演示准备
- [ ] 准备演示数据
- [ ] 录制演示视频（可选）

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `backend/pom.xml` | Create | Maven 配置 |
| `backend/src/main/resources/schema.sql` | Create | 数据库初始化 |
| `backend/src/main/resources/application.yml` | Create | 应用配置 |
| `backend/src/main/java/com/brsms/**` | Create | 后端代码 |
| `frontend/package.json` | Create | NPM 配置 |
| `frontend/vite.config.ts` | Create | Vite 配置 |
| `frontend/src/**` | Create | 前端代码 |
| `README.md` | Create | 项目说明 |

---

## Technical Decisions

### TD1: 数据库选择
**决策**: 使用 SQLite 替代 MySQL/InfluxDB
**原因**: 本地 Demo 无需独立数据库服务，简化部署

### TD2: WebSocket 实现
**决策**: 使用 Spring WebSocket 而非 Netty
**原因**: 与 Spring Boot 集成更简单，满足 Demo 需求

### TD3: 前端状态管理
**决策**: 使用 Pinia 而非 Vuex
**原因**: Vue3 官方推荐，更轻量

---

## Rollout Plan

1. **本地开发环境验证**
   - 确保 JDK 17+ 和 Node.js 18+ 已安装
   - 后端启动在 8080 端口
   - 前端启动在 5173 端口

2. **功能验证**
   - 创建比赛
   - 记录得分
   - 验证大屏实时更新

3. **演示准备**
   - 准备两支球队数据
   - 模拟完整比赛流程