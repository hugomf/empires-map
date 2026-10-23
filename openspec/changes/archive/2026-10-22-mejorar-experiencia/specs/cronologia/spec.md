## ADDED Requirements

### Requirement: Zoom y paneo temporal en la cronología

La aplicación SHALL permitir ampliar y desplazar la ventana temporal de la cronología sin cambiar el año seleccionado.

#### Scenario: Acercar un periodo

- **WHEN** el usuario acerca la cronología sobre el siglo V a.C.
- **THEN** el Gantt y el riel muestran solo ese periodo con más detalle
- **AND** el año seleccionado no cambia

#### Scenario: Ver todo

- **WHEN** el usuario pulsa «Ver todo»
- **THEN** la cronología vuelve al rango completo del catálogo

#### Scenario: Ventana de contexto

- **WHEN** la cronología está ampliada
- **THEN** una barra de contexto indica qué parte del rango total se está viendo
- **AND** se puede arrastrar esa ventana para desplazarse

### Requirement: Navegación por teclado en la cronología

La aplicación SHALL permitir recorrer las filas del Gantt y mover la ventana temporal con el teclado.

#### Scenario: Recorrer filas

- **WHEN** el usuario entra en el Gantt con Tab y usa las flechas arriba y abajo
- **THEN** el foco recorre las filas de civilizaciones
- **AND** Enter selecciona la fila enfocada

#### Scenario: Mover la ventana temporal

- **WHEN** el usuario pulsa las teclas de desplazamiento con la cronología enfocada
- **THEN** la ventana temporal se mueve sin alterar la selección
