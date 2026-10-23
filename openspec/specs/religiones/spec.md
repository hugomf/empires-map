# religiones Specification

## Purpose
Modelo y presentación de las religiones y deidades históricas, separado del catálogo de civilizaciones, para mostrar qué creencias acompañaban a cada cultura y cómo cambiaron con el tiempo.

## Requirements

### Requirement: Religión como modelo independiente
La aplicación SHALL representar cada religión con identificador, nombre, descripción, periodo y civilización asociada, sin tratarla como una civilización.

#### Scenario: Religión en el catálogo
- **WHEN** el usuario consulta una religión
- **THEN** ve su nombre, descripción y periodo
- **AND** no aparece como una polidad ni tiñe una región por sí sola

### Requirement: Zoroastrismo persa
La aplicación SHALL registrar el zoroastrismo como religión de las civilizaciones persas y SHALL mantenerlo fuera del catálogo de civilizaciones.

#### Scenario: Persia aqueménida
- **WHEN** el usuario consulta los aqueménidas en 500 a.C.
- **THEN** la ficha muestra el zoroastrismo como religión principal
- **AND** el zoroastrismo no aparece como civilización en el buscador

#### Scenario: Continuidad persa
- **WHEN** el usuario recorre partos, sasánidas y safávidas
- **THEN** el zoroastrismo se mantiene asociado con su periodo correspondiente

### Requirement: Religiones y deidades por civilización
La aplicación SHALL vincular cada religión y cada deidad a una civilización existente y SHALL mostrar las deidades con su dominio.

#### Scenario: Deidades de una civilización
- **WHEN** el usuario abre la pestaña de religión de una civilización con deidades registradas
- **THEN** ve el nombre y el dominio de cada deidad

#### Scenario: Civilización sin deidades
- **WHEN** una civilización no tiene deidades registradas
- **THEN** la sección muestra «Sin registro» sin romper la ficha

### Requirement: Religión principal en la ficha
La aplicación SHALL mostrar la religión principal de la civilización para el año seleccionado, si existe.

#### Scenario: Religión vigente
- **WHEN** el año seleccionado cae dentro del periodo de una religión
- **THEN** la ficha la muestra como religión principal
- **AND** indica su periodo

### Requirement: Cambio religioso en el tiempo
La aplicación SHALL actualizar la religión mostrada cuando el año seleccionado cambia de un periodo religioso a otro.

#### Scenario: Roma de politeísmo a cristianismo
- **WHEN** el usuario compara Roma en 100 d.C. y en 400 d.C.
- **THEN** la religión principal cambia del politeísmo romano al cristianismo
- **AND** el cambio respeta las fechas registradas

### Requirement: Capa y filtro de religiones
La aplicación SHALL ofrecer un filtro de religiones y una capa de tinte religioso independientes de las capas de civilizaciones.

#### Scenario: Activar el tinte religioso
- **WHEN** el usuario activa la capa de religiones
- **THEN** el mapa muestra el tinte religioso y la leyenda lo explica
- **AND** las civilizaciones siguen siendo consultables

#### Scenario: Filtrar religiones
- **WHEN** el usuario selecciona una religión en el filtro
- **THEN** la lista y la ficha muestran solo las civilizaciones asociadas a esa religión

### Requirement: Las religiones no se duplican como civilizaciones
La aplicación SHALL impedir que una religión se registre también como civilización y SHALL validar esa separación en los datos.

#### Scenario: Registro duplicado
- **WHEN** un identificador de religión coincide con uno de civilización
- **THEN** la validación falla y señala el conflicto
