# BRSMS Demo - 球类比赛成绩统计系统

本地可运行的最小 MVP 版本。

## 快速启动

### 环境要求

- Node.js 18+

### 启动后端

```bash
cd backend
npm install
npm run dev
```

默认后端运行在 http://localhost:3000

如果 `3000` 端口被占用，可指定其他端口：

```bash
cd backend
PORT=3300 npm run dev
```

### 启动前端

```bash
cd frontend
npm install
# 如后端不是 3000，可在启动前指定：
# VITE_API_ORIGIN=http://localhost:3300 VITE_WS_ORIGIN=ws://localhost:3300
npm run dev
```

前端运行在 http://localhost:5173

## 功能

- 篮球比赛计分（+1/+2/+3 分）
- WebSocket 实时比分推送
- 大屏显示界面
- 撤销操作
- 节次切换（4节）
- 比赛目录管理
- 球队与球员档案查询
- 积分榜与技术统计展示

## 项目结构

```
brsms-demo/
├── backend/              # Node.js + Express 后端
│   ├── index.js          # 实时计分与管理查询 API
│   ├── dataRepository.js # SQLite / CSV 统一数据访问层
│   ├── data/             # brsms.db 与 CSV 数据源
│   └── package.json
│
├── frontend/             # Vue3 前端
│   ├── src/
│   │   ├── views/        # 实时计分页与管理页
│   │   ├── stores/       # Pinia 状态
│   │   └── services/     # API / WebSocket 服务
│   └── package.json
│
└── README.md
```

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/matches` | POST | 创建比赛 |
| `/api/matches/{id}` | GET | 获取比赛 |
| `/api/matches/{id}/score` | POST | 记录得分 |
| `/api/matches/{id}/undo` | POST | 撤销操作 |
| `/api/matches/{id}/quarter` | PUT | 切换节次 |
| `/api/manage/metadata` | GET | 获取管理端数据概览 |
| `/api/manage/matches` | GET | 查询比赛目录 |
| `/api/manage/matches/{id}` | GET | 查询比赛详情与技术统计 |
| `/api/manage/teams` | GET | 查询球队档案 |
| `/api/manage/players` | GET | 查询球员档案 |
| `/api/manage/standings` | GET | 查询积分榜 |
| `/api/manage/statistics` | GET | 查询技术统计 |

## 数据来源

- 主数据源：`backend/data/brsms.db`
- 回退数据源：`backend/data/matches(1).csv`
- 回退数据源：`backend/data/teams(1).csv`
- 回退数据源：`backend/data/players(1).csv`
- 回退数据源：`backend/data/standings(1).csv`
- 回退数据源：`backend/data/match_statistics(1).csv`

管理端优先读取 SQLite；当所需管理数据在 SQLite 中不存在时，自动回退到 CSV 并完成字段归一化。

## 使用流程

1. 打开 http://localhost:5173
2. 选择主队和客队，点击"开始比赛"
3. 进入计分控制台，点击得分按钮
4. 点击"大屏显示"查看实时比分
5. 点击“进入成绩管理”进入 `/manage`，查看比赛目录、球队/球员档案、积分榜与技术统计

## 管理端页面

- `/manage`：数据总览与最小字段说明
- `/manage/matches`：比赛目录与详情入口
- `/manage/teams`：球队档案与球员档案查询
- `/manage/statistics`：积分榜与技术统计展示

## 开发验证

### 前端构建

```bash
cd frontend
npm run build
```

### 后端启动检查

```bash
cd backend
node --check index.js
PORT=3300 node index.js
```

### 管理接口快速验证

```bash
curl http://localhost:3300/api/manage/metadata
curl "http://localhost:3300/api/manage/matches?query=M00001"
curl "http://localhost:3300/api/manage/standings"
```
