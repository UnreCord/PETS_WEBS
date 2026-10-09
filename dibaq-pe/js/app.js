/* Dibaq Perú: interfaz (cabecera, paginado por secciones, líneas, especies, proteínas, buscador, ficha y contacto).
   La escena 3D vive en escena.js y escucha los eventos "dibaq:*" que se emiten aquí. */
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

/* ---------- vocabulario ---------- */
// el único color de la página: el de cada proteína, en tonos legibles sobre negro y sobre blanco
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
const imgDe = p => `img/productos/${p.id}.webp`;
function paraQuien(p) {
  if (p.especie === "gato") return p.edad.includes("cachorro") ? "Gatito" : "Gato " + lista(p.edad.map(e => e === "senior" ? "senior" : e));
  const edad = lista(p.edad.map(e => e === "cachorro" ? "cachorro" : e));
  const tam = p.tamano.length === 3 ? "todas las razas" : p.tamano.length === 1 ? { mini: "razas pequeñas", mediano: "razas medianas", grande: "razas grandes" }[p.tamano[0]] : "";
  return "Perro " + edad + (tam ? ", " + tam : "");
}

/* ---------- configuración de marketing ---------- */
function initConfig() {
  $$("[data-anio]").forEach(n => { n.textContent = new Date().getFullYear(); });
  const muestra = new URLSearchParams(location.search).has("fotos");
  if (CFG.fotosEnBN !== false) document.body.classList.add("fotos-bn");
  if (muestra) document.body.classList.add("muestra-fotos");
  $$("[data-foto]").forEach(f => {
    const src = CFG.fotos && CFG.fotos[f.dataset.foto];
    f.dataset.etiqueta = "Foto: " + f.dataset.foto + " (ver img/fotos/LEEME.md)";
    if (!src) return;
    const img = $("img", f);
    img.src = src;
    img.addEventListener("load", () => { f.hidden = false; f.closest(".sec, .linea-mitad")?.classList.add("con-foto"); }, { once: true });
  });
  const canales = $(".canales");
  const add = (href, txt) => { const li = document.createElement("li"); li.innerHTML = `<a class="enlace" href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${esc(txt)}</a>`; canales.append(li); };
  if (CFG.whatsapp) add(`https://wa.me/${CFG.whatsapp}`, "Escríbenos por WhatsApp");
  if (CFG.email) add(`mailto:${CFG.email}`, CFG.email);
  if (CFG.instagram) add(CFG.instagram, "Instagram");
  if (CFG.facebook) add(CFG.facebook, "Facebook");
  if (CFG.tiendas && CFG.tiendas.length) {
    $(".tiendas").hidden = false;
    $(".tiendas__lista").innerHTML = CFG.tiendas.map(t => `<li>${t.mapa ? `<a href="${esc(t.mapa)}" target="_blank" rel="noopener">${esc(t.nombre)}</a>` : esc(t.nombre)}<span>${esc([t.direccion, t.distrito].filter(Boolean).join(", "))}</span></li>`).join("");
  }
  if (CFG.distribuidor) { const d = $("[data-distribuidor]"); d.textContent = "Distribuido en Perú por " + CFG.distribuidor + "."; d.hidden = false; }
}

/* ---------- conteos y rangos que salen del catálogo ---------- */
function initConteos() {
  $$("[data-cuenta]").forEach(n => {
    const [k, v] = n.dataset.cuenta.split(":");
    const c = CAT.filter(p => k === "necesidad" ? p.necesidades.includes(v) : p[k] === v).length;
    n.textContent = c;
  });
  $$("[data-rango]").forEach(n => {
    const vals = CAT.filter(p => p.especie === n.dataset.rango && p.analisis && p.analisis.proteina).map(p => p.analisis.proteina);
    n.textContent = vals.length ? `${Math.min(...vals)} a ${Math.max(...vals)} %` : "";
  });
}

/* ---------- cabecera, riel y menú ---------- */
const secciones = () => $$("main > .sec");
function seccionActual() {
  const y = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hb")) || 72) / 2;
  return secciones().find(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }) || secciones()[0];
}
function initCabecera() {
  const cab = $(".cab"), rail = $$("[data-riel]"), nav = $$(".cab__nav a");
  let ultima = null;
  function temaDe(sec) {
    if (sec.id === "lineas") {
      if (!phone.matches) return "mixto";
      return $("#tab-sense").getAttribute("aria-selected") === "true" ? "oscuro" : "claro";
    }
    const pie = $(".pie");
    if (pie && pie.getBoundingClientRect().top < cab.offsetHeight) return "oscuro";
    return sec.dataset.tema || "claro";
  }
  function actualizar() {
    const sec = seccionActual();
    cab.dataset.tema = temaDe(sec);
    if (sec !== ultima) {
      ultima = sec;
      rail.forEach(a => a.setAttribute("aria-current", String(a.dataset.riel === sec.id)));
      nav.forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + sec.id)));
      emit("seccion", { id: sec.id });
    }
  }
  let pend = false;
  addEventListener("scroll", () => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; actualizar(); }); } }, { passive: true });
  addEventListener("resize", actualizar);
  addEventListener("dibaq:tema", actualizar);
  actualizar();

  const btn = $(".cab__menu"), menu = $("#menu-movil");
  const cerrar = () => { btn.setAttribute("aria-expanded", "false"); menu.hidden = true; cab.classList.remove("menu-abierto"); document.body.classList.remove("bloqueado"); $(".sr", btn).textContent = "Abrir menú"; };
  btn.addEventListener("click", () => {
    if (btn.getAttribute("aria-expanded") === "true") return cerrar();
    btn.setAttribute("aria-expanded", "true"); menu.hidden = false; cab.classList.add("menu-abierto"); document.body.classList.add("bloqueado"); $(".sr", btn).textContent = "Cerrar menú";
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
  // si la escena 3D no arranca (sin WebGL, sin módulos o abierta como archivo local), queda la imagen fija de las croquetas
  setTimeout(() => { if (!document.querySelector(".escena.lista")) $$(".respaldo3d").forEach(i => { i.hidden = false; }); }, 3500);
  const go = () => requestAnimationFrame(() => document.body.classList.add("listo"));
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(go);
}

/* ---------- holístico: los pilares orientan la croqueta ---------- */
function initPilares() {
  $$(".pilar").forEach(p => {
    const on = () => { $$(".pilar").forEach(x => x.classList.toggle("activo", x === p)); emit("pilar", { i: +p.dataset.lado }); };
    p.addEventListener("mouseenter", on);
    p.addEventListener("focusin", on);
    p.addEventListener("mouseleave", () => { p.classList.remove("activo"); emit("pilar", { i: -1 }); });
  });
}

/* ---------- las dos líneas en celular: pestañas y deslizamiento ---------- */
function initLineas() {
  const cont = $(".lineas__in"), tabs = $$(".lineas__selector [role=tab]"), paneles = [$("#linea-nm"), $("#linea-sense")];
  const marcar = i => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    emit("linea", { linea: i ? "sense" : "nm" }); emit("tema");
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { cont.scrollTo({ left: paneles[i].offsetLeft, behavior: reduce.matches ? "auto" : "smooth" }); marcar(i); });
    t.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const j = e.key === "ArrowRight" ? 1 : 0; tabs[j].focus(); tabs[j].click(); } });
  });
  let pend = false;
  cont.addEventListener("scroll", () => {
    if (pend || !phone.matches) return; pend = true;
    requestAnimationFrame(() => { pend = false; const i = cont.scrollLeft > cont.clientWidth / 2 ? 1 : 0; if (tabs[i].getAttribute("aria-selected") !== "true") marcar(i); });
  }, { passive: true });
  const sync = () => {
    paneles.forEach(p => { if (phone.matches) p.setAttribute("role", "tabpanel"); else p.removeAttribute("role"); });
  };
  phone.addEventListener("change", sync); sync();
}

/* ---------- perro o gato ---------- */
function initEspecies() {
  const btns = $$(".conmutador [data-especie]");
  const elegir = esp => {
    btns.forEach(b => b.setAttribute("aria-checked", String(b.dataset.especie === esp)));
    $$(".especie").forEach(p => { p.hidden = p.dataset.panel !== esp; });
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
    return `<li><button class="proteina" type="button" aria-pressed="false" data-p="${n}" style="--c:${FOOD[n]}">${n}<sup>${c}</sup></button></li>`;
  }).join("");
  ul.addEventListener("click", e => {
    const b = e.target.closest(".proteina"); if (!b) return;
    const ya = b.getAttribute("aria-pressed") === "true";
    $$(".proteina", ul).forEach(x => x.setAttribute("aria-pressed", "false"));
    if (ya) { txt.innerHTML = original; acc.innerHTML = ""; return; }
    b.setAttribute("aria-pressed", "true");
    const n = b.dataset.p, con = CAT.filter(p => p.proteinas.includes(n));
    const lineas = [...new Set(con.map(p => LINEA_TXT[p.linea]))];
    txt.innerHTML = `<strong>${n}</strong> está en ${con.length === 1 ? "1 receta" : con.length + " recetas"} de ${lista(lineas)}: ${esc(lista(con.slice(0, 4).map(p => p.nombre.toLowerCase())))}${con.length > 4 ? " y más" : ""}.`;
    const sin = SIN_DE[n];
    const nSin = sin ? CAT.filter(p => !p.contiene.includes(sin)).length : 0;
    acc.innerHTML = `<button class="enlace enlace--sm" type="button" data-ir="con=${encodeURIComponent(n)}">Ver las recetas con ${n.toLowerCase()}</button>`
      + (sin ? `<button class="enlace enlace--sm" type="button" data-ir="sin=${sin}">Ver las ${nSin} recetas sin ${SIN_TXT[sin]}</button>` : "");
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
  return `<li class="tarjeta tarjeta--${p.linea}${nueva ? " nueva" : ""}" data-id="${p.id}">
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
    history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
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
  panel.dataset.tema = p.linea === "sense" ? "oscuro" : "claro";
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
      <h3>Formatos</h3>
      ${p.formatos ? `<ul class="etiquetas" role="list">${p.formatos.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : `<p class="ficha__kcal">Consulta los formatos disponibles en Perú.</p>`}
      <p class="ficha__nota">Datos referenciales. Revisa la tabla de ración del empaque y consulta a tu veterinario si tiene una condición de salud.</p>
      <div class="ficha__acciones">
        ${CFG.whatsapp ? `<a class="btn" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(consulta)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>` : `<a class="btn" href="#contacto" data-consulta="${esc(consulta)}">Consultar por esta receta</a>`}
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
  cuerpo.scrollTop = 0;
  const q = new URLSearchParams(location.search); q.set("producto", id);
  history.replaceState(null, "", location.pathname + "?" + q + location.hash);
}
function cerrarFicha() {
  const ficha = $("#ficha");
  if (ficha.hidden) return;
  ficha.classList.remove("abierta");
  document.body.classList.remove("bloqueado");
  setTimeout(() => { ficha.hidden = true; }, reduce.matches ? 0 : 450);
  const q = new URLSearchParams(location.search); q.delete("producto");
  history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
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
  campos.forEach(i => { i.addEventListener("blur", () => { if (i.value) validar(i); }); i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") validar(i); }); });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    estado.textContent = "";
    const malos = campos.filter(i => !validar(i));
    if (malos.length) { malos[0].focus(); estado.textContent = "Revisa los campos marcados."; return; }
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
initPilares();
initLineas();
initEspecies();
initProteinas();
initBuscador();
initFicha();
initForm();
initInicio();
})();
