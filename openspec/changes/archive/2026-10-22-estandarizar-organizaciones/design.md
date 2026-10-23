# Diseño técnico

## Modelo

La organización política sigue siendo la entrada de `datos/civilizaciones.json`, pero se enriquece con facetas opcionales para no romper las 159 fichas existentes:

```ts
export type EntidadPolitica = 'organizacion' | 'cultura' | 'pueblo' | 'dinastia';

export type EscalaPolitica =
  | 'ciudad-estado'
  | 'principado'
  | 'ducado'
  | 'reino'
  | 'imperio'
  | 'estado'
  | 'confederacion'
  | 'organizacion-supranacional';

export interface Periodo {
  id: string;
  nombre: string;
  desde: number;
  hasta: number;
  forma?: string;
  cargo?: string;
  dinastia?: string;
  paralelo?: boolean;
  nota?: string;
}

export interface Civilizacion {
  // campos actuales…
  entidad?: EntidadPolitica;
  escalaPolitica?: EscalaPolitica;
  forma?: string;
  soberania?: string;
  cargoPrincipal?: string;
  dinastiaPrincipal?: string;
  periodos?: Periodo[];
}

export interface Gobernante {
  // campos actuales…
  cargo?: string;
  dinastiaId?: string;
  periodo?: string;
  rol?: 'titular' | 'regente' | 'co-regente' | 'pretendiente';
}

export interface Capital {
  id: string;
  organizacion: string;
  periodo?: string;
  ciudad: string;
  rol: 'capital' | 'co-capital' | 'residencia-real' | 'sede-gobierno';
  desde: number;
  hasta?: number;
  nota?: string;
}

export interface CiudadGobernante {
  id: string;
  gobernante: string;
  ciudad: string;
  rol:
    | 'residencia'
    | 'nacimiento'
    | 'muerte'
    | 'entierro'
    | 'fundacion'
    | 'conquista'
    | 'asedio'
    | 'batalla'
    | 'tratado'
    | 'patronazgo'
    | 'peregrinacion'
    | 'centro-administrativo'
    | 'puerto';
  desde?: number;
  hasta?: number;
  nota?: string;
}
```

`tipo`, `titulo` y `dinastia` se conservan como campos de compatibilidad. La interfaz usa primero las referencias nuevas y recurre al texto libre cuando no existen.

## Datos

- `datos/formas.json`, `datos/escalas-politicas.json`, `datos/soberanias.json`, `datos/cargos.json`, `datos/dinastias.json`: vocabularios controlados.
- `datos/capitales.json`: capitales por organización y periodo.
- `datos/ciudades-gobernante.json`: ciudades destacadas por reinado.
- Los archivos equivalentes en `datos/en/` contienen los nombres y textos en inglés; las relaciones de lugares son neutrales y se comparten.
- Los periodos viven dentro de cada civilización para que el paquete generado no necesite otra tabla.

## Ficha

- Cabecera con la línea de facetas: escala, forma, cargo y dinastía.
- Selector de periodo cuando la organización declara más de uno.
- Título de la sección derivado del plural del cargo del periodo activo.
- Capitales del periodo activo, con años.
- Lista de gobernantes del periodo, con cargo, dinastía y ciudades del reinado.
- La sección «Ciudades» existente se mantiene para las ciudades principales de la civilización; las ciudades de eventos no se duplican allí.

## Mapa

- Las capas siguen siendo solo visibilidad.
- Las ciudades con `principal: false` no se dibujan como ciudades de la civilización; solo aparecen en la ficha del gobernante.
- No se crea una capa por forma política.

## Validación

- Toda faceta debe existir en su vocabulario.
- Los periodos deben tener fechas válidas, estar dentro de la organización y no solaparse salvo que declaren `paralelo: true`.
- Todo gobernante con `cargo`, `dinastiaId` o `periodo` debe referenciar un registro existente; si declara periodo, debe pertenecer a su civilización.
- Toda capital y toda ciudad de gobernante deben referenciar una ciudad existente.
- Las fechas de las relaciones de lugar deben ser coherentes con la vigencia de la organización o del gobernante.
- El bundle generado incluye los nuevos vocabularios y relaciones; no se edita a mano.

## Fuera de alcance

- Crear una civilización separada para el Sultanato de Rum. El texto selyúcida aclara que la rama anatolia sobrevivió hasta 1308, pero el catálogo mantiene 1037–1194 para el Gran Seljuk.
- Añadir gobernantes de todas las organizaciones del catálogo. El piloto cubre otomanos, selyúcidas y mamelucos; el resto puede migrarse con el mismo patrón.
- Convertir `tipo` en un campo derivado. Se conserva para no romper filtros y enlaces existentes.
