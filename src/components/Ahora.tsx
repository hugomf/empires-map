import { useMemo, useState } from 'react';
import type { Civilizacion, Region } from '../data/tipos-cultura';
import type { Idioma } from '../lib/i18n';
import { anioCorto } from '../lib/tiempo';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  anio: number;
  filas: Civilizacion[];
  regiones: Region[];
  onSeleccionar: (id: string) => void;
  onIrA: (a: number) => void;
  t: T;
  idioma: Idioma;
}

/**
 * «Now»: The events that occur in the visible year, from all
 * living civilizations. It's the transversal reading that the map doesn't give.
 */
export function Ahora({
  anio,
  filas,
  regiones,
  onSeleccionar,
  onIrA,
  t,
  idioma,
}: Props) {
  const [abierto, setAbierto] = useState(true);

  const hechos = useMemo(() => {
    const out: { civ: Civilizacion; texto: string; anio: number }[] = [];
    for (const c of filas) {
      for (const h of c.hitos) {
        if (h.anio === anio) out.push({ civ: c, texto: h.texto, anio: h.anio });
      }
    }
    /* Events from the exact year first; if there are none, the closest one */
    if (!out.length) {
      for (const c of filas) {
        for (const h of c.hitos) {
          const d = Math.abs(h.anio - anio);
          if (d <= 40) out.push({ civ: c, texto: h.texto, anio: h.anio });
        }
      }
      out.sort((a, b) => Math.abs(a.anio - anio) - Math.abs(b.anio - anio));
      out.length = Math.min(out.length, 6);
    }
    return out;
  }, [filas, anio]);

  return (
    <div className={`ahora ${abierto ? ' abierto' : ''}`}>
      <button className="ahora-cab" onClick={() => setAbierto((v) => !v)}>
        <span className="ojo">{t('ahora.titulo')}</span>
        <span className="ahora-cuenta">{hechos.length}</span>
        <span className="ahora-chevron">{abierto ? '▾' : '▸'}</span>
      </button>
      {abierto && (
        <ul className="ahora-lista">
          {hechos.length === 0 && <li className="ahora-vacio">{t('ahora.vacio')}</li>}
          {hechos.map((h, i) => (
            <li key={`${h.civ.id}-${i}`}>
              <span
                className="ahora-punto"
                style={{ background: h.civ.color, color: h.civ.color }}
              />
              <button
                className="ahora-civ"
                onClick={() => onSeleccionar(h.civ.id)}
                title={regiones.find((r) => r.id === h.civ.region)?.nombre}
              >
                {h.civ.nombre}
              </button>
              <span className="ahora-texto">{h.texto}</span>
              {h.anio !== anio && (
                <button className="ahora-anio num" onClick={() => onIrA(h.anio)}>
                  {anioCorto(h.anio, idioma)}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
