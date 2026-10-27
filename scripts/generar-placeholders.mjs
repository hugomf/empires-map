// === GENERADOR DE PLACEHOLDERS DE IMÁGENES ===
// scripts/generar-placeholders.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rutas
const IMAGES_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'artefactos');

// Iconos a generar con sus colores
const ICONOS = {
  yelmo: { color: '#8B0000', simbolo: '🛡️' },
  espada: { color: '#8B0000', simbolo: '⚔️' },
  lanza: { color: '#8B0000', simbolo: '🔱' },
  hacha: { color: '#8B0000', simbolo: '🪓' },
  escudo: { color: '#8B0000', simbolo: '🛡️' },
  armadura: { color: '#8B0000', simbolo: '🛡️' },
  
  mascara: { color: '#8B4513', simbolo: '🎭' },
  estela: { color: '#8B4513', simbolo: '📜' },
  idol: { color: '#8B4513', simbolo: '🗿' },
  candelabro: { color: '#8B4513', simbolo: '🕯️' },
  
  jarra: { color: '#4682B4', simbolo: '🏺' },
  copa: { color: '#4682B4', simbolo: '🍷' },
  vasija: { color: '#4682B4', simbolo: '🏺' },
  
  moneda: { color: '#DAA520', simbolo: '🪙' },
  sello: { color: '#DAA520', simbolo: '🔖' },
  peso: { color: '#DAA520', simbolo: '⚖️' },
  
  pergamino: { color: '#556B2F', simbolo: '📜' },
  tabla: { color: '#556B2F', simbolo: '📋' },
  
  busto: { color: '#708090', simbolo: '👤' },
  estatua: { color: '#708090', simbolo: '🗿' },
  
  collar: { color: '#CD5C5C', simbolo: '📿' },
  anillo: { color: '#CD5C5C', simbolo: '💍' },
  bracelete: { color: '#CD5C5C', simbolo: '📿' },
  
  tejido: { color: '#CD853F', simbolo: '🧶' },
  tapiz: { color: '#CD853F', simbolo: '🧵' },
  
  templo: { color: '#2F4F4F', simbolo: '🏛️' },
  edificio: { color: '#2F4F4F', simbolo: '🏢' },
  
  // Adicionales
  joya: { color: '#CD5C5C', simbolo: '💎' },
  alfombra: { color: '#CD853F', simbolo: '🪢' },
  cimitarra: { color: '#8B0000', simbolo: '⚔️' },
  generic: { color: '#696969', simbolo: '📦' }
};

// Generar SVG placeholder
function generarSVG(icono, color, simbolo) {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="${color}" opacity="0.1"/>
  <rect x="10" y="10" width="380" height="280" fill="none" stroke="${color}" stroke-width="2" rx="8"/>
  <text x="200" y="140" font-family="Arial" font-size="80" text-anchor="middle" fill="${color}" opacity="0.8">${simbolo}</text>
  <text x="200" y="200" font-family="Arial" font-size="16" text-anchor="middle" fill="${color}" opacity="0.6">${icono}</text>
  <text x="200" y="230" font-family="Arial" font-size="12" text-anchor="middle" fill="${color}" opacity="0.4">Artefacto histórico</text>
</svg>`;
}

// Función principal
async function main() {
  console.log('🎨 Generando placeholders de imágenes de artefactos...\n');
  
  const civilizaciones = ['roma', 'egipto', 'sumer', 'griegos', 'babilonia', 'vikingos', 'mexica', 'japon', 'china-antigua', 'han', 'achamanidas', 'britania', 'corea', 'persia', 'incas'];
  
  let generados = 0;
  
  for (const civilizacion of civilizaciones) {
    const dirCiv = path.join(IMAGES_DIR, civilizacion);
    
    // Asegurar directorio
    try {
      await fs.access(dirCiv);
    } catch {
      await fs.mkdir(dirCiv, { recursive: true });
    }
    
    // Generar un placeholder para cada icono
    for (const [icono, info] of Object.entries(ICONOS)) {
      const nombreArchivo = `${civilizacion}-${icono}.svg`;
      const ruta = path.join(dirCiv, nombreArchivo);
      
      const svg = generarSVG(icono, info.color, info.simbolo);
      await fs.writeFile(ruta, svg);
      generados++;
    }
  }
  
  console.log(`✅ ${generados} placeholders generados exitosamente`);
  console.log(`📁 Ubicación: ${IMAGES_DIR}\n`);
}

// Ejecutar si es el módulo principal
main().catch(console.error);

export { main };