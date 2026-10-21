# Crónica de Imperios — seguimiento de requisitos

Documento breve para no perder el hilo. No es documentación técnica exhaustiva.

> **Migrado a OpenSpec el 21/10/2026.** La fuente de verdad de los requisitos es
> `openspec/specs/` (comportamiento actual) y `openspec/changes/` (trabajo
> pendiente). Este documento se conserva como referencia histórica: no añadas
> requisitos nuevos aquí; crea o actualiza un cambio con `/opsx-propose`.
>
> | Sección | Destino en OpenSpec |
> |---|---|
> | 1. Estado actual | `specs/atlas-mapa`, `catalogo`, `cronologia`, `territorios`, `datos`, `ficha` |
> | 2.1 Localización y búsqueda | `changes/add-alias-busqueda` |
> | 2.2 Capa religiosa | `changes/add-religiones` |
> | 2.3 Divisiones políticas históricas | `changes/add-jerarquia-territorial` |
> | 2.4 Países actuales y su formación | `changes/add-paises-actuales` |
> | 2.5 Idioma | `changes/add-i18n` |
> | 2.6 Comparación y navegación | `changes/mejorar-experiencia` |
> | 3. Modelo de datos | `specs/datos`, `specs/territorios`, `specs/religiones` |
> | 4. Decisiones tomadas | `design.md` de los cambios correspondientes |
> | 5. Preguntas abiertas | `design.md` de `add-jerarquia-territorial`, `add-religiones` y `add-paises-actuales` |
> | 6. Próximos pasos | `tasks.md` de los cambios activos |
> | Deuda técnica (build roto) | `changes/fix-conectar-datos` |

## 1. Estado actual

- [x] Catálogo ampliado a **134 civilizaciones** y **39 regiones**.
- [x] Añadidos germanos, vikingos y culturas sudamericanas preincaicas.
- [x] Fases de expansión inca y territorios nuevos.
- [x] Filtro para mostrar/ocultar civilizaciones menores.
- [x] Buscador por nombre, abreviatura, tipo, región, textos e hitos.
- [x] Cronología agrupada por región (Persia/Irán queda junto).
- [x] Validación de datos antes del build (`npm run validate`).
- [x] Corregidos textos corruptos y fechas incoherentes detectadas.
- [x] Territorio aproximado de Macedonia/Alejandro Magno.

## 2. Requisitos nuevos o en curso

### 2.1 Localización y búsqueda
- [x] Que “Irán” y “Persia” sean fáciles de encontrar (región `Persia / Irán`).
- [x] Que “Alejandro Magno” encuentre Macedonia aunque no sea el nombre de la ficha.
- [ ] Revisar que el buscador no oculte resultados por el filtro de menores.
- [ ] Añadir alias históricos (“Persia”, “Alejandro”, “Bizancio”, “Incas”…).

### 2.2 Capa religiosa
- [ ] Decidir si el zoroastrismo (y otras religiones) entra como capa separada.
- Propuesta: **no** tratarlo como civilización. Modelo aparte:
  - religión, periodo, regiones, texto, color;
  - filtro “Religiones” y, si se quiere, tinte del mapa.
- [ ] Primera versión mínima: zoroastrismo + religiones del Mediterráneo/Asia.
- [ ] Mostrar religión principal en la ficha de cada civilización (campo opcional).

### 2.3 Divisiones políticas históricas
- [x] Punto de partida: 83 civilizaciones ya tienen polígonos aproximados.
- [ ] Capa de “divisiones políticas” con fronteras cambiantes, no solo países modernos.
- [ ] Jerarquía de soberanía: metrópoli → virreinato → audiencia/provincia.
- [ ] Ejemplo obligatorio: **Virreinato de Nueva España (1535–1821)**,
      **Virreinato del Perú (1542–1824)**, siempre bajo la Corona española.
- [ ] Califatos: **no** son virreinatos. Son estados soberanos con el califa como
      jefe político y religioso. Sus emiratos y sultanatos autónomos (Aghlabíes,
      Tuluníes, etc.) sí funcionan como divisiones delegadas.
- [ ] Mostrar que “país” es una categoría moderna; antes hay imperios, reinos,
      ciudades-Estado, confederaciones, señoríos, colonias y protectorados.
- [ ] Definir si las fronteras históricas son:
  - (a) polígonos manuales aproximados, o
  - (b) una base GIS histórica externa (OpenHistoricalMap, EurAtlas, etc.).

### 2.4 Países actuales y su formación
- [ ] Añadir una vista/capa “Países actuales”.
- [ ] Para cada país: fecha de formación/independencia, tipo de proceso y nota.
- [ ] No pintar un país antes de su fecha de formación.
- [ ] Distinguir: independencia, unificación, constitución, reconocimiento,
      disolución del predecesor.
- [ ] Mostrar la fecha con matices (“aprox.”, “estado moderno desde…”).
- [ ] Evitar mezclar países contemporáneos con imperios antiguos en la misma capa.

### 2.5 Idioma
- [ ] Selector **ES / EN** en la cabecera.
- [ ] **Inglés por defecto**.
- [ ] Traducir primero toda la interfaz: filtros, cronología, ficha, estados vacíos,
      atajos, títulos y textos auxiliares.
- [ ] Traducir después el contenido histórico: nombres, abreviaturas, síntesis,
      caída, legado e hitos.
- [ ] Guardar el idioma en `localStorage` y, si se puede, en el enlace
      (`#en/1492/roma`).
- [ ] Formato de años, eras y siglos según el idioma.
- [ ] No mostrar una mezcla de inglés y español sin avisar.

### 2.6 Comparación y mejoras de navegación
- [ ] Comparar con Chronas, OpenHistoricalMap, TimeMaps, GeaCron, Histography,
      Our World in Data y atlas históricos educativos.
- [ ] Detectar mejoras de:
  - zoom y navegación en la cronología;
  - densidad de etiquetas y legibilidad del mapa;
  - jerarquía visual y estados vacíos;
  - compartir/enlazar momentos y filtros;
  - accesibilidad y móvil;
  - fuentes y nivel de confianza del dato.

## 3. Modelo de datos propuesto

### Polity / división histórica
```ts
interface Polity {
  id: string;
  nombre: string;
  tipo: 'imperio' | 'reino' | 'ciudad-estado' | 'virreinato' | 'colonia'
      | 'provincia' | 'confederacion' | 'protectorado' | 'estado';
  soberania?: string;       // id de la metrópoli o poder soberano
  padre?: string;           // jerarquía administrativa
  inicio: number;
  fin: number;
  geometria?: GeoJSON;      // aproximada y versionada
  fuente?: string;
  confianza?: 'alta' | 'media' | 'baja';
}
```

### País actual
```ts
interface PaisActual {
  id: string;               // ISO 3166-1 alpha-2
  nombre: string;
  formacion: number;
  tipoFormacion: 'independencia' | 'unificacion' | 'constitucion'
      | 'reconocimiento' | 'sucesion';
  nota: string;
  fuente?: string;
}
```

### Religión
```ts
interface Religion {
  id: string;
  nombre: string;
  inicio: number;
  fin?: number;
  regiones: string[];
  texto: string;
  color: string;
}
```

## 4. Decisiones tomadas

- Los datos nuevos van en JSON separado (`adiciones.json`,
  `territorios-extra.json`) y se combinan en `catalogo.ts`.
- La escala (`mayor`/`menor`) se deriva del peso si no está definida.
- La cronología se agrupa por región por defecto.
- El buscador incluye textos e hitos, no solo nombres.
- El zoroastrismo no se añade como civilización sin antes decidir la capa religiosa.
- Los países actuales no deben retrotraerse a la Antigüedad.

## 5. Preguntas abiertas

1. ¿La capa de países actuales sustituye la base moderna o convive como modo?
2. ¿Las fronteras históricas serán polígonos manuales o se importarán de una base GIS?
3. ¿Los virreinatos se muestran como subdivisiones dentro del imperio o como entidades hijas?
4. ¿La capa religiosa colorea el mapa o solo aparece en la ficha/cronología?
5. ¿Qué nivel de precisión exigimos? ¿Aceptamos “aprox.” y confianza baja?

## 6. Próximos pasos sugeridos

1. Cerrar la revisión visual actual (mapa, cabecera, cronología).
2. Implementar primero **Países actuales** con fecha de formación y una vista propia.
3. Después, **divisiones históricas jerárquicas** (imperio → virreinato → provincia).
4. Añadir la capa religiosa como módulo independiente.
5. Hacer la comparación de producto y priorizar mejoras de UX.
