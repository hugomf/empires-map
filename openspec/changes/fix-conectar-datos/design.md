# Diseño técnico

## API de catálogo

`catalogo.ts` será la única puerta de entrada:

```ts
export interface Catalogo { civilizaciones; regiones; territorios; religiones; deidades; ciudades; artefactos; anioMin; anioMax; }
export const CATALOGOS: Record<Idioma, Catalogo>;
export function fijarIdioma(i: Idioma): void;
export function catalogo(): Catalogo;
```

Para no romper la migración en un solo salto, se añaden exports de compatibilidad temporales:

```ts
export const CIVILIZACIONES = () => catalogo().civilizaciones; // o getter equivalente
```

La opción preferida es migrar los componentes a `catalogo()` y no dejar constantes mutables de módulo. Si hace falta una constante, se calcula una vez con el idioma por defecto y se documenta como deuda.

## Tipos

- `tipos-cultura.ts` es el modelo canónico.
- `types.ts` pasa a reexportar desde `tipos-cultura.ts` o se elimina.
- `Hito` no lleva `id`; los hitos se identifican por índice dentro de su civilización.
- `Territorio` incorpora `nivel: 'polidad' | 'division'` y `superior?: string`.
- Se añaden `fuente?: string` y `confianza?: 'alta' | 'media' | 'baja'` para el cambio de jerarquía.

## Componentes

- `App` obtiene `catalogo()` una vez y lo pasa a los componentes, o cada componente llama a `catalogo()`.
- `ANIO_MIN`/`ANIO_MAX` salen del catálogo generado (`-45000` y `2026`), no de constantes duplicadas.
- `MapaAtlas` corrige la firma de `construirMapa` y los accesos a `t.desde`/`t.hasta` nulos.

## Datos generados

- El generador debe emitir exactamente el tipo `Hito` (`a`, `t`).
- Los territorios deben emitir `nivel` y, cuando exista, `superior`.
- `RELIGIONES`, `DEIDADES`, `CIUDADES` y `ARTEFACTOS` se generan desde sus JSON; hoy salen vacíos.

## Scripts

Reescribir `añadir-civilizaciones.mjs` y `ampliar-catalogo.mjs` contra los JSON, sin depender de los módulos TypeScript antiguos. Añadir una comprobación de que la salida generada es determinista.

## Criterio de aceptación

`npm run validate`, `npx tsc -b` y `npm run build` terminan con código 0; la app carga el catálogo generado y el mapa sigue mostrando los mismos datos que antes.
