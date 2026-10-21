import { useMemo, useState } from 'react';
import { ESTADOS_ACTUALES, type EstadoActual } from '../data/estados-actuales';
import type { Idioma } from '../lib/i18n';
import { anioCorto } from '../lib/tiempo';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  anio: number;
  onIrA: (a: number) => void;
  abierto: boolean;
  onCerrar: () => void;
  t: T;
  idioma: Idioma;
}

/**
 * Los Estados de hoy y el momento en que tomaron forma: una cronología
 * política del mundo actual, conectada con la línea de tiempo.
 */
export function Estados({ anio, onIrA, abierto, onCerrar, t, idioma }: Props) {
  const [filtro, setFiltro] = useState('');

  const lista = useMemo(() => {
    const q = filtro
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return ESTADOS_ACTUALES.filter(
      (e) =>
        !q ||
        e.pais.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
        e.anterior.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q),
    ).sort((a, b) => a.anio - b.anio);
  }, [filtro]);

  if (!abierto) return null;

  return (
    <div className="estados">
      <div className="estados-cab">
        <span className="ojo">{t('estados.titulo')}</span>
        <input
          className="estados-buscar"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={t('estados.buscar')}
          autoFocus
        />
        <button className="estados-cerrar" onClick={onCerrar} title={t('estados.cerrar')}>
          ✕
        </button>
      </div>
      <p className="estados-sub">{t('estados.sub')}</p>
      <ul className="estados-lista">
        {lista.map((e: EstadoActual) => {
          const cerca = Math.abs(e.anio - anio) <= 40;
          return (
            <li key={e.id} className={cerca ? 'cerca' : ''}>
              <button
                className="estados-fila"
                onClick={() => {
                  onIrA(e.anio);
                }}
                title={e.nota}
              >
                <span className="estados-pais">{e.pais}</span>
                <span className="estados-anio num">{anioCorto(e.anio, idioma)}</span>
                <span className="estados-forma">{e.forma}</span>
                <span className="estados-anterior">{e.anterior}</span>
              </button>
              {e.nota && cerca && <p className="estados-nota">{e.nota}</p>}
            </li>
          );
        })}
        {!lista.length && <li className="estados-vacio">{t('estados.vacio')}</li>}
      </ul>
    </div>
  );
}
