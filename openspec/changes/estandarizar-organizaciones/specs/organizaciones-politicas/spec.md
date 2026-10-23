# organizaciones-politicas Specification

## Purpose

Modelo común para representar organizaciones políticas —imperios, reinos, califatos, sultanatos, repúblicas, principados— con facetas, periodos, cargos, dinastías y lugares asociados a cada reinado.

## ADDED Requirements

### Requirement: Facetas de la organización política

La aplicación SHALL clasificar cada organización política con facetas independientes: entidad, escala política, forma de gobierno, soberanía, cargo principal y dinastía principal.

#### Scenario: Imperio con monarquía y sultanato

- **WHEN** el usuario consulta el Imperio Otomano
- **THEN** la ficha muestra escala «Imperio», forma «Monarquía», cargo «Sultán» y dinastía «Casa de Osmán»
- **AND** no se crea una capa distinta para los sultanatos

#### Scenario: Califato como teocracia

- **WHEN** una organización se registra como califato
- **THEN** puede declarar forma «Teocracia» y cargo principal «Califa»
- **AND** la ficha usa el título plural «Califas»

### Requirement: Periodos de una organización

La aplicación SHALL permitir que una organización tenga varios periodos con fechas, forma, cargo y dinastía propios.

#### Scenario: Fases del Imperio Otomano

- **WHEN** el usuario abre la ficha otomana
- **THEN** puede elegir entre beylicato, sultanato clásico, imperio y monarquía constitucional
- **AND** la lista de gobernantes se filtra por el periodo activo

#### Scenario: Periodo paralelo

- **WHEN** dos periodos de la misma organización se solapan porque representan ramas distintas
- **THEN** ambos se marcan como paralelos y la validación no los considera un error

### Requirement: Cargos y dinastías controlados

La aplicación SHALL usar catálogos de cargos y dinastías, con identificadores estables, nombre, plural y categoría.

#### Scenario: Título dinámico del gobierno

- **WHEN** el periodo activo tiene cargo «Sultán»
- **THEN** la sección de gobierno se titula «Sultanes»
- **AND** si el cargo es «Rey», se titula «Reyes»

#### Scenario: Dinastía compartida

- **WHEN** dos organizaciones son gobernadas por la misma casa
- **THEN** ambas pueden referenciar el mismo identificador de dinastía
- **AND** la ficha muestra el nombre de la casa sin duplicar el dato

### Requirement: Gobernantes como cargos con fechas

La aplicación SHALL representar cada gobernante como una persona que ocupa un cargo en una organización y, opcionalmente, en un periodo, con fechas y rol.

#### Scenario: Sultán otomano

- **WHEN** el usuario consulta a Mehmed II
- **THEN** ve su cargo, su dinastía, su periodo y sus años de gobierno
- **AND** la ficha no lo trata como una capa del mapa

#### Scenario: Regency o corregencia

- **WHEN** un gobernante no es titular
- **THEN** puede marcarse con rol «regente», «co-regente» o «pretendiente»
- **AND** la lista lo distingue del titular

### Requirement: Capitales con vigencia

La aplicación SHALL relacionar cada organización o periodo con una o varias capitales, indicando rol y años.

#### Scenario: Cambio de capital otomana

- **WHEN** el usuario recorre el Imperio Otomano
- **THEN** la ficha muestra Söğüt, Bursa, Edirne y Constantinopla con sus años
- **AND** solo aparecen las capitales que solapan el periodo activo

### Requirement: Ciudades importantes por gobernante

La aplicación SHALL relacionar cada gobernante con ciudades importantes de su reinado, con un rol y, si aplica, fechas y nota.

#### Scenario: Ciudades de un reinado

- **WHEN** el usuario consulta a Mehmed II
- **THEN** ve Constantinopla, Edirne, Trebisonda y Belgrado con su rol
- **AND** una ciudad de otro Estado, como Viena, puede aparecer como sede de un asedio sin contarse como ciudad propia del imperio

#### Scenario: Ciudad sin rol

- **WHEN** una relación ciudad-gobernante no declara rol
- **THEN** la validación falla y señala el registro

### Requirement: Validación de referencias y fechas

La aplicación SHALL validar que las facetas, periodos, cargos, dinastías, gobernantes y ciudades referenciados existen, y que las fechas son coherentes.

#### Scenario: Referencia rota

- **WHEN** un gobernante referencia un cargo o una dinastía inexistente
- **THEN** `npm run validate` falla con el identificador afectado

#### Scenario: Fechas fuera del periodo

- **WHEN** un gobernante tiene fechas fuera del periodo que declara
- **THEN** la validación lo avisa para revisar el dato
