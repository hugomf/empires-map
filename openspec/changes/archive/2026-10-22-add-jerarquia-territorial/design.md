# Diseño técnico

## Modelo

```ts
export type NivelTerritorio = 'polidad' | 'division';

export interface Territorio {
  id: string;
  civilizacion: string;
  tipo: 'tierra' | 'ciudad';
  nombre: string | null;
  ancla: [number, number] | null;
  desde: number | null;
  hasta: number | null;
  anillos: [number, number][][];
  nivel: NivelTerritorio;
  /** Polidad soberana o división de la que depende. */
  superior?: string;
  fuente?: string;
  confianza?: 'alta' | 'media' | 'baja';
}
```

Reglas:

- `nivel: 'division'` exige `superior`.
- `superior` puede apuntar al `id` de una civilización (por ejemplo `espana`) o al `id` de otro territorio.
- Un califato es `polidad`; sus emiratos y sultanatos autónomos son `division` con `superior` al califato.
- «País» no se usa como tipo de polidad histórica; queda reservado para `paises-actuales`.

## Render

- Polidad: relleno sólido con el color de su civilización.
- División: relleno más tenue, borde discontinuo y etiqueta secundaria.
- Capa «Divisiones»: activa por defecto; al desactivarla solo quedan las polidades.
- Región moderna: si hay polígono histórico, se pinta solo el contorno (sin relleno) y se apaga la dominante regional.

## Datos

Migrar los 176 trazados existentes: los que ya traen `nivel` se conservan; los que no, se clasifican como `polidad` salvo los virreinatos, satrapías, provincias y jund, que pasan a `division` con su `superior`.

## Fuentes y confianza

- `fuente`: referencia bibliográfica o cartográfica breve.
- `confianza`: `alta` para fronteras bien documentadas, `media` para reconstrucciones razonables, `baja` para aproximaciones.
- La ficha muestra «aprox.» cuando `confianza` es `baja` o `media`.

## Fronteras: decisión

Para esta versión se mantienen polígonos manuales aproximados, versionados en JSON y validados. Se documenta la alternativa de importar OpenHistoricalMap o EurAtlas cuando haga falta más precisión; no se adopta todavía para no añadir una dependencia pesada ni una licencia sin revisar.

## Validación

Añadir a `scripts/validar-datos.mjs`:

- `nivel` obligatorio y valor permitido.
- `superior` obligatorio si `nivel === 'division'`.
- `superior` debe existir.
- Aviso si una división empieza antes que su superior o termina después.
