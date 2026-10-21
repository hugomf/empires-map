# procedencia-datos Specification

## Purpose

Capa transversal que documenta de dónde sale cada dato histórico, con qué confianza, bajo qué licencia y en qué versión, para que el atlas se pueda citar y corregir sin inventar autoridad.

## ADDED Requirements

### Requirement: Registro canónico de fuentes

La aplicación SHALL mantener `datos/fuentes.json` como registro único de fuentes, con identificador, tipo, cita, licencia, uso permitido y fecha de consulta para fuentes web o bases de datos.

#### Scenario: Fuente registrada correctamente

- **WHEN** se añade una fuente con identificador único, cita, licencia y uso
- **THEN** la validación la acepta y queda disponible para que la referencien civilizaciones e hitos

#### Scenario: Identificador duplicado

- **WHEN** dos fuentes comparten el mismo identificador
- **THEN** `npm run validate` falla y muestra el identificador repetido

#### Scenario: Fuente sin cita

- **WHEN** una fuente no declara cita o la deja vacía
- **THEN** `npm run validate` falla y señala la fuente incompleta

#### Scenario: Fecha de consulta obligatoria en web

- **WHEN** una fuente de tipo web o base de datos no declara fecha de consulta
- **THEN** `npm run validate` falla y señala el campo ausente

### Requirement: Procedencia en civilizaciones e hitos

Las civilizaciones y los hitos SHALL poder declarar `fuentes` como una lista de identificadores del registro, `confianza` y una nota de matiz; la lista SHALL tener al menos un identificador y todos SHALL existir.

#### Scenario: Ficha con dos fuentes

- **WHEN** una civilización declara dos identificadores existentes en `fuentes`
- **THEN** la validación los acepta y la ficha puede mostrar ambas citas

#### Scenario: Referencia inexistente

- **WHEN** una civilización o un hito referencia un identificador que no está en el registro
- **THEN** `npm run validate` falla y nombra la entidad y el identificador

#### Scenario: Lista vacía

- **WHEN** una entidad declara `fuentes` como lista vacía
- **THEN** `npm run validate` falla y explica que debe omitir el campo o declarar al menos una fuente

### Requirement: Niveles de confianza

Cada civilización y cada hito SHALL poder declarar una confianza `alta`, `media` o `baja`; una confianza `baja` SHALL exigir la nota correspondiente (`notaFechas` en civilizaciones, `nota` en hitos) y la ausencia de confianza SHALL significar «sin evaluar», nunca «alta».

#### Scenario: Confianza baja sin nota

- **WHEN** una civilización declara `confianza: "baja"` sin `notaFechas`
- **THEN** `npm run validate` falla y pide la nota que explique la incertidumbre

#### Scenario: Hito de confianza baja sin nota

- **WHEN** un hito declara `confianza: "baja"` sin `nota`
- **THEN** `npm run validate` falla y señala el hito

#### Scenario: Confianza no declarada

- **WHEN** una ficha no declara `confianza`
- **THEN** la interfaz la muestra como «sin evaluar» y no la presenta como verificada

### Requirement: Matices de fechas

Cada civilización SHALL poder declarar `notaFechas` para explicar una fundación tradicional, un límite discutido o un cambio de periodo; la nota SHALL mostrarse junto a la vigencia cuando exista.

#### Scenario: Fundación tradicional

- **WHEN** una ficha declara una fecha tradicional y una `notaFechas`
- **THEN** la ficha muestra la nota junto a la vigencia y no presenta la fecha como exacta

#### Scenario: Nota vacía

- **WHEN** `notaFechas` existe pero está vacía
- **THEN** `npm run validate` falla y señala el campo

### Requirement: Identificadores externos

Cada civilización SHALL poder declarar `wikidata` con un QID y `pleiades` con un identificador numérico; la validación SHALL comprobar el formato y SHALL rechazar el mismo identificador en dos civilizaciones distintas.

#### Scenario: QID válido

- **WHEN** una civilización declara `wikidata: "Q2277"`
- **THEN** la validación lo acepta y la ficha puede enlazar a Wikidata

#### Scenario: QID inválido

- **WHEN** una civilización declara un `wikidata` que no empieza por Q ni contiene solo dígitos
- **THEN** `npm run validate` falla y señala el formato esperado

#### Scenario: Identificador repetido

- **WHEN** dos civilizaciones declaran el mismo `wikidata` o `pleiades`
- **THEN** `npm run validate` falla y muestra ambas entidades

### Requirement: Licencias y uso de fuentes

Cada fuente SHALL declarar una licencia y un uso (`cita` o `importacion`); la validación SHALL rechazar la importación desde licencias no comerciales, propietarias o no verificadas y SHALL exigir una nota cuando la licencia sea de compartir igual.

#### Scenario: Importación no comercial

- **WHEN** una fuente marcada como `uso: "importacion"` declara una licencia `CC-BY-NC`
- **THEN** `npm run validate` falla y explica que esa licencia no es compatible con la política de importación del proyecto

#### Scenario: Cita de una fuente no comercial

- **WHEN** una fuente `CC-BY-NC` se marca como `uso: "cita"`
- **THEN** la validación la acepta y la ficha puede citarla sin incorporar sus datos

#### Scenario: Compartir igual sin nota

- **WHEN** una fuente `CC-BY-SA` se marca para importación sin una nota sobre la obligación de compartir igual
- **THEN** `npm run validate` falla y pide la nota

### Requirement: Validación de procedencia antes del build

La validación de datos SHALL comprobar referencias, confianza, identificadores y licencias antes del build y SHALL fallar con un mensaje que nombre la entidad y el campo afectado.

#### Scenario: Error con contexto

- **WHEN** una civilización referencia una fuente inexistente
- **THEN** `npm run validate` falla y nombra la civilización y el campo `fuentes`

#### Scenario: Build bloqueado

- **WHEN** la validación de procedencia encuentra un error
- **THEN** `npm run build` no genera el paquete de producción

#### Scenario: Datos antiguos sin procedencia

- **WHEN** una ficha existente no declara `fuentes` ni `confianza`
- **THEN** la validación no falla por ese motivo y el informe de cobertura la cuenta como pendiente

### Requirement: Cobertura de procedencia

La aplicación SHALL ofrecer `npm run data:coverage` para contar fichas, hitos y territorios con fuentes, confianza e identificadores externos, y SHALL aceptar umbrales que hagan fallar el comando cuando no se alcancen.

#### Scenario: Informe de cobertura

- **WHEN** el usuario ejecuta `npm run data:coverage`
- **THEN** obtiene totales y porcentajes de civilizaciones, hitos y territorios con fuentes, confianza e identificadores

#### Scenario: Umbral incumplido

- **WHEN** se ejecuta `npm run data:coverage -- --min-civs=25` y hay menos de 25 civilizaciones con fuentes
- **THEN** el comando termina con código distinto de cero y muestra el déficit

#### Scenario: Umbral cumplido

- **WHEN** se ejecuta con un umbral igual o inferior a la cobertura real
- **THEN** el comando termina con código cero

#### Scenario: Validación con resumen

- **WHEN** se ejecuta `npm run validate`
- **THEN** el resumen incluye la cobertura de procedencia sin fallar por las fichas aún pendientes

### Requirement: Fuentes visibles en la ficha

La ficha SHALL mostrar las fuentes de la civilización y de sus hitos con cita, enlace cuando exista, licencia y fecha de consulta, y SHALL mostrar un estado vacío honesto cuando no haya fuentes.

#### Scenario: Ficha con fuentes

- **WHEN** el usuario abre una civilización con dos fuentes declaradas
- **THEN** ve las dos citas, sus enlaces y sus licencias

#### Scenario: Ficha sin fuentes

- **WHEN** el usuario abre una civilización sin fuentes
- **THEN** ve «Sin fuentes registradas» y «Pendiente de revisión», sin una cita inventada ni un sello de verificación

#### Scenario: Hito con fuente

- **WHEN** el usuario consulta un hito con fuente
- **THEN** la ficha muestra la cita asociada al hito

### Requirement: Confianza visible y accesible

La ficha SHALL mostrar la confianza de la civilización y de cada hito con texto, no solo con color, y SHALL marcar «aprox.» cuando la confianza sea `baja` o `media`.

#### Scenario: Confianza baja

- **WHEN** una civilización tiene confianza `baja`
- **THEN** la ficha muestra «Confianza baja» y la marca «aprox.» junto a la vigencia

#### Scenario: Sin evaluar

- **WHEN** una civilización no declara confianza
- **THEN** la ficha muestra «Sin evaluar» con un estilo neutro

#### Scenario: Lectura con lector de pantalla

- **WHEN** un lector de pantalla recorre la insignia de confianza
- **THEN** anuncia el texto de la confianza y no depende solo del color

### Requirement: Cómo lo sabemos y metodología

La ficha SHALL mostrar la nota de matices de la civilización y un panel de metodología que explique los niveles de confianza, la política de fuentes y la versión consultada.

#### Scenario: Nota de matices

- **WHEN** una civilización declara `notaFechas`
- **THEN** la ficha la muestra bajo el epígrafe «Cómo lo sabemos»

#### Scenario: Abrir metodología

- **WHEN** el usuario pulsa «Metodología»
- **THEN** ve la definición de alta, media, baja y sin evaluar, la política de fuentes y la versión del catálogo

#### Scenario: Sin nota

- **WHEN** una civilización no declara `notaFechas`
- **THEN** la ficha no muestra un bloque vacío de «Cómo lo sabemos»

### Requirement: Cita copiable

La ficha SHALL ofrecer una acción para copiar una cita que incluya el nombre de la civilización, la versión del catálogo, la URL canónica y las fuentes declaradas.

#### Scenario: Copiar una cita completa

- **WHEN** el usuario pulsa «Copiar cita» en una ficha con fuentes
- **THEN** el portapapeles contiene el nombre, la versión, la URL y las citas de las fuentes

#### Scenario: Copiar una ficha sin fuentes

- **WHEN** el usuario pulsa «Copiar cita» en una ficha sin fuentes
- **THEN** la cita indica «sin fuentes registradas» y no inventa una referencia

#### Scenario: Aviso de copia

- **WHEN** la copia termina correctamente
- **THEN** la interfaz confirma la acción con un mensaje accesible

### Requirement: Reporte de errores con contexto

La ficha SHALL ofrecer un enlace para reportar un error que incluya el identificador de la civilización, el año seleccionado y la versión del catálogo, sin recoger datos personales.

#### Scenario: Enlace con contexto

- **WHEN** el usuario pulsa «Reportar un error» en una ficha
- **THEN** el destino incluye el identificador, el año y la versión

#### Scenario: Sin datos personales

- **WHEN** se abre el enlace de reporte
- **THEN** no se envían automáticamente datos personales ni analíticos

#### Scenario: Ficha sin fuentes

- **WHEN** el usuario reporta un error en una ficha sin fuentes
- **THEN** el enlace incluye la versión y el identificador para que el equipo pueda localizarla

### Requirement: Versión citable del catálogo

La aplicación SHALL declarar una versión y una fecha en `datos/version.json`, incluirla en el paquete generado y mostrarla en la metodología y en la cita.

#### Scenario: Versión visible

- **WHEN** el usuario abre la metodología
- **THEN** ve la versión y la fecha del catálogo

#### Scenario: Versión inválida

- **WHEN** la versión no sigue el formato `AAAA.MM` o `AAAA.MM.N`
- **THEN** `npm run validate` falla y muestra el formato esperado

#### Scenario: Fecha inválida

- **WHEN** la fecha no está en formato ISO `AAAA-MM-DD`
- **THEN** `npm run validate` falla y señala el campo

### Requirement: Accesibilidad de fuentes y confianza

La ficha SHALL permitir recorrer con teclado las fuentes, la confianza, la cita y el reporte, y SHALL usar listas semánticas para las fuentes.

#### Scenario: Navegación con teclado

- **WHEN** el usuario recorre la ficha con Tab
- **THEN** puede alcanzar los enlaces de fuentes, «Copiar cita» y «Reportar un error»

#### Scenario: Fuentes como lista

- **WHEN** un lector de pantalla recorre las fuentes
- **THEN** las anuncia como una lista con el número de elementos

#### Scenario: Panel móvil

- **WHEN** la ficha se muestra en una pantalla pequeña
- **THEN** la sección de fuentes se puede plegar y desplegar sin ocultar su contenido a lectores de pantalla
