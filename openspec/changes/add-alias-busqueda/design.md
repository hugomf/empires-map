# Diseño técnico

## Modelo

```ts
export interface Civilizacion {
  // …
  /** Nombres alternativos para el buscador: históricos, exónimos y variantes. */
  alias?: string[];
}
```

Los alias se guardan en el JSON de la civilización, no en una tabla aparte, para que viajen con el registro y se traduzcan con él.

## Búsqueda

El texto indexado pasa a ser:

```
nombre + abrev + alias + tipo + región + síntesis + hitos
```

Se normaliza igual que hoy (sin acentos, minúsculas). El resultado sigue mostrando el nombre canónico.

## Filtro de menores

- Si `busqueda` está vacía: el filtro de menores se aplica como hasta ahora.
- Si `busqueda` no está vacía: se buscan todas las civilizaciones, incluidas las menores.
- La cronología muestra «Incluye N civilizaciones menores» cuando proceda.
- Al seleccionar una menor desde la búsqueda, se muestra su ficha y su territorio aunque el filtro esté desactivado.

## Alias iniciales

| Civilización | Alias |
|---|---|
| Aqueménidas | Persia, Imperio persa, Iran |
| Macedonia | Alejandro, Alejandro Magno, Grecia antigua |
| Bizantinos | Bizancio, Imperio bizantino, Constantinopla |
| Incas | Inca, Tahuantinsuyo, Tawantinsuyu |
| Cartago | Anibal, Aníbal Barca, Púnicos |
| Sumerios | Sumeria, Mesopotamia |
| Britania | Gran Bretaña, Reino Unido, Inglaterra |

## Validación

- `alias` debe ser una lista de cadenas no vacías.
- No se permiten alias duplicados dentro de la misma civilización.
- Un alias no puede coincidir exactamente con el nombre canónico de otra civilización (para evitar ambigüedad); si ocurre, se resuelve a favor de la canónica y se documenta.
