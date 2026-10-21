/**
 * Repara los textos del catálogo español dañados por una traducción
 * automática: fragmentos en inglés, palabras pegadas y caracteres basura.
 *
 *   node scripts/reparar-texto.mjs [--simular]
 *
 * Los textos se reconstruyen a partir del catálogo inglés, que quedó limpio.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const dir = path.join(raiz, 'datos');
const simular = process.argv.includes('--simular');

const escribir = (n, v) =>
  fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

/** [fichero, id, campo, texto correcto] */
const CORRECCIONES = [
  // ── Civilizaciones ───────────────────────────────────────────────────────
  ['civilizaciones.json', 'ebla', 'legado',
    'Su archivo revela los primeros contactos comerciales entre Egipto, Mesopotamia y el Levante.'],
  ['civilizaciones.json', 'majapahit', 'sintesis',
    'El imperio sundanés que unificó Java y dominó el archipiélago malayo: un poder marítimo con el código hindú y el Ramayana representado en Bali.'],
  ['civilizaciones.json', 'majapahit', 'legado',
    'Los templos de azúcar de Java, la trama de batik, el wayang y la purificación del agua de las piscinas.'],
  ['civilizaciones.json', 'maratha', 'sintesis',
    'La confederación maratha que salió de la India occidental y llegó a Delhi: Shivaji y sus sucesores combinaron la caballería ligera, el fuego greco y la administración de un ejército de miles de hombres.'],
  ['civilizaciones.json', 'maratha', 'caida',
    'Las tres guerras contra Gran Bretaña, la muerte del peshwa Baji Rao II y la ocupación británica de Bombay acabaron con su poder.'],
  ['civilizaciones.json', 'maratha', 'legado',
    'La administración de Shivaji, la nueva capital de Pune y los ghats de Maharashtra.'],
  ['civilizaciones.json', 'himyaritas', 'sintesis',
    'El reino del sur de Arabia, con capital en Zafar y luego Marib: un gran eje comercial del incienso y la mirra entre la India, Roma y África.'],
  ['civilizaciones.json', 'himyaritas', 'caida',
    'La incursión aksumita del siglo VI y el posterior relajamiento de los vínculos de Yemen con Aksum rompieron su mundo.'],
  ['civilizaciones.json', 'coreas', 'caida',
    'La unificación forzada de Silla y la presión posterior ejercida sobre todo el reino.'],
  ['civilizaciones.json', 'coreas', 'legado',
    'El budismo de los Tres Reinos, las influencias del período unificado, los prefijos funerarios y los guardianes de los sellos reales de Silla.'],
  ['civilizaciones.json', 'benin', 'caida',
    'La expedición de 1897, que saqueó la ciudad y se llevó sus tesoros, destruyó el reino y convirtió su territorio en la Colonia de Nigeria.'],
  ['civilizaciones.json', 'chimu', 'sintesis',
    'El reino de la costa norte del Perú, con capital en Chan Chan, la mayor ciudad de adobe del mundo: una artesanía famosa de la cerámica y los textiles.'],
  ['civilizaciones.json', 'chimu', 'caida',
    'La expansión del Chimú dirigida por Túpac Yupanqui y luego la conquista inca de 1470 acabaron con el reino y con su capital.'],
  ['civilizaciones.json', 'chimu', 'legado',
    'Las murallas de adobe de Chan Chan, los ponchos y la cerámica chimú con sus motivos de aves y peces.'],
  ['civilizaciones.json', 'wari', 'sintesis',
    'El primer Estado panandino de los Andes centrales, con capital en Huari y una red de caminos que unía el altiplano con la costa: un imperio temprano abierto a la influencia de la costa.'],
  ['civilizaciones.json', 'wari', 'caida',
    'La crisis del siglo X, la disolución de Wari y el auge de los reinos aimaras y luego de los incas acabaron con su federación.'],
  ['civilizaciones.json', 'jurchen', 'sintesis',
    'El imperio de los jurchenes, pueblo cazador de Manchuria que conquistó el norte de China y derrubó a la dinastía Song, y que fue a su vez barrido por los mongoles.'],
  ['civilizaciones.json', 'jurchen', 'caida',
    'La invasión mongola de 1211-1234, la caída de Kaifeng y la traición de su propio general acabaron con el imperio y con la dinastía Song.'],
  ['civilizaciones.json', 'jurchen', 'legado',
    'El violín de dos cuerdas y el arte jurchen, las leyes de Hangzhou y la cultura que convivió con los Song.'],
  ['civilizaciones.json', 'fatimies', 'sintesis',
    'El califato chií ismailí que gobernó Ifriqiya y después el Cairo: la construcción de Al-Azhar, un poder comercial con los venezianos y los genoveses.'],
  ['civilizaciones.json', 'fatimies', 'caida',
    'La caída de la ciudad de Mahdia y el avance de los seljukies y los ayyubíes acabaron con el califato.'],
  ['civilizaciones.json', 'fatimies', 'legado',
    'La mezquita y la universidad de Al-Azhar, la doctrina ismailí y el El Cairo medieval de los visires.'],
  ['civilizaciones.json', 'liao', 'sintesis',
    'El imperio dual de los khitan: un Estado tribal en la estepa y una administración china en el norte de Liao, con un sistema de ciudadanía de dos niveles que lo hacía único.'],
  ['civilizaciones.json', 'liao', 'caida',
    'La dinastía de los jin de los jurchenes lo destruyó en 1125, pero su cultura y su lengua se fundieron con los mongoles posteriores.'],
  ['civilizaciones.json', 'umeyas', 'sintesis',
    'El primer califato suní, con capital en Damasco y un imperio que llegó de la península ibérica al Sind.'],
  ['civilizaciones.json', 'umeyas', 'caida',
    'La división de la dinastía, la rebelión de las tribus fronterizas y el ascenso de los abasíes lo destruyeron en 750.'],
  ['civilizaciones.json', 'umeyas', 'legado',
    'La mezquita de Omeya, la aplicación de la ley islámica a los pueblos conquistados y la expansión del islam en el Mediterráneo occidental.'],
  ['civilizaciones.json', 'austria', 'sintesis',
    'El heredero del Sacro Imperio, que arrebató el Danubio y construyó un Estado plurinacional, con Viena como capital de la música y el Congreso de Viena de 1815.'],
  ['civilizaciones.json', 'reino-unido', 'legado',
    'El Estado de bienestar, la NHS, la BBC, el rock y el derecho consuetudinario.'],

  // ── Hitos ───────────────────────────────────────────────────────────────
  ['hitos.json', 'polacos-1', 'texto', 'Fundación de la dinastía de los Piast.'],
  ['hitos.json', 'liao-2', 'texto', 'Los chinos quedan inquietos: Song declara la guerra.'],

  // ── Religiones y artefactos ──────────────────────────────────────────────
  ['religiones.json', 'olmecas-r59', 'descripcion',
    'Los santuarios de San Lorenzo y La Venta, con la figura del jaguar y el hombre-jaguar.'],
  ['artefactos.json', 'bizantino-a23', 'descripcion',
    'Cáliz de plata con escenas de la vida de Cristo y de la corte imperial: el esplendor del mundo bizantino.'],
];

let aplicadas = 0;
const faltantes = [];

/* Se agrupa por fichero: cada JSON se lee, se corrige y se escribe una vez. */
const porFichero = new Map();
for (const correccion of CORRECCIONES) {
  if (!porFichero.has(correccion[0])) porFichero.set(correccion[0], []);
  porFichero.get(correccion[0]).push(correccion);
}

for (const [fichero, correcciones] of porFichero) {
  const p = path.join(dir, fichero);
  if (!fs.existsSync(p)) {
    faltantes.push(`${fichero} (no existe)`);
    continue;
  }
  const datos = JSON.parse(fs.readFileSync(p, 'utf8'));
  const lista = Array.isArray(datos) ? datos : Object.values(datos).flat();
  for (const [, id, campo, texto] of correcciones) {
    const e = lista.find((x) => x.id === id);
    if (!e) {
      faltantes.push(`${fichero} · ${id} (no existe la entrada)`);
      continue;
    }
    if (e[campo] === texto) continue;
    if (!simular) e[campo] = texto;
    aplicadas++;
  }
  if (!simular) escribir(fichero, datos);
}

console.log(`${simular ? 'A corregir' : 'Corregidos'}: ${aplicadas}`);
if (faltantes.length) console.log(`No encontrados: ${faltantes.join(' | ')}`);
