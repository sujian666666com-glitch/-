## ADDED Requirements

### Requirement: 截图文件规范命名
系统 SHALL 将 `docs/imge/` 下 5 张截图重命名为 `fig-4-1-manage-overview.png` 至 `fig-4-5-standings-table.png`。

#### Scenario: 重命名完成
- **WHEN** 执行图片重命名
- **THEN** 目录中不存在 `微信图片_*.png`，且 5 个 `fig-4-*` 文件均存在

### Requirement: 插图与图注
论文 SHALL 在第 4 章插入 5 张截图，图注置于图下方、居中，格式为「图4-x 标题（brsms-demo）」。

#### Scenario: 图4-1 插入
- **WHEN** 打开修订后 docx
- **THEN** 「数据集规模统计」之前可见图4-1 及对应图注

#### Scenario: 图注位置
- **WHEN** 检查任意插入图片
- **THEN** 图注段落位于图片段落之后，且居中对齐
