# Panel de capas para los territorios

## Why

Los territorios históricos (califatos, reinos, dinastías, polidades) se dibujan todos a la vez sobre el mapa. Cuando califato y reino se solapan —Abasíes y Umayas en 750, Reinos y señoríos en Iberia a mediar del Medievo— es imposible leer cada pieza por separado. Los filtros existentes (tipo, grupo, religión, «mostrar divisiones») son conmutadores gruesos: no permiten aislar una civilización concreta ni combinar una selección fina de varias.

El modelo de datos ya es de capas: cada territorio es un objeto independiente con su civilización, su nivel (polidad/división), su tipo y su ventana `desde/hasta`. Falta únicamente el estado de visibilidad, el panel y la persistencia.

## What Changes

- Estado de visibilidad por capa en la app: «ojo» (mostrar/ocultar capas concretas) y «solo» (aislar una capa apagando el resto).
- Botón CAPAS en la cabecera, junto a FILTROS, que abre un panel flotante con buscador y agrupación por región mundial.
- Cada fila del panel: punto de color, nombre de la civilización, botón ojo y botón solo. El nombre selecciona la civilización (abre su ficha).
- La capa afecta al mapa: territorios (polidad y divisiones), ciudades y rótulos de potencia dominante de las capas ocultas dejan de dibujarse. El riel y la ficha no cambian.
- Persistencia en el enlace: tercer segmento del hash con `solo:<civ>` o `off:<id1,id2>`. Los enlaces anteriores (`#<anio>/<civ>`) siguen funcionando.
- «Mostrar todas» restablece la vista completa; contador de capas activas.

## Capabilities

### New Capabilities

- `capas`: panel de capas por civilización, visibilidad (ojo/solo) y persistencia en el enlace.

## Impact

- `src/App.tsx`: estados `capaSolo`/`capasOcultas`/`panelCapas`, parseo y serialización del hash, botón CAPAS, `capaVisible`, render del panel.
- `src/components/MapaAtlas.tsx`: nueva prop `capaVisible`, aplicada a territorios, ciudades y rótulos.
- `src/components/PanelCapas.tsx` (nuevo): el panel.
- `src/lib/i18n.ts`: claves `ctl.capas` y `capas.*` en español e inglés.
- `src/styles/app.css`: estilos `.panel-capas` y variante móvil.
