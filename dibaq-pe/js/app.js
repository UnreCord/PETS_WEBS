/* Dibaq Perú: interfaz (cabecera, paginado por secciones, líneas, especies, proteínas, buscador, ficha,
   comunidad, tiendas y contacto). Las escenas animadas viven en escena.js. */
(function () {
"use strict";

const CAT = window.DIBAQ_CATALOGO;
const CFG = window.DIBAQ_CONFIG || {};
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const phone = matchMedia("(max-width: 767px)");
const desk = matchMedia("(min-width: 1024px)");
const num = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });
const emit = (name, detail) => dispatchEvent(new CustomEvent("dibaq:" + name, { detail }));
const waURL = texto => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(texto)}`;

/* ---------- vocabulario ---------- */
// color de cada proteína (puntos de las tarjetas y botones de proteína)
const FOOD = {
  "Salmón": "#EE8B62", "Arenque": "#8FA9BA", "Atún": "#6A98BD", "Krill": "#E06A4E",
  "Cordero": "#C47D6E", "Pavo": "#D4A05A", "Pollo": "#E2BC6C", "Pato": "#76A07C",
  "Conejo": "#C4AA8E", "Ciervo": "#A97D5D", "Jabalí": "#9C7A62"
};
const PROTEINAS = ["Salmón", "Cordero", "Pavo", "Pollo", "Pato", "Conejo", "Ciervo", "Jabalí", "Arenque", "Atún", "Krill"];
const SIN_DE = { "Salmón": "salmon", "Pavo": "pavo", "Pollo": "pollo", "Cordero": "cordero", "Pato": "pato", "Arenque": "pescado", "Atún": "pescado", "Krill": "pescado" };
const SIN_TXT = { salmon: "salmón", pescado: "pescado", pavo: "pavo", pollo: "pollo", cordero: "cordero", pato: "pato", cereales: "cereales" };
const NEC_TXT = { alergias: "alergias o piel sensible", digestion: "digestión delicada", peso: "control de peso", articulaciones: "articulaciones", pelaje: "pelo y piel brillantes", esterilizado: "gatos esterilizados", urinario: "salud urinaria" };
const LINEA_TXT = { nm: "Natural Moments", sense: "Sense" };
const TAM_TXT = { mini: "raza pequeña", mediano: "raza mediana", grande: "raza grande" };
const tamanoDe = kg => kg <= 10 ? "mini" : kg <= 25 ? "mediano" : "grande";
const RAZAS = [
  ["Chihuahua", 2.5], ["Yorkshire terrier", 3], ["Pomerania", 3], ["Maltés", 3.5], ["Caniche toy", 3.5], ["Bichón frisé", 5],
  ["Shih tzu", 6], ["Jack Russell terrier", 6], ["Lhasa apso", 6.5], ["Schnauzer miniatura", 7], ["Pug", 8], ["Dachshund (salchicha)", 8],
  ["West highland terrier", 8], ["Perro sin pelo del Perú pequeño", 6], ["Perro sin pelo del Perú mediano", 12], ["Perro sin pelo del Perú grande", 20],
  ["Bulldog francés", 11], ["Beagle", 12], ["Caniche mediano", 12], ["Cocker spaniel", 13], ["Border collie", 18], ["Shar pei", 22],
  ["Bulldog inglés", 23], ["Siberian husky", 23], ["Samoyedo", 25], ["Basset hound", 25], ["Dálmata", 25], ["Pitbull", 25],
  ["Pastor belga malinois", 28], ["Boxer", 30], ["American bully", 30], ["Labrador retriever", 32], ["Golden retriever", 32],
  ["Weimaraner", 32], ["Pastor alemán", 34], ["Doberman", 38], ["Akita", 40], ["Rottweiler", 45], ["Gran danés", 60], ["San Bernardo", 70]
];
const lista = (arr, y = "y") => arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " " + y + " " + arr[arr.length - 1];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// la versión de un solo archivo trae las bolsas incrustadas en window.DIBAQ_IMG
const imgDe = p => (window.DIBAQ_IMG && window.DIBAQ_IMG[p.id]) || `img/productos/${p.id}.webp`;
// y el resto de imágenes que se piden desde JS en window.DIBAQ_ASSETS (ruta → data URI)
const recurso = ruta => (window.DIBAQ_ASSETS && window.DIBAQ_ASSETS[ruta]) || ruta;
// abierta como archivo local, algunos navegadores no dejan cambiar la dirección: los filtros siguen funcionando igual
const fijarURL = url => { try { history.replaceState(null, "", url); } catch (e) { /* sin enlace compartible */ } };
function paraQuien(p) {
  if (p.especie === "gato") return p.edad.includes("cachorro") ? "Gatito" : "Gato " + lista(p.edad.map(e => e === "senior" ? "senior" : e));
  const edad = lista(p.edad.map(e => e === "cachorro" ? "cachorro" : e));
  const tam = p.tamano.length === 3 ? "todas las razas" : p.tamano.length === 1 ? { mini: "razas pequeñas", mediano: "razas medianas", grande: "razas grandes" }[p.tamano[0]] : "";
  return "Perro " + edad + (tam ? ", " + tam : "");
}

// el color de cada receta, oscurecido hasta que se lea como texto sobre el papel (4.5:1)
function lum(hex) { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function mezclar(a, b, t) { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
function acentoTexto(hex) { const papel = lum("#F7F5F0"); let c = hex, t = 0; while ((papel + 0.05) / (lum(c) + 0.05) < 4.5 && t < 1) { t += 0.08; c = mezclar(hex, "#121110", t); } return c; }
const acentoDe = p => p.acento || (p.linea === "sense" ? "#6CB8E6" : "#1E1C18");

/* ---------- configuración de marketing ---------- */
function initConfig() {
  $$("[data-anio]").forEach(n => { n.textContent = new Date().getFullYear(); });
  // WhatsApp: botón flotante y "Asesoría" solo cuando hay número
  const saludo = "Hola, quiero asesoría para elegir el alimento de mi peludo.";
  $$("[data-wa]").forEach(a => {
    if (CFG.whatsapp) { a.href = waURL(saludo); a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
    else if (a.classList.contains("wa-flota")) a.hidden = true;
  });
  const canales = $(".canales");
  const add = (href, txt) => { const li = document.createElement("li"); li.innerHTML = `<a class="enlace" href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${esc(txt)}</a>`; canales.append(li); };
  if (CFG.whatsapp) add(waURL(saludo), "Escríbenos por WhatsApp");
  if (CFG.email) add(`mailto:${CFG.email}`, CFG.email);
  if (CFG.instagram) add(CFG.instagram, "Instagram");
  if (CFG.facebook) add(CFG.facebook, "Facebook");
  if (CFG.distribuidor) $$("[data-distribuidor]").forEach(d => { d.textContent = "Distribuido en Perú por " + CFG.distribuidor + "."; });
}

/* ---------- conteos y rangos que salen del catálogo ---------- */
function initConteos() {
  $$("[data-cuenta]").forEach(n => {
    const [k, v] = n.dataset.cuenta.split(":");
    n.textContent = CAT.filter(p => k === "necesidad" ? p.necesidades.includes(v) : p[k] === v).length;
  });
  $$("[data-rango]").forEach(n => {
    const vals = CAT.filter(p => p.especie === n.dataset.rango && p.analisis && p.analisis.proteina).map(p => p.analisis.proteina);
    n.textContent = vals.length ? `${Math.min(...vals)} a ${Math.max(...vals)}%` : "";
  });
}

/* ---------- cabecera, riel y menú ---------- */
const secciones = () => $$("main > .sec");
function seccionActual() {
  const y = innerHeight / 2;
  return secciones().find(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }) || secciones()[0];
}
function initCabecera() {
  const rail = $$("[data-riel]"), nav = $$(".cab__nav a"), riel = $(".riel");
  let ultima = null;
  function actualizar() {
    const sec = seccionActual();
    if (sec === ultima) return;
    ultima = sec;
    rail.forEach(a => a.setAttribute("aria-current", String(a.dataset.riel === sec.id)));
    nav.forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + sec.id)));
    riel.classList.toggle("sobre-oscuro", false);
    emit("seccion", { id: sec.id });
  }
  let pend = false;
  addEventListener("scroll", () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; actualizar(); }); } }, { passive: true });
  addEventListener("resize", actualizar);
  actualizar();

  const btn = $(".cab__menu"), menu = $("#menu-movil");
  const cerrar = () => { btn.setAttribute("aria-expanded", "false"); menu.hidden = true; document.body.classList.remove("bloqueado"); $(".sr", btn).textContent = "Abrir menú"; };
  btn.addEventListener("click", () => {
    if (btn.getAttribute("aria-expanded") === "true") return cerrar();
    btn.setAttribute("aria-expanded", "true"); menu.hidden = false; document.body.classList.add("bloqueado"); $(".sr", btn).textContent = "Cerrar menú";
    $("a", menu).focus();
  });
  $$("a", menu).forEach(a => a.addEventListener("click", cerrar));
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { cerrar(); btn.focus(); } });
}

/* ---------- una sección por gesto ---------- */
// Táctil, teclado y barra de desplazamiento usan el scroll-snap de CSS (scroll-snap-stop: always).
// Para rueda y touchpad, un gesto mueve exactamente una sección; la inercia del mismo gesto se ignora
// y las listas con scroll propio (resultados, filtros, ficha) se recorren primero.
function initPaginado() {
  document.documentElement.classList.add("paginado");
  const paradas = () => {
    const fin = document.documentElement.scrollHeight - innerHeight;
    return secciones().map(s => Math.min(fin, Math.round(s.getBoundingClientRect().top + scrollY)));
  };
  let bloqueo = 0, ultimo = 0;
  addEventListener("wheel", e => {
    const ahora = performance.now(), hueco = ahora - ultimo; ultimo = ahora;
    if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX) || document.body.classList.contains("bloqueado")) return;
    for (let el = e.target; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1 && (e.deltaY > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return;
    }
    const y = scrollY, lista = paradas(), dir = Math.sign(e.deltaY);
    // una sección más alta que la pantalla se recorre normalmente hasta su final
    const actual = [...lista].reverse().find(t => t <= y + 4) ?? 0;
    const siguiente = lista.find(t => t > actual + 4) ?? document.documentElement.scrollHeight - innerHeight;
    if (siguiente - actual > innerHeight + 40 && (dir > 0 ? y + innerHeight < siguiente - 4 : y > actual + 4)) return;
    e.preventDefault();
    if (ahora < bloqueo || hueco < 140) { bloqueo = Math.max(bloqueo, ahora + 140); return; }
    const meta = dir > 0 ? lista.find(t => t > y + 4) : [...lista].reverse().find(t => t < y - 4);
    if (meta == null) return;
    bloqueo = ahora + 750;
    scrollTo({ top: meta, behavior: reduce.matches ? "auto" : "smooth" });
  }, { passive: false });
}

/* ---------- entrada del inicio ---------- */
function initInicio() {
  const go = () => requestAnimationFrame(() => document.body.classList.add("listo"));
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(go);
}

/* ---------- las dos líneas: bosque de Natural Moments, pestañas en celular ---------- */
function bosque(svg) { // tres filas de pinos, como el fondo de las bolsas Natural Moments
  let a = 7; const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  const filas = [[150, 34, 120], [205, 26, 160], [255, 20, 190]];
  $$("path", svg).forEach((path, k) => {
    const [y0, n, alto] = filas[k];
    let d = `M0 320 L0 ${y0}`;
    for (let i = 0; i < n; i++) {
      const cx = (i + 0.2 + r() * 0.6) / n * 1200, h = alto * (0.55 + r() * 0.45), w = h * (0.2 + r() * 0.07);
      d += ` L${(cx - w).toFixed(1)} ${y0} L${(cx - w * 0.45).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} L${(cx - w * 0.7).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} L${cx.toFixed(1)} ${(y0 - h).toFixed(1)} L${(cx + w * 0.7).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} L${(cx + w * 0.45).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} L${(cx + w).toFixed(1)} ${y0}`;
    }
    path.setAttribute("d", d + " L1200 320 Z");
  });
}
function initLineas() {
  bosque($(".panel__bosque"));
  const cont = $(".lineas__in"), tabs = $$(".lineas__selector [role=tab]"), paneles = [$("#linea-sense"), $("#linea-nm")];
  const marcar = i => { tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; }); };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { cont.scrollTo({ left: paneles[i].offsetLeft, behavior: reduce.matches ? "auto" : "smooth" }); marcar(i); });
    t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const j = e.key === "ArrowRight" ? 1 : 0; tabs[j].focus(); tabs[j].click(); } });
  });
  let pend = false;
  cont.addEventListener("scroll", () => {
    if (pend || !phone.matches) return; pend = true;
    requestAnimationFrame(() => { pend = false; const i = cont.scrollLeft > cont.clientWidth / 2 ? 1 : 0; if (tabs[i].getAttribute("aria-selected") !== "true") marcar(i); });
  }, { passive: true });
  const sync = () => paneles.forEach((p, i) => { if (phone.matches) { p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", tabs[i].id); } else p.removeAttribute("role"); });
  phone.addEventListener("change", sync); sync();
}

/* ---------- perro o gato ---------- */
function initEspecies() {
  const sec = $("#especies"), btns = $$(".conmutador [data-especie]", sec);
  sec.dataset.especie = "perro";
  const elegir = esp => {
    sec.dataset.especie = esp;
    btns.forEach(b => b.setAttribute("aria-checked", String(b.dataset.especie === esp)));
    $$(".especie", sec).forEach(p => { p.hidden = p.dataset.panel !== esp; });
    $$("[data-foto-especie]", sec).forEach(i => { i.hidden = i.dataset.fotoEspecie !== esp; });
    emit("especie", { especie: esp });
  };
  btns.forEach(b => {
    b.addEventListener("click", () => elegir(b.dataset.especie));
    b.addEventListener("keydown", e => { if (/Arrow(Left|Right|Up|Down)/.test(e.key)) { e.preventDefault(); const o = btns.find(x => x !== b); o.focus(); elegir(o.dataset.especie); } });
  });
}

/* ---------- proteínas ---------- */
function initProteinas() {
  const ul = $(".proteinas"), info = $(".proteina-info"), txt = $(".proteina-info__txt", info), acc = $(".proteina-info__acciones", info);
  const original = txt.innerHTML;
  ul.innerHTML = PROTEINAS.map(n => {
    const c = CAT.filter(p => p.proteinas.includes(n)).length;
    return `<li><button class="proteina" type="button" aria-pressed="false" data-p="${n}" style="--c:${FOOD[n]}"><i aria-hidden="true"></i>${n} <small>${c}</small></button></li>`;
  }).join("");
  ul.addEventListener("click", e => {
    const b = e.target.closest(".proteina"); if (!b) return;
    const ya = b.getAttribute("aria-pressed") === "true";
    $$(".proteina", ul).forEach(x => x.setAttribute("aria-pressed", "false"));
    if (ya) { txt.innerHTML = original; acc.innerHTML = ""; emit("proteina", { p: null }); return; }
    b.setAttribute("aria-pressed", "true");
    const n = b.dataset.p, con = CAT.filter(p => p.proteinas.includes(n));
    const lineas = [...new Set(con.map(p => LINEA_TXT[p.linea]))];
    txt.innerHTML = `<strong>${n}</strong> está en ${con.length === 1 ? "1 receta" : con.length + " recetas"} de ${lista(lineas)}: ${esc(lista(con.slice(0, 4).map(p => p.nombre.toLowerCase())))}${con.length > 4 ? " y más" : ""}.`;
    const sin = SIN_DE[n];
    const nSin = sin ? CAT.filter(p => !p.contiene.includes(sin)).length : 0;
    acc.innerHTML = `<button class="enlace enlace--sm" type="button" data-ir="con=${encodeURIComponent(n)}">Ver las recetas con ${n.toLowerCase()}</button>`
      + (sin ? `<button class="enlace enlace--sm" type="button" data-ir="sin=${sin}">Ver las ${nSin} recetas sin ${SIN_TXT[sin]}</button>` : "");
    emit("proteina", { p: n });
  });
}

/* ---------- buscador ---------- */
const F = { especie: "", edad: "", peso: null, tamano: "", raza: "", necesidad: [], sin: [], linea: "", con: "" };
let resultados = [];
// las dos líneas se intercalan para que convivan en la grilla: perros primero, luego gatos
const ORDEN_CAT = (() => {
  const out = [];
  ["perro", "gato"].forEach(e => {
    const nm = CAT.filter(p => p.especie === e && p.linea === "nm"), se = CAT.filter(p => p.especie === e && p.linea === "sense");
    for (let k = 0; k < Math.max(nm.length, se.length); k++) { if (se[k]) out.push(se[k]); if (nm[k]) out.push(nm[k]); }
  });
  return out;
})();
function filtrar(f = F, sinClave) {
  return ORDEN_CAT.filter(p => {
    if (sinClave !== "especie" && f.especie && p.especie !== f.especie) return false;
    if (sinClave !== "edad" && f.edad && !p.edad.includes(f.edad)) return false;
    if (sinClave !== "tamano" && f.tamano && p.especie === "perro" && !p.tamano.includes(f.tamano)) return false;
    if (sinClave !== "linea" && f.linea && p.linea !== f.linea) return false;
    if (sinClave !== "con" && f.con && !p.proteinas.includes(f.con)) return false;
    if (f.necesidad.some(n => sinClave !== "necesidad:" + n && !p.necesidades.includes(n))) return false;
    if (f.sin.some(s => sinClave !== "sin:" + s && p.contiene.includes(s))) return false;
    return true;
  });
}
function contar(campo, valor) {
  const f = { ...F, necesidad: [...F.necesidad], sin: [...F.sin] };
  if (campo === "necesidad" || campo === "sin") { if (!f[campo].includes(valor)) f[campo].push(valor); }
  else { f[campo] = valor; if (campo === "especie" && valor !== "perro") f.tamano = ""; if (campo === "tamano") f.especie = "perro"; }
  return filtrar(f).length;
}
function resumen(n) {
  const r = n === 1 ? "1 receta" : n + " recetas";
  const esp = F.especie;
  let quien = esp === "perro" ? "tu perro" : esp === "gato" ? "tu gato" : "perros y gatos";
  if (F.edad === "cachorro") quien = esp === "perro" ? "tu cachorro" : esp === "gato" ? "tu gatito" : "cachorros y gatitos";
  if (F.edad === "adulto") quien += esp ? " adulto" : " adultos";
  if (F.edad === "senior") quien += esp ? " mayor" : " mayores";
  if (F.peso) quien += ` de ${num.format(F.peso)} kg`;
  else if (F.tamano) quien += ` de ${TAM_TXT[F.tamano]}`;
  const partes = [quien];
  if (F.linea) partes.push(`de ${LINEA_TXT[F.linea]}`);
  let txt = `<strong>${r}</strong> para ${partes.join(" ")}`;
  if (F.con) txt += `, con ${F.con.toLowerCase()}`;
  if (F.sin.length) txt += `, sin ${lista(F.sin.map(s => SIN_TXT[s]), "ni")}`;
  if (F.necesidad.length) txt += `, ${n === 1 ? "pensada" : "pensadas"} para ${lista(F.necesidad.map(x => NEC_TXT[x]))}`;
  return txt + ".";
}
function tarjeta(p, nueva) {
  const a = acentoDe(p);
  return `<li class="tarjeta tarjeta--${p.linea}${nueva ? " nueva" : ""}" data-id="${p.id}" style="--acento:${a};--acento-texto:${acentoTexto(a)}">
    <button class="tarjeta__btn" type="button" data-abrir="${p.id}" aria-label="${esc(LINEA_TXT[p.linea] + ", " + p.nombre + ". Ver ficha")}">
      <span class="tarjeta__img"><img src="${imgDe(p)}" alt="" width="800" height="1000" loading="lazy" decoding="async"></span>
      <span class="tarjeta__linea">${p.linea === "sense" ? "Dibaq Sense" : "Natural Moments"}</span>
      <span class="tarjeta__nombre">${esc(cap(p.nombre))}</span>
      <span class="tarjeta__para">${esc(paraQuien(p))}</span>
      <span class="tarjeta__resumen">${esc(p.resumen)}</span>
      <ul class="prot" role="list">${p.proteinas.map(n => `<li><i style="--c:${FOOD[n] || "#999"}"></i>${n}</li>`).join("")}</ul>
    </button>
  </li>`;
}
function initBuscador() {
  const form = $("#filtros"), ul = $("#tarjetas"), vacio = $(".vacio"), sug = $(".vacio__sugerencias");
  const peso = $("#f-peso"), pesoTxt = $("#f-peso-txt"), pesoBox = $(".peso"), quitarPeso = $(".peso__quitar"), raza = $("#f-raza");
  $("#razas").innerHTML = RAZAS.map(([n]) => `<option value="${n}"></option>`).join("");

  function leerURL() {
    const q = new URLSearchParams(location.search);
    F.especie = q.get("especie") || ""; F.edad = q.get("edad") || ""; F.linea = q.get("linea") || ""; F.con = q.get("con") || "";
    F.tamano = q.get("tamano") || ""; F.peso = q.get("peso") ? +q.get("peso") : null;
    F.necesidad = (q.get("necesidad") || "").split(",").filter(Boolean); F.sin = (q.get("sin") || "").split(",").filter(Boolean);
    if (F.peso) F.tamano = tamanoDe(F.peso);
  }
  function escribirURL() {
    const q = new URLSearchParams(location.search);
    ["especie", "edad", "tamano", "peso", "necesidad", "sin", "linea", "con"].forEach(k => q.delete(k));
    if (F.especie) q.set("especie", F.especie); if (F.edad) q.set("edad", F.edad); if (F.linea) q.set("linea", F.linea); if (F.con) q.set("con", F.con);
    if (F.peso) q.set("peso", F.peso); else if (F.tamano) q.set("tamano", F.tamano);
    if (F.necesidad.length) q.set("necesidad", F.necesidad.join(",")); if (F.sin.length) q.set("sin", F.sin.join(","));
    const s = q.toString();
    fijarURL(location.pathname + (s ? "?" + s : "") + location.hash);
  }
  function aFormulario() {
    $$("input[name=especie]", form).forEach(i => { i.checked = i.value === F.especie; });
    $$("input[name=linea]", form).forEach(i => { i.checked = i.value === F.linea; });
    $$("input[name=edad]", form).forEach(i => { i.checked = i.value === F.edad; });
    $$("input[name=tamano]", form).forEach(i => { i.checked = i.value === F.tamano; });
    $$("input[name=necesidad]", form).forEach(i => { i.checked = F.necesidad.includes(i.value); });
    $$("input[name=sin]", form).forEach(i => { i.checked = F.sin.includes(i.value); });
    pesoBox.classList.toggle("sin-valor", !F.peso);
    if (F.peso) peso.value = F.peso;
    pesoTxt.textContent = F.peso ? `${num.format(F.peso)} kg, ${TAM_TXT[tamanoDe(F.peso)]}` : "Sin definir";
    quitarPeso.hidden = !F.peso;
    if (!F.raza) raza.value = "";
    // grupos que dependen de la especie
    $$("[data-solo]", form).forEach(g => { g.hidden = g.dataset.solo === "perro" ? F.especie !== "perro" : F.especie === "perro"; });
    $("[data-cachorro]", form).textContent = F.especie === "gato" ? "Gatito" : F.especie === "perro" ? "Cachorro" : "Cachorro o gatito";
    $("[data-senior]", form).textContent = F.especie === "perro" ? "Senior, +7 años" : "Senior";
  }
  let previos = new Set();
  function pintar(animar) {
    resultados = filtrar();
    const ids = resultados.map(p => p.id);
    ul.innerHTML = resultados.map(p => tarjeta(p, animar && !reduce.matches && !previos.has(p.id))).join("");
    previos = new Set(ids);
    $("#resumen").innerHTML = resumen(resultados.length);
    // cuántas recetas quedarían al elegir cada opción (como en el buscador de Taste of the Wild)
    $$("[data-n]", form).forEach(el => {
      const [campo, valor] = el.dataset.n.split(":"), input = el.closest("label").querySelector("input");
      const n = contar(campo, valor);
      el.textContent = n;
      el.closest("span").classList.toggle("sin-resultados", n === 0 && !input.checked);
    });
    $$("[data-n-resultados]").forEach(n => { n.textContent = resultados.length; });
    const activos = (F.especie ? 1 : 0) + (F.edad ? 1 : 0) + (F.tamano ? 1 : 0) + (F.linea ? 1 : 0) + (F.con ? 1 : 0) + F.necesidad.length + F.sin.length;
    $$("[data-n-filtros]").forEach(n => { n.textContent = activos ? `(${activos})` : ""; });
    vacio.hidden = resultados.length > 0;
    if (!resultados.length) {
      // qué filtro quitar para volver a ver recetas
      const claves = [];
      if (F.con) claves.push(["con", `Quitar «con ${F.con.toLowerCase()}»`]);
      F.sin.forEach(s => claves.push(["sin:" + s, `Quitar «sin ${SIN_TXT[s]}»`]));
      F.necesidad.forEach(n => claves.push(["necesidad:" + n, `Quitar «${NEC_TXT[n]}»`]));
      if (F.edad) claves.push(["edad", "Quitar la edad"]);
      if (F.tamano) claves.push(["tamano", "Quitar el peso y el tamaño"]);
      if (F.linea) claves.push(["linea", `Ver también la otra línea`]);
      sug.innerHTML = claves.map(([k, t]) => [k, t, filtrar(F, k).length]).filter(x => x[2] > 0).sort((a, b) => b[2] - a[2]).slice(0, 3)
        .map(([k, t, n]) => `<button class="enlace" type="button" data-quitar="${k}">${esc(t)}: ${n === 1 ? "1 receta" : n + " recetas"}</button>`).join("")
        || `<button class="enlace" type="button" data-quitar="todo">Quitar todos los filtros</button>`;
    }
  }
  function aplicar(animar = true) { aFormulario(); pintar(animar); escribirURL(); }

  form.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "especie") { F.especie = t.value; if (F.especie !== "perro") { F.tamano = ""; F.peso = null; F.raza = ""; } F.necesidad = F.necesidad.filter(n => F.especie !== "perro" || !["esterilizado", "urinario"].includes(n)); }
    else if (t.name === "linea") F.linea = t.value;
    else if (t.name === "edad") F.edad = t.value;
    else if (t.name === "tamano") { F.tamano = t.value; F.peso = null; F.raza = ""; }
    else if (t.name === "necesidad") F.necesidad = $$("input[name=necesidad]:checked", form).map(i => i.value);
    else if (t.name === "sin") F.sin = $$("input[name=sin]:checked", form).map(i => i.value);
    else return;
    aplicar();
  });
  // un radio ya marcado se desmarca al tocarlo otra vez (edad y tamaño son opcionales)
  $$(".chips input[type=radio]", form).forEach(i => {
    let estaba = false;
    i.addEventListener("pointerdown", () => { estaba = i.checked; });
    i.closest("label").addEventListener("click", e => {
      if (e.target !== i && estaba) { e.preventDefault(); i.checked = false; if (i.name === "edad") F.edad = ""; else { F.tamano = ""; F.peso = null; } estaba = false; aplicar(); }
    });
  });
  peso.addEventListener("input", () => { F.peso = +peso.value; F.tamano = tamanoDe(F.peso); F.raza = ""; aplicar(false); });
  peso.addEventListener("change", () => pintar(true));
  quitarPeso.addEventListener("click", () => { F.peso = null; F.tamano = ""; F.raza = ""; raza.value = ""; aplicar(); });
  raza.addEventListener("change", () => {
    const r = RAZAS.find(([n]) => n.toLowerCase() === raza.value.trim().toLowerCase());
    if (!r) return;
    F.raza = r[0]; F.peso = Math.round(r[1]); F.tamano = tamanoDe(r[1]);
    aplicar();
    pesoTxt.textContent = `${num.format(F.peso)} kg, ${TAM_TXT[F.tamano]} (${r[0]}). Ajústalo si pesa distinto.`;
  });
  form.addEventListener("reset", e => { e.preventDefault(); Object.assign(F, { especie: "", edad: "", peso: null, tamano: "", raza: "", necesidad: [], sin: [], linea: "", con: "" }); aplicar(); });
  sug.addEventListener("click", e => {
    const b = e.target.closest("[data-quitar]"); if (!b) return;
    const k = b.dataset.quitar;
    if (k === "todo") return form.dispatchEvent(new Event("reset"));
    if (k.startsWith("sin:")) F.sin = F.sin.filter(s => s !== k.slice(4));
    else if (k.startsWith("necesidad:")) F.necesidad = F.necesidad.filter(s => s !== k.slice(10));
    else if (k === "tamano") { F.tamano = ""; F.peso = null; }
    else F[k] = "";
    aplicar();
  });
  ul.addEventListener("click", e => { const b = e.target.closest("[data-abrir]"); if (b) abrirFicha(b.dataset.abrir, b); });

  // hoja de filtros en tablet y celular
  const abrir = $(".buscador__abrir"), ver = $(".filtros__ver");
  const cerrarHoja = () => { form.classList.remove("abierto"); abrir.setAttribute("aria-expanded", "false"); document.body.classList.remove("bloqueado"); };
  abrir.addEventListener("click", () => { form.classList.add("abierto"); abrir.setAttribute("aria-expanded", "true"); document.body.classList.add("bloqueado"); setTimeout(() => $(".filtros__cerrar").focus(), 60); });
  $(".filtros__cerrar").addEventListener("click", () => { cerrarHoja(); abrir.focus(); });
  ver.addEventListener("click", () => { cerrarHoja(); abrir.focus(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && form.classList.contains("abierto")) { cerrarHoja(); abrir.focus(); } });
  desk.addEventListener("change", () => { if (desk.matches) cerrarHoja(); });

  // enlaces de otras secciones que llegan con filtros (data-ir="necesidad=peso")
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-ir]"); if (!a) return;
    e.preventDefault();
    Object.assign(F, { especie: "", edad: "", peso: null, tamano: "", raza: "", necesidad: [], sin: [], linea: "", con: "" });
    new URLSearchParams(a.dataset.ir).forEach((v, k) => {
      if (k === "necesidad" || k === "sin") F[k] = v.split(","); else F[k] = v;
    });
    aplicar(false);
    $(".resultados").scrollTop = 0; $("#tarjetas").scrollLeft = 0;
    $("#buscador").scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
  });

  leerURL(); aplicar(false);
  const prod = new URLSearchParams(location.search).get("producto");
  if (prod && CAT.some(p => p.id === prod)) setTimeout(() => abrirFicha(prod), 300);
}

/* ---------- ficha de producto ---------- */
let fichaActual = null, origenFoco = null;
function abrirFicha(id, desde) {
  const p = CAT.find(x => x.id === id); if (!p) return;
  const ficha = $("#ficha"), panel = $(".ficha__panel", ficha), cuerpo = $(".ficha__cuerpo", ficha);
  fichaActual = id;
  if (desde) origenFoco = desde;
  const ac = acentoDe(p);
  panel.style.setProperty("--acento", ac); panel.style.setProperty("--acento-texto", acentoTexto(ac));
  const a = p.analisis || {};
  const filas = [["Proteína", a.proteina], ["Grasa", a.grasa], ["Fibra", a.fibra], ["Ceniza", a.ceniza]].filter(r => r[1] != null);
  const etiquetas = [paraQuien(p), ...p.necesidades.map(n => cap(NEC_TXT[n]))];
  const consulta = `Hola, quiero información sobre ${p.completo}.`;
  cuerpo.innerHTML = `
    <div class="ficha__img"><img src="${imgDe(p)}" alt="Bolsa de ${esc(p.completo)}" width="800" height="1000"></div>
    <div class="ficha__txt">
      <p class="ficha__linea">${p.linea === "sense" ? "Dibaq Sense" : "Dibaq Natural Moments"}</p>
      <h2 class="ficha__nombre" id="ficha-nombre">${esc(cap(p.nombre))}</h2>
      <p class="ficha__completo">${esc(p.completo)}</p>
      <p class="ficha__desc">${esc(p.descripcion)}</p>
      <h3>Para</h3>
      <ul class="etiquetas" role="list">${etiquetas.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <h3>Ingredientes principales</h3>
      <ul class="ingr" role="list">${p.ingredientes.map(([n, v]) => `<li><span>${esc(n)}</span><span>${esc(v)}</span></li>`).join("")}</ul>
      ${p.sinIngredientes.length ? `<h3>No contiene</h3><ul class="etiquetas" role="list">${p.sinIngredientes.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${filas.length || a.kcal ? `<h3>Análisis garantizado</h3>
      ${filas.length ? `<ul class="analisis" role="list">${filas.map(([n, v]) => `<li><span>${n}</span><span class="barra" aria-hidden="true"><i style="--v:${Math.min(100, v / 40 * 100)}%"></i></span><span>${num.format(v)} %</span></li>`).join("")}</ul>` : ""}
      ${a.kcal ? `<p class="ficha__kcal">Energía metabolizable: ${num.format(a.kcal)} kcal/kg</p>` : ""}` : ""}
      <h3>¿Cuánto darle?</h3>
      ${a.kcal ? `<div class="racion" data-kcal="${a.kcal}">
        <label class="racion__peso">Si pesa <input type="number" min="1" max="${p.especie === "gato" ? 12 : 80}" step="0.5" value="${p.especie === "gato" ? 4 : 10}" inputmode="decimal" aria-label="Peso en kilos"> kg</label>
        <p class="racion__res"><b></b> al día, aprox.</p>
      </div>` : `<p class="ficha__kcal">Su tabla de ración viene en el empaque.</p>`}
      <a class="enlace enlace--sm" href="#guia" data-guia="${p.especie}" data-edad="${p.edad[0]}">Calcular su ración y ver cómo hacer el cambio</a>
      <h3>Formatos</h3>
      ${p.formatos ? `<ul class="etiquetas" role="list">${p.formatos.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p class="ficha__kcal">Consulta los formatos disponibles en Perú.</p>`}
      <p class="ficha__nota">Datos referenciales. Revisa la tabla de ración del empaque y consulta a tu veterinario si tiene una condición de salud.</p>
      <div class="ficha__acciones">
        ${CFG.whatsapp ? `<a class="btn" href="${waURL(consulta)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>` : `<a class="btn" href="#contacto" data-consulta="${esc(consulta)}">Consultar por esta receta</a>`}
      </div>
    </div>`;
  const nav = $$(".ficha__nav", ficha), i = resultados.findIndex(x => x.id === id);
  nav.forEach(b => { b.hidden = i < 0 || resultados.length < 2; });
  if (ficha.hidden) {
    ficha.hidden = false;
    document.body.classList.add("bloqueado");
    requestAnimationFrame(() => requestAnimationFrame(() => ficha.classList.add("abierta")));
    panel.focus({ preventScroll: true });
  }
  const racion = $(".racion", cuerpo);
  if (racion) {
    const inp = $("input", racion), sal = $("b", racion), et = etapaDe(p.especie, p.edad[0]);
    const pintar = () => { const kg = Math.min(+inp.max, Math.max(1, parseFloat(inp.value) || 0)); sal.textContent = `≈ ${num.format(gramos(kcalDia(kg, et.f), p))} g`; };
    inp.addEventListener("input", pintar); pintar();
    racion.insertAdjacentHTML("beforeend", `<p class="racion__nota">Para ${et.txt.toLowerCase()}. Ajústala según su actividad.</p>`);
  }
  cuerpo.scrollTop = 0;
  const q = new URLSearchParams(location.search); q.set("producto", id);
  fijarURL(location.pathname + "?" + q + location.hash);
}
function cerrarFicha() {
  const ficha = $("#ficha");
  if (ficha.hidden) return;
  ficha.classList.remove("abierta");
  document.body.classList.remove("bloqueado");
  setTimeout(() => { ficha.hidden = true; }, reduce.matches ? 0 : 450);
  const q = new URLSearchParams(location.search); q.delete("producto");
  fijarURL(location.pathname + (q.toString() ? "?" + q : "") + location.hash);
  if (origenFoco && document.contains(origenFoco)) origenFoco.focus({ preventScroll: true });
  fichaActual = null;
}
function initFicha() {
  const ficha = $("#ficha");
  ficha.addEventListener("click", e => {
    if (e.target.closest("[data-cerrar]")) return cerrarFicha();
    const nav = e.target.closest("[data-paso]");
    if (nav) {
      const i = resultados.findIndex(x => x.id === fichaActual);
      const j = (i + +nav.dataset.paso + resultados.length) % resultados.length;
      abrirFicha(resultados[j].id);
      const b = $(`[data-abrir="${resultados[j].id}"]`); if (b) origenFoco = b;
    }
    const c = e.target.closest("[data-consulta]");
    if (c) { const m = $("#c-mensaje"); if (!m.value) m.value = c.dataset.consulta + " "; cerrarFicha(); }
    const g = e.target.closest("[data-guia]");
    if (g) { cerrarFicha(); if (calcEspecie) calcEspecie(g.dataset.guia, g.dataset.edad); }
  });
  addEventListener("keydown", e => {
    if (ficha.hidden) return;
    if (e.key === "Escape") return cerrarFicha();
    if (e.key === "Tab") { // foco atrapado dentro de la ficha
      const f = $$("button:not([hidden]), a[href]", ficha).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && (document.activeElement === f[0] || document.activeElement === $(".ficha__panel"))) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
}

/* ---------- guía de alimentación: ración orientativa y cambio de alimento ---------- */
// Energía diaria = 70 × peso^0,75 (energía en reposo) × factor de etapa, según las tablas veterinarias de uso común.
// Los gramos salen de la energía de cada receta (analisis.kcal); sin ese dato, se remite a la tabla del empaque.
const ETAPAS = {
  perro: [
    { id: "cachorro-4", txt: "Cachorro, hasta 4 meses", f: 3, edad: "cachorro", tomas: "Repártelo en 3 o 4 comidas." },
    { id: "cachorro", txt: "Cachorro, 4 a 12 meses", f: 2, edad: "cachorro", tomas: "Repártelo en 3 comidas." },
    { id: "esterilizado", txt: "Adulto esterilizado", f: 1.6, edad: "adulto", tomas: "Repártelo en 2 comidas." },
    { id: "adulto", txt: "Adulto no esterilizado", f: 1.8, edad: "adulto", tomas: "Repártelo en 2 comidas." },
    { id: "engorda", txt: "Adulto que engorda fácil", f: 1.4, edad: "adulto", tomas: "Repártelo en 2 comidas y usa su peso ideal." },
    { id: "activo", txt: "Adulto muy activo", f: 2, edad: "adulto", tomas: "Repártelo en 2 comidas." },
    { id: "senior", txt: "Senior, +7 años", f: 1.4, edad: "senior", tomas: "Repártelo en 2 comidas." }
  ],
  gato: [
    { id: "gatito", txt: "Gatito, hasta 12 meses", f: 2.5, edad: "cachorro", tomas: "Repártelo en 3 o 4 comidas pequeñas." },
    { id: "esterilizado", txt: "Adulto esterilizado", f: 1.2, edad: "adulto", tomas: "Repártelo en 2 a 4 comidas pequeñas." },
    { id: "adulto", txt: "Adulto no esterilizado", f: 1.4, edad: "adulto", tomas: "Repártelo en 2 a 4 comidas pequeñas." },
    { id: "engorda", txt: "Adulto que engorda fácil", f: 1, edad: "adulto", tomas: "Repártelo en 2 a 4 comidas y usa su peso ideal." },
    { id: "senior", txt: "Senior, +7 años", f: 1.1, edad: "senior", tomas: "Repártelo en 2 a 4 comidas pequeñas." }
  ]
};
const kcalDia = (kg, f) => Math.round(70 * Math.pow(kg, 0.75) * f / 10) * 10;
const gramos = (kcal, p) => Math.round(kcal / p.analisis.kcal * 1000 / 5) * 5;
const etapaDe = (especie, edad) => ETAPAS[especie].find(e => e.edad === edad && e.id !== "cachorro-4") || ETAPAS[especie][2];
let calcEspecie = null;
function initGuia() {
  const sec = $("#guia"); if (!sec) return;
  const tabs = $$(".pestanas [role=tab]", sec), paneles = tabs.map(t => $("#" + t.getAttribute("aria-controls")));
  const elegir = i => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; paneles[k].hidden = k !== i; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => elegir(i));
    t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const j = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; tabs[j].focus(); elegir(j); } });
  });
  $$("[data-guia-cambio]").forEach(a => a.addEventListener("click", () => elegir(1)));

  const form = $("#calc"), peso = $("#c-peso"), pesoTxt = $("#c-peso-txt"), cajaEtapa = $("[data-calc=etapa]", form);
  const res = $(".calc__res", sec);
  let especie = "perro", etapa = "esterilizado";
  const pintarEtapas = () => {
    cajaEtapa.innerHTML = ETAPAS[especie].map(e => `<label><input type="radio" name="c-etapa" value="${e.id}"${e.id === etapa ? " checked" : ""}><span>${esc(e.txt)}</span></label>`).join("");
  };
  const calcular = () => {
    const kg = parseFloat(peso.value), et = ETAPAS[especie].find(e => e.id === etapa);
    pesoTxt.textContent = num.format(kg) + " kg";
    const kcal = kcalDia(kg, et.f);
    $(".calc__num", res).textContent = num.format(kcal);
    $(".calc__tomas", res).textContent = et.tomas;
    const propias = CAT.filter(p => p.especie === especie && p.edad.includes(et.edad) && (especie === "gato" || !p.tamano || p.tamano.includes(tamanoDe(kg))));
    const conDato = propias.filter(p => p.analisis && p.analisis.kcal);
    $(".calc__recetas", res).innerHTML = conDato.map(p => `<li><button type="button" class="calc__receta" data-id="${p.id}" style="--acento:${acentoDe(p)}"><span><small>${LINEA_TXT[p.linea]}</small>${esc(cap(p.nombre))}</span><b>≈ ${num.format(gramos(kcal, p))} g</b></button></li>`).join("");
    const resto = propias.length - conDato.length;
    const para = especie === "perro" ? "su tamaño y su etapa" : "su etapa";
    const otras = !resto ? "" : resto === 1
      ? `${conDato.length ? "La otra receta" : "La receta"} para ${para} trae su tabla de ración en el empaque. `
      : `${conDato.length ? "Las otras" : "Las"} ${resto} recetas para ${para} traen su tabla de ración en el empaque. `;
    $(".calc__nota", res).textContent = (conDato.length ? "Gramos de alimento seco al día. " : "") + otras +
      "Es una referencia: ajústala según su condición y consulta a su veterinario.";
  };
  form.addEventListener("change", e => {
    if (e.target.name === "c-especie") {
      especie = e.target.value; etapa = "esterilizado";
      peso.max = especie === "gato" ? 12 : 70; peso.value = especie === "gato" ? 4 : 10;
      pintarEtapas();
    }
    if (e.target.name === "c-etapa") etapa = e.target.value;
    calcular();
  });
  peso.addEventListener("input", calcular);
  $(".calc__recetas", res).addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (b) abrirFicha(b.dataset.id, b); });
  // desde la ficha: abre la guía con su especie y su etapa
  calcEspecie = (esp, edad) => {
    const r = $(`input[name=c-especie][value=${esp}]`, form); r.checked = true;
    especie = esp; etapa = etapaDe(esp, edad).id;
    peso.max = esp === "gato" ? 12 : 70; if (esp === "gato" && +peso.value > 12) peso.value = 4;
    pintarEtapas(); calcular(); elegir(0);
  };
  pintarEtapas(); calcular();
}

/* ---------- política de privacidad ---------- */
function initPrivacidad() {
  const dlg = $("#privacidad"); if (!dlg) return;
  if (CFG.distribuidor) $$("[data-responsable]").forEach(n => { n.textContent = CFG.distribuidor; });
  if (CFG.email) $$("[data-correo-priv]").forEach(n => { n.innerHTML = `<a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a>`; });
  let desde = null;
  const cerrar = () => dlg.close();
  $$("[data-privacidad]").forEach(b => b.addEventListener("click", () => {
    desde = b;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    document.body.classList.add("bloqueado");
  }));
  $("[data-cerrar-priv]", dlg).addEventListener("click", cerrar);
  dlg.addEventListener("click", e => { if (e.target === dlg) cerrar(); });
  dlg.addEventListener("close", () => { document.body.classList.remove("bloqueado"); if (desde) desde.focus(); });
  const libro = $("[data-reclamaciones]");
  if (CFG.libroReclamaciones && libro) { libro.href = CFG.libroReclamaciones; libro.target = "_blank"; libro.rel = "noopener"; libro.hidden = false; }
}

/* ---------- peludines: publicaciones de redes ---------- */
function initComunidad() {
  const ul = $(".posts"), redes = $(".comunidad__redes");
  ul.innerHTML = (CFG.publicaciones || []).map(p => {
    const src = recurso(p.img);
    const img = `<img src="${esc(src)}" alt="${esc(p.alt || "")}" width="864" height="1080" loading="lazy" decoding="async">`;
    return `<li>${p.url ? `<a class="post" href="${esc(p.url)}" target="_blank" rel="noopener">${img}</a>` : `<span class="post">${img}</span>`}</li>`;
  }).join("");
  if (CFG.instagram) redes.insertAdjacentHTML("beforeend", `<a class="btn" href="${esc(CFG.instagram)}" target="_blank" rel="noopener">Seguir en Instagram</a>`);
  if (CFG.facebook) redes.insertAdjacentHTML("beforeend", `<a class="enlace" href="${esc(CFG.facebook)}" target="_blank" rel="noopener">Facebook</a>`);
  if (!CFG.instagram && !CFG.facebook) redes.hidden = true;
}

/* ---------- tiendas por distrito ---------- */
function initTiendas() {
  const ts = CFG.tiendas || [];
  if (!ts.length) return;
  const box = $(".tiendas"), sel = $("#f-distrito"), ul = $(".tiendas__lista");
  box.hidden = false;
  const distritos = [...new Set(ts.map(t => t.distrito).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  sel.innerHTML = `<option value="">Todos</option>` + distritos.map(d => `<option>${esc(d)}</option>`).join("");
  const pintar = () => {
    const d = sel.value;
    ul.innerHTML = ts.filter(t => !d || t.distrito === d).map(t => {
      const tags = [t.delivery && "Delivery", t.online && "Tienda online", t.veterinaria && "Veterinaria"].filter(Boolean);
      const tel = (t.telefono || "").replace(/\D/g, "");
      return `<li class="tienda"><p class="tienda__nombre">${esc(t.nombre)}</p><p class="tienda__dir">${esc([t.direccion, t.distrito].filter(Boolean).join(", "))}</p>
        ${tags.length ? `<p class="tienda__tags">${tags.map(x => `<span>${x}</span>`).join("")}</p>` : ""}
        <p class="tienda__acciones">${t.mapa ? `<a class="enlace enlace--sm" href="${esc(t.mapa)}" target="_blank" rel="noopener">Cómo llegar</a>` : ""}${tel ? `<a class="enlace enlace--sm" href="https://wa.me/${tel.length === 9 ? "51" + tel : tel}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</p></li>`;
    }).join("");
  };
  sel.addEventListener("change", pintar); pintar();
}

/* ---------- contacto ---------- */
function initForm() {
  const form = $("#form"), estado = $("#form-estado");
  const msgs = { nombre: "Escribe tu nombre.", email: "Escribe un correo válido, por ejemplo nombre@correo.com.", telefono: "Escribe al menos 7 dígitos.", mensaje: "Cuéntanos qué necesitas." };
  const validar = i => {
    const v = i.value.trim();
    let mal = false;
    if (i.name === "telefono") mal = !!v && v.replace(/\D/g, "").length < 7;
    else if (i.required) mal = !v || (i.type === "email" && !i.checkValidity());
    i.setAttribute("aria-invalid", String(mal));
    const err = $("#e-" + i.name); if (err) { err.textContent = mal ? msgs[i.name] : ""; if (mal) i.setAttribute("aria-describedby", err.id); else i.removeAttribute("aria-describedby"); }
    return !mal;
  };
  const campos = $$("input[type=text], input[type=email], input[type=tel], textarea", form);
  const acepto = $("#c-acepto"), errAcepto = $("#e-acepto");
  const validarAcepto = () => {
    const ok = acepto.checked;
    acepto.setAttribute("aria-invalid", String(!ok));
    errAcepto.textContent = ok ? "" : "Necesitamos tu permiso para responderte.";
    if (ok) acepto.removeAttribute("aria-describedby"); else acepto.setAttribute("aria-describedby", errAcepto.id);
    return ok;
  };
  acepto.addEventListener("change", () => { if (acepto.getAttribute("aria-invalid") === "true") validarAcepto(); });
  campos.forEach(i => { i.addEventListener("blur", () => { if (i.value) validar(i); }); i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") validar(i); }); });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    estado.textContent = "";
    const malos = campos.filter(i => !validar(i)), aceptado = validarAcepto();
    if (malos.length || !aceptado) { (malos[0] || acepto).focus(); estado.textContent = "Revisa los campos marcados."; return; }
    const d = Object.fromEntries(new FormData(form));
    if (!CFG.formEndpoint) {
      if (!CFG.email) { estado.textContent = "El formulario aún no tiene un correo configurado (DIBAQ_CONFIG.email)."; return; }
      const cuerpo = [`Nombre: ${d.nombre}`, `Correo: ${d.email}`, d.telefono ? `Teléfono: ${d.telefono}` : "", `Mascota: ${d.mascota}`, "", d.mensaje].filter((x, i) => x || i === 4).join("\n");
      location.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Consulta desde la web de Dibaq Perú")}&body=${encodeURIComponent(cuerpo)}`;
      estado.textContent = "Abrimos tu correo con la consulta lista para enviar.";
      return;
    }
    const b = $("[type=submit]", form);
    b.disabled = true; b.textContent = "Enviando…";
    try {
      const r = await fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(r.status);
      form.reset(); estado.textContent = `Consulta enviada. Te responderemos a ${d.email}.`;
    } catch {
      estado.textContent = "No se pudo enviar. Inténtalo de nuevo" + (CFG.email ? ` o escríbenos a ${CFG.email}.` : ".");
    } finally { b.disabled = false; b.textContent = "Enviar consulta"; }
  });
}

initConfig();
initConteos();
initCabecera();
initPaginado();
initLineas();
initEspecies();
initProteinas();
initBuscador();
initFicha();
initComunidad();
initGuia();
initPrivacidad();
initTiendas();
initForm();
initInicio();
})();
