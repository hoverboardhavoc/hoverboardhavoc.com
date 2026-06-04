import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SVG = 'public/favicon.svg';
const PUB = 'public';
const svg = fs.readFileSync(SVG);

async function png(size) {
	return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

// Standalone PNG icons
const outputs = {
	'favicon-16.png': 16,
	'favicon-32.png': 32,
	'favicon-48.png': 48,
	'apple-touch-icon.png': 180,
	'icon-192.png': 192,
	'icon-512.png': 512,
};
const buffers = {};
for (const [name, size] of Object.entries(outputs)) {
	const buf = await png(size);
	buffers[size] = buf;
	fs.writeFileSync(path.join(PUB, name), buf);
	console.log('wrote', name, size + 'x' + size, (buf.length / 1024).toFixed(1) + 'KB');
}

// Assemble a multi-size .ico (PNG-embedded) from 16/32/48
function buildIco(pngs) {
	const count = pngs.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: icon
	header.writeUInt16LE(count, 4);
	const entries = [];
	const images = [];
	let offset = 6 + count * 16;
	for (const { size, buf } of pngs) {
		const e = Buffer.alloc(16);
		e.writeUInt8(size >= 256 ? 0 : size, 0); // width
		e.writeUInt8(size >= 256 ? 0 : size, 1); // height
		e.writeUInt8(0, 2); // palette
		e.writeUInt8(0, 3); // reserved
		e.writeUInt16LE(1, 4); // color planes
		e.writeUInt16LE(32, 6); // bits per pixel
		e.writeUInt32LE(buf.length, 8);
		e.writeUInt32LE(offset, 12);
		offset += buf.length;
		entries.push(e);
		images.push(buf);
	}
	return Buffer.concat([header, ...entries, ...images]);
}

const ico = buildIco([
	{ size: 16, buf: buffers[16] },
	{ size: 32, buf: buffers[32] },
	{ size: 48, buf: buffers[48] },
]);
fs.writeFileSync(path.join(PUB, 'favicon.ico'), ico);
console.log('wrote favicon.ico', (ico.length / 1024).toFixed(1) + 'KB');

// Preview tile to eyeball
await sharp(svg, { density: 384 }).resize(256, 256).png().toFile('/tmp/hh-prev/favicon-256.png');
const strip = await sharp({ create: { width: 16 + 32 + 48 + 12, height: 48, channels: 4, background: '#222' } })
	.png().toBuffer();
console.log('preview at /tmp/hh-prev/favicon-256.png');
