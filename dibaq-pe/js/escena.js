/* Dibaq Perú: escena 3D.
   Una sola escena fija detrás del texto. Las croquetas (redondas de perro y triangulares de gato) se generan
   por código, sin modelos externos, y viajan entre secciones según el scroll:
   inicio: una nube que gira alrededor de la croqueta principal
   holístico: un anillo en órbita; la croqueta mira al pilar que el visitante señala
   las dos líneas: una corriente vertical sobre la frontera entre blanco y negro
   perro o gato: la croqueta cambia de forma con el conmutador
   desde ingredientes: salen de cuadro y la escena deja de dibujarse. */
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

const canvas = document.querySelector(".escena");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const phone = matchMedia("(max-width: 767px)");
const RESPALDO = new URLSearchParams(location.search).has("respaldo3d"); // modo para generar img/croquetas.webp

function sinWebGL() {
  document.querySelectorAll(".respaldo3d").forEach(i => { i.hidden = false; });
  canvas.remove();
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: RESPALDO });
} catch (e) { sinWebGL(); }

if (renderer) init();

function init() {
  let ratio = Math.min(devicePixelRatio || 1, phone.matches ? 1.5 : 1.75);
  renderer.setPixelRatio(ratio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 12);

  const key = new THREE.DirectionalLight(0xfff1e0, 2.3);
  key.position.set(-4, 6, 7);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 1.6);
  rim.position.set(6, 2, -5);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(2, -4, 6);
  scene.add(key, rim, fill);

  /* ---------- textura de la croqueta: poros y grano, sin costuras ---------- */
  function texturas() {
    const S = 512;
    const bump = document.createElement("canvas"); bump.width = bump.height = S;
    const b = bump.getContext("2d");
    b.fillStyle = "#808080"; b.fillRect(0, 0, S, S);
    const rnd = mulberry(7);
    const dot = (x, y, r, c) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { b.beginPath(); b.arc(x + dx, y + dy, r, 0, 7); b.fillStyle = c; b.fill(); } };
    for (let i = 0; i < 2600; i++) dot(rnd() * S, rnd() * S, 0.6 + rnd() * 1.6, `rgba(${rnd() < 0.5 ? "40,40,40" : "200,200,200"},${0.25 + rnd() * 0.35})`);
    for (let i = 0; i < 260; i++) dot(rnd() * S, rnd() * S, 1.5 + rnd() * 3.5, `rgba(20,20,20,${0.4 + rnd() * 0.4})`); // poros
    const color = document.createElement("canvas"); color.width = color.height = S;
    const c = color.getContext("2d");
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++) {
      const x = rnd() * S, y = rnd() * S, r = 1 + rnd() * 5;
      for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, 7); c.fillStyle = rnd() < 0.7 ? `rgba(90,50,20,${0.08 + rnd() * 0.16})` : `rgba(255,220,170,${0.1 + rnd() * 0.15})`; c.fill(); }
    }
    const tb = new THREE.CanvasTexture(bump), tc = new THREE.CanvasTexture(color);
    [tb, tc].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.anisotropy = 4; });
    tc.colorSpace = THREE.SRGBColorSpace;
    return { tb, tc };
  }
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- geometría ----------
     perro: un anillo grueso, la croqueta clásica; gato: un triángulo redondeado y almohadillado */
  function croqueta(tipo, detalle) {
    let g;
    if (tipo === "gato") { g = new THREE.SphereGeometry(1, detalle * 2, detalle); g.rotateZ(Math.PI / 2); } // polos en el canto, donde no se notan
    else { g = new THREE.TorusGeometry(0.62, 0.38, detalle, detalle * 2); g.rotateX(Math.PI / 2); }
    const p = g.attributes.position, v = new THREE.Vector3();
    const fase = tipo === "gato" ? [1.7, 0.4, 2.9] : [0.3, 2.2, 1.1];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const phi = Math.atan2(v.z, v.x), sy = Math.sign(v.y) || 1, ay = Math.abs(v.y);
      let x, y, z;
      if (tipo === "gato") {
        const r = 0.68 / (1 - 0.21 * Math.cos(3 * phi)); // tres puntas suaves
        x = v.x * r; z = v.z * r;
        y = sy * (0.4 * Math.pow(ay, 0.5) - 0.05 * Math.exp(-(x * x + z * z) / 0.08)); // caras planas con un leve hundido
      } else {
        x = v.x; z = v.z; y = v.y * 0.66; // anillo bajo y macizo, como sale de la extrusora
      }
      // irregularidad de horno
      const n = Math.sin(x * 3.1 + fase[0]) * Math.sin(z * 2.7 + fase[1]) * 0.028 + Math.sin((x + z) * 6.3 + fase[2]) * 0.012 + Math.sin(y * 9 + x * 4) * 0.008;
      const len = Math.hypot(x, y, z) || 1;
      p.setXYZ(i, x + x / len * n, y + y / len * n, z + z / len * n);
    }
    g.computeVertexNormals();
    return g;
  }

  const { tb, tc } = texturas();
  const material = tono => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tono), map: tc, bumpMap: tb, bumpScale: 3.2, roughness: 0.86, metalness: 0,
    sheen: 0.25, sheenColor: new THREE.Color(0xb98050), sheenRoughness: 0.8
  });
  const matPerro = material(0x7a4523), matGato = material(0x5e3519);
  const N_PERRO = 16, N_GATO = 10;
  const nubePerro = new THREE.InstancedMesh(croqueta("perro", 28), matPerro, N_PERRO);
  const nubeGato = new THREE.InstancedMesh(croqueta("gato", 28), matGato, N_GATO);
  const grandePerro = new THREE.Mesh(croqueta("perro", 64), material(0x7e4826));
  const grandeGato = new THREE.Mesh(croqueta("gato", 64), material(0x63391c));
  [nubePerro, nubeGato].forEach(m => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; });
  scene.add(nubePerro, nubeGato, grandePerro, grandeGato);

  /* ---------- cada croqueta pequeña: su lugar en cada formación ---------- */
  const rnd = mulberry(42);
  const items = [];
  for (let k = 0; k < N_PERRO + N_GATO; k++) {
    const gato = k >= N_PERRO;
    items.push({
      gato, idx: gato ? k - N_PERRO : k,
      th: rnd() * Math.PI * 2, ph: Math.acos(rnd() * 2 - 1), rr: 0.72 + rnd() * 0.45, // nube
      ring: k / (N_PERRO + N_GATO) * Math.PI * 2 + rnd() * 0.12, ringR: 0.92 + rnd() * 0.22, // anillo
      u: rnd(), hel: rnd() * Math.PI * 2, // corriente
      size: (gato ? 0.05 : 0.058) * (0.8 + rnd() * 0.4),
      axis: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), spin: (0.25 + rnd() * 0.5) * (rnd() < 0.5 ? -1 : 1),
      q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3)),
      pos: new THREE.Vector3(), escala: 0, iniciado: false,
      tint: 0.86 + rnd() * 0.24
    });
  }
  items.forEach(it => { const m = it.gato ? nubeGato : nubePerro; m.setColorAt(it.idx, new THREE.Color(it.tint, it.tint * (0.97 + rnd() * 0.05), it.tint * (0.94 + rnd() * 0.08))); });
  nubePerro.instanceColor.needsUpdate = nubeGato.instanceColor.needsUpdate = true;

  /* ---------- pantalla → mundo ---------- */
  let vw = 1, vh = 1, mitadAlto = 1;
  function medir() {
    vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    mitadAlto = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  }
  const mundo = (px, py) => new THREE.Vector3((px / vw * 2 - 1) * mitadAlto * camera.aspect, -(py / vh * 2 - 1) * mitadAlto, 0);
  const unidad = px => px / vh * 2 * mitadAlto;
  function ancla(nombre) {
    const el = document.querySelector(`[data-ancla="${nombre}"]`);
    if (!el) return null;
    if (RESPALDO) return { c: new THREE.Vector3(0, 0, 0), base: unidad(Math.min(vw, vh)) * 0.84 };
    const r = el.getBoundingClientRect();
    let cx = r.left + r.width / 2;
    if (el.dataset.borde && !phone.matches) { const b = document.querySelector(el.dataset.borde); if (b) cx = b.getBoundingClientRect().right; }
    return { c: mundo(cx, r.top + r.height / 2), base: unidad(Math.max(60, Math.min(r.width, r.height))) };
  }

  /* ---------- estado de la página ---------- */
  const ORDEN = ["inicio", "holistico", "lineas", "especies", "ingredientes"];
  let pilar = -1, especie = "perro", forma = 0; // forma: 0 perro, 1 gato
  addEventListener("dibaq:pilar", e => { pilar = e.detail.i; });
  addEventListener("dibaq:especie", e => { especie = e.detail.especie; });
  const puntero = new THREE.Vector2(0, 0), punteroSuave = new THREE.Vector2(0, 0);
  addEventListener("pointermove", e => { if (e.pointerType === "mouse") puntero.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); }, { passive: true });

  // en qué tramo del recorrido estamos: entre la sección i y la i+1, con avance t
  function tramo() {
    if (RESPALDO) return { i: 0, t: 0 };
    const tops = ORDEN.map(id => { const s = document.getElementById(id); return s ? s.getBoundingClientRect().top : 1e6; });
    let i = 0;
    for (let k = 0; k < tops.length; k++) if (tops[k] <= 1) i = k;
    if (i >= tops.length - 1) return { i: tops.length - 1, t: 0 };
    const t = THREE.MathUtils.clamp(-tops[i] / Math.max(1, tops[i + 1] - tops[i]), 0, 1);
    return { i, t: t * t * (3 - 2 * t) };
  }

  /* formaciones: devuelven posición y escala de la croqueta k en la sección s */
  const tmp = new THREE.Vector3();
  function formacion(s, it, A, tiempo, out) {
    const vista = mitadAlto * 2;
    if (!A || s >= 4) { // fuera de cuadro, hacia arriba
      out.p.copy(it.pos).setY(vista * 0.8 + it.u * vista); out.s = 0; return;
    }
    const base = A.base;
    if (s === 0) {
      const R = base * 0.5 * it.rr, th = it.th + tiempo * 0.11;
      out.p.set(A.c.x + R * Math.cos(th) * Math.sin(it.ph) * 0.92, A.c.y + R * Math.cos(it.ph) * 0.88, R * Math.sin(th) * Math.sin(it.ph) * 0.9);
      out.s = base * it.size;
    } else if (s === 1) {
      const a = it.ring + tiempo * 0.16, R = base * 0.44 * it.ringR;
      out.p.set(A.c.x + R * Math.cos(a), A.c.y + R * Math.sin(a) * 0.34 + base * 0.02, R * Math.sin(a) * 0.9);
      out.s = base * it.size * 0.95;
    } else if (s === 2) {
      const alto = phone.matches ? base * 1.25 : vista * 1.02;
      const u = (it.u + tiempo * 0.018) % 1, a = it.hel + tiempo * 0.5;
      const R = base * (phone.matches ? 0.34 : 0.22);
      out.p.set(A.c.x + Math.sin(a) * R, A.c.y + (u - 0.5) * alto, Math.cos(a) * R);
      const borde = Math.min(u / 0.1, (1 - u) / 0.1, 1);
      out.s = base * it.size * 0.85 * Math.max(0, borde);
    } else if (s === 3) {
      const propia = (it.gato ? 1 : 0) === Math.round(forma);
      const a = it.ring + tiempo * 0.2, R = base * 0.5 * it.ringR;
      out.p.set(A.c.x + R * Math.cos(a), A.c.y + R * Math.sin(a) * 0.3 - base * 0.05, R * Math.sin(a) * 0.8);
      out.s = propia ? base * it.size * 0.8 : 0;
    }
  }
  function principal(s, A, tiempo, out) {
    if (!A || s >= 4) { out.p.set(out.p.x, mitadAlto * 2.4, 0); out.s = 0; return; }
    const bob = Math.sin(tiempo * 0.7) * 0.03 * A.base;
    out.p.set(A.c.x, A.c.y + bob, 0);
    out.s = A.base * (s === 0 ? 0.2 : s === 1 ? 0.22 : s === 2 ? 0.2 : 0.22);
  }

  /* ---------- bucle ---------- */
  const reloj = new THREE.Clock();
  let tiempo = 0, visible = true, dibujando = true, primero = true;
  const A0 = { p: new THREE.Vector3(), s: 0 }, A1 = { p: new THREE.Vector3(), s: 0 };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qs = new THREE.Quaternion(), sv = new THREE.Vector3();
  const grande = { p: new THREE.Vector3(), s: 0, rot: new THREE.Euler(0.5, 0.3, 0) };
  const rotObjetivo = new THREE.Euler();
  const MIRAR = [[0.35, -0.75], [0.35, 0.75], [-0.35, -0.75], [-0.35, 0.75]]; // hacia cada pilar
  let msLento = 0, lentos = 0;

  function frame() {
    const dt = Math.min(0.05, reloj.getDelta());
    if (!reduce.matches) tiempo += dt;
    const { i, t } = tramo();
    const nombres = ORDEN;
    const AA = ancla(nombres[i]), AB = i + 1 < nombres.length ? ancla(nombres[i + 1]) : null;
    const quieto = i >= 4 || (i === 3 && t > 0.98);
    if (quieto && !primero && items.every(it => it.escala < 0.001) && grande.s < 0.001) {
      if (dibujando) { renderer.clear(); dibujando = false; canvas.style.visibility = "hidden"; }
      return;
    }
    if (!dibujando) { dibujando = true; canvas.style.visibility = ""; }

    forma += ((especie === "gato" ? 1 : 0) - forma) * (reduce.matches ? 1 : Math.min(1, dt * 5));
    punteroSuave.lerp(puntero, Math.min(1, dt * 3));
    const k = reduce.matches || primero ? 1 : 1 - Math.exp(-dt * 9);

    // croquetas pequeñas
    let maxEscala = 0;
    items.forEach(it => {
      formacion(i, it, AA, tiempo, A0);
      formacion(i + 1, it, AB, tiempo, A1);
      tmp.copy(A0.p).lerp(A1.p, t);
      const s = A0.s + (A1.s - A0.s) * t;
      if (!it.iniciado) { it.pos.copy(tmp); it.escala = s; it.iniciado = true; }
      it.pos.lerp(tmp, k); it.escala += (s - it.escala) * k;
      maxEscala = Math.max(maxEscala, it.escala);
      q.setFromAxisAngle(it.axis, tiempo * it.spin);
      qs.copy(it.q0).multiply(q);
      sv.setScalar(Math.max(0.0001, it.escala));
      m4.compose(it.pos, qs, sv);
      (it.gato ? nubeGato : nubePerro).setMatrixAt(it.idx, m4);
    });
    nubePerro.instanceMatrix.needsUpdate = nubeGato.instanceMatrix.needsUpdate = true;

    // croqueta principal
    principal(i, AA, tiempo, A0);
    principal(i + 1, AB, tiempo, A1);
    tmp.copy(A0.p).lerp(A1.p, t);
    const gs = A0.s + (A1.s - A0.s) * t;
    if (primero) { grande.p.copy(tmp); grande.s = gs; }
    grande.p.lerp(tmp, k); grande.s += (gs - grande.s) * k;
    const enHolistico = (i === 1 && t < 0.5) || (i === 0 && t > 0.5);
    const mira = enHolistico && pilar >= 0 ? MIRAR[pilar] : null;
    rotObjetivo.set(
      (mira ? mira[0] : 0.55 + Math.sin(tiempo * 0.3) * 0.25) + punteroSuave.y * 0.35,
      (mira ? mira[1] : tiempo * 0.35) + punteroSuave.x * 0.5,
      mira ? 0 : Math.sin(tiempo * 0.23) * 0.2);
    const kr = reduce.matches ? 1 : Math.min(1, dt * (mira ? 4 : 2.5));
    grande.rot.x += (rotObjetivo.x - grande.rot.x) * kr;
    grande.rot.y += (rotObjetivo.y - grande.rot.y) * kr;
    grande.rot.z += (rotObjetivo.z - grande.rot.z) * kr;
    // en "perro o gato" la croqueta cambia de forma girando sobre sí misma
    const enEspecies = i === 3 || (i === 2 && t > 0.5);
    const f = enEspecies ? forma : 0;
    const giro = Math.sin(f * Math.PI) * Math.PI;
    grandePerro.position.copy(grande.p); grandeGato.position.copy(grande.p);
    grandePerro.rotation.set(grande.rot.x, grande.rot.y + giro, grande.rot.z);
    grandeGato.rotation.set(grande.rot.x, grande.rot.y + giro, grande.rot.z);
    grandePerro.scale.setScalar(Math.max(0.0001, grande.s * (1 - f)));
    grandeGato.scale.setScalar(Math.max(0.0001, grande.s * 1.1 * f));

    camera.position.x = punteroSuave.x * 0.25; camera.position.y = -punteroSuave.y * 0.15;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (primero) { primero = false; canvas.classList.add("lista"); document.querySelectorAll(".respaldo3d").forEach(i => { i.hidden = true; }); }

    // si el equipo no da abasto, bajamos la resolución una vez
    msLento += dt; lentos += dt > 1 / 30 ? 1 : 0;
    if (msLento > 3) { if (lentos > 60 && ratio > 1) { ratio = 1; renderer.setPixelRatio(1); medir(); } msLento = 0; lentos = 0; }
  }

  function loop() { if (visible) frame(); requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; reloj.getDelta(); });
  addEventListener("resize", medir);
  medir();
  if (RESPALDO) { // una sola imagen fija de la nube, con fondo transparente
    for (let n = 0; n < 3; n++) frame();
    window.respaldoListo = true;
    return;
  }
  requestAnimationFrame(loop);
}
