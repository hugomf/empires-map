# Panel de cultura material, ciudades y escritura

## Why

La ficha cuenta la historia política de cada civilización, pero no su cultura material: armas, cerámica, vasijas, artefactos, ciudades y escritura. La tabla `artefactos.json` existe vacía y la interfaz ya reserva una pestaña de cultura, así que el contenido no tiene dónde mostrarse.

## What Changes

- Completar el catálogo de artefactos con nombre, tipo, material, descripción e icono.
- Añadir la pestaña «Cultura» a la ficha con artefactos, ciudades y escritura.
- Registrar las ciudades históricas con su nombre actual y coordenadas.
- Añadir el sistema de escritura como campo opcional de cada civilización.
- Usar iconos SVG propios, sin depender de imágenes externas.
- Mostrar estados vacíos claros cuando falte contenido.

## Capabilities

### New Capabilities

- `cultura-material`: artefactos, ciudades, escritura y su presentación en la ficha.

### Modified Capabilities

Ninguna. La ficha consume el nuevo modelo, pero sus requisitos actuales no cambian.

## Impact

- `datos/artefactos.json`, `datos/ciudades.json` (nuevos)
- `src/data/tipos-cultura.ts`, `src/components/Ficha.tsx`, `src/lib/i18n.ts`
- `src/assets/` o un registro de iconos SVG
- `openspec/specs/cultura-material/spec.md`
