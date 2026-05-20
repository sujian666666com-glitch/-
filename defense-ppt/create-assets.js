const sharp = require('sharp');
const path = require('path');

async function createGradient(filename, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1}"/>
        <stop offset="100%" style="stop-color:${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, filename));
}

async function main() {
  await createGradient('bg-dark.png', '#191A19', '#1E5128');
  await createGradient('bg-cover.png', '#1E5128', '#4E9F3D');
  console.log('Assets created');
}

main().catch(console.error);
