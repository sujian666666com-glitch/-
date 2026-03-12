## Why

当前 `brsms-demo` 只覆盖了单场比赛的实时计分与大屏展示，缺少对历史比赛、球队、球员、积分排名和技术统计的统一管理能力，无法支撑“像图书馆管理系统一样”按数据进行检索、维护和展示。现有数据文件已经落在 `backend/data` 目录下，现在补齐这一层管理能力，可以把演示型计分系统扩展成面向赛事管理的完整成绩统计系统。

## What Changes

- 新增基于现有 `backend/data` 数据源的比赛成绩数据管理能力，支持围绕比赛、球队、球员和统计记录进行统一查看。
- 新增面向管理端的成绩统计页面，提供列表化浏览、详情查看和基础筛选能力，而不仅是单场实时计分。
- 新增排名与技术统计展示能力，用于查看积分榜、比赛结果和关键统计指标。
- 补充数据导入/初始化约束，明确系统如何读取现有 SQLite/CSV 数据并形成稳定的数据访问入口。

## Capabilities

### New Capabilities
- `sports-data-source`: 定义系统如何读取、校验并组织 `backend/data` 下的比赛、球队、球员、积分榜和技术统计数据。
- `results-management`: 定义管理端如何按比赛、球队、球员维度浏览、查询和查看成绩数据。
- `statistics-display`: 定义积分榜、比赛结果汇总和关键技术统计的展示要求。

### Modified Capabilities
- 无

## Impact

- 后端：`brsms-demo/backend/index.js` 中现有 API 需要扩展为可读取历史数据和统计数据的管理接口。
- 数据层：`brsms-demo/backend/data/` 下的 `brsms.db` 与 CSV 文件将成为新功能的数据来源，需要统一读取策略。
- 前端：`brsms-demo/frontend/src/views/`、`services/`、`stores/`、`router/` 需要新增管理页、列表页和统计展示页。
- 交互范围：现有“创建比赛 / 计分控制台 / 大屏显示”流程保留，新功能作为补充的管理与查询入口接入。
