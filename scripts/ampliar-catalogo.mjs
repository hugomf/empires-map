/**
 * Amplía el catálogo JSON con material de civilizaciones ya existentes.
 *
 *   node scripts/ampliar-catalogo.mjs [fichero] [--simular]
 *   node scripts/ampliar-catalogo.mjs --plantilla
 *
 * El fichero de entrada es un JSON con esta forma:
 *
 * {
 *   "ampliaciones": [
 *     {
 *       "civilizacion": "roma",
 *       "alias": ["Roma imperial"],
 *       "hitos": [[313, "El Edicto de Milán hace del cristianismo la religión oficial."]],
 *       "territorios": [
 *         {
 *           "nombre": "Provincia: Arabia",
 *           "ancla": [42, 24],
 *           "desde": 106,
 *           "hasta": 117,
 *           "anillos": [[[36, 16], [50, 16], [50, 32], [36, 32], [36, 16]]],
 *           "nivel": "division",
 *           "superior": "roma",
 *           "fuente": "Britannica: Roman province",
 *           "confianza": "media"
 *         }
 *       ],
 *       "ciudades": [
 *         { "id": "roma-ostia", "nombre": "Ostia", "actual": "Ostia Antica, Italia", "lat": 41.75, "lon": 12.29 }
 *       ],
 *       "artefactos": [
 *         { "id": "roma-a31", "nombre": "Moneda de Vespasiano", "tipo": "Economía", "icono": "moneda", "descripcion": "…", "material": "Bronce" }
 *       ]
 *     }
 *   ]
 * }
 *
 * Todo lo que se añade se valida antes de escribir: la civilización debe
 * existir, los ids no pueden repetirse y los alias no pueden colisionar con
 * otro nombre del catálogo.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  dirDatos,
  escribir,
  leer,
  normalizar,
  problemasTerritorio,
} from './catalogo-json.mjs';

const args = process.argv.slice(2);
const simular = args.includes('--simular');
const plantilla = args.includes('--plantilla');
const entrada = args.find((a) => !a.startsWith('--'));

const PLANTILLA = {
  ampliaciones: [
    {
      civilizacion: 'roma',
      alias: ['Roma imperial'],
      hitos: [[313, 'El Edicto de Milán hace del cristianismo la religión oficial.']],
      territorios: [
        {
          nombre: 'Provincia: Arabia',
          ancla: [42, 24],
          desde: 106,
          hasta: 117,
          anillos: [[[36, 16], [50, 16], [50, 32], [36, 32], [36, 16]]],
          nivel: 'division',
          superior: 'roma',
          fuente: 'Britannica: Roman province',
          confianza: 'media',
        },
      ],
      ciudades: [
        {
          id: 'roma-ostia',
          nombre: 'Ostia',
          actual: 'Ostia Antica, Italia',
          lat: 41.75,
          lon: 12.29,
        },
      ],
      artefactos: [
        {
          id: 'roma-a31',
          nombre: 'Moneda de Vespasiano',
          tipo: 'Economía',
          icono: 'moneda',
          descripcion:
            'Bronce acuñado por Vespasiano con la imagen de Roma en el reverso.',
          material: 'Bronce',
        },
      ],
    },
  ],
};

if (plantilla) {
  console.log(JSON.stringify(PLANTILLA, null, 2));
  process.exit(0);
}

if (!entrada) {
  console.error(
    'Uso: node scripts/ampliar-catalogo.mjs <fichero.json> [--simular]\n' +
      '     node scripts/ampliar-catalogo.mjs --plantilla',
  );
  process.exit(1);
}

const definiciones = JSON.parse(fs.readFileSync(path.resolve(entrada), 'utf8'));
const ampliaciones = definiciones.ampliaciones ?? [];
if (!Array.isArray(ampliaciones) || !ampliaciones.length) {
  console.error('El fichero no trae «ampliaciones».');
  process.exit(1);
}

const civilizaciones = leer('civilizaciones.json');
const hitos = leer('hitos.json');
const territorios = leer('territorios.json');
const ciudades = leer('ciudades.json');
const artefactos = leer('artefactos.json');

const civPorId = new Map(civilizaciones.map((c) => [c.id, c]));
const idsCiv = new Set(civPorId.keys());
const idsTerr = new Set(territorios.map((t) => t.id));
const idsHito = new Set(hitos.map((h) => h.id));
const idsCiudad = new Set(ciudades.map((c) => c.id));
const idsArtefacto = new Set(artefactos.map((a) => a.id));

const aliasVistos = new Map();
for (const c of civilizaciones)
  for (const a of c.alias ?? []) aliasVistos.set(normalizar(a), c.id);

const errores = [];
const resumen = [];

for (const ampliacion of ampliaciones) {
  const civId = ampliacion.civilizacion;
  const civ = civPorId.get(civId);
  if (!civ) {
    errores.push(`«${civId}» no es una civilización del catálogo`);
    continue;
  }

  /* Alias nuevos: se comprueban contra todo el catálogo antes de tocar nada. */
  const aliasNuevos = [];
  for (const a of ampliacion.alias ?? []) {
    const k = normalizar(a);
    if (aliasVistos.has(k)) {
      errores.push(
        `${civId}: el alias «${a}» ya lo declara ${aliasVistos.get(k)}`,
      );
      continue;
    }
    aliasVistos.set(k, civId);
    aliasNuevos.push(a);
  }
  if (aliasNuevos.length) {
    civ.alias = [...(civ.alias ?? []), ...aliasNuevos];
    civilizaciones[civilizaciones.findIndex((c) => c.id === civId)] = civ;
  }

  for (const [anio, texto] of ampliacion.hitos ?? []) {
    let n = 1;
    while (idsHito.has(`${civId}-${n}`)) n++;
    const id = `${civId}-${n}`;
    idsHito.add(id);
    hitos.push({ id, civilizacion: civId, anio, texto });
  }

  (ampliacion.territorios ?? []).forEach((t, i) => {
    const id = t.id ?? `${civId}-t${i + 1}`;
    const territorio = {
      id,
      civilizacion: civId,
      tipo: t.tipo ?? 'tierra',
      nombre: t.nombre ?? null,
      ancla: t.ancla ?? null,
      desde: t.desde ?? null,
      hasta: t.hasta ?? null,
      anillos: t.anillos,
      nivel: t.nivel ?? 'polidad',
    };
    if (t.superior) territorio.superior = t.superior;
    if (t.fuente) territorio.fuente = t.fuente;
    if (t.confianza) territorio.confianza = t.confianza;
    const p = problemasTerritorio(territorio, idsTerr, idsCiv);
    if (p.length) {
      errores.push(`${id}: ${p.join('; ')}`);
      return;
    }
    idsTerr.add(id);
    territorios.push(territorio);
  });

  for (const c of ampliacion.ciudades ?? []) {
    if (!c.id || idsCiudad.has(c.id)) {
      errores.push(`${civId}: ciudad «${c.id}» con id vacío o repetido`);
      continue;
    }
    idsCiudad.add(c.id);
    ciudades.push({
      id: c.id,
      civilizacion: civId,
      nombre: c.nombre,
      actual: c.actual,
      lat: c.lat,
      lon: c.lon,
    });
  }

  for (const a of ampliacion.artefactos ?? []) {
    if (!a.id || idsArtefacto.has(a.id)) {
      errores.push(`${civId}: artefacto «${a.id}» con id vacío o repetido`);
      continue;
    }
    idsArtefacto.add(a.id);
    artefactos.push({
      id: a.id,
      civilizacion: civId,
      nombre: a.nombre,
      tipo: a.tipo,
      icono: a.icono,
      descripcion: a.descripcion,
      material: a.material,
    });
  }

  resumen.push(civId);
}

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s):\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('\nNo se escribe nada. Corrige el fichero y vuelve a intentarlo.\n');
  process.exit(1);
}

if (!simular) {
  escribir('civilizaciones.json', civilizaciones);
  escribir('hitos.json', hitos);
  escribir('territorios.json', territorios);
  escribir('ciudades.json', ciudades);
  escribir('artefactos.json', artefactos);
}

console.log(
  `${simular ? 'A ampliar' : 'Ampliadas'}: ${resumen.length} civilizaciones` +
    (resumen.length ? ` (${resumen.join(', ')})` : ''),
);
console.log(
  `totales: ${civilizaciones.length} civilizaciones · ${hitos.length} hitos · ` +
    `${territorios.length} territorios · ${ciudades.length} ciudades · ${artefactos.length} artefactos`,
);

/* El inglés se mantiene a mano: avisamos de lo que queda sin traducir. */
const enPath = path.join(dirDatos, 'en', 'civilizaciones.json');
if (fs.existsSync(enPath)) {
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const idsEn = new Set(en.map((c) => c.id));
  const nuevos = [...resumen, ...resumen].filter((id) => !idsEn.has(id));
  if (nuevos.length) console.log(`sin traducir al inglés: ${nuevos.join(', ')}`);
}
