/**
 * Utilidades compartidas por los scripts que editan `datos/*.json`.
 *
 * La fuente de verdad del catálogo son los JSON: estos scripts las modifican
 * con reglas explícitas (ids únicos, campos obligatorios, sin rutas absolutas)
 * para que un alta no rompa el bundle que genera `scripts/validar.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';

export const raiz = path.resolve(import.meta.dirname, '..');
export const dirDatos = path.join(raiz, 'datos');

export const leer = (nombre) =>
  JSON.parse(fs.readFileSync(path.join(dirDatos, nombre), 'utf8'));

export const escribir = (nombre, datos) =>
  fs.writeFileSync(
    path.join(dirDatos, nombre),
    JSON.stringify(datos, null, 2) + '\n',
  );

/** Mismo criterio que el validador: sin acentos, sin puntuación, sin mayúsculas. */
export const normalizar = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[«»"'()·.,\-—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const TIPOS = [
  'imperio',
  'reino',
  'estado',
  'dinastia',
  'cultura',
  'pueblo',
  'confederacion',
];

/** Campos que una civilización no puede dejar sin definir. */
export const CAMPOS_CIV = [
  'id',
  'nombre',
  'abrev',
  'tipo',
  'region',
  'inicio',
  'fin',
  'apogeo',
  'peso',
  'color',
  'sintesis',
  'caida',
  'legado',
];

/** Comprueba una civilización nueva y devuelve la lista de problemas. */
export function problemasCivil(c, idsExistentes, regiones) {
  const p = [];
  for (const campo of CAMPOS_CIV) {
    if (c[campo] === undefined || c[campo] === null) p.push(`falta «${campo}»`);
  }
  if (c.id !== undefined) {
    if (!/^[a-z0-9-]+$/.test(c.id)) p.push(`id «${c.id}» no es válido (minúsculas y guiones)`);
    if (idsExistentes.has(c.id)) p.push(`ya existe una civilización con id «${c.id}»`);
  }
  if (c.tipo !== undefined && !TIPOS.includes(c.tipo))
    p.push(`tipo «${c.tipo}» no válido`);
  if (c.region !== undefined && !regiones.has(c.region))
    p.push(`región «${c.region}» no existe en datos/regiones.json`);
  if (typeof c.inicio === 'number' && typeof c.fin === 'number' && c.inicio >= c.fin)
    p.push(`fechas imposibles: inicio ${c.inicio} ≥ fin ${c.fin}`);
  if (!/^#[0-9a-fA-F]{6}$/.test(c.color ?? '')) p.push(`color «${c.color}» no válido`);
  for (const campo of ['sintesis', 'caida', 'legado']) {
    if (typeof c[campo] === 'string' && c[campo].length < 30)
      p.push(`«${campo}» demasiado corto`);
  }
  return p;
}

/** Comprueba un territorio nuevo y devuelve la lista de problemas. */
export function problemasTerritorio(t, idsExistentes, idsCiv) {
  const p = [];
  if (!t.id) p.push('falta id');
  else if (idsExistentes.has(t.id)) p.push(`ya existe un territorio con id «${t.id}»`);
  if (t.civilizacion !== undefined && !idsCiv.has(t.civilizacion))
    p.push(`civilización «${t.civilizacion}» no existe`);
  if (!['tierra', 'ciudad'].includes(t.tipo)) p.push(`tipo «${t.tipo}» no válido`);
  if (!Array.isArray(t.anillos) || !t.anillos.length) p.push('sin anillos');
  if (t.nivel === 'division' && !t.superior)
    p.push('una división necesita «superior»');
  if (t.nivel !== undefined && !['polidad', 'division'].includes(t.nivel))
    p.push(`nivel «${t.nivel}» no válido`);
  return p;
}
