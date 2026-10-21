# Capa de países actuales y fechas de formación

## Why

El atlas histórico no responde a una pregunta básica: ¿cuándo se formó cada país actual? Además, mezclar Estados contemporáneos con imperios antiguos produce anacronismos. La interfaz ya tiene textos reservados para un panel de países, pero no existe el modelo ni los datos.

## What Changes

- Nuevo archivo `datos/estados-actuales.json` con código ISO, nombre, año de formación, tipo de proceso, nota y fuente.
- Modelo `PaisActual` y validación de fechas y códigos.
- Capa «Países actuales» independiente de las capas históricas.
- Regla de no pintar un país antes de su año de formación.
- Panel que explica el tipo de formación (independencia, unificación, constitución, reconocimiento, sucesión).
- Matices de fecha: «aprox.», «estado moderno desde…».

## Capabilities

### New Capabilities

- `paises-actuales`: modelo, datos, capa y panel de los Estados contemporáneos.

### Modified Capabilities

Ninguna. La nueva capa es independiente de `territorios` y `atlas-mapa`.

## Impact

- `datos/estados-actuales.json` (nuevo)
- `src/data/tipos-cultura.ts`, `src/components/MapaAtlas.tsx`, `src/App.tsx`, `src/lib/i18n.ts`
- `scripts/validar-datos.mjs`
- `openspec/specs/paises-actuales/spec.md`
