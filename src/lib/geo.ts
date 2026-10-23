import { geoBounds, geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import rawTopo from 'world-atlas/countries-50m.json?raw';
import type { Catalogo } from '../data/catalogo';

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

export interface RegionGeo {
  id: string;
  /** `d` del path SVG con la unión de los países de la región. */
  d: string;
  /** Ancla proyectada de la etiqueta. */
  ancla: [number, number];
  paises: string[];
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
}

export interface MapaGeo {
  tierra: string;
  graticula: string;
  fronteras: string[];
  regiones: RegionGeo[];
  territorios: TerritorioGeo[];
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
}

type Caja = [number, number, number, number];

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

export function construirMapa(ancho: number, alto: number, datos: Catalogo): MapaGeo {
  const margen = 8;
  const proyeccion = geoNaturalEarth1().fitExtent(
    [
      [margen, margen],
      [ancho - margen, alto - margen],
    ],
    tierra() as never,
  );

  const ruta = geoPath(proyeccion);
  const idx = indice();

  const regiones: RegionGeo[] = [];
  const cajas = new Map<string, [number, number, number, number]>();
  for (const r of datos.regiones) {
    const geoms: Geo[] = [];
    for (const p of r.paises) {
      const g = idx.get(p);
      if (g) geoms.push(g);
    }
    if (!geoms.length) continue;
    const united = merge(TOPO, geoms);
    regiones.push({
      id: r.id,
      d: ruta(united as never) ?? '',
      ancla: proyeccion(r.ancla) as [number, number],
      paises: r.paises,
    });
    const b = geoBounds(united as never);
    cajas.set(r.id, [b[0][0], b[0][1], b[1][0], b[1][1]]);
  }

  /* Territorios precisos: cada parte puede reclamar regiones del mapa. */
  const territorios: TerritorioGeo[] = [];
  for (const t of datos.territorios) {
    const centro = centroDe(t.anillos);
    const cajaParte = cajaDe(t.anillos);
    const reclama: string[] = [];
    for (const r of datos.regiones) {
      const cajaR = cajas.get(r.id);
      if (!cajaR) continue;
      if (puntoEnCaja(centro, cajaR) || puntoEnCaja(r.ancla, cajaParte)) reclama.push(r.id);
    }
    territorios.push({
      id: t.id,
      civ: t.civilizacion,
      nivel: (t.nivel as 'polidad' | 'division') ?? 'polidad',
      tipo: t.tipo,
      nombre: t.nombre,
      d: ruta(aGeoJson(t.anillos) as never) ?? '',
      ancla: proyeccion(t.ancla ?? centro) as [number, number],
      desde: t.desde,
      hasta: t.hasta,
      reclama,
      area: t.anillos.reduce((s, a) => s + Math.abs(areaAnillo(a)), 0),
    });
  }

  return {
    tierra: ruta(tierra() as never) ?? '',
    graticula: ruta(geoGraticule10() as never) ?? '',
    fronteras: HABITADO.map((g) => {
      const f: any = feature(TOPO, g);
      return ruta(f.geometry as never) ?? '';
    }).filter(Boolean),
    regiones,
    territorios,
    cajas,
    ciudades: datos.ciudades
      .filter((c) => c.principal !== false)
      .map((c) => {
        const [x, y] = proyeccion([c.lon, c.lat]) ?? [0, 0];
        return { id: c.id, civ: c.civilizacion, nombre: c.nombre, x, y };
      }),
    rosa: proyeccion([-26, -26]) as [number, number],
    cartela: proyeccion([-146, -44]) as [number, number],
  };
}
