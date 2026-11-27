import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
const RES = 640;
const OVERSCAN = 1.5;
const UNIT = 40;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function supported() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
const vec = (hex) => new THREE.Vector3((hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255);
const fromSvg = (x, y) => [(x - 61) / UNIT, -(y - 60) / UNIT];
const shared = {
  uPurple: { value: vec(0x2f86ff) },
  uBlue: { value: vec(0x1e6fd9) }
};
const VERT = (
  
  `
  varying vec3 vN; varying vec3 vV; varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vec4 mv = viewMatrix * w;
    vV = -mv.xyz;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }`
);
const COMMON = (
  
  `
  uniform vec3 uPurple; uniform vec3 uBlue;
  varying vec3 vN; varying vec3 vV; varying vec3 vW;
  vec3 athenaMix(vec3 p) {
    float diag = smoothstep(-1.7, 1.7, p.x - p.y * 0.9);
    float wave = 0.5 + 0.5 * sin(p.x * 2.3 + p.y * 1.7 + 0.8);
    return mix(uPurple, uBlue, clamp(diag * 0.75 + wave * 0.35 - 0.1, 0.0, 1.0));
  }
  float fresnel() { return 1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); }
  float spec(float p) {
    vec3 L = normalize(vec3(-0.55, 0.75, 0.6));
    return pow(clamp(dot(reflect(-L, normalize(vN)), normalize(vV)), 0.0, 1.0), p);
  }`
);
const BODY_ALPHA = (
  
  `float bodyAlpha(float f) { return 1.0 - smoothstep(0.62, 0.96, f) * 0.85; }`
);
function bodyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uGlow: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: (
      
      `
      ${COMMON}
      ${BODY_ALPHA}
      uniform float uGlow;
      void main() {
        float f = fresnel();
        float band = pow(f, 3.4);
        float edge = pow(f, 7.0);
        vec3 c = vec3(0.002, 0.006, 0.02) * (1.0 - f)
               + athenaMix(vW) * band * 1.05 * uGlow
               + vec3(0.7, 0.84, 1.0) * edge * 0.7
               + vec3(0.88, 0.94, 1.0) * spec(60.0) * 0.06;
        gl_FragColor = vec4(c, bodyAlpha(f));
      }`
    ),
    transparent: true,
    premultipliedAlpha: true
  });
}
function bodyMaskMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: (
      
      `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      ${BODY_ALPHA}
      void main() {
        float f = 1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float a = bodyAlpha(f);
        gl_FragColor = vec4(a, a, a, 1.0);
      }`
    )
  });
}
function ringMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uFlow1: { value: 0 },
      uDir1: { value: 1 },
      uFlow2: { value: 0.5 },
      uDir2: { value: -1 },
      uFlowOn: { value: 1 }
    },
    vertexShader: (
      
      `
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vU;
      void main() {
        vU = uv.x;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        vV = -mv.xyz;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`
    ),
    fragmentShader: (
      
      `
      ${COMMON}
      uniform float uFlowOn;
      uniform float uFlow1; uniform float uDir1; uniform float uFlow2; uniform float uDir2;
      varying float vU;
      float comet(float pos, float dir) {
        float behind = fract((pos - vU) * dir);
        float tail = pow(1.0 - clamp(behind / 0.32, 0.0, 1.0), 2.6);
        float head = exp(-pow(min(behind, 1.0 - behind) * 38.0, 2.0));
        return max(tail, head);
      }
      void main() {
        float f = fresnel();
        vec3 base = athenaMix(vW);
        vec3 c = base * (0.1 + 0.8 * pow(f, 1.5))
               + vec3(0.7, 0.84, 1.0) * pow(f, 5.0) * 0.45
               + vec3(1.0) * spec(40.0) * 0.25;
        float flow = max(comet(uFlow1, uDir1), comet(uFlow2, uDir2)) * uFlowOn;
        vec3 vivid = clamp(mix(vec3(dot(base, vec3(0.3, 0.59, 0.11))), base, 1.4), 0.0, 1.0);
        c += vivid * flow * (0.45 + 0.4 * (1.0 - f));
        gl_FragColor = vec4(c, 1.0);
      }`
    ),
    transparent: true,
    depthWrite: true,
    blending: THREE.AdditiveBlending
  });
}
function orbMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared },
    vertexShader: VERT,
    fragmentShader: (
      
      `
      ${COMMON}
      void main() {
        float f = fresnel();
        vec3 core = vec3(0.6, 0.78, 1.0);
        vec3 c = mix(core * 0.62, athenaMix(vW) * 0.85, smoothstep(0.0, 0.8, f)) + vec3(1.0) * spec(30.0) * 0.35;
        gl_FragColor = vec4(c, 1.0);
      }`
    ),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}
function glowMaterial(hex, alpha) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: vec(hex) }, uAlpha: { value: alpha } },
    vertexShader: (
      
      `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
    ),
    fragmentShader: (
      
      `
      uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
        gl_FragColor = vec4(uColor * a * uAlpha, 1.0);
      }`
    ),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}
const eyeMaterial = () => new THREE.ShaderMaterial({
  uniforms: { ...shared },
  vertexShader: VERT,
  fragmentShader: (
    
    `
    ${COMMON}
    void main() {
      float f = fresnel();
      vec3 c = mix(vec3(0.95, 0.98, 1.0), vec3(0.45, 0.66, 1.0), smoothstep(0.35, 0.95, f) * 0.75);
      gl_FragColor = vec4(c * 0.66, 1.0);

    }`
  )
});
function bodyGeometry() {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(y, x) - Math.PI / 6;
    const k = 1 + 0.16 * Math.cos(3 * a) + 0.03 * Math.cos(6 * a);
    p.setXYZ(i, x * k * 0.98, y * k * 1.06, z * 0.6);
  }
  g.computeVertexNormals();
  return g;
}
class EllipseArc extends THREE.Curve {
  constructor(rx, rz, from, to) {
    super();
    Object.assign(this, { rx, rz, from, to });
  }
  getPoint(t, target = new THREE.Vector3()) {
    const a = this.from + (this.to - this.from) * t;
    return target.set(this.rx * Math.cos(a), 0, this.rz * Math.sin(a));
  }
}
function buildRing({ radius, tilt, roll, tube }) {
  const float = new THREE.Group();
  const outer = new THREE.Group();
  const inner = new THREE.Group();
  outer.rotation.z = roll;
  inner.rotation.x = tilt;
  float.add(outer);
  outer.add(inner);
  const geo = new THREE.TubeGeometry(new EllipseArc(radius, radius, 0, 2 * Math.PI), 240, tube, 20, true);
  const main = new THREE.Mesh(geo, ringMaterial());
  main.renderOrder = 1;
  inner.add(main);
  float.userData.flow = main.material.uniforms;
  return float;
}
let renderer, composer, scene, camera;
let maskScene, maskTarget;
let body, bodyMat, eyes, eyeOpen, eyeHappy, ringA, ringB, halo, aura;
let stillSnapshot = null;
const instances = new Set();
let running = false;
let broken = false;
function fallbackToSvg(reason) {
  if (broken) return;
  broken = true;
  console.warn(`Athena 3D desativada (${reason}); usando SVG.`);
  for (const inst of instances) {
    inst.canvas.remove();
    inst.el.classList.remove("athena--3d");
  }
  instances.clear();
}
function init() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(RES, RES, false);
  renderer.setClearColor(0, 0);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    fallbackToSvg("contexto WebGL perdido");
  });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 9);
  halo = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), glowMaterial(0x1552a8, 0.35));
  halo.position.z = -1.5;
  aura = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), glowMaterial(0x2f86ff, 0.35));
  halo.renderOrder = aura.renderOrder = -1;
  scene.add(halo, aura);
  bodyMat = bodyMaterial();
  body = new THREE.Mesh(bodyGeometry(), bodyMat);
  body.renderOrder = 2;
  scene.add(body);
  maskScene = new THREE.Scene();
  maskScene.add(new THREE.Mesh(body.geometry, bodyMaskMaterial()));
  maskTarget = new THREE.WebGLRenderTarget(RES, RES, { samples: 4 });
  eyes = new THREE.Group();
  eyeOpen = new THREE.Group();
  eyeHappy = new THREE.Group();
  const capsule = new THREE.CapsuleGeometry(0.085, 0.24, 8, 20);
  const smile = new THREE.TubeGeometry(
    new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.1, -0.035, 0), new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(0.1, -0.035, 0)),
    32,
    0.03,
    10,
    false
  );
  const ray = new THREE.Raycaster();
  for (const sx of [51, 67]) {
    const [x, y] = fromSvg(sx, 55);
    ray.set(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(body)[0];
    const z = (hit ? hit.point.z : 0.55) + 0.03;
    const open = new THREE.Mesh(capsule, eyeMaterial());
    open.position.set(x, y, z);
    open.scale.z = 0.35;
    const happy = new THREE.Mesh(smile, eyeMaterial());
    happy.position.set(x, y - 0.03, z);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.56), glowMaterial(0x5aa2ff, 0.14));
    glow.position.set(x, y, z - 0.01);
    glow.renderOrder = 3;
    eyeOpen.add(open);
    eyeHappy.add(happy);
    eyes.add(glow);
  }
  eyes.add(eyeOpen, eyeHappy);
  eyeHappy.visible = false;
  scene.add(eyes);
  ringA = buildRing({ radius: 1.4, tilt: 0.36, roll: -0.38, tube: 0.078 });
  ringB = buildRing({ radius: 1.36, tilt: 0.5, roll: 0.47, tube: 0.074 });
  scene.add(ringA, ringB);
  for (const [sx, sy, r] of [[14, 21, 0.08], [114, 64, 0.075], [11, 98, 0.07]]) {
    const [x, y] = fromSvg(sx, sy);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), orbMaterial());
    dot.position.set(x, y, 0.3);
    dot.renderOrder = 4;
    scene.add(dot);
  }
  const target = new THREE.WebGLRenderTarget(RES, RES, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(RES, RES);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(RES, RES), 0.75, 0.4, 0.22));
  const finalPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, tMask: { value: null } },
    vertexShader: (
      
      `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
    ),
    fragmentShader: (
      
      `
      uniform sampler2D tDiffuse; uniform sampler2D tMask; varying vec2 vUv;
      void main() {
        float fade = smoothstep(0.5, 0.36, length(vUv - 0.5));
        vec3 c = clamp(texture2D(tDiffuse, vUv).rgb, 0.0, 1.0) * fade;
        float a = max(max(c.r, max(c.g, c.b)), texture2D(tMask, vUv).r);
        gl_FragColor = vec4(c, a);
      }`
    )
  });
  finalPass.uniforms.tMask.value = maskTarget.texture;
  composer.addPass(finalPass);
  precompile();
}
function precompile() {
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).deleteAttribute("normal"));
  const holder = new THREE.Scene();
  holder.add(quad);
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  renderer.setRenderTarget(maskTarget);
  renderer.compile(maskScene, camera);
  renderer.compile(scene, camera);
  composer.passes.forEach((pass, i) => {
    renderer.setRenderTarget(i === composer.passes.length - 1 ? null : maskTarget);
    for (const material of Object.values(pass).flat()) {
      if (!material?.isShaderMaterial) continue;
      quad.material = material;
      renderer.compile(holder, flat);
    }
  });
  renderer.setRenderTarget(null);
  quad.geometry.dispose();
}
function draw() {
  renderer.setRenderTarget(maskTarget);
  renderer.clear();
  renderer.render(maskScene, camera);
  renderer.setRenderTarget(null);
  composer.render();
}
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(Math.max(x, 0), 1));
function idleLook(t) {
  const q = t % 8 / 8;
  if (q < 0.14) return 0;
  if (q < 0.2) return -ease((q - 0.14) / 0.06);
  if (q < 0.34) return -1;
  if (q < 0.4) return -1 + ease((q - 0.34) / 0.06);
  if (q < 0.56) return 0;
  if (q < 0.62) return ease((q - 0.56) / 0.06);
  if (q < 0.78) return 1;
  if (q < 0.84) return 1 - ease((q - 0.78) / 0.06);
  return 0;
}
function blink(t) {
  const k = (t % 5.2 / 5.2 - 0.44) / 0.06;
  if (k < 0 || k > 1) return 1;
  return 1 - 0.88 * (1 - Math.abs(k * 2 - 1));
}
function pose(inst, t, still) {
  const el = inst.el;
  const dt = inst.lastT === void 0 ? 1 / 60 : Math.min(Math.max(t - inst.lastT, 0), 0.1);
  inst.lastT = t;
  const follow = still ? 1 : 1 - Math.pow(0.65, dt * 60);
  const thinking = !still && Boolean(el.closest(".is-thinking"));
  const speed = thinking ? 2.4 : 1;
  const breathe = still ? 0.5 : 0.5 - 0.5 * Math.cos(2 * Math.PI * t * speed / 3.8);
  halo.material.uniforms.uAlpha.value = 0.34 + 0.26 * breathe;
  halo.scale.setScalar(0.9 + 0.16 * breathe);
  bodyMat.uniforms.uGlow.value = 0.9 + 0.22 * breathe;
  const auraAngle = still ? Math.PI / 2 : 2 * Math.PI * t * (thinking ? 3 : 1) / 9 + Math.PI / 2;
  aura.position.set(Math.cos(auraAngle) * 0.72, Math.sin(auraAngle) * 0.72, -1.1);
  const float = still ? 0 : Math.sin(2 * Math.PI * t / 4.2) * 0.08;
  ringA.position.y = float;
  ringB.position.y = -float;
  const flowA = ringA.userData.flow, flowB = ringB.userData.flow;
  const lap = (period, offset = 0) => (t * speed / period + offset) % 1;
  flowA.uFlowOn.value = flowB.uFlowOn.value = still ? 0 : 1;
  flowA.uFlow1.value = lap(5.5);
  flowA.uDir1.value = 1;
  flowA.uFlow2.value = 1 - lap(6.3, 0.5);
  flowA.uDir2.value = -1;
  flowB.uFlow1.value = 1 - lap(7.2, 0.45);
  flowB.uDir1.value = -1;
  flowB.uFlow2.value = lap(6.6, 0.2);
  flowB.uDir2.value = 1;
  let tx = 0, ty = 0;
  if (!still) {
    if (el.classList.contains("is-tracking") && el._look) {
      tx = el._look.x * 0.14;
      ty = -el._look.y * 0.09;
    } else if (thinking) {
      tx = Math.sin(2 * Math.PI * t / 2.4) * 0.05;
      ty = 0.05;
    } else {
      tx = idleLook(t) * 0.0875;
    }
  }
  inst.eye.x += (tx - inst.eye.x) * follow;
  inst.eye.y += (ty - inst.eye.y) * follow;
  eyes.position.set(inst.eye.x, inst.eye.y, 0);
  const happy = !still && el.classList.contains("is-happy");
  eyeOpen.visible = !happy;
  eyeHappy.visible = happy;
  eyeOpen.scale.y = still || happy ? 1 : blink(t);
}
function sizeCanvas(inst) {
  const css = inst.el.getBoundingClientRect().width || 0;
  const px = Math.max(16, Math.min(RES, Math.round(css * OVERSCAN * (devicePixelRatio || 1))));
  if (inst.canvas.width !== px) {
    inst.canvas.width = inst.canvas.height = px;
    inst.stillDrawn = false;
  }
  return px;
}
function onScreen(el) {
  if (!el.isConnected || el.getClientRects().length === 0) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > -50 && r.top < innerHeight + 50 && r.right > -50 && r.left < innerWidth + 50;
}
function renderStill() {
  if (stillSnapshot) return stillSnapshot;
  pose({ el: document.body, eye: { x: 0, y: 0 } }, 0, true);
  draw();
  stillSnapshot = document.createElement("canvas");
  stillSnapshot.width = stillSnapshot.height = RES;
  stillSnapshot.getContext("2d").drawImage(renderer.domElement, 0, 0);
  return stillSnapshot;
}
function frame(ms) {
  if (broken || !instances.size) {
    running = false;
    return;
  }
  requestAnimationFrame(frame);
  const t = ms / 1e3;
  for (const inst of instances) {
    if (!inst.el.isConnected) {
      if (inst.wasConnected || ms - inst.createdAt > 1e4) instances.delete(inst);
      continue;
    }
    inst.wasConnected = true;
    if (!onScreen(inst.el)) continue;
    const px = sizeCanvas(inst);
    const still = reduceMotion || inst.el.classList.contains("athena--still");
    if (still) {
      if (inst.stillDrawn) continue;
      const snap = renderStill();
      inst.ctx.clearRect(0, 0, px, px);
      inst.ctx.drawImage(snap, 0, 0, px, px);
      inst.stillDrawn = true;
      continue;
    }
    inst.stillDrawn = false;
    pose(inst, t, false);
    draw();
    inst.ctx.clearRect(0, 0, px, px);
    inst.ctx.drawImage(renderer.domElement, 0, 0, px, px);
  }
}
function attach(el) {
  if (broken) return false;
  try {
    init();
  } catch (err) {
    fallbackToSvg(err?.message || "falha ao iniciar o WebGL");
    return false;
  }
  const canvas = document.createElement("canvas");
  canvas.className = "athena-3d";
  canvas.setAttribute("aria-hidden", "true");
  el.append(canvas);
  el.classList.add("athena--3d");
  instances.add({ el, canvas, ctx: canvas.getContext("2d"), eye: { x: 0, y: 0 }, stillDrawn: false, wasConnected: el.isConnected, createdAt: performance.now() });
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
  return true;
}
export {
  attach,
  supported
};
