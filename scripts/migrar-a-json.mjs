/**
 * Migración: de los ficheros .ts actuales a JSON normalizado en datos/.
 * Se ejecuta una sola vez; después, `datos/` es la fuente de verdad y los
 * .ts se generan con `npm run validar`.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = '/Users/hugo/Projects/empires-map';
const { CIVILIZACIONES } = await import(`${raiz}/src/data/civilizations.ts`);
const { REGIONES } = await import(`${raiz}/src/data/regions.ts`);
const { TERRITORIOS } = await import(`${raiz}/src/data/territorios.ts`);

const dir = path.join(raiz, 'datos');
fs.mkdirSync(dir, { recursive: true });

const escribir = (nombre, valor) =>
  fs.writeFileSync(path.join(dir, nombre), JSON.stringify(valor, null, 2) + '\n');

/* ── civilizaciones (sin hitos ni territorio: van normalizados) ── */
const civilizaciones = CIVILIZACIONES.map(({ hitos: _hitos, ...c }) => c);
escribir('civilizaciones.json', civilizaciones);

/* ── regiones ── */
escribir('regiones.json', REGIONES);

/* ── hitos normalizados ── */
const hitos = [];
for (const c of CIVILIZACIONES) {
  c.hitos.forEach((h, i) => {
    hitos.push({ id: `${c.id}-${i + 1}`, civilizacion: c.id, anio: h.a, texto: h.t });
  });
}
escribir('hitos.json', hitos);

/* ── territorios normalizados ── */
const territorios = [];
for (const [civ, partes] of Object.entries(TERRITORIOS)) {
  partes.forEach((p, i) => {
    territorios.push({
      id: `${civ}-t${i + 1}`,
      civilizacion: civ,
      tipo: p.tipo,
      nombre: p.nombre ?? null,
      ancla: p.ancla ?? null,
      desde: p.desde ?? null,
      hasta: p.hasta ?? null,
      anillos: p.anillos,
    });
  });
}
escribir('territorios.json', territorios);

console.log('migrado a JSON:');
console.log('  civilizaciones:', civilizaciones.length);
console.log('  regiones:', REGIONES.length);
console.log('  hitos:', hitos.length);
console.log('  territorios:', territorios.length);
