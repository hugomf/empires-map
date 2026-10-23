# Estandarizar organizaciones políticas, cargos y ciudades de los gobernantes

## Why

El catálogo mezcla hoy escala, forma de gobierno y tipo de entidad en un solo campo `tipo`. Los gobernantes guardan `titulo` y `dinastia` como texto libre, y las ciudades importantes de cada reinado no tienen un lugar en el modelo. Eso impide mostrar de forma consistente un imperio, un reino, un califato o un sultanato, y obliga a crear una capa distinta por cada forma política.

La solución no es una capa de gobernantes: es un modelo de organización política con facetas, periodos, cargos y relaciones con lugares. Las capas quedan para visibilidad; las formas políticas se consultan con filtros y fichas normalizadas.

## What Changes

- Nuevas facetas de la organización: `entidad`, `escalaPolitica`, `forma`, `soberania`, `cargoPrincipal` y `dinastiaPrincipal`.
- Periodos dentro de una organización, con forma, cargo, dinastía y fechas propias.
- Catálogos controlados de formas, escalas políticas, soberanías, cargos, dinastías y roles de ciudad.
- Los gobernantes referencian `cargo`, `dinastiaId` y `periodo`, manteniendo `titulo` y `dinastia` para los registros antiguos.
- Relación `capitales` entre organización/periodo y ciudad, con rol y vigencia.
- Relación `ciudades-gobernante` entre reinado y ciudad, con rol, vigencia y nota.
- Ficha con una sección «Gobierno» cuyo título se deriva del cargo (Sultanes, Reyes, Califas, Presidentes…), selector de periodo y ciudades del reinado.
- Piloto otomano: 4 periodos, 36 gobernantes, capitales y ciudades destacadas por reinado.
- Selyúcidas y mamelucos: facetas, periodos y gobernantes principales con sus ciudades.
- Corrección de los textos otomano, mameluco y selyúcida en español e inglés.

## Capabilities

### New Capabilities

- `organizaciones-politicas`: facetas, periodos, cargos, dinastías y relaciones entre gobernantes y ciudades.

### Modified Capabilities

- `ficha`: la sección de gobernantes pasa a ser una sección de gobierno con periodo activo, título dinámico y ciudades del reinado.
- `catalogo`: el catálogo incorpora los vocabularios controlados y las relaciones de lugares.

## Impact

- `datos/formas.json`, `datos/escalas-politicas.json`, `datos/soberanias.json`, `datos/cargos.json`, `datos/dinastias.json` (nuevos).
- `datos/capitales.json`, `datos/ciudades-gobernante.json` (nuevos).
- `datos/civilizaciones.json`, `datos/en/civilizaciones.json`, `datos/gobernantes.json`, `datos/en/gobernantes.json`, `datos/ciudades.json`, `datos/en/ciudades.json`.
- `src/data/tipos-cultura.ts`, `src/data/catalogo.ts`, `scripts/validar.mjs`.
- `src/components/Ficha.tsx`, `src/components/MapaAtlas.tsx`, `src/lib/i18n.ts`, `src/styles/app.css`.
- `openspec/specs/organizaciones-politicas/spec.md` (nueva capacidad).
