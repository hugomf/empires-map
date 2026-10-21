## ADDED Requirements

### Requirement: Alias históricos
La aplicación SHALL permitir que cada civilización declare nombres alternativos y SHALL usarlos en la búsqueda sin cambiar el nombre canónico mostrado.

#### Scenario: Buscar por alias
- **WHEN** el usuario escribe «Bizancio»
- **THEN** aparece la civilización bizantina con su nombre canónico
- **AND** no se crea un resultado duplicado

#### Scenario: Alias en varios idiomas
- **WHEN** el usuario escribe «Persia» o «Iran» en la interfaz inglesa
- **THEN** aparecen las civilizaciones persas correspondientes

### Requirement: Búsqueda independiente del filtro de menores
La aplicación SHALL incluir las civilizaciones menores en los resultados cuando hay una búsqueda activa, aunque el filtro «Mostrar menores» esté desactivado.

#### Scenario: Menor buscada expresamente
- **WHEN** el usuario busca «navajo» con el filtro de menores desactivado
- **THEN** la civilización navajo aparece en los resultados
- **AND** la cronología indica que se están incluyendo menores

#### Scenario: Sin búsqueda
- **WHEN** el usuario borra la búsqueda
- **THEN** vuelve a aplicarse el filtro de menores

### Requirement: Selección de una menor desde la búsqueda
La aplicación SHALL permitir abrir y consultar una civilización menor encontrada por la búsqueda aunque el filtro de menores esté desactivado.

#### Scenario: Abrir la ficha de una menor
- **WHEN** el usuario selecciona una civilización menor desde los resultados
- **THEN** su ficha se abre con normalidad
- **AND** su selección no se pierde al cerrar el buscador

### Requirement: Alias sin ambigüedad
La aplicación SHALL validar que los alias no estén vacíos, no se repitan dentro de una civilización y no coincidan con el nombre canónico de otra.

#### Scenario: Alias duplicado
- **WHEN** dos civilizaciones declaran el mismo alias
- **THEN** la validación de datos falla y muestra ambas
