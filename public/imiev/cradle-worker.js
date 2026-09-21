// Module Web Worker: runs OpenSCAD (WebAssembly) on cradle-v2.scad and posts
// back OFF text with a colour on every face, one pass for the cradle and,
// when asked, a second pass for the pack and sill ghosts.
//
// Messages in:  { type: 'render', id, scad, jackHeight, ghosts }
// Messages out: { type: 'status', text }
//               { type: 'result', id, cradle: ArrayBuffer, ghost: ArrayBuffer | null, echo, ms }
//               { type: 'error', id, text }

const WASM_URL = 'https://cdn.jsdelivr.net/npm/openscad-wasm@0.0.4/openscad.js';

let createOpenSCAD = null;
let sourceUrl = null;
let source = null;

const CRADLE = { key: 'cradle', show: { show_cradle: true, show_pack: false, show_car: false } };
const GHOST = { key: 'ghost', show: { show_cradle: false, show_pack: true, show_car: true } };

function status(text) {
	self.postMessage({ type: 'status', text });
}

async function loadModule() {
	if (!createOpenSCAD) {
		status('Loading OpenSCAD 2025.07 (14 MB)…');
		const mod = await import(WASM_URL);
		createOpenSCAD = mod.createOpenSCAD;
	}
}

async function loadSource(url) {
	if (source === null || sourceUrl !== url) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Could not fetch ${url} (${res.status})`);
		source = await res.text();
		sourceUrl = url;
	}
}

// One OpenSCAD run on a fresh instance: a second callMain on the same
// instance throws (checked in Node), and the module is cached by the
// browser after the first import, so a fresh instance is cheap.
async function runPass(pass, jackHeight) {
	const stderr = [];
	const o = await createOpenSCAD({
		print: () => {},
		printErr: (line) => stderr.push(String(line)),
	});
	const inst = o.getInstance();
	inst.FS.writeFile('/cradle.scad', source);
	const args = ['/cradle.scad', '-D', 'show_parts=false', '-D', 'show_dims=false'];
	for (const [name, value] of Object.entries(pass.show)) args.push('-D', `${name}=${value}`);
	args.push('-D', `jack_height=${jackHeight}`, '--backend=manifold', '--export-format=off', '-o', '/out.off');

	let rc;
	try {
		rc = inst.callMain(args);
	} catch (e) {
		throw new Error(`OpenSCAD crashed in the ${pass.key} pass: ${describe(e, stderr)}`);
	}
	if (rc !== 0) {
		throw new Error(`OpenSCAD exited with code ${rc} in the ${pass.key} pass: ${describe(null, stderr)}`);
	}
	let bytes;
	try {
		bytes = inst.FS.readFile('/out.off');
	} catch {
		throw new Error(`OpenSCAD wrote no output in the ${pass.key} pass: ${describe(null, stderr)}`);
	}
	// A standalone ArrayBuffer so it can be transferred.
	const buffer =
		bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
			? bytes.buffer
			: bytes.slice().buffer;
	return { buffer, stderr };
}

function describe(err, stderr) {
	const problems = stderr.filter((l) => /^(ERROR|WARNING)/.test(l));
	if (problems.length) return problems.slice(0, 3).join(' | ');
	if (err instanceof Error) return err.message;
	if (err !== null && err !== undefined) return `exception ${String(err)}`;
	return 'no diagnostics';
}

// ECHO: "text" -> text
function echoLines(stderr) {
	const out = [];
	for (const line of stderr) {
		if (!line.startsWith('ECHO: ')) continue;
		let text = line.slice('ECHO: '.length);
		if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
		out.push(text);
	}
	return out;
}

async function render(msg) {
	await loadModule();
	await loadSource(msg.scad);
	status('Rendering…');
	const t0 = performance.now(); // the passes only, not the module load
	const cradle = await runPass(CRADLE, msg.jackHeight);
	const transfer = [cradle.buffer];
	let ghost = null;
	if (msg.ghosts) {
		ghost = (await runPass(GHOST, msg.jackHeight)).buffer;
		transfer.push(ghost);
	}
	const ms = Math.round(performance.now() - t0);
	self.postMessage(
		{ type: 'result', id: msg.id, cradle: cradle.buffer, ghost, echo: echoLines(cradle.stderr), ms },
		transfer,
	);
}

self.onmessage = async (ev) => {
	const msg = ev.data;
	if (!msg || msg.type !== 'render') return;
	try {
		await render(msg);
	} catch (e) {
		self.postMessage({ type: 'error', id: msg.id, text: e instanceof Error ? e.message : String(e) });
	}
};
