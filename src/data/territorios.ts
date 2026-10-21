/**
 * Territorios de ocupación: polígonos dibujados a mano sobre [longitud, latitud]
 * que sustituyen al relleno del "país moderno" cuando la civilización controlaba
 * una fracción pequeña de su región actual.
 *
 * `tipo: 'tierra'` → superficie continua (se tiñe).
 * `tipo: 'ciudad'` → asentamiento puntual (punto + etiqueta).
 */

export interface Poligono {
  tipo: 'tierra' | 'ciudad';
  nombre?: string;
  /** Punto donde se ancla la etiqueta. */
  ancla?: [number, number];
  /** El primer anillo es el exterior; los siguientes son agujeros. */
  anillos: [number, number][][];
  /** Año en que empieza a controlarse este territorio (negativo = a.C.). */
  desde?: number;
  /** Año en que se pierde (si se mantiene, `undefined`). */
  hasta?: number;
}

/** Pequeño rombo alrededor de un punto, para marcar ciudades. */
const ciudad = (lon: number, lat: number, r = 0.085): [number, number][][] => [
  [
    [lon - r, lat],
    [lon, lat + r * 1.25],
    [lon + r, lat],
    [lon, lat - r * 1.25],
    [lon - r, lat],
  ],
];

/** Territorio con fecha: aparece al ser conquistado y desaparece al perderse. */
const tierra = (
  nombre: string,
  ancla: [number, number],
  desde: number,
  hasta: number | undefined,
  ...anillos: [number, number][][]
): Poligono => ({ tipo: 'tierra', nombre, ancla, desde, hasta, anillos });

export const TERRITORIOS: Record<string, Poligono[]> = {
  // ───────────────────────── CANAÁN / LAS DOCE TRIBAS ─────────────────────────
  israel: [
    {
      tipo: 'tierra',
      nombre: 'Neftalí',
      ancla: [35.48, 33.2],
      anillos: [
        [
          [35.12, 33.05],
          [35.32, 33.42],
          [35.68, 33.44],
          [35.9, 33.18],
          [35.66, 32.9],
          [35.36, 32.96],
          [35.12, 33.05],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Zabulón y Aser',
      ancla: [35.05, 32.82],
      anillos: [
        [
          [34.86, 32.66],
          [35.16, 33.02],
          [35.3, 32.86],
          [35.06, 32.56],
          [34.84, 32.5],
          [34.86, 32.66],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Isacar',
      ancla: [35.28, 32.6],
      anillos: [
        [
          [35.06, 32.46],
          [35.4, 32.5],
          [35.46, 32.72],
          [35.2, 32.82],
          [35.02, 32.7],
          [35.06, 32.46],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Efraín',
      ancla: [35.24, 32.32],
      anillos: [
        [
          [34.96, 32.06],
          [35.28, 32.16],
          [35.5, 32.38],
          [35.38, 32.6],
          [35.1, 32.62],
          [34.92, 32.38],
          [34.96, 32.06],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Manassé',
      ancla: [35.28, 32.8],
      anillos: [
        [
          [34.96, 32.58],
          [35.24, 32.64],
          [35.52, 32.5],
          [35.62, 32.82],
          [35.36, 33.08],
          [35.06, 32.98],
          [34.94, 32.8],
          [34.96, 32.58],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Judá',
      ancla: [35.08, 31.34],
      anillos: [
        [
          [34.62, 31.16],
          [34.92, 31.52],
          [35.26, 31.66],
          [35.48, 31.42],
          [35.3, 31.06],
          [34.9, 30.9],
          [34.6, 30.98],
          [34.62, 31.16],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Benjamín',
      ancla: [35.2, 31.8],
      anillos: [
        [
          [34.94, 31.56],
          [35.3, 31.68],
          [35.52, 31.86],
          [35.34, 32.08],
          [35.02, 32.02],
          [34.88, 31.8],
          [34.94, 31.56],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Galaad',
      ancla: [36.08, 31.82],
      anillos: [
        [
          [35.62, 31.94],
          [36.2, 32.24],
          [36.52, 31.94],
          [36.4, 31.3],
          [35.9, 31.4],
          [35.62, 31.62],
          [35.62, 31.94],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Rubén y Simeón',
      ancla: [35.76, 31.14],
      anillos: [
        [
          [35.4, 31.5],
          [35.9, 31.56],
          [36.12, 31.3],
          [35.98, 30.78],
          [35.58, 30.9],
          [35.34, 31.2],
          [35.4, 31.5],
        ],
      ],
    },
  ],

  // ───────────────────────── FENICIA ─────────────────────────
  fenicios: [
    {
      tipo: 'tierra',
      nombre: 'Costa fenicia',
      ancla: [35.35, 33.85],
      anillos: [
        [
          [34.76, 34.16],
          [35.02, 33.62],
          [35.06, 33.16],
          [35.36, 33.0],
          [35.62, 33.24],
          [35.66, 33.52],
          [35.86, 33.96],
          [36.0, 34.44],
          [36.16, 34.82],
          [35.98, 34.98],
          [35.62, 34.62],
          [35.34, 34.2],
          [35.18, 33.72],
          [34.86, 33.76],
          [34.76, 34.16],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tiro', ancla: [35.19, 33.27], anillos: ciudad(35.19, 33.27) },
    { tipo: 'ciudad', nombre: 'Sidon', ancla: [35.46, 33.56], anillos: ciudad(35.46, 33.56) },
    { tipo: 'ciudad', nombre: 'Biblos', ancla: [35.48, 34.12], anillos: ciudad(35.48, 34.12) },
    { tipo: 'ciudad', nombre: 'Arwad', ancla: [35.78, 34.79], anillos: ciudad(35.78, 34.79) },
  ],

  // ───────────────────────── FILISTEA ─────────────────────────
  filisteos: [
    {
      tipo: 'tierra',
      nombre: 'Pentápolis',
      ancla: [34.7, 31.82],
      anillos: [
        [
          [34.4, 31.44],
          [34.74, 31.58],
          [35.0, 31.94],
          [34.98, 32.16],
          [34.74, 32.1],
          [34.56, 31.86],
          [34.4, 31.44],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Gaza', ancla: [34.47, 31.52], anillos: ciudad(34.47, 31.52) },
    { tipo: 'ciudad', nombre: 'Ascalón', ancla: [34.67, 31.67], anillos: ciudad(34.67, 31.67) },
    { tipo: 'ciudad', nombre: 'Yavné', ancla: [34.75, 31.99], anillos: ciudad(34.75, 31.99) },
    { tipo: 'ciudad', nombre: 'Gath', ancla: [34.92, 32.08], anillos: ciudad(34.92, 32.08) },
    { tipo: 'ciudad', nombre: 'Ecrón', ancla: [34.86, 31.83], anillos: ciudad(34.86, 31.83) },
  ],

  // ───────────────────────── EGIPTO ANTIGUO ─────────────────────────
  egipto: [
    {
      tipo: 'tierra',
      nombre: 'Valle del Nilo',
      ancla: [31.8, 26.5],
      anillos: [
        [
          [29.8, 31.4],
          [32.6, 31.4],
          [32.8, 30.2],
          [33.4, 29.0],
          [34.2, 27.6],
          [34.6, 25.6],
          [35.2, 23.8],
          [35.4, 22.2],
          [34.9, 21.9],
          [33.4, 22.6],
          [32.4, 24.4],
          [31.6, 26.6],
          [30.2, 29.0],
          [29.6, 30.6],
          [29.8, 31.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tebas', ancla: [32.64, 25.72], anillos: ciudad(32.64, 25.72) },
    { tipo: 'ciudad', nombre: 'Menfis', ancla: [31.25, 29.87], anillos: ciudad(31.25, 29.87) },
  ],

  // ───────────────────────── MESOPOTAMIA ─────────────────────────
  sumer: [
    {
      tipo: 'tierra',
      nombre: 'Mesopotamia del Sur',
      ancla: [46.2, 31.0],
      anillos: [
        [
          [44.1, 31.3],
          [44.9, 30.6],
          [45.8, 30.25],
          [46.9, 30.2],
          [47.7, 30.4],
          [48.1, 30.8],
          [48.2, 31.4],
          [47.7, 31.8],
          [46.9, 32.0],
          [45.9, 31.9],
          [44.9, 31.7],
          [44.2, 31.6],
          [44.1, 31.3],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Uruk', ancla: [45.64, 31.32], anillos: ciudad(45.64, 31.32) },
    { tipo: 'ciudad', nombre: 'Ur', ancla: [46.1, 30.96], anillos: ciudad(46.1, 30.96) },
  ],
  babilonia: [
    {
      tipo: 'tierra',
      nombre: 'Babilonia',
      ancla: [44.42, 32.54],
      anillos: [
        [
          [43.9, 32.1],
          [44.7, 31.9],
          [45.6, 31.7],
          [45.9, 32.1],
          [45.4, 32.7],
          [44.7, 32.9],
          [44.0, 32.7],
          [43.9, 32.1],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Babilonia', ancla: [44.42, 32.54], anillos: ciudad(44.42, 32.54) },
  ],
  asiria: [
    {
      tipo: 'tierra',
      nombre: 'Alto Mesopotamia',
      ancla: [43.4, 36.2],
      anillos: [
        [
          [38.6, 36.0],
          [40.2, 35.2],
          [42.2, 34.2],
          [44.4, 33.4],
          [46.4, 33.6],
          [48.0, 35.2],
          [48.4, 37.0],
          [47.0, 38.4],
          [44.6, 38.2],
          [42.2, 37.6],
          [40.0, 36.8],
          [38.6, 36.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Nínive', ancla: [43.15, 36.36], anillos: ciudad(43.15, 36.36) },
  ],

  // ───────────────────────── EGEO Y MEDITERRÁNEO ─────────────────────────
  minoicos: [
    {
      tipo: 'tierra',
      nombre: 'Creta',
      ancla: [24.9, 35.3],
      anillos: [
        [
          [23.52, 35.62],
          [24.1, 35.42],
          [24.7, 35.34],
          [25.3, 35.34],
          [25.8, 35.16],
          [26.12, 35.34],
          [26.32, 35.58],
          [26.04, 35.62],
          [25.44, 35.42],
          [24.86, 35.42],
          [24.3, 35.5],
          [23.7, 35.72],
          [23.52, 35.62],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Cnoso', ancla: [25.16, 35.3], anillos: ciudad(25.16, 35.3) },
  ],
  micenicos: [
    {
      tipo: 'tierra',
      nombre: 'Peloponeso',
      ancla: [22.1, 37.3],
      anillos: [
        [
          [21.0, 37.4],
          [21.6, 38.1],
          [22.4, 38.28],
          [23.1, 38.2],
          [23.24, 37.5],
          [22.9, 37.0],
          [22.3, 36.6],
          [21.7, 36.7],
          [21.1, 37.0],
          [21.0, 37.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Micenas', ancla: [22.76, 37.73], anillos: ciudad(22.76, 37.73) },
    { tipo: 'ciudad', nombre: 'Pilos', ancla: [21.68, 36.8], anillos: ciudad(21.68, 36.8) },
  ],
  griegos: [
    {
      tipo: 'tierra',
      nombre: 'Grecia continental',
      ancla: [22.4, 38.6],
      anillos: [
        [
          [20.1, 39.6],
          [21.0, 40.6],
          [22.4, 41.2],
          [24.0, 41.1],
          [26.2, 40.6],
          [26.4, 39.4],
          [25.2, 38.2],
          [24.0, 37.4],
          [22.6, 36.6],
          [21.2, 37.4],
          [20.2, 38.4],
          [20.1, 39.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Atenas', ancla: [23.73, 37.98], anillos: ciudad(23.73, 37.98) },
    { tipo: 'ciudad', nombre: 'Esparta', ancla: [22.43, 37.07], anillos: ciudad(22.43, 37.07) },
  ],
  etruscos: [
    {
      tipo: 'tierra',
      nombre: 'Etruria',
      ancla: [11.4, 43.1],
      anillos: [
        [
          [10.3, 42.6],
          [10.9, 42.1],
          [11.9, 41.9],
          [12.7, 42.4],
          [12.6, 43.4],
          [11.9, 43.9],
          [10.8, 43.6],
          [10.3, 43.0],
          [10.3, 42.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Vulci', ancla: [11.7, 42.42], anillos: ciudad(11.7, 42.42) },
  ],
  hititas: [
    {
      tipo: 'tierra',
      nombre: 'Anatolia central',
      ancla: [34.2, 38.6],
      anillos: [
        [
          [29.6, 36.6],
          [31.6, 35.8],
          [34.4, 35.6],
          [37.2, 36.6],
          [38.6, 38.4],
          [37.8, 40.4],
          [35.4, 41.0],
          [32.6, 40.4],
          [30.4, 39.0],
          [29.6, 36.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Hattusa', ancla: [34.62, 40.02], anillos: ciudad(34.62, 40.02) },
  ],
  nabateos: [
    {
      tipo: 'tierra',
      nombre: 'Petra y el Néguev',
      ancla: [35.8, 30.4],
      anillos: [
        [
          [34.7, 30.4],
          [35.4, 29.2],
          [36.6, 28.4],
          [37.6, 29.4],
          [37.0, 31.2],
          [35.8, 31.6],
          [34.8, 31.2],
          [34.7, 30.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Petra', ancla: [35.44, 30.33], anillos: ciudad(35.44, 30.33) },
  ],
  aramas: [
    {
      tipo: 'tierra',
      nombre: 'Aram',
      ancla: [39.0, 35.0],
      anillos: [
        [
          [36.4, 32.8],
          [38.2, 33.4],
          [40.2, 34.2],
          [41.6, 35.4],
          [41.2, 36.8],
          [39.4, 37.4],
          [37.6, 36.6],
          [36.2, 35.0],
          [36.4, 32.8],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Damasco', ancla: [36.3, 33.51], anillos: ciudad(36.3, 33.51) },
  ],
  cartago: [
    {
      tipo: 'tierra',
      nombre: 'África del Norte y la costa',
      ancla: [10.2, 35.2],
      anillos: [
        [
          [8.2, 36.6],
          [10.2, 37.2],
          [11.4, 36.2],
          [11.6, 34.6],
          [10.8, 33.2],
          [9.2, 33.6],
          [8.0, 35.0],
          [8.2, 36.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Cartago', ancla: [10.32, 36.85], anillos: ciudad(10.32, 36.85) },
  ],

  // ───────────────────────── ASIA ─────────────────────────
  indus: [
    {
      tipo: 'tierra',
      nombre: 'Valle del Indo',
      ancla: [69.0, 26.5],
      anillos: [
        [
          [66.6, 24.2],
          [68.4, 26.6],
          [70.4, 28.6],
          [72.4, 31.0],
          [72.0, 33.2],
          [70.4, 33.8],
          [68.2, 32.4],
          [66.6, 30.0],
          [65.4, 27.4],
          [65.6, 25.2],
          [66.6, 24.2],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Mohenjo-Daro', ancla: [68.14, 27.33], anillos: ciudad(68.14, 27.33) },
  ],
  mongoles: [
    {
      tipo: 'tierra',
      nombre: 'La estepa eurasiática',
      ancla: [100.0, 45.0],
      anillos: [
        [
          [78.0, 42.0],
          [82.0, 48.0],
          [88.0, 52.0],
          [96.0, 55.0],
          [106.0, 54.0],
          [116.0, 52.0],
          [124.0, 47.0],
          [121.0, 40.0],
          [112.0, 36.0],
          [102.0, 37.0],
          [92.0, 38.0],
          [83.0, 39.0],
          [78.0, 42.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Karakórum', ancla: [102.85, 47.2], anillos: ciudad(102.85, 47.2) },
  ],
  kushanos: [
    {
      tipo: 'tierra',
      nombre: 'Gandhara y Bactria',
      ancla: [68.0, 35.6],
      anillos: [
        [
          [63.0, 34.0],
          [66.0, 35.6],
          [69.4, 36.6],
          [72.0, 37.2],
          [73.0, 35.4],
          [71.0, 33.4],
          [67.4, 32.8],
          [63.8, 32.6],
          [63.0, 34.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Peshawar', ancla: [71.58, 34.01], anillos: ciudad(71.58, 34.01) },
  ],
  chola: [
    {
      tipo: 'tierra',
      nombre: 'Tamilakam',
      ancla: [78.2, 11.4],
      anillos: [
        [
          [75.8, 11.0],
          [77.0, 13.6],
          [78.6, 14.2],
          [80.2, 13.6],
          [80.4, 11.0],
          [79.6, 9.2],
          [77.8, 8.4],
          [76.4, 9.4],
          [75.8, 11.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Thanjavur', ancla: [79.14, 10.79], anillos: ciudad(79.14, 10.79) },
  ],
  angkor: [
    {
      tipo: 'tierra',
      nombre: 'Cambodia',
      ancla: [104.9, 12.6],
      anillos: [
        [
          [102.4, 10.4],
          [104.0, 11.4],
          [106.6, 12.2],
          [107.2, 14.0],
          [105.6, 14.8],
          [103.4, 14.0],
          [102.2, 12.2],
          [102.4, 10.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Angkor', ancla: [103.87, 13.41], anillos: ciudad(103.87, 13.41) },
  ],
  vietnam: [
    {
      tipo: 'tierra',
      nombre: 'Đại Việt',
      ancla: [105.6, 16.4],
      anillos: [
        [
          [102.2, 21.0],
          [104.0, 22.4],
          [106.6, 21.4],
          [109.4, 18.6],
          [109.0, 15.2],
          [107.2, 11.4],
          [105.0, 10.6],
          [103.0, 12.0],
          [102.2, 15.4],
          [102.2, 21.0],
        ],
      ],
    },
  ],
  corea: [
    {
      tipo: 'tierra',
      nombre: 'Península de Corea',
      ancla: [127.8, 37.2],
      anillos: [
        [
          [124.6, 39.8],
          [126.0, 40.6],
          [128.0, 40.0],
          [129.6, 38.4],
          [129.4, 35.4],
          [128.4, 34.6],
          [126.6, 34.4],
          [126.2, 36.4],
          [125.2, 37.6],
          [124.6, 39.8],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Hanseong', ancla: [126.98, 37.57], anillos: ciudad(126.98, 37.57) },
  ],

  // ───────────────────────── ÁFRICA ─────────────────────────
  aksum: [
    {
      tipo: 'tierra',
      nombre: 'Acu Aksum',
      ancla: [38.7, 14.2],
      anillos: [
        [
          [35.4, 13.4],
          [37.4, 14.8],
          [39.6, 16.4],
          [40.4, 18.0],
          [39.0, 18.6],
          [37.0, 16.6],
          [35.6, 15.0],
          [35.4, 13.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Axum', ancla: [38.72, 14.13], anillos: ciudad(38.72, 14.13) },
  ],
  nubia: [
    {
      tipo: 'tierra',
      nombre: 'Nubia',
      ancla: [31.0, 16.0],
      anillos: [
        [
          [27.0, 20.6],
          [30.0, 22.0],
          [33.4, 21.4],
          [35.4, 19.4],
          [35.2, 15.0],
          [33.0, 11.0],
          [30.0, 9.6],
          [27.6, 13.0],
          [25.6, 17.0],
          [27.0, 20.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Napata', ancla: [30.72, 19.72], anillos: ciudad(30.72, 19.72) },
  ],
  mali: [
    {
      tipo: 'tierra',
      nombre: 'El recodo del Níger',
      ancla: [-3.0, 15.5],
      anillos: [
        [
          [-12.0, 12.0],
          [-9.0, 15.0],
          [-5.0, 16.6],
          [-1.0, 17.4],
          [2.4, 16.4],
          [3.0, 13.6],
          [0.0, 12.4],
          [-5.0, 11.6],
          [-9.4, 11.0],
          [-12.0, 12.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Timbuktu', ancla: [-3.01, 16.77], anillos: ciudad(-3.01, 16.77) },
  ],
  songhai: [
    {
      tipo: 'tierra',
      nombre: 'Songhai',
      ancla: [1.5, 15.5],
      anillos: [
        [
          [-6.0, 12.6],
          [-2.0, 14.6],
          [2.0, 15.6],
          [5.0, 14.2],
          [4.0, 11.8],
          [0.0, 11.4],
          [-4.0, 11.6],
          [-6.0, 12.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Gao', ancla: [0.04, 16.27], anillos: ciudad(0.04, 16.27) },
  ],

  // ───────────────────────── AMÉRICA ─────────────────────────
  mexica: [
    {
      tipo: 'tierra',
      nombre: 'Tenochtitlan',
      ancla: [-99.2, 19.4],
      anillos: [
        [
          [-100.6, 17.2],
          [-98.4, 18.2],
          [-97.2, 19.2],
          [-96.6, 20.4],
          [-97.6, 21.0],
          [-99.6, 20.4],
          [-101.0, 19.0],
          [-100.6, 17.2],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tenochtitlan', ancla: [-99.13, 19.43], anillos: ciudad(-99.13, 19.43) },
  ],
  mayas: [
    {
      tipo: 'tierra',
      nombre: 'Maya',
      ancla: [-89.6, 17.6],
      anillos: [
        [
          [-92.4, 15.6],
          [-90.6, 16.4],
          [-88.8, 16.0],
          [-87.4, 16.6],
          [-87.6, 18.2],
          [-89.0, 19.4],
          [-90.2, 20.4],
          [-91.6, 19.6],
          [-92.2, 18.0],
          [-92.4, 15.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tikal', ancla: [-89.62, 17.22], anillos: ciudad(-89.62, 17.22) },
    { tipo: 'ciudad', nombre: 'Palenque', ancla: [-92.03, 17.51], anillos: ciudad(-92.03, 17.51) },
  ],
  olmecas: [
    {
      tipo: 'tierra',
      nombre: 'Olmeca',
      ancla: [-94.2, 18.2],
      anillos: [
        [
          [-95.6, 18.6],
          [-93.6, 18.2],
          [-92.6, 18.6],
          [-92.4, 19.4],
          [-93.8, 19.2],
          [-95.2, 19.4],
          [-95.6, 18.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'La Venta', ancla: [-94.03, 18.11], anillos: ciudad(-94.03, 18.11) },
  ],
  zapotecos: [
    {
      tipo: 'tierra',
      nombre: 'Monte Albán',
      ancla: [-96.73, 17.0],
      anillos: [
        [
          [-97.3, 16.8],
          [-96.4, 16.9],
          [-96.3, 17.4],
          [-97.2, 17.5],
          [-97.3, 16.8],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Monte Albán', ancla: [-96.73, 17.0], anillos: ciudad(-96.73, 17.0) },
  ],
  toltecas: [
    {
      tipo: 'tierra',
      nombre: 'Tula',
      ancla: [-99.4, 20.1],
      anillos: [
        [
          [-100.4, 19.0],
          [-99.0, 19.4],
          [-98.4, 20.4],
          [-99.4, 20.8],
          [-100.4, 20.4],
          [-100.4, 19.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tula', ancla: [-99.34, 20.06], anillos: ciudad(-99.34, 20.06) },
  ],
  teotihuacan: [
    {
      tipo: 'tierra',
      nombre: 'Valle de México',
      ancla: [-98.9, 19.7],
      anillos: [
        [
          [-99.8, 19.0],
          [-98.2, 19.2],
          [-97.8, 20.2],
          [-98.8, 20.8],
          [-99.8, 20.4],
          [-99.8, 19.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Teotihuacán', ancla: [-98.84, 19.69], anillos: ciudad(-98.84, 19.69) },
  ],
  inca: [
    {
      tipo: 'tierra',
      nombre: 'Tawantinsuyu',
      ancla: [-74.0, -14.0],
      anillos: [
        [
          [-79.4, -2.0],
          [-76.6, -6.0],
          [-74.6, -12.0],
          [-72.4, -18.0],
          [-69.4, -22.0],
          [-66.4, -26.0],
          [-64.6, -30.0],
          [-65.6, -36.0],
          [-68.4, -40.0],
          [-71.4, -38.0],
          [-72.4, -30.0],
          [-74.4, -22.0],
          [-76.4, -14.0],
          [-78.4, -8.0],
          [-80.6, -3.0],
          [-79.4, -2.0],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Cuzco', ancla: [-71.97, -13.52], anillos: ciudad(-71.97, -13.52) },
    { tipo: 'ciudad', nombre: 'Quito', ancla: [-78.47, -0.18], anillos: ciudad(-78.47, -0.18) },
  ],
  tairona: [
    {
      tipo: 'tierra',
      nombre: 'Sierra Nevada',
      ancla: [-73.9, 11.1],
      anillos: [
        [
          [-74.4, 10.7],
          [-73.6, 10.8],
          [-73.5, 11.5],
          [-74.1, 11.6],
          [-74.4, 10.7],
        ],
      ],
    },
  ],
  muisca: [
    {
      tipo: 'tierra',
      nombre: 'Altiplano cundinamarqués',
      ancla: [-73.5, 5.0],
      anillos: [
        [
          [-74.7, 4.4],
          [-73.4, 4.4],
          [-72.6, 5.2],
          [-73.2, 5.9],
          [-74.2, 5.7],
          [-74.7, 4.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tundunavá', ancla: [-73.68, 4.89], anillos: ciudad(-73.68, 4.89) },
  ],
  chavin: [
    {
      tipo: 'tierra',
      nombre: 'Chavín',
      ancla: [-77.1, -9.4],
      anillos: [
        [
          [-78.4, -10.4],
          [-77.2, -10.0],
          [-76.0, -9.0],
          [-76.4, -8.0],
          [-77.8, -8.2],
          [-78.4, -10.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Chavín de Huántar', ancla: [-77.07, -9.42], anillos: ciudad(-77.07, -9.42) },
  ],
  tiwanaku: [
    {
      tipo: 'tierra',
      nombre: 'Altiplano',
      ancla: [-68.1, -16.5],
      anillos: [
        [
          [-70.2, -17.4],
          [-68.6, -17.6],
          [-66.6, -16.4],
          [-66.8, -15.0],
          [-68.8, -14.6],
          [-70.2, -15.6],
          [-70.2, -17.4],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Tiwanaku', ancla: [-68.67, -16.55], anillos: ciudad(-68.67, -16.55) },
  ],
  taino: [
    {
      tipo: 'tierra',
      nombre: 'Antillas',
      ancla: [-70.0, 19.0],
      anillos: [
        [
          [-74.6, 18.0],
          [-71.0, 17.6],
          [-67.0, 18.4],
          [-64.0, 19.4],
          [-67.0, 20.0],
          [-70.0, 20.4],
          [-73.4, 19.6],
          [-74.6, 18.0],
        ],
      ],
    },
  ],
  anasazi: [
    {
      tipo: 'tierra',
      nombre: 'Mesa Verde y las Cuatro Esquinas',
      ancla: [-109.5, 37.0],
      anillos: [
        [
          [-111.0, 37.0],
          [-109.0, 36.6],
          [-106.6, 36.8],
          [-106.0, 38.2],
          [-107.4, 39.0],
          [-109.6, 38.6],
          [-111.0, 37.0],
        ],
      ],
    },
  ],
  comanche: [
    {
      tipo: 'tierra',
      nombre: 'Comanchería',
      ancla: [-101.0, 34.0],
      anillos: [
        [
          [-106.0, 42.0],
          [-102.0, 44.0],
          [-97.0, 43.0],
          [-94.0, 39.0],
          [-95.0, 34.0],
          [-97.0, 28.0],
          [-101.0, 25.0],
          [-104.0, 29.0],
          [-107.0, 34.0],
          [-106.0, 42.0],
        ],
      ],
    },
  ],
  mississipi: [
    {
      tipo: 'tierra',
      nombre: 'Cahokia',
      ancla: [-90.1, 38.6],
      anillos: [
        [
          [-92.0, 37.6],
          [-90.4, 37.4],
          [-88.4, 37.8],
          [-88.0, 39.2],
          [-89.4, 40.0],
          [-91.0, 39.6],
          [-92.0, 37.6],
        ],
      ],
    },
    { tipo: 'ciudad', nombre: 'Cahokia', ancla: [-90.06, 38.66], anillos: ciudad(-90.06, 38.66) },
  ],

  // ═══════════════ IMPERIOS DE ULTRAMAR ═══════════════
  espana: [
    {
      tipo: 'tierra',
      nombre: 'Península',
      ancla: [-4.0, 39.6],
      desde: 1492,
      anillos: [
        [
          [-9.5, 36.1],
          [-9.2, 39.0],
          [-8.9, 41.9],
          [-2.2, 43.6],
          [2.9, 42.4],
          [0.8, 38.6],
          [-2.2, 36.7],
          [-6.4, 36.0],
          [-9.5, 36.1],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Virreinato de Nueva España',
      ancla: [-102.0, 23.0],
      desde: 1535,
      hasta: 1821,
      anillos: [
        [
          [-118.5, 33.5],
          [-112.0, 31.0],
          [-104.0, 29.0],
          [-97.0, 26.0],
          [-91.0, 24.0],
          [-85.0, 28.0],
          [-80.2, 30.2],
          [-80.0, 22.0],
          [-86.0, 15.5],
          [-92.5, 14.5],
          [-97.5, 16.0],
          [-104.0, 20.0],
          [-110.0, 25.0],
          [-116.0, 30.0],
          [-118.5, 33.5],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Virreinato del Perú',
      ancla: [-74.0, -20.0],
      desde: 1542,
      hasta: 1824,
      anillos: [
        [
          [-79.5, 2.0],
          [-73.0, 0.0],
          [-68.0, -4.0],
          [-62.5, -10.0],
          [-60.0, -18.0],
          [-62.0, -30.0],
          [-65.0, -42.0],
          [-68.0, -52.0],
          [-72.5, -54.0],
          [-75.5, -46.0],
          [-77.5, -32.0],
          [-79.5, -20.0],
          [-82.0, -8.0],
          [-79.5, 2.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Virreinato de Nueva Granada',
      ancla: [-70.0, 5.0],
      desde: 1717,
      hasta: 1830,
      anillos: [
        [
          [-79.0, 9.5],
          [-74.0, 12.5],
          [-67.0, 12.0],
          [-60.0, 10.0],
          [-59.0, 4.0],
          [-63.0, -1.5],
          [-68.0, 0.0],
          [-73.0, 2.0],
          [-77.0, 4.5],
          [-79.0, 9.5],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Virreinato del Río de la Plata',
      ancla: [-63.0, -32.0],
      desde: 1776,
      hasta: 1814,
      anillos: [
        [
          [-70.0, -22.0],
          [-64.0, -21.0],
          [-57.0, -25.0],
          [-53.5, -30.0],
          [-57.0, -38.0],
          [-62.0, -40.0],
          [-66.0, -35.0],
          [-70.0, -22.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Filipinas',
      ancla: [122.0, 12.0],
      desde: 1565,
      hasta: 1898,
      anillos: [
        [
          [119.5, 5.5],
          [125.0, 6.0],
          [126.6, 12.0],
          [125.5, 18.5],
          [121.0, 18.2],
          [119.5, 13.0],
          [119.5, 5.5],
        ],
      ],
    },
  ],

  portugal: [
    {
      tipo: 'tierra',
      nombre: 'Portugal',
      ancla: [-8.2, 39.6],
      desde: 1415,
      anillos: [
        [
          [-9.5, 37.0],
          [-9.1, 39.2],
          [-8.9, 42.0],
          [-6.9, 42.0],
          [-7.4, 37.0],
          [-9.5, 37.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Brasil',
      ancla: [-47.0, -16.0],
      desde: 1500,
      hasta: 1822,
      anillos: [
        [
          [-73.0, -7.0],
          [-66.0, -6.0],
          [-60.0, -5.0],
          [-55.0, -2.0],
          [-51.0, -4.0],
          [-48.0, -1.0],
          [-44.0, -2.5],
          [-38.0, -5.0],
          [-35.0, -8.0],
          [-39.0, -14.0],
          [-41.0, -22.0],
          [-48.0, -26.0],
          [-53.0, -33.0],
          [-58.0, -30.0],
          [-57.0, -24.0],
          [-62.0, -18.0],
          [-66.0, -16.0],
          [-70.0, -12.0],
          [-73.0, -7.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Angola',
      ancla: [17.0, -13.0],
      desde: 1575,
      hasta: 1975,
      anillos: [
        [
          [12.0, -6.0],
          [16.0, -6.0],
          [18.0, -12.0],
          [22.0, -16.0],
          [24.0, -17.5],
          [22.0, -19.0],
          [16.0, -16.0],
          [12.0, -12.0],
          [12.0, -6.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Mozambique',
      ancla: [36.5, -18.0],
      desde: 1508,
      hasta: 1975,
      anillos: [
        [
          [33.0, -12.0],
          [36.0, -11.0],
          [40.0, -14.0],
          [40.5, -18.0],
          [38.0, -24.0],
          [35.0, -26.0],
          [34.0, -20.0],
          [33.0, -12.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Goa',
      ancla: [74.0, 16.0],
      desde: 1510,
      hasta: 1961,
      anillos: [
        [
          [73.0, 15.0],
          [74.6, 15.0],
          [75.2, 17.0],
          [74.0, 18.6],
          [73.0, 18.0],
          [73.0, 15.0],
        ],
      ],
    },
  ],

  britania: [
    {
      tipo: 'tierra',
      nombre: 'Islas Británicas',
      ancla: [-3.0, 53.5],
      desde: 1583,
      anillos: [
        [
          [-5.7, 49.9],
          [-3.0, 51.2],
          [0.8, 51.4],
          [1.7, 52.9],
          [0.3, 53.6],
          [-0.5, 54.6],
          [-1.4, 55.8],
          [-2.2, 57.7],
          [-3.2, 58.6],
          [-5.2, 58.6],
          [-5.8, 57.0],
          [-5.2, 55.6],
          [-4.6, 54.0],
          [-5.2, 53.4],
          [-3.6, 52.2],
          [-5.7, 49.9],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'India británica',
      ancla: [78.0, 22.0],
      desde: 1765,
      hasta: 1947,
      anillos: [
        [
          [68.0, 24.0],
          [70.0, 28.0],
          [74.0, 32.0],
          [78.0, 35.0],
          [80.5, 32.0],
          [88.0, 27.0],
          [89.0, 21.0],
          [86.0, 17.0],
          [80.0, 9.0],
          [77.0, 8.0],
          [73.0, 16.0],
          [68.0, 24.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Canadá',
      ancla: [-100.0, 58.0],
      desde: 1763,
      anillos: [
        [
          [-129.0, 50.0],
          [-110.0, 49.0],
          [-95.0, 49.5],
          [-80.0, 45.0],
          [-64.0, 45.0],
          [-55.0, 47.0],
          [-64.0, 55.0],
          [-80.0, 60.0],
          [-95.0, 70.0],
          [-115.0, 70.0],
          [-129.0, 60.0],
          [-129.0, 50.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Australia',
      ancla: [134.0, -25.0],
      desde: 1788,
      anillos: [
        [
          [113.0, -22.0],
          [122.0, -14.0],
          [132.0, -12.0],
          [142.0, -11.0],
          [150.0, -22.0],
          [153.0, -32.0],
          [146.0, -39.0],
          [136.0, -35.0],
          [128.0, -32.0],
          [115.0, -34.0],
          [113.0, -22.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Sudáfrica',
      ancla: [25.0, -30.0],
      desde: 1806,
      hasta: 1961,
      anillos: [
        [
          [16.0, -29.0],
          [20.0, -25.0],
          [28.0, -25.0],
          [33.0, -26.0],
          [31.0, -34.0],
          [24.0, -35.0],
          [18.0, -34.0],
          [16.0, -29.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Egipto',
      ancla: [30.0, 27.0],
      desde: 1882,
      hasta: 1952,
      anillos: [
        [
          [25.0, 31.6],
          [26.0, 22.0],
          [34.0, 22.0],
          [36.0, 31.0],
          [34.0, 32.6],
          [30.0, 31.6],
          [25.0, 31.6],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Palestina y Mesopotamia',
      ancla: [38.0, 32.0],
      desde: 1920,
      hasta: 1948,
      anillos: [
        [
          [34.0, 32.0],
          [40.0, 31.0],
          [43.0, 30.0],
          [44.5, 32.0],
          [38.0, 34.0],
          [34.0, 33.5],
          [34.0, 32.0],
        ],
      ],
    },
  ],

  ottomanos: [
    {
      tipo: 'tierra',
      nombre: 'Anatolia',
      ancla: [33.0, 39.0],
      desde: 1299,
      anillos: [
        [
          [26.0, 36.0],
          [31.0, 36.0],
          [36.0, 37.0],
          [42.0, 38.0],
          [44.0, 42.0],
          [38.0, 43.0],
          [31.0, 42.0],
          [26.5, 42.0],
          [26.0, 36.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Balcanes',
      ancla: [20.0, 43.0],
      desde: 1384,
      hasta: 1918,
      anillos: [
        [
          [13.0, 42.0],
          [17.0, 40.0],
          [22.0, 41.0],
          [28.0, 45.0],
          [26.0, 46.5],
          [18.5, 46.5],
          [13.0, 45.0],
          [13.0, 42.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Levante y Egipto',
      ancla: [33.0, 32.0],
      desde: 1516,
      hasta: 1918,
      anillos: [
        [
          [29.0, 31.0],
          [33.0, 31.0],
          [36.0, 32.0],
          [40.0, 36.0],
          [36.0, 36.5],
          [32.0, 36.0],
          [29.0, 33.0],
          [29.0, 31.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Irak y Arabia',
      ancla: [44.0, 24.0],
      desde: 1534,
      hasta: 1918,
      anillos: [
        [
          [38.0, 30.0],
          [42.0, 30.0],
          [47.0, 29.0],
          [52.0, 24.0],
          [54.0, 18.0],
          [48.0, 13.0],
          [42.0, 16.0],
          [38.0, 24.0],
          [38.0, 30.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Argel y Trípoli',
      ancla: [2.0, 33.0],
      desde: 1516,
      hasta: 1912,
      anillos: [
        [
          [-8.0, 35.5],
          [-1.0, 35.5],
          [6.0, 36.5],
          [10.0, 34.0],
          [8.0, 30.0],
          [1.0, 29.0],
          [-5.0, 31.0],
          [-8.0, 33.0],
          [-8.0, 35.5],
        ],
      ],
    },
  ],

  /**
   * Territorios de Persia y los Seleúcidas: el altiplano y la franja
   * mesopotámica que ambos dominaban.
   */
  achaemenidas: [
    {
      tipo: 'tierra',
      nombre: 'Altiplano iranio',
      ancla: [54.0, 32.0],
      desde: -550,
      hasta: -330,
      anillos: [
        [
          [44.0, 29.0],
          [47.0, 30.0],
          [52.0, 27.0],
          [57.0, 25.0],
          [61.0, 28.0],
          [64.0, 32.0],
          [62.0, 37.0],
          [56.0, 38.0],
          [50.0, 37.0],
          [46.0, 33.0],
          [44.0, 29.0],
        ],
      ],
    },
    {
      tipo: 'tierra',
      nombre: 'Anatolia y Levante',
      ancla: [36.0, 37.0],
      desde: -550,
      hasta: -330,
      anillos: [
        [
          [26.0, 37.0],
          [32.0, 36.0],
          [40.0, 32.0],
          [44.0, 30.0],
          [44.0, 33.0],
          [38.0, 38.0],
          [30.0, 42.0],
          [26.0, 40.0],
          [26.0, 37.0],
        ],
      ],
    },
  ],

  seljukas: [
    {
      tipo: 'tierra',
      nombre: 'Seljukida',
      ancla: [58.0, 34.0],
      desde: 1037,
      hasta: 1194,
      anillos: [
        [
          [44.0, 32.0],
          [52.0, 28.0],
          [62.0, 30.0],
          [66.0, 38.0],
          [60.0, 42.0],
          [50.0, 40.0],
          [44.0, 36.0],
          [44.0, 32.0],
        ],
      ],
    },
  ],

  timuridos: [
    {
      tipo: 'tierra',
      nombre: 'Timurida',
      ancla: [64.0, 36.0],
      desde: 1370,
      hasta: 1507,
      anillos: [
        [
          [50.0, 30.0],
          [58.0, 26.0],
          [68.0, 28.0],
          [72.0, 38.0],
          [68.0, 43.0],
          [58.0, 43.0],
          [50.0, 38.0],
          [50.0, 30.0],
        ],
      ],
    },
  ],

  sasanidas: [
    {
      tipo: 'tierra',
      nombre: 'Persia sasánida',
      ancla: [54.0, 31.0],
      desde: 224,
      hasta: 651,
      anillos: [
        [
          [41.0, 28.0],
          [48.0, 30.0],
          [56.0, 26.0],
          [62.0, 28.0],
          [66.0, 34.0],
          [62.0, 38.0],
          [54.0, 39.0],
          [46.0, 37.0],
          [41.0, 33.0],
          [41.0, 28.0],
        ],
      ],
    },
  ],
  navajo: [
    tierra('Meseta del Colorado', [-109, 36], 1650, 2026, [[-111.5, 37.2], [-108, 37.4], [-106.2, 36.4], [-106.6, 34.6], [-109, 34.4], [-111.5, 37.2]]),
  ],
  tarahumara: [
    tierra('Sierra Tarahumara', [-107.5, 27], 1500, 2026, [[-109.5, 28.8], [-107, 29], [-105.4, 27.4], [-106.4, 25.4], [-109, 25.6], [-109.5, 28.8]]),
  ],
  aborigenes: [
    tierra('Sahul', [134, -25], -45000, 2026, [[113, -22], [122, -14], [132, -12], [142, -11], [150, -22], [153, -32], [146, -39], [136, -35], [128, -32], [115, -34], [113, -22]]),
  ],
  kamilaroi: [
    tierra('Interior de Australia', [146, -29], 1500, 1930, [[138, -26], [148, -24], [152, -32], [146, -36], [137, -33], [138, -26]]),
  ],
  tiwi: [
    tierra('Islas Tiwi', [130.2, -11.1], 1500, 2026, [[130, -10.6], [130.7, -10.7], [130.8, -11.6], [130.1, -11.5], [130, -10.6]]),
  ],
  san: [
    tierra('Kalahari', [22, -22], -20000, 2026, [[19, -18], [26, -17], [27, -24], [22, -28], [18, -25], [19, -18]]),
  ],
  khoi: [
    tierra('Cabo y Karoo', [24, -30], -2000, 1930, [[19, -27], [28, -27], [30, -32], [24, -34], [19, -32], [19, -27]]),
  ],
  berberes: [
    tierra('Magreb y Atlas', [4, 31], -10000, 2026, [[-9, 35], [-1, 36], [6, 36], [10, 32], [6, 27], [-2, 28], [-8, 30], [-9, 35]]),
  ],
  tuareg: [
    tierra('Sáhara central', [2, 22], 500, 2026, [[-6, 24], [4, 26], [10, 20], [6, 14], [-2, 16], [-6, 20], [-6, 24]]),
  ],
  fulani: [
    tierra('Sahel occidental', [-4, 14], 1000, 2026, [[-14, 16], [-6, 17], [2, 15], [4, 11], [-4, 11], [-12, 12], [-14, 16]]),
  ],
  hausa: [
    tierra('Tierras hausa', [8, 13], 1000, 2026, [[2, 12], [10, 13], [14, 12], [12, 8], [5, 9], [2, 12]]),
  ],
  yoruba: [
    tierra('Yorubalandia', [4, 8], 1200, 1900, [[-1, 9], [5, 10], [8, 7], [5, 4], [0, 5], [-1, 9]]),
  ],
  igbo: [
    tierra('Tierra igbo', [7, 6], 1000, 2026, [[5, 7], [9, 8], [11, 5], [8, 4], [5, 4], [5, 7]]),
  ],
  fon: [
    tierra('Dahomey', [2.3, 7.2], 1600, 1894, [[0, 8], [4, 8], [5, 6], [2, 5], [-1, 6], [0, 8]]),
  ],
  swahili: [
    tierra('Costa suajili', [38, -6], 1000, 1900, [[32, -2], [40, -3], [42, -12], [36, -12], [32, -6], [32, -2]]),
  ],
  shona: [
    tierra('Zimbabwe', [30, -20], 1000, 2026, [[27, -17], [33, -18], [34, -23], [29, -24], [26, -21], [27, -17]]),
  ],
  luba: [
    tierra('Katanga', [25, -9], 1500, 1900, [[22, -6], [28, -7], [30, -12], [24, -13], [21, -10], [22, -6]]),
  ],
  maasai: [
    tierra('Sabana maasai', [36, -2], 1500, 2026, [[33, -1], [38, 0], [39, -4], [35, -6], [32, -4], [33, -1]]),
  ],
};
