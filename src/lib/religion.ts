import type { Religion } from '../data/tipos-cultura';

/**
 * The religious tint colors by family, not by religion: 72 colors would make the map illegible. The family is deduced from the name in Spanish or English, with the keywords from top to bottom; what doesn't fit falls into 'local cults', the residual family.
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

/* The order decides: when a name mentions two traditions
 * («Islam and Hinduism», «Confucianism, Buddhism and Taoism») the first that fits wins, which is the one that marks the color of the tint. */
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

/* «Pre-Christian religion» / «Pre-Christian religion» is not Christianity: it cuts off before the keyword captures it. */
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

/** Is the religion in force in the year? Without a window, always. */
export function vigenteEn(religion: Religion, anio: number): boolean {
  return (religion.desde ?? -Infinity) <= anio && anio <= (religion.hasta ?? Infinity);
}

/*
 * Tint color by civilization: family of the prevailing religion in the selected year. Without a prevailing religion, no tint.
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
