import { useMemo } from 'react';
import type { Civilizacion, Region } from '../data/tipos-cultura';
import type { Idioma } from '../lib/i18n';
import { anioCorto } from '../lib/tiempo';

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
      <div className="riel-cabecera">
        <span className="ojo">{t('riel.vivas')}</span>
        <span className="contador">{vivas.length}</span>
      </div>
      <div className="riel-lista">
        {grupos.map((g) => (
          <div key={g.id}>
            <div className="riel-grupo">
              <span className="ojo">{g.nombre}</span>
            </div>
            {g.cs.map((c) => (
              <div
                key={c.id}
                className={`riel-item${c.id === seleccion ? ' sel' : ''}`}
                onClick={() => onSeleccionar(c.id)}
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
          <p style={{ padding: '18px 14px', color: 'var(--pergamino-3)', fontSize: 12.5 }}>
            {t('riel.vacio')}
          </p>
        )}
      </div>
    </aside>
  );
}
