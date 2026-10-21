# ficha Specification

## Purpose

Panel de detalle que explica una civilización concreta: su vigencia, su cúspide, su decadencia, sus textos históricos y sus hitos navegables.

## Requirements

### Requirement: Panel de detalle de civilización
La aplicación SHALL mostrar una ficha con el nombre, el tipo, la región, la duración, el color y los textos históricos de la civilización seleccionada.

#### Scenario: Abrir una ficha desde el mapa
- **WHEN** el usuario selecciona una civilización en el mapa
- **THEN** la ficha se abre con sus datos y textos
- **AND** el mapa y la cronología mantienen la selección

#### Scenario: Cambiar de civilización
- **WHEN** el usuario selecciona otra civilización
- **THEN** la ficha se actualiza sin cerrarse

### Requirement: Vigencia, cúspide y decadencia
La aplicación SHALL mostrar el intervalo de vigencia, la ventana de cúspide y la ventana de decadencia, y una barra de vida con la posición del año actual.

#### Scenario: Civilización en su apogeo
- **WHEN** el año seleccionado cae dentro del apogeo
- **THEN** la ficha indica la fase correspondiente y muestra la aguja dentro de la ventana de cúspide

#### Scenario: Civilización que aún no existía
- **WHEN** el año seleccionado es anterior al inicio de la civilización
- **THEN** la ficha indica «Aún no existía»

#### Scenario: Civilización ya desaparecida
- **WHEN** el año seleccionado es posterior a su fin
- **THEN** la ficha indica «Ya había desaparecido»

### Requirement: Textos históricos
La aplicación SHALL mostrar tres bloques de texto: la civilización, su caída y su legado.

#### Scenario: Leer la historia completa
- **WHEN** el usuario abre una ficha con textos disponibles
- **THEN** ve los tres bloques completos, sin truncarlos

### Requirement: Hitos navegables
La aplicación SHALL listar los hitos de la civilización con su año y permitir saltar al año de cada hito.

#### Scenario: Saltar a un hito
- **WHEN** el usuario pulsa un hito de la ficha
- **THEN** el año del atlas cambia al año del hito
- **AND** el hito se marca como activo

### Requirement: Estado vacío de la ficha
La aplicación SHALL mostrar un estado vacío que explique cómo seleccionar una civilización cuando no hay ninguna seleccionada.

#### Scenario: Ninguna selección
- **WHEN** el usuario abre la aplicación sin selección válida
- **THEN** la ficha muestra un texto que invita a elegir una civilización en el mapa, el riel o la cronología

### Requirement: Ficha adaptable a móvil
La aplicación SHALL presentar la ficha como un panel que se puede abrir y cerrar en pantallas pequeñas sin tapar por completo el mapa.

#### Scenario: Cerrar la ficha en móvil
- **WHEN** el usuario cierra la ficha en un móvil
- **THEN** el mapa recupera el espacio disponible
- **AND** la selección se conserva
