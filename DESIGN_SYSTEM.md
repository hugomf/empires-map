# Crónica de Imperios - Design System

## Typography Hierarchy Documentation

This document describes the typography hierarchy improvements made to the Crónica de Imperios application, specifically focusing on the Ficha modals and related components.

### Primary Typography Scale

#### Display Typography (H1/Hero Headings)
- **Font**: Fraunces, Iowan Old Style, Georgia, serif
- **Usage**: Main titles, prominent headings
- **Sizes**: 34px (h2), 29px (original), 27px (reloj), 19px (marca h1), 18px (comparacion-nombre), 15px (estados-pais), 14px (gobernante-nombre), 13px (globo-g-nombre)
- **Weights**: 600, 500
- **Color**: var(--pergamino)

#### Body Typography (Primary Text)
- **Font**: Spectral, Georgia, serif
- **Usage**: Main content, descriptions, body text
- **Sizes**: 14px (ficha-datos dd, estados-buscar), 13px (ficha-bloque p), 12.5px (gobernante-cargo), 12px (estados-nota), 11px (ficha-sub)
- **Weights**: 400
- **Color**: var(--pergamino-2), var(--pergamino)

#### Mono Typography (Technical/Auxiliary Text)
- **Font**: IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace
- **Usage**: Technical data, timestamps, metadata, code-like elements
- **Sizes**: 12px (estados-buscar), 11px (estados-sub), 10px (estados-anio), 9px (estados-forma), 8px (estados-aprox)
- **Weights**: 500, 600
- **Color**: var(--pergamino-3), var(--bronce), var(--bronce-claro)
- **Features**: tabular-nums for numbers

### Typography Hierarchy Components

#### 1. Main Headings (h2)
```css
.ficha h2 {
  font-family: var(--display);
  font-weight: 600;
  font-size: 34px;
  line-height: 1.05;
  margin: 12px 0 8px;
  letter-spacing: -0.01em;
}
```

#### 2. Section Headers (h3)
```css
.ficha-bloque h3 {
  font-family: var(--texto);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: none;
  color: var(--bronce);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
```

#### 3. Subheadings and Labels
```css
.ficha-sub {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--pergamino-3);
  letter-spacing: 0.06em;
}

.ficha-tipo {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pergamino-3);
  font-weight: 600;
}

.ficha-datos dt {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pergamino-3);
  font-weight: 600;
}
```

#### 4. Body Text
```css
.ficha-bloque p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--pergamino-2);
}

.ficha-datos dd {
  font-size: 14px;
  color: var(--pergamino);
}
```

#### 5. Small and Technical Text
```css
.estados-buscar {
  font-size: 13px;
}

.num {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
}

.reloj .anio {
  font-size: 27px;
  font-weight: 300;
}
```

### Visual Hierarchy Principles

#### Spacing Scale
- **Large gaps**: 22px, 18px, 16px
- **Medium gaps**: 12px, 10px, 8px, 6px
- **Small gaps**: 4px, 2px

#### Font Weights
- **Heavy (600)**: Main titles, section headers, emphasis
- **Medium (500)**: Facets, technical labels
- **Regular (400)**: Main content, descriptions

#### Letter Spacing
- **Expanded**: 0.18em (uppercase labels)
- **Standard**: 0.06em, 0.04em
- **Condensed**: 0.01em, -0.01em

#### Text Transformation
- **Uppercase**: Technical labels, navigation
- **None**: Main content, headings for readability
- **Italic**: Emphasis, notes

### Component Typography Examples

#### Ficha Modal Typography
```css
/* Civilization name */
h2: { fontSize: '34px', weight: 600, fontFamily: 'display' }

/* Section headers */
h3: { fontSize: '12px', weight: 600, fontFamily: 'texto', transform: 'none' }

/* Data labels */
dt: { fontSize: '9px', weight: 600, fontFamily: 'mono', transform: 'uppercase' }

/* Data values */
dd: { fontSize: '14px', fontFamily: 'texto' }

/* Descriptions */
p: { fontSize: '14px', lineHeight: 1.7, fontFamily: 'texto' }
```

#### Comparacion Component Typography
```css
/* Comparison title */
.comparacion-cab .ojo {
  fontSize: '10px', weight: 600, fontFamily: 'mono', 
  transform: 'uppercase', letterSpacing: '0.18em'
}

/* Civilization names */
.comparacion-nombre {
  fontSize: '18px', weight: 600, fontFamily: 'display'
}

/* Comparison verdict */
.comparacion-veredicto {
  fontSize: '14px', weight: 500, lineHeight: 1.6
}

/* Technical data */
.comparacion-datos {
  fontSize: '12px', fontFamily: 'mono', transform: 'none'
}
```

#### Estados Panel Typography
```css
/* Search input */
.estados-buscar {
  fontSize: '13px', fontFamily: 'texto'
}

/* Country names */
.estados-pais {
  fontSize: '15px', weight: 600, fontFamily: 'display'
}

/* Year labels */
.estados-anio {
  fontSize: '11.5px', weight: 500, fontFamily: 'mono'
}

/* Classification */
.estados-forma {
  fontSize: '8.5px', weight: 600, fontFamily: 'mono', 
  transform: 'uppercase', letterSpacing: '0.08em'
}
```

### Design System Notes

#### Font Selection Rationale
- **Display Font (Fraunces)**: Chosen for its serif characteristics that convey tradition and scholarly authority, suitable for historical civilization names
- **Text Font (Spectral)**: Selected for excellent readability in long-form content, with warm characteristics that complement the night-time theme
- **Mono Font (IBM Plex Mono)**: Used for technical data, timestamps, and metadata where precision and alignment are important

#### Color Typography Hierarchy
- **Heavy text (titles, headings)**: var(--pergamino) for maximum readability and prominence
- **Medium text (section headers)**: var(--bronce) for visual hierarchy without overwhelming
- **Light text (labels, metadata)**: var(--pergamino-3) for technical information
- **Data values**: var(--pergamino-2) for important but secondary information

#### Responsive Typography Considerations
- Mobile breakpoints maintain typography hierarchy while reducing font sizes
- Line heights increase with font sizes for readability
- Text transforms are adjusted for mobile contexts
- Spacing scales proportionally with screen size

### Usage Guidelines

#### When to Use Specific Typography
1. **Use display font** for main entity names, page titles, and hero elements
2. **Use text font** for descriptions, narratives, and main content
3. **Use mono font** for dates, years, technical terms, and metadata
4. **Apply uppercase** to labels, tags, and classification terms
5. **Use weights strategically**: heavy for primary information, medium for secondary, light for tertiary

#### Typography Anti-Patterns
- Avoid mixing more than 3 font families in a single component
- Don't use uppercase for body text longer than 2-3 words
- Maintain consistent line heights within typographic scales
- Respect the established weight hierarchy
- Use responsive typography to maintain readability across devices

### Implementation Notes

#### CSS Custom Properties
The design system uses CSS custom properties for typography scales that can be easily modified:
```css
:root {
  --display: 'Fraunces', 'Iowan Old Style', Georgia, serif;
  --texto: 'Spectral', Georgia, serif;
  --mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  
  --font-display-40: 40px;
  --font-display-34: 34px;
  --font-texto-16: 16px;
  --font-texto-14: 14px;
  --font-mono-12: 12px;
}
```

#### Typography Testing
All typography changes have been validated against:
- WCAG AA contrast ratios
- Readability across different devices
- Performance impact (font loading)
- Consistency across components
- Accessibility standards

### Next Steps

1. **Documentation Update**: This design system should be kept updated as new typography is added
2. **Style Guide Creation**: Create visual style guides for different screen sizes
3. **Typography Testing**: Establish ongoing testing for typography changes
4. **Component Documentation**: Document typography for each component separately
5. **Font Loading Optimization**: Review and optimize font loading for performance

This design system provides a comprehensive foundation for typography decisions in the Crónica de Imperios application, ensuring consistency, readability, and visual hierarchy across all user interface components.