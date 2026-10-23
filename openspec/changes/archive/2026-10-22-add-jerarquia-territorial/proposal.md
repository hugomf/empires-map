# Jerarquía territorial y fronteras históricas

## Why

El atlas mezcla todavía dos cosas distintas: una polidad soberana (imperio, reino, califato) y una división administrativa (virreinato, satrapía, provincia). Sin esa distinción, el virreinato de Nueva España parece un Estado independiente y el califato abasí se confunde con un virreinato. Además, la región moderna sigue compitiendo visualmente con el polígono histórico y Persia/Irak quedan poco visibles.

## What Changes

- Añadir `nivel` (`polidad` | `division`) y `superior` a cada territorio.
- Diferenciar el estilo de las polidades y de las divisiones administrativas, con una capa activable.
- Modelar la soberanía: metrópoli → virreinato → audiencia/provincia; califatos soberanos con emiratos delegados.
- Reservar la categoría «país» para los Estados modernos.
- Mostrar la región moderna solo como contorno fantasma cuando exista un polígono histórico.
- Añadir `fuente` y `confianza` a los trazados y mostrar «aprox.» cuando corresponda.
- Documentar el criterio de fronteras: polígonos manuales aproximados en la primera versión, con evaluación de OpenHistoricalMap/EurAtlas para más adelante.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `territorios`: nuevos requisitos de jerarquía, soberanía, capa de divisiones, contexto moderno y confianza del dato.

## Impact

- `datos/territorios.json` y `datos.generados.ts`
- `src/data/tipos-cultura.ts`, `src/lib/geo.ts`, `src/components/MapaAtlas.tsx`, `src/components/Ficha.tsx`
- `scripts/validar-datos.mjs` (nuevas comprobaciones de `superior`)
- `openspec/specs/territorios/spec.md`
