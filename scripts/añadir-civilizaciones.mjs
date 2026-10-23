/**
 * Añade civilizaciones nuevas al catálogo JSON (fuente de verdad).
 *
 *   node scripts/añadir-civilizaciones.mjs [fichero] [--simular]
 *   node scripts/añadir-civilizaciones.mjs --plantilla
 *
 * El fichero de entrada es un JSON con esta forma:
 *
 * {
 *   "civilizaciones": [
 *     {
 *       "id": "vikingos",
 *       "nombre": "Vikingos",
 *       "abrev": "VIK",
 *       "tipo": "pueblo",
 *       "region": "escandinavia",
 *       "inicio": 750,
 *       "fin": 1066,
 *       "apogeo": [850, 1010],
 *       "declive": [1040, 1066],
 *       "peso": 6,
 *       "territorio": true,
 *       "color": "#7f93a8",
 *       "sintesis": "…",
 *       "caida": "…",
 *       "legado": "…",
 *       "alias": ["Norse", "Vikingos"],
 *       "escritura": "Rúnica",
 *       "hitos": [[793, "Saqueo del monasterio de Lindisfarne."]],
 *       "territorios": [
 *         {
 *           "nombre": "Escandinavia",
 *           "ancla": [14, 62],
 *           "desde": 750,
 *           "hasta": 1066,
 *           "anillos": [[[4.5, 58.5], [8, 63], [4.5, 58.5]]],
 *           "nivel": "polidad"
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Los hitos y los territorios se reparten en sus tablas (`hitos.json`,
 * `territorios.json`) con ids derivados de la civilización. Las traducciones
 * inglesas no se tocan: se avisa de las ids que quedan sin traducir.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  dirDatos,
  escribir,
  leer,
  normalizar,
  problemasCivil,
  problemasTerritorio,
} from './catalogo-json.mjs';

const args = process.argv.slice(2);
const simular = args.includes('--simular');
const plantilla = args.includes('--plantilla');
const entrada = args.find((a) => !a.startsWith('--'));

const PLANTILLA = {
  civilizaciones: [
    {
      id: 'ejemplo',
      nombre: 'Imperio de ejemplo',
      abrev: 'EJE',
      tipo: 'imperio',
      region: 'mesopotamia',
      inicio: -1200,
      fin: 500,
      apogeo: [-800, -200],
      declive: [100, 500],
      peso: 5,
      territorio: true,
      color: '#c9a227',
      sintesis: 'Un párrafo de al menos treinta caracteres que resuma la civilización.',
      caida: 'Un párrafo de al menos treinta caracteres que explique cómo cayó.',
      legado: 'Un párrafo de al menos treinta caracteres sobre lo que dejó detrás.',
      alias: ['Alias histórico'],
      hitos: [[-1200, 'Fundación de laDINASTÍA.']],
      territorios: [
        {
          nombre: 'Núcleo',
          ancla: [40, 32],
          desde: -1200,
          hasta: 500,
          anillos: [[[35, 30], [45, 30], [45, 35], [35, 35], [35, 30]]],
          nivel: 'polidad',
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
    'Uso: node scripts/añadir-civilizaciones.mjs <fichero.json> [--simular]\n' +
      '     node scripts/añadir-civilizaciones.mjs --plantilla',
  );
  process.exit(1);
}

const definiciones = JSON.parse(fs.readFileSync(path.resolve(entrada), 'utf8'));
const nuevas = definiciones.civilizaciones ?? [];
if (!Array.isArray(nuevas) || !nuevas.length) {
  console.error('El fichero no trae «civilizaciones».');
  process.exit(1);
}

const civilizaciones = leer('civilizaciones.json');
const hitos = leer('hitos.json');
const territorios = leer('territorios.json');
const regiones = leer('regiones.json');

const idsCiv = new Set(civilizaciones.map((c) => c.id));
const idsTerr = new Set(territorios.map((t) => t.id));
const idsRegion = new Set(regiones.map((r) => r.id));

/* Los alias no pueden Repetirse: se comprueba antes de escribir nada. */
const aliasVistos = new Map();
for (const c of civilizaciones) {
  for (const a of c.alias ?? []) aliasVistos.set(normalizar(a), c.id);
}

const errores = [];
const resumen = [];

for (const def of nuevas) {
  const { hitos: hitosDef, territorios: terrDef, ...c } = def;
  const problemas = problemasCivil(c, idsCiv, idsRegion);
  for (const a of c.alias ?? []) {
    const k = normalizar(a);
    if (aliasVistos.has(k))
      problemas.push(`alias «${a}» ya lo declara ${aliasVistos.get(k)}`);
  }
  if (problemas.length) {
    errores.push(`${c.id ?? '(sin id)'}: ${problemas.join('; ')}`);
    continue;
  }

  civilizaciones.push(c);
  idsCiv.add(c.id);
  for (const a of c.alias ?? []) aliasVistos.set(normalizar(a), c.id);

  (hitosDef ?? []).forEach(([anio, texto], i) => {
    hitos.push({
      id: `${c.id}-${i + 1}`,
      civilizacion: c.id,
      anio,
      texto,
    });
  });

  (terrDef ?? []).forEach((t, i) => {
    const id = t.id ?? `${c.id}-t${i + 1}`;
    const territorio = {
      id,
      civilizacion: c.id,
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

  resumen.push(c.id);
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
}

/* Aviso de traducción pendiente: el inglés se revisa aparte. */
const enPath = path.join(dirDatos, 'en', 'civilizaciones.json');
const en = fs.existsSync(enPath)
  ? JSON.parse(fs.readFileSync(enPath, 'utf8'))
  : [];
const idsEn = new Set(en.map((c) => c.id));
const sinTraducir = resumen.filter((id) => !idsEn.has(id));

console.log(
  `${simular ? 'A añadir' : 'Añadidas'}: ${resumen.length} civilizaciones` +
    (resumen.length ? ` (${resumen.join(', ')})` : ''),
);
console.log(`total civilizaciones: ${civilizaciones.length}`);
if (sinTraducir.length)
  console.log(`sin traducir al inglés: ${sinTraducir.join(', ')}`);
