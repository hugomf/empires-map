# Crónica de Imperios — comparativa de mercado y monetización

*Análisis a 21/10/2026. Precios de competidores consultados en sus webs; pueden variar por país e impuestos.*

> **Nota de estado:** el proyecto migró a `datos/*.json` (153 civilizaciones) mientras se redactaba este documento. El build está temporalmente roto (28 errores de TypeScript) y la validación aún no apunta al catálogo generado. Las cifras de producto de abajo reflejan el catálogo nuevo; los bloqueos de la sección 1 son los de hoy.

---

## 0. Resumen ejecutivo

1. **No cobraría por el atlas tal como está hoy.** Cobrar el mapa básico es competir contra Chronas, ChronoAtlas, OpenHistoricalMap, History Map World y Chronos 3D, que son gratis y ya tienen más datos. La ventaja de Crónica es otra: **dirección de arte, narración de auge/caída y mercado hispanohablante**.
2. **El dinero no está en el mapa: está en el flujo de trabajo.** Los comparables que cobran bien (TimeMaps, Phersu, GeaCron) venden profundidad, estadísticas, API o recursos de aula, no "un mapa con slider".
3. **Modelo recomendado:** freemium editorial + licencias de aula.
   - **Gratis:** atlas completo, 153 civilizaciones, línea de tiempo, búsqueda y enlaces. Sin anuncios.
   - **Pro:** €19–29/año o €59 lifetime de fundador. Offline/PWA, exportación de mapas y pósters, modo comparar, capas extra, visitas guiadas.
   - **Aula:** €79–99/año por profesor (hasta 35 alumnos), con modo presentación, fichas imprimibles y unidades didácticas.
   - **Centro:** €299–499/año (hasta 1.000 alumnos), facturación, administración y colecciones propias.
   - **Datos/API y licencias:** €500–5.000/año, más adelante.
4. **La ruta es web primero, no App Store.** El SEO programático (una página por civilización, región y año) y los vídeos cortos son el canal barato. La app móvil de pago (€9,99) solo después de validar en web.
5. **Antes de cobrar hay que cerrar cuatro cosas:** coherencia de datos (README dice 100, el catálogo 153, PENDIENTES 149), estabilizar el pipeline recién conectado (hoy el build falla), inglés real y analítica. Sin eso, la primera impresión y el soporte se comen el margen.

**La conclusión incómoda:** el producto ya es bonito; lo que falta es distribución. Un atlas más no se monetiza por tener más polígonos, sino por ser el que la gente recuerda, comparte y usa en clase.

---

## 1. Qué es hoy el producto (auditoría honesta)

### Lo que hay

| Pieza | Estado |
|---|---|
| Civilizaciones | **153** en `datos/*.json` (catálogo generado), 39 regiones |
| Territorios | 216 en `datos/territorios.json`, ya generados en `datos.generados.ts` |
| Interfaz | Mapa SVG, zoom, cronología tipo Gantt, ficha, buscador, filtros, atajos, enlaces `#1492/espana` |
| Diseño | Sistema visual propio y muy cuidado (Fraunces/Spectral/IBM Plex, tinta/pergamino/bronce) |
| Peso | `dist/` ~2,5 MB; sin backend, sin cuentas, sin cookies |
| Idiomas | Solo español |
| Analítica | Ninguna |
| PWA/offline | No hay manifest ni service worker |
| Pagos/cuentas | No existen |
| Datos nuevos | `datos/*.json` (153 civs, 610 hitos) conectados vía `datos.generados.ts`, pero el build está roto y la validación no apunta a ellos |
| Validación | `npm run validate` antes del build |

### Lo que juega a favor

- **Estética de atlas editorial**, no de SIG. Es lo que separa el producto de GeaCron y Phersu, que parecen herramientas de 2012.
- **Narrativa por civilización**: síntesis, caída, legado e hitos. No es solo "quién controlaba qué".
- **La metáfora de cúspide/decadencia** está bien resuelta visualmente (Gantt + rayado + contorno discontinuo). Es el gancho para redes y para clase.
- **Ligero y estático**: coste de infraestructura casi cero; se puede desplegar en Cloudflare Pages/Vercel gratis.
- **Español primero**: los grandes comparables son inglés primero. Es un arbitraje real en España y LatAm, sobre todo en educación.
- **Enlaces profundos** y atajos: buena base para SEO y para compartir momentos concretos.

### Lo que falta para poder cobrar

| Bloqueo | Por qué importa |
|---|---|
| Cifras inconsistentes (100/153/149) | La primera cosa que compara un usuario o un periodista. Hay que unificar el relato. |
| Pipeline inestable | El build falla (28 errores TS) y `npm run validate` valida las fuentes antiguas, no el catálogo generado. |
| Sin inglés real | `datos/en/` no existe: el generador replica el español. El mercado de pago es mayoritariamente anglófono. |
| Sin fuentes ni nivel de confianza | Un profesor no paga por datos sin procedencia; un medio tampoco. |
| Sin analítica | No se puede saber qué civilización retiene, qué busca la gente ni dónde abandonan. |
| Sin PWA | El README promete "no requiere conexión", pero sin service worker un refresh offline falla. |
| Sin páginas legales | Necesarias para escuelas, pagos y GDPR. |
| Sin cuentas ni checkout | No hay forma de cobrar; hay que decidir si se evita el backend o no. |

**Nota de producto:** la app no necesita un chatbot. La IA ya regala respuestas históricas; lo que no regala es **ver el cambio en el espacio y comparar dos civilizaciones en el mismo instante**. Ahí está la defensa.

---

## 2. Comparables de mercado

### 2.1 Atlas históricos interactivos

| Producto | Qué hace | Modelo y precio | Fortaleza | Lección para Crónica |
|---|---|---|---|---|
| **GeaCron** | Atlas vectorial 3000 a.C.–hoy, búsqueda, cronologías | Freemium web + Android **3,49 USD** + licencias B2B de bases de datos | 15 años de datos, mapas por año, oferta comercial a terceros | El dinero B2B está en la base de datos, no en la web. UX anticuada = oportunidad. |
| **Phersu Atlas** | 3499 a.C.–hoy, ~8.000 polities, estadísticas, eventos, API | **€29,99 / €59,99 / €69,99 al año**; licencias de grupo | Profundidad de datos, API, estadísticas, venta a grupos | Cobra por profundidad y herramientas, no por el mapa básico. |
| **TimeMaps** | 1.000+ mapas estáticos, enciclopedia y recursos docentes | **24,99 USD** particular; **39,99** profesor; **69,99** profesor + 40 alumnos; **299,99** institución | Marca educativa, currículo, recursos de aula | **La institución paga 12× lo que paga un particular.** El producto vendible son las unidades didácticas. |
| **Omniatlas** | Mapas evento a evento, artículos, timelines | Gratis + **Patreon** (~521 USD/mes, 676 miembros) | Comunidad fiel, contenido histórico riguroso | Las donaciones no sostienen un producto: 676 fans = ~0,77 USD/mes por fan. |
| **Chronas** | Mapa histórico colaborativo, capas y "epics" | Gratis con anuncios + funciones de pago | Comunidad y volumen de marcadores | Los anuncios degradan la percepción premium. No es el camino para este diseño. |
| **OpenHistoricalMap** | Datos históricos abiertos estilo OSM | Gratis, datos abiertos | Licencia abierta, comunidad, base GIS | No competir en datos crudos; usarlo como fuente o complemento. |
| **ChronoAtlas / Chronos 3D / History Map World** | Atlas modernos, algunos con IA y datos abiertos | Gratis (donaciones o IA) | Ya establecen el "suelo gratis" | La estética sola no es foso: hay que añadir flujo de trabajo y marca. |

### 2.2 Apps móviles y contenido

| Producto | Modelo | Precio | Lección |
|---|---|---|---|
| **World History Maps: The World** (iOS) | Pago único | **4,99 USD** | Un atlas especializado se vende como app de consulta, no como suscripción. |
| **World History Map: Empires** (iOS) | Pago único | **9,99 USD** | El usuario paga por "5.000 años en el bolsillo" si la propuesta es clara. |
| **Atlas of Islamic Civilizations** (iOS) | Gratis + compra única | **4,99 USD** acceso completo | Los nichos verticales funcionan con pago único; el contenido y el audio son el valor. |
| **OldMapsOnline** | Gratis + IAP | **1,99 USD** sin anuncios | Quitar anuncios es un micro-pago, no un negocio. |
| **World History Encyclopedia** | ONG: membresía + institucional + patrocinio | **5 USD/mes o 50 USD/año**; institucional | Contenido + misión + instituciones. El patrocinio llega con audiencia. |
| **History Timeline** (Android) | Gratis, 100k+ descargas | — | El volumen no implica ingresos; la retención de educación es ~2% al día 30. |

### 2.3 Benchmark de precios de apps educativas (2026)

- Suscripción media: **8,13 USD/mes** o **56,09 USD/año**.
- Retención al día 30: **~2%**; solo la mitad renueva tras el primer periodo.
- Conversión de visita a descarga: 18,1% iOS / 34,4% Google Play.

**Lectura:** una suscripción anual de 25–30 € está en línea con el mercado, pero el churn es brutal. Para un producto de un solo propósito, **pago único o anual barato + licencias B2B** es más sano que una suscripción mensual.

---

## 3. Posicionamiento recomendado

### La frase

> **Crónica de Imperios es el atlas editorial de las civilizaciones: 153 historias de auge y caída en un mapa que se recorre como una película. En español primero, para quien quiere entender, no memorizar.**

### Contra quién compite (y contra quién no)

| No competir contra | Sí competir contra |
|---|---|
| GeaCron/Phersu en número de polígonos o resolución diaria | Su falta de claridad, narrativa y diseño |
| Wikipedia/YouTube en exhaustividad | Su falta de contexto espacial y comparación |
| Google Earth en cartografía | Su falta de curaduría histórica |
| Un chatbot de historia | La experiencia visual y el aula |

### Público, por orden de disposición a pagar

1. **Profesores de historia** (ESO, Bachillerato, IB, AP, LatAm). Pagan por tiempo ahorrado y materiales, no por "otro mapa".
2. **Adultos curiosos** (35–65), lectores de historia, viajeros, oyentes de pódcast. Pagan por disfrute y por compartir.
3. **Creadores y escritores** (novela histórica, worldbuilding, divulgación). Pagan por exportar y por detalles.
4. **Instituciones** (colegios, museos, universidades, medios). Pagan por licencia, no por usuario.
5. **Fans de juegos de historia** (Age of Empires, Civilization, Crusader Kings). No pagan por el atlas, pero son audiencia y comunidad.

---

## 4. Modelo de monetización recomendado

### 4.1 La escalera

| Nivel | Precio | Qué incluye | Por qué |
|---|---|---|---|
| **Gratis** | 0 € | Atlas completo, 153 civilizaciones, cronología, búsqueda, enlaces, ficha básica | Es el motor de SEO, reputación y boca a boca. Nunca poner el atlas básico detrás de un muro. |
| **Pro** | **19 €/año** intro (29 € estándar) o **59 € lifetime** de fundador (primeros 200) | Offline/PWA, exportación PNG/PDF, pósters para uso personal, modo comparar 2–4 civilizaciones, capas extra (religión, rutas, fronteras históricas), visitas guiadas, tarjetas para compartir sin marca | Cobra por conveniencia y profundidad, no por el contenido básico. El lifetime financia el desarrollo y crea evangelizadores. |
| **Aula** | **79 €/año** intro (99 € estándar) por profesor, hasta 35 alumnos | Todo Pro + modo presentación, 20–30 unidades didácticas, fichas imprimibles con soluciones, código de clase sin cuentas de alumno, cuestionarios | Es el precio de TimeMaps Teacher Plus (69,99 USD) con más flujo de trabajo. |
| **Centro** | **299 €/año** (499 € con administración/SSO) hasta 1.000 alumnos | Múltiples profesores, panel de administración, facturación, colecciones propias, soporte prioritario | Es el precio de TimeMaps Whole Institution (299,99 USD). Una escuela = ~12 Pro. |
| **Datos/API** | **500–5.000 €/año** | JSON/GeoJSON, API de teselas, licencia de uso, atribución | GeaCron y Phersu ya venden esto. Requiere fuentes y esquema estables. |
| **Pósters** | 29–49 € | Impresión bajo demanda del mapa y de fichas | Margen 20–30%; marketing físico y regalo. |
| **Afiliación** | 5–10% | Libros, cursos, museos, viajes | Ingreso pasivo, nunca el principal. |
| **Patrocinio** | A medida | Colecciones patrocinadas, newsletter | Solo con audiencia; evita anuncios display. |

### 4.2 Por qué pago único y no solo suscripción

- La retención de apps educativas es ~2% al día 30; una suscripción mensual de un atlas se cancela en cuanto se termina el interés.
- El comparable móvil paga **4,99–9,99 USD una vez**; el comparable web paga **25–30 €/año**. El pago único de 19–29 € está en el punto dulce.
- El lifetime de fundador (59 €) es una herramienta de validación: 100 personas × 59 € = **5.900 €** antes de lanzar, y te dicen si el producto merece la pena.

### 4.3 Qué NO poner detrás del muro

- La línea de tiempo y el mapa básico.
- Las 153 fichas.
- Los enlaces compartidos.
- La búsqueda.

Si cobras eso, el producto deja de circular y pierdes el único canal barato que tienes: que la gente lo comparta.

### 4.4 Qué sí justifica pagar

- **Tiempo**: exportar un mapa para una clase o un vídeo en 10 segundos.
- **Profundidad**: comparar cuatro civilizaciones, ver capas religiosas o rutas, entender la incertidumbre del dato.
- **Aula**: planificación, fichas, presentación, evaluación.
- **Orgullo**: póster, edición, colección personal, apoyar el proyecto.

---

## 5. Fundamentos de precio

| Referencia | Precio | Traducción |
|---|---|---|
| TimeMaps particular | 24,99 USD/año | ~23 €/año |
| TimeMaps profesor + 40 alumnos | 69,99 USD/año | ~65 €/año |
| TimeMaps institución | 299,99 USD/año | ~280 €/año |
| Phersu Basic/Premium/Platinum | 29,99/59,99/69,99 €/año | 30–70 €/año |
| WHE membresía | 50 USD/año | ~46 €/año |
| Apps móviles de atlas | 4,99–9,99 USD una vez | 5–10 € una vez |
| Suscripción media educativa | 56,09 USD/año | ~52 €/año |

**Conclusión:** 19–29 €/año para Pro es agresivo pero creíble; 79–99 €/año para Aula está por debajo de TimeMaps; 299 €/año para Centro es el precio de mercado. En LatAm, aplicar **precios regionales** (PPP) y moneda local; un precio único en euros excluye a la mayor parte del mercado hispanohablante.

---

## 6. Escenarios de ingresos

Supuestos: Pro a 24 € de media; Aula a 79 €; Centro a 299 €; sin contar impuestos, comisiones de pago (2–5%) ni reembolsos. La conversión es sobre visitas anuales, no sobre usuarios únicos recurrentes.

| Escenario | Visitas/año | Conversión Pro | Pro | Aula | Centro | Datos/pósters | **Total bruto** |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Año 1 conservador** | 60.000 | 1,0% | 14.400 € | 790 € | 598 € | 0 € | **~15.800 €** |
| **Año 2 base** | 300.000 | 1,5% | 108.000 € | 3.950 € | 4.490 € | 8.000 € | **~124.400 €** |
| **Año 3 ambicioso** | 1.000.000 | 2,0% | 480.000 € | 15.800 € | 17.900 € | 40.000 € | **~553.700 €** |

**Sensibilidad:** si la conversión cae al 0,3%, divide la línea Pro por 3–6. Si el tráfico es 10 veces menor, el negocio sigue siendo viable como *lifestyle* (15–30 k€/año) porque el coste de infraestructura es casi cero, pero no como startup.

**Punto de equilibrio:** con 30–80 €/mes de infraestructura (dominio, analítica, email, quizá Supabase), se cubre con **~40 Pro/año o 1 centro**. Eso da libertad para crecer sin prisa.

---

## 7. Plan de 90 días

### Semanas 1–2 — cerrar la base

- Unificar el relato: 153 civilizaciones, 39 regiones, 216 territorios; corregir README/PENDIENTES.
- Estabilizar el pipeline: reparar el build, hacer que `npm run validate` valide `datos/*.json` y retirar las fuentes TS antiguas.
- Añadir **inglés de interfaz** y crear `datos/en/`; hoy el generador replica el español, así que no hay traducción real.
- PWA: manifest, iconos, service worker, instalación; probar offline real.
- Analítica cookieless (Plausible/Umami) + eventos: `civ_open`, `year_change`, `search`, `share`, `pro_click`, `checkout`, `export`.
- Páginas legales: privacidad, términos, cookies (si no hay cookies, mejor), licencias de datos y fuentes.
- Metadatos y OG images por civilización; `sitemap.xml`, `robots.txt`, `hreflang`.

### Semanas 3–4 — lanzar gratis y aprender

- 20–30 páginas SEO: `/c/roma`, `/region/mesopotamia`, `/ano/1492`, `/comparar/roma-vs-persia`.
- 10 tarjetas compartibles (cúspide/decadencia) y 3 vídeos de 15 s.
- Lanzamiento: Product Hunt, Hacker News (Show HN), r/MapPorn, r/history, comunidades españolas, LinkedIn docente.
- Email: "Un mapa cada domingo" (captura 2–5%).
- Objetivo: 5.000–15.000 visitas y 300–800 emails en 30 días.

### Semanas 5–8 — validar pago

- Entrevistas: 20 profesores, 20 lectores; preguntar por lo que pagan, no por lo que les gusta.
- MVP Pro: exportación PNG/PDF + comparar + offline + 5 visitas guiadas.
- Checkout alojado (Lemon Squeezy/Paddle como *merchant of record* para IVA global; Stripe para facturas B2B).
- Precio de fundador: 59 € lifetime, primeros 200; 19 €/año.
- Objetivo: 50–100 ventas y 10 aulas piloto gratuitas.

### Semanas 9–12 — convertir aulas

- 20–30 unidades didácticas alineadas con ESO/Bachillerato y AP/IB.
- Modo presentación y fichas imprimibles.
- Pilotar en 10 aulas; pedir testimonio y métricas de uso.
- Lanzar Aula a 79 €/año; Centro a 299 €/año.
- Objetivo: 10 aulas de pago y 2 centros, o aprender por qué no.

### Después (Q2–Q4)

- Traducir el contenido al inglés; SEO en inglés.
- API/GeoJSON y licencias a medios/edtech.
- Pósters bajo demanda.
- App móvil (Capacitor) a 9,99 € una vez, solo si la web retiene.
- Alianzas con pódcast/YouTubers de historia y editoriales.

---

## 8. Canales, por coste/efectividad

| Canal | Coste | Encaje | Comentario |
|---|---|---|---|
| SEO programático | Bajo | Muy alto | 153 fichas + 39 regiones + años clave. Los comparables tienen SEO débil. |
| Vídeo corto (TikTok/Reels/Shorts) | Bajo | Alto | "Observa cómo cae Roma en 20 s". La estética ya está hecha. |
| YouTubers/pódcast de historia | Medio | Alto | 20 contactos; ofrecer Pro gratis, colección personalizada y afiliación 20–30%. |
| Comunidades docentes | Bajo | Alto | Facebook/LinkedIn/Telegram; pilotos gratuitos a cambio de feedback. |
| Product Hunt / HN | Bajo | Medio | Pico de un día; sirve para backlinks y primeros usuarios. |
| Publicidad pagada | Alto | Bajo | No antes de tener LTV demostrado. |
| App Store | Medio | Bajo al principio | 15–30% de comisión y descubrimiento caro. |

---

## 9. Lo que no haría

- **Anuncios display.** Rompen la estética, pagan poco en este nicho y contradicen el posicionamiento premium.
- **Muro de pago al atlas básico.** Te quedas sin boca a boca y sin SEO.
- **Solo suscripción desde el día 1.** Churn alto y fricción para un producto de uso esporádico.
- **Competir en "más datos".** Phersu tiene 8.000 polities y resolución diaria; no se gana ahí.
- **App Store primero.** Es el canal más caro para validar.
- **Un chatbot como función principal.** La IA comoditiza la respuesta; tu foso es la comparación visual y el aula.
- **Copiar polígonos o fichas de competidores.** En la UE existen derechos *sui generis* sobre bases de datos; el riesgo legal no compensa.

---

## 10. Riesgos y cómo mitigarlos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Exactitud histórica y sensibilidad política | Alto | Página de metodología, fuentes, "aprox.", revisión por historiadores, aviso sobre fronteras modernas. |
| Derechos de bases de datos | Alto | Construir desde fuentes primarias/abiertas; documentar procedencia; no scrapear GeaCron/Phersu. |
| Ciclo de venta escolar lento (3–9 meses) | Alto | Empezar con pilotos y profesores individuales; no depender solo de centros. |
| Estacionalidad (vuelta al cole) | Medio | Campañas en agosto/septiembre; contenido durante todo el año. |
| Sensibilidad de precio en LatAm | Medio | Precios regionales/PPP y moneda local. |
| Fundador solo | Medio | Automatizar soporte, FAQ, licencias; no vender servicios a medida al principio. |
| Dependencia de Paddle/Stripe/App Store | Bajo/Medio | Checkout alojado y exportación de clientes; no encerrar la licencia. |
| IA que responde gratis | Medio | Enfatizar visual, comparación, exportación y aula; usar IA solo como asistente, no como producto. |

### Legal y operativo mínimo

- **Figura**: autónomo o SL; facturación; IVA OSS. Usar *merchant of record* (Paddle/Lemon Squeezy) simplifica el IVA de consumidor.
- **Documentos**: términos, privacidad, cookies (idealmente sin cookies), licencias, política de reembolsos.
- **Derecho de desistimiento UE**: para contenido digital, pedir consentimiento expreso y renuncia al plazo de 14 días en el checkout.
- **Escuelas**: acuerdo de tratamiento de datos (DPA), menores, no recoger más datos de los necesarios.
- **Accesibilidad**: WCAG AA, teclado, foco visible, contraste; muchas administraciones lo exigen.
- **Marcas**: comprobar "Crónica de Imperios" y dominio `.com`/`.es` antes de invertir en marca.
- **Fuentes**: Natural Earth es dominio público; las tipografías son OFL (incluir licencias); los datos históricos necesitan su propia ficha de procedencia.

---

## 11. Métricas que instrumentar desde el día 1

- **Activación**: % de sesiones que abren ≥3 civilizaciones o mueven la línea de tiempo ≥10 años.
- **Retención**: D7 y D30 de retorno web (no app).
- **Captura de email**: 2–5% de visitas.
- **Conversión Pro**: 0,5–2% de visitas; vigilar por fuente.
- **Conversión Aula**: 30–50% de pilotos a pago.
- **Renovación Centro**: >80%.
- **CAC** por Pro (contenido/creador) < 5 €; **LTV** > 30 €.
- **Uso de exportación** y de modo comparar: son las señales de que Pro tiene valor.
- **Búsquedas sin resultado**: lista directa de contenido que falta.

---

## 12. Decisiones que necesito de ti

1. **¿Negocio lifestyle o scalable?** Si quieres 15–60 k€/año y libertad, el plan de arriba sobra. Si quieres venture, hay que apostar por inglés + API + ventas institucionales y probablemente equipo.
2. **¿Mercado prioritario?** España/LatAm educación (más lento, más defensa) o global consumer en inglés (más rápido, más competencia).
3. **¿Cuánta infraestructura quieres?** La versión estática con licencias y checkout alojado evita backend y GDPR; las cuentas con sync añaden producto y coste.
4. **¿Tienes acceso a profesores/colegios?** Si no, el canal B2B tarda; empezaría por consumer y SEO mientras se construye la red docente.

---

## 13. Recomendación final en una frase

**Lanza gratis en español e inglés, construye audiencia con SEO y vídeo, cobra 19–29 €/año por Pro (o 59 € lifetime de fundador) por offline, exportación, comparación y capas, y vende 79–299 €/año a aulas y centros por materiales y flujo de trabajo. No cobres por el mapa; cobra por lo que el mapa te permite hacer.**
