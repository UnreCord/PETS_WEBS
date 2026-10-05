# CooKing Landing para WordPress: guía para el proveedor

Esta guía acompaña al archivo **`cooking-landing.zip`**: un plugin de WordPress que reproduce en cooking.pe la landing aprobada (`index.html`) con la misma funcionalidad, el mismo diseño y las mismas animaciones. No hace falta maquetarla de nuevo en Elementor: el plugin la dibuja completa.

Lo que el plugin agrega al sitio:

| En WordPress | Para qué sirve |
|---|---|
| **Ajustes > CooKing Landing** | Elegir qué página muestra la landing, crearla y ponerla como portada; correo del formulario; mapa; imágenes de marca. |
| **Puntos de venta** (menú lateral) | Las tiendas y veterinarias del mapa “Encuéntranos en Lima”. Viene con las 14 actuales cargadas. |
| **Mensajes CooKing** (menú lateral) | Copia de cada mensaje enviado desde “¿Te gustaría contactarnos?”. |
| Plantilla **“CooKing – Landing (pantalla completa)”** | Alternativa en temas clásicos (Astra lo es): se puede elegir al editar una página. |

---

## 1. Requisitos y entorno probado

- WordPress 6.3 o superior y PHP 7.4 o superior.
- Probado en WordPress 6.5 (PHP 8.4) con un tema de bloques (Twenty Twenty-Four) y con un tema clásico, a 1905×909, 1536×730 y 390×844 (celular).
- **cooking.pe usa WordPress 7.1.2, Astra Pro y Elementor Pro.** El plugin solo usa funciones estándar de WordPress (plantillas de página, tipos de contenido, API REST, `wp_mail`). Aun así, **instálalo primero en un sitio de pruebas (staging)** y recorre la lista de la sección 10 antes de publicarlo.

## 2. Instalación (5 minutos)

1. **Plugins > Añadir nuevo > Subir plugin**, elige `cooking-landing.zip` y pulsa **Activar**.
2. Ve a **Ajustes > CooKing Landing** y pulsa **Crear la página**. Se crea “Inicio CooKing” como **borrador**. La portada actual no cambia.
3. Pulsa **Vista previa** y revisa la landing.
4. Cuando esté aprobada, pulsa **Publicarla y ponerla como portada**. Para volver atrás: **Ajustes > Lectura > Página de inicio**.
5. Copia las fotos de producto (sección 4.2) y revisa el correo del formulario (sección 6).

Otras formas de asignar la página:

- En **Ajustes > CooKing Landing > Página de la landing** se puede elegir cualquier página existente. Funciona con cualquier tema.
- En temas clásicos (Astra), al editar una página se puede elegir la plantilla **“CooKing – Landing (pantalla completa)”**. En temas de bloques, el editor de WordPress no muestra plantillas de plugins; por eso existe el ajuste anterior.

> **No edites esa página con Elementor ni le escribas contenido.** La landing no usa el contenido de la página, así que lo que se agregue ahí no se verá. Los textos se cambian como se explica en la sección 8.

## 3. Cómo funciona la página (es intencional)

- **Una sección por pantalla.** En computadora (≥1024 px de ancho y ≥600 px de alto) cada gesto de rueda o de trackpad lleva a la siguiente sección, en este orden: inicio, CooKing es irresistible, ingredientes, plato, lo que cuida cada receta, recetas, arma su plan, cambia su alimento en 7 días, Encuéntranos en Lima y contacto. Cada sección cabe completa a 100 % de zoom.
- **En celular** (<768 px) cada sección ocupa una pantalla. Lo que no cabe se desliza de lado: filtros, recetas, los dos pasos del plan y mapa o lista de tiendas. “Contacto” tiene dos paradas: formulario y datos.
- **“Los ingredientes”:** el arco de ingredientes ocupa la pantalla de borde a borde. La olla va delante de las zanahorias y gira sola, despacio, mientras la sección está en pantalla; no depende del scroll ni se arrastra.
- **Plato de croquetas:** las croquetas que saltan nunca suben más allá del subtítulo.
- **El plan y el cambio en 7 días están conectados.** “Cambia su alimento en 7 días” muestra porcentajes hasta que el visitante usa “Arma su plan”. Desde ese momento muestra gramos calculados con su ración diaria. Por ejemplo, perro cachorro de 12 kg: 285 g al día, días 1 y 2 = 70 g de CooKing + 215 g de su alimento anterior. El botón “Su cambio en 7 días” del plan lleva a esa sección.
- **Las tarjetas de recetas** muestran proteína, grasa y fibra. Ceniza, kcal, tamaños de bolsa y el nombre del empaque están dentro de “Ver composición”.
- En tablets (768–1023 px) el ajuste es suave, no obligatorio.
- Quien activa “reducir movimiento” en su sistema ve la página sin animaciones automáticas.
- **La barra de administración de WordPress no se muestra en la landing**, ni siquiera con la sesión iniciada, porque movería todas las secciones 32 px. Para ir al panel, entra a `/wp-admin/`.

No hay que “corregir” el desplazamiento por secciones: es lo que pidió marketing.

## 4. Imágenes

### 4.1 Imágenes de marca: ya están en la biblioteca de medios de cooking.pe

La landing usa estos archivos que el sitio ya tiene en `wp-content/uploads/`:

| Archivo | Uso |
|---|---|
| `2026/07/logo-cooking.svg` | Logo en el menú, el pie y los marcadores del mapa |
| `2026/07/img-prin.png` (y sus tamaños `-768x376`, `-1024x501`) | Bolsas del inicio |
| `2026/07/img-intro-1.jpg` (y `-768x724`, `-1024x966`) | Foto de “CooKing es irresistible” |
| `2026/07/plato.png` | Plato de ingredientes |
| `2026/08/perro-gato-final.png` (y `-276x300`, `-768x835`, `-942x1024`) | Perro y gato de “Lo que cuida cada receta” |

Si se borran o se renombran en la biblioteca de medios, la landing deja de mostrarlos. En un sitio de pruebas que no tenga esas imágenes, escribe `https://cooking.pe/wp-content/uploads/` en **Ajustes > CooKing Landing > URL base de las imágenes de marca**. En cooking.pe ese campo va vacío.

### 4.2 Fotos de producto: hay que copiarlas una vez

Las tarjetas de “Recetas completas y balanceadas” usan los PNG de las bolsas. Cópialos por FTP o desde el administrador de archivos del hosting a `wp-content/plugins/cooking-landing/assets/img/productos/`, con estos nombres exactos:

| Archivo | Receta |
|---|---|
| `puppy-recipe-new1.png` | Cachorro con pollo |
| `dog-lamb-allbreeds.png` | Adulto con cordero |
| `dog-salmon-allbreeds.png` | Adulto con salmón (perro) |
| `senior-dog-new.png` | Senior y light con pollo |
| `Kitten-Salmon-cooking.png` | Kitten con salmón |
| `salmon-cat-new-cooking.png` | Adulto con salmón (gato) |
| `sterilized-new-cooking.png` | Esterilizado con pollo |

Son los mismos archivos que hoy usa cooking.pe. Si falta alguno, la tarjeta muestra una bolsa dibujada en su lugar, sin romper nada.

### 4.3 Imágenes incluidas en el plugin

El plato 3D, las croquetas, los platos de la transición de 7 días y el arco de ingredientes de “Los ingredientes marcan la diferencia” vienen dentro del plugin (`assets/img/`) en WebP. No hay que subirlas.

### 4.4 Tipografías

La página usa dos fuentes, incluidas en `assets/fonts/` como WOFF2 (recortadas a los caracteres del español):

| Fuente | Uso |
|---|---|
| **Circular Book** (Lineto) | Títulos, textos, botones y números. “El Rey de la” del inicio. |
| **Authenia** (Mika Melvas) | Palabras destacadas en caligrafía: “Cocina Nutricional”, “marcan la diferencia!”, “en todas sus etapas”, “en 30 segundos”. |

- **Licencias:** las dos son fuentes comerciales. CooKing debe tener una licencia de uso web (webfont) para cooking.pe de cada una antes de publicar. Si no la tiene, hay que comprarla o reemplazar la fuente.
- Circular Book tiene un solo grosor; las negritas pequeñas (botones, etiquetas) las genera el navegador.
- Para cambiar una fuente, reemplaza el archivo con el mismo nombre (`circular-book.woff2` o `authenia.woff2`) y sube la versión del plugin.

## 5. Puntos de venta (mapa “Encuéntranos en Lima”)

- **Puntos de venta > Añadir punto de venta.** Llena:
  - **Nombre:** como se verá en el mapa.
  - **Dirección.**
  - **Distrito.**
  - **Coordenadas:** en Google Maps, clic derecho sobre el local y clic en los números; se copian como `-12.0985, -77.0015`. Pegados en el campo de latitud, llenan los dos campos.
  - **Enlace de Google Maps** (opcional): se usa en “Cómo llegar”; si está vacío, se busca la dirección.
- Solo se aceptan coordenadas dentro de Lima Metropolitana y Callao. Una tienda sin distrito o sin coordenadas no aparece en el mapa y se marca en rojo en el listado (“Falta distrito o coordenadas”).
- Si una tienda tiene varios locales, crea un punto de venta por local con el mismo nombre.
- Para quitar una tienda, envíala a la papelera. Si hay plugin de caché, vacía la caché después de cambiar tiendas.

## 6. Formulario de contacto

- Envía cada mensaje al correo de **Ajustes > CooKing Landing**, que por defecto es `marketingpets@solvet.com.pe`. El correo del visitante va como “Responder a”.
- **Instala un plugin SMTP** (por ejemplo WP Mail SMTP) con una cuenta real del dominio. Sin SMTP, muchos hostings envían por `mail()` y los mensajes terminan en spam o no llegan.
- Con “Guardar mensajes” activo, cada mensaje también queda en **Mensajes CooKing**, con el botón “Responder”. Así no se pierde nada si el correo falla.
- El formulario valida:
  - nombre;
  - correo;
  - teléfono (mínimo 7 dígitos);
  - mensaje;
  - RUC: es opcional, pero si se escribe debe tener 11 dígitos. Los campos Empresa y RUC solo aparecen cuando quien escribe es veterinaria, pet shop, tienda virtual o distribuidor.
- **Antispam:** tiene un campo trampa invisible y un límite de 5 envíos cada 10 minutos por IP. No usa “nonce”, a propósito, para que funcione con páginas en caché.
- Funciona por la API REST: `POST /wp-json/cooking/v1/contacto`. **Si hay un plugin de seguridad** (Wordfence, Solid Security, etc.) que bloquee la API REST a visitantes, permite esa ruta.

## 7. Mapa de calles

- Usa **MapLibre** (librería abierta) con mapas de **OpenFreeMap**: gratis, sin clave y sin facturación. El estilo está adaptado a la marca y los marcadores son el logo de CooKing.
- Si el servicio no responde, o si se desactiva en Ajustes, la landing muestra su propio mapa de distritos de Lima. No queda en blanco.
- OpenFreeMap no da garantía de servicio. Si en el futuro se quiere Google Maps, hace falta una clave de Google Cloud con facturación activa; es un cambio aparte.
- Si el sitio usa una política de seguridad de contenido (CSP), debe permitir `cdn.jsdelivr.net` (MapLibre) y `tiles.openfreemap.org`. Las fuentes ya no vienen de Google Fonts: están dentro del plugin.

## 8. Cambiar textos, recetas o datos

| Qué cambiar | Dónde |
|---|---|
| Títulos, párrafos, botones, datos de contacto del pie | `templates/landing.php` (HTML normal) |
| Recetas: nombre, análisis, kcal, tamaños de bolsa, foto | `assets/js/landing.js`, lista `RECIPES` |
| Puntos del plato interactivo | `assets/js/landing.js`, `CLAIMS` |
| Beneficios del círculo “Lo que cuida cada receta” | `assets/js/landing.js`, `PERKS` |
| Ingredientes de la cinta del inicio | `assets/js/landing.js`, `RIBBON` |
| Plan CooKing: condiciones y textos de “por qué esta receta” | `assets/js/landing.js`, `CONDS` y `PLAN_WHY` |
| Transición de 7 días | `assets/js/landing.js`, `STEPS` |
| Colores, tamaños y espacios | `assets/css/landing.css` |

Recomendaciones:

- Después de editar, sube el número de versión en `cooking-landing.php` (`Version` y `COOKING_LANDING_VERSION`). Así los navegadores y las cachés cargan los archivos nuevos.
- **El plan solo recomienda el tipo de producto según la condición elegida, nunca cambia los gramos.** Los gramos salen de la energía estimada (peso y edad) dividida por las kcal de la receta. Marketing pidió no prometer gramajes por condición (esterilizado, sobrepeso, etc.). Mantén ese criterio. Antes de publicar, valida los factores de la función `factor()` con las tablas de las bolsas.
- Guarda una copia del plugin antes de editar. Si se reinstala el `.zip`, los cambios hechos a mano se pierden.

## 9. Caché, optimización, SEO y otros plugins

**Plugins de caché y optimización** (WP Rocket, LiteSpeed Cache, Autoptimize, Perfmatters, etc.):

- **Excluye `cooking-landing/assets/js/landing.js`** de “retrasar JavaScript hasta la interacción” (delay JS), de combinar y de diferir. Si se retrasa, la página queda quieta hasta que el visitante toque algo. El script en línea `window.COOKING_LANDING` debe seguir antes de `landing.js`.
- **Excluye `cooking-landing/assets/css/landing.css`** de “eliminar CSS no usado”. Muchas clases las agrega el JavaScript al animar.
- La página se puede guardar en caché sin problema; el formulario funciona igual.

**SEO:**

- Si hay Yoast, Rank Math, All in One SEO o SEOPress, ese plugin maneja el título, la descripción y las etiquetas para redes. Configúralos en la página “Inicio CooKing” desde ese plugin.
- Si no hay ninguno, la landing pone su propio título, descripción, Open Graph y datos de la organización.

**Qué se quita y qué se mantiene en la landing:**

- **Se quita:**
  - el CSS y el JS del tema (Astra);
  - los estilos de bloques y las fuentes web del tema;
  - la clase del kit global de Elementor (`elementor-kit-N`), para que su tipografía y colores no cambien el diseño;
  - la barra de administración.
- **Se mantiene:**
  - lo que cargan otros plugins a través de `wp_head()` y `wp_footer()`: Analytics o Tag Manager, píxel de Meta, banner de cookies, chat o WhatsApp.
- Si algún plugin altera el diseño, se pueden quitar sus estilos o scripts solo en la landing con este filtro (en un plugin propio o en `functions.php`):

```php
add_filter( 'cooking_landing_dequeue', function ( $handles ) {
	$handles[] = 'nombre-del-handle';
	return $handles;
} );
```

La cabecera y el pie de Astra o Elementor no aparecen en la landing: tiene su propio menú y pie.

## 10. Lista de revisión antes de publicar

1. **Computadora a 100 % de zoom** (1920×1080, 1536×864 y 1366×768): cada sección se ve completa, y cada gesto de rueda lleva a la siguiente y no salta dos.
2. **Celular** (iPhone y Android): cada sección ocupa una pantalla, no hay desplazamiento horizontal y las filas laterales se deslizan.
3. **Plato:**
    - los 4 puntos están en el filo delantero del borde: Libre de grano y Hecho en Europa a la izquierda, 80 % proteína animal y Carne fresca a la derecha;
    - abren su tarjeta sin tapar texto ni otro punto;
    - las croquetas no tapan el título, vuelven al cerrar y se pueden lanzar tocándolas.
4. **Recetas:** filtros de perro o gato, edad y tamaño, y las fotos de producto (sección 4.2).
5. **Arma su plan:**
    - cambiar especie, edad, peso y condición actualiza la receta y los gramos; la condición solo cambia la receta;
    - el botón “Su cambio en 7 días” lleva a la sección siguiente;
    - esa sección muestra gramos en lugar de porcentajes.
6. **7 días:**
    - la animación corre sola por los días 1–2, 3–4, 5–6 y 7, con tiempos proporcionales a la mezcla;
    - las bolsas no tapan el texto, también en laptops de pantalla baja.
7. **Mapa:**
   - las 14 tiendas aparecen con el logo;
   - la búsqueda por distrito funciona, igual que “Cerca de mí” y “Cómo llegar”;
   - en celular, los botones Mapa y Lista de tiendas funcionan.
8. **Formulario:** envía un mensaje de prueba, revisa que llegue al correo (no a spam) y que aparezca en Mensajes CooKing.
9. **Plugins de caché:** con la caché activa, repite los puntos 1, 6 y 8.
10. **Velocidad:** prueba con PageSpeed Insights y revisa que no haya errores en la consola del navegador (F12).

## 11. Contenido del plugin

```
cooking-landing/
├── cooking-landing.php          Datos del plugin, tipos de contenido y activación
├── readme.txt
├── includes/
│   ├── settings.php             Ajustes > CooKing Landing (página, correo, mapa, imágenes)
│   ├── template.php             Muestra la landing y aísla el tema
│   ├── stores.php               Puntos de venta (campos, validación, columnas)
│   ├── contact.php              Formulario: ruta REST, validación, correo y mensajes
│   └── data.php                 Datos que recibe el JavaScript
├── templates/landing.php        HTML de la landing
└── assets/
    ├── css/landing.css
    ├── js/landing.js
    ├── data/                    Mapa de distritos de Lima, iconos, logo y plato (JSON)
    └── img/                     Plato 3D, croquetas, platos, ingredientes, productos/
```

**Desactivar o borrar el plugin no borra nada:** tiendas, mensajes y ajustes quedan en la base de datos. Al volver a activarlo, todo sigue igual y las tiendas no se duplican.

El plugin se generó a partir de la versión final aprobada de la landing (`cooking-pe/index.html`, 871 KB) y tiene sus mismas secciones, textos y comportamiento. Desde ahora, los cambios se hacen en los archivos del plugin, como se indica en la sección 8.
