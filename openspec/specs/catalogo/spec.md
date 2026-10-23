# catalogo Specification

## Purpose

Catálogo de civilizaciones y regiones que alimenta el mapa, la cronología y la ficha, con filtros y búsqueda para encontrar cualquier cultura por nombre, época o texto.

## Requirements

### Requirement: Catálogo de civilizaciones y regiones
La aplicación SHALL mantener un catálogo de más de 130 civilizaciones y 39 regiones, con nombre, abreviatura, tipo, región, fechas de inicio y fin, ventana de apogeo, ventana de decadencia, peso, color, textos históricos e hitos.

#### Scenario: Ficha completa de una civilización
- **WHEN** el usuario selecciona una civilización del catálogo
- **THEN** la aplicación dispone de todos sus campos obligatorios para pintar el mapa y la ficha

#### Scenario: Cobertura temporal
- **WHEN** el usuario recorre el rango completo del catálogo
- **THEN** encuentra civilizaciones desde el 45 000 a.C. hasta 2026

### Requirement: Tipos y escala editorial
La aplicación SHALL clasificar cada civilización por tipo (imperio, reino, estado, dinastía, cultura, pueblo o confederación) y por escala (mayor o menor), derivando la escala del peso cuando no esté definida.

#### Scenario: Escala derivada
- **WHEN** una civilización no declara escala y su peso es mayor o igual que 5
- **THEN** se considera mayor
- **AND** con peso menor que 5 se considera menor

### Requirement: Filtros combinables
La aplicación SHALL permitir filtrar por tipo, por grupo de región del mundo y por escala, combinando todos los filtros activos con semántica AND.

#### Scenario: Filtrar por tipo y región
- **WHEN** el usuario activa el tipo «imperio» y la región «Asia»
- **THEN** solo se muestran imperios asiáticos
- **AND** el contador de filtros activos refleja ambas selecciones

#### Scenario: Ocultar civilizaciones menores
- **WHEN** el usuario desactiva «Mostrar menores»
- **THEN** las civilizaciones de escala menor desaparecen del mapa, del riel y de la cronología

#### Scenario: Quitar todos los filtros
- **WHEN** el usuario pulsa «Quitar filtros»
- **THEN** se limpian los tipos, los grupos y se vuelven a mostrar las menores

### Requirement: Búsqueda tolerante a acentos
La aplicación SHALL buscar sin distinguir mayúsculas, minúsculas ni acentos en el nombre, la abreviatura, el tipo, la región, la síntesis y los hitos de cada civilización.

#### Scenario: Buscar sin acentos
- **WHEN** el usuario escribe «iran» o «Irán»
- **THEN** aparecen los mismos resultados
- **AND** se incluyen las civilizaciones cuya región es «Persia / Irán»

### Requirement: Búsqueda en textos e hitos
La aplicación SHALL encontrar civilizaciones por palabras contenidas en su síntesis histórica o en sus hitos, no solo por el nombre.

#### Scenario: Buscar por un hito
- **WHEN** el usuario escribe una palabra que solo aparece en un hito
- **THEN** la civilización correspondiente aparece en los resultados
- **AND** la cronología muestra el número de coincidencias

### Requirement: Selección desde los resultados
La aplicación SHALL permitir seleccionar el primer resultado de la búsqueda con Enter y saltar al centro de su apogeo.

#### Scenario: Enter sobre el primer resultado
- **WHEN** el usuario escribe una búsqueda y pulsa Enter
- **THEN** se selecciona la primera civilización resultante
- **AND** el año salta al punto medio de su apogeo
- **AND** se abre su ficha

#### Scenario: Limpiar la búsqueda
- **WHEN** el usuario pulsa Escape dentro del buscador
- **THEN** la búsqueda se vacía y se restablecen los resultados

### Requirement: Mensajes de resultados vacíos
La aplicación SHALL explicar por qué no hay resultados distinguiendo entre una búsqueda sin coincidencias y unos filtros sin coincidencias.

#### Scenario: Búsqueda sin coincidencias
- **WHEN** la búsqueda no coincide con ninguna civilización
- **THEN** la cronología muestra un mensaje que menciona la búsqueda y los filtros activos

### Requirement: Catálogo de pueblos menores
La aplicación SHALL incluir pueblos y culturas menores junto a los grandes imperios, con ejemplos como navajo, tarahumaras, purépecha, aborígenes australianos, san, khoi, fulani, hausa, yoruba, igbo, vikingos, búlgaros, húngaros, tibetanos, majapahit, maratha y sikh.

#### Scenario: Encontrar un pueblo menor
- **WHEN** el usuario busca «vikingos»
- **THEN** encuentra la civilización vikinga con sus territorios de Escandinavia, Islandia, Normandía y Dublín

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
