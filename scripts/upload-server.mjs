// Local-only asset upload server for Hoverboard Havoc.
// Serves a drag-and-drop page that writes files into ./incoming/.
// NOT part of the Astro build; runs only when you start it, local/LAN only.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEST = path.join(PROJECT_ROOT, 'incoming');
const PORT = 4330;
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB / file
const ALLOWED = new Set([
	'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp', '.tiff', '.heic', '.pdf',
]);

fs.mkdirSync(DEST, { recursive: true });

function sanitize(name) {
	const base = path.basename(String(name || '')).replace(/[^a-zA-Z0-9._-]/g, '_');
	return base.replace(/^\.+/, '') || 'file';
}

function uniquePath(name) {
	let p = path.join(DEST, name);
	if (!fs.existsSync(p)) return p;
	const ext = path.extname(name);
	const stem = name.slice(0, -ext.length || undefined);
	let i = 1;
	while (fs.existsSync(p)) p = path.join(DEST, `${stem}-${i++}${ext}`);
	return p;
}

function listFiles() {
	return fs
		.readdirSync(DEST, { withFileTypes: true })
		.filter((d) => d.isFile() && !d.name.startsWith('.'))
		.map((d) => {
			const st = fs.statSync(path.join(DEST, d.name));
			return { name: d.name, size: st.size, mtime: st.mtimeMs };
		})
		.sort((a, b) => b.mtime - a.mtime);
}

const PAGE = /* html */ `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Upload assets · Hoverboard Havoc</title>
<style>
  :root{--flame1:#ff5a00;--flame2:#ff8c1a;--flame3:#ffc777;--neon:#2fd3f0;--neon2:#9bf6ff;
    --bg:#100b0c;--bg2:#181213;--text:#f3ece8;--muted:#b3a59f;--border:rgba(255,255,255,.1)}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    background:var(--bg) radial-gradient(900px 380px at 50% -120px,rgba(255,110,20,.16),transparent 70%) no-repeat;
    color:var(--text);padding:2rem 1rem}
  .wrap{max-width:720px;margin:auto}
  h1{font-size:1.5rem;text-transform:uppercase;letter-spacing:.03em;margin:0 0 .25rem;
    background:linear-gradient(100deg,var(--flame1),var(--flame2) 55%,var(--flame3));
    -webkit-background-clip:text;background-clip:text;color:transparent}
  p.sub{color:var(--muted);margin:0 0 1.5rem}
  #drop{border:2px dashed var(--border);border-radius:14px;padding:2.5rem 1rem;text-align:center;
    background:var(--bg2);transition:.15s;cursor:pointer}
  #drop.hot{border-color:var(--flame2);box-shadow:0 0 0 3px rgba(255,140,26,.18) inset}
  #drop strong{color:var(--neon2)}
  .btn{display:inline-block;margin-top:1rem;padding:.6rem 1.3rem;border:0;border-radius:999px;
    font-weight:700;color:#1a0d00;cursor:pointer;
    background:linear-gradient(100deg,var(--flame1),var(--flame2) 55%,var(--flame3))}
  .muted{color:var(--muted);font-size:.9rem}
  ul{list-style:none;padding:0;margin:1.5rem 0 0}
  li{display:flex;align-items:center;gap:.8rem;padding:.5rem 0;border-bottom:1px solid var(--border)}
  li img{width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid var(--border);background:#000}
  li .name{flex:1;word-break:break-all}
  li .size{color:var(--muted);font-size:.85rem;white-space:nowrap}
  .bar{height:6px;border-radius:3px;background:var(--bg2);overflow:hidden;margin-top:.3rem}
  .bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--flame1),var(--neon))}
  h2{font-size:1rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);
    border-bottom:1px solid var(--border);padding-bottom:.3rem;margin:2rem 0 .5rem}
  a{color:var(--neon)}
</style></head><body><div class="wrap">
  <h1>Upload assets</h1>
  <p class="sub">Files are saved into <code>incoming/</code> in the project. Local use only.</p>
  <div id="drop">
    <div>Drag &amp; drop images here, or <strong>click to choose</strong></div>
    <div class="muted" style="margin-top:.4rem">jpg · png · gif · webp · avif · svg · pdf, up to 100&nbsp;MB each</div>
    <input id="file" type="file" multiple accept="image/*,.pdf" hidden>
  </div>
  <ul id="queue"></ul>
  <h2>In the incoming folder</h2>
  <ul id="existing"><li class="muted">loading…</li></ul>
</div>
<script>
const drop=document.getElementById('drop'),input=document.getElementById('file'),
  queue=document.getElementById('queue'),existing=document.getElementById('existing');
const fmt=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';
drop.onclick=()=>input.click();
['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('hot')}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('hot')}));
drop.addEventListener('drop',ev=>handle(ev.dataTransfer.files));
input.addEventListener('change',()=>handle(input.files));
function handle(files){[...files].forEach(upload)}
function upload(file){
  const li=document.createElement('li');
  const url=URL.createObjectURL(file);
  li.innerHTML='<img src="'+url+'"><div class="name">'+file.name+
    '<div class="bar"><i></i></div></div><span class="size">'+fmt(file.size)+'</span>';
  queue.prepend(li);
  const bar=li.querySelector('.bar>i');
  const xhr=new XMLHttpRequest();
  xhr.open('POST','/upload?name='+encodeURIComponent(file.name));
  xhr.upload.onprogress=e=>{if(e.lengthComputable)bar.style.width=(e.loaded/e.total*100)+'%'};
  xhr.onload=()=>{bar.style.width='100%';bar.style.background=xhr.status===200?'#2fd3f0':'#ff3b30';
    if(xhr.status!==200)li.querySelector('.name').firstChild.textContent=file.name+': '+xhr.responseText;
    refresh()};
  xhr.onerror=()=>{bar.style.background='#ff3b30'};
  xhr.send(file);
}
async function refresh(){
  const r=await fetch('/list');const items=await r.json();
  existing.innerHTML = items.length? '' : '<li class="muted">nothing yet</li>';
  for(const it of items){
    const li=document.createElement('li');
    li.innerHTML='<img src="/file?name='+encodeURIComponent(it.name)+'"><span class="name">'+
      it.name+'</span><span class="size">'+fmt(it.size)+'</span>';
    existing.append(li);
  }
}
refresh();
</script></body></html>`;

const server = http.createServer((req, res) => {
	const url = new URL(req.url, 'http://localhost');

	if (req.method === 'GET' && url.pathname === '/') {
		res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
		return res.end(PAGE);
	}

	if (req.method === 'GET' && url.pathname === '/list') {
		res.writeHead(200, { 'content-type': 'application/json' });
		return res.end(JSON.stringify(listFiles()));
	}

	if (req.method === 'GET' && url.pathname === '/file') {
		const name = sanitize(url.searchParams.get('name'));
		const p = path.join(DEST, name);
		if (!fs.existsSync(p)) { res.writeHead(404); return res.end('not found'); }
		res.writeHead(200);
		return fs.createReadStream(p).pipe(res);
	}

	if (req.method === 'POST' && url.pathname === '/upload') {
		const name = sanitize(url.searchParams.get('name'));
		const ext = path.extname(name).toLowerCase();
		if (!ALLOWED.has(ext)) { res.writeHead(415); return res.end('file type not allowed'); }
		const chunks = [];
		let size = 0;
		let aborted = false;
		req.on('data', (c) => {
			size += c.length;
			if (size > MAX_BYTES) { aborted = true; res.writeHead(413); res.end('too large'); req.destroy(); return; }
			chunks.push(c);
		});
		req.on('end', () => {
			if (aborted) return;
			const dest = uniquePath(name);
			fs.writeFile(dest, Buffer.concat(chunks), (err) => {
				if (err) { res.writeHead(500); return res.end('write failed'); }
				console.log('saved', path.basename(dest), `(${size} bytes)`);
				res.writeHead(200, { 'content-type': 'text/plain' });
				res.end(path.basename(dest));
			});
		});
		return;
	}

	res.writeHead(404);
	res.end('not found');
});

server.listen(PORT, '0.0.0.0', () => {
	console.log(`Upload server → http://localhost:${PORT}/  (saving to ${DEST})`);
});
