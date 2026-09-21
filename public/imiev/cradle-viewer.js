// Main-thread module for the .scad-viewer block.
//
// Tier 1 (default): when the block scrolls near the viewport, load three.js
// and the precomputed coloured 3MF for the collapsed jack from
// /imiev/cradle/, and show it in place of the static image. The slider steps
// through the precomputed heights.
//
// Tier 2 (button): a module worker runs OpenSCAD in WebAssembly and exports
// OFF with per-face colours; the slider becomes continuous.

const LIVE_MIN = 95;
const LIVE_MAX = 390;
const LIVE_STEP = 5;
const DEBOUNCE_MS = 250;
const GHOST_OPACITY = 0.3;

function findFallbackImage(viewer) {
	for (let el = viewer.previousElementSibling; el; el = el.previousElementSibling) {
		if (el.tagName === 'IMG') return el;
		if (el.tagName === 'P' || el.tagName === 'FIGURE') {
			const img = el.querySelector('img');
			if (img) return img;
			return null;
		}
	}
	return null;
}

function hideFallbackImage(img) {
	if (!img) return;
	const parent = img.parentElement;
	const onlyChild =
		parent &&
		(parent.tagName === 'P' || parent.tagName === 'FIGURE') &&
		parent.children.length === 1 &&
		parent.textContent.trim() === '';
	(onlyChild ? parent : img).hidden = true;
}

// OFF text -> { positions: Float32Array, colors: Float32Array, colourCount }
// Accepts the counts on the "OFF" line or on the next line. Faces are
// "n i0 i1 ... [r g b [a]]"; colours > 1 are 0..255 integers.
function parseOFF(text) {
	const lines = text.split('\n');
	let li = 0;
	const nextLine = () => {
		while (li < lines.length) {
			const l = lines[li++].trim();
			if (l !== '' && l[0] !== '#') return l;
		}
		return null;
	};
	let header = nextLine();
	if (header === null || !header.startsWith('OFF')) throw new Error('not an OFF file');
	let counts = header.slice(3).trim();
	if (counts === '') counts = nextLine() || '';
	const [nv, nf] = counts.split(/\s+/).map(Number);
	if (!(nv >= 0 && nf >= 0)) throw new Error('bad OFF header');

	const verts = new Float32Array(nv * 3);
	for (let i = 0; i < nv; i++) {
		const l = nextLine();
		if (l === null) throw new Error('OFF truncated in vertices');
		const p = l.split(/\s+/);
		verts[i * 3] = +p[0];
		verts[i * 3 + 1] = +p[1];
		verts[i * 3 + 2] = +p[2];
	}

	const positions = [];
	const colors = [];
	const seen = new Set();
	for (let f = 0; f < nf; f++) {
		const l = nextLine();
		if (l === null) throw new Error('OFF truncated in faces');
		const p = l.split(/\s+/).map(Number);
		const n = p[0];
		let r = 0.8,
			g = 0.8,
			b = 0.8;
		if (p.length >= 1 + n + 3) {
			r = p[1 + n];
			g = p[2 + n];
			b = p[3 + n];
			if (r > 1 || g > 1 || b > 1) {
				r /= 255;
				g /= 255;
				b /= 255;
			}
		}
		seen.add(`${r},${g},${b}`);
		for (let k = 1; k < n - 1; k++) {
			for (const idx of [p[1], p[1 + k], p[2 + k]]) {
				positions.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
				colors.push(r, g, b);
			}
		}
	}
	return { positions: new Float32Array(positions), colors: new Float32Array(colors), colourCount: seen.size };
}

function setupViewer(viewer) {
	const startButton = viewer.querySelector('.scad-viewer-start');
	const statusLine = viewer.querySelector('.scad-viewer-status');
	const scadUrl = viewer.dataset.scad;
	if (!startButton || !statusLine || !scadUrl) return;
	const baseUrl = scadUrl.replace(/cradle-v2\.scad$/, 'cradle/');

	const setStatus = (text) => {
		statusLine.textContent = text;
	};

	let three = null; // { THREE, ThreeMFLoader, OrbitControls }
	let scene = null; // built by buildScene on first model
	let heights = []; // precomputed jack heights
	let height = 95; // current jack height in mm
	let mode = 'precomputed';
	let ghostsOn = false;
	const modelCache = new Map(); // height -> Promise<Group> (precomputed cradle)
	const ghostCache = new Map(); // height -> Promise<Group> (precomputed ghosts)

	// ---- tier 1: precomputed
	async function loadThree() {
		if (three) return three;
		const [THREE, mf, orbit] = await Promise.all([
			import('three'),
			import('three/addons/loaders/3MFLoader.js'),
			import('three/addons/controls/OrbitControls.js'),
		]);
		three = { THREE, ThreeMFLoader: mf.ThreeMFLoader, OrbitControls: orbit.OrbitControls };
		return three;
	}

	async function fetch3MF(file) {
		const res = await fetch(baseUrl + file);
		if (!res.ok) throw new Error(`Could not fetch ${file} (${res.status})`);
		return new three.ThreeMFLoader().parse(await res.arrayBuffer());
	}

	// The promise is cached, so two quick requests for one height (the
	// slider's input and change events) share one fetch.
	function cached(cache, h, file) {
		if (!cache.has(h)) {
			const p = fetch3MF(file);
			p.catch(() => cache.delete(h));
			cache.set(h, p);
		}
		return cache.get(h);
	}
	const precomputedModel = (h) => cached(modelCache, h, `h${h}.3mf`);
	const precomputedGhost = (h) => cached(ghostCache, h, `ghost-h${h}.3mf`);

	let showSeq = 0; // ignore stale precomputed loads
	async function showPrecomputed(h) {
		const seq = ++showSeq;
		const model = await precomputedModel(h);
		const ghost = ghostsOn ? await precomputedGhost(h) : null;
		if (seq !== showSeq || mode !== 'precomputed') return;
		height = h;
		scene.setCradle(model, 'precomputed');
		scene.setGhost(ghost);
		setStatus(`Model: cradle-v2.scad, jack at ${h} mm`);
	}

	async function startPrecomputed() {
		setStatus('Loading model…');
		try {
			await loadThree();
			const res = await fetch(baseUrl + 'index.json');
			if (!res.ok) throw new Error(`Could not fetch index.json (${res.status})`);
			heights = (await res.json()).heights;
			if (!Array.isArray(heights) || heights.length === 0) throw new Error('index.json has no heights');
			height = heights[0];
			const model = await precomputedModel(height);
			scene = buildScene(viewer, three, statusLine, startButton, callbacks);
			hideFallbackImage(findFallbackImage(viewer));
			scene.reveal();
			scene.setCradle(model, 'precomputed');
			scene.fitToCradle();
			scene.setSliderPrecomputed(heights, height);
			viewer.dataset.mode = 'precomputed';
			viewer.classList.add('is-ready');
			setStatus(`Model: cradle-v2.scad, jack at ${height} mm`);
		} catch (e) {
			setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	// ---- tier 2: live
	let worker = null;
	let nextId = 0;
	let inFlight = null;
	let lastSent = null; // { jackHeight, ghosts }
	let queued = null;
	let debounce = 0;

	function requestRender(jackHeight, ghosts) {
		if (inFlight !== null) {
			queued = { jackHeight, ghosts };
			return;
		}
		if (lastSent && lastSent.jackHeight === jackHeight && lastSent.ghosts === ghosts && mode === 'live') return;
		const id = ++nextId;
		inFlight = id;
		lastSent = { jackHeight, ghosts };
		worker.postMessage({ type: 'render', id, scad: scadUrl, jackHeight, ghosts });
	}

	function finished() {
		inFlight = null;
		if (queued !== null) {
			const q = queued;
			queued = null;
			if (!lastSent || q.jackHeight !== lastSent.jackHeight || q.ghosts !== lastSent.ghosts) {
				requestRender(q.jackHeight, q.ghosts);
			}
		}
	}

	function onWorkerMessage(ev) {
		const msg = ev.data;
		if (!msg) return;
		if (msg.type === 'status') {
			setStatus(msg.text);
		} else if (msg.type === 'error') {
			liveFailed(msg.text);
		} else if (msg.type === 'result') {
			if (msg.id !== nextId) {
				finished(); // stale: a newer request has been sent
				return;
			}
			try {
				showLive(msg);
				setStatus(`Rendered in ${msg.ms} ms`);
			} catch (e) {
				liveFailed(e instanceof Error ? e.message : String(e));
				return;
			}
			finished();
		}
	}

	function showLive(msg) {
		const decoder = new TextDecoder();
		const cradle = parseOFF(decoder.decode(msg.cradle));
		const ghost = msg.ghost ? parseOFF(decoder.decode(msg.ghost)) : null;
		height = lastSent.jackHeight;
		if (mode !== 'live') {
			mode = 'live';
			viewer.dataset.mode = 'live';
			scene.setSliderLive(LIVE_MIN, LIVE_MAX, LIVE_STEP, height);
			scene.showChecks(true);
		}
		scene.setCradle(scene.liveMesh(cradle, false), 'live', cradle.colourCount);
		scene.setGhost(ghost ? scene.liveMesh(ghost, true) : null);
		scene.setChecks(msg.echo);
	}

	// Any live error: show it, go back to the precomputed model at the nearest
	// precomputed height, and offer the button again.
	function liveFailed(text) {
		setStatus(`Error: ${text}`);
		clearTimeout(debounce);
		queued = null;
		inFlight = null;
		lastSent = null;
		if (worker) {
			worker.terminate();
			worker = null;
		}
		const nearest = heights.reduce((a, b) => (Math.abs(b - height) < Math.abs(a - height) ? b : a), heights[0]);
		mode = 'precomputed';
		viewer.dataset.mode = 'precomputed';
		scene.showChecks(false);
		scene.setSliderPrecomputed(heights, nearest);
		scene.showStart(true);
		showPrecomputed(nearest).catch((e) => setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`));
	}

	function startLive() {
		scene.showStart(false);
		setStatus('Loading OpenSCAD 2025.07 (14 MB)…');
		worker = new Worker('/imiev/cradle-worker.js', { type: 'module' });
		worker.addEventListener('message', onWorkerMessage);
		worker.addEventListener('error', (ev) => liveFailed(ev.message || 'the render worker failed to load'));
		requestRender(height, ghostsOn);
	}

	// ---- control callbacks (shared by both tiers)
	const callbacks = {
		onHeight(h, immediate) {
			if (mode === 'live') {
				clearTimeout(debounce);
				if (immediate) requestRender(h, ghostsOn);
				else debounce = setTimeout(() => requestRender(h, ghostsOn), DEBOUNCE_MS);
			} else if (h !== height) {
				showPrecomputed(h).catch((e) => setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`));
			}
		},
		onGhosts(on) {
			ghostsOn = on;
			if (mode === 'live') {
				if (on) {
					if (!scene.showGhost(true)) requestRender(height, true);
				} else {
					scene.showGhost(false);
				}
			} else if (on) {
				const h = height;
				precomputedGhost(h)
					.then((g) => {
						if (ghostsOn && mode === 'precomputed' && height === h) scene.setGhost(g);
					})
					.catch((e) => setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`));
			} else {
				scene.setGhost(null);
			}
		},
		onStart: startLive,
	};

	// Nothing loads until the block comes within one viewport of view.
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((e) => e.isIntersecting)) return;
			observer.disconnect();
			startPrecomputed();
		},
		{ rootMargin: '100% 0px' },
	);
	observer.observe(viewer);
}

function buildScene(viewer, { THREE, OrbitControls }, statusLine, startButton, callbacks) {
	// --- DOM: stage first, then the existing status line, then the controls
	// row (slider, ghost checkbox, live button) and the self-check details.
	const stage = document.createElement('div');
	stage.className = 'scad-viewer-stage';
	stage.hidden = true;
	viewer.insertBefore(stage, viewer.firstChild);

	const controlsRow = document.createElement('div');
	controlsRow.className = 'scad-viewer-controls';

	const sliderLabel = document.createElement('label');
	const sliderText = document.createElement('span');
	sliderText.textContent = 'jack height';
	const slider = document.createElement('input');
	slider.type = 'range';
	slider.className = 'scad-viewer-jack';
	const sliderValue = document.createElement('output');
	sliderValue.className = 'scad-viewer-jack-value';
	sliderLabel.append(sliderText, slider, sliderValue);

	const ghostLabel = document.createElement('label');
	const ghostBox = document.createElement('input');
	ghostBox.type = 'checkbox';
	ghostBox.checked = false;
	ghostBox.className = 'scad-viewer-ghosts';
	ghostLabel.append(ghostBox, document.createTextNode('pack and sill ghosts'));

	controlsRow.append(sliderLabel, ghostLabel, startButton);

	const details = document.createElement('details');
	details.className = 'scad-viewer-checks';
	details.hidden = true;
	const summary = document.createElement('summary');
	summary.textContent = 'Model self-checks';
	const pre = document.createElement('pre');
	details.append(summary, pre);

	statusLine.after(controlsRow, details);

	// --- three.js
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x000000, 0);
	stage.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
	camera.up.set(0, 0, 1);

	scene.add(new THREE.HemisphereLight(0xffffff, 0x303038, 1.6));
	const sun = new THREE.DirectionalLight(0xffffff, 2.2);
	sun.position.set(-900, -500, 1200);
	scene.add(sun);

	let cradle = null; // Object3D currently shown as the cradle
	let ghost = null; // Object3D currently shown as the ghosts

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.1;

	// Render on demand: a rAF loop that runs only while the controls report
	// movement (damping), then stops.
	let raf = 0;
	function frame() {
		raf = 0;
		const moved = controls.update();
		renderer.render(scene, camera);
		if (moved) kick();
	}
	function kick() {
		if (!raf) raf = requestAnimationFrame(frame);
	}
	controls.addEventListener('change', kick);
	controls.addEventListener('start', kick);

	function resize() {
		const w = stage.clientWidth;
		const h = stage.clientHeight;
		if (w === 0 || h === 0) return;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h, false);
		kick();
	}
	window.addEventListener('resize', resize);

	function disposeObject(obj) {
		obj.traverse((o) => {
			if (o.geometry) o.geometry.dispose();
			if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
		});
	}

	function cradleBox() {
		const box = new THREE.Box3().setFromObject(cradle);
		return box;
	}

	// The loader gives a Group of one Mesh per base material, flat-shaded
	// Phong with the file's colour and opacity set. Make the translucent
	// ones (the castor sweep circles) actually translucent, and give every
	// geometry normals.
	function prepare3MF(group, asGhost) {
		let materials = 0;
		group.traverse((o) => {
			if (!o.isMesh) return;
			materials++;
			if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
			const m = o.material;
			if (asGhost) {
				m.transparent = true;
				m.opacity = GHOST_OPACITY;
				m.depthWrite = false;
				m.side = THREE.DoubleSide;
			} else if (m.opacity < 1) {
				m.transparent = true;
				m.depthWrite = false;
			}
		});
		return materials;
	}

	// OFF colours are sRGB; a colour attribute is read as linear, so convert
	// (3MFLoader does the same for its displaycolor values).
	function liveMesh(parsed, asGhost) {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(parsed.positions, 3));
		const colors = parsed.colors;
		const c = new THREE.Color();
		for (let i = 0; i < colors.length; i += 3) {
			c.setRGB(colors[i], colors[i + 1], colors[i + 2], THREE.SRGBColorSpace);
			colors[i] = c.r;
			colors[i + 1] = c.g;
			colors[i + 2] = c.b;
		}
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		geometry.computeVertexNormals();
		const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.1 });
		if (asGhost) {
			material.transparent = true;
			material.opacity = GHOST_OPACITY;
			material.depthWrite = false;
			material.side = THREE.DoubleSide;
		}
		return new THREE.Mesh(geometry, material);
	}

	// Swap the cradle. `source` is 'precomputed' (a cached 3MF Group, not
	// disposed on swap) or 'live' (a fresh mesh, disposed on swap).
	let cradleSource = null;
	function setCradle(obj, source, colourCount) {
		if (cradle) {
			scene.remove(cradle);
			if (cradleSource === 'live') disposeObject(cradle);
		}
		cradle = obj;
		cradleSource = source;
		if (source === 'precomputed') colourCount = prepare3MF(obj, false);
		scene.add(obj);
		const size = new THREE.Vector3();
		cradleBox().getSize(size);
		viewer.dataset.cradleHeight = size.z.toFixed(2);
		viewer.dataset.colourCount = String(colourCount);
		kick();
	}

	let ghostSource = null;
	function setGhost(obj) {
		if (ghost) {
			scene.remove(ghost);
			if (ghostSource === 'live') disposeObject(ghost);
			ghost = null;
		}
		if (obj) {
			ghost = obj;
			ghostSource = cradleSource;
			if (ghostSource === 'precomputed') prepare3MF(obj, true);
			ghost.renderOrder = 1;
			scene.add(obj);
		}
		viewer.dataset.ghosts = ghost && ghost.visible ? 'on' : 'off';
		kick();
	}

	// Live mode only toggles visibility of the ghost rendered with the
	// current cradle; returns false when there is none to show.
	function showGhost(on) {
		if (!ghost) return false;
		ghost.visible = on;
		viewer.dataset.ghosts = on ? 'on' : 'off';
		kick();
		return true;
	}

	// Start from the crank side: the crank stubs point along -X, so the eye
	// sits at negative X, elevated about 30 degrees, looking at the centre.
	function fitToCradle() {
		const box = cradleBox();
		const sphere = new THREE.Sphere();
		box.getBoundingSphere(sphere);
		const r = sphere.radius;
		const halfFov = (camera.fov * Math.PI) / 360;
		const dir = new THREE.Vector3(-Math.cos(Math.PI / 6), -0.25, Math.sin(Math.PI / 6)).normalize();
		// Start from the bounding sphere, then pull in until the projected
		// box corners fill the frame (a long flat frame is much smaller than
		// its sphere from most angles).
		let dist = r / Math.sin(halfFov);
		const corners = [];
		for (const x of [box.min.x, box.max.x])
			for (const y of [box.min.y, box.max.y])
				for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z));
		camera.near = 1;
		camera.far = dist * 20 + r * 20;
		for (let i = 0; i < 4; i++) {
			camera.position.copy(sphere.center).addScaledVector(dir, dist);
			camera.lookAt(sphere.center);
			camera.updateProjectionMatrix();
			camera.updateMatrixWorld();
			let extent = 0;
			for (const c of corners) {
				const p = c.clone().project(camera);
				extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y));
			}
			dist *= extent / 0.9;
		}
		camera.position.copy(sphere.center).addScaledVector(dir, dist);
		camera.near = Math.max(1, dist / 100);
		camera.updateProjectionMatrix();
		controls.target.copy(sphere.center);
		controls.update();
		kick();
	}

	// --- controls
	let sliderHeights = null; // precomputed list, or null when continuous
	function sliderHeight() {
		const v = Number(slider.value);
		return sliderHeights ? sliderHeights[v] : v;
	}
	function setSliderPrecomputed(heights, h) {
		sliderHeights = heights;
		slider.min = '0';
		slider.max = String(heights.length - 1);
		slider.step = '1';
		slider.value = String(Math.max(0, heights.indexOf(h)));
		sliderValue.textContent = `${h} mm`;
	}
	function setSliderLive(min, max, step, h) {
		sliderHeights = null;
		slider.min = String(min);
		slider.max = String(max);
		slider.step = String(step);
		slider.value = String(h);
		sliderValue.textContent = `${h} mm`;
	}
	slider.addEventListener('input', () => {
		sliderValue.textContent = `${sliderHeight()} mm`;
		callbacks.onHeight(sliderHeight(), false);
	});
	slider.addEventListener('change', () => {
		sliderValue.textContent = `${sliderHeight()} mm`;
		callbacks.onHeight(sliderHeight(), true);
	});
	ghostBox.addEventListener('change', () => callbacks.onGhosts(ghostBox.checked));
	startButton.addEventListener('click', () => callbacks.onStart());

	return {
		reveal() {
			stage.hidden = false;
			resize();
		},
		setCradle,
		setGhost,
		showGhost,
		liveMesh,
		fitToCradle,
		setSliderPrecomputed,
		setSliderLive,
		showStart(on) {
			startButton.hidden = !on;
		},
		showChecks(on) {
			details.hidden = !on;
		},
		setChecks(lines) {
			pre.textContent = lines.join('\n');
		},
	};
}

for (const viewer of document.querySelectorAll('.scad-viewer')) setupViewer(viewer);
