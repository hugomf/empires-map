# capas Specification

## Purpose
Definir el panel de capas que permite buscar, ocultar y aislar civilizaciones en el atlas, y garantizar que esa visibilidad se conserve en el enlace compartido y funcione también en móvil.

## Requirements

### Requirement: Panel de capas

La aplicación SHALL ofrecer un botón CAPAS en la cabecera que abra un panel flotante que liste las civilizaciones del catálogo, agrupadas por región mundial y filtrables mediante un buscador por nombre.

#### Scenario: Abrir y cerrar el panel

- **WHEN** el usuario pulsa el botón CAPAS de la cabecera
- **THEN** se muestra el panel de capas flotante con las civilizaciones agrupadas por región y un buscador
- **WHEN** el usuario cierra el panel (botón ✕, tecla Escape u otra pulsación sobre CAPAS)
- **THEN** el panel desaparece y el estado de visibilidad se mantiene para el mapa

#### Scenario: Buscar una capa

- **WHEN** el usuario escribe en el buscador del panel
- **THEN** sólo se listan las civilizaciones cuyo nombre contiene el texto (sin distinción de mayúsculas)

#### Scenario: Seleccionar desde el panel

- **WHEN** el usuario pulsa el nombre de una civilización en el panel
- **THEN** esa civilización queda seleccionada (ficha abierta) sin cambiar la visibilidad de la capa

### Requirement: Visibilidad por capa

El mapa SHALL respetar la visibilidad por capa: una capa oculta con el ojo no dibuja sus territorios (polidad ni divisiones), sus ciudades ni sus rótulos de potencia dominante. El modo «solo» SHALL aislar una capa apagando el resto y tiene precedencia sobre los ojos individuales.

#### Scenario: Ocultar una capa

- **WHEN** el usuario pulsa el ojo de una civilización
- **THEN** sus territorios, ciudades y rótulo dominante desaparecen del mapa; el resto no cambia

#### Scenario: Aislar una capa con solo

- **WHEN** el usuario pulsa «solo» sobre una civilización
- **THEN** sólo se dibujan el mapa base y los elementos de esa civilización; los ojos individuales quedan subordinados
- **WHEN** el usuario vuelve a pulsar «solo» sobre la misma civilización
- **THEN** se desactiva el aislamiento y las visibilidad individuales vuelven a aplicar

#### Scenario: Restablecer todas las capas

- **WHEN** el usuario pulsa «Mostrar todas» en el panel
- **THEN** se limpian el ojo de todas las capas y el modo solo, y el mapa vuelve a dibujar todo lo vigente en el año

#### Scenario: Interacción con los filtros gruesos

- **WHEN** hay filtros activos (tipo, grupo, religión, menores, divisiones) a la vez que capas
- **THEN** ambas condiciones se aplican conjuntamente: sólo se dibuja lo que pasa ambos filtros

### Requirement: Persistencia de capas en el enlace

La aplicación SHALL serializar el estado de capas en el hash como segmentos opcionales tras `#<anio>/<civ>`: `solo:<civ>` o `off:<id1,id2,…>`. Los enlaces sin esos segmentos SHALL seguir funcionando sin cambios.

#### Scenario: Compartir un enlace con una capa aislada

- **WHEN** el usuario aísla la capa de `abasies` y copia la URL
- **THEN** el hash contiene el segmento `solo:abasies` y al abrirlo la aplicación restaura el aislamiento

#### Scenario: Compartir un enlace con capas ocultas

- **WHEN** el usuario oculta `roma` y `egipto` y copia la URL
- **THEN** el hash contiene el segmento `off:roma,egipto` y al abrirlo esas capas aparecen ocultas

#### Scenario: Compatibilidad con enlaces anteriores

- **WHEN** se abre un enlace del formato anterior `#<anio>/<civ>`
- **THEN** el mapa se muestra con todas las capas visibles, como siempre

### Requirement: Panel accesible en móvil

En pantallas estrechas el panel SHALL presentarse como hoja inferior a ancho completo, conservando buscador, grupos y controles.

#### Scenario: Panel en móvil

- **WHEN** el usuario abre CAPAS con un ancho de ventana inferior al punto de ruptura móvil
- **THEN** el panel ocupa la banda inferior de la pantalla con su lista desplazable
