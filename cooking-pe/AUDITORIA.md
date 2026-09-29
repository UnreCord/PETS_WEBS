# Auditoría de cooking.pe y propuesta de rediseño

**Base del análisis:** HTML guardado de https://cooking.pe/ (WordPress 7.1.2, Elementor 4.2.4 + Elementor Pro, tema Astra Pro y 4 plugins propios `rblweb-*`) y captura de la sección de puntos de venta. El sitio en vivo no se pudo cargar desde el entorno de trabajo, así que no se midieron tiempos de carga reales (Core Web Vitals); los hallazgos de rendimiento salen del código.

**Propuesta:** `cooking-pe/index.html` (un solo archivo, ~99 KB, sin dependencias salvo Google Fonts).

---

## 1. Hallazgos críticos

| # | Problema | Evidencia en el código | Impacto |
|---|----------|------------------------|---------|
| 1 | **Los dos productos de salmón están cruzados entre gato y perro.** | En "Para tu gato", la tarjeta con foto y descripción de gato se titula `COOKING DRY DOG FOOD SALMON ADULT…` y muestra 27 % de proteína y 3.846 kcal/kg. En "Para tu perro", la tarjeta con foto de perro se titula `COOKING DRY CAT FOOD SALMON ADULT…` con 36 % de proteína y 3.812 kcal/kg. | Un cliente que compara etiquetas ve datos de la otra especie. Riesgo de confianza y de reclamo. **Verificar contra los empaques.** |
| 2 | **No hay H1 y el mensaje principal es una imagen.** | "El Rey de la" es un `h2`; "Cocina Nutricional" es `Cocina-Nutricional.png` con `alt=""`. | Google y los lectores de pantalla no leen la propuesta de valor. |
| 3 | **SEO básico ausente.** | `<title>Cooking – Pet</title>`, sin `meta description`, sin Open Graph ni datos estructurados. | Resultado de búsqueda pobre; al compartir por WhatsApp o Facebook no aparece vista previa. |
| 4 | **Nombres de producto en inglés técnico y en mayúsculas.** | `COOKING DRY CAT FOOD CHICKEN STERILIZED ADULT CAT GRAIN FREE RECIPE`, antetítulo `SUPER PREMIUM CAT FOOD`, badges `Adult` / `Kitten`. | El público es hispanohablante; el nombre no dice para quién es la receta. |
| 5 | **Composición y análisis escondidos en modales.** | Solo se ven tras "Ver más", uno por uno. | Es justo lo que revisa un comprador super premium u holístico, y así no puede comparar recetas. |

## 2. Experiencia de usuario y contenido

6. **El mismo mensaje se repite tres veces.** Los 4 atributos (libre de grano, hecho en Europa, 80 % proteína animal, carne fresca) aparecen en las "tarjetas interactivas" (duplicadas ×2 en el DOM), otra vez en "Características" (8 íconos) y de nuevo en "Beneficios funcionales" (PALATABLE, DIGESTIVO, ENERGÍA, SALUD, en mayúsculas).
7. **Numeración falsa.** Los círculos 1–4 sobre el bowl sugieren una secuencia que no existe, obligan a hacer clic para leer cada atributo y no tienen nombre accesible (el lector de pantalla solo dice "1", "2"…).
8. **El carrusel clona tarjetas.** La sección de gatos renderiza 5 tarjetas para 3 productos. Los lectores de pantalla y buscadores leen duplicados.
9. **Puntos de venta sin herramientas para encontrarlos.**
   - Es una lista alfabética de tarjetas idénticas, sin agrupar por distrito, sin mapa, sin buscador y sin opción de "más cercano".
   - Patmo Pets (tienda online) aparece con ícono de ubicación, como si fuera física.
   - Datos inconsistentes: "Surco" vs. "Santiago de Surco", "Miraflores." con punto final dentro de la búsqueda de Maps, "Villaran" sin tilde, +KOTAS con enlace corto y las demás con búsqueda.
   - El nombre de la tienda (`#b9814f` sobre blanco, 3.3:1) no cumple contraste AA para texto de ese tamaño.
10. **Formulario de contacto.**
    - Teléfono es `type="text"`, así que en móvil no sale el teclado numérico.
    - No hay atributos `autocomplete` y los placeholders repiten las etiquetas.
    - Empresa y RUC se piden a todos, incluso a dueños de mascotas, y el RUC no se valida.
    - El select "Tipo de Cliente" puede enviarse vacío.
11. **Enlaces sin nombre accesible:** los íconos de Facebook e Instagram no tienen texto ni `aria-label`, y "Alimentos" en el menú es un `<a>` sin `href`.
12. **Revisar el correo de contacto:** el pie dice "Representado exclusivamente por Solpet", pero el correo es `@solvet.com.pe`.

## 3. Rendimiento y técnica

13. **Demasiado código para una landing de una página:** 25 hojas de estilo y ~20 scripts (jQuery + jQuery Migrate, script de emojis, runtimes de Elementor y Elementor Pro, jQuery UI, DOMPurify).
14. **Imágenes:**
    - 21 sin `width`/`height`, lo que provoca saltos de diseño (CLS).
    - Los PNG de producto no tienen dimensiones ni carga diferida.
    - 22 imágenes tienen `alt` vacío, incluidas imágenes de contenido.
15. **Animaciones de entrada en 24 elementos** (fadeIn, fadeInLeft/Right/Up) sin respetar `prefers-reduced-motion`.
16. **Otros riesgos:** `transition: all` ×5, `outline: none` ×4 (posible pérdida del foco visible al navegar con teclado), y tres fuentes cargadas (Noto Serif, Poppins y las de Astra).

---

## 4. Qué resuelve la propuesta

- **Mapa interactivo de Lima Metropolitana** (lo principal):
  - Muestra los 47 distritos con límites del INEI. Los distritos con puntos de venta resaltan como azulejos y cada tienda tiene su pin.
  - Se puede tocar una tienda o un distrito. Un distrito sin tienda muestra la más cercana y a qué distancia está.
  - Incluye buscador por distrito, tienda o calle, botón "Cerca de mí" (ordena por distancia), zoom con botones, arrastre, pellizco y teclado, y la vista "Ver toda Lima".
  - Cada tienda tiene "Cómo llegar" a Google Maps con la dirección exacta. La vista queda en la URL (`?tienda=…`, `?distrito=…`) para compartirla.
  - Funciona sin API key ni costos de terceros.
- **Recetas como estantería comparable:**
  - Las 7 recetas tienen nombre en español ("Esterilizado con pollo"), para quién es y el nombre del empaque para ubicarlo en tienda.
  - Proteína, grasa, fibra, ceniza, kcal y formatos quedan a la vista y alineados entre recetas.
  - La composición completa se despliega sin modal.
- **Un solo bloque de atributos** ("Lo que hay en el plato") en lugar de tres, más los nutrientes funcionales que sí aparecen en la composición.
- **Guía de cambio de alimento en 7 días.** Ayuda a quien migra desde otra marca; es aquí donde la numeración sí tiene sentido, porque es una secuencia real.
- **SEO:** H1 real, `title` y `description` útiles, Open Graph y datos estructurados de la organización.
- **Accesibilidad:**
  - Enlace para saltar al contenido y foco visible en todo.
  - Etiquetas reales, errores en línea y `aria-live` en estados.
  - Movimiento reducido respetado; contraste AA verificado en la paleta.
- **Formulario:** Empresa y RUC aparecen solo para negocios; tipos `tel`/`email`, `autocomplete` y validación de RUC de 11 dígitos.
- **Rendimiento:** sin jQuery; 2 familias tipográficas; imágenes con dimensiones, `lazy` y `fetchpriority`.
- **Compatibilidad:** se mantienen las anclas actuales (`#conocenos`, `#cat`, `#dog`, `#comprar`, `#contactanos`), así que los enlaces y códigos QR existentes siguen funcionando.

## 5. Pendientes antes de publicar

1. **Imágenes de producto.** Copia desde la carpeta `Cooking – Pet_files` (la que se creó al guardar la página) a `cooking-pe/img/` estos archivos:
   - `Kitten-Salmon-cooking.png`
   - `salmon-cat-new-cooking.png`
   - `sterilized-new-cooking.png`
   - `puppy-recipe-new1.png`
   - `dog-lamb-allbreeds.png`
   - `dog-salmon-allbreeds.png`
   - `senior-dog-new.png`

   Las imágenes de marca (logo, hero, plato, perro y gato) se cargan desde cooking.pe y, si fallan, buscan una copia en `img/`.
2. **Confirmar los datos de los dos salmones** con los empaques (ver hallazgo 1).
3. **Coordenadas de las tiendas.** Son aproximadas: están validadas dentro de su distrito, pero no a nivel de calle. Para exactitud, copia la latitud y longitud de cada local desde Google Maps (clic derecho sobre el local) al arreglo `LOCATIONS` del archivo.
4. **Conectar el formulario.** Completa `CONFIG.formEndpoint`. Mientras esté vacío, el formulario abre el correo del visitante con el mensaje listo para `marketingpets@solvet.com.pe`.
5. **Implementación en WordPress:** la página puede montarse como plantilla HTML personalizada, o rehacerse en Elementor usando este archivo como especificación. El mapa funciona por sí solo dentro de un widget HTML.
6. **Datos del mapa:** INEI 2007 vía [peru-geojson](https://github.com/juaneladio/peru-geojson) (MPL-2.0). En esa fuente, Santa Anita y La Punta no tienen polígono propio, y Breña se corrigió a mano porque venía incompleta.
