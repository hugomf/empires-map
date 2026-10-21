import * as ES from './datos.generados';
import type { Idioma } from '../lib/i18n';
import type {
  Artefacto,
  Ciudad,
  Civilizacion,
  Deidad,
  Region,
  Religion,
  Territorio,
} from './tipos-cultura';

export interface Catalogo {
  civilizaciones: Civilizacion[];
  regiones: Region[];
  territorios: Territorio[];
  religiones: Religion[];
  deidades: Deidad[];
  ciudades: Ciudad[];
  artefactos: Artefacto[];
  anioMin: number;
  anioMax: number;
}

const de = (m: typeof ES): Catalogo => ({
  civilizaciones: m.CIVILIZACIONES,
  regiones: m.REGIONES,
  territorios: m.TERRITORIOS,
  religiones: m.RELIGIONES,
  deidades: m.DEIDADES,
  ciudades: m.CIUDADES,
  artefactos: m.ARTEFACTOS,
  anioMin: m.ANIO_MIN,
  anioMax: m.ANIO_MAX,
});

const ES_CATALOGO = de(ES);

/** El catálogo inglés se carga bajo demanda: no entra en el bundle inicial. */
let EN_CATALOGO: Catalogo | null = null;
let promesaEn: Promise<void> | null = null;

export function inglesListo(): boolean {
  return EN_CATALOGO !== null;
}

/**
 * Comparte la misma promesa entre llamadas: con el doble montaje de
 * StrictMode, dos cargas simultáneas dejarían el catálogo a medias.
 */
export function cargarIngles(): Promise<void> {
  if (EN_CATALOGO) return Promise.resolve();
  if (!promesaEn) {
    promesaEn = import('./datos.en.generados')
      .then((m) => {
        EN_CATALOGO = de(m as unknown as typeof ES);
      })
      .catch(() => {
        EN_CATALOGO = null;
      });
  }
  return promesaEn;
}

let activo: Idioma = 'en';

/** Fija el catálogo activo. Idempotente: se llama en cada render de la app. */
export function fijarIdioma(i: Idioma): void {
  activo = i;
}

export function catalogo(): Catalogo {
  if (activo === 'en') return EN_CATALOGO ?? ES_CATALOGO;
  return ES_CATALOGO;
}
