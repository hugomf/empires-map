# Música ambiental generada con Web Audio

## Why

El atlas es una experiencia de lectura y exploración, pero hoy es completamente silencioso. Se quiere una banda sonora de fondo que acompañe sin distraer y que no dependa de música con derechos de autor ni de archivos de audio externos.

## What Changes

- Generar la música en el navegador con Web Audio: drone modal, cuerda pulsada (Karplus-Strong), tambor de marco y reverb.
- Añadir un control de reproducción con volumen y estado apagado por defecto.
- Recordar la preferencia de audio en `localStorage`.
- Iniciar el audio solo tras una interacción del usuario, respetando las políticas de reproducción automática.
- Detener el audio de forma limpia al pausar o al cerrar la pestaña.

## Capabilities

### New Capabilities

- `ambiente-sonoro`: generación, control y persistencia de la música ambiental del atlas.

### Modified Capabilities

Ninguna. El audio es una capa opcional que no altera los requisitos del mapa, la cronología o la ficha.

## Impact

- `src/lib/audio.ts` (nuevo)
- `src/App.tsx`, `src/components/*` (control de audio)
- `src/lib/i18n.ts` (etiquetas nuevas)
- `openspec/specs/ambiente-sonoro/spec.md`
