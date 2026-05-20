## ADDED Requirements

### Requirement: 表格表题编号
论文中全部 Word 表格 SHALL 在表格上方添加居中表题，格式为「表x-y 标题」。

#### Scenario: 第三章表格
- **WHEN** 查看 §3.3.3 审计日志表
- **THEN** 表格上方显示「表3-1 审计日志表结构」

#### Scenario: 第四章表格
- **WHEN** 查看第 4 章全部表格
- **THEN** 表题依次为表4-1 至表4-12，且均位于对应表格上方
