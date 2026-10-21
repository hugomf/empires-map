# Diseño técnico

## Context

El catálogo vive en `datos/*.json` y se convierte en `src/data/datos.generados.ts` para que la interfaz no lea archivos en tiempo de ejecución. Hoy los registros no tienen fuentes, confianza ni identificadores externos; además, la migración a `datos/*.json` está a medio cerrar y el build depende de `fix-conectar-datos`. Cualquier campo nuevo debe ser opcional para no bloquear esa reparación.

La validación tiene dos piezas heredadas: `scripts/validar-datos.mjs` (entrada de `npm run validate`) y `scripts/validar.mjs` (valida y genera el bundle). Este diseño no resuelve esa duplicidad, que pertenece a `fix-conectar-datos`; extrae las reglas de procedencia a un módulo compartido para que funcionen con cualquiera de los dos entrypoints que quede.

Ver `proposal.md` para la motivación y `specs/procedencia-datos/spec.md` para el contrato de comportamiento.

## Goals / Non-Goals

**Goals:**

- Añadir procedencia verificable sin reescribir el catálogo ni bloquear las fichas que aún no se han revisado.
- Hacer que las fuentes, la confianza y la versión sean visibles y citables en la ficha.
- Medir la cobertura para decidir qué revisar después, en lugar de fingir que todo está verificado.
- Mantener compatibilidad con `fix-conectar-datos`, `add-jerarquia-territorial` y `add-i18n`.

**Non-Goals:**

- Importar datos o geometrías de Cliopatria, OpenHistoricalMap, Pleiades u otras bases.
- Añadir gobernantes, población, superficie, religiones, ciudades o artefactos.
- Traducir citas bibliográficas; solo se traducen las etiquetas de interfaz.
- Crear una API, un backend de reportes o un flujo de revisión comunitaria.
- Sustituir la revisión histórica por un sello automático de «verificado».

## Decisions

### 1. Procedencia incrustada, no una tabla de afirmaciones separada

Se añaden campos opcionales a cada civilización y a cada hito:

```ts
export type Confianza = 'alta' | 'media' | 'baja';
export type LicenciaFuente =
  | 'dominio-publico'
  | 'CC0'
  | 'CC-BY'
  | 'CC-BY-SA'
  | 'CC-BY-NC'
  | 'propietaria'
  | 'otra';
export type UsoFuente = 'cita' | 'importacion';

export interface Fuente {
  id: string;
  tipo: 'libro' | 'articulo' | 'base-datos' | 'atlas' | 'web';
  cita: string;
  url?: string;
  licencia: LicenciaFuente;
  uso: UsoFuente;
  consultado?: string; // AAAA-MM-DD, obligatorio en web y bases de datos
  nota?: string;
}

export interface Civilizacion {
  // ...campos actuales
  fuentes?: string[];
  confianza?: Confianza;
  notaFechas?: string;
  wikidata?: string;
  pleiades?: string;
}

export interface Hito {
  // ...campos actuales que fije fix-conectar-datos
  fuentes?: string[];
  confianza?: Confianza;
  nota?: string;
}
```

**Por qué:** el dato y su fuente viajan juntos, el generador no necesita una segunda tabla y la migración es incremental. Una tabla de afirmaciones por campo (`periodo.inicio`, `periodo.fin`, geometría) sería más precisa, pero multiplica el esquema y choca con la migración en curso. Se reserva para una fase posterior, cuando se aborden estadísticas y fronteras.

**Alternativa descartada:** `procedencia.json` separado con claves `entidad.campo`. Es más flexible, pero obliga a mantener sincronizadas dos fuentes de verdad y complica la validación referencial sin aportar valor en este lote.

### 2. Registro de fuentes con identificadores y licencia explícita

`datos/fuentes.json` es un array de `Fuente`. Las entidades referencian `id`, no texto libre. Ejemplo ilustrativo:

```json
[
  {
    "id": "pleiades",
    "tipo": "base-datos",
    "cita": "Pleiades: A Community-built Gazetteer of the Ancient World.",
    "url": "https://pleiades.stoa.org/",
    "licencia": "CC-BY",
    "uso": "cita",
    "consultado": "2026-10-21",
    "nota": "Se usa para identificar lugares; no se copian geometrías."
  }
]
```

**Por qué:** evita duplicar citas, permite comprobar que una referencia existe y hace explícita la licencia. El campo `uso` separa citar de importar: una fuente `CC-BY-NC` se puede citar, pero no se puede usar para incorporar datos o geometrías al producto.

**Regla de licencias:** `uso: "importacion"` solo se acepta con `dominio-publico`, `CC0`, `CC-BY` o `CC-BY-SA`; esta última exige `nota` sobre la obligación de compartir igual. Se rechazan `CC-BY-NC`, `propietaria` y `otra`. No es un dictamen legal: es una política conservadora para no cerrar la puerta a un producto de pago.

### 3. Tres niveles de confianza y un estado «sin evaluar»

- `alta`: fechas y datos respaldados por dos fuentes independientes, sin disputa material.
- `media`: una fuente sólida o discrepancia menor; la fecha puede ser aproximada.
- `baja`: tradición, leyenda, estimación amplia o disputa abierta; exige nota.
- Sin campo: «sin evaluar». Nunca se infiere `alta` por defecto.

**Por qué:** una escala numérica falsa precisión y un booleano «verificado» invita a usarlo como sello. Tres niveles más «sin evaluar» son suficientes para la ficha y para el profesor.

La nota es obligatoria con `baja`: `notaFechas` en civilizaciones y `nota` en hitos. La validación no exige confianza en los registros antiguos; la cobertura los cuenta como pendientes.

### 4. Identificadores externos como enlaces, no como fuentes

`wikidata` se valida con `^Q[1-9]\d*$` y `pleiades` con `^\d+$`. Se comprueba que no se repitan entre civilizaciones distintas. No sustituyen a una fuente: identifican la entidad y permiten enlazar, pero no justifican una fecha.

### 5. La validación estructural falla; la falta de cobertura no

Se añade un módulo compartido, `scripts/lib/procedencia.mjs`, importado por `scripts/validar-datos.mjs` y por `scripts/validar.mjs`. Comprueba:

- IDs de fuente únicos, en kebab-case, con cita no vacía.
- URL `http(s)` si existe; `consultado` obligatorio en web y bases de datos.
- Licencia y uso en los valores permitidos; combinaciones incompatibles.
- `fuentes` no vacío, sin duplicados y con todos los IDs existentes.
- `confianza` válida; nota obligatoria si es `baja`.
- `notaFechas` no vacía si existe.
- Patrones y unicidad de `wikidata` y `pleiades`.
- `version` y `fecha` de `datos/version.json`.

`npm run validate` falla solo por errores estructurales, no porque una ficha antigua no tenga fuentes. La cobertura se mide aparte con `npm run data:coverage`. `npm run build` ejecuta la validación antes de compilar; si hay un error estructural, no se genera el bundle.

**Por qué:** si se exigiera el 100% de procedencia desde el primer día, el cambio no podría aterrizar y se mezclarían dos problemas: «el dato está mal» y «el dato aún no se ha revisado». La cobertura es una métrica de progreso, no un error de integridad.

### 6. Informe de cobertura con umbrales

`scripts/cobertura.mjs` lee `datos/*.json` y cuenta:

- Civilizaciones totales, con `fuentes`, con dos o más fuentes, con `confianza`, con `wikidata`, con `pleiades` y con `notaFechas`.
- Hitos totales, con `fuentes` y con `confianza`.
- Territorios totales, con `fuente` y con `confianza` (campos de `add-jerarquia-territorial`).
- Fuentes totales por licencia y por uso.
- Referencias rotas: siempre cero si la validación ha pasado.

Uso:

```bash
npm run data:coverage
npm run data:coverage -- --min-civs=25 --min-hitos=125 --min-wikidata=25
```

Sin umbrales termina con código 0 y muestra la tabla. Con umbrales, termina con código 1 y muestra el déficit. `npm run validate` imprime un resumen de cobertura, pero no falla por déficit.

### 7. Una sección de procedencia en la ficha, no una pestaña nueva

La ficha ya tiene pestañas de religión y cultura material en otros cambios. La procedencia es transversal, así que se integra en el panel existente:

- Insignia de confianza junto a la vigencia y en cada hito.
- Bloque «Cómo lo sabemos» con `notaFechas` o `nota`, solo si existe.
- Bloque «Fuentes» con lista semántica: cita, enlace, licencia y fecha de consulta.
- Acciones: «Copiar cita», «Reportar un error» y «Metodología».
- Estado vacío: «Sin fuentes registradas · Pendiente de revisión». No se muestra un sello de verificación ni una cita de relleno.

**Por qué:** una pestaña nueva escondería la procedencia y competiría con las pestañas de religión y cultura. La confianza debe estar al lado de la fecha que califica.

### 8. Cita copiable y reporte sin backend

La cita se construye en el cliente con el nombre canónico, la versión (`VERSION_DATOS`), la URL canónica (`window.location.origin + pathname + hash`) y las citas de las fuentes. Se usa `navigator.clipboard.writeText` con un fallback a un `textarea` temporal; no se añade dependencia.

«Reportar un error» usa `VITE_REPORT_URL` si está definida. Si no, genera un enlace `mailto:` con asunto y cuerpo prellenados (identificador, año, versión y URL) y sin destinatario fijo; el usuario elige el canal. No hay backend, analítica ni recogida automática de datos personales. En producción se configurará un buzón o formulario real.

### 9. i18n y accesibilidad

Las etiquetas nuevas van al diccionario de `src/lib/i18n.ts` en español e inglés. Las citas no se traducen. Las insignias de confianza llevan texto visible y `aria-label`; no dependen del color. La lista de fuentes usa `<ul>`/`<li>`, los enlaces son enfocables y la sección se puede plegar en móvil sin ocultar contenido a lectores de pantalla.

### 10. Versión del catálogo

`datos/version.json`:

```json
{
  "version": "0.1.0",
  "fecha": "2026-10-21",
  "cambios": [
    "Primer lote de procedencia: 25 civilizaciones insignia."
  ]
}
```

El generador emite `VERSION_DATOS` y la ficha lo muestra en «Metodología» y en la cita. El formato aceptado es `AAAA.MM` o `AAAA.MM.N`; la fecha debe ser ISO `AAAA-MM-DD`. No se inventa una versión de producto: `0.1.0` identifica el primer lote de datos, no una release comercial.

## Impacto en datos y scripts

| Archivo | Cambio |
|---|---|
| `datos/fuentes.json` | Nuevo registro de fuentes. |
| `datos/version.json` | Nueva versión y fecha del catálogo. |
| `datos/civilizaciones.json` | Campos opcionales `fuentes`, `confianza`, `notaFechas`, `wikidata`, `pleiades`. |
| `datos/hitos.json` | Campos opcionales `fuentes`, `confianza`, `nota`. |
| `datos/territorios.json` | Sin campos nuevos: se reutilizan `fuente` y `confianza` de `add-jerarquia-territorial`. |
| `datos/regiones.json` | Sin cambios. |
| `scripts/validar-datos.mjs` | Importa `scripts/lib/procedencia.mjs` y ejecuta las comprobaciones antes de validar el catálogo. |
| `scripts/validar.mjs` | Importa el mismo módulo antes de generar `datos.generados.ts`; no duplica reglas. |
| `scripts/cobertura.mjs` | Nuevo informe con umbrales. |
| `src/data/tipos-cultura.ts` | Tipos `Confianza`, `LicenciaFuente`, `UsoFuente`, `Fuente` y campos nuevos. |
| `src/data/catalogo.ts` | Expone `FUENTES`, `VERSION_DATOS` y el catálogo ya generado. |
| `src/data/datos.generados.ts` | Incluye `FUENTES`, `VERSION_DATOS` y los campos nuevos. |
| `package.json` | `data:coverage`; validación en `prebuild` o en el script de build. |

No se añaden dependencias: alcanza con Node, React y las APIs del navegador.

## Risks / Trade-offs

- **[Choque con la migración de `fix-conectar-datos`]** → Todos los campos nuevos son opcionales y no se toca el contrato de `Hito`; este cambio se aplica después de que el build esté verde. Si el contrato cambia, se ajusta el generador, no los datos.
- **[Duplicidad con `add-jerarquia-territorial`]** → No se redefine `fuente`/`confianza` en territorios; se reutilizan y solo se miden. La procedencia de geometrías existentes queda pendiente y se declara en la metodología.
- **[Confusión entre «citado» y «verificado»]** → La interfaz distingue «sin fuentes», «sin evaluar» y confianza baja/media; no hay sello de «verificado» automático.
- **[Fuentes con licencia incompatible]** → La validación bloquea la importación desde NC, propietarias u «otra». Las citas siguen permitidas. Antes de importar datos nuevos, una persona revisa la licencia y la nota.
- **[Enlaces rotos o fuentes retiradas]** → Se guarda `consultado` y la cita completa; una comprobación automática de enlaces queda como tarea posterior, no como bloqueo de este cambio.
- **[Explosión de alcance a 153 fichas]** → El primer lote es de 25; el resto se muestra como pendiente. Los umbrales de cobertura permiten subir el listón sin mezclar integridad y progreso.
- **[Citas largas en móvil]** → La sección se pliega; la cita copiable evita depender de leer todo el bloque en pantalla.
- **[Falsa autoridad por el diseño]** → La metodología explica que una confianza alta no es una revisión por pares y que el catálogo es una síntesis editorial, no una fuente primaria.

## Migration Plan

1. Confirmar que `fix-conectar-datos` dejó `npm run validate`, `npx tsc -b` y `npm run build` en verde. Si no, detenerse.
2. Añadir tipos, `datos/fuentes.json`, `datos/version.json` y los campos opcionales; regenerar el bundle.
3. Añadir el módulo de validación y el informe de cobertura; comprobar que los datos actuales siguen pasando sin fuentes.
4. Añadir la sección de ficha, la metodología, la cita y el reporte; traducir las etiquetas.
5. Completar las 25 fichas insignia en lotes de cinco, validando y midiendo cobertura en cada lote.
6. Activar umbrales de cobertura en el comando de CI o en el build cuando el primer lote esté cerrado.
7. **Rollback:** los campos son opcionales y la interfaz oculta las secciones vacías. Si hay que revertir, se retiran primero las referencias a fuentes y luego el registro; nunca se deja una referencia huérfana.

## Open Questions

- ¿Qué canal real se usará para los reportes en producción (buzón, formulario o issues)? Se decide al implementar; `VITE_REPORT_URL` permite cambiarlo sin tocar el modelo ni la especificación.
- ¿Se añadirá más adelante una comprobación automática de enlaces y una tabla de afirmaciones por campo para geometrías y estadísticas? Es una evolución natural, pero no cambia el alcance de este lote.
