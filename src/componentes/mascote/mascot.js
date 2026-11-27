import { createMascot as createSvgMascot } from "./mascot-svg.js";
const WAIT_MS = 1500;
const MEMO_KEY = "athena.mascot3d";
const hasWebGL = typeof WebGLRenderingContext !== "undefined";
let memoOff = false;
try {
  memoOff = localStorage.getItem(MEMO_KEY) === "off";
} catch {
}
const remember = (works) => {
  if (memoOff === !works) return;
  memoOff = !works;
  try {
    if (works) localStorage.removeItem(MEMO_KEY);
    else localStorage.setItem(MEMO_KEY, "off");
  } catch {
  }
};
const expect3d = hasWebGL && !memoOff;
let engine = null;
let engineSettled = false;
const afterFirstPaint = (fn) => {
  if (document.hidden) {
    setTimeout(fn, 0);
    return;
  }
  requestAnimationFrame(() => setTimeout(fn, 0));
};
function preload3d() {
  const t = document.getElementById("preload-3d");
  if (!t) return;
  t.remove();
  document.head.append(t.content);
}
function load3d() {
  if (!engine && !hasWebGL) {
    engine = Promise.resolve(null);
    engineSettled = true;
  }
  if (!engine) {
    preload3d();
    engine = new Promise((resolve) => afterFirstPaint(resolve)).then(() => import("./mascot3d.js")).then((m) => m.supported() ? m : null).catch((err) => {
      console.warn("Athena 3D indispon\xEDvel, usando SVG.", err);
      return null;
    }).then((m) => {
      engineSettled = true;
      if (!m) remember(false);
      return m;
    });
  }
  return engine;
}
if (expect3d) load3d();
function createMascot(options = {}) {
  const el = createSvgMascot(options);
  const pending = expect3d && !engineSettled;
  let timer = 0;
  const reveal = () => {
    clearTimeout(timer);
    el.classList.remove("athena--pending");
  };
  if (pending) {
    el.classList.add("athena--pending");
    timer = setTimeout(reveal, WAIT_MS);
  }
  load3d().then((m) => {
    let attached = false;
    try {
      attached = Boolean(m?.attach(el));
    } catch (err) {
      console.warn("Athena 3D falhou neste mascote, usando SVG.", err);
    }
    if (m) remember(attached);
    if (attached && el.classList.contains("athena--pending")) el.classList.add("athena--direct");
    reveal();
  });
  return el;
}
export {
  createMascot
};
