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
  'add-religiones': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10],
  'add-cultura-material': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8],
  'add-musica-ambiental': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9],
  'add-jerarquia-territorial': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11],
  'fix-conectar-datos': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10],
  'mejorar-experiencia': [1.1, 1.2, 1.3, 1.4, 1.5],
  'add-alias-busqueda': [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8],
};

/** change → nota de estado que se añade bajo el título. */
const NOTAS = {
  'add-i18n':
    'Hecho: el idioma viaja en el hash y se restaura; sigue guardado en `localStorage`.',
  'add-paises-actuales':
    'En curso: falta cerrar capa, validación y revisión visual (trabajo en curso de otra sesión).',
  'add-religiones':
    'Hecho: filtro «Religiones» y tinte por familia con leyenda; `rel:1` persiste en el enlace.',
  'add-cultura-material':
    'Hecho: `escritura` en el catálogo y estados vacíos por sección verificados.',
  'add-musica-ambiental':
    'Hecho: revisión de clics y cortes hecha en el navegador.',
  'add-jerarquia-territorial':
    'Hecho: «Divisiones» persistida, «Parte de» y «aprox.» con fuente en la ficha.',
  'fix-conectar-datos':
    'Hecho: hitos sin `id`, cinco colecciones en el bundle y scripts de altas reescritos contra `datos/`.',
  'mejorar-experiencia':
    'Parcial: hechas 1.1–1.5; faltan teclado, estados vacíos, ARIA, móvil, contraste y pruebas.',
  'add-alias-busqueda':
    'Hecho: 38 alias cargados, buscador los indexa y pruebas manuales revisadas.',
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
