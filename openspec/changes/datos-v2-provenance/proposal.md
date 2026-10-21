# Procedencia, confianza y fuentes del dato histórico

## Why

El atlas ya reúne 153 civilizaciones, 610 hitos y 216 territorios, pero hoy no puede demostrar de dónde sale ninguno de esos datos: no hay fuentes citadas, ni nivel de confianza, ni identificadores externos, ni una versión citable del catálogo. Para un profesor, un medio o una institución, un dato sin procedencia es un dato que no se puede usar. En la era de la IA, generar un mapa plausible es barato; lo escaso es poder responder «¿de dónde sale esto?».

Este cambio convierte la procedencia en una parte explícita del producto, no en un anexo. No pretende cubrir las 153 fichas de golpe ni competir en volumen: establece el modelo, la validación y la interfaz para que las 25 civilizaciones insignia sean citables y para que el resto pueda completarse sin rehacer el esquema.

## What Changes

- Añadir un registro canónico de fuentes en `datos/fuentes.json`, con cita, tipo, URL, licencia, uso permitido y fecha de consulta.
- Añadir procedencia a civilizaciones e hitos: `fuentes` (IDs del registro), `confianza` (`alta`, `media`, `baja`) y notas de matiz; en civilizaciones, además, `notaFechas`, `wikidata` y `pleiades`.
- Reutilizar `fuente` y `confianza` en territorios, tal como los define `add-jerarquia-territorial`; este cambio no altera ese contrato.
- Validar que las referencias existen, que las licencias y los usos son coherentes y que una confianza baja no se queda sin nota explicativa.
- Añadir un informe de cobertura (`npm run data:coverage`) que cuente cuántas fichas e hitos tienen fuentes, confianza e identificadores externos, con umbrales opcionales.
- Publicar una versión del catálogo (`datos/version.json`) que aparezca en la ficha y en la cita copiable.
- Mostrar en la ficha las fuentes, la confianza, la nota «Cómo lo sabemos», la versión y un enlace para reportar errores; añadir un panel de metodología y un botón para copiar la cita.
- Completar la procedencia de 25 civilizaciones insignia como primer lote verificable; el resto mostrará «Sin fuentes registradas» hasta que se revise.
- **Fuera de alcance:** importar en masa Cliopatria, OpenHistoricalMap u otras bases; redibujar fronteras; añadir gobernantes, población o superficie; traducir las 153 fichas; construir una API; abrir contribución comunitaria sin revisión; y emitir asesoramiento legal sobre licencias.

## Capabilities

### New Capabilities

- `procedencia-datos`: registro de fuentes, confianza, identificadores externos, validación, cobertura, versión, cita y presentación de la procedencia en la ficha.

### Modified Capabilities

Ninguna. Los requisitos de `datos`, `catalogo`, `ficha` y `territorios` siguen vigentes; esta capacidad añade una capa transversal de procedencia sin cambiar el comportamiento existente.

## Impact

- **Datos:** `datos/fuentes.json` y `datos/version.json` (nuevos); campos nuevos en `datos/civilizaciones.json` y `datos/hitos.json`; referencias compatibles en `datos/territorios.json`.
- **Generación:** `scripts/validar.mjs` y `scripts/cobertura.mjs` (nuevo); `src/data/datos.generados.ts` y `datos.en.generados.ts`; `package.json`.
- **Tipos y catálogo:** `src/data/tipos-cultura.ts`, `src/data/catalogo.ts`.
- **Interfaz:** `src/components/Ficha.tsx`, `src/lib/i18n.ts`, estilos asociados.
- **Dependencias de otros cambios:** requiere que `fix-conectar-datos` haya estabilizado el build y el modelo de tipos; reutiliza `fuente`/`confianza` de `add-jerarquia-territorial` y las cadenas de `add-i18n`. No modifica alias, religiones, países actuales ni cultura material.

## Criterio de éxito

- `npm run validate`, `npm run data:coverage` y `npm run build` terminan en verde.
- Las 25 fichas insignia tienen al menos dos fuentes, un ID de Wikidata, confianza declarada, cinco hitos con fuente y una nota de matiz cuando corresponda.
- Ninguna referencia a una fuente rota; ninguna fuente marcada para importación tiene una licencia incompatible.
- Una ficha con fuentes permite copiar una cita completa y reportar un error sin salir de la aplicación.
- Una ficha sin fuentes lo dice con claridad; no se inventa confianza ni se presenta como verificada.
