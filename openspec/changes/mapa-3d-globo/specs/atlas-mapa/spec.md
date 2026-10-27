# Spec Delta

## MODIFIED Requirements

### Requirement: Mapa mundial por año
La aplicación SHALL dibujar un mapa mundial y teñir cada región con la civilización dominante viva en el año seleccionado, dejando el océano y las regiones sin civilización registrada sin tinte. En modo 3D, el "mapa mundial" es un globo esférico donde las regiones se proyectan sobre la superficie de la esfera.

#### Scenario: Regiones teñidas en 1492
- **WHEN** el usuario selecciona el año 1492
- **THEN** cada región con una civilización viva muestra el color de su civilización dominante
- **AND** las regiones sin civilización registrada permanecen neutras

#### Scenario: Cambio de dominante al mover el año
- **WHEN** el usuario avanza hasta un año en que otra civilización pasa a dominar la misma región
- **THEN** el color de la región cambia a la nueva dominante

#### Scenario: Modo 3D - regiones en esfera
- **WHEN** el modo 3D está activo y el usuario selecciona 1492
- **THEN** el globo muestra las regiones proyectadas sobre la esfera con los colores correctos
- **AND** la geometría esférica no distorsiona la forma relativa de las regiones

### Requirement: Navegación temporal continua
La aplicación SHALL permitir seleccionar cualquier año del rango del catálogo mediante el riel temporal, arrastre, reproducción automática y teclado. El modo 3D no altera la navegación temporal.

#### Scenario: Reproducción automática
- **WHEN** el usuario pulsa reproducir
- **THEN** el año avanza a la velocidad elegida (25, 60, 150 o 400 años por segundo)
- **AND** al superar 2026 la reproducción continúa desde el año mínimo del catálogo

#### Scenario: Arrastrar el riel
- **WHEN** el usuario arrastra el indicador del riel
- **THEN** el año y el mapa (2D o 3D) se actualizan de forma continua

### Requirement: Atajos de teclado
La aplicación SHALL responder a atajos de teclado cuando el foco no está en un campo de texto. En modo 3D, se añaden atajos para rotar el globo.

#### Scenario: Flechas y espacio
- **WHEN** el usuario pulsa ← o →
- **THEN** el año retrocede o avanza 5 años
- **AND** con Shift retrocede o avanza 50 años
- **AND** al pulsar espacio se alterna la reproducción

#### Scenario: Rotar globo con teclado (modo 3D)
- **WHEN** en modo 3D el usuario pulsa A/D o Flecha Izq/Der con Alt
- **THEN** el globo rota horizontalmente (yaw)
- **AND** W/S con Alt rota verticalmente (pitch)

### Requirement: Zoom y paneo del mapa
La aplicación SHALL permitir acercar, alejar, desplazar y restablecer la vista del mapa sin perder la selección activa. En modo 3D, "zoom" es dolly de cámara, "paneo" es pan de cámara, y "restablecer" vuelve a la vista global de la Tierra.

#### Scenario: Restablecer la vista
- **WHEN** el usuario pulsa el botón de vista global
- **THEN** el mapa (2D) o el globo (3D) vuelve a la vista completa con una transición breve

#### Scenario: Zoom con rueda o gesto
- **WHEN** el usuario usa la rueda del ratón o un gesto de pellizco sobre el mapa
- **THEN** el mapa se acerca o se aleja alrededor del puntero (2D) o la cámara hace dolly hacia el punto bajo el puntero (3D)

#### Scenario: Paneo en 3D
- **WHEN** en modo 3D el usuario arrastra con botón derecho (o dos dedos)
- **THEN** la cámara se desplaza lateralmente sin rotar el globo

### Requirement: Territorios precisos sobre regiones
La aplicación SHALL dibujar los polígonos de ocupación precisos cuando existan para el año seleccionado y atenuar el relleno de la región moderna que ocupan. En 3D, los polígonos se triangulan y proyectan sobre la esfera.

#### Scenario: Egipto en 1300 a.C.
- **WHEN** el usuario selecciona 1300 a.C.
- **THEN** el mapa/globo muestra el polígono del valle del Nilo
- **AND** la región moderna de Egipto no se tiñe como si todo el país fuera la civilización

#### Scenario: Sin polígono disponible
- **WHEN** una civilización viva no tiene polígono para ese año
- **THEN** el mapa/globo recurre al tinte de su región

### Requirement: Cúspide y decadencia en el mapa
La aplicación SHALL distinguir visualmente en el mapa los periodos de apogeo y de decadencia de cada civilización viva. Los tratamientos visuales (trazo discontinuo, opacidad) son idénticos en 2D y 3D.

#### Scenario: Civilización en decadencia
- **WHEN** el año seleccionado cae dentro de la ventana de decadencia de una civilización
- **THEN** su territorio se muestra con el tratamiento visual de decadencia definido en la leyenda (trazo 5 3)

### Requirement: Etiquetas sin solapamiento
La aplicación SHALL colocar las etiquetas de las civilizaciones evitando solapamientos y priorizando las civilizaciones de mayor peso. En 3D, el algoritmo opera en coordenadas de pantalla proyectadas desde la esfera.

#### Scenario: Región densa
- **WHEN** varias civilizaciones vivas comparten una zona del mapa/globo
- **THEN** sus etiquetas se distribuyen en posiciones alternativas sin taparse
- **AND** las de menor peso pueden quedar ocultas antes que las mayores

### Requirement: Leyenda del mapa
La aplicación SHALL mostrar una leyenda que explique el territorio de un poder, los pueblos dispersos, la decadencia, las divisiones administrativas y las zonas sin civilización. En 3D, la leyenda es un overlay 2D fijo con idéntico contenido.

#### Scenario: Consultar la leyenda
- **WHEN** el usuario abre la leyenda
- **THEN** ve una muestra visual y una descripción de cada tratamiento del mapa

### Requirement: Enlace profundo al año y la civilización
La aplicación SHALL reflejar el año y la civilización seleccionada en el fragmento de la URL y restaurarlos al cargar la página. El modo 2D/3D también se persiste en la URL.

#### Scenario: Abrir un enlace compartido
- **WHEN** el usuario abre `#1492/espana`
- **THEN** el mapa/globo carga en 1492 con España seleccionada
- **AND** un año fuera de rango se ajusta al límite más cercano

#### Scenario: Enlace con modo 3D
- **WHEN** el usuario abre `#1492/espana/3d`
- **THEN** el globo carga en 1492 con España seleccionada en modo 3D

### Requirement: Diseño adaptable a móvil
La aplicación SHALL adaptar el mapa, la cabecera y los paneles laterales a pantallas pequeñas sin ocultar la navegación temporal. En 3D móvil, los gestos táctiles controlan la cámara (un dedo = rotar, dos dedos = zoom/pan).

#### Scenario: Lista de civilizaciones en móvil
- **WHEN** el usuario abre la aplicación en un móvil
- **THEN** la lista de civilizaciones se presenta como un panel colapsable
- **AND** el riel temporal sigue siendo utilizable

#### Scenario: Gestos táctiles en globo 3D
- **WHEN** en móvil modo 3D el usuario arrastra con un dedo
- **THEN** el globo rota
- **AND** con dos dedos hace zoom y pan

### Requirement: Enlace compartido con estado completo
La aplicación SHALL incluir en el enlace el año, la civilización seleccionada, los filtros, las capas activas, la densidad de etiquetas, el idioma y el modo 2D/3D.

#### Scenario: Compartir una vista filtrada en 3D
- **WHEN** el usuario configura un año, una civilización, filtros y modo 3D y pulsa «Copiar enlace»
- **THEN** el enlace copiado reproduce esa misma vista al abrirlo
- **AND** la confirmación se anuncia a los lectores de pantalla

### Requirement: Densidad de etiquetas configurable
La aplicación SHALL ofrecer un control de densidad de etiquetas con los modos automático, todas y ninguna, y SHALL recordar la elección. Funciona igual en 2D y 3D.

#### Scenario: Modo automático
- **WHEN** el usuario elige «Automática»
- **THEN** las etiquetas se colocan evitando solapamientos y priorizando las civilizaciones de mayor peso

#### Scenario: Modo sin etiquetas
- **WHEN** el usuario elige «Ninguna»
- **THEN** el mapa/globo muestra solo los marcadores y territorios
- **AND** las etiquetas desaparecen hasta que se cambie el modo

### Requirement: Accesibilidad por teclado y lectores de pantalla
La aplicación SHALL permitir usar el mapa, la cronología, los filtros y los paneles con teclado y SHALL anunciar los cambios relevantes a los lectores de pantalla. En 3D, la navegación por teclado incluye rotación de cámara.

#### Scenario: Recorrer los controles
- **WHEN** el usuario navega con Tab
- **THEN** cada control recibe el foco en un orden lógico
- **AND** se puede activar con Enter o Espacio

#### Scenario: Cambio de año por teclado
- **WHEN** el usuario cambia el año con las flechas
- **THEN** el nuevo año se anuncia con `aria-live` sin interrumpir la reproducción automática

#### Scenario: Rotar globo por teclado
- **WHEN** en modo 3D el usuario usa Alt+flechas
- **THEN** el globo rota y el cambio se anuncia si hay descripción de región bajo la cámara

### Requirement: Experiencia táctil en móvil
La aplicación SHALL ofrecer controles táctiles de al menos 44 × 44 píxeles y gestos compatibles con el mapa y el riel. En 3D móvil, los gestos estándar de mapas 3D (rotar, zoom, pan) tienen prioridad.

#### Scenario: Arrastrar el riel en móvil
- **WHEN** el usuario arrastra horizontalmente el riel con el dedo
- **THEN** el año cambia sin desplazar la página

#### Scenario: Controlar globo 3D en móvil
- **WHEN** en modo 3D móvil el usuario usa un dedo sobre el globo
- **THEN** el globo rota fluidamente
- **AND** con dos dedos hace zoom y pan
- **AND** los botones de UI (capas, leyenda) siguen teniendo área táctil ≥ 44×44