# Design

## Context

Mapa actual: `MapaAtlas.tsx` (~670 líneas) usa SVG + d3-geo (proyección Natural Earth 1) + d3-zoom para pan/zoom 2D. Los datos geográficos vienen de `construirMapa()` en `geo.ts` que devuelve paths SVG (`d` strings) para tierras, graticula, fronteras, regiones, territorios, países y ciudades.

Stack: React 19 + Vite + TypeScript + d3-geo + d3-zoom + d3-selection + d3-transition.

## Goals / Non-Goals

**Goals:**
- Globo 3D con paridad visual exacta al mapa 2D actual
- Controles de cámara orbitada (rotar, zoom, pan) con inercia
- Misma API de componente (`MapaAtlas` props/callbacks) para compatibilidad
- Rendimiento ≥ 55 fps en escritorio con ~2000 territorios
- Modo 2D/3D intercambiable sin pérdida de estado
- Validación de geometría 3D integrada en `npm run validate`

**Non-Goals:**
- Relieve topográfico, batimetría, texturas satelitales
- VR/AR, WebXR
- Animaciones de trayectorias históricas
- Exportación de video/imagen del globo
- Cambio en formato de datos (`datos/*.json`)

## Decisions

### 1. Motor 3D: React Three Fiber (R3F) + Three.js + @react-three/drei

**Rationale:** R3F es el estándar de facto para Three.js en React. Declarativo, integra con ciclo de vida de React, tree-shaking, y `@react-three/drei` provee `OrbitControls`, `Html` (para overlays 2D), `Text` (etiquetas 3D), `Billboard`, y helpers de performance (`Instances`, `mergeGeometries`).

**Alternativas consideradas:**
- Three.js vainilla: más control pero más boilerplate, difícil integrar con React state
- Babylon.js: buen motor pero menos ecosistema React, curva de aprendizaje
- Deck.gl: bueno para capas geo pero menos flexible para globo interactivo custom
- CesiumJS: excesivo (pesado, licencia), diseñado para geoespacial masivo

### 2. Proyección: Esfera unitaria (radio = 1) con coordenadas esféricas

**Rationale:** Lat/lon → (x,y,z) en esfera unitaria es matemáticamente simple y evita distorsiones de proyección plana. La conversión:
```ts
const latRad = lat * Math.PI / 180;
const lonRad = lon * Math.PI / 180;
const x = Math.cos(latRad) * Math.sin(lonRad);
const y = Math.sin(latRad);
const z = Math.cos(latRad) * Math.cos(lonRad);
```
Esto mapea directo a vértices de Three.js. El radio visual se controla con escala de la malla Tierra.

**Alternativa:** Proyección equirectangular en plano + displacement shader. Rechazada: requiere shader custom, más complejo para picking y etiquetas.

### 3. Geometrías: BufferGeometry + Instancing para territorios

**Problema:** ~2000 territorios × ~50 triángulos c/u = 100k triángulos. Crear 2000 `Mesh` separados mata el rendimiento (draw calls).

**Solución:**
- **Tier 1 (Territorios):** Un solo `InstancedMesh` por civilización viva. Cada instancia = un territorio. Atributos de instancia: `color`, `opacity`, `dashPattern`, `selected`, `hover`. Vertex shader aplica color/opacidad/dash. Frustum culling automático de Three.js.
- **Tier 2 (Países actuales):** `LineSegments` único con `BufferGeometry` merged (todos los contornos en un geometry). Colores por vértice para selección.
- **Tier 3 (Ciudades):** `InstancedMesh` de `CircleGeometry` (billboard via vertex shader) o `Points` con shader custom.
- **Tier 4 (Tierra/Graticula/Fronteras):** `Mesh`/`LineSegments` estáticos, un solo draw call cada uno.

**Triangulación:** `earcut` (ya usado indirectamente por d3-geo) para cada anillo → triángulos en plano → proyectar vértices a esfera. Cachear resultados en `construirGlobo()`.

### 4. Materiales: MeshBasicMaterial + ShaderMaterial custom

- **Territorios:** `ShaderMaterial` con uniforms para `uColor`, `uOpacity`, `uDashPattern`, `uSelected`, `uHover`. Vertex shader maneja dash pattern via `gl_InstanceID` y atributos. Fragment shader aplica color + brillo (emissive) para selección.
- **Países:** `LineBasicMaterial` con `vertexColors` para selección/hover.
- **Tierra:** `MeshBasicMaterial` con `map` (textura procedural simple o color sólido + graticula como `LineSegments`).
- **Etiquetas:** `@react-three/drei` `Text` (SDF) o `Html` overlay 2D. Ver decisión 6.

### 5. Etiquetas: Overlay 2D (HTML/CSS) posicionado vía proyección 3D→2D

**Rationale:** Texto 3D real (SDF/Three-mesh-text) tiene problemas: rendimiento (miles de letras), legibilidad en curvas, anti-aliasing, colisión con geometría. Overlay 2D resuelve todo: mismo algoritmo de colocación que 2D (`colocarRotulos`), mismo CSS, mismo billboarding natural (HTML siempre frente a cámara), accesibilidad nativa.

**Implementación:**
- `construirGlobo()` devuelve anclas 3D `[x,y,z]` para cada etiqueta
- En render frame: `camera.project(vector3)` → coordenadas NDC → coordenadas pantalla → posicionar `<div class="etiqueta-3d">` con `transform: translate3d(x,y,0)`
- `colocarRotulos()` recibe anclas en pantalla (x,y) y funciona idéntico a 2D
- Etiquetas son React components fuera del Canvas R3F, sincronizadas via `useFrame`

**Alternativa:** `Text` de drei con billboarding. Rechazada por rendimiento y complejidad de anti-colisión en 3D.

### 6. Controles de cámara: `OrbitControls` de drei + límites custom

```tsx
<OrbitControls
  enableDamping={true}
  dampingFactor={0.05}
  minDistance={1.2}   // radio Tierra + margen
  maxDistance={50}    // ~50 km altitud
  minPolarAngle={0.01}
  maxPolarAngle={Math.PI - 0.01}
  enablePan={true}
  // Pan solo en modo "pan" (botón derecho / 2 dedos)
/>
```
Añadir botón "Vista global" que anima `camera.position` y `controls.target` a `(0, 0, 3)` con `lerp` en `useFrame`.

### 7. Picking: Raycasting nativo de Three.js

```tsx
const raycaster = new Raycaster();
raycaster.setFromCamera(pointer, camera);
const intersects = raycaster.intersectObjects(pickableMeshes);
```
- Territorios: `InstancedMesh` → `intersect.instanceId` → mapear a `territorioId` → `civId`
- Países: `LineSegments` → `intersect.index` / 2 → mapear a `paisId`
- Ciudades: `InstancedMesh`/`Points` → `intersect.instanceId` → `ciudadId`

Callbacks `onHover`/`onSeleccionar` idénticos a 2D.

### 8. Sincronización 2D ↔ 3D (estado compartido)

**Estado compartido (URL + React context):**
- `anio`, `seleccion`, `hover`, `filtros`, `capaVisible`, `modoColor`, `capaReligiones`, `capaPaises`, `paisSeleccionado`, `densidadEtiquetas`, `modoVista` ('2d' | '3d')

**Conversión de cámara 2D → 3D:**
- Zoom 2D (scale `k`) → distancia cámara 3D: `distance = 3 / k` (aprox)
- Centro 2D `[cx, cy]` en píxeles → lat/lon via `projection.invert([cx, cy])` → `controls.target` en esfera

**Conversión 3D → 2D:**
- `controls.target` (vector3 en esfera) → lat/lon → `projection([lon, lat])` → `[cx, cy]`
- `camera.distance` → `k = 3 / distance`
- `d3.zoomIdentity.translate(cx, cy).scale(k)`

### 9. Validación de geometría 3D en `npm run validate`

Extender `scripts/validar-datos.mjs`:
- Para cada territorio/país: triangulación `earcut` → verificar sin errores
- Verificar no auto-intersección: bounding sphere test + edge-edge test (solo para polígonos complejos > 100 vértices)
- Verificar vértices finitos, no NaN
- Reportar territorios problemáticos con ID y error

### 10. Dependencias nuevas (package.json)

```json
{
  "dependencies": {
    "three": "^0.165.0",
    "@react-three/fiber": "^8.16.0",
    "@react-three/drei": "^9.108.0",
    "earcut": "^2.2.4"
  },
  "devDependencies": {
    "@types/three": "^0.165.0",
    "@types/earcut": "^2.1.4"
  }
}
```
**Justificación:** Three.js/R3F/drei son estándar de la industria para 3D en React. `earcut` es la librería de triangulación más usada (la que usa Mapbox, d3-geo internamente). Peso total ~400 KB gzipped (aceptable para app de mapa).

### 11. Estructura de archivos nueva

```
src/
├── components/
│   ├── MapaAtlas.tsx           # Wrapper que elige Mapa2D o Mapa3D
│   ├── Mapa2D.tsx              # MapaAtlas actual renombrado (legacy)
│   ├── Mapa3D.tsx              # Nuevo componente globo (R3F Canvas)
│   ├── mapa3d/
│   │   ├── Globo.tsx           # Escena principal (Tierra, territorios, países, ciudades)
│   │   ├── CamaraControles.tsx # OrbitControls + botones zoom/reset
│   │   ├── Etiquetas3D.tsx     # Overlay 2D para etiquetas (Html de drei)
│   │   ├── Leyenda3D.tsx       # Cartela + rosa vientos (overlay 2D)
│   │   ├── Picking3D.tsx       # Raycasting + callbacks
│   │   ├── shaders/
│   │   │   ├── territorio.vert
│   │   │   ├── territorio.frag
│   │   │   ├── ciudad.vert
│   │   │   └── ciudad.frag
│   │   └── hooks/
│   │       ├── useGloboGeo.ts  # Construye geometrías 3D desde datos
│   │       ├── useCameraSync.ts# Sincroniza cámara 2D↔3D
│   │       └── useEtiquetas3D.ts# Proyecta anclas 3D→2D + colocarRotulos
│   └── ui/
│       └── ModoVistaToggle.tsx # Botón 2D/3D en toolbar
├── lib/
│   ├── geo.ts                  # construirMapa() actual (2D)
│   ├── geo3d.ts                # NEW: construirGlobo() → geometrías 3D
│   └── dominio.ts              # Sin cambios
└── styles/
    └── mapa3d.css              # Estilos overlays, etiquetas, controles 3D
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| **Rendimiento con 2000+ territorios** | InstancedMesh + frustum culling + simplificación Douglas-Peucker + LOD (ocultar divisiones en zoom bajo). Profilear en CI con `npm run build -- --mode profile`. |
| **Etiquetas 2D parpadean al rotar** | `requestAnimationFrame` sync: `useFrame` en R3F actualiza posiciones etiquetas cada frame. Usar `transform: translate3d` para GPU compositing. |
| **Picking impreciso en bordes** | Raycaster con `threshold` pequeño; ampliar geometría de picking ligeramente (buffer 0.001 rad). |
| **Memoria GPU alta** | Mergear geometrías estáticas (tierra, graticula, fronteras). Liberar buffers al cambiar año (dispose). |
| **SSR/hidratación con R3F** | `Canvas` de R3F no soporta SSR nativo. Usar `<Canvas>` solo en cliente (`use client` en Next o dynamic import en Vite). En Vite/SPA no hay SSR, OK. |
| **Accesibilidad (a11y) en 3D** | Overlay 2D para etiquetas/leyenda = lectores de pantalla OK. Controles de teclado (Alt+flechas) para rotar. `aria-live` para anunciar región bajo cámara. |
| **Mobile: gestos conflictivos** | `OrbitControls` de drei detecta bien: 1 dedo = rotar, 2 dedos = zoom/pan. Botones UI tienen `touch-action: manipulation`. |
| **Cambio de dependencias** | Three.js/R3F son estables (semver, releases mensuales). Pinnear versiones exactas. |

## Migration Plan

1. **Fase 1 (Spike):** `geo3d.ts` con `construirGlobo()` que devuelve geometrías básicas (tierra + 1 territorio). Componente `Mapa3D` mínimo con `Canvas` + `OrbitControls` + picking básico.
2. **Fase 2:** Territorios con InstancedMesh + shaders + colores fase/identidad/religiones.
3. **Fase 3:** Países actuales + ciudades + etiquetas 2D overlay + leyenda/rosa.
4. **Fase 4:** Sincronización cámara 2D↔3D + toggle modo + persistencia URL.
5. **Fase 5:** Validación geometría 3D en `npm run validate` + tests visuales + performance.
6. **Fase 6:** Limpieza: renombrar `MapaAtlas` → `Mapa2D`, wrapper `MapaAtlas` elige según `modoVista`.

**Rollback:** Git revert del commit de integración. El modo 2D permanece intacto en `Mapa2D.tsx`.

## Open Questions

1. **Textura de tierra:** ¿Color sólido + graticula (actual) o textura procedural (ruido Perlin para relieve visual sutil)? Decidir en Fase 2.
2. **LOD para territorios:** ¿Ocultar divisiones (nivel='division') cuando `camera.distance > 10`? Definir umbrales en Fase 5.
3. **Animación de transición 2D↔3D:** ¿Crossfade de opacidad (300ms) o morph suave de proyección? Prototipar en Fase 4.
4. **Sombras/iluminación:** ¿`MeshBasicMaterial` (sin luz, más rápido) o `MeshStandardMaterial` con `HemisphereLight` para profundidad visual? Probar en Fase 2.