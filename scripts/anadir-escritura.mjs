/**
 * Añade el sistema de escritura a las civilizaciones que lo tienen documentado.
 *
 *   node scripts/anadir-escritura.mjs [--simular]
 *
 * La tabla es la decisión editorial: solo las civilizaciones con un sistema
 * de escritura propio y documentado llevan el campo. Los pueblos sin escritura
 * (o con grafías no descifradas) se quedan sin él, porque el atlas no inventa.
 * Se aplica a los dos catálogos, español e inglés, con el mismo conjunto de ids.
 */
import fs from 'node:fs';
import path from 'node:path';
import { dirDatos } from './catalogo-json.mjs';

const simular = process.argv.includes('--simular');

/** id → [escritura en español, escritura en inglés] */
const ESCRITURA = {
  sumer: ['Cuneiforme', 'Cuneiform'],
  ebla: ['Cuneiforme', 'Cuneiform'],
  akkad: ['Cuneiforme', 'Cuneiform'],
  mari: ['Cuneiforme', 'Cuneiform'],
  babilonia: ['Cuneiforme', 'Cuneiform'],
  asiria: ['Cuneiforme', 'Cuneiform'],
  hititas: ['Cuneiforme y jeroglíficos', 'Cuneiform and hieroglyphs'],
  minoicos: ['Lineal A', 'Linear A'],
  micenicos: ['Lineal B', 'Linear B'],
  egipto: ['Jeroglíficos, jerático y demótico', 'Hieroglyphic, hieratic and Demotic scripts'],
  ptolomeos: ['Jeroglíficos y demótico', 'Hieroglyphs and Demotic script'],
  fenicios: ['Alfabeto fenicio', 'Phoenician alphabet'],
  israel: ['Alfabeto hebreo', 'Hebrew alphabet'],
  aramas: ['Alfabeto arameo', 'Aramaic alphabet'],
  seleucidas: ['Alfabeto griego', 'Greek alphabet'],
  nabateos: ['Alfabeto nabateo', 'Nabataean alphabet'],
  achaemenidas: ['Cuneiforme y arameo', 'Cuneiform and Aramaic'],
  partos: ['Escritura pahlavi', 'Pahlavi script'],
  sasanidas: ['Escritura pahlavi', 'Pahlavi script'],
  cartago: ['Alfabeto fenicio', 'Phoenician alphabet'],
  nubia: ['Jeroglíficos meroíticos y escritura copta', 'Meroitic hieroglyphs and Coptic script'],
  aksum: ['Ge\'ez', 'Ge\'ez script'],
  etruscos: ['Alfabeto etrusco', 'Etruscan alphabet'],
  griegos: ['Alfabeto griego', 'Greek alphabet'],
  macedonia: ['Alfabeto griego', 'Greek alphabet'],
  roma: ['Alfabeto latino', 'Latin alphabet'],
  bizantino: ['Alfabeto griego', 'Greek alphabet'],
  francos: ['Alfabeto latino', 'Latin alphabet'],
  'iberia-cristiana': ['Alfabeto latino', 'Latin alphabet'],
  ottomanos: ['Alfabeto árabe', 'Arabic alphabet'],
  seljukas: ['Alfabeto árabe', 'Arabic alphabet'],
  mongoles: ['Escritura mongol', 'Mongol script'],
  timuridos: ['Alfabeto árabe', 'Arabic alphabet'],
  safavidas: ['Alfabeto árabe', 'Arabic alphabet'],
  qajar: ['Alfabeto árabe', 'Arabic alphabet'],
  'iran-pahlavi': ['Alfabeto árabe y pahlavi', 'Arabic and Pahlavi alphabets'],
  'iran-islamico': ['Alfabeto árabe', 'Arabic alphabet'],
  indus: ['Escritura del Indo', 'Indus script'],
  veda: ['Alfabeto brahmí', 'Brahmic script'],
  mauryas: ['Alfabeto brahmí', 'Brahmi script'],
  guptas: ['Alfabeto brahmí', 'Brahmi script'],
  chola: ['Alfabeto brahmí y grantha', 'Brahmic and Grantha scripts'],
  mogol: ['Alfabeto persoárabe', 'Perso-Arabic alphabet'],
  hola: ['Alfabeto latino', 'Latin alphabet'],
  'china-antigua': ['Escritura china (óraculos y bronce)', 'Chinese writing (oracle bones and bronzes)'],
  qin: ['Escritura china (sellos)', 'Chinese writing (seal script)'],
  han: ['Escritura china (clerical y regular)', 'Chinese writing (clerical and regular scripts)'],
  tang: ['Escritura china (regular y cursiva)', 'Chinese writing (regular and cursive scripts)'],
  song: ['Escritura china (regular y cursiva)', 'Chinese writing (regular and cursive scripts)'],
  yuan: ['Escritura mongol y china', 'Mongol and Chinese scripts'],
  ming: ['Escritura china (regular y cursiva)', 'Chinese writing (regular and cursive scripts)'],
  qing: ['Escritura china (regular y cursiva)', 'Chinese writing (regular and cursive scripts)'],
  'china-republicana': ['Escritura china', 'Chinese writing'],
  'china-popular': ['Escritura china simplificada', 'Simplified Chinese writing'],
  corea: ['Hangul e ideogramas chinos', 'Hangul and Chinese characters'],
  japon: ['Kanji, kana y silabarios', 'Kanji, kana and syllabaries'],
  vietnam: ['Chữ Nôm', 'Chữ Nôm'],
  angkor: ['Alfabeto jemer', 'Khmer script'],
  kushanos: ['Alfabeto kharosthi', 'Kharoshthi script'],
  mali: ['Alfabeto árabe (ajami)', 'Arabic script (Ajami)'],
  songhai: ['Alfabeto árabe (ajami)', 'Arabic script (Ajami)'],
  kanem: ['Alfabeto árabe (ajami)', 'Arabic script (Ajami)'],
  etiopia: ['Ge\'ez', 'Ge\'ez script'],
  zapotecos: ['Escritura zapoteca', 'Zapotec script'],
  mayas: ['Escritura maya', 'Maya script'],
  mexica: ['Escritura náhuatl (pictogramas)', 'Nahuatl pictographic writing'],
  muisca: ['Escritura muisca', 'Muisca script'],
  holanda: ['Alfabeto latino', 'Latin alphabet'],
  espana: ['Alfabeto latino', 'Latin alphabet'],
  portugal: ['Alfabeto latino', 'Latin alphabet'],
  britania: ['Alfabeto latino', 'Latin alphabet'],
  'reino-unido': ['Alfabeto latino', 'Latin alphabet'],
  rusia: ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'rus-kiev': ['Alfabeto cirílico', 'Cyrillic alphabet'],
  napoleon: ['Alfabeto latino', 'Latin alphabet'],
  austria: ['Alfabeto latino', 'Latin alphabet'],
  austrohungria: ['Alfabeto latino', 'Latin alphabet'],
  alemania: ['Alfabeto latino', 'Latin alphabet'],
  tercerreich: ['Alfabeto latino', 'Latin alphabet'],
  sovietica: ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'estados-unidos': ['Alfabeto latino', 'Latin alphabet'],
  'imperio-brasileno': ['Alfabeto latino', 'Latin alphabet'],
  'segundo-imperio-mexicano': ['Alfabeto latino', 'Latin alphabet'],
  'mali-moderno': ['Alfabeto latino', 'Latin alphabet'],
  tuareg: ['Alfabeto tifinagh', 'Tifinagh alphabet'],
  fulani: ['Alfabeto árabe (ajami)', 'Arabic script (Ajami)'],
  hausa: ['Alfabeto árabe (ajami)', 'Arabic script (Ajami)'],
  yoruba: ['Alfabeto latino', 'Latin alphabet'],
  igbo: ['Alfabeto latino', 'Latin alphabet'],
  fon: ['Alfabeto latino', 'Latin alphabet'],
  swahili: ['Alfabeto árabe y latino', 'Arabic and Latin alphabets'],
  shona: ['Alfabeto latino', 'Latin alphabet'],
  luba: ['Alfabeto latino', 'Latin alphabet'],
  vikingos: ['Alfabeto rúnico', 'Runic alphabet'],
  bulgaros: ['Alfabeto cirílico y glagolítico', 'Cyrillic and Glagolitic alphabets'],
  hungaros: ['Alfabeto latino', 'Latin alphabet'],
  lituanos: ['Alfabeto latino', 'Latin alphabet'],
  polacos: ['Alfabeto latino', 'Latin alphabet'],
  tibet: ['Escritura tibetana', 'Tibetan script'],
  majapahit: ['Escritura javanesa (kawi)', 'Old Javanese script'],
  maratha: ['Alfabeto devanagari', 'Devanagari script'],
  sikh: ['Alfabeto gurmukhi', 'Gurmukhi script'],
  himyaritas: ['Alfabeto sabáico', 'Sabaean script'],
  coreas: ['Hangul e ideogramas chinos', 'Hangul and Chinese characters'],
  liao: ['Escritura khitan', 'Khitan script'],
  jurchen: ['Escritura jurchena', 'Jurchen script'],
  germanos: ['Alfabeto rúnico y latino', 'Runic and Latin alphabets'],
  visigodos: ['Alfabeto latino', 'Latin alphabet'],
  ostrogodos: ['Alfabeto latino', 'Latin alphabet'],
  vandalos: ['Alfabeto latino', 'Latin alphabet'],
  lombardos: ['Alfabeto latino', 'Latin alphabet'],
  anglosajones: ['Alfabeto rúnico y latino', 'Runic and Latin alphabets'],
  guaranies: ['Alfabeto guaraní', 'Guaraní alphabet'],
  umeyas: ['Alfabeto árabe', 'Arabic alphabet'],
  abasies: ['Alfabeto árabe', 'Arabic alphabet'],
  fatimies: ['Alfabeto árabe', 'Arabic alphabet'],
  mamelucos: ['Alfabeto árabe', 'Arabic alphabet'],
  moscovia: ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'zarato-ruso': ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'revolucion-rusa': ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'federacion-rusa': ['Alfabeto cirílico', 'Cyrillic alphabet'],
  'horda-de-oro': ['Alfabeto cirílico', 'Cyrillic alphabet'],
  novgorod: ['Alfabeto cirílico', 'Cyrillic alphabet'],
};

/** Inserta la clave después de «legado» y antes de «alias». */
function insertar(c, valor) {
  const salida = {};
  for (const [k, v] of Object.entries(c)) {
    if (k === 'escritura') continue;
    salida[k] = v;
    if (k === 'legado') salida.escritura = valor;
  }
  if (!('escritura' in salida)) salida.escritura = valor;
  return salida;
}

const errores = [];
for (const [fichero, indice] of [
  ['civilizaciones.json', 0],
  [path.join('en', 'civilizaciones.json'), 1],
]) {
  const p = path.join(dirDatos, fichero);
  if (!fs.existsSync(p)) continue;
  const lista = JSON.parse(fs.readFileSync(p, 'utf8'));
  const salida = [];
  let aplicadas = 0;
  for (const c of lista) {
    const entrada = ESCRITURA[c.id];
    if (!entrada) {
      salida.push(c);
      continue;
    }
    salida.push(insertar(c, entrada[indice]));
    aplicadas++;
  }
  const sobrantes = Object.keys(ESCRITURA).filter(
    (id) => !lista.some((c) => c.id === id),
  );
  if (sobrantes.length)
    errores.push(`${fichero}: ids de la tabla que no existen: ${sobrantes.join(', ')}`);
  if (!simular)
    fs.writeFileSync(p, JSON.stringify(salida, null, 2) + '\n');
  console.log(`${fichero}: ${aplicadas} civilizaciones con «escritura»`);
}

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s):`);
  for (const e of errores) console.error(`   · ${e}`);
  process.exit(1);
}
