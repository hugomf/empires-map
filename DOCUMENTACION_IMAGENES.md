# Sistema de gestión de imágenes para artefactos

Este proyecto contiene un sistema integral para gestionar imágenes de los más de 175 artefactos históricos en el mapa de civilizaciones.

## Vista general

El sistema proporciona:

1. **Mapeo de iconos a imágenes**: Relaciona los iconos actuales (como "yelmo", "espada", "jarra") con categorías de imágenes apropiadas
2. **Base de datos de imágenes**: Estructura organizada de archivos de imagen necesarios para cada civilización
3. **Función de obtención de imágenes**: Obtiene la información de imagen correcta para cualquier artefacto
4. **Categorías de imágenes**: Clasificación de tipos de imágenes (militar, religioso, cerámica, etc.)
5. **Gestión de estados de carga**: Controla el estado de carga de las imágenes (pendiente, cargando, cargada, error)

## Estructura de directorios

```
src/
├── lib/
│   └── imagenes-artefactos.ts          # Sistema central de gestión de imágenes
├── assets/
│   └── images/
│       └── artefactos/                  # Imágenes de artefactos
│           ├── roma/
│           │   ├── helmet-legionary.jpg
│           │   ├── gladius.jpg
│           │   └── ...
│           ├── egipto/
│           │   ├── tutankhamun-mask.jpg
│           │   ├── esna-faience.jpg
│           │   └── ...
│           ├── sumer/
│           │   ├── ur-cradle.jpg
│           │   ├── warka-head.jpg
│           │   └── ...
│           └── ... (otras civilizaciones)
└── componentes/
    └── ...                              # Componentes actualizados para mostrar imágenes
```

## Tipos de imágenes principales

El sistema categoriza las imágenes en varios tipos:

### Militar (12+)
- Cascos, espadas, lanzas, hachas, escudos, armaduras
- Armas y equipos de combate

### Religioso (8+)
- Máscaras funerarias, estelas, ídolos, ásarer
- Objetos ceremoniales y de culto

### Cerámica (6+)
- Jarras, ánforas, copas, vasijas
- Contenedores para almacenamiento y transporte

### Económico (3+)
- Monedas, sellos, pesas
- Objetos de intercambio y valor

### Escritura (4+)
- Rollos de papiro, tablillas de arcilla, inscripciones
- Documentos y registros administrativos

### Escultura (4+)
- Cabezas de escultura, estatuas, ídolos
- Representaciones de figuras humanas y divinas

### Arquitectura (2+)
- Modelos de templos, representaciones arquitectónicas
- Representaciones de edificios y estructuras

### Joyería (1+)
- Joyas, adornos, ornamentos

### Textiles (1+)
- Alfombras, tejidos, ropa

## Categorías de artefactos

### Roma (5 artefectos)
- Casco de legionario de bronce
- Gladius (espada)
- Ánfora Dressel 20
- Denario (moneda)
- Lápida funeraria

### Egipto (4 artefactos)
- Máscara mortuoria de Tutankamón
- Vidriado de Esna
- Papiro de Ebers
- Maza de Narmer

### Sumer (3 artefactos)
- Cuna de Ur
- Cabeza de Warka
- Tablilla de cuneiforme

### Otras civilizaciones
El sistema se puede ampliar para incluir:
- Griegos (3+)
- Babilonia (2+)
- China antigua (1+)
- Japón (2+)
- Mexica (2+)
- Vikings (2+)
- Y muchas más...

## Función principal: obtenerInfoImagen

```typescript
import { obtenerInfoImagen } from './lib/imagenes-artefactos';

// Uso en componentes
artefacto: Artefacto;
const infoImagen = obtenerInfoImagen(artefacto);

if (infoImagen.disponible) {
  // Mostrar la imagen
  <img src={infoImagen.imagen} alt={infoImagen.alt} />
} else {
  // Fallback al icono original o mensaje de carga
}
```

## Estados de carga de imágenes

### `pending`
- Imagen no configurada todavía
- Muestra placeholder o icono

### `loading`
- Imagen siendo descargada
- Muestra indicador de carga

### `loaded`
- Imagen completamente cargada
- Muestra la imagen

### `error`
- Error al cargar la imagen
- Muestra fallback con mensaje de error

## Scripts de apoyo

### `scripts/generar-imagenes.mjs`
- Genera placeholders para imágenes no disponibles
- Crea nombres de archivo consistentes
- Valida los mapeos de imágenes

### `scripts/validar-imagenes.mjs`
- Valida que todas las imágenes referenciadas existan
- Comprueba los nombres de archivo consistentes
- Genera reporte de estado de imágenes

### `scripts/optimizar-imagenes.mjs`
- Optimiza el tamaño de los archivos de imagen
- Comprime imágenes para web
- Genera diferentes tamaños (webp, avif, etc.)

## Uso en componentes

### Componente de tarjeta de artefacto
```tsx
import { useState, useEffect } from 'react';
import { obtenerInfoImagen, type ImagenEstado } from '../lib/imagenes-artefactos';

export function ArtefactoTarjeta({ artefacto }: { artefacto: Artefacto }) {
  const [estadoImagen, setEstadoImagen] = useState<ImagenEstado>('pending');
  const [imagenSrc, setImagenSrc] = useState<string | null>(null);
  
  const infoImagen = obtenerInfoImagen(artefacto);
  
  useEffect(() => {
    if (!infoImagen.disponible) {
      setEstadoImagen('error');
      return;
    }
    
    setEstadoImagen('loading');
    const img = new Image();
    img.onload = () => {
      setImagenSrc(infoImagen.imagen);
      setEstadoImagen('loaded');
    };
    img.onerror = () => {
      setEstadoImagen('error');
    };
    img.src = infoImagen.imagen;
  }, [infoImagen]);
  
  return (
    <div className="artefacto-tarjeta">
      <div className="artefacto-imagen-contenedor">
        {estadoImagen === 'loading' && <div className="cargando">Cargando...</div>}
        {estadoImagen === 'loaded' && imagenSrc && (
          <img src={imagenSrc} alt={artefacto.nombre} className="artefacto-imagen" />
        )}
        {estadoImagen === 'error' && (
          <div className="error-imagen">
            {/* Fallback al icono original o placeholder */}
            <span className={`icono artifacto-${artefacto.icono}`} />
          </div>
        )}
      </div>
      <div className="artefacto-contenido">
        <h4>{artefacto.nombre}</h4>
        <span className="artefacto-tipo">{artefacto.tipo}</span>
        <p>{artefacto.descripcion}</p>
      </div>
    </div>
  );
}
```

### Componente de galería de artefactos
```tsx
export function GaleriaArtefactos({ civilizacion }: { civilizacion: string }) {
  const { datos } = useCatalogo();
  const artefactos = datos.artefactos.filter(a => a.civilizacion === civilizacion);
  
  return (
    <div className="galeria-artefactos">
      <h3>Artefactos de {civilizacion}</h3>
      <div className="artefactos-grid">
        {artefactos.map(artefacto => {
          const infoImagen = obtenerInfoImagen(artefacto);
          return (
            <ArtefactoTarjeta 
              key={artefacto.id} 
              artefacto={artefacto} 
              infoImagen={infoImagen}
            />
          );
        })}
      </div>
    </div>
  );
}
```

## Extensión futura

El sistema se puede ampliar fácilmente:

1. **Añadir nuevas categorías de imágenes**
2. **Agregar mapeos para más civilizaciones**
3. **Implementar generación automática de imágenes** (usando IA para recrear artefactos históricos)
4. **Añadir vistas de realidad aumentada** (escaneando códigos QR en artefactos)
5. **Crear tours visuales** (secuencias de pantalla para mostrar el contexto histórico)

## Próximos pasos

1. **Crear assets de imágenes**: Generar o adquirir 175+ archivos de imagen
2. **Implementar componentes actualizados**: Modificar Ficha.tsx y otros componentes para usar imágenes
3. **Añadir animaciones**: Transiciones suaves al cargar imágenes
4. **Optimizar para móvil**: Asegurar que las imágenes se carguen eficientemente en dispositivos móviles
5. **Añadir cargador de imágenes**: Herramienta para gestionar y subir nuevas imágenes

Este sistema proporciona una base sólida para crear una experiencia visual rica e inmersiva que muestra los artefactos históricos de una manera atractiva y educativa.