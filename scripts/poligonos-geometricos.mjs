/**
 * Genera polígonos históricos a partir de la geografía real.
 *
 *   node scripts/poligonos-geometricos.mjs [--simular]
 *
 * En vez de dibujar a mano una lista de puntos (que sale angular y no se
 * parece a ningún mapa), se parte de las fronteras modernas de world-atlas y
 * se recortan con máscaras de exclusión: el resultado hereda las costas y
 * las fronteras reales, pero con la extensión histórica de cada potencia.
 *
 * Procedimiento:
 *   1. Rasteriza en una rejilla los países base (relleno por líneas de barrido).
 *   2. Aplica la ventana, las máscaras de exclusión y las de recorte.
 *   3. Traza el contorno de la máscara con el algoritmo de casillas.
 *   4. Simplifica con Douglas–Peucker y cierra el anillo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { feature } from 'topojson-client';

const raiz = path.resolve(import.meta.dirname, '..');
const dirDatos = path.join(raiz, 'datos');
const simular = process.argv.includes('--simular');

const TOPO = JSON.parse(
  fs.readFileSync(path.join(raiz, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);
/* Un mismo id puede aparecer en varias geometrías (Australia y las islas
 * Ashmore comparten el 036). Se guardan todas para no quedarse con la última. */
const PAISES = new Map();
for (const g of TOPO.objects.countries.geometries) {
  if (!g.id) continue;
  if (!PAISES.has(g.id)) PAISES.set(g.id, []);
  PAISES.get(g.id).push(feature(TOPO, g).geometry);
}

const RES = 0.06; // grados de la rejilla
const TOLERANCIA = 0.07; // simplificación final, en grados
const AREA_MIN = 0.12; // se descartan los islotes por debajo de esto

/* ─────────────────── Geometría auxiliar ─────────────────── */

const cerrar = (anillo) => {
  const a = anillo.slice();
  if (a.length > 2) {
    const [x0, y0] = a[0];
    const [x1, y1] = a[a.length - 1];
    if (x0 !== x1 || y0 !== y1) a.push([x0, y0]);
  }
  return a;
};

const anillosDe = (geometria) => {
  const anillos = [];
  const polys = geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates;
  for (const poly of polys) for (const anillo of poly) anillos.push(cerrar(anillo));
  return anillos;
};

/** Relleno por líneas de barrido: devuelve la máscara de una lista de anillos. */
function rasterizar(anillos, caja) {
  const [x0, y0, x1, y1] = caja;
  const nx = Math.max(1, Math.ceil((x1 - x0) / RES));
  const ny = Math.max(1, Math.ceil((y1 - y0) / RES));
  const mask = new Uint8Array(nx * ny);
  const cruces = [];
  for (let j = 0; j < ny; j++) {
    const lat = y1 - (j + 0.5) * RES;
    cruces.length = 0;
    for (const anillo of anillos) {
      for (let i = 0; i < anillo.length - 1; i++) {
        const [ax, ay] = anillo[i];
        const [bx, by] = anillo[i + 1];
        if ((ay <= lat && by > lat) || (by <= lat && ay > lat)) {
          cruces.push(ax + ((lat - ay) * (bx - ax)) / (by - ay));
        }
      }
    }
    cruces.sort((a, b) => a - b);
    for (let k = 0; k + 1 < cruces.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((cruces[k] - x0) / RES - 0.5));
      const i1 = Math.min(nx - 1, Math.floor((cruces[k + 1] - x0) / RES - 0.5));
      for (let i = i0; i <= i1; i++) mask[j * nx + i] = 1;
    }
  }
  return { mask, nx, ny };
}

/**
 * Apertura morfológica: borra los rasgos de una sola celda de ancho (las
 * astillas que deja la silueta de un país) y devuelve el resto intacto. Sin
 * esto, una franja de 0,06° se recorre por los dos lados y el contorno se
 * pisa a sí mismo.
 */
function abrir(mask, nx, ny) {
  const dentro = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && mask[j * nx + i] === 1;
  const erosion = new Uint8Array(mask.length);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!dentro(i, j)) continue;
      let ok = true;
      for (let dj = -1; dj <= 1 && ok; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!dentro(i + di, j + dj)) {
            ok = false;
            break;
          }
        }
      }
      if (ok) erosion[j * nx + i] = 1;
    }
  }
  const salida = new Uint8Array(mask.length);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!erosion[j * nx + i]) continue;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const x = i + di;
          const y = j + dj;
          if (x >= 0 && y >= 0 && x < nx && y < ny) salida[y * nx + x] = 1;
        }
      }
    }
  }
  return salida;
}

/**
 * Elimina las pinzas: dos casillas en diagonal que se tocan sin estar
 * conectadas hacen que el contorno se corte en un punto. Rellenando una de
 * las dos casillas intermedias la máscara queda conectada por los lados y el
 * contorno se puede recorrer sin ambigüedad.
 */
function sinPinzas(mask, nx, ny) {
  const dentro = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && mask[j * nx + i] === 1;
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      if (dentro(i, j) && dentro(i + 1, j + 1) && !dentro(i + 1, j) && !dentro(i, j + 1)) {
        mask[j * nx + (i + 1)] = 1;
      } else if (dentro(i + 1, j) && dentro(i, j + 1) && !dentro(i, j) && !dentro(i + 1, j + 1)) {
        mask[j * nx + i] = 1;
      }
    }
  }
  return mask;
}

/** Traza el contorno de una máscara como anillos en coordenadas lon/lat. */
function trazar(mask, nx, ny, caja) {
  const [x0, , , y1] = caja;
  const dentro = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && mask[j * nx + i] === 1;
  const clave = (i, j) => j * (nx + 2) + (i + 1);
  const siguiente = new Map();

  const arista = (ax, ay, bx, by) => {
    const k = clave(ax, ay);
    if (!siguiente.has(k)) siguiente.set(k, []);
    siguiente.get(k).push([bx, by]);
  };

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!dentro(i, j)) continue;
      if (!dentro(i, j + 1)) arista(i, j + 1, i + 1, j + 1); // sur → +
      if (!dentro(i, j - 1)) arista(i + 1, j, i, j); // norte → −
      if (!dentro(i - 1, j)) arista(i, j, i, j + 1); // oeste → −
      if (!dentro(i + 1, j)) arista(i + 1, j + 1, i + 1, j); // este → +
    }
  }

  const anillos = [];
  const aPunto = (i, j) => [x0 + i * RES, y1 - j * RES];
  const partesDe = (k) => [k % (nx + 2) - 1, Math.floor(k / (nx + 2))];

  for (const [k, destinos] of siguiente) {
    if (!destinos.length) continue;
    const anillo = [];
    let actual = k;
    let previo = null;
    const vistas = new Set();
    while (!vistas.has(actual)) {
      vistas.add(actual);
      const [i, j] = partesDe(actual);
      anillo.push(aPunto(i, j));
      const opciones = siguiente.get(actual);
      if (!opciones || !opciones.length) break;
      /* En los puntos de pinza hay dos salidas: se toma la más recta para no
       * partir el contorno en trozos sueltos. */
      let elegido = 0;
      if (previo && opciones.length > 1) {
        const dir = [i - previo[0], j - previo[1]];
        let mejor = -Infinity;
        for (let n = 0; n < opciones.length; n++) {
          const o = opciones[n];
          const d = [o[0] - i, o[1] - j];
          const punt = d[0] * dir[0] + d[1] * dir[1];
          if (punt > mejor) {
            mejor = punt;
            elegido = n;
          }
        }
      }
      const destino = opciones.splice(elegido, 1)[0];
      previo = [i, j];
      actual = clave(destino[0], destino[1]);
    }
    if (anillo.length > 3) anillos.push(anillo);
  }
  return anillos;
}

/** Douglas–Peucker. */
function simplificar(puntos, tolerancia) {
  if (puntos.length < 4) return puntos;
  const dist = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const den = dx * dx + dy * dy;
    if (den === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / den));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };
  const rec = (ini, fin) => {
    let max = 0;
    let idx = -1;
    for (let i = ini + 1; i < fin; i++) {
      const d = dist(puntos[i], puntos[ini], puntos[fin]);
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max <= tolerancia || idx < 0) return [puntos[ini], puntos[fin]];
    return [...rec(ini, idx).slice(0, -1), ...rec(idx, fin)];
  };
  return rec(0, puntos.length - 1);
}

/** ¿Se cruzan los segmentos a y b? (mismo criterio que el validador) */
const seCruzan = (a1, a2, b1, b2) => {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  const d1 = o(a1, a2, b1);
  const d2 = o(a1, a2, b2);
  const d3 = o(b1, b2, a1);
  const d4 = o(b1, b2, a2);
  return d1 !== d2 && d3 !== d4;
};

/** Quita puntos repetidos y colineales: ensucian el trazo y falsean el cruce. */
const limpiarPuntos = (puntos) => {
  const a = [];
  for (const p of puntos) {
    const u = a[a.length - 1];
    if (u && Math.abs(u[0] - p[0]) < 1e-9 && Math.abs(u[1] - p[1]) < 1e-9) continue;
    a.push(p);
  }
  const salida = [];
  for (let i = 0; i < a.length; i++) {
    const prev = salida[salida.length - 1];
    const cur = a[i];
    const next = a[i + 1];
    if (prev && next) {
      const colineal =
        Math.sign(
          (cur[0] - prev[0]) * (next[1] - prev[1]) -
            (cur[1] - prev[1]) * (next[0] - prev[0]),
        ) === 0;
      /* Sólo se quita si el punto cae ENTRE sus vecinos: quitar un pico
       * cambiaría la forma y podría cruzar el contorno. */
      const entre =
        (cur[0] - prev[0]) * (next[0] - cur[0]) >= 0 &&
        (cur[1] - prev[1]) * (next[1] - cur[1]) >= 0;
      if (colineal && entre) continue;
    }
    salida.push(cur);
  }
  return salida.length >= 3 ? salida : a;
};

/** ¿El anillo se cruza consigo mismo? */
const esSimple = (anillo) => {
  const np = anillo.length - 1;
  for (let i = 0; i < np; i++) {
    for (let j = i + 2; j < np; j++) {
      if (i === 0 && j === np - 1) continue;
      if (seCruzan(anillo[i], anillo[i + 1], anillo[j], anillo[j + 1])) return false;
    }
  }
  return true;
};

/** Punto de cruce de dos segmentos. */
const cruce = (a1, a2, b1, b2) => {
  const x1 = a1[0];
  const y1 = a1[1];
  const x2 = a2[0];
  const y2 = a2[1];
  const x3 = b1[0];
  const y3 = b1[1];
  const x4 = b2[0];
  const y4 = b2[1];
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
};

/**
 * Divide un anillo que se cruza en trozos simples. El contorno de la máscara
 * puede tocarse en un punto (dos casillas en diagonal) y el recorrido decide
 * seguir de largo: ese punto se convierte en un vértice doble que separa el
 * contorno en dos anillos.
 */
function dividir(anillo) {
  const np = anillo.length - 1;
  for (let i = 0; i < np; i++) {
    for (let j = i + 2; j < np; j++) {
      if (i === 0 && j === np - 1) continue;
      if (!seCruzan(anillo[i], anillo[i + 1], anillo[j], anillo[j + 1])) continue;
      const c = cruce(anillo[i], anillo[i + 1], anillo[j], anillo[j + 1]);
      if (!c) continue;
      const a = [...anillo.slice(i + 1, j + 1), c, anillo[i], ...anillo.slice(1, i + 1), c];
      const b = [...anillo.slice(j + 1), anillo[0], ...anillo.slice(1, j + 1), c];
      return [...dividir(a), ...dividir(b)];
    }
  }
  return [anillo];
}

const area = (anillo) => {
  let s = 0;
  for (let i = 0; i < anillo.length - 1; i++) {
    s += anillo[i][0] * anillo[i + 1][1] - anillo[i + 1][0] * anillo[i][1];
  }
  return s / 2;
};

/** Centro de un anillo (con signo del área, para que no se salga). */
const centroDe = (anillo) => {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < anillo.length - 1; i++) {
    const f = anillo[i][0] * anillo[i + 1][1] - anillo[i + 1][0] * anillo[i][1];
    a += f;
    cx += (anillo[i][0] + anillo[i + 1][0]) * f;
    cy += (anillo[i][1] + anillo[i + 1][1]) * f;
  }
  if (a === 0) return anillo[0];
  return [cx / (3 * a), cy / (3 * a)];
};

const dentroDe = (p, anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
};

/** ¿Dos anillos distintos se cruzan? */
const anillosSeCruzan = (a, b) => {
  for (let i = 0; i < a.length - 1; i++)
    for (let j = 0; j < b.length - 1; j++)
      if (seCruzan(a[i], a[i + 1], b[j], b[j + 1])) return true;
  return false;
};

/** Huella de una máscara: contornos simples, simplificados y cerrados. */
function trazarLimpio(mascara, nx, ny, caja) {
  /* Douglas–Peucker puede cruzar el contorno al cortar las escaleras de la
   * rejilla: se prueban tolerancias mayores hasta que el anillo queda simple. */
  const ESCALONES = [TOLERANCIA, 0.12, 0.2, 0.35, 0.6, 1.0];
  mascara = abrir(mascara, nx, ny);
  sinPinzas(mascara, nx, ny);

  return trazar(mascara, nx, ny, caja)
    .flatMap((crudo) => dividir(crudo))
    .map((crudo) => {
      for (const tol of ESCALONES) {
        const s = limpiarPuntos(simplificar(crudo, tol));
        if (s.length >= 4 && esSimple([...s, s[0]])) return s;
      }
      if (process.env.DEBUG_GEOM)
        console.log(`    · fallback: anillo crudo de ${crudo.length} puntos, simple=${esSimple([...crudo, crudo[0]])}`);
      return crudo;
    })
    .filter((a) => Math.abs(area(a)) > AREA_MIN)
    .map((a) => (area(a) < 0 ? [...a].reverse() : a))
    .map((a) => [...a, a[0]])
    /* Redondear a milésimas: la precisión de 100 m sobra para un atlas y
     * el fichero se reduce a la mitad. Si el redondeo cruzara el contorno,
     * se conserva la versión sin redondear. Las celdas de la rejilla pueden
     * rozar el ±180 en diagonal (180.02): se acota al meridiano. */
    .map((a) => {
      const acota = (x) => Math.max(-180, Math.min(180, x));
      const r = a.map(([x, y]) => [acota(Math.round(x * 1000) / 1000), Math.round(y * 1000) / 1000]);
      return esSimple(r) ? r : a;
    });
}

/** Une varias partes que se solapan en una sola huella. */
function unirAnillos(anillos) {
  let x0 = 180;
  let y0 = 90;
  let x1 = -180;
  let y1 = -90;
  for (const a of anillos)
    for (const [x, y] of a) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  const caja = [x0 - 1, y0 - 1, x1 + 1, y1 + 1];
  const { mask, nx, ny } = rasterizar(anillos.map(cerrar), caja);
  return trazarLimpio(mask, nx, ny, caja);
}

/** Recorta un anillo contra una vertical (Sutherland–Hodgman). */
function recortarX(anillo, x, lado) {
  const dentro = (p) => (lado === 'izq' ? p[0] <= x : p[0] >= x);
  const salida = [];
  for (let i = 0; i < anillo.length - 1; i++) {
    const a = anillo[i];
    const b = anillo[i + 1];
    const da = dentro(a);
    const db = dentro(b);
    if (da) salida.push(a);
    if (da !== db) {
      const t = (x - a[0]) / (b[0] - a[0]);
      salida.push([x, a[1] + t * (b[1] - a[1])]);
    }
  }
  if (salida.length < 3) return null;
  salida.push([...salida[0]]);
  return salida;
}

/** Devuelve los anillos al rango −180…180, partiendo los que cruzan la línea. */
function envolverAntimeridiano(anillos) {
  const salida = [];
  for (const a of anillos) {
    let min = Infinity;
    let max = -Infinity;
    for (const [x] of a) {
      if (x < min) min = x;
      if (x > max) max = x;
    }
    if (max <= 180) {
      salida.push(a);
      continue;
    }
    if (min >= 180) {
      salida.push(a.map(([x, y]) => [x - 360, y]));
      continue;
    }
    const izq = recortarX(a, 180, 'izq');
    const der = recortarX(a, 180, 'der');
    if (izq) salida.push(izq);
    if (der) salida.push(der.map(([x, y]) => [x - 360, y]));
  }
  return salida;
}

/* ─────────────────── Construcción de una figura ─────────────────── */

/**
 * Una «parte» es un grupo de países base con sus máscaras.
 *   base: ids de world-atlas
 *   ventana: [lon0, lat0, lon1, lat1] que recorta las costas lejanas
 *   excluye: polígonos que se restan
 *   recorte: polígono que se intersecta
 */
function construir(parte) {
  const anillosBase = [];
  for (const id of parte.base ?? []) {
    const gs = PAISES.get(id);
    if (!gs) {
      console.warn(`  ! país desconocido: ${id}`);
      continue;
    }
    for (const g of gs) anillosBase.push(...anillosDe(g));
  }
  if (!anillosBase.length) return [];

  /* Si la figura cruza la línea de cambio de fecha, se pasa a un rango
   * continuo (0…360) antes de rasterizar. De lo contrario el relleno por
   * líneas de barrido une Chukotka con Europa y deja una franja recta de
   * miles de kilómetros. Al final se vuelve a −180…180. */
  const desplazar = Boolean(parte.antimeridiano);
  if (desplazar)
    for (const a of anillosBase)
      for (const p of a) if (p[0] < 0) p[0] += 360;

  /* Caja que engloba todo lo base, con margen. */
  let x0 = 180;
  let y0 = 90;
  let x1 = -180;
  let y1 = -90;
  for (const a of anillosBase) {
    for (const [x, y] of a) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const caja = [x0 - 1, y0 - 1, x1 + 1, y1 + 1];

  const base = rasterizar(anillosBase, caja);
  let mascara = base.mask;

  const restar = (anillos) => {
    const m = rasterizar(anillos.map(cerrar), caja);
    for (let i = 0; i < mascara.length; i++) if (m.mask[i]) mascara[i] = 0;
  };

  if (parte.ventana) {
    const [vx0, vy0, vx1, vy1] = parte.ventana;
    for (let j = 0; j < base.ny; j++) {
      const lat = caja[3] - (j + 0.5) * RES;
      for (let i = 0; i < base.nx; i++) {
        if (mascara[j * base.nx + i]) {
          const lon = caja[0] + (i + 0.5) * RES;
          if (lon < vx0 || lon > vx1 || lat < vy0 || lat > vy1) mascara[j * base.nx + i] = 0;
        }
      }
    }
  }
  for (const ex of parte.excluye ?? []) restar([ex]);

  if (parte.recorte) {
    const m = rasterizar([cerrar(parte.recorte)], caja);
    for (let i = 0; i < mascara.length; i++) if (!m.mask[i]) mascara[i] = 0;
  }

  return envolverAntimeridiano(trazarLimpio(mascara, base.nx, base.ny, caja));
}

/* ─────────────────── Definición de las potencias ─────────────────── */

const P = (base, opciones = {}) => ({ base, ...opciones });

/* Persia: la misma figura para las tres dinastías modernas de Irán. */
const PERSIA = () =>
  P(['364', '004', '795', '368'], {
    ventana: [42, 24, 70, 43],
    excluye: [
      [[66, 29], [75, 29], [75, 38], [66, 38]], // Afghanistan: sólo Herat y Balkh
      [[64, 36], [70, 36], [70, 42], [64, 42]], // Turkmenistán: sólo Merv
      [[38, 31], [49, 31], [49, 37], [38, 37]], // Irak: sólo el Shatt al-Arab
    ],
  });

/* Cada entrada define un territorio: lista de partes. */
const FIGURAS = {
  'akkad-t1': [
    P(['368'], {
      ventana: [40, 28, 50, 38],
      excluye: [[[46.6, 28], [50, 30], [50, 38], [46.6, 38]]],
    }),
  ],
  'mari-t1': [
    P(['760'], {
      ventana: [38, 32, 44, 37],
      recorte: [[39.4, 33.2], [42.4, 34.4], [41.4, 36.0], [39.2, 35.2]],
    }),
  ],
  'ebla-t1': [
    P(['760'], {
      ventana: [35, 34, 40, 38],
      recorte: [[36.5, 35.1], [38.5, 35.1], [38.5, 36.7], [36.5, 36.7]],
    }),
  ],
  'francos-t1': [
    P(['250', '276', '056', '528', '442', '756', '380', '724'], {
      ventana: [-10, 35, 20, 56],
      excluye: [
        [[-10, 36], [4, 36], [4, 41.6], [-10, 41.6]], // España: sólo la marca
        [[6, 36], [19, 36], [19, 44.4], [6, 44.4]], // Italia: sólo el norte
        [[13.6, 47], [16, 47], [16, 55], [13.6, 55]], // Alemania: sin el este
      ],
    }),
  ],
  'reino-unido-t1': [P(['826', '372'], { ventana: [-12, 49, 3, 60] })],
  'alemania-t1': [
    P(['276', '616', '203', '040', '756', '056', '528', '442', '208', '250'], {
      ventana: [4, 45, 26, 56],
      excluye: [
        [[-5, 42], [6.3, 42], [6.3, 47.3], [-5, 47.3]], // Francia: sólo Alsacia-Lorena
        [[22, 49], [29, 49], [29, 55], [22, 55]], // Polonia: sin la parte rusa
        [[8, 56.6], [13, 56.6], [13, 58], [8, 58]], // Dinamarca: sin el norte
      ],
    }),
  ],
  'tercerreich-t1': [
    P(['276', '616', '203', '040', '756', '056', '528', '442', '208', '250', '440', '703'], {
      ventana: [-6, 43, 27, 56],
      excluye: [
        [[-5, 42], [8, 42], [8, 45.4], [-5, 45.4]], // Francia: la zona ocupada
        [[24.6, 49], [29, 49], [29, 55], [24.6, 55]], // Polonia: hasta el Bug
      ],
    }),
  ],
  'austria-t1': [
    P(['040', '203', '348', '705', '191', '703', '642', '616', '804', '380', '688'], {
      ventana: [8, 41, 29, 52],
      excluye: [
        [[20, 43.4], [28, 43.4], [28, 48.4], [20, 48.4]], // Roma: sólo Transilvania
        [[14, 50.9], [29, 50.9], [29, 57], [14, 57]], // Polonia: sólo Galicia
        [[22, 44], [40, 44], [40, 48.3], [22, 48.3]], // Ucrania: sólo Bucovina
        [[18, 42], [23, 42], [23, 45.4], [18, 45.4]], // Serbia: sólo la Vojvodina
        [[6, 36], [19, 36], [19, 44.6], [6, 44.6]], // Italia: sólo el Lombardo-Veneto
      ],
    }),
  ],
  'austrohungria-t1': [
    P(['040', '203', '348', '705', '191', '703', '070', '642', '616', '804', '380', '688'], {
      ventana: [8, 41, 29, 52],
      excluye: [
        [[20, 43.4], [28, 43.4], [28, 48.4], [20, 48.4]],
        [[14, 50.9], [29, 50.9], [29, 57], [14, 57]],
        [[22, 44], [40, 44], [40, 48.3], [22, 48.3]],
        [[18, 42], [23, 42], [23, 45.4], [18, 45.4]],
        [[6, 36], [19, 36], [19, 44.6], [6, 44.6]],
      ],
    }),
  ],
  'qin-t1': [
    P(['156'], {
      recorte: [
        [103, 34], [105, 38], [110, 40], [116, 41], [121, 40],
        [122, 35], [121, 30], [118, 26], [113, 24], [108, 25], [104, 29], [103, 34],
      ],
    }),
  ],
  'iberia-cristiana-t1': [
    P(['724', '620'], {
      ventana: [-10, 34, 5, 44],
      excluye: [[[-10, 36], [4, 36], [4, 42.4], [-10, 42.4]]],
    }),
  ],
  'iberia-cristiana-t2': [
    P(['724', '620'], {
      ventana: [-10, 34, 5, 44],
      excluye: [[[-9, 35.4], [-2.2, 35.4], [-2.2, 36.2], [0, 36.5], [0, 37.1], [-9, 37.1]]],
    }),
  ],
  'coreas-t1': [P(['408', '410'], { ventana: [122, 33, 133, 49] })],
  'tibet-t1': [
    P(['156'], {
      recorte: [
        [74, 36], [78, 39], [84, 41], [90, 41], [96, 40], [100, 38],
        [102, 35], [101, 31], [98, 28], [94, 27], [89, 27], [84, 28],
        [79, 30], [76, 32], [74, 36],
      ],
    }),
  ],
  'maratha-t1': [
    P(['356'], {
      recorte: [
        [68, 23], [71, 25], [75, 27], [79, 27], [82, 25], [84, 22],
        [85, 18], [83, 14], [80, 12], [76, 13], [72, 15], [69, 18], [68, 23],
      ],
    }),
  ],
  'sikh-t1': [
    P(['586', '356'], {
      ventana: [66, 27, 80, 38],
      recorte: [[68.5, 28.5], [77.5, 28.5], [79.5, 34], [78, 37.5], [72, 36.5], [68.5, 33]],
    }),
  ],
  'himyaritas-t1': [
    P(['887'], {
      ventana: [41, 11, 55, 20],
      excluye: [
        [[48.2, 12], [54, 12], [54, 18], [48.2, 18]], // el Hadramaut
        [[42, 16.6], [48.2, 16.6], [48.2, 19], [42, 19]], // el norte
      ],
    }),
  ],
  'merina-t1': [P(['450'], { ventana: [42, -28, 52, -12], recorte: [[44, -16], [49.5, -16], [49.5, -25.5], [44, -25.5]] })],
  'zulu-t1': [P(['710', '748', '508'], { ventana: [26, -34, 34, -22], recorte: [[27.4, -31], [32.6, -31], [32.6, -24.8], [27.4, -24.8]] })],
  'buganda-t1': [P(['800'], { ventana: [28, -3, 36, 6] })],
  'benin-t1': [P(['566'], { ventana: [2, 3, 10, 10], recorte: [[3.8, 5.4], [7.2, 5.4], [7.2, 7.2], [3.8, 7.2]] })],
  'bulgaros-t1': [
    P(['100', '807', '300', '792'], {
      ventana: [18, 38, 30, 46],
      excluye: [[[26, 36], [40, 36], [40, 41.2], [26, 41.2]]], // Anatolia occidental
    }),
  ],
  'imperio-brasileno-t1': [P(['076'], { ventana: [-74, -34, -33, 6] })],
  'segundo-imperio-mexicano-t1': [P(['484', '320', '084'], { ventana: [-118, 12, -83, 33] })],
  'mali-moderno-t1': [P(['466'], { ventana: [-13, 9, 5, 26] })],
  'mamelucos-t1': [
    P(['818'], {
      ventana: [24, 21, 37, 32],
      excluye: [[[25, 21], [37, 21], [37, 24.2], [25, 24.2]]],
    }),
  ],
  'mamelucos-t2': [
    P(['760', '422', '376', '275', '400'], { ventana: [33, 28, 38, 37] }),
  ],
  'qajar-t1': [PERSIA()],
  'iran-pahlavi-t1': [PERSIA()],
  'iran-islamico-t1': [PERSIA()],
};


/* ── Lote 2: los polígonos antiguos, rehechos con la misma técnica ── */

const CAUCASO = ['051', '268', '031'];

const FIGURAS2 = {
  /* ── China ── */
  'china-antigua-t1': [
    P(['156'], {
      recorte: [
        [103, 34], [104, 37], [107, 39], [111, 40.5], [116, 40.5], [120, 39],
        [122, 35], [121, 31], [118, 28.5], [114, 28], [110, 29], [106, 31], [103, 34],
      ],
    }),
  ],
  'han-t1': [P(['156', '408', '410', '704'])],
  'tang-t1': [P(['156', '496', '408', '410', '704', '398', '417', '860'])],
  'song-t1': [P(['156'])],
  'yuan-t1': [P(['156', '496', '408', '410'])],
  'ming-t1': [P(['156', '408', '410', '496'])],
  'qing-t1': [P(['156', '496', '408', '410', '158'])],
  'china-republicana-t1': [P(['156', '496', '158'])],
  'china-popular-t1': [P(['156', '158'])],

  /* ── Rusias ── */
  'rusia-t1': [
    P(['643', '804', '112', '398', '246', '616', '498', ...CAUCASO], { antimeridiano: true }),
  ],
  'sovietica-t1': [
    P(['643', '804', '112', '398', '860', '417', '752', '795', '233', '428', '440', '498', ...CAUCASO], {
      antimeridiano: true,
    }),
  ],

  /* ──-states Unidos y memadai ── */
  'estados-unidos-t1': [P(['840'])],
  'britania-t1': [P(['826', '372'], { ventana: [-12, 49, 3, 60] })],
  'britania-t2': [P(['356', '586', '050', '104'])],
  'britania-t3': [P(['124'])],
  'britania-t4': [P(['036', '554'])],
  'britania-t5': [P(['710', '516', '072', '716', '894', '454'])],
  'britania-t6': [P(['818'])],
  'britania-t7': [P(['376', '275', '400', '368'])],
  'holanda-t1': [P(['528']), P(['360', '740'])],

  /* ── Imperios de la antigüedad ── */
  'xiongnu-t1': [
    P(['496', '398', '417', '762', '860']),
    P(['156'], {
      recorte: [
        [80, 42], [88, 45], [96, 47], [104, 46], [112, 44], [120, 43],
        [122, 40], [118, 36], [110, 35], [100, 35], [92, 37], [84, 39], [80, 42],
      ],
    }),
  ],
  'jurchen-t1': [
    P(['408', '496']),
    P(['156'], {
      recorte: [
        [105, 42], [110, 44], [116, 46], [122, 47], [128, 47], [133, 45],
        [134, 41], [130, 38], [126, 35], [120, 33], [114, 32], [108, 34], [105, 38], [105, 42],
      ],
    }),
  ],
  'seleucidas-t1': [
    P(['792', '760', '368', '364', '004', '860', '795', '422', '376', '275', '400', '051', '031', '268', '586']),
  ],
  'fatimies-t1': [
    P(['818', '760', '422', '376', '275', '400', '788', '012']),
  ],
  'seljukas-t1': [
    P(['792', '368', '364', '498', '860', '703', '795']),
  ],
  'napoleon-t1': [
    P(['250', '380', '276', '056', '528', '442', '756', '008', '499', '070', '100', '807', '300'], {
      ventana: [-10, 36, 25, 55],
      excluye: [
        [[13.6, 47], [16, 47], [16, 55], [13.6, 55]],
        [[16, 45], [22, 45], [22, 52], [16, 52]],
        [[25, 45], [30, 45], [30, 55], [25, 55]],
      ],
    }),
  ],
  'partos-t1': [P(['364', '368', '004', '795', '586', '051'])],
  'sasanidas-t1': [P(['364', '368', '004', '860', '792', '795', '051', '031', '268', '586'])],
  'safavidas-t1': [P(['364', '368', '004', '860', '792', '795', '031', '051', '268', '586'])],

  /* ── Aqueménidas ── */
  'achaemenidas-t1': [P(['364', '004', '795', '860', '762', '586'])],
  'achaemenidas-t2': [P(['792', '760', '422', '376', '275', '400'])],
  'achaemenidas-sbabilonia': [P(['368'], { ventana: [38, 29, 49, 37] })],
  'achaemenidas-ssusa': [P(['364'], { recorte: [[47, 30], [51, 30], [51, 34], [47, 34]] })],
  'achaemenidas-sperspolis': [P(['364'], { recorte: [[51, 28], [55, 28], [55, 31], [51, 31]] })],
  'achaemenidas-slidiayfrigia': [P(['792'], { recorte: [[26, 37], [33, 37], [33, 41], [26, 41]] })],
  'achaemenidas-stracia': [P(['100', '807'], { ventana: [22, 40, 29, 46] })],
  'achaemenidas-sjonia': [P(['792'], { recorte: [[26, 37.4], [30, 37.4], [30, 41], [26, 41]] })],
  'achaemenidas-segipto': [P(['818'], { ventana: [24, 21, 37, 32] })],
  'achaemenidas-sbactria': [P(['004', '860', '762'])],
  'achaemenidas-sindus': [P(['586'])],
  'achaemenidas-sarmeniaycucaso': [P(CAUCASO, { ventana: [38, 38, 52, 46] })],

  /* ── Omeyas ── */
  'umeyas-cprovinciaalandalus': [P(['724', '620'], { ventana: [-10, 34, 4, 44] })],
  'umeyas-cprovinciairaq': [P(['368'], { ventana: [38, 29, 49, 37] })],
  'umeyas-cprovinciasiria': [P(['760', '422', '376', '275', '400'], { ventana: [33, 28, 42, 37] })],
  'umeyas-cprovinciaegipto': [P(['818'], { ventana: [24, 21, 37, 32] })],

  /* ── Divisiones de Alejandro ── */
  'macedonia-x1': [P(['300', '008', '499', '807', '100'], { ventana: [18, 36, 30, 44] })],
  'macedonia-x2': [
    P(['818'], { recorte: [[24, 22], [33, 22], [33, 32], [24, 32]] }),
    P(['504'], { recorte: [[20, 29], [26, 29], [26, 33], [20, 33]] }),
  ],
  'macedonia-x3': [P(['792', '760', '422', '376', '275', '400', '368'])],
  'macedonia-x4': [P(['364', '004', '795', '860', '762', '586'])],
  'macedonia-x5': [P(['586'])],

  /* ── Provincias romanas ── */
  'roma-pitalia': [P(['380'], { ventana: [10, 35, 19, 47] })],
  'roma-phispania': [P(['724', '620'], { recorte: [[-10, 36.7], [4, 36.7], [4, 44], [-10, 44]] })],
  'roma-plusitania': [P(['620', '724'], { recorte: [[-10, 36.2], [-2.5, 36.2], [-1.5, 43.8], [-10, 43.8]] })],
  'roma-ptarraconensis': [
    P(['724'], { recorte: [[-1.5, 36.5], [4, 36.5], [4, 44], [-9, 44], [-9, 41.8], [-4, 42.5], [-1.5, 41]] }),
  ],
  'roma-pgallianarbonensis': [P(['250', '724'], { recorte: [[-2, 42.5], [8, 42.5], [8, 46], [-2, 46]] })],
  'roma-pgallialugdunensis': [P(['250'], { recorte: [[-6, 46], [8, 46], [8, 51.5], [-6, 51.5]] })],
  'roma-pbritannia': [P(['826'], { recorte: [[-8, 50], [2, 50], [2, 56], [-8, 56]] })],
  'roma-pafricaproconsularis': [
    P(['788'], { recorte: [[7, 30], [12, 30], [12, 38], [7, 38]] }),
    P(['012'], { recorte: [[-2, 35], [8, 35], [8, 37], [-2, 37]] }),
  ],
  'roma-paegyptus': [P(['818'], { recorte: [[24, 22], [36, 22], [36, 32], [24, 32]] })],
  'roma-psyria': [P(['760', '422', '376', '275', '400'], { ventana: [33, 28, 42, 37] })],
  'roma-pjudaea': [P(['376', '275'], { ventana: [33, 29, 36, 33] })],
  'roma-pasia': [P(['792'], { recorte: [[26, 37], [33, 37], [33, 41], [26, 41]] })],
  'roma-pbithyniayponto': [P(['792'], { recorte: [[27, 40], [34, 40], [34, 43], [27, 43]] })],
  'roma-pcilicia': [P(['792'], { recorte: [[30, 35], [38, 35], [38, 38.5], [30, 38.5]] })],
  'roma-pgalatia': [P(['792'], { recorte: [[30, 38], [38, 38], [38, 42], [30, 42]] })],
  'roma-pillyricum': [P(['191', '705', '008', '499', '070'], { ventana: [13, 39, 22, 47] })],
  'roma-pmoesia': [P(['100', '688'], { recorte: [[20, 41], [29, 41], [29, 46], [20, 46]] })],
  'roma-pdacia': [P(['642', '498'], { recorte: [[20, 44], [27, 44], [27, 49], [20, 49]] })],
  'roma-pmesopotamia': [P(['368'], { ventana: [38, 29, 49, 37] })],
  'roma-pgermania': [P(['276'], { recorte: [[6, 47], [12, 47], [12, 55], [6, 55]] })],
  'roma-pnoricumyalpes': [P(['040', '705'], { recorte: [[10, 44], [17, 44], [17, 49], [10, 49]] })],

  /* ── Otros ── */
  'griegos-t1': [P(['300', '008', '499', '807', '100'], { ventana: [18, 36, 29, 42] })],
  'griegos-t2': [P(['300'], { recorte: [[23.4, 37.7], [24.1, 37.7], [24.1, 38.2], [23.4, 38.2]] })],
  'griegos-t3': [P(['300'], { recorte: [[22.2, 36.7], [22.7, 36.7], [22.7, 37.2], [22.2, 37.2]] })],
  'egipto-t1': [P(['818'], { ventana: [24, 21, 37, 32] })],
  'egipto-t2': [P(['818'], { recorte: [[32.3, 25], [33.3, 25], [33.3, 26], [32.3, 26]] })],
  'egipto-t3': [P(['818'], { recorte: [[31, 29.5], [31.7, 29.5], [31.7, 30.2], [31, 30.2]] })],
  'cartago-t1': [
    P(['788'], { recorte: [[7, 30], [12, 30], [12, 38], [7, 38]] }),
    P(['012'], { recorte: [[-2, 35], [8, 35], [8, 37], [-2, 37]] }),
    P(['724'], { recorte: [[-7, 35], [0, 35], [0, 37.2], [-7, 37.2]] }),
    P(['380'], { recorte: [[12, 36.4], [15.8, 36.4], [15.8, 38.4], [12, 38.4]] }),
    P(['380'], { recorte: [[8, 38.6], [9.9, 38.6], [9.9, 41.4], [8, 41.4]] }),
  ],
  'cartago-t2': [P(['788'], { recorte: [[10.1, 36.6], [10.6, 36.6], [10.6, 37.1], [10.1, 37.1]] })],
  'vandalos-x1': [
    P(['788'], { recorte: [[7, 30], [12, 30], [12, 38], [7, 38]] }),
    P(['012'], { recorte: [[-2, 35], [8, 35], [8, 37], [-2, 37]] }),
    P(['380'], { recorte: [[8, 38.6], [9.9, 38.6], [9.9, 41.4], [8, 41.4]] }),
  ],
  'vikingos-t1': [P(['578', '752', '208'], { ventana: [4, 54, 32, 72] })],
  'vikingos-t2': [P(['352', '304'])],
  'vikingos-t3': [
    P(['250'], { recorte: [[-4, 47], [3, 47], [3, 50], [-4, 50]] }),
    P(['372'], { recorte: [[-11, 51], [-5, 51], [-5, 55.5], [-11, 55.5]] }),
  ],
  'vikingos-x1': [P(['578', '752', '208'], { ventana: [4, 54, 32, 72] })],
  'vikingos-x2': [
    P(['250'], { recorte: [[-4, 50], [2, 50], [2, 55], [-4, 55]] }),
    P(['208'], { recorte: [[8, 54], [13, 54], [13, 58], [8, 58]] }),
  ],
  'espana-t1': [P(['724', '620'], { ventana: [-10, 34, 4, 44] })],
  'espana-t2': [
    P(['484', '320', '084'], { ventana: [-118, 12, -83, 33] }),
    P(['840'], {
      recorte: [
        [-125, 25], [-93, 25], [-90, 29], [-90, 33], [-93, 35], [-97, 36],
        [-101, 37], [-105, 38], [-109, 38], [-113, 37], [-117, 36], [-121, 35],
        [-125, 33], [-125, 25],
      ],
    }),
  ],
  'espana-t3': [P(['604', '068', '218', '152', '170'])],
  'espana-t4': [P(['170', '862', '218', '591'], { ventana: [-85, -20, -60, 15] })],
  'espana-t5': [P(['032', '858', '862', '068'])],
  'espana-t6': [P(['608'], { ventana: [115, 4, 127, 21] })],
};

Object.assign(FIGURAS, FIGURAS2);

/* ─────────────────── Figuras que aún se dibujaban a mano ───────────────────
 * Se añadieron después: son territorios que conservaban polígonos de 5–15
 * puntos con aristas rectas. Ahora heredan costas y fronteras modernas; las
 * máscaras recortan la extensión histórica aproximada. */
const RECORTE_INCA = [
  [-79, 8], [-76, 9], [-74, 10], [-71, 8], [-68, 6], [-65, 1], [-63, -5],
  [-62, -10], [-62, -15], [-62, -20], [-64, -25], [-66, -30], [-68, -33],
  [-70, -35], [-72, -37], [-74, -38], [-75, -33], [-75, -28], [-76, -23],
  [-77, -18], [-78, -13], [-79, -8], [-80, -3], [-80, 2], [-79, 8],
];
const RECORTE_ESTEPA = [
  [80, 42], [84, 44], [88, 45], [92, 46], [96, 47], [100, 47], [104, 46],
  [108, 45], [112, 44], [116, 43], [120, 43], [122, 41], [121, 39], [118, 37],
  [114, 36], [110, 35], [106, 34], [102, 34], [98, 35], [94, 36], [90, 37],
  [86, 38], [82, 40], [80, 42],
];
const RECORTE_MANCHURIA = [
  [105, 42], [110, 44], [116, 46], [122, 47], [128, 47], [133, 45],
  [134, 41], [130, 38], [126, 35], [120, 33], [114, 32], [108, 34], [105, 38], [105, 42],
];

const FIGURAS3 = {
  'aborigenes-t1': [P(['036', '598'])], // Sahul: Australia y Nueva Guinea
  'timuridos-t1': [
    P(['860', '004', '364', '795', '762', '398', '368', '586', '792']),
  ],
  'tupinamba-x1': [
    P(['076'], {
      recorte: [
        [-48, -2], [-44, -2], [-39, -3], [-35, -7], [-38, -13], [-39, -18],
        [-45, -25], [-48, -25], [-47, -22], [-46.5, -19], [-45.5, -16],
        [-45, -13], [-45.5, -10], [-46, -7], [-47, -4], [-48, -2],
      ],
    }),
  ],
  'mauryas-t1': [P(['356', '586', '050', '004', '524', '064'])],
  'guptas-t1': [P(['356', '586', '050', '524', '064'])],
  'mogol-t1': [P(['356', '586', '050', '004'])],
  'hola-t1': [P(['356', '586', '050', '104'])],
  'inca-t1': [P(['604', '218', '068', '152', '032', '170'], { recorte: RECORTE_INCA })],
  'inca-x3': [P(['604', '218', '068', '152'], { recorte: RECORTE_INCA })],
  'inca-x4': [P(['604', '218', '068', '152', '032', '170'], { recorte: RECORTE_INCA })],
  'majapahit-t1': [P(['360', '458', '096', '626'])],
  'liao-t1': [P(['496', '408']), P(['156'], { recorte: RECORTE_MANCHURIA })],
  'mongoles-t1': [
    P(['496', '398', '417', '762', '860']),
    P(['156'], { recorte: RECORTE_ESTEPA }),
  ],
  'ottomanos-t4': [P(['368', '682', '400', '760', '414', '512', '887', '784'])],
  'portugal-t2': [P(['076'])],
  'portugal-t4': [P(['508'])],
  'kamilaroi-t1': [
    P(['036'], {
      recorte: [
        [140, -30], [146, -29], [151, -25], [153, -20], [145, -18], [142, -22], [140, -30],
      ],
    }),
  ],
  'tuareg-t1': [
    P(['466', '562', '012', '434', '148'], {
      recorte: [
        [-5, 15], [-2, 17], [2, 16], [6, 15], [10, 15], [14, 17], [18, 20],
        [22, 23], [25, 26], [22, 29], [17, 30], [12, 30], [7, 29], [2, 28],
        [-2, 25], [-5, 20], [-5, 15],
      ],
    }),
  ],
  'swahili-t1': [
    P(['404', '834', '508', '706'], {
      recorte: [
        [39, -5], [41, -2], [41, 2], [44, 5], [51, 12], [48, 15], [42, 10], [39, 3], [39, -5],
      ],
    }),
  ],
  'khoi-t1': [
    P(['710'], {
      recorte: [
        [16, -35], [20, -35], [27, -33], [27, -28], [22, -28], [17, -30], [16, -35],
      ],
    }),
  ],
  'guaranies-x1': [
    P(['600', '032', '076', '068'], {
      recorte: [
        [-60, -20], [-54, -20], [-50, -25], [-54, -30], [-58, -31], [-61, -27], [-60, -20],
      ],
    }),
  ],
  'comanche-t1': [
    P(['840'], {
      recorte: [
        [-105, 30], [-98, 30], [-96, 34], [-98, 40], [-104, 42], [-108, 38], [-105, 30],
      ],
    }),
  ],
  'ptolomeos-t1': [P(['818', '012', '376', '275', '422', '760', '196'])],
  'abasies-cprovinciajunddeegipto': [P(['818'])],
};

Object.assign(FIGURAS, FIGURAS3);

/* ─────────────── Reparación de territorios costeros/marítimos ──────────────
 * Segunda pasada (auditoría: scripts/auditar-poligonos.mjs): los territorios
 * de esta lista tenían gran parte de su relleno sobre el mar o estaban
 * desplazados de las zonas históricas. Se reconstruyen heredando costas
 * reales del atlas, igual que el resto de FIGURAS. */
const FIGURAS4 = {
  /* El polígono a mano cubría lat 18.2–19.4 (costa norte de Veracruz):
   * el corazón olmeca real es la llanura de Veracruz–Tabasco, entre el río
   * Papaloapan y el Grijalva: San Lorenzo, Tres Zapotes, Los Tuxtlas y
   * La Venta. Todos los vértices del recorte son puntos interiores (la
   * versión anterior tenía el borde norte mar adentro y la intersección
   * reducía el núcleo a una pestaña costera); el contorno del país ya
   * recorta el mar por sí solo. */
  'olmecas-t1': [
    P(['484'], {
      ventana: [-96.8, 16.9, -91.4, 19.2],
      recorte: [
        [-96.6, 18.55], [-96.2, 19.0], [-95.5, 19.0], [-94.9, 18.6],
        [-94.2, 18.5], [-93.6, 18.55], [-93.1, 18.6], [-92.5, 18.5],
        [-91.9, 18.2], [-91.7, 17.9], [-92.3, 17.6], [-93.1, 17.7],
        [-94.0, 17.9], [-94.8, 17.8], [-95.5, 17.9], [-96.1, 18.1],
        [-96.5, 18.3], [-96.6, 18.55],
      ],
    }),
  ],
  /* Reino ostrogodo de Italia: el cuadrado a mano bajaba hasta lat 38
   * (Túnez) y flotaba en el Mediterráneo. La península completa + Sicilia,
   * más la Dalmacia ostrogoda junto al Adriático. */
  'ostrogodos-x1': [
    P(['380'], { ventana: [6.6, 36.6, 19, 47.1] }),
    P(['191', '705'], { ventana: [13.5, 42.6, 19.7, 46.8] }),
  ],
  /* «Atlántico celta»: el rectángulo a mano cubría Irlanda y el Atlántico
   * abierto. Se traza la franja atlántica: Irlanda, Cornualles, Gales y la
   * Escocia occidental. */
  'celtas-t1': [
    P(['372']),
    P(['826'], {
      ventana: [-6.5, 49.5, 0.2, 59],
      recorte: [
        [-6.5, 49.5], [-4, 49.5], [-4, 53.5], [-3.2, 53.5],
        [-3.2, 57], [-6.5, 58.6], [-6.5, 49.5],
      ],
    }),
  ],
  /* «Galicia y Britania»: un solo hexágono englobaba el mar Cantábrico y el
   * canal de la Mancha. Se parte en dos huellas: la Gallaecia galaica y la
   * Armórica bretona. */
  'celtas-t2': [
    P(['724'], { ventana: [-9.9, 41.3, -6.2, 43.9] }),
    P(['250'], { ventana: [-5.2, 47.1, -0.5, 50.1] }),
  ],
  /* Costas sureñas que metían medio Pacífico. Ventanas que abrazan el
   * litoral peruano y quedan recortadas por el contorno real. */
  'nazca-x1': [P(['604'], { ventana: [-76.4, -16.4, -74.9, -13.6] })],
  'chimu-x1': [P(['604'], { ventana: [-81, -9.4, -77, -3.8] })],
  'moche-x1': [P(['604'], { ventana: [-80.2, -9.6, -77.6, -6.6] })],
  /* «Levante y Egipto» otomano: el polígono a mano unía El Cairo con Alepo
   * a través del mar. Se parte en Egipto (con Sinaí) y la franja levantina. */
  'ottomanos-t3': [
    P(['818'], { ventana: [24, 21.7, 37.5, 31.9] }),
    P(['760', '422', '376', '275'], { ventana: [33, 29.5, 36.8, 36.9] }),
  ],
  /* Jund de Siria abasí: cubría el rincón nordeste del Mediterráneo. */
  'abasies-cprovinciajunddesiria': [
    P(['760', '376', '275', '400', '422'], { ventana: [34.4, 29.2, 39.5, 35.9] }),
  ],
  /* Las Antillas taínas: el polígono a mano tendía un telón sobre el mar
   * Caribe; se traza isla por isla (Cuba, Española, Jamaica, Puerto Rico,
   * Bahamas). */
  'taino-t1': [P(['192', '332', '214', '388', '630', '044'])],
  /* Creta minoica: el contorno a mano empujaba la isla al Egeo. */
  'minoicos-t1': [P(['300'], { ventana: [23.4, 34.8, 26.6, 35.8] })],
  /* Costa fenicia: la franja a mano flotaba fuera del litoral. */
  'fenicios-t1': [P(['422', '760'], { ventana: [34.9, 32.6, 36.3, 34.4] })],
  /* Mapuche: el borde oeste llegaba al Pacífico abierto. */
  'mapuche-x1': [P(['152'], { ventana: [-73.9, -42.5, -70.6, -33.8] })],
  /* Tairona: un cuadrado de 0,9° sobre la Sierra Nevada de Santa Marta,
   * con su esquina en el mar. */
  'tairona-t1': [P(['170'], { ventana: [-74.8, 10.3, -73, 12] })],
  /* Etruria: la mitad occidental de la caja era mar Tirreno. */
  'etruscos-t1': [P(['380'], { ventana: [9.6, 42, 12.9, 44.3] })],
  /* Aksum: la caja cruzaba el mar Rojo; se queda en Etiopía + Eritrea. */
  'aksum-t1': [P(['231', '232'], { ventana: [36.6, 12.4, 41, 17.8] })],
  /* Khoikhoi y san: la columna a mano rozaba el cabo y el mar del Oeste. */
  'khoi-t1': [P(['710', '528'], { ventana: [14, -35.2, 21.5, -22.5] })],
  'san-t1': [P(['710', '072', '516', '528'], { ventana: [17.5, -29.5, 27, -18.5] })],
};

Object.assign(FIGURAS, FIGURAS4);

/* ────────────────────── Tanda 5: auditoría desfasada del 15 % ──────────────
 * La máscara del auditor se pintaba país por país (las fronteras compartidas
 * de topojson duplicaban los cruces); con el medidor fiable, estos son los
 * rellenos que de verdad flotaban en el mar. */
const FIGURAS5 = {
  /* Lacio abasí... romano: el hexágono a mano quedó hundido en el Tirreno
   * (su franja sur, lat 41.0–41.5, era mar). La ventana abraza el Lacio
   * histórico: Roma, el Vaticano, el Albanum, Sabina y el sisto de Frosinone. */
  'roma-lacio': [P(['380'], { ventana: [11.95, 41.3, 13.35, 42.35] })],
  /* Tiro: el blob de la ciudad costera flotaba a medio lado del litoral. */
  'fenicios-t2': [P(['422'], { ventana: [34.9, 33.0, 35.6, 33.7] })],
  /* Biblos (Jbeil): idem, franja litoral sur. */
  'fenicios-t4': [P(['422'], { ventana: [35.3, 33.95, 36.05, 34.5] })],
  /* Arwad: isla frente a Tarto; ventana apretada sobre el estrecho. */
  'fenicios-t5': [P(['760'], { ventana: [35.45, 34.55, 36.25, 35.3] })],
  /* Pilos: ciudad micénica del suroeste del Peloponeso, en la costa. */
  'micenicos-t3': [P(['300'], { ventana: [21.2, 36.65, 22.15, 37.35] })],
  /* Peloponeso micénico: el anillo engullía el golfo de Corinto. */
  'micenicos-t1': [P(['300'], { ventana: [20.6, 36.35, 23.65, 38.25] })],
  /* Yavné filisteo: blob en la costa sur de Canaán. */
  'filisteos-t4': [P(['376'], { ventana: [34.45, 31.55, 35.15, 32.15] })],
  /* Cnoso: segundas islas de la Creta minoica (la t1 ya estaba recortada). */
  'minoicos-t2': [P(['300'], { ventana: [24.6, 35.05, 26.35, 35.45] })],
  /* Dahomey fon: la caja se derramaba sobre el golfo de Benín. */
  'fon-t1': [P(['204'], { ventana: [1.6, 6.1, 3.75, 10.8] })],
  /* Yorubalandia: rectángulo a mano (lat 4..10) con media franja litoral en el
   * golfo. Ventana al sur de Benin y suroeste de Nigeria (Oyo al norte). */
  'yoruba-t1': [
    P(['566', '204'], { ventana: [2.3, 6.2, 6.7, 10.6] }),
  ],
};

Object.assign(FIGURAS, FIGURAS5);

/* ───────────────────── Núcleos polidades que faltaban ─────────────────────
 * roma, achaemenidas, umeyas y abasies sólo tenían divisiones (provincias y
 * satrapías): en su mapa inicial se veía el imperio entero ya repartido.
 * Se añade un núcleo polidad pequeño en su origen; las divisiones siguen
 * apareciendo con su propia fecha `desde`, así el crecimiento se ve a lo
 * largo del tiempo. */
const NUCLEOS = [
  [
    { id: 'roma-lacio', civilizacion: 'roma', tipo: 'tierra', nombre: 'Lacio',
      ancla: [12.4, 41.7], desde: -753, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [11.9, 41.95], [12.3, 41.98], [12.55, 41.55], [12.5, 41.15],
          [12.15, 41], [11.85, 41.2], [11.7, 41.6], [11.9, 41.95],
        ],
      ] },
    { id: 'roma-lacio', civilizacion: 'roma', tipo: 'tierra', nombre: 'Latium',
      ancla: [12.4, 41.7], desde: -753, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [11.9, 41.95], [12.3, 41.98], [12.55, 41.55], [12.5, 41.15],
          [12.15, 41], [11.85, 41.2], [11.7, 41.6], [11.9, 41.95],
        ],
      ] },
  ],
  [
    { id: 'achaemenidas-fars', civilizacion: 'achaemenidas', tipo: 'tierra', nombre: 'Fars',
      ancla: [54.3, 28.9], desde: -550, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [52.3, 30.9], [53.6, 30.6], [54.9, 29.6], [56.1, 28.6],
          [56.4, 27.6], [55.2, 27.2], [54.1, 27.6], [53, 28.4], [52.3, 29.4],
          [52.3, 30.9],
        ],
      ] },
    { id: 'achaemenidas-fars', civilizacion: 'achaemenidas', tipo: 'tierra', nombre: 'Fars',
      ancla: [54.3, 28.9], desde: -550, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [52.3, 30.9], [53.6, 30.6], [54.9, 29.6], [56.1, 28.6],
          [56.4, 27.6], [55.2, 27.2], [54.1, 27.6], [53, 28.4], [52.3, 29.4],
          [52.3, 30.9],
        ],
      ] },
  ],
  [
    { id: 'umeyas-damasco', civilizacion: 'umeyas', tipo: 'tierra', nombre: 'Damasco',
      ancla: [36.6, 33.4], desde: 661, hasta: null, nivel: 'polidad',
      anillos: [
        [[36.3, 34], [37.1, 34.2], [37.7, 33.5], [37.2, 33], [36.5, 32.5], [35.8, 32.7], [36.3, 34]],
      ] },
    { id: 'umeyas-damasco', civilizacion: 'umeyas', tipo: 'tierra', nombre: 'Damascus',
      ancla: [36.6, 33.4], desde: 661, hasta: null, nivel: 'polidad',
      anillos: [
        [[36.3, 34], [37.1, 34.2], [37.7, 33.5], [37.2, 33], [36.5, 32.5], [35.8, 32.7], [36.3, 34]],
      ] },
  ],
  [
    { id: 'abasies-irak', civilizacion: 'abasies', tipo: 'tierra', nombre: 'Irak',
      ancla: [44.4, 33.9], desde: 750, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [42.6, 33.3], [43.7, 33], [45.4, 32.9], [46.3, 33.6],
          [46.1, 34.7], [45, 34.9], [43.4, 34.4], [42.7, 34], [42.6, 33.3],
        ],
      ] },
    { id: 'abasies-irak', civilizacion: 'abasies', tipo: 'tierra', nombre: 'Iraq',
      ancla: [44.4, 33.9], desde: 750, hasta: null, nivel: 'polidad',
      anillos: [
        [
          [42.6, 33.3], [43.7, 33], [45.4, 32.9], [46.3, 33.6],
          [46.1, 34.7], [45, 34.9], [43.4, 34.4], [42.7, 34], [42.6, 33.3],
        ],
      ] },
  ],
];

/* ─────────────────── Aplicación ─────────────────── */

const leer = (n) => JSON.parse(fs.readFileSync(path.join(dirDatos, n), 'utf8'));
const escribir = (n, v) =>
  fs.writeFileSync(path.join(dirDatos, n), JSON.stringify(v, null, 2) + '\n');

const es = leer('territorios.json');
const en = leer(path.join('en', 'territorios.json'));

/* Núcleos polidades: se insertan si aún no existen (es y en a la vez). */
for (const [nuevoEs, nuevoEn] of NUCLEOS) {
  if (!es.some((t) => t.id === nuevoEs.id)) {
    es.push(nuevoEs);
    console.log(`+ núcleo polidad ${nuevoEs.id} (es)`);
  }
  if (!en.some((t) => t.id === nuevoEn.id)) {
    en.push(nuevoEn);
    console.log(`+ núcleo polidad ${nuevoEn.id} (en)`);
  }
}

/* La «Provincia: Italia» romana no existía como provincia el año de la
 * fundación: la península quedó sometida al fin de las guerras samnitas
 * (−271); antes de eso sólo se ve el núcleo del Lacio. */
for (const t of es) if (t.id === 'roma-pitalia' && t.desde === -753) t.desde = -271;
for (const t of en) if (t.id === 'roma-pitalia' && t.desde === -753) t.desde = -271;

for (const [id, partes] of Object.entries(FIGURAS)) {
  let anillos = partes.flatMap((parte) => construir(parte));
  const t = es.find((x) => x.id === id);
  if (!t) {
    console.warn(`  ! no existe el territorio ${id}`);
    continue;
  }
  if (!anillos.length) {
    console.warn(`  ! ${id}: la máscara quedó vacía`);
    continue;
  }
  /* Las partes de un mismo territorio pueden tocarse en una frontera y
   * producir anillos que se cruzan. Se rasterizan juntas para obtener la
   * unión limpia, sin que un anillo perfore a otro. */
  for (let i = 0; i < anillos.length; i++) {
    let cruce = false;
    for (let j = i + 1; j < anillos.length && !cruce; j++) {
      if (anillosSeCruzan(anillos[i], anillos[j])) cruce = true;
    }
    if (cruce) {
      anillos = unirAnillos(anillos);
      break;
    }
  }
  const antes = t.anillos.length;
  t.anillos = anillos;
  const tn = en.find((x) => x.id === id);
  if (tn) tn.anillos = anillos;
  const puntos = anillos.reduce((s, a) => s + a.length, 0);

  /* El ancla es el punto donde se rotula el territorio: si la geografía real
   * deja fuera el punto a mano (la frontera real no coincide con la del
   * atlas moderno), se recoloca en el centro del polígono. */
  let nuevoAncla = t.ancla;
  if (nuevoAncla && !anillos.some((a) => dentroDe(nuevoAncla, a))) {
    const mayor = anillos.slice().sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)))[0];
    const centro = centroDe(mayor);
    nuevoAncla = dentroDe(centro, mayor)
      ? centro
      : mayor.reduce((m, p) =>
          Math.hypot(p[0] - t.ancla[0], p[1] - t.ancla[1]) <
          Math.hypot(m[0] - t.ancla[0], m[1] - t.ancla[1])
            ? p
            : m,
        mayor[0]);
    t.ancla = nuevoAncla;
    if (tn) tn.ancla = nuevoAncla;
  }
  console.log(
    `${id}: ${antes} → ${anillos.length} anillo(s), ${puntos} puntos${t.ancla === nuevoAncla ? '' : ' · ancla recolocada'}`,
  );
}

if (!simular) {
  escribir('territorios.json', es);
  escribir(path.join('en', 'territorios.json'), en);
}
