// === SISTEMA DE GESTIÓN DE IMÁGENES DE ARTEFACTOS ===
// src/components/artefacto/ImagenArtefacto.tsx

import React, { useState, useEffect } from 'react';
import type { Artefacto } from '../../data/tipos-cultura';
import { obtenerImagenArtefacto } from '../../lib/imagenes-artefactos';
import './ImagenArtefacto.css';

interface ImagenArtefactoProps {
  artefacto: Artefacto;
  variante?: 'tarjeta' | 'galeria' | 'lista';
  mostrarCategoria?: boolean;
  mostrarPeriodo?: boolean;
  claseAdicional?: string;
  soloImagen?: boolean;
}

export function ImagenArtefacto({
  artefacto,
  variante = 'tarjeta',
  mostrarCategoria = true,
  mostrarPeriodo = false,
  claseAdicional = '',
  soloImagen = false
}: ImagenArtefactoProps) {
  const infoImagen = obtenerImagenArtefacto(artefacto);
  const imagenNoDisponible = !infoImagen?.disponible || !infoImagen.url;
  
  const [estadoCarga, setEstadoCarga] = useState<'pending' | 'loading' | 'loaded' | 'error'>(
    imagenNoDisponible ? 'error' : 'pending'
  );
  const [imagenSrc, setImagenSrc] = useState<string | null>(null);
  const [errorMensaje, setErrorMensaje] = useState(!imagenNoDisponible ? '' : 'Imagen no disponible');
  
  useEffect(() => {
    if (imagenNoDisponible) {
      return;
    }
    
    let activo = true;
    
    // Start loading the image after a brief delay
    const timeoutId = setTimeout(() => {
      if (!activo) return;
      
      setEstadoCarga('loading');
      setErrorMensaje('');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        if (!activo) return;
        setImagenSrc(infoImagen.url!);
        setEstadoCarga('loaded');
      };
      
      img.onerror = () => {
        if (!activo) return;
        setErrorMensaje('Error al cargar imagen');
        setEstadoCarga('error');
      };
      
      img.src = infoImagen.url!;
    }, 50);
    
    return () => {
      activo = false;
      clearTimeout(timeoutId);
    };
  }, [infoImagen, imagenNoDisponible]);
  
  const obtenerClaseVariante = () => {
    const base = 'imagen-artefacto';
    switch (variante) {
      case 'tarjeta':
        return `${base} ${base}-tarjeta`;
      case 'galeria':
        return `${base} ${base}-galeria`;
      case 'lista':
        return `${base} ${base}-lista`;
      default:
        return base;
    }
  };
  
  const obtenerClaseEstado = () => {
    return `${estadoCarga}`;
  };
  
  const obtenerContenidoFallback = () => {
    switch (estadoCarga) {
      case 'pending':
        return (
          <div className="imagen-placeholder">
            <div className="icono-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 17"/>
              </svg>
            </div>
            <span className="texto-placeholder">Cargando...</span>
          </div>
        );
      
      case 'loading':
        return (
          <div className="imagen-loading">
            <div className="spinner"></div>
            <span className="texto-carga">Cargando imagen...</span>
          </div>
        );
      
      case 'error':
        return (
          <div className="imagen-error">
            <div className="icono-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <span className="texto-error">No disponible</span>
            {errorMensaje && <span className="detalle-error">{errorMensaje}</span>}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const obtenerAtributosImagen = () => {
    const attrs: React.ImgHTMLAttributes<HTMLImageElement> = {
      alt: `${artefacto.nombre} - ${artefacto.civilizacion} (${artefacto.tipo})`,
      title: `${artefacto.nombre} (${artefacto.civilizacion}) - ${artefacto.descripcion}`
    };
    
    if (estadoCarga === 'loaded' && imagenSrc) {
      attrs.src = imagenSrc;
      attrs.style = {
        objectFit: variante === 'tarjeta' ? 'cover' : 'contain',
        opacity: 1
      } as React.CSSProperties;
    }
    
    return attrs;
  };
  
return (
    <div className={`${obtenerClaseVariante()} ${obtenerClaseEstado()} ${claseAdicional}`.trim()}>
      <div className="imagen-contenedor">
        {estadoCarga === 'loaded' && imagenSrc && (
          <img {...obtenerAtributosImagen()} loading="lazy" />
        )}
        
        {obtenerContenidoFallback()}
      </div>
      
      {!soloImagen && (
        <div className="contenido-artefacto">
          <div className="encabezado">
            <h4 className="nombre-artefacto">{artefacto.nombre}</h4>
            {mostrarCategoria && (
              <span className="tipo-artefacto">{artefacto.tipo}</span>
            )}
          </div>
          
          <p className="descripcion-artefacto">{artefacto.descripcion}</p>
          
          <div className="meta-artefacto">
            <span className="civilizacion">{artefacto.civilizacion}</span>
            <span className="icono-original">{artefacto.icono}</span>
          </div>
          
          {mostrarPeriodo && (
            <div className="periodo-artefacto">
              <span className="texto-periodo">Período: {artefacto.escritura || 'No especificado'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImagenArtefacto;