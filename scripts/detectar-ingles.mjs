/**
 * Detecta mezcla de idiomas en el catálogo: fragmentos en inglés dentro del
 * texto español y fragmentos en español dentro del texto inglés.
 *
 *   node scripts/detectar-ingles.mjs [es|en]
 *
 * El validador general sólo rechaza alfabetos no latinos (CJK, cirílico…) y
 * se le escapa el texto mal traducido, que es el fallo más sutil: un
 * «united» o un «the» dentro de una síntesis en español no rompe nada pero
 * arruina la lectura.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const dir = path.join(raiz, 'datos');
const idioma = process.argv[2] ?? 'es';

/* Palabras que no existen en español con esa forma. */
const EN_IN_ES = [
  'the', 'and', 'with', 'from', 'that', 'this', 'were', 'which', 'have', 'been',
  'their', 'there', 'when', 'into', 'over', 'under', 'between', 'after',
  'before', 'also', 'not', 'but', 'who', 'what', 'where', 'kingdom', 'empire',
  'dynasty', 'ruled', 'hunters', 'overthrown', 'prefix', 'takers', 'family',
  'maritime', 'commercial', 'influences', 'building', 'department', 'datatype',
  'united', 'kingdoms', 'their', 'its', 'own', 'made', 'known', 'called',
  'named', 'based', 'early', 'later', 'first', 'last', 'new', 'old', 'great',
  'little', 'power', 'people', 'world', 'age', 'years', 'century', 'province',
  'border', 'coast', 'river', 'mountain', 'began', 'built', 'created',
  'founded', 'reached', 'extended', 'including', 'became', 'period', 'reign',
  'wake', 'share', 'queue', 'director', 'executive', 'art', 'law', 'battle',
  'defeat', 'victory', 'throne', 'ruler', 'dynasties', 'sultanate', 'caliphate',
  'western', 'eastern', 'northern', 'southern', 'central', 'grand', 'son',
  'son of', 'blood', 'soil', 'gave', 'grew', 'took', 'gave', 'arose',
];

/* Palabras que no existen en inglés con esa forma (contaminación inversa). */
const ES_IN_EN = [
  'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'que',
  'con', 'para', 'por', 'sobre', 'entre', 'hasta', 'desde', 'fundación',
  'fundado', 'fundó', 'nace', 'nació', 'cae', 'caída', 'reino', 'imperio',
  'dinastía', 'guerra', 'conquista', 'capital', 'siglo', 'año', 'años',
  'civiles', 'cultura', 'pueblo', 'ciudad', 'estado', 'país', 'rey', 'reina',
  'emperador', 'príncipe', 'invade', 'invadó', 'acaba', 'termina', 'se',
];

const RE = new RegExp(
  `(?<![\\p{L}])(?:${(idioma === 'es' ? EN_IN_ES : ES_IN_EN).join('|')})(?![\\p{L}])`,
  'giu',
);

/* Campos que son identificadores, no prosa. */
const CAMPOS_IGNORADOS = new Set([
  'id', 'abrev', 'color', 'region', 'regionId', 'tipo', 'nivel', 'superior',
  'desde', 'hasta', 'anio', 'inicio', 'fin', 'peso', 'lat', 'lon', 'escala',
  'territorio', 'civilizacion', 'actual', 'anillos', 'ancla', 'icono',
  'confianza', 'fuente', 'escritura', 'dominio', 'periodo', 'inicios',
]);

const ficheros = [
  'civilizaciones.json',
  'hitos.json',
  'religiones.json',
  'deidades.json',
  'artefactos.json',
  'ciudades.json',
  'territorios.json',
];

const dirBase = idioma === 'es' ? dir : path.join(dir, 'en');

let hallazgos = 0;
for (const f of ficheros) {
  const p = path.join(dirBase, f);
  if (!fs.existsSync(p)) continue;
  const datos = JSON.parse(fs.readFileSync(p, 'utf8'));
  const lista = Array.isArray(datos) ? datos : Object.values(datos).flat();
  for (const e of lista) {
    for (const [campo, valor] of Object.entries(e)) {
      if (CAMPOS_IGNORADOS.has(campo)) continue;
      if (typeof valor !== 'string' || valor.length < 15) continue;
      RE.lastIndex = 0;
      const m = RE.exec(valor);
      if (!m) continue;
      hallazgos++;
      const i = Math.max(0, m.index - 40);
      console.log(
        `${f} · ${e.id ?? e.nombre} · ${campo}: «${m[0]}» — …${valor.slice(i, i + 120)}…`,
      );
    }
  }
}
console.log(
  `\n${hallazgos} campo(s) con mezcla de idiomas en el catálogo ${idioma === 'es' ? 'español' : 'inglés'}.`,
);
