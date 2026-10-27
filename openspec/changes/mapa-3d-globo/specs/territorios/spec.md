# Spec Delta

## MODIFIED Requirements

### Requirement: Polígonos de ocupación con fecha
La aplicación SHALL representar cada territorio como uno o varios anillos de coordenadas, con civilización, tipo, nombre opcional, ancla opcional y un intervalo de años opcional. En modo 3D, los anillos se triangulan (earcut) y se proyectan a coordenadas esféricas (x,y,z) sobre la esfera de radio 1.

#### Scenario: Territorio válido para el año
- **WHEN** el año seleccionado cae dentro del intervalo `desde`–`hasta` de un territorio
- **THEN** el territorio se dibuja en el mapa/globo
- **AND** si no tiene fechas se considera válido para toda la vida de su civilización

#### Scenario: Anillo cerrado
- **WHEN** un territorio se carga desde los datos
- **THEN** cada anillo tiene al menos cuatro puntos y su primer punto coincide con el último

#### Scenario: Triangulación válida para 3D
- **WHEN** `npm run validate` ejecuta la validación de geometría 3D
- **THEN** cada anillo se triangula sin errores (earcut no lanza excepción)
- **AND** la malla resultante no tiene triángulos degenerados (área > epsilon)
- **AND** no hay auto-intersecciones en la malla proyectada a esfera

### Requirement: Tipos de territorio
La aplicación SHALL distinguir entre territorios de tierra y territorios de ciudad, dibujando las ciudades a una escala legible aunque su polígono sea pequeño. En 3D, las ciudades son puntos billboard con aura, no mallas.

#### Scenario: Ciudad histórica
- **WHEN** el usuario observa una ciudad como Tiro, Sidón, Atenas o Cuzco
- **THEN** la ciudad se representa con un marcador y su etiqueta
- **AND** no se confunde con una extensión territorial completa

#### Scenario: Ciudad en 3D
- **WHEN** el modo 3D está activo
- **THEN** las ciudades tipo "ciudad" se renderizan como puntos pulsantes (billboard) en su coordenada esférica
- **AND** su tamaño en pantalla es constante independientemente del zoom (mínimo 8px, máximo 32px)

### Requirement: Atenuación de la región moderna
La aplicación SHALL atenuar el relleno de una región moderna cuando un polígono histórico ocupa parte de ella, para que la frontera contemporánea no compita con la histórica. En 3D, la región moderna se dibuja como contorno fantasma (wireframe) bajo el territorio histórico.

#### Scenario: Persia histórica frente a Irán moderno
- **WHEN** el usuario selecciona 500 a.C.
- **THEN** el territorio aqueménida se pinta con su color sobre la esfera
- **AND** la región moderna de Irán queda como contorno fantasma (línea fina, opacidad 0.15)

### Requirement: Trazados aproximados y legibles
La aplicación SHALL aceptar trazados aproximados, priorizando la legibilidad y la coherencia histórica sobre la precisión cartográfica. En 3D, la simplificación de vértices (Douglas-Peucker) se aplica antes de triangutar para evitar mallas excesivamente densas.

#### Scenario: Costa simplificada
- **WHEN** el usuario amplía un territorio con pocos vértices
- **THEN** el trazado sigue siendo reconocible como la región histórica representada
- **AND** no se generan artefactos visuales por auto-intersecciones

#### Scenario: Simplificación para 3D
- **WHEN** un territorio tiene > 500 vértices totales
- **THEN** se aplica simplificación Douglas-Peucker (tolerancia 0.01°) antes de triangutar
- **AND** la malla resultante tiene ≤ 500 vértices sin pérdida visual apreciable a zoom máximo

### Requirement: Capa de divisiones administrativas
La aplicación SHALL ofrecer una capa de divisiones administrativas que se pueda activar y desactivar de forma independiente de las polidades. En 3D, las divisiones usan el mismo estilo secundario (trazo discontinuo, opacidad reducida).

#### Scenario: Ocultar divisiones
- **WHEN** el usuario desactiva la capa «Divisiones»
- **THEN** el mapa/globo sigue mostrando las polidades soberanas
- **AND** desaparecen virreinatos, satrapías, provincias y emiratos

#### Scenario: Mostrar divisiones
- **WHEN** el usuario activa la capa «Divisiones»
- **THEN** las divisiones aparecen con un estilo secundario, sin tapar la polidad a la que pertenecen

### Requirement: Regiones modernas como contexto
La aplicación SHALL usar las regiones modernas solo como contexto cuando exista un polígono histórico para el año seleccionado. En 3D, son wireframes fantasma.

#### Scenario: Persia frente a Irán
- **WHEN** el usuario selecciona 500 a.C.
- **THEN** el territorio aqueménida se pinta con su color
- **AND** la región moderna de Irán queda como contorno fantasma, sin competir por el color

#### Scenario: Sin polígono histórico
- **WHEN** no hay polígono histórico para una civilización viva
- **THEN** la región moderna puede teñirse para no dejar el mapa/globo vacío

### Requirement: Fuente y confianza del trazado
La aplicación SHALL permitir declarar la fuente y el nivel de confianza de cada trazado histórico y SHALL indicar en la interfaz cuándo el dato es aproximado. En 3D, la marca «aprox.» aparece en la ficha del territorio, no en la malla.

#### Scenario: Trazado de confianza baja
- **WHEN** el usuario abre la ficha de un territorio con confianza baja
- **THEN** la interfaz muestra la marca «aprox.»
- **AND** muestra la fuente si está declarada