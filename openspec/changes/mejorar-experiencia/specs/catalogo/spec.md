## ADDED Requirements

### Requirement: Acciones en los estados vacíos

La aplicación SHALL ofrecer una acción concreta cuando una búsqueda o unos filtros no devuelven resultados.

#### Scenario: Búsqueda sin coincidencias

- **WHEN** la búsqueda no coincide con ninguna civilización
- **THEN** el estado vacío muestra el término buscado
- **AND** ofrece un botón para limpiar la búsqueda

#### Scenario: Filtros sin coincidencias

- **WHEN** los filtros activos no dejan ninguna civilización
- **THEN** el estado vacío explica qué filtros están activos
- **AND** ofrece un botón para quitarlos todos

### Requirement: Persistencia de búsqueda y filtros en el enlace

La aplicación SHALL reflejar la búsqueda y los filtros activos en el enlace compartido.

#### Scenario: Compartir una búsqueda

- **WHEN** el usuario comparte un enlace con una búsqueda activa
- **THEN** al abrirlo el buscador aparece relleno con el mismo término
- **AND** los resultados coinciden con los originales
