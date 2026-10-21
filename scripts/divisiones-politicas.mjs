/**
 * Dos niveles políticos:
 *   nivel 'polidad'  → el Estado soberano (imperio, reino, califato)
 *   nivel 'division' → su división administrativa (vireinato, provincia,
 *                      satrapía, emirato), con `superior` apuntando a la polidad.
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = '/Users/hugo/Projects/empires-map/datos';
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) => fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const civilizaciones = leer('civilizaciones.json');
const territorios = leer('territorios.json');

/* ── 1. Correcciones de integridad detectadas por el validador ── */
const set = (id, campo, valor) => {
  const c = civilizaciones.find((x) => x.id === id);
  if (c) c[campo] = valor;
};
set('ebla', 'apogeo', [-2350, -2300]);
set('asiria', 'declive', [-700, -609]);
const comanche = civilizaciones.find((x) => x.id === 'comanche');
if (comanche) {
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida =
    'La_SESSION de ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
  comanche.caida = comanche.caida.replace(/_SESSION/g, 'expansión');
  comanche.caida =
    'La expansión del ganado, el Smallpox, el ferrocarril y la reserva de 1875.';
}

/* ── 2. Marcar divisiones administrativas existentes ── */
const DIVISIONES = {
  espana: ['Virreinato de Nueva España', 'Virreinato del Perú', 'Virreinato de Nueva Granada', 'Virreinato del Río de la Plata', 'Filipinas'],
  umeyas: ['Arabia y Siria', 'Magreb y España', 'Al-Andalus'],
  abasies: ['Irak y Mesopotamia', 'Persia', 'Levante y Egipto'],
  fatimies: ['Egipto y Ifriqiya', 'Magreb'],
  sasanidas: ['Mesopotamia'],
  safavidas: ['Mesopotamia', 'Persia'],
  mongoles: ['Persia e Irak'],
  seljukas: ['Irak'],
  timuridos: ['Irak'],
  otomano: ['Mesopotamia'],
  macedonia: ['Grecia', 'Egipto', 'Persia', 'Asia Central', 'India'],
  achaemenidas: ['Altiplano iranio', 'Anatolia y Levante'],
};

for (const t of territorios) {
  t.nivel = 'polidad';
  t.superior = null;
}
for (const [civ, nombres] of Object.entries(DIVISIONES)) {
  for (const t of territorios) {
    if (t.civilizacion === civ && nombres.includes(t.nombre)) {
      t.nivel = 'division';
      t.superior = civ;
    }
  }
}

/* ── 3. Provincias romanas: la expansión fecha a fecha ── */
const ROMA = [
  ['Italia', [12.5, 43.0], -753, 476, [[10.2, 43.9], [13.5, 46.6], [18.5, 40.2], [16.0, 38.0], [15.6, 38.2], [12.4, 41.2], [10.2, 43.9]]],
  ['Hispania', [-4.5, 40.0], -206, 409, [[-9.5, 43.5], [-1.0, 43.5], [0.5, 39.0], [-2.5, 36.5], [-7.4, 36.2], [-9.5, 37.2], [-9.5, 43.5]]],
  ['Lusitania', [-8.5, 39.5], -138, 409, [[-9.5, 42.5], [-6.0, 42.5], [-6.5, 37.0], [-9.0, 36.9], [-9.5, 37.2], [-9.5, 42.5]]],
  ['Tarraconensis', [-1.5, 41.5], -197, 409, [[-4.5, 43.6], [3.5, 42.5], [1.0, 39.0], [-2.5, 39.5], [-4.5, 43.6]]],
  ['Gallia Narbonensis', [4.5, 44.0], -121, 460, [[2.5, 46.5], [7.5, 45.0], [7.0, 42.5], [3.0, 42.4], [2.5, 46.5]]],
  ['Gallia Lugdunensis', [1.0, 47.0], -22, 486, [[-4.5, 48.5], [2.5, 50.0], [3.5, 46.0], [1.0, 44.0], [-2.0, 45.0], [-4.5, 48.5]]],
  ['Britannia', [-3.0, 53.0], -43, 410, [[-5.8, 50.0], [0.8, 51.4], [1.7, 52.9], [0.3, 53.6], [-1.4, 55.8], [-3.2, 58.6], [-5.8, 57.0], [-5.8, 50.0]]],
  ['Africa Proconsularis', [9.5, 35.0], -146, 430, [[8.0, 37.5], [12.0, 37.0], [11.0, 32.0], [8.0, 31.5], [7.0, 34.5], [8.0, 37.5]]],
  ['Aegyptus', [30.0, 27.0], -30, 641, [[25.0, 31.6], [26.0, 22.0], [34.0, 22.0], [36.0, 31.0], [34.0, 32.6], [30.0, 31.6], [25.0, 31.6]]],
  ['Syria', [37.0, 33.5], -63, 636, [[34.2, 30.5], [35.8, 32.0], [36.6, 33.5], [35.4, 34.5], [33.8, 33.0], [34.2, 30.5]]],
  ['Judaea', [35.3, 31.8], -63, 135, [[34.5, 30.3], [35.6, 31.0], [35.6, 32.6], [34.6, 32.4], [34.5, 30.3]]],
  ['Asia', [27.5, 38.5], -133, 260, [[26.0, 36.8], [30.0, 36.5], [30.5, 39.5], [27.0, 40.0], [26.0, 36.8]]],
  ['Bithynia y Ponto', [33.0, 40.5], -74, 260, [[29.0, 39.5], [36.0, 39.0], [40.0, 41.0], [36.0, 42.5], [30.0, 41.5], [29.0, 39.5]]],
  ['Cilicia', [33.5, 37.0], -64, 260, [[30.0, 35.5], [36.0, 35.5], [35.5, 38.0], [31.0, 37.5], [30.0, 35.5]]],
  ['Galatia', [33.0, 39.0], -25, 260, [[30.5, 38.0], [36.0, 38.5], [37.0, 41.0], [32.0, 41.0], [30.5, 38.0]]],
  ['Illyricum', [19.0, 43.5], -135, 170, [[13.5, 42.5], [19.0, 41.0], [23.0, 43.0], [22.0, 46.0], [16.0, 46.0], [13.5, 42.5]]],
  ['Moesia', [24.0, 43.0], -29, 87, [[20.5, 42.0], [26.0, 42.0], [28.5, 44.0], [26.0, 45.5], [21.5, 45.0], [20.5, 42.0]]],
  ['Dacia', [24.0, 45.8], 106, 271, [[20.0, 45.0], [26.5, 47.5], [27.5, 44.0], [23.0, 43.5], [20.0, 45.0]]],
  ['Mesopotamia', [44.0, 33.0], 115, 363, [[38.6, 29.0], [42.0, 30.0], [47.0, 30.0], [48.4, 33.0], [47.0, 36.0], [44.0, 37.0], [41.0, 35.0], [38.6, 32.0], [38.6, 29.0]]],
  ['Germania', [9.0, 51.0], -12, 400, [[6.0, 47.5], [12.0, 50.5], [13.5, 52.5], [10.0, 54.0], [6.0, 52.0], [5.0, 49.0], [6.0, 47.5]]],
  ['Noricum y Alpes', [13.0, 46.5], -16, 400, [[9.5, 44.5], [15.5, 47.5], [17.0, 46.0], [14.0, 44.0], [9.5, 44.5]]],
];

for (const [nombre, ancla, desde, hasta, anillo] of ROMA) {
  const id = `roma-p${nombre.toLowerCase().replace(/[^a-z]/g, '')}`;
  if (territorios.some((t) => t.id === id)) continue;
  territorios.push({
    id,
    civilizacion: 'roma',
    tipo: 'tierra',
    nombre: 'Provincia: ' + nombre,
    ancla,
    desde,
    hasta,
    anillos: [anillo],
    nivel: 'division',
    superior: 'roma',
  });
}

/* ── 4. Satrapías persas ── */
const SATRAP = [
  ['Babilonia', [44.4, 32.6], -539, -330, [[43.9, 32.1], [44.7, 31.9], [45.6, 31.7], [45.9, 32.1], [45.4, 32.7], [44.7, 32.9], [44.0, 32.7], [43.9, 32.1]]],
  ['Susa', [48.3, 32.2], -539, -330, [[46.0, 31.0], [48.0, 29.5], [50.0, 30.5], [50.5, 33.0], [48.0, 33.5], [46.0, 31.0]]],
  ['Persépolis', [52.5, 30.0], -539, -330, [[50.0, 29.0], [53.0, 27.5], [56.0, 29.0], [56.0, 32.0], [52.0, 32.0], [50.0, 29.0]]],
  ['Lidia y Frigia', [28.5, 39.0], -547, -330, [[26.0, 36.8], [31.0, 36.5], [32.0, 39.5], [28.0, 40.5], [26.0, 36.8]]],
  ['Tracia', [25.0, 43.0], -513, -330, [[22.0, 41.5], [27.0, 41.5], [29.0, 44.0], [24.0, 45.5], [21.5, 43.5], [22.0, 41.5]]],
  ['Jonia', [27.0, 38.0], -546, -330, [[25.5, 37.0], [28.5, 37.0], [29.0, 39.0], [26.0, 39.5], [25.5, 37.0]]],
  ['Egipto', [30.0, 27.0], -525, -330, [[25.0, 31.6], [26.0, 22.0], [34.0, 22.0], [36.0, 31.0], [34.0, 32.6], [30.0, 31.6], [25.0, 31.6]]],
  ['Bactria', [66.0, 36.0], -539, -330, [[63.0, 34.0], [66.0, 35.6], [69.4, 36.6], [72.0, 37.2], [70.0, 34.0], [63.8, 32.6], [63.0, 34.0]]],
  ['Indus', [70.0, 26.0], -518, -330, [[66.6, 24.2], [68.4, 26.6], [70.4, 28.6], [72.4, 31.0], [72.0, 33.2], [68.2, 32.4], [66.6, 30.0], [66.6, 24.2]]],
  ['Armenia y Cáucaso', [45.0, 40.0], -539, -330, [[42.0, 38.5], [47.0, 38.0], [48.0, 42.0], [44.0, 43.0], [41.5, 40.0], [42.0, 38.5]]],
];
for (const [nombre, ancla, desde, hasta, anillo] of SATRAP) {
  const id = `achaemenidas-s${nombre.toLowerCase().replace(/[^a-z]/g, '')}`;
  if (territorios.some((t) => t.id === id)) continue;
  territorios.push({
    id,
    civilizacion: 'achaemenidas',
    tipo: 'tierra',
    nombre: 'Satrapía: ' + nombre,
    ancla,
    desde,
    hasta,
    anillos: [anillo],
    nivel: 'division',
    superior: 'achaemenidas',
  });
}

/* ── 5. Provincias de los califados ── */
const CALIF = [
  ['umeyas', 'Provincia: al-Andalus', [-4.5, 38.0], 711, 750, [[-9.5, 36.0], [-8.9, 41.9], [-2.2, 43.6], [1.0, 42.0], [0.0, 38.0], [-3.0, 36.6], [-9.5, 36.0]]],
  ['umeyas', 'Provincia: Iraq', [44.0, 33.0], 661, 750, [[38.6, 29.0], [42.0, 30.0], [47.0, 30.0], [48.4, 33.0], [47.0, 36.0], [44.0, 37.0], [41.0, 35.0], [38.6, 32.0], [38.6, 29.0]]],
  ['umeyas', 'Provincia: Siria', [37.0, 33.5], 661, 750, [[34.2, 30.5], [35.8, 32.0], [36.6, 33.5], [35.4, 34.5], [33.8, 33.0], [34.2, 30.5]]],
  ['umeyas', 'Provincia: Egipto', [30.0, 27.0], 661, 750, [[25.0, 31.6], [26.0, 22.0], [34.0, 22.0], [36.0, 31.0], [34.0, 32.6], [30.0, 31.6], [25.0, 31.6]]],
  ['abasies', 'Provincia: Corasán', [60.0, 35.0], 750, 1258, [[56.0, 30.0], [62.0, 33.0], [68.0, 35.0], [70.0, 39.0], [64.0, 40.0], [57.0, 37.0], [56.0, 30.0]]],
  ['abasies', 'Provincia: Jund de Irak', [44.0, 33.0], 750, 1258, [[43.5, 30.5], [47.0, 30.0], [48.4, 33.0], [47.0, 35.5], [44.0, 35.0], [43.5, 30.5]]],
  ['abasies', 'Provincia: Jund de Siria', [37.0, 33.5], 750, 1258, [[34.2, 30.5], [35.8, 32.0], [36.6, 33.5], [35.4, 34.5], [33.8, 33.0], [34.2, 30.5]]],
  ['abasies', 'Provincia: Jund de Egipto', [30.0, 27.0], 750, 1171, [[25.0, 31.6], [26.0, 22.0], [34.0, 22.0], [36.0, 31.0], [34.0, 32.6], [30.0, 31.6], [25.0, 31.6]]],
  ['abasies', 'Provincia: al-Andalus', [-4.5, 38.0], 756, 1031, [[-9.5, 36.0], [-8.9, 41.9], [-2.2, 43.6], [1.0, 42.0], [0.0, 38.0], [-3.0, 36.6], [-9.5, 36.0]]],
];
for (const [civ, nombre, ancla, desde, hasta, anillo] of CALIF) {
  const id = `${civ}-c${nombre.toLowerCase().replace(/[^a-z]/g, '')}`;
  if (territorios.some((t) => t.id === id)) continue;
  territorios.push({
    id,
    civilizacion: civ,
    tipo: 'tierra',
    nombre,
    ancla,
    desde,
    hasta,
    anillos: [anillo],
    nivel: 'division',
    superior: civ,
  });
}

/* ── 6. Formar el campo "política" de cada división ── */
escribir('territorios.json', territorios);
escribir('civilizaciones.json', civilizaciones);

const polidades = territorios.filter((t) => t.nivel === 'polidad').length;
const divisiones = territorios.filter((t) => t.nivel === 'division').length;
console.log('territorios:', territorios.length, '| polidades:', polidades, '| divisiones:', divisiones);
