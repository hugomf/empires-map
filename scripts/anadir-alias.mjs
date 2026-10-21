/**
 * Añade los alias históricos de cada civilización al catálogo (ES y EN).
 *
 *   node scripts/anadir-alias.mjs [--simular]
 *
 * Reglas (ver openspec/changes/add-alias-busqueda):
 *  · un alias no puede estar vacío,
 *  · ni repetirse dentro de la misma civilización,
 *  · ni coincidir con el nombre canónico de otra,
 *  · ni repetirse en dos civilizaciones distintas.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const dir = path.join(raiz, 'datos');
const simular = process.argv.includes('--simular');

/** id → [alias en español, alias en inglés] */
const ALIAS = {
  achaemenidas: [['Persia', 'Persas', 'Imperio persa'], ['Persia', 'Persians', 'Persian Empire']],
  macedonia: [['Alejandro', 'Alejandro Magno', 'Macedonia antigua'], ['Alexander', 'Alexander the Great', 'Ancient Macedonia']],
  bizantino: [['Bizancio', 'Imperio bizantino', 'Constantinopla'], ['Byzantium', 'Byzantine Empire', 'Constantinople']],
  inca: [['Inca', 'Tahuantinsuyo', 'Tawantinsuyu'], ['Inca', 'Tahuantinsuyo', 'Tawantinsuyu']],
  cartago: [['Aníbal', 'Aníbal Barca', 'Púnicos', 'Cartaginenses'], ['Hannibal', 'Hannibal Barca', 'Carthaginian', 'Punic']],
  sumer: [['Sumeria', 'Mesopotamia', 'Sumerios'], ['Sumeria', 'Mesopotamia', 'Sumerians']],
  britania: [['Gran Bretaña', 'Inglaterra', 'Britania'], ['Great Britain', 'England', 'Britain']],
  roma: [['Roma Antigua', 'República Romana', 'Romanos'], ['Ancient Rome', 'Roman Republic', 'Romans']],
  partos: [['Partia', 'Imperio parto', 'Arsácidas'], ['Parthia', 'Parthian Empire', 'Arsacid']],
  sasanidas: [['Imperio sasánida', 'Persas sasánidas'], ['Sasanian Empire', 'Sasanian Persia']],
  safavidas: [['Imperio safávida', 'Persia safávida'], ['Safavid Empire', 'Safavid Persia']],
  qajar: [['Imperio qajar', 'Persia qajar'], ['Qajar Empire', 'Qajar Persia']],
  'iran-pahlavi': [['Persia pahlaví', 'Imperio pahlaví'], ['Pahlavi Persia', 'Pahlavi Empire']],
  'iran-islamico': [['Persia contemporánea', 'Irán actual'], ['Contemporary Persia', 'Iran Today']],
  seljukas: [['Sultanato de Rum', 'Grandes Seldjuques'], ['Sultanate of Rum', 'Great Seljuks']],
  mongoles: [['Gengis Kan', 'Mongoles', 'Tartaria'], ['Genghis Khan', 'Mongols', 'Tartary']],
  napoleon: [['Napoleón', 'Bonaparte', 'Primer Imperio'], ['Napoleon', 'Bonaparte', 'First Empire']],
  mexica: [['Tenochtitlan', 'Aztecas'], ['Tenochtitlan', 'Aztecs', 'Mexica Empire']],
  griegos: [['Griegos', 'Grecia', 'Helénicos'], ['Greeks', 'Greece', 'Hellenic']],
  egipto: [['Faraones', 'Egipcios', 'Antiguo Egipto'], ['Pharaohs', 'Egyptians', 'Nile Civilization']],
  japon: [['Nippon', 'Samuráis', 'Japón'], ['Nippon', 'Samurai', 'Japan']],
  rusia: [['Zares', 'Rusos', 'Imperio moscovita'], ['Tsars', 'Russians', 'Muscovite Empire']],
  espana: [['Hispanos', 'Corona de Castilla', 'Corona de Aragón'], ['Spaniards', 'Crown of Castile', 'Crown of Aragon']],
  hola: [['Indostán', 'Indios', 'Raj británico'], ['Hindustan', 'Indians', 'British Raj']],
  vikingos: [['Normandos', 'Escandinavos', 'Vikingos'], ['Norsemen', 'Normans', 'Scandinavians']],
  mauryas: [['Chandragupta', 'Asoka'], ['Chandragupta', 'Ashoka']],
  mogol: [['Babur', 'Akbar', 'Shah Jahan'], ['Babur', 'Akbar', 'Shah Jahan']],
  han: [['Wu', 'China Han'], ['Han China', 'China Han']],
  ming: [['Ming China', 'Porcelana Ming'], ['Ming China', 'Ming Porcelain']],
  qing: [['Qing China', 'Manchúes'], ['Qing China', 'Manchus']],
  hititas: [['Imperio hitita', 'Anatolia hitita'], ['Hittite Empire', 'Hittite Anatolia']],
  toltecas: [['Toltec', 'Tula'], ['Toltec', 'Tula']],
};

/* Alias que colisionarían con un nombre canónico: se descartan y se documentan. */
const DESCARTADOS = {
  britania: ['Reino Unido'], // es el nombre canónico de `reino-unido`
};

/* Nombres canónicos que quedaron en inglés tras la traducción automática. */
const NOMBRES_A_ARREGLAR = {
  seljukas: { es: 'Seldjuques', en: 'Seljuks' },
};

const normalizar = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[«»"'()·.,]/g, '')
    .trim();

const escribir = (fichero, datos) => {
  if (!simular) {
    fs.writeFileSync(
      path.join(dir, fichero),
      JSON.stringify(datos, null, 2) + '\n',
    );
  }
};

for (const [fichero, indiceAlias] of [
  ['civilizaciones.json', 0],
  [path.join('en', 'civilizaciones.json'), 1],
]) {
  const p = path.join(dir, fichero);
  if (!fs.existsSync(p)) continue;
  const datos = JSON.parse(fs.readFileSync(p, 'utf8'));
  const lista = Array.isArray(datos) ? datos : datos.civilizaciones;

  for (const c of lista) {
    const entrada = ALIAS[c.id];
    const fijar = NOMBRES_A_ARREGLAR[c.id];
    if (fijar) c.nombre = fijar[indiceAlias === 0 ? 'es' : 'en'];
    if (!entrada) continue;
    const alias = entrada[indiceAlias].filter(
      (a) => !(DESCARTADOS[c.id] ?? []).includes(a),
    );
    if (alias.length) c.alias = alias;
  }

  /* Comprobación de unicidad dentro del propio catálogo. */
  const vistos = new Map();
  for (const c of lista) {
    for (const a of c.alias ?? []) {
      const k = normalizar(a);
      if (vistos.has(k)) {
        console.warn(
          `  ! alias duplicado en ${fichero}: «${a}» (${c.id} y ${vistos.get(k)})`,
        );
      }
      vistos.set(k, c.id);
    }
  }

  escribir(fichero, datos);
  const conAlias = lista.filter((c) => c.alias?.length).length;
  console.log(`${fichero}: ${conAlias} civilizaciones con alias`);
}
