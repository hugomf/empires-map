import { useMemo } from 'react';
import type { Civilizacion, Region } from '../data/tipos-cultura';
import type { Idioma } from '../lib/i18n';
import { anioCorto } from '../lib/tiempo';
import { esActivacion, teclasLista } from '../lib/teclado';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  vivas: Civilizacion[];
  seleccion: string | null;
  onSeleccionar: (id: string) => void;
  onHover: (id: string | null) => void;
  abierto: boolean;
  t: T;
  regiones: Region[];
  idioma: Idioma;
  /** Acción del estado vacío: quitar los filtros activos. */
  onQuitarFiltros: () => void;
}

export function Riel({
  vivas,
  seleccion,
  onSeleccionar,
  onHover,
  abierto,
  t,
  regiones,
  idioma,
  onQuitarFiltros,
}: Props) {
  const grupos = useMemo(() => {
    const m = new Map<string, Civilizacion[]>();
    for (const c of vivas) {
      const arr = m.get(c.region);
      if (arr) arr.push(c);
      else m.set(c.region, [c]);
    }
    return [...m.entries()]
      .map(([id, cs]) => ({
        id,
        nombre: regiones.find((x) => x.id === id)?.nombre ?? id,
        cs: cs.sort((a, b) => b.peso - a.peso || a.inicio - b.inicio),
      }))
      .sort((a, b) => b.cs.length - a.cs.length || a.nombre.localeCompare(b.nombre));
  }, [vivas, regiones]);

  return (
    <aside className={`riel${abierto ? ' abierto' : ''}`}>
      <header className="riel-cabecera">
        <span className="ojo">{t('riel.vivas')}</span>
        <span className="contador">{vivas.length}</span>
      </header>
      <nav className="riel-lista" aria-label={t('riel.navegacion')}>
        {grupos.map((g) => (
          <div key={g.id}>
            <div className="riel-grupo">
              <span className="ojo">{g.nombre}</span>
            </div>
            {g.cs.map((c) => (
              <div
                key={c.id}
                className={`riel-item${c.id === seleccion ? ' sel' : ''}`}
                role="button"
                tabIndex={0}
                aria-current={c.id === seleccion || undefined}
                onClick={() => onSeleccionar(c.id)}
                onKeyDown={(e) => {
                  if (esActivacion(e)) {
                    e.preventDefault();
                    onSeleccionar(c.id);
                  } else {
                    teclasLista(e, '.riel-item');
                  }
                }}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
              >
                <span className="riel-punto" style={{ background: c.color, color: c.color }} />
                <span className="riel-nombre">{c.nombre}</span>
                <span className="riel-meta">
                  {anioCorto(c.inicio, idioma)}–{anioCorto(c.fin, idioma)}
                </span>
              </div>
            ))}
          </div>
        ))}
        {!vivas.length && (
          <div className="vacio">
            <p style={{ color: 'var(--pergamino-3)', fontSize: 12.5 }}>
              {t('riel.vacio')}
            </p>
            <button className="enlace-accion" onClick={onQuitarFiltros}>
              {t('crono.quitarFiltros')}
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
