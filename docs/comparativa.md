# Comparativa con otros atlas temporales

*Crónica de Imperios* es un atlas histórico interactivo en español: un mapa del
mundo y una cronología desplazable para recorrer 153 civilizaciones a lo largo
de 25.000 años, con ficha de cada una, filtros, capas y un enlace que conserva
el estado de la vista.

Este documento es la tarea 1.1 del cambio OpenSpec `mejorar-experiencia`. Compara
el proyecto con seis atlas que resuelven problemas parecidos a los nuestros
—navegación en el tiempo, capas, procedencia del dato y estado compartible— y
deja por escrito qué patrón tomamos de cada uno y cuál descartamos. Cada dato se
ha verificado con búsqueda web en octubre de 2026; lo no confirmado se dice
como «sin verificar».
## Tabla comparativa

| Proyecto | Qué es | Unidad principal | Cobertura temporal | Fuente de los datos | Interacción principal | Strengths / debilidades respecto a nuestro caso | Licencia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Chronas](https://chronas.org/) | Mapa histórico interactivo con cronología propia | Entidad política (área/provincia) con atributos por año: población, cultura, religión, capital, migración | Eje visible de −400 a 1900 en la versión clásica ([old.chronas.org](https://old.chronas.org/)); cobertura exacta actual **sin verificar** | Migración de Wikidata/Wikipedia a su propia base de datos (DynamoDB) | Deslizador temporal con reproducción, búsqueda de «epics», zoom/arrastre; estado en la URL (`?year=1000&pos=lat,lng,zoom`) | **Strength:** el más parecido a nosotros en unidad y en estado por URL. **Debilidad:** exige WebGL, modelo de datos pesado y API propia | Código MIT; datos CC BY-SA 4.0 ([README](https://github.com/Chronasorg/chronas-api)) |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/) | Mapa colaborativo de la historia del mundo sobre OpenStreetMap | Objeto geográfico (nodo/vía/área) con `start_date`/`end_date`; no existe la noción de «civilización» | De 4001 a.C. (gregoriano proleptico) a hoy; cobertura muy desigual por región ([Wikipedia](https://en.wikipedia.org/wiki/OpenHistoricalMap)) | Aportaciones de la comunidad; georreferenciación de mapas antiguos; contenido de Wikipedia/Wikimedia en la barra lateral | Deslizador con rango y animación, capas de estilo, búsqueda a través del tiempo, panel «Share» con *embed*; estado en el hash (`#map=zoom/lat/lon&date=…&daterange=…&layers=…&language=…`) | **Strength:** el estado completo en la URL y las capas intercambiables. **Debilidad:** cobertura dispersa, entidades sin geometría y un modelo de objetos, no de imperios | Dominio público (CC0) salvo indicación contraria ([export](https://www.openhistoricalmap.org/export)) |
| [TimeMaps](https://timemaps.com/) | Atlas + enciclopedia de la historia mundial; más de 1.000 mapas | Un mapa por «Key Date»; las civilizaciones son bandas en una cronología bajo el mapa | 20 fechas clave entre 3500 a.C. y 2005 d.C. ([uso del TimeMap](https://timemaps.com/using-timemap-world-history/)) | Atlas histórico propio; una parte del contenido es «Premium» de pago | Fecha con flechas y línea de tiempo, migas de pan, enlaces a mapas vecinos de la misma fecha | **Debilidad:** modelo de instantáneas discretas; encadenar una historia exige saltar entre páginas | Sin licencia libre de los mapas; contenido Premium de pago. Licencia exacta **sin verificar** |
| [GeaCron](http://geacron.com/whatisgeacron/) | Base de datos geo-temporal y atlas de pago con mapas vectoriales por año | Entidad política con polígonos vectoriales por año | Desde 3000 a.C. | Atlas históricos, bibliotecas, fuentes universitarias e internet; cada cambio de frontera con al menos un hecho histórico que lo justifique ([assets](http://geacron.com/assets/assets.html)) | Fecha, zoom, búsqueda por términos (área/ciudad/evento), globo 3D, impresión; timelines por disciplina | **Debilidad:** todo es comercial y sin API abierta: sirve como modelo de método, no como fuente | «All Rights Reserved» (© 2011 geacron.com); versiones Premium/Education/Corporate de pago |
| [Histography](https://www.histography.io/) | Línea de tiempo interactiva de toda la historia, del Big Bang a hoy | Evento histórico: cada punto es un hecho | 14.000 millones de años, con rangos ajustables | Wikipedia en inglés, autoactualizado a diario; imágenes de Google y vídeos de YouTube ([entrevista](https://www.smashingmagazine.com/2016/09/interview-with-matan-stauber/)) | Ajuste del rango temporal, categorías (guerra, inventos…), «feeling lucky», comparación de eventos | **Debilidad:** descartó la vista de mapa por falta de geolocalización; fuente única y occidental | **Sin verificar:** no se ha encontrado licencia pública declarada |
| [Our World in Data](https://ourworldindata.org/) | Atlas de datos con gráficos explorables (Grapher) | Entidad (país o región) + indicador | La de cada indicador (p. ej. 1543-2021 en un ejemplo); no hay rango histórico global | Terceros (ONU, Banco Mundial, OMS…) con su propia licencia, más datos propios «Official data collated by OWID» | Pestañas chart/map/table, selector de entidades, deslizador temporal, descarga CSV/PNG/SVG, «Learn more about this data»; estado en la URL (`?tab=map&country=…&time=…`) | **Strength:** nuestro modelo de procedencia (metadatos, cita, cobertura, API). **Debilidad:** no es un atlas histórico y su código no es reutilizable | Datos y gráficos propios CC BY 4.0; el código de Grapher **no** es libre (MIT solo en versiones antiguas) ([FAQ](https://ourworldindata.org/faqs)) |

## Chronas

Chronas es el referente más cercano a lo que queremos: un mapa del mundo con
deslizador temporal donde cada área política tiene atributos por año —
población, cultura dominante, religión, centro de poder, migraciones— y una
ficha lateral que se actualiza al mover el año
([entrevista a Dietmar Aumann](https://news.elearninginside.com/chronas-map-of-history-50-million-data-points/));
su frontend se reescribió en 2026 sobre React 19 + Vite con enrutado por hash,
como el nuestro ([chronas-frontend](https://github.com/Chronasorg/chronas-frontend)).
**Nos sirve como modelo:** el estado en la URL (`?year=…&pos=lat,lng,zoom`), que
hace que la misma dirección sea enlace profundo y punto de entrada para
compartir, y su degradación por rendimiento («Clean & Fast» / «Intermediate» /
«Complete», con topes de 2.000 y 5.000 marcadores por año) como control
explícito de la densidad. **No copiamos:** su dependencia de WebGL —la web avisa
«WebGL Not Supported» si falta— ni su modelo de datos atómico con más de 50
millones de puntos: el nuestro sigue siendo SVG, y el límite de densidad lo
decide el usuario.

## OpenHistoricalMap

OpenHistoricalMap es cartografía colaborativa: cualquiera georreferencia mapas
antiguos y los sube con etiquetas de vigencia (`start_date`, `end_date` en ISO
8601 o EDTF), y el mapa muestra el mundo tal como estaba en la fecha que marque
el deslizador ([OSM Wiki](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Browsing));
es un *charter* de OpenStreetMap US y su base de datos está dedicada al dominio
público. **Nos sirve como modelo:** el estado completo en el hash —`map=`,
`date=`, `daterange=`, `layers=`, `language=`— que permite compartir una vista
exacta y sobrevive a enlaces antiguos
([esquema de fechas](https://forum.openhistoricalmap.org/t/url-time-specification/184)),
y el panel «Share» con *embed* que ya incluye la selección
([openhistoricalmap-embed](https://github.com/OpenHistoricalMap/openhistoricalmap-embed)).
**No copiamos:** el modelo de objeto geográfico no encaja con nuestro catálogo
de civilizaciones, y su cobertura desigual, con entidades sin geometría, es un
problema que no podemos permitir: nuestros polígonos deben poder leerse como
una afirmación.

## TimeMaps

TimeMaps (Atlas + Enciclopedia) cubre la historia mundial con más de 1.000 mapas
en tres niveles —mundo, regiones, países— alrededor de veinte «Key Dates» entre
3500 a.C. y 2005 d.C., pensados para docencia; su cronología inferior muestra
las civilizaciones como bandas y las flechas permiten moverse en el tiempo.
**Nos sirve como modelo:** que la cronología cuente qué ocurre *a la vez* en el
mundo, no solo la vida de una civilización: ya lo hacemos con la curva de
coexistencia y el panel «Happening now», y su versión escalonada (mundo →
región → país) refuerza esa lectura. **No copiamos:** el modelo de instantáneas;
con veinte fechas fijas no se puede seguir la caída de un imperio ni comparar
dos en el mismo año, y nuestro eje es continuo.

## GeaCron

GeaCron es la base de datos geo-temporal más seria de la lista: polígonos
vectoriales de entidades políticas desde 3000 a.C., áreas y perímetros por año,
~3.000 eventos que explican cambios de frontera con enlace a enciclopedias,
rutas, temperaturas, demografía y ~13.200 periodos de cronologías estructuradas
([what is GeaCron](http://geacron.com/whatisgeacron/),
[assets](http://geacron.com/assets/assets.html)). **Nos sirve como modelo:** el
principio de que *cada* cambio de frontera tiene una razón documentada y
enlazada, que es lo que exigimos a nuestros datos (`fuentes`, `confianza` y una
nota cuando la fecha es dudosa), y su búsqueda por términos con categoría
(área, ciudad, evento), que evita que la búsqueda devuelva cualquier cosa.
**No copiamos:** nada de su base de datos: es «All Rights Reserved» y se vende
como dataset propietario, sin API abierta.

## Histography

Histography lleva la línea de tiempo a una escala radical: desde el Big Bang,
cada punto es un evento extraído de Wikipedia y puntuado por importancia, con
rangos temporales ajustables de décadas a miles de millones de años
([Adobe](https://blog.adobe.com/en/publish/2015/12/03/data-meets-design)).
**Nos sirve como modelo:** la lección inversa. Su autor explica que descartó la
vista de mapa precisamente porque *los datos no traían localización*; nuestro
mapa exige que cada evento tenga un lugar, y por eso nuestro catálogo necesita
fuentes explícitas; su ajuste continuo del rango es la misma idea que nuestro
zoom temporal. **No copiamos:** la dependencia de una única fuente (Wikipedia
en inglés) ni la web de miles de partículas WebGL: el nuestro trabaja con 153
civilizaciones elegidas a mano y con datos con nivel de confianza.

## Our World in Data

OWID no es un atlas histórico: es un atlas de *datos*, con miles de gráficos
explorables sobre datos de terceros. Su valor para nosotros está en cómo
convierte un conjunto de datos en algo legible, citable y reutilizable: pestañas
(chart/map/table), metadatos con rango temporal, autoría, fecha de actualización
y cita, botón «Learn more about this data» y una API estable en CSV y JSON
([Chart API](https://docs.owid.io/projects/etl/api/chart-api/)). **Nos sirve como
modelo:** es la referencia para el bloque de procedencia; su API demuestra que el
estado de la vista (pestaña, entidades, rango temporal) debe viajar en la URL y
que los datos se acompañan de un `.metadata.json` con la cita, y su tabla de
datos y su sección de fuentes son el estándar que un profesor esperaría de un
atlas. **No copiamos:** el código (Grapher exige permiso escrito) ni sus
debilidades: una auditoría externa reciente describe divergencias fuertes entre
orden visual, árbol de accesibilidad y tabulación, con acciones que solo existen
al pasar el ratón; nosotros debemos hacer mejor eso.

## Decisiones que tomamos

- **Zoom temporal con barra de contexto (minimapa)** → Con 25.000 años en un solo
  riel no se puede leer «un siglo» → **de OpenHistoricalMap** (rango del
  deslizador) y del patrón *overview + detail* de `d3-zoom`.
- **El estado completo viaja en la URL: año, civilización, filtros, capas,
  densidad de etiquetas e idioma** → Un enlace compartido debe reproducir *la
  vista* → **de OWID** (`tab`, `country`, `time`, `mapSelect`) y **de OHM**
  (`date`, `daterange`, `layers`, `language`).
- **Botón «Copiar enlace» con confirmación `aria-live`** → Copiar es un clic y no
  puede confirmarse solo con color → **de OWID** (botón «Share» cuyo *embed*
  ya refleja la selección actual).
- **Densidad de etiquetas en tres modos (automática, todas, ninguna),
  persistida y reflejada en el enlace** → El algoritmo guloso oculta nombres
  justo donde hay más historia → **de Chronas** (modos de carga con topes
  explícitos), adaptados a un interruptor que decide el usuario.
- **Navegación completa por teclado y anuncio con lector de pantalla** → Tab
  recorre todos los controles en orden coherente con lo que se ve, y el año se
  anuncia con `aria-live="polite"` solo al cambiar por teclado o botón →
  **de OWID**, tomando nota de sus fallos publicados y haciendo lo contrario.
- **Capas independientes y conmutables (divisiones, religiones, países
  actuales)** → Un conmutor grueso no permite leer un califato sin la
  superposición del reino → **de OHM** (capas de estilo intercambiables) y de
  Chronas (religión y cultura por año); el panel «solo / ojo» es propio.
- **Cada dato con fuente, confianza y nota; la ficha muestra de dónde sale** →
  Un atlas sin procedencia no es citable → **de OWID** (`citation`, `timespan`,
  `lastUpdated`) y **de GeaCron** (la razón de cada cambio de frontera).
- **El tiempo se guarda en el hash, no en un servidor; sin cuentas ni backend**
  → El atlas debe abrirse desde ficheros estáticos y compartir sin registro →
  **de TimeMapper** (una URL pública por *timemap*) y **de Chronas**
  (`?year=&pos=`).
- **Búsqueda por texto con sugerencias y estados vacíos accionables** → Buscar
  «Roma» debe llevar a su ficha, y una búsqueda vacía debe ofrecer limpiarla →
  **de OHM** (búsqueda a través del tiempo) y **de GeaCron** (búsqueda por
  términos con categoría).
- **Fronteras modernas como capa superpuesta y esquemática** → Nuestras
  fronteras sirven para leer la geografía, no para fingir precisión histórica →
  **de GeaCron** (metodología) y **de OHM** (capas estándar de OSM).
- **Idiomas: español por defecto e inglés con identificadores estables** → Un
  enlace compartido entre idiomas debe abrir en el mismo estado → **de OHM**
  (parámetro `language`).
- **Sin reproducción automática al cargar** → El autoplay de Chronas sustrae el
  control → **de Chronas** (botón «Start Autoplay» explícito) y criterio propio
  de accesibilidad.

## Qué no vamos a hacer

- **No importar en masa la base de OpenHistoricalMap**, aunque sea CC0: traería
  ruido y una deuda de conflación impagable; la usamos como fuente puntual.
- **No comprar ni copiar la base de GeaCron** («All Rights Reserved»), ni el
  contenido Premium de TimeMaps, ni el código de Grapher (OWID).
- **No adoptar el modelo de «instantáneas» con veinte fechas clave**: nuestro
  eje es continuo, para poder leer apogeos y declives.
- **No convertirnos en una wiki editable** al estilo Chronas u OHM: no hay
  comunidad detrás, y eso exigiría cuentas, moderación y validación.
- **No tomar Wikipedia o Wikidata como fuente masiva del catálogo**: se usarán
  como identificadores y referencias, pero el texto y las fechas deben traer
  fuente y confianza propias.
- **No renderizar miles de marcadores en WebGL** al estilo Chronas o
  Histography: seguimos con SVG, con colocación de etiquetas y densidad elegida
  por el usuario.
- **No depender de la lengua inglesa** ni limitarnos a una sola fuente, como le
  pasó a Histography.
- **No inventar precisión histórica**: los polígonos son esquemáticos y las
  fechas aproximadas se marcan como tales.

## Fuentes consultadas

- **Chronas:** [chronas.org](https://chronas.org/), [old.chronas.org](https://old.chronas.org/), [play.chronas.org](https://play.chronas.org/?pos=37.000000%2C37.000000%2C2.50&year=1000), [chronas-api](https://github.com/Chronasorg/chronas-api), [chronas-frontend](https://github.com/Chronasorg/chronas-frontend), [eLearningInside (2019)](https://news.elearninginside.com/chronas-map-of-history-50-million-data-points/).
- **OpenHistoricalMap:** [openhistoricalmap.org](https://www.openhistoricalmap.org/), [export](https://www.openhistoricalmap.org/export), [api](https://api.openhistoricalmap.org/), [Wikipedia](https://en.wikipedia.org/wiki/OpenHistoricalMap), [OSM US](https://openstreetmap.us/our-work/charter-projects/openhistoricalmap/), [OSM Wiki](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Browsing), [esquema de fechas en la URL](https://forum.openhistoricalmap.org/t/url-time-specification/184), [openhistoricalmap-embed](https://github.com/OpenHistoricalMap/openhistoricalmap-embed), [artículo CHI 2022](https://doi.org/10.1145/3557919.3565811).
- **TimeMaps / TimeMapper:** [timemaps.com](https://timemaps.com/), [uso del TimeMap](https://timemaps.com/using-timemap-world-history/), [historia](https://timemaps.com/history/), [timemapper.okfnlabs.org](https://timemapper.okfnlabs.org/), [okfn/timemapper (MIT)](https://github.com/okfn/timemapper), [OKFN Labs](https://okfnlabs.org/blog/2013/10/11/timemapper.html).
- **GeaCron:** [what is GeaCron](http://geacron.com/whatisgeacron/), [vector maps](http://geacron.com/vector-maps/), [assets](http://geacron.com/assets/assets.html), [home](http://geacron.com/home-en/), [tabla de versiones](https://sus.geacron.com/map/atlas/php/table_vs.html).
- **Histography:** [histography.io](https://www.histography.io/), [Smashing Magazine](https://www.smashingmagazine.com/2016/09/interview-with-matan-stauber/), [Adobe](https://blog.adobe.com/en/publish/2015/12/03/data-meets-design), [matanstauber.com](http://matanstauber.com).
- **Our World in Data:** [ourworldindata.org](https://ourworldindata.org/), [FAQ](https://ourworldindata.org/faqs), [teaching](https://ourworldindata.org/teaching), [rediseño de Grapher](https://ourworldindata.org/redesigning-our-interactive-data-visualizations), [Chart API](https://docs.owid.io/projects/etl/api/chart-api/), [launching data insights](https://ourworldindata.org/launching-data-insights).

## Datos no verificados

Quedan **sin verificar**: la cobertura temporal exacta actual de Chronas; la
licencia del atlas de TimeMaps (su contenido Premium es de pago) y la licencia
pública de Histography (no se ha encontrado declaración); las fuentes que
GeaCron cita para cada frontera; y el número de gráficos de OWID.
