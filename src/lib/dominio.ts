import type { Civilizacion, Escala, Grupo, Region, Tipo } from '../data/tipos-cultura';

/** A partir de este peso una civilización se considera «mayor» por defecto. */
export const PESO_MAYOR = 5;

/** Escala editorial de una civilización, explícita o deducida del peso. */
export function escalaDe(c: Civilizacion): Escala {
  return c.escala ?? (c.peso >= PESO_MAYOR ? 'mayor' : 'menor');
}

export function esMenor(c: Civilizacion): boolean {
  return escalaDe(c) === 'menor';
}

export type Fase = 'nacimiento' | 'auge' | 'dominio' | 'decadencia' | 'muerte';

export const ETIQUETA_FASE: Record<Fase, string> = {
  nacimiento: 'Nacimiento',
  auge: 'Cúspide',
  dominio: 'Auge',
  decadencia: 'Decadencia',
  muerte: 'Extinción',
};

export function estaViva(c: Civilizacion, a: number): boolean {
  return a >= c.inicio && a <= c.fin;
}

export function fase(c: Civilizacion, a: number): Fase {
  if (a >= c.apogeo[0] && a <= c.apogeo[1]) return 'auge';
  if (c.declive && a >= c.declive[0] && a <= c.declive[1]) return 'decadencia';
  if (a < c.inicio) return 'nacimiento';
  if (a > c.fin) return 'muerte';
  /* De la fundación a la cúspide del dato: crecimiento. Roma en −500 ya no
     era «Prime»: era una república en ascenso aún lejos de su apogeo. */
  if (a < c.apogeo[0]) return 'nacimiento';
/* After the peak: domain until documented decline; if there are no
   decline windows, the previous heuristic rule (last 120 years). */
  if (c.declive) return a >= c.declive[1] ? 'decadencia' : 'dominio';
  return c.fin - a <= 120 ? 'decadencia' : 'dominio';
}

export interface Filtros {
  tipos: Set<Tipo>;
  grupos: Set<Grupo>;
  /** Si es `false`, las civilizaciones de escala «menor» no se muestran. */
  mostrarMenores: boolean;
}

export function pasaFiltros(c: Civilizacion, f: Filtros, regiones: Region[] = []): boolean {
  if (f.tipos.size && !f.tipos.has(c.tipo)) return false;
  const r = regiones.find((x) => x.id === c.region);
  if (f.grupos.size && (!r || !f.grupos.has(r.grupo))) return false;
  if (!f.mostrarMenores && esMenor(c)) return false;
  return true;
}

/** Living civilizations in the given year, after applying filters. */
export function vivasEn(
  a: number,
  todas: Civilizacion[],
  f: Filtros,
  regiones: Region[] = [],
): Civilizacion[] {
  return todas.filter((c) => estaViva(c, a) && pasaFiltros(c, f, regiones));
}

/**
 * Para cada región, la civilización viva con mayor peso (y, a igualdad, la que
 * cubre más superficie de apogeo). Es la que "ilumina" esa porción del mapa.
 */
export function dominantePorRegion(
  vivas: Civilizacion[],
): Map<string, Civilizacion> {
  const mapa = new Map<string, Civilizacion>();
  for (const c of vivas) {
    const actual = mapa.get(c.region);
    if (!actual) {
      mapa.set(c.region, c);
      continue;
    }
    const largo = (x: Civilizacion) => x.apogeo[1] - x.apogeo[0];
    if (c.peso > actual.peso || (c.peso === actual.peso && largo(c) > largo(actual))) {
      mapa.set(c.region, c);
    }
  }
  return mapa;
}

/** Todas las civilizaciones de una región que están vivas (para el marcador). */
export function agruparPorRegion(vivas: Civilizacion[]): Map<string, Civilizacion[]> {
  const mapa = new Map<string, Civilizacion[]>();
  for (const c of vivas) {
    const arr = mapa.get(c.region);
    if (arr) arr.push(c);
    else mapa.set(c.region, [c]);
  }
  for (const arr of mapa.values()) arr.sort((a, b) => b.peso - a.peso);
  return mapa;
}

/** Milestones occurring in the exact year. */
export function hitosEn(a: number, vivas: Civilizacion[]): { civ: Civilizacion; texto: string }[] {
  const out: { civ: Civilizacion; texto: string }[] = [];
  for (const c of vivas) {
    for (const h of c.hitos) if (h.anio === a) out.push({ civ: c, texto: h.texto });
  }
  return out;
}

/** How many living civilizations are there by year (the "tide" curve). */
export function curvaDeVitalidad(todas: Civilizacion[], min: number, max: number, pasos = 220) {
  const pts: { a: number; n: number }[] = [];
  const delta = (max - min) / pasos;
  for (let i = 0; i <= pasos; i++) {
    const a = Math.round(min + i * delta);
    let n = 0;
    for (const c of todas) if (c.inicio <= a && a <= c.fin) n++;
    pts.push({ a, n });
  }
  return pts;
}

/** Color por fase de la civilización: sirve para leer de un vistazo quién prospera y quién cae. */
export const COLOR_FASE: Record<Fase, string> = {
  nacimiento: '#4fb0a0',
  auge: '#f0c75e',
  dominio: '#c98a4f',
  decadencia: '#d2553d',
  muerte: '#5b6672',
};

/** Effective color of a civilization according to the chosen mode and the year. */
export function colorEfectivo(
  c: Civilizacion,
  anio: number,
  modo: 'identidad' | 'fase',
): string {
  if (modo === 'identidad') return c.color;
  return COLOR_FASE[fase(c, anio)];
}

export const COLOR_TIPO: Record<Tipo, string> = {
  imperio: '#c8a04c',
  reino: '#9f7fd4',
  estado: '#5fa8d4',
  dinastia: '#d98a4c',
  cultura: '#4fb0a0',
  pueblo: '#d46a8a',
  confederacion: '#8fb04f',
};

export const ETIQUETA_TIPO: Record<Tipo, string> = {
  imperio: 'Imperio',
  reino: 'Reino',
  estado: 'Estado',
  dinastia: 'Dinastía',
  cultura: 'Cultura',
  pueblo: 'Pueblo',
  confederacion: 'Confederación',
};
