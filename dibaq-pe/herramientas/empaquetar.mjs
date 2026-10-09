// Builds dist/dibaq-peru.html: the whole site in one HTML file that opens with a double click
// (no server, no internet). Fonts, styles, images, catalog, interface and the 3D scenes go inside.
// Usage (from dibaq-pe/):  node herramientas/empaquetar.mjs
// Needs esbuild (npm i -D esbuild) to bundle the scenes with three.js into a classic script.
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let esbuild;
try { esbuild = require("esbuild"); }
catch { console.error("Falta esbuild. Instálalo con: npm i -D esbuild"); process.exit(1); }

const root = fileURLToPath(new URL("..", import.meta.url));
const leer = p => readFile(join(root, p), "utf8");
const TIPOS = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const dataURI = async p => `data:${TIPOS[extname(p)]};base64,${(await readFile(join(root, p))).toString("base64")}`;
const reemplazar = (html, buscado, nuevo) => {
  if (!html.includes(buscado)) throw new Error("No se encontró en index.html: " + buscado);
  return html.replace(buscado, () => nuevo);
};
// a script inline cannot contain "</script"; none of the sources should, so stop instead of guessing
const enScript = (codigo, nombre) => {
  if (/<\/script/i.test(codigo)) throw new Error(nombre + " contiene </script y no se puede incrustar");
  return codigo;
};

let html = await leer("index.html");

// estilos con las fuentes incrustadas
let css = await leer("css/estilos.css");
for (const m of [...css.matchAll(/url\(\.\.\/(fonts\/[^)]+\.woff2)\)/g)]) css = css.replace(m[0], `url(${await dataURI(m[1])})`);
html = html.replace(/<link rel="preload"[^>]*>\n/g, "");
html = reemplazar(html, '<link rel="stylesheet" href="css/estilos.css">', `<style>\n${css}</style>`);
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\n/, "");

// imágenes del HTML, dentro de cada src
for (const ruta of new Set([...html.matchAll(/src="(img\/[^"]+)"/g)].map(m => m[1]))) {
  html = html.split(`src="${ruta}"`).join(`src="${await dataURI(ruta)}"`);
}

// catálogo, interfaz y escenas 3D (three.js empaquetado como script clásico; entrega.js va dentro)
const catalogo = await leer("js/catalogo.js");
const app = await leer("js/app.js");
const escena = (await esbuild.build({
  entryPoints: [join(root, "js/escena.js")], absWorkingDir: root, bundle: true, write: false,
  format: "iife", minify: true, target: "es2020", legalComments: "inline",
  alias: { three: "./vendor/three.module.min.js" }
})).outputFiles[0].text;

// imágenes que se piden desde JS: bolsas por id (DIBAQ_IMG) y el resto por ruta (DIBAQ_ASSETS)
const bolsas = {};
for (const f of (await readdir(join(root, "img/productos"))).filter(f => f.endsWith(".webp")).sort()) {
  bolsas[f.replace(/\.webp$/, "")] = await dataURI("img/productos/" + f);
}
const recursos = {};
for (const m of (html + app + escena).matchAll(/["'`](img\/(?!productos\/)[\w\/.-]+\.(?:webp|png|jpg|svg))["'`]/g)) {
  recursos[m[1]] ??= await dataURI(m[1]);
}

html = reemplazar(html, '<script src="js/catalogo.js"></script>', `<script>\n${enScript(catalogo, "catalogo.js")}</script>`);
html = reemplazar(html, '<script src="js/app.js"></script>',
  `<script>window.DIBAQ_IMG = ${JSON.stringify(bolsas)};\nwindow.DIBAQ_ASSETS = ${JSON.stringify(recursos)};</script>\n<script>\n${enScript(app, "app.js")}</script>`);
html = reemplazar(html, '<script type="module" src="js/escena.js"></script>', `<script>\n${enScript(escena, "escena.js")}</script>`);

html = html.replace("<!doctype html>", "<!doctype html>\n<!-- Archivo generado con herramientas/empaquetar.mjs a partir de dibaq-pe/. Para cambios, edita la carpeta y vuelve a generarlo. -->");
const salida = join(root, "dist", "dibaq-peru.html");
await mkdir(join(root, "dist"), { recursive: true });
await writeFile(salida, html);
console.log(`dist/dibaq-peru.html ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB · ${Object.keys(recursos).length} imágenes para JS`);
