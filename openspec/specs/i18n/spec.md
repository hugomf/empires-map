# i18n Specification

## Purpose
Sistema de internacionalización que permite usar el atlas en español o en inglés, con inglés por defecto, persistencia de la preferencia y enlaces que conservan el idioma.

## Requirements

### Requirement: Selector de idioma
La aplicación SHALL ofrecer un selector ES / EN visible en la cabecera.

#### Scenario: Cambiar a español
- **WHEN** el usuario selecciona ES
- **THEN** toda la interfaz cambia a español sin recargar la página

#### Scenario: Cambiar a inglés
- **WHEN** el usuario selecciona EN
- **THEN** toda la interfaz cambia a inglés sin recargar la página

### Requirement: Inglés por defecto
La aplicación SHALL usar inglés en la primera visita, cuando no hay preferencia guardada ni idioma en el enlace.

#### Scenario: Primera visita
- **WHEN** el usuario abre la aplicación sin preferencia previa
- **THEN** la interfaz se muestra en inglés

### Requirement: Persistencia del idioma
La aplicación SHALL recordar el idioma elegido en `localStorage`.

#### Scenario: Volver a abrir la aplicación
- **WHEN** el usuario elige español y cierra la pestaña
- **THEN** al volver a abrirla la interfaz se muestra en español

### Requirement: Idioma en el enlace
La aplicación SHALL incluir el idioma en el fragmento de la URL y SHALL respetarlo al cargar un enlace compartido.

#### Scenario: Enlace con idioma
- **WHEN** el usuario abre `#es/1492/espana`
- **THEN** la aplicación carga en español, en 1492 y con España seleccionada

#### Scenario: Enlace antiguo sin idioma
- **WHEN** el usuario abre `#1492/espana`
- **THEN** la aplicación usa el idioma guardado o inglés por defecto
- **AND** reescribe el enlace con el idioma activo

### Requirement: Interfaz traducida
La aplicación SHALL obtener todos los textos de interfaz del diccionario del idioma activo, sin cadenas escritas directamente en los componentes.

#### Scenario: Estado vacío traducido
- **WHEN** el usuario cambia de idioma con una lista vacía
- **THEN** el mensaje de estado vacío aparece en el idioma elegido

### Requirement: Contenido histórico traducido
La aplicación SHALL mostrar nombres, abreviaturas, síntesis, caída, legado e hitos en el idioma activo cuando exista traducción.

#### Scenario: Ficha en inglés
- **WHEN** el usuario abre la ficha de una civilización en inglés
- **THEN** los textos históricos aparecen en inglés
- **AND** las fechas y los identificadores se mantienen

### Requirement: Aviso de contenido no traducido
La aplicación SHALL avisar cuando parte del contenido histórico solo esté disponible en español, en lugar de mezclar idiomas en silencio.

#### Scenario: Texto sin traducción
- **WHEN** un texto inglés falta y se muestra el español
- **THEN** la ficha muestra un aviso de que ese contenido está en español

### Requirement: Formato de años y siglos por idioma
La aplicación SHALL formatear años, eras, siglos y rangos según las convenciones del idioma activo.

#### Scenario: Año antes de Cristo
- **WHEN** el idioma es inglés y el año es -500
- **THEN** se muestra «500 BC»
- **AND** en español se muestra «500 a.C.»

#### Scenario: Siglo
- **WHEN** la interfaz muestra un siglo
- **THEN** usa «5th century BC» en inglés y «siglo V a.C.» en español
