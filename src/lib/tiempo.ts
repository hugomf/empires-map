import type { Idioma } from './i18n';

const AC = { en: 'BC', es: 'a.C.' } as const;
const DC = { en: 'AD', es: 'd.C.' } as const;
const ANOS = { en: 'years', es: 'años' } as const;

/** Formato de años: negativo = a.C./BC, 0 o positivo = d.C./AD. */
export function anio(a: number, idioma: Idioma = 'es'): string {
  return a < 0 ? `${Math.abs(a)} ${AC[idioma]}` : `${a} ${DC[idioma]}`;
}

export function anioCorto(a: number, idioma: Idioma = 'es'): string {
  return a < 0 ? `${-a} ${AC[idioma]}` : `${a}`;
}

export function anioNumero(a: number): string {
  return a < 0 ? `${-a}` : `${a}`;
}

export function intervalo(a: number, b: number, idioma: Idioma = 'es'): string {
  if (a === b) return anio(a, idioma);
  return `${anio(a, idioma)} — ${anio(b, idioma)}`;
}

export function duracion(a: number, b: number, idioma: Idioma = 'es'): string {
  const d = Math.max(1, Math.round(b - a));
  return `${d.toLocaleString(idioma === 'en' ? 'en-US' : 'es-ES')} ${ANOS[idioma]}`;
}

/** Eras largas para orientarse en el riel temporal. */
export interface Era {
  id: string;
  nombre: string;
  desde: number;
  hasta: number;
}

export const ERAS: Era[] = [
  { id: 'bronce', nombre: 'Edad del Bronce', desde: -3200, hasta: -1200 },
  { id: 'hierro', nombre: 'Edad del Hierro', desde: -1200, hasta: -500 },
  { id: 'clasica', nombre: 'Antigüedad clásica', desde: -500, hasta: 500 },
  { id: 'medieval', nombre: 'Edad Media', desde: 500, hasta: 1500 },
  { id: 'moderna', nombre: 'Edad Moderna', desde: 1500, hasta: 1900 },
  { id: 'contemporanea', nombre: 'Contemporánea', desde: 1900, hasta: 2026 },
];

/** Años "redondos" para las marcas del riel. */
export function marcas(min: number, max: number, paso?: number): number[] {
  const out: number[] = [];
  const p = paso ?? (max - min > 3000 ? 500 : 250);
  const inicio = Math.ceil(min / p) * p;
  for (let a = inicio; a <= max; a += p) out.push(a);
  return out;
}
