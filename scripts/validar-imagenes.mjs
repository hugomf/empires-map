// === VALIDACIÓN DE IMÁGENES ===
// scripts/validar-imagenes.mjs

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'datos');

// Función para verificar si un archivo existe
/** @param {string} ruta */
async function verificarArchivo(ruta) {
  try {
    await fs.access(ruta);
    return true;
  } catch {
    return false;
  }
}

// Función para obtener tamaño de archivo
/** @param {string} ruta */
async function obtenerTamanoArchivo(ruta) {
  const stats = await fs.stat(ruta);
  return stats.size;
}

// Función principal
async function main() {
  console.log('🔍 Validando imágenes de artefactos...\n');
  
  try {
    // Cargar datos de artefactos
    const datosArtefactos = JSON.parse(await fs.readFileSync(
      path.join(DATA_DIR, 'artefactos.json'),
      'utf8'
    ));
    
    // Cargar el módulo de imágenes
    const { obtenerImagenArtefacto } = await import(path.join(__dirname, 'src/lib/imagenes-artefactos.js'));
    
    let total = 0;
    let validas = 0;
    let noValidas = 0;
    const errores = [];
    
    console.log('📋 Validando cada artefacto...\n');
    
    for (const artefacto of datosArtefactos) {
      total++;
      const infoImagen = obtenerImagenArtefacto(artefacto);
      
      if (!infoImagen) {
        noValidas++;
        errores.push({
          tipo: 'sin-imagen',
          id: artefacto.id,
          civilizacion: artefacto.civilizacion,
          nombre: artefacto.nombre,
          mensaje: 'No se encontró mapeo de icono a imagen'
        });
        continue;
      }
      
      const rutaCompleta = path.join(__dirname, '..', infoImagen.ruta);
      const existe = await verificarArchivo(rutaCompleta);
      
      if (existe) {
        const tamano = await obtenerTamanoArchivo(rutaCompleta);
        const tamanoMB = (tamano / (1024 * 1024)).toFixed(2);
        console.log(`✅ ${artefacto.civilizacion} - ${artefacto.nombre} (${tamanoMB} MB)`);
        validas++;
      } else {
        console.log(`❌ ${artefacto.civilizacion} - ${artefacto.nombre} (no encontrado)`);
        noValidas++;
        errores.push({
          tipo: 'no-disponible',
          id: artefacto.id,
          civilizacion: artefacto.civilizacion,
          nombre: artefacto.nombre,
          mensaje: `Archivo no encontrado: ${infoImagen.ruta}`
        });
      }
    }
    
    console.log('\n📊 Resultados de validación:');
    console.log(`Total de artefactos: ${total}`);
    console.log(`✅ Válidas: ${validas}`);
    console.log(`❌ No válidas: ${noValidas}`);
    console.log(`Tasa de éxito: ${Math.round((validas / total) * 100)}%`);
    
    if (errores.length > 0) {
      console.log('\n⚠️  Errores encontrados:');
      errores.forEach((error, index) => {
        console.log(`${index + 1}. [${error.tipo}] ${error.civilizacion} - ${error.nombre}`);
        console.log(`   ${error.mensaje}\n`);
      });
      
      // Guardar errores en archivo
      const rutaErrores = path.join(__dirname, '..', 'dist', 'errores-imagenes.json');
      await fs.writeFile(rutaErrores, JSON.stringify(errores, null, 2));
      console.log(`📄 Errores guardados en: ${rutaErrores}`);
    }
    
    if (noValidas > 0) {
      console.log('\n⚠️  Advertencia: Hay imágenes no válidas. ¿Ejecutar scripts/gestion-imagenes.mjs para generarlas?');
    } else {
      console.log('\n🎉 ¡Todas las imágenes están válidas!');
    }
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };