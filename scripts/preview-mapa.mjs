/**
 * Vista previa estática del mapa en un año dado, en SVG.
 *
 *   node scripts/preview-mapa.mjs [año] [salida.svg]
 *
 * Sirve para revisar la cartografía sin abrir el navegador: dibuja el mundo
 * con los territorios vigentes en ese año, cada uno con el color de su
 * civilización.
 */
import fs from 'node:fs';
import path from 'node:path';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const raiz = path.resolve(import.meta.dirname, '..');
const leer = (n) => JSON.parse(fs.readFileSync(path.join(raiz, 'datos', n), 'utf8'));

const anio = Number(process.argv[2] ?? 100);
const salida = process.argv[3] ?? path.join(raiz, 'preview-mapa.svg');

const civilizaciones = leer('civilizaciones.json');
const territorios = leer('territorios.json');
const colorDe = new Map(civilizaciones.map((c) => [c.id, c.color]));

const mundo = JSON.parse(
  fs.readFileSync(path.join(raiz, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);
const paises = feature(mundo, mundo.objects.countries);

const W = 1600;
const H = 820;
const proyeccion = geoNaturalEarth1().fitExtent(
  [
    [10, 10],
    [W - 10, H - 10],
  ],
  paises,
);
const trazo = geoPath(proyeccion);

const partes = [];
partes.push(
  `<rect width="${W}" height="${H}" fill="#0b1015"/>`,
  `<g fill="#1b2530" stroke="#2b3947" stroke-width="0.5">`,
  `<path d="${trazo(paises)}"/>`,
  `</g>`,
);

/* Igual que en src/lib/geo.ts: d3 rellena el complemento si el anillo viene
 * del revés, así que se normaliza la orientación. */
const normalizarAnillo = (anillo) => {
  const r = anillo.slice();
  if (r.length && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])) {
    r.push(r[0]);
  }
  let area = 0;
  for (let i = 0; i < r.length - 1; i++) {
    area += (r[i + 1][0] - r[i][0]) * (r[i + 1][1] + r[i][1]);
  }
  if (area < 0) r.reverse();
  return r;
};

const vigente = territorios.filter(
  (t) =>
    (t.desde === null || t.desde <= anio) && (t.hasta === null || t.hasta >= anio),
);

for (const t of vigente) {
  const color = colorDe.get(t.civilizacion) ?? '#888';
  const d = t.anillos
    .map((anillo) => trazo({ type: 'Polygon', coordinates: [normalizarAnillo(anillo)] }))
    .join(' ');
  partes.push(
    `<path d="${d}" fill="${color}" fill-opacity="0.55" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>`,
  );
}

partes.push(`<text x="20" y="40" fill="#e8dcc8" font-size="26" font-family="Georgia, serif">${anio}</text>`);
partes.push(`<text x="20" y="66" fill="#8fa0b0" font-size="14" font-family="monospace">${vigente.length} territorios vigentes</text>`);

fs.writeFileSync(
  salida,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${partes.join('\n')}</svg>\n`,
);
console.log(`SVG escrito en ${salida} (${vigente.length} territorios en ${anio})`);
