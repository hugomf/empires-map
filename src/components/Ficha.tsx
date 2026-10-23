import { useState } from 'react';
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

  /**
   * El periodo elegido se guarda junto al id de la civilización: al cambiar de
   * ficha la selección anterior deja de aplicar y se vuelve al primer periodo,
   * sin necesidad de un efecto que reinicie el estado.
   */
  const [periodoElegido, setPeriodoElegido] = useState<{ civ: string; id: string } | null>(
    null,
  );

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
  const ciudades = datos.ciudades.filter(
    (c) => c.civilizacion === civ.id && c.principal !== false,
  );
  const religiones = datos.religiones.filter((r) => r.civilizacion === civ.id);
  const deidades = datos.deidades.filter((d) => d.civilizacion === civ.id);
  const artefactos = datos.artefactos.filter((a) => a.civilizacion === civ.id);

  const periodos = civ.periodos ?? [];
  const periodoId = periodoElegido?.civ === civ.id ? periodoElegido.id : null;
  const setPeriodoId = (id: string) => setPeriodoElegido({ civ: civ.id, id });
  const periodoActivo = periodos.find((p) => p.id === periodoId) ?? periodos[0] ?? null;
  const gobernantesCiv = datos.gobernantes.filter((g) => g.civilizacion === civ.id);
  const gobernantes = periodoActivo
    ? gobernantesCiv.filter((g) => !g.periodo || g.periodo === periodoActivo.id)
    : gobernantesCiv;

  const cargo = datos.cargos.find(
    (c) => c.id === (periodoActivo?.cargo ?? civ.cargoPrincipal),
  );
  const forma = datos.formas.find((x) => x.id === (periodoActivo?.forma ?? civ.forma));
  const escala = datos.escalasPoliticas.find((x) => x.id === civ.escalaPolitica);
  const dinastia = datos.dinastias.find(
    (d) => d.id === (periodoActivo?.dinastia ?? civ.dinastiaPrincipal),
  );
  const facetas = [escala?.nombre, forma?.nombre, cargo?.nombre, dinastia?.nombre].filter(
    (x): x is string => Boolean(x),
  );

  const capitales = datos.capitales.filter((cap) => {
    if (cap.organizacion !== civ.id) return false;
    if (!periodoActivo) return true;
    /* Si la capital declara periodo, manda esa asignación: evita mezclar,
       por ejemplo, las capitales de Rum con las del Gran Seljuk. */
    if (cap.periodo) return cap.periodo === periodoActivo.id;
    const hasta = cap.hasta ?? civ.fin;
    return cap.desde <= periodoActivo.hasta && hasta >= periodoActivo.desde;
  });

  const ciudadesDe = (gobernanteId: string) =>
    datos.ciudadesGobernante
      .filter((cg) => cg.gobernante === gobernanteId)
      .flatMap((cg) => {
        const ciudad = datos.ciudades.find((c) => c.id === cg.ciudad);
        return ciudad ? [{ ...cg, ciudad }] : [];
      });

  const tituloGobierno = cargo?.plural ?? t('ficha.gobernantes');

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
        {facetas.length > 0 && (
          <div className="ficha-facetas">
            {facetas.map((faceta) => (
              <span key={faceta} className="ficha-faceta">
                {faceta}
              </span>
            ))}
          </div>
        )}
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

        {gobernantes.length > 0 && (
          <div className="ficha-bloque ficha-gobierno">
            <h3>{tituloGobierno}</h3>

            {periodos.length > 1 && (
              <div className="periodos" role="tablist" aria-label={t('ficha.periodos')}>
                {periodos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={periodoActivo?.id === p.id}
                    className={`periodo${periodoActivo?.id === p.id ? ' activo' : ''}`}
                    onClick={() => setPeriodoId(p.id)}
                    title={p.nota}
                  >
                    <span className="periodo-nombre">{p.nombre}</span>
                    <span className="periodo-fechas num">
                      {anioCorto(p.desde, idioma)}–{anioCorto(p.hasta, idioma)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {periodoActivo?.nota && <p className="ficha-periodo-nota">{periodoActivo.nota}</p>}

            {capitales.length > 0 && (
              <div className="ficha-capitales">
                <div className="ficha-capitales-titulo">{t('ficha.capitales')}</div>
                <ul>
                  {capitales.map((cap) => {
                    const ciudad = datos.ciudades.find((c) => c.id === cap.ciudad);
                    return (
                      <li key={cap.id}>
                        <span className="capital-nombre">{ciudad?.nombre ?? cap.ciudad}</span>
                        <span className="capital-fechas num">
                          {anioCorto(cap.desde, idioma)}
                          {cap.hasta !== undefined ? `–${anioCorto(cap.hasta, idioma)}` : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <ul className="gobernantes">
              {gobernantes.map((g) => {
                const cargoG = datos.cargos.find((c) => c.id === g.cargo);
                const dinastiaG = datos.dinastias.find((d) => d.id === g.dinastiaId);
                const ciudadesG = ciudadesDe(g.id);
                return (
                  <li
                    key={g.id}
                    className={g.rol && g.rol !== 'titular' ? 'no-titular' : undefined}
                  >
                    <div className="gobernante-cab">
                      <span className="gobernante-nombre">{g.nombre}</span>
                      <span className="gobernante-fechas num">
                        {anioCorto(g.desde, idioma)}
                        {g.hasta !== g.desde ? `–${anioCorto(g.hasta, idioma)}` : ''}
                      </span>
                    </div>
                    <div className="gobernante-cargo">
                      {cargoG?.nombre ?? g.titulo}
                      {(dinastiaG?.nombre ?? g.dinastia)
                        ? ` · ${dinastiaG?.nombre ?? g.dinastia}`
                        : ''}
                      {g.rol && g.rol !== 'titular'
                        ? ` · ${t(`rolGobernante.${g.rol}`)}`
                        : ''}
                    </div>
                    {g.nota && <p>{g.nota}</p>}
                    {ciudadesG.length > 0 && (
                      <div className="gobernante-ciudades">
                        {ciudadesG.map((cg) => (
                          <span key={cg.id} className="ciudad-rol" title={cg.nota}>
                            <span className="ciudad-rol-nombre">{cg.ciudad.nombre}</span>
                            <span className="ciudad-rol-tipo">{t(`rolCiudad.${cg.rol}`)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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

        <div className="ficha-bloque">
          <h3>{t('ficha.cultura')}</h3>
          <div className="ficha-escritura">
            <span className="ficha-escritura-titulo">{t('ficha.escritura')}</span>
            {civ.escritura ? (
              <span className="ficha-escritura-valor">{civ.escritura}</span>
            ) : (
              <span className="ficha-vacio-valor">{t('ficha.sinRegistro')}</span>
            )}
          </div>
        </div>

        <div className="ficha-bloque">
          <h3>{t('ficha.artefactos')}</h3>
          {artefactos.length ? (
            <ul className="artefactos">
              {artefactos.map((a) => (
                <li key={a.id}>
                  <div className="artefacto-nombre">{a.nombre}</div>
                  <div className="artefacto-tipo">{a.tipo}</div>
                  <p>{a.descripcion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--pergamino-3)' }}>{t('ficha.sinRegistro')}</p>
          )}
        </div>

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
              {divisiones.map((tt) => {
                const superior = tt.superior
                  ? datos.civilizaciones.find((c) => c.id === tt.superior)?.nombre ??
                    tt.superior
                  : null;
                const aproximada = tt.confianza && tt.confianza !== 'alta';
                return (
                  <li key={tt.id} className="es-subdivision">
                    <span className="div-nombre">
                      {tt.nombre?.replace(/^(Provincia|Province): /, '').replace(/^(Satrapía|Satrapy): /, '')}
                    </span>
                    <span className="div-fechas num">
                      {tt.desde !== null ? anioCorto(tt.desde, idioma) : ''}
                      {tt.hasta !== null ? `–${anioCorto(tt.hasta, idioma)}` : '–'}
                    </span>
                    {aproximada && (
                      <span className="div-aprox" title={tt.fuente ?? t('ficha.aprox')}>
                        {t('ficha.aprox')}
                      </span>
                    )}
                    {superior && (
                      <span className="div-superior">
                        {t('ficha.superior')}: {superior}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="ficha-bloque">
          <h3>{t('ficha.hitos')}</h3>
          <ul className="hitos">
            {civ.hitos.map((h, i) => (
              <li
                key={`${civ.id}-${i}`}
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
