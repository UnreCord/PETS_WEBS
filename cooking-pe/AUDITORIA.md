# Auditoría de cooking.pe y propuesta de rediseño

**Base del análisis:** HTML guardado de https://cooking.pe/ (WordPress 7.1.2, Elementor 4.2.4 + Elementor Pro, tema Astra Pro y 4 plugins propios `rblweb-*`) y captura de la sección de puntos de venta. El sitio en vivo no se pudo cargar desde el entorno de trabajo, así que no se midieron tiempos de carga reales (Core Web Vitals); los hallazgos de rendimiento salen del código.

**Propuesta:** `cooking-pe/index.html` (un solo archivo de ~810 KB con íconos, fotos y renders incluidos). Aparte solo carga Google Fonts, las imágenes de marca desde cooking.pe y, al acercarse al mapa, la librería MapLibre con las calles de OpenFreeMap.

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

La propuesta mantiene el mundo visual de la marca, que es minimalista y fotográfico:

- **Paleta y tipografía:** melocotón y crema, el marrón del logo y el naranja CooKing, con "El Rey de la *Cocina Nutricional*" en serif y script.
- **Imágenes:** las fotos reales de la marca (los chefs, el perro y el gato con gorro, la olla, los ingredientes).
- **Íconos:** de línea blancos sobre círculos mostaza, como en "Beneficios funcionales".
- **Estructura:** olas entre secciones.

Encima de eso suma movimiento con propósito y todo el contenido real del sitio. No usa emojis ni ilustraciones genéricas.

- **Una sección por pantalla:**
  - En computadoras y laptops, cada sección entra completa en la pantalla debajo del menú, sin tener que "cuadrar" el scroll. Probado en 1905×909 (Full HD al 100 %), 1920×1080, 1680×950, 1536×730, 1440×900, 1280×720 y 1366×625.
  - Cada giro de la rueda o gesto del touchpad lleva exactamente a la sección siguiente o anterior. La inercia del mismo gesto no salta dos secciones.
  - El teclado (Av Pág, flechas), la barra de desplazamiento y los enlaces del menú también caen al inicio de cada sección.
  - Las listas con scroll propio, como la de tiendas, se recorren primero.
  - En pantallas bajas se ocultan detalles secundarios (el SKU del empaque, algunos subtítulos) para que todo siga entrando.
  - **En celulares** (hasta 767 px de ancho) también es una sección por pantalla y cada deslizamiento lleva a la siguiente. Probado en 390×844, 412×915, 375×667 y 360×640. Lo que no entra a lo alto se mueve hacia los costados:
    - las recetas en carrusel;
    - los filtros, los ingredientes y los puntos del plato en filas deslizables;
    - la calculadora en dos paneles, "Tu mascota" y "Su plan", con el botón "Ver su plan →";
    - el mapa con el selector "Mapa | Lista de tiendas"; al tocar una tienda de la lista se abre en el mapa.
  - En celular, "Conócenos" no repite el segundo párrafo, que ya aparece en "Los ingredientes".
  - El contacto tiene dos paradas: primero el formulario y después los datos de Solpet con el pie de página.
  - En celulares bajos (667 px de alto o menos) se ocultan detalles secundarios. Por ejemplo, el cambio en gramos dentro de la calculadora, que igual se explica en la sección siguiente.
  - En tablets las secciones conservan su altura natural y el inicio de cada una se acomoda solo cuando el scroll se detiene cerca.

- **Hero en la línea del original:** el perro y el gato chefs entran desde los lados y se funden con el fondo. El subrayado naranja de "Cocina Nutricional" se dibuja al cargar, por debajo del texto, sin tocar las letras. Las bolsas suben desde una ola.
- **Cinta de ingredientes en movimiento** con los ingredientes reales de las composiciones. Cada uno tiene su propio ícono de línea: pollo, salmón, cordero, patata, legumbres, zanahoria, habas, frutos rojos, manzana, romero, cítricos y achicoria.
- **"Conócenos"** con la foto del perro y el gato con gorro de chef en un marco de arco, y un sello circular giratorio con el logo.
- **"¡Los ingredientes marcan la diferencia!"**, como en el sitio actual, con la franja fotográfica de ingredientes frescos. La olla gira a medida que se hace scroll, y el visitante también puede girarla arrastrándola con el cursor; al soltarla sigue girando por inercia. En celular se gira deslizando hacia los lados.
- **El plato de croquetas, restaurado y mejorado:**
  - Es un render 3D generado para la propuesta: plato de cerámica marrón con el logo CooKing, croquetas con textura y volumen, y sombras suaves, como en la imagen original.
  - Las croquetas (también renderizadas en 3D) salen disparadas del plato al entrar en pantalla y quedan flotando. Tienen física propia:
    - Al tocar uno de los 4 puntos, se mueven y se reacomodan.
    - Al cerrar la tarjeta, vuelven a caer dentro del plato.
    - Al tocar el plato, salen disparadas otra vez.
    - Se apartan al pasar el cursor, y si se toca una croqueta, sale despedida.
    - El botón "Lanzar las croquetas / Devolverlas al plato" hace lo mismo desde el teclado.
  - Tiene 4 puntos interactivos con las tarjetas marrones del original, que se pueden cerrar con la × o con Esc. La tarjeta se ubica siempre por encima de todos los puntos, con una línea punteada hacia el que explica, así ningún ícono tapa el texto. Son accesibles con teclado, se repiten como botones debajo del plato y rotan solos hasta que el usuario interactúa.
  - Sin numeración falsa: cada punto lleva el ícono de línea de lo que explica.
- **Beneficios en órbita** alrededor del perro y el gato: las 8 características en un solo bloque, en lugar de los tres bloques repetidos, con íconos mostaza al estilo de la marca.
  - Los íconos van sobre la línea punteada y cada texto se ubica hacia afuera. La línea se interrumpe alrededor de cada ícono y texto, así que nunca pasa por encima de la letra.
  - Al pasar el cursor, la característica crece y su ícono cambia a naranja.
- **Recetas con pestañas Perros / Gatos:**
  - Cada bolsa está ilustrada con el color de su proteína (dorado pollo, naranja salmón, marrón cordero), con croquetas 3D flotando alrededor. Si se copian las fotos reales a `img/`, reemplazan a la ilustración.
  - Barras animadas de proteína, grasa y fibra, más ceniza, kcal y formatos.
  - Todas las tarjetas de una fila quedan alineadas, aunque el título o la descripción ocupen más líneas: las barras, los datos y "Ver composición" están a la misma altura.
  - **Filtros por edad** (cachorro o gatito, adulto, senior) **y por tamaño de bolsa** (2, 3, 8 y 12 kg, según la especie). Muestran cuántas recetas coinciden, tienen "Quitar filtros" y quedan en el enlace (`?edad=adulto&bolsa=12`).
  - La composición completa se despliega sin modal. En celular, las tarjetas se deslizan como carrusel.
- **Guía de cambio de alimento en 7 días** con una animación en loop:
  - Arranca sola desde los días 1 y 2 cuando la sección está a la vista.
  - Primero vierte la bolsa del alimento anterior y después la de CooKing, al mismo ritmo, así el tiempo de cada una es proporcional a lo que aporta:
    - Días 1 y 2: el anterior vierte tres veces más tiempo que CooKing.
    - Días 3 y 4: el mismo tiempo.
    - Días 5 y 6: CooKing vierte tres veces más.
    - Día 7: solo CooKing.
  - Al final aparece "Mézclalo bien" y el plato muestra la mezcla real de esa etapa.
  - La barra de cada bolsa se llena mientras vierte, y el paso activo muestra su avance antes de pasar al siguiente.
  - Tiene botón de pausa y los 4 pasos sirven para saltar a cualquier etapa.
  - Con movimiento reducido no arranca sola, pero se puede reproducir con el botón o tocando un paso.
- **Nueva sección "Arma su plan CooKing en 30 segundos":**
  - El visitante elige perro o gato, edad y peso (con un deslizador).
  - La pregunta de condición solo ofrece lo que define un producto del catálogo y solo cambia la receta, nunca la cantidad:
    - en perros, "Tiende a subir de peso" lleva a Senior y light;
    - en gatos, "Está esterilizado" lleva a Esterilizado con pollo.
  - Al instante ve:
    - La receta recomendada del catálogo real, con 3 razones tomadas de su descripción y una alternativa.
    - La ración diaria estimada en gramos y en comidas, con un montoncito de croquetas que crece.
    - Cuántos días le dura cada bolsa.
    - Su cambio en 7 días expresado en gramos de CooKing.
  - Lleva a "Encuentra tu tienda" y a "Ver la receta", que abre la pestaña correcta y resalta la tarjeta.
  - En celular, una barra flotante muestra el resultado mientras se responde.
  - La ración se calcula con la fórmula estándar (70 × peso^0,75 por un factor según la etapa de vida) y las kcal/kg de la receta recomendada. Por eso los gramos solo varían si cambia el producto, ya que cada receta tiene distinta energía. La sección lo indica y remite a la tabla del empaque y al veterinario.
- **Mapa interactivo de Lima Metropolitana:**
  - Mapa real de calles: MapLibre con datos de OpenStreetMap servidos por OpenFreeMap, gratis, sin clave ni límite de uso.
  - Está pintado con la paleta de CooKing: crema, melocotón, mar turquesa y parques verdes con huellitas de mascota.
  - Encima van los distritos con tiendas en dorado.
  - **Cada punto de venta es el logo de CooKing.** Las tiendas cercanas se agrupan en un logo con contador, que se abre al tocarlo.
  - Buscador, "Cerca de mí", distrito sin tienda → la más cercana, "Cómo llegar" a Google Maps y enlaces compartibles (`?tienda=…`, `?distrito=…`).
  - Si el navegador no soporta WebGL o el servicio de calles no responde, se muestra el mapa de distritos propio, con los mismos logos y funciones.
- **SEO:** H1 real, `title` y `description` útiles, Open Graph y datos estructurados de la organización.
- **Accesibilidad:**
  - Enlace para saltar al contenido y foco visible en todo el recorrido con teclado.
  - Pestañas y puntos del plato con los roles ARIA correctos, errores en línea en el formulario.
  - Si el usuario pide menos movimiento en su sistema, todas las animaciones se desactivan y el contenido se muestra completo.
- **Formulario:** Empresa y RUC aparecen solo para negocios; tipos `tel`/`email`, `autocomplete` y validación de RUC de 11 dígitos.
- **Rendimiento:** sin jQuery ni Elementor; imágenes con dimensiones, `lazy` y `fetchpriority`; las animaciones usan solo `transform` y `opacity`.
- **Compatibilidad:** se mantienen las anclas actuales (`#conocenos`, `#cat`, `#dog`, `#comprar`, `#contactanos`); `#cat` y `#dog` abren la pestaña correspondiente.

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
5. **Implementación en WordPress:** lista en `wordpress/cooking-landing.zip`, un plugin que reproduce este archivo tal cual. Agrega puntos de venta editables, guarda los mensajes del formulario y los envía con `wp_mail`, y tiene una página de ajustes. Los pasos para el proveedor están en `wordpress/GUIA-PROVEEDOR.md` (y en `.pdf`): instalación, fotos de producto, SMTP, exclusiones de caché y lista de revisión. Se probó en WordPress 6.5 con un tema de bloques y con un tema clásico. cooking.pe usa WordPress 7.1.2 con Astra Pro y Elementor Pro, así que conviene instalarlo primero en staging.
6. **Datos del mapa:** INEI 2007 vía [peru-geojson](https://github.com/juaneladio/peru-geojson) (MPL-2.0). En esa fuente, Santa Anita y La Punta no tienen polígono propio, y Breña se corrigió a mano porque venía incompleta.
7. **Imágenes de marca tomadas de capturas:** el perro y el gato chefs del hero y la franja de ingredientes están definidos en los CSS de Elementor, así que no tienen URL pública. Para la propuesta los recorté de las capturas del sitio (`img/marca/`). Al publicar, conviene reemplazarlos por los archivos originales en alta resolución, con el mismo nombre.
8. **Renders 3D e íconos:** los platos y croquetas son renders 3D propios (`img/render/`), incluidos el plato vacío y las croquetas del "alimento anterior" de la animación de 7 días. El logo de los renders y el de los marcadores del mapa vienen de una captura (el del mapa se pasó a vector). Si se entrega el logo oficial en SVG, se reemplazan y quedan más nítidos. Los íconos de línea son de [Lucide](https://lucide.dev) (licencia ISC, uso comercial permitido), más íconos propios en el mismo estilo para patata, habas, romero y "Hecho en Europa".
9. **Mapa de calles:**
   - Revisarlo en un navegador normal antes de publicar. En el entorno de trabajo no hay acceso a OpenFreeMap, así que el estilo se validó con datos de prueba de OpenMapTiles, que es el mismo formato.
   - OpenFreeMap es un servicio comunitario sin garantía de servicio. Si se quiere una, sirve el mismo estilo con MapTiler o Stadia (requieren clave). Usar Google Maps con logos propios exige una clave de Maps JavaScript API con facturación.
   - Con `CONFIG.streetMap = false` se usa solo el mapa de distritos.
10. **Filtro de tamaño:** todas las recetas para perros son para todas las razas, así que "tamaño" se interpretó como tamaño de bolsa. Si llegan recetas por tamaño de raza, se agrega ese filtro con el mismo componente.
11. **Validar la calculadora de ración** con el equipo técnico o veterinario de la marca. Hay que comparar varios casos (por ejemplo, perro adulto de 12 kg, gato esterilizado de 4 kg y cachorro de 20 kg) contra la tabla de cada empaque. Los factores por etapa de vida están en la función `factor()` de `initPlan` (perro adulto 1,6; senior 1,4; cachorro y gatito 2,5; gato adulto 1,4) y se pueden ajustar en una línea.
