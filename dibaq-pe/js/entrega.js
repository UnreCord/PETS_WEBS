/* Dibaq Perú · "La entrega": el perro que trae la bolsa (inicio).
   Foto real, viva: el recorte del bulldog con su bolsa Sense se dibuja como una malla deformable
   (respira, ladea la cabeza, la bolsa se balancea) dentro de un parque pintado por código.
   La cámara sube desde el pasto mientras el perro llega desde el fondo y se queda sentado.

   Uso:  const e = await montarEntrega(contenedor, { reducido, webgl });
   - El contenedor lo dimensiona la página; aquí se crea un panel con el lienzo.
   - La promesa se resuelve cuando el primer cuadro ya está visible. Sin WebGL, se rechaza (la página
     deja su imagen fija).
   - Se pausa cuando el contenedor sale de la pantalla o la pestaña se oculta.
   - window.__seek(segundos) dibuja ese instante exacto y pausa el reloj (para capturas). */
import * as THREE from 'three';
import { clamp, lerp, sstep, rng, paintBackground, paintNearGrass, paintTufts, TUFT_RECT, paintShadow, SHADOW_RECT } from './entrega-pintura.js';

// relativa a la página; la versión de un solo archivo la trae en window.DIBAQ_ASSETS
const RUTA_PERRO = (window.DIBAQ_ASSETS && window.DIBAQ_ASSETS['img/marca/perro-bolsa.webp']) || 'img/marca/perro-bolsa.webp';

export const TIEMPOS = { llega: 1.45, encuadre: 2.7, final: 4.2 };

const SRC = { w: 971, h: 1016, anchor: [470, 1000], pad: 72 };
const ZC0 = -0.3;    // dolly de cámara al inicio (final = 0)
const ZD0 = 2.8;     // profundidad inicial del perro (final = 1)
const { llega: T_ARRIVE, encuadre: T_DOLLY, final: T_FINAL } = TIEMPOS;
// pasto cercano: profundidad Z respecto de la cámara final y profundidad relativa con que se pintó
const NEAR = { n1: { Z: -0.06, dref: 0.24 }, n2: { Z: 0.03, dref: 0.33 }, n3: { Z: 0.42, dref: 0.42 } };

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const damp = (x, k, w) => x < 0 ? 0 : Math.exp(-x * k) * Math.sin(x * w);

/* ------------------------------------------------------------------ estilos del panel */
// mismas reglas que css/entrega.css; se inyectan solo si la página no las trae
const CSS = `
.entrega__panel{position:absolute;inset:clamp(10px,2.6vh,28px) clamp(46px,4.6vw,80px) clamp(22px,5.4vh,58px) 14%;border-radius:28px;overflow:hidden;isolation:isolate;transform:translateZ(0);background:radial-gradient(70% 52% at 20% 12%,rgba(255,249,220,.98),rgba(255,236,160,.35) 45%,rgba(255,236,160,0) 75%),linear-gradient(90deg,rgba(60,58,20,0) 50%,rgba(60,58,20,.16)),linear-gradient(180deg,#c4b467,#dccb78 40%,#d8c86a 55%,#a9a254 78%,#85814a);box-shadow:0 40px 70px -46px rgba(70,48,18,.55)}
.entrega__panel canvas{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0}
.entrega__panel.lista canvas{opacity:1}
@media (max-width:767px){.entrega__panel{inset:8px var(--g,20px) 0;border-radius:22px}}
`;
function estilos(panel) {
  if (document.getElementById('entrega-css') || getComputedStyle(panel).position === 'absolute') return;
  const s = document.createElement('style'); s.id = 'entrega-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ------------------------------------------------------------------ disposición según el panel */
function disposicion(W, H) {
  const edge = clamp(W / 900, 0.6, 1.6);
  if (W / H < 1.12) {
    // panel alto (escritorio y tableta): perro centrado, sol arriba a la izquierda (del lado del título)
    const s = Math.min(0.70 * H / 992, 0.86 * W / 968);
    const yh = 0.43 * H, pawY = 0.94 * H;
    const sun = [0.2 * W, 0.11 * H];
    const left = (W - 968 * s) / 2 + 0.01 * W;
    const t = yh / H;
    return {
      W, H, s, yh, pawY, P: pawY - yh, sun,
      ax: left + 470 * s, vpx: 0.5 * W,
      mx: 0.3 * W, ext: 1.32, bladeLen: 44 * s, dofK: 15 * H / 812,
      shade: (x, y) => sstep(0.55 * W, 1.05 * W, x + 0.2 * (y - yh)),
      canopyDark: (x, y) => clamp(0.38 + 0.45 * sstep(0.35 * W, 1.0 * W, x) - 0.65 * Math.exp(-Math.hypot(x - sun[0], y - sun[1]) / (0.32 * W))),
      blossomX: [0.5, 1.1],
      trunks: [[-0.02, 0.03, 0.03], [0.66, 0.032, 0.0], [0.93, 0.024, 0.05]],
      n1: { hTex: 1.2, n: 14, wMin: 0.05, wMax: 0.11, blur: 9, baseTop: 2, edge: 0,
        tips: (x, R) => x < 0.22 ? 0.16 + R() * 0.3 : x > 0.78 ? 0.14 + R() * 0.3 : (R() < 0.3 ? 0.5 + R() * 0.15 : null) },
      n2: { hTex: 1.2, n: Math.round(110 * edge), wMin: 0.008, wMax: 0.026, blur: 2.5, baseTop: t + 0.085, edge,
        tips: (x, R) => t + 0.01 + R() * 0.07 },
      n3: { hTex: 1.25, n: 26, wMin: 0.014, wMax: 0.034, blur: 5, baseTop: 2, edge: 0,
        tips: (x, R) => x < 0.08 ? 0.76 + R() * 0.14 : x > 0.92 ? 0.78 + R() * 0.14 : 0.975 + R() * 0.08 },
    };
  }
  // panel ancho (teléfono, sobre el texto)
  const s = Math.min(0.84 * H / 992, 0.64 * W / 968);
  const yh = 0.5 * H, pawY = 0.96 * H;
  const sun = [0.13 * W, 0.16 * H];
  const left = (W - 968 * s) / 2 + 0.05 * W;
  const t = yh / H;
  return {
    W, H, s, yh, pawY, P: pawY - yh, sun,
    ax: left + 470 * s, vpx: 0.52 * W,
    mx: 0.25 * W, ext: 1.32, bladeLen: 44 * s, dofK: 15 * H / 812,
    shade: (x, y) => sstep(0.6 * W, 1.05 * W, x + 0.2 * (y - yh)),
    canopyDark: (x, y) => clamp(0.4 + 0.45 * sstep(0.4 * W, 0.95 * W, x) - 0.65 * Math.exp(-Math.hypot(x - sun[0], y - sun[1]) / (0.22 * W))),
    blossomX: [0.6, 1.05],
    trunks: [[0.04, 0.016, 0.02], [0.6, 0.02, 0.0], [0.86, 0.026, 0.0]],
    n1: { hTex: 1.2, n: 18, wMin: 0.035, wMax: 0.08, blur: 9, baseTop: 2, edge: 0,
      tips: (x, R) => x < 0.22 ? 0.12 + R() * 0.3 : x > 0.78 ? 0.1 + R() * 0.3 : (R() < 0.25 ? 0.52 + R() * 0.15 : null) },
    n2: { hTex: 1.2, n: Math.round(120 * edge), wMin: 0.006, wMax: 0.02, blur: 2.5, baseTop: t + 0.085, edge,
      tips: (x, R) => t + 0.01 + R() * 0.07 },
    n3: { hTex: 1.25, n: 34, wMin: 0.01, wMax: 0.026, blur: 5, baseTop: 2, edge: 0,
      tips: (x, R) => x < 0.07 ? 0.76 + R() * 0.14 : x > 0.93 ? 0.78 + R() * 0.14 : 0.975 + R() * 0.08 },
  };
}

/* ------------------------------------------------------------------ shaders */
const GLSL_BLUR = /* glsl */`
const vec2 PD[12] = vec2[12](vec2(-0.326,-0.406), vec2(-0.840,-0.074), vec2(-0.696,0.457), vec2(-0.203,0.621), vec2(0.962,-0.195), vec2(0.473,-0.480), vec2(0.519,0.767), vec2(0.185,-0.893), vec2(0.507,0.064), vec2(0.896,0.412), vec2(-0.322,-0.933), vec2(-0.792,-0.598));
vec4 blurTex(sampler2D t, vec2 uv, float rTex, vec2 texSize, float baseBias) {
  if (rTex < 0.6) return texture(t, uv, baseBias);
  float b = baseBias + max(0.0, log2(rTex / 2.2));
  vec2 r = vec2(rTex) / texSize;
  vec4 c = texture(t, uv, b) * 1.4;
  for (int i = 0; i < 12; i++) c += texture(t, uv + PD[i] * r, b);
  return c / 13.4;
}`;

const VS_SCREEN = /* glsl */`
uniform vec4 uRect; uniform vec2 uRes;
varying vec2 vUv; varying vec2 vScreen;
void main(){ vUv = position.xy; vec2 q = uRect.xy + position.xy * uRect.zw; vScreen = q;
  gl_Position = vec4(q.x / uRes.x * 2.0 - 1.0, 1.0 - q.y / uRes.y * 2.0, 0.0, 1.0); }`;

// fondo: remapeo del suelo según el dolly + profundidad de campo por píxel
const FS_BG = /* glsl */`
uniform sampler2D uMap; uniform vec2 uTexSize; uniform vec2 uRes;
uniform float uYh, uP, uZc, uExt, uMx, uVpx, uInvF, uK, uMaxCoc, uCanopyBlur, uTs;
varying vec2 vScreen;
${GLSL_BLUR}
void main(){
  vec2 p = vScreen;
  float a = max(p.y - uYh, 0.001);
  float ground = step(0.0, p.y - uYh);
  float zr = uP / a;
  float Z = max(zr + uZc, 0.08);
  vec2 fG = vec2(uVpx + (p.x - uVpx) * zr / Z, uYh + uP / Z);
  vec2 f = mix(p, fG, ground);
  float cocG = min(uMaxCoc, uK * abs(1.0 / zr - uInvF));
  float band = smoothstep(-24.0, 0.0, p.y - uYh) * (1.0 - smoothstep(0.0, 36.0, p.y - uYh));
  float coc = mix(uCanopyBlur, cocG, ground * smoothstep(0.0, 36.0, p.y - uYh));
  coc = max(coc, max(uCanopyBlur, min(uMaxCoc, uK * uInvF)) * band);
  vec2 uv = vec2((f.x + uMx) / (uRes.x + 2.0 * uMx), f.y / (uExt * uRes.y));
  vec4 c = blurTex(uMap, uv, coc * uTs, uTexSize, 0.0);
  gl_FragColor = vec4(c.rgb, 1.0);
}`;

// capa de pasto cercano: desenfoque + vaivén
const FS_LAYER = /* glsl */`
uniform sampler2D uMap; uniform vec2 uTexSize; uniform float uBlur; uniform float uTs; uniform float uTime; uniform float uSway; uniform float uAlpha;
varying vec2 vUv;
${GLSL_BLUR}
void main(){
  vec2 uv = vUv;
  float tipW = pow(clamp(1.0 - uv.y * 1.6, 0.0, 1.0), 2.0);
  uv.x += uSway * tipW * (sin(uTime * 1.15 + uv.x * 11.0) * 0.7 + sin(uTime * 0.53 + uv.x * 23.0) * 0.3);
  vec4 c = blurTex(uMap, uv, uBlur * uTs, uTexSize, 0.0);
  gl_FragColor = c * uAlpha;
}`;

// cuadros en coordenadas del recorte (sombra, matas de pasto en las patas)
const VS_DOGQUAD = /* glsl */`
uniform vec4 uSrcRect; uniform vec2 uRes; uniform vec2 uAnchor; uniform vec2 uRootPos; uniform float uRootScale; uniform float uRootRot;
varying vec2 vUv;
void main(){ vUv = position.xy; vec2 p = uSrcRect.xy + position.xy * uSrcRect.zw;
  vec2 q = (p - uAnchor) * uRootScale; float s = sin(uRootRot), c = cos(uRootRot);
  q = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + uRootPos;
  gl_Position = vec4(q.x / uRes.x * 2.0 - 1.0, 1.0 - q.y / uRes.y * 2.0, 0.0, 1.0); }`;

const FS_SHADOW = /* glsl */`
uniform sampler2D uMap; uniform vec2 uTexSize; uniform float uBlur; uniform float uStrength; uniform vec3 uShadowCol;
varying vec2 vUv;
${GLSL_BLUR}
void main(){ float a = blurTex(uMap, vUv, uBlur, uTexSize, 0.0).a * uStrength;
  gl_FragColor = vec4(mix(vec3(1.0), uShadowCol, a), 1.0); }`;

const FS_TUFT = /* glsl */`
uniform sampler2D uMap; uniform vec2 uTexSize; uniform float uBlur; uniform vec3 uHaze; uniform float uHazeAmt; uniform float uAlpha;
varying vec2 vUv;
${GLSL_BLUR}
void main(){ vec4 c = blurTex(uMap, vUv, uBlur, uTexSize, 0.0);
  c.rgb = mix(c.rgb, uHaze * c.a, uHazeAmt);
  gl_FragColor = c * uAlpha; }`;

// el perro: malla con pesos (cabeza, bolsa, cuerpo, oreja)
const VS_DOG = /* glsl */`
attribute vec4 aW;
uniform vec2 uRes; uniform vec2 uSize; uniform float uPad; uniform vec2 uAnchor;
uniform vec2 uRootPos; uniform float uRootScale; uniform float uRootRot; uniform float uBob;
uniform float uHeadRot; uniform vec2 uHeadPivot; uniform float uHeadLift;
uniform float uPouchRot; uniform vec2 uPouchPivot;
uniform float uEarRot; uniform vec2 uEarPivot;
uniform float uBreath; uniform vec2 uChest; uniform float uSettle;
varying vec2 vUv;
vec2 rotA(vec2 p, vec2 c, float a){ float s = sin(a), co = cos(a); p -= c; return c + vec2(co * p.x - s * p.y, s * p.x + co * p.y); }
void main(){
  vec2 p = position.xy;
  vUv = (p + uPad) / uSize;
  p = rotA(p, uEarPivot, uEarRot * aW.w);
  p = rotA(p, uPouchPivot, uPouchRot * aW.y);
  p = rotA(p, uHeadPivot, uHeadRot * aW.x);
  p.y += uHeadLift * aW.x;
  p = uChest + (p - uChest) * (1.0 + uBreath * aW.z * vec2(1.0, 0.65));
  p.y = uAnchor.y + (p.y - uAnchor.y) * (1.0 - uSettle);
  p.x = uAnchor.x + (p.x - uAnchor.x) * (1.0 + uSettle * 0.3);
  p.y += uBob;
  vec2 q = (p - uAnchor) * uRootScale; float s = sin(uRootRot), c = cos(uRootRot);
  q = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + uRootPos;
  gl_Position = vec4(q.x / uRes.x * 2.0 - 1.0, 1.0 - q.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const FS_DOG = /* glsl */`
uniform sampler2D uMap; uniform vec2 uSize; uniform float uBlur;
uniform vec3 uSunCol; uniform float uWrap; uniform vec2 uSunDir; uniform vec3 uHaze; uniform float uHazeAmt; uniform float uExposure;
varying vec2 vUv;
${GLSL_BLUR}
void main(){
  vec4 c = blurTex(uMap, vUv, uBlur, uSize, 0.0);
  // luz que envuelve el borde del lado del sol (contraluz)
  float aw = textureLod(uMap, vUv, 4.3).a;
  vec2 d = vec2(12.0) / uSize;
  float ax = textureLod(uMap, vUv + vec2(d.x, 0.0), 3.4).a - textureLod(uMap, vUv - vec2(d.x, 0.0), 3.4).a;
  float ay = textureLod(uMap, vUv + vec2(0.0, d.y), 3.4).a - textureLod(uMap, vUv - vec2(0.0, d.y), 3.4).a;
  vec2 n = -vec2(ax, ay); float nl = length(n);
  float facing = nl > 1e-3 ? clamp(dot(n / nl, uSunDir), 0.0, 1.0) : 0.0;
  float edge = clamp(1.0 - aw, 0.0, 1.0);
  float wrap = c.a * edge * edge * (0.2 + 0.8 * facing);
  c.rgb += uSunCol * wrap * uWrap;
  c.rgb = mix(c.rgb, uHaze * c.a, uHazeAmt);
  c.rgb *= uExposure;
  gl_FragColor = c;
}`;

const FS_GLOW = /* glsl */`
uniform vec2 uRes; uniform vec2 uSun; uniform vec3 uSunCol; uniform float uGlow; uniform float uFlash;
varying vec2 vScreen;
void main(){
  vec2 d = (vScreen - uSun) / uRes.y; float r = length(d);
  vec3 col = uSunCol * (0.42 * exp(-r * 9.0) + 0.16 * exp(-r * 2.6)) * uGlow;
  col += uSunCol * 0.05 * exp(-abs(d.y) * 70.0) * exp(-abs(d.x) * 2.2) * uGlow;
  col += vec3(1.0, 0.95, 0.84) * uFlash;
  gl_FragColor = vec4(col, 0.0);
}`;

// polvo en el haz de sol y bokeh lento
const VS_PTS = /* glsl */`
attribute vec4 aSeed;
uniform float uTime; uniform vec2 uRes; uniform vec2 uSun; uniform float uAmt; uniform float uPx; uniform float uK;
varying float vA; varying float vSoft;
void main(){
  float big = step(0.86, aSeed.w);
  float sp = mix(0.010, 0.004, big);
  vec2 drift = vec2(sin(uTime * 0.21 + aSeed.z * 6.28) * 0.02 + uTime * sp * 0.55, -uTime * sp + sin(uTime * 0.37 + aSeed.w * 9.0) * 0.012);
  vec2 p = fract(aSeed.xy + drift) * uRes;
  float d = length((p - uSun) / uRes.y);
  float beam = exp(-d * 1.5);
  float tw = 0.55 + 0.45 * sin(uTime * (0.8 + aSeed.z * 2.0) + aSeed.x * 40.0);
  vA = uAmt * beam * tw * mix(0.85, 0.16, big);
  vSoft = big;
  gl_PointSize = mix(1.4 + aSeed.z * 2.4, (14.0 + aSeed.z * 30.0) * uK, big) * uPx;
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
}`;
const FS_PTS = /* glsl */`
varying float vA; varying float vSoft;
void main(){ vec2 c = gl_PointCoord * 2.0 - 1.0; float r = length(c);
  float a = mix(smoothstep(1.0, 0.1, r), smoothstep(1.0, 0.86, r) * 0.7 + 0.3 * smoothstep(1.0, 0.0, r), vSoft);
  gl_FragColor = vec4(vec3(1.0, 0.93, 0.78) * a * vA, 0.0); }`;

// revelado final: tono de tarde dorada, viñeta y grano de película (une lo pintado con la foto)
const VS_POST = /* glsl */`
varying vec2 vUv;
void main(){ vUv = position.xy; gl_Position = vec4(position.xy * 2.0 - 1.0, 0.0, 1.0); }`;
const FS_POST = /* glsl */`
uniform sampler2D uTex; uniform vec2 uRes; uniform float uTime; uniform float uGrain; uniform float uVig; uniform float uWarm;
varying vec2 vUv;
vec3 rgb2hsv(vec3 c){ vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x); }
vec3 hsv2rgb(vec3 c){ vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec3 c = texture2D(uTex, vUv).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  // verdes y amarillo-verdes hacia oliva y oro (no toca la piel del perro, el blanco ni el azul Sense)
  vec3 hsv = rgb2hsv(c);
  float w = smoothstep(0.07, 0.16, hsv.x) * (1.0 - smoothstep(0.30, 0.44, hsv.x)) * uWarm;
  hsv.x -= 0.05 * w;
  hsv.y *= 1.0 - 0.24 * w;
  vec3 g = hsv2rgb(hsv);
  float hl = smoothstep(0.35, 0.95, l);
  g *= mix(vec3(1.0), mix(vec3(1.02, 0.99, 0.95), vec3(1.05, 1.0, 0.87), hl), uWarm);  // luces ámbar
  g = mix(g, g * g * (3.0 - 2.0 * g), 0.22 * uWarm);                 // un poco de contraste
  g += vec3(0.026, 0.019, 0.006) * (1.0 - l) * uWarm;                // sombras cálidas, sin negro puro
  vec2 q = vUv - 0.5; q.x *= uRes.x / uRes.y;
  g *= 1.0 - uVig * smoothstep(0.3, 1.0, length(q * vec2(1.0, 0.9)));
  float n = hash(floor(vUv * uRes) + floor(fract(uTime * 0.37) * 97.0) * 13.1) - 0.5;
  g += n * uGrain * (0.6 + 0.4 * (1.0 - l));
  gl_FragColor = vec4(g, 1.0);
}`;

/* ------------------------------------------------------------------ pesos de la malla del perro */
const POUCH = [[548, 190], [700, 160], [885, 133], [968, 545], [706, 612]];
function sdPoly(px, py, poly) {
  let d = Infinity, inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const ex = xi - xj, ey = yi - yj, wx = px - xj, wy = py - yj;
    const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey));
    const dx = wx - ex * t, dy = wy - ey * t; d = Math.min(d, Math.hypot(dx, dy));
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside ? -d : d;
}
function dogWeights(x, y) {
  const wP = sstep(22, -14, sdPoly(x, y, POUCH));
  const s = (x - 575) * 0.36 + (y - 330) * -0.933;
  const wN = sstep(-40, 95, s);
  const wH = Math.max(wN, wP);
  const ex = (x - 430) / 430, ey = (y - 610) / 330;
  const wB = sstep(1.05, 0.35, Math.hypot(ex, ey)) * sstep(985, 800, y) * (1 - wH);
  const qx = (x - 445) / 70, qy = (y - 100) / 85;
  const wE = sstep(1.2, 0.5, Math.hypot(qx, qy)) * (1 - wP);
  return [wH, wP, wB, wE];
}
function dogGeo() {
  const NX = 64, NY = 66, pos = [], w = [], idx = [], pd = SRC.pad;
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
    const x = -pd + i / NX * (SRC.w + 2 * pd), y = -pd + j / NY * (SRC.h + 2 * pd);
    pos.push(x, y, 0); w.push(...dogWeights(x, y));
  }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aW', new THREE.Float32BufferAttribute(w, 4));
  g.setIndex(idx); return g;
}

function quadGeo() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], 3));
  g.setIndex([0, 2, 1, 1, 2, 3]);
  return g;
}
function texFrom(src) {
  const t = new THREE.Texture(src);
  t.flipY = false; t.premultiplyAlpha = true; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true; return t;
}
function material(vs, fs, uniforms, blend) {
  const m = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, transparent: true, side: THREE.DoubleSide });
  m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation;
  if (blend === 'normal') { m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor; }
  if (blend === 'add') { m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneFactor; }
  if (blend === 'mul') { m.blendSrc = THREE.ZeroFactor; m.blendDst = THREE.SrcColorFactor; }
  if (blend === 'opaque') { m.blending = THREE.NoBlending; m.transparent = false; }
  return m;
}

/* ------------------------------------------------------------------ línea de tiempo */
function timeline(t, L) {
  const st = {};
  // dolly: arranca en el pasto y sube/avanza con una salida larga hasta el encuadre final
  const pc = clamp(t / T_DOLLY);
  const zc = ZC0 * Math.pow(1 - pc, 2.4);
  // el perro llega trotando desde el fondo y se detiene en T_ARRIVE (el pasto aún le tapa las patas)
  const pa = clamp(t / T_ARRIVE);
  const Zd = lerp(ZD0, 1, 1 - Math.pow(1 - pa, 2));
  const speed = pa < 1 ? (1 - pa) : 0;
  const d = Zd - zc;
  // foco: empieza en el pasto cercano, pasa al perro y lo sigue
  const rack = sstep(0.0, 0.38, t);
  // se interpola la distancia de foco (no su inversa): el perro se enfoca pronto y el pasto se desenfoca suave
  const invF = 1 / lerp(Math.max(0.08, NEAR.n2.Z - zc + 0.05), d, rack);
  const K = L.dofK;
  st.zc = zc; st.d = d; st.invF = invF;
  st.x = L.vpx + (L.ax - L.vpx) / d;
  st.foot = L.yh + L.P / d;
  st.scale = L.s / d;
  st.cocDog = Math.min(10 * L.H / 812, K * Math.abs(1 / d - invF));
  for (const k of ['n1', 'n2', 'n3']) {
    const rel = NEAR[k].Z - zc;
    st[k] = { sigma: NEAR[k].dref / Math.max(rel, 0.004), coc: Math.min((k === 'n2' ? 17 : 30) * L.H / 812, K * Math.abs(1 / Math.max(rel, 0.01) - invF)), // el pasto es opaco mientras tapa al perro: solo se apaga cuando ya salió por abajo del cuadro
    alpha: k === 'n2' ? sstep(0.022, 0.042, rel) : sstep(0.018, 0.06, rel) };
  }
  st.canopyBlur = Math.min(20 * L.H / 812, K * Math.max(0, invF - 1));
  st.haze = 0.22 * clamp((d - 1) / 2.2);

  // trote: rebote, balanceo, cabeceo y vaivén de la bolsa, según la velocidad
  const bobPh = 2 * Math.PI * 4.2 * t, strPh = 2 * Math.PI * 2.1 * t;
  st.bob = -11 * speed * (0.5 - 0.5 * Math.cos(bobPh));
  st.roll = 0.012 * speed * Math.sin(strPh);
  let head = 0.018 * speed * Math.sin(bobPh - 1.2);
  let pouch = 0.05 * speed * Math.sin(strPh - 1.0);
  // se detiene: la bolsa sigue balanceándose y el perro se acomoda
  pouch += 0.07 * damp(t - (T_ARRIVE - 0.1), 3.0, 9.0);
  st.settle = 0.014 * Math.sin(Math.PI * clamp((t - T_ARRIVE) / 0.6)) * (t > T_ARRIVE ? 1 : 0);
  // ladea la cabeza hacia el título
  head += 0.034 * sstep(2.6, 3.3, t);
  let ear = 0.10 * damp(t - 2.9, 9, 30);
  let breath = 0, lift = 0;
  if (t > 1.9) {
    const tt = t - 1.9, idleIn = sstep(1.9, 3.2, t);
    breath = 0.0075 * Math.sin(2 * Math.PI * 0.42 * tt) * idleIn;
    lift = -1.8 * Math.sin(2 * Math.PI * 0.42 * tt - 0.7) * idleIn;
    const ti = t - T_FINAL;
    if (ti > 0) {
      const c = ti % 9;
      head -= 0.034 * sstep(1.5, 2.6, c) * (1 - sstep(5.6, 6.8, c));
      head += 0.008 * Math.sin(2 * Math.PI * 0.11 * ti);
      ear += 0.085 * damp((ti % 6.3) - 3.4, 9, 30);
    }
  }
  pouch += -0.5 * head + 0.008 * Math.sin(2 * Math.PI * 0.42 * t - 1.6);
  st.head = head; st.pouch = pouch; st.ear = ear; st.breath = breath; st.lift = lift;
  st.flash = 0.2 * (1 - easeOutCubic(clamp(t / 0.9)));
  st.glow = 1 + 0.04 * Math.sin(t * 0.7);
  st.motes = sstep(0.6, 2.4, t);
  return st;
}

/* ------------------------------------------------------------------ montaje */
export async function montarEntrega(contenedor, { reducido = false, webgl = true, imagen = RUTA_PERRO } = {}) {
  if (!contenedor) throw new Error('entrega: falta el contenedor');
  if (!webgl) throw new Error('entrega: sin WebGL');
  // el panel puede venir en el HTML (muestra su fondo al instante); si no, se crea
  let panel = contenedor.querySelector('.entrega__panel');
  const panelPropio = !panel;
  if (panelPropio) { panel = document.createElement('div'); panel.className = 'entrega__panel'; contenedor.appendChild(panel); }
  panel.setAttribute('aria-hidden', 'true');
  estilos(panel);
  const canvas = document.createElement('canvas');
  panel.appendChild(canvas);

  const dogImg = new Image();
  dogImg.decoding = 'async';
  dogImg.src = String(imagen);
  await dogImg.decode();

  THREE.ColorManagement.enabled = false;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { canvas.remove(); if (panelPropio) panel.remove(); throw e; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x8f8a4c, 1);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const post = new THREE.Scene();
  let rt = null;

  const U = {};
  let L = null, texs = [], layoutMeshes = [];
  const Q = quadGeo();
  const res = new THREE.Vector2(1, 1);
  const anchor = new THREE.Vector2(...SRC.anchor);
  const rootPos = new THREE.Vector2();
  const rootScale = { value: 1 }, rootRot = { value: 0 };
  const addMesh = (geo, mat, order, sc = scene) => { const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = order; sc.add(m); return m; };

  /* --- piezas que no dependen del tamaño */
  {
    const pd = SRC.pad, padC = document.createElement('canvas');
    padC.width = SRC.w + 2 * pd; padC.height = SRC.h + 2 * pd;
    padC.getContext('2d').drawImage(dogImg, pd, pd);
    U.dog = {
      uMap: { value: texFrom(padC) }, uSize: { value: new THREE.Vector2(SRC.w + 2 * pd, SRC.h + 2 * pd) }, uPad: { value: pd }, uRes: { value: res }, uAnchor: { value: anchor },
      uRootPos: { value: rootPos }, uRootScale: rootScale, uRootRot: rootRot, uBob: { value: 0 },
      uHeadRot: { value: 0 }, uHeadPivot: { value: new THREE.Vector2(590, 300) }, uHeadLift: { value: 0 },
      uPouchRot: { value: 0 }, uPouchPivot: { value: new THREE.Vector2(706, 186) },
      uEarRot: { value: 0 }, uEarPivot: { value: new THREE.Vector2(488, 112) },
      uBreath: { value: 0 }, uChest: { value: new THREE.Vector2(470, 640) }, uSettle: { value: 0 },
      uBlur: { value: 0 }, uSunCol: { value: new THREE.Vector3(1.0, 0.86, 0.6) }, uWrap: { value: 0.55 },
      uSunDir: { value: new THREE.Vector2(-0.62, -0.78) }, uHaze: { value: new THREE.Vector3(0.86, 0.82, 0.62) }, uHazeAmt: { value: 0 }, uExposure: { value: 1 },
    };
    addMesh(dogGeo(), material(VS_DOG, FS_DOG, U.dog, 'normal'), 40);
    const shC = paintShadow(dogImg);
    U.shadow = { uMap: { value: texFrom(shC) }, uTexSize: { value: new THREE.Vector2(shC.width, shC.height) }, uSrcRect: { value: new THREE.Vector4(...SHADOW_RECT) },
      uRes: { value: res }, uAnchor: { value: anchor }, uRootPos: { value: rootPos }, uRootScale: rootScale, uRootRot: { value: 0 },
      uBlur: { value: 0 }, uStrength: { value: 1 }, uShadowCol: { value: new THREE.Vector3(0.36, 0.36, 0.22) } };
    addMesh(Q, material(VS_DOGQUAD, FS_SHADOW, U.shadow, 'mul'), 30);
    const tC = paintTufts(77);
    U.tuft = { uMap: { value: texFrom(tC) }, uTexSize: { value: new THREE.Vector2(tC.width, tC.height) }, uSrcRect: { value: new THREE.Vector4(...TUFT_RECT) },
      uRes: { value: res }, uAnchor: { value: anchor }, uRootPos: { value: rootPos }, uRootScale: rootScale, uRootRot: { value: 0 },
      uBlur: { value: 0 }, uHaze: { value: U.dog.uHaze.value }, uHazeAmt: { value: 0 }, uAlpha: { value: 1 } };
    addMesh(Q, material(VS_DOGQUAD, FS_TUFT, U.tuft, 'normal'), 45);
    U.glow = { uRect: { value: new THREE.Vector4() }, uRes: { value: res }, uSun: { value: new THREE.Vector2() }, uSunCol: { value: new THREE.Vector3(1.0, 0.84, 0.58) }, uGlow: { value: 1 }, uFlash: { value: 0 } };
    addMesh(Q, material(VS_SCREEN, FS_GLOW, U.glow, 'add'), 70);
    const N = 90, seeds = new Float32Array(N * 4), R = rng(99);
    for (let i = 0; i < N * 4; i++) seeds[i] = R();
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    pg.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 4));
    U.pts = { uTime: { value: 0 }, uRes: { value: res }, uSun: { value: new THREE.Vector2() }, uAmt: { value: 0 }, uPx: { value: 1 }, uK: { value: 1 } };
    const pts = new THREE.Points(pg, material(VS_PTS, FS_PTS, U.pts, 'add')); pts.frustumCulled = false; pts.renderOrder = 75; scene.add(pts);
    U.post = { uTex: { value: null }, uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uGrain: { value: 0.028 }, uVig: { value: 0.22 }, uWarm: { value: 1 } };
    addMesh(Q, material(VS_POST, FS_POST, U.post, 'opaque'), 0, post);
  }

  /* --- piezas que dependen del tamaño del panel */
  let dpr = 1;
  function buildLayout() {
    for (const m of layoutMeshes) { scene.remove(m); m.material.dispose(); }
    for (const t of texs) t.dispose();
    layoutMeshes = []; texs = [];
    const W = Math.max(40, panel.clientWidth), H = Math.max(40, panel.clientHeight);
    // tope de píxeles: nítido en retina sin pasar de ~1,6 MP
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1.6e6 / (W * H)));
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
    if (rt) rt.dispose();
    rt = new THREE.WebGLRenderTarget(bw, bh, { depthBuffer: false, stencilBuffer: false });
    rt.texture.colorSpace = THREE.NoColorSpace;
    U.post.uTex.value = rt.texture; U.post.uRes.value.set(bw, bh);
    res.set(W, H);
    L = disposicion(W, H);
    const ts = Math.min(dpr, 1.25, 2200 / (W + 2 * L.mx));
    const bg = paintBackground(L, ts);
    const bgT = texFrom(bg.canvas); texs.push(bgT);
    U.bg = { uRect: { value: new THREE.Vector4(0, 0, W, H) }, uRes: { value: res }, uMap: { value: bgT }, uTexSize: { value: new THREE.Vector2(bg.canvas.width, bg.canvas.height) },
      uYh: { value: L.yh }, uP: { value: L.P }, uZc: { value: 0 }, uExt: { value: L.ext }, uMx: { value: L.mx }, uVpx: { value: L.vpx },
      uInvF: { value: 1 }, uK: { value: L.dofK }, uMaxCoc: { value: 26 * L.H / 812 }, uCanopyBlur: { value: 0 }, uTs: { value: ts } };
    layoutMeshes.push(addMesh(Q, material(VS_SCREEN, FS_BG, U.bg, 'opaque'), 0));
    const nts = Math.min(dpr, 0.8);
    const orders = { n1: 66, n2: 62, n3: 58 };
    for (const key of ['n1', 'n2', 'n3']) {
      const spec = L[key];
      const c = paintNearGrass(L, nts, spec, { n1: 11, n2: 23, n3: 37 }[key]);
      const t = texFrom(c); texs.push(t);
      U[key] = { uRect: { value: new THREE.Vector4(0, 0, W, spec.hTex * H) }, uRes: { value: res }, uMap: { value: t }, uTexSize: { value: new THREE.Vector2(c.width, c.height) },
        uBlur: { value: 0 }, uTs: { value: nts }, uTime: { value: 0 }, uSway: { value: 0.004 }, uAlpha: { value: 1 }, nts };
      U[key].mesh = addMesh(Q, material(VS_SCREEN, FS_LAYER, U[key], 'normal'), orders[key]);
      layoutMeshes.push(U[key].mesh);
    }
    U.glow.uRect.value.set(0, 0, W, H);
    U.glow.uSun.value.set(...L.sun); U.pts.uSun.value.set(...L.sun); U.pts.uPx.value = dpr; U.pts.uK.value = clamp(H / 760, 0.45, 1.2);
  }

  const llegada = T_ARRIVE + 0.75;
  function renderAt(t) {
    if (!L) return;
    const st = timeline(t, L);
    rootPos.set(st.x, st.foot); rootScale.value = st.scale; rootRot.value = st.roll;
    const d = U.dog;
    d.uBob.value = st.bob; d.uHeadRot.value = st.head; d.uPouchRot.value = st.pouch; d.uEarRot.value = st.ear;
    d.uBreath.value = st.breath; d.uHeadLift.value = st.lift; d.uSettle.value = st.settle;
    d.uBlur.value = st.cocDog / st.scale; d.uHazeAmt.value = st.haze;
    U.tuft.uBlur.value = st.cocDog / st.scale; U.tuft.uHazeAmt.value = st.haze;
    U.shadow.uBlur.value = st.cocDog / st.scale + 2;
    U.bg.uZc.value = st.zc; U.bg.uInvF.value = st.invF; U.bg.uCanopyBlur.value = st.canopyBlur;
    for (const k of ['n1', 'n2', 'n3']) {
      const u = U[k], g = st[k], sp = L[k], sg = g.sigma;
      u.uRect.value.set(L.vpx - L.vpx * sg, L.yh - L.yh * sg, L.W * sg, sp.hTex * L.H * sg);
      u.uBlur.value = g.coc; u.uTs.value = u.nts / sg; u.uAlpha.value = g.alpha; u.uTime.value = t;
      u.mesh.visible = g.alpha > 0.002;   // una capa que ya pasó no cuesta nada
    }
    U.glow.uGlow.value = st.glow; U.glow.uFlash.value = st.flash;
    U.pts.uTime.value = t; U.pts.uAmt.value = st.motes;
    U.post.uTime.value = t;
    renderer.setRenderTarget(rt); renderer.render(scene, cam);
    renderer.setRenderTarget(null); renderer.render(post, cam);
    // la página puede reaccionar a la llegada (p. ej. mostrar el apunte a mano)
    contenedor.classList.toggle('entrega--llego', t >= llegada);
  }

  /* --- reloj */
  let reloj = 0, ultimo = null, raf = 0, congelado = false, visible = true, destruido = false, ultimoCuadro = 0;
  const debeCorrer = () => !congelado && !reducido && visible && !document.hidden && !destruido;
  function cuadro(now) {
    raf = 0;
    if (!debeCorrer()) { ultimo = null; return; }
    if (ultimo === null) ultimo = now;
    const dt = Math.min(0.1, (now - ultimo) / 1000);
    // en reposo basta con ~30 fps
    if (reloj > T_FINAL + 1 && now - ultimoCuadro < 31) { raf = requestAnimationFrame(cuadro); return; }
    reloj += dt; ultimo = now; ultimoCuadro = now;
    renderAt(reloj);
    raf = requestAnimationFrame(cuadro);
  }
  const arrancar = () => { if (!raf && debeCorrer()) { ultimo = null; raf = requestAnimationFrame(cuadro); } };
  const detener = () => { if (raf) cancelAnimationFrame(raf); raf = 0; ultimo = null; };

  // un borde que solo toca la pantalla cuenta como fuera (ratio 0)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && e.intersectionRatio > 0; visible ? arrancar() : detener(); }, { threshold: [0, 0.01] });
  io.observe(contenedor);
  const onVis = () => (document.hidden ? detener() : arrancar());
  document.addEventListener('visibilitychange', onVis);

  let rto, tam = '';
  const ro = new ResizeObserver(() => {
    const sz = panel.clientWidth + 'x' + panel.clientHeight; if (sz === tam) return;
    const primero = !tam; tam = sz;
    if (primero) return;
    clearTimeout(rto); rto = setTimeout(() => { buildLayout(); renderAt(reducido ? T_FINAL : reloj); }, 160);
  });

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); destruir(); contenedor.classList.remove('viva', 'entrega--llego'); contenedor.classList.add('sin-animacion'); });

  function destruir() {
    destruido = true; detener(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    canvas.remove(); panel.classList.remove('lista'); if (panelPropio) panel.remove(); renderer.dispose();
  }

  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const control = {
    seek: async (s) => { congelado = true; detener(); reloj = s; renderAt(s); await raf2(); return s; },
    play: (desde = reloj) => { congelado = false; reloj = desde; arrancar(); },
    destruir,
    tiempos: TIEMPOS,
    get tiempo() { return reloj; },
    get corriendo() { return !!raf; },
  };
  window.__seek = control.seek;
  window.__play = control.play;

  buildLayout();
  tam = panel.clientWidth + 'x' + panel.clientHeight;
  ro.observe(panel);
  reloj = reducido ? T_FINAL : 0;
  renderAt(reloj);
  panel.classList.add('lista');
  await raf2();
  arrancar();
  return control;
}
