/**
 * Navegación por teclado en listas planas (riel y Gantt).
 *
 * Los elementos de la lista llevan `tabindex="0"` y el contenedor un
 * `data-nav` con el selector de sus filas; las flechas mueven el foco entre
 * filas sin salir de la lista (patrón "roving tabindex" simplificado).
 */
import type { KeyboardEvent } from 'react';

export function teclasLista(e: KeyboardEvent<HTMLElement>, selector: string): void {
  const filas = [...document.querySelectorAll<HTMLElement>(selector)];
  const idx = filas.indexOf(e.currentTarget);
  if (idx === -1) return;
  let destino = -1;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = Math.min(idx + 1, filas.length - 1);
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = Math.max(idx - 1, 0);
  else if (e.key === 'Home') destino = 0;
  else if (e.key === 'End') destino = filas.length - 1;
  if (destino === -1) return;
  e.preventDefault();
  filas[destino].focus();
  /* En el Gantt las filas quedan fuera de la ventana: alinear el foco con scroll */
  filas[destino].scrollIntoView({ block: 'nearest' });
}

/** ¿La tecla activa un botón implícito (Enter o Espacio)? */
export function esActivacion(e: KeyboardEvent<HTMLElement>): boolean {
  return e.key === 'Enter' || e.key === ' ';
}
