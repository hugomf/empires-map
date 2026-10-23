import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import type { Civilizacion } from '../data/tipos-cultura';
import type { Catalogo } from '../data/catalogo';
import { construirMapa } from '../lib/geo';
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
}: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const capaRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const [tam, setTam] = useState({ w: 960, h: 560 });
  const [, setTransform] = useState<ZoomTransform>(zoomIdentity);

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

  const geo = useMemo(() => construirMapa(tam.w, tam.h, datos), [tam.w, tam.h, datos]);

  /* Zoom con d3 sobre el <svg>, aplicado a la capa principal. */
  useEffect(() => {
    const svg = svgRef.current;
    const capa = capaRef.current;
    if (!svg || !capa) return;
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
  }, [tam.w, tam.h]);

  const reiniciarZoom = useCallback(() => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    select(svg).transition().duration(420).call(z.transform, zoomIdentity);
  }, []);

  const acercar = useCallback((factor: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    select(svg).transition().duration(260).call(z.scaleBy, factor);
  }, []);

  /* Cajas ocupadas por los rótulos grandes: los pequeños las esquivan. */
  const cajasRotulos = useRef<Caja[]>([]);

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const rotulos = useMemo(() => {
    const items: Omit<Rotulo, 'dx' | 'dy' | 'anchor'>[] = [];
    for (const r of geo.regiones) {
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
        if (tt.desde !== null && anio < tt.desde) return false;
        if (tt.hasta !== null && anio > tt.hasta) return false;
        const civ = civVivas.get(tt.civ);
        if (!civ) return false;
        if (!capaVisible(tt.civ)) return false;
        return pasaFiltros(civ, filtros, datos.regiones);
      })
      .sort((a, b) => (civVivas.get(a.civ)?.peso ?? 0) - (civVivas.get(b.civ)?.peso ?? 0));
  }, [geo, anio, civVivas, filtros, datos.regiones, capaVisible]);

  /** Ciudades de las civilizaciones vivas, agrupadas por Dueño. */
  const ciudades = useMemo(() => {
    const m = new Map<string, { id: string; nombre: string; x: number; y: number }[]>();
    for (const c of geo.ciudades) {
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
      .filter((tt) => tt.nombre)
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
    <div className="mapa" ref={contRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${tam.w} ${tam.h}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          if (e.target === svgRef.current) onSeleccionar(null);
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
        </defs>

        <rect width={tam.w} height={tam.h} fill="url(#foco)" pointerEvents="none" />

        <g ref={capaRef}>
          <path className="geo-graticula" d={geo.graticula} />
          <path className="geo-halo" d={geo.tierra} />
          <path className="geo-tierra" d={geo.tierra} fill="url(#pergamino-tierra)" />
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

      <div className="mapa-zoom">
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
