# Mejorar navegación, accesibilidad y estados vacíos

## Why

El atlas ya cubre el núcleo histórico, pero la navegación fina se queda corta: la cronología no se puede ampliar, el enlace compartido no conserva filtros ni capas, las etiquetas del mapa no se pueden dosificar y los estados vacíos no siempre ofrecen una salida. En móvil y con teclado la experiencia tampoco está a la altura.

## What Changes

- Zoom y paneo temporal en la cronología, con vista general y detalle.
- Enlace compartido con año, civilización, filtros, capas e idioma.
- Control de densidad de etiquetas del mapa (automática, todas, ninguna).
- Estados vacíos con acciones para limpiar búsqueda o filtros.
- Navegación por teclado y lectores de pantalla en mapa, cronología y paneles.
- Objetivos táctiles y gestos compatibles con móvil.
- Documentar la comparación con Chronas, OpenHistoricalMap, TimeMaps, GeaCron, Histography y Our World in Data.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `atlas-mapa`: enlace completo, densidad de etiquetas, accesibilidad y táctil.
- `cronologia`: zoom temporal y navegación por teclado.
- `catalogo`: acciones en los estados vacíos.

## Impact

- `src/App.tsx`, `src/components/MapaAtlas.tsx`, `src/components/Cronologia.tsx`, `src/components/Riel.tsx`
- `src/lib/dominio.ts`, `src/lib/tiempo.ts`
- `src/styles/app.css`
- `docs/comparativa.md` (nuevo, si se acepta)
- `openspec/specs/atlas-mapa/spec.md`, `openspec/specs/cronologia/spec.md`, `openspec/specs/catalogo/spec.md`
