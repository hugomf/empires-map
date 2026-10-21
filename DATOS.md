# Crónica de Imperios — estrategia de datos

*Auditoría a 21/10/2026, con el catálogo ya migrado a `datos/*.json`.*

---

## 0. Respuesta corta

**Sí, puedes superar a los competidores en datos, pero no en volumen.** En volumen pierdes: Phersu tiene ~8.000 polities con resolución diaria, GeaCron lleva desde 2011 construyendo una base vectorial anual, OldMapsOnline tiene 500.000 mapas escaneados y World History Encyclopedia tiene 4.750 artículos. Igualar eso en solitario es un pozo sin fondo.

Puedes ganar en el eje contrario:

1. **Procedencia**: cada fecha, texto y polígono con fuente, confianza y nota de disputa.
2. **Curaduría**: 153 historias legibles, no 8.000 filas de base de datos.
3. **Utilidad docente**: currículo, fuentes citables, fichas imprimibles y evaluación.
4. **Español y portugués revisados por humanos**, no traducción automática.
5. **Cartografía honesta**: distinguir control, influencia, comercio e incursión, con incertidumbre visible.

La frase que debería guiar el proyecto:

> **No somos el atlas más grande. Somos el atlas que puedes citar.**

En la era de la IA, cualquiera genera un mapa plausible. Lo escaso no es el dato: es el dato **verificado, fechado, atribuido y versionado**.

---

## 1. Dónde puedes ganar y dónde no

| Eje | ¿Se puede ganar? | Por qué |
|---|---|---|
| Número de polities | **No** | Phersu ~8.000; GeaCron 15 años; imposible en solitario. |
| Resolución temporal diaria | **No** | Requiere datos y revisión masiva. |
| Mapas escaneados históricos | **No** | OldMapsOnline tiene 500.000. |
| Artículos enciclopédicos | **No** | WHE tiene 4.750 artículos y equipo editorial. |
| Fuentes y confianza | **Sí** | Casi nadie lo hace a nivel de consumidor; es el foso real. |
| Narrativa de auge/caída | **Sí** | Ya lo tienes; falta profundidad y citas. |
| Español/portugués | **Sí** | Competidores inglés-first; LatAm y Brasil están desatendidos. |
| Aula y currículo | **Sí** | Es donde está el dinero y donde los competidores son genéricos. |
| Regiones subrepresentadas | **Sí** | África, Oceanía, América precolombina y Asia Central. |
| Comparación y estadísticas | **Sí, con cuidado** | Población/superficie con rangos y fuentes; no falsa precisión. |
| API con procedencia | **Sí** | Medios, museos y edtech pagan por datos citables. |
| Precio | **No** | El suelo gratis es altísimo. |

**Conclusión:** no compitas en el eje del adversario. Compite en el eje que ellos descuidan.

---

## 2. Auditoría del dato actual

### Lo que hay

| Métrica | Valor |
|---|---:|
| Civilizaciones | 153 |
| Regiones | 39 |
| Hitos | 610 |
| Territorios | 216 |
| Polígonos con `nivel: polidad` / `division` | Sí, el campo existe |
| Fichas con texto (síntesis, caída, legado) | 153 |
| Fichas con hitos | 153 |
| Fuentes citadas | **0** |
| Nivel de confianza | **0** |
| IDs externos (Wikidata/Pleiades) | **0** |
| Gobernantes | **0** |
| Población/superficie | **0** |
| Religiones | **0** (`RELIGIONES = []`) |
| Deidades | **0** (`DEIDADES = []`) |
| Ciudades | **0** (`CIUDADES = []`) |
| Artefactos | **0** (`ARTEFACTOS = []`) |
| Traducción inglesa real | **No** (`datos/en/` no existe; se replica el español) |

### Problemas concretos detectados hoy

- **El build no pasa**: 28 errores de TypeScript. `App.tsx` importa `CIVILIZACIONES`, `ANIO_MIN` y `ANIO_MAX` de `catalogo.ts`, que ya no los exporta; el esquema de `Hito` cambió de `{a, t}` a `{id, anio, texto}` y varios componentes siguen usando `h.a`/`h.t`.
- **Dos validadores desalineados**: `npm run validate` ejecuta `validar-datos.mjs`, que valida las fuentes TS antiguas; `validar.mjs` valida y genera el JSON, pero no está en `prebuild`.
- **Dos catálogos conviven**: `src/data/civilizations.ts` (118) + `adiciones.json` (16) + `datos/civilizaciones.json` (153). El runtime usa el generado, pero el TS viejo sigue compilando y rompiendo.
- **Typos de esquema**: `nabateos` y `nubia` usan `decline` en vez de `declive`.
- **Hitos fuera de la vida**: `nubia-3` (-332), `nubia-4` (350), `iberia-cristiana-5` (1492), `san-2` (8000). Son avisos, pero erosionan la confianza.
- **Rango global**: `aborigenes` (-45.000), `san` (-20.000) y `berberes` (-10.000) caen fuera de `[-5000, 2026]`. Hay que decidir si el mapa empieza en -5000 o si esas culturas se muestran como "fuera de escala".
- **Fechas con falsa precisión**: `Roma: -753` es tradición legendaria; `Imperio Romano: 476` solo cubre Occidente; `España: 1492` es una construcción política posterior. Todo eso necesita `nota` y `confianza`.
- **Mezcla de categorías**: `tipo` mezcla imperio, reino, estado, dinastía, cultura, pueblo y confederación. No es lo mismo una polidad que una cultura arqueológica o un pueblo disperso. Sin una ontología clara, las comparaciones y los filtros mienten.
- **`region` es un país moderno**: sirve para navegar, pero no debe leerse como territorio histórico. Hay que separar "región de visualización" de "espacio histórico".

---

## 3. El esquema que sí permite ganar

No hace falta reescribir todo. Hay que añadir **procedencia a lo que se afirma** y **una ontología mínima**.

### 3.1 Registro de fuentes

`datos/fuentes.json`:

```json
[
  {
    "id": "cah-2-1",
    "tipo": "libro",
    "cita": "Boardman, J. et al. (eds.), The Cambridge Ancient History, vol. 2, pt. 1, Cambridge University Press, 1973.",
    "url": null,
    "licencia": "propietaria",
    "consultado": "2026-10-21"
  },
  {
    "id": "cliopatria",
    "tipo": "base-datos",
    "cita": "Cliopatria, Seshat Global History Databank.",
    "url": "https://github.com/Seshat-Global-History-Databank/cliopatria",
    "licencia": "CC BY 4.0",
    "consultado": "2026-10-21"
  }
]
```

Reglas:

- Una fuente se cita una vez y se referencia por `id`.
- `licencia` es obligatoria: `dominio-publico`, `CC0`, `CC BY`, `CC BY-SA`, `CC BY-NC`, `propietaria`.
- **Nada `NC` entra en un producto de pago.** `CC BY-SA` obliga a compartir igual; decidir si se acepta.
- Las fuentes propietarias se usan para verificar, no para copiar tablas o geometrías.

### 3.2 Afirmaciones con confianza

Para fechas, geometrías y cifras controvertidas:

```ts
type Confianza = 'alta' | 'media' | 'baja';

interface Afirmacion<T> {
  valor: T;
  confianza: Confianza;
  fuentes: string[];       // ids de fuentes.json
  nota?: string;           // "fecha tradicional", "debate historiográfico", "estimación"
}
```

Ejemplo:

```ts
periodo: {
  inicio: {
    valor: -753,
    confianza: 'baja',
    fuentes: ['tito-livio-1', 'cornell-1995'],
    nota: 'Fecha tradicional de la fundación; la arqueología muestra ocupación anterior.'
  },
  fin: {
    valor: 476,
    confianza: 'alta',
    fuentes: ['cah-14'],
    nota: 'Caída del Imperio de Occidente; el de Oriente continúa hasta 1453.'
  }
}
```

No hace falta envolver cada string en una afirmación. Basta con:

- `fuentes: string[]` a nivel de civilización;
- `fuentes` y `confianza` en cada hito;
- `periodo`, `apogeo` y `declive` como afirmaciones;
- `geometria` con `nivel` y `confianza`.

### 3.3 Ontología mínima

Añadir dos campos:

```ts
categoria: 'polidad' | 'cultura' | 'pueblo' | 'dinastia' | 'estado';
nivel: 'sobrano' | 'dependiente' | 'disperso';
```

- **Polidad**: entidad política con gobierno y territorio (Roma, Egipto, Imperio Han).
- **Cultura**: tradición arqueológica o civilización sin Estado unificado (Sumer, Olmecas).
- **Pueblo**: grupo humano disperso (vikingos, fenicios, san).
- **Dinastía**: casa gobernante dentro de una polidad (Han, Ming, Abasí).
- **Estado**: entidad política moderna (España, Estados Unidos).

`tipo` puede quedarse para la UI, pero `categoria` y `nivel` son los que permiten comparar y filtrar sin mentir.

### 3.4 Geometría honesta

Añadir a cada territorio:

```ts
interface Territorio {
  // ...
  nivel: 'polidad' | 'division';
  control: 'control' | 'influencia' | 'comercio' | 'incursion';
  confianza: Confianza;
  fuentes: string[];
  nota?: string;
}
```

Así puedes mostrar:

- **control**: relleno sólido;
- **influencia**: trama suave;
- **comercio**: línea/ruta;
- **incursión**: flecha o halo.

Es más honesto que teñir un país moderno entero y más útil para enseñar. También resuelve el problema de "Persia no se ve" sin falsificar fronteras.

### 3.5 Tablas separadas

No metas todo en `civilizaciones.json`. Añade:

```
datos/
  civilizaciones.json
  regiones.json
  territorios.json
  hitos.json
  fuentes.json
  gobernantes.json
  poblacion.json
  ciudades.json
  religiones.json
  deidades.json
  eventos.json
  rutas.json
  esquema.json
  en/
```

Cada tabla con `civilizacion`, `desde`, `hasta`, `fuentes`, `confianza`. Así puedes crecer sin romper el esquema.

### 3.6 Validación

- **JSON Schema** o Zod para cada tabla.
- Integridad referencial: `region`, `civilizacion`, `superior`, `fuentes`.
- Fechas: `inicio <= fin`, `apogeo` dentro de la vida, `declive` dentro de la vida.
- Hitos: dentro de la vida o con `nota` que explique la excepción.
- Geometría: anillos cerrados, mínimo 4 puntos, coordenadas válidas, auto-intersecciones.
- Fuentes: todo `id` referenciado existe; ninguna fuente `NC` en tablas de producto.
- **Cobertura**: informe de `%` con fuente, `%` con confianza, `%` con ID externo.
- **Generación reproducible**: `npm run data:build` y comprobar que `git diff` no cambia los generados.
- **CI**: `npm run validate && npm run build && npm run test`.

---

## 4. Fuentes y licencias

| Fuente | Uso | Licencia / cautela |
|---|---|---|
| **Natural Earth** | Base cartográfica | Dominio público. |
| **OpenHistoricalMap** | Fronteras históricas variables | CC0; calidad desigual, revisar. |
| **Cliopatria (Seshat)** | Polities y cobertura mundial | CC BY 4.0; verificar versión y cita. |
| **Pleiades** | Lugares antiguos, coordenadas | CC BY 3.0; ideal para ciudades. |
| **Wikidata** | IDs, alias, coordenadas | CC0; no es fuente histórica autoritativa. |
| **Wikipedia** | Punto de partida, no fuente única | CC BY-SA 4.0; atribución y share-alike. |
| **World Historical Gazetteer** | Topónimos y lugares | Licencias por capa; revisar. |
| **CHGIS** | China histórica | Licencia académica; revisar uso comercial. |
| **DARMC** | Roma y Edad Media | Revisar licencia (puede ser NC). |
| **EurAtlas** | Fronteras históricas | Comercial; licencia de pago. |
| **CShapes 2.0** | Fronteras modernas 1886– | Revisar licencia antes de usar. |
| **Atlas académicos** (Cambridge, Oxford, Barrington) | Verificación y citas | Propietarios; no copiar tablas ni mapas. |

**Regla de oro:** si no puedes pagar la licencia o no puedes cumplir la atribución, no entra. Es mejor 153 fichas con fuentes propias que 8.000 polities con licencias dudosas.

**Riesgo legal:** en la UE existen derechos *sui generis* sobre bases de datos. No scrapees GeaCron, Phersu ni atlas comerciales. Construye desde fuentes primarias, académicas o abiertas, y documenta la procedencia.

---

## 5. Plan por fases (con esfuerzo realista)

### Fase 0 — estabilizar (1 semana)

Objetivo: que el dato sea confiable antes de mejorarlo.

- [ ] Reparar el build: `Hito` `{id, anio, texto}` en `App`, `Ficha`, `MapaAtlas`, `dominio`.
- [ ] Resolver imports de `catalogo.ts` (`CATALOGOS`, `catalogo()`, o exports de conveniencia).
- [ ] Corregir `decline` → `declive` en `nabateos` y `nubia`.
- [ ] Arreglar los 4 hitos fuera de vida y decidir los 3 casos de rango global.
- [ ] Un solo validador: `validar.mjs` en `prebuild`; retirar `validar-datos.mjs` o convertirlo en validación del generado.
- [ ] Retirar `src/data/civilizations.ts`, `regions.ts` y `territorios.ts` o convertirlos en *shims*; que no compitan con `datos/`.
- [ ] Añadir `fuentes.json`, `esquema.json` y `npm run data:coverage`.
- [ ] CI mínimo: `validate + build + test`.
- [ ] Añadir `datos/en/` o desactivar el inglés por defecto hasta que exista.

**Salida:** build verde, una sola fuente de verdad, informe de cobertura.

### Fase 1 — 25 civilizaciones insignia (3–4 semanas)

Objetivo: demostrar que el atlas es citable.

- [ ] 25 civs: Roma, Egipto, Mesopotamia, Persia aqueménida, Grecia, China Han, India Maurya, Maya, Azteca, Inca, Mali, Aksum, Bizancio, Califato abasí, Mongoles, Otomanos, España, Portugal, Gran Bretaña, Estados Unidos, Japón, Corea, Vietnam, Polinesia, Australia aborigen.
- [ ] Cada una: 2+ fuentes, 1 ID Wikidata, alias, confianza en fechas, 5+ hitos con fuente, 1 nota de disputa, 1 cita primaria.
- [ ] UI: pestaña "Fuentes", insignia de confianza, "Cómo lo sabemos", aviso de "aproximado".
- [ ] Enlace "Reportar un error" con `civilizacion` precargada.

**Esfuerzo:** 25 × 3–6 h = **75–150 h**.

**Salida:** se puede enseñar a un profesor, a un periodista y a un inversor sin vergüenza.

### Fase 2 — cobertura completa (2–4 meses)

Objetivo: que ninguna ficha quede sin fuente.

- [ ] 153 civs con al menos 1 fuente y 1 ID externo.
- [ ] 610 hitos con fuente y confianza.
- [ ] 30 fichas con datos comparativos: población, superficie, duración, pico, con rangos y fuentes.
- [ ] 10 religiones y 100 ciudades con fuentes.
- [ ] 50 gobernantes y 50 eventos (batallas, tratados, fundaciones).
- [ ] Página de metodología y changelog público.

**Esfuerzo:** 153 × 2–4 h = **300–600 h**, más datos comparativos. A 20 h/semana, 4–7 meses. Conviene lanzar con la Fase 1 y completar en paralelo.

### Fase 3 — cartografía histórica y API (3–6 meses)

Objetivo: el foso que nadie copia rápido.

- [ ] Capa de fronteras históricas con OHM/Cliopatria, conflación y confianza.
- [ ] Capa de control/influencia/comercio/incursión.
- [ ] API v1 con `fuentes`, `confianza`, `licencia` y `version`.
- [ ] Gobernantes y eventos para 50 civs.
- [ ] Snapshot versionado: `v2026.10`, con changelog.

**Esfuerzo:** 200–400 h, dependiendo de cuánta geometría se importe y cuánta se dibuje.

### Fase 4 — comunidad y revisión (continuo)

- [ ] Comité asesor de 3–5 historiadores.
- [ ] Cola de revisión y guía de contribución.
- [ ] "Revisado por" en fichas.
- [ ] Correcciones con fuente y crédito.
- [ ] Release notes públicas.

---

## 6. Cómo medir que eres superior

No uses "más datos". Usa estos KPIs:

| KPI | Objetivo |
|---|---:|
| Civs con ≥1 fuente | 100% |
| Civs insignia con ≥2 fuentes independientes | 100% |
| Hitos con fuente | ≥90% |
| Fechas antiguas con incertidumbre explícita | 100% |
| Geometrías nuevas con fuente y nivel | 100% |
| IDs Wikidata | 100% |
| IDs Pleiades (mundo antiguo) | ≥50% |
| Citas rotas | 0 |
| Errores reportados por 1.000 sesiones | <1 |
| Tiempo de resolución de errores | <7 días |
| Fichas revisadas por historiador | ≥25 en el primer año |

Y por segmento:

- **Profesor:** "puedo citar esta ficha en clase y dar la fuente al alumno".
- **Medio:** "puedo usar este mapa con licencia clara y atribución".
- **Lector:** "entiendo el auge y la caída en 2 minutos".
- **Institución:** "sé quién revisó esto y cómo se corrige".

---

## 7. Qué no hacer

- **No perseguir 8.000 polities.** Es otro producto y otro equipo.
- **No usar Wikipedia como única fuente.** Sirve para empezar, no para firmar.
- **No fingir precisión.** "753 a.C." sin nota es peor que "siglo VIII a.C. (tradición)".
- **No mezclar datos `NC` en un producto de pago.** Te puede obligar a retirar el producto.
- **No copiar polígonos, tablas ni textos de competidores.** Riesgo de derechos de base de datos.
- **No añadir un chatbot para tapar la falta de fuentes.** La IA generativa no es una fuente.
- **No abrir contribución sin revisión.** El vandalismo y los sesgos cuestan más de lo que aportan.
- **No prometer "el más completo".** Promete "el más citable" y cúmplelo.

---

## 8. Qué significa esto para el negocio

- **Pro** se justifica por **exportar y comparar con fuentes**: el profesor y el creador necesitan la cita.
- **Aula** se justifica por **currículo + fuentes + fichas imprimibles**: es lo que un colegio compra.
- **Centro** se justifica por **administración, licencia y soporte**.
- **API** se justifica por **procedencia y licencia**: un medio no puede publicar un mapa sin saber de dónde sale.
- **Marca** se construye sobre "cada dato tiene fuente; si no, no está". Eso es lo que te separa de un atlas generado por IA.

La ventaja competitiva no es el número de civilizaciones. Es que **cuando alguien pregunte "¿de dónde sale esto?", tú puedas responder**.

---

## 9. Siguiente paso concreto

Propuesta de cambio OpenSpec: **`datos-v2-provenance`**.

- `proposal.md`: por qué procedencia, alcance, métricas.
- `design.md`: esquema, fuentes, validación, UI.
- `specs/data/spec.md`: requisitos y escenarios.
- `tasks.md`: Fase 0 + Fase 1.

Si quieres, lo redacto y lo dejo listo para `openspec validate --strict`, sin tocar todavía el código de la app.
