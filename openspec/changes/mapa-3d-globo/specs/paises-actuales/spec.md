# Spec Delta

## MODIFIED Requirements

### Requirement: Capa de países actuales
La aplicación SHALL ofrecer una capa «Países actuales» independiente de las capas históricas, activable y desactivable. En 3D, los países se renderizan como contornos (líneas) sobre la esfera, no como rellenos.

#### Scenario: Activar la capa
- **WHEN** el usuario activa «Países actuales»
- **THEN** el mapa/globo dibuja los países formados hasta el año seleccionado
- **AND** la leyenda identifica la capa

#### Scenario: Desactivar la capa
- **WHEN** el usuario desactiva «Países actuales»
- **THEN** el mapa/globo vuelve a mostrar solo las capas históricas activas

#### Scenario: Países en 3D como contornos
- **WHEN** el modo 3D está activo y la capa «Países actuales» está activa
- **THEN** cada país se renderiza como una línea (wireframe) sobre la esfera
- **AND** el grosor de línea es 1.5px (seleccionado 3px)
- **AND** el color es neutro (gris claro) para no competir con territorios históricos

### Requirement: No pintar antes de la formación
La aplicación SHALL ocultar un país en los años anteriores a su formación. Igual en 2D y 3D.

#### Scenario: Estados Unidos en 1700
- **WHEN** el usuario selecciona 1700
- **THEN** Estados Unidos no aparece en el mapa/globo

#### Scenario: Estados Unidos en 1800
- **WHEN** el usuario selecciona 1800
- **THEN** Estados Unidos aparece como país formado

### Requirement: Separación de capas históricas y modernas
La aplicación SHALL evitar mezclar países contemporáneos con imperios antiguos en la misma capa visual. En 3D, los países modernos son solo contornos; los territorios históricos son rellenos.

#### Scenario: Ambas capas activas
- **WHEN** el usuario activa a la vez una capa histórica y la de países actuales
- **THEN** los países se dibujan como contorno y las polidades históricas conservan el relleno
- **AND** en 3D, el contorno del país moderno queda por encima del relleno histórico (depth offset)

### Requirement: Datos de formación validados
La aplicación SHALL validar que cada país tiene un código ISO válido y único, un año de formación coherente y una nota explicativa. La validación de geometría 3D también comprueba que la proyección esférica del país no tiene auto-intersecciones.

#### Scenario: Código duplicado
- **WHEN** dos países comparten el mismo código ISO
- **THEN** `npm run validate` falla y señala el código repetido

#### Scenario: Geometría 3D válida
- **WHEN** `npm run validate` ejecuta la validación de geometría 3D
- **THEN** la malla esférica de cada país se triangula sin errores
- **AND** no hay triángulos invertidos ni auto-intersecciones