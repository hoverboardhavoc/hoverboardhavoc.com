import sharp from 'sharp';

const { data, info } = await sharp('/tmp/hh-logo.jpg')
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const px = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};

// Collect representative samples by category across the whole image
const flames = []; // high R, mid G, low B, bright
const neon = [];   // low R, high B, high-ish G, bright
const dark = [];   // low overall (chassis)

for (let y = 0; y < height; y += 2) {
  for (let x = 0; x < width; x += 2) {
    const [r, g, b] = px(x, y);
    const max = Math.max(r, g, b);
    if (r > 180 && g > 60 && g < 200 && b < 120 && r - b > 90) flames.push([r, g, b]);
    if (b > 180 && r < 150 && b - r > 60 && g > 120) neon.push([r, g, b]);
    if (max < 70) dark.push([r, g, b]);
  }
}

const avg = (arr) => {
  if (!arr.length) return [0, 0, 0];
  const s = arr.reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
  return s.map((v) => Math.round(v / arr.length));
};
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// brightest flame + brightest neon as accent picks
const brightest = (arr) => arr.slice().sort((a, b) => (b[0] + b[1] + b[2]) - (a[0] + a[1] + a[2]))[0] || [0, 0, 0];

console.log('samples  flames:', flames.length, ' neon:', neon.length, ' dark:', dark.length);
console.log('flame  avg :', hex(avg(flames)), avg(flames));
console.log('flame  hot :', hex(brightest(flames)), brightest(flames));
console.log('neon   avg :', hex(avg(neon)), avg(neon));
console.log('neon   hot :', hex(brightest(neon)), brightest(neon));
console.log('chassis avg:', hex(avg(dark)), avg(dark));
