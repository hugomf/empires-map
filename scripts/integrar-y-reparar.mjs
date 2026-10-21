import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const raiz = '/Users/hugo/Projects/empires-map';
const dir = path.join(raiz, 'datos');

/* ═══ 1. Reparar comillas rotas en los scripts ═══ */
for (const f of ['añadir-civilizaciones.mjs', 'ampliar-catalogo.mjs']) {
  const p = path.join(raiz, 'scripts', f);
  if (!fs.existsSync(p)) continue;
  const lineas = fs.readFileSync(p, 'utf8').split('\n');
  const arregladas = lineas.map((l) => {
    const n = (l.match(/'/g) || []).length;
    if (n % 2 === 1) {
      // cierra la cadena con comilla simple en lugar de doble
      return l.replace(/",$/, "',").replace(/"\s*\],?$/, "'$1");
    }
    return l;
  });
  fs.writeFileSync(p, arregladas.join('\n'));
}

/* ═══ 2. Ejecutar las altas si son válidas ═══ */
for (const f of ['añadir-civilizaciones.mjs', 'ampliar-catalogo.mjs']) {
  const p = path.join(raiz, 'scripts', f);
  if (!fs.existsSync(p)) continue;
  try {
    execSync(`node "${p}"`, { cwd: raiz, stdio: 'inherit' });
  } catch {
    console.log(`  (${f} no se pudo ejecutar)`);
  }
}

/* ═══ 3. Integrar los ficheros aportados por el usuario ═══ */
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) => fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const civilizaciones = leer('civilizaciones.json');
const hitos = leer('hitos.json');
const territorios = leer('territorios.json');

const adic = path.join(raiz, 'src/data/adiciones.json');
if (fs.existsSync(adic)) {
  const nuevas = JSON.parse(fs.readFileSync(adic, 'utf8'));
  let n = 0;
  for (const c of nuevas) {
    if (civilizaciones.some((x) => x.id === c.id)) continue;
    const { hitos: hs, ...resto } = c;
    civilizaciones.push({ ...resto, hitos: [] });
    (hs ?? []).forEach((h, i) =>
      hitos.push({ id: `${c.id}-${i + 1}`, civilizacion: c.id, anio: h.a, texto: h.t }),
    );
    n++;
  }
  escribir('civilizaciones.json', civilizaciones);
  escribir('hitos.json', hitos);
  console.log('integradas del usuario (adiciones.json):', n);
}

const extra = path.join(raiz, 'src/data/territorios-extra.json');
if (fs.existsSync(extra)) {
  const datos = JSON.parse(fs.readFileSync(extra, 'utf8'));
  let n = 0;
  for (const [civ, partes] of Object.entries(datos)) {
    partes.forEach((p, i) => {
      const id = `${civ}-x${i + 1}`;
      if (territorios.some((t) => t.id === id)) return;
      territorios.push({
        id,
        civilizacion: civ,
        tipo: p.tipo ?? 'tierra',
        nombre: p.nombre ?? null,
        ancla: p.ancla ?? null,
        desde: p.desde ?? null,
        hasta: p.hasta ?? null,
        anillos: p.anillos,
      });
      n++;
    });
  }
  escribir('territorios.json', territorios);
  console.log('integrados del usuario (territorios-extra.json):', n);
}
