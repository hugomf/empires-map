# Tareas

> **Estado:** Implementado y validado. Dataset de 196 países (193 miembros de la
> ONU + Palestina, Taiwán y Vaticano), capa, panel, i18n y validación ES/EN.

- [x] 1.1 Definir el modelo `PaisActual` y el conjunto de tipos de formación.
- [x] 1.2 Crear `datos/estados-actuales.json` con la tabla curada de países y
      notas; la fuente queda como campo opcional documentado.
- [x] 1.3 Generar la tabla local de identificadores ISO numéricos a alpha-2 para
      `world-atlas` (`src/data/iso-numeric.ts`).
- [x] 1.4 Añadir la capa «Países actuales» y su control de activación.
- [x] 1.5 No pintar ningún país antes de su año de formación.
- [x] 1.6 Añadir el panel de países con año, tipo y nota.
- [x] 1.7 Mostrar «aprox.» cuando la fecha sea aproximada.
- [x] 1.8 Evitar que la capa moderna tape las polidades históricas.
- [x] 1.9 Validar códigos, fechas, tipos, notas y paridad ES/EN en
      `npm run validate`.
- [x] 1.10 Revisar el mapa en 1700, 1800, 1900 y 2000, y comprobar por DOM que
      Estados Unidos no aparece en 1700 y Sudán del Sur no aparece en 2000.

## Criterio de cierre

- `npm run validate`, `npm run build`, `npm run lint` y `npm run spec:validate`
  pasan.
- El panel muestra los países ordenados y el mapa respeta la fecha de
  formación.
