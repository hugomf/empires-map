## ADDED Requirements

### Requirement: Enlace compartido con estado completo

La aplicación SHALL incluir en el enlace el año, la civilización seleccionada, los filtros, las capas activas, la densidad de etiquetas y el idioma.

#### Scenario: Compartir una vista filtrada

- **WHEN** el usuario configura un año, una civilización y unos filtros y pulsa «Copiar enlace»
- **THEN** el enlace copiado reproduce esa misma vista al abrirlo
- **AND** la confirmación se anuncia a los lectores de pantalla

#### Scenario: Enlace antiguo

- **WHEN** el usuario abre un enlace con el formato anterior, sin filtros ni idioma
- **THEN** la aplicación carga con los valores por defecto
- **AND** reescribe el enlace con el estado completo

### Requirement: Densidad de etiquetas configurable

La aplicación SHALL ofrecer un control de densidad de etiquetas con los modos automático, todas y ninguna, y SHALL recordar la elección.

#### Scenario: Modo automático

- **WHEN** el usuario elige «Automática»
- **THEN** las etiquetas se colocan evitando solapamientos y priorizando las civilizaciones de mayor peso

#### Scenario: Modo sin etiquetas

- **WHEN** el usuario elige «Ninguna»
- **THEN** el mapa muestra solo los marcadores y territorios
- **AND** las etiquetas desaparecen hasta que se cambie el modo

### Requirement: Accesibilidad por teclado y lectores de pantalla

La aplicación SHALL permitir usar el mapa, la cronología, los filtros y los paneles con teclado y SHALL anunciar los cambios relevantes a los lectores de pantalla.

#### Scenario: Recorrer los controles

- **WHEN** el usuario navega con Tab
- **THEN** cada control recibe el foco en un orden lógico
- **AND** se puede activar con Enter o Espacio

#### Scenario: Cambio de año por teclado

- **WHEN** el usuario cambia el año con las flechas
- **THEN** el nuevo año se anuncia con `aria-live` sin interrumpir la reproducción automática

#### Scenario: Cerrar un panel

- **WHEN** el usuario cierra un panel lateral con Escape
- **THEN** el foco vuelve al control que lo abrió

### Requirement: Experiencia táctil en móvil

La aplicación SHALL ofrecer controles táctiles de al menos 44 × 44 píxeles y gestos compatibles con el mapa y el riel.

#### Scenario: Arrastrar el riel en móvil

- **WHEN** el usuario arrastra horizontalmente el riel con el dedo
- **THEN** el año cambia sin desplazar la página

#### Scenario: Abrir un panel en móvil

- **WHEN** el usuario abre la ficha o la lista de civilizaciones
- **THEN** el panel ocupa la pantalla con un botón de cierre visible
- **AND** el mapa queda accesible al cerrarlo
