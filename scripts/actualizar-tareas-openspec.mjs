/**
 * Marca en los `tasks.md` de OpenSpec lo que ya está implementado.
 *
 *   node scripts/actualizar-tareas-openspec.mjs [--simular]
 *
 * El estado se declara a mano, tarea a tarea, después de comprobar cada una
 * en el código: lo que no se puede verificar sigue sin marcar.
 */
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const base = path.join(raiz, 'openspec', 'changes');
const simular = process.argv.includes('--simular');

/** change → lista de números de tarea ya hechas. */
const HECHAS = {
  'add-i18n': [1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10],
  'add-paises-actuales': [1.1, 1.6, 1.10],
  'add-religiones': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 1.10],
  'add-cultura-material': [1.1, 1.2, 1.4, 1.5, 1.7],
  'add-musica-ambiental': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9],
  'add-jerarquia-territorial': [1.2, 1.3, 1.4, 1.5, 1.8, 1.10, 1.11],
  'fix-conectar-datos': [1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.9, 1.10],
  'mejorar-experiencia': [1.5],
  'add-alias-busqueda': [],
};

/** change → nota de estado que se añade bajo el título. */
const NOTAS = {
  'add-i18n':
    'Pendiente: el idioma no viaja en el hash (`#1492/espana`); vive en `localStorage`.',
  'add-paises-actuales':
    'Pendiente: el panel de Estados existe con año, forma y nota (`src/data/estados-actuales.ts`), pero no hay `datos/estados-actuales.json`, ni capa en el mapa, ni tabla ISO, ni validación en `npm run validate`.',
  'add-religiones':
    'Pendiente: faltan el filtro «Religiones» y la capa de tinte religioso; el validador comprueba referencias, no solapamientos de periodos.',
  'add-cultura-material':
    'Pendiente: el campo `escritura` no existe en el catálogo y los bloques de la ficha no muestran estados vacíos.',
  'add-musica-ambiental':
    'Pendiente: revisión de clics y cortes en el navegador; el módulo vive en `src/lib/musica.ts`, no en `src/lib/audio.ts`.',
  'add-jerarquia-territorial':
    'Pendiente: `fuente` y `confianza` no están en el modelo, no hay control de capa «Divisiones» ni «Parte de: …» en la ficha.',
  'fix-conectar-datos':
    'Pendiente: el generador sigue incluyendo `id` en los hitos y `scripts/añadir-civilizaciones.mjs` sigue inservible (las altas van sobre `datos/`).',
  'mejorar-experiencia':
    'Pendiente: casi todo. Está el zoom temporal con minimapa (1.5); falta la comparativa en `docs/comparativa.md`, el hash extendido, «Copiar enlace», densidad de etiquetas, navegación por teclado, estados vacíos activos, revisión de foco/ARIA, móvil y contraste AA.',
  'add-alias-busqueda':
    'Sin empezar: el catálogo no tiene campo `alias` y la búsqueda no lo contempla.',
};

let marcadas = 0;
for (const [change, numeros] of Object.entries(HECHAS)) {
  const p = path.join(base, change, 'tasks.md');
  if (!fs.existsSync(p)) continue;
  const original = fs.readFileSync(p, 'utf8');
  const lineas = original.split('\n');
  const salida = lineas.map((linea) => {
    const m = linea.match(/^(\s*)- \[ \] (\d+)\.(\d+)\s(.*)$/);
    if (!m) return linea;
    if (!numeros.includes(Number(`${m[2]}.${m[3]}`))) return linea;
    marcadas++;
    return `${m[1]}- [x] ${m[2]}.${m[3]} ${m[4]}`;
  });
  let texto = salida.join('\n');
  const nota = NOTAS[change];
  if (nota && !texto.includes('Estado:')) {
    texto = texto.replace(/^(# Tareas\s*)/, `$1\n> **Estado:** ${nota}\n`);
  }
  if (!simular) fs.writeFileSync(p, texto);
}

console.log(`${simular ? 'A marcar' : 'Marcadas'}: ${marcadas} tareas`);
