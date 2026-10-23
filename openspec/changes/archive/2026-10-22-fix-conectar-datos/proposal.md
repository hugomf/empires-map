# Conectar el catálogo generado y reparar el build

## Why

La migración de datos quedó a medias: `catalogo.ts` ya importa `datos.generados.ts`, pero `App.tsx`, `Cronologia.tsx`, `Ficha.tsx` y `MapaAtlas.tsx` siguen importando `CIVILIZACIONES` y `ANIO_MIN`/`ANIO_MAX` desde el catálogo antiguo. `npx tsc -b` falla y la aplicación no se puede compilar ni publicar. Además, los scripts de mantenimiento están suspendidos y los módulos `civilizations.ts`, `regions.ts` y `territorios.ts` siguen siendo la fuente real en el código.

## What Changes

- Exponer una API única de catálogo (`catalogo()`, `CATALOGOS`, constantes de rango) y migrar todos los componentes a ella.
- Unificar el modelo de tipos (`tipos-cultura.ts`) y eliminar la duplicidad con `types.ts`.
- Corregir los datos generados que no encajan con el modelo (`Hito` con `id`, territorios con `nivel`).
- Convertir `civilizations.ts`, `regions.ts` y `territorios.ts` en shims de reexportación o eliminarlos.
- Reescribir los scripts de importación suspendidos para que trabajen contra los JSON.
- Dejar `npm run validate`, `npx tsc -b` y `npm run build` en verde.

## Capabilities

### New Capabilities

Ninguna. Es una corrección de implementación; los requisitos ya están descritos en `atlas-mapa`, `catalogo`, `cronologia`, `datos` y `territorios`.

### Modified Capabilities

Ninguna. No cambia el comportamiento exigido, solo la forma de cumplirlo. Por eso el cambio declara `skip_specs: true`.

## Impact

- `src/App.tsx`, `src/components/*.tsx`, `src/data/catalogo.ts`, `src/data/types.ts`, `src/data/tipos-cultura.ts`
- `src/data/datos.generados.ts`, `src/data/datos.en.generados.ts`
- `scripts/*.mjs`
- `package.json` (si cambia el pipeline de generación)
