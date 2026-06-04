import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'incoming';
const OUT = 'src/assets/about';
fs.mkdirSync(OUT, { recursive: true });

const files = fs
	.readdirSync(SRC)
	.filter((f) => /\.(jpe?g|png|webp|heic|tiff?)$/i.test(f))
	.sort();

let n = 0;
for (const f of files) {
	n++;
	const out = path.join(OUT, `about-${n}.jpg`);
	const meta = await sharp(path.join(SRC, f))
		.rotate() // auto-orient from EXIF, then bake in
		.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: 82, mozjpeg: true }) // re-encode; metadata (GPS/EXIF) dropped by default
		.toFile(out);
	console.log(`${f}  ->  ${out}  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)}KB  ${meta.width >= meta.height ? 'landscape' : 'portrait'}`);
}
console.log(`\nProcessed ${n} image(s).`);
