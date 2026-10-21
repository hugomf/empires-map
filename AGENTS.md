# AGENTS.md · Crónica de Imperios

Guía común para cualquier agente (OpenCode, Cline, Kilo Code, Claude Code…).

## Requisitos y especificaciones

- La **fuente de verdad** de los requisitos está en `openspec/specs/`.
- Los cambios en curso están en `openspec/changes/<nombre>/`:
  `proposal.md`, `specs/`, `design.md`, `tasks.md`.
- Antes de implementar, lee el cambio activo completo. No inventes requisitos:
  si falta un escenario o un dato histórico, pregunta.
- Flujo OpenSpec: **explorar → proponer → aplicar → validar → archivar**.
- No edites a mano las skills ni los comandos generados en `.opencode/`, `.cline/`
  o `.kilocode/`; se regeneran con `openspec update`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run validate` | Valida `datos/*.json` (IDs, fechas, regiones, polígonos) |
| `npm run build` | Typecheck + build de producción |
| `npm run lint` | Linter (oxlint) |
| `npm run spec:validate` | Valida specs y cambios de OpenSpec |
| `openspec view` | Panel de specs y cambios activos |

Los comandos de OpenSpec por herramienta son `/opsx-propose`, `/opsx-apply`,
`/opsx-archive`, etc. (en Cline están en `.clinerules/workflows/`, en Kilo Code
en `.kilocode/workflows/`).

## Convenciones

- TypeScript estricto; componentes React funcionales.
- Datos históricos en español; identificadores de código en inglés.
- No añadir dependencias sin justificarlo en `design.md`.
- Tras cambiar datos: `npm run validate`. Al cerrar un cambio: `npm run build`.
