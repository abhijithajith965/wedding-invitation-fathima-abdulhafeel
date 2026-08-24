import * as THREE from "three";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   Shared helper: renderer factory
   ============================================================ */
function makeRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
}

/* ============================================================
   HERO SCENE
   Floating jasmine/diya particles + a golden thread drawing
   itself into an ampersand-heart monogram.
   ============================================================ */
export function initHeroScene(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = makeRenderer(canvas);

  // --- Layer 1: floating rose-gold petals ---
  const COUNT = reducedMotion ? 40 : 160;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    speeds[i] = 0.12 + Math.random() * 0.38;
    phases[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const spriteTexture = makeSoftDiscTexture();
  const material = new THREE.PointsMaterial({
    size: 0.25,
    map: spriteTexture,
    transparent: true,
    depthWrite: false,
    color: new THREE.Color("#c97d8a"),   // rose
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  scene.add(points);

  // --- Layer 2: champagne-gold star sparkles ---
  const SCOUNT = reducedMotion ? 20 : 60;
  const sgeo = new THREE.BufferGeometry();
  const spos = new Float32Array(SCOUNT * 3);
  const sphases = new Float32Array(SCOUNT);
  for (let i = 0; i < SCOUNT; i++) {
    spos[i * 3]     = (Math.random() - 0.5) * 20;
    spos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    spos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    sphases[i] = Math.random() * Math.PI * 2;
  }
  sgeo.setAttribute("position", new THREE.BufferAttribute(spos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.12,
    map: spriteTexture,
    transparent: true,
    depthWrite: false,
    color: new THREE.Color("#e8cb78"),   // champagne gold
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(sgeo, starMat);
  scene.add(stars);

  // golden thread monogram (a simple heart-ampersand-ish looped curve)
  const curvePoints = buildMonogramCurve();
  const curve = new THREE.CatmullRomCurve3(curvePoints, true);
  const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.045, 8, true);
  const tubeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#e8cb78"), transparent: true, opacity: 0 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.scale.set(2.2, 2.2, 2.2);
  tube.position.set(0, -0.4, -1);
  scene.add(tube);

  // draw-on reveal via geometry draw range
  const drawCount = tubeGeo.index ? tubeGeo.index.count : 0;
  let progress = 0;

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  let raf;
  const clock = new THREE.Clock();
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // drift petals upward with gentle sine sway
    const pos = geo.attributes.position;
    for (let i = 0; i < COUNT; i++) {
      let y = pos.getY(i) + speeds[i] * 0.009;
      if (y > 7) y = -7;
      pos.setY(i, y);
      const x = pos.getX(i) + Math.sin(t * 0.3 + phases[i]) * 0.003;
      pos.setX(i, x);
    }
    pos.needsUpdate = true;

    // twinkle the stars
    const sp = sgeo.attributes.position;
    starMat.opacity = 0.5 + 0.5 * Math.sin(t * 1.2);
    for (let i = 0; i < SCOUNT; i++) {
      const x = sp.getX(i) + Math.cos(t * 0.2 + sphases[i]) * 0.002;
      sp.setX(i, x);
    }
    sp.needsUpdate = true;

    if (progress < 1) {
      progress = Math.min(1, progress + 0.005);
      tubeMat.opacity = progress * 0.9;
      if (drawCount) tubeGeo.setDrawRange(0, Math.floor(drawCount * progress));
    } else {
      // gentle figure-eight drift
      tube.rotation.z = Math.sin(t * 0.18) * 0.025;
      tube.rotation.x = Math.sin(t * 0.11) * 0.015;
    }

    renderer.render(scene, camera);
  }
  if (!reducedMotion) {
    animate();
  } else {
    resize();
    renderer.render(scene, camera);
  }

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geo.dispose(); sgeo.dispose();
      tubeGeo.dispose();
      material.dispose(); starMat.dispose();
      tubeMat.dispose();
      renderer.dispose();
    },
  };
}

function buildMonogramCurve() {
  // A stylised infinity / ampersand-like closed loop rendered as a ribbon
  const pts = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = 1.3 * Math.sin(a);
    const y = 0.9 * Math.sin(a * 2) * 0.6;
    const z = 0.3 * Math.cos(a * 3);
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

function makeSoftDiscTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

/* ============================================================
   AMBIENT PARTICLE FIELD (used behind the countdown & closing)
   ============================================================ */
export function initAmbientScene(canvas, colorHex = "#c8973f", density = 60) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.z = 10;

  const renderer = makeRenderer(canvas);

  const COUNT = reducedMotion ? Math.floor(density / 2) : density;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const tex = makeSoftDiscTexture();
  const mat = new THREE.PointsMaterial({
    size: 0.22, map: tex, transparent: true, depthWrite: false,
    color: new THREE.Color(colorHex), opacity: 0.55, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // per-particle phases for ambient drift
  const ambPhases = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) ambPhases[i] = Math.random() * Math.PI * 2;

  let raf;
  const clock = new THREE.Clock();
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // slow galaxy-like drift
    points.rotation.y = t * 0.015;
    points.rotation.x = Math.sin(t * 0.07) * 0.08;
    mat.opacity = 0.4 + 0.2 * Math.sin(t * 0.5);
    renderer.render(scene, camera);
  }
  if (!reducedMotion) animate(); else renderer.render(scene, camera);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geo.dispose(); mat.dispose(); renderer.dispose();
    },
  };
}
