# datos Specification

## Purpose

Capa de datos normalizada y validada que alimenta el atlas, con controles automáticos para evitar identificadores duplicados, fechas imposibles, geometrías rotas y texto corrupto.

## Requirements

### Requirement: Fuente JSON normalizada
La aplicación SHALL mantener los datos del atlas en archivos JSON separados por dominio: civilizaciones, regiones, hitos y territorios, además de las adiciones modulares.

#### Scenario: Datos legibles por cualquier herramienta
- **WHEN** un script o un agente lee `datos/civilizaciones.json`
- **THEN** obtiene una lista de objetos con campos estables y sin dependencias del código de la interfaz

### Requirement: Validación de integridad antes del build
La aplicación SHALL ejecutar una validación de los datos antes de compilar y SHALL fallar el build si encuentra identificadores duplicados, fechas imposibles o regiones inexistentes.

#### Scenario: Identificador duplicado
- **WHEN** dos civilizaciones comparten el mismo `id`
- **THEN** `npm run validate` falla y señala los identificadores repetidos

#### Scenario: Fechas incoherentes
- **WHEN** una civilización termina antes de empezar o su apogeo cae fuera de su vigencia
- **THEN** la validación falla con el registro afectado

#### Scenario: Región inexistente
- **WHEN** una civilización referencia una región que no existe
- **THEN** la validación falla y nombra la región desconocida

### Requirement: Validación geométrica
La aplicación SHALL validar los polígonos de territorio y rechazar anillos sin cerrar, con menos de cuatro puntos, con coordenadas fuera de rango o con auto-intersecciones.

#### Scenario: Anillo abierto
- **WHEN** un anillo no cierra sobre su primer punto
- **THEN** la validación falla y señala el territorio y el anillo

#### Scenario: Coordenadas imposibles
- **WHEN** una coordenada tiene una longitud o una latitud fuera de rango
- **THEN** la validación falla antes de generar el build

### Requirement: Detección de texto corrupto
La aplicación SHALL rechazar textos con caracteres ajenos al español, como ideogramas chinos, cirílico o caracteres de sustitución, para evitar contenido corrupto en la interfaz.

#### Scenario: Texto con ideogramas
- **WHEN** una síntesis contiene caracteres CJK
- **THEN** la validación falla y muestra el campo afectado

### Requirement: Adiciones modulares
La aplicación SHALL permitir añadir civilizaciones, regiones y territorios desde archivos de adiciones sin reescribir el catálogo base.

#### Scenario: Nueva civilización en un archivo de adiciones
- **WHEN** se añade una civilización a `adiciones.json`
- **THEN** el catálogo generado la incluye sin duplicar las existentes

### Requirement: Catálogos en español e inglés
La aplicación SHALL generar un paquete de datos en español y otro en inglés con la misma estructura, para que la interfaz pueda cambiar de idioma sin cambiar de modelo.

#### Scenario: Mismo identificador en ambos idiomas
- **WHEN** se compara una civilización en el catálogo español y en el inglés
- **THEN** ambos conservan el mismo `id` y las mismas fechas
- **AND** solo cambian los textos traducibles

### Requirement: Paquete de datos generado
La aplicación SHALL generar un módulo TypeScript a partir de los JSON para que la interfaz consuma los datos con tipos y sin leer archivos en tiempo de ejecución.

#### Scenario: Build sin acceso al sistema de archivos
- **WHEN** se compila la aplicación para producción
- **THEN** los datos ya están incluidos en el bundle
- **AND** la interfaz no realiza peticiones para cargarlos

### Requirement: Validación reproducible en local y en CI
La aplicación SHALL exponer la validación de datos como un comando reutilizable (`npm run validate`) que se ejecute igual en local y en integración continua.

#### Scenario: Ejecutar la validación manualmente
- **WHEN** el usuario ejecuta `npm run validate`
- **THEN** obtiene un resumen con el número de registros comprobados
- **AND** el comando termina con código distinto de cero si hay errores
