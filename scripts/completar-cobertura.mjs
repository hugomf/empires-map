/**
 * Completa la cobertura cartográfica: da polígono a las civilizaciones que
 * aún no tenían territorio en el mapa, y sincroniza `datos/en/territorios.json`
 * con los nombres en inglés.
 *
 *   node scripts/completar-cobertura.mjs
 *
 * Es idempotente: si una civilización ya tiene polígono, no se toca.
 * Los pueblos sin Estado (territorio: false) se dibujan como aura y no
 * necesitan polígono.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const dir = path.join(raiz, 'datos');
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) =>
  fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const civilizaciones = leer('civilizaciones.json');
const territorios = leer('territorios.json');
const enTerritorios = leer(path.join('en', 'territorios.json'));

const conTerritorio = new Set(territorios.map((t) => t.civilizacion));

/* ───────────────────────── Polígonos nuevos ─────────────────────────
 * [civId, nombre ES, nombre EN, ancla [lon,lat], desde, hasta, ...anillos]
 * Los anillos se dibujan como polilíneas cerradas: el último punto repite
 * el primero. Se ordenan en sentido horario para evitar auto-intersecciones.
 * -------------------------------------------------------------------- */

const PERSIA = [
  [44.0, 29.5], [47.5, 30.0], [51.0, 28.0], [54.0, 26.8], [57.5, 25.5],
  [60.5, 25.0], [63.0, 27.5], [64.5, 30.0], [61.5, 35.5], [57.0, 37.5],
  [52.0, 39.0], [48.0, 38.5], [44.5, 37.0], [44.0, 33.0], [44.0, 29.5],
];

const NILO = [
  [29.8, 31.4], [32.6, 31.4], [32.8, 30.2], [33.4, 29.0], [34.2, 27.6],
  [34.6, 25.6], [35.2, 23.8], [35.4, 22.2], [34.9, 21.9], [33.4, 22.6],
  [32.4, 24.4], [31.6, 26.6], [30.2, 29.0], [29.6, 30.6], [29.8, 31.4],
];

const GRAN_BRETANA = [
  [-5.7, 49.9], [-3.0, 51.2], [0.8, 51.4], [1.7, 52.9], [0.3, 53.6],
  [-0.5, 54.6], [-1.4, 55.8], [-2.2, 57.7], [-3.2, 58.6], [-5.2, 58.6],
  [-5.8, 57.0], [-5.2, 55.6], [-4.6, 54.0], [-5.2, 53.4], [-3.6, 52.2],
  [-5.7, 49.9],
];

const PENINSULA_COREANA = [
  [124.6, 39.8], [126.0, 40.6], [128.0, 40.0], [129.6, 38.4], [129.4, 35.4],
  [128.4, 34.6], [126.6, 34.4], [126.2, 36.4], [125.2, 37.6], [124.6, 39.8],
];

const NIGER = [
  [-12.0, 12.0], [-9.0, 15.0], [-5.0, 16.6], [-1.0, 17.4], [2.4, 16.4],
  [3.0, 13.6], [0.0, 12.4], [-5.0, 11.6], [-9.4, 11.0], [-12.0, 12.0],
];

const POLIGONOS = [
  // ───────────── Mesopotamia y Siriya antigua ─────────────
  ['akkad', 'Akkad', 'Akkad', [44.1, 33.1], -2334, -2154,
    [[43.5, 33.5], [45.5, 34.0], [47.5, 33.0], [48.3, 31.5], [47.8, 30.2],
     [46.0, 30.0], [44.6, 30.6], [43.9, 31.6], [43.5, 33.5]]],
  ['mari', 'Mari', 'Mari', [40.9, 34.5], -2900, -1760,
    [[39.6, 35.3], [40.6, 35.4], [41.5, 34.9], [42.0, 34.2], [41.2, 33.4],
     [40.2, 33.3], [39.5, 34.2], [39.6, 35.3]]],
  ['ebla', 'Ebla', 'Ebla', [37.5, 35.8], -2350, -2250,
    [[36.9, 35.4], [37.6, 35.5], [38.2, 35.9], [38.1, 36.3], [37.5, 36.4],
     [36.9, 36.0], [36.9, 35.4]]],

  // ───────────── Europa occidental ─────────────
  ['francos', 'Imperio carolingio', 'Carolingian Empire', [8.0, 50.0], 768, 888,
    [[-3.0, 43.5], [1.0, 44.5], [4.0, 44.5], [6.0, 43.5], [9.0, 44.0],
     [10.0, 45.5], [12.0, 45.5], [13.5, 46.5], [14.0, 48.5], [15.0, 49.5],
     [12.0, 51.5], [8.0, 52.5], [4.0, 52.0], [2.0, 51.0], [0.0, 49.0],
     [-1.0, 47.0], [-2.0, 44.0], [-3.0, 43.5]]],
  ['reino-unido', 'Reino Unido', 'United Kingdom', [-2.0, 53.5], 1707, 2026,
    GRAN_BRETANA,
    [[-10.5, 51.4], [-6.0, 52.2], [-6.2, 54.2], [-8.0, 55.4], [-10.4, 54.3],
     [-10.5, 51.4]]],
  ['alemania', 'Imperio Alemán', 'German Empire', [13.4, 52.5], 1871, 1918,
    [[6.2, 49.2], [6.4, 51.0], [7.1, 53.3], [8.2, 53.7], [8.4, 54.9],
     [9.4, 57.0], [9.7, 54.9], [10.8, 54.4], [12.0, 54.5], [14.2, 54.1],
     [16.0, 54.6], [19.6, 54.8], [22.8, 54.5], [22.9, 50.0], [19.0, 50.0],
     [17.5, 51.0], [14.6, 51.0], [12.1, 51.0], [12.2, 50.2], [8.5, 48.8],
     [7.6, 48.0], [6.2, 49.2]]],
  ['tercerreich', 'Tercer Reich', 'Third Reich', [13.4, 52.5], 1933, 1945,
    [[2.0, 51.0], [4.5, 52.3], [6.5, 53.4], [8.3, 54.8], [9.4, 57.0],
     [10.6, 54.6], [12.5, 54.6], [15.5, 54.8], [18.5, 55.0], [21.2, 56.0],
     [23.8, 54.6], [24.3, 52.0], [23.9, 50.3], [21.0, 49.4], [19.0, 49.2],
     [17.0, 48.4], [16.4, 47.3], [16.3, 46.4], [13.6, 46.5], [12.3, 46.8],
     [10.0, 46.6], [7.6, 47.6], [6.0, 48.0], [3.0, 48.6], [1.0, 49.6],
     [0.2, 50.6], [2.0, 51.0]]],

  // ───────────── Península ibérica ─────────────
  ['iberia-cristiana', 'Reinos del norte', 'Northern Kingdoms', [-4.0, 42.0], 718, 1212,
    [[-9.0, 43.5], [-5.0, 43.8], [-2.0, 43.4], [-0.5, 42.6], [0.5, 41.5],
     [0.0, 40.5], [-2.0, 40.0], [-5.0, 40.8], [-7.5, 42.0], [-8.8, 42.8],
     [-9.0, 43.5]]],
  ['iberia-cristiana', 'Península reconquistada', 'Reclaimed Peninsula', [-4.0, 40.0], 1212, 1479,
    [[-9.0, 43.5], [-5.0, 43.8], [-2.0, 43.4], [0.0, 42.8], [1.0, 41.5],
     [0.5, 40.2], [0.0, 39.0], [-0.8, 37.6], [-2.2, 36.7], [-4.5, 36.6],
     [-5.5, 36.0], [-6.5, 37.0], [-7.4, 37.2], [-7.6, 38.5], [-8.8, 39.0],
     [-9.0, 40.5], [-9.0, 43.5]]],

  // ───────────── Europa central ─────────────
  ['austria', 'Imperio Austriaco', 'Austrian Empire', [16.4, 48.2], 1804, 1867,
    [[9.5, 47.3], [12.5, 49.0], [13.5, 50.5], [17.0, 50.5], [18.8, 49.5],
     [22.0, 49.0], [26.0, 48.5], [25.5, 46.0], [23.5, 44.8], [21.0, 44.2],
     [19.0, 42.6], [17.0, 43.4], [15.5, 45.5], [13.8, 45.7], [12.5, 46.5],
     [9.5, 47.3]]],
  ['austrohungria', 'Imperio Austro-Húngaro', 'Austria-Hungary', [16.4, 48.2], 1867, 1918,
    [[9.5, 47.3], [12.5, 49.0], [13.5, 50.5], [17.0, 50.5], [18.8, 49.5],
     [22.0, 49.0], [26.5, 48.6], [26.5, 46.0], [24.0, 44.0], [21.5, 43.5],
     [19.0, 42.4], [17.0, 43.2], [15.5, 45.5], [13.8, 45.7], [12.5, 46.5],
     [9.5, 47.3]]],

  // ───────────── Asia ─────────────
  ['qin', 'Dinastía Qin', 'Qin Dynasty', [108.7, 34.3], -221, -206,
    [[104.0, 35.5], [108.0, 40.0], [116.0, 41.5], [123.0, 40.5], [125.0, 39.0],
     [122.0, 37.0], [120.0, 34.0], [121.0, 31.0], [120.0, 28.0], [118.0, 24.0],
     [113.0, 22.0], [108.0, 21.5], [104.0, 22.5], [103.0, 25.0], [102.0, 28.0],
     [102.0, 31.0], [104.0, 35.5]]],
  ['tibet', 'Imperio Tibetano', 'Tibetan Empire', [91.0, 30.0], 618, 842,
    [[76.0, 41.0], [80.0, 42.5], [86.0, 43.0], [90.0, 42.0], [95.0, 41.5],
     [100.0, 42.5], [106.0, 43.0], [110.0, 41.5], [108.0, 39.0], [104.0, 37.0],
     [100.0, 34.0], [96.0, 32.0], [92.0, 31.0], [88.0, 32.0], [84.0, 34.0],
     [80.0, 36.0], [76.0, 38.0], [74.0, 40.0], [76.0, 41.0]]],
  ['coreas', 'Tres Reinos de Corea', 'Three Kingdoms of Korea', [127.5, 37.5], -37, 668,
    PENINSULA_COREANA,
    [[124.5, 40.5], [126.0, 41.8], [128.5, 42.3], [130.5, 42.8], [131.5, 44.0],
     [129.5, 45.0], [127.0, 45.5], [125.0, 44.5], [123.5, 43.0], [124.5, 40.5]]],

  // ───────────── India ─────────────
  ['maratha', 'Imperio Maratha', 'Maratha Empire', [75.5, 19.5], 1674, 1818,
    [[72.5, 21.5], [74.0, 19.5], [76.0, 17.5], [77.0, 15.0], [77.5, 12.0],
     [79.0, 11.0], [80.0, 13.0], [81.0, 16.0], [82.0, 19.0], [80.5, 21.5],
     [78.0, 23.5], [75.0, 22.5], [72.5, 21.5]]],
  ['sikh', 'Imperio Sij', 'Sikh Empire', [75.5, 31.5], 1799, 1849,
    [[71.0, 33.0], [74.0, 35.0], [77.0, 35.5], [79.0, 33.0], [78.0, 31.0],
     [76.0, 30.0], [74.0, 29.0], [72.0, 29.5], [70.5, 31.0], [71.0, 33.0]]],

  // ───────────── Persia ─────────────
  ['qajar', 'Persia qajar', 'Qajar Persia', [51.4, 35.7], 1789, 1925, PERSIA],
  ['iran-pahlavi', 'Irán Pahlaví', 'Pahlavi Iran', [51.4, 35.7], 1925, 1979, PERSIA],
  ['iran-islamico', 'República Islámica de Irán', 'Islamic Republic of Iran', [51.4, 35.7], 1979, 2026, PERSIA],

  // ───────────── Egipto y el Levante ─────────────
  ['mamelucos', 'Egipto mameluco', 'Mamluk Egypt', [31.8, 30.0], 1250, 1517, NILO],
  ['mamelucos', 'Siria y Palestina', 'Syria and Palestine', [35.5, 33.5], 1250, 1517,
    [[35.0, 33.0], [36.0, 34.0], [37.0, 35.5], [37.2, 37.0], [36.3, 36.5],
     [35.5, 35.0], [34.9, 34.0], [34.9, 32.8], [35.0, 33.0]],
    [[34.3, 31.4], [35.0, 29.5], [34.5, 28.0], [32.7, 27.7], [32.5, 29.8],
     [33.0, 31.0], [34.3, 31.4]]],

  // ───────────── África ─────────────
  ['buganda', 'Buganda', 'Buganda', [32.6, 0.3], 1300, 1896,
    [[32.0, -0.8], [33.0, -0.6], [33.6, 0.4], [33.2, 1.4], [32.2, 1.6],
     [31.4, 1.0], [31.2, 0.0], [32.0, -0.8]]],
  ['zulu', 'Zululandia', 'Zululand', [31.0, -28.5], 1816, 1897,
    [[28.5, -26.5], [30.0, -25.5], [31.8, -26.5], [32.5, -28.5], [31.8, -30.5],
     [30.2, -31.0], [29.0, -30.0], [28.2, -28.0], [28.5, -26.5]]],
  ['merina', 'Reino de Merina', 'Kingdom of Merina', [47.5, -18.9], 1794, 1897,
    [[45.8, -14.5], [47.5, -15.2], [49.0, -16.5], [49.2, -18.5], [48.2, -20.5],
     [46.8, -21.0], [45.6, -19.5], [44.8, -17.5], [45.0, -15.5], [45.8, -14.5]]],
  ['mali-moderno', 'Mali', 'Mali', [-3.0, 17.0], 1960, 2026, NIGER],
  ['benin', 'Reino de Benín', 'Kingdom of Benin', [5.6, 6.3], 1180, 1897,
    [[4.8, 6.0], [5.6, 6.4], [6.4, 6.3], [7.2, 6.0], [7.8, 5.6], [7.4, 4.8],
     [6.6, 4.6], [5.6, 5.0], [4.9, 5.4], [4.8, 6.0]]],
  ['bulgaros', 'Primer Imperio Búlgaro', 'First Bulgarian Empire', [25.5, 43.0], 681, 1018,
    [[20.5, 43.0], [22.5, 43.5], [24.0, 44.5], [26.5, 45.0], [28.0, 44.0],
     [27.5, 43.0], [26.0, 42.0], [25.0, 40.8], [23.0, 41.0], [22.0, 42.0],
     [20.5, 43.0]]],
  ['himyaritas', 'Reino de Himyar', 'Kingdom of Himyar', [44.2, 15.35], -300, 525,
    [[43.0, 15.5], [45.0, 16.5], [47.0, 16.0], [48.0, 15.0], [47.0, 13.5],
     [45.0, 13.0], [43.2, 13.8], [42.8, 15.0], [43.0, 15.5]]],

  // ───────────── América ─────────────
  ['imperio-brasileno', 'Imperio del Brasil', 'Empire of Brazil', [-51.0, -10.0], 1822, 1889,
    [[-69.5, -1.0], [-67.0, -2.0], [-64.0, -3.0], [-61.0, -4.0], [-59.5, -5.0],
     [-58.0, -4.0], [-55.0, -2.0], [-52.0, -1.0], [-50.0, 0.0], [-48.0, -1.0],
     [-44.0, -2.5], [-41.5, -3.0], [-38.5, -3.7], [-35.2, -5.8], [-37.0, -8.0],
     [-37.0, -11.0], [-39.0, -13.0], [-39.5, -17.5], [-41.0, -18.5], [-43.0, -22.0],
     [-44.0, -23.0], [-48.5, -25.5], [-51.0, -30.0], [-53.4, -33.0], [-55.5, -30.9],
     [-57.9, -27.0], [-54.6, -24.0], [-57.6, -19.0], [-60.0, -16.0], [-60.5, -13.5],
     [-65.0, -11.0], [-68.0, -11.0], [-70.5, -9.0], [-73.0, -7.0], [-73.5, -5.0],
     [-70.5, -2.0], [-69.5, -1.0]]],
  ['segundo-imperio-mexicano', 'Segundo Imperio Mexicano', 'Second Mexican Empire', [-102.0, 23.0], 1864, 1867,
    [[-117.5, 32.5], [-114.5, 32.0], [-111.0, 31.3], [-108.0, 31.3], [-106.5, 31.8],
     [-104.0, 29.5], [-101.5, 29.8], [-99.0, 26.5], [-97.5, 25.5], [-97.0, 21.5],
     [-96.0, 19.2], [-94.5, 18.2], [-91.5, 18.6], [-90.3, 21.0], [-88.0, 21.6],
     [-86.8, 21.5], [-87.0, 18.5], [-88.9, 15.9], [-92.0, 14.9], [-94.5, 16.2],
     [-97.0, 15.9], [-99.5, 16.8], [-102.0, 17.5], [-104.5, 19.5], [-105.7, 22.5],
     [-108.5, 25.5], [-110.5, 27.5], [-112.5, 30.0], [-114.5, 31.5], [-116.5, 32.0],
     [-117.5, 32.5]]],
];

/* ───────────────────────── Aplicación ───────────────────────── */

let anadidas = 0;
let corregidas = 0;
const omitidas = [];

/* El sufijo del id es la posición de la entrada dentro de este catálogo, de
 * modo que el script sea idempotente: si el id ya existe, no se vuelve a
 * añadir. Las civilizaciones de esta lista no tenían ningún territorio
 * antes, así que `-t1` no colisiona con nada. */
const idsExistentes = new Map(territorios.map((t) => [t.id, t]));
const idsEn = new Map(enTerritorios.map((t) => [t.id, t]));
const contador = new Map();

for (const [civ, nombre, nombreEn, ancla, desde, hasta, ...anillos] of POLIGONOS) {
  const c = civilizaciones.find((x) => x.id === civ);
  if (!c) {
    omitidas.push(`${civ} (no existe la civilización)`);
    continue;
  }
  const n = (contador.get(civ) ?? 0) + 1;
  contador.set(civ, n);
  const id = `${civ}-t${n}`;
  const nuevo = {
    id,
    civilizacion: civ,
    tipo: 'tierra',
    nombre,
    ancla,
    desde: Math.max(desde, c.inicio),
    hasta: Math.min(hasta, c.fin),
    anillos,
    nivel: 'polidad',
    superior: null,
  };
  const previo = idsExistentes.get(id);
  if (previo && previo.nombre !== nombre) {
    // El id ya lo ocupa otra entrada: no se pisa.
    omitidas.push(`${id} (ocupado por "${previo.nombre}")`);
    continue;
  }
  if (previo) {
    // Mismo territorio: se corrige la geometría.
    Object.assign(previo, nuevo);
    const enPrevio = idsEn.get(id);
    if (enPrevio) Object.assign(enPrevio, { ...nuevo, nombre: nombreEn });
    else enTerritorios.push({ ...nuevo, nombre: nombreEn });
    corregidas++;
    continue;
  }
  territorios.push(nuevo);
  enTerritorios.push({ ...nuevo, nombre: nombreEn });
  idsExistentes.set(id, nuevo);
  idsEn.set(id, enTerritorios.at(-1));
  conTerritorio.add(civ);
  anadidas++;
}

/* Los nombres de los territorios que ya existían en español y faltaban en
 * inglés (los 35 que añadieron las grandes civilizaciones) se traducen aquí. */
const NOMBRES_EN = {
  'china-antigua-t1': 'Ancient China',
  'han-t1': 'Han Empire',
  'tang-t1': 'Tang Empire',
  'song-t1': 'Song Empire',
  'yuan-t1': 'Yuan Empire',
  'ming-t1': 'Ming Dynasty',
  'qing-t1': 'Qing Dynasty',
  'china-republicana-t1': 'Republican China',
  'china-popular-t1': 'Contemporary China',
  'japon-t1': 'Japanese Archipelago',
  'mauryas-t1': 'Mauryan Empire',
  'guptas-t1': 'Gupta Empire',
  'mogol-t1': 'Mughal Empire',
  'hola-t1': 'British India',
  'bizantino-t1': 'Eastern Roman Empire',
  'napoleon-t1': 'Napoleonic Empire',
  'holanda-t1': 'Dutch Empire',
  'estados-unidos-t1': 'United States',
  'rusia-t1': 'Russian Empire',
  'sovietica-t1': 'Soviet Union',
  'partos-t1': 'Parthian Empire',
  'fatimies-t1': 'Fatimid Caliphate',
  'seleucidas-t1': 'Seleucid Kingdom',
  'ptolomeos-t1': 'Ptolemaic Egypt',
  'kanem-t1': 'Kanem-Bornu',
  'ashanti-t1': 'Ashanti Confederacy',
  'etiopia-t1': 'Solomonic Ethiopia',
  'rus-kiev-t1': "Kievan Rus'",
  'polacos-t1': 'Piast Poland',
  'lituanos-t1': 'Lithuania',
  'xiongnu-t1': 'Xiongnu',
  'liao-t1': 'Liao Empire',
  'jurchen-t1': 'Jin Dynasty',
  'safavidas-t1': 'Safavid Persia',
  'majapahit-t1': 'Majapahit',
};

let sincronizados = 0;
const porId = new Map(enTerritorios.map((t) => [t.id, t]));
for (const t of territorios) {
  if (porId.has(t.id)) continue;
  const en = NOMBRES_EN[t.id];
  if (!en) {
    console.warn(`  ! sin nombre en inglés para ${t.id} (${t.nombre})`);
    continue;
  }
  enTerritorios.push({ ...t, nombre: en });
  porId.set(t.id, enTerritorios.at(-1));
  sincronizados++;
}

escribir('territorios.json', territorios);
escribir(path.join('en', 'territorios.json'), enTerritorios);

const conT = new Set(territorios.map((t) => t.civilizacion));
console.log(`territorios añadidos: ${anadidas}`);
console.log(`geometrías corregidas: ${corregidas}`);
console.log(`omitidos: ${omitidas.join(', ') || '—'}`);
console.log(`sincronizados con inglés: ${sincronizados}`);
console.log(
  `cobertura: ${conT.size}/${civilizaciones.length} civilizaciones con polígono`,
);
