# Diseño técnico

## Enlace compartido

Formato propuesto, compatible con el actual:

```
#en/1492/espana?tipos=imperio,reino&menores=0&capa=paises&divisiones=0&etiquetas=auto
```

- Sin parámetros, se usan los valores por defecto.
- El parser tolera enlaces antiguos (`#1492/espana`) y los reescribe al estado actual.
- Los filtros se serializan con identificadores estables, no con etiquetas traducidas.
- Un botón «Copiar enlace» copia la URL completa y anuncia el resultado con `aria-live`.

## Densidad de etiquetas

Tres modos:

- `auto`: el actual, con colocación sin solapamiento y prioridad por peso.
- `todas`: intenta mostrar todas las etiquetas, aceptando más colisiones.
- `ninguna`: solo marcadores, sin texto.

El modo se guarda en `localStorage` y se refleja en el enlace.

## Zoom temporal

- La cronología usa una escala lineal de años con `d3-scale` y `d3-zoom` (ya disponibles).
- Vista general: barra de contexto con el rango completo y una ventana arrastrable.
- Vista detalle: el Gantt y el riel se dibujan solo para la ventana visible.
- Botones «Acercar», «Alejar» y «Ver todo».
- El zoom no cambia el año seleccionado; solo la ventana visible.

## Accesibilidad

- Cada control interactivo es alcanzable con Tab y activable con Enter/Espacio.
- El mapa y la cronología exponen instrucciones con `aria-describedby`.
- El año actual se anuncia con `aria-live="polite"` solo al cambiar por teclado o botón, no al reproducir.
- Los paneles laterales atrapan el foco mientras están abiertos y lo devuelven al cerrarse.
- Contraste mínimo AA en texto y controles.
- Enlace «Saltar al contenido» al principio.

## Móvil y táctil

- Objetivos táctiles de al menos 44 × 44 px.
- El zoom del mapa acepta pellizco; el riel acepta arrastre horizontal.
- Los paneles se abren a pantalla completa con un botón de cierre claro.
- Se evita el desplazamiento accidental de la página al arrastrar el mapa o el riel.

## Estados vacíos

- Búsqueda sin resultados: «No hay coincidencias para “X”» + botón «Limpiar búsqueda».
- Filtros sin resultados: «Ninguna civilización cumple los filtros» + botón «Quitar filtros».
- Sin civilización seleccionada: texto de ayuda y foco en el buscador.

## Comparación de producto

Antes de implementar, revisar Chronas, OpenHistoricalMap, TimeMaps, GeaCron, Histography y Our World in Data. Documentar en `docs/comparativa.md` qué patrón se adopta y cuál se descarta, con foco en navegación temporal, capas y fuentes.
