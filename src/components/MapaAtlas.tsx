import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import type { Civilizacion } from '../data/tipos-cultura';
import type { Catalogo } from '../data/catalogo';
import { construirMapa, type VistaMapa } from '../lib/geo';
import { COLOR_FASE, fase, pasaFiltros, type Filtros } from '../lib/dominio';
import { coloresReligiosos, colorFamilia, ORDEN_FAMILIAS, vigenteEn } from '../lib/religion';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  anio: number;
  datos: Catalogo;
  civVivas: Map<string, Civilizacion>;
  filtros: Filtros;
  dominante: Map<string, Civilizacion>;
  seleccion: string | null;
  hover: string | null;
  onSeleccionar: (id: string | null) => void;
  onHover: (id: string | null) => void;
  t: T;
  fronterasModernas: boolean;
  /** ¿Debe dibujarse la capa de esta civilización? (panel de capas) */
  capaVisible: (id: string) => boolean;
  /** Color efectivo por civilización (identidad o fase). */
  modoColor: 'identidad' | 'fase';
  colores: Map<string, string>;
  /** Capa de tinte religioso. */
  capaReligiones: boolean;
  /** Capa de países actuales. */
  capaPaises: boolean;
  /** País actual resaltado (panel o mapa). */
  paisSeleccionado: string | null;
  onSeleccionarPais: (id: string | null) => void;
}

interface Rotulo {
  id: string;
  texto: string;
  cx: number;
  cy: number;
  mayor: boolean;
  dx: number;
  dy: number;
  anchor: 'start' | 'end' | 'middle';
}

interface Caja {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function solapan(a: Caja, b: Caja, margen = 2): boolean {
  return (
    a.x0 - margen < b.x1 && a.x1 + margen > b.x0 && a.y0 - margen < b.y1 && a.y1 + margen > b.y0
  );
}

/**
 * Reparte los rótulos del mapa: cada etiqueta busca hueco sin pisar a las
 * demás. Con `descartar`, las que no caben se omiten en vez de amontonarse.
 */
function colocarRotulos(
  items: Omit<Rotulo, 'dx' | 'dy' | 'anchor'>[],
  opciones: { descartar?: boolean; ocupadas?: Caja[] } = {},
): { rotulos: Rotulo[]; cajas: Caja[] } {
  const candidatos: { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }[] = [
    { dx: 13, dy: 3.2, anchor: 'start' },
    { dx: -13, dy: 3.2, anchor: 'end' },
    { dx: 0, dy: 14, anchor: 'middle' },
    { dx: 0, dy: -11, anchor: 'middle' },
    { dx: 13, dy: -10, anchor: 'start' },
    { dx: -13, dy: 15, anchor: 'end' },
    { dx: 0, dy: 25, anchor: 'middle' },
    { dx: 0, dy: -22, anchor: 'middle' },
  ];

  const colocadas: Caja[] = [...(opciones.ocupadas ?? [])];
  const salida: Rotulo[] = [];

  for (const it of [...items].sort((a, b) => a.cy - b.cy || a.cx - b.cx)) {
    const w = it.texto.length * (it.mayor ? 6.3 : 5.5);
    const h = it.mayor ? 11 : 9;
    let elegido = candidatos[0];
    let cajaElegida: Caja | null = null;

    for (const c of candidatos) {
      const x0 =
        c.anchor === 'start'
          ? it.cx + c.dx
          : c.anchor === 'end'
            ? it.cx + c.dx - w
            : it.cx + c.dx - w / 2;
      const caja: Caja = { x0, y0: it.cy + c.dy - h / 2, x1: x0 + w, y1: it.cy + c.dy + h / 2 };
      const choca = colocadas.some((k) => solapan(caja, k));
      const pisaElPunto =
        caja.x0 < it.cx + 5 && caja.x1 > it.cx - 5 && caja.y0 < it.cy + 6 && caja.y1 > it.cy - 6;
      if (!choca && !pisaElPunto) {
        elegido = c;
        cajaElegida = caja;
        break;
      }
    }

    if (!cajaElegida) {
      if (opciones.descartar) continue;
      const c = candidatos[0];
      const x0 = it.cx + c.dx;
      cajaElegida = { x0, y0: it.cy + c.dy - h / 2, x1: x0 + w, y1: it.cy + c.dy + h / 2 };
    }
    colocadas.push(cajaElegida);
    salida.push({ ...it, ...elegido });
  }
  return { rotulos: salida, cajas: colocadas };
}

/** Vista inicial del globo: Europa, África y el oeste de Asia. */
const ROTACION_INICIAL: [number, number] = [-10, -25];
const ZOOM_MIN = 1;
const ZOOM_MAX = 12;
/** Tope de latitud: más allá el globo se pone del revés. */
const LAT_MAX = 89;

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function MapaAtlas({
  anio,
  datos,
  civVivas,
  filtros,
  dominante,
  seleccion,
  hover,
  onSeleccionar,
  onHover,
  t,
  fronterasModernas,
  capaVisible,
  modoColor,
  colores,
  /** Capa de tinte religioso. */
  capaReligiones,
  capaPaises,
  paisSeleccionado,
  onSeleccionarPais,
}: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const capaRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const [tam, setTam] = useState({ w: 960, h: 560 });
  const [, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [paisHover, setPaisHover] = useState<string | null>(null);
  /** Vista plana (Natural Earth) o globo ortógrafico rotable. */
  const [vista, setVista] = useState<VistaMapa>('plano');
  const [rotacion, setRotacion] = useState<[number, number]>(ROTACION_INICIAL);
  const [zoomGlobo, setZoomGlobo] = useState(1);
  const [arrastrando, setArrastrando] = useState(false);
  const globo = vista === 'globo';

  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setTam({ w: Math.max(320, Math.round(r.width)), h: Math.max(220, Math.round(r.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(
    () => construirMapa(tam.w, tam.h, datos, { vista, rotacion, zoom: zoomGlobo }),
    [tam.w, tam.h, datos, vista, rotacion, zoomGlobo],
  );

  /* Zoom con d3 sobre el <svg>, aplicado a la capa principal. En el globo el
   * arrastre se reserva para girar la esfera, así que d3 sólo lleva la rueda
   * del ratón: el zoom de la esfera lo controla la escala de la proyección. */
  useEffect(() => {
    const svg = svgRef.current;
    const capa = capaRef.current;
    if (!svg || !capa) return;
    if (globo) {
      capa.removeAttribute('transform');
      return;
    }
    const z: any = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([
        [0, 0],
        [tam.w, tam.h],
      ])
      .on('zoom', (ev: any) => {
        setTransform(ev.transform);
        capa.setAttribute('transform', ev.transform.toString());
      });
    zoomRef.current = z;
    const sel = select(svg);
    sel.call(z);
    sel.on('dblclick.zoom', null);
    return () => {
      sel.on('.zoom', null);
    };
  }, [tam.w, tam.h, globo]);

  const reiniciarZoom = useCallback(() => {
    if (globo) {
      setRotacion(ROTACION_INICIAL);
      setZoomGlobo(1);
      return;
    }
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    select(svg).transition().duration(420).call(z.transform, zoomIdentity);
  }, [globo]);

  const acercar = useCallback(
    (factor: number) => {
      if (globo) {
        setZoomGlobo((z) => limitar(z * factor, ZOOM_MIN, ZOOM_MAX));
        return;
      }
      const svg = svgRef.current;
      const z = zoomRef.current;
      if (!svg || !z) return;
      select(svg).transition().duration(260).call(z.scaleBy, factor);
    },
    [globo],
  );

  /* --- Girar el globo con el puntero ---------------------------------- */

  const arrastre = useRef<{ x: number; y: number; rot: [number, number] } | null>(null);
  const rotPendiente = useRef<[number, number] | null>(null);
  const rafRot = useRef(0);
  const movido = useRef(false);

  /** Un solo recálculo por fotograma, aunque el ratón emita más eventos. */
  const programarRotacion = useCallback((r: [number, number]) => {
    rotPendiente.current = r;
    if (rafRot.current) return;
    rafRot.current = requestAnimationFrame(() => {
      rafRot.current = 0;
      if (rotPendiente.current) setRotacion(rotPendiente.current);
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRot.current) cancelAnimationFrame(rafRot.current);
    },
    [],
  );

  const empezarArrastre = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!globo || e.button !== 0) return;
    movido.current = false;
    arrastre.current = { x: e.clientX, y: e.clientY, rot: rotacion };
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastrando(true);
  };

  const moverArrastre = (e: React.PointerEvent<SVGSVGElement>) => {
    const a = arrastre.current;
    if (!a) return;
    /* Sensibilidad: un radián de giro por cada radio de la esfera recorrido. */
    const radio = Math.max(40, (Math.min(tam.w, tam.h) / 2 - 8) * zoomGlobo);
    const k = 180 / (Math.PI * radio);
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) movido.current = true;
    programarRotacion([
      a.rot[0] + dx * k,
      limitar(a.rot[1] - dy * k, -LAT_MAX, LAT_MAX),
    ]);
  };

  const terminarArrastre = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!arrastre.current) return;
    arrastre.current = null;
    setArrastrando(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  /* Rueda: acerca el globo sin desplazarlo (la esfera queda centrada). */
  useEffect(() => {
    const svg = svgRef.current;
    if (!globo || !svg) return;
    const alRodar = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      setZoomGlobo((z) => limitar(z * factor, ZOOM_MIN, ZOOM_MAX));
    };
    svg.addEventListener('wheel', alRodar, { passive: false });
    return () => svg.removeEventListener('wheel', alRodar);
  }, [globo]);

  /* Cajas ocupadas por los rótulos grandes: los pequeños las esquivan. */
  const cajasRotulos = useRef<Caja[]>([]);

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const rotulos = useMemo(() => {
    const items: Omit<Rotulo, 'dx' | 'dy' | 'anchor'>[] = [];
    for (const r of geo.regiones) {
      /* En el globo, la cara oculta no lleva rótulo. */
      if (!r.visible) continue;
      const dom = dominante.get(r.id);
      if (!dom) continue;
      if (!capaVisible(dom.id)) continue;
      const mayor = dom.peso >= 8;
      items.push({
        id: r.id,
        texto: mayor ? dom.nombre : dom.abrev,
        cx: r.ancla[0],
        cy: r.ancla[1],
        mayor,
      });
    }
    const colocado = colocarRotulos(items);
    cajasRotulos.current = colocado.cajas;
    return colocado.rotulos;
  }, [geo, dominante, capaVisible]);

  /**
   * Territorios precisos: polígonos fechados que sustituyen al relleno del
   * país moderno. Sólo se dibujan los que existían ese año.
   */
  const territorios = useMemo(() => {
    return geo.territorios
      .filter((tt) => {
        /* `d` vacío = descartado por caer en la cara oculta del globo. */
        if (!tt.d) return false;
        if (tt.desde !== null && anio < tt.desde) return false;
        if (tt.hasta !== null && anio > tt.hasta) return false;
        const civ = civVivas.get(tt.civ);
        if (!civ) return false;
        if (!capaVisible(tt.civ)) return false;
        return pasaFiltros(civ, filtros, datos.regiones);
      })
      .sort((a, b) => (civVivas.get(a.civ)?.peso ?? 0) - (civVivas.get(b.civ)?.peso ?? 0));
  }, [geo, anio, civVivas, filtros, datos.regiones, capaVisible]);

  /** Países actuales ya formados en el año seleccionado. */
  const paisesVisibles = useMemo(
    () => geo.paises.filter((p) => p.formacion <= anio && p.visible && p.d),
    [geo.paises, anio],
  );

  const paisDestacado = useMemo(() => {
    const id = paisSeleccionado ?? paisHover;
    return id ? paisesVisibles.find((p) => p.id === id) ?? null : null;
  }, [paisSeleccionado, paisHover, paisesVisibles]);

  /** Ciudades de las civilizaciones vivas, agrupadas por Dueño. */
  const ciudades = useMemo(() => {
    const m = new Map<string, { id: string; nombre: string; x: number; y: number }[]>();
    for (const c of geo.ciudades) {
      if (!c.visible) continue;
      const civ = civVivas.get(c.civ);
      if (!civ) continue;
      if (!capaVisible(c.civ)) continue;
      if (!pasaFiltros(civ, filtros, datos.regiones)) continue;
      const arr = m.get(c.civ);
      if (arr) arr.push({ id: c.id, nombre: c.nombre, x: c.x, y: c.y });
      else m.set(c.civ, [{ id: c.id, nombre: c.nombre, x: c.x, y: c.y }]);
    }
    return m;
  }, [geo, civVivas, filtros, datos.regiones, capaVisible]);

  /**
   * Rótulos de los territorios visibles. Al elegir una civilización con muchas
   * divisiones (el Imperio Romano tiene veinte) sólo se rotulan las más
   * grandes, y las que no caben sin taparse se omiten.
   */
  const rotulosTerr = useMemo(() => {
    const items: Omit<Rotulo, 'dx' | 'dy' | 'anchor'>[] = [];
    const candidatos = territorios
      .filter((tt) => tt.civ === seleccion || tt.civ === hover)
      .filter((tt) => tt.nombre && tt.visible)
      .sort((a, b) => b.area - a.area);
    for (const tt of candidatos.slice(0, hover ? 6 : 4)) {
      const texto = tt.nombre!.replace(/^(Provincia|Province): /, '').replace(/^(Satrapía|Satrapy): /, '');
      items.push({ id: tt.id, texto, cx: tt.ancla[0], cy: tt.ancla[1], mayor: false });
    }
    /* Los rótulos de territorio esquivan a los de región: son los grandes. */
    return colocarRotulos(items, { descartar: true, ocupadas: cajasRotulos.current }).rotulos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territorios, seleccion, hover, dominante]);

  const mostrarCiudades = (civId: string) => {
    const civ = civVivas.get(civId);
    if (!civ) return false;
    if (civId === seleccion || civId === hover) return true;
    if (seleccion || hover) return false;
    const dom = dominante.get(civ.region);
    return dom?.id === civId && dom.peso >= 8;
  };

  return (
    <div className={`mapa${globo ? ' vista-globo' : ''}${arrastrando ? ' arrastrando' : ''}`} ref={contRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${tam.w} ${tam.h}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={empezarArrastre}
        onPointerMove={moverArrastre}
        onPointerUp={terminarArrastre}
        onPointerCancel={terminarArrastre}
        onClick={(e) => {
          /* Un arrastre para girar el globo no debe deseleccionar. */
          if (movido.current) {
            movido.current = false;
            return;
          }
          if (e.target === svgRef.current) {
            onSeleccionar(null);
            onSeleccionarPais(null);
          }
        }}
      >
        <defs>
          <filter id="brillo" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="aura" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="costa" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <radialGradient id="foco" cx="50%" cy="46%" r="62%">
            <stop offset="0%" stopColor="#16202b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#070a0e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pergamino-tierra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b2531" />
            <stop offset="42%" stopColor="#243140" />
            <stop offset="100%" stopColor="#1a222d" />
          </linearGradient>
          {/* Luz rasante del globo: el degradado radial hace de sol. */}
          <radialGradient id="pergamino-globo" cx="36%" cy="30%" r="82%">
            <stop offset="0%" stopColor="#2b3b4c" />
            <stop offset="45%" stopColor="#22303e" />
            <stop offset="100%" stopColor="#121a23" />
          </radialGradient>
          <radialGradient id="oceano-globo" cx="36%" cy="30%" r="85%">
            <stop offset="0%" stopColor="#0e1822" />
            <stop offset="65%" stopColor="#080e15" />
            <stop offset="100%" stopColor="#04070a" />
          </radialGradient>
        </defs>

        <rect width={tam.w} height={tam.h} fill="url(#foco)" pointerEvents="none" />

        <g ref={capaRef}>
          {/* El globo: un disco de océano bajo la silueta de tierra. En la
           * vista plana no hay esfera y manda el fondo del atlas. */}
          {geo.esfera && (
            <g className="globo-esfera" pointerEvents="none" aria-hidden>
              <circle
                className="globo-oceano"
                cx={geo.esfera.cx}
                cy={geo.esfera.cy}
                r={geo.esfera.r}
              />
              <circle
                className="globo-aro"
                cx={geo.esfera.cx}
                cy={geo.esfera.cy}
                r={geo.esfera.r}
              />
            </g>
          )}
          <path className="geo-graticula" d={geo.graticula} />
          {/* El halo difuminado de la costa es caro de repintar al girar:
           * en el globo lo sustituye el aro de la esfera. */}
          {!geo.esfera && <path className="geo-halo" d={geo.tierra} />}
          <path
            className="geo-tierra"
            d={geo.tierra}
            fill={geo.esfera ? 'url(#pergamino-globo)' : 'url(#pergamino-tierra)'}
          />
          {/* Países actuales: sólo los formados hasta el año seleccionado.
           * Van bajo los territorios históricos para no tapar sus rellenos. */}
          {capaPaises && paisesVisibles.length > 0 && (
            <g className="geo-paises-modernos">
              {paisesVisibles.map((p) => {
                const sel = p.id === paisSeleccionado;
                const enc = p.id === paisHover;
                return (
                  <path
                    key={p.id}
                    className={`pais-moderno${territorios.length ? ' contorno' : ''}${sel ? ' sel' : ''}${enc ? ' hover' : ''}`}
                    d={p.d}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeleccionarPais(sel ? null : p.id);
                    }}
                    onMouseEnter={() => setPaisHover(p.id)}
                    onMouseLeave={() => setPaisHover(null)}
                  >
                    <title>
                      {p.nombre} · {p.formacion}
                      {p.aproximada ? ' aprox.' : ''}
                    </title>
                  </path>
                );
              })}
            </g>
          )}
          {/* Las fronteras de los países modernos son contexto optativo: un
           * atlas del año −50000 no puede llevarlas de fábrica. */}
          {fronterasModernas && (
            <g className="geo-fronteras">
              {geo.fronteras.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          )}

          {/* Contorno de las regiones modernas: sólo con el botón BORDERS.
           * «Reclamada» resaltaba regiones en todas las eras y eso pintaba
           * fronteras de países actuales hasta en el año −50000. */}
          {fronterasModernas &&
            geo.regiones.map((r) => (
              <path
                key={r.id}
                className="geo-region-fantasma modernas"
                d={r.d}
              />
            ))}

          {/* Rótulos de la potencia dominante de cada región */}
          {rotulos.map((r) => {
            const dom = dominante.get(r.id);
            return (
              <g key={r.id} className="geo-marca" style={{ color: dom ? (colores.get(dom.id) ?? dom.color) : undefined }}>
                <circle className="marca-halo" cx={r.cx} cy={r.cy} r={r.mayor ? 5.5 : 4} />
                <circle className="marca-nucleo" cx={r.cx} cy={r.cy} r={1.5} />
                <text
                  className={`marca-texto${r.mayor ? ' mayor' : ''}`}
                  x={r.cx + r.dx}
                  y={r.cy + r.dy}
                  textAnchor={r.anchor}
                >
                  {r.texto}
                </text>
              </g>
            );
          })}

{/* Territorios históricos */}
          {territorios.map((tt) => {
            const civ = civVivas.get(tt.civ)!;
            const sel = civ.id === seleccion;
            const enc = civ.id === hover;
            const f = fase(civ, anio);
            const decaido = f === 'decadencia' || f === 'muerte';
            const division = tt.nivel === 'division';
            const rotTerr = rotulosTerr.find((x) => x.id === tt.id);
            const religionesVivas = datos.religiones.filter((r) =>
              r.civilizacion === civ.id && vigenteEn(r, anio),
            );
            const colorTerritorio =
              capaReligiones && religionesVivas.length > 0
                ? coloresReligiosos([civ], religionesVivas, anio).get(civ.id) ?? civ.color
                : colores.get(civ.id) ?? civ.color;
            return (
              <g
                key={tt.id}
                className={`geo-territorio${division ? ' division' : ''}`}
                style={{ color: colorTerritorio }}
              >
                <path
                  className="terr-halo"
                  d={tt.d}
                  strokeWidth={sel ? 3.4 : division ? 1.2 : 2.2}
                  opacity={sel ? 0.5 : division ? 0.16 : 0.28}
                />
                <path
                  className="terr-cuerpo"
                  d={tt.d}
                  fillOpacity={
                    division
                      ? sel
                        ? 0.3
                        : 0.12
                      : sel
                        ? 0.38
                        : enc
                          ? 0.3
                          : 0.2
                }
                  strokeOpacity={sel || enc ? 1 : division ? 0.5 : 0.78}
                  strokeDasharray={decaido ? '5 3' : division ? '3 2' : undefined}
                  filter={sel ? 'url(#brillo)' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeleccionar(civ.id);
                  }}
                  onMouseEnter={() => onHover(civ.id)}
                  onMouseLeave={() => onHover(null)}
                />
                {(sel || enc) && tt.nombre && rotTerr && (
                  <text
                    className="marca-texto"
                    x={tt.ancla[0] + rotTerr.dx}
                    y={tt.ancla[1] + rotTerr.dy}
                    textAnchor={rotTerr.anchor}
                  >
                    {rotTerr.texto}
                  </text>
                )}
              </g>
            );
          })}

          {/* Ciudades de las civilizaciones vivas */}
          {[...ciudades.entries()].map(([civId, lista]) => {
            const civ = civVivas.get(civId)!;
            if (!mostrarCiudades(civId)) return null;
            const etiquetar = civId === seleccion || civId === hover;
            return (
              <g key={civId} className="geo-ciudades" style={{ color: civ.color }}>
                {lista.map((c) => (
                  <g key={c.id}>
                    <title>
                      {c.nombre} · {civ.nombre}
                    </title>
                    <circle className="ciudad-aura" cx={c.x} cy={c.y} r={5} />
                    <circle className="ciudad-punto" cx={c.x} cy={c.y} r={1.9} />
                    {etiquetar && (
                      <text className="marca-texto ciudad-texto" x={c.x + 5} y={c.y + 2.6}>
                        {c.nombre}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}

          {/* El país actual resaltado se repinta por encima de los territorios
           * históricos para que el contorno no quede oculto bajo su relleno. */}
          {capaPaises && paisDestacado && (
            <path className="pais-moderno-sel" d={paisDestacado.d} pointerEvents="none" />
          )}

          {/* Etiqueta del país actual resaltado, por encima de los territorios. */}
          {capaPaises && paisDestacado && (
            <g className="geo-pais-etiqueta" pointerEvents="none">
              <text
                className="marca-texto marca-pais"
                x={paisDestacado.ancla[0] + 6}
                y={paisDestacado.ancla[1] - 4}
              >
                {paisDestacado.nombre}
                {paisDestacado.aproximada ? ' · aprox.' : ''}
              </text>
            </g>
          )}

          {/* Rosa de los vientos */}
          <g
            className="rosa-vientos"
            transform={`translate(${geo.rosa[0]}, ${geo.rosa[1]})`}
            aria-hidden
          >
            <circle className="rosa-arco" r={26} />
            <circle className="rosa-arco" r={31} />
            <path className="rosa-punta" d="M0,-30 L5,-6 L0,-10 L-5,-6 Z" />
            <path className="rosa-punta tenue" d="M0,30 L5,6 L0,10 L-5,6 Z" />
            <path className="rosa-punta" d="M30,0 L6,5 L10,0 L6,-5 Z" />
            <path className="rosa-punta tenue" d="M-30,0 L-6,5 L-10,0 L-6,-5 Z" />
            <path className="rosa-punta tenue" d="M18,-18 L5,-4 L4,-8 L-4,-4 Z" />
            <path className="rosa-punta tenue" d="M-18,-18 L-5,-4 L-8,-4 L-4,5 Z" />
            <path className="rosa-punta tenue" d="M18,18 L5,4 L8,4 L4,-5 Z" />
            <path className="rosa-punta tenue" d="M-18,18 L-5,4 L-8,4 L-4,-5 Z" />
            <text className="rosa-letra" x={0} y={-34} textAnchor="middle">
              N
            </text>
            <text className="rosa-letra" x={36} y={3} textAnchor="middle">
              E
            </text>
            <text className="rosa-letra" x={0} y={41} textAnchor="middle">
              S
            </text>
            <text className="rosa-letra" x={-36} y={3} textAnchor="middle">
              {t('mapa.oeste')}
            </text>
          </g>

          {/* Cartela con la clave de lectura */}
          {tam.w >= 720 && (
            <g
              className="cartela"
              transform={`translate(${geo.cartela[0]}, ${geo.cartela[1]})`}
              aria-hidden
            >
              {capaReligiones ? (
                /* Tinte religioso: la cartela explica las familias del tinte,
                 * no los colores de identidad ni de fase, porque el relleno del
                 * mapa ya no es el de la civilización. */
                <>
                  <rect className="cartela-marco" x={-96} y={-52} width={192} height={158} rx={2} />
                  <rect
                    className="cartela-marco interior"
                    x={-92}
                    y={-48}
                    width={184}
                    height={150}
                    rx={1}
                  />
                  <text className="cartela-titulo" x={-84} y={-33}>
                    {t('mapa.religiones').toUpperCase()}
                  </text>
                  {ORDEN_FAMILIAS.map((familia, i) => (
                    <g key={familia}>
                      <rect
                        className="cartela-muestra"
                        x={-84}
                        y={-24 + i * 14}
                        width={16}
                        height={7}
                        fill={colorFamilia(familia)}
                      />
                      <text className="cartela-texto" x={-61} y={-18 + i * 14}>
                        {t(`religion.familia.${familia}`)}
                      </text>
                    </g>
                  ))}
                </>
              ) : modoColor === 'fase' ? (
                <>
                  <rect className="cartela-marco" x={-96} y={-52} width={192} height={104} rx={2} />
                  <rect
                    className="cartela-marco interior"
                    x={-92}
                    y={-48}
                    width={184}
                    height={96}
                    rx={1}
                  />
                  <text className="cartela-titulo" x={-84} y={-33}>
                    {t('mapa.leyenda').toUpperCase()}
                  </text>
                  {(['nacimiento', 'auge', 'dominio', 'decadencia', 'muerte'] as const).map(
                    (f, i) => (
                      <g key={f}>
                        <rect
                          className="cartela-muestra"
                          x={-84}
                          y={-24 + i * 14}
                          width={16}
                          height={7}
                          fill={COLOR_FASE[f]}
                        />
                        <text className="cartela-texto" x={-61} y={-18 + i * 14}>
                          {t(`fase.${f}`)}
                        </text>
                      </g>
                    ),
                  )}
                </>
              ) : (
                <>
                  <rect className="cartela-marco" x={-96} y={-40} width={192} height={80} rx={2} />
                  <rect
                    className="cartela-marco interior"
                    x={-92}
                    y={-36}
                    width={184}
                    height={72}
                    rx={1}
                  />
                  <text className="cartela-titulo" x={-84} y={-21}>
                    {t('mapa.leyenda').toUpperCase()}
                  </text>
                  <rect className="cartela-muestra" x={-84} y={-11} width={16} height={7} />
                  <text className="cartela-texto" x={-61} y={-5}>
                    {t('mapa.territorio')}
                  </text>
                  <circle className="cartela-aura" cx={-76} cy={12} r={7} />
                  <text className="cartela-texto" x={-61} y={15}>
                    {t('mapa.pueblo')}
                  </text>
                  <rect className="cartela-muestra discontinuo" x={-84} y={26} width={16} height={7} />
                  <text className="cartela-texto" x={-61} y={32}>
                    {t('mapa.decadencia')}
                  </text>
                </>
              )}
            </g>
          )}
        </g>
      </svg>

      {capaPaises && (
        <div className="mapa-leyenda-paises" aria-hidden>
          <span className="muestra" />
          {t('mapa.paises')}
        </div>
      )}

      <div className="mapa-zoom">
        <button
          className="boton icono"
          onClick={() => setVista((v) => (v === 'globo' ? 'plano' : 'globo'))}
          title={globo ? t('mapa.vistaPlano') : t('mapa.vistaGlobo')}
          aria-pressed={globo}
          aria-label={globo ? t('mapa.vistaPlano') : t('mapa.vistaGlobo')}
        >
          {globo ? '▱' : '◍'}
        </button>
        <button className="boton icono" onClick={() => acercar(1.6)} title={t('mapa.zoomIn')}>
          +
        </button>
        <button className="boton icono" onClick={() => acercar(1 / 1.6)} title={t('mapa.zoomOut')}>
          −
        </button>
        <button className="boton icono" onClick={reiniciarZoom} title={t('mapa.zoomReset')}>
          ⤢
        </button>
      </div>
    </div>
  );
}
