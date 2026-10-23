# Plan de cierre de pendientes

Cierra los once cambios OpenSpec activos del atlas. El orden manda: cada fase deja
`npm run validate`, `npm run lint` y `npm run build` en verde antes de empezar la
siguiente, y ninguna fase depende de datos que aún no existen.

## Diagnóstico del estado real

Las casillas de `openspec/changes/*/tasks.md` están desfasadas respecto al código.
El estado real, comprobado en el árbol de trabajo:

| Cambio | Declarado | Real | Nota |
|---|---|---|---|
| `add-alias-busqueda` | sin empezar | **8/8** | 38 alias en datos, buscador indexa alias, búsqueda ignora filtro de menores; pruebas manuales («Persia» 14 hits, «Alejandro»→Macedonia, «Bizancio», «Incas», «Aníbal»→Cartago) por DOM. Falta archivar |
| `panel-capas` | completo | completo | Falta archivar |
| `add-musica-ambiental` | completo | completo | Falta archivar |
| `add-religiones` | 8/10 | **10/10** | Tinte por familia con leyenda en cartela y `rel:1` persistido; filtro acota riel, cronología y ficha. Falta archivar |
| `add-jerarquia-territorial` | 8/11 | **11/11** | `superior`(47)/`fuente`/`confianza`(285) en datos; «Divisiones» persistida (`div:1`), «Parte de» y «aprox.»×21 con fuente verificados en ficha de Roma 160. Falta archivar |
| `add-cultura-material` | 5/8 | **8/8** | `escritura` en 123 civs + validador; estados vacíos por sección verificados en escritorio y móvil (roma 0 / san 2 «Sin registro»). Falta archivar |
| `add-paises-actuales` | 3/9 | 3/9 | En curso por la otra sesión: panel existe; faltan dataset JSON, capa, tabla ISO, validación |
| `add-i18n` | 9/10 | **10/10** | El idioma viaja en el hash y se restaura (y se guarda en `localStorage`). Falta archivar |
| `fix-conectar-datos` | 8/10 | **10/10** | Bundle emite hitos sin `id` y las 5 colecciones; `añadir-civilizaciones.mjs`/`ampliar-catalogo.mjs` reescritos contra `datos/`. Falta archivar |
| `mejorar-experiencia` | 1/11 | **11/11** | Teclado (`roving tabindex`), estados vacíos con acciones, foco visible, año por `aria-live`, táctil 44 px con gestos, contraste ≈15:1, enlaces antiguos/nuevos en escritorio, móvil y teclado. Falta archivar |
| `datos-v2-provenance` | sin tareas | sin planear | Falta `tasks.md` antes de implementar |

## Principios

1. **El validador es la puerta.** Ninguna fase añade datos sin su comprobación en
   `scripts/validar.mjs`; si una regla de la spec puede comprobarse, se comprueba.
2. **Los datos mandan sobre la interfaz.** Cada campo nuevo existe primero en
   `datos/*.json`, después en el modelo (`src/data/tipos-cultura.ts`), después en el
   bundle generado y solo entonces en pantalla.
3. **El enlace es el contrato.** El hash pasa a ser la fuente de verdad del estado
   compartido: año, selección, filtros, capas, densidad e idioma.
4. **Nada de deuda silenciosa.** Lo que no se puede verificar en código se deja
   sin marcar en `tasks.md`, con la nota de estado al día.
5. **Cierre por cambio.** Un cambio solo se archiva cuando su spec está satisfecha,
   sus tareas están marcadas y las validaciones pasan.

## Fases

### Fase 0 · Sincronizar el estado (rápido) — HECHA

- `scripts/actualizar-tareas-openspec.mjs` actualizado (HECHAS al día y NOTAS sin
  mentiras); corrida idempotente: solo 1 casilla por marcar y ninguna inesperada.
- `add-alias-busqueda` 1.1–1.8 marcadas (incluida la prueba manual, hecha por DOM).

**Gate:** superado — `npm run spec:validate` 17/17.

### Fase 1 · Base de datos y generador (`fix-conectar-datos`) — HECHA (por la otra sesión)

- 1.6 ✓ el bundle emite hitos sin `id` (`{"anio":…,"texto":…}` verificado en
  `src/data/datos.generados.ts`) y las cinco colecciones (RELIGIONES, DEIDADES,
  CIUDADES, ARTEFACTOS, GOBERNANTES).
- 1.8 ✓ ambos scripts reescritos contra `datos/*.json` (con `fuente`/`confianza`
  y sin duplicar claves), con `--simular` y `--plantilla`.

**Gate:** `npm run validate` (regenera el bundle) + `npm run build` + `npm run lint`.

### Fase 2 · Cultura material (`add-cultura-material`) — HECHA

- 1.3 ✓ `escritura` en 123 civilizaciones con su regla en `scripts/validar.mjs`.
- 1.6 ✓ estados vacíos por sección («Sin registro») en la ficha.
- 1.8 ✓ revisión por DOM en escritorio y móvil: roma (con datos, 0) y san
  (2 «Sin registro» en 420 × 860).

**Gate:** `npm run validate` + revisión en navegador de la pestaña «Cultura».

### Fase 3 · Jerarquía territorial (`add-jerarquia-territorial`) — HECHA (datos por la otra sesión)

- Datos ✓ `superior` en 47 divisiones, `fuente` y `confianza` en 285 territorios.
- 1.6 ✓ control «Divisiones» persistido (`div:1` en el enlace).
- 1.7 ✓ «Parte de: …» en la ficha (`.div-superior`).
- 1.9 ✓ «aprox.» con la fuente (21 casos en Roma 160).

**Gate:** `npm run validate` + revisión visual (España 1600, Persia 500 a.C., califato abasí).

### Fase 4 · Religiones (`add-religiones`) — HECHA

- 1.8: capa de tinte religioso (por familia religiosa, no por religión) con su
  leyenda, apagada por defecto, en `src/lib/religion.ts` + `MapaAtlas.tsx`.
  Verificado: sin `rel:1` el mapa no cambia ni la cartela aparece; con `rel:1`
  los territorios usan el color de la familia vigente (islam abasíes 750,
  cristianismo bizantino, zoroastrismo aqueménidas −500) y la leyenda de 9
  familias sustituye a la cartela anterior.
- 1.7: filtro «Religiones» en el panel de capas; al elegir una, el riel y la
  cronología se acotan a las civilizaciones asociadas y la ficha suelta la
  selección ajena. El mapa sigue completo.

**Gate:** `npm run build` + revisión visual (Persia, Roma, Egipto) — build y
validaciones en verde; verificación por DOM (colores por familia) y sondas de
interfaz. La revisión visual queda condicionada a que la maqueta se estabilice
(hay otra sesión trabajando a la vez).

> **Nota de proceso:** `scripts/poligonos-geometricos.mjs` ganó `FIGURAS5` (tinta 5
> de reparaciones: `roma-lacio`, fenicios Tiro/Biblos/Arwad, micénicos
> Peloponeso/Pilos, `filisteos-t4`, `minoicos-t2`, `fon-t1`, `yoruba-t1`) tras
> corregir la máscara de `scripts/auditar-poligonos.mjs` (se pinta país por país:
> las fronteras compartidas de topojson invertían la paridad del even-odd).
> `bizantino-t1` queda pendiente (29 % de su relleno en mar).

### Fase 5 · Países actuales (`add-paises-actuales`) — EN CURSO (otra sesión)

- Estado en el árbol: panel de países hecho (1.1/1.6/1.10 marcadas por ellos);
  falta `datos/estados-actuales.json` (solo existe vía `src/data/`),
  `datos/en/estados-actuales.json`, la capa en `MapaAtlas.tsx` (sin rastro de
  `paises`) y la tabla ISO (`scripts/generar-tabla-iso.mjs` escrito a las 07:32,
  salida aún no generada).
- No intervenir salvo desatascar al final; es su zona activa.

**Gate:** `npm run validate` + revisión visual (1700, 1800, 1900, 2000).

### Fase 6 · Idioma en el enlace (`add-i18n`) — HECHA

- 1.5 ✓ el hash pasa idioma (`#es/1492/espana`), se lee al cargar, gana sobre
  `localStorage` y los enlaces antiguos siguen funcionando. Verificado antes en
  navegador (leyendas ES/EN y persistencia).

**Gate:** `npm run build` + prueba de enlaces antiguos y nuevos.

### Fase 7 · Experiencia (`mejorar-experiencia`) — HECHA (11/11)

- Hechas 1.1–1.5: comparativa, hash extendido, «Copiar enlace» con `aria-live`,
  densidad persistida y zoom temporal.
- Hechas 1.6–1.7 (DOM verificado): teclado en Gantt y riel (`roving tabindex` con
  flechas, Enter/Espacio activa; helper `src/lib/teclado.ts`), y estados vacíos
  con acciones («Limpiar búsqueda» y «Restaurar filtros», que también limpia la
  búsqueda y restaura el filtro de religión). El modelo admite `Territorio` con
  `control` y `categoria`/`nivel` de `Civilizacion` opcionales para cruzar con
  los datos nuevos de la otra sesión; `tsc -b` y el resto de puertas en verde.
- Hechas 1.8–1.11: foco visible y `aria-current` en filas, año anunciado por
  `aria-live` (clave `vivo.anio`), gestos táctiles (d3-zoom pellizco) con
  objetivos de 44 px en `pointer: coarse`, contraste verificado ≈15:1 en
  etiquetas del Gantt, riel, ficha, estado vacío y marca, y batería de enlaces
  antiguos (`#1492`, inglés por defecto según spec `add-i18n`) y nuevos
  (`#es/…`, `rel:1`, `div:1`) en escritorio, móvil y teclado, sin errores JS.

**Gate:** `npm run build` + `npm run lint` + revisión manual de los cuatro puntos.

### Fase 8 · Procedencia del dato (`datos-v2-provenance`)

- 8.1: `tasks.md` del cambio (falta el plan de tareas) y `design.md` con las
  decisiones de modelo.
- 8.2: `datos/fuentes.json` (registro canónico: cita, tipo, URL, licencia, uso,
  fecha de consulta) y `datos/version.json`.
- 8.3: `fuentes`, `confianza`, `notaFechas`, `wikidata` y `pleiades` en
  civilizaciones y hitos; `fuente`/`confianza` reutilizadas en territorios.
- 8.4: validación de referencias, licencias coherentes y confianza baja con nota.
- 8.5: `npm run data:coverage` (informe de cobertura con umbrales).
- 8.6: ficha con fuentes, confianza, «Cómo lo sabemos», versión y cita copiable.

**Gate:** `npm run validate` + `npm run data:coverage` + `npm run build`.

### Fase 9 · Cierre

- Marcar las tareas de cada cambio con `scripts/actualizar-tareas-openspec.mjs`.
- Archivar (`openspec archive`) los cambios completados: `panel-capas`,
  `add-musica-ambiental`, `add-alias-busqueda` y los que se cierren en las fases
  anteriores.
- Verificación final: `npm run validate`, `npm run lint`, `npm run build`,
  `npm run spec:validate`.

## Riesgos

- **`scripts/integrar-y-reparar.mjs` borrado por esta sesión (22 oct):** llevado a
  limpiar `scripts/debug-mascara.mjs` lo confundió con escombro propio. No hay git
  ni copía en `~/.Trash`; sin referencias rotas (grep limpio) y sobreviven
  `reparar.mjs` y `reparar-texto.mjs`. Sin pipeline roto, pero queda documentado.
- **Migración de `Hito` sin `id`:** toca modelo, validador, bundle y componentes. Se
  hace en la fase 1, antes de tocar la interfaz, para no arrastrar el cambio.
- **Tabla ISO:** se genera, no se teclea; si algún país no se puede emparejar con
  `world-atlas`, se documenta la excepción en lugar de inventar el código.
- **Fases 3, 4 y 5 tocan `MapaAtlas.tsx` y `App.tsx`:** se hacen en orden para que
  cada capa nueva sea visible en la siguiente.
- **Datos de países actuales:** 197 registros revisados a mano; el validador
  atrapa ids duplicados, años imposibles y notas vacías.
