# Alias históricos y búsqueda independiente de filtros

## Why

El buscador encuentra «Alejandro» porque la palabra aparece en un hito de Macedonia, pero no entiende alias históricos como «Persia», «Bizancio» o «Incas». Además, el filtro de civilizaciones menores puede ocultar resultados que el usuario está buscando expresamente.

## What Changes

- Añadir un campo `alias` a las civilizaciones, con nombres históricos y variantes en español e inglés.
- Incluir los alias en la búsqueda y devolver siempre la civilización canónica.
- Hacer que una búsqueda activa no quede oculta por el filtro de menores.
- Indicar cuándo los resultados incluyen civilizaciones menores.
- Cubrir alias como Persia, Alejandro, Bizancio, Incas, Aníbal, Sumeria, Mesopotamia y Gran Bretaña.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `catalogo`: nuevos requisitos de alias y de interacción entre búsqueda y filtro de menores.

## Impact

- `datos/civilizaciones.json` y `datos.generados.ts`
- `src/App.tsx`, `src/components/Cronologia.tsx`
- `scripts/validar-datos.mjs`
- `openspec/specs/catalogo/spec.md`
