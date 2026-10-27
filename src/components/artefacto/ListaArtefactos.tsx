// === LISTA DE ARTEFACTOS ===
// src/components/artefacto/ListaArtefactos.tsx

import type { Artefacto } from '../../data/tipos-cultura';
import ImagenArtefacto from './ImagenArtefacto';
import './ListaArtefactos.css';

interface ListaArtefactosProps {
  artefactos: Artefacto[];
  titulo?: string;
}

export function ListaArtefactos({
  artefactos,
  titulo = 'Todos los Artefactos'
}: ListaArtefactosProps) {
  return (
    <div className="lista-artefactos">
      <div className="encabezado-lista">
        <h2>{titulo}</h2>
        <div className="contador-total">
          {artefactos.length} artefactos
        </div>
      </div>
      
      <div className="contenedor-lista">
        {artefactos.map((artefacto, index) => (
          <div
            key={artefacto.id}
            className="item-lista"
            style={{ 
              animationDelay: `${Math.min(index * 30, 600)}ms` 
            }}
          >
            <div className="numero-item">{index + 1}</div>
            
            <div className="contenido-lista">
              <div className="encabezado-item">
                <h3 className="nombre-principal">{artefacto.nombre}</h3>
                <div className="metadatos-compactos">
                  <span className="civilizacion-badge">{artefacto.civilizacion}</span>
                  <span className="tipo-badge">{artefacto.tipo}</span>
                  <span className="icono-badge">{artefacto.icono}</span>
                </div>
              </div>
              
              <div className="vista-previa-imagen">
                <ImagenArtefacto
                  artefacto={artefacto}
                  variante="lista"
                  mostrarCategoria={false}
                  mostrarPeriodo={false}
                />
              </div>
              
              <div className="descripcion-completa">
                <p>{artefacto.descripcion}</p>
                {artefacto.escritura && (
                  <div className="meta-adicional">
                    <span className="etiqueta">Escritura:</span>
                    <span className="valor">{artefacto.escritura}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListaArtefactos;