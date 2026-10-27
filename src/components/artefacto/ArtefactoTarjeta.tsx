// === TARJETA DE ARTEFACTO ===
// src/components/artefacto/ArtefactoTarjeta.tsx

import type { Artefacto } from '../../data/tipos-cultura';
import ImagenArtefacto from './ImagenArtefacto';
import './ArtefactoTarjeta.css';

interface ArtefactoTarjetaProps {
  artefacto: Artefacto;
  mostrarCategoria?: boolean;
  mostrarPeriodo?: boolean;
  animarEntrada?: boolean;
}

export function ArtefactoTarjeta({
  artefacto,
  mostrarCategoria = true,
  mostrarPeriodo = false,
  animarEntrada = true
}: ArtefactoTarjetaProps) {
  return (
    <article 
      className={`artefacto-tarjeta ${animarEntrada ? 'con-animacion' : ''} ${artefacto.civilizacion}`}
      data-civilizacion={artefacto.civilizacion}
      data-tipo={artefacto.tipo}
    >
      <div className="contenedor-imagen">
        <ImagenArtefacto
          artefacto={artefacto}
          variante="tarjeta"
          mostrarCategoria={mostrarCategoria}
          mostrarPeriodo={mostrarPeriodo}
        />
      </div>
      
      <div className="info-basica">
        <h3 className="nombre-artefacto-principal">{artefacto.nombre}</h3>
        <span className="identificador-civilizacion">{artefacto.civilizacion.toUpperCase()}</span>
      </div>
      
      <div className="meta-adicional">
        <div className="tipo-badge">
          <span className="tipo-icono"></span>
          <span className="tipo-texto">{artefacto.tipo}</span>
        </div>
        
        <div className="icono-original-badge">
          <span className="icono-original-texto">{artefacto.icono}</span>
        </div>
      </div>
      
      <div className="descripcion-completa">
        <p>{artefacto.descripcion}</p>
      </div>
      
      {artefacto.escritura && (
        <div className="escritura-artefacto">
          <span className="etiqueta-escritura">Escritura:</span>
          <span className="valor-escritura">{artefacto.escritura}</span>
        </div>
      )}
    </article>
  );
}

export default ArtefactoTarjeta;