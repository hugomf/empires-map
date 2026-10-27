// src/lib/imagenes-artefactos.ts

import { ARTEFACTOS } from '../data/datos.generados';

export interface ImagenArtefacto {
  id: string;
  nombre: string;
  ruta: string;
  civilizacion: string;
  categoria: string;
  tipo: string;
  etiquetas: string[];
  altura: number;
  ancho: number;
  formato: string;
  tamano: number;
  descripcion: string;
  periodo: string;
  disponible: boolean;
  url: string;
}

// Categorías de imágenes disponibles
export const CATEGORIAS_IMAGENES = {
  militar: {
    iconos: ['yelmo', 'espada', 'lanza', 'hacha', 'escudo', 'armadura'],
    color: '#8B0000',
    descripcion: 'Armamento y equipo de combate'
  },
  religioso: {
    iconos: ['mascara', 'estela', 'idol', 'candelabro', 'incripciones'],
    color: '#8B4513',
    descripcion: 'Objetos de culto y ceremonia'
  },
  ceramica: {
    iconos: ['jarra', 'copa', 'vasija', ' ánfora'],
    color: '#4682B4',
    descripcion: 'Contenedores de cerámica y vasijas'
  },
  economico: {
    iconos: ['moneda', 'sello', 'peso'],
    color: '#DAA520',
    descripcion: 'Dinero y objetos de intercambio'
  },
  escritura: {
    iconos: ['pergamino', 'tabla', 'inscripcion'],
    color: '#556B2F',
    descripcion: 'Documentos y registros escritos'
  },
  escultura: {
    iconos: ['busto', 'estatua', 'busto', 'retrato'],
    color: '#708090',
    descripcion: 'Esculturas y representaciones'
  },
  joyeria: {
    iconos: ['collar', 'anillo', 'bracelete'],
    color: '#CD5C5C',
    descripcion: 'Adornos personales y joyas'
  },
  textil: {
    iconos: ['tejido', 'tapiz', 'vestimenta'],
    color: '#CD853F',
    descripcion: 'Tejidos y textiles'
  },
  arquitectura: {
    iconos: ['templo', 'edificio', 'construccion'],
    color: '#2F4F4F',
    descripcion: 'Edificios y arquitectura'
  }
};

// Mapeo de iconos a rutas de imágenes (SVG placeholders)
export const ICONO_A_RUTA = {
  yelmo: { ruta: '/images/artefactos/roma/yelmo.svg', altura: 800, ancho: 600 },
  espada: { ruta: '/images/artefactos/roma/espada.svg', altura: 800, ancho: 600 },
  lanza: { ruta: '/images/artefactos/roma/lanza.svg', altura: 800, ancho: 600 },
  hacha: { ruta: '/images/artefactos/vikingos/hacha.svg', altura: 800, ancho: 600 },
  escudo: { ruta: '/images/artefactos/roma/escudo.svg', altura: 800, ancho: 600 },
  armadura: { ruta: '/images/artefactos/roma/armadura.svg', altura: 800, ancho: 600 },
  
  mascara: { ruta: '/images/artefactos/egipto/mascara.svg', altura: 800, ancho: 600 },
  estela: { ruta: '/images/artefactos/egipto/estela.svg', altura: 800, ancho: 600 },
  idol: { ruta: '/images/artefactos/griegos/idol.svg', altura: 800, ancho: 600 },
  candelabro: { ruta: '/images/artefactos/roma/candelabro.svg', altura: 800, ancho: 600 },
  
  jarra: { ruta: '/images/artefactos/roma/jarra.svg', altura: 800, ancho: 600 },
  copa: { ruta: '/images/artefactos/roma/copa.svg', altura: 800, ancho: 600 },
  vasija: { ruta: '/images/artefactos/sumer/vasija.svg', altura: 800, ancho: 600 },
  
  moneda: { ruta: '/images/artefactos/roma/moneda.svg', altura: 800, ancho: 600 },
  sello: { ruta: '/images/artefactos/roma/sello.svg', altura: 800, ancho: 600 },
  peso: { ruta: '/images/artefactos/roma/peso.svg', altura: 800, ancho: 600 },
  
  pergamino: { ruta: '/images/artefactos/egipto/pergamino.svg', altura: 800, ancho: 600 },
  tabla: { ruta: '/images/artefactos/sumer/tabla.svg', altura: 800, ancho: 600 },
  
  busto: { ruta: '/images/artefactos/griegos/busto.svg', altura: 800, ancho: 600 },
  estatua: { ruta: '/images/artefactos/roma/estatua.svg', altura: 800, ancho: 600 },
  
  collar: { ruta: '/images/artefactos/egipto/collar.svg', altura: 800, ancho: 600 },
  anillo: { ruta: '/images/artefactos/roma/anillo.svg', altura: 800, ancho: 600 },
  bracelete: { ruta: '/images/artefactos/roma/bracelete.svg', altura: 800, ancho: 600 },
  
  tejido: { ruta: '/images/artefactos/roma/tejido.svg', altura: 800, ancho: 600 },
  tapiz: { ruta: '/images/artefactos/roma/tapiz.svg', altura: 800, ancho: 600 },
  
  templo: { ruta: '/images/artefactos/griegos/templo.svg', altura: 800, ancho: 600 },
  edificio: { ruta: '/images/artefactos/roma/edificio.svg', altura: 800, ancho: 600 },
  
  // Adicionales
  joya: { ruta: '/images/artefactos/roma/joya.svg', altura: 800, ancho: 600 },
  alfombra: { ruta: '/images/artefactos/roma/alfombra.svg', altura: 800, ancho: 600 },
  cimitarra: { ruta: '/images/artefactos/roma/cimitarra.svg', altura: 800, ancho: 600 },
  generic: { ruta: '/images/artefactos/roma/generic.svg', altura: 800, ancho: 600 }
};

// Función para obtener la imagen de un artefacto específico
export function obtenerImagenArtefacto(artefacto: any): ImagenArtefacto | null {
  const icono = artefacto.icono;
  const infoImagen = ICONO_A_RUTA[icono as keyof typeof ICONO_A_RUTA];
  
  if (!infoImagen) {
    return null;
  }
  
  const categoria = Object.keys(CATEGORIAS_IMAGENES).find(
    key => CATEGORIAS_IMAGENES[key as keyof typeof CATEGORIAS_IMAGENES].iconos.includes(icono)
  ) || 'otros';
  
  return {
    id: artefacto.id,
    nombre: artefacto.nombre,
    ruta: infoImagen.ruta,
    civilizacion: artefacto.civilizacion,
    categoria: categoria,
    tipo: artefacto.tipo,
    etiquetas: [artefacto.civilizacion, artefacto.tipo, categoria],
    altura: infoImagen.altura,
    ancho: infoImagen.ancho,
    formato: 'jpg',
    tamano: (infoImagen.altura * infoImagen.ancho * 3) / (1024 * 1024), // aproximado en MB
    descripcion: artefacto.descripcion,
    periodo: artefacto.escritura || '',
    disponible: true,
    url: infoImagen.ruta
  };
}

// Función para obtener todas las imágenes de una civilización
export function obtenerImagenesPorCivilizacion(civilizacion: string): ImagenArtefacto[] {
  return ARTEFACTOS
    .filter((a) => a.civilizacion === civilizacion)
    .map((artefacto) => obtenerImagenArtefacto(artefacto))
    .filter((img): img is ImagenArtefacto => img !== null);
}

// Función para obtener todas las imágenes de una categoría
export function obtenerImagenesPorCategoria(categoria: string): ImagenArtefacto[] {
  return ARTEFACTOS
    .map((artefacto) => obtenerImagenArtefacto(artefacto))
    .filter((img): img is ImagenArtefacto => img !== null && img.categoria === categoria);
}

// Función para obtener imágenes destacadas (una de cada civilización)
export function obtenerImagenesDestacadas(): ImagenArtefacto[] {
  const civiles: string[] = [...new Set(ARTEFACTOS.map((a: { civilizacion: string }) => a.civilizacion))];
  const imagenesDestacadas: ImagenArtefacto[] = [];
  
  for (const civ of civiles) {
    const imagenesCiv = obtenerImagenesPorCivilizacion(civ);
    if (imagenesCiv.length > 0) {
      imagenesDestacadas.push(imagenesCiv[0]);
    }
  }
  
  return imagenesDestacadas;
}