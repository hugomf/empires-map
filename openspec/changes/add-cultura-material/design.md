# Diseño técnico

## Modelo

```ts
export interface Artefacto {
  id: string;
  civilizacion: string;
  nombre: string;
  tipo: string;          // arma, cerámica, vasija, joya, herramienta…
  material?: string;
  descripcion: string;
  icono: string;         // id del registro SVG
}

export interface Ciudad {
  id: string;
  civilizacion: string;
  nombre: string;
  actual?: string;
  lat: number;
  lon: number;
}

// En Civilizacion
escritura?: string;
```

## UI

- Pestaña «Cultura» dentro de la ficha.
- Secciones: artefactos (cuadrícula de tarjetas con icono), ciudades (lista con nombre actual) y escritura (texto breve).
- Si una sección no tiene datos: «Sin registro», sin dejar huecos raros.

## Iconos

Registro de iconos SVG por identificador (`espada`, `anfora`, `vasija`, `tablilla`, `casco`, `mascara`…). Se dibujan inline con `currentColor` para heredar el color de la civilización. No se usan imágenes remotas ni fuentes de iconos.

## Datos

- `artefactos.json` se llena por tandas, empezando por las civilizaciones con más peso editorial.
- `ciudades.json` recoge las ciudades ya presentes en los territorios y las que falten.
- `escritura` se añade a las civilizaciones que la tengan documentada (cuneiforme, jeroglífico, alfabeto fenicio, quipu…).

## Validación

- `civilizacion` debe existir.
- `icono` debe existir en el registro.
- `lat`/`lon` dentro de rango.
- Un artefacto sin descripción no se acepta.
