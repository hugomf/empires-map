# atlas-mapa Specification

## Purpose

Mapa mundial interactivo que muestra qué civilizaciones y territorios ocupaban cada región en un año concreto, desde el 45 000 a.C. hasta 2026.

## Requirements

### Requirement: Mapa mundial por año
La aplicación SHALL dibujar un mapa mundial y teñir cada región con la civilización dominante viva en el año seleccionado, dejando el océano y las regiones sin civilización registrada sin tinte.

#### Scenario: Regiones teñidas en 1492
- **WHEN** el usuario selecciona el año 1492
- **THEN** cada región con una civilización viva muestra el color de su civilización dominante
- **AND** las regiones sin civilización registrada permanecen neutras

#### Scenario: Cambio de dominante al mover el año
- **WHEN** el usuario avanza hasta un año en que otra civilización pasa a dominar la misma región
- **THEN** el color de la región cambia a la nueva dominante

### Requirement: Navegación temporal continua
La aplicación SHALL permitir seleccionar cualquier año del rango del catálogo mediante el riel temporal, arrastre, reproducción automática y teclado.

#### Scenario: Reproducción automática
- **WHEN** el usuario pulsa reproducir
- **THEN** el año avanza a la velocidad elegida (25, 60, 150 o 400 años por segundo)
- **AND** al superar 2026 la reproducción continúa desde el año mínimo del catálogo

#### Scenario: Arrastrar el riel
- **WHEN** el usuario arrastra el indicador del riel
- **THEN** el año y el mapa se actualizan de forma continua

### Requirement: Atajos de teclado
La aplicación SHALL responder a atajos de teclado cuando el foco no está en un campo de texto.

#### Scenario: Flechas y espacio
- **WHEN** el usuario pulsa ← o →
- **THEN** el año retrocede o avanza 5 años
- **AND** con Shift retrocede o avanza 50 años
- **AND** al pulsar espacio se alterna la reproducción

### Requirement: Zoom y paneo del mapa
La aplicación SHALL permitir acercar, alejar, desplazar y restablecer la vista del mapa sin perder la selección activa.

#### Scenario: Restablecer la vista
- **WHEN** el usuario pulsa el botón de vista global
- **THEN** el mapa vuelve a la proyección completa con una transición breve

#### Scenario: Zoom con rueda o gesto
- **WHEN** el usuario usa la rueda del ratón o un gesto de pellizco sobre el mapa
- **THEN** el mapa se acerca o se aleja alrededor del puntero

### Requirement: Territorios precisos sobre regiones
La aplicación SHALL dibujar los polígonos de ocupación precisos cuando existan para el año seleccionado y atenuar el relleno de la región moderna que ocupan.

#### Scenario: Egipto en 1300 a.C.
- **WHEN** el usuario selecciona 1300 a.C.
- **THEN** el mapa muestra el polígono del valle del Nilo
- **AND** la región moderna de Egipto no se tiñe como si todo el país fuera la civilización

#### Scenario: Sin polígono disponible
- **WHEN** una civilización viva no tiene polígono para ese año
- **THEN** el mapa recurre al tinte de su región

### Requirement: Cúspide y decadencia en el mapa
La aplicación SHALL distinguir visualmente en el mapa los periodos de apogeo y de decadencia de cada civilización viva.

#### Scenario: Civilización en decadencia
- **WHEN** el año seleccionado cae dentro de la ventana de decadencia de una civilización
- **THEN** su territorio se muestra con el tratamiento visual de decadencia definido en la leyenda

### Requirement: Etiquetas sin solapamiento
La aplicación SHALL colocar las etiquetas de las civilizaciones evitando solapamientos y priorizando las civilizaciones de mayor peso.

#### Scenario: Región densa
- **WHEN** varias civilizaciones vivas comparten una zona del mapa
- **THEN** sus etiquetas se distribuyen en posiciones alternativas sin taparse
- **AND** las de menor peso pueden quedar ocultas antes que las mayores

### Requirement: Leyenda del mapa
La aplicación SHALL mostrar una leyenda que explique el territorio de un poder, los pueblos dispersos, la decadencia, las divisiones administrativas y las zonas sin civilización.

#### Scenario: Consultar la leyenda
- **WHEN** el usuario abre la leyenda
- **THEN** ve una muestra visual y una descripción de cada tratamiento del mapa

### Requirement: Enlace profundo al año y la civilización
La aplicación SHALL reflejar el año y la civilización seleccionada en el fragmento de la URL y restaurarlos al cargar la página.

#### Scenario: Abrir un enlace compartido
- **WHEN** el usuario abre `#1492/espana`
- **THEN** el mapa carga en 1492 con España seleccionada
- **AND** un año fuera de rango se ajusta al límite más cercano

### Requirement: Diseño adaptable a móvil
La aplicación SHALL adaptar el mapa, la cabecera y los paneles laterales a pantallas pequeñas sin ocultar la navegación temporal.

#### Scenario: Lista de civilizaciones en móvil
- **WHEN** el usuario abre la aplicación en un móvil
- **THEN** la lista de civilizaciones se presenta como un panel colapsable
- **AND** el riel temporal sigue siendo utilizable
