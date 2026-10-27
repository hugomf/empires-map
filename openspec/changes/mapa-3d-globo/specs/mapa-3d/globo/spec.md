# Spec Delta

## Purpose

Renderiza el atlas histórico en un globo 3D interactivo (WebGL) con paridad visual exacta respecto al mapa 2D: territorios, países, ciudades, etiquetas, leyenda y controles de cámara.

## ADDED Requirements

### Requirement: Globo 3D con geometría esférica
La aplicación SHALL renderizar la Tierra como una esfera 3D donde tierras, territorios históricos, países actuales y ciudades se proyectan sobre la superficie esférica manteniendo su forma geográfica correcta.

#### Scenario: Tierra visible como esfera
- **WHEN** el usuario abre el mapa en modo 3D
- **THEN** ve una esfera con la silueta de los continentes proyectada sobre su superficie
- **AND** la esfera se puede rotar libremente con el ratón/táctil

#### Scenario: Proyección correcta de coordenadas
- **WHEN** se renderiza un territorio con anclas en [lon, lat]
- **THEN** sus vértices se sitúan en la esfera en la posición esférica correspondiente
- **AND** no hay distorsión de área ni forma respecto a la proyección 2D Natural Earth 1

### Requirement: Controles de cámara orbitada
La aplicación SHALL proveer controles de cámara que permitan rotar (orbit), hacer zoom (dolly) y desplazar (pan) el globo con inercia suave y límites razonables.

#### Scenario: Rotar el globo
- **WHEN** el usuario arrastra con botón izquierdo (o un dedo en táctil)
- **THEN** el globo rota alrededor de su centro siguiendo el movimiento
- **AND** la rotación continúa con inercia al soltar

#### Scenario: Zoom con rueda/pellizco
- **WHEN** el usuario usa la rueda del ratón o gesto de pellizco
- **THEN** la cámara se acerca/aleja suavemente hacia/desde el punto bajo el puntero
- **AND** el zoom tiene límites: mínimo muestra toda la Tierra, máximo ~50 km de altitud

#### Scenario: Restablecer vista global
- **WHEN** el usuario pulsa el botón de vista global
- **THEN** la cámara vuelve a la posición inicial (lat 0, lon 0, distancia completa) con transición suave

#### Scenario: Pan (desplazamiento lateral)
- **WHEN** el usuario arrastra con botón derecho (o dos dedos en táctil)
- **THEN** la cámara se desplaza lateralmente sin rotar el globo

### Requirement: Territorios históricos en 3D
La aplicación SHALL dibujar los polígonos de ocupación histórica como mallas 3D sobre la esfera, con colores de fase/identidad/tinte religioso, opacidad según selección/hover, y tratamiento visual de decadencia/división.

#### Scenario: Territorio con color de fase
- **WHEN** una civilización está en fase "auge" en el año seleccionado
- **THEN** su territorio 3D usa el COLOR_FASE.auge definido en el diseño
- **AND** la opacidad de relleno coincide con la especificación 2D (0.38 seleccionado, 0.2 normal)

#### Scenario: División administrativa
- **WHEN** un territorio tiene nivel "division"
- **THEN** se renderiza con trazo discontinuo (dash 3 2) y opacidad reducida (0.12 normal)
- **AND** no oculta la polidad superior

#### Scenario: Decadencia visual
- **WHEN** una civilización está en fase "decadencia" o "muerte"
- **THEN** su territorio usa trazo discontinuo (dash 5 3) como en 2D

#### Scenario: Tinte religioso
- **WHEN** la capa de religiones está activa y la civilización tiene religiones vivas
- **THEN** el color del territorio proviene de `coloresReligiosos()` no de su color de identidad

### Requirement: Países actuales en 3D
La aplicación SHALL renderizar la capa de países modernos como contornos sobre la esfera, visibles solo desde su año de formación, con resaltado de selección/hover.

#### Scenario: País aparece en su formación
- **WHEN** el año seleccionado ≥ año de formación del país
- **THEN** el contorno del país se dibuja sobre la esfera
- **AND** antes de esa fecha el país no existe en el globo

#### Scenario: Selección de país
- **WHEN** el usuario hace click en un país actual
- **THEN** el país se resalta (línea más gruesa, color de acento)
- **AND** se muestra su etiqueta con nombre y año de formación

### Requirement: Ciudades en 3D
La aplicación SHALL mostrar las ciudades principales como marcadores 3D (puntos pulsantes) sobre la esfera, con etiquetas al hacer hover/selección.

#### Scenario: Marcador de ciudad visible
- **WHEN** una civilización viva tiene ciudades principales
- **THEN** cada ciudad aparece como un punto con aura pulsante en su posición geográfica
- **AND** el color coincide con el de la civilización

#### Scenario: Etiqueta de ciudad al hover
- **WHEN** el usuario pasa el ratón sobre una ciudad
- **THEN** aparece su nombre en una etiqueta billboard (siempre orientada a la cámara)

### Requirement: Etiquetas 3D con billboarding y anti-colisión
La aplicación SHALL colocar las etiquetas de regiones/territorios/países como texto 3D billboard (siempre frente a la cámara), evitando solapamientos con el mismo algoritmo de colocación que el 2D pero adaptado a coordenadas esféricas.

#### Scenario: Etiquetas de regiones dominantes
- **WHEN** una región tiene una civilización dominante visible
- **THEN** su etiqueta (nombre o abreviatura) aparece cerca de su ancla proyectada en 3D
- **AND** la etiqueta siempre mira a la cámara (billboarding)

#### Scenario: Anti-colisión en esfera
- **WHEN** varias etiquetas competirían por la misma zona de pantalla
- **THEN** el algoritmo de colocación las desplaza a posiciones alternativas en la esfera
- **AND** las de menor peso (peso < 8) se ocultan antes que las mayores

### Requirement: Leyenda y rosa de los vientos adaptadas a 3D
La aplicación SHALL mostrar la cartela (leyenda) y la rosa de los vientos como overlays 2D fijos en pantalla (no en el espacio 3D), manteniendo el mismo contenido y diseño visual que en 2D.

#### Scenario: Leyenda visible en 3D
- **WHEN** el modo 3D está activo
- **THEN** la cartela aparece en la misma posición relativa (esquina inferior izquierda)
- **AND** su contenido refleja el modo de color activo (identidad/fase/religiones)

#### Scenario: Rosa de los vientos fija
- **WHEN** el usuario rota el globo
- **THEN** la rosa de los vientos permanece fija en pantalla indicando el Norte geográfico
- **AND** no rota con el globo

### Requirement: Picking (hover/click) en 3D
La aplicación SHALL detectar qué territorio, país o ciudad está bajo el puntero usando raycasting contra las mallas 3D, y disparar los mismos callbacks `onHover` y `onSeleccionar` que la versión 2D.

#### Scenario: Hover sobre territorio
- **WHEN** el puntero pasa sobre un territorio 3D
- **THEN** `onHover(civId)` se dispara con la civilización correcta
- **AND** el territorio muestra estado visual de hover (opacidad 0.3, filtro brillo)

#### Scenario: Click selecciona civilización
- **WHEN** el usuario hace click en un territorio
- **THEN** `onSeleccionar(civId)` se dispara
- **AND** la civilización queda seleccionada (resaltada, ficha abierta)

#### Scenario: Click en fondo deselectiona
- **WHEN** el usuario hace click en el océano o espacio vacío
- **THEN** `onSeleccionar(null)` y `onSeleccionarPais(null)` se disparan

### Requirement: Modo 2D/3D intercambiable
La aplicación SHALL permitir alternar entre vista 2D (SVG actual) y vista 3D (globo) sin perder el estado (año, selección, filtros, capas, zoom/rotación equivalente).

#### Scenario: Cambio 2D → 3D
- **WHEN** el usuario activa el modo 3D
- **THEN** el globo carga en la misma posición geográfica (centro de vista, zoom equivalente)
- **AND** la selección, filtros y capas se mantienen

#### Scenario: Cambio 3D → 2D
- **WHEN** el usuario desactiva el modo 3D
- **THEN** el mapa SVG carga centrado en la misma región y zoom
- **AND** el estado completo se preserva

### Requirement: Rendimiento 60fps en escritorio
La aplicación SHALL mantener ≥ 55 fps en equipos de escritorio típicos (GPU integrada 2020+) con el año 2000 (máxima densidad de territorios ~2000) y todas las capas activas.

#### Scenario: Año 2000 con todas las capas
- **WHEN** el usuario selecciona 2000 con territorios, países, ciudades, religiones activas
- **THEN** el frame rate se mantiene ≥ 55 fps al rotar/zoomear
- **AND** el tiempo de carga inicial del globo < 3 segundos

#### Scenario: Memoria GPU razonable
- **WHEN** el globo está cargado con todos los territorios
- **THEN** el uso de memoria GPU < 500 MB