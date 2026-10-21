#!/usr/bin/env node
/**
 * Validador del catálogo.
 *
 * Carga los datos con Vite (para no duplicar la lógica de TypeScript/JSON) y
 * comprueba integridad referencial, fechas, textos y polígonos. Se ejecuta
 * automáticamente antes de `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const raiz = process.cwd();
const errores = [];
const avisos = [];

const error = (msg) => errores.push(msg);
const aviso = (msg) => avisos.push(msg);

const TIPOS = new Set([
  'imperio',
  'reino',
  'estado',
  'dinastia',
  'cultura',
  'pueblo',
  'confederacion',
]);
const GRUPOS = new Set(['Europa', 'Asia', 'África', 'América', 'Oceanía']);
const ESCALAS = new Set(['mayor', 'menor']);
const PLACEHOLDERS = /\btrash\b|\bBelgian\b|\bcommerciaux\b|\blorem ipsum\b|наб/i;

const esNumero = (n) => typeof n === 'number' && Number.isFinite(n);
const esEntero = (n) => Number.isInteger(n);
const esPunto = (p) =>
  Array.isArray(p) &&
  p.length === 2 &&
  esNumero(p[0]) &&
  esNumero(p[1]) &&
  p[0] >= -180 &&
  p[0] <= 180 &&
  p[1] >= -90 &&
  p[1] <= 90;

const servidor = await createServer({
  configFile: false,
  root: raiz,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true },
});

let datos;
try {
  const civs = await servidor.ssrLoadModule('/src/data/civilizations.ts');
  const regiones = await servidor.ssrLoadModule('/src/data/regions.ts');
  const territorios = await servidor.ssrLoadModule('/src/data/territorios.ts');
  datos = {
    base: civs.CIVILIZACIONES,
    regiones: regiones.REGIONES,
    territoriosBase: territorios.TERRITORIOS,
    anioMin: civs.ANIO_MIN,
    anioMax: civs.ANIO_MAX,
  };
} finally {
  await servidor.close();
}

const adiciones = JSON.parse(
  fs.readFileSync(path.join(raiz, 'src/data/adiciones.json'), 'utf8'),
);
const territoriosExtra = JSON.parse(
  fs.readFileSync(path.join(raiz, 'src/data/territorios-extra.json'), 'utf8'),
);

const { base, regiones, territoriosBase, anioMin, anioMax } = datos;

/* ---------- Regiones ---------- */
const regionPorId = new Map();
for (const r of regiones) {
  if (!r.id) error('Región sin id.');
  if (regionPorId.has(r.id)) error(`Región duplicada: ${r.id}`);
  regionPorId.set(r.id, r);
  if (!r.nombre) error(`Región ${r.id}: falta nombre.`);
  if (!GRUPOS.has(r.grupo)) error(`Región ${r.id}: grupo inválido (${r.grupo}).`);
  if (!Array.isArray(r.paises) || !r.paises.length) {
    error(`Región ${r.id}: no tiene países.`);
  }
  if (!esPunto(r.ancla)) error(`Región ${r.id}: ancla inválida.`);
}

/* ---------- Civilizaciones ---------- */
const civPorId = new Map();

function validarCivilizacion(c, origen) {
  const etiqueta = `${origen}:${c.id ?? '(sin id)'}`;
  if (!c.id || typeof c.id !== 'string') error(`${etiqueta}: id inválido.`);
  if (!c.nombre) error(`${etiqueta}: falta nombre.`);
  if (!c.abrev) error(`${etiqueta}: falta abreviatura.`);
  if (!TIPOS.has(c.tipo)) error(`${etiqueta}: tipo inválido (${c.tipo}).`);
  if (!regionPorId.has(c.region)) error(`${etiqueta}: región inexistente (${c.region}).`);
  if (!esEntero(c.inicio) || !esEntero(c.fin)) {
    error(`${etiqueta}: inicio/fin deben ser años enteros.`);
  } else {
    if (c.inicio > c.fin) error(`${etiqueta}: inicio (${c.inicio}) > fin (${c.fin}).`);
    if (c.inicio < anioMin || c.fin > anioMax) {
      aviso(`${etiqueta}: fuera del rango global [${anioMin}, ${anioMax}].`);
    }
  }

  if (!Array.isArray(c.apogeo) || c.apogeo.length !== 2 || !c.apogeo.every(esEntero)) {
    error(`${etiqueta}: apogeo inválido.`);
  } else {
    const [a, b] = c.apogeo;
    if (a > b) error(`${etiqueta}: apogeo invertido.`);
    if (a < c.inicio || b > c.fin) error(`${etiqueta}: apogeo fuera de la vida.`);
  }

  if (c.declive !== null) {
    if (!Array.isArray(c.declive) || c.declive.length !== 2 || !c.declive.every(esEntero)) {
      error(`${etiqueta}: declive inválido.`);
    } else {
      const [a, b] = c.declive;
      if (a > b) error(`${etiqueta}: declive invertido.`);
      if (a < c.inicio || b > c.fin) error(`${etiqueta}: declive fuera de la vida.`);
    }
  }

  if (!esEntero(c.peso) || c.peso < 1 || c.peso > 10) {
    error(`${etiqueta}: peso inválido (${c.peso}).`);
  }
  if (c.escala !== undefined && !ESCALAS.has(c.escala)) {
    error(`${etiqueta}: escala inválida (${c.escala}).`);
  }
  if (typeof c.territorio !== 'boolean') error(`${etiqueta}: territorio debe ser booleano.`);
  if (!/^#[0-9a-f]{6}$/i.test(c.color ?? '')) error(`${etiqueta}: color inválido.`);

  for (const campo of ['sintesis', 'caida', 'legado']) {
    if (typeof c[campo] !== 'string' || c[campo].trim().length < 20) {
      error(`${etiqueta}: ${campo} vacío o demasiado corto.`);
    } else if (PLACEHOLDERS.test(c[campo])) {
      error(`${etiqueta}: ${campo} contiene texto de relleno o corrupto.`);
    }
  }

  if (!Array.isArray(c.hitos) || !c.hitos.length) {
    error(`${etiqueta}: no tiene hitos.`);
  } else {
    let previo = -Infinity;
    for (const h of c.hitos) {
      if (!esEntero(h.a) || typeof h.t !== 'string' || h.t.trim().length < 5) {
        error(`${etiqueta}: hito inválido (${JSON.stringify(h)}).`);
        continue;
      }
      if (PLACEHOLDERS.test(h.t)) error(`${etiqueta}: hito con texto corrupto.`);
      if (h.a < c.inicio || h.a > c.fin) {
        aviso(`${etiqueta}: hito ${h.a} fuera de la vida.`);
      }
      if (h.a < previo) aviso(`${etiqueta}: hitos desordenados (${h.a} después de ${previo}).`);
      previo = h.a;
    }
  }

  if (civPorId.has(c.id)) {
    error(`Civilización duplicada: ${c.id} (${civPorId.get(c.id).origen} y ${origen}).`);
  } else {
    civPorId.set(c.id, { civ: c, origen });
  }
}

for (const c of base) validarCivilizacion(c, 'base');
for (const c of adiciones) validarCivilizacion(c, 'adiciones');

/* ---------- Territorios ---------- */
const territorios = { ...territoriosBase, ...territoriosExtra };

for (const civ of Object.keys(territoriosExtra)) {
  if (territoriosBase[civ]) {
    aviso(`Territorio de ${civ}: la versión de territorios-extra sustituye a la base.`);
  }
}

for (const [civ, poligonos] of Object.entries(territorios)) {
  if (!civPorId.has(civ)) error(`Territorio de civilización inexistente: ${civ}.`);
  if (!Array.isArray(poligonos) || !poligonos.length) {
    error(`Territorio ${civ}: lista vacía.`);
    continue;
  }

  poligonos.forEach((p, i) => {
    const etiqueta = `territorio ${civ}[${i}]`;
    if (p.tipo !== 'tierra' && p.tipo !== 'ciudad') {
      error(`${etiqueta}: tipo inválido (${p.tipo}).`);
    }
    if (p.desde !== undefined && !esEntero(p.desde)) error(`${etiqueta}: desde inválido.`);
    if (p.hasta !== undefined && !esEntero(p.hasta)) error(`${etiqueta}: hasta inválido.`);
    if (p.desde !== undefined && p.hasta !== undefined && p.desde > p.hasta) {
      error(`${etiqueta}: desde > hasta.`);
    }
    if (p.ancla !== undefined && !esPunto(p.ancla)) error(`${etiqueta}: ancla inválida.`);
    if (!Array.isArray(p.anillos) || !p.anillos.length) {
      error(`${etiqueta}: sin anillos.`);
      return;
    }
    p.anillos.forEach((anillo, j) => {
      if (!Array.isArray(anillo) || anillo.length < 3) {
        error(`${etiqueta}.anillo[${j}]: menos de 3 puntos.`);
        return;
      }
      if (!anillo.every(esPunto)) {
        error(`${etiqueta}.anillo[${j}]: punto inválido.`);
      }
    });
  });
}

/* ---------- Resumen ---------- */
if (avisos.length) {
  console.log(`\n⚠ ${avisos.length} aviso(s):`);
  for (const a of avisos) console.log(`  - ${a}`);
}

if (errores.length) {
  console.error(`\n✖ ${errores.length} error(es) de datos:`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

const totalTerritorios = Object.values(territorios).reduce((n, p) => n + p.length, 0);
console.log(
  `\n✔ Datos válidos: ${civPorId.size} civilizaciones, ${regiones.length} regiones, ` +
    `${Object.keys(territorios).length} civilizaciones con territorio (${totalTerritorios} polígonos).`,
);
