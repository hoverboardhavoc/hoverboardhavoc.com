import sharp from 'sharp';

const SRC = 'incoming/P_20240602_205217.jpg';
const OUT = 'src/assets/about/hero-hoverboards.jpg';
const CHECK = '/tmp/hh-prev/hero-check.jpg';

// Oriented base
const base = await sharp(SRC).rotate().toBuffer();
const { width, height } = await sharp(base).metadata();

// Face region (located from the zoom crop): centre ~ (2078, 1114)
const cx = 2078, cy = 1114, rx = 195, ry = 230;
const pad = 40;
const left = Math.max(0, cx - rx - pad);
const top = Math.max(0, cy - ry - pad);
const w = rx * 2 + pad * 2;
const h = ry * 2 + pad * 2;

// Pixelate + blur the face patch so detail can't be recovered
const small = await sharp(base)
	.extract({ left, top, width: w, height: h })
	.resize({ width: 16 }) // crush detail
	.toBuffer();
const patch = await sharp(small)
	.resize({ width: w, height: h, kernel: 'nearest' }) // blow back up = mosaic
	.blur(18) // soften the mosaic edges
	.toBuffer();

// Feathered elliptical alpha mask so the blur blends in (no hard box)
const mask = await sharp(
	Buffer.from(
		`<svg width="${w}" height="${h}"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${rx}" ry="${ry}" fill="white"/></svg>`,
	),
)
	.blur(22)
	.toBuffer();

const maskedPatch = await sharp(patch)
	.composite([{ input: mask, blend: 'dest-in' }])
	.png()
	.toBuffer();

// Composite the blurred face back on, then crop to a 2:1 hero and export
const anonymized = await sharp(base)
	.composite([{ input: maskedPatch, left, top }])
	.toBuffer();

const cropTop = Math.round((height - width / 2) / 2); // centre a 2:1 slice
await sharp(anonymized)
	.extract({ left: 0, top: cropTop, width, height: Math.round(width / 2) })
	.resize({ width: 2000 })
	.jpeg({ quality: 84, mozjpeg: true })
	.toFile(OUT);

// Small preview to eyeball the blur
await sharp(anonymized).resize({ width: 800 }).toFile(CHECK);
console.log('wrote', OUT, 'and preview', CHECK);
