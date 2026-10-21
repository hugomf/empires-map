export type Tipo =
  | 'imperio'
  | 'reino'
  | 'estado'
  | 'dinastia'
  | 'cultura'
  | 'pueblo'
  | 'confederacion';

export type Grupo = 'Europa' | 'Asia' | 'África' | 'América' | 'Oceanía';

/** Escala editorial: las menores se pueden ocultar con un filtro. */
export type Escala = 'mayor' | 'menor';

export interface Hito {
  id: string;
  anio: number;
  texto: string;
}

export interface Civilizacion {
  id: string;
  nombre: string;
  abrev: string;
  tipo: Tipo;
  region: string;
  inicio: number;
  fin: number;
  apogeo: [number, number];
  declive: [number, number] | null;
  peso: number;
  /** Si se omite, se deduce del peso: `peso >= 5` es mayor. */
  escala?: Escala;
  territorio: boolean;
  color: string;
  sintesis: string;
  caida: string;
  legado: string;
  /** Nombres alternativos para el buscador: históricos, exónimos y variantes. */
  alias?: string[];
  hitos: Hito[];
}

export interface Region {
  id: string;
  nombre: string;
  grupo: Grupo;
  paises: string[];
  ancla: [number, number];
}

/** Territorio de ocupación: polígono con fecha. */
export interface Territorio {
  id: string;
  civilizacion: string;
  tipo: 'tierra' | 'ciudad';
  nombre: string | null;
  ancla: [number, number] | null;
  desde: number | null;
  hasta: number | null;
  anillos: [number, number][][];
  /** `polidad` = Estado soberano; `division` = virreinato, provincia, satrapía… */
  nivel: 'polidad' | 'division';
  /** Para una división, id de la polidad de la que depende. */
  superior?: string | null;
}

/** Pieza de cultura material con un icono. */
export interface Artefacto {
  id: string;
  civilizacion: string;
  nombre: string;
  tipo: string;
  icono: string;
  descripcion: string;
  material?: string;
}

export interface Deidad {
  id: string;
  civilizacion: string;
  nombre: string;
  dominio: string;
  icono: string;
}

export interface Religion {
  id: string;
  civilizacion: string;
  nombre: string;
  descripcion: string;
  /** Cambio de religión a lo largo del tiempo. */
  desde?: number;
  hasta?: number;
}

export interface Ciudad {
  id: string;
  civilizacion: string;
  nombre: string;
  /** Nombre y país actuales, para orientarse en el mapa de hoy. */
  actual?: string;
  lat: number;
  lon: number;
}
