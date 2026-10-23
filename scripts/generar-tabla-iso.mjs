/**
 * Genera la tabla de identificadores ISO numéricos a alpha-2.
 *
 *   node scripts/generar-tabla-iso.mjs [--simular]
 *
 * `world-atlas` identifica cada país con su código ISO 3166-1 numérico
 * ("716" es Zimbabue). La capa de países actuales necesita el alpha-2, que es
 * el que usa nuestro catálogo. La tabla se genera una vez y se versiona en
 * `datos/iso-numeric.json`: no hace falta ninguna dependencia nueva.
 *
 * El emparejamiento es por nombre (el del atlas en inglés y el de nuestro
 * catálogo en inglés); las excepciones van en la tabla `EXCEPCIONES`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { dirDatos } from './catalogo-json.mjs';

const simular = process.argv.includes('--simular');

const TOPO = JSON.parse(
  fs.readFileSync(
    path.join(raiz(), 'node_modules/world-atlas/countries-50m.json'),
    'utf8',
  ),
);

function raiz() {
  return path.resolve(import.meta.dirname, '..');
}

/** Nombre del atlas → alpha-2, cuando no coincide con el del catálogo. */
const EXCEPCIONES = {
  'United States of America': 'US',
  'Dem. Rep. Congo': 'CD',
  'Dem. Rep. Korea': 'KP',
  Congo: 'CG',
  Czechia: 'CZ',
  'Eq. Guinea': 'GQ',
  'S. Sudan': 'SS',
  'Central African Rep.': 'CF',
  'Dominican Rep.': 'DO',
  'Bosnia and Herz.': 'BA',
  'W. Sahara': 'EH',
  'Falkland Is.': 'FK',
  'Fr. S. Antarctic Lands': 'TF',
  'Fr. Polynesia': 'PF',
  'N. Cyprus': null,
  Somaliland: null,
  'Siachen Glacier': null,
  'Indian Ocean Ter.': null,
  Palestine: 'PS',
  Kosovo: 'XK',
  'Åland Is.': 'AX',
  'St-Martin': 'MF',
  'Saint Martin': 'MF',
  'Curaçao': 'CW',
  'Sint Maarten': 'SX',
  'Turks and Caicos Is.': 'TC',
  'U.S. Virgin Is.': 'VI',
  'British Virgin Is.': 'VG',
  'Réunion': 'RE',
  Mayotte: 'YT',
  'New Caledonia': 'NC',
  'Wallis and Futuna': 'WF',
  Macao: 'MO',
  'Hong Kong': 'HK',
  Greenland: 'GL',
  'Cabo Verde': 'CV',
  'Timor-Leste': 'TL',
  Eswatini: 'SZ',
  'Myanmar': 'MM',
  'Laos': 'LA',
  Vietnam: 'VN',
  Brunei: 'BN',
  Tanzania: 'TZ',
  'eSwatini': 'SZ',
  'Macedonia': 'MK',
};

const normalizar = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Catálogo en inglés: de ahí sale el nombre oficial de cada Estado. */
const enPath = path.join(dirDatos, 'en', 'estados-actuales.json');
if (!fs.existsSync(enPath)) {
  console.error(
    'Falta datos/en/estados-actuales.json: el catálogo de países actuales es la fuente de verdad.',
  );
  process.exit(1);
}
const paises = JSON.parse(fs.readFileSync(enPath, 'utf8'));

/** alpha-2 → nombre normalizado del catálogo. */
const porNombre = new Map();
for (const p of paises) porNombre.set(normalizar(p.nombre), p.id);

const geometrias = TOPO.objects.countries.geometries;
const tabla = {};
const sinEmparejar = [];

for (const g of geometrias) {
  const nombre = g.properties?.name;
  if (!g.id || !nombre) continue;
  let alpha2 = EXCEPCIONES[nombre];
  if (alpha2 === undefined) alpha2 = porNombre.get(normalizar(nombre));
  if (!alpha2) {
    sinEmparejar.push(`${nombre} (${g.id})`);
    continue;
  }
  tabla[g.id] = alpha2;
}

const delCatalogo = new Set(paises.map((p) => p.id));
const enTabla = new Set(Object.values(tabla));
const sinMapa = [...delCatalogo].filter((id) => !enTabla.has(id));

if (sinEmparejar.length)
  console.log(`sin emparejar en el atlas: ${sinEmparejar.join(', ')}`);
if (sinMapa.length)
  console.log(`en el catálogo pero sin geometría: ${sinMapa.join(', ')}`);

const salida = Object.fromEntries(
  Object.entries(tabla).sort(([a], [b]) => a.localeCompare(b)),
);

if (!simular) {
  fs.writeFileSync(
    path.join(raiz(), 'src', 'data', 'iso-numeric.ts'),
    `/* GENERADO AUTOMÁTICAMENTE por scripts/generar-tabla-iso.mjs — no editar a mano.
   Identificadores ISO 3166-1 numéricos (world-atlas) → alpha-2.
 */
export const ISO_NUMERIC: Record<string, string> = ${JSON.stringify(salida, null, 2)};
`,
  );
}
console.log(
  `${simular ? 'A generar' : 'Generada'} tabla ISO: ${Object.keys(salida).length} entradas`,
);
