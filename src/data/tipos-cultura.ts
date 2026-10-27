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

/** Qué clase de entidad es: una organización política no es una cultura. */
export type EntidadPolitica = 'organizacion' | 'cultura' | 'pueblo' | 'dinastia';

/** Escala política, independiente de la escala editorial `Escala`. */
export type EscalaPolitica =
  | 'ciudad-estado'
  | 'principado'
  | 'ducado'
  | 'reino'
  | 'imperio'
  | 'estado'
  | 'confederacion'
  | 'organizacion-supranacional';

export interface Hito {
  anio: number;
  texto: string;
}

/** Fase de una organización con forma de gobierno, cargo y dinastía propios. */
export interface Periodo {
  id: string;
  nombre: string;
  desde: number;
  hasta: number;
  forma?: string;
  cargo?: string;
  dinastia?: string;
  /** Dos ramas pueden coexistir, como el Gran Seljuk y el Sultanato de Rum. */
  paralelo?: boolean;
  nota?: string;
}

/** Vocabulario controlado de formas de gobierno. */
export interface FormaGobierno {
  id: string;
  nombre: string;
  grupo: string;
  nota?: string;
}

/** Vocabulario controlado de escalas políticas. */
export interface EscalaPoliticaDef {
  id: EscalaPolitica;
  nombre: string;
  orden: number;
}

/** Vocabulario controlado de soberanía. */
export interface Soberania {
  id: string;
  nombre: string;
}

/** Cargo o institución que ejerce el poder. */
export interface Cargo {
  id: string;
  nombre: string;
  plural: string;
  categoria: string;
  forma?: string;
  orden: number;
}

/** Casa dinástica; puede gobernar varias organizaciones. */
export interface Dinastia {
  id: string;
  nombre: string;
  origen?: string;
  desde?: number;
  hasta?: number;
  nota?: string;
}

export interface Civilizacion {
  id: string;
  nombre: string;
  abrev: string;
  tipo: Tipo;
  categoria?: 'polidad' | 'cultura' | 'pueblo' | 'dinastia' | 'estado';
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
  /** Sistema de escritura documentado, si lo hubo. */
  escritura?: string;
  hitos: Hito[];
  nivel?: 'sobrano' | 'dependiente' | 'disperso';
  /** Facetas políticas; opcionales para no romper las fichas antiguas. */
  entidad?: EntidadPolitica;
  escalaPolitica?: EscalaPolitica;
  forma?: string;
  soberania?: string;
  cargoPrincipal?: string;
  dinastiaPrincipal?: string;
  /** Fases internas con su propia forma, cargo y dinastía. */
  periodos?: Periodo[];
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
  /** `polidad` = Estado soberano; `division` = virreinato, provincia, satrapía…
   *  `sobrano` = polidad dominante, `dependiente` = subordinada, `disperso` = sin territorio centralizado */
  nivel: 'polidad' | 'division' | 'sobrano' | 'dependiente' | 'disperso';
  /** Para una división, id de la polidad de la que depende. */
  superior?: string | null;
  /** Marcador de grado de dominio; «control» cuando el trazado expresa control, no posesión plena. */
  control?: string;
  /** Categoria categoria del territorio: polidad, cultura, pueblo, dinastia o estado */
  categoria?: 'polidad' | 'cultura' | 'pueblo' | 'dinastia' | 'estado';
  /** Fuente cartográfica o bibliográfica del trazado. */
  fuente?: string;
  /** Nivel de confianza del trazado: si no es alta, la interfaz marca «aprox.». */
  confianza?: 'alta' | 'media' | 'baja';
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
  escritura?: string;
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
  /** Las ciudades de eventos no se dibujan como ciudades principales. */
  principal?: boolean;
}

/** Gobernante de una civilización: capa separada de los hitos. */
export interface Gobernante {
  id: string;
  civilizacion: string;
  nombre: string;
  titulo: string;
  dinastia?: string;
  desde: number;
  hasta: number;
  nota?: string;
  /** Referencias nuevas; `titulo` y `dinastia` quedan como compatibilidad. */
  cargo?: string;
  dinastiaId?: string;
  periodo?: string;
  rol?: 'titular' | 'regente' | 'co-regente' | 'pretendiente';
}

/** Capital de una organización o de uno de sus periodos. */
export interface Capital {
  id: string;
  organizacion: string;
  periodo?: string;
  ciudad: string;
  rol: 'capital' | 'co-capital' | 'residencia-real' | 'sede-gobierno';
  desde: number;
  hasta?: number;
  nota?: string;
}

export type RolCiudadGobernante =
  | 'residencia'
  | 'nacimiento'
  | 'muerte'
  | 'entierro'
  | 'fundacion'
  | 'conquista'
  | 'asedio'
  | 'batalla'
  | 'tratado'
  | 'patronazgo'
  | 'peregrinacion'
  | 'centro-administrativo'
  | 'puerto'
  | 'revuelta';

/** Ciudad importante durante el reinado de un gobernante. */
export interface CiudadGobernante {
  id: string;
  gobernante: string;
  ciudad: string;
  rol: RolCiudadGobernante;
  desde?: number;
  hasta?: number;
  nota?: string;
}

/** Cómo toma forma un Estado contemporáneo. */
export type TipoFormacion =
  | 'independencia'
  | 'unificacion'
  | 'constitucion'
  | 'reconocimiento'
  | 'sucesion';

/** Estado contemporáneo: cuándo y cómo se formó, no su historia medieval. */
export interface PaisActual {
  /** ISO 3166-1 alpha-2. */
  id: string;
  nombre: string;
  /** Año del hecho fundacional. */
  formacion: number;
  tipoFormacion: TipoFormacion;
  /** Explica el caso concreto: quién, cómo y desde qué Estado anterior. */
  nota: string;
  /** El año es aproximado o el proceso fue gradual. */
  aproximada?: boolean;
  fuente?: string;
}
