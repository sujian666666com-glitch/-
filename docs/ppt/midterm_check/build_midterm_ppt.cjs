const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const ROOT = '/Users/ik/Desktop/01_开发项目/zq/docs/ppt/midterm_check';
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });
const IMG = {
  setup: path.join(ROOT, 'image', '微信图片_20260318120215_869_17.png'),
  manageHome: path.join(ROOT, 'image', '微信图片_20260318120234_870_17.png'),
  matches: path.join(ROOT, 'image', '微信图片_20260318120248_871_17.png'),
  teams: path.join(ROOT, 'image', '微信图片_20260318120300_872_17.png'),
  stats: path.join(ROOT, 'image', '微信图片_20260318120334_873_17.png')
};

const C = {
  ink: '16302B',
  green: '1F5C4E',
  green2: '274B44',
  green3: '345E55',
  green4: '3F7064',
  sand: 'F5F1E8',
  white: 'FFFFFF',
  line: 'C8D4CF',
  text: '1F2933',
  muted: '5B6B73',
  amber: 'C7772D',
  light: 'EEF3F0',
  warm: 'FFF8EF'
};

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Codex';
pptx.company = 'OpenAI';
pptx.subject = '球类比赛成绩统计与显示管理系统设计中期检查汇报';
pptx.title = '球类比赛成绩统计与显示管理系统设计_中期检查汇报';
pptx.lang = 'zh-CN';

function addHeader(slide, title, subtitle, page) {
  slide.background = { color: C.sand };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 0.35, w: 1.5, h: 0.08,
    fill: { color: C.amber }, line: { color: C.amber, transparency: 100 }
  });
  slide.addText(title, {
    x: 0.6, y: 0.55, w: 9.8, h: 0.5,
    fontFace: 'Arial', fontSize: 23, bold: true, color: C.ink,
    margin: 0
  });
  slide.addText(subtitle, {
    x: 0.6, y: 1.05, w: 10.8, h: 0.28,
    fontFace: 'Arial', fontSize: 10.5, color: C.muted,
    margin: 0
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6, y: 7.0, w: 12.1, h: 0,
    line: { color: C.line, width: 1 }
  });
  slide.addText('广州城市理工学院｜本科毕业设计中期检查', {
    x: 0.6, y: 7.05, w: 4.2, h: 0.2,
    fontFace: 'Arial', fontSize: 8.5, color: C.muted, margin: 0
  });
  slide.addText(page, {
    x: 12.2, y: 7.05, w: 0.5, h: 0.2,
    fontFace: 'Arial', fontSize: 8.5, color: C.muted, align: 'right', margin: 0
  });
}

function addCard(slide, x, y, w, h, title, body, opts = {}) {
  const fill = opts.fill || C.white;
  const border = opts.border || C.line;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: border, width: 1 }
  });
  if (opts.accent) {
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.1, h,
      fill: { color: opts.accent }, line: { color: opts.accent, transparency: 100 }
    });
  }
  if (title) {
    slide.addText(title, {
      x: x + 0.18, y: y + 0.12, w: w - 0.3, h: 0.22,
      fontFace: 'Arial', fontSize: 13, bold: true, color: C.ink, margin: 0
    });
  }
  slide.addText(body, {
    x: x + 0.18, y: y + 0.42, w: w - 0.32, h: h - 0.5,
    fontFace: 'Arial', fontSize: opts.fontSize || 10.8, color: opts.textColor || C.text,
    margin: 0, breakLine: false, valign: 'top'
  });
}

function addMetric(slide, x, y, w, h, title, value, note, fill) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: fill, transparency: 100 }
  });
  slide.addText(title, {
    x: x + 0.18, y: y + 0.12, w: w - 0.3, h: 0.18,
    fontFace: 'Arial', fontSize: 11.5, bold: true, color: C.white, margin: 0
  });
  slide.addText(String(value), {
    x: x + 0.18, y: y + 0.38, w: w - 0.3, h: 0.36,
    fontFace: 'Arial', fontSize: 24, bold: true, color: C.white, margin: 0
  });
  slide.addText(note, {
    x: x + 0.18, y: y + 0.86, w: w - 0.28, h: 0.3,
    fontFace: 'Arial', fontSize: 8.8, color: 'DDE7E2', margin: 0
  });
}

function addTimelineStep(slide, x, y, w, h, phase, body) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, width: 1 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.08,
    fill: { color: C.amber }, line: { color: C.amber, transparency: 100 }
  });
  slide.addText(phase, {
    x: x + 0.12, y: y + 0.14, w: w - 0.2, h: 0.18,
    fontFace: 'Arial', fontSize: 10, bold: true, color: C.amber, margin: 0
  });
  slide.addText(body, {
    x: x + 0.12, y: y + 0.4, w: w - 0.22, h: h - 0.46,
    fontFace: 'Arial', fontSize: 10, color: C.text, margin: 0
  });
}

function addScreenshotCard(slide, x, y, w, h, title, subtitle, imagePath) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.line, width: 1 }
  });
  slide.addText(title, {
    x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.2,
    fontFace: 'Arial', fontSize: 11.5, bold: true, color: C.ink, margin: 0
  });
  slide.addText(subtitle, {
    x: x + 0.12, y: y + 0.32, w: w - 0.24, h: 0.22,
    fontFace: 'Arial', fontSize: 8.8, color: C.muted, margin: 0
  });
  slide.addImage({
    path: imagePath,
    x: x + 0.12, y: y + 0.58, w: w - 0.24, h: h - 0.7
  });
}

function slide1() {
  const slide = pptx.addSlide();
  slide.background = { color: C.sand };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.7, y: 0.55, w: 1.65, h: 0.09,
    fill: { color: C.amber }, line: { color: C.amber, transparency: 100 }
  });
  slide.addText('球类比赛成绩统计与显示管理系统设计', {
    x: 0.7, y: 0.9, w: 10.8, h: 0.5,
    fontFace: 'Arial', fontSize: 24, bold: true, color: C.ink, margin: 0
  });
  slide.addText('中期检查汇报｜赵庆｜人工智能 1 班｜指导教师：陈金山｜2026 年 3 月 18 日', {
    x: 0.7, y: 1.45, w: 11.5, h: 0.25,
    fontFace: 'Arial', fontSize: 11, color: C.muted, margin: 0
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 2.05, w: 7.75, h: 2.55,
    rectRadius: 0.08,
    fill: { color: C.ink }, line: { color: C.ink, transparency: 100 }
  });
  slide.addText('中期定位', {
    x: 1.0, y: 2.35, w: 1.1, h: 0.2,
    fontFace: 'Arial', fontSize: 10, bold: true, color: C.white,
    fill: { color: C.green3 }, margin: 0.05
  });
  slide.addText('已完成软件原型与管理查询闭环，当前重点是验证可运行性与后续扩展路径。', {
    x: 1.0, y: 2.8, w: 6.9, h: 0.95,
    fontFace: 'Arial', fontSize: 20, bold: true, color: C.white, margin: 0
  });
  slide.addText('本次汇报不将开题中的远期硬件、边缘网关、云端全链路目标视为既完成事实。', {
    x: 1.0, y: 4.05, w: 6.7, h: 0.35,
    fontFace: 'Arial', fontSize: 9.5, color: 'DDE7E2', margin: 0
  });
  addCard(
    slide, 8.75, 2.05, 3.35, 2.55, '本次汇报关注',
    '1. 选题背景与研究目标\n2. 当前系统设计与实现进度\n3. 阶段性成果与验证结果\n4. 存在问题与下一步计划',
    { accent: C.green }
  );
  addCard(
    slide, 0.7, 5.05, 11.9, 1.05, '',
    '项目当前形态：Node.js + Express + SQLite 后端，Vue 3 前端，覆盖实时计分、大屏显示、比赛目录、球队/球员档案、积分榜与技术统计查询。',
    { fill: C.light, border: C.light }
  );
}

function slide2() {
  const slide = pptx.addSlide();
  addHeader(slide, '一、研究背景与中期检查定位', '背景来自开题报告；阶段判断来自当前代码、OpenSpec 与运行验证。', '02');
  addCard(
    slide, 0.6, 1.65, 5.9, 3.2, '选题背景',
    '• 基层和高校赛事仍大量依赖纸质记录、Excel 汇总或单机记分牌，实时性、通用性和数据共享能力不足。\n• 不同球类规则差异明显，现有商业软件成本高、封闭性强，不适合教学与校内赛事推广。\n• 项目希望把“现场计分”和“赛后统计管理”连成一体，形成低成本、可扩展的赛事信息化原型。',
    { accent: C.green }
  );
  addCard(
    slide, 6.75, 1.65, 5.85, 3.2, '中期检查应回答的问题',
    '• 开题时提出的研究方向是否已转化为清晰、可运行的软件原型。\n• 核心链路是否已打通：实时计分、数据存储、历史查询、统计展示。\n• 哪些能力已完成，哪些仍处于后续计划，边界是否清晰。',
    {}
  );
  addCard(
    slide, 0.6, 5.15, 12.0, 1.15, '',
    '本阶段结论：已完成“成绩统计与管理”方向的软件 MVP，证明从单场比赛计分 demo 向“可查询、可浏览、可统计”的管理系统扩展是可行的；但硬件终端、边缘网关、云端对接等开题远期目标尚未进入最终完成态。',
    { fill: C.warm, border: C.warm }
  );
}

function slide3() {
  const slide = pptx.addSlide();
  addHeader(slide, '二、开题目标与本阶段聚焦范围', '对照开题报告中的总体目标，明确中期阶段的实际落点。', '03');
  addCard(
    slide, 0.6, 1.65, 5.85, 3.55, '开题报告总体目标',
    '• 构建低成本、跨球类、毫秒级、可扩展、开源的赛事成绩统计与显示管理系统。\n• 支持篮球、排球、羽毛球、乒乓球等多球类规则切换。\n• 形成端-边-云一体化的数据采集、展示与对接能力。\n• 兼顾现场实时显示、历史统计管理和标准化数据输出。',
    {}
  );
  addCard(
    slide, 6.75, 1.65, 5.85, 3.55, '中期已聚焦并实现的部分',
    '• 保留单场比赛实时计分与大屏展示链路。\n• 补齐历史比赛、球队、球员、积分榜和技术统计的统一查询能力。\n• 实现管理端页面，支持按“图书馆管理”式方式浏览与检索数据。\n• 建立 SQLite 主读、CSV 回退的数据访问策略。',
    { accent: C.green }
  );
  addCard(
    slide, 0.6, 5.5, 12.0, 0.8, '',
    '范围说明：中期汇报重点展示“软件架构和功能闭环已经成立”，而不是宣称已经完成硬件 BOM、边缘网关部署、国标 XML 对接和大规模压测。',
    { fill: C.light, border: C.light }
  );
}

function slide4() {
  const slide = pptx.addSlide();
  addHeader(slide, '三、当前系统设计与实现架构', '架构已从“单场实时计分 demo”扩展为“实时链路 + 管理查询”的双路径结构。', '04');
  addCard(
    slide, 0.6, 1.7, 4.0, 3.1, '前端层（Vue 3）',
    '• 现有流程：SetupView、ControlView、ScoreboardView\n• 新增管理入口：ManagementHome、Matches、MatchDetail、Teams、Statistics\n• 实时状态由 WebSocket 驱动，统计查询走独立页面与接口',
    {}
  );
  addCard(
    slide, 4.82, 1.7, 4.0, 3.1, '服务层（Express）',
    '• 保留 /api/matches/:id/score、/undo、/quarter 等实时写入接口\n• 新增 /api/manage/* 查询接口，分离读写职责\n• 通过 dataRepository.js 聚合统一数据访问逻辑',
    {}
  );
  addCard(
    slide, 9.04, 1.7, 3.56, 3.1, '数据层（SQLite + CSV）',
    '• brsms.db 作为主查询数据源\n• CSV 作为缺失数据时的回退与补充来源\n• 对比赛、球队、球员、积分榜、统计字段做归一化',
    {}
  );
  addCard(
    slide, 0.6, 5.15, 12.0, 1.15, '核心设计取舍',
    '不中断原有实时计分演示链路；不一次性重构成复杂 MVC；先把管理查询能力做成稳定的增量层，再为后续论文实现和功能扩展提供基础。',
    { accent: C.green }
  );
}

function slide5() {
  const slide = pptx.addSlide();
  addHeader(slide, '四、已完成的核心功能模块', '当前实现覆盖“实时计分”“管理查询”“统计展示”三类能力。', '05');
  addCard(
    slide, 0.6, 1.7, 4.0, 3.45, '实时计分链路',
    '• 创建比赛、主客队选择\n• 比分增加、撤销、节次切换\n• WebSocket 实时推送到大屏页面\n• 原有 /、/control/:matchId、/scoreboard/:matchId 路径保持可用',
    { accent: C.green }
  );
  addCard(
    slide, 4.82, 1.7, 4.0, 3.45, '管理查询能力',
    '• 比赛列表与比赛详情查看\n• 球队档案、球员档案基础查询\n• 数据源最小字段校验与无效记录过滤\n• 统一字段命名，降低前端按来源分支处理的复杂度',
    {}
  );
  addCard(
    slide, 9.04, 1.7, 3.56, 3.45, '统计展示能力',
    '• 积分榜展示\n• 比赛技术统计查看\n• 管理型统计页面与实时大屏展示分离\n• 形成“列表 + 详情 + 统计页”的信息架构',
    {}
  );
  addCard(
    slide, 0.6, 5.45, 12.0, 0.85, '',
    'OpenSpec 任务完成情况：数据源接入 3/3、管理查询接口 3/3、前端管理页面 4/4、联调与验收 3/3，共 13 个子项已完成。',
    { fill: C.warm, border: C.warm }
  );
}

function slide6() {
  const slide = pptx.addSlide();
  addHeader(slide, '五、阶段性成果与运行数据', '以下数据来自 2026 年 3 月 18 日本地运行接口 GET /api/manage/metadata 的实际返回。', '06');
  addMetric(slide, 0.6, 1.7, 2.88, 1.28, '比赛记录', 440, '支持列表浏览、详情查看与结果检索', C.ink);
  addMetric(slide, 3.65, 1.7, 2.88, 1.28, '球队档案', 40, '覆盖不同球类的队伍实体', C.green2);
  addMetric(slide, 6.7, 1.7, 2.88, 1.28, '球员档案', 540, '支持按队伍与条件筛选', C.green3);
  addMetric(slide, 9.75, 1.7, 2.88, 1.28, '技术统计', 4230, '作为比赛详情与统计页的数据基础', C.green4);
  addCard(
    slide, 0.6, 3.25, 3.35, 2.9, '前后端入口已形成闭环',
    '• 前端路由共 8 个\n• 管理查询接口共 6 组\n• 实时接口与管理接口已分层\n• 支持篮球、足球、排球、乒乓球、羽毛球等数据展示',
    {}
  );
  addCard(slide, 4.2, 3.25, 8.4, 2.9, '管理数据规模分布', '', {});
  slide.addChart(
    pptx.ChartType.bar,
    [{
      name: '数据量',
      labels: ['比赛', '球队', '球员', '积分榜', '技术统计'],
      values: [440, 40, 540, 40, 4230]
    }],
    {
      x: 4.45, y: 3.8, w: 7.7, h: 1.9,
      chartColors: [C.green],
      showTitle: false,
      showLegend: false,
      showCatAxisTitle: true,
      catAxisTitle: '数据类别',
      showValAxisTitle: true,
      valAxisTitle: '记录数',
      valAxisMinVal: 0,
      valAxisMaxVal: 4500,
      valAxisMajorUnit: 1000,
      catAxisLabelFontFace: 'Arial',
      valAxisLabelFontFace: 'Arial',
      dataLabelPosition: 'outEnd',
      dataLabelColor: C.ink,
      gridLine: { color: 'D6E0DB', width: 1 }
    }
  );
  slide.addText('说明：柱状图反映当前可用于管理端展示的数据规模，证明系统已不是仅能处理单场比赛的 demo。', {
    x: 4.45, y: 5.95, w: 7.65, h: 0.22,
    fontFace: 'Arial', fontSize: 8.6, color: C.muted, margin: 0
  });
}

function slide7() {
  const slide = pptx.addSlide();
  addHeader(slide, '六、系统页面与测试截图展示（一）', '补充实际页面截图，证明当前系统已经具备可演示的交互界面。', '07');
  addScreenshotCard(slide, 0.6, 1.65, 4.0, 2.25, '比赛创建入口', '创建比赛并进入实时计分流程', IMG.setup);
  addScreenshotCard(slide, 4.82, 1.65, 4.0, 2.25, '管理端总览页', '显示管理端数据概览与功能导航', IMG.manageHome);
  addScreenshotCard(slide, 9.04, 1.65, 3.56, 2.25, '比赛管理列表', '可查看比赛记录并进入详情', IMG.matches);
  addCard(
    slide, 0.6, 4.2, 12.0, 1.85, '页面说明',
    '这三张图对应了当前原型中最关键的入口链路：\n1. 从比赛创建页进入实时计分；\n2. 从管理端总览页进入统计与查询；\n3. 在比赛管理列表中浏览历史记录并查看详情。',
    { accent: C.green }
  );
}

function slide8() {
  const slide = pptx.addSlide();
  addHeader(slide, '七、系统页面与测试截图展示（二）', '继续补充管理查询与统计展示页面，增强中期检查的可视化证明。', '08');
  addScreenshotCard(slide, 0.6, 1.65, 6.0, 2.55, '球队 / 球员管理页', '支持球队档案与球员基础信息查询', IMG.teams);
  addScreenshotCard(slide, 6.85, 1.65, 5.75, 2.55, '积分榜与技术统计页', '展示统计结果与关键指标', IMG.stats);
  addCard(
    slide, 0.6, 4.5, 12.0, 1.55, '截图价值',
    '截图与前面的接口数据、路由结构相互印证：系统不仅已经完成后端数据组织，也已经把主要管理功能落到了可操作的前端页面上。',
    { fill: C.light, border: C.light }
  );
}

function slide9() {
  const slide = pptx.addSlide();
  addHeader(slide, '八、开发进度与验证情况', '中期检查不仅看页面数量，更看代码是否可运行、接口是否有真实数据响应。', '09');
  addCard(
    slide, 0.6, 1.7, 6.0, 3.55, '已完成验证',
    '• 前端构建：2026-03-18 执行 npm run build 成功，生成 dist 产物\n• 后端检查：执行 node --check index.js 与 node --check dataRepository.js 通过\n• 接口联调：管理端 metadata、matches、standings 接口可返回真实结构化数据\n• 兼容性：实时计分链路与新增管理链路并存，没有被新增功能替换掉',
    {}
  );
  addCard(
    slide, 6.85, 1.7, 5.75, 3.55, 'OpenSpec 验收对应关系',
    '• 数据源接入：SQLite 主读 + CSV 回退已实现\n• 管理查询接口：比赛、球队、球员、积分榜、统计接口已落地\n• 前端管理页面：管理首页、比赛、详情、球队/球员、统计页已接入路由\n• 联调验收：字段对齐、说明文档、回归验证已补齐',
    { accent: C.green }
  );
  addCard(
    slide, 0.6, 5.55, 12.0, 0.78, '阶段判断',
    '当前系统已达到“中期可演示、可验证、可继续扩展”的状态，能够支撑论文中关于软件原型、数据组织和管理端交互的中期汇报要求。',
    {}
  );
}

function slide10() {
  const slide = pptx.addSlide();
  addHeader(slide, '九、当前存在的问题与风险', '中期阶段已形成原型，但距离完整论文目标仍有明显差距。', '10');
  addCard(
    slide, 0.6, 1.7, 6.0, 3.55, '已识别问题',
    '• 当前数据库主表仍偏轻量，部分管理数据需要依赖 CSV 回退，后续需进一步稳定数据结构。\n• 系统暂以只读查询与展示为主，尚未进入复杂的数据编辑、导出和权限控制场景。\n• 列表页当前以基础筛选为主，若数据量继续增长，仍需补充分页、性能优化和更细粒度检索。',
    {}
  );
  addCard(
    slide, 6.85, 1.7, 5.75, 3.55, '与开题远期目标的差距',
    '• 硬件终端、边缘网关、云端服务协同尚未完整落地。\n• 国标/XML 对接、外部系统集成和大规模压测尚未展开。\n• 多角色权限、复杂规则引擎和标准化导出能力仍处于后续研究与实现阶段。',
    { accent: C.green }
  );
  addCard(
    slide, 0.6, 5.55, 12.0, 0.78, '',
    '风险控制思路：继续坚持“小步迭代、先软件闭环、再扩展外围能力”的方式推进，避免一次性大重构影响已完成的实时演示链路。',
    { fill: C.warm, border: C.warm }
  );
}

function slide11() {
  const slide = pptx.addSlide();
  addHeader(slide, '十、下一步工作计划', '后续工作将围绕“完善软件能力、补足论文支撑材料、准备结题验证”展开。', '11');
  addTimelineStep(slide, 0.6, 1.8, 2.9, 1.55, '阶段一', '继续完善数据层，增强字段映射、筛选能力和查询稳定性。');
  addTimelineStep(slide, 3.75, 1.8, 2.9, 1.55, '阶段二', '补充论文需要的系统设计、接口说明、关键页面与实验记录材料。');
  addTimelineStep(slide, 6.9, 1.8, 2.9, 1.55, '阶段三', '根据精力与范围，择优推进导出、可视化增强或更多规则扩展示例。');
  addTimelineStep(slide, 10.05, 1.8, 2.55, 1.55, '阶段四', '开展更系统的测试与总结，为后期答辩和论文定稿准备结果依据。');
  addCard(
    slide, 0.6, 3.75, 12.0, 2.05, '预期输出',
    '• 更稳定的管理端数据访问与页面展示效果\n• 更完整的测试记录、开发文档和论文材料\n• 围绕“中期原型 → 结题成果”的清晰演进路径',
    { accent: C.green }
  );
}

function slide12() {
  const slide = pptx.addSlide();
  addHeader(slide, '汇报总结', '当前已完成中期应有的软件原型与验证闭环，后续重点是做深、做稳、补齐论文支撑材料。', '12');
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9, y: 1.8, w: 11.8, h: 2.9,
    rectRadius: 0.08,
    fill: { color: C.ink }, line: { color: C.ink, transparency: 100 }
  });
  slide.addText('中期结论', {
    x: 1.25, y: 2.1, w: 1.0, h: 0.22,
    fontFace: 'Arial', fontSize: 10, bold: true, color: C.white,
    fill: { color: C.green3 }, margin: 0.05
  });
  slide.addText('已从“单场计分演示”推进到\n“可查询、可管理、可统计”的\n软件系统原型。', {
    x: 1.25, y: 2.55, w: 6.4, h: 1.25,
    fontFace: 'Arial', fontSize: 22, bold: true, color: C.white, margin: 0
  });
  slide.addText('后续将继续围绕数据稳定性、测试材料与论文成果表达展开完善。', {
    x: 1.25, y: 4.0, w: 5.7, h: 0.25,
    fontFace: 'Arial', fontSize: 10, color: 'DDE7E2', margin: 0
  });
  addCard(
    slide, 0.9, 5.15, 11.8, 0.95, '',
    '谢谢老师指导',
    { fill: C.light, border: C.light, fontSize: 15 }
  );
}

slide1();
slide2();
slide3();
slide4();
slide5();
slide6();
slide7();
slide8();
slide9();
slide10();
slide11();
slide12();

const outFile = path.join(OUT, '球类比赛成绩统计与显示管理系统设计_中期检查汇报.pptx');
pptx.writeFile({ fileName: outFile }).then(() => {
  console.log(outFile);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
