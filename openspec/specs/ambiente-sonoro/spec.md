# ambiente-sonoro Specification

## Purpose
Banda sonora ambiental generada en el navegador que acompaña la exploración del atlas sin depender de música con derechos de autor ni de archivos externos.

## Requirements

### Requirement: Banda sonora generada

La aplicación SHALL generar la música ambiental con Web Audio a partir de un drone modal, una cuerda pulsada, un tambor de marco y una reverb, sin usar grabaciones externas.

#### Scenario: Música sin archivos de audio

- **WHEN** el usuario activa el sonido
- **THEN** la música se sintetiza en el navegador
- **AND** no se descarga ningún archivo de audio

#### Scenario: Capas de la banda sonora

- **WHEN** la música está sonando
- **THEN** se distinguen el drone sostenido, la cuerda pulsada y el tambor
- **AND** la reverb suaviza el conjunto sin tapar la lectura

### Requirement: Control de reproducción

La aplicación SHALL ofrecer un control para activar o silenciar la música y ajustar su volumen.

#### Scenario: Silenciar

- **WHEN** el usuario pulsa «Silenciar»
- **THEN** el audio se desvanece hasta el silencio
- **AND** el botón refleja el estado apagado

#### Scenario: Ajustar el volumen

- **WHEN** el usuario mueve el control de volumen
- **THEN** el nivel de la música cambia de inmediato
- **AND** el nuevo valor se conserva

### Requirement: Audio apagado por defecto

La aplicación SHALL iniciar con la música apagada y SHALL iniciarla solo después de una interacción del usuario.

#### Scenario: Primera carga

- **WHEN** el usuario abre la aplicación por primera vez
- **THEN** no se reproduce ningún sonido
- **AND** el control invita a activarlo

#### Scenario: Activación manual

- **WHEN** el usuario pulsa «Activar sonido»
- **THEN** la música empieza con una entrada suave

### Requirement: Persistencia de la preferencia

La aplicación SHALL recordar si el usuario dejó la música activa y con qué volumen.

#### Scenario: Volver a abrir la aplicación

- **WHEN** el usuario activó la música y vuelve más tarde
- **THEN** el control aparece en el estado guardado
- **AND** el audio no se reproduce hasta que el usuario interactúa

### Requirement: Degradación elegante

La aplicación SHALL seguir funcionando sin audio cuando Web Audio no esté disponible o falle.

#### Scenario: Navegador sin Web Audio

- **WHEN** el navegador no soporta Web Audio
- **THEN** el control de audio no se muestra
- **AND** el resto de la aplicación funciona con normalidad

### Requirement: Reproducción sin cortes

La aplicación SHALL reproducir la música en bucle sin clics, cortes ni reinicios audibles.

#### Scenario: Cambio de año

- **WHEN** el usuario cambia el año o selecciona una civilización
- **THEN** la música continúa sin reiniciarse

#### Scenario: Pestaña oculta

- **WHEN** el usuario cambia a otra pestaña
- **THEN** el audio se suspende
- **AND** se reanuda al volver, si estaba activo
