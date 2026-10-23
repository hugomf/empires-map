import { useMemo, useState } from 'react';
import type { Catalogo } from '../data/catalogo';
import type { Idioma } from '../lib/i18n';
import { anioCorto } from '../lib/tiempo';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  datos: Catalogo;
  anio: number;
  onIrA: (a: number) => void;
  abierto: boolean;
  onCerrar: () => void;
  t: T;
  idioma: Idioma;
  /** País actual resaltado en el mapa. */
  paisSeleccionado: string | null;
  onSeleccionarPais: (id: string | null) => void;
}

const normalizar = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Los Estados de hoy y el momento en que tomaron forma: una cronología
 * política del mundo actual, conectada con la línea de tiempo.
 */
export function Estados({
  datos,
  anio,
  onIrA,
  abierto,
  onCerrar,
  t,
  idioma,
  paisSeleccionado,
  onSeleccionarPais,
}: Props) {
  const [filtro, setFiltro] = useState('');

  const lista = useMemo(() => {
    const q = normalizar(filtro);
    return datos.paisesActuales
      .filter((p) => {
        if (!q) return true;
        return (
          normalizar(p.nombre).includes(q) ||
          normalizar(p.nota).includes(q) ||
          normalizar(t(`formacion.${p.tipoFormacion}`)).includes(q)
        );
      })
      .sort((a, b) => a.formacion - b.formacion);
  }, [datos.paisesActuales, filtro, t]);

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
        {lista.map((p) => {
          const cerca = Math.abs(p.formacion - anio) <= 40;
          const elegido = p.id === paisSeleccionado;
          return (
            <li
              key={p.id}
              className={`${cerca ? 'cerca' : ''}${elegido ? ' elegido' : ''}`}
            >
              <button
                className="estados-fila"
                onClick={() => {
                  onSeleccionarPais(p.id);
                  onIrA(p.formacion);
                }}
                title={p.nota}
              >
                <span className="estados-pais">{p.nombre}</span>
                <span className="estados-anio num">
                  {anioCorto(p.formacion, idioma)}
                  {p.aproximada && (
                    <span className="estados-aprox"> {t('estados.aprox')}</span>
                  )}
                </span>
                <span className="estados-forma">
                  {t(`formacion.${p.tipoFormacion}`)}
                </span>
              </button>
              <p className="estados-nota">{p.nota}</p>
            </li>
          );
        })}
        {!lista.length && <li className="estados-vacio">{t('estados.vacio')}</li>}
      </ul>
    </div>
  );
}
