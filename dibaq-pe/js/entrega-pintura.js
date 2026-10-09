// Procedural painting of the park plates (canvas 2D, done once per layout).
// Everything is seeded so the scene is identical on every load.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const gauss = (R) => { let u = 0; for (let i = 0; i < 4; i++) u += R(); return (u - 2) / 0.58; };

export function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

let filterOK = null;
function canFilter() {
  if (filterOK !== null) return filterOK;
  const c = mk(8, 8), g = c.getContext('2d');
  filterOK = typeof g.filter === 'string';
  if (filterOK) { g.filter = 'blur(2px)'; filterOK = g.filter === 'blur(2px)'; }
  return filterOK;
}

// returns a new canvas = blurred copy (px in canvas pixels)
export function blurred(src, px) {
  const out = mk(src.width, src.height), g = out.getContext('2d');
  if (px <= 0.3) { g.drawImage(src, 0, 0); return out; }
  if (canFilter()) {
    // pad by drawing edge-extended copy to avoid dark borders
    g.filter = `blur(${px}px)`;
    g.drawImage(src, 0, 0);
    g.filter = 'none';
    return out;
  }
  // fallback: pyramid downscale/upscale
  let cur = src, f = 1;
  while (f * 2 <= px) {
    const n = mk(cur.width / 2, cur.height / 2); const ng = n.getContext('2d');
    ng.imageSmoothingQuality = 'high'; ng.drawImage(cur, 0, 0, n.width, n.height); cur = n; f *= 2;
  }
  g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, out.width, out.height);
  return out;
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function mixHex(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, t)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function pick(R, arr, w) {
  let u = R(), s = 0;
  for (let i = 0; i < arr.length; i++) { s += w[i]; if (u <= s) return arr[i]; }
  return arr[arr.length - 1];
}

// a tapered, slightly curved blade (adds to current path)
function bladePath(g, x, y, h, lean, w, bend) {
  const tx = x + lean, ty = y - h;
  const cx = x + lean * 0.35 + bend, cy = y - h * 0.55;
  g.moveTo(x - w * 0.5, y);
  g.quadraticCurveTo(cx - w * 0.28, cy, tx, ty);
  g.quadraticCurveTo(cx + w * 0.28, cy, x + w * 0.5, y);
  g.closePath();
}

const SUN_BLADES = ['#41561c', '#5f7a26', '#7f9a33', '#a3b649', '#c9cf6c', '#ece2a0'];
const SUN_W = [0.18, 0.27, 0.24, 0.17, 0.10, 0.04];
const SHADE_BLADES = ['#1f2c0f', '#2c3d16', '#3d521e', '#526a27', '#6f8836', '#9db35a'];
const SHADE_W = [0.20, 0.28, 0.24, 0.15, 0.09, 0.04];

/* ------------------------------------------------------------------ */
/* Background plate, painted SHARP for the final camera (depth of field is applied
   per pixel in the shader). Covers screen x in [-mx, W+mx] and y in [0, ext*H]. */
export function paintBackground(L, ts) {
  const { W, H, yh, pawY } = L;
  const mx = L.mx, EXT = L.ext;
  const cw = (W + 2 * mx) * ts, ch = EXT * H * ts;
  const R = rng(1234);
  const sx = L.sun[0], sy = L.sun[1];
  const U = Math.min(W, H * 1.6) / 1300; // size unit

  // ---------- canopy plate (upper part, painted then heavily blurred)
  const cH = yh + 0.16 * H;
  const can = mk(cw, cH * ts), cg = can.getContext('2d');
  cg.scale(ts, ts); cg.translate(mx, 0);
  let gr = cg.createLinearGradient(0, 0, 0, cH);
  gr.addColorStop(0, '#45562a'); gr.addColorStop(0.5, '#5f7036'); gr.addColorStop(0.84, '#8c955c'); gr.addColorStop(1, '#a3a56c');
  cg.fillStyle = gr; cg.fillRect(-mx, 0, W + 2 * mx, cH);
  gr = cg.createRadialGradient(sx, sy, 0, sx, sy, 0.8 * W);
  gr.addColorStop(0, 'rgba(255,242,208,0.95)'); gr.addColorStop(0.2, 'rgba(240,226,165,0.55)'); gr.addColorStop(0.55, 'rgba(190,180,100,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  cg.fillStyle = gr; cg.fillRect(-mx, 0, W + 2 * mx, cH);
  // tree crowns: clusters of blobs sharing a tone (reads as out-of-focus trees)
  const crowns = [];
  for (let i = 0; i < 16; i++) crowns.push([-mx + (i + R() * 0.8) / 16 * (W + 2 * mx), (0.05 + R() * 0.55) * yh, (90 + R() * 160) * U, R()]);
  for (const [cx, cy, cr, cv] of crowns) {
    const dark = clamp(L.canopyDark(cx, cy) + (cv - 0.5) * 0.5);
    const dSun = Math.hypot(cx - sx, (cy - sy) * 1.3) / W;
    const lit = clamp(1 - dSun * 2.4) * (1 - dark * 0.5);
    const base = mixHex(mixHex('#7f913f', '#22320f', dark), '#d3c789', lit * 0.65);
    const n = 14 + Math.floor(R() * 10);
    for (let k = 0; k < n; k++) {
      const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * cr;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.75;
      const r = (0.25 + R() * 0.45) * cr;
      cg.fillStyle = mixHex(base, R() < 0.55 ? '#1d2a0e' : '#a4ae62', R() * 0.4);
      cg.globalAlpha = 0.45 + R() * 0.4;
      cg.beginPath(); cg.ellipse(x, y, r, r * (0.7 + R() * 0.4), R() * 3, 0, Math.PI * 2); cg.fill();
    }
  }
  for (let i = 0; i < 80; i++) {
    const a = R() * Math.PI * 2, d = Math.pow(R(), 1.3) * 0.5 * W;
    const x = sx + Math.cos(a) * d, y = clamp(sy + Math.sin(a) * d * 0.6, 0, yh * 0.92);
    const r = (10 + R() * 55) * U;
    cg.globalAlpha = (0.3 + R() * 0.5) * clamp(1 - d / (0.55 * W)) * (1 - L.canopyDark(x, y) * 0.75);
    cg.fillStyle = R() < 0.6 ? '#fff3d6' : '#f5e5ad';
    cg.beginPath(); cg.ellipse(x, y, r, r * (0.6 + R() * 0.6), R() * 3, 0, Math.PI * 2); cg.fill();
  }
  for (let i = 0; i < 40; i++) {
    const x = W * (0.45 + R() * 0.6), y = R() * yh * 0.8, r = (8 + R() * 30) * U;
    cg.globalAlpha = 0.10 + R() * 0.16; cg.fillStyle = '#e4e2bc';
    cg.beginPath(); cg.ellipse(x, y, r, r * (0.6 + R() * 0.5), R() * 3, 0, Math.PI * 2); cg.fill();
  }
  for (let i = 0; i < 26; i++) {
    const x = L.blossomX[0] * W + R() * (L.blossomX[1] - L.blossomX[0]) * W;
    const y = (0.06 + R() * 0.5) * yh;
    const r = (25 + R() * 60) * U;
    cg.globalAlpha = 0.05 + R() * 0.07; cg.fillStyle = R() < 0.6 ? '#e6cf8a' : '#d9c27a';
    cg.beginPath(); cg.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); cg.fill();
  }
  for (const tr of L.trunks) {
    const x = tr[0] * W, w = tr[1] * W, top = tr[2] * H;
    const dark = L.canopyDark(x, yh * 0.7);
    cg.globalAlpha = lerp(0.2, 0.42, dark);
    cg.fillStyle = dark > 0.5 ? '#2c2f1c' : '#625c3c';
    cg.beginPath();
    cg.moveTo(x - w * 0.5, yh + 0.012 * H); cg.lineTo(x - w * 0.35, top); cg.lineTo(x + w * 0.35, top); cg.lineTo(x + w * 0.5, yh + 0.012 * H); cg.fill();
  }
  cg.globalAlpha = 1;
  {
    const hz = mk(can.width, can.height), hg = hz.getContext('2d');
    hg.scale(ts, ts); hg.translate(mx, 0);
    let g4 = hg.createLinearGradient(0, yh - 0.12 * H, 0, yh + 0.06 * H);
    g4.addColorStop(0, 'rgba(240,230,176,0)'); g4.addColorStop(0.65, 'rgba(240,230,176,0.55)'); g4.addColorStop(1, 'rgba(224,216,152,0.25)');
    hg.fillStyle = g4; hg.fillRect(-mx, yh - 0.12 * H, W + 2 * mx, 0.18 * H);
    hg.setTransform(1, 0, 0, 1, 0, 0); hg.globalCompositeOperation = 'destination-in';
    g4 = hg.createLinearGradient(mx * ts + sx * ts - 0.1 * W * ts, 0, mx * ts + sx * ts + 0.75 * W * ts, 0);
    g4.addColorStop(0, 'rgba(0,0,0,1)'); g4.addColorStop(1, 'rgba(0,0,0,0.12)');
    hg.fillStyle = g4; hg.fillRect(0, 0, hz.width, hz.height);
    cg.save(); cg.setTransform(1, 0, 0, 1, 0, 0); cg.drawImage(hz, 0, 0); cg.restore();
  }
  // distant hedge / tree bases sitting on the horizon (breaks the line)
  for (let i = 0; i < 70; i++) {
    const x = -mx + R() * (W + 2 * mx), r = (20 + R() * 70) * U;
    const dark = L.canopyDark(x, yh);
    cg.globalAlpha = 0.18 + R() * 0.2; cg.fillStyle = mixHex('#7d8a4a', '#3c4f26', dark);
    cg.beginPath(); cg.ellipse(x, yh + (R() - 0.6) * 0.03 * H, r * 1.6, r * 0.45, 0, 0, Math.PI * 2); cg.fill();
  }
  const canB = blurred(can, 26 * U * ts);
  // bokeh: light through leaves
  const bok = mk(can.width, can.height), bg2 = bok.getContext('2d');
  bg2.scale(ts, ts); bg2.translate(mx, 0);
  bg2.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const x = -mx + R() * (W + 2 * mx), y = R() * (yh * 1.0);
    const dSun = Math.hypot(x - sx, y - sy) / W;
    const dark = L.canopyDark(x, y);
    if (R() > clamp(1.1 - dSun * 1.9) * 0.85 + 0.12) continue;
    const r = (4 + Math.pow(R(), 2.2) * 19) * U;
    const a = (0.08 + R() * 0.22) * (1 - dark * 0.6);
    const g3 = bg2.createRadialGradient(x, y, 0, x, y, r);
    const warm = R() < 0.75 ? '255,236,194' : '236,244,204';
    g3.addColorStop(0, `rgba(${warm},${a * 0.6})`); g3.addColorStop(0.8, `rgba(${warm},${a * 0.78})`); g3.addColorStop(0.93, `rgba(${warm},${a})`); g3.addColorStop(1, `rgba(${warm},0)`);
    bg2.fillStyle = g3; bg2.beginPath(); bg2.arc(x, y, r, 0, Math.PI * 2); bg2.fill();
  }
  const bokB = blurred(bok, 1.3 * ts);

  // ---------- lawn (sharp)
  const out = mk(cw, ch), lg = out.getContext('2d');
  lg.scale(ts, ts); lg.translate(mx, 0);
  const yEnd = EXT * H, P = pawY - yh;
  const sunBase = lg.createLinearGradient(0, yh, 0, yEnd);
  sunBase.addColorStop(0, '#d9d199'); sunBase.addColorStop(0.07, '#b2b762'); sunBase.addColorStop(0.3, '#869a3a'); sunBase.addColorStop(0.62, '#66792a'); sunBase.addColorStop(1, '#4b5e1f');
  lg.fillStyle = sunBase; lg.fillRect(-mx, yh - 2, W + 2 * mx, yEnd - yh + 2);
  // shade overlay masked by L.shade
  const shadeC = mk(cw, ch), sg = shadeC.getContext('2d');
  sg.scale(ts, ts); sg.translate(mx, 0);
  const shBase = sg.createLinearGradient(0, yh, 0, yEnd);
  shBase.addColorStop(0, '#6f7a50'); shBase.addColorStop(0.07, '#4f6236'); shBase.addColorStop(0.35, '#3c5228'); shBase.addColorStop(1, '#2a3b1a');
  sg.fillStyle = shBase; sg.fillRect(-mx, yh - 2, W + 2 * mx, yEnd - yh + 2);
  const mask = mk(cw / ts / 8, ch / ts / 8), mg = mask.getContext('2d');
  const md = mg.createImageData(mask.width, mask.height);
  for (let j = 0; j < mask.height; j++) for (let i = 0; i < mask.width; i++) {
    const x = i * 8 - mx, y = j * 8;
    const v = y < yh ? 0 : L.shade(x, y);
    md.data[(j * mask.width + i) * 4 + 3] = Math.round(v * 255);
  }
  mg.putImageData(md, 0, 0);
  sg.setTransform(1, 0, 0, 1, 0, 0);
  sg.globalCompositeOperation = 'destination-in'; sg.imageSmoothingQuality = 'high';
  sg.drawImage(mask, 0, 0, cw, ch);
  lg.save(); lg.setTransform(1, 0, 0, 1, 0, 0); lg.drawImage(shadeC, 0, 0); lg.restore();
  // soft mottles
  for (let i = 0; i < 110; i++) {
    const y = yh + Math.pow(R(), 1.2) * (yEnd - yh);
    const d = (y - yh) / P;
    const x = -mx + R() * (W + 2 * mx);
    const r = (30 + R() * 130) * U * (0.3 + d);
    const sh = L.shade(x, y);
    lg.globalAlpha = 0.08 + R() * 0.12;
    lg.fillStyle = R() < 0.5 ? (sh > 0.5 ? '#1e2c10' : '#55692a') : (sh > 0.5 ? '#587436' : '#cfc97a');
    lg.beginPath(); lg.ellipse(x, y, r * 1.8, r * 0.33 * (0.4 + d * 0.3), 0, 0, Math.PI * 2); lg.fill();
  }
  {
    const dp = mk(cw, ch), dg = dp.getContext('2d'); dg.scale(ts, ts); dg.translate(mx, 0);
    for (let i = 0; i < 160; i++) {
      const y = yh + 0.02 * H + Math.pow(R(), 1.1) * (yEnd - yh);
      const x = -mx + R() * (W + 2 * mx);
      if (L.shade(x, y) < 0.5 || R() > 0.8) continue;
      const d = (y - yh) / P;
      const r = (5 + R() * 22) * U * (0.35 + d);
      dg.globalAlpha = 0.10 + R() * 0.14; dg.fillStyle = '#b4c266';
      dg.beginPath(); dg.ellipse(x, y, r * (1.2 + R()), r * 0.4 * (0.4 + 0.3 * d), (R() - 0.5) * 0.3, 0, Math.PI * 2); dg.fill();
    }
    lg.save(); lg.setTransform(1, 0, 0, 1, 0, 0); lg.drawImage(blurred(dp, 5 * U * ts), 0, 0); lg.restore();
  }
  lg.globalAlpha = 1;
  // blades, perspective scaled, batched by colour
  const batches = new Map(), hi = [];
  const push = (col, b) => { if (!batches.has(col)) batches.set(col, []); batches.get(col).push(b); };
  let y = yh + 0.1 * P, count = 0;
  while (y < yEnd) {
    const d = (y - yh) / P;
    const len = L.bladeLen * d;
    const step = Math.max(0.8, len * 0.3);
    const n = Math.round((W + 2 * mx) / Math.max(1, len * (len < 9 ? 0.75 : 0.42)));
    for (let i = 0; i < n; i++) {
      const x = -mx + R() * (W + 2 * mx);
      const yy = y + R() * step;
      const shadeSide = R() < L.shade(x, yy);
      const col = shadeSide ? pick(R, SHADE_BLADES, SHADE_W) : pick(R, SUN_BLADES, SUN_W);
      const h = len * (0.5 + R() * 0.9);
      const lean = (R() - 0.5) * h * 0.8 + h * 0.05;
      const w = Math.max(0.6, h * (0.06 + R() * 0.06));
      const b = [x, yy, h, lean, w, (R() - 0.5) * h * 0.3];
      push(col, b); count++;
      if (len > 9 && !shadeSide && R() < 0.22) hi.push(b);
    }
    y += step;
  }
  for (const [col, arr] of batches) {
    lg.fillStyle = col; lg.beginPath();
    for (const b of arr) bladePath(lg, b[0], b[1], b[2], b[3], b[4], b[5]);
    lg.fill();
  }
  // backlit edges on some sunlit blades
  lg.strokeStyle = 'rgba(255,238,170,0.55)'; lg.lineCap = 'round';
  lg.beginPath();
  for (const b of hi) { lg.moveTo(b[0] + b[3] * 0.45, b[1] - b[2] * 0.5); lg.quadraticCurveTo(b[0] + b[3] * 0.6 + b[5] * 0.3, b[1] - b[2] * 0.8, b[0] + b[3], b[1] - b[2]); }
  lg.lineWidth = Math.max(0.7, L.bladeLen * 0.03); lg.stroke();
  // sheen toward the sun
  lg.globalCompositeOperation = 'screen';
  gr = lg.createRadialGradient(sx, yh, 0, sx, yh, 0.9 * W);
  gr.addColorStop(0, 'rgba(255,236,180,0.5)'); gr.addColorStop(0.35, 'rgba(255,230,170,0.14)'); gr.addColorStop(1, 'rgba(255,230,170,0)');
  lg.fillStyle = gr; lg.fillRect(-mx, yh, W + 2 * mx, yEnd - yh);
  lg.globalCompositeOperation = 'source-over';
  // ---------- final composite (opaque)
  lg.setTransform(1, 0, 0, 1, 0, 0);
  const fin = mk(cw, ch), fn = fin.getContext('2d');
  fn.fillStyle = '#62723a'; fn.fillRect(0, 0, cw, ch);
  fn.drawImage(canB, 0, 0);
  const lawnF = mk(cw, ch), lf = lawnF.getContext('2d');
  lf.drawImage(out, 0, 0);
  lf.globalCompositeOperation = 'destination-in';
  gr = lf.createLinearGradient(0, (yh - 0.004 * H) * ts, 0, (yh + 0.03 * H) * ts);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  lf.fillStyle = gr; lf.fillRect(0, 0, cw, ch);
  fn.drawImage(lawnF, 0, 0);
  const canFeather = mk(canB.width, canB.height), fg = canFeather.getContext('2d');
  fg.drawImage(canB, 0, 0);
  fg.globalCompositeOperation = 'destination-in';
  gr = fg.createLinearGradient(0, (yh + 0.0 * H) * ts, 0, (yh + 0.035 * H) * ts);
  gr.addColorStop(0, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  fg.fillStyle = gr; fg.fillRect(0, 0, canFeather.width, canFeather.height);
  fg.clearRect(0, 0, canFeather.width, yh * ts);
  fn.drawImage(canFeather, 0, 0);
  fn.globalCompositeOperation = 'lighter'; fn.drawImage(bokB, 0, 0); fn.globalCompositeOperation = 'source-over';
  return { canvas: fin, count };
}

/* ------------------------------------------------------------------ */
/* Foreground grass close to the lens, painted in SCREEN space as seen from its
   reference depth. spec.tips(xn, R) -> tip y (in H units); blades root at hTex. */
export function paintNearGrass(L, ts, spec, seed) {
  const { W, H } = L;
  const hT = spec.hTex * H;
  const c = mk(W * ts, hT * ts), g = c.getContext('2d');
  g.scale(ts, ts);
  const R = rng(seed);
  const U = Math.min(W, H * 1.6) / 1300;
  if (spec.baseTop < spec.hTex) {
    const baseTop = spec.baseTop * H;
    const gr = g.createLinearGradient(0, baseTop - 0.03 * H, 0, hT);
    gr.addColorStop(0, 'rgba(160,168,80,0)'); gr.addColorStop(0.05, 'rgba(150,160,70,0.98)'); gr.addColorStop(0.3, 'rgba(104,124,44,1)'); gr.addColorStop(1, 'rgba(42,56,18,1)');
    g.fillStyle = gr; g.fillRect(0, baseTop - 0.03 * H, W, hT - baseTop + 0.03 * H);
    // vertical streak texture inside the mass (stems at different depths)
    for (let i = 0; i < 700 * spec.edge; i++) {
      const x = R() * W, top = baseTop + R() * (hT - baseTop) * 0.6, w = (0.002 + R() * 0.007) * W;
      const tone = R();
      g.fillStyle = tone < 0.45 ? `rgba(40,56,18,${0.25 + R() * 0.35})` : tone < 0.85 ? `rgba(120,140,52,${0.2 + R() * 0.3})` : `rgba(206,204,120,${0.2 + R() * 0.3})`;
      g.beginPath(); bladePath(g, x, hT, hT - top, (R() - 0.5) * 0.03 * W, w, 0); g.fill();
    }
    // ragged top: many short blades along the mass edge
    for (let i = 0; i < 220 * spec.edge; i++) {
      const x = R() * W, h = (0.03 + R() * 0.07) * H, w = (0.004 + R() * 0.01) * W;
      const g2 = g.createLinearGradient(0, baseTop - h, 0, baseTop + 0.03 * H);
      g2.addColorStop(0, R() < 0.45 ? 'rgba(214,206,128,0.95)' : R() < 0.6 ? 'rgba(78,98,32,0.95)' : 'rgba(142,156,64,0.95)'); g2.addColorStop(1, 'rgba(128,146,56,1)');
      g.fillStyle = g2; g.beginPath(); bladePath(g, x, baseTop + 0.03 * H, h + 0.03 * H, (R() - 0.5) * h * 0.8, w, 0); g.fill();
    }
  }
  const blades = [];
  for (let i = 0; i < spec.n; i++) {
    const xn = R() * 1.1 - 0.05;
    const tip = spec.tips(xn, R);
    if (tip == null) continue;
    blades.push({ x: xn * W, tip: tip * H, w: (spec.wMin + R() * (spec.wMax - spec.wMin)) * W, lean: (R() - 0.5) * 0.14 * W, bend: (R() - 0.5) * 0.06 * W, glow: R() });
  }
  blades.sort((a, b) => b.tip - a.tip);
  for (const b of blades) {
    const root = hT, h = root - b.tip;
    const gr = g.createLinearGradient(0, b.tip, 0, b.tip + Math.min(h, 0.7 * H));
    const dk = b.glow < 0.25;
    gr.addColorStop(0, dk ? 'rgba(84,104,36,0.97)' : b.glow > 0.4 ? 'rgba(216,208,128,0.97)' : 'rgba(150,164,70,0.97)');
    gr.addColorStop(0.2, dk ? 'rgba(60,80,26,0.98)' : b.glow > 0.55 ? 'rgba(170,182,76,0.98)' : 'rgba(110,130,46,0.98)');
    gr.addColorStop(0.6, 'rgba(66,86,30,1)');
    gr.addColorStop(1, 'rgba(36,50,16,1)');
    g.fillStyle = gr; g.beginPath(); bladePath(g, b.x, root, h, b.lean, b.w, b.bend); g.fill();
    if (b.w > 5) {
      g.strokeStyle = 'rgba(40,56,18,0.22)'; g.lineWidth = Math.max(0.8, b.w * 0.06);
      g.beginPath(); g.moveTo(b.x + b.lean * 0.98, b.tip + h * 0.03); g.quadraticCurveTo(b.x + b.lean * 0.35 + b.bend, root - h * 0.55, b.x, root); g.stroke();
    }
    if (b.glow > 0.5) {
      g.strokeStyle = 'rgba(255,240,175,0.4)'; g.lineWidth = Math.max(1, b.w * 0.1);
      g.beginPath(); g.moveTo(b.x + b.lean, b.tip + 2); g.quadraticCurveTo(b.x + b.lean * 0.35 + b.bend - b.w * 0.2, root - h * 0.55, b.x - b.w * 0.4, root - h * 0.15); g.stroke();
    }
  }
  return blurred(c, spec.blur * U * ts);
}

/* ------------------------------------------------------------------ */
/* Grass tufts at the dog's paws, painted in DOG SOURCE pixels (971 wide).
   Rect: x 0..971, y 880..1060 */
export const TUFT_RECT = [-70, 860, 1110, 220];
export function paintTufts(seed) {
  const [rx, ry, rw, rh] = TUFT_RECT;
  const S = 1.0;
  const c = mk(rw * S, rh * S), g = c.getContext('2d');
  g.scale(S, S); g.translate(-rx, -ry);
  const R = rng(seed);
  const paws = [[125, 948, 70], [430, 1004, 75], [790, 934, 70], [240, 952, 60]];
  const batches = new Map();
  const add = (col, b) => { if (!batches.has(col)) batches.set(col, []); batches.get(col).push(b); };
  // ground line as function of x (depth of the paw contact)
  const gy = (x) => x < 300 ? lerp(950, 975, clamp((x - 60) / 240)) : x < 560 ? lerp(975, 1004, clamp((x - 300) / 130)) * 1 : lerp(1000, 936, clamp((x - 560) / 230));
  for (let i = 0; i < 520; i++) {
    let x, y;
    if (R() < 0.62) {
      const p = paws[Math.floor(R() * paws.length)];
      x = clamp(p[0] + gauss(R) * p[2], 15, 950); y = p[1] + 6 + Math.abs(gauss(R)) * 24;
    } else {
      x = 10 + R() * 900; y = gy(x) + 4 + R() * 40;
    }
    const near = clamp((y - 930) / 100);
    const h = (16 + R() * 30) * (0.8 + near * 0.6);
    const col = pick(R, SUN_BLADES, [0.14, 0.24, 0.26, 0.2, 0.12, 0.04]);
    add(col, [x, y, h, (R() - 0.5) * h * 0.7 + h * 0.08, Math.max(1.4, h * (0.08 + R() * 0.05)), (R() - 0.5) * h * 0.25]);
  }
  for (const [col, arr] of batches) {
    g.fillStyle = col; g.beginPath();
    for (const b of arr) bladePath(g, b[0], b[1], b[2], b[3], b[4], b[5]);
    g.fill();
  }
  // fade the lower edge so it blends with the lawn plate
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, 0, 0, c.height);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.7, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  return c;
}

/* ------------------------------------------------------------------ */
/* Contact + cast shadow in dog source pixels. Backlit: shadow falls toward camera. */
export const SHADOW_RECT = [-160, 820, 1520, 420];
export function paintShadow(img) {
  const [rx, ry, rw, rh] = SHADOW_RECT;
  const c = mk(rw, rh), g = c.getContext('2d');
  g.translate(-rx, -ry);
  const ground = 990;
  // silhouette, flipped toward camera and sheared right
  const sil = mk(img.width, img.height), sg = sil.getContext('2d');
  sg.drawImage(img, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#000'; sg.fillRect(0, 0, sil.width, sil.height);
  // x_s = x + (ground - y) * 0.30 ; y_s = ground + (ground - y) * 0.22
  g.save();
  g.transform(1, 0, -0.30, -0.22, 0.30 * ground, 1.22 * ground);
  g.globalAlpha = 0.5;
  g.drawImage(sil, 0, 0);
  g.restore();
  const cast = blurred(c, 14);
  const out = mk(rw, rh), og = out.getContext('2d');
  og.drawImage(cast, 0, 0);
  og.translate(-rx, -ry);
  // ambient occlusion
  const ao = mk(rw, rh), ag = ao.getContext('2d'); ag.translate(-rx, -ry);
  ag.fillStyle = 'rgba(0,0,0,0.55)';
  ag.beginPath(); ag.ellipse(440, 985, 430, 34, -0.03, 0, Math.PI * 2); ag.fill();
  ag.fillStyle = 'rgba(0,0,0,0.75)';
  for (const p of [[128, 952, 80, 13], [430, 1006, 70, 12], [792, 937, 62, 11], [260, 958, 90, 12]]) { ag.beginPath(); ag.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2); ag.fill(); }
  og.setTransform(1, 0, 0, 1, 0, 0);
  og.drawImage(blurred(ao, 16), 0, 0);
  og.globalAlpha = 0.8; og.drawImage(blurred(ao, 5), 0, 0); og.globalAlpha = 1;
  return out;
}
