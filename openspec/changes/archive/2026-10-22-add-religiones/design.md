# Diseño técnico

## Modelo

```ts
export interface Religion {
  id: string;
  civilizacion: string;
  nombre: string;
  descripcion: string;
  /** Ventana en la que esta religión es la principal de la civilización. */
  desde?: number;
  hasta?: number;
  regiones?: string[];
  color?: string;
}

export interface Deidad {
  id: string;
  civilizacion: string;
  nombre: string;
  dominio: string;
  icono: string;
}
```

El campo `civilizacion` mantiene el vínculo con el catálogo; una civilización puede tener varias religiones en distintos periodos.

## Datos

- Recuperar las 64 religiones y 38 deidades que el proyecto dice tener y que hoy no llegan al paquete generado.
- Zoroastrismo: una religión por civilización (`achaemenidas`, `partos`, `sasanidas`, `safavidas`) o una sola religión con varios vínculos. Se elige una religión canónica `zoroastrismo` y se asocia a cada civilización con su ventana.
- El generador emite `RELIGIONES` y `DEIDADES` desde JSON; se prohíbe escribirlas a mano en el archivo generado.

## Ficha

- Pestaña «Religión» junto a «Historia» y «Cultura».
- Religión principal del año seleccionado, con nombre, descripción y periodo.
- Si no hay religión registrada para ese año: «Sin registro».
- Lista de deidades con dominio e icono.

## Mapa

- El tinte religioso es opcional y se activa con una capa propia.
- Nunca sustituye el color de una civilización sin avisar: la leyenda indica qué capa está activa.
- El filtro «Religiones» no oculta civilizaciones; filtra la lista de religiones.

## Zoroastrismo

No se crea una civilización `zoroastrismo`. Si existe un registro previo en el catálogo de civilizaciones, se migra a `religiones` y se elimina del catálogo de polidades.

## Validación

- Toda religión debe referenciar una civilización existente.
- `desde` no puede ser posterior a `hasta`.
- Una civilización no puede tener dos religiones principales solapadas en el mismo año.
