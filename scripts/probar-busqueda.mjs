/**
 * Prueba el buscador en el navegador: escribe una consulta, captura el
 * resultado y comprueba qué civilizaciones aparecen.
 *
 *   node scripts/probar-busqueda.mjs [consulta...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright = null;
for (const r of [
  '/Users/hugo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright',
  'playwright',
]) {
  try {
    playwright = require(r);
    break;
  } catch {
    /* siguiente */
  }
}
if (!playwright) {
  console.error('No se encuentra playwright.');
  process.exit(1);
}

const base = process.env.BASE ?? 'http://localhost:5199';
const consultas = process.argv.slice(2);
const salida = process.env.CAPTURAS_DIR ?? '/tmp/kilo';
fs.mkdirSync(salida, { recursive: true });

const navegador = await playwright.chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1700, height: 1000 } });
/* La interfaz arranca en inglés; para probar los alias en español se fija el
 * idioma antes de cargar. */
await pagina.addInitScript((idioma) => {
  window.localStorage.setItem('cronica-idioma', idioma);
}, process.env.IDIOMA ?? 'es');
await pagina.goto(base, { waitUntil: 'networkidle' });

for (const q of consultas) {
  await pagina.fill('input[type="search"]', q);
  await pagina.waitForTimeout(400);
  const info = await pagina.evaluate(() => {
    const marcador = document.querySelector('.gantt-resultados');
    const filas = [...document.querySelectorAll('.g-fila')].map((f) => ({
      id: f.getAttribute('data-id'),
      texto: (f.textContent ?? '').trim().slice(0, 60),
    }));
    const nota = document.querySelector('.gantt-menores');
    return {
      resumen: marcador?.textContent?.trim() ?? '(sin marcador)',
      notaMenores: nota?.textContent?.trim() ?? null,
      filas: filas.slice(0, 6),
      total: filas.length,
    };
  });
  console.log(`\n«${q}» → ${info.total} fila(s) visibles`);
  console.log(`  ${info.resumen}`);
  if (info.notaMenores) console.log(`  ${info.notaMenores}`);
  for (const f of info.filas) console.log(`   · ${f.id} — ${f.texto}`);
  await pagina.screenshot({
    path: path.join(salida, `busqueda-${q.replace(/\s+/g, '_')}.png`),
    clip: { x: 290, y: 80, width: 1050, height: 700 },
  });
}

await navegador.close();
