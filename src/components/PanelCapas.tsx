import { useMemo, useState } from 'react';
import type { Catalogo } from '../data/catalogo';
import type { Religion } from '../data/tipos-cultura';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  datos: Catalogo;
  t: T;
  /** Civilizaciones con el ojo apagado. */
  ocultas: Set<string>;
  /** Civilización aislada con «solo», si la hay. */
  solo: string | null;
  alPulsarOjo: (id: string) => void;
  alPulsarSolo: (id: string) => void;
  alMostrarTodas: () => void;
  alSeleccionar: (id: string) => void;
  cerrar: () => void;
  /** Capas independientes de las civilizaciones. */
  divisiones: boolean;
  religiones: boolean;
  paises: boolean;
  alCambiarDivisiones: (v: boolean) => void;
  alCambiarReligiones: (v: boolean) => void;
  alCambiarPaises: (v: boolean) => void;
  /** Religión seleccionada en el filtro. */
  religionFiltro: string | null;
  alElegirReligion: (id: string | null) => void;
}

/** Panel flotante de capas: una civilización = polidad + divisiones + ciudades. */
export function PanelCapas({
  datos,
  t,
  ocultas,
  solo,
  alPulsarOjo,
  alPulsarSolo,
  alMostrarTodas,
  alSeleccionar,
  cerrar,
  divisiones,
  religiones,
  paises,
  alCambiarDivisiones,
  alCambiarReligiones,
  alCambiarPaises,
  religionFiltro,
  alElegirReligion,
}: Props) {
  const [q, setQ] = useState('');

  const grupos = useMemo(() => {
    const texto = q.trim().toLowerCase();
    const coincide = texto
      ? (s: string) => s.toLowerCase().includes(texto)
      : () => true;
    return datos.regiones
      .map((r) => ({
        r,
        civs: datos.civilizaciones.filter(
          (c) => c.region === r.id && coincide(c.nombre),
        ),
      }))
      .filter((g) => g.civs.length > 0);
  }, [datos, q]);

  /* Religiones del catálogo: el filtro elige una y la lista se acota a ella. */
  const listaReligiones: Religion[] = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return datos.religiones
      .filter((r) => (texto ? r.nombre.toLowerCase().includes(texto) : true))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [datos.religiones, q]);

  const activas = (solo ? 1 : 0) + ocultas.size;

  const interruptor = (
    id: string,
    activo: boolean,
    cambiar: (v: boolean) => void,
  ) => (
    <button
      className={`capas-interruptor${activo ? ' activo' : ''}`}
      role="switch"
      aria-checked={activo}
      onClick={() => cambiar(!activo)}
      title={t(id)}
    >
      <span className="punto" />
      {t(id)}
    </button>
  );

  return (
    <div className="panel-capas" role="dialog" aria-label={t('capas.titulo')}>
      <div className="capas-cabecera">
        <input
          className="capas-buscar"
          placeholder={t('capas.buscar')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cerrar();
          }}
          aria-label={t('capas.buscar')}
          autoFocus
        />
        <button className="boton icono" onClick={cerrar} title={t('capas.cerrar')}>
          ✕
        </button>
      </div>

      <div className="capas-acciones">
        {activas > 0 && (
          <span className="capas-recuento">{t('capas.activas', { n: activas })}</span>
        )}
        <button className="chip" disabled={activas === 0} onClick={alMostrarTodas}>
          {t('capas.todas')}
        </button>
      </div>

      <div className="capas-extras">
        {interruptor('capas.divisiones', divisiones, alCambiarDivisiones)}
        {interruptor('capas.religiones', religiones, alCambiarReligiones)}
        {interruptor('capas.paises', paises, alCambiarPaises)}
      </div>

      <div className="capas-lista">
        {grupos.map((g) => (
          <div key={g.r.id} className="capas-grupo">
            <div className="capas-region">{g.r.nombre}</div>
            {g.civs.map((c) => {
              const oculta = ocultas.has(c.id);
              const solitaria = solo === c.id;
              return (
                <div
                  key={c.id}
                  className={`capa${oculta ? ' oculta' : ''}${solitaria ? ' solo' : ''}`}
                  onClick={() => alSeleccionar(c.id)}
                >
                  <span className="punto" style={{ background: c.color }} />
                  <span className="nombre">{c.nombre}</span>
                  <button
                    className="ojito"
                    title={t('capas.ojo')}
                    onClick={(e) => {
                      e.stopPropagation();
                      alPulsarOjo(c.id);
                    }}
                  >
                    {oculta ? '⊘' : '👁'}
                  </button>
                  <button
                    className={`solo${solitaria ? ' activo' : ''}`}
                    title={t('capas.solo')}
                    onClick={(e) => {
                      e.stopPropagation();
                      alPulsarSolo(c.id);
                    }}
                  >
                    ◉
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        {listaReligiones.length > 0 && (
          <div className="capas-grupo">
            <div className="capas-region">{t('capas.listaReligiones')}</div>
            {listaReligiones.map((r) => (
              <div
                key={r.id}
                className={`capa${religionFiltro === r.id ? ' solo' : ''}`}
                onClick={() =>
                  alElegirReligion(religionFiltro === r.id ? null : r.id)
                }
              >
                <span className="punto" />
                <span className="nombre">{r.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
