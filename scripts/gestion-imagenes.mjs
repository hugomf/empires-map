// === SISTEMA DE GESTIÓN DE IMÁGENES ===
// scripts/gestion-imagenes.mjs

const fs = require('fs').promises;
const path = require('path');

// Directorios
const DATA_DIR = path.join(__dirname, '..', 'datos');
const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');
const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets');

// Configuración
const CONFIG = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  formato: 'jpg',
  extension: '.jpg'
};

// Generar nombres de archivo para imágenes
/** @param {any} artefacto */
function generarNombreArchivo(artefacto) {
  const nombreLimpio = artefacto.nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `${artefacto.civilizacion}-${nombreLimpio}-${artefacto.id}${CONFIG.extension}`;
}

// Crear directorio si no existe
/** @param {string} dir */
async function asegurarDirectorio(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Generar placeholder para imagen no disponible
/** @param {any} artefacto @param {string} ruta */
async function generarPlaceholder(artefacto, ruta) {
  // Crear un placeholder SVG simple con el icono
  const svg = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="#999">
    ${artefacto.nombre}
  </text>
  <text x="200" y="180" font-family="Arial" font-size="14" text-anchor="middle" fill="#ccc">
    ${artefacto.civilizacion}
  </text>
</svg>
`;
  
  await fs.writeFile(ruta, svg.trim());
  console.log(`✓ Placeholder creado: ${ruta}`);
}

// Copiar y optimizar imagen
/** @param {string} imagenFuente @param {string} imagenDestino */
async function copiarImagen(imagenFuente, imagenDestino) {
  try {
    await fs.copyFile(imagenFuente, imagenDestino);
    console.log(`✓ Imagen copiada: ${imagenDestino}`);
  } catch (error) {
    console.error(`✗ Error copiando ${imagenFuente} a ${imagenDestino}:`, error);
    // Si falla, generar placeholder
    await generarPlaceholder({ nombre: 'imagen-no-disponible', civilizacion: 'sistema' }, imagenDestino);
  }
}

// Generar informe de imágenes
/** @param {any[]} imagenes */
async function generarInforme(imagenes) {
  const informe = {
    total: imagenes.length,
    disponibles: imagenes.filter(img => img.disponible).length,
    noDisponibles: imagenes.filter(img => !img.disponible).length,
    porCategoria: {},
    porCivilizacion: {},
    tamanoPromedio: 0
  };
  
  // Calcular estadísticas
  imagenes.forEach(img => {
    if (img.disponible) {
      informe.porCategoria[img.categoria] = (informe.porCategoria[img.categoria] || 0) + 1;
      informe.porCivilizacion[img.civilizacion] = (informe.porCivilizacion[img.civilizacion] || 0) + 1;
      informe.tamanoPromedio += img.tamano;
    }
  });
  
  informe.tamanoPromedio = informe.tamanoPromedio / informe.disponibles || 0;
  
  const rutaInforme = path.join(DIST_DIR, 'informe-imagenes.json');
  await fs.writeFile(rutaInforme, JSON.stringify(informe, null, 2));
  
  console.log('\n📊 Informe de imágenes generado:');
  console.log(`Total de artefactos: ${informe.total}`);
  console.log(`Imágenes disponibles: ${informe.disponibles}`);
  console.log(`Imágenes no disponibles: ${informe.noDisponibles}`);
  console.log(`Tamaño promedio por imagen: ${informe.tamanoPromedio.toFixed(2)} MB`);
  console.log('\nPor categoría:');
  Object.entries(informe.porCategoria).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  console.log('\nPor civilización:');
  Object.entries(informe.porCivilizacion).forEach(([civ, count]) => {
    console.log(`  ${civ}: ${count}`);
  });
}

// Función principal
async function main() {
  console.log('🚀 Iniciando sistema de gestión de imágenes...\n');
  
  try {
    // Asegurar directorios
    await asegurarDirectorio(IMAGES_DIR);
    await asegurarDirectorio(DIST_DIR);
    
    // Cargar datos de artefactos
    const datosArtefactos = JSON.parse(await fs.readFileSync(
      path.join(DATA_DIR, 'artefactos.json'),
      'utf8'
    ));
    
    const { obtenerImagenArtefacto } = await import(path.join(__dirname, 'src/lib/imagenes-artefactos.js'));
    
    // Procesar cada artefacto
    const imagenes = [];
    let procesados = 0;
    let exitosos = 0;
    
    console.log('📋 Procesando artefactos...\n');
    
    for (const artefacto of datosArtefactos) {
      procesados++;
      const infoImagen = obtenerImagenArtefacto(artefacto);
      
      if (infoImagen && infoImagen.disponible) {
        const nombreArchivo = generarNombreArchivo(artefacto);
        const rutaCivilizacion = path.join(IMAGES_DIR, artefacto.civilizacion);
        const rutaDestino = path.join(rutaCivilizacion, nombreArchivo);
        
        // Asegurar directorio de civilización
        await asegurarDirectorio(rutaCivilizacion);
        
        // Copiar imagen (aquí normalmente se copiarían/descompresarian imágenes reales)
        await copiarImagen(infoImagen.url, rutaDestino);
        
        // Actualizar info con ruta local
        infoImagen.ruta = rutaDestino;
        infoImagen.url = `/images/${artefacto.civilizacion}/${nombreArchivo}`;
        
        exitosos++;
      }
      
      imagenes.push(infoImagen);
      
      // Mostrar progreso
      if (procesados % 50 === 0) {
        console.log(`Progreso: ${procesados}/${datosArtefactos.length} (${Math.round(procesados/datosArtefactos.length*100)}%)`);
      }
    }
    
    console.log('\n✅ Procesamiento completado:');
    console.log(`Procesados: ${procesados}`);
    console.log(`Exitosos: ${exitosos}`);
    console.log(`Fallidos: ${procesados - exitosos}`);
    
    // Generar informe
    await generarInforme(imagenes);
    
    console.log('\n🎉 Sistema de gestión de imágenes completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en el sistema de gestión de imágenes:', error);
    process.exit(1);
  }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, generarNombreArchivo, asegurarDirectorio };