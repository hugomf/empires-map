import type { Religion } from '../data/tipos-cultura';

/**
 * El tinte religioso colorea por familia, no por religión: 72 colores harían
 * el mapa ilegible. La familia se deduce del nombre en es o en inglés, con
 * las palabras clave de arriba hacia abajo; lo que no encaja cae en
 * «cultos locales», la familia residual.
 */
export type Familia =
  | 'islam'
  | 'cristianismo'
  | 'judaismo'
  | 'zoroastrismo'
  | 'hinduismo'
  | 'budismo'
  | 'confucianismo'
  | 'politeismo'
  | 'locales';

interface Definicion {
  familia: Familia;
  claves: string[];
  color: string;
}

/* El orden decide: cuando un nombre menciona dos tradiciones
 * («Islam y hinduismo», «Confucianismo, budismo y daoismo») gana la primera
 * que encaja, que es la que marca el color del tinte. */
const FAMILIAS: Definicion[] = [
  { familia: 'cristianismo', claves: ['cristian', 'christian'], color: '#5b79c9' },
  { familia: 'judaismo', claves: ['juda'], color: '#57b8c9' },
  { familia: 'islam', claves: ['islam'], color: '#4e9b6e' },
  { familia: 'budismo', claves: ['budi', 'buddh', 'vajray'], color: '#d3b354' },
  { familia: 'zoroastrismo', claves: ['zoroa'], color: '#e0713a' },
  { familia: 'hinduismo', claves: ['hindu', 'brahman', 'ved'], color: '#c56b9e' },
  { familia: 'confucianismo', claves: ['confuci', 'legalis'], color: '#8b95a6' },
  { familia: 'politeismo', claves: ['polite', 'polythe', 'sincre', 'syncre', 'greek', 'griego'], color: '#9b6bc9' },
  { familia: 'locales', claves: [], color: '#8f6f52' },
];

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* «Religión pre-cristiana» / «pre-Christian religion» no es cristianismo:
 * se corta antes de que la palabra clave lo capture. */
const PRECRISTIANO = /(pre-?cristian|pre-?christian)/;

export function familiaDeReligion(nombre: string): Familia {
  const texto = normalizar(nombre);
  if (PRECRISTIANO.test(texto)) return 'locales';
  for (const f of FAMILIAS) {
    if (f.claves.some((k) => texto.includes(k))) return f.familia;
  }
  return 'locales';
}

export function colorFamilia(familia: Familia): string {
  return FAMILIAS.find((f) => f.familia === familia)!.color;
}

/** Familias en el orden de la leyenda del mapa. */
export const ORDEN_FAMILIAS = FAMILIAS.map((f) => f.familia) as Familia[];

/** ¿Está la religión vigente en el año? Sin ventana, siempre. */
export function vigenteEn(religion: Religion, anio: number): boolean {
  return (religion.desde ?? -Infinity) <= anio && anio <= (religion.hasta ?? Infinity);
}

/**
 * Color de tinte por civilización: familia de la religión vigente en el
 * año seleccionado. Sin religión vigente, sin tinte.
 */
export function coloresReligiosos(
  civilizaciones: { id: string }[],
  religiones: Religion[],
  anio: number,
): Map<string, string> {
  const m = new Map<string, string>();
  for (const civ of civilizaciones) {
    const r = religiones.find((x) => x.civilizacion === civ.id && vigenteEn(x, anio));
    if (r) m.set(civ.id, colorFamilia(familiaDeReligion(r.nombre)));
  }
  return m;
}
