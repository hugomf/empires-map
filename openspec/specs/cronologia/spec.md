# cronologia Specification

## Purpose

Línea de tiempo central que sitúa la vida, la cúspide y la decadencia de cada civilización, y permite navegar el atlas moviendo el año.

## Requirements

### Requirement: Riel temporal central
La aplicación SHALL presentar un riel temporal con las eras históricas, una curva de vitalidad, el indicador del año actual y los hitos relevantes.

#### Scenario: Año actual visible
- **WHEN** el usuario cambia el año
- **THEN** el indicador del riel se mueve a la posición correspondiente
- **AND** la era histórica activa se resalta

#### Scenario: Cambiar el año desde el riel
- **WHEN** el usuario pulsa o arrastra sobre el riel
- **THEN** el año del atlas cambia al punto seleccionado

### Requirement: Curva de vitalidad
La aplicación SHALL dibujar una curva con el número de civilizaciones vivas a lo largo del tiempo, normalizada para que se distingan los periodos de mayor densidad.

#### Scenario: Periodo de alta densidad
- **WHEN** el usuario observa un periodo con muchas civilizaciones simultáneas
- **THEN** la curva muestra un máximo local coherente con el catálogo

### Requirement: Gantt de vigencias
La aplicación SHALL mostrar una fila por civilización con una barra desde su año de inicio hasta su año de fin, diferenciando visualmente el apogeo y la decadencia.

#### Scenario: Leer la vida de una civilización
- **WHEN** el usuario mira la fila de una civilización
- **THEN** distingue el inicio, el fin, la ventana de cúspide y la ventana de decadencia
- **AND** la posición del año actual queda marcada sobre la barra

#### Scenario: Seleccionar desde el Gantt
- **WHEN** el usuario pulsa una fila
- **THEN** se selecciona esa civilización y se abre su ficha

### Requirement: Agrupación por región
La aplicación SHALL agrupar las filas de la cronología por región del mundo por defecto y permitir desactivar la agrupación.

#### Scenario: Agrupación activa
- **WHEN** el usuario mantiene activa «Agrupar por región»
- **THEN** las civilizaciones aparecen bajo cabeceras de región
- **AND** «Persia / Irán» queda en el mismo grupo

#### Scenario: Lista plana
- **WHEN** el usuario desactiva la agrupación
- **THEN** todas las filas aparecen en una sola lista ordenada por año de inicio

### Requirement: Hitos en el riel
La aplicación SHALL marcar en el riel los hitos de las civilizaciones de mayor peso y los de la civilización seleccionada.

#### Scenario: Hito de la civilización seleccionada
- **WHEN** el usuario selecciona una civilización
- **THEN** sus hitos aparecen marcados en el riel
- **AND** al pulsar un hito el año salta a ese momento

### Requirement: Búsqueda y filtros en la cronología
La aplicación SHALL aplicar a la cronología los mismos filtros y la misma búsqueda que al mapa, mostrando el número de coincidencias.

#### Scenario: Búsqueda activa
- **WHEN** el usuario escribe en el buscador
- **THEN** la cronología solo muestra las civilizaciones coincidentes
- **AND** indica cuántas coincidencias hay

#### Scenario: Sin resultados por filtros
- **WHEN** los filtros activos no dejan ninguna civilización
- **THEN** la cronología muestra un estado vacío con una acción para quitar los filtros

### Requirement: Sincronización con el mapa y la ficha
La aplicación SHALL mantener sincronizados el año y la civilización seleccionada entre el mapa, el riel, el Gantt y la ficha.

#### Scenario: Selección desde el mapa
- **WHEN** el usuario selecciona una civilización en el mapa
- **THEN** su fila del Gantt queda resaltada
- **AND** la ficha muestra esa civilización
