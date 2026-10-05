/*
 * CooKing Landing — script de la página.
 * Generado a partir de cooking-pe/index.html (misma fuente). Los datos que cambian desde WordPress
 * (puntos de venta, correo, mapa, rutas de imágenes) llegan en window.COOKING_LANDING.
 */
(() => {
"use strict";

const DATA = window.COOKING_LANDING || {};
const CONFIG = DATA.config || {};

const ICON_SVG = DATA.icons;
const RENDERS = DATA.renders;
const PHOTOS = DATA.photos;
const MAP = DATA.map;
const ISO = DATA.iso;       // CooKing isotipo traced to a vector path
const EMPTY = DATA.empty;   // camera of the empty-bowl render, to place poured kibble in 3D
const GEO = DATA.geo;       // Lima district outlines (lng/lat) for the street map overlay

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const deckMQ = window.matchMedia("(min-width: 1024px) and (min-height: 600px)"); // one section per screen
const phoneMQ = window.matchMedia("(max-width: 767px)");
const nf1 = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const svgIcon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_SVG[n] || ""}</svg>`;
const icon = n => `<span class="ico" aria-hidden="true">${svgIcon(n)}</span>`;
const seeded = seed => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const onView = (el, fn, threshold = 0.3) => {
  if (!("IntersectionObserver" in window)) { fn(); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
};

/* ---------- Data ---------- */
const COLORS = {
  pollo:  { c:"#D9A02F", c2:"#F3CF7A", c3:"#FFF0C9", dark:"#B37F17" },
  salmon: { c:"#E8562B", c2:"#F9A782", c3:"#FFE1D3", dark:"#B83E17" },
  cordero:{ c:"#8B6B4A", c2:"#D8BD9C", c3:"#F6EAD9", dark:"#6B5034" }
};

// Fotos de producto: copia los PNG a assets/img/productos/ con estos nombres; si falta uno, se dibuja la bolsa.
const PRODUCT_IMG = n => (DATA.productBase || "") + n;
const RECIPES = [
  { id:"puppy", species:"perro", age:"cachorro", protein:"pollo", stage:"Cachorro", name:"Cachorro con pollo", for:"Para cachorros de todas las razas.", sku:"Dog Chicken Puppy All Breeds", bag:["CHICKEN","PUPPY"], img:PRODUCT_IMG("puppy-recipe-new1.png"), ing:["poultry-leg","carrot"],
    protein_:29, fat:17, fiber:1.5, ash:7, kcal:3936, formats:[2, 12],
    desc:"Formulada para las demandas de un cachorro: alta en proteína para el crecimiento de su musculatura, con omega 3 para su desarrollo cerebral y hortalizas y extractos vegetales que fortalecen sus defensas.",
    comp:"Carne de ave (pollo fresco deshuesado min. 20%, pollo deshidratado min. 15%), patata, legumbres, grasa de ave, levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS), atún, hidrolizado de ave, aceite de pescado rico en Ω3, hortalizas (achicoria FOS, zanahoria, habas verdes, colinabo), sustancias minerales, extracto de Yucca schidigera, fibra de manzana, complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus), manano-oligosacáridos, fructo-oligosacáridos, taurina, botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo), extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, romero), antioxidantes naturales, probióticos (E. faecium NCIMB 10415 15x10⁶ UFC)." },
  { id:"lamb", species:"perro", age:"adulto", protein:"cordero", stage:"Adulto", name:"Adulto con cordero", for:"Para perros adultos de todas las razas.", sku:"Dog Lamb Adult All Breeds", bag:["LAMB","ALL BREEDS"], img:PRODUCT_IMG("dog-lamb-allbreeds.png"), ing:["meat-on-bone","potato"],
    protein_:26, fat:16, fiber:1.5, ash:7, kcal:3874, formats:[3, 12],
    desc:"Cocinada con cordero y pollo fresco, hidrolizado de ave, legumbres y una selección de extractos vegetales y plantas herbáceas con antioxidantes naturales, para una buena digestión y defensas fuertes.",
    comp:"Cordero (carne de cordero 25% mín. equivalente en fresco), carne fresca de pollo (mín. 20%), patata, hidrolizado de ave, legumbres, grasa de pollo, levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS), aceite de pescado rico en Ω3, hortalizas (achicoria, zanahoria, habas verdes, colinabo), sustancias minerales, extracto de Yucca schidigera, fibra de manzana, complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus), manano-oligosacáridos, fructo-oligosacáridos, taurina, botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo), extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, menta, romero), antioxidantes naturales, probióticos (E. faecium NCIMB 10415 15x10⁶ UFC), L-carnitina." },
  // The live site shows adult salmon cat/dog with swapped titles and data; pairing here follows each popup's own data. Verify against the bags.
  { id:"dog-salmon", species:"perro", age:"adulto", protein:"salmon", stage:"Adulto", name:"Adulto con salmón", for:"Para perros adultos de todas las razas.", sku:"Dog Salmon Adult All Breeds", bag:["SALMON","ALL BREEDS"], img:PRODUCT_IMG("dog-salmon-allbreeds.png"), ing:["fish","pea-pod"],
    protein_:27, fat:15, fiber:2, ash:6.5, kcal:3846, formats:[3, 12],
    desc:"Cocinada con salmón, legumbres, hidrolizado de ave y vegetales. Con prebióticos y probióticos para la digestión y extracto de mejillón de labios verdes para la salud de sus articulaciones.",
    comp:"Pescado (salmón fresco mín. 20%, pescado deshidratado min. 10%), patata, hidrolizado de ave, legumbres, aceite de pescado rico en Ω3, levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS), grasa de ave, hortalizas (achicoria, zanahoria, habas verdes, colinabo), sustancias minerales, extracto de Yucca schidigera, fibra de manzana, complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus), manano-oligosacáridos, fructo-oligosacáridos, taurina, botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo), extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, menta, romero), antioxidantes naturales, probióticos (E. faecium NCIMB 10415 15x10⁶ UFC), L-carnitina." },
  { id:"senior", species:"perro", age:"senior", protein:"pollo", stage:"Senior y light", name:"Senior y light con pollo", for:"Para perros senior o con tendencia al sobrepeso. Más fibra, menos grasa.", sku:"Dog Chicken Senior – Light", bag:["CHICKEN","SENIOR · LIGHT"], img:PRODUCT_IMG("senior-dog-new.png"), ing:["poultry-leg","green-apple"],
    protein_:27, fat:11, fiber:4.5, ash:6.5, kcal:3449, formats:[3, 12],
    desc:"Cocinada con pollo, legumbres y vegetales que aportan fibra. Con probióticos para la digestión y mejillón de labios verdes más condroprotectores para mantener sus articulaciones.",
    comp:"Carne de ave (carne fresca de pollo mín. 20%, pollo deshidratado min. 15%), patata, legumbres, levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS), hidrolizado de ave, fibras vegetales (lignocelulosa, fibra de manzana), grasa de pollo, aceite de pescado rico en Ω3, hortalizas (achicoria, zanahoria, habas verdes, colinabo), sustancias minerales, extracto de Yucca schidigera, complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, extracto de mejillón de labios verdes Perna canaliculus), manano-oligosacáridos, fructo-oligosacáridos, taurina, botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo), extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, menta, romero), antioxidantes naturales, L-carnitina, probióticos (E. faecium NCIMB 10415 15x10⁶ UFC)." },
  { id:"kitten", species:"gato", age:"cachorro", protein:"salmon", stage:"Gatito", name:"Kitten con salmón", for:"Para gatitos en sus primeras etapas de vida.", sku:"Cat Salmon Junior – Kitten", bag:["SALMON","KITTEN"], img:PRODUCT_IMG("Kitten-Salmon-cooking.png"), ing:["fish","blueberries"],
    protein_:37, fat:18, fiber:1.3, ash:7, kcal:4026, formats:[2],
    desc:"Fórmula de salmón con todos los nutrientes que tu gatito necesita en sus primeras etapas. Alta en proteína, con complejo condroprotector para músculos y articulaciones, y omega 3 para su desarrollo cognitivo y un pelaje sano.",
    comp:"Pescado (salmón fresco mínimo 25%; anchoveta mínimo 15%); patata; hidrolizado de ave; legumbres; grasa de pollo; levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS); hidrolizado de hígado de pollo; hortalizas (achicoria, FOS, zanahoria, habas verdes, colinabo); sustancias minerales; lignocelulosa; complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus); taurina; botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo); extracto de Yucca schidigera; extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, romero); antioxidantes naturales; probióticos (E. faecium NCIMB 10415 15x10⁶ UFC)." },
  { id:"cat-salmon", species:"gato", age:"adulto", protein:"salmon", stage:"Adulto", name:"Adulto con salmón", for:"Para gatos adultos. Con cardo mariano, un protector natural del hígado.", sku:"Cat Salmon Adult", bag:["SALMON","ADULT CAT"], img:PRODUCT_IMG("salmon-cat-new-cooking.png"), ing:["fish","leafy-green"],
    protein_:36, fat:17, fiber:2.5, ash:8, kcal:3812, formats:[2, 8],
    desc:"Receta de salmón para gatos adultos, con carne fresca de salmón, legumbres, hidrolizado de ave y una cuidada selección de vegetales. Aporta proteína de alto valor biológico y hepatoprotectores naturales.",
    comp:"Pescado (salmón fresco mínimo 20%); patata; hidrolizado de ave; legumbres; grasa de pollo; aceite de pescado rico en Ω3; levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS); hidrolizado de hígado de pollo; hortalizas (achicoria, FOS, zanahoria, habas verdes, colinabo); sustancias minerales; lignocelulosa; complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus); taurina; botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo); extracto de Yucca schidigera; extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, romero); antioxidantes naturales; probióticos (E. faecium NCIMB 10415 15x10⁶ UFC)." },
  { id:"sterilized", species:"gato", age:"adulto", protein:"pollo", stage:"Esterilizado", name:"Esterilizado con pollo", for:"Para gatos esterilizados. Reducida en grasa.", sku:"Cat Chicken Sterilized", bag:["CHICKEN","STERILIZED"], img:PRODUCT_IMG("sterilized-new-cooking.png"), ing:["poultry-leg","green-apple"],
    protein_:32, fat:11, fiber:4.5, ash:8, kcal:3413, formats:[2, 8],
    desc:"Pensada para las necesidades de un gato esterilizado: menos grasa y una fuente de proteína sabrosa y nutritiva a partir de pollo, con ingredientes naturales para los paladares más exigentes.",
    comp:"Carne de ave (pollo fresco deshuesado mínimo 20%; deshidratado de ave -pato, pavo- mínimo 20%); patata; legumbres; grasa de ave; levadura de cerveza Saccharomyces cerevisiae (fuente de nucleótidos, β-glucanos y MOS); atún; hidrolizado de hígado de pollo; aceite de pescado rico en Ω3; hortalizas (achicoria, zanahoria, habas verdes, colinabo); sustancias minerales; extracto de Yucca schidigera; fibra de manzana; complejo condroprotector (hidroclorato de glucosamina, sulfato de condroitina, MSM, extracto de mejillón de labios verdes Perna canaliculus); mananooligosacáridos; fructo-oligosacáridos; taurina; botánicos (caléndula, salvia, fenogreco, eneldo, tomillo, escaramujo); extractos vegetales (frutos rojos, cítricos, semilla de cardo mariano, semilla de té verde, menta, romero); antioxidantes naturales; probióticos (E. faecium NCIMB 10415 15x10⁶ UFC)." }
];

const CLAIMS = [
  { id:"grano", icons:["wheat-off"], title:"Libre de grano", text:"Todas nuestras variedades aumentan el aporte nutricional y disminuyen el riesgo de alergias e intolerancias alimentarias.", x:17, y:30.9 },
  { id:"europa", icons:["eu"], title:"Hecho en Europa", text:"Más de 30 años de experiencia nutriendo y dando salud a millones de mascotas en 27 países.", x:28.7, y:37.2 },
  { id:"proteina", icons:["dumbbell"], title:"80 % proteína animal", text:"El 80 % de las proteínas de cada receta es de origen animal, lo que aumenta su aporte nutricional.", x:81, y:30.9 },
  { id:"fresca", icons:["beef"], title:"Carne fresca", text:"Elaborado a base de carne fresca: proteína de la mejor calidad y con mayor palatabilidad.", x:69.3, y:37.2 }
];

const PERKS = [
  { icons:["utensils"], title:"Receta completa y balanceada", text:"Todo lo que necesita en cada plato." },
  { icons:["beef"], title:"Carne fresca primero", text:"Mínimo 20 % de carne o pescado fresco." },
  { icons:["wheat-off"], title:"Libre de grano", text:"Sin trigo, maíz ni arroz." },
  { icons:["dumbbell"], title:"80 % proteína animal", text:"Músculos fuertes en cada etapa." },
  { icons:["bone"], title:"Articulaciones sanas", text:"Glucosamina, condroitina y mejillón verde." },
  { icons:["shield-check"], title:"Refuerzo inmunológico", text:"β-glucanos y extractos vegetales." },
  { icons:["leaf"], title:"Digestión saludable", text:"Prebióticos y probióticos." },
  { icons:["sparkles"], title:"Piel y pelaje brillantes", text:"Omega 3 de aceite de pescado." }
];

const RIBBON = [["Pollo fresco","drumstick"],["Salmón","fish"],["Cordero","ham"],["Patata","potato"],["Legumbres","bean"],["Zanahoria","carrot"],["Habas verdes","pea-pod"],["Frutos rojos","cherry"],["Manzana","apple"],["Romero","rosemary"],["Cítricos","citrus"],["Achicoria","flower-2"]];

/* ---------- Images ---------- */
function paintIcons(root = document) {
  $$("[data-icon]", root).forEach(el => { el.innerHTML = svgIcon(el.dataset.icon); });
  $$("img[data-render]", root).forEach(img => { img.src = RENDERS[img.dataset.render]; });
  $$("img[data-photo]", root).forEach(img => { img.src = PHOTOS[img.dataset.photo]; });
}
function watchImage(img) {
  const holder = img.closest(".media") || img;
  const fail = () => {
    const next = img.dataset.fallback;
    if (next) { delete img.dataset.fallback; img.removeAttribute("srcset"); img.src = next; return; }
    holder.classList.add("is-missing");
  };
  img.addEventListener("error", fail);
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
}
function initLogo() {
  const bl = $("[data-badge-logo]"); if (bl) bl.addEventListener("error", () => bl.remove());
  const img = $("[data-logo]"), a = img.closest(".logo");
  const ok = () => a.classList.add("has-logo");
  if (img.complete && img.naturalWidth > 0) ok(); else img.addEventListener("load", ok, { once: true });
}

/* ---------- Header ---------- */
function initHeader() {
  const hdr = $(".hdr"), btn = $(".menu-btn"), nav = $("#mnav");
  const onScroll = () => hdr.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const close = () => { btn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); };
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { close(); btn.focus(); } });
}

/* ---------- Hero ---------- */
function initHero() {
  const hero = $("#hero");
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));
  if (reduceMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;
  let raf = 0;
  hero.addEventListener("pointermove", e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--px", ((e.clientX - r.left) / r.width - .5) * 2);
      hero.style.setProperty("--py", ((e.clientY - r.top) / r.height - .5) * 2);
    });
  });
  hero.addEventListener("pointerleave", () => { hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0); });
}

function initRibbon() {
  const group = RIBBON.map(([t, ic]) => `<span class="ribbon__item">${icon(ic)}${esc(t)}</span>`).join("");
  $("#ribbon").innerHTML = `<div class="ribbon__group">${group}</div><div class="ribbon__group">${group}</div>`;
}

/* ---------- Pan spin ---------- */
// The pan turns slowly on its own (a CSS animation); it only runs while the section is on screen.
function initPan() {
  const sec = $("#ingredientes"), stage = $(".ingr__stage", sec || document);
  if (sec && stage) { const inset = () => sec.classList.toggle("is-inset", innerWidth >= 768 && stage.offsetWidth < document.documentElement.clientWidth - 4); inset(); addEventListener("resize", inset, { passive: true }); }
  if (!sec || !("IntersectionObserver" in window)) { if (sec) sec.classList.add("is-on"); return; }
  new IntersectionObserver(es => es.forEach(en => sec.classList.toggle("is-on", en.isIntersecting)), { rootMargin: "80px 0px" }).observe(sec);
}

/* ---------- Bowl ---------- */
const stackIcons = icons => icon(icons[0]);
// Kibble around the 3D bowl: they burst out when the section appears, scatter when a point is opened,
// fall back into the bowl when the card is closed, and shoot out again when the bowl is tapped.
function initBowl() {
  const stage = $("#bowl"), art = $("#bowl-art"), card = $("#claim"), hots = $("#hots"), chips = $("#chips"), fly = $("#bowl-fly"), toss = $("#bowl-toss"), img = $(".bowl__img", art);
  const R = seeded(7);
  const still = reduceMotion.matches;
  const K = [];
  for (let i = 0; i < 16; i++) {
    const a = (-172 + i * (164 / 15) + (R() * 8 - 4)) * Math.PI / 180, rad = .9 + R() * .55, deck = deckMQ.matches || phoneMQ.matches;
    K.push({ hx: 50 + Math.cos(a) * (deck ? 41 : 38) * rad, hy: (deck ? 13 : 8) + Math.sin(a) * (deck ? 7 : 23) * rad, w: 3.6 + R() * 3.4, rot0: R() * 300 - 150, k: 1 + (i % 10), blur: R() > .8 ? 1.2 : 0,
      d: (i % 5) * .07 + R() * .18, ph: R() * 6.28, mode: "in", x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, s: .3, o: 0, t: 0 });
  }
  fly.innerHTML = K.map(k => `<span class="kib" style="--w:${k.w.toFixed(1)}%;--b:${k.blur}px"><img src="${RENDERS["kibble-" + k.k]}" alt="" width="120" height="120" draggable="false"></span>`).join("");
  $$(".kib", fly).forEach((el, i) => { K[i].el = el; });

  let W = 1, H = 1, ceil = -1e4;
  const head = $("#plato .sec__head");
  const measure = () => {
    W = art.clientWidth || 1; H = art.clientHeight || 1;
    ceil = head ? head.getBoundingClientRect().bottom + 10 - art.getBoundingClientRect().top : -1e4;
  };
  const top = k => ceil + k.w / 200 * W + 7; // highest center of a kibble (half its size + the bob)
  const home = k => ({ x: k.hx / 100 * W, y: Math.max(k.hy / 100 * H, top(k)) });
  const pile = () => ({ x: (50 + (R() - .5) * 30) / 100 * W, y: (13 + R() * 9) / 100 * H });
  const draw = (k, bob = 0) => {
    k.el.style.transform = `translate3d(${k.x.toFixed(1)}px,${(k.y + bob).toFixed(1)}px,0) rotate(${k.r.toFixed(1)}deg) scale(${k.s.toFixed(3)})`;
    k.el.style.opacity = k.o.toFixed(2);
  };
  const ballistic = (k, to, T, delay) => {
    const g = 2.1 * H, lim = top(k);
    to = { x: to.x, y: Math.max(to.y, lim) };
    const room = k.y - lim; // how far it may rise above its start
    if (room > 0) T = Math.min(T, (Math.sqrt(2 * g * room) + Math.sqrt(Math.max(0, 2 * g * (room + to.y - k.y)))) / g);
    k.p0 = { x: k.x, y: k.y }; k.to = to; k.T = T; k.t = -delay; k.g = g;
    k.v0 = { x: (to.x - k.x) / T, y: (to.y - k.y - .5 * g * T * T) / T };
  };

  function launch(k, delay) {
    const p = pile();
    Object.assign(k, { x: p.x, y: p.y, s: .3, o: 0, mode: "fly", r: k.rot0 * .2, vr: (R() - .5) * 600 });
    ballistic(k, home(k), .75 + R() * .3, delay);
  }
  const launchAll = () => { K.forEach((k, i) => launch(k, k.d + (i % 2) * .04)); state = "out"; sync(); wake(); };
  function fallAll() {
    let i = 0;
    for (const k of K) {
      if (k.mode === "in") continue;
      k.mode = "fall"; k.vr = (R() - .5) * 500; k.landed = false;
      ballistic(k, pile(), .55 + R() * .25, (i++ % 6) * .05 + R() * .12); // long enough to hop up a little before dropping in
    }
    state = "in"; sync(); wake();
  }
  function impulse(cx, cy, strength) {
    for (const k of K) {
      if (k.mode !== "float") continue;
      const dx = k.x - cx, dy = k.y - cy, d = Math.hypot(dx, dy) || 1;
      const f = strength * (.45 + .55 * Math.max(0, 1 - d / (W * .7)));
      k.vx += dx / d * f + (R() - .5) * f * .3; k.vy += dy / d * f - f * .35; k.vr += (R() - .5) * f * 1.2;
    }
    wake();
  }

  let state = "in", ptr = null, raf = 0, last = 0, visible = false;
  const sync = () => {
    toss.textContent = state === "in" ? "Lanzar las croquetas" : "Devolverlas al plato";
    toss.setAttribute("aria-label", state === "in" ? "Lanzar las croquetas fuera del plato" : "Devolver las croquetas al plato");
  };
  function frame(now) {
    raf = 0;
    const dt = Math.min(.033, (now - (last || now)) / 1000) || .016; last = now;
    let busy = false;
    for (const k of K) {
      if (k.mode === "fly" || k.mode === "fall") {
        busy = true;
        k.t += dt;
        if (k.t < 0) { if (k.mode === "fly") { k.o = 0; } draw(k); continue; }
        const t = Math.min(k.t, k.T);
        k.x = k.p0.x + k.v0.x * t; k.y = k.p0.y + k.v0.y * t + .5 * k.g * t * t;
        k.r += k.vr * dt;
        if (k.mode === "fly") { const e = Math.min(1, t / (k.T * .35)); k.s = .3 + .7 * e; k.o = Math.min(1, e * 1.6); }
        if (k.t >= k.T) {
          if (k.mode === "fly") { k.mode = "float"; k.vx = k.v0.x * .3; k.vy = (k.v0.y + k.g * k.T) * .3; }
          else { k.mode = "sink"; k.t = 0; if (!fallBump) { fallBump = true; bump(); } }
        }
      } else if (k.mode === "sink") {
        busy = true; k.t += dt;
        const e = Math.min(1, k.t / .16); k.s = 1 - .55 * e; k.o = 1 - e;
        if (e >= 1) { k.mode = "in"; k.o = 0; }
      } else if (k.mode === "float") {
        busy = true;
        const h = home(k);
        let ax = 70 * (h.x - k.x) - 7 * k.vx, ay = 70 * (h.y - k.y) - 7 * k.vy;
        if (ptr) {
          const dx = k.x - ptr.x, dy = k.y - ptr.y, d = Math.hypot(dx, dy), RAD = Math.max(70, W * .1);
          if (d < RAD && d > .1) { const f = 14000 * (1 - d / RAD) ** 2; ax += dx / d * f; ay += dy / d * f; k.vr += (dx > 0 ? 1 : -1) * f * dt * .08; }
        }
        k.vx += ax * dt; k.vy += ay * dt; k.x += k.vx * dt; k.y += k.vy * dt;
        const lim = top(k); if (k.y < lim) { k.y = lim; if (k.vy < 0) k.vy *= -.4; }
        k.vr *= Math.pow(.2, dt); k.r += k.vr * dt + Math.sin(now / 1900 + k.ph) * .05;
        k.s += (1 - k.s) * Math.min(1, dt * 8); k.o = 1;
      }
      draw(k, k.mode === "float" ? Math.sin(now / 1000 * 1.6 + k.ph) * 6 : 0);
    }
    if (K.every(k => k.mode === "in")) fallBump = false;
    if (busy && visible) raf = requestAnimationFrame(frame); else last = 0;
  }
  let fallBump = false;
  const wake = () => { if (!still && !raf && visible) raf = requestAnimationFrame(frame); };
  const bump = () => { img.classList.remove("is-bump"); void img.offsetWidth; img.classList.add("is-bump"); };
  const placeStill = () => { measure(); K.forEach(k => { const h = home(k); Object.assign(k, h, { s: 1, o: 1, r: k.rot0, mode: "float" }); draw(k); }); state = "out"; sync(); };

  hots.innerHTML = CLAIMS.map((c, i) => `<button class="hot" type="button" style="left:${c.x}%;top:${c.y}%;--i:${i}" aria-expanded="false" aria-controls="claim" data-claim="${c.id}"><span class="sr">${esc(c.title)}</span>${stackIcons(c.icons)}</button>`).join("");
  chips.innerHTML = CLAIMS.map(c => `<button class="chip" type="button" aria-pressed="false" data-claim="${c.id}">${stackIcons(c.icons)}${esc(c.title)}</button>`).join("");

  let current = null, auto = 0, touched = false;
  function open(id, { user = false } = {}) {
    const c = CLAIMS.find(x => x.id === id);
    if (!c) return;
    current = id;
    $$(".hot", hots).forEach(b => b.setAttribute("aria-expanded", String(b.dataset.claim === id)));
    $$(".chip", chips).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.claim === id)));
    card.innerHTML = `<button class="claim__close" type="button" aria-label="Cerrar">${svgIcon("x")}</button><div class="claim__icon">${stackIcons(c.icons)}</div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>`;
    card.hidden = false; card.removeAttribute("aria-hidden");
    card.classList.remove("is-side-l", "is-side-r");
    if (deckMQ.matches) {
      // one-screen layout: the card sits beside the bowl, on the side of the point, with a dashed line to it
      const hx = art.offsetLeft + c.x / 100 * art.clientWidth, hy = art.offsetTop + c.y / 100 * art.clientHeight, cw = card.offsetWidth;
      const side = c.x < 50 ? "l" : "r", gap = 46;
      card.classList.add("is-side-" + side);
      const top = Math.max(0, hy - card.offsetHeight / 2);
      // beside the outermost point of that side, so it never covers the other point
      const xs = CLAIMS.filter(x => (x.x < 50) === (side === "l")).map(x => art.offsetLeft + x.x / 100 * art.clientWidth);
      const left = side === "r" ? Math.max(...xs) + 34 + gap : Math.min(...xs) - 34 - gap - cw;
      Object.assign(card.style, { left: left + "px", top: top + "px", bottom: "auto" });
      card.style.setProperty("--ay", (hy - top) + "px");
      card.style.setProperty("--link", Math.max(0, side === "r" ? left - 11 - (hx + 34) : (hx - 34) - (left + cw + 11)) + "px");
    } else if (window.innerWidth >= 700) {
      const SW = stage.clientWidth, SH = stage.clientHeight;
      const hx = art.offsetLeft + c.x / 100 * art.clientWidth, hy = art.offsetTop + c.y / 100 * art.clientHeight, cw = card.offsetWidth;
      // the card goes above the highest point (with its pulse ring), so no point ever covers the text
      const hotTop = art.offsetTop + Math.min(...CLAIMS.map(x => x.y)) / 100 * art.clientHeight - 36;
      const cardBottom = hotTop - 14;
      const left = Math.min(Math.max(hx - cw / 2, 0), SW - cw);
      card.style.left = left + "px";
      card.style.top = "auto";
      card.style.bottom = (SH - cardBottom) + "px";
      card.style.setProperty("--arrow", Math.min(Math.max(hx - left, 24), cw - 24) + "px");
      card.style.setProperty("--link", Math.max(0, hy - 36 - (cardBottom + 11)) + "px");
    } else {
      card.style.left = card.style.bottom = "";
    }
    if (still) return;
    if (state === "in") launchAll();
    else impulse(c.x / 100 * W, c.y / 100 * H, user ? 520 : 160);
  }
  function closeCard({ user = false } = {}) {
    card.hidden = true; card.setAttribute("aria-hidden", "true"); current = null;
    $$(".hot", hots).forEach(x => x.setAttribute("aria-expanded", "false"));
    $$(".chip", chips).forEach(x => x.setAttribute("aria-pressed", "false"));
    if (user && !still && state === "out") fallAll();
  }
  const stopAuto = () => { touched = true; clearInterval(auto); };
  const onPick = e => {
    const b = e.target.closest("[data-claim]");
    if (!b) return;
    stopAuto();
    if (current === b.dataset.claim && !card.hidden) { closeCard({ user: true }); return; }
    open(b.dataset.claim, { user: true });
  };
  hots.addEventListener("click", onPick);
  chips.addEventListener("click", onPick);
  card.addEventListener("click", e => { if (e.target.closest(".claim__close")) { stopAuto(); const id = current; closeCard({ user: true }); const h = $(`.hot[data-claim="${id}"]`, hots); if (h) h.focus(); } });
  stage.addEventListener("keydown", e => { if (e.key === "Escape" && !card.hidden) { stopAuto(); closeCard({ user: true }); } });
  toss.addEventListener("click", () => {
    stopAuto();
    if (still) return;
    if (state === "in") launchAll(); else { if (!card.hidden) closeCard(); fallAll(); }
  });
  // tapping the food shoots the kibble out (or makes the floating ones jump); tapping a floating kibble flicks it
  art.addEventListener("click", e => {
    if (still || e.target.closest(".hot")) return;
    stopAuto();
    const r = art.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = K.find(k => k.mode === "float" && Math.hypot(k.x - x, k.y - y) < k.w / 100 * W * .7);
    if (hit) { hit.vx += (hit.x - x) * 18 + (R() - .5) * 200; hit.vy -= 420 + R() * 200; hit.vr += (R() - .5) * 1400; wake(); return; }
    if (y < H * .62) { if (state === "in") launchAll(); else impulse(x, H * .3, 420); }
  });
  if (window.matchMedia("(pointer: fine)").matches) {
    art.addEventListener("pointermove", e => { const r = art.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; wake(); });
    art.addEventListener("pointerleave", () => { ptr = null; });
  }
  // only real pointer movement counts as interaction (content scrolling under a still cursor does not)
  stage.addEventListener("pointermove", e => { if (e.movementX || e.movementY) stopAuto(); });
  new ResizeObserver(() => { measure(); if (still) placeStill(); else K.forEach(k => { if (k.mode === "in") draw(k); }); }).observe(art);
  addEventListener("resize", () => { if (current && !card.hidden) open(current); });
  new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); if (visible) wake(); }).observe(stage);

  measure(); K.forEach(k => draw(k)); sync();
  toss.hidden = still;
  onView(stage, () => {
    stage.classList.add("is-live");
    if (still) placeStill(); else launchAll();
    setTimeout(() => {
      if (!touched) open(CLAIMS[0].id);
      if (!still && !touched) {
        let i = 0;
        auto = setInterval(() => { if (touched) return clearInterval(auto); i = (i + 1) % CLAIMS.length; open(CLAIMS[i].id); }, 4200);
      }
    }, still ? 0 : 1700);
  }, 0.35);
}

/* ---------- Benefits orbit ---------- */
function initOrbit() {
  const orbit = $("#orbit"), line = $("#orbit-line"), mask = $("#orbit-mask"), ring = $("circle", line);
  const n = PERKS.length, NS = "http://www.w3.org/2000/svg";
  orbit.insertAdjacentHTML("beforeend", PERKS.map((p, i) =>
    `<div class="perk" style="--i:${i}"><span class="perk__ico">${icon(p.icons[0])}</span><div class="perk__txt"><b>${esc(p.title)}</b><span>${esc(p.text)}</span></div></div>`).join(""));
  const perks = $$(".perk", orbit);
  function layout() {
    if (innerWidth < 900) { perks.forEach(el => { el.style.left = el.style.top = ""; delete el.dataset.side; }); return; }
    const W = orbit.clientWidth, H = orbit.clientHeight;
    const lw = Math.round(Math.min(220, Math.max(150, W * .19)));
    // nodes start half a step off the top, so every label sits to the side of its icon (no label above or below)
    const angles = perks.map((_, i) => -Math.PI / 2 + Math.PI / n + i * 2 * Math.PI / n);
    perks.forEach((el, i) => { el.dataset.side = Math.cos(angles[i]) < 0 ? "l" : "r"; el.style.setProperty("--lw", lw + "px"); el.style.setProperty("--uy", Math.sin(angles[i]).toFixed(3)); });
    const hMax = Math.max(...perks.map(el => $(".perk__txt", el).offsetHeight));
    const uxMax = Math.max(...angles.map(a => Math.abs(Math.cos(a)))), uyMax = Math.max(...angles.map(a => Math.abs(Math.sin(a))));
    const r = Math.max(130, Math.min((W / 2 - 52 - lw - 6) / uxMax, (H / 2 - Math.max(40, hMax * (.5 + uyMax / 2)) - 4) / uyMax));
    orbit.style.setProperty("--disc", Math.round((r - 62) * 2) + "px");
    const pts = perks.map((el, i) => {
      const ux = Math.cos(angles[i]), uy = Math.sin(angles[i]);
      const x = W / 2 + r * ux, y = H / 2 + r * uy;
      el.style.left = x.toFixed(1) + "px"; el.style.top = y.toFixed(1) + "px";
      return { x, y, el };
    });
    // the dashed ring is masked around every icon and text block, so it never runs over the copy
    line.setAttribute("viewBox", `0 0 ${W} ${H}`);
    ring.setAttribute("cx", W / 2); ring.setAttribute("cy", H / 2); ring.setAttribute("r", r);
    const o = orbit.getBoundingClientRect();
    let holes = `<rect x="-20" y="-20" width="${W + 40}" height="${H + 40}" fill="#fff"/>`;
    for (const { x, y, el } of pts) {
      holes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="52" fill="#000"/>`;
      const t = $(".perk__txt", el).getBoundingClientRect(), sc = parseFloat(getComputedStyle(el).scale) || 1;
      // measure as if the entry animation had finished (scale 1 around the icon center)
      const L = x + (t.left - o.left - x) / sc, T = y + (t.top - o.top - y) / sc, Wd = t.width / sc, Hd = t.height / sc;
      holes += `<rect x="${(L - 14).toFixed(1)}" y="${(T - 12).toFixed(1)}" width="${(Wd + 28).toFixed(1)}" height="${(Hd + 24).toFixed(1)}" rx="16" fill="#000"/>`;
    }
    mask.innerHTML = holes;
  }
  new ResizeObserver(layout).observe(orbit);
  document.fonts && document.fonts.ready.then(layout);
  layout();
  onView(orbit, () => $("#beneficios").classList.add("is-live"), 0.25);
}

/* ---------- Recipes ---------- */
function bagSVG(r) {
  const k = COLORS[r.protein], g = "bg-" + r.id;
  return `<svg viewBox="0 0 170 236" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".8" stop-color="#F6F1EA"/><stop offset="1" stop-color="#E3D9CC"/></linearGradient></defs>
    <path d="M150 20 L166 28 L166 218 L152 226 Z" fill="${k.dark}"/>
    <path d="M18 20 L150 20 L152 226 L16 226 Z" fill="url(#${g})"/>
    <path d="M18 20 L150 20 L150 12 L144 18 L138 12 L132 18 L126 12 L120 18 L114 12 L108 18 L102 12 L96 18 L90 12 L84 18 L78 12 L72 18 L66 12 L60 18 L54 12 L48 18 L42 12 L36 18 L30 12 L24 18 L18 12 Z" fill="#F4EEE6"/>
    <rect x="18" y="20" width="132" height="9" fill="${k.c}"/>
    <path d="M140 29 L150 29 L152 226 L140 226 Z" fill="${k.c}" opacity=".9"/>
    <g transform="translate(71 38) scale(1.1)" fill="none" stroke="${k.c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG.crown}</g>
    <text x="80" y="82" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="19" fill="#5A4632">CooKing</text>
    <circle cx="80" cy="122" r="29" fill="${k.c3}"/>
    <g transform="translate(62 104) scale(1.5)" fill="none" stroke="${k.c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[r.species === "gato" ? "cat" : "dog"]}</g>
    <text x="26" y="175" font-family="Circular, Arial, sans-serif" font-weight="800" font-size="17" fill="${k.c}">${esc(r.bag[0])}</text>
    <text x="26" y="187" font-family="Circular, Arial, sans-serif" font-weight="700" font-size="7.4" fill="#5A4632">${esc(r.bag[1])}</text>
    <text x="134" y="175" text-anchor="end" font-family="Circular, Arial, sans-serif" font-weight="700" font-size="12" fill="#5A4632">${r.formats[0]}kg</text>
    <rect x="16" y="200" width="124" height="26" fill="${k.c}"/>
    <text x="78" y="217" text-anchor="middle" font-family="Circular, Arial, sans-serif" font-weight="800" font-size="8.4" letter-spacing=".6" fill="#FFFFFF">GRAIN FREE RECIPE</text>
  </svg>`;
}
function initRecipes() {
  const MAXP = 40;
  for (const species of ["perro", "gato"]) {
    $(`[data-grid="${species}"]`).innerHTML = RECIPES.filter(r => r.species === species).map((r, i) => {
      const k = COLORS[r.protein];
      const bars = [["Proteína", r.protein_], ["Grasa", r.fat], ["Fibra", r.fiber]].map(([l, v], j) =>
        `<div class="bar"><span>${l}</span><span class="bar__track" aria-hidden="true"><i style="--v:${(v / MAXP * 100).toFixed(1)}%;--i:${j}"></i></span><b>${nf1.format(v)}&nbsp;%</b></div>`).join("");
      return `<li class="rcard" data-id="${r.id}" style="--c:${k.c};--c2:${k.c2};--c3:${k.c3};--i:${i}">
        <div class="rcard__stage">
          <span class="rcard__pill">${esc(r.stage)}</span>
          <div class="rcard__bag">${bagSVG(r)}<img class="rcard__photo" src="${esc(r.img)}" alt="" loading="lazy" width="400" height="560"></div>
          <img class="rcard__kib rcard__kib--a" src="${RENDERS["kibble-" + (1 + i % 10)]}" alt="" width="120" height="120">
          <img class="rcard__kib rcard__kib--b" src="${RENDERS["kibble-" + (1 + (i + 4) % 10)]}" alt="" width="120" height="120">
          <img class="rcard__kib rcard__kib--c" src="${RENDERS["kibble-" + (1 + (i + 7) % 10)]}" alt="" width="120" height="120">
        </div>
        <h3>${esc(r.name)}</h3>
        <p class="rcard__for">${esc(r.for)}</p>
        <div class="bars">${bars}</div>
        <details><summary>Ver composición</summary>
          <div class="rcard__meta"><span>Ceniza <b>${nf1.format(r.ash)}&nbsp;%</b> y <b>${nf0.format(r.kcal)}</b>&nbsp;kcal/kg</span><span class="sizes" aria-label="Bolsas de ${r.formats.join(" y ")} kilos">${r.formats.map(f => `<span>${f}&nbsp;kg</span>`).join("")}</span></div>
          <p class="rcard__sku">En el empaque: <span translate="no">${esc(r.sku)}</span></p>
          <p class="rcard__desc">${esc(r.desc)}</p><p class="rcard__comp">${esc(r.comp)}</p>
        </details>
      </li>`;
    }).join("");
  }
  $$(".rcard__photo").forEach(img => {
    img.addEventListener("load", () => { if (img.naturalWidth) img.parentElement.classList.add("has-photo"); });
    img.addEventListener("error", () => img.remove());
  });

  // Cards in the same visual row get equal-height text blocks (title + description, analysis + SKU),
  // padding the last element of each block, so bars and "Ver composición" line up across the row.
  function equalize() {
    const blocks = [["h3", ".rcard__for"]];
    for (const grid of $$(".panel:not([hidden]) .rgrid")) {
      const cards = $$(".rcard:not([hidden])", grid);
      cards.forEach(c => blocks.forEach(bl => { $(bl[bl.length - 1], c).style.minHeight = ""; }));
      const rows = new Map();
      cards.forEach(c => { const top = Math.round(c.offsetTop); if (!rows.has(top)) rows.set(top, []); rows.get(top).push(c); });
      for (const group of rows.values()) for (const bl of blocks) {
        const hs = group.map(c => bl.map(sel => $(sel, c).getBoundingClientRect().height));
        const max = Math.max(...hs.map(h => h.reduce((a, x) => a + x, 0)));
        group.forEach((c, i) => { const own = hs[i].reduce((a, x) => a + x, 0), last = $(bl[bl.length - 1], c); last.style.minHeight = (hs[i][hs[i].length - 1] + max - own).toFixed(1) + "px"; });
      }
    }
  }

  // Filters: age stage and bag size, kept in the URL (?edad=adulto&bolsa=12)
  const AGE_LABEL = { perro: { cachorro: "Cachorro", adulto: "Adulto", senior: "Senior" }, gato: { cachorro: "Gatito", adulto: "Adulto", senior: "Senior" } };
  const AGE_ORDER = ["cachorro", "adulto", "senior"];
  const params = new URLSearchParams(location.search);
  const filt = { edad: params.get("edad") || "", bolsa: params.get("bolsa") || "" };
  const optsEl = { edad: $('[data-filter="edad"]'), bolsa: $('[data-filter="bolsa"]') }, countEl = $("#rcount");
  let species = "perro";
  const matches = r => (!filt.edad || r.age === filt.edad) && (!filt.bolsa || r.formats.includes(+filt.bolsa));
  function renderFilters() {
    const list = RECIPES.filter(r => r.species === species);
    const ages = AGE_ORDER.filter(a => list.some(r => r.age === a));
    const bags = [...new Set(list.flatMap(r => r.formats))].sort((a, b) => a - b);
    if (filt.edad && !ages.includes(filt.edad)) filt.edad = "";
    if (filt.bolsa && !bags.includes(+filt.bolsa)) filt.bolsa = "";
    const btn = (key, v, label) => `<button class="fopt" type="button" data-key="${key}" data-v="${v}" aria-pressed="${filt[key] === String(v)}">${label}</button>`;
    optsEl.edad.innerHTML = btn("edad", "", "Todas") + ages.map(a => btn("edad", a, AGE_LABEL[species][a])).join("");
    optsEl.bolsa.innerHTML = btn("bolsa", "", "Todas") + bags.map(b => btn("bolsa", b, `${b}&nbsp;kg`)).join("");
  }
  function applyFilters({ animate = true } = {}) {
    const panel = document.getElementById("panel-" + species), list = RECIPES.filter(r => r.species === species);
    let shown = 0;
    $$(".rcard", panel).forEach(li => { const ok = matches(RECIPES.find(r => r.id === li.dataset.id)); li.hidden = !ok; if (ok) li.style.setProperty("--i", shown++); });
    const empty = $(".rempty", panel), any = shown > 0;
    empty.hidden = any;
    if (!any) empty.innerHTML = `Ninguna receta para ${species === "perro" ? "perros" : "gatos"} coincide con estos filtros.`;
    const noun = species === "perro" ? "perros" : "gatos", filtered = filt.edad || filt.bolsa;
    countEl.innerHTML = filtered
      ? `${shown ? (shown === 1 ? "1 receta" : shown + " recetas") + " de " + list.length + " para " + noun + "." : "Sin resultados."}<button type="button" data-clear>Quitar filtros</button>`
      : `${list.length} recetas para ${noun}.`;
    const u = new URL(location.href);
    ["edad", "bolsa"].forEach(k => { if (filt[k]) u.searchParams.set(k, filt[k]); else u.searchParams.delete(k); });
    history.replaceState(null, "", u.pathname + u.search + u.hash);
    if (animate && !reduceMotion.matches) { panel.classList.remove("is-in"); requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-in"))); }
    requestAnimationFrame(equalize);
  }
  $("#rfilters").addEventListener("click", e => {
    const b = e.target.closest(".fopt"); if (!b) return;
    filt[b.dataset.key] = b.dataset.v;
    $$(`.fopt[data-key="${b.dataset.key}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    applyFilters();
  });
  countEl.addEventListener("click", e => { if (e.target.closest("[data-clear]")) { filt.edad = filt.bolsa = ""; renderFilters(); applyFilters(); } });

  const tabs = $$('[role="tab"]'), wrap = $(".tabs");
  function select(idx, focus = false) {
    tabs.forEach((t, i) => {
      const on = i === idx;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on; panel.classList.remove("is-in");
      if (on) requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-in")));
    });
    wrap.dataset.active = idx;
    species = idx === 1 ? "gato" : "perro";
    renderFilters(); applyFilters({ animate: false });
    if (focus) tabs[idx].focus();
  }
  // "Ver la receta" from the plan: open the right tab, clear filters, bring the card into view and highlight it
  document.addEventListener("cooking:receta", e => {
    const r = RECIPES.find(x => x.id === e.detail.id); if (!r) return;
    filt.edad = filt.bolsa = "";
    select(r.species === "gato" ? 1 : 0);
    requestAnimationFrame(() => {
      const li = $(`.rcard[data-id="${r.id}"]`); if (!li) return;
      li.scrollIntoView({ behavior: reduceMotion.matches ? "instant" : "smooth", block: "center", inline: "center" });
      $$(".rcard.is-pick").forEach(x => x.classList.remove("is-pick")); void li.offsetWidth; li.classList.add("is-pick");
    });
  });
  new ResizeObserver(() => equalize()).observe($("#recetas"));
  document.fonts && document.fonts.ready.then(equalize);
  renderFilters(); applyFilters({ animate: false });
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); select((i + 1) % tabs.length, true); }
    });
  });
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href="#dog"], a[href="#cat"]');
    if (a) select(a.getAttribute("href") === "#cat" ? 1 : 0);
  });
  if (location.hash === "#cat") select(1);
  onView($("#recetas"), () => $$(".panel:not([hidden])").forEach(p => p.classList.add("is-in")), 0.15);
}

/* ---------- Su plan CooKing ---------- */
// Reasons come from each recipe's own description.
const PLAN_WHY = {
  puppy: [["sparkles", "Omega 3 para su desarrollo"], ["dumbbell", "Alta en proteína para crecer"], ["shield-check", "Refuerza sus defensas"]],
  lamb: [["beef", "Cordero y pollo frescos"], ["leaf", "Buena digestión"], ["shield-check", "Defensas fuertes"]],
  "dog-salmon": [["fish", "Salmón fresco"], ["bone", "Mejillón verde para sus articulaciones"], ["leaf", "Prebióticos y probióticos"]],
  senior: [["leaf", "Más fibra, menos grasa"], ["bone", "Cuida sus articulaciones"], ["shield-check", "Probióticos para su digestión"]],
  kitten: [["sparkles", "Omega 3 para su desarrollo"], ["dumbbell", "Alta en proteína"], ["bone", "Músculos y articulaciones"]],
  "cat-salmon": [["fish", "Salmón fresco"], ["shield-check", "Cardo mariano para su hígado"], ["dumbbell", "Proteína de alto valor"]],
  sterilized: [["leaf", "Reducida en grasa"], ["drumstick", "Pollo para paladares exigentes"], ["shield-check", "Pensada para gatos esterilizados"]]
};
const PLAN_ALT = { lamb: "dog-salmon", "dog-salmon": "lamb", "cat-salmon": "sterilized", sterilized: "cat-salmon" };
function initPlan() {
  const form = $("#plan-form"), ageBox = $("#plan-age"), condBox = $("#plan-cond"), kg = $("#plan-kg"), kgOut = $("#plan-kg-out"), pet = $("#plan-pet");
  const O = { stage: $("#plan-stage"), bag: $("#plan-bag"), name: $("#plan-name"), for: $("#plan-for"), why: $("#plan-why"), alt: $("#plan-alt"), g: $("#plan-g"), meals: $("#plan-meals"), pile: $("#plan-pile"), bags: $("#plan-bags"), live: $("#plan-live"), see: $("#plan-see") };
  const AGES = {
    perro: [["cachorro", "Cachorro", "hasta 12 meses"], ["adulto", "Adulto", "de 1 a 7 años"], ["senior", "Senior", "más de 7 años"]],
    gato: [["cachorro", "Gatito", "hasta 12 meses"], ["adulto", "Adulto", "desde 1 año"]]
  };
  // Only options that define a product in the catalog; they change the recipe, never the grams.
  const CONDS = {
    perro: [["", "Ninguna"], ["peso", "Tiende a subir de peso"]],
    gato: [["", "Ninguna"], ["esterilizado", "Está esterilizado"]]
  };
  const KG = { perro: { min: 1, max: 70, step: .5, def: 12 }, gato: { min: 1, max: 10, step: .1, def: 4 } };
  const st = { species: "perro", age: "adulto", kg: 12, cond: "" };
  const radios = (name, list, val) => list.map(([v, t, sub]) =>
    `<label class="opt"><input type="radio" name="${name}" value="${v}"${v === val ? " checked" : ""}><span class="opt__box">${esc(t)}${sub ? `<small>${esc(sub)}</small>` : ""}</span></label>`).join("");
  function renderInputs() {
    if (!AGES[st.species].some(a => a[0] === st.age)) st.age = "adulto";
    if (!CONDS[st.species].some(c => c[0] === st.cond)) st.cond = "";
    ageBox.innerHTML = radios("plan-age", AGES[st.species], st.age);
    condBox.innerHTML = radios("plan-cond", CONDS[st.species], st.cond);
    const k = KG[st.species];
    Object.assign(kg, { min: k.min, max: k.max, step: k.step }); kg.value = st.kg = k.def;
    $("#plan-kg-min").textContent = `${k.min} kg`; $("#plan-kg-max").textContent = `${k.max} kg`;
    pet.innerHTML = icon(st.species === "gato" ? "cat" : "dog");
  }
  // recommendation from the real catalog
  function pick() {
    if (st.species === "gato") return st.age === "cachorro" ? "kitten" : st.cond === "esterilizado" ? "sterilized" : "cat-salmon";
    if (st.age === "cachorro") return "puppy";
    if (st.age === "senior" || st.cond === "peso") return "senior";
    return "lamb";
  }
  // maintenance energy = 70 × kg^0.75 × a standard factor for the life stage only (no condition adjustments)
  function factor() {
    if (st.age === "cachorro") return 2.5;
    if (st.species === "gato") return 1.4;
    return st.age === "senior" ? 1.4 : 1.6;
  }
  const round5 = v => Math.max(5, Math.round(v / 5) * 5);
  function tween(el, to) {
    const from = +el.dataset.v || 0; el.dataset.v = to;
    if (reduceMotion.matches || !from) { el.textContent = nf0.format(to); return; }
    const t0 = performance.now(), d = 520;
    const tick = now => { const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = nf0.format(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  let shownId = null, pileN = 0, liveT = 0;
  // "Cambia su alimento en 7 días" shows percentages until the visitor uses the plan, then this plan's grams
  let engaged = false, shared = null;
  const share = () => document.dispatchEvent(new CustomEvent("cooking:plan", { detail: shared }));
  function swapBag(r) {
    const k = COLORS[r.protein];
    const paint = () => {
      O.bag.innerHTML = bagSVG({ ...r, id: "plan-" + r.id });
      O.stage.style.cssText = `--c:${k.c};--c2:${k.c2};--c3:${k.c3}`;
      $$(".rcard__kib", O.stage).forEach(n => n.remove());
      O.stage.insertAdjacentHTML("beforeend", [["a", 1], ["b", 5], ["c", 8]].map(([c, i]) => `<img class="rcard__kib rcard__kib--${c}" src="${RENDERS["kibble-" + i]}" alt="" width="120" height="120">`).join(""));
    };
    if (reduceMotion.matches || !shownId || !O.bag.animate) { paint(); return; }
    O.bag.animate([{ transform: "rotateY(0) translateY(0)" }, { transform: "rotateY(90deg) translateY(-10px)" }], { duration: 180, easing: "ease-in" }).finished
      .then(() => { paint(); return O.bag.animate([{ transform: "rotateY(-90deg) translateY(-10px)" }, { transform: "rotateY(0) translateY(0)" }], { duration: 320, easing: "cubic-bezier(.3,1.4,.5,1)" }).finished; })
      .catch(() => paint());
  }
  function renderPile(g) {
    const n = Math.min(28, Math.max(3, Math.round(g / 9)));
    if (n === pileN) return;
    const R = seeded(5), rows = [9, 7, 6, 4, 2], spots = [];
    rows.forEach((cap, row) => { for (let j = 0; j < cap; j++) spots.push({ x: 50 + (j - (cap - 1) / 2) * 9.4 + (R() - .5) * 3, y: Math.max(0, row / 4 + (R() - .5) * .06), r: Math.round(R() * 360) }); });
    O.pile.innerHTML = spots.slice(0, n).map((p, i) => `<img${i < pileN ? ' class="is-old"' : ""} src="${RENDERS["kibble-" + (1 + i % 10)]}" alt="" width="120" height="120" style="--x:calc(${p.x.toFixed(1)}% - 11px);--y:${p.y.toFixed(3)};--r:${p.r}deg;--d:${((i - pileN) * 28)}ms">`).join("");
    pileN = n;
  }
  function update() {
    const id = pick(), r = RECIPES.find(x => x.id === id), k = COLORS[r.protein];
    const kcal = 70 * Math.pow(st.kg, .75) * factor(), g = round5(kcal / (r.kcal / 1000));
    const meals = st.age === "cachorro" ? 3 : 2;
    if (id !== shownId) {
      swapBag(r);
      O.name.textContent = r.name; O.for.textContent = r.for;
      O.why.innerHTML = PLAN_WHY[id].map(([ic, t], i) => `<li style="--i:${i}">${icon(ic)}${esc(t)}</li>`).join("");
      const alt = PLAN_ALT[id] && RECIPES.find(x => x.id === PLAN_ALT[id]);
      O.alt.hidden = !alt;
      if (alt) O.alt.innerHTML = `También le puede gustar: <button type="button" data-recipe="${alt.id}">${esc(alt.name)}</button>`;
      O.see.dataset.recipe = id;
      shownId = id;
    }
    tween(O.g, g);
    O.meals.innerHTML = `en ${meals} comidas de unos ${nf0.format(round5(g / meals))}&nbsp;g`;
    O.meals.title = `${nf0.format(Math.round(kcal))} kcal al día`;
    renderPile(g);
    const days = r.formats.map(f => Math.round(f * 1000 / g)), maxD = Math.max(...days);
    O.bags.innerHTML = r.formats.map((f, i) => `<li><span class="bags__kg">${f}&nbsp;kg</span><span class="bags__days">≈ ${nf0.format(days[i])}<small>días${days[i] >= 60 ? ` · ${nf1.format(days[i] / 30)} meses` : ""}</small></span><span class="bags__bar" style="--c:${k.c}"><i style="--w:0%"></i></span></li>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => $$(".bags__bar i", O.bags).forEach((b, i) => b.style.setProperty("--w", Math.max(8, days[i] / maxD * 100).toFixed(0) + "%"))));
    shared = { g, species: st.species, age: st.age, ageLabel: AGES[st.species].find(a => a[0] === st.age)[1], kg: st.kg, recipe: r.name };
    if (engaged) share();
    $("#plan-peek-name").textContent = r.name; $("#plan-peek-g").innerHTML = `${nf0.format(g)}&nbsp;g al día · ${nf1.format(st.kg)}&nbsp;kg`;
    clearTimeout(liveT);
    liveT = setTimeout(() => { O.live.textContent = `Receta recomendada: ${r.name}. Ración estimada: ${g} gramos al día, en ${meals} comidas.`; }, 700);
  }
  const syncRange = () => { const k = KG[st.species], p = (st.kg - k.min) / (k.max - k.min); kg.style.setProperty("--p", (p * 100).toFixed(1) + "%"); kgOut.textContent = `${nf1.format(st.kg)} kg`; pet.style.setProperty("--s", Math.round(34 + p * 50) + "px"); };
  form.addEventListener("submit", e => e.preventDefault());
  form.addEventListener("change", e => {
    const t = e.target;
    engaged = true;
    if (t.name === "plan-sp") { st.species = t.value; renderInputs(); syncRange(); }
    else if (t.name === "plan-age") st.age = t.value;
    else if (t.name === "plan-cond") st.cond = t.value;
    update();
  });
  kg.addEventListener("input", () => { engaged = true; st.kg = +kg.value; syncRange(); update(); });
  $("#plan-switch").addEventListener("click", () => { engaged = true; share(); });
  $("#plan-card").addEventListener("click", e => {
    const b = e.target.closest("[data-recipe]");
    if (b) document.dispatchEvent(new CustomEvent("cooking:receta", { detail: { id: b.dataset.recipe } }));
  });
  renderInputs(); syncRange(); update();
  // phones: "Tu mascota" and "Su plan" are two panels side by side
  const grid = $("#plan-grid"), tabs = $$(".plan__tabs button");
  const panels = [form, $(".planr", grid)];
  const goPanel = i => {
    const g = grid.getBoundingClientRect(), r = panels[i].getBoundingClientRect();
    grid.scrollTo({ left: grid.scrollLeft + (r.left - g.left) - (g.width - r.width) / 2, behavior: reduceMotion.matches ? "instant" : "smooth" });
  };
  $("#plan").addEventListener("click", e => { const b = e.target.closest("[data-panel]"); if (b) goPanel(+b.dataset.panel); });
  grid.addEventListener("scroll", () => {
    const i = grid.scrollLeft > (panels[1].offsetLeft - panels[0].offsetLeft) / 2 ? 1 : 0;
    tabs.forEach((t, k) => t.classList.toggle("is-on", k === i));
  }, { passive: true });
  const peek = $("#plan-peek"), seen = { form: false, card: false };
  const io = new IntersectionObserver(es => {
    es.forEach(en => { seen[en.target === form ? "form" : "card"] = en.isIntersecting; });
    peek.classList.toggle("is-on", seen.form && !seen.card && innerWidth < 1000);
  }, { threshold: [0, .15] });
  io.observe(form); io.observe($("#plan-card"));
}

/* ---------- 7-day switch ---------- */
const STEPS = [{ day: "Días 1 y 2", ck: 25 }, { day: "Días 3 y 4", ck: 50 }, { day: "Días 5 y 6", ck: 75 }, { day: "Día 7", ck: 100 }];
// Open-top bags for the pouring animation: the visitor's current food (plain kraft) and CooKing.
function pourBagSVG(kind) {
  const ck = kind === "ck";
  const front = ck ? ["#FFFFFF", "#F6F1EA", "#E3D9CC"] : ["#E2CCA6", "#D6BD94", "#C2A67A"];
  const side = ck ? "#B83E17" : "#A88A60", band = ck ? "#E8562B" : "#B9996B", g = "pb-" + kind;
  const label = ck
    ? `<g transform="translate(71 44) scale(1.1)" fill="none" stroke="#E8562B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG.crown}</g>
       <text x="84" y="90" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="21" fill="#5A4632">CooKing</text>
       <circle cx="84" cy="128" r="22" fill="#FFE1D3"/>
       <g transform="translate(70 114) scale(1.17)" fill="none" stroke="#E8562B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG["paw-print"]}</g>
       <rect x="16" y="196" width="136" height="30" fill="${band}"/>
       <text x="84" y="215" text-anchor="middle" font-family="Circular, Arial, sans-serif" font-weight="800" font-size="9" letter-spacing=".6" fill="#FFFFFF">GRAIN FREE RECIPE</text>`
    : `<rect x="34" y="70" width="100" height="92" rx="14" fill="#F4EAD8" opacity=".85"/>
       <g transform="translate(70 82) scale(1.17)" fill="none" stroke="#8C734B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG["paw-print"]}</g>
       <text x="84" y="132" text-anchor="middle" font-family="Circular, Arial, sans-serif" font-weight="800" font-size="11" letter-spacing=".8" fill="#6B5444">ALIMENTO</text>
       <text x="84" y="148" text-anchor="middle" font-family="Circular, Arial, sans-serif" font-weight="800" font-size="11" letter-spacing=".8" fill="#6B5444">ANTERIOR</text>
       <rect x="16" y="196" width="136" height="30" fill="${band}" opacity=".7"/>`;
  return `<svg viewBox="0 0 170 236" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${front[0]}"/><stop offset=".8" stop-color="${front[1]}"/><stop offset="1" stop-color="${front[2]}"/></linearGradient></defs>
    <path d="M150 22 L166 30 L166 218 L152 226 Z" fill="${side}"/>
    <path d="M18 22 L150 22 L152 226 L16 226 Z" fill="url(#${g})"/>
    <path d="M18 22 Q84 8 150 22 L150 30 Q84 18 18 30 Z" fill="${band}"/>
    <path d="M24 22 Q84 11 144 22 Q84 27 24 22 Z" fill="#3A281C" opacity=".85"/>
    <path d="M140 30 L150 30 L152 226 L140 226 Z" fill="${band}" opacity=".55"/>
    ${label}
  </svg>`;
}
// one step's mix: percentages, or grams once the visitor has used "Arma su plan" (round to 5 g, total kept)
let planMix = null;
const mixOf = st => {
  if (!planMix) return null;
  const ck = st.ck >= 100 ? planMix.g : Math.max(5, Math.round(planMix.g * st.ck / 500) * 5);
  return { ck, old: planMix.g - ck };
};
function stepText(st) {
  const m = mixOf(st);
  if (m) return `<b>${nf0.format(m.ck)}&nbsp;g de CooKing</b><br>${m.old ? `+ ${nf0.format(m.old)}&nbsp;g de su alimento anterior` : "Listo: su nuevo plato favorito"}`;
  return `<b>${st.ck}&nbsp;% CooKing</b><br>${st.ck < 100 ? `${100 - st.ck}&nbsp;% alimento anterior` : "Listo: su nuevo plato favorito"}`;
}
function initSteps() {
  const stage = $("#pour-stage"), bowlImg = $("#pour-bowl"), heapCv = $("#pour-heap"), flyCv = $("#pour-fly");
  const bagEl = { old: $("#bag-old"), ck: $("#bag-ck") }, pill = { old: $("#pill-old"), ck: $("#pill-ck") };
  const dayEl = $("#pour-day"), playBtn = $("#pour-play"), list = $("#steps"), live = $("#pour-live");
  const still = reduceMotion.matches;
  list.innerHTML = STEPS.map((st, i) => `<li><button class="tl" type="button" data-step="${i}">
      <img src="${RENDERS["step-" + st.ck]}" alt="" width="520" height="319" loading="lazy">
      <span class="tl__day">${st.day}</span>
      <span class="mix" aria-hidden="true"><span style="--p:${st.ck}%"></span></span>
      <span class="tl__txt">${stepText(st)}</span>
    </button></li>`).join("");
  const tls = $$(".tl", list);
  $(".pbag__rot", bagEl.old).innerHTML = pourBagSVG("old");
  $(".pbag__rot", bagEl.ck).innerHTML = pourBagSVG("ck");
  const doneTag = document.createElement("span"); doneTag.className = "pour__done"; doneTag.textContent = "¡Listo!";
  const mixTag = document.createElement("p"); mixTag.className = "pour__mix"; mixTag.setAttribute("aria-hidden", "true");
  mixTag.innerHTML = `${icon("rotate-cw")}Mézclalo bien`; stage.appendChild(mixTag);

  // sprites
  const load = src => { const im = new Image(); im.src = src; return im; };
  const SPR = { ck: Array.from({ length: 10 }, (_, i) => load(RENDERS["kibble-" + (i + 1)])), old: Array.from({ length: 6 }, (_, i) => load(RENDERS["old-" + (i + 1)])) };

  // 3D → image projection of the empty-bowl render
  const VP = EMPTY.viewProj, [c0x, c0y, c1x] = EMPTY.crop, KS = EMPTY.out[0] / (c1x - c0x);
  const proj = (x, y, z) => {
    const w = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
    const nx = (VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / w, ny = (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / w;
    return [((nx + 1) / 2 * EMPTY.W - c0x) * KS, ((1 - ny) / 2 * EMPTY.H - c0y) * KS];
  };
  // inner lip of the bowl, near half (camera side): anything below it is hidden by the front wall
  const RIM = []; for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI; RIM.push(proj(.955 * Math.cos(t), .8, .955 * Math.sin(t))); }
  const rimY = x => { for (let i = 1; i < RIM.length; i++) { const [ax, ay] = RIM[i - 1], [bx, by] = RIM[i]; if ((x - ax) * (x - bx) <= 0) return ay + (by - ay) * ((x - ax) / ((bx - ax) || 1)); } return -1e9; };
  // heap slots: a jittered lattice that fills the bowl up to a dome, kept only where visible
  const RS = seeded(21), SP = .118, slots = [];
  const rIn = y => y < .3 ? .9 + (y - .17) * .2 : .93;
  const domeTop = r => .76 + .22 * Math.max(0, 1 - (r / .86) ** 2);
  for (let li = 0, y = .2; y < 1; li++, y += SP * .78) {
    for (let gx = -1; gx <= 1; gx += SP) for (let gz = -1; gz <= 1; gz += SP * .87) {
      const x = gx + (li % 2) * SP / 2 + (RS() - .5) * SP * .5, z = gz + (RS() - .5) * SP * .5, yy = y + (RS() - .5) * SP * .4, r = Math.hypot(x, z);
      if (r > rIn(yy) - .1 || yy > domeTop(r)) continue;
      const [ix, iy] = proj(x, yy, z), [ix2] = proj(x + .1, yy, z);
      const size = Math.abs(ix2 - ix) * 1.85;
      if (iy - size * .25 > rimY(ix)) continue;
      slots.push({ ix, iy, size, key: li * 10 + z, rot: RS() * 360, spr: Math.floor(RS() * 10) });
    }
  }
  slots.sort((a, b) => a.key - b.key);
  const N = slots.length;

  let SW = 1, SH = 1, dpr = 1, narrow = false, bowl = { x: 0, y: 0, s: 1 };
  const hctx = heapCv.getContext("2d"), fctx = flyCv.getContext("2d");
  const toStage = (ix, iy) => [bowl.x + ix * bowl.s, bowl.y + iy * bowl.s];
  const bag = { old: { w: 1, h: 1 }, ck: { w: 1, h: 1 } };
  function measure() {
    const r = stage.getBoundingClientRect();
    SW = r.width; SH = r.height; dpr = Math.min(2, devicePixelRatio || 1); narrow = SW < 600 && SH > SW * .75; // the phone pose is for tall stages only
    for (const cv of [heapCv, flyCv]) { cv.width = Math.round(SW * dpr); cv.height = Math.round(SH * dpr); }
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bw = SW * (narrow ? .72 : .46);
    bowl = { x: (SW - bw) / 2, y: SH - bw * 684 / 900 - SH * (narrow ? .1 : .01), s: bw / 900 };
    Object.assign(bowlImg.style, { left: bowl.x + "px", top: bowl.y + "px", width: bw + "px" });
    const [rlx] = toStage(...RIM[RIM.length - 1]), [rrx] = toStage(...RIM[0]), [, rty] = toStage(...proj(0, .8, -.955));
    const w = narrow ? Math.min(SW * .22, SH * .26) : SW * .135, h = w * 236 / 170;
    for (const k of ["old", "ck"]) {
      const sgn = k === "old" ? -1 : 1;
      Object.assign(bag[k], { w, h,
        rest: { x: SW / 2 + sgn * (narrow ? SW * .33 : SW * .3), y: (narrow ? Math.max(SH * .2, 64) : SH * .3) + h * .5 },
        pourMouth: { x: SW / 2 + sgn * (rrx - rlx) * .3, y: rty - SH * (narrow ? .1 : .17) } });
      bagEl[k].style.width = w + "px";
      pill[k].style.left = (k === "old" ? (narrow ? 2 : 7) : (narrow ? 70 : 77)) + "%";
    }
    redrawHeap();
  }
  // mouth of the bag (top center of the drawing) relative to its rotation pivot, in px
  const mouthLocal = k => ({ x: 0, y: -(bag[k].h * (.55 - 18 / 236)) });
  const rotate = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }; };
  const bagPose = (k, e, tilt) => { // e: 0 at rest → 1 pouring
    const b = bag[k], ang = tilt * e, m = rotate(mouthLocal(k), tilt);
    const pourCenter = { x: b.pourMouth.x - m.x, y: b.pourMouth.y - m.y };
    return { x: b.rest.x + (pourCenter.x - b.rest.x) * e, y: b.rest.y + (pourCenter.y - b.rest.y) * e, ang };
  };
  const placeBag = (k, p) => {
    const b = bag[k];
    bagEl[k].style.transform = `translate3d(${(p.x - b.w / 2).toFixed(1)}px,${(p.y - b.h * .55).toFixed(1)}px,0)`;
    $(".pbag__rot", bagEl[k]).style.transform = `rotate(${p.ang.toFixed(2)}deg)`;
  };
  const mouthAt = (k, p) => { const m = rotate(mouthLocal(k), p.ang); return { x: p.x + m.x, y: p.y + m.y }; };

  // heap drawing (clipped to the inside of the bowl)
  let landed = [];
  const clipBowl = ctx => {
    ctx.beginPath();
    RIM.forEach(([x, y], i) => { const [sx, sy] = toStage(x, y); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); });
    const [lx] = toStage(...RIM[RIM.length - 1]), [rx] = toStage(...RIM[0]);
    ctx.lineTo(lx, -SH); ctx.lineTo(rx, -SH); ctx.closePath(); ctx.clip();
  };
  const drawKib = (ctx, im, x, y, size, rot) => {
    if (!im.complete || !im.naturalWidth) return;
    const k = size / Math.max(im.naturalWidth, im.naturalHeight);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot * Math.PI / 180);
    ctx.drawImage(im, -im.naturalWidth * k / 2, -im.naturalHeight * k / 2, im.naturalWidth * k, im.naturalHeight * k);
    ctx.restore();
  };
  const paintSlot = (i, kind) => {
    const sl = slots[i], [x, y] = toStage(sl.ix, sl.iy), sp = SPR[kind];
    hctx.save(); clipBowl(hctx); drawKib(hctx, sp[sl.spr % sp.length], x, y, sl.size * bowl.s, sl.rot); hctx.restore();
  };
  function redrawHeap() { hctx.clearRect(0, 0, SW, SH); landed.forEach(([i, kind]) => paintSlot(i, kind)); }

  // Each bag pours at the same rate, one after the other, so pouring time is proportional to its share:
  // days 1-2 the old food pours 3x longer than CooKing, days 3-4 the same, days 5-6 CooKing 3x longer, day 7 only CooKing.
  // Then both are mixed in the bowl.
  const F = 3.2, T_TILT = .45, T_BACK = .5, T_MIX = .9, T_HOLD = 1.7, T_FADE = .45;
  function planFor(idx) {
    const ck = STEPS[idx].ck / 100, nOld = Math.round(N * (1 - ck)), seq = [];
    let t = .2;
    for (const [k, share, n] of [["old", 1 - ck, nOld], ["ck", ck, N - nOld]]) {
      if (!n) continue;
      const p0 = t + T_TILT, p1 = p0 + F * share;
      seq.push({ k, share, n, in0: t, p0, p1, emitted: 0 });
      t = p1 + .05;
    }
    const last = seq[seq.length - 1].p1;
    const mix = seq.length > 1 ? last + .75 : null;
    const end = (mix ? mix + T_MIX : last + .8) + T_HOLD + (idx === 3 ? 1 : 0) + T_FADE;
    return { seq, mix, end, nOld };
  }
  const mixedKinds = idx => {
    const ck = STEPS[idx].ck, R = seeded(100 + idx), nck = Math.round(N * ck / 100);
    const arr = slots.map((_, i) => i < nck ? "ck" : "old");
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  };
  let step = 0, tau = 0, plan = planFor(0), slotNext = 0, flying = [], visible = false, raf = 0, lastT = 0, fading = false, mixed = false;
  let playing = !still, autoAdvance = !still, started = false;
  const tlBar = b => b && b.style.setProperty("--prog", Math.min(1, tau / plan.end).toFixed(3));
  function pillText() {
    const st = STEPS[step], m = mixOf(st);
    $("[data-pct]", pill.old).innerHTML = m ? `${nf0.format(m.old)}&nbsp;g` : `${100 - st.ck}&nbsp;%`;
    $("[data-pct]", pill.ck).innerHTML = m ? `${nf0.format(m.ck)}&nbsp;g` : `${st.ck}&nbsp;%`;
  }
  // grams from "Arma su plan": relabel the steps, the bowl's two tags and the line under the title
  const forEl = $("#switch-for");
  document.addEventListener("cooking:plan", e => {
    const d = e.detail; if (!d) return;
    planMix = d;
    tls.forEach((b, i) => { $(".tl__txt", b).innerHTML = stepText(STEPS[i]); });
    pillText();
    const who = d.species === "gato" ? (d.age === "cachorro" ? "gatito" : `gato ${d.ageLabel.toLowerCase()}`) : (d.age === "cachorro" ? "cachorro" : `perro ${d.ageLabel.toLowerCase()}`);
    forEl.innerHTML = `<span>Para su ${who} de ${nf1.format(d.kg)}&nbsp;kg: <b>${nf0.format(d.g)}&nbsp;g al día</b><span class="switch__rec"> de ${esc(d.recipe)}</span></span><a href="#plan">Cambiar datos</a>`;
    forEl.hidden = false;
    $("#cambio").classList.add("has-plan");
  });

  function setStep(idx, { announce = false } = {}) {
    step = idx; tau = 0; slotNext = 0; flying = []; landed = []; fading = false; mixed = false;
    plan = planFor(idx);
    heapCv.classList.remove("is-fading", "is-mixing"); hctx.clearRect(0, 0, SW, SH); fctx.clearRect(0, 0, SW, SH);
    mixTag.classList.remove("is-on");
    const st = STEPS[idx], old = 100 - st.ck;
    dayEl.textContent = st.day; doneTag.classList.remove("is-on"); if (idx === 3) dayEl.appendChild(doneTag);
    pillText();
    pill.old.style.setProperty("--fill", 0); pill.ck.style.setProperty("--fill", 0);
    pill.old.classList.toggle("is-zero", old === 0);
    bagEl.old.classList.toggle("is-idle", old === 0);
    tls.forEach((b, i) => { b.style.setProperty("--prog", 0); if (i === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    if (announce) { const m = mixOf(st); live.textContent = m ? `${st.day}: ${m.ck} gramos de CooKing${m.old ? ` y ${m.old} gramos de su alimento anterior` : ""}.` : `${st.day}: ${st.ck} % CooKing${old ? ` y ${old} % de su alimento anterior` : ""}.`; }
    placeBag("old", bagPose("old", 0, 0)); placeBag("ck", bagPose("ck", 0, 0));
  }
  const tiltOf = k => { const sh = (k === "ck" ? STEPS[step].ck : 100 - STEPS[step].ck) / 100; return sh ? (k === "old" ? 1 : -1) * (84 + 36 * sh) : 0; };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function fillInstant() { const kinds = mixedKinds(step); landed = slots.map((_, i) => [i, kinds[i]]); redrawHeap(); pill.old.style.setProperty("--fill", 1); pill.ck.style.setProperty("--fill", 1); }

  function frame(now) {
    raf = 0;
    const dt = Math.min(.1, (now - (lastT || now)) / 1000); lastT = now;
    tau += dt;
    const g = SH * 2.6, pose = { old: bagPose("old", 0, 0), ck: bagPose("ck", 0, 0) };
    for (const s of plan.seq) {
      const e = tau < s.in0 ? 0 : tau < s.p0 ? ease((tau - s.in0) / T_TILT) : tau < s.p1 ? 1 : tau < s.p1 + T_BACK ? 1 - ease((tau - s.p1) / T_BACK) : 0;
      const tilt = tiltOf(s.k);
      pose[s.k] = bagPose(s.k, e, tilt);
      if (e > .98) pose[s.k].ang += Math.sin(now / 90) * 2.2;
      const prog = Math.min(1, Math.max(0, (tau - s.p0) / (s.p1 - s.p0)));
      pill[s.k].style.setProperty("--fill", prog.toFixed(3));
      // emit at a constant rate while this bag is pouring; slots fill from the bottom up
      const target = Math.floor(prog * s.n);
      while (s.emitted < target && slotNext < N) {
        s.emitted++;
        const i = slotNext++, kind = s.k, m = mouthAt(kind, pose[kind]);
        const sl = slots[i], [tx, ty] = toStage(sl.ix, sl.iy), j = (Math.random() - .5) * bag[kind].w * .5, a = pose[kind].ang * Math.PI / 180;
        const p0 = { x: m.x + j * Math.cos(a), y: m.y + j * Math.sin(a) };
        const T = .42 + Math.random() * .12 + Math.hypot(tx - p0.x, ty - p0.y) / (SH * 3.2);
        flying.push({ i, kind, x0: p0.x, y0: p0.y, vx: (tx - p0.x) / T, vy: (ty - p0.y - .5 * g * T * T) / T, t: 0, T, rot: Math.random() * 360, vr: (Math.random() - .5) * 720, size: sl.size * bowl.s, spr: Math.floor(Math.random() * 10) });
      }
    }
    placeBag("old", pose.old); placeBag("ck", pose.ck);
    fctx.clearRect(0, 0, SW, SH);
    flying = flying.filter(f => {
      f.t += dt;
      if (f.t >= f.T) { landed.push([f.i, f.kind]); paintSlot(f.i, f.kind); return false; }
      const x = f.x0 + f.vx * f.t, y = f.y0 + f.vy * f.t + .5 * g * f.t * f.t, sp = SPR[f.kind];
      drawKib(fctx, sp[f.spr % sp.length], x, y, f.size * (.85 + .15 * Math.min(1, f.t / f.T)), f.rot + f.vr * f.t);
      return true;
    });
    // mix: the bowl gives a little shake and the layers turn into the real blend
    if (plan.mix && tau >= plan.mix && !mixTag.classList.contains("is-on")) { mixTag.classList.add("is-on"); heapCv.classList.add("is-mixing"); }
    if (plan.mix && tau >= plan.mix + .38 && !mixed) { mixed = true; const kinds = mixedKinds(step); landed = slots.slice(0, landed.length).map((_, i) => [i, kinds[i]]); redrawHeap(); }
    if (step === 3 && tau > plan.seq[0].p1 + .3) doneTag.classList.add("is-on");
    tlBar(tls[step]);
    if (tau > plan.end - T_FADE && !fading && autoAdvance) { fading = true; heapCv.classList.add("is-fading"); }
    if (tau >= plan.end - (autoAdvance ? 0 : T_FADE)) {
      if (autoAdvance) setStep((step + 1) % STEPS.length);
      else { playing = false; playIcon(); return; }
    }
    if (playing && visible) raf = requestAnimationFrame(frame); else lastT = 0;
  }
  const run = () => { if (!raf && playing && visible) { lastT = 0; raf = requestAnimationFrame(frame); } };
  function playIcon() {
    playBtn.innerHTML = svgIcon(playing ? "pause" : "play");
    playBtn.setAttribute("aria-label", playing ? "Pausar la animación" : "Reproducir la animación");
  }
  playBtn.addEventListener("click", () => {
    playing = !playing;
    if (playing) { autoAdvance = true; if (still && tau >= plan.end - T_FADE) setStep((step + 1) % STEPS.length); }
    playIcon(); run();
  });
  list.addEventListener("click", e => {
    const b = e.target.closest(".tl"); if (!b) return;
    started = true;
    setStep(+b.dataset.step, { announce: true });
    playing = true; playIcon(); run();
  });

  measure(); setStep(0); playIcon();
  new ResizeObserver(() => { measure(); if (!playing) { placeBag("old", bagPose("old", 0, 0)); placeBag("ck", bagPose("ck", 0, 0)); } }).observe(stage);
  Promise.all([...SPR.ck, ...SPR.old].map(im => im.decode().catch(() => {}))).then(() => { redrawHeap(); if (still && !started) fillInstant(); });
  if (still) fillInstant();
  // start from day 1 once the section is well in view, so the visitor sees the whole sequence
  new IntersectionObserver(es => {
    visible = es.some(en => en.isIntersecting);
    if (visible && !started && !still) { started = true; setStep(0); }
    if (visible) run();
  }, { threshold: .55 }).observe(stage);
  document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else run(); });
}

/* ---------- Map ---------- */
const DISTRICT_NAMES = Object.fromEntries(MAP.districts.map(d => [d.id, d.name]));
// Coordinates are approximate (street-level estimate, validated to fall inside each district polygon).
// Puntos de venta: se editan en el panel de WordPress (menú "Puntos de venta").
const LOCATIONS = DATA.locations || [];
const districtName = id => DISTRICT_NAMES[id] || id;
const mapsUrl = l => l.maps || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${l.address}, ${districtName(l.district)}, Lima, Perú`);

function initMap() {
  const el = $("#map"), glBox = $("#map-gl"), card = $("#map-card"), cardBody = $("#map-card-body");
  const listEl = $("#map-list"), statusEl = $("#map-status"), search = $("#map-search"), chip = $("#map-chip");
  const geoBtn = $("#geo"), toggleBtn = $('[data-zoom="toggle"]'), pinsEl = $("#map-pins");
  document.body.insertAdjacentHTML("beforeend", `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="iso" viewBox="${ISO.viewBox}"><path d="${ISO.d}"/></symbol></svg>`);
  const km = (a, b) => {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const districtsWithStores = new Set(LOCATIONS.map(l => l.district));
  $$("[data-count=locations]").forEach(n => n.textContent = LOCATIONS.length);
  $$("[data-count=districts]").forEach(n => n.textContent = districtsWithStores.size);
  const labelPoint = {};
  GEO.labels.forEach(f => { labelPoint[f.properties.id] = { lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }; });
  const state = { selected: null, district: null, query: "", origin: null };
  const badge = `<span class="gpin__badge"><svg aria-hidden="true"><use href="#iso"/></svg></span>`;

  // one logo pin per store, shared by both map renderers
  LOCATIONS.forEach((l, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "gpin"; b.dataset.id = l.id; b.style.setProperty("--i", i);
    b.setAttribute("aria-label", `${l.store}, ${l.address}, ${districtName(l.district)}`);
    b.innerHTML = `${badge}<span class="gpin__name" aria-hidden="true">${esc(l.store)}</span>`;
    pinsEl.appendChild(b); l.pin = b;
  });
  const mePin = document.createElement("div");
  mePin.className = "mepin"; mePin.hidden = true; mePin.setAttribute("aria-hidden", "true");
  pinsEl.appendChild(mePin);
  const syncToggle = full => { const t = full ? "Volver a las tiendas" : "Ver toda Lima"; toggleBtn.setAttribute("aria-label", t); toggleBtn.title = t; };

  /* ----- Renderer 1: brand SVG of the districts (works offline; fallback) ----- */
  function svgView() {
    const P = MAP.proj, svg = $("#map-svg"), gD = $("#map-districts"), gL = $("#map-labels"), hint = $("#map-hint");
    const pattern = $("#azulejo"), sea = $("#olas"), NS = "http://www.w3.org/2000/svg";
    const project = (lng, lat) => [(lng - P.LON_MIN) * P.KX, (P.LAT_MAX - lat) * P.KY];
    LOCATIONS.forEach(l => { [l.x, l.y] = project(l.lng, l.lat); });
    const byDistrict = {}; MAP.districts.forEach(d => { byDistrict[d.id] = d; });
    $("#map-land").setAttribute("d", MAP.land);
    const pathEls = {}, labelEls = [];
    for (const d of MAP.districts) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d.d); p.setAttribute("class", "d" + (districtsWithStores.has(d.id) ? " has" : "")); p.dataset.id = d.id;
      gD.appendChild(p); pathEls[d.id] = p;
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", d.lx); t.setAttribute("y", d.ly); t.textContent = d.short;
      if (districtsWithStores.has(d.id)) t.setAttribute("class", "has");
      gL.appendChild(t); labelEls.push({ t, d, len: d.short.length });
    }
    labelEls.sort((a, b) => (districtsWithStores.has(b.d.id) - districtsWithStores.has(a.d.id)) || (b.d.bb[2] * b.d.bb[3] - a.d.bb[2] * a.d.bb[3]));
    const bboxOf = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; };
    const storesBox = bboxOf(LOCATIONS.map(l => [l.x, l.y]));
    const metroBox = MAP.districts.reduce((b, d) => ({ x0: Math.min(b.x0, d.bb[0]), y0: Math.min(b.y0, d.bb[1]), x1: Math.max(b.x1, d.bb[0] + d.bb[2]), y1: Math.max(b.y1, d.bb[1] + d.bb[3]) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    let W = 1, H = 1, v = { cx: 0, cy: 0, s: 1 }, sHome = 1, sFull = 1, anim = 0, me = null, live = true;
    const fit = (box, pad) => { const pw = Math.max(40, W - pad * 2), ph = Math.max(40, H - pad * 2); return { cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, s: Math.max((box.x1 - box.x0) / pw, (box.y1 - box.y0) / ph) }; };
    const homeView = () => { const h = fit(storesBox, Math.min(W, H) * 0.12 + 20); h.s *= 1.05; return h; };
    const clampView = q => ({ s: Math.min(Math.max(q.s, sHome / 6), sFull * 1.15), cx: Math.min(Math.max(q.cx, metroBox.x0), metroBox.x1), cy: Math.min(Math.max(q.cy, metroBox.y0), metroBox.y1) });
    function render() {
      if (!live) return;
      const { cx, cy, s } = v, vx = cx - W * s / 2, vy = cy - H * s / 2;
      svg.setAttribute("viewBox", `${vx} ${vy} ${W * s} ${H * s}`);
      pattern.setAttribute("patternTransform", `scale(${30 * s / 7})`);
      sea.setAttribute("patternTransform", `scale(${36 * s / 14})`);
      gL.setAttribute("font-size", 12.5 * s); gL.setAttribute("stroke-width", 3.2 * s);
      const placed = [];
      for (const { t, d, len } of labelEls) {
        const widthPx = d.bb[2] / s, heightPx = d.bb[3] / s, need = len * 7;
        let show = widthPx > need * 0.95 && heightPx > 22 || (districtsWithStores.has(d.id) && widthPx > need * 0.6 && heightPx > 18);
        if (show) {
          const x = (d.lx - vx) / s, y = (d.ly - vy) / s, box = [x - need / 2 - 4, y - 10, x + need / 2 + 4, y + 10];
          show = !placed.some(o => box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1]);
          if (show) placed.push(box);
        }
        t.classList.toggle("off", !show);
      }
      for (const l of LOCATIONS) { l.pin.hidden = false; l.pin.style.transform = `translate(${((l.x - vx) / s).toFixed(1)}px, ${((l.y - vy) / s).toFixed(1)}px)`; }
      if (me) mePin.style.transform = `translate(${(me.x - vx) / s}px, ${(me.y - vy) / s}px)`;
      syncToggle(s > (sHome + sFull) / 2);
    }
    function setView(q, animate = true) {
      const target = clampView(q);
      cancelAnimationFrame(anim);
      if (!animate || reduceMotion.matches) { v = target; render(); return; }
      const from = { ...v }, t0 = performance.now(), dur = 520;
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const ls0 = Math.log(from.s), ls1 = Math.log(target.s);
      const step = now => {
        const k = ease(Math.min(1, (now - t0) / dur));
        v = { cx: from.cx + (target.cx - from.cx) * k, cy: from.cy + (target.cy - from.cy) * k, s: Math.exp(ls0 + (ls1 - ls0) * k) };
        render(); if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    const flyTo = q => setView({ ...q, s: Math.max(q.s, sHome * 0.42) });
    function zoomAt(f, px = W / 2, py = H / 2, animate = true) {
      const wx = v.cx - W * v.s / 2 + px * v.s, wy = v.cy - H * v.s / 2 + py * v.s, s = v.s * f;
      setView({ s, cx: wx - (px - W / 2) * s, cy: wy - (py - H / 2) * s }, animate);
    }
    function measure(first) {
      const r = el.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      sHome = homeView().s; sFull = fit(metroBox, 24).s;
      if (first) v = homeView();
      v = clampView(v); render();
    }
    const ro = new ResizeObserver(() => measure(false)); ro.observe(el);
    measure(true);
    // pan, pinch, Ctrl+wheel, double click, keyboard
    const pointers = new Map(); let drag = null;
    const onDown = e => {
      if (e.target.closest(".gpin, .card, .map__controls, .map__legend")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); el.setPointerCapture(e.pointerId);
      if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, cx: v.cx, cy: v.cy, moved: false, target: e.target };
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; drag = { pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y), s0: v.s, moved: true }; }
    };
    const onMove = e => {
      if (!pointers.has(e.pointerId) || !drag) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (drag.pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()], r = el.getBoundingClientRect();
        zoomAt(drag.s0 * drag.d0 / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)) / v.s, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, false); return;
      }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true; el.classList.add("is-dragging"); cancelAnimationFrame(anim);
      v = clampView({ s: v.s, cx: drag.cx - dx * v.s, cy: drag.cy - dy * v.s }); render();
    };
    const onUp = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size === 0 && drag) {
        if (!drag.moved && e.type === "pointerup") { const p = drag.target.closest && drag.target.closest("path.d"); if (p) selectDistrict(p.dataset.id); }
        drag = null; el.classList.remove("is-dragging");
      }
    };
    $("[data-mod]").textContent = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl";
    let hintTimer = 0;
    const onWheel = e => {
      if (!(e.ctrlKey || e.metaKey)) { hint.classList.add("is-on"); clearTimeout(hintTimer); hintTimer = setTimeout(() => hint.classList.remove("is-on"), 1400); return; }
      e.preventDefault(); const r = el.getBoundingClientRect(); zoomAt(Math.exp(e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top, false);
    };
    const onDbl = e => { if (e.target.closest(".gpin, .card, .map__controls")) return; const r = el.getBoundingClientRect(); zoomAt(0.5, e.clientX - r.left, e.clientY - r.top); };
    const onKey = e => {
      if (e.target !== el) return;
      const st = 80 * v.s, keys = { ArrowLeft: () => setView({ ...v, cx: v.cx - st }, false), ArrowRight: () => setView({ ...v, cx: v.cx + st }, false), ArrowUp: () => setView({ ...v, cy: v.cy - st }, false), ArrowDown: () => setView({ ...v, cy: v.cy + st }, false), "+": () => zoomAt(0.6), "=": () => zoomAt(0.6), "-": () => zoomAt(1 / 0.6), "0": () => setView(homeView()) };
      if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
    };
    el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false }); el.addEventListener("dblclick", onDbl); el.addEventListener("keydown", onKey);
    const toXY = p => project(p.lng, p.lat);
    return {
      kind: "svg",
      home: (animate = true) => setView(homeView(), animate),
      toggle: () => setView(v.s > (sHome + sFull) / 2 ? homeView() : fit(metroBox, 24)),
      zoom: dir => zoomAt(dir > 0 ? 0.6 : 1 / 0.6),
      focus: (l, animate = true) => { const s = Math.min(v.s, sHome * 0.55); setView({ cx: l.x, cy: l.y + H * s * 0.12, s }, animate); },
      fitPts: (pts, pad) => { const b = bboxOf(pts.map(toXY)); flyTo(fit(b, Math.min(W, H) * pad)); },
      fitDistrict: id => { const d = byDistrict[id]; if (d) flyTo(fit({ x0: d.bb[0], y0: d.bb[1], x1: d.bb[0] + d.bb[2], y1: d.bb[1] + d.bb[3] }, Math.min(W, H) * 0.14)); },
      highlight: id => { Object.values(pathEls).forEach(p => p.classList.remove("is-selected")); if (id && pathEls[id]) { pathEls[id].classList.add("is-selected"); gD.appendChild(pathEls[id]); } },
      me: o => { me = o ? (([x, y]) => ({ x, y }))(project(o.lng, o.lat)) : null; mePin.hidden = !me; render(); },
      refresh: render,
      resize: () => measure(false),
      destroy: () => {
        live = false; ro.disconnect(); cancelAnimationFrame(anim);
        el.removeEventListener("pointerdown", onDown); el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("wheel", onWheel); el.removeEventListener("dblclick", onDbl); el.removeEventListener("keydown", onKey);
      }
    };
  }

  /* ----- Renderer 2: street map (MapLibre + OpenFreeMap) styled in CooKing's palette ----- */
  const C = { land: "#FFF7EE", sand: "#F9EBD6", green: "#E7EDCF", park: "#E3EBC8", paw: "#CEDCAA", water: "#BFE3DD", waterLine: "#A6D3CD",
    res: "#FDF0E1", com: "#FBE6D3", building: "#F7E5D2", buildingLine: "#EED6BD", motor: "#F8C695", motorCase: "#E7A873",
    major: "#FFFFFF", majorCase: "#EDCFAF", minor: "#FFFFFF", minorCase: "#F2DFCA", rail: "#DCC5AC", label: "#6B5444", label2: "#8C734B", halo: "#FFF8EF", place: "#3A281C" };
  const OFM = "https://tiles.openfreemap.org";
  const HAS = [...districtsWithStores];
  function brandStyle() {
    const w = (...stops) => ["interpolate", ["exponential", 1.6], ["zoom"], ...stops];
    const cls = list => ["in", ["get", "class"], ["literal", list]];
    const road = (id, classes, minzoom, width, color, caseColor, caseExtra) => [
      { id: id + "-case", type: "line", source: "omt", "source-layer": "transportation", minzoom, filter: ["all", cls(classes), ["!=", ["get", "brunnel"], "tunnel"]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": caseColor, "line-width": w(...width.map((x, i) => i % 2 ? x + caseExtra : x)) } },
      { id, type: "line", source: "omt", "source-layer": "transportation", minzoom, filter: cls(classes), layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color, "line-width": w(...width) } }
    ];
    const name = ["coalesce", ["get", "name:es"], ["get", "name"]];
    return {
      version: 8,
      glyphs: OFM + "/fonts/{fontstack}/{range}.pbf",
      sources: {
        omt: { type: "vector", url: OFM + "/planet" },
        districts: { type: "geojson", data: { type: "FeatureCollection", features: GEO.features }, promoteId: "id" },
        dlabels: { type: "geojson", data: { type: "FeatureCollection", features: GEO.labels } }
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": C.land } },
        { id: "sand", type: "fill", source: "omt", "source-layer": "landcover", filter: cls(["sand", "rock"]), paint: { "fill-color": C.sand } },
        { id: "green", type: "fill", source: "omt", "source-layer": "landcover", filter: ["all", cls(["grass", "wood", "farmland", "wetland"]), ["!", ["in", ["get", "subclass"], ["literal", ["park", "garden", "recreation_ground", "golf_course", "dog_park"]]]]], paint: { "fill-color": C.green } },
        { id: "landuse", type: "fill", source: "omt", "source-layer": "landuse", paint: { "fill-color": ["match", ["get", "class"], ["residential", "suburb", "neighbourhood", "quarter"], C.res, ["commercial", "retail", "industrial"], C.com, "transparent"], "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, .6, 14, 1] } },
        { id: "park", type: "fill", source: "omt", "source-layer": "landcover", filter: ["in", ["get", "subclass"], ["literal", ["park", "garden", "recreation_ground", "golf_course", "dog_park"]]], paint: { "fill-pattern": "paw" } },
        { id: "park-big", type: "fill", source: "omt", "source-layer": "park", paint: { "fill-color": C.park, "fill-opacity": .6 } },
        { id: "water", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": C.water } },
        { id: "waterway", type: "line", source: "omt", "source-layer": "waterway", paint: { "line-color": C.waterLine, "line-width": w(10, .6, 15, 3) } },
        { id: "aeroway", type: "line", source: "omt", "source-layer": "aeroway", filter: ["==", ["geometry-type"], "LineString"], paint: { "line-color": "#F1E0CC", "line-width": w(11, 2, 15, 18) } },
        { id: "building", type: "fill", source: "omt", "source-layer": "building", minzoom: 14, paint: { "fill-color": C.building, "fill-outline-color": C.buildingLine, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 1] } },
        { id: "d-fill", type: "fill", source: "districts", paint: { "fill-color": ["case", ["boolean", ["feature-state", "sel"], false], "rgba(196,70,26,.10)", ["in", ["get", "id"], ["literal", HAS]], "rgba(237,190,85,.22)", "rgba(255,255,255,.01)"] } },
        { id: "rail", type: "line", source: "omt", "source-layer": "transportation", minzoom: 11, filter: cls(["rail", "transit"]), paint: { "line-color": C.rail, "line-width": 1.4, "line-dasharray": [3, 3] } },
        ...road("minor", ["minor", "service"], 12.5, [12.5, .4, 15, 3.4, 18, 16], C.minor, C.minorCase, 1.4),
        ...road("major", ["secondary", "tertiary"], 10.5, [10.5, .5, 13, 1.8, 16, 9, 18, 22], C.major, C.majorCase, 1.6),
        ...road("primary", ["primary", "trunk"], 9, [9, .6, 13, 2.6, 16, 11, 18, 26], C.major, C.majorCase, 1.8),
        ...road("motorway", ["motorway"], 8, [8, .8, 13, 3.4, 16, 13, 18, 30], C.motor, C.motorCase, 1.8),
        { id: "d-line", type: "line", source: "districts", layout: { "line-join": "round" }, paint: { "line-color": ["case", ["boolean", ["feature-state", "sel"], false], "#C4461A", ["in", ["get", "id"], ["literal", HAS]], "#CF9A2A", "rgba(140,115,75,.5)"], "line-width": ["case", ["boolean", ["feature-state", "sel"], false], 3, ["in", ["get", "id"], ["literal", HAS]], 1.8, 1], "line-dasharray": [2.5, 1.6] } },
        { id: "road-name", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 13.5, filter: cls(["primary", "secondary", "tertiary", "trunk", "minor", "motorway"]), layout: { "symbol-placement": "line", "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 14, 10.5, 17, 13], "text-max-angle": 30 }, paint: { "text-color": C.label2, "text-halo-color": C.halo, "text-halo-width": 1.6 } },
        { id: "water-name", type: "symbol", source: "omt", "source-layer": "water_name", layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 13, "text-letter-spacing": .2, "text-max-width": 8 }, paint: { "text-color": "#5E9A93", "text-halo-color": "rgba(191,227,221,.8)", "text-halo-width": 1.2 } },
        { id: "hood", type: "symbol", source: "omt", "source-layer": "place", minzoom: 14, filter: cls(["neighbourhood", "quarter"]), layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 11, "text-max-width": 7 }, paint: { "text-color": C.label2, "text-halo-color": C.halo, "text-halo-width": 1.4 } },
        { id: "d-label", type: "symbol", source: "dlabels", minzoom: 9.8, maxzoom: 15.2, layout: { "text-field": ["get", "short"], "text-font": ["Noto Sans Bold"], "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 13, 13.5], "text-transform": "uppercase", "text-letter-spacing": .08, "text-max-width": 8, "symbol-sort-key": ["case", ["in", ["get", "id"], ["literal", HAS]], 0, 1] }, paint: { "text-color": ["case", ["in", ["get", "id"], ["literal", HAS]], C.place, C.label2], "text-halo-color": C.halo, "text-halo-width": 2 } }
      ]
    };
  }
  // park fill: soft green with a faint paw print, CooKing's pet touch on the map
  function pawImage() {
    const S = 64, cv = document.createElement("canvas"); cv.width = cv.height = S;
    const g = cv.getContext("2d");
    g.fillStyle = C.park; g.fillRect(0, 0, S, S);
    const paw = (x, y, r, a) => {
      g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = C.paw;
      g.beginPath(); g.ellipse(0, 3, 5.2, 4.4, 0, 0, Math.PI * 2); g.fill();
      [[-6, -3.5], [-2.2, -7], [2.2, -7], [6, -3.5]].forEach(([px, py]) => { g.beginPath(); g.ellipse(px, py, 1.9, 2.4, 0, 0, Math.PI * 2); g.fill(); });
      g.restore();
    };
    paw(18, 20, 1, -.3); paw(48, 48, 1, .4);
    return { width: S, height: S, data: new Uint8Array(g.getImageData(0, 0, S, S).data.buffer) };
  }
  function loadMapLibre() {
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    return new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = CONFIG.maplibre.css; css.integrity = CONFIG.maplibre.cssSri; css.crossOrigin = "anonymous";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.src = CONFIG.maplibre.js; s.integrity = CONFIG.maplibre.jsSri; s.crossOrigin = "anonymous"; s.async = true;
      s.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(new Error("maplibre"));
      s.onerror = () => reject(new Error("maplibre"));
      document.head.appendChild(s);
    });
  }
  const hasWebGL = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } };
  function glView(ml) {
    return new Promise((resolve, reject) => {
      const bounds = pts => pts.reduce((b, p) => [[Math.min(b[0][0], p.lng), Math.min(b[0][1], p.lat)], [Math.max(b[1][0], p.lng), Math.max(b[1][1], p.lat)]], [[180, 90], [-180, -90]]);
      const storesB = bounds(LOCATIONS);
      const metroB = bounds(GEO.features.flatMap(f => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).flatMap(poly => poly[0].map(([lng, lat]) => ({ lng, lat })))));
      const dB = {};
      GEO.features.forEach(f => { dB[f.properties.id] = bounds((f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).flatMap(poly => poly[0].map(([lng, lat]) => ({ lng, lat })))); });
      const dur = () => reduceMotion.matches ? 0 : 700;
      const pad = k => { const r = el.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height) * k); };
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      glBox.hidden = false;
      const holder = document.createElement("div");
      holder.className = "map__gl-in"; glBox.appendChild(holder);
      const map = new ml.Map({
        container: holder, style: brandStyle(), bounds: storesB, fitBoundsOptions: { padding: pad(.12) + 20 },
        minZoom: 9.4, maxZoom: 17.5, maxBounds: [[-77.75, -12.75], [-76.35, -11.4]], dragRotate: false, pitchWithRotate: false, touchPitch: false,
        cooperativeGestures: true, attributionControl: { compact: true, customAttribution: "Distritos: INEI 2007" }, fadeDuration: 120,
        locale: {
          "CooperativeGesturesHandler.WindowsHelpText": "Mantén Ctrl y usa la rueda para acercar el mapa",
          "CooperativeGesturesHandler.MacHelpText": "Mantén ⌘ y usa la rueda para acercar el mapa",
          "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
          "AttributionControl.ToggleAttribution": "Ver créditos del mapa", "AttributionControl.MapFeedback": "Sugerir una corrección",
          "Map.Title": "Mapa de tiendas CooKing en Lima"
        }
      });
      map.touchZoomRotate.disableRotation();
      map.keyboard.enable();
      map.on("styleimagemissing", e => { if (e.id === "paw") map.addImage("paw", pawImage(), { pixelRatio: 2 }); });
      let tilesOk = false, settled = false;
      const fail = () => { if (settled) return; settled = true; try { map.remove(); } catch {} glBox.hidden = true; glBox.innerHTML = ""; reject(new Error("tiles")); };
      const timer = setTimeout(() => { if (!tilesOk) fail(); }, 12000);
      map.on("sourcedata", e => { if (e.sourceId === "omt" && e.tile) tilesOk = true; });
      map.on("error", e => { if (!tilesOk && e && e.sourceId === "omt" && /tilejson|planet$/i.test(String(e.error && e.error.message || ""))) fail(); });
      let selD = null;
      const highlight = id => {
        if (selD) map.setFeatureState({ source: "districts", id: selD }, { sel: false });
        selD = id || null;
        if (selD) map.setFeatureState({ source: "districts", id: selD }, { sel: true });
      };
      // pins: screen-space clustering so nearby stores merge into one logo with a counter
      let clusterEls = [], me = null;
      const CL = 46;
      function placePins() {
        const z = map.getZoom(), pts = LOCATIONS.map(l => ({ l, p: map.project([l.lng, l.lat]) }));
        const groups = [], used = new Set();
        const order = [...pts].sort((a, b) => (b.l.id === state.selected) - (a.l.id === state.selected));
        for (const a of order) {
          if (used.has(a.l.id)) continue;
          const g = [a]; used.add(a.l.id);
          if (a.l.id !== state.selected && z < 15.5) for (const b of order) if (!used.has(b.l.id) && b.l.id !== state.selected && Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) < CL) { g.push(b); used.add(b.l.id); }
          groups.push(g);
        }
        let ci = 0;
        for (const g of groups) {
          if (g.length === 1) { const { l, p } = g[0]; l.pin.hidden = false; l.pin.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`; continue; }
          g.forEach(({ l }) => { l.pin.hidden = true; });
          let c = clusterEls[ci];
          if (!c) { c = document.createElement("button"); c.type = "button"; c.className = "gpin gpin--cluster"; c.innerHTML = `${badge}<span class="gpin__count"></span>`; pinsEl.insertBefore(c, mePin); clusterEls[ci] = c; }
          c.hidden = false; ci++;
          const x = g.reduce((s, o) => s + o.p.x, 0) / g.length, y = g.reduce((s, o) => s + o.p.y, 0) / g.length;
          c.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          c.querySelector(".gpin__count").textContent = g.length;
          c.dataset.ids = g.map(o => o.l.id).join(",");
          c.setAttribute("aria-label", `${g.length} tiendas en esta zona: ${g.map(o => o.l.store).join(", ")}. Acercar.`);
          c.classList.toggle("is-dim", g.every(o => o.l.pin.classList.contains("is-dim")));
        }
        for (; ci < clusterEls.length; ci++) clusterEls[ci].hidden = true;
        if (me) { const p = map.project([me.lng, me.lat]); mePin.style.transform = `translate(${p.x}px, ${p.y}px)`; }
        syncToggle(z < homeZoom - .9);
      }
      pinsEl.addEventListener("click", e => {
        const c = e.target.closest(".gpin--cluster"); if (!c) return;
        const ls = c.dataset.ids.split(",").map(id => LOCATIONS.find(l => l.id === id));
        map.fitBounds(bounds(ls), { padding: pad(.25), maxZoom: 16, duration: dur() });
      });
      let homeZoom = 12;
      map.on("move", placePins);
      map.on("resize", placePins);
      map.on("click", "d-fill", e => { const f = e.features && e.features[0]; if (f) selectDistrict(f.properties.id); });
      map.on("mouseenter", "d-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "d-fill", () => { map.getCanvas().style.cursor = ""; });
      map.once("idle", () => {
        if (!tilesOk) return; // the timer decides
        clearTimeout(timer); settled = true;
        homeZoom = map.getZoom();
        el.classList.add("is-gl"); el.removeAttribute("tabindex");
        map.getCanvas().setAttribute("aria-describedby", "map-help");
        placePins();
        resolve({
          kind: "gl",
          home: (animate = true) => map.fitBounds(storesB, { padding: pad(.12) + 20, duration: animate ? dur() : 0 }),
          toggle: () => map.getZoom() < homeZoom - .9 ? map.fitBounds(storesB, { padding: pad(.12) + 20, duration: dur() }) : map.fitBounds(metroB, { padding: 24, duration: dur() }),
          zoom: dir => dir > 0 ? map.zoomIn({ duration: dur() }) : map.zoomOut({ duration: dur() }),
          focus: (l, animate = true) => map.easeTo({ center: [l.lng, l.lat], zoom: Math.max(map.getZoom(), 14.6), offset: [0, -pad(.16)], duration: animate ? dur() : 0 }),
          fitPts: (pts, k) => { const q = pad(k); map.fitBounds(bounds(pts), { padding: { top: q + 56, bottom: q + 40, left: q, right: q }, maxZoom: 15, duration: dur() }); },
          fitDistrict: id => { if (dB[id]) map.fitBounds(dB[id], { padding: pad(.14), maxZoom: 15, duration: dur() }); },
          highlight,
          me: o => { me = o; mePin.hidden = !o; placePins(); },
          refresh: placePins,
          resize: () => { map.resize(); placePins(); },
          destroy: () => map.remove()
        });
      });
    });
  }

  /* ----- List, search, geolocation and selection (renderer-agnostic) ----- */
  function visibleLocations() {
    const q = norm(state.query);
    return LOCATIONS.filter(l => (!state.district || l.district === state.district) && (!q || norm(`${l.store} ${l.address} ${districtName(l.district)}`).includes(q)));
  }
  function renderList() {
    const items = visibleLocations(), sel = state.selected;
    const row = l => `
      <li class="loc${l.id === sel ? " is-selected" : ""}" data-id="${l.id}">
        <button class="loc__main" type="button" data-select="${l.id}"${l.id === sel ? ' aria-current="true"' : ""}>
          <span class="loc__name">${esc(l.store)}</span>
          <span class="loc__addr">${esc(l.address)}${state.origin ? ", " + esc(districtName(l.district)) : ""}</span>
          ${state.origin ? `<span class="loc__dist">A ${nf1.format(l._km)}&nbsp;km</span>` : ""}
        </button>
        <a class="loc__go" href="${esc(mapsUrl(l))}" target="_blank" rel="noopener">Cómo llegar<span class="sr"> a ${esc(l.store)} (abre Google Maps)</span></a>
      </li>`;
    if (!items.length) listEl.innerHTML = `<li class="empty">Sin resultados para <b>“${esc(state.query)}”</b>. Prueba con el nombre de tu distrito o toca el mapa.</li>`;
    else if (state.origin) {
      items.forEach(l => { l._km = km(state.origin, l); }); items.sort((a, b) => a._km - b._km);
      listEl.innerHTML = `<li class="grp"><h3 class="grp__title">Más cerca de ti</h3><ul>${items.map(row).join("")}</ul></li>`;
    } else {
      const groups = {}; items.forEach(l => (groups[l.district] ||= []).push(l));
      listEl.innerHTML = Object.keys(groups).sort((a, b) => districtName(a).localeCompare(districtName(b), "es"))
        .map(id => `<li class="grp"><h3 class="grp__title"><span>${esc(districtName(id))}</span><span>${groups[id].length}</span></h3><ul>${groups[id].sort((a, b) => a.store.localeCompare(b.store, "es")).map(row).join("")}</ul></li>`).join("");
    }
    const visible = new Set(items.map(l => l.id));
    LOCATIONS.forEach(l => l.pin.classList.toggle("is-dim", !visible.has(l.id)));
    let msg;
    if (state.origin) msg = "Ordenadas por distancia desde tu ubicación.";
    else if (state.query) msg = items.length === 1 ? `1 resultado para “${state.query}”.` : `${items.length} resultados para “${state.query}”.`;
    else if (state.district) msg = `${items.length} ${items.length === 1 ? "punto de venta" : "puntos de venta"} en ${districtName(state.district)}.`;
    else msg = `${LOCATIONS.length} puntos de venta, agrupados por distrito.`;
    statusEl.textContent = msg;
    chip.hidden = !state.district;
    if (state.district) { chip.firstElementChild.textContent = districtName(state.district); chip.setAttribute("aria-label", `Quitar filtro: ${districtName(state.district)}`); }
    if (view) view.refresh();
  }
  function syncUrl() {
    const u = new URL(location.href);
    u.searchParams.delete("tienda"); u.searchParams.delete("distrito");
    if (state.selected) u.searchParams.set("tienda", state.selected); else if (state.district) u.searchParams.set("distrito", state.district);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  }
  const showCard = html => { cardBody.innerHTML = html; card.hidden = false; };
  const clearPins = () => LOCATIONS.forEach(l => { l.pin.classList.remove("is-selected"); l.pin.removeAttribute("aria-current"); });
  function closeCard() { card.hidden = true; state.selected = null; clearPins(); view.highlight(state.district); renderList(); syncUrl(); }
  card.querySelector(".card__close").addEventListener("click", closeCard);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !card.hidden && el.contains(document.activeElement)) { closeCard(); (view.kind === "gl" ? $("canvas", glBox) : el).focus(); } });

  function selectLocation(id, { fly = true, scroll = true } = {}) {
    const l = LOCATIONS.find(x => x.id === id); if (!l) return;
    state.selected = id;
    LOCATIONS.forEach(x => { x.pin.classList.toggle("is-selected", x.id === id); x.pin.toggleAttribute("aria-current", x.id === id); });
    view.highlight(l.district);
    const others = LOCATIONS.filter(x => x.store === l.store && x.id !== l.id);
    const dist = state.origin ? `<p class="card__addr card__dist">A ${nf1.format(km(state.origin, l))}&nbsp;km de tu ubicación</p>` : "";
    showCard(`
      <h3 class="card__title">${esc(l.store)}</h3>
      <p class="card__addr">${esc(l.address)}, ${esc(districtName(l.district))}</p>${dist}
      <div class="card__actions"><a class="btn btn--orange" href="${esc(mapsUrl(l))}" target="_blank" rel="noopener">Cómo llegar<span class="sr"> (abre Google Maps)</span></a></div>
      ${others.length ? `<p class="card__also">También en: ${others.map(o => `<button type="button" data-select="${o.id}">${esc(districtName(o.district))}</button>`).join(", ")}</p>` : ""}`);
    renderList();
    if (fly) view.focus(l);
    if (scroll) { const rowEl = listEl.querySelector(`.loc[data-id="${id}"]`); if (rowEl && listEl.scrollHeight > listEl.clientHeight) listEl.scrollTo({ top: rowEl.offsetTop - 40, behavior: reduceMotion.matches ? "instant" : "smooth" }); }
    syncUrl();
  }
  const nearestTo = point => LOCATIONS.map(l => ({ l, d: km(point, l) })).sort((a, b) => a.d - b.d)[0];
  function selectDistrict(id, { fly = true } = {}) {
    const name = DISTRICT_NAMES[id]; if (!name) return;
    state.selected = null; state.origin = null; view.me(null); clearPins();
    state.query = ""; search.value = "";
    if (districtsWithStores.has(id)) {
      state.district = id; card.hidden = true; view.highlight(id); renderList();
      if (fly) view.fitDistrict(id);
      listEl.scrollTo({ top: 0 });
    } else {
      state.district = null; view.highlight(id); renderList();
      const c = labelPoint[id], n = nearestTo(c);
      showCard(`
        <h3 class="card__title">Aún no vendemos en ${esc(name)}</h3>
        <p class="card__addr">El punto de venta más cercano es <b>${esc(n.l.store)}</b>, en ${esc(districtName(n.l.district))}, a unos ${nf1.format(Math.max(0.5, n.d))}&nbsp;km.</p>
        <div class="card__actions">
          <button class="btn btn--orange" type="button" data-select="${n.l.id}">Ver ${esc(n.l.store)}</button>
          <a class="btn btn--light" href="${esc(mapsUrl(n.l))}" target="_blank" rel="noopener">Cómo llegar<span class="sr"> (abre Google Maps)</span></a>
        </div>`);
      if (fly) view.fitPts([c, n.l], .22);
    }
    syncUrl();
  }
  chip.addEventListener("click", () => { state.district = null; card.hidden = true; state.selected = null; clearPins(); view.highlight(null); renderList(); syncUrl(); view.home(); });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-select]");
    if (t) {
      const fromList = !!t.closest(".list");
      if (fromList && sec.classList.contains("is-list")) { showPane("map"); requestAnimationFrame(() => selectLocation(t.dataset.select, { scroll: false })); return; }
      selectLocation(t.dataset.select, { scroll: !fromList });
      if (fromList) { const r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) el.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "instant" : "smooth" }); }
      return;
    }
    const pin = e.target.closest(".gpin[data-id]");
    if (pin) selectLocation(pin.dataset.id);
  });
  let qTimer = 0;
  search.addEventListener("input", () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      state.query = search.value.trim(); state.district = null; state.selected = null; card.hidden = true;
      clearPins(); view.highlight(null); renderList(); syncUrl();
      const items = visibleLocations();
      if (state.query && items.length) view.fitPts(items, .2);
    }, 180);
  });
  search.addEventListener("keydown", e => { if (e.key === "Enter") { const first = visibleLocations()[0]; if (first) { e.preventDefault(); selectLocation(first.id); } } });
  geoBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) { statusEl.textContent = "Tu navegador no permite compartir la ubicación. Busca tu distrito arriba."; return; }
    const label = geoBtn.querySelector("span");
    geoBtn.setAttribute("aria-busy", "true"); label.textContent = "Ubicando…";
    navigator.geolocation.getCurrentPosition(pos => {
      geoBtn.removeAttribute("aria-busy"); label.textContent = "Cerca de mí";
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      state.origin = origin; state.district = null; state.query = ""; search.value = "";
      const n = nearestTo(origin), far = n.d > 60;
      view.me(far ? null : origin);
      selectLocation(n.l.id, { fly: false });
      if (far) { view.home(); statusEl.textContent = "Parece que estás fuera de Lima. Estas son nuestras tiendas, de la más cercana a la más lejana."; }
      else view.fitPts([origin, n.l], .25);
      listEl.scrollTo({ top: 0 });
    }, err => {
      geoBtn.removeAttribute("aria-busy"); label.textContent = "Cerca de mí";
      statusEl.textContent = err.code === 1 ? "No tenemos permiso para ver tu ubicación. Actívalo en tu navegador o busca tu distrito." : "No pudimos obtener tu ubicación. Inténtalo de nuevo o busca tu distrito.";
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });
  // phones: map or list, one at a time
  const sec = $("#comprar"), paneBtns = $$(".mapviews button");
  function showPane(v) {
    sec.classList.toggle("is-list", v === "list");
    paneBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    if (v === "map" && view && view.resize) view.resize();
  }
  paneBtns.forEach(b => b.addEventListener("click", () => showPane(b.dataset.view)));
  $$(".ctrl").forEach(b => b.addEventListener("click", () => { const z = b.dataset.zoom; if (z === "in") view.zoom(1); else if (z === "out") view.zoom(-1); else view.toggle(); }));

  // restore the selection on whichever renderer is active (deep links and after switching to the street map)
  function applyState(animate) {
    view.highlight(state.selected ? LOCATIONS.find(x => x.id === state.selected).district : state.district);
    if (state.origin) view.me(state.origin);
    if (state.selected) view.focus(LOCATIONS.find(x => x.id === state.selected), animate);
    else if (state.district) view.fitDistrict(state.district);
    renderList();
  }
  let view = svgView();
  let entered = false;
  new IntersectionObserver((entries, io) => {
    if (entries.some(en => en.isIntersecting) && !entered) {
      entered = true; io.disconnect();
      if (!reduceMotion.matches) { pinsEl.classList.add("is-entering"); setTimeout(() => pinsEl.classList.remove("is-entering"), 1500); }
    }
  }, { threshold: 0.35 }).observe(el);
  renderList();
  const params = new URLSearchParams(location.search);
  if (params.get("tienda")) selectLocation(params.get("tienda"), { fly: false });
  else if (params.get("distrito")) selectDistrict(params.get("distrito"), { fly: false });
  if (state.selected) view.focus(LOCATIONS.find(x => x.id === state.selected), false);

  // upgrade to the street map when the section gets close; keep the SVG map if anything fails
  if (CONFIG.streetMap && hasWebGL()) {
    const start = () => loadMapLibre().then(glView).then(gl => {
      view.destroy(); view = gl;
      $("#map-svg").setAttribute("hidden", ""); // SVG elements have no .hidden property
      applyState(false);
    }).catch(err => { console.warn("Mapa de calles no disponible; se usa el mapa de distritos.", err && err.message); });
    new IntersectionObserver((entries, io) => {
      if (entries.some(en => en.isIntersecting)) { io.disconnect(); el.classList.add("is-loading"); start().finally(() => el.classList.remove("is-loading")); }
    }, { rootMargin: "600px 0px" }).observe(el);
  }
}

/* ---------- One section per gesture (desktop) ---------- */
// CSS scroll snapping handles keyboard, scrollbar and touch. For the mouse wheel and trackpads, one gesture
// moves exactly one section: inertia from the same swipe is ignored, and inner scrollers (store list) scroll first.
function initPaging() {
  const stops = () => {
    const end = document.documentElement.scrollHeight - innerHeight;
    return [0, ...$$("main > .sec").map(s => Math.round(s.getBoundingClientRect().top + scrollY - 72)), end].filter((t, i, a) => t <= end && (i === 0 || t > a[i - 1] + 4));
  };
  let lockUntil = 0, lastEvent = 0;
  addEventListener("wheel", e => {
    const now = performance.now(), gap = now - lastEvent; lastEvent = now;
    if (!deckMQ.matches || e.ctrlKey || e.metaKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    for (let el = e.target; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1 && (e.deltaY > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return;
    }
    const y = scrollY, list = stops(), dir = Math.sign(e.deltaY);
    // a section taller than the screen (e.g. an open composition) scrolls normally until its end
    const cur = [...list].reverse().find(t => t <= y + 4) ?? 0, next = list.find(t => t > cur + 4) ?? list[list.length - 1];
    const tall = next - cur > innerHeight - 72 + 40;
    if (tall && (dir > 0 ? y + innerHeight < next + 72 - 4 : y > cur + 4)) return;
    e.preventDefault();
    if (now < lockUntil || gap < 160) { lockUntil = Math.max(lockUntil, now + 160); return; } // same gesture (or its inertia)
    const target = dir > 0 ? list.find(t => t > y + 4) : [...list].reverse().find(t => t < y - 4);
    if (target == null) return;
    lockUntil = now + 700;
    scrollTo({ top: target, behavior: reduceMotion.matches ? "instant" : "smooth" });
  }, { passive: false });
}

/* ---------- Contact form ---------- */
function initForm() {
  const form = $("#contact-form"), status = $("#form-status"), tipo = $("#f-tipo");
  const business = $$("[data-business]", form);
  const syncBusiness = () => business.forEach(f => { f.hidden = tipo.value === "consumidor"; });
  tipo.addEventListener("change", syncBusiness); syncBusiness();
  const messages = {
    nombres: "Escribe tu nombre.",
    email: "Escribe un correo válido, por ejemplo nombre@correo.com.",
    telefono: "Escribe un teléfono de al menos 7 dígitos.",
    mensaje: "Cuéntanos en qué te podemos ayudar.",
    ruc: "El RUC tiene 11 dígitos."
  };
  const validate = input => {
    let bad = false;
    const v = input.value.trim();
    if (input.name === "telefono") bad = v.replace(/\D/g, "").length < 7;
    else if (input.name === "ruc") bad = !!v && !/^\d{11}$/.test(v);
    else if (input.required) bad = !v || (input.type === "email" && !input.checkValidity());
    const err = document.getElementById("e-" + input.id.replace("f-", ""));
    input.setAttribute("aria-invalid", String(bad));
    if (err) err.textContent = bad ? messages[input.name] : "";
    return !bad;
  };
  const fields = $$("input, textarea", form).filter(i => i.required || i.name === "ruc");
  fields.forEach(i => i.addEventListener("blur", () => { if (i.value) validate(i); }));
  fields.forEach(i => i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") validate(i); }));
  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "form__status"; status.textContent = "";
    const invalid = fields.filter(i => !i.closest("[hidden]")).filter(i => !validate(i));
    if (invalid.length) { invalid[0].focus(); status.classList.add("is-err"); status.textContent = "Revisa los campos marcados."; return; }
    const data = Object.fromEntries(new FormData(form));
    if (tipo.value === "consumidor") { delete data.empresa; delete data.ruc; }
    const btn = form.querySelector('[type="submit"]');
    if (!CONFIG.formEndpoint) {
      const tipoTxt = tipo.options[tipo.selectedIndex].text;
      const body = [`Nombre: ${data.nombres} ${data.apellidos || ""}`.trim(), `Correo: ${data.email}`, `Teléfono: ${data.telefono}`, `Tipo: ${tipoTxt}`,
        data.empresa ? `Empresa: ${data.empresa}` : "", data.ruc ? `RUC: ${data.ruc}` : "", "", data.mensaje].filter((x, i) => x || i === 6).join("\n");
      location.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent("Consulta desde cooking.pe — " + tipoTxt)}&body=${encodeURIComponent(body)}`;
      status.classList.add("is-ok"); status.textContent = "Abrimos tu app de correo con el mensaje listo para enviar.";
      return;
    }
    btn.setAttribute("aria-busy", "true"); btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(String(r.status));
      form.reset(); syncBusiness();
      status.classList.add("is-ok"); status.textContent = `Mensaje enviado. Te responderemos a ${data.email}.`;
    } catch {
      status.classList.add("is-err"); status.textContent = `No se pudo enviar. Inténtalo de nuevo o escríbenos a ${CONFIG.contactEmail}.`;
    } finally {
      btn.removeAttribute("aria-busy"); btn.disabled = false; btn.textContent = "Enviar mensaje";
    }
  });
}

$$("[data-year]").forEach(n => n.textContent = new Date().getFullYear());
paintIcons();
initLogo();
initHeader();
initRibbon();
initBowl();
initPan();
initOrbit();
initRecipes();
initPlan();
initSteps();
$$("img[src^='http'], img[data-fallback]").forEach(watchImage);
initMap();
initForm();
initPaging();
initHero();
})();
