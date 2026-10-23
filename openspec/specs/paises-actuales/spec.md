# paises-actuales Specification

## Purpose
Capa y panel de los Estados contemporáneos que explica cuándo y cómo tomó forma cada país actual, sin retrotraerlos a épocas anteriores a su formación.

## Requirements

### Requirement: Modelo de país actual
La aplicación SHALL representar cada país actual con código ISO 3166-1 alpha-2, nombre, año de formación, tipo de proceso, nota y fuente opcional.

#### Scenario: Ficha de un país
- **WHEN** el usuario consulta un país actual
- **THEN** ve su nombre, año de formación y tipo de proceso
- **AND** ve la nota que explica el caso concreto

### Requirement: Capa de países actuales
La aplicación SHALL ofrecer una capa «Países actuales» independiente de las capas históricas, activable y desactivable.

#### Scenario: Activar la capa
- **WHEN** el usuario activa «Países actuales»
- **THEN** el mapa dibuja los países formados hasta el año seleccionado
- **AND** la leyenda identifica la capa

#### Scenario: Desactivar la capa
- **WHEN** el usuario desactiva «Países actuales»
- **THEN** el mapa vuelve a mostrar solo las capas históricas activas

### Requirement: No pintar antes de la formación
La aplicación SHALL ocultar un país en los años anteriores a su formación.

#### Scenario: Estados Unidos en 1700
- **WHEN** el usuario selecciona 1700
- **THEN** Estados Unidos no aparece en el mapa

#### Scenario: Estados Unidos en 1800
- **WHEN** el usuario selecciona 1800
- **THEN** Estados Unidos aparece como país formado

### Requirement: Tipos de formación
La aplicación SHALL clasificar la formación de cada país como independencia, unificación, constitución, reconocimiento o sucesión, y SHALL mostrarlo con una etiqueta comprensible.

#### Scenario: Unificación
- **WHEN** el usuario consulta un país formado por unificación
- **THEN** la etiqueta indica «Unificación» y no «Independencia»

#### Scenario: Sucesión
- **WHEN** el usuario consulta un país que sucede a un Estado anterior
- **THEN** la nota identifica el predecesor

### Requirement: Matices de fecha
La aplicación SHALL distinguir las fechas exactas de las aproximadas y SHALL poder expresar «estado moderno desde…» cuando la formación sea gradual.

#### Scenario: Fecha aproximada
- **WHEN** un país tiene `aproximada: true`
- **THEN** la interfaz muestra «aprox.» junto al año

#### Scenario: Formación gradual
- **WHEN** la nota indica un proceso gradual
- **THEN** el panel no presenta la fecha como una independencia exacta

### Requirement: Separación de capas históricas y modernas
La aplicación SHALL evitar mezclar países contemporáneos con imperios antiguos en la misma capa visual.

#### Scenario: Ambas capas activas
- **WHEN** el usuario activa a la vez una capa histórica y la de países actuales
- **THEN** los países se dibujan como contorno y las polidades históricas conservan el relleno

### Requirement: Panel de países actuales
La aplicación SHALL incluir un panel con los países ordenados por año de formación, con acceso al año correspondiente.

#### Scenario: Orden por formación
- **WHEN** el usuario abre el panel de países
- **THEN** los países aparecen ordenados de más antiguo a más reciente
- **AND** al seleccionar uno el año salta a su formación

### Requirement: Datos de formación validados
La aplicación SHALL validar que cada país tiene un código ISO válido y único, un año de formación coherente y una nota explicativa.

#### Scenario: Código duplicado
- **WHEN** dos países comparten el mismo código ISO
- **THEN** `npm run validate` falla y señala el código repetido
