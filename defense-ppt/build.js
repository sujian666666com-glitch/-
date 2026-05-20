const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const html2pptx = require('./html2pptx.js');

const SLIDES = [
  '01-cover.html',
  '02-outline.html',
  '03-background.html',
  '04-status.html',
  '05-goals.html',
  '06-architecture.html',
  '07-bgemm.html',
  '08-tech.html',
  '09-demo-overview.html',
  '10-demo-manage.html',
  '11-demo-data.html',
  '12-results.html',
  '13-compare.html',
  '14-innovation.html',
  '15-future.html',
  '16-thanks.html',
];

const IMAGE_MAP = {
  '09-demo-overview.html': [{ id: 'screenshot', file: 'fig-4-1-manage-overview.png' }],
  '10-demo-manage.html': [
    { id: 'shot-left', file: 'fig-4-2-match-directory.png' },
    { id: 'shot-right', file: 'fig-4-3-match-score-entry.png' },
  ],
  '11-demo-data.html': [
    { id: 'shot-left', file: 'fig-4-4-team-archives.png' },
    { id: 'shot-right', file: 'fig-4-5-standings-table.png' },
  ],
};

function addImages(slide, placeholders, images, assetsDir) {
  for (const img of images) {
    const ph = placeholders.find((p) => p.id === img.id);
    if (!ph) continue;
    const imgPath = path.join(assetsDir, img.file);
    if (!fs.existsSync(imgPath)) {
      console.warn('Missing image:', imgPath);
      continue;
    }
    slide.addImage({ path: imgPath, x: ph.x, y: ph.y, w: ph.w, h: ph.h });
  }
}

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '赵庆';
  pptx.title = '球类比赛成绩统计与显示管理系统 - 毕业答辩';
  pptx.subject = 'BRSMS 毕业设计答辩';

  const root = __dirname;
  const slidesDir = path.join(root, 'slides');
  const assetsDir = path.join(root, 'assets');
  const outPath = path.join(root, '..', '球类比赛成绩统计与显示管理系统-毕业答辩.pptx');

  for (const file of SLIDES) {
    const htmlPath = path.join(slidesDir, file);
    const { slide, placeholders } = await html2pptx(htmlPath, pptx);

    if (IMAGE_MAP[file]) {
      addImages(slide, placeholders, IMAGE_MAP[file], assetsDir);
    }

    if (file === '12-results.html' && placeholders.length > 0) {
      slide.addChart(pptx.charts.BAR, [{
        name: '延迟(ms)',
        labels: ['P50', 'P95', 'P99', '平均'],
        values: [120, 186, 242, 156],
      }], {
        ...placeholders[0],
        barDir: 'col',
        showTitle: false,
        showLegend: false,
        showCatAxisTitle: true,
        catAxisTitle: '指标',
        showValAxisTitle: true,
        valAxisTitle: '延迟 (ms)',
        valAxisMaxVal: 300,
        valAxisMinVal: 0,
        valAxisMajorUnit: 50,
        chartColors: ['4E9F3D'],
        dataLabelPosition: 'outEnd',
        dataLabelColor: '333333',
      });
    }
  }

  await pptx.writeFile({ fileName: outPath });
  console.log('Created:', outPath);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
