/** Cierra anillos que quedaron abiertos y avisa de los que se auto-intersectan. */
import fs from 'node:fs';
import path from 'node:path';

const dir = '/Users/hugo/Projects/empires-map/datos';
const p = path.join(dir, 'territorios.json');
const t = JSON.parse(fs.readFileSync(p, 'utf8'));

const cruz = (a1, a2, b1, b2) => {
  const o = (q, r, s) => Math.sign((r[0] - q[0]) * (s[1] - q[1]) - (r[1] - q[1]) * (s[0] - q[0]));
  return o(a1, a2, b1) !== o(a1, a2, b2) && o(b1, b2, a1) !== o(b1, b2, a2);
};

let cerrados = 0;
const autos = [];
for (const e of t) {
  e.anillos.forEach((anillo, i) => {
    const primero = anillo[0];
    const ultimo = anillo[anillo.length - 1];
    if (primero[0] !== ultimo[0] || primero[1] !== ultimo[1]) {
      anillo.push([...primero]);
      cerrados++;
    }
    const n = anillo.length - 1;
    for (let a = 0; a < n; a++)
      for (let b = a + 2; b < n; b++) {
        if (a === 0 && b === n - 1) continue;
        if (cruz(anillo[a], anillo[a + 1], anillo[b], anillo[b + 1])) {
          autos.push(`${e.id}#${i} entre ${a} y ${b}`);
          a = n;
          break;
        }
      }
  });
}
fs.writeFileSync(p, JSON.stringify(t, null, 2) + '\n');
console.log('anillos cerrados:', cerrados);
console.log('auto-intersecciones:', autos.length ? autos.join(' | ') : 'ninguna');
