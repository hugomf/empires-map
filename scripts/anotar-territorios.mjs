/**
 * Anota los trazados con su jerarquía, su fuente y su nivel de confianza.
 *
 *   node scripts/anotar-territorios.mjs [--simular]
 *
 * Cada división administrativa declara la polidad de la que depende
 * (`superior`), el criterio con el que se ha trazado (`fuente`) y cuánto se
 * puede fiar el dibujo (`confianza`). La interfaz usa `confianza` para marcar
 * «aprox.» y no presentar un polígono reconstruido como si fuera un límite
 * archivado.
 *
 * Es idempotente: se puede volver a ejecutar sin duplicar nada.
 */
import fs from 'node:fs';
import path from 'node:path';
import { dirDatos } from './catalogo-json.mjs';

const simular = process.argv.includes('--simular');

/** Fuentes por familia de trazado. */
const FUENTES = [
  {
    prueba: (id) => /^roma-p/.test(id),
    fuente: 'Atlas histórico mundial de Shepherd: Nickel Maps, mapa provincial del Imperio romano',
    confianza: 'media',
  },
  {
    prueba: (id) => /^achaemenidas-s/.test(id),
    fuente: 'Encyclopædia Iranica: satrapías del Imperio aqueménida',
    confianza: 'media',
  },
  {
    prueba: (id) => /^(umeyas|abasies)-c/.test(id),
    fuente: 'Cambridge History of Islam: administración y provincias de los califatos',
    confianza: 'media',
  },
  {
    prueba: (id) => /^espana-t[2-6]$/.test(id),
    fuente: 'Encyclopædia Britannica: virreinatos del Imperio español',
    confianza: 'media',
  },
  {
    prueba: (id) => /^achaemenidas-t[12]$/.test(id),
    fuente: 'Encyclopædia Iranica: satrapías y regiones del Imperio aqueménida',
    confianza: 'media',
  },
];

const FUENTE_APROXIMADA =
  'Frontera moderna (world-atlas 50 m) recortada a mano: reconstrucción aproximada';

const fuenteDe = (id) =>
  FUENTES.find((f) => f.prueba(id))?.fuente ?? FUENTE_APROXIMADA;

const confianzaDe = (id) =>
  FUENTES.find((f) => f.prueba(id))?.confianza ?? 'baja';

let total = 0;
for (const fichero of ['territorios.json', path.join('en', 'territorios.json')]) {
  const p = path.join(dirDatos, fichero);
  if (!fs.existsSync(p)) continue;
  const lista = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const t of lista) {
    const esDivision = t.nivel === 'division';
    /* La división depende de la polidad que la posee. */
    t.superior = esDivision ? (t.civilizacion ?? null) : null;
    t.fuente = fuenteDe(t.id);
    t.confianza = confianzaDe(t.id);
  }
  if (!simular) fs.writeFileSync(p, JSON.stringify(lista, null, 2) + '\n');
  const divisiones = lista.filter((t) => t.nivel === 'division').length;
  console.log(
    `${fichero}: ${lista.length} trazados · ${divisiones} divisiones con «superior»`,
  );
  total += lista.length;
}
