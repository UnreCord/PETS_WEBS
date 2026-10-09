# Fotos de la web

La página ya funciona sin fotos: las croquetas 3D y la tipografía sostienen cada sección. Cuando marketing tenga las fotos, cada una entra en su espacio sin tocar el diseño.

## Cómo agregar una foto

1. Copia el archivo en esta carpeta (`img/fotos/`), en JPG o WebP.
2. En `index.html`, dentro de `window.DIBAQ_CONFIG.fotos`, escribe su ruta. Por ejemplo: `inicio: "img/fotos/inicio.jpg"`.
3. Recarga la página.

Para ver dónde cae cada espacio antes de tener las fotos, abre la página con `?fotos` al final de la dirección (por ejemplo `index.html?fotos`). Cada espacio aparece con un borde punteado y su nombre.

Las fotos se muestran en blanco y negro, porque en esta web el único color es el del alimento. Si prefieres verlas a color, cambia `fotosEnBN` a `false` en la misma configuración.

## Espacios

| Nombre | Dónde aparece | Qué foto conviene | Formato mínimo |
|---|---|---|---|
| `inicio` | A la derecha del título principal, detrás de las croquetas 3D. En celular, arriba. | Un perro (o un perro y un gato) mirando a cámara, con fondo claro y limpio. Mucho aire alrededor del animal. | Vertical, 1600 × 2000 px |
| `natural` | Fondo de la mitad blanca de "Las dos líneas", al 32 % de opacidad. | Luz natural: un perro o un gato en casa, en el campo o junto a una ventana. | Vertical u horizontal, 1600 × 1800 px |
| `sense` | Fondo de la mitad negra de "Las dos líneas", al 32 % de opacidad. | El animal sobre fondo oscuro, con luz lateral. Funciona muy bien un primer plano del hocico o de los ojos. | Vertical u horizontal, 1600 × 1800 px |
| `origen` | Mitad derecha de "Desde Segovia", al 42 % de opacidad, fundida con el negro. | La planta de Fuentepelayo, campos de Segovia o el equipo de Dibaq. | Horizontal, 2000 × 1300 px |
| `contacto` | Debajo del texto de contacto (solo en computadora y tablet). | Una persona con su perro o su gato, en un momento cotidiano. | Horizontal 16:10, 1200 × 750 px |

Consejos:

- Exporta en WebP con calidad 80 a 85. Una foto debería pesar menos de 350 KB.
- Evita fotos con texto, logotipos de terceros o bolsas de otras marcas.
- Las fotos de bolsas no van aquí: van en `img/productos/` (ver el README principal).
