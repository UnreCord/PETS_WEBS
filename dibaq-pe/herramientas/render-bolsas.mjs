// Renders the provisional 3D bag of every product to img/productos/<id>.webp.
// Usage (from dibaq-pe/):  node herramientas/render-bolsas.mjs [id ...]
// Needs Playwright with Chromium (npm i -g playwright). Real product photos replace the generated files;
// pass only the ids you still want rendered so a photo is not overwritten.
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const root = fileURLToPath(new URL("..", import.meta.url));
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".woff2": "font/woff2", ".css": "text/css" };
const server = http.createServer(async (req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (!path.startsWith(root)) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" }).end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1000, height: 1250 } });
page.on("pageerror", e => console.error("pageerror", e.message));
await page.goto(`http://localhost:${port}/herramientas/render-bolsas.html`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });

const ids = process.argv.slice(2).length ? process.argv.slice(2) : await page.evaluate(() => window.DIBAQ_CATALOGO.map(p => p.id));
for (const id of ids) {
  // render, crop to the bag (plus its shadow) and encode as WebP with transparency
  const b64 = await page.evaluate(async id => {
    const url = window.renderBag(id);
    const im = new Image(); im.src = url; await im.decode();
    const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
    const x = c.getContext("2d"); x.drawImage(im, 0, 0);
    const a = x.getImageData(0, 0, c.width, c.height).data;
    let t = c.height, l = c.width, r = 0, b = 0;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (a[(y * c.width + xx) * 4 + 3] > 8) { if (y < t) t = y; if (y > b) b = y; if (xx < l) l = xx; if (xx > r) r = xx; }
    const pad = 16, w = 800, h = 1000; // every bag lands on the same 4:5 canvas, bottom aligned
    const bw = r - l + 1, bh = b - t + 1, s = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    const o = document.createElement("canvas"); o.width = w; o.height = h;
    const ox = o.getContext("2d"); ox.imageSmoothingQuality = "high";
    ox.drawImage(c, l, t, bw, bh, (w - bw * s) / 2, h - pad - bh * s, bw * s, bh * s);
    return o.toDataURL("image/webp", 0.86).split(",")[1];
  }, id);
  const out = join(root, "img", "productos", `${id}.webp`);
  await writeFile(out, Buffer.from(b64, "base64"));
  console.log("ok", id);
}
await browser.close();
server.close();
