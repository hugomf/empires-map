/**
 * Auditoría de territorios: fracción de superficie en mar.
 *
 *   node scripts/auditar-poligonos.mjs [--radios]
 *
 * Rasteriza cada anillo de datos/territorios.json sobre su caja y comprueba
 * cuántas casillas del relleno caen en tierra (países de world-atlas). Los
 * anillos con mucha superficie en el mar son sospechosos de estar mal
 * ubicados o mal delimitados. No escribe nada: sólo informa.
 */
import fs from 'node:fs';
import path from 'node:path';
import { feature } from 'topojson-client';

const raiz = path.resolve(import.meta.dirname, '..');
const RES = 0.06;

const TOPO = JSON.parse(
  fs.readFileSync(path.join(raiz, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);
const PAISES = TOPO.objects.countries.geometries
  .map((g) => feature(TOPO, g).geometry)
  .filter(Boolean);

/* ── Rasterizado idéntico al de poligonos-geometricos.mjs ── */
const cerrar = (a) => {
  const r = a.slice();
  if (r.length > 2) {
    const [x0, y0] = r[0];
    const [x1, y1] = r[r.length - 1];
    if (x0 !== x1 || y0 !== y1) r.push([x0, y0]);
  }
  return r;
};

function rasterizar(anillos, caja) {
  const [x0, y0, x1, y1] = caja;
  const nx = Math.max(1, Math.ceil((x1 - x0) / RES));
  const ny = Math.max(1, Math.ceil((y1 - y0) / RES));
  const mask = new Uint8Array(nx * ny);
  const cruces = [];
  for (let j = 0; j < ny; j++) {
    const lat = y1 - (j + 0.5) * RES;
    cruces.length = 0;
    for (const anillo of anillos) {
      for (let i = 0; i < anillo.length - 1; i++) {
        const [ax, ay] = anillo[i];
        const [bx, by] = anillo[i + 1];
        if ((ay <= lat && by > lat) || (by <= lat && ay > lat)) {
          cruces.push(ax + ((lat - ay) * (bx - ax)) / (by - ay));
        }
      }
    }
    cruces.sort((a, b) => a - b);
    for (let k = 0; k + 1 < cruces.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((cruces[k] - x0) / RES - 0.5));
      const i1 = Math.min(nx - 1, Math.floor((cruces[k + 1] - x0) / RES - 0.5));
      for (let i = i0; i <= i1; i++) mask[j * nx + i] = 1;
    }
  }
  return { mask, nx, ny };
}

/* Máscara de tierra sobre una caja concreta. Cada país se pinta en su misma
 * pasada de even-odd y se disyuntan todas. No se mezclan países en una sola
 * rasterización: sus fronteras compartidas duplican los cruces y voltean la
 * paridad, dejando agujeros falsos en medio de la tierra. */
function mascaraTierra(caja) {
  const [x0, y0, x1, y1] = caja;
  const nx = Math.max(1, Math.ceil((x1 - x0) / RES));
  const ny = Math.max(1, Math.ceil((y1 - y0) / RES));
  const mask = new Uint8Array(nx * ny);
  for (const g of PAISES) {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      const parcial = rasterizar(poly.map(cerrar), caja);
      for (let i = 0; i < mask.length; i++) if (parcial.mask[i]) mask[i] = 1;
    }
  }
  return { mask, nx, ny };
}

const territorios = JSON.parse(fs.readFileSync(path.join(raiz, 'datos', 'territorios.json'), 'utf8'));

/* Prepara la máscara de tierra del mundo entero a RES: 6000 × 3000 casillas
 * sería demasiado, así que se rasteriza por caja a la hora de cada anillo. */
const informes = [];
for (const t of territorios) {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const a of t.anillos)
    for (const [x, y] of a) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  const caja = [x0 - 1, y0 - 1, x1 + 1, y1 + 1];
  const tierra = mascaraTierra(caja);
  const relleno = rasterizar(t.anillos.map(cerrar), caja);
  let mar = 0;
  let total = 0;
  for (let i = 0; i < relleno.mask.length; i++) {
    if (!relleno.mask[i]) continue;
    total++;
    if (!tierra.mask[i]) mar++;
  }
  if (total > 0)
    informes.push({
      id: t.id,
      civ: t.civilizacion,
      nombre: t.nombre,
      tipo: t.tipo,
      nivel: t.nivel,
      mar: mar / total,
    });
}

informes.sort((a, b) => b.mar - a.mar);
const mayores = informes.filter((i) => i.mar > 0.15);
console.log(`territorios con >15 % de su relleno en el mar: ${mayores.length} de ${informes.length}`);
for (const i of mayores) {
  console.log(`  ${(i.mar * 100).toFixed(0).padStart(3)} % · ${i.id} · ${i.civ} · ${i.nombre} · ${i.tipo}/${i.nivel}`);
}
