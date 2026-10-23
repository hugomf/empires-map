/**
 * El enlace compartido es el estado completo de la vista: idioma, año,
 * civilización, filtros, capas y densidad de etiquetas.
 *
 * Formato: `#<idioma>/<anio>/<civ>/<segmentos…>`
 *
 *   #es/1492/espana/div:0/den:todas/q:persia/f:imperio,Europa
 *
 * Los enlaces anteriores (`#1492/espana`) siguen funcionando: se leen sin
 * idioma y se reescriben con el estado completo.
 */
import type { Idioma } from './i18n';

export type Densidad = 'auto' | 'todas' | 'ninguna';

export interface Vista {
  idioma: Idioma;
  anio: number;
  civ: string | null;
  /** Capa aislada: sólo se dibuja esa civilización. */
  solo: string | null;
  /** Capas de civilizaciones ocultas. */
  ocultas: string[];
  /** Capa de divisiones administrativas. */
  divisiones: boolean;
  /** Capa de tinte religioso. */
  religiones: boolean;
  /** Capa de países actuales. */
  paises: boolean;
  densidad: Densidad;
  busqueda: string;
  tipos: string[];
  grupos: string[];
  /** Mostrar las civilizaciones menores. */
  menores: boolean;
}

/** Lo que devuelve la lectura: el idioma puede no estar en el enlace. */
export type VistaLeida = Omit<Vista, 'idioma'> & { idioma: Idioma | null };

export const VISTA_POR_DEFECTO: Vista = {
  idioma: 'en',
  anio: 100,
  civ: null,
  solo: null,
  ocultas: [],
  divisiones: true,
  religiones: false,
  paises: false,
  densidad: 'auto',
  busqueda: '',
  tipos: [],
  grupos: [],
  menores: true,
};

const esIdioma = (s: string): s is Idioma => s === 'es' || s === 'en';

const DENSIDADES: Densidad[] = ['auto', 'todas', 'ninguna'];

/**
 * Idioma declarado en el enlace, si lo hay. Los enlaces antiguos no lo
 * declaran: entonces manda la preferencia guardada o el inglés.
 */
export function idiomaDelEnlace(hash: string): Idioma | null {
  const primero = hash.replace(/^#\/?/, '').split('/').filter(Boolean)[0];
  return esIdioma(primero) ? primero : null;
}

/**
 * Lee el enlace. `anioMin`/`anioMax` acotan el año; si no se pasan, se usa
 * el año sin recortar.
 */
export function leerEnlace(
  hash: string,
  anioMin?: number,
  anioMax?: number,
): VistaLeida {
  const vista: VistaLeida = {
    ...VISTA_POR_DEFECTO,
    idioma: null,
    ocultas: [],
    tipos: [],
    grupos: [],
  };
  const segs = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  let i = 0;
  /* El idioma va delante si el primer segmento lo es; si no, es el año. */
  if (segs.length && esIdioma(segs[0])) {
    vista.idioma = segs[0];
    i = 1;
  }
  const anio = Number.parseInt(segs[i] ?? '', 10);
  if (Number.isFinite(anio)) {
    vista.anio =
      anioMin === undefined || anioMax === undefined
        ? anio
        : Math.max(anioMin, Math.min(anioMax, anio));
    i++;
  }
  if (segs[i] && !segs[i].includes(':')) {
    vista.civ = segs[i];
    i++;
  }
  for (; i < segs.length; i++) {
    const seg = segs[i];
    if (seg.startsWith('solo:')) vista.solo = seg.slice(5) || null;
    else if (seg.startsWith('off:'))
      vista.ocultas = seg.slice(4).split(',').filter(Boolean);
    else if (seg === 'div:0') vista.divisiones = false;
    else if (seg === 'div:1') vista.divisiones = true;
    else if (seg === 'rel:1') vista.religiones = true;
    else if (seg === 'rel:0') vista.religiones = false;
    else if (seg === 'pai:1') vista.paises = true;
    else if (seg === 'pai:0') vista.paises = false;
    else if (seg.startsWith('den:')) {
      const d = seg.slice(4) as Densidad;
      if (DENSIDADES.includes(d)) vista.densidad = d;
    } else if (seg.startsWith('q:'))
      vista.busqueda = decodeURIComponent(seg.slice(2));
    else if (seg.startsWith('f:'))
      for (const f of seg.slice(2).split(',')) {
        if (!f) continue;
        if (f.startsWith('t:')) vista.tipos.push(f.slice(2));
        else if (f.startsWith('g:')) vista.grupos.push(f.slice(2));
      }
    else if (seg === 'men:0') vista.menores = false;
    else if (seg === 'men:1') vista.menores = true;
  }
  return vista;
}

/** Serializa la vista en el formato del enlace. */
export function escribirEnlace(v: Vista): string {
  const segs: string[] = [];
  if (v.solo) segs.push(`solo:${v.solo}`);
  else if (v.ocultas.length) segs.push(`off:${[...v.ocultas].sort().join(',')}`);
  if (!v.divisiones) segs.push('div:0');
  if (v.religiones) segs.push('rel:1');
  if (v.paises) segs.push('pai:1');
  if (v.densidad !== 'auto') segs.push(`den:${v.densidad}`);
  if (v.busqueda.trim()) segs.push(`q:${encodeURIComponent(v.busqueda.trim())}`);
  const filtros = [
    ...v.tipos.map((x) => `t:${x}`),
    ...v.grupos.map((x) => `g:${x}`),
  ];
  if (filtros.length) segs.push(`f:${filtros.join(',')}`);
  if (!v.menores) segs.push('men:0');
  return `#${v.idioma}/${Math.round(v.anio)}/${v.civ ?? ''}${
    segs.length ? '/' + segs.join('/') : ''
  }`;
}
