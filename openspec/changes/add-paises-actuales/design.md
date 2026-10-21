# Diseño técnico

## Modelo

```ts
export type TipoFormacion =
  | 'independencia'
  | 'unificacion'
  | 'constitucion'
  | 'reconocimiento'
  | 'sucesion';

export interface PaisActual {
  /** ISO 3166-1 alpha-2. */
  id: string;
  nombre: string;
  formacion: number;
  tipoFormacion: TipoFormacion;
  nota: string;
  aproximada?: boolean;
  fuente?: string;
}
```

## Datos

- Un registro por Estado miembro de la ONU más los casos habituales (Kosovo, Taiwán, Vaticano) si se decide incluirlos; la lista se documenta.
- `formacion` es el año del hecho que se muestra; `nota` explica el matiz.
- `aproximada: true` añade «aprox.» en la interfaz.

## Capa

- `world-atlas` ya está instalado. Se usa `countries-110m` y se mapea el `id` numérico ISO 3166-1 al código alpha-2 mediante una tabla local generada una vez (sin dependencia nueva).
- La capa se dibuja solo si está activa y solo para países con `formacion <= anio`.
- Estilo: relleno neutro, borde definido, etiqueta con el nombre del país.
- La capa no compite con las polidades históricas: si ambas están activas, los países se dibujan como contorno.

## Panel

- Vista «Países actuales» con lista ordenada por año de formación.
- Cada fila: nombre, año, tipo de formación y nota.
- Al seleccionar un país, el año salta a su formación y el mapa lo resalta.

## Validación

- `id` con formato ISO alpha-2 y único.
- `formacion` entre 1000 y 2026 (los Estados modernos no se retrotraen a la Antigüedad).
- `tipoFormacion` dentro del conjunto permitido.
- `nota` obligatoria.
