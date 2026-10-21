## ADDED Requirements

### Requirement: Niveles de organización política
La aplicación SHALL clasificar cada territorio como polidad soberana o división administrativa, y toda división SHALL declarar la entidad superior de la que depende.

#### Scenario: Virreinato dependiente de una corona
- **WHEN** el usuario consulta el virreinato de Nueva España en 1600
- **THEN** el territorio se marca como división administrativa
- **AND** su entidad superior es el Imperio español
- **AND** la ficha muestra «Parte de: Imperio español»

#### Scenario: División sin superior
- **WHEN** un territorio se declara división pero no indica su entidad superior
- **THEN** la validación de datos falla y señala el territorio

### Requirement: Soberanía y tipos políticos
La aplicación SHALL distinguir polidades soberanas de divisiones delegadas y SHALL reservar la categoría «país» para los Estados modernos.

#### Scenario: Califato y emirato
- **WHEN** el usuario consulta el califato abasí y el emirato aglabí
- **THEN** el califato se muestra como polidad soberana con el califa como jefe político y religioso
- **AND** el emirato se muestra como división delegada del califato
- **AND** ninguno se etiqueta como virreinato

#### Scenario: Categoría moderna
- **WHEN** el usuario consulta una entidad anterior al siglo XIX
- **THEN** la interfaz no la describe como «país»

### Requirement: Capa de divisiones administrativas
La aplicación SHALL ofrecer una capa de divisiones administrativas que se pueda activar y desactivar de forma independiente de las polidades.

#### Scenario: Ocultar divisiones
- **WHEN** el usuario desactiva la capa «Divisiones»
- **THEN** el mapa sigue mostrando las polidades soberanas
- **AND** desaparecen virreinatos, satrapías, provincias y emiratos

#### Scenario: Mostrar divisiones
- **WHEN** el usuario activa la capa «Divisiones»
- **THEN** las divisiones aparecen con un estilo secundario, sin tapar la polidad a la que pertenecen

### Requirement: Regiones modernas como contexto
La aplicación SHALL usar las regiones modernas solo como contexto cuando exista un polígono histórico para el año seleccionado.

#### Scenario: Persia frente a Irán
- **WHEN** el usuario selecciona 500 a.C.
- **THEN** el territorio aqueménida se pinta con su color
- **AND** la región moderna de Irán queda como contorno fantasma, sin competir por el color

#### Scenario: Sin polígono histórico
- **WHEN** no hay polígono histórico para una civilización viva
- **THEN** la región moderna puede teñirse para no dejar el mapa vacío

### Requirement: Fuente y confianza del trazado
La aplicación SHALL permitir declarar la fuente y el nivel de confianza de cada trazado histórico y SHALL indicar en la interfaz cuándo el dato es aproximado.

#### Scenario: Trazado de confianza baja
- **WHEN** el usuario abre la ficha de un territorio con confianza baja
- **THEN** la interfaz muestra la marca «aprox.»
- **AND** muestra la fuente si está declarada

#### Scenario: Trazado de confianza alta
- **WHEN** un territorio tiene confianza alta
- **THEN** la interfaz no muestra la marca de aproximación

### Requirement: Criterio documentado de fronteras históricas
La aplicación SHALL documentar si las fronteras históricas se basan en polígonos manuales o en una base GIS externa, y SHALL mantener la misma decisión para todos los trazados de una misma capa.

#### Scenario: Revisión de una frontera
- **WHEN** un colaborador añade un nuevo territorio
- **THEN** encuentra en la documentación del proyecto el criterio y la fuente esperada
- **AND** el validador rechaza un trazado sin la información mínima exigida
