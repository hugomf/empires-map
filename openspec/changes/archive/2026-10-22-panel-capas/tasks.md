# Tareas — Panel de capas

## 1. Implementación

- [x] 1.1 `App.tsx`: `capasDelHash()`, estados `capaSolo`/`capasOcultas`/`panelCapas`, serialización del hash (`solo:`/`off:`) y `capaVisible`
- [x] 1.2 `App.tsx`: botón CAPAS en la cabecera y render de `PanelCapas`
- [x] 1.3 `PanelCapas.tsx`: panel con buscador, grupos por región, ojo, solo, «Mostrar todas» y contador
- [x] 1.4 `MapaAtlas.tsx`: prop `capaVisible` aplicada a territorios, ciudades y rótulos dominantes
- [x] 1.5 `i18n.ts`: claves `ctl.capas` y `capas.*` en español e inglés
- [x] 1.6 `app.css`: estilos `.panel-capas` y variante móvil

## 2. Validación

- [x] 2.1 `npm run build` y `npm run lint` en verde
- [x] 2.2 `npm run spec:validate` en verde
- [x] 2.3 Revisión visual: solo abasies en 750 (aislamiento) y ocultar roma en 100 (ojo individual)
