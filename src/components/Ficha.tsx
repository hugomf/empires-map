import type { Catalogo } from '../data/catalogo';
import type { Civilizacion } from '../data/tipos-cultura';
import type { Idioma } from '../lib/i18n';
import { COLOR_TIPO, fase } from '../lib/dominio';
import { anio, anioCorto, duracion, intervalo } from '../lib/tiempo';

type T = (clave: string, vars?: Record<string, string | number>) => string;

interface Props {
  civ: Civilizacion | null;
  datos: Catalogo;
  anio: number;
  onIrA: (a: number) => void;
  abierta: boolean;
  t: T;
  idioma: Idioma;
}

export function Ficha({ civ, datos, anio: actual, onIrA, abierta, t, idioma }: Props) {
  const rango = Math.max(1, datos.anioMax - datos.anioMin);
  const pct = (a: number) =>
    ((Math.max(datos.anioMin, Math.min(datos.anioMax, a)) - datos.anioMin) / rango) * 100;
  /** Porcentaje acotado: las chrono más antiguas que el eje salen por la izquierda. */
  const pct0 = (a: number) => Math.max(0, Math.min(100, pct(a)));

  if (!civ) {
    return (
      <aside className={`ficha${abierta ? ' abierta' : ''}`}>
        <div className="ficha-vacia">
          <div className="glifo">◈</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{t('ficha.vacio')}</p>
        </div>
      </aside>
    );
  }

  const region = datos.regiones.find((r) => r.id === civ.region);
  const f = fase(civ, actual);
  const viva = actual >= civ.inicio && actual <= civ.fin;
  const ciudades = datos.ciudades.filter((c) => c.civilizacion === civ.id);
  const religiones = datos.religiones.filter((r) => r.civilizacion === civ.id);
  const deidades = datos.deidades.filter((d) => d.civilizacion === civ.id);
  const artefactos = datos.artefactos.filter((a) => a.civilizacion === civ.id);
  const polidades = datos.territorios.filter(
    (tt) => tt.civilizacion === civ.id && tt.nivel === 'polidad',
  );
  const divisiones = datos.territorios.filter(
    (tt) => tt.civilizacion === civ.id && tt.nivel === 'division',
  );

  return (
    <aside className={`ficha${abierta ? ' abierta' : ''}`}>
      <div className="ficha-banda" style={{ background: civ.color }} />
      <div className="ficha-cuerpo">
        <span
          className="ficha-tipo"
          style={{ color: COLOR_TIPO[civ.tipo], borderColor: `${civ.color}55` }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: civ.color,
              display: 'inline-block',
            }}
          />
          {t(`tipo.${civ.tipo}`)}
        </span>

        <h2>{civ.nombre}</h2>
        <div className="ficha-sub">
          {region?.nombre ?? civ.region} · {duracion(civ.inicio, civ.fin, idioma)}
        </div>
        <a
          className="ficha-wiki"
          href={`https://${idioma === 'en' ? 'en' : 'es'}.wikipedia.org/wiki/${encodeURIComponent(civ.nombre.replace(/ /g, '_'))}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('ficha.wikipedia')} ↗
        </a>

        <dl className="ficha-datos">
          <dt>{t('ficha.vigencia')}</dt>
          <dd className="num">{intervalo(civ.inicio, civ.fin, idioma)}</dd>
          <dt>{t('ficha.cuspide')}</dt>
          <dd className="num">{intervalo(civ.apogeo[0], civ.apogeo[1], idioma)}</dd>
          <dt>{t('ficha.decadencia')}</dt>
          <dd className="num">
            {civ.declive ? intervalo(civ.declive[0], civ.declive[1], idioma) : '—'}
          </dd>
          <dt>{t('ficha.ahora')}</dt>
          <dd className="num">
            {viva ? (
              <>
                {t(`fase.${f}`)}
                <span style={{ color: 'var(--pergamino-3)' }}>
                  {' '}
                  · {anio(actual, idioma)}
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--pergamino-3)' }}>
                {actual < civ.inicio ? t('ficha.aunNo') : t('ficha.yaNo')}
              </span>
            )}
          </dd>
        </dl>

        <div
          className="barra-vida"
          title={`${anio(civ.inicio, idioma)} — ${anio(civ.fin, idioma)}`}
        >
          <span
            className="span vida"
            style={{
              left: `${pct0(civ.inicio)}%`,
              width: `${pct(civ.fin) - pct(civ.inicio)}%`,
              background: civ.color,
            }}
          />
          <span
            className="span apogeo"
            style={{
              left: `${pct0(civ.apogeo[0])}%`,
              width: `${pct(civ.apogeo[1]) - pct(civ.apogeo[0])}%`,
              background: civ.color,
            }}
          />
          {civ.declive && (
            <span
              className="span declive"
              style={{
                left: `${pct0(civ.declive[0])}%`,
                width: `${pct(civ.declive[1]) - pct(civ.declive[0])}%`,
                background: civ.color,
              }}
            />
          )}
          <span className="aguja" style={{ left: `${pct0(actual)}%` }} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 5,
            fontSize: 9,
          }}
          className="num"
        >
          <span style={{ color: 'var(--pergamino-3)' }}>{anioCorto(datos.anioMin, idioma)}</span>
          <span style={{ color: 'var(--pergamino-3)' }}>{anioCorto(datos.anioMax, idioma)}</span>
        </div>

        <div className="ficha-bloque">
          <h3>{t('ficha.civilizacion')}</h3>
          <p>{civ.sintesis}</p>
        </div>

        <div className="ficha-bloque">
          <h3>{t('ficha.caida')}</h3>
          <p>{civ.caida}</p>
        </div>

        <div className="ficha-bloque">
          <h3>{t('ficha.legado')}</h3>
          <p>{civ.legado}</p>
        </div>

        <div className="ficha-bloque">
          <h3>{t('ficha.ciudades')}</h3>
          {ciudades.length ? (
            <ul className="ficha-ciudades">
              {ciudades.map((c) => (
                <li key={c.id}>
                  <span className="ciudad-nombre">{c.nombre}</span>
                  {c.actual && <span className="ciudad-actual">{c.actual}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--pergamino-3)' }}>{t('ficha.sinRegistro')}</p>
          )}
        </div>

        {religiones.length > 0 && (
          <div className="ficha-bloque">
            <h3>{t('ficha.religion')}</h3>
            {religiones.map((r) => {
              const activa =
                actual >= (r.desde ?? -Infinity) && actual <= (r.hasta ?? Infinity);
              return (
                <div key={r.id} className={`religion${activa ? ' activa' : ''}`}>
                  <div className="religion-cab">
                    <span className="religion-nombre">{r.nombre}</span>
                    {r.desde !== undefined && (
                      <span className="religion-fechas num">
                        {anioCorto(r.desde, idioma)}
                        {r.hasta !== undefined ? `–${anioCorto(r.hasta, idioma)}` : '–'}
                      </span>
                    )}
                  </div>
                  <p>{r.descripcion}</p>
                </div>
              );
            })}
          </div>
        )}

        {deidades.length > 0 && (
          <div className="ficha-bloque">
            <h3>{t('ficha.deidades')}</h3>
            <ul className="deidades">
              {deidades.map((d) => (
                <li key={d.id}>
                  <span className="deidad-nombre">{d.nombre}</span>
                  <span className="deidad-dominio">{d.dominio}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {artefactos.length > 0 && (
          <div className="ficha-bloque">
            <h3>{t('ficha.artefactos')}</h3>
            <ul className="artefactos">
              {artefactos.map((a) => (
                <li key={a.id}>
                  <div className="artefacto-nombre">{a.nombre}</div>
                  <div className="artefacto-tipo">{a.tipo}</div>
                  <p>{a.descripcion}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(polidades.length > 0 || divisiones.length > 0) && (
          <div className="ficha-bloque">
            <h3>{t('ficha.division')}</h3>
            <ul className="divisiones">
              {polidades.map((tt) => (
                <li key={tt.id}>
                  <span className="div-nombre">{tt.nombre}</span>
                  <span className="div-fechas num">
                    {tt.desde !== null ? anioCorto(tt.desde, idioma) : ''}
                    {tt.hasta !== null ? `–${anioCorto(tt.hasta, idioma)}` : '–'}
                  </span>
                </li>
              ))}
              {divisiones.map((tt) => (
                <li key={tt.id} className="es-subdivision">
                  <span className="div-nombre">
                    {tt.nombre?.replace(/^(Provincia|Province): /, '').replace(/^(Satrapía|Satrapy): /, '')}
                  </span>
                  <span className="div-fechas num">
                    {tt.desde !== null ? anioCorto(tt.desde, idioma) : ''}
                    {tt.hasta !== null ? `–${anioCorto(tt.hasta, idioma)}` : '–'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ficha-bloque">
          <h3>{t('ficha.hitos')}</h3>
          <ul className="hitos">
            {civ.hitos.map((h) => (
              <li
                key={h.id}
                className={`hito${h.anio === actual ? ' activo' : ''}`}
                onClick={() => onIrA(h.anio)}
                title={t('ficha.irAnio')}
              >
                <span className="h-anio">{anioCorto(h.anio, idioma)}</span>
                <span className="h-txt">{h.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        {idioma === 'en' && (
          <p className="ficha-nota">{t('ficha.contenido')}</p>
        )}
      </div>
    </aside>
  );
}
