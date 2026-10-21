/**
 * Capturas de pantalla de la app para revisar la cartografía.
 *
 *   node scripts/capturas.mjs [url] [prefijo] [año...]
 *
 * Uso interno de desarrollo: abre la app en Chromium, ajusta el año mediante
 * el enlace profundo y guarda un PNG por año.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rutas = [
  '/Users/hugo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright',
  'playwright',
];
let playwright = null;
for (const r of rutas) {
  try {
    playwright = require(r);
    break;
  } catch {
    /* siguiente */
  }
}
if (!playwright) {
  console.error('No se encuentra playwright (npx playwright --version lo deja en caché).');
  process.exit(1);
}

const base = process.argv[2] ?? 'http://localhost:5199';
const prefijo = process.argv[3] ?? 'app';
const anios = process.argv.slice(4).map(Number);
const salida = process.env.CAPTURAS_DIR ?? '/tmp/kilo';
/** Recorte "x,y,w,h" en píxeles CSS, para ampliar una zona del mapa. */
const recorte = process.env.RECORTE
  ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(process.env.RECORTE.split(',').map(Number))
  : undefined;
const escala = Number(process.env.ESCALA ?? 1);

fs.mkdirSync(salida, { recursive: true });

const navegador = await playwright.chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 1700, height: 1000 },
  deviceScaleFactor: escala,
});

for (const anio of anios) {
  await pagina.goto(`${base}/#${anio}`, { waitUntil: 'networkidle' });
  // Cambiar sólo el hash no recarga: hay que forzarla para que el año aplique.
  await pagina.reload({ waitUntil: 'networkidle' });
  await pagina.waitForTimeout(1500);
  const archivo = path.join(salida, `${prefijo}-${anio}.png`);
  await pagina.screenshot({ path: archivo, clip: recorte });
  console.log('captura:', archivo);
}

await navegador.close();
