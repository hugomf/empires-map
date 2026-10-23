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

- Cobertura: 193 Estados miembros de la ONU más Palestina, Taiwán y la Ciudad
  del Vaticano. Kosovo queda pendiente porque su reconocimiento es disputado.
- La lista se ha curado a partir de la tabla de Estados miembros de la ONU y de
  las fechas de formación documentadas para cada Estado. El campo `fuente` es
  opcional: se omite cuando la nota ya identifica el hecho y el predecesor.
- `formacion` es el año del hecho que se muestra (independencia, unificación,
  constitución, reconocimiento o sucesión); `nota` explica el matiz y, cuando
  procede, la continuidad del Estado moderno.
- `aproximada: true` añade «aprox.» en la interfaz para procesos graduales o
  fechas tradicionales (por ejemplo, Noruega 872, Islandia 930 o Suiza 1291).
- La mayoría de los registros se sitúan entre 1000 y 2026. El validador admite
  desde 800 para no perder Estados con continuidad medieval (Francia 987,
  Islandia 930, Dinamarca 965, Noruega 872); no se admiten fechas antiguas
  anteriores a ese límite.

## Capa

- `world-atlas` ya está instalado. Se usa `countries-50m` (más detalle que
  `110m`) y se mapea el `id` numérico ISO 3166-1 al código alpha-2 mediante
  `src/data/iso-numeric.ts`, una tabla local generada una vez por
  `scripts/generar-tabla-iso.mjs` (sin dependencia nueva).
- La capa se dibuja solo si está activa y solo para países con
  `formacion <= anio`.
- Estilo: relleno neutro y borde fino. Cuando hay territorios históricos
  activos, el relleno baja casi a cero para que la capa moderna funcione como
  contorno y no tape las polidades históricas.
- El país seleccionado o bajo el cursor se resalta y muestra su etiqueta por
  encima de las capas históricas. El resto de etiquetas se evita para no
  saturar el mapa.
- El atlas no incluye geometría de Tuvalu; el país sigue en el panel y en los
  datos, pero la capa no lo dibuja. La tabla ISO puede tener más de una
  geometría para un mismo código (Australia y Ashmore), así que la capa
  deduplica por alpha-2.

## Panel

- Vista «Países actuales» con lista ordenada por año de formación.
- Cada fila: nombre, año, tipo de formación y nota. La búsqueda cubre nombre,
  nota y etiqueta del tipo.
- Al seleccionar un país, el año salta a su formación, la capa se enciende si
  estaba apagada y el mapa lo resalta.

## Validación

- `id` con formato ISO alpha-2 y único.
- `formacion` entero entre 800 y 2026.
- `tipoFormacion` dentro del conjunto permitido.
- `nota` obligatoria, con longitud mínima y sin caracteres no permitidos.
- `aproximada` booleana y `fuente` textual si están presentes.
- El catálogo inglés debe tener los mismos códigos, años, tipos y marcas de
  aproximación que el español. `npm run validate` falla si divergen.
