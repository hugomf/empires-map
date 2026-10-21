# cultura-material Specification

## Purpose

Contenido de cultura material de cada civilización —artefactos, ciudades y escritura— presentado en la ficha como complemento a su historia política.

## ADDED Requirements

### Requirement: Panel de cultura material
La aplicación SHALL mostrar una pestaña de cultura con los artefactos de la civilización seleccionada, incluyendo nombre, tipo, material, descripción e icono.

#### Scenario: Civilización con artefactos
- **WHEN** el usuario abre la pestaña «Cultura» de una civilización con artefactos
- **THEN** ve una tarjeta por artefacto con su icono, nombre y descripción
- **AND** el material se muestra cuando está declarado

#### Scenario: Artefacto sin icono
- **WHEN** un artefacto referencia un icono inexistente
- **THEN** la validación de datos falla antes del build

### Requirement: Catálogo de ciudades
La aplicación SHALL listar las ciudades históricas de cada civilización con su nombre original y, cuando se conozca, su nombre actual.

#### Scenario: Ciudades de una civilización
- **WHEN** el usuario abre la pestaña «Cultura» de una civilización con ciudades
- **THEN** ve la lista de ciudades
- **AND** cada ciudad muestra su nombre actual si difiere del histórico

### Requirement: Sistema de escritura
La aplicación SHALL mostrar el sistema de escritura de la civilización cuando esté documentado.

#### Scenario: Escritura registrada
- **WHEN** el usuario consulta una civilización con escritura registrada
- **THEN** la ficha muestra el nombre del sistema de escritura
- **AND** no lo inventa si el dato no existe

### Requirement: Iconos SVG propios
La aplicación SHALL representar los artefactos con iconos SVG propios, sin depender de imágenes remotas ni de fuentes de iconos externas.

#### Scenario: Carga sin red
- **WHEN** la aplicación se abre sin conexión
- **THEN** los iconos de artefactos siguen visibles
- **AND** no se realiza ninguna petición externa para mostrarlos

### Requirement: Estado vacío de cultura
La aplicación SHALL mostrar un estado vacío por sección cuando una civilización no tenga artefactos, ciudades o escritura registrados.

#### Scenario: Civilización sin artefactos
- **WHEN** el usuario abre la pestaña «Cultura» de una civilización sin artefactos
- **THEN** la sección de artefactos muestra «Sin registro»
- **AND** el resto de secciones sigue visible

### Requirement: Contenido cultural validado
La aplicación SHALL validar que cada artefacto y cada ciudad referencian una civilización existente y que sus campos obligatorios están completos.

#### Scenario: Referencia inexistente
- **WHEN** un artefacto apunta a una civilización que no existe
- **THEN** `npm run validate` falla y nombra el artefacto
