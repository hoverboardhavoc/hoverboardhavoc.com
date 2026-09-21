// Exports the precomputed coloured 3MF files for the cradle viewer in the
// Week 39 post, one per jack height, plus the pack and sill ghosts, using the
// desktop OpenSCAD snapshot (the Homebrew openscad is too old for coloured
// 3MF). Also refreshes the served copy of the SCAD source.
//
//   node scripts/export-cradle.mjs
//   OPENSCAD=/path/to/OpenSCAD CRADLE_SCAD=/path/to/cradle-v2.scad node scripts/export-cradle.mjs
//
// Writes public/imiev/cradle/h<height>.3mf, ghost-h<height>.3mf, index.json
// and public/imiev/cradle-v2.scad. Not part of the Astro build.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HEIGHTS = [95, 150, 200, 250, 300, 350, 390];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'imiev', 'cradle');
const SCAD_COPY = path.join(PROJECT_ROOT, 'public', 'imiev', 'cradle-v2.scad');

const OPENSCAD = process.env.OPENSCAD || '/Applications/OpenSCAD-snapshot.app/Contents/MacOS/OpenSCAD';
const CRADLE_SCAD = process.env.CRADLE_SCAD || '/Users/hoverboardhavoc/imeiv-battery-drop/cradle-v2.scad';

function fail(msg) {
	console.error(`export-cradle: ${msg}`);
	process.exit(1);
}

if (!fs.existsSync(OPENSCAD)) fail(`OpenSCAD binary not found at ${OPENSCAD} (set OPENSCAD=...)`);
if (!fs.existsSync(CRADLE_SCAD)) fail(`SCAD source not found at ${CRADLE_SCAD} (set CRADLE_SCAD=...)`);

const version = spawnSync(OPENSCAD, ['--version'], { encoding: 'utf8' });
if (version.status !== 0) fail(`${OPENSCAD} --version failed: ${version.stderr || version.error}`);
console.log((version.stdout + version.stderr).trim());

fs.mkdirSync(OUT_DIR, { recursive: true });

function exportOne(file, show, height) {
	const out = path.join(OUT_DIR, file);
	const args = [
		'--backend=manifold',
		'-D', 'show_parts=false',
		'-D', 'show_dims=false',
		'-D', `show_cradle=${show.cradle}`,
		'-D', `show_pack=${show.pack}`,
		'-D', `show_car=${show.car}`,
		'-D', `jack_height=${height}`,
		'-o', out,
		CRADLE_SCAD,
	];
	const t0 = Date.now();
	const r = spawnSync(OPENSCAD, args, { encoding: 'utf8' });
	if (r.status !== 0) fail(`OpenSCAD failed for ${file} (exit ${r.status}):\n${r.stderr}`);
	const problems = r.stderr.split('\n').filter((l) => /^(ERROR|WARNING)/.test(l));
	if (problems.length) fail(`OpenSCAD reported problems for ${file}:\n${problems.join('\n')}`);
	const size = fs.statSync(out).size;
	if (size === 0) fail(`OpenSCAD wrote an empty file for ${file}`);
	console.log(`${file.padEnd(16)} ${String(size).padStart(8)} bytes  ${Date.now() - t0} ms`);
}

for (const h of HEIGHTS) {
	exportOne(`h${h}.3mf`, { cradle: true, pack: false, car: false }, h);
	exportOne(`ghost-h${h}.3mf`, { cradle: false, pack: true, car: true }, h);
}

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify({ heights: HEIGHTS }) + '\n');
console.log(`index.json       ${String(fs.statSync(path.join(OUT_DIR, 'index.json')).size).padStart(8)} bytes`);

fs.copyFileSync(CRADLE_SCAD, SCAD_COPY);
console.log(`cradle-v2.scad   ${String(fs.statSync(SCAD_COPY).size).padStart(8)} bytes  (copied from ${CRADLE_SCAD})`);
