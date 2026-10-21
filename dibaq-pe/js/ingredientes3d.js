/* Dibaq: la "S" de ingredientes frescos, como en el empaque de Sense, armada en 3D.
   Los ingredientes se modelan por código (sin modelos externos): salmón, pavo, zanahoria, espinaca,
   hierbas, arándanos, camote y manzana. montarS(canvas, opciones) devuelve { progreso(p), destruir() }:
   progreso 0 = ingredientes dispersos flotando; 1 = la S armada. */
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const lienzo = (w, h, dibujar) => { const c = document.createElement("canvas"); c.width = w; c.height = h; dibujar(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

/* ---------- texturas ---------- */
function texSalmon() {
  return lienzo(512, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F47A4B"); g.addColorStop(0.55, "#EE6638"); g.addColorStop(1, "#E0562E");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = mulberry(3);
    for (let i = 0; i < 13; i++) { // vetas de grasa en "V", irregulares, como un filete real
      const x0 = -10 + i * 42 + r() * 14, a = 14 + r() * 16;
      x.strokeStyle = `rgba(255,222,200,${0.22 + r() * 0.3})`; x.lineWidth = 1.5 + r() * 3.5;
      x.beginPath(); x.moveTo(x0 - a, -10); x.quadraticCurveTo(x0 + a + r() * 10, h * (0.4 + r() * 0.2), x0 - a * 0.8, h + 10); x.stroke();
    }
    for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(${r() < 0.5 ? "255,240,230" : "150,40,10"},${r() * 0.07})`; x.fillRect(r() * w, r() * h, 2, 2); }
    const borde = x.createLinearGradient(0, 0, 0, h); borde.addColorStop(0, "rgba(255,255,255,.12)"); borde.addColorStop(0.15, "rgba(255,255,255,0)"); borde.addColorStop(0.9, "rgba(120,30,10,0)"); borde.addColorStop(1, "rgba(120,30,10,.18)");
    x.fillStyle = borde; x.fillRect(0, 0, w, h);
  });
}
function texPavo() {
  return lienzo(512, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#F0B7A6"); g.addColorStop(0.5, "#E9A493"); g.addColorStop(1, "#DE9180");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = mulberry(5);
    for (let i = 0; i < 220; i++) { // fibras largas de pechuga cruda
      x.strokeStyle = `rgba(${r() < 0.6 ? "196,104,92" : "255,226,214"},${0.08 + r() * 0.12})`; x.lineWidth = 1 + r() * 2.5;
      const y = r() * h; x.beginPath(); x.moveTo(-10, y); x.bezierCurveTo(w * 0.3, y + 14 * (r() - 0.5), w * 0.7, y - 14 * (r() - 0.5), w + 10, y + r() * 8); x.stroke();
    }
    for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(255,236,226,${0.12 + r() * 0.12})`; x.beginPath(); x.ellipse(r() * w, r() * h, 30 + r() * 60, 6 + r() * 10, r(), 0, 7); x.fill(); }
  });
}
function texZanahoria() {
  return lienzo(256, 256, (x, w, h) => {
    x.fillStyle = "#F2862E"; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, "#FFB066"); g.addColorStop(0.45, "#F99A45"); g.addColorStop(0.5, "#E9762A"); g.addColorStop(1, "#EE7F2D");
    x.fillStyle = g; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, 7); x.fill();
  });
}
function texHoja() {
  return lienzo(256, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#3E7A34"); g.addColorStop(1, "#2C5E28");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(190,230,170,.55)"; x.lineWidth = 6; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 0); x.stroke();
    x.lineWidth = 2.5;
    for (let i = 1; i < 9; i++) { const y = h - i * h / 9; x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w * 0.25, y - 30, 4, y - 60); x.moveTo(w / 2, y); x.quadraticCurveTo(w * 0.75, y - 30, w - 4, y - 60); x.stroke(); }
  });
}

/* ---------- geometrías ---------- */
function filete(ancho, alto, grosor) { // un filete con los bordes redondeados y la punta más fina
  const s = new THREE.Shape(), w = ancho / 2, h = alto / 2;
  s.moveTo(-w, -h * 0.75); s.quadraticCurveTo(-w, -h, -w * 0.7, -h);
  s.lineTo(w * 0.6, -h * 0.85); s.quadraticCurveTo(w * 1.05, -h * 0.6, w, 0); s.quadraticCurveTo(w * 0.95, h * 0.75, w * 0.55, h);
  s.lineTo(-w * 0.75, h); s.quadraticCurveTo(-w * 1.02, h, -w, h * 0.6); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: grosor, bevelEnabled: true, bevelThickness: grosor * 0.45, bevelSize: grosor * 0.5, bevelSegments: 6, curveSegments: 24 });
  g.center();
  { // un filete real no es una tabla: más grueso al centro, más fino en la punta, con la cara algo ondulada
    const q = g.attributes.position;
    for (let i = 0; i < q.count; i++) {
      const px = q.getX(i), py = q.getY(i), pz = q.getZ(i);
      const centro = 1 - Math.min(1, Math.abs(px) / (ancho * 0.6));
      const punta = 1 - Math.max(0, px / (ancho / 2)) * 0.45;
      q.setZ(i, pz * (0.75 + centro * 0.5) * punta + Math.sin(px * 5.1 + py * 3.3) * grosor * 0.06);
    }
  }
  const uv = g.attributes.uv, p = g.attributes.position; // mapa plano desde arriba para que las vetas se lean en la cara
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w) / ancho, (p.getY(i) + h) / alto);
  g.computeVertexNormals();
  return g;
}
function hoja(largo) {
  const s = new THREE.Shape(), a = largo * 0.36;
  s.moveTo(0, 0); s.bezierCurveTo(a, largo * 0.2, a * 0.9, largo * 0.75, 0, largo); s.bezierCurveTo(-a * 0.9, largo * 0.75, -a, largo * 0.2, 0, 0);
  const g = new THREE.ShapeGeometry(s, 24);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { // la hoja se curva a lo largo y a lo ancho
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(y / largo * Math.PI) * largo * 0.12 - (x * x) / (a * a) * largo * 0.08);
    uv.setXY(i, x / (2 * a) + 0.5, y / largo);
  }
  g.translate(0, -largo * 0.45, 0);
  g.computeVertexNormals();
  return g;
}
function ramita(largo, rnd) { // tallo de romero con agujas
  const grupo = new THREE.Group();
  const mt = new THREE.MeshStandardMaterial({ color: 0x5A7A3A, roughness: 0.8 });
  const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, largo, 6), mt);
  grupo.add(tallo);
  const aguja = new THREE.CapsuleGeometry(0.012, 0.12, 2, 6);
  const ma = new THREE.MeshStandardMaterial({ color: 0x4E7D3F, roughness: 0.7 });
  const n = 26, inst = new THREE.InstancedMesh(aguja, ma, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const y = -largo / 2 + (i + 0.5) / n * largo * 0.95, lado = i % 2 ? 1 : -1;
    e.set(0, rnd() * 6.28, lado * (0.9 + rnd() * 0.3)); q.setFromEuler(e);
    m.compose(new THREE.Vector3(0, y, 0), q, new THREE.Vector3(1, 1, 1)); inst.setMatrixAt(i, m);
  }
  grupo.add(inst);
  return grupo;
}

export function montarS(canvas, opciones = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opciones.captura });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 11);
  const key = new THREE.DirectionalLight(0xfff4e6, 2.2); key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight(0xe6f0ff, 1.2); rim.position.set(4, 1, -4);
  scene.add(key, rim);

  const rnd = mulberry(11);
  const M = {
    salmon: new THREE.MeshPhysicalMaterial({ map: texSalmon(), roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.5, sheen: 0.3, sheenColor: new THREE.Color(0xffc2a8) }),
    pavo: new THREE.MeshPhysicalMaterial({ map: texPavo(), roughness: 0.62, clearcoat: 0.08, sheen: 0.35, sheenColor: new THREE.Color(0xffd6c8) }),
    zanahoria: new THREE.MeshStandardMaterial({ map: texZanahoria(), roughness: 0.55 }),
    zanahoriaLado: new THREE.MeshStandardMaterial({ color: 0xEE7F2D, roughness: 0.6 }),
    hoja: new THREE.MeshStandardMaterial({ map: texHoja(), roughness: 0.55, side: THREE.DoubleSide }),
    arandano: new THREE.MeshPhysicalMaterial({ color: 0xB3122B, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    camote: new THREE.MeshStandardMaterial({ color: 0xF08A2E, roughness: 0.55 }),
    camoteCara: new THREE.MeshStandardMaterial({ color: 0xF7B25A, roughness: 0.6 }),
    manzana: new THREE.MeshPhysicalMaterial({ color: 0xB81E24, roughness: 0.4, clearcoat: 0.4 }),
    tallo: new THREE.MeshStandardMaterial({ color: 0x5E8A3C, roughness: 0.7 }),
  };

  // la S: dos arcos, como la letra del empaque (arriba a la derecha hasta abajo a la izquierda)
  const puntosS = [];
  for (let i = 0; i <= 24; i++) { const a = THREE.MathUtils.degToRad(15 + i / 24 * 255); puntosS.push(new THREE.Vector3(Math.cos(a) * 1.05, 1.0 + Math.sin(a) * 1.0, 0)); }
  for (let i = 1; i <= 24; i++) { const a = THREE.MathUtils.degToRad(90 - i / 24 * 255); puntosS.push(new THREE.Vector3(Math.cos(a) * 1.05, -1.0 + Math.sin(a) * 1.0, 0)); }
  const curva = new THREE.CatmullRomCurve3(puntosS, false, "centripetal");

  const piezas = [];
  const agregar = (obj, t, escala, opts = {}) => {
    const p = curva.getPointAt(t), tg = curva.getTangentAt(t);
    const normal = new THREE.Vector3(-tg.y, tg.x, 0);
    const destino = p.clone().addScaledVector(normal, (opts.desvio ?? (rnd() - 0.5) * 0.5)).setZ(opts.z ?? (rnd() - 0.5) * 0.6);
    const giroDestino = new THREE.Euler(opts.rx ?? (rnd() - 0.5) * 0.9, opts.ry ?? (rnd() - 0.5) * 0.9, (opts.rz ?? Math.atan2(tg.y, tg.x)) + (opts.rzVar ?? (rnd() - 0.5) * 0.8));
    const ang = rnd() * Math.PI * 2, rad = 3.4 + rnd() * 2.4;
    const origen = new THREE.Vector3(Math.cos(ang) * rad * 1.3, Math.sin(ang) * rad, -1 - rnd() * 3);
    obj.scale.setScalar(escala);
    piezas.push({ obj, destino, giroDestino: new THREE.Quaternion().setFromEuler(giroDestino), origen, giroOrigen: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6)), escala, fase: rnd() * 6.28, retraso: rnd() * 0.35 });
  };
  const disco = (r, alto, mLado, mCara) => new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, alto, 32), [mLado, mCara, mCara]);

  // hojas de espinaca: el cuerpo verde de la letra
  for (let i = 0; i < 26; i++) agregar(new THREE.Mesh(hoja(0.75 + rnd() * 0.45), M.hoja), 0.02 + i / 26 * 0.96 + rnd() * 0.02, 0.9 + rnd() * 0.35, { z: -0.25 + rnd() * 0.3 });
  // salmón arriba a la derecha y pavo abajo a la izquierda, como en el empaque
  agregar(new THREE.Mesh(filete(1.75, 0.85, 0.24), M.salmon), 0.1, 1.05, { rz: -0.2, rzVar: 0, rx: -0.45, ry: 0.1, desvio: 0.05, z: 0.45 });
  agregar(new THREE.Mesh(filete(1.15, 0.75, 0.22), M.pavo), 0.9, 1.05, { rz: 0.9, rzVar: 0, rx: -0.4, desvio: 0, z: 0.45 });
  // rodajas de camote y zanahoria en la curva central y la inferior
  for (let i = 0; i < 9; i++) agregar(disco(0.26, 0.09, M.camote, M.camoteCara), 0.36 + i * 0.03 + rnd() * 0.02, 0.85 + rnd() * 0.3, { rx: Math.PI / 2 + (rnd() - 0.5) * 1.1, z: 0.15 + rnd() * 0.3 });
  for (let i = 0; i < 9; i++) agregar(disco(0.2, 0.08, M.zanahoriaLado, M.zanahoria), 0.62 + i * 0.03 + rnd() * 0.02, 0.85 + rnd() * 0.35, { rx: Math.PI / 2 + (rnd() - 0.5) * 1.1, z: 0.2 + rnd() * 0.3 });
  // arándanos y una manzana roja
  for (let i = 0; i < 28; i++) agregar(new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), M.arandano), 0.18 + rnd() * 0.7, 0.85 + rnd() * 0.5, { desvio: (rnd() - 0.5) * 0.8, z: 0.2 + rnd() * 0.4 });
  { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), M.manzana); const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.18, 6), M.tallo); tallo.position.y = 0.32; m.add(tallo); agregar(m, 0.27, 1, { z: 0.3 }); }
  // ramitas de romero que asoman por los bordes
  for (let i = 0; i < 12; i++) agregar(ramita(0.8 + rnd() * 0.5, rnd), 0.04 + i * 0.08 + rnd() * 0.03, 1.1, { desvio: (rnd() < 0.5 ? -1 : 1) * (0.35 + rnd() * 0.15), rz: rnd() * 6.28 });

  const raiz = new THREE.Group(); scene.add(raiz);
  piezas.forEach(p => raiz.add(p.obj));

  let w = 1, h = 1, objetivo = opciones.progresoInicial ?? 0, actual = objetivo, t = 0, puntero = new THREE.Vector2(), vivo = true;
  const medir = () => { w = canvas.clientWidth || 600; h = canvas.clientHeight || 600; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); const ajuste = Math.max(1, 1.1 / camera.aspect); camera.position.z = 11 * ajuste; };
  medir();
  const ro = new ResizeObserver(medir); ro.observe(canvas);
  const mover = e => { const r = canvas.getBoundingClientRect(); puntero.set((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1); };
  addEventListener("pointermove", mover, { passive: true });

  const q = new THREE.Quaternion(), v = new THREE.Vector3();
  const suave = x => x * x * (3 - 2 * x);
  function pintar(dt) {
    t += dt;
    actual += (objetivo - actual) * Math.min(1, dt * 3.2);
    piezas.forEach(p => {
      const k = suave(Math.min(1, Math.max(0, (actual - p.retraso * 0.6) / (1 - p.retraso * 0.6))));
      v.copy(p.origen).lerp(p.destino, k);
      v.y += Math.sin(t * 0.9 + p.fase) * 0.04 * (1 - k * 0.6);
      p.obj.position.copy(v);
      q.copy(p.giroOrigen).slerp(p.giroDestino, k);
      p.obj.quaternion.copy(q);
      p.obj.rotateZ(Math.sin(t * 0.6 + p.fase) * 0.05);
    });
    raiz.rotation.y += ((puntero.x * 0.25 + Math.sin(t * 0.25) * 0.12) - raiz.rotation.y) * Math.min(1, dt * 2);
    raiz.rotation.x += ((puntero.y * 0.15) - raiz.rotation.x) * Math.min(1, dt * 2);
    renderer.render(scene, camera);
  }
  const reloj = new THREE.Clock();
  let activo = true;
  (function bucle() { if (!vivo) return; const dt = Math.min(0.05, reloj.getDelta()); if (activo && !opciones.captura) pintar(dt); requestAnimationFrame(bucle); })();
  return {
    progreso(p) { objetivo = p; },
    activar(si) { activo = si; if (si) reloj.getDelta(); },
    fijar(p, tiempo = 2) { objetivo = actual = p; t = tiempo; pintar(0); }, // para capturas deterministas
    destruir() { vivo = false; ro.disconnect(); removeEventListener("pointermove", mover); renderer.dispose(); }
  };
}
