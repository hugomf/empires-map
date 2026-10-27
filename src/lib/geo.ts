import {
  geoBounds,
  geoCentroid,
  geoDistance,
  geoGraticule10,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import { feature, merge } from 'topojson-client';
import rawTopo from 'world-atlas/countries-50m.json?raw';
import type { Catalogo } from '../data/catalogo';
import { ISO_NUMERIC } from '../data/iso-numeric';

type Geo = any;

const TOPO = JSON.parse(rawTopo) as Geo;
const GEOMETRIAS: Geo[] = TOPO.objects.countries.geometries;

/* La Antártida no aporta a la lectura histórica y comprime el encuadre del
   hemisferio habitado, así que queda fuera del continente y del ajuste. */
const HABITADO = GEOMETRIAS.filter((g) => g.properties?.name !== 'Antarctica');

let paisPorNombre: Map<string, Geo> | null = null;

function indice(): Map<string, Geo> {
  if (!paisPorNombre) {
    paisPorNombre = new Map();
    for (const g of GEOMETRIAS) {
      const nombre = g.properties?.name;
      if (nombre) paisPorNombre.set(nombre, g);
    }
  }
  return paisPorNombre;
}

/** Continente habitado como una sola geometría (silueta de fondo). */
export function tierra(): Geo {
  return merge(TOPO, HABITADO);
}

/** Cómo se dibuja el mapa: plano (Natural Earth) o globo (ortográfica). */
export type VistaMapa = 'plano' | 'globo';

export interface OpcionesMapa {
  vista?: VistaMapa;
  /** Rotación [λ, φ] del globo en grados, convención de d3-geo. */
  rotacion?: [number, number];
  /** Ampliación del globo: 1 encaja el disco en el contenedor. */
  zoom?: number;
}

export interface RegionGeo {
  id: string;
  /** `d` del path SVG con la unión de los países de la región. */
  d: string;
  /** Ancla proyectada de la etiqueta. */
  ancla: [number, number];
  paises: string[];
  /** ¿Su ancla cae en la cara visible del globo? */
  visible: boolean;
}

export interface TerritorioGeo {
  id: string;
  civ: string;
  nivel: 'polidad' | 'division';
  tipo: 'tierra' | 'ciudad';
  nombre: string | null;
  d: string;
  ancla: [number, number];
  desde: number | null;
  hasta: number | null;
  /** Regiones del mapa que este territorio ocupa. */
  reclama: string[];
  /** Superficie aproximada en grados cuadrados: ordena los rótulos. */
  area: number;
  /** ¿Su ancla cae en la cara visible del globo? */
  visible: boolean;
}

export interface PaisGeo {
  id: string;
  nombre: string;
  formacion: number;
  aproximada?: boolean;
  d: string;
  ancla: [number, number];
  visible: boolean;
}

export interface MapaGeo {
  vista: VistaMapa;
  /** Disco del globo en píxeles; `null` en la vista plana. */
  esfera: { cx: number; cy: number; r: number } | null;
  /** Centro geográfico visible [lon, lat]. */
  centro: [number, number];
  tierra: string;
  graticula: string;
  fronteras: string[];
  regiones: RegionGeo[];
  territorios: TerritorioGeo[];
  paises: PaisGeo[];
  cajas: Map<string, [number, number, number, number]>;
  rosa: [number, number];
  cartela: [number, number];
  ciudades: CiudadGeo[];
}

export interface CiudadGeo {
  id: string;
  civ: string;
  nombre: string;
  x: number;
  y: number;
  visible: boolean;
}

type Caja = [number, number, number, number];

/** Centro y radio angular de una geometría, para descartar la cara oculta. */
interface Envolvente {
  centro: [number, number];
  radio: number;
}

const cajaDe = (anillos: [number, number][][]): Caja => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const anillo of anillos)
    for (const [lon, lat] of anillo) {
      if (lon < x0) x0 = lon;
      if (lon > x1) x1 = lon;
      if (lat < y0) y0 = lat;
      if (lat > y1) y1 = lat;
    }
  return [x0, y0, x1, y1];
};

const puntoEnCaja = (p: [number, number], c: Caja) =>
  p[0] >= c[0] && p[0] <= c[2] && p[1] >= c[1] && p[1] <= c[3];

const centroDe = (anillos: [number, number][][]): [number, number] => {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const anillo of anillos)
    for (const [lon, lat] of anillo) {
      sx += lon;
      sy += lat;
      n++;
    }
  return n ? [sx / n, sy / n] : [0, 0];
};

/**
 * d3-geo espera los anillos exteriores en sentido horario. Los polígonos
 * vienen de fuentes distintas, así que se normaliza la orientación: sin esto
 * d3 puede rellenar el complemento del polígono (el resto del planeta).
 */
function normalizarAnillo(anillo: [number, number][]): [number, number][] {
  const r = anillo.slice();
  if (r.length && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])) {
    r.push(r[0]);
  }
  let area = 0;
  for (let i = 0; i < r.length - 1; i++) {
    area += (r[i + 1][0] - r[i][0]) * (r[i + 1][1] + r[i][1]);
  }
  if (area < 0) r.reverse();
  return r;
}

/** Área de un anillo en grados cuadrados (valor absoluto). */
const areaAnillo = (anillo: [number, number][]): number => {
  let s = 0;
  for (let i = 0; i < anillo.length - 1; i++) {
    s += anillo[i][0] * anillo[i + 1][1] - anillo[i + 1][0] * anillo[i][1];
  }
  return s / 2;
};

/** Polígono TopoJSON → GeoJSON, para que d3-geo pueda proyectarlo. */
const aGeoJson = (anillos: [number, number][][]) => ({
  /* MultiPolygon y no Polygon: cada anillo es una parte suelta del territorio
   * (islas y otras parcelas). Un Polygon trazaba el segundo anillo como
   * agujero y desaparecían partes como Irlanda o el Sinaí. */
  type: 'MultiPolygon',
  coordinates: anillos.map((a) => [normalizarAnillo(a)]),
});

/* ------------------------------------------------------------------ *
 * Cara visible del globo
 * ------------------------------------------------------------------ */

/** Centro geográfico que queda mirando a cámara para una rotación dada. */
export function centroDeRotacion(rotacion: [number, number]): [number, number] {
  return [-rotacion[0], -rotacion[1]];
}

/**
 * ¿Cae este punto en la cara visible del globo? `radioAngular` ensancha el
 * hemisferio para no descartar geometrías que asoman por el horizonte.
 */
export function visibleEnGlobo(
  lon: number,
  lat: number,
  rotacion: [number, number],
  radioAngular = 0,
): boolean {
  return geoDistance([lon, lat], centroDeRotacion(rotacion)) <= Math.PI / 2 + radioAngular;
}

/**
 * Envolvente esférica de una geometría: su centro y el radio angular que la
 * contiene. Permite descartar de golpe lo que está en la cara oculta sin
 * recorrer todos sus vértices en cada fotograma.
 */
function envolvente(geo: Geo): Envolvente {
  const centro = geoCentroid(geo) as [number, number];
  let radio = 0;
  const recorrer = (coords: any) => {
    if (!coords) return;
    if (typeof coords[0] === 'number') {
      const d = geoDistance(coords as [number, number], centro);
      if (d > radio) radio = d;
      return;
    }
    for (const c of coords) recorrer(c);
  };
  recorrer(geo.coordinates);
  return { centro, radio: Number.isFinite(radio) ? radio : 0 };
}

const visible = (e: Envolvente, rotacion: [number, number], globo: boolean) =>
  !globo || geoDistance(e.centro, centroDeRotacion(rotacion)) <= Math.PI / 2 + e.radio;

/* ------------------------------------------------------------------ *
 * Atlas: geometría independiente de la proyección (se calcula una vez)
 * ------------------------------------------------------------------ */

interface RegionAtlas {
  id: string;
  geo: Geo;
  ancla: [number, number];
  paises: string[];
  env: Envolvente;
}

interface TerritorioAtlas {
  id: string;
  civ: string;
  nivel: 'polidad' | 'division';
  tipo: 'tierra' | 'ciudad';
  nombre: string | null;
  geo: Geo;
  ancla: [number, number];
  desde: number | null;
  hasta: number | null;
  reclama: string[];
  area: number;
  env: Envolvente;
}

interface PaisAtlas {
  id: string;
  nombre: string;
  formacion: number;
  aproximada?: boolean;
  geo: Geo;
  ancla: [number, number];
  env: Envolvente;
}

interface CiudadAtlas {
  id: string;
  civ: string;
  nombre: string;
  lon: number;
  lat: number;
}

interface Atlas {
  tierra: Geo;
  graticula: Geo;
  fronteras: { geo: Geo; env: Envolvente }[];
  regiones: RegionAtlas[];
  territorios: TerritorioAtlas[];
  paises: PaisAtlas[];
  ciudades: CiudadAtlas[];
  cajas: Map<string, Caja>;
}

/* `merge` y `feature` son lo caro del proceso: se hacen una sola vez por
   catálogo. La rotación del globo sólo vuelve a proyectar. */
const ATLAS = new WeakMap<Catalogo, Atlas>();

function construirAtlas(datos: Catalogo): Atlas {
  const cacheado = ATLAS.get(datos);
  if (cacheado) return cacheado;

  const idx = indice();
  const cajas = new Map<string, Caja>();
  const regiones: RegionAtlas[] = [];
  for (const r of datos.regiones) {
    const geoms: Geo[] = [];
    for (const p of r.paises) {
      const g = idx.get(p);
      if (g) geoms.push(g);
    }
    if (!geoms.length) continue;
    const united = merge(TOPO, geoms) as Geo;
    regiones.push({
      id: r.id,
      geo: united,
      ancla: r.ancla,
      paises: r.paises,
      env: envolvente(united),
    });
    const b = geoBounds(united as never);
    cajas.set(r.id, [b[0][0], b[0][1], b[1][0], b[1][1]]);
  }

  /* Territorios precisos: cada parte puede reclamar regiones del mapa. */
  const territorios: TerritorioAtlas[] = [];
  for (const t of datos.territorios) {
    const centro = centroDe(t.anillos);
    const cajaParte = cajaDe(t.anillos);
    const reclama: string[] = [];
    for (const r of datos.regiones) {
      const cajaR = cajas.get(r.id);
      if (!cajaR) continue;
      if (puntoEnCaja(centro, cajaR) || puntoEnCaja(r.ancla, cajaParte)) reclama.push(r.id);
    }
    const geo = aGeoJson(t.anillos);
    territorios.push({
      id: t.id,
      civ: t.civilizacion,
      nivel: (t.nivel as 'polidad' | 'division') ?? 'polidad',
      tipo: t.tipo,
      nombre: t.nombre,
      geo,
      ancla: t.ancla ?? centro,
      desde: t.desde,
      hasta: t.hasta,
      reclama,
      area: t.anillos.reduce((s, a) => s + Math.abs(areaAnillo(a)), 0),
      env: envolvente(geo),
    });
  }

  /* Países actuales: cada geometría del atlas se cruza con el catálogo por
   * su código ISO numérico. Sólo se dibujan los que tienen registro. */
  const paisesPorId = new Map(datos.paisesActuales.map((p) => [p.id, p]));
  const paises: PaisAtlas[] = [];
  const vistos = new Set<string>();
  for (const g of HABITADO) {
    if (!g.id) continue;
    const alpha2 = ISO_NUMERIC[g.id];
    if (!alpha2 || vistos.has(alpha2)) continue;
    const pais = paisesPorId.get(alpha2);
    if (!pais) continue;
    vistos.add(alpha2);
    const f: any = feature(TOPO, g);
    if (!f.geometry) continue;
    paises.push({
      id: pais.id,
      nombre: pais.nombre,
      formacion: pais.formacion,
      aproximada: pais.aproximada,
      geo: f.geometry,
      ancla: geoCentroid(f.geometry) as [number, number],
      env: envolvente(f.geometry),
    });
  }

  const atlas: Atlas = {
    tierra: tierra(),
    graticula: geoGraticule10(),
    fronteras: HABITADO.map((g) => {
      const geo = feature(TOPO, g).geometry;
      return { geo, env: envolvente(geo) };
    }),
    regiones,
    territorios,
    paises,
    ciudades: datos.ciudades
      .filter((c) => c.principal !== false)
      .map((c) => ({ id: c.id, civ: c.civilizacion, nombre: c.nombre, lon: c.lon, lat: c.lat })),
    cajas,
  };
  ATLAS.set(datos, atlas);
  return atlas;
}

/* ------------------------------------------------------------------ *
 * Proyección
 * ------------------------------------------------------------------ */

const MARGEN = 8;

function crearProyeccion(
  ancho: number,
  alto: number,
  atlas: Atlas,
  vista: VistaMapa,
  rotacion: [number, number],
  zoom: number,
) {
  if (vista === 'globo') {
    /* Escala fija: si se usara `fitExtent` el globo cambiaría de tamaño al
       girar, porque el encaje depende de la silueta visible. */
    const r = (Math.min(ancho, alto) / 2 - MARGEN) * zoom;
    return geoOrthographic()
      .rotate(rotacion)
      .translate([ancho / 2, alto / 2])
      .scale(r);
  }
  return geoNaturalEarth1().fitExtent(
    [
      [MARGEN, MARGEN],
      [ancho - MARGEN, alto - MARGEN],
    ],
    atlas.tierra as never,
  );
}

export function construirMapa(
  ancho: number,
  alto: number,
  datos: Catalogo,
  opciones: OpcionesMapa = {},
): MapaGeo {
  const vista = opciones.vista ?? 'plano';
  const rotacion = opciones.rotacion ?? [0, 0];
  const zoom = opciones.zoom ?? 1;
  const globo = vista === 'globo';

  const atlas = construirAtlas(datos);
  const proyeccion = crearProyeccion(ancho, alto, atlas, vista, rotacion, zoom);
  const ruta = geoPath(proyeccion);
  const proyectar = (p: [number, number]) => proyeccion(p) as [number, number];

  const regiones: RegionGeo[] = atlas.regiones.map((r) => ({
    id: r.id,
    d: visible(r.env, rotacion, globo) ? (ruta(r.geo as never) ?? '') : '',
    ancla: proyectar(r.ancla),
    paises: r.paises,
    visible: visibleEnGlobo(r.ancla[0], r.ancla[1], rotacion),
  }));

  const territorios: TerritorioGeo[] = atlas.territorios.map((t) => ({
    id: t.id,
    civ: t.civ,
    nivel: t.nivel,
    tipo: t.tipo,
    nombre: t.nombre,
    d: visible(t.env, rotacion, globo) ? (ruta(t.geo as never) ?? '') : '',
    ancla: proyectar(t.ancla),
    desde: t.desde,
    hasta: t.hasta,
    reclama: t.reclama,
    area: t.area,
    visible: visibleEnGlobo(t.ancla[0], t.ancla[1], rotacion),
  }));

  const paises: PaisGeo[] = atlas.paises.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    formacion: p.formacion,
    aproximada: p.aproximada,
    d: visible(p.env, rotacion, globo) ? (ruta(p.geo as never) ?? '') : '',
    ancla: proyectar(p.ancla),
    visible: visibleEnGlobo(p.ancla[0], p.ancla[1], rotacion),
  }));

  const radio = globo ? (Math.min(ancho, alto) / 2 - MARGEN) * zoom : 0;

  return {
    vista,
    esfera: globo ? { cx: ancho / 2, cy: alto / 2, r: radio } : null,
    centro: centroDeRotacion(rotacion),
    tierra: ruta(atlas.tierra as never) ?? '',
    graticula: ruta(atlas.graticula as never) ?? '',
    /* Las fronteras modernas son contexto: en el globo se descartan por
       pieza para no proyectar lo que no se ve. */
    fronteras: atlas.fronteras
      .filter((f) => !globo || visible(f.env, rotacion, globo))
      .map((f) => ruta(f.geo as never) ?? '')
      .filter(Boolean),
    regiones,
    territorios,
    paises,
    cajas: atlas.cajas,
    ciudades: atlas.ciudades.map((c) => {
      const [x, y] = proyectar([c.lon, c.lat]) ?? [0, 0];
      return {
        id: c.id,
        civ: c.civ,
        nombre: c.nombre,
        x,
        y,
        visible: visibleEnGlobo(c.lon, c.lat, rotacion),
      };
    }),
    /* Los adornos de la vista plana no tienen sentido sobre el globo: se
       colocan en esquinas fijas de la pantalla. */
    rosa: globo ? [52, alto - 52] : proyectar([-26, -26]),
    cartela: globo ? [ancho - 116, alto - 100] : proyectar([-146, -44]),
  };
}
