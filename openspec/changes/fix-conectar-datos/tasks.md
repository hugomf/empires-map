# Tareas


> **Estado:** Pendiente: el generador sigue incluyendo `id` en los hitos y `scripts/añadir-civilizaciones.mjs` sigue inservible (las altas van sobre `datos/`).
- [x] 1.1 Inventariar los errores actuales con `npx tsc -b` y agruparlos por causa.
- [x] 1.2 Exponer en `catalogo.ts` la API definitiva y las constantes de rango desde el catálogo generado.
- [x] 1.3 Migrar `App.tsx` a `catalogo()` y eliminar los imports de `CIVILIZACIONES` y `ANIO_*` antiguos.
- [x] 1.4 Migrar `Cronologia.tsx`, `Ficha.tsx`, `MapaAtlas.tsx` y `Riel.tsx` a la nueva API.
- [x] 1.5 Unificar `types.ts` y `tipos-cultura.ts`, incluyendo `nivel`, `superior`, `fuente` y `confianza`.
- [ ] 1.6 Corregir el generador para que los hitos no incluyan `id` y para que genere religiones, deidades, ciudades y artefactos.
- [x] 1.7 Convertir `civilizations.ts`, `regions.ts` y `territorios.ts` en reexportaciones o eliminarlos.
- [ ] 1.8 Reescribir `añadir-civilizaciones.mjs` y `ampliar-catalogo.mjs` contra los JSON.
- [x] 1.9 Ejecutar `npm run validate`, `npx tsc -b` y `npm run build` y dejar los tres en verde.
- [x] 1.10 Comprobar en el navegador que el mapa, la cronología y la ficha siguen funcionando.
