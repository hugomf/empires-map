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


const errores = [];
const avisos = [];
const err = (tabla, id, msg) => errores.push({ tabla, id, msg });
const av = (tabla, id, msg) => avisos.push({ tabla, id, msg });

/* ─────────────────── Utilidades ─────────────────── */

const TIPOS = ['imperio', 'reino', 'estado', 'dinastia', 'cultura', 'pueblo', 'confederacion'];
const GRUPOS = ['Europa', 'Asia', 'África', 'América', 'Oceanía'];

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
dup(civilizaciones);
dup(regiones);
dup(hitos);
dup(territorios);

/* ─────────────────── 2. Civilizaciones ─────────────────── */
const idsCiv = new Set(civilizaciones.map((c) => c.id));
const idsRegion = new Set(regiones.map((r) => r.id));

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
  if (c.abrev && c.abrev.length > 6) av('civilizaciones', id, `abrev demasiado larga: ${c.abrev}`);
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
  if (t.nivel === 'division' && !idsCiv.has(t.civilizacion))
    err('territorios', t.id, `división sin polidad existente: ${t.civilizacion}`);
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
}

/* Todas las civilizaciones deben tener al menos una ciudad principal. */
for (const c of civilizaciones) {
  if (!ciudades.some((x) => x.civilizacion === c.id))
    av('ciudades', c.id, 'sin ciudades principales');
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
const civilizacionesFull = civilizaciones.map((c) => ({
  ...c,
  escala: c.escala ?? (c.peso >= 5 ? 'mayor' : 'menor'),
  hitos: hitos
    .filter((h) => h.civilizacion === c.id)
    .map((h) => ({ id: h.id, anio: h.anio, texto: h.texto })),
}));

const hacerBundle = (civs, regs, terrs, rel, dei, cie, arte) => `/* GENERADO AUTOMÁTICAMENTE por scripts/validar.mjs — no editar a mano.
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
`;

fs.writeFileSync(path.join(raiz, 'src/data/datos.generados.ts'), hacerBundle(civilizacionesFull, regiones, territorios, religiones, deidades, ciudades, artefactos));

const enCivFull = (enCiv ?? civilizaciones).map((c) => ({
  ...c,
  escala: c.escala ?? (c.peso >= 5 ? 'mayor' : 'menor'),
  hitos: hitos
    .filter((h) => h.civilizacion === c.id)
    .map((h) => ({ id: h.id, anio: h.anio, texto: h.texto })),
}));
if (enCiv) {
  const enHitos = leerEn('hitos.json');
  if (enHitos) {
    enCivFull.forEach((c) => {
      c.hitos = enHitos
        .filter((h) => h.civilizacion === c.id)
        .map((h) => ({ id: h.id, anio: h.anio, texto: h.texto }));
    });
  }
}

fs.writeFileSync(
  path.join(raiz, 'src/data/datos.en.generados.ts'),
  hacerBundle(
    enCivFull,
    enReg ?? regiones,
    enTerr ?? territorios,
    enRel ?? religiones,
    enDei ?? deidades,
    enCie ?? ciudades,
    enArt ?? artefactos,
  ),
);

console.log(
  `\n  ✓ catálogo íntegro: ${civilizaciones.length} civilizaciones, ${regiones.length} regiones, ` +
    `${hitos.length} hitos, ${territorios.length} territorios, ${ciudades.length} ciudades` +
    (artefactos.length ? `, ${artefactos.length} artefactos` : '') +
    (deidades.length ? `, ${deidades.length} deidades` : '') +
    (enCiv ? ' · inglés disponible' : ' · inglés pendiente de traducir') +
    '\n  ✓ src/data/datos.generados.ts + datos.en.generados.ts generados\n',
);
