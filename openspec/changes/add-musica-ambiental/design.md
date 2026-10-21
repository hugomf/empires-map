# Diseño técnico

## Arquitectura

Un único `AudioContext` creado de forma perezosa tras la primera interacción. El grafo:

```
drone (2 osciladores) ─┐
cuerda (Karplus-Strong) ─┼─→ bus ─→ reverb (ConvolverNode) ─→ master ─→ destination
tambor (ruido filtrado) ─┘
```

## Componentes

- **Drone modal**: dos osciladores seno/triángulo afinados a una quinta, con un `GainNode` de nivel bajo y un `lowpass` que se mueve muy lentamente.
- **Cuerda pulsada**: Karplus-Strong con un `DelayNode` y un filtro de retroalimentación; una secuencia de notas de una escala modal (dórico o frigio) con tempo lento.
- **Tambor de marco**: ruido blanco corto pasado por un filtro paso-banda y un envelope rápido, cada pocos compases.
- **Reverb**: `ConvolverNode` con un impulso generado por código (ruido con caída exponencial), sin archivos externos.

## Control

- Estado por defecto: apagado.
- Botón de audio en la cabecera con icono y etiqueta accesible.
- Control de volumen en el mismo panel; el valor se guarda en `localStorage['cronica-audio']`.
- Al pausar, se rampa el master a 0 y se suspende el contexto; al reanudar, se reanuda con una rampa corta.
- Si `AudioContext` no está disponible o falla, el control se oculta y la aplicación sigue funcionando.

## Programación

- Un `setTimeout`/`requestAnimationFrame` ligero programa las notas con antelación (look-ahead de 100 ms) para evitar clics.
- No se usa `setInterval` con precisión de audio; se corrige el tiempo con `audioContext.currentTime`.

## Accesibilidad

- El botón tiene `aria-pressed` y un texto que cambia entre «Activar sonido» y «Silenciar».
- No se reproduce audio automáticamente al cargar.
- El volumen nunca se inicializa por encima del 30 %.

## Rendimiento

- El grafo se crea una sola vez y se reutiliza.
- Al ocultar la pestaña (`visibilitychange`) se suspende el contexto.
