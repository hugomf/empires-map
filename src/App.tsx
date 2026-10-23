import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { catalogo, cargarIngles, fijarIdioma, inglesListo } from './data/catalogo';
import type { Grupo, Tipo } from './data/types';
import {
  COLOR_TIPO,
  colorEfectivo,
  curvaDeVitalidad,
  dominantePorRegion,
  esMenor,
  estaViva,
  pasaFiltros,
  vivasEn,
} from './lib/dominio';
import { ERAS, anioCorto } from './lib/tiempo';
import {
  escribirEnlace,
  leerEnlace,
  type Densidad,
} from './lib/enlace';
import { idiomaGuardado, traducir, type Idioma } from './lib/i18n';
import { musica } from './lib/musica';
import { MapaAtlas } from './components/MapaAtlas';
import { Riel } from './components/Riel';
import { Ficha } from './components/Ficha';
import { Cronologia } from './components/Cronologia';
import { Ahora } from './components/Ahora';
import { Estados } from './components/Estados';
import { PanelCapas } from './components/PanelCapas';

const TIPOS: Tipo[] = [
  'imperio',
  'reino',
  'estado',
  'dinastia',
  'cultura',
  'pueblo',
  'confederacion',
];

const GRUPOS: Grupo[] = ['Europa', 'Asia', 'África', 'América', 'Oceanía'];

const VELOCIDADES = [25, 60, 150, 400];

/** Compara sin acentos ni mayúsculas, para que “Iran” encuentre “Irán”. */
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* --- El enlace: `#<idioma>/<anio>/<civ>` + segmentos opcionales --- */
/* El idioma es opcional: los enlaces antiguos `#<anio>/<civ>` siguen
 * funcionando (gana `localStorage`). El resto del estado (filtros, capas,
 * densidad) viaja en segmentos; los desconocidos se ignoran. */
export default function App() {
  const en = useMemo(() => leerEnlace(window.location.hash), []);
  const [idioma, setIdioma] = useState<Idioma>(() => en.idioma ?? idiomaGuardado());
  fijarIdioma(idioma);

  const [, forzar] = useState(0);
  const [catalogoListo, setCatalogoListo] = useState(false);
  useEffect(() => {
    if (idioma !== 'en' || inglesListo()) {
      return;
    }
    let vivo = true;
    void cargarIngles().then(() => {
      if (!vivo) return;
      forzar((n) => n + 1);
      setCatalogoListo(true);
    });
    return () => {
      vivo = false;
    };
  }, [idioma]);

  const datos = catalogo();
  const t = useCallback(
    (clave: string, vars?: Record<string, string | number>) => traducir(idioma, clave, vars),
    [idioma],
  );

  const [anio, setAnio] = useState(() => {
    const a = en.anio;
    return a === null ? 100 : Math.max(datos.anioMin, Math.min(datos.anioMax, a));
  });
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidad, setVelocidad] = useState(120);
  const [seleccion, setSeleccion] = useState<string | null>(() => en.civ || 'roma');
  const [hover, setHover] = useState<string | null>(null);
  const [tipos, setTipos] = useState<Set<Tipo>>(() => new Set(en.tipos as Tipo[]));
  const [grupos, setGrupos] = useState<Set<Grupo>>(() => new Set(en.grupos as Grupo[]));
  const [mostrarMenores, setMostrarMenores] = useState(en.menores);
  const [sonandoMusica, setSonandoMusica] = useState(false);
  const [fronterasModernas, setFronterasModernas] = useState(false);
  const [comparacion, setComparacion] = useState<string[]>([]);
  const [modoColor, setModoColor] = useState<'identidad' | 'fase'>('identidad');
  const [estadosAbiertos, setEstadosAbiertos] = useState(false);
  const [busqueda, setBusqueda] = useState(en.busqueda);
  const [agrupar] = useState(true);
  const [menu, setMenu] = useState(false);
  const [rielAbierto, setRielAbierto] = useState(false);
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [capaSolo, setCapaSolo] = useState<string | null>(en.solo);
  const [capasOcultas, setCapasOcultas] = useState<Set<string>>(() => new Set(en.ocultas));
  const [panelCapas, setPanelCapas] = useState(false);
  /* Capas independientes de las civilizaciones. */
  const [capaDivisiones, setCapaDivisiones] = useState(en.divisiones);
  const [capaReligiones, setCapaReligiones] = useState(en.religiones);
  const [capaPaises, setCapaPaises] = useState(en.paises);
  /* Densidad de etiquetas del mapa. */
  const [densidad, setDensidad] = useState<Densidad>(en.densidad);
  /* Religión elegida: filtra la lista de religiones y sus civilizaciones. */
  const [religionFiltro, setReligionFiltro] = useState<string | null>(null);
  /* Aviso tras copiar el enlace. */
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  /* Anuncio para lectores de pantalla (año, confirmaciones). */
  const [mensajeVivo, setMensajeVivo] = useState('');

  const filtros = useMemo(
    () => ({ tipos, grupos, mostrarMenores }),
    [tipos, grupos, mostrarMenores],
  );

  const vivas = useMemo(() => {
    const base = vivasEn(anio, datos.civilizaciones, filtros, datos.regiones);
    /* Una menor encontrada por la búsqueda se dibuja aunque el filtro de
     * escala esté apagado: es lo que el usuario ha pedido mirar. */
    if (seleccion && !base.some((c) => c.id === seleccion)) {
      const c = datos.civilizaciones.find((x) => x.id === seleccion);
      if (c && estaViva(c, anio)) return [...base, c];
    }
    return base;
  }, [anio, datos, filtros, seleccion]);
  const dominante = useMemo(() => dominantePorRegion(vivas), [vivas]);
  const civVivas = useMemo(() => new Map(vivas.map((c) => [c.id, c])), [vivas]);

  /** Color efectivo de cada civilización viva según el modo de color. */
  const colores = useMemo(
    () => new Map(vivas.map((c) => [c.id, colorEfectivo(c, anio, modoColor)])),
    [vivas, anio, modoColor],
  );

  const curva = useMemo(
    () => curvaDeVitalidad(datos.civilizaciones, datos.anioMin, datos.anioMax),
    [datos],
  );

  /** Civilizaciones asociadas a la religión filtrada, si la hay. */
  const civsDeReligion = useMemo(() => {
    if (!religionFiltro) return null;
    const r = datos.religiones.find((x) => x.id === religionFiltro);
    return new Set(r ? [r.civilizacion] : []);
  }, [religionFiltro, datos.religiones]);

  /* Con filtro de religión, el riel también se acota: la spec pide «la lista
   * y la ficha muestran solo las civilizaciones asociadas» (el mapa no). */
  const vivasRiel = useMemo(
    () => (civsDeReligion ? vivas.filter((c) => civsDeReligion.has(c.id)) : vivas),
    [vivas, civsDeReligion],
  );

  const elegirReligion = useCallback(
    (id: string | null) => {
      setReligionFiltro(id);
      if (id) {
        const r = datos.religiones.find((x) => x.id === id);
        /* La ficha ya no puede quedarse en una civilización ajena a la
         * religión recién elegida: se suelta la selección. */
        if (r && seleccion && r.civilizacion !== seleccion) setSeleccion(null);
      }
    },
    [datos.religiones, seleccion],
  );

  const filas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    /* Con búsqueda activa se buscan también las menores: el usuario las ha
     * pedido expresamente, así que el filtro de escala no las esconde. */
    const f = q ? { ...filtros, mostrarMenores: true } : filtros;
    return datos.civilizaciones
      .filter((c) => pasaFiltros(c, f, datos.regiones))
      .filter((c) => (civsDeReligion ? civsDeReligion.has(c.id) : true))
      .filter((c) => {
        if (!q) return true;
        const region = datos.regiones.find((r) => r.id === c.region)?.nombre ?? '';
        const texto = [
          c.nombre,
          c.abrev,
          ...(c.alias ?? []),
          region,
          t(`tipo.${c.tipo}`),
          c.sintesis,
          c.caida,
          c.legado,
          ...c.hitos.map((h) => h.texto),
        ]
          .join(' ')
          .toLowerCase();
        return normalizar(texto).includes(q);
      })
      .sort((a, b) => a.inicio - b.inicio);
  }, [datos, filtros, busqueda, t, civsDeReligion]);

  /* Menores que la búsqueda ha traído y el filtro de escala esconde. */
  const menoresEnBusqueda = useMemo(
    () =>
      busqueda.trim() && !mostrarMenores
        ? filas.filter((c) => esMenor(c)).length
        : 0,
    [filas, busqueda, mostrarMenores],
  );

  const hitos = useMemo(() => {
    const base: { a: number; t: string; civ: (typeof datos.civilizaciones)[number] }[] = [];
    for (const c of datos.civilizaciones) {
      if (c.peso >= 9) for (const h of c.hitos) base.push({ a: h.anio, t: h.texto, civ: c });
    }
    const sel = datos.civilizaciones.find((c) => c.id === seleccion);
    if (sel) for (const h of sel.hitos) base.push({ a: h.anio, t: h.texto, civ: sel });
    return base;
  }, [datos, seleccion]);

  /* --- Reproducción automática --- */
  const raf = useRef(0);
  const ultimo = useRef(0);
  useEffect(() => {
    if (!reproduciendo) return;
    ultimo.current = performance.now();
    const paso = (t0: number) => {
      const dt = (t0 - ultimo.current) / 1000;
      ultimo.current = t0;
      setAnio((a) => {
        const n = a + dt * velocidad;
        return n >= datos.anioMax ? datos.anioMin + (n - datos.anioMax) : n;
      });
      raf.current = requestAnimationFrame(paso);
    };
    raf.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf.current);
  }, [reproduciendo, velocidad, datos.anioMax, datos.anioMin]);

  /* --- Atajos de teclado --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setReproduciendo((r) => !r);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setAnio((a) => Math.max(datos.anioMin, Math.round(a - (e.shiftKey ? 50 : 5))));
        setMensajeVivo(
          t('anuncio.anio', {
            n: Math.max(datos.anioMin, Math.round(anio - (e.shiftKey ? 50 : 5))),
          }),
        );
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setAnio((a) => Math.min(datos.anioMax, Math.round(a + (e.shiftKey ? 50 : 5))));
        setMensajeVivo(
          t('anuncio.anio', {
            n: Math.min(datos.anioMax, Math.round(anio + (e.shiftKey ? 50 : 5))),
          }),
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [datos.anioMin, datos.anioMax, anio, t]);

  /* --- La preferencia de idioma se recuerda en el navegador --- */
  useEffect(() => {
    try {
      localStorage.setItem('cronica-idioma', idioma);
    } catch {
      /* modo privado: sin persistencia, sin error */
    }
  }, [idioma]);

  /* --- El enlace refleja el estado completo de la vista --- */
  useEffect(() => {
    const h = escribirEnlace({
      idioma,
      anio,
      civ: seleccion,
      solo: capaSolo,
      ocultas: [...capasOcultas],
      divisiones: capaDivisiones,
      religiones: capaReligiones,
      paises: capaPaises,
      densidad,
      busqueda,
      tipos: [...tipos],
      grupos: [...grupos],
      menores: mostrarMenores,
    });
    if (window.location.hash !== h) window.history.replaceState(null, '', h);
  }, [
    idioma,
    anio,
    seleccion,
    capaSolo,
    capasOcultas,
    capaDivisiones,
    capaReligiones,
    capaPaises,
    densidad,
    busqueda,
    tipos,
    grupos,
    mostrarMenores,
  ]);

  /** Restaura los filtros por defecto y limpia la búsqueda (acción de los estados vacíos). */
  const quitarFiltros = useCallback(() => {
    setBusqueda('');
    setTipos(new Set(en.tipos as Tipo[]));
    setGrupos(new Set(en.grupos as Grupo[]));
    setMostrarMenores(en.menores);
    setReligionFiltro(null);
  }, [en]);

  /** Anuncia el año en la región viva, con antirrebote para no saturarla al deslizar. */
  useEffect(() => {
    const id = window.setTimeout(
      () => setMensajeVivo(t('vivo.anio', { a: anioCorto(anio, idioma) })),
      700,
    );
    return () => window.clearTimeout(id);
  }, [anio, t, idioma]);

  /** Copia el enlace de la vista actual y lo anuncia. */
  const copiarEnlace = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* Sin permiso de portapapeles: al menos se deja el enlace a la vista. */
      window.prompt(t('ctl.enlace'), url);
    }
    setEnlaceCopiado(true);
    setMensajeVivo(t('ctl.copiado'));
    window.setTimeout(() => setEnlaceCopiado(false), 2600);
  }, [t]);

  /** ¿Debe dibujarse la capa de esta civilización? */
  const capaVisible = useCallback(
    (id: string) => (capaSolo ? capaSolo === id : !capasOcultas.has(id)),
    [capaSolo, capasOcultas],
  );

  const comparar = comparacion.length > 0;
  const seleccionar = useCallback(
    (id: string | null) => {
      setSeleccion(id);
      if (id) setFichaAbierta(true);
      if (id && comparar) {
        setComparacion((prev) => {
          if (prev.includes(id)) return prev;
          return [...prev, id].slice(-2);
        });
      }
    },
    [comparar],
  );

  const irA = useCallback(
    (a: number) => {
      setAnio(Math.max(datos.anioMin, Math.min(datos.anioMax, a)));
    },
    [datos.anioMin, datos.anioMax],
  );

  const era = ERAS.find((e) => anio >= e.desde && anio <= e.hasta);
  const limpiezas = tipos.size + grupos.size;

  const alternarTipo = (t2: Tipo) =>
    setTipos((s) => {
      const n = new Set(s);
      if (n.has(t2)) n.delete(t2);
      else n.add(t2);
      return n;
    });

  const alternarGrupo = (g: Grupo) =>
    setGrupos((s) => {
      const n = new Set(s);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });

  const listoParaPintar = idioma !== 'en' || inglesListo() || catalogoListo;
  if (!listoParaPintar) {
    return (
      <div className="cargando">
        <span className="cargando-marca">Crónica de Imperios</span>
        <span className="cargando-linea" />
      </div>
    );
  }

  return (
    <div className="app">
      <p className="sr-only" role="status" aria-live="polite">
        {mensajeVivo}
      </p>
      {enlaceCopiado && <div className="aviso-enlace">{t('ctl.copiado')}</div>}
      <header className="cabecera">
        <div className="marca">
          <h1>{t('marca.titulo')}</h1>
          <span className="ojo">
            {t('marca.sub', { n: datos.civilizaciones.length })}
          </span>
        </div>

        <div className="reloj">
          <span className="anio">{anio < 0 ? Math.abs(Math.round(anio)) : Math.round(anio)}</span>
          <span className="era">{anio < 0 ? t('reloj.ac') : t('reloj.dc')}</span>
          <span className="era" style={{ color: 'var(--bronce)' }}>
            {era ? t(`era.${era.id}`) : ''}
          </span>
        </div>

        <div className="controles">
          <label className="buscador">
            <span className="ojo">{t('ctl.buscarCorto')}</span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setBusqueda('');
                if (e.key === 'Enter' && filas[0]) {
                  seleccionar(filas[0].id);
                  setAnio(Math.round((filas[0].apogeo[0] + filas[0].apogeo[1]) / 2));
                }
              }}
              placeholder={t('ctl.buscar')}
              aria-label={t('ctl.buscar')}
            />
            {busqueda && (
              <button
                type="button"
                className="buscador-limpiar"
                onClick={() => setBusqueda('')}
                aria-label={t('ctl.limpiar')}
              >
                ×
              </button>
            )}
          </label>
          <button
            className="boton icono solo-movil"
            onClick={() => setRielAbierto((v) => !v)}
            title={t('riel.vivas')}
          >
            ☰
          </button>
          <button
            className={`boton icono${reproduciendo ? ' activo' : ''}`}
            onClick={() => setReproduciendo((r) => !r)}
            title={reproduciendo ? t('ctl.pausa') : t('ctl.reproducir')}
          >
            {reproduciendo ? '❚❚' : '▶'}
          </button>
          <button
            className="boton"
            onClick={() =>
              setVelocidad((v) =>
                v >= 400 ? 25 : VELOCIDADES[VELOCIDADES.indexOf(v) + 1] ?? 400,
              )
            }
            title={t('ctl.velocidad')}
          >
            {velocidad} a/s
          </button>
          <button className="boton" onClick={() => setMenu((m) => !m)} title={t('ctl.filtros')}>
            {t('ctl.filtros')}
            {limpiezas ? ` · ${limpiezas}` : ''}
          </button>
          <button
            className={`boton${panelCapas ? ' activo' : ''}`}
            onClick={() => setPanelCapas((v) => !v)}
            title={t('ctl.capas')}
          >
            {t('ctl.capas')}
            {capaSolo
              ? ' · ' + (datos.civilizaciones.find((c) => c.id === capaSolo)?.nombre ?? capaSolo)
              : capasOcultas.size
                ? ` · ${capasOcultas.size}`
                : ''}
          </button>
          <button
            className={`boton${modoColor === 'fase' ? ' activo' : ''}`}
            onClick={() => setModoColor((m) => (m === 'fase' ? 'identidad' : 'fase'))}
            title={t('ctl.colorFase')}
          >
            {t('ctl.colorFase')}
          </button>
          <button
            className={`boton${estadosAbiertos ? ' activo' : ''}`}
            onClick={() => setEstadosAbiertos((v) => !v)}
            title={t('ctl.estados')}
          >
            {t('ctl.estados')}
          </button>
          <button
            className={`boton${comparar ? ' activo' : ''}`}
            onClick={() => {
              setComparacion((p) => (p.length ? [] : [seleccion ?? 'roma']));
            }}
            title={t('ctl.comparar')}
          >
            {t('ctl.comparar')}
          </button>
          <button
            className="boton"
            onClick={() =>
              setDensidad((d) =>
                d === 'auto' ? 'todas' : d === 'todas' ? 'ninguna' : 'auto',
              )
            }
            title={t('ctl.densidad')}
          >
            {t(`densidad.${densidad}`)}
          </button>
          <button className="boton" onClick={() => void copiarEnlace()} title={t('ctl.copiarEnlace')}>
            {t('ctl.copiarEnlace')}
          </button>
          <button
            className={`boton${fronterasModernas ? ' activo' : ''}`}
            onClick={() => setFronterasModernas((v) => !v)}
            title={t('ctl.fronteras')}
          >
            {t('ctl.fronterasCorto')}
          </button>
          <button
            className={`boton icono${sonandoMusica ? ' activo' : ''}`}
            onClick={() => {
              if (sonandoMusica) musica.detener();
              else void musica.iniciar();
              setSonandoMusica(!sonandoMusica);
            }}
            title={t('ctl.musica')}
          >
            {sonandoMusica ? '♪' : '♪'}
          </button>
          <button
            className="boton"
            onClick={() => setIdioma(idioma === 'en' ? 'es' : 'en')}
            title={t('ctl.idioma')}
          >
            {idioma === 'en' ? 'ES' : 'EN'}
          </button>
          <button
            className="boton icono"
            onClick={() => {
              setAnio(100);
              setSeleccion('roma');
            }}
            title={t('ctl.reiniciar')}
          >
            ↺
          </button>
        </div>

        {menu && (
          <div className="menu-filtros">
            <div className="grupo">
              <span className="titulo">{t('filtros.tipo')}</span>
              <div className="filtros">
                {TIPOS.map((t2) => (
                  <button
                    key={t2}
                    className={`chip${tipos.has(t2) ? ' activo' : ''}`}
                    onClick={() => alternarTipo(t2)}
                    style={tipos.has(t2) ? undefined : { color: COLOR_TIPO[t2] }}
                  >
                    <span className="pip" />
                    {t(`tipo.${t2}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grupo">
              <span className="titulo">{t('filtros.region')}</span>
              <div className="filtros">
                {GRUPOS.map((g) => (
                  <button
                    key={g}
                    className={`chip${grupos.has(g) ? ' activo' : ''}`}
                    onClick={() => alternarGrupo(g)}
                  >
                    <span className="pip" />
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grupo">
              <span className="titulo">{t('ctl.escala')}</span>
              <button
                className={`chip${mostrarMenores ? ' activo' : ''}`}
                onClick={() => setMostrarMenores((v) => !v)}
              >
                <span className="pip" />
                {t('ctl.menores')}
              </button>
            </div>
            <div className="grupo">
              <span className="titulo">{t('filtros.escala')}</span>
              <div className="filtros">
                <button
                  className={`chip${mostrarMenores ? ' activo' : ''}`}
                  onClick={() => setMostrarMenores((v) => !v)}
                >
                  <span className="pip" />
                  {t('filtros.menores')}
                </button>
              </div>
            </div>
            {limpiezas > 0 && (
              <button
                className="boton"
                onClick={() => {
                  setTipos(new Set());
                  setGrupos(new Set());
                }}
              >
                {t('filtros.quitar')}
              </button>
            )}
          </div>
        )}
        {panelCapas && (
          <PanelCapas
            datos={datos}
            t={t}
            ocultas={capasOcultas}
            solo={capaSolo}
            alPulsarOjo={(id) =>
              setCapasOcultas((s) => {
                const n = new Set(s);
                if (n.has(id)) n.delete(id);
                else n.add(id);
                return n;
              })
            }
            alPulsarSolo={(id) => setCapaSolo((s) => (s === id ? null : id))}
            alMostrarTodas={() => {
              setCapaSolo(null);
              setCapasOcultas(new Set());
            }}
            alSeleccionar={(id) => {
              seleccionar(id);
              setPanelCapas(false);
            }}
            divisiones={capaDivisiones}
            religiones={capaReligiones}
            paises={capaPaises}
            alCambiarDivisiones={setCapaDivisiones}
            alCambiarReligiones={setCapaReligiones}
            alCambiarPaises={setCapaPaises}
            religionFiltro={religionFiltro}
            alElegirReligion={elegirReligion}
            cerrar={() => setPanelCapas(false)}
          />
        )}
      </header>

      <main className="tablero">
        <Riel
          vivas={vivasRiel}
          seleccion={seleccion}
          onSeleccionar={(id) => {
            seleccionar(id);
            setRielAbierto(false);
          }}
          onHover={setHover}
          abierto={rielAbierto}
          t={t}
          regiones={datos.regiones}
          idioma={idioma}
          onQuitarFiltros={quitarFiltros}
        />

        <div className="zona-mapa">
          <MapaAtlas
          anio={anio}
          datos={datos}
          civVivas={civVivas}
          filtros={filtros}
          dominante={dominante}
          seleccion={seleccion}
          hover={hover}
          onSeleccionar={seleccionar}
          onHover={setHover}
          t={t}
          colores={colores}
          modoColor={modoColor}
          fronterasModernas={fronterasModernas}
          capaVisible={capaVisible}
          capaReligiones={capaReligiones}
        />

          <Estados
            anio={anio}
            onIrA={irA}
            abierto={estadosAbiertos}
            onCerrar={() => setEstadosAbiertos(false)}
            t={t}
            idioma={idioma}
          />
          <Ahora
            anio={anio}
            filas={datos.civilizaciones}
            regiones={datos.regiones}
            onSeleccionar={seleccionar}
            onIrA={irA}
            t={t}
            idioma={idioma}
          />
        </div>

        <Ficha
          civ={datos.civilizaciones.find((c) => c.id === seleccion) ?? null}
          datos={datos}
          anio={anio}
          onIrA={irA}
          abierta={fichaAbierta}
          t={t}
          idioma={idioma}
        />
      </main>

      <Cronologia
        anio={anio}
        setAnio={irA}
        curva={curva}
        filas={filas}
        seleccion={seleccion}
        onSeleccionar={seleccionar}
        hitos={hitos}
        destacado={datos.civilizaciones.find((c) => c.id === seleccion) ?? null}
        agrupar={agrupar}
        busqueda={busqueda}
        menoresIncluidas={menoresEnBusqueda}
        t={t}
        idioma={idioma}
        regiones={datos.regiones}
        comparacion={datos.civilizaciones.filter((c) => comparacion.includes(c.id))}
        onCerrarComparacion={() => setComparacion([])}
        onLimpiarBusqueda={() => setBusqueda('')}
        onQuitarFiltros={quitarFiltros}
      />
    </div>
  );
}

