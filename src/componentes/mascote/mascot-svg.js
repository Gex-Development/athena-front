const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
const seed = Math.random().toString(36).slice(2, 7);
function scalePath(d, s, cx = 61, cy = 62, dy = 0) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(cx + (x - cx) * s).toFixed(2)},${(cy + (y - cy) * s + dy).toFixed(2)}`);
}
function softTriangle(vertices, { bulge = 3, round = 0.72 } = {}) {
  const c = vertices.reduce((a, [x, y]) => [a[0] + x / 3, a[1] + y / 3], [0, 0]);
  const edges = vertices.map((p, i) => {
    const q = vertices[(i + 1) % 3];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const dir = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
    let mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const out = [mid[0] - c[0], mid[1] - c[1]];
    const ol = Math.hypot(out[0], out[1]);
    mid = [mid[0] + out[0] / ol * bulge, mid[1] + out[1] / ol * bulge];
    return { mid, dir, h: len / 2 * round };
  });
  const f = (n) => n.toFixed(2);
  let d = `M${f(edges[0].mid[0])},${f(edges[0].mid[1])}`;
  for (let i = 0; i < 3; i++) {
    const a = edges[i];
    const b = edges[(i + 1) % 3];
    d += ` C${f(a.mid[0] + a.dir[0] * a.h)},${f(a.mid[1] + a.dir[1] * a.h)} ${f(b.mid[0] - b.dir[0] * b.h)},${f(b.mid[1] - b.dir[1] * b.h)} ${f(b.mid[0])},${f(b.mid[1])}`;
  }
  return `${d} Z`;
}
const BODY = softTriangle([[17, 32], [107, 36.5], [57, 110]], { bulge: 5.5, round: 0.78 });
const BODY_INNER = scalePath(BODY, 0.86, 61, 60);
const RING_A = { cx: 60, cy: 65, rx: 55, ry: 19, rot: 22 };
const RING_B = { cx: 60, cy: 61, rx: 54, ry: 26, rot: -27 };
function arcs({ cx, cy, rx, ry }) {
  const L = `${cx - rx},${cy}`;
  const R = `${cx + rx},${cy}`;
  return { back: `M${L} A${rx},${ry} 0 0 1 ${R}`, front: `M${R} A${rx},${ry} 0 0 1 ${L}` };
}
const A = arcs(RING_A);
const B = arcs(RING_B);
function ring(id, d, def, key, part) {
  const front = part === "front";
  const w = front ? 6.4 : 5;
  return `
    <g class="athena-float athena-float--${key}">
      <g class="athena-ring athena-ring--${part}" transform="rotate(${def.rot} ${def.cx} ${def.cy})">
        <path class="athena-blend" d="${d}" stroke="url(#${id}-space)" stroke-width="${front ? 15 : 12}" opacity="${front ? ".55" : ".38"}" filter="url(#${id}-bloom)"/>
        <path class="athena-blend" d="${d}" stroke="url(#${id}-mix)" stroke-width="${w}" opacity="${front ? ".85" : ".65"}"/>
        <path d="${d}" stroke="#020a1c" stroke-width="${(w * 0.5).toFixed(2)}" opacity="${front ? ".6" : ".5"}" filter="url(#${id}-core)"/>
        <path d="${d}" stroke="#dff3ff" stroke-width="${front ? 1.1 : 0.8}" opacity="${front ? ".9" : ".55"}" transform="translate(-.8 -1.4)"/>
        <path d="${d}" stroke="#7aa9f2" stroke-width="${front ? 0.8 : 0.6}" opacity="${front ? ".65" : ".4"}" transform="translate(.8 1.4)"/>
      </g>
    </g>`;
}
function createMascot({ size = 96, label = "Athena", interactive = false, still = false } = {}) {
  const id = `athena-${seed}-${++uid}`;
  const wrapper = document.createElement("span");
  wrapper.className = `athena${still ? " athena--still" : ""}`;
  wrapper.style.setProperty("--athena-size", `${size}px`);
  if (label) {
    wrapper.setAttribute("role", "img");
    wrapper.setAttribute("aria-label", label);
  } else {
    wrapper.setAttribute("aria-hidden", "true");
  }
  const dot = (cx, cy, r) => `
    <g class="athena-dot">
      <circle cx="${cx}" cy="${cy}" r="${(r * 2).toFixed(2)}" fill="url(#${id}-space)" opacity=".5" filter="url(#${id}-blur)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-dot)" fill-opacity=".9" stroke="url(#${id}-space)" stroke-width=".8"/>
      <circle cx="${(cx - r * 0.3).toFixed(2)}" cy="${(cy - r * 0.35).toFixed(2)}" r="${(r * 0.32).toFixed(2)}" fill="#FFFFFF" opacity=".95"/>
    </g>`;
  wrapper.innerHTML = `
    <svg viewBox="0 0 120 120" xmlns="${SVG_NS}" focusable="false" aria-hidden="true" fill="none" stroke-linecap="round">
      <defs>
        <radialGradient id="${id}-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2f86ff" stop-opacity=".5"/>
          <stop offset="50%" stop-color="#1e6fd9" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#1552a8" stop-opacity="0"/>
        </radialGradient>
        <!-- Degrad\xEA do espa\xE7o: roxo vivo junto ao corpo, violeta-azulado nas pontas dos an\xE9is. Compartilhado por corpo, an\xE9is e bolinhas. -->
        <radialGradient id="${id}-space" gradientUnits="userSpaceOnUse" cx="61" cy="62" r="62">
          <stop offset="0%" stop-color="#6aa8ff"/>
          <stop offset="40%" stop-color="#2f86ff"/>
          <stop offset="72%" stop-color="#1f74e0"/>
          <stop offset="100%" stop-color="#1e6fd9"/>
        </radialGradient>
        <!-- Mistura roxo \u21C4 azul-violeta em diagonal: roxo em cima-esquerda, azul-violeta embaixo-direita, com faixas intercaladas. -->
        <linearGradient id="${id}-mix" gradientUnits="userSpaceOnUse" x1="4" y1="8" x2="116" y2="112">
          <stop offset="0%" stop-color="#3d8fff"/>
          <stop offset="28%" stop-color="#1e6fd9"/>
          <stop offset="48%" stop-color="#2f86ff"/>
          <stop offset="70%" stop-color="#1552a8"/>
          <stop offset="86%" stop-color="#2a7ae6"/>
          <stop offset="100%" stop-color="#1552a8"/>
        </linearGradient>
        <filter id="${id}-core" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation=".9"/></filter>
        <filter id="${id}-bloom" x="-40%" y="-120%" width="180%" height="340%"><feGaussianBlur stdDeviation="3.6"/></filter>
        <!-- Preto no centro, roxo crescendo para fora, borda luminosa (como na refer\xEAncia). -->
        <radialGradient id="${id}-body" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stop-color="#000000"/>
          <stop offset="55%" stop-color="#020814"/>
          <stop offset="78%" stop-color="#061a40"/>
          <stop offset="92%" stop-color="#0b3d86"/>
          <stop offset="100%" stop-color="#1e6fd9"/>
        </radialGradient>
        <clipPath id="${id}-clip"><path d="${BODY}"/></clipPath>
        <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
        <radialGradient id="${id}-dot" cx="42%" cy="40%" r="62%">
          <stop offset="0%" stop-color="#e4f6ff"/>
          <stop offset="45%" stop-color="#7aa9f2"/>
          <stop offset="80%" stop-color="#1e6fd9"/>
          <stop offset="100%" stop-color="#0b3d86"/>
        </radialGradient>
        <filter id="${id}-blur" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="2.2"/></filter>
        <filter id="${id}-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="${id}-aura" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="${id}-eyes" x="-150%" y="-80%" width="400%" height="260%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="a"/>
          <feFlood flood-color="#a4c6ff" flood-opacity=".95"/>
          <feComposite in2="a" operator="in" result="g"/>
          <feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Halo, aura e brilho do contorno ficam ABAIXO dos an\xE9is de tr\xE1s, para n\xE3o velar a cor deles. -->
      <circle class="athena-halo" cx="61" cy="60" r="58" fill="url(#${id}-halo)"/>
      <g class="athena-aura" filter="url(#${id}-aura)">
        <ellipse cx="61" cy="34" rx="24" ry="11" fill="#2f86ff" opacity=".7"/>
      </g>
      <path class="athena-rim" d="${BODY}" stroke="url(#${id}-space)" stroke-width="12" opacity=".75" filter="url(#${id}-bloom)"/>

      ${ring(id, A.back, RING_A, "a", "back")}
      ${ring(id, B.back, RING_B, "b", "back")}

      <!-- Corpo de "vidro": preenchimento quase opaco (os an\xE9is de tr\xE1s aparecem de leve),
           faixa roxa transl\xFAcida por dentro da borda e contorno fino luminoso. -->
      <path class="athena-body" d="${BODY}" fill="url(#${id}-body)" fill-opacity=".96"/>
      <g clip-path="url(#${id}-clip)">
        <path d="${BODY}" stroke="url(#${id}-mix)" stroke-width="17" opacity=".55" filter="url(#${id}-soft)"/>
        <path d="${BODY}" stroke="url(#${id}-mix)" stroke-width="7" opacity=".6" filter="url(#${id}-soft)"/>
      </g>
      <path d="${BODY}" stroke="#b5d0ff" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="${BODY}" stroke="#eef9ff" stroke-width=".8" opacity=".8" stroke-linejoin="round"/>
      <path d="${BODY_INNER}" stroke="#7aa9f2" stroke-width="1" opacity=".3" stroke-linejoin="round"/>

      <g class="athena-look">
        <g class="athena-track">
          <g class="athena-blink" filter="url(#${id}-eyes)">
            <rect x="49" y="47" width="7" height="16" rx="3.5" fill="#f7fcff"/>
            <rect x="62" y="47" width="7" height="16" rx="3.5" fill="#f7fcff"/>
          </g>
          <g class="athena-happy" filter="url(#${id}-eyes)" stroke="#f7fcff" stroke-width="2.8">
            <path d="M48.5,58 Q52.5,50.5 56.5,58"/>
            <path d="M61.5,58 Q65.5,50.5 69.5,58"/>
          </g>
        </g>
      </g>

      ${ring(id, A.front, RING_A, "a", "front")}
      ${ring(id, B.front, RING_B, "b", "front")}

      <g class="athena-dots">
        ${dot(14, 21, 3.2)}
        ${dot(114, 64, 3)}
        ${dot(11, 98, 2.8)}
      </g>
    </svg>`;
  if (interactive) track(wrapper);
  return wrapper;
}
const tracked = new Set();
let pointer = null;
let anchor = null;
let heading = null;
let turns = [];
let idleTimer = 0;
let frame = 0;
const STEP_PX = 14;
const WINDOW_MS = 3200;
const TURNS_TO_CLOSE = 3.8;
const HAPPY_MS = 1400;
const IDLE_MS = 3500;
function track(el) {
  tracked.add(el);
  if (tracked.size === 1) {
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", release);
    addEventListener("blur", release);
  }
}
function visible(el) {
  if (!el.isConnected) {
    tracked.delete(el);
    return false;
  }
  return el.getClientRects().length > 0;
}
function countTurns(x, y, t) {
  if (!anchor) {
    anchor = { x, y, t };
    return 0;
  }
  const dx = x - anchor.x;
  const dy = y - anchor.y;
  if (Math.hypot(dx, dy) < STEP_PX) return null;
  const pause = t - anchor.t > 350;
  anchor = { x, y, t };
  const h = Math.atan2(dy, dx);
  if (pause) {
    heading = h;
    turns = [];
    return 0;
  }
  if (heading !== null) {
    let delta = h - heading;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    turns.push({ t, a: Math.abs(delta) });
  }
  heading = h;
  turns = turns.filter((e) => t - e.t < WINDOW_MS);
  return turns.reduce((s, e) => s + e.a, 0) / (2 * Math.PI);
}
function onMove(e) {
  if (e.pointerType === "touch") return;
  pointer = { x: e.clientX, y: e.clientY };
  const spun = countTurns(e.clientX, e.clientY, e.timeStamp);
  const now = performance.now();
  const closeEyes = spun !== null && spun >= TURNS_TO_CLOSE;
  if (closeEyes) {
    turns = [];
    heading = null;
  }
  for (const el of tracked) {
    if (!visible(el)) continue;
    el.classList.add("is-tracking");
    if (closeEyes) el._happyUntil = now + HAPPY_MS;
  }
  if (!frame) frame = requestAnimationFrame(update);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(release, IDLE_MS);
}
function update() {
  frame = 0;
  if (!pointer) return;
  const now = performance.now();
  let pending = false;
  for (const el of tracked) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const dx = pointer.x - (r.left + r.width / 2);
    const dy = pointer.y - (r.top + r.height * 0.48);
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, dist / 240);
    const eye = el.querySelector(".athena-track");
    eye.style.transform = `translate(${(dx / dist * reach * 5.5).toFixed(2)}px, ${(dy / dist * reach * 3.6).toFixed(2)}px)`;
    el._look = { x: dx / dist * reach, y: dy / dist * reach };
    const happy = (el._happyUntil || 0) > now;
    el.classList.toggle("is-happy", happy);
    if (happy) pending = true;
  }
  if (pending) frame = requestAnimationFrame(update);
}
function release() {
  pointer = null;
  anchor = null;
  heading = null;
  turns = [];
  for (const el of tracked) {
    el.classList.remove("is-tracking");
    const eye = el.querySelector(".athena-track");
    if (eye) eye.style.transform = "";
    el._look = null;
    const left = (el._happyUntil || 0) - performance.now();
    if (left <= 0) el.classList.remove("is-happy");
    else setTimeout(() => el.classList.remove("is-happy"), left);
  }
}
export {
  createMascot
};
