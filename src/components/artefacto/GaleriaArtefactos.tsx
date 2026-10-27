// === GALERÍA DE ARTEFACTOS ===
// src/components/artefacto/GaleriaArtefactos.tsx

import { useState, useMemo } from 'react';
import type { Artefacto } from '../../data/tipos-cultura';
import ImagenArtefacto from './ImagenArtefacto';
import './GaleriaArtefactos.css';

interface GaleriaArtefactosProps {
  artefactos: Artefacto[];
  titulo?: string;
  mostrarBusqueda?: boolean;
  mostrarFiltros?: boolean;
  layout?: 'grid' | 'lista' | 'tarjetas';
  elementosPorPagina?: number;
}

export function GaleriaArtefactos({
  artefactos,
  titulo = 'Artefactos',
  mostrarBusqueda = true,
  mostrarFiltros = true,
  layout = 'grid',
  elementosPorPagina = 20
}: GaleriaArtefactosProps) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  
  const categorias = useMemo(() => {
    const cats = new Set(artefactos.map(a => a.tipo));
    return Array.from(cats).sort();
  }, [artefactos]);
  
  const artefactosFiltrados = useMemo(() => {
    return artefactos.filter(artefacto => {
      const coincideBusqueda = 
        terminoBusqueda === '' ||
        artefacto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        artefacto.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        artefacto.civilizacion.toLowerCase().includes(terminoBusqueda.toLowerCase());
      
      const coincideCategoria = 
        !categoriaFiltro || 
        artefacto.tipo === categoriaFiltro;
      
      return coincideBusqueda && coincideCategoria;
    });
  }, [artefactos, terminoBusqueda, categoriaFiltro]);
  
  const totalPaginas = Math.ceil(artefactosFiltrados.length / elementosPorPagina);
  
  const artefactosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return artefactosFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [artefactosFiltrados, paginaActual, elementosPorPagina]);
  
  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const obtenerClaseLayout = () => {
    switch (layout) {
      case 'lista':
        return 'layout-lista';
      case 'tarjetas':
        return 'layout-tarjetas';
      case 'grid':
      default:
        return 'layout-grid';
    }
  };
  
  return (
    <div className="galeria-artefactos">
      <div className="galeria-encabezado">
        <h2>{titulo}</h2>
        <div className="informacion-resultados">
          <span>{artefactosFiltrados.length} artefactos encontrados</span>
        </div>
      </div>
      
      {(mostrarBusqueda || mostrarFiltros) && (
        <div className="galeria-controles">
          {mostrarBusqueda && (
            <div className="contenedor-busqueda">
              <input
                type="search"
                placeholder="Buscar artefactos..."
                value={terminoBusqueda}
                onChange={(e) => {
                  setTerminoBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="input-busqueda"
              />
              {terminoBusqueda && (
                <button
                  onClick={() => {
                    setTerminoBusqueda('');
                    setPaginaActual(1);
                  }}
                  className="boton-limpiar"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          
          {mostrarFiltros && categorias.length > 1 && (
            <div className="controles-filtros">
              <button
                onClick={() => setCategoriaFiltro(null)}
                className={`boton-filtro ${!categoriaFiltro ? 'activo' : ''}`}
              >
                Todos
              </button>
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  onClick={() => {
                    setCategoriaFiltro(categoria === categoriaFiltro ? null : categoria);
                    setPaginaActual(1);
                  }}
                  className={`boton-filtro ${categoriaFiltro === categoria ? 'activo' : ''}`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className={`contenedor-artefactos ${obtenerClaseLayout()}`.trim()}>
        {artefactosPagina.map((artefacto, index) => (
          <div
            key={artefacto.id}
            className="item-artefacto"
            style={{ 
              animationDelay: `${Math.min(index * 50, 1000)}ms` 
            }}
          >
            <ImagenArtefacto
              artefacto={artefacto}
              variante={layout === 'lista' ? 'lista' : 'tarjeta'}
              mostrarCategoria={layout === 'lista'}
              mostrarPeriodo={true}
            />
          </div>
        ))}
      </div>
      
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="boton-pagina"
          >
            ← Anterior
          </button>
          
          <div className="numeros-paginas">
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              const pagina = i + 1;
              return (
                <button
                  key={pagina}
                  onClick={() => cambiarPagina(pagina)}
                  className={`pagina ${paginaActual === pagina ? 'activo' : ''}`}
                >
                  {pagina}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="boton-pagina"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default GaleriaArtefactos;