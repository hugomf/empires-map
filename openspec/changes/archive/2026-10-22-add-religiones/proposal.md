# Capa de religiones y cambio religioso en el tiempo

## Why

El proyecto ya tiene datos parciales de religiones y deidades, pero el paquete generado los entrega vacíos y no hay interfaz para consultarlos. El zoroastrismo se registró como perspectiva religiosa de Persia, pero no debe convertirse en una civilización: necesita un modelo propio, con periodo y regiones, que conviva con el catálogo sin contaminarlo.

## What Changes

- Modelo independiente de religión: identificador, nombre, periodo, regiones, texto y color.
- Vínculo entre religiones y civilizaciones, con ventanas `desde`/`hasta` para mostrar el cambio religioso.
- Catálogo de deidades por civilización.
- Pestaña de religión en la ficha, con religión principal y deidades.
- Filtro «Religiones» y, opcionalmente, tinte del mapa, separado de las capas de civilizaciones.
- Zoroastrismo asociado a aqueménidas, partos, sasánidas y safávidas, sin duplicarlo como civilización.

## Capabilities

### New Capabilities

- `religiones`: modelo, datos, ficha y capa de religiones.

### Modified Capabilities

Ninguna. La ficha consume el nuevo modelo, pero sus requisitos actuales no cambian; la pestaña de religión se describe en la nueva capacidad `religiones`.

## Impact

- `datos/religiones.json`, `datos/deidades.json` (nuevos o recuperados)
- `datos.generados.ts` y `datos.en.generados.ts`
- `src/data/tipos-cultura.ts`, `src/components/Ficha.tsx`, `src/components/MapaAtlas.tsx`
- `src/lib/i18n.ts`
- `openspec/specs/religiones/spec.md`
