# Crónica de Imperios

Atlas temporal interactivo: un mapa del mundo y una línea de tiempo desplazable
para recorrer **153 civilizaciones** —desde los cazadores-recolectores del
Paleolítico hasta los Estados actuales— y ver cómo surgen, prosperan, culminan y
desaparecen a lo largo de 25.000 años.

![Crónica de Imperios](https://img.shields.io/badge/react-19-vite-7-teal?style=flat-square)

---

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # bundle de producción en dist/
npm run preview  # sirve dist/ para revisión
```

No requiere claves, cuentas ni conexión: la cartografía (Natural Earth, TopoJSON)
y las tipografías van empaquetadas en el propio proyecto.

---

## Qué se puede hacer

| Acción | Cómo |
| --- | --- |
| Recorrer el tiempo | Arrastrar el cursor sobre la línea de tiempo, o pulsar `▶` para reproducirlo |
| Saltar a un momento | Enlace directo: `#1492/espana` (año + civilización) |
| Consultar una civilización | Clic en el mapa, en el riel izquierdo o en la cronología inferior |
| Leer su apogeo y decadencia | Ficha lateral: vigencia, cúspide, ventana de declive y causa de la caída |
| Ver sus hitos | La lista de hitos; al pulsar uno, la línea de tiempo salta a ese año |
| Filtrar | Por tipo (imperio, reino, cultura, pueblo…) o por región del mundo |
| Ampliar el mapa | Rueda del ratón o pellizco; `+`, `−` y `⤢` en la esquina inferior derecha |
| Atajos | `Espacio` reproduce/pausa · `←` `→` mueven el año (`⇧` = saltos de 50 años) |
| Ampliar el tiempo | Rueda del ratón sobre el riel; el minimapa arrastrable mueve la ventana |
| Ver quién cae | Botón **Phase**: el color pasa a codificar la fase, no la identidad |
| Comparar dos | Botón **Compare**: solape, antigüedad, duración y cúspide de dos civilizaciones |
| Saber qué pasa hoy | Panel **Happening now**: los hechos del año visible de todas las civilizaciones |
| Estados de hoy | Botón **States**: los 160 países actuales y el año en que tomaron forma |
| Contraste | Botón **Borders**: fronteras modernas superpuestas al polígono histórico |

### El modelo de datos

El catálogo vive en `datos/*.json` (normalizado: civilizaciones, regiones, hitos,
territorios, ciudades, religiones, deidades, artefactos) y se valida **antes de
cada `dev` y de cada `build`** (`npm run validate`): IDs duplicados, fechas
imposibles, regiones inexistentes, anillos sin cerrar, coordenadas fuera de
rango, polígonos auto-intersectados y texto con caracteres corruptos.

Los `territorios` tienen dos niveles: `polidad` (el Estado soberano) y
`division` (vireinato, provincia, satrapía, emirato) con su polidad superior.
Cada polígono lleva fecha, así que al desplazar la línea de tiempo los imperios
se ven crecer y menguar. Hay **281 polígonos** y el **99 %** de las
civilizaciones tiene territorio en el mapa: las dos que no (védica y pueblos
germánicos) son pueblos sin Estado, que se dibujan como aura.

El inglés es el idioma por defecto y viaja en un *chunk* aparte: el español
siempre está en línea.

### Lectura de la pantalla

- **Mapa** — cada región encendida es la civilización dominante en ese instante.
  Un **contorno discontinuo** indica que está en decadencia. Los pueblos que no
  formaban un Estado (fenicios, filisteos, taínos…) se dibujan como un **halo**
  sobre su territorio, no como un país teñido. Con **Phase** el color codifica
  el estado (nacimiento, cúspide, apogeo, decadencia) en vez de la identidad.
- **Riel izquierdo** — las civilizaciones vivas ahora mismo, agrupadas por región.
- **Cronología inferior** — una barra por civilización: la base es su vigencia,
  el tramo brillante su **cúspide** y el rayado su **decadencia**. El playhead
  marca el año actual. La curva de fondo muestra cuántas civilizaciones
  coexistían en cada momento.
- **Ficha lateral** — síntesis, cómo cayó, qué dejó y sus hitos.

---

## Ampliar el catálogo

Todo vive en dos archivos de datos; no hay que tocar la interfaz.

**`src/data/regions.ts`** — las regiones del mapa. Cada una se define por los
países modernos que la componen (aproximación cartográfica habitual en atlas
históricos) y el ancla de su etiqueta:

```ts
{
  id: 'mesopotamia',
  nombre: 'Mesopotamia',
  grupo: 'Asia',
  paises: ['Iraq'],
  ancla: [45, 32],          // longitud, latitud
}
```

Los nombres de país deben existir en `world-atlas` 50m
(`node_modules/world-atlas/countries-50m.json`).

**`src/data/civilizations.ts`** — una entrada por civilización:

```ts
{
  id: 'babilonia',
  nombre: 'Babilonia',
  abrev: 'BAB',             // rótulo corto en el mapa
  tipo: 'imperio',          // imperio | reino | estado | dinastia | cultura | pueblo | confederacion
  region: 'mesopotamia',
  inicio: -1894,            // negativo = a.C.
  fin: -539,
  apogeo: [-1792, -1600],   // la cúspide
  declive: [-600, -539],    // la ventana de crisis (o null)
  peso: 8,                  // quién ilumina la región si coexisten varios
  territorio: true,         // false = pueblo disperso, se dibuja como halo
  color: '#a08bdc',
  sintesis: '…',
  caida: '…',
  legado: '…',
  hitos: [{ a: -1792, t: 'Hammurabi unifica Mesopotamia.' }],
}
```

Al guardar, la nueva civilización aparece automáticamente en el mapa, en el
riel, en la cronología y en los filtros. Para cambiar el rango temporal,
edita `ANIO_MIN` / `ANIO_MAX` al final de ese archivo.

---

## Estructura

```
src/
  data/
    tipos-cultura.ts  Tipos (Civilizacion, Region, Hito, Territorio, Religion…)
    types.ts          Alias de tipos-cultura.ts
    datos.generados.ts    Catálogo español, generado por scripts/validar.mjs
    datos.en.generados.ts Catálogo inglés, cargado bajo demanda
    catalogo.ts       API única de lectura del catálogo
    estados-actuales.ts   Los 160 Estados de hoy y su año de formación
  lib/
    geo.ts            Proyección Natural Earth, fusión de países, geometría de regiones
    tiempo.ts         Formato de años, eras y marcas del eje
    dominio.ts        Quién vive en un año, fases, dominancia por región, filtros
  components/
    MapaAtlas.tsx     Mapa SVG con zoom, resaltado por región y colocación de rótulos
    Cronologia.tsx    Riel temporal (scrubber) + Gantt de vidas
    Riel.tsx          Lista de civilizaciones vivas
    Ficha.tsx         Ficha de detalle (síntesis, Eyada, legado, religión, cultura)
    Ahora.tsx         Los hechos del año visible
    Comparacion.tsx   Comparador de dos civilizaciones
    Estados.tsx       Panel de los Estados actuales
  App.tsx             Estado, reproducción automática, filtros y teclado
  styles/app.css      Sistema visual completo
```

**Decisiones técnicas**

- **Cartografía**: `world-atlas` 50m en TopoJSON → `topojson-client` fusiona los
  países de cada región → `d3-geo` con la proyección *Natural Earth 1*, que
  conserva la forma de los continentes sin el aspecto de Mercator.
- **Zoom**: `d3-zoom` aplica una transformación al `<g>` del mapa; los paths
  son vectores, así que no hay pérdida de calidad al ampliar.
- **Rótulos**: un algoritmo guloso reparte las etiquetas (derecha, izquierda,
  arriba, abajo) evitando que se pisen entre sí.
- **Fuentes tipográficas**: Fraunces (display), Spectral (texto) e IBM Plex Mono
  (cifras), empaquetadas con `@fontsource` para que no dependan de Google Fonts.
- **Música**: banda sonora sintetizada con Web Audio (bordón modal, cuerda
  pulsada y pandero), sin ningún fichero de audio y sin copyright.
- **Idiomas**: el catálogo español es la fuente de verdad y el inglés se carga
  en un *chunk* aparte; el validador rechaza el texto que mezcle idiomas.

---

## Advertencias

- Las fronteras son **modernas y esquemáticas**: sirven para leer la geografía,
  no para reconstruir fronteras históricas exactas.
- Las fechas de las dinastías son aproximaciones historiográficas habituales
  (p. ej. las dinastías chinas o las listas de faraones). Las ventanas de
  apogeo y decadencia son una síntesis, no un consenso historiográfico.
- Los colores identifican civilizaciones, no producción ni alineamientos: dos
  estados del mismo color no implican ninguna relación entre sí.

---

## Créditos

- Cartografía: [Natural Earth](https://www.naturalearthdata.com/) vía
  [`world-atlas`](https://github.com/topojson/world-atlas) (dominio público).
- Proyección y utilidades: [d3-geo](https://d3js.org/d3-geo),
  [d3-zoom](https://d3js.org/d3-zoom), [topojson-client](https://github.com/topojson/topojson-client).
- Tipografías: Fraunces, Spectral e IBM Plex Mono (SIL Open Font License).
