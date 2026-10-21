# Diseño técnico

## Estado

```ts
type Idioma = 'en' | 'es';
```

El idioma vive en `App` y se aplica antes de leer el catálogo:

```ts
const [idioma, setIdioma] = useState<Idioma>(idiomaGuardado());
fijarIdioma(idioma);
```

## Diccionario

- `traducir(idioma, clave, vars)` ya existe; se usa en todos los componentes.
- Se prohíben cadenas de interfaz escritas a mano en JSX.
- Las claves nuevas se añaden a `EN` y `ES` a la vez; una clave ausente cae a inglés.

## Persistencia y enlace

- `localStorage['cronica-idioma']` guarda la preferencia.
- El hash pasa de `#1492/espana` a `#en/1492/espana` (o `#es/...`).
- Al cargar: si el hash trae idioma, gana sobre `localStorage`; si no, se usa `localStorage`; si no, inglés.
- Al cambiar de idioma se reescribe el hash sin recargar.

## Catálogo

- `CATALOGOS.en` y `CATALOGOS.es` comparten estructura e identificadores.
- Los textos históricos salen del catálogo activo.
- Si un texto inglés está vacío o falta, se muestra el español y un aviso discreto («Historical descriptions are currently in Spanish.»).

## Formato

- `anio(anio, idioma)`: `1200 BC` / `1200 a.C.`.
- `siglo(n, idioma)`: `5th century BC` / `siglo V a.C.`.
- Rangos y duraciones con el separador y las unidades del idioma.

## Accesibilidad

- El selector tiene etiqueta accesible y estado `aria-pressed` o `role="radiogroup"`.
- El cambio de idioma anuncia el nuevo idioma en un `aria-live` discreto.
