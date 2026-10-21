# Interfaz bilingüe español / inglés

## Why

El diccionario de interfaz y el catálogo inglés ya existen en el código, pero la aplicación no los usa: sigue mostrando textos en español escritos directamente en los componentes. El requisito es inglés por defecto, con un selector claro y sin mezclas silenciosas de idioma.

## What Changes

- Selector ES / EN en la cabecera.
- Inglés por defecto en la primera visita.
- Persistencia del idioma en `localStorage` y en el enlace (`#en/1492/roma`).
- Traducción de toda la interfaz mediante el diccionario existente, sin cadenas sueltas.
- Traducción del contenido histórico usando el catálogo inglés, con aviso cuando falte.
- Formato de años, eras y siglos según el idioma.

## Capabilities

### New Capabilities

- `i18n`: selección, persistencia y aplicación del idioma en interfaz, contenido y enlaces.

### Modified Capabilities

Ninguna. Los requisitos de `catalogo`, `atlas-mapa`, `cronologia` y `ficha` no cambian; solo se expresan en dos idiomas.

## Impact

- `src/lib/i18n.ts`, `src/App.tsx`, `src/components/*.tsx`
- `src/data/catalogo.ts`, `src/data/datos.en.generados.ts`
- `src/lib/tiempo.ts`
- `openspec/specs/i18n/spec.md`
