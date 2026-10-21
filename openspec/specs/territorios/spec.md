# territorios Specification

## Purpose

Trazados aproximados de ocupación histórica que permiten pintar fronteras reales en lugar de teñir países modernos completos.

## Requirements

### Requirement: Polígonos de ocupación con fecha
La aplicación SHALL representar cada territorio como uno o varios anillos de coordenadas, con civilización, tipo, nombre opcional, ancla opcional y un intervalo de años opcional.

#### Scenario: Territorio válido para el año
- **WHEN** el año seleccionado cae dentro del intervalo `desde`–`hasta` de un territorio
- **THEN** el territorio se dibuja en el mapa
- **AND** si no tiene fechas se considera válido para toda la vida de su civilización

#### Scenario: Anillo cerrado
- **WHEN** un territorio se carga desde los datos
- **THEN** cada anillo tiene al menos cuatro puntos y su primer punto coincide con el último

### Requirement: Tipos de territorio
La aplicación SHALL distinguir entre territorios de tierra y territorios de ciudad, dibujando las ciudades a una escala legible aunque su polígono sea pequeño.

#### Scenario: Ciudad histórica
- **WHEN** el usuario observa una ciudad como Tiro, Sidón, Atenas o Cuzco
- **THEN** la ciudad se representa con un marcador y su etiqueta
- **AND** no se confunde con una extensión territorial completa

### Requirement: Territorios nombrados de Oriente Próximo
La aplicación SHALL incluir los territorios nombrados de las doce tribus de Israel, las ciudades fenicias (Tiro, Sidón, Biblos, Arwad), la pentápolis filistea (Gaza, Ascalón, Yavné, Gath, Ecrón) y las culturas de sumerios, asirios, babilonios, hititas, minoicos, micénicos y etruscos.

#### Scenario: Tribus de Israel
- **WHEN** el usuario selecciona un año del primer milenio a.C.
- **THEN** el mapa muestra los territorios de Judá, Benjamín, Efraín, Manasés, Neftalí y Galaad, entre otros

#### Scenario: Ciudades fenicias
- **WHEN** el usuario selecciona un año en que prosperan las ciudades fenicias
- **THEN** el mapa muestra la costa fenicia y las cuatro ciudades con su nombre

### Requirement: Imperio español y virreinatos
La aplicación SHALL representar el Imperio español y sus virreinatos americanos con sus fechas históricas: Nueva España (1535–1821), Perú (1542–1824), Nueva Granada (1717–1830), Río de la Plata (1776–1814) y Filipinas (1565–1898).

#### Scenario: Virreinato de Nueva España
- **WHEN** el usuario selecciona 1600
- **THEN** el mapa muestra el virreinato de Nueva España dentro de la Corona española
- **AND** no lo muestra antes de 1535 ni después de 1821

#### Scenario: Independencia del Perú
- **WHEN** el usuario avanza hasta 1825
- **THEN** el virreinato del Perú ya no se dibuja

### Requirement: Posesiones de Portugal y Gran Bretaña
La aplicación SHALL representar las posesiones de ultramar de Portugal y Gran Bretaña con sus intervalos históricos.

#### Scenario: Brasil portugués
- **WHEN** el usuario selecciona 1700
- **THEN** el mapa muestra Brasil como posesión portuguesa
- **AND** deja de mostrarlo como tal después de 1822

#### Scenario: India británica
- **WHEN** el usuario selecciona 1900
- **THEN** el mapa muestra la India británica, Canadá, Australia, Sudáfrica y Egipto como posesiones británicas

### Requirement: Conquistas de Alejandro Magno
La aplicación SHALL representar las fases fechadas de la expansión macedonia: Grecia (338 a.C.), Egipto (332 a.C.), Persia (330 a.C.), Asia Central (328 a.C.) e India (326 a.C.).

#### Scenario: Expansión por fases
- **WHEN** el usuario compara 330 a.C. y 323 a.C.
- **THEN** ve cómo el territorio macedonio incorpora Persia y Asia Central en la segunda fecha

### Requirement: Atenuación de la región moderna
La aplicación SHALL atenuar el relleno de una región moderna cuando un polígono histórico ocupa parte de ella, para que la frontera contemporánea no compita con la histórica.

#### Scenario: Persia histórica frente a Irán moderno
- **WHEN** el usuario selecciona 500 a.C.
- **THEN** el territorio aqueménida se pinta con su color
- **AND** la región moderna de Irán queda como contexto atenuado

### Requirement: Trazados aproximados y legibles
La aplicación SHALL aceptar trazados aproximados, priorizando la legibilidad y la coherencia histórica sobre la precisión cartográfica.

#### Scenario: Costa simplificada
- **WHEN** el usuario amplía un territorio con pocos vértices
- **THEN** el trazado sigue siendo reconocible como la región histórica representada
- **AND** no se generan artefactos visuales por auto-intersecciones
