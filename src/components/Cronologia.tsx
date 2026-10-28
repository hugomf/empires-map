import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Civilizacion, Region } from '../data/tipos-cultura';
import { ANIO_MAX, ANIO_MIN } from '../data/datos.generados';
import { ERAS, anioCorto } from '../lib/tiempo';
import type { Idioma } from '../lib/i18n';
import { esActivacion, teclasLista } from '../lib/teclado';
import { Comparacion } from './Comparacion';

type T = (clave: string, vars?: Record<string, string | number>) => string;

const RANGO = ANIO_MAX - ANIO_MIN;
const PAD = 26;

/** Visible window of the temporal axis: can be enlarged and shifted. */
export interface Ventana {
  desde: number;
  hasta: number;
}

/** Pretty tick step (1, 2, 5 × 10ⁿ) for a given extension. */
function pasoBonito(span: number, objetivo: number): number {
  const bruto = Math.max(1, span / Math.max(2, objetivo));
  const exp = Math.pow(10, Math.floor(Math.log10(bruto)));
  const n = bruto / exp;
  const m = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return Math.max(1, Math.round(m * exp));
}

function marcasDe(desde: number, hasta: number, paso: number): number[] {
  const out: number[] = [];
  const inicio = Math.ceil(desde / paso) * paso;
  for (let a = inicio; a <= hasta; a += paso) out.push(a);
  return out;
}

interface RielProps {
  anio: number;
  onAnio: (a: number) => void;
  curva: { a: number; n: number }[];
  hitos: { a: number; t: string; civ: Civilizacion }[];
  destacado: Civilizacion | null;
  ventana: Ventana;
  onVentana: (v: Ventana) => void;
  t: T;
  idioma: Idioma;
}

function RielTiempo({
  anio,
  onAnio,
  curva,
  hitos,
  destacado,
  ventana,
  onVentana,
  t,
  idioma,
}: RielProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1000);
  const arrastrando = useRef(false);
  const minimapaArrastrando = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(360, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 152;
  const util = w - PAD * 2;
  const span = Math.max(1, ventana.hasta - ventana.desde);

  const x = useCallback(
    (a: number) => PAD + ((a - ventana.desde) / span) * util,
    [ventana.desde, span, util],
  );
  const aDe = useCallback(
    (px: number) =>
      Math.max(ventana.desde, Math.min(ventana.hasta, Math.round(ventana.desde + ((px - PAD) / util) * span))),
    [ventana.desde, ventana.hasta, span, util],
  );

  /* Global scale for the minimap */
  const xGlobal = useCallback(
    (a: number) => PAD + ((a - ANIO_MIN) / RANGO) * util,
    [util],
  );
  const aGlobal = useCallback(
    (px: number) => Math.round(ANIO_MIN + ((px - PAD) / util) * RANGO),
    [util],
  );

  const alMover = useCallback(
    (e: React.PointerEvent) => {
      const rc = ref.current!.getBoundingClientRect();
      onAnio(aDe(e.clientX - rc.left));
    },
    [aDe, onAnio],
  );

  const zoom = useCallback(
    (factor: number, centro?: number) => {
      const actual = ventana;
      const nuevoSpan = Math.max(20, Math.min(RANGO, (actual.hasta - actual.desde) * factor));
      const c = centro ?? (actual.desde + actual.hasta) / 2;
      let desde = c - nuevoSpan / 2;
      let hasta = c + nuevoSpan / 2;
      if (desde < ANIO_MIN) {
        hasta += ANIO_MIN - desde;
        desde = ANIO_MIN;
      }
      if (hasta > ANIO_MAX) {
        desde -= hasta - ANIO_MAX;
        hasta = ANIO_MAX;
      }
      onVentana({ desde: Math.round(desde), hasta: Math.round(hasta) });
    },
    [ventana, onVentana],
  );

  const paso = useMemo(
    () => pasoBonito(span, Math.max(4, Math.floor(util / 130))),
    [span, util],
  );
  const ticks = useMemo(
    () => marcasDe(ventana.desde, ventana.hasta, paso),
    [ventana.desde, ventana.hasta, paso],
  );
  const maxN = useMemo(() => Math.max(1, ...curva.map((p) => p.n)), [curva]);

  /** Placement of era labels: only those that don't overlap are shown. */
  const rotulosEra = useMemo(() => {
    const salida: {
      id: string;
      nombre: string;
      x0: number;
      ancho: number;
      tx: number;
      anchor: 'start' | 'end';
      par: boolean;
    }[] = [];
    let finPrevio = -Infinity;
    ERAS.forEach((e, i) => {
      const x0 = x(e.desde);
      const x1 = x(e.hasta);
      const ancho = x1 - x0;
      const nombre = t(`era.${e.id}`);
      const anchoTexto = nombre.length * 6.1;
      const ultima = i === ERAS.length - 1;
      const izquierda = x0 + 6;
      const derecha = x1 - 3;
      const cabe = ancho > anchoTexto + 12;
      let tx = 0;
      let anchor: 'start' | 'end' = 'start';
      if (cabe && izquierda > finPrevio + 8) {
        tx = izquierda;
      } else if (ultima && derecha - anchoTexto > finPrevio + 8) {
        tx = derecha;
        anchor = 'end';
      } else {
        return;
      }
      finPrevio = anchor === 'start' ? tx + anchoTexto : tx;
      salida.push({ id: e.id, nombre, x0, ancho, tx, anchor, par: i % 2 === 0 });
    });
    return salida;
  }, [x, t]);

  /* Vital sign curve clipped to the window */
  const dMarea = useMemo(() => {
    const y0 = 84;
    const y1 = 48;
    const pts = curva
      .filter((p) => p.a >= ventana.desde && p.a <= ventana.hasta)
      .map((p) => `${x(p.a).toFixed(1)},${(y0 - (p.n / maxN) * (y0 - y1)).toFixed(1)}`);
    if (pts.length < 2) return '';
    return `M${x(ventana.desde).toFixed(1)},${y0} L${pts.join(' L')} L${x(ventana.hasta).toFixed(1)},${y0} Z`;
  }, [curva, maxN, x, ventana.desde, ventana.hasta]);

  /* Minimap: full range with the window highlighted */
  const dMini = useMemo(() => {
    const y0 = 20;
    const y1 = 4;
    const pts = curva.map(
      (p) => `${xGlobal(p.a).toFixed(1)},${(y0 - (p.n / maxN) * (y0 - y1)).toFixed(1)}`,
    );
    return `M${PAD},${y0} L${pts.join(' L')} L${xGlobal(ANIO_MAX)},${y0} Z`;
  }, [curva, maxN, xGlobal]);

  return (
    <div className="riel-tiempo" ref={ref}>
      <div className="riel-cab">
        <span className="ojo">{t('crono.ventana')}</span>
        <div className="ventana-controles">
          <button className="boton icono" onClick={() => zoom(0.55)} title={t('crono.zoomIn')}>
            +
          </button>
          <button className="boton icono" onClick={() => zoom(1.8)} title={t('crono.zoomOut')}>
            −
          </button>
          <button
            className="boton"
            onClick={() => onVentana({ desde: ANIO_MIN, hasta: ANIO_MAX })}
            title={t('crono.todo')}
          >
            {t('crono.todo')}
          </button>
          <span className="ventana-rango num">
            {anioCorto(ventana.desde, idioma)} – {anioCorto(ventana.hasta, idioma)}
          </span>
        </div>
      </div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${w} ${H}`}
        preserveAspectRatio="none"
        onWheel={(e) => {
          e.preventDefault();
          const rc = ref.current!.getBoundingClientRect();
          const px = e.clientX - rc.left;
          const c = aDe(px);
          zoom(e.deltaY > 0 ? 1.25 : 0.8, c);
        }}
        onPointerDown={(e) => {
          arrastrando.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          alMover(e);
        }}
        onPointerMove={(e) => {
          if (arrastrando.current) alMover(e);
        }}
        onPointerUp={(e) => {
          arrastrando.current = false;
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
        onPointerCancel={() => {
          arrastrando.current = false;
        }}
      >
        <defs>
          <clipPath id="recorte-ventana">
            <rect x={PAD} y={26} width={util} height={100} />
          </clipPath>
        </defs>

        {/* ── Minimap: the whole history and the active window ── */}
        <g
          className="t-mini"
          onPointerDown={(e) => {
            minimapaArrastrando.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            const rc = ref.current!.getBoundingClientRect();
            const a = aGlobal(e.clientX - rc.left);
            const mitad = (ventana.hasta - ventana.desde) / 2;
            onVentana({
              desde: Math.round(a - mitad),
              hasta: Math.round(a + mitad),
            });
          }}
          onPointerMove={(e) => {
            if (!minimapaArrastrando.current) return;
            const rc = ref.current!.getBoundingClientRect();
            const a = aGlobal(e.clientX - rc.left);
            const mitad = (ventana.hasta - ventana.desde) / 2;
            onVentana({
              desde: Math.round(a - mitad),
              hasta: Math.round(a + mitad),
            });
          }}
          onPointerUp={(e) => {
            minimapaArrastrando.current = false;
            (e.target as Element).releasePointerCapture?.(e.pointerId);
          }}
        >
          <path className="t-marea mini" d={dMini} />
          <rect
            className="t-mini-fuera"
            x={PAD}
            y={0}
            width={Math.max(0, xGlobal(ventana.desde) - PAD)}
            height={22}
          />
          <rect
            className="t-mini-fuera"
            x={xGlobal(ventana.hasta)}
            y={0}
            width={Math.max(0, xGlobal(ANIO_MAX) - xGlobal(ventana.hasta))}
            height={22}
          />
          <rect
            className="t-mini-ventana"
            x={xGlobal(ventana.desde)}
            y={1}
            width={Math.max(3, xGlobal(ventana.hasta) - xGlobal(ventana.desde))}
            height={20}
          />
        </g>

        <g clipPath="url(#recorte-ventana)">
          {/* Eras: only labels that fit without overlapping are shown */}
          {rotulosEra.map((r) => (
            <g key={r.id}>
              <rect
                className="t-era"
                x={r.x0}
                y={32}
                width={r.ancho}
                height={9}
                fill={r.par ? 'rgba(201,160,76,0.2)' : 'rgba(201,160,76,0.09)'}
              />
              <text className="t-era-label" x={r.tx} y={39.5} textAnchor={r.anchor}>
                {r.nombre}
              </text>
            </g>
          ))}

          {/* Vital sign curve: how many civilizations coexist */}
          <path className="t-marea" d={dMarea} />

          {/* Track */}
          <rect className="t-track" x={PAD} y={92} width={util} height={6} rx={3} />

          {/* Life, peak and decline of the selected civilization */}
          {destacado && (
            <g>
              <rect
                className="t-vida"
                x={x(destacado.inicio)}
                y={90}
                width={Math.max(2, x(destacado.fin) - x(destacado.inicio))}
                height={10}
                fill={destacado.color}
              />
              <rect
                className="t-apogeo"
                x={x(destacado.apogeo[0])}
                y={88}
                height={14}
                width={Math.max(2, x(destacado.apogeo[1]) - x(destacado.apogeo[0]))}
                fill={destacado.color}
              />
              {destacado.declive && (
                <rect
                  className="t-decline"
                  x={x(destacado.declive[0])}
                  y={90}
                  width={Math.max(2, x(destacado.declive[1]) - x(destacado.declive[0]))}
                  height={10}
                  fill={destacado.color}
                />
              )}
            </g>
          )}

          {/* Milestones */}
          {hitos.map((h, i) => (
            <rect
              key={i}
              className={`t-hito${h.a === anio ? ' activo' : ''}`}
              x={x(h.a) - 1}
              y={90}
              width={2}
              height={10}
            />
          ))}
        </g>

        {/* Time markers */}
        {ticks.map((t) => (
          <g key={t}>
            <line className="t-tick" x1={x(t)} y1={98} x2={x(t)} y2={104} />
            <text className="t-tick-label" x={x(t)} y={115}>
              {anioCorto(t, idioma)}
            </text>
          </g>
        ))}

        {/* Indicator */}
        <line className="t-playhead" x1={x(anio)} y1={29} x2={x(anio)} y2={121} />
        <path
          className="t-playhead-cabeza"
          d={`M${x(anio) - 5},29 L${x(anio) + 5},29 L${x(anio)},36 Z`}
        />
      </svg>

    </div>
  );
}

interface GanttProps {
  filas: Civilizacion[];
  anio: number;
  seleccion: string | null;
  onSeleccionar: (id: string) => void;
  setAnio: (a: number) => void;
  agrupar: boolean;
  busqueda: string;
  /** Menores que la búsqueda ha incluido pese al filtro de escala. */
  menoresIncluidas: number;
  t: T;
  idioma: Idioma;
  regiones: Region[];
  ventana: Ventana;
  /** Acciones del estado vacío (tarea 1.7 de mejorar-experiencia). */
  onLimpiarBusqueda: () => void;
  onQuitarFiltros: () => void;
}

function Gantt({
  filas,
  anio,
  seleccion,
  onSeleccionar,
  setAnio,
  agrupar,
  busqueda,
  menoresIncluidas,
  t,
  idioma,
  regiones,
  ventana,
  onLimpiarBusqueda,
  onQuitarFiltros,
}: GanttProps) {
  const marcoRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(800);

  useEffect(() => {
    const el = marcoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ETIQ = 196;
  const pista = Math.max(60, ancho - ETIQ);
  const span = Math.max(1, ventana.hasta - ventana.desde);
  /** Position of a year within the window, in percentage of the track. */
  const pct = (a: number) => Math.max(0, Math.min(100, ((a - ventana.desde) / span) * 100));
  const xAguja = ETIQ + (pct(anio) / 100) * pista;

  /* When a civilization is selected, the chronology scrolls to it. */
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!seleccion || !scroller.current) return;
    const fila = scroller.current.querySelector<HTMLElement>(`[data-id="${seleccion}"]`);
    fila?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [seleccion]);

  /* By region, the dynasties of the same territory stay together. */
  const grupos = useMemo(() => {
    if (!agrupar) return [{ id: 'todas', nombre: '', filas }];
    const porRegion = new Map<string, Civilizacion[]>();
    for (const c of filas) {
      const arr = porRegion.get(c.region);
      if (arr) arr.push(c);
      else porRegion.set(c.region, [c]);
    }
    return [...porRegion.entries()]
      .map(([id, cs]) => ({
        id,
        nombre: regiones.find((x) => x.id === id)?.nombre ?? id,
        filas: cs.sort((a, b) => a.inicio - b.inicio),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, idioma));
  }, [filas, agrupar, idioma, regiones]);

  return (
    <div className="gantt-marco" ref={marcoRef}>
      {busqueda && (
        <div className="gantt-resultados">
          {t('crono.coincidencias', { n: filas.length, q: busqueda })}
          {menoresIncluidas > 0 && (
            <span className="gantt-menores">
              {t('crono.incluyeMenores', { n: menoresIncluidas })}
            </span>
          )}
        </div>
      )}
      <div
        className="gantt"
        ref={scroller}
        style={{ ['--paso' as string]: `${Math.max(14, (100 / span) * pista)}px` }}
      >
        {grupos.map((g) => (
          <Fragment key={g.id}>
            {g.nombre && <div className="g-region">{g.nombre}</div>}
            {g.filas.map((c) => {
              const viva = anio >= c.inicio && anio <= c.fin;
              /* Only the bars that touch the window are drawn */
              if (c.fin < ventana.desde || c.inicio > ventana.hasta) return null;
              return (
                <div
                  key={c.id}
                  data-id={c.id}
                  className={`g-fila${c.id === seleccion ? ' sel' : ''}${viva ? ' viva' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-current={c.id === seleccion || undefined}
                  onClick={() => {
                    onSeleccionar(c.id);
                    setAnio(Math.round((c.apogeo[0] + c.apogeo[1]) / 2));
                  }}
                  onKeyDown={(e) => {
                    if (esActivacion(e)) {
                      e.preventDefault();
                      onSeleccionar(c.id);
                      setAnio(Math.round((c.apogeo[0] + c.apogeo[1]) / 2));
                    } else {
                      teclasLista(e, '.g-fila');
                    }
                  }}
                >
                  <div className="g-etiq">
                    <span className="punto" style={{ background: c.color, color: c.color }} />
                    <span className="nombre">{c.nombre}</span>
                    <span className="siglo">{anioCorto(c.inicio, idioma)}</span>
                  </div>
                  <div className="g-pista">
                    <span
                      className="g-barra"
                      style={{
                        left: `${pct(c.inicio)}%`,
                        width: `${pct(c.fin) - pct(c.inicio)}%`,
                        background: c.color,
                      }}
                    />
                    <span
                      className="g-apogeo"
                      style={{
                        left: `${pct(c.apogeo[0])}%`,
                        width: `${pct(c.apogeo[1]) - pct(c.apogeo[0])}%`,
                        background: c.color,
                        color: c.color,
                      }}
                    />
                    {c.declive && (
                      <span
                        className="g-decline"
                        style={{
                          left: `${pct(c.declive[0])}%`,
                          width: `${pct(c.declive[1]) - pct(c.declive[0])}%`,
                          background: c.color,
                          opacity: 0.7,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
        {!filas.length && (
          <div className="gantt-vacio vacio">
            <p>{busqueda ? t('crono.sinResultados') : t('crono.sinFiltros')}</p>
            <div className="vacio-acciones">
              {busqueda ? (
                <button className="enlace-accion" onClick={onLimpiarBusqueda}>
                  {t('ctl.limpiar')}
                </button>
              ) : null}
              <button className="enlace-accion" onClick={onQuitarFiltros}>
                {t('crono.quitarFiltros')}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="g-aguja" style={{ left: xAguja }} />
    </div>
  );
}

interface CronologiaProps {
  anio: number;
  setAnio: (a: number) => void;
  curva: { a: number; n: number }[];
  filas: Civilizacion[];
  seleccion: string | null;
  onSeleccionar: (id: string) => void;
  hitos: { a: number; t: string; civ: Civilizacion }[];
  destacado: Civilizacion | null;
  agrupar: boolean;
  busqueda: string;
  /** Menores que la búsqueda ha incluido pese al filtro de escala. */
  menoresIncluidas: number;
  t: T;
  idioma: Idioma;
  regiones: Region[];
  comparacion: Civilizacion[];
  onCerrarComparacion: () => void;
  /** Acciones del estado vacío (tarea 1.7 de mejorar-experiencia). */
  onLimpiarBusqueda: () => void;
  onQuitarFiltros: () => void;
}

export function Cronologia({
  anio,
  setAnio,
  curva,
  filas,
  seleccion,
  onSeleccionar,
  hitos,
  destacado,
  agrupar,
  busqueda,
  menoresIncluidas,
  t,
  idioma,
  regiones,
  comparacion,
  onCerrarComparacion,
  onLimpiarBusqueda,
  onQuitarFiltros,
}: CronologiaProps) {
  const [ventanaBruta, setVentana] = useState<Ventana>({ desde: ANIO_MIN, hasta: ANIO_MAX });

  /* La ventana sigue al año: si el cabezal se sale, se recentra.
     Se deriva en el render en vez de en un efecto, para no encadenar renders. */
  const ventana = useMemo(() => {
    if (anio >= ventanaBruta.desde && anio <= ventanaBruta.hasta) return ventanaBruta;
    const mitad = (ventanaBruta.hasta - ventanaBruta.desde) / 2;
    return {
      desde: Math.round(Math.max(ANIO_MIN, anio - mitad)),
      hasta: Math.round(Math.min(ANIO_MAX, anio + mitad)),
    };
  }, [ventanaBruta, anio]);

  return (
    <section className="cronologia">
      <RielTiempo
        anio={anio}
        onAnio={setAnio}
        curva={curva}
        hitos={hitos}
        destacado={destacado}
        ventana={ventana}
        onVentana={setVentana}
        t={t}
        idioma={idioma}
      />
      <div className="cronologia-cuerpo">
      {comparacion.length === 2 && (
        <Comparacion
          a={comparacion[0]}
          b={comparacion[1]}
          desde={ventana.desde}
          hasta={ventana.hasta}
          t={t}
          idioma={idioma}
          onCerrar={onCerrarComparacion}
        />
      )}
      <Gantt
        filas={filas}
        anio={anio}
        seleccion={seleccion}
        onSeleccionar={onSeleccionar}
        setAnio={setAnio}
        agrupar={agrupar}
        busqueda={busqueda}
        menoresIncluidas={menoresIncluidas}
        t={t}
        idioma={idioma}
        regiones={regiones}
        ventana={ventana}
        onLimpiarBusqueda={onLimpiarBusqueda}
        onQuitarFiltros={onQuitarFiltros}
      />
      </div>
    </section>
  );
}
