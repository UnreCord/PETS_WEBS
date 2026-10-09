/* Dibaq Perú: escenas animadas.
   - La S de ingredientes (sección "Lo que lleva"): se arma cuando la sección entra en pantalla y se desarma al salir.
   - La entrega (inicio): el perro que trae la bolsa, en entrega.js.
   Sin WebGL o si algo falla, cada sección muestra su imagen fija. */
import { montarS } from "./ingredientes3d.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const webgl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();

function iniciarS() {
  const sec = document.getElementById("ingredientes"), lienzo = sec && sec.querySelector(".ese__lienzo"), respaldo = sec && sec.querySelector(".ese__respaldo");
  if (!sec) return;
  if (!webgl) { respaldo.hidden = false; lienzo.remove(); return; }
  let s;
  try { s = montarS(lienzo, { progresoInicial: reduce.matches ? 1 : 0 }); }
  catch (e) { respaldo.hidden = false; lienzo.remove(); return; }
  s.activar(false);
  new IntersectionObserver(([e]) => {
    s.activar(e.isIntersecting);
    if (reduce.matches) { s.fijar(1); return; }
    s.progreso(e.intersectionRatio > 0.45 ? 1 : 0);
  }, { threshold: [0, 0.45, 0.6] }).observe(sec);
}

async function iniciarEntrega() {
  const cont = document.getElementById("entrega");
  if (!cont) return;
  try {
    const { montarEntrega } = await import("./entrega.js");
    await montarEntrega(cont, { reducido: reduce.matches, webgl });
    cont.classList.add("viva");
  } catch (e) { console.warn("Animación del inicio no disponible; se muestra la imagen fija.", e && e.message); }
}

iniciarS();
iniciarEntrega();
