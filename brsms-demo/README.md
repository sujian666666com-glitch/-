# BRSMS Demo - 球类比赛成绩统计系统

本地可运行的最小 MVP 版本。

## 快速启动

### 环境要求

- JDK 17+
- Node.js 18+
- Maven 3.9+

### 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端运行在 http://localhost:8080

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 功能

- 篮球比赛计分（+1/+2/+3 分）
- WebSocket 实时比分推送
- 大屏显示界面
- 撤销操作
- 节次切换（4节）

## 项目结构

```
brsms-demo/
├── backend/          # Spring Boot 后端
│   ├── src/main/java/com/brsms/
│   │   ├── controller/   # REST API
│   │   ├── service/      # 业务逻辑
│   │   ├── repository/   # 数据访问
│   │   ├── entity/       # 实体类
│   │   └── config/       # WebSocket 配置
│   └── pom.xml
│
├── frontend/         # Vue3 前端
│   ├── src/
│   │   ├── views/        # 页面
│   │   ├── stores/       # Pinia 状态
│   │   └── services/     # API 服务
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

## 使用流程

1. 打开 http://localhost:5173
2. 选择主队和客队，点击"开始比赛"
3. 进入计分控制台，点击得分按钮
4. 点击"大屏显示"查看实时比分