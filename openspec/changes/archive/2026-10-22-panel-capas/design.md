# Diseño — Panel de capas

## Decisiones

- **Capa = civilización completa.** Una capa engloba la polidad, sus divisiones vigentes y sus ciudades. No se ofrecen conmutadores por territorio individual: el acordeón por piezas queda para una versión futura si hace falta.
- **No se duplican los filtros gruesos.** Tipo, grupo, religión, menores y «mostrar divisiones» siguen siendo la capa gruesa de filtrado; el panel es el control fino por civilización, y ambas condiciones se multiplican.
- **`solo` precede a los ojos.** Con solo activo, los conmutadores de ojo no tienen efecto visible; el panel muestra el aislamiento y «Mostrar todas» lo limpia. La serialización del hash emite `solo:` con precedencia; si no hay solo, emite `off:` si hay capas ocultas.
- **Alcance del efecto: el mapa.** El riel de civilizaciones y la ficha no se filtran por capas (el usuario sigue pudiendo navegar la lista); sólo el render del mapa — territorios, ciudades y rótulos dominantes — respeta `capaVisible`.
- **Formato del hash compatible.** Actual: `#<anio>/<civ>`. Extensiones: segmentos adicionales de la forma `solo:<civ>` o `off:<ids separados por coma>`. El parseo ignora segmentos desconocidos, así los enlaces antiguos y las vistas `#<anio>/` sin civ siguen abriendo igual.
- **Sin dependencias nuevas.** Todo es estado de React + SVG ya existente; los filtros de los memo del mapa son baratos (285 territorios).

## Puntos de integración

- `App.tsx`: `capasDelHash()` a nivel de módulo parsea el hash completo (`segs.slice(2)` para las capas, para no tocar el parseo de año/civ). Estados iniciales derivados de ahí. El effect existente que serializa el hash pasa a depender también de `capaSolo`/`capasOcultas`.
- `capaVisible` como `useCallback` en App, pasada como prop a `MapaAtlas` y usada en sus tres memo (`territorios`, `ciudades`, rótulos de `dominante`).
- `PanelCapas.tsx` reutiliza el patrón del menú de filtros (panel flotante anclado a la cabecera); en móvil, la misma media query que `.menu-filtros` lo convierte en hoja inferior.
- i18n: claves `ctl.capas` y `capas.*` en los dos diccionarios; los datos ya vienen en el idioma activo (`datos.regiones`, `c.nombre`).

## Riesgos

- Un enlace compartido con `solo:` de una civilización que el año no muestre dará un mapa casi vacío: es correcto (la capa existe pero no está vigente); la ficha y el riel lo explican.
- El tinte religioso y el modo fase repinten colores sobre territorios: pasan por los mismos territorios ya filtrados, así que respetan las capas sin trabajo extra.
