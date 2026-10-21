/** Reparación masiva de integridad: recorta fechas, limpia textos y arregla anillos. */
import fs from 'node:fs';
import path from 'node:path';

/* Se puede apuntar al catálogo inglés con un segundo argumento. */
const dir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(path.resolve(import.meta.dirname, '..'), 'datos');
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) => fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const civilizaciones = leer('civilizaciones.json');
const territorios = leer('territorios.json');
const hitos = leer('hitos.json');

const permitidos = new Set(
  [...'áéíóúüñÁÉÍÓÚÜÑçÇàèìòùâêîôûÂÊÎÔÛ¡¿«»—–·’…“”ĐđĩĩĨĨŨŨơƠơạẠảẢấẤầẦẩẨãÃăĂằẰắẮẳẲặẶẹẸẻẺẽẼếẾềỀểỂễỄệỆỉỈịỊọỌỏỎốỐồỒổỔỗỖộỘớỚờỜởỞỡỠợỢụỤủỦứỨừỪửỬữỮựỰỳỲỵỴỷỸ', ...'繁衍'].map((c) => c),
);

const limpiar = (t) =>
  [...String(t)]
    .filter((ch) => {
      const cp = ch.codePointAt(0);
      if (cp < 128) return true;
      return permitidos.has(ch);
    })
    .join('')
    .replace(/ {2,}/g, ' ')
    .replace(/ +([,.;:])/g, '$1')
    .replace(/,\s*,/g, ',');

const recortar = (v, a, b) => {
  const x = Math.max(a, Math.min(b, v));
  return x;
};

/* ── civilizaciones ── */
for (const c of civilizaciones) {
  for (const campo of ['sintesis', 'caida', 'legado']) c[campo] = limpiar(c[campo]);
  if (c.apogeo) {
    let [a, b] = c.apogeo;
    if (a > b) [a, b] = [b, a];
    a = recortar(a, c.inicio, c.fin);
    b = recortar(b, c.inicio, c.fin);
    if (a >= b) a = Math.max(c.inicio, b - 1);
    c.apogeo = [a, b];
  }
  if (c.declive) {
    let [a, b] = c.declive;
    if (a >= b) b = a + 1;
    a = recortar(a, c.inicio, c.fin);
    b = recortar(b, c.inicio, c.fin);
    if (a >= b) b = Math.min(c.fin, a + 1);
    c.declive = [a, b];
  }
}

/* ── hitos: el texto puede traer basura ── */
for (const h of hitos) h.texto = limpiar(h.texto);

/* ── correcciones históricas: fechas que el catálogo tenía mal ── */

/* Nubia no termina en 350 a.C.: Meroe cae ante Aksum en el 350 d.C. */
const nubia = civilizaciones.find((c) => c.id === 'nubia');
if (nubia && nubia.fin < 350) nubia.fin = 350;

/* La unión dinástica de Aragón y Castilla es de 1479, no de 1492. */
const iberia = hitos.find((h) => h.id === 'iberia-cristiana-5');
if (iberia && iberia.anio === 1492) iberia.anio = 1479;

/* Las pinturas de Tsodilo son del 8000 a.C., no del año 8000. */
const san = hitos.find((h) => h.id === 'san-2');
if (san && san.anio === 8000) san.anio = -8000;

/* ── alias de ids que no coinciden ── */
const alias = { umeyas: 'umeyas', omeyas: 'omayas' };
const existe = (id) => civilizaciones.some((c) => c.id === id);
for (const t of territorios) {
  if (!existe(t.civilizacion) && alias[t.civilizacion]) t.civilizacion = alias[t.civilizacion];
  if (t.superior && !existe(t.superior) && alias[t.superior]) t.superior = alias[t.superior];
}

/* ── territorios: recortar fechas al ciclo de vida de la civilización ── */
for (const t of territorios) {
  const c = civilizaciones.find((x) => x.id === t.civilizacion);
  if (!c) continue;
  if (t.desde !== null) t.desde = recortar(t.desde, c.inicio, c.fin);
  if (t.hasta !== null) t.hasta = recortar(t.hasta, c.inicio, c.fin);
  if (t.desde !== null && t.hasta !== null && t.desde >= t.hasta) t.hasta = null;
}

/* ── anillo fenicio: trazo costero limpio, sin cruces ── */
const fen = territorios.find((t) => t.id === 'fenicios-t1');
if (fen) {
  fen.anillos = [
    [
      [34.8, 34.0],
      [35.0, 33.5],
      [35.1, 33.1],
      [35.5, 33.2],
      [35.7, 33.6],
      [36.0, 34.4],
      [36.15, 34.85],
      [35.9, 34.95],
      [35.5, 34.4],
      [35.2, 33.9],
      [34.9, 33.8],
      [34.8, 34.0],
    ],
  ];
}

escribir('civilizaciones.json', civilizaciones);
escribir('hitos.json', hitos);
escribir('territorios.json', territorios);
console.log('reparado');
