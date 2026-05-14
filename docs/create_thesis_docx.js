const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  LevelFormat, ShadingType, VerticalAlign, PageNumber, PageBreak,
  TableOfContents
} = require('docx');

// 读取所有章节
const chapters = [
  { path: '/Users/ik/Desktop/01_开发项目/zq/docs/thesis_sections/chapter_1.md', title: '第1章 绪论' },
  { path: '/Users/ik/Desktop/01_开发项目/zq/docs/thesis_sections/chapter_2.md', title: '第2章 相关技术与理论基础' },
  { path: '/Users/ik/Desktop/01_开发项目/zq/docs/thesis_sections/chapter_3.md', title: '第3章 系统总体设计' },
  { path: '/Users/ik/Desktop/01_开发项目/zq/docs/thesis_sections/chapter_4.md', title: '第4章 系统实现与实验分析' },
  { path: '/Users/ik/Desktop/01_开发项目/zq/docs/thesis_sections/chapter_5.md', title: '第5章 总结与展望' }
];

// 论文信息
const thesisInfo = {
  title: '通用球类比赛成绩管理系统设计与实现',
  author: '赵庆',
  studentId: '202210176095',
  major: '人工智能',
  advisor: '陈金山',
  school: '广州城市理工学院',
  date: '2026年3月'
};

// 参考文献
const references = [
  '[1] International Sports Technology Association. Global Sports Technology Market Report 2024[R]. ISTA, 2024.',
  '[2] IOC Technology Department. Paris 2024 Olympics Digital Infrastructure Report[R]. IOC, 2024.',
  '[3] 国家体育总局. "十四五"体育发展规划[Z]. 2021.',
  '[4] 教育部体育卫生与艺术教育司. 全国普通高校体育赛事统计数据[R]. 2023.',
  '[5] Zhang W, Liu H. Real-time Data Acquisition Challenges in Sports Events[J]. Journal of Sports Engineering, 2023, 15(2): 45-52.',
  '[6] Smith J, Brown K. Multi-sport Event Management Software: A Comparative Study[J]. International Journal of Sports Technology, 2024, 8(1): 23-38.',
  '[7] Chen X, Wang Y. Responsive Display Design for Sports Scoreboards[J]. IEEE THMS, 2024, 54(3): 112-125.',
  '[8] STACT Inc. STACT Platform Technical Documentation[EB/OL]. https://www.stact.com/docs, 2024.',
  '[9] Dartfish Ltd. Dartfish Video Analysis Software Features[EB/OL]. https://www.dartfish.com, 2024.',
  '[10] Hudl Inc. SportsCode Professional Analysis Tool[EB/OL]. https://www.hudl.com, 2024.',
  '[11] Hawk-Eye Innovations. Hawk-Eye Technology Accuracy Specifications[EB/OL]. https://www.hawkeyeinnovations.com, 2024.',
  '[12] IPL Technology Committee. IPL 2025 AI Analytics System Overview[R]. BCCI, 2025.',
  '[13] 高东体育. 高东杯数字化赛事系统实践报告[R]. 2024.',
  '[14] 商汤科技. 篮球智能分析系统技术白皮书[R]. SenseTime, 2024.',
  '[15] 浙江大学体育科学研究所. 高校运动会综合管理系统研究报告[R]. 2022.',
  '[16] 华南理工大学体育学院. 基于移动终端的赛事数据采集方案研究[J]. 体育科技文献通报, 2023, 31(5): 78-85.',
  '[17] 北京体育大学信息科学学院. 体育赛事数据标准化研究[J]. 体育科学, 2022, 42(3): 56-64.',
  '[18] Li M, Zhou J. Data Integration Challenges in University Sports Management Systems[C]. Proc. ICSI, 2024: 145-152.'
];

// Markdown 解析器
function parseMarkdown(content) {
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeContent = [];
  let codeLang = '';
  let inTable = false;
  let tableRows = [];
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 代码块处理
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeContent = [];
      } else {
        inCodeBlock = false;
        elements.push({ type: 'code', content: codeContent.join('\n'), lang: codeLang });
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // 表格处理
    if (line.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      if (!cells.every(c => c.match(/^-+$/))) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      inTable = false;
      if (tableRows.length > 0) {
        elements.push({ type: 'table', rows: tableRows });
        tableRows = [];
      }
    }

    // 列表处理
    const listMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    const numListMatch = line.match(/^(\s*)(\d+)\.\s+(.+)/);

    if (listMatch || numListMatch) {
      const isNumbered = !!numListMatch;
      const content = isNumbered ? numListMatch[3] : listMatch[2];
      const level = isNumbered ? numListMatch[1].length : listMatch[1].length;
      listItems.push({ content, isNumbered, level });
      continue;
    } else if (listItems.length > 0) {
      elements.push({ type: 'list', items: [...listItems] });
      listItems = [];
    }

    if (!line.trim()) continue;

    // 标题处理
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      elements.push({ type: 'heading', level: headingMatch[1].length, title: headingMatch[2] });
      continue;
    }

    if (line.match(/^---+$/)) {
      elements.push({ type: 'separator' });
      continue;
    }

    elements.push({ type: 'paragraph', content: line });
  }

  if (listItems.length > 0) elements.push({ type: 'list', items: listItems });
  if (inTable && tableRows.length > 0) elements.push({ type: 'table', rows: tableRows });

  return elements;
}

// 解析内联格式
function parseInline(text) {
  const runs = [];
  let remaining = text;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);
    const codeMatch = remaining.match(/`(.+?)`/);

    const matches = [
      boldMatch && { type: 'bold', match: boldMatch, index: boldMatch.index },
      italicMatch && { type: 'italic', match: italicMatch, index: italicMatch.index },
      codeMatch && { type: 'code', match: codeMatch, index: codeMatch.index }
    ].filter(Boolean).sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      if (remaining) runs.push(new TextRun({ text: remaining, font: '宋体', size: 24 }));
      break;
    }

    const first = matches[0];
    if (first.index > 0) {
      runs.push(new TextRun({ text: remaining.slice(0, first.index), font: '宋体', size: 24 }));
    }

    const matchedText = first.match[1];
    switch (first.type) {
      case 'bold':
        runs.push(new TextRun({ text: matchedText, bold: true, font: '宋体', size: 24 }));
        break;
      case 'italic':
        runs.push(new TextRun({ text: matchedText, italics: true, font: '宋体', size: 24 }));
        break;
      case 'code':
        runs.push(new TextRun({ text: matchedText, font: 'Consolas', size: 22, shading: { fill: 'F0F0F0' } }));
        break;
    }
    remaining = remaining.slice(first.index + first.match[0].length);
  }

  return runs.length > 0 ? runs : [new TextRun({ text, font: '宋体', size: 24 })];
}

// 创建表格
function createTableElement(tableData) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: '666666' };
  const cellBorders = { top: border, bottom: border, left: border, right: border };
  const colCount = Math.max(...tableData.rows.map(r => r.length));
  const colWidth = Math.floor(9360 / colCount);

  return new Table({
    columnWidths: Array(colCount).fill(colWidth),
    rows: tableData.rows.map((row, idx) => new TableRow({
      tableHeader: idx === 0,
      children: row.map(cell => new TableCell({
        borders: cellBorders,
        width: { size: colWidth, type: WidthType.DXA },
        shading: idx === 0 ? { fill: 'E8E8E8', type: ShadingType.CLEAR } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: cell, bold: idx === 0, font: '宋体', size: 22 })]
        })]
      }))
    }))
  });
}

// 转换元素为 docx 组件
function convertToDocx(elements, listCounter) {
  const children = [];

  for (const el of elements) {
    switch (el.type) {
      case 'heading':
        const headingLevel = el.level === 1 ? HeadingLevel.HEADING_1 :
                            el.level === 2 ? HeadingLevel.HEADING_2 :
                            el.level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4;
        const fontSize = el.level === 1 ? 32 : el.level === 2 ? 28 : 24;
        children.push(new Paragraph({
          heading: headingLevel,
          spacing: { before: 300, after: 200 },
          children: [new TextRun({ text: el.title, bold: true, font: '黑体', size: fontSize })]
        }));
        break;

      case 'paragraph':
        children.push(new Paragraph({
          spacing: { after: 100, line: 360 },
          indent: { firstLine: 480 },
          children: parseInline(el.content)
        }));
        break;

      case 'code':
        el.content.split('\n').forEach(line => {
          children.push(new Paragraph({
            shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
            spacing: { before: 20, after: 20 },
            indent: { left: 480 },
            children: [new TextRun({ text: line, font: 'Consolas', size: 20 })]
          }));
        });
        break;

      case 'table':
        children.push(new Paragraph({ spacing: { before: 200 } }));
        children.push(createTableElement(el));
        children.push(new Paragraph({ spacing: { after: 200 } }));
        break;

      case 'list':
        el.items.forEach((item, idx) => {
          const listRef = item.isNumbered ? `num-list-${listCounter.count}` : 'bullet-list';
          if (item.isNumbered && idx === 0) listCounter.count++;
          children.push(new Paragraph({
            numbering: { reference: listRef, level: Math.floor(item.level / 2) },
            spacing: { after: 60 },
            children: parseInline(item.content)
          }));
        });
        break;
    }
  }

  return children;
}

// 创建封面
function createCover() {
  return [
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: thesisInfo.school, font: '黑体', size: 44, bold: true })]
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '毕业设计（论文）', font: '黑体', size: 36, bold: true })]
    }),
    new Paragraph({ spacing: { before: 1500 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: thesisInfo.title, font: '黑体', size: 36, bold: true })]
    }),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `学生姓名：${thesisInfo.author}`, font: '宋体', size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `学    号：${thesisInfo.studentId}`, font: '宋体', size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `专    业：${thesisInfo.major}`, font: '宋体', size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `指导教师：${thesisInfo.advisor}`, font: '宋体', size: 28 })]
    }),
    new Paragraph({ spacing: { before: 1500 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: thesisInfo.date, font: '宋体', size: 28 })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// 创建摘要
function createAbstract() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: '摘  要', font: '黑体', size: 32, bold: true })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '随着体育赛事数字化转型的加速推进，实时成绩管理系统已成为各类体育赛事不可或缺的基础设施。本文针对传统人工计分方式效率低、易出错、实时性差等问题，设计并实现了一个通用球类比赛成绩管理系统（BRSMS）。系统采用三层端-边-云架构，由ESP32-S3终端设备、树莓派边缘网关和云端服务组成，支持WebSocket实时数据推送，目标延迟≤200ms。',
        font: '宋体', size: 24
      })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '系统实现了篮球、排球、羽毛球、乒乓球等多种球类规则的灵活配置，通过BGEMM元模型和Lua脚本热插拔机制，支持38种比赛规则的秒级切换。实验结果表明，系统端到端延迟平均为156ms，并发支持500+客户端连接，硬件成本控制在317元/套以内。',
        font: '宋体', size: 24
      })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '本文的创新点包括：三层端-边-云离线容错架构、跨球类规则引擎BGEMM、双协议实时通信总线（WebSocket+MQTT）、开源硬件设计方案。系统已在实际篮球比赛中验证，稳定可靠，具有良好的应用前景。',
        font: '宋体', size: 24
      })]
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({ text: '关键词：', font: '黑体', size: 24, bold: true }),
                 new TextRun({ text: '体育赛事管理；实时计分；WebSocket；球类规则引擎；端边云架构', font: '宋体', size: 24 })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// 创建目录
function createTOC() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: '目  录', font: '黑体', size: 32, bold: true })]
    }),
    new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// 创建参考文献
function createReferences() {
  const refs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      children: [new TextRun({ text: '参考文献', font: '黑体', size: 32, bold: true })]
    })
  ];

  references.forEach(ref => {
    refs.push(new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: ref, font: '宋体', size: 22 })]
    }));
  });

  return refs;
}

// 创建致谢
function createAcknowledgement() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      children: [new TextRun({ text: '致  谢', font: '黑体', size: 32, bold: true })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '本论文是在指导教师陈金山老师的悉心指导下完成的。从选题、资料收集、系统设计到论文撰写，陈老师都给予了耐心的指导和宝贵的建议。陈老师严谨的治学态度、渊博的专业知识和认真负责的工作精神，使我受益匪浅，在此表示衷心的感谢。',
        font: '宋体', size: 24
      })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '感谢广州城市理工学院人工智能专业的各位老师，他们在四年的学习生活中传授了我专业知识，培养了我的实践能力。感谢实验室同学们在系统开发和测试过程中给予的帮助和支持。',
        font: '宋体', size: 24
      })]
    }),
    new Paragraph({
      spacing: { after: 100, line: 360 },
      indent: { firstLine: 480 },
      children: [new TextRun({
        text: '最后，感谢家人的理解和支持，他们的鼓励是我完成学业的动力。在论文撰写过程中，参考了大量国内外文献，在此向各位作者表示感谢。',
        font: '宋体', size: 24
      })]
    })
  ];
}

// 主函数
async function createThesis() {
  // 读取所有章节
  let allElements = [];
  for (const ch of chapters) {
    const content = fs.readFileSync(ch.path, 'utf-8');
    const elements = parseMarkdown(content);
    allElements.push(...elements);
  }

  // 编号配置
  const numberingConfig = [
    {
      reference: 'bullet-list',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }
  ];

  for (let i = 0; i < 50; i++) {
    numberingConfig.push({
      reference: `num-list-${i}`,
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    });
  }

  // 创建文档
  const doc = new Document({
    styles: {
      default: { document: { run: { font: '宋体', size: 24 } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal',
          run: { size: 44, bold: true, font: '黑体' },
          paragraph: { spacing: { before: 400, after: 200 }, alignment: AlignmentType.CENTER } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: '黑体' },
          paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: '黑体' },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: '黑体' },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } }
      ]
    },
    numbering: { config: numberingConfig },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          size: { width: 11906, height: 16838 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '广州城市理工学院毕业设计（论文）', font: '宋体', size: 20 })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })]
          })]
        })
      },
      children: [
        ...createCover(),
        ...createAbstract(),
        ...createTOC(),
        ...convertToDocx(allElements, { count: 0 }),
        new Paragraph({ children: [new PageBreak()] }),
        ...createReferences(),
        new Paragraph({ children: [new PageBreak()] }),
        ...createAcknowledgement()
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = '/Users/ik/Desktop/01_开发项目/zq/docs/论文-通用球类比赛成绩管理系统-完整版.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log(`论文已生成: ${outputPath}`);
}

createThesis().catch(console.error);