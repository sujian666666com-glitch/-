# Spec: BRSMS MVP Demo

## 1. 功能规格

### 1.1 核心功能

#### F1: 篮球比赛计分

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| F1.1 | 主队/客队得分（+1, +2, +3分） | P0 |
| F1.2 | 比分撤销（回退上一操作） | P0 |
| F1.3 | 节次管理（4节） | P0 |
| F1.4 | 比赛时间倒计时 | P1 |
| F1.5 | 暂停计数 | P2 |

#### F2: WebSocket 实时推送

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| F2.1 | 比分变化实时推送 | P0 |
| F2.2 | 节次变化推送 | P0 |
| F2.3 | 心跳保活机制 | P1 |

#### F3: 大屏显示界面

| 功能点 | 描述 | 优先级 |
|--------|------|--------|
| F3.1 | 实时比分显示 | P0 |
| F3.2 | 节次和时间显示 | P0 |
| F3.3 | 球队名称显示 | P0 |
| F3.4 | 响应式布局 | P1 |

### 1.2 API 规格

#### REST API

```yaml
# 赛事管理
POST   /api/matches           # 创建比赛
GET    /api/matches/{id}      # 获取比赛详情
PUT    /api/matches/{id}      # 更新比赛信息

# 计分操作
POST   /api/matches/{id}/score      # 记录得分
POST   /api/matches/{id}/undo       # 撤销操作
PUT    /api/matches/{id}/quarter    # 切换节次
```

#### WebSocket 消息格式

```json
// 服务端推送 - 比分更新
{
  "type": "score_update",
  "data": {
    "matchId": "string",
    "homeScore": 0,
    "guestScore": 0,
    "quarter": 1,
    "timeLeft": "10:00"
  },
  "timestamp": 1709656785000
}

// 客户端请求 - 记录得分
{
  "action": "score",
  "team": "home",
  "points": 2,
  "playerId": "optional"
}
```

## 2. 数据模型

### 2.1 数据库 Schema (SQLite)

```sql
-- 球队表
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 比赛表
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    home_team_id TEXT NOT NULL,
    guest_team_id TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    guest_score INTEGER DEFAULT 0,
    quarter INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending', -- pending, ongoing, finished
    match_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (guest_team_id) REFERENCES teams(id)
);

-- 事件表（操作记录）
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- score, undo, quarter_change
    team TEXT, -- home, guest
    value INTEGER,
    quarter INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
);
```

### 2.2 实体类定义

```java
// Match.java
public class Match {
    private String id;
    private Team homeTeam;
    private Team guestTeam;
    private int homeScore;
    private int guestScore;
    private int quarter;
    private MatchStatus status;
    private LocalDateTime matchTime;
}

// ScoreEvent.java
public class ScoreEvent {
    private String matchId;
    private TeamSide team; // HOME, GUEST
    private int points; // 1, 2, 3
    private String playerId; // optional
    private int quarter;
    private LocalDateTime eventTime;
}
```

## 3. 技术规格

### 3.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| JDK | 17+ | 运行环境 |
| Spring Boot | 3.2.x | Web 框架 |
| Spring WebSocket | 3.2.x | 实时通信 |
| Spring Data JPA | 3.2.x | 数据访问 |
| SQLite JDBC | 3.45.x | 数据库驱动 |
| Lombok | 1.18.x | 代码简化 |
| Maven | 3.9.x | 构建工具 |

### 3.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Vue | 3.4.x | 前端框架 |
| Vite | 5.x | 构建工具 |
| Pinia | 2.x | 状态管理 |
| WebSocket API | Native | 实时通信 |

### 3.3 项目结构

```
brsms-demo/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/brsms/
│   │       ├── controller/     # REST & WebSocket 控制器
│   │       ├── service/        # 业务逻辑
│   │       ├── repository/     # 数据访问
│   │       ├── entity/         # 实体类
│   │       ├── dto/            # 数据传输对象
│   │       ├── config/         # 配置类
│   │       └── websocket/      # WebSocket 处理
│   ├── src/main/resources/
│   │   ├── application.yml     # 配置文件
│   │   └── schema.sql          # 数据库初始化
│   └── pom.xml
│
├── frontend/                   # Vue3 前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 通用组件
│   │   ├── stores/             # Pinia 状态
│   │   ├── services/           # API & WebSocket
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                   # 启动说明
```

## 4. 非功能规格

### 4.1 性能要求

| 指标 | 目标值 | 说明 |
|------|--------|------|
| WebSocket 延迟 | ≤ 200ms | 从得分操作到大屏显示 |
| 并发连接 | ≥ 10 | 本地 Demo 场景 |
| 启动时间 | ≤ 30s | 应用启动到可用 |

### 4.2 质量要求

| 要求 | 描述 |
|------|------|
| 代码规范 | 遵循开发文档中的代码规范 |
| 错误处理 | 统一异常响应格式 |
| 日志记录 | 关键操作记录日志 |