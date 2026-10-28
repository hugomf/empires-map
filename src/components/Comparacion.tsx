import { useMemo } from 'react';
import type { Civilizacion } from '../data/tipos-cultura';
import type { Idioma } from '../lib/i18n';
import { anioCorto, duracion, intervalo } from '../lib/tiempo';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  a: Civilizacion | null;
  b: Civilizacion | null;
  desde: number;
  hasta: number;
  t: T;
  idioma: Idioma;
  onCerrar: () => void;
}

/**
 * Comparison of two civilizations on the same axis: when they coexisted,
 * which peaked first and which survived longer.
 */
export function Comparacion({ a, b, desde, hasta, t, idioma, onCerrar }: Props) {
  const span = Math.max(1, hasta - desde);

  const solape = useMemo(() => {
    if (!a || !b) return null;
    const ini = Math.max(a.inicio, b.inicio);
    const fin = Math.min(a.fin, b.fin);
    return { ini, fin, años: Math.max(0, fin - ini), coexiste: ini <= fin };
  }, [a, b]);

  if (!a || !b) return null;

  const x = (n: number) => ((n - desde) / span) * 100;
  const ancho = (i: number, f: number) => Math.max(0.4, x(f) - x(i));

  return (
    <div className="comparacion">
      <div className="comparacion-cab">
        <span className="ojo">{t('comparar.titulo')}</span>
        <span className="comparacion-veredicto">
          {solape?.coexiste ? (
            <>
              {t('comparar.coexistieron')}{' '}
              <strong className="num">{solape.años.toLocaleString('es-ES')}</strong>{' '}
              {t('comparar.anos')}
            </>
          ) : (
            t('comparar.nunca')
          )}
        </span>
        <button className="comparacion-cerrar" onClick={onCerrar} title={t('comparar.cerrar')}>
          ✕
        </button>
      </div>
      <div className="comparacion-cuerpo">
        {[a, b].map((c) => (
          <div key={c.id} className="comparacion-fila">
            <span className="comparacion-nombre" style={{ color: c.color }}>
              {c.nombre}
            </span>
            <div className="comparacion-pista">
              <span
                className="comparacion-barra"
                style={{
                  left: `${x(c.inicio)}%`,
                  width: `${ancho(c.inicio, c.fin)}%`,
                  background: c.color,
                }}
              />
              <span
                className="comparacion-apogeo"
                style={{
                  left: `${x(c.apogeo[0])}%`,
                  width: `${ancho(c.apogeo[0], c.apogeo[1])}%`,
                  background: c.color,
                }}
              />
            </div>
            <span className="comparacion-datos num">
              {anioCorto(c.inicio, idioma)}–{anioCorto(c.fin, idioma)}
            </span>
          </div>
        ))}
        {solape?.coexiste && (
          <div className="comparacion-solape" style={{ left: `${x(solape.ini)}%`, width: `${ancho(solape.ini, solape.fin)}%` }} />
        )}
      </div>
      <div className="comparacion-nota">
        {t('comparar.primero')}:{' '}
        <strong>{a.inicio <= b.inicio ? a.nombre : b.nombre}</strong> · {t('comparar.maslarga')}:{' '}
        <strong>{duracion(a.inicio, a.fin, idioma) > duracion(b.inicio, b.fin, idioma) ? a.nombre : b.nombre}</strong>{' '}
        · {t('comparar.pico')}:{' '}
        <strong>
          {a.apogeo[1] >= b.apogeo[1] ? a.nombre : b.nombre} ({intervalo(a.apogeo[0], a.apogeo[1], idioma)})
        </strong>
      </div>
    </div>
  );
}
