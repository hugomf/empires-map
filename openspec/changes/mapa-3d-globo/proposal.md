# Proposal

## Why

El mapa actual es 2D (SVG con d3-geo). Los usuarios quieren explorar la historia mundial en un globo 3D real: rotar la Tierra, hacer zoom suave, ver la curvatura, y entender mejor las relaciones espaciales entre imperios distantes (p.ej. Roma y Han, o los virreinatos americanos y la metrópoli). Un globo 3D mejora la comprensión geográfica y la inmersión sin perder la precisión histórica del atlas actual.

## What Changes

- **Nueva capacidad**: Renderizado del mapa en un globo 3D (WebGL/Three.js) manteniendo **paridad visual exacta** con el mapa 2D actual.
- **Nueva capacidad**: Controles de cámara 3D (rotar, zoom, pan) con inertias y límites.
- **Modificación**: `atlas-mapa` — el componente `MapaAtlas` pasa de SVG a Three.js; la API pública (props, callbacks) se mantiene compatible.
- **Modificación**: `territorios` / `paises-actuales` / `religiones` / `cronologia` — los datos siguen igual; solo cambia la proyección y el renderizado.
- **Nueva dependencia**: `@react-three/fiber`, `three`, `@react-three/drei` (justificado en design.md).
- **Fuera de alcance**: VR/AR, relieve topográfico, clima, simulación de trayectorias, exportación de video.

## Capabilities

### New Capabilities

- `mapa-3d/globo`: Renderizado del atlas histórico en una esfera 3D con WebGL. Incluye: geometría de tierras/territorios/países proyectada a esfera, materiales con colores de fase/identidad/tinte religioso, picking (hover/click), etiquetas en 3D (billboarding), controles de cámara orbitada, leyenda y rosa de los vientos adaptadas a 3D.

### Modified Capabilities

- `atlas-mapa`: El componente principal `MapaAtlas` cambia su implementación interna de SVG a Three.js, pero su contrato (props, eventos, comportamiento visible) se preserva. Los requisitos de renderizado 2D se mueven a escenarios de "modo 2D" (legacy) y los nuevos escenarios 3D cubren la paridad.
- `territorios`: Los polígonos históricos ahora se triangulan y proyectan a la esfera; la validación de geometría (auto-intersecciones, anillos) se refuerza.
- `paises-actuales`: Países modernos se renderizan como capa sobre la esfera con la misma lógica temporal (formación ≤ año).

## Impact

**Código afectado:**
- `src/components/MapaAtlas.tsx` — reescritura completa (~600 líneas)
- `src/lib/geo.ts` — nueva función `construirGlobo()` que devuelve geometrías 3D (BufferGeometry) en lugar de paths SVG
- `src/lib/dominio.ts` — sin cambios lógicos, solo se consumen los mismos colores/filtros
- `src/styles/app.css` — nuevos estilos para canvas WebGL, controles 3D, tooltips 3D
- `package.json` — dependencias Three.js / R3F

**Datos:** No cambian `datos/*.json`. La validación (`npm run validate`) necesita comprobar que los polígonos son triangulables (earcut) y no tienen auto-intersecciones en 3D.

**Performance:** Objetivo 60fps en escritorio con ~2000 territorios. Requiere instancing/merged geometries para territorios, culling de frustum, y LOD para etiquetas.