## Context

论文 docx 由 Word 生成，含 13 张无编号表格、封面 1 张图、正文无系统截图；第五章含 5.1～5.4 多级结构。截图位于 `docs/imge/`，对应 brsms-demo 管理端五个页面。

## Goals / Non-Goals

**Goals**
- 规范图表编号（表在上、图在下）
- 插入 5 张管理端截图至第 4 章
- 第五章精简为一段正文

**Non-Goals**
- 不修改第 1～4 章论述文字（除插入引用句）
- 不补截大屏/架构图
- 不调整参考文献格式

## Decisions

1. **编辑方式**：使用 python-docx + OOXML 段落插入，而非 pandoc 往返（系统未装 pandoc）。
2. **图片尺寸**：最大宽度 14cm，按比例缩放，避免溢出页边距。
3. **图注后缀**：统一标注「（brsms-demo）」以区分正文 ESP32/InfluxDB 描述与 demo 实现。
4. **第五章**：删除 P519～P552 全部子节，保留标题 + 一段约 350 字综合总结。
5. **表格数量**：实际检测到 13 张表（含「管理查询接口（续）」），编号表3-1、表4-1～表4-12。

## Risks / Trade-offs

- [Word 自动目录 stale] → 用户打开 docx 后按 F9 更新目录
- [python-docx 插图 rId] → 由库自动管理 relationships，pack 后验证可打开
- [第五章删减丢细节] → 单段保留成果/创新/不足/展望四要素

## Migration Plan

1. 备份 `.docx.bak`
2. 重命名 PNG
3. 运行 `scripts/update_thesis_formatting.py`
4. grep 验证编号；LibreOffice 转 PDF 目视检查

## Open Questions

- 无
