# Pendientes · Crónica de Imperios

Registro de requisitos pedidos en sesión, con estado. Actualizado al cierre de cada tanda.

**Leyenda:** ✅ hecho · 🟡 en curso · ⬜ pendiente · ⏸️ en espera de criterio

> **Migrado a OpenSpec el 21/10/2026.** La fuente de verdad es `openspec/`.
> Este documento queda como referencia histórica; no lo uses para planificar.
> El estado real de cada tarea está en `openspec/changes/*/tasks.md`.
>
> | Bloque | Destino en OpenSpec |
> |---|---|
> | 1. Núcleo del atlas | `specs/atlas-mapa`, `specs/cronologia`, `specs/catalogo` |
> | 2. Territorios | `specs/territorios` + `changes/add-jerarquia-territorial` |
> | 3. Catálogo y datos | `specs/datos` + `changes/add-paises-actuales` (3.9) |
> | 4. Cultura y religión | `changes/add-religiones`, `changes/add-cultura-material` |
> | 5. Navegación y presentación | `changes/mejorar-experiencia` |
> | 6. Multimedia | `changes/add-musica-ambiental` |
> | Deuda técnica | `changes/fix-conectar-datos` |

---

## 1. Núcleo del atlas

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 1.1 | Mapa mundial + línea de tiempo desplazable (5000 a.C. → hoy) | ✅ | Scrubber, reproductor, atajos `←`/`→`/espacio |
| 1.2 | Mostrar qué regiones existían y en qué periodo prosperaban | ✅ | Filtros por tipo y región; curva de vitalidad |
| 1.3 | Cúspide y decadencia de cada civilización | ✅ | `apogeo` / `declive`; sombreado y rayado en el mapa y el Gantt |
| 1.4 | Imperios modernos (Estados Unidos,和应用) | ✅ | 149 civilizaciones, de Sumer a 2026 |
| 1.5 | Culturas generales (persas, fenicios, filisteos, griegos…) | ✅ | Incluidas desde el principio |

## 2. Territorios (el punto que más se ha iterado)

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 2.1 |  ✅ | ✅ | 281 polígonos; el 99 % de las civilizaciones tiene territorio |
| 2.2 | Las doce tribus de Israel | ✅ | 9 polígonos con nombre (Judá, Benjamín, Efraín, Manassé, Neftalí, Galaad…) |
| 2.3 | Las ciudades fenicias (Tiro, Sidón, Biblos, Arwad) | ✅ | Costa + 4 ciudades |
| 2.4 | La pentápolis filistea (Gaza, Ascalón, Yavné, Gath, Ecrón) | ✅ | 5 ciudades |
| 2.5 | Minoicos, micénicos, etruscos, hititas, sumer, asirios, babilonios | ✅ | |
| 2.6 | Imperio español: virreinatos de América con fechas | ✅ | Nueva España (1535), Perú (1542), Nueva Granada (1717), Río de la Plata (1776), Filipinas (1565) |
| 2.7 | Portugal y Gran Bretaña: posesiones de ultramar | ✅ | Brasil, Angola, Mozambique, Goa; India, Canadá, Australia, Sudáfrica, Egipto |
| 2.8 | Imperio de Alejandro Magno: conquistas fechadas | ✅ | Grecia (338), Egipto (332), Persia (330), Asia Central (328), India (326) |
| 2.9 |  ✅ | 🟡 | Los califados, sasánidas, safávidas y persas ya tienen territorio; Persia e Irak se ven |
| 2.10 |  ✅ | 🟡 | Campo `nivel` + `superior`: virreinatos, provincias romanas, satrapías y emiratos |
| 2.11 |  ✅ | 🟡 | Las fronteras modernas quedan sólo como contorno fantasma |

## 3. Catálogo y datos

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 3.1 |  ✅ | ✅ | `datos/*.json` + `scripts/validar.mjs` (integridad) |
| 3.2 | Detección de **polígonos rotos** en el build | ✅ | Anillos sin cerrar, <4 puntos, coordenadas fuera de rango, auto-intersecciones |
| 3.3 |  ✅ | ✅ | El validador rechaza CJK/cirílico y avisa de textos truncados |
| 3.4 | Civilizaciones menores: navajo, tarahumaras, purépecha | ✅ | |
| 3.5 | Pueblos aborígenes australianos (kamilaroi, tiwi…) | ✅ | + «Australianos aborígenes» como cultura de 45 000 a.C. |
| 3.6 | Pueblos africanos menores (san, khoi, fulani, hausa, yoruba, igbo, fon, swahili, shona, luba, maasai, beréberes, tuareg) | ✅ | |
| 3.7 | Vikingos | ✅ | Escandinavia, Islandia/Groenlandia, Normandía y Dublín, 750–1066 |
| 3.8 | Huecos menores (búlgaros, húngaros, lituanos, polacos, tibet, majapahit, maratha, sikh, himyaritas, wari, chimú, xiongnu, jurchenes, liao, benín, coreas) | ✅ | Añadidos por tandas |
| 3.9 | 🟡 | 🟡 | Panel de los 160 Estados actuales hecho (`Estados.tsx`); falta `datos/estados-actuales.json`, la capa en el mapa y su validación |

## 4. Cultura y religión

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 4.1 |  🟡 | 🟡 | 30 artefactos con icono; faltan 120 civilizaciones y el campo `escritura` |
| 4.2 |  ✅ | 🟡 | 72 religiones + 38 deidades ya se ven en la ficha |
| 4.3 | **Zoroastrismo** como perspectiva religiosa de Persia | ✅ | Registrado para aqueménidas, partos, sasánidas y safávidas |
| 4.4 |  ✅ | 🟡 | Roma muestra politeísmo (hasta 380) → cristianismo (desde 380) |

## 5. Navegación y presentación

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 5.1 | Línea de tiempo como elemento central (no un control más) | ✅ | Riel superior con eras, marea y playhead + Gantt inferior |
| 5.1b | **Ventana temporal ampliable** con minimapa | ✅ | Rueda para ampliar, minimapa arrastrable, el Gantt sigue la ventana, el cabezal la arrastra |
| 5.2 | Lectura del Gantt: vida / cúspide / decadencia | ✅ | |
| 5.3 | Enlace profundo a un momento (`#1492/espana`) | ✅ | |
| 5.4 |  ⬜ | ⬜ | Pendiente de la revisión comparativa (`docs/comparativa.md` no existe) |
| 5.5 | Leyenda de lectura del mapa | ✅ | Cartela con la clave |

## 6. Multimedia

| # | Requisito | Estado | Notas |
|---|---|---|---|
| 6.1 |  ✅ | ⬜ | Banda sonora original sintetizada con Web Audio (♪ en la cabecera) |

---

## Deuda técnica

- La app ya lee `datos.generados.ts` (es) y `datos.en.generados.ts` (en); los `.ts` antiguos son sólo *shims*.
- `npm run validate` se ejecuta antes de `dev` y de `build`: un catálogo roto no llega al navegador.
- El validador también rechaza la mezcla de idiomas (el español con restos de
  inglés y al revés) y los caracteres de código sueltos: una traducción
  automática defectuosa ya no puede colarse en el catálogo.
- El catálogo inglés está completo (8 ficheros) y sincronizado con el español.
- Pendiente: `scripts/añadir-civilizaciones.mjs` quedó inservible; los altas
  deben hacerse sobre `datos/` (patrón: `scripts/completar-cobertura.mjs`).
- El eje temporal tiene suelo en 5000 a.C. (`ANIO_MIN`): las chrono más profundas (San, aborígenes) se recortan a la izquierda.

- El catálogo inglés se carga bajo demanda (chunk aparte): el bundle inicial baja de 1,6 MB a 1,37 MB y el español viaja siempre en línea.

- La fase «muerte» pasó a significar sólo «ya desapareció del calendario»; una civilización en sus últimos 120 años se lee como decadencia.

## Herramientas de datos

| Script | Qué hace |
|---|---|
| `scripts/validar.mjs` | Valida el catálogo y genera el bundle que consume la app |
| `scripts/completar-cobertura.mjs` | Da polígono a las civilizaciones que aún no lo tenían |
| `scripts/reparar.mjs` | Recorta fechas, limpia textos y arregla anillos (ES y EN) |
| `scripts/reparar-texto.mjs` | Repara los textos dañados por una traducción automática |
| `scripts/detectar-ingles.mjs` | Señala mezclas de idiomas en el catálogo (`es` o `en`) |
| `scripts/autofix-geom.mjs` | Cierra anillos abiertos y avisa de auto-intersecciones |
| `scripts/preview-mapa.mjs` | Volca el mapa de un año a SVG, para revisar sin navegador |
| `scripts/capturas.mjs` | Capturas de pantalla de la app (Playwright) |
| `scripts/actualizar-tareas-openspec.mjs` | Marca en `tasks.md` lo ya implementado |
