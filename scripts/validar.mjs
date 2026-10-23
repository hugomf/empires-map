/**
 * Validador de integridad del catálogo y generador del bundle que consume la app.
 *
 *   node scripts/validar.mjs
 *
 * Falla (código de salida 1) si encuentra cualquier error, de modo que un
 * catálogo roto nunca llega al navegador. Los avisos no rompen el build.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const dirDatos = path.join(raiz, 'datos');

const leer = (n) => JSON.parse(fs.readFileSync(path.join(dirDatos, n), 'utf8'));

const civilizaciones = leer('civilizaciones.json');
const regiones = leer('regiones.json');
const hitos = leer('hitos.json');
const territorios = leer('territorios.json');
const artefactos = fs.existsSync(path.join(dirDatos, 'artefactos.json'))
  ? leer('artefactos.json')
  : [];
const deidades = fs.existsSync(path.join(dirDatos, 'deidades.json')) ? leer('deidades.json') : [];
const religiones = fs.existsSync(path.join(dirDatos, 'religiones.json'))
  ? leer('religiones.json')
  : [];
const ciudades = fs.existsSync(path.join(dirDatos, 'ciudades.json')) ? leer('ciudades.json') : [];
const gobernantes = fs.existsSync(path.join(dirDatos, 'gobernantes.json'))
  ? leer('gobernantes.json')
  : [];

/* Vocabularios y relaciones del modelo de organizaciones políticas. */
const leerSi = (n) => (fs.existsSync(path.join(dirDatos, n)) ? leer(n) : []);
const formas = leerSi('formas.json');
const escalasPoliticas = leerSi('escalas-politicas.json');
const soberanias = leerSi('soberanias.json');
const cargos = leerSi('cargos.json');
const dinastias = leerSi('dinastias.json');
const capitales = leerSi('capitales.json');
const ciudadesGobernante = leerSi('ciudades-gobernante.json');

/* Inglés: si existe datos/en/ se usa; si no, se replica el español */
const enDir = path.join(dirDatos, 'en');
const leerEn = (n) => {
  const f = path.join(enDir, n);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
};
const enCiv = leerEn('civilizaciones.json');
const enReg = leerEn('regiones.json');
const enTerr = leerEn('territorios.json');
const enRel = leerEn('religiones.json');
const enDei = leerEn('deidades.json');
const enCie = leerEn('ciudades.json');
const enArt = leerEn('artefactos.json');
const enGob = leerEn('gobernantes.json');
const enFormas = leerEn('formas.json');
const enEscalas = leerEn('escalas-politicas.json');
const enSoberanias = leerEn('soberanias.json');
const enCargos = leerEn('cargos.json');
const enDinastias = leerEn('dinastias.json');
const enPaisesActuales = leerEn('estados-actuales.json');

const paisesFile = path.join(dirDatos, 'estados-actuales.json');
const paisesActuales = fs.existsSync(paisesFile)
  ? JSON.parse(fs.readFileSync(paisesFile, 'utf8'))
  : [];


const errores = [];
const avisos = [];
const err = (tabla, id, msg) => errores.push({ tabla, id, msg });
const av = (tabla, id, msg) => avisos.push({ tabla, id, msg });

/* ─────────────────── Utilidades ─────────────────── */

const TIPOS = ['imperio', 'reino', 'estado', 'dinastia', 'cultura', 'pueblo', 'confederacion'];
const GRUPOS = ['Europa', 'Asia', 'África', 'América', 'Oceanía'];

/* Modelo de organizaciones políticas. */
const ENTIDADES = ['organizacion', 'cultura', 'pueblo', 'dinastia'];
const ESCALAS_POLITICAS = [
  'ciudad-estado',
  'principado',
  'ducado',
  'reino',
  'imperio',
  'estado',
  'confederacion',
  'organizacion-supranacional',
];
const ROLES_CAPITAL = ['capital', 'co-capital', 'residencia-real', 'sede-gobierno'];
const ROLES_CIUDAD_GOBERNANTE = [
  'residencia',
  'nacimiento',
  'muerte',
  'entierro',
  'fundacion',
  'conquista',
  'asedio',
  'batalla',
  'tratado',
  'patronazgo',
  'peregrinacion',
  'centro-administrativo',
  'puerto',
  'revuelta',
];
const ROLES_GOBERNANTE = ['titular', 'regente', 'co-regente', 'pretendiente'];

/** Caracteres legítimos fuera del español básico (vietnamita, dos ideogramas) */
const EXTRAS_PERMITIDOS = new Set([
  ...'ĐđĩĩĨĩŨũơƠơạẠảẢấẤầẦẩẨã� ÃăĂằẰắẮẳẲặẶạẹẸẻẺẽẼếẾềỀểỂễỄệỆỉỈịỊọỌỏỎốỐồỒổỔỗỖộỘớỚờỜởỞỡỠợỢụỤủỦứỨừỪửỬữỮựỰỳỲỵỴỷỹỸ',
  '繁衍',
]);

const tieneBasura = (s) => {
  if (typeof s !== 'string') return false;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp === 0xfffd) return true; // carácter de reemplazo
    if (cp < 32 && ch !== '\n') return true; // control
    if (cp > 127 && !EXTRAS_PERMITIDOS.has(ch)) {
      if (
        (cp >= 0x0400 && cp <= 0x04ff) || // cirílico
        (cp >= 0x0590 && cp <= 0x05ff) || // hebreo
        (cp >= 0x0600 && cp <= 0x06ff) || // árabe
        (cp >= 0x0900 && cp <= 0x097f) || // devanagari
        (cp >= 0x0e00 && cp <= 0x0e7f) || // tailandés
        (cp >= 0xff00 && cp <= 0xffef) || // ancho completo
        (cp >= 0x3000 && cp <= 0x9fff) // CJK y similar
      ) {
        return true;
      }
    }
  }
  return false;
};

const colorValido = (c) => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);

/**
 * Palabras inglesas que no existen en español. Una traducción automática
 * mal hecha deja restos así dentro del catálogo español («el kingdom de la
 * costa»), y no lo detecta el filtro de alfabetos no latinos.
 */
const PALABRAS_INGLESAS = [
  'maritime', 'datatype', 'commercial', 'corrupted', 'takers', 'influences',
  'prefix', 'family', 'kingdom', 'ruled', 'early', 'its', 'citizenship',
  'hunters', 'department', 'dynasty', 'unsettled', 'nothing', 'founded',
  'reached', 'extended', 'including', 'became', 'empire', 'people', 'world',
  'century', 'province', 'border', 'coast', 'river', 'mountain', 'ruler',
  'throne', 'victory', 'defeat', 'united', 'witnessed', 'grand', 'noble',
  'temple', 'temples', 'warrior', 'merchants', 'kingdoms', 'dynasties',
  'settled', 'the', 'and', 'with', 'from', 'were', 'which', 'have', 'been',
  'their', 'there', 'when', 'into', 'over', 'under', 'between', 'after',
  'before', 'also', 'not', 'but', 'who', 'what', 'where',
];

const RE_INGLES = new RegExp(
  `(?<![\\p{L}])(?:${PALABRAS_INGLESAS.join('|')})(?![\\p{L}])`,
  'giu',
);

/** Caracteres que sólo aparecen cuando el texto se ha roto al generarlo. */
const RE_BASURA = /[%`]|�/;

const comprobarIdioma = (tabla, id, campo, valor) => {
  if (typeof valor !== 'string') return;
  RE_INGLES.lastIndex = 0;
  const m = RE_INGLES.exec(valor);
  if (m) err(tabla, id, `mezcla de idiomas en ${campo}: «${m[0]}»`);
  else if (RE_BASURA.test(valor)) err(tabla, id, `caracteres inválidos en ${campo}`);
};


/* ─────────────────── 1. Unicidad ─────────────────── */
const dup = (lista, campo = 'id') => {
  const vistos = new Map();
  for (const f of lista) {
    const v = f[campo];
    if (vistos.has(v)) err(lista === civilizaciones ? 'civilizaciones' : 'tabla', v, `id duplicado: ${v}`);
    else vistos.set(v, true);
  }
};

const dupTabla = (lista, tabla) => {
  const vistos = new Set();
  for (const f of lista) {
    if (!f.id) err(tabla, '(sin id)', 'falta id');
    else if (vistos.has(f.id)) err(tabla, f.id, 'id duplicado');
    else vistos.add(f.id);
  }
};

dup(civilizaciones);
dup(regiones);
dup(hitos);
dup(territorios);
dupTabla(formas, 'formas');
dupTabla(escalasPoliticas, 'escalas-politicas');
dupTabla(soberanias, 'soberanias');
dupTabla(cargos, 'cargos');
dupTabla(dinastias, 'dinastias');
dupTabla(capitales, 'capitales');
dupTabla(ciudadesGobernante, 'ciudades-gobernante');

/* ─────────────────── 1b. Vocabularios de organización ─────────────────── */
for (const f of formas) {
  if (!f.nombre) err('formas', f.id, 'falta nombre');
  if (!['monarquia', 'republica', 'teocracia', 'otro'].includes(f.grupo))
    err('formas', f.id, `grupo inválido: ${f.grupo}`);
}
for (const e of escalasPoliticas) {
  if (!ESCALAS_POLITICAS.includes(e.id)) err('escalas-politicas', e.id, `escala inválida: ${e.id}`);
  if (!e.nombre) err('escalas-politicas', e.id, 'falta nombre');
  if (typeof e.orden !== 'number') err('escalas-politicas', e.id, 'orden no numérico');
}
for (const s of soberanias) {
  if (!s.nombre) err('soberanias', s.id, 'falta nombre');
}
const idsForma = new Set(formas.map((f) => f.id));
for (const c of cargos) {
  if (!c.nombre) err('cargos', c.id, 'falta nombre');
  if (!c.plural) err('cargos', c.id, 'falta plural');
  if (!c.categoria) err('cargos', c.id, 'falta categoría');
  if (c.forma !== undefined && !idsForma.has(c.forma))
    err('cargos', c.id, `forma inexistente: ${c.forma}`);
  if (typeof c.orden !== 'number') err('cargos', c.id, 'orden no numérico');
}
for (const d of dinastias) {
  if (!d.nombre) err('dinastias', d.id, 'falta nombre');
  if (d.desde !== undefined && typeof d.desde !== 'number')
    err('dinastias', d.id, 'desde no numérico');
  if (d.hasta !== undefined && typeof d.hasta !== 'number')
    err('dinastias', d.id, 'hasta no numérico');
  if (d.desde !== undefined && d.hasta !== undefined && d.desde > d.hasta)
    err('dinastias', d.id, `fechas invertidas: ${d.desde} > ${d.hasta}`);
}

const idsEscala = new Set(escalasPoliticas.map((e) => e.id));
const idsSoberania = new Set(soberanias.map((s) => s.id));
const idsCargo = new Set(cargos.map((c) => c.id));
const idsDinastia = new Set(dinastias.map((d) => d.id));

/* ─────────────────── 2. Civilizaciones ─────────────────── */
const idsCiv = new Set(civilizaciones.map((c) => c.id));
const idsRegion = new Set(regiones.map((r) => r.id));
const idsTerr = new Set(territorios.map((t) => t.id));

for (const c of civilizaciones) {
  const id = c.id;
  if (!c.nombre) err('civilizaciones', id, 'falta nombre');
  if (!TIPOS.includes(c.tipo)) err('civilizaciones', id, `tipo inválido: ${c.tipo}`);
  if (!idsRegion.has(c.region)) err('civilizaciones', id, `región inexistente: ${c.region}`);
  if (!colorValido(c.color)) err('civilizaciones', id, `color inválido: ${c.color}`);
  if (typeof c.inicio !== 'number' || typeof c.fin !== 'number')
    err('civilizaciones', id, 'inicio/fin no numéricos');
  else {
    if (c.inicio >= c.fin) err('civilizaciones', id, `fecha imposible: inicio ${c.inicio} ≥ fin ${c.fin}`);
    if (c.fin > 2026) err('civilizaciones', id, `fin posterior a hoy: ${c.fin}`);
  }
  for (const campo of ['apogeo', 'declive']) {
    const v = c[campo];
    if (!v) continue;
    if (!Array.isArray(v) || v.length !== 2)
      err('civilizaciones', id, `${campo} no es un intervalo`);
    else {
      const [a, b] = v;
      if (a >= b) err('civilizaciones', id, `${campo} invertido: [${a}, ${b}]`);
      if (c.inicio !== undefined && c.fin !== undefined) {
        if (a < c.inicio || b > c.fin)
          err('civilizaciones', id, `${campo} [${a}, ${b}] fuera de la vigencia [${c.inicio}, ${c.fin}]`);
      }
    }
  }
  for (const campo of ['sintesis', 'caida', 'legado']) {
    if (!c[campo] || c[campo].length < 30) err('civilizaciones', id, `${campo} demasiado corto`);
    if (tieneBasura(c[campo])) err('civilizaciones', id, `${campo} contiene caracteres no permitidos`);
    comprobarIdioma('civilizaciones', id, campo, c[campo]);
  }
  if (c.escritura !== undefined) {
    if (typeof c.escritura !== 'string' || !c.escritura.trim())
      err('civilizaciones', id, 'escritura vacía o no textual');
    else {
      if (tieneBasura(c.escritura))
        err('civilizaciones', id, 'escritura con caracteres no permitidos');
      comprobarIdioma('civilizaciones', id, 'escritura', c.escritura);
    }
  }
  if (c.abrev && c.abrev.length > 6) av('civilizaciones', id, `abrev demasiado larga: ${c.abrev}`);
}

/* ─────────────────── 2a. Facetas y periodos ─────────────────── */
const periodosPorCiv = new Map();
const idsPeriodo = new Set();

for (const c of civilizaciones) {
  const id = c.id;
  if (c.entidad !== undefined && !ENTIDADES.includes(c.entidad))
    err('civilizaciones', id, `entidad inválida: ${c.entidad}`);
  if (c.escalaPolitica !== undefined && !idsEscala.has(c.escalaPolitica))
    err('civilizaciones', id, `escala política inexistente: ${c.escalaPolitica}`);
  if (c.forma !== undefined && !idsForma.has(c.forma))
    err('civilizaciones', id, `forma inexistente: ${c.forma}`);
  if (c.soberania !== undefined && !idsSoberania.has(c.soberania))
    err('civilizaciones', id, `soberanía inexistente: ${c.soberania}`);
  if (c.cargoPrincipal !== undefined && !idsCargo.has(c.cargoPrincipal))
    err('civilizaciones', id, `cargo principal inexistente: ${c.cargoPrincipal}`);
  if (c.dinastiaPrincipal !== undefined && !idsDinastia.has(c.dinastiaPrincipal))
    err('civilizaciones', id, `dinastía principal inexistente: ${c.dinastiaPrincipal}`);

  if (c.periodos === undefined) continue;
  if (!Array.isArray(c.periodos)) {
    err('civilizaciones', id, 'periodos no es una lista');
    continue;
  }
  const locales = new Map();
  for (const p of c.periodos) {
    if (!p.id) {
      err('civilizaciones', id, 'periodo sin id');
      continue;
    }
    if (locales.has(p.id)) err('civilizaciones', p.id, 'periodo duplicado en la organización');
    if (idsPeriodo.has(p.id)) err('civilizaciones', p.id, 'id de periodo duplicado en el catálogo');
    idsPeriodo.add(p.id);
    locales.set(p.id, p);
    if (!p.nombre) err('civilizaciones', p.id, 'periodo sin nombre');
    else {
      if (tieneBasura(p.nombre)) err('civilizaciones', p.id, 'periodo con caracteres no permitidos');
      comprobarIdioma('civilizaciones', p.id, 'periodo.nombre', p.nombre);
    }
    if (p.nota !== undefined) {
      if (tieneBasura(p.nota)) err('civilizaciones', p.id, 'nota de periodo con caracteres no permitidos');
      comprobarIdioma('civilizaciones', p.id, 'periodo.nota', p.nota);
    }
    if (typeof p.desde !== 'number' || typeof p.hasta !== 'number') {
      err('civilizaciones', p.id, 'periodo con fechas no numéricas');
    } else {
      if (p.desde > p.hasta) err('civilizaciones', p.id, `periodo invertido: ${p.desde} > ${p.hasta}`);
      if (p.desde < c.inicio || p.hasta > c.fin)
        err('civilizaciones', p.id, `periodo [${p.desde}, ${p.hasta}] fuera de la organización [${c.inicio}, ${c.fin}]`);
    }
    if (p.forma !== undefined && !idsForma.has(p.forma))
      err('civilizaciones', p.id, `forma de periodo inexistente: ${p.forma}`);
    if (p.cargo !== undefined && !idsCargo.has(p.cargo))
      err('civilizaciones', p.id, `cargo de periodo inexistente: ${p.cargo}`);
    if (p.dinastia !== undefined && !idsDinastia.has(p.dinastia))
      err('civilizaciones', p.id, `dinastía de periodo inexistente: ${p.dinastia}`);
    if (p.paralelo !== undefined && typeof p.paralelo !== 'boolean')
      err('civilizaciones', p.id, 'paralelo no booleano');
  }

  /* Los periodos pueden compartir un año limítrofe, pero no solaparse salvo
     que representen ramas paralelas declaradas. */
  const orden = [...c.periodos].sort((a, b) => a.desde - b.desde);
  for (let i = 0; i < orden.length; i++) {
    for (let j = i + 1; j < orden.length; j++) {
      const a = orden[i];
      const b = orden[j];
      if (a.desde < b.hasta && b.desde < a.hasta && !a.paralelo && !b.paralelo)
        err('civilizaciones', id, `periodos solapados sin «paralelo»: ${a.id} y ${b.id}`);
    }
  }
  periodosPorCiv.set(id, locales);
}

/* ─────────────────── 2b. Alias del buscador ─────────────────── */
/**
 * Un alias no puede estar vacío, repetirse dentro de la misma civilización,
 * coincidir con el nombre canónico de otra ni repetirse en dos
 * civilizaciones: en cualquiera de los casos la búsqueda sería ambigua.
 */
const normalizarAlias = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[«»"'()·.,\-—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const comprobarAlias = (civs, etiqueta, idioma = 'es') => {
  const canonicos = new Map();
  for (const c of civs) canonicos.set(normalizarAlias(c.nombre), c.id);
  const vistos = new Map();

  for (const c of civs) {
    if (c.alias === undefined) continue;
    if (!Array.isArray(c.alias)) {
      err(etiqueta, c.id, 'alias no es una lista');
      continue;
    }
    const propios = new Set();
    for (const a of c.alias) {
      if (typeof a !== 'string' || !a.trim()) {
        err(etiqueta, c.id, 'alias vacío');
        continue;
      }
      if (tieneBasura(a)) err(etiqueta, c.id, `alias con caracteres no permitidos: ${a}`);
      if (idioma === 'es') comprobarIdioma(etiqueta, c.id, 'alias', a);
      const k = normalizarAlias(a);
      if (propios.has(k)) {
        err(etiqueta, c.id, `alias repetido: «${a}»`);
        continue;
      }
      propios.add(k);
      if (canonicos.get(k) && canonicos.get(k) !== c.id)
        err(etiqueta, c.id, `alias «${a}» coincide con el nombre canónico de ${canonicos.get(k)}`);
      if (canonicos.get(k) === c.id)
        err(etiqueta, c.id, `alias «${a}» repite su propio nombre canónico`);
      if (vistos.has(k)) {
        err(etiqueta, c.id, `alias duplicado: «${a}» (ya lo declara ${vistos.get(k)})`);
      } else {
        vistos.set(k, c.id);
      }
    }
  }
};

comprobarAlias(civilizaciones, 'civilizaciones');
if (enCiv) comprobarAlias(enCiv, 'civilizaciones (en)', 'en');

/* ─────────────────── 3. Regiones ─────────────────── */
for (const r of regiones) {
  if (!GRUPOS.includes(r.grupo)) err('regiones', r.id, `grupo inválido: ${r.grupo}`);
  if (!Array.isArray(r.paises) || !r.paises.length) err('regiones', r.id, 'sin países');
  if (!Array.isArray(r.ancla) || r.ancla.length !== 2) err('regiones', r.id, 'ancla inválida');
  else {
    const [lon, lat] = r.ancla;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90)
      err('regiones', r.id, `ancla fuera de rango: ${lon}, ${lat}`);
  }
}

/* ─────────────────── 4. Hitos ─────────────────── */
for (const h of hitos) {
  if (!idsCiv.has(h.civilizacion)) err('hitos', h.id, `civilización inexistente: ${h.civilizacion}`);
  if (typeof h.anio !== 'number') err('hitos', h.id, 'año no numérico');
  if (tieneBasura(h.texto)) err('hitos', h.id, 'texto con caracteres no permitidos');
  comprobarIdioma('hitos', h.id, 'texto', h.texto);
  const c = civilizaciones.find((x) => x.id === h.civilizacion);
  if (c && h.anio < c.inicio) av('hitos', h.id, `año ${h.anio} anterior al inicio de ${c.id}`);
  if (c && h.anio > c.fin) av('hitos', h.id, `año ${h.anio} posterior al fin de ${c.id}`);
}

/* ─────────────────── 5. Territorios y geometría ─────────────────── */

const segmentosSeCruzan = (a1, a2, b1, b2) => {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  const d1 = o(a1, a2, b1);
  const d2 = o(a1, a2, b2);
  const d3 = o(b1, b2, a1);
  const d4 = o(b1, b2, a2);
  return d1 !== d2 && d3 !== d4;
};

for (const t of territorios) {
  if (!idsCiv.has(t.civilizacion))
    err('territorios', t.id, `civilización inexistente: ${t.civilizacion}`);
  if (!['tierra', 'ciudad'].includes(t.tipo)) err('territorios', t.id, `tipo inválido: ${t.tipo}`);
  comprobarIdioma('territorios', t.id, 'nombre', t.nombre);
  if (!Array.isArray(t.anillos) || !t.anillos.length) {
    err('territorios', t.id, 'sin anillos');
    continue;
  }
  for (const [n, anillo] of t.anillos.entries()) {
    const pre = `${t.id}#${n}`;
    if (!Array.isArray(anillo) || anillo.length < 4)
      err('territorios', pre, `anillo con menos de 4 puntos (${anillo?.length ?? 0})`);
    for (const p of anillo) {
      if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'number' || typeof p[1] !== 'number')
        err('territorios', pre, `punto inválido: ${JSON.stringify(p)}`);
      else if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]))
        err('territorios', pre, `coordenada no finita: ${JSON.stringify(p)}`);
      else if (p[0] < -180 || p[0] > 180 || p[1] < -90 || p[1] > 90)
        err('territorios', pre, `coordenada fuera de rango: ${p[0]}, ${p[1]}`);
    }
    const cerrado = anillo[0]?.[0] === anillo[anillo.length - 1]?.[0] && anillo[0]?.[1] === anillo[anillo.length - 1]?.[1];
    if (!cerrado) err('territorios', pre, 'anillo sin cerrar');
    // auto-intersecciones
    const np = anillo.length - 1;
    for (let i = 0; i < np; i++)
      for (let j = i + 2; j < np; j++) {
        if (i === 0 && j === np - 1) continue; // adyacentes por el cierre
        if (segmentosSeCruzan(anillo[i], anillo[i + 1], anillo[j], anillo[j + 1]))
          err('territorios', pre, `anillo auto-intersectado en los puntos ${i} y ${j}`);
      }
  }
  if (!['polidad', 'division', 'sobrano', 'dependiente', 'disperso'].includes(t.nivel))
    err('territorios', t.id, `nivel inválido: ${t.nivel}`);
  if (t.nivel === 'division') {
    /* Toda división depende de una polidad: sin «superior» el dato está roto. */
    if (!t.superior) err('territorios', t.id, 'división sin «superior»');
    else if (!idsCiv.has(t.superior) && !idsTerr.has(t.superior))
      err('territorios', t.id, `superior inexistente: ${t.superior}`);
    else {
      const sup = civilizaciones.find((x) => x.id === t.superior);
      if (sup) {
        if (t.desde !== null && t.desde < sup.inicio)
          av('territorios', t.id, `desde ${t.desde} anterior al inicio de ${t.superior}`);
        if (t.hasta !== null && t.hasta > sup.fin)
          av('territorios', t.id, `hasta ${t.hasta} posterior al fin de ${t.superior}`);
      }
    }
  }
  if (t.confianza !== undefined && !['alta', 'media', 'baja'].includes(t.confianza))
    err('territorios', t.id, `confianza inválida: ${t.confianza}`);
  if (t.fuente !== undefined && typeof t.fuente !== 'string')
    err('territorios', t.id, 'fuente no textual');
  if (t.desde !== null && t.hasta !== null && t.desde >= t.hasta)
    err('territorios', t.id, `intervalo imposible: desde ${t.desde} ≥ hasta ${t.hasta}`);
  const c = civilizaciones.find((x) => x.id === t.civilizacion);
  if (c && t.desde !== null && t.desde < c.inicio)
    av('territorios', t.id, `desde ${t.desde} anterior al inicio de ${c.id}`);
  if (c && t.hasta !== null && t.hasta > c.fin)
    av('territorios', t.id, `hasta ${t.hasta} posterior al fin de ${c.id}`);
}

/* ─────────────────── 6. Cultura (artefactos, deidades, religiones) ─────────────────── */
for (const a of artefactos) {
  if (!idsCiv.has(a.civilizacion))
    err('artefactos', a.id, `civilización inexistente: ${a.civilizacion}`);
  if (tieneBasura(a.nombre ?? '') || tieneBasura(a.descripcion ?? ''))
    err('artefactos', a.id, 'texto con caracteres no permitidos');
  comprobarIdioma('artefactos', a.id, 'nombre', a.nombre);
  comprobarIdioma('artefactos', a.id, 'descripcion', a.descripcion);
}
for (const d of deidades) {
  if (!idsCiv.has(d.civilizacion))
    err('deidades', d.id, `civilización inexistente: ${d.civilizacion}`);
  if (tieneBasura(d.nombre ?? '') || tieneBasura(d.dominio ?? ''))
    err('deidades', d.id, 'texto con caracteres no permitidos');
  comprobarIdioma('deidades', d.id, 'nombre', d.nombre);
  comprobarIdioma('deidades', d.id, 'dominio', d.dominio);
}
for (const r of religiones) {
  if (!idsCiv.has(r.civilizacion))
    err('religiones', r.id, `civilización inexistente: ${r.civilizacion}`);
  if (tieneBasura(r.nombre ?? '') || tieneBasura(r.descripcion ?? ''))
    err('religiones', r.id, 'texto con caracteres no permitidos');
  comprobarIdioma('religiones', r.id, 'nombre', r.nombre);
  comprobarIdioma('religiones', r.id, 'descripcion', r.descripcion);
}
const idsCiudad = new Set();
for (const c of ciudades) {
  if (!c.id) err('ciudades', '(sin id)', 'falta id');
  else if (idsCiudad.has(c.id)) err('ciudades', c.id, 'id duplicado');
  else idsCiudad.add(c.id);
  if (!idsCiv.has(c.civilizacion))
    err('ciudades', c.id, `civilización inexistente: ${c.civilizacion}`);
  if (!c.nombre || tieneBasura(c.nombre)) err('ciudades', c.id, 'nombre vacío o inválido');
  comprobarIdioma('ciudades', c.id, 'nombre', c.nombre);
  if (typeof c.lat !== 'number' || c.lat < -90 || c.lat > 90)
    err('ciudades', c.id, `latitud inválida: ${c.lat}`);
  if (typeof c.lon !== 'number' || c.lon < -180 || c.lon > 180)
    err('ciudades', c.id, `longitud inválida: ${c.lon}`);
  if (c.actual && tieneBasura(c.actual)) err('ciudades', c.id, 'nombre actual inválido');
  if (c.actual) comprobarIdioma('ciudades', c.id, 'actual', c.actual);
  if (c.principal !== undefined && typeof c.principal !== 'boolean')
    err('ciudades', c.id, 'principal no booleano');
}

/* Todas las civilizaciones deben tener al menos una ciudad principal. */
for (const c of civilizaciones) {
  if (!ciudades.some((x) => x.civilizacion === c.id && x.principal !== false))
    av('ciudades', c.id, 'sin ciudades principales');
}

/* ─────────────────── 7. Gobernantes ─────────────────── */
const idsGobernante = new Set();
for (const g of gobernantes) {
  if (!g.id) {
    err('gobernantes', '(sin id)', 'falta id');
    continue;
  }
  if (idsGobernante.has(g.id)) err('gobernantes', g.id, 'id duplicado');
  else idsGobernante.add(g.id);
  if (!idsCiv.has(g.civilizacion))
    err('gobernantes', g.id, `civilización inexistente: ${g.civilizacion}`);
  if (!g.nombre || tieneBasura(g.nombre))
    err('gobernantes', g.id, 'nombre vacío o inválido');
  if (!g.titulo || tieneBasura(g.titulo))
    err('gobernantes', g.id, 'título vacío o inválido');
  if (typeof g.desde !== 'number' || typeof g.hasta !== 'number') {
    err('gobernantes', g.id, 'desde/hasta no numéricos');
  } else if (g.desde > g.hasta) {
    err('gobernantes', g.id, `fechas invertidas: ${g.desde} > ${g.hasta}`);
  }
  comprobarIdioma('gobernantes', g.id, 'nombre', g.nombre);
  comprobarIdioma('gobernantes', g.id, 'titulo', g.titulo);
  if (g.dinastia) comprobarIdioma('gobernantes', g.id, 'dinastia', g.dinastia);
  if (g.nota) comprobarIdioma('gobernantes', g.id, 'nota', g.nota);
  const c = civilizaciones.find((x) => x.id === g.civilizacion);
  if (c && typeof g.desde === 'number' && g.desde < c.inicio)
    av('gobernantes', g.id, `desde ${g.desde} anterior al inicio de ${c.id}`);
  if (c && typeof g.hasta === 'number' && g.hasta > c.fin)
    av('gobernantes', g.id, `hasta ${g.hasta} posterior al fin de ${c.id}`);
  if (g.cargo !== undefined && !idsCargo.has(g.cargo))
    err('gobernantes', g.id, `cargo inexistente: ${g.cargo}`);
  if (g.dinastiaId !== undefined && !idsDinastia.has(g.dinastiaId))
    err('gobernantes', g.id, `dinastía inexistente: ${g.dinastiaId}`);
  if (g.rol !== undefined && !ROLES_GOBERNANTE.includes(g.rol))
    err('gobernantes', g.id, `rol inválido: ${g.rol}`);
  if (g.periodo !== undefined) {
    const periodos = periodosPorCiv.get(g.civilizacion);
    const p = periodos?.get(g.periodo);
    if (!p) err('gobernantes', g.id, `periodo inexistente en ${g.civilizacion}: ${g.periodo}`);
    else if (
      typeof g.desde === 'number' &&
      typeof g.hasta === 'number' &&
      (g.desde < p.desde || g.hasta > p.hasta)
    )
      av('gobernantes', g.id, `fechas [${g.desde}, ${g.hasta}] fuera del periodo ${g.periodo} [${p.desde}, ${p.hasta}]`);
  }
}

/* ─────────────────── 7b. Capitales y ciudades de gobernantes ─────────────────── */
const civPorId = new Map(civilizaciones.map((c) => [c.id, c]));
const gobPorId = new Map(gobernantes.map((g) => [g.id, g]));
const ciudadPorId = new Map(ciudades.map((c) => [c.id, c]));

for (const cap of capitales) {
  const org = civPorId.get(cap.organizacion);
  if (!org) err('capitales', cap.id, `organización inexistente: ${cap.organizacion}`);
  if (!idsCiudad.has(cap.ciudad)) err('capitales', cap.id, `ciudad inexistente: ${cap.ciudad}`);
  if (!ROLES_CAPITAL.includes(cap.rol)) err('capitales', cap.id, `rol inválido: ${cap.rol}`);
  if (typeof cap.desde !== 'number') err('capitales', cap.id, 'desde no numérico');
  if (cap.hasta !== undefined && typeof cap.hasta !== 'number')
    err('capitales', cap.id, 'hasta no numérico');
  if (typeof cap.desde === 'number' && typeof cap.hasta === 'number' && cap.desde > cap.hasta)
    err('capitales', cap.id, `fechas invertidas: ${cap.desde} > ${cap.hasta}`);
  if (org && typeof cap.desde === 'number' && cap.desde < org.inicio)
    av('capitales', cap.id, `desde ${cap.desde} anterior al inicio de ${org.id}`);
  if (org && typeof cap.hasta === 'number' && cap.hasta > org.fin)
    av('capitales', cap.id, `hasta ${cap.hasta} posterior al fin de ${org.id}`);
  if (cap.periodo !== undefined) {
    const p = periodosPorCiv.get(cap.organizacion)?.get(cap.periodo);
    if (!p) err('capitales', cap.id, `periodo inexistente en ${cap.organizacion}: ${cap.periodo}`);
    else {
      if (typeof cap.desde === 'number' && cap.desde < p.desde)
        av('capitales', cap.id, `desde ${cap.desde} anterior al periodo ${p.id}`);
      if (typeof cap.hasta === 'number' && cap.hasta > p.hasta)
        av('capitales', cap.id, `hasta ${cap.hasta} posterior al periodo ${p.id}`);
    }
  }
  const city = ciudadPorId.get(cap.ciudad);
  if (city && city.civilizacion !== cap.organizacion)
    av('capitales', cap.id, `la ciudad ${cap.ciudad} pertenece a ${city.civilizacion}`);
  if (cap.nota !== undefined) {
    if (tieneBasura(cap.nota)) err('capitales', cap.id, 'nota con caracteres no permitidos');
    comprobarIdioma('capitales', cap.id, 'nota', cap.nota);
  }
}

for (const cg of ciudadesGobernante) {
  const g = gobPorId.get(cg.gobernante);
  if (!g) err('ciudades-gobernante', cg.id, `gobernante inexistente: ${cg.gobernante}`);
  if (!idsCiudad.has(cg.ciudad)) err('ciudades-gobernante', cg.id, `ciudad inexistente: ${cg.ciudad}`);
  if (!ROLES_CIUDAD_GOBERNANTE.includes(cg.rol))
    err('ciudades-gobernante', cg.id, `rol inválido: ${cg.rol}`);
  if (cg.desde !== undefined && typeof cg.desde !== 'number')
    err('ciudades-gobernante', cg.id, 'desde no numérico');
  if (cg.hasta !== undefined && typeof cg.hasta !== 'number')
    err('ciudades-gobernante', cg.id, 'hasta no numérico');
  if (typeof cg.desde === 'number' && typeof cg.hasta === 'number' && cg.desde > cg.hasta)
    err('ciudades-gobernante', cg.id, `fechas invertidas: ${cg.desde} > ${cg.hasta}`);
  if (g && typeof cg.desde === 'number' && cg.desde < g.desde)
    av('ciudades-gobernante', cg.id, `desde ${cg.desde} anterior al reinado de ${g.id}`);
  if (g && typeof cg.hasta === 'number' && cg.hasta > g.hasta)
    av('ciudades-gobernante', cg.id, `hasta ${cg.hasta} posterior al reinado de ${g.id}`);
  if (cg.nota !== undefined) {
    if (tieneBasura(cg.nota)) err('ciudades-gobernante', cg.id, 'nota con caracteres no permitidos');
    comprobarIdioma('ciudades-gobernante', cg.id, 'nota', cg.nota);
  }
}

/* ─────────────────── 8. Países actuales ─────────────────── */
/**
 * Cada Estado contemporáneo tiene un código ISO 3166-1 alpha-2 válido y único,
 * un año de formación coherente, un tipo de formación del conjunto permitido y
 * una nota que explique el caso. El catálogo inglés debe cubrir los mismos
 * códigos y los mismos datos estructurales que el español.
 */
const TIPOS_FORMACION = [
  'independencia',
  'unificacion',
  'constitucion',
  'reconocimiento',
  'sucesion',
];

const validarPaises = (paises, etiqueta, idioma) => {
  if (!Array.isArray(paises)) {
    err(etiqueta, '(conjunto)', 'el dataset no es una lista');
    return new Map();
  }
  const porId = new Map();
  for (const p of paises) {
    const id = p.id;
    if (typeof id !== 'string' || !/^[A-Z]{2}$/.test(id))
      err(etiqueta, id ?? '(sin id)', `código ISO inválido: ${id}`);
    else if (porId.has(id)) err(etiqueta, id, 'código ISO duplicado');
    else porId.set(id, p);

    if (typeof p.nombre !== 'string' || p.nombre.trim().length < 2)
      err(etiqueta, id, 'nombre vacío o demasiado corto');
    else if (tieneBasura(p.nombre)) err(etiqueta, id, 'nombre con caracteres no permitidos');
    else if (idioma === 'es') comprobarIdioma(etiqueta, id, 'nombre', p.nombre);

    if (typeof p.formacion !== 'number' || !Number.isInteger(p.formacion))
      err(etiqueta, id, 'formación no es un año entero');
    else if (p.formacion < 800 || p.formacion > 2026)
      err(etiqueta, id, `formación fuera de rango: ${p.formacion}`);

    if (!TIPOS_FORMACION.includes(p.tipoFormacion))
      err(etiqueta, id, `tipo de formación inválido: ${p.tipoFormacion}`);

    if (typeof p.nota !== 'string' || p.nota.trim().length < 10)
      err(etiqueta, id, 'nota vacía o demasiado corta');
    else {
      if (tieneBasura(p.nota)) err(etiqueta, id, 'nota con caracteres no permitidos');
      if (idioma === 'es') comprobarIdioma(etiqueta, id, 'nota', p.nota);
    }

    if (p.aproximada !== undefined && typeof p.aproximada !== 'boolean')
      err(etiqueta, id, 'aproximada no booleana');
    if (p.fuente !== undefined && typeof p.fuente !== 'string')
      err(etiqueta, id, 'fuente no textual');
  }
  return porId;
};

if (paisesActuales.length) {
  const esNuevo = paisesActuales.some((p) => p.formacion !== undefined);
  if (!esNuevo) {
    av(
      'paises-actuales',
      '(conjunto)',
      'el dataset sigue en el modelo antiguo: falta «formacion» y «tipoFormacion»',
    );
  } else {
    const esPorId = validarPaises(paisesActuales, 'paises-actuales', 'es');
    if (!enPaisesActuales) {
      av('paises-actuales (en)', '(conjunto)', 'falta datos/en/estados-actuales.json');
    } else {
      const enPorId = validarPaises(enPaisesActuales, 'paises-actuales (en)', 'en');
      for (const [id, es] of esPorId) {
        const en = enPorId.get(id);
        if (!en) {
          err('paises-actuales (en)', id, 'falta la traducción inglesa');
          continue;
        }
        if (en.formacion !== es.formacion)
          err('paises-actuales (en)', id, `formación distinta: ${en.formacion} ≠ ${es.formacion}`);
        if (en.tipoFormacion !== es.tipoFormacion)
          err('paises-actuales (en)', id, `tipo distinto: ${en.tipoFormacion} ≠ ${es.tipoFormacion}`);
        if (Boolean(en.aproximada) !== Boolean(es.aproximada))
          err('paises-actuales (en)', id, '«aproximada» no coincide con el español');
      }
      for (const id of enPorId.keys())
        if (!esPorId.has(id)) err('paises-actuales (en)', id, 'código sin versión española');
    }
  }
}

/* ─────────────────── Informe ─────────────────── */
const porTabla = {};
for (const e of errores) porTabla[e.tabla] = (porTabla[e.tabla] ?? 0) + 1;

if (avisos.length) {
  console.log(`\n  ${avisos.length} aviso(s):`);
  const vistos = new Set();
  for (const a of avisos) {
    const k = a.tabla + a.msg.slice(0, 40);
    if (vistos.has(k)) continue;
    vistos.add(k);
    console.log(`   · ${a.tabla} ${a.id}: ${a.msg}`);
  }
}

if (errores.length) {
  console.error(`\n  ✗ ${errores.length} error(es) de integridad:\n`);
  const vistos = new Set();
  for (const e of errores) {
    const k = e.tabla + '|' + e.msg.replace(/[^ ]/g, '').slice(0, 40);
    if (vistos.has(k)) continue;
    vistos.add(k);
    console.error(`   · ${e.tabla} · ${e.id}: ${e.msg}`);
  }
  console.error('\n  No se genera el bundle. Corrige datos/ y vuelve a ejecutar.\n');
  process.exit(1);
}

/* ─────────────────── Generación del bundle ─────────────────── */
/* Los hitos no llevan `id`: se identifican por su posición dentro de la
 * civilización. El `id` del JSON sirve para editar y rastrear el dato, pero no
 * viaja al bundle. */
const civilizacionesFull = civilizaciones.map((c) => ({
  ...c,
  escala: c.escala ?? (c.peso >= 5 ? 'mayor' : 'menor'),
  hitos: hitos
    .filter((h) => h.civilizacion === c.id)
    .map((h) => ({ anio: h.anio, texto: h.texto })),
}));

const hacerBundle = ({
  civs,
  regs,
  terrs,
  rel,
  dei,
  cie,
  arte,
  gob,
  formas: frm,
  escalas,
  soberanias: sob,
  cargos: car,
  dinastias: din,
  capitales: cap,
  ciudadesGobernante: cgob,
  paises,
}) => `/* GENERADO AUTOMÁTICAMENTE por scripts/validar.mjs — no editar a mano.
   Fuente de verdad: datos/*.json
*/
import type {
  Civilizacion,
  Region,
  Territorio,
  Artefacto,
  Deidad,
  Religion,
  Ciudad,
  Gobernante,
  FormaGobierno,
  EscalaPoliticaDef,
  Soberania,
  Cargo,
  Dinastia,
  Capital,
  CiudadGobernante,
  PaisActual,
} from './tipos-cultura';

export const ANIO_MIN = ${Math.max(-5000, Math.min(...civs.map((c) => c.inicio)))};
export const ANIO_MAX = ${Math.max(...civs.map((c) => c.fin))};

export const CIVILIZACIONES: Civilizacion[] = ${JSON.stringify(civs)};
export const REGIONES: Region[] = ${JSON.stringify(regs)};
export const TERRITORIOS: Territorio[] = ${JSON.stringify(terrs)};
export const RELIGIONES: Religion[] = ${JSON.stringify(rel)};
export const DEIDADES: Deidad[] = ${JSON.stringify(dei)};
export const CIUDADES: Ciudad[] = ${JSON.stringify(cie)};
export const ARTEFACTOS: Artefacto[] = ${JSON.stringify(arte)};
export const GOBERNANTES: Gobernante[] = ${JSON.stringify(gob)};
export const FORMAS: FormaGobierno[] = ${JSON.stringify(frm)};
export const ESCALAS_POLITICAS: EscalaPoliticaDef[] = ${JSON.stringify(escalas)};
export const SOBERANIAS: Soberania[] = ${JSON.stringify(sob)};
export const CARGOS: Cargo[] = ${JSON.stringify(car)};
export const DINASTIAS: Dinastia[] = ${JSON.stringify(din)};
export const CAPITALES: Capital[] = ${JSON.stringify(cap)};
export const CIUDADES_GOBERNANTE: CiudadGobernante[] = ${JSON.stringify(cgob)};
export const PAISES_ACTUALES: PaisActual[] = ${JSON.stringify(paises)};
`;

fs.writeFileSync(
  path.join(raiz, 'src/data/datos.generados.ts'),
  hacerBundle({
    civs: civilizacionesFull,
    regs: regiones,
    terrs: territorios,
    rel: religiones,
    dei: deidades,
    cie: ciudades,
    arte: artefactos,
    gob: gobernantes,
    formas,
    escalas: escalasPoliticas,
    soberanias,
    cargos,
    dinastias,
    capitales,
    ciudadesGobernante,
    paises: paisesActuales,
  }),
);

const enCivFull = (enCiv ?? civilizaciones).map((c) => ({
  ...c,
  escala: c.escala ?? (c.peso >= 5 ? 'mayor' : 'menor'),
  hitos: hitos
    .filter((h) => h.civilizacion === c.id)
    .map((h) => ({ anio: h.anio, texto: h.texto })),
}));
if (enCiv) {
  const enHitos = leerEn('hitos.json');
  if (enHitos) {
    enCivFull.forEach((c) => {
      c.hitos = enHitos
        .filter((h) => h.civilizacion === c.id)
        .map((h) => ({ anio: h.anio, texto: h.texto }));
    });
  }
}

fs.writeFileSync(
  path.join(raiz, 'src/data/datos.en.generados.ts'),
  hacerBundle({
    civs: enCivFull,
    regs: enReg ?? regiones,
    terrs: enTerr ?? territorios,
    rel: enRel ?? religiones,
    dei: enDei ?? deidades,
    cie: enCie ?? ciudades,
    arte: enArt ?? artefactos,
    gob: enGob ?? gobernantes,
    formas: enFormas ?? formas,
    escalas: enEscalas ?? escalasPoliticas,
    soberanias: enSoberanias ?? soberanias,
    cargos: enCargos ?? cargos,
    dinastias: enDinastias ?? dinastias,
    capitales,
    ciudadesGobernante,
    paises: enPaisesActuales ?? paisesActuales,
  }),
);

console.log(
  `\n  ✓ catálogo íntegro: ${civilizaciones.length} civilizaciones, ${regiones.length} regiones, ` +
    `${hitos.length} hitos, ${territorios.length} territorios, ${ciudades.length} ciudades` +
    (artefactos.length ? `, ${artefactos.length} artefactos` : '') +
    (deidades.length ? `, ${deidades.length} deidades` : '') +
    (gobernantes.length ? `, ${gobernantes.length} gobernantes` : '') +
    (capitales.length ? `, ${capitales.length} capitales` : '') +
    (ciudadesGobernante.length ? `, ${ciudadesGobernante.length} ciudades de gobernantes` : '') +
    (paisesActuales.length ? `, ${paisesActuales.length} países actuales` : '') +
    (enCiv ? ' · inglés disponible' : ' · inglés pendiente de traducir') +
    '\n  ✓ src/data/datos.generados.ts + datos.en.generados.ts generados\n',
);
