# 📋 SEO Proposal — Propiedades Ramón Muñoz

> **Estado del sitio:** Pre-producción. El SEO es el paso final antes del despliegue.
> **Total de propiedades:** ~10 unidades distribuidas en Región Metropolitana y Región del Libertador O'Higgins (VI).

---

## 1. 🔑 Keywords Objetivo

> No existe un listado previo de palabras clave. Las siguientes frases fueron diseñadas a partir del inventario real de propiedades.

### Frases Principales (alta intención de compra)

| Frase | Tipo de propiedad | Ubicación |
|---|---|---|
| `parcelas en venta Melipilla` | Parcelas 5.000 m² | San Ramón de Puro |
| `terrenos en venta San Ramón de Puro` | Parcelas | Melipilla, RM |
| `parcelas con vista al río Maipo` | Parcelas c/ vista | Parcelación San Ramón de Puro |
| `casa patronal en venta San Pedro Melipilla` | Casa 450 m² | Carretera R-66, km 95 |
| `propiedad con pozo profundo Melipilla` | Parcela + infraestructura | San Ramón de Puro |
| `parcelas en venta La Estrella` | Parcelas 5.000–10.000 m² | La Estrella, VI Región |
| `terrenos en venta Litueche` | Parcelas saneadas | Parcelación San Gabriel |
| `parcelas planas saneadas La Estrella` | Parcelas con luz y rol | Litueche, O'Higgins |
| `propiedad comercial en venta Melipilla` | Propiedad urbana | Centro de Melipilla |
| `arriendo local comercial Melipilla` | Propiedad 13x22 m | Av. Ignacio Serrano 628 |
| `parcela cerca del lago Rapel` | Casa c/ terreno | Zona Longovilo / R-66 |
| `propiedades en venta Región Metropolitana` | General RM | XIII Región |
| `propiedades en venta Región O'Higgins` | General VI Región | La Estrella / Litueche |
| `terrenos en venta con derechos de agua Chile` | Diferenciador | San Pedro Melipilla |
| `inversión inmobiliaria Melipilla` | Intención inversionista | RM |

### Frases Secundarias (SEO local / long tail)

- `venta de parcelas saneadas con rol propio Melipilla`
- `parcelación San Gabriel La Estrella`
- `comprar terreno cerca carretera de la fruta R-66`
- `casa con container acondicionado comida al paso venta`
- `permuta de propiedades Chile`
- `propiedades venta crédito directo Chile`
- `propiedades con Título de Dominio Región Metropolitana`

---

## 2. 🛠️ Estado Actual del SEO

> **Tarea para el agente:** Realizar una auditoría técnica completa del sitio y documentar el estado de cada ítem antes de la puesta en producción.

### Checklist de Auditoría Técnica

| Ítem | Estado actual | Acción requerida |
|---|---|---|
| **Meta `<title>` por página** | ⬜ Por verificar | Implementar dinámicamente por propiedad y ciudad |
| **Meta `<description>` por página** | ⬜ Por verificar | Generar descripciones únicas por propiedad |
| **`sitemap.xml`** | ⬜ No existe | Crear sitemap dinámico (propiedades + páginas de ubicación) |
| **`robots.txt`** | ⬜ Por verificar | Crear/validar que no bloquee el crawling |
| **Schema.org `RealEstateListing` (JSON-LD)** | ⬜ No implementado | Implementar por propiedad con datos estructurados |
| **URLs amigables (slugs)** | ⚠️ Parcial (`/propiedades/`) | Ver sección 4 — requiere ajustes |
| **Open Graph / Twitter Cards** | ⬜ Por verificar | Implementar para compartir en redes sociales |
| **Canonical URLs** | ⬜ No implementado | Necesario para evitar duplicados |
| **Rendimiento (Core Web Vitals)** | ⬜ Por medir | Ejecutar Lighthouse antes de producción |
| **Imágenes con `alt` text** | ⬜ Por verificar | Todas las fotos de propiedades deben tener alt descriptivo |

---

## 3. 📍 Comunas / Ciudades Objetivo

> Estas son las áreas geográficas a priorizar en la estrategia de Local SEO. La generación de páginas por ubicación es **crítica** para el posicionamiento.

### Región Metropolitana (XIII Región)

| Comuna | Propiedades | Prioridad |
|---|---|---|
| **Melipilla** | Parcelación San Ramón de Puro (2 parcelas) + Av. Ignacio Serrano 628 (centro) | 🔴 Alta |
| **San Pedro de Melipilla** | Casa Patronal 450 m² en Carretera R-66 km 95 | 🔴 Alta |

### Región del Libertador General Bernardo O'Higgins (VI Región)

| Comuna | Propiedades | Prioridad |
|---|---|---|
| **La Estrella** | 5 parcelas en Parcelación San Gabriel (3×5.000 m² + 2×10.000 m²) | 🔴 Alta |
| **Litueche** | Provincia que contiene La Estrella | 🟡 Media (agrupación) |

---

## 4. 🔗 Estructura de URLs

### Estado Actual

La estructura actual es:

```
/propiedades/
```

No existe filtro por ciudad o comuna en el modelo de datos actual.

### Estructura Propuesta

```
/propiedades/                              → Listado general
/propiedades/melipilla/                    → Página SEO por ubicación
/propiedades/san-pedro-de-melipilla/       → Página SEO por ubicación
/propiedades/la-estrella/                  → Página SEO por ubicación
/propiedades/longovilo/                    → Página SEO por ubicación
/propiedades/[slug-de-propiedad]/          → Detalle individual
```

### ¿Se debe actualizar el modelo de base de datos?

**Sí.** Para habilitar el filtrado y las páginas por ubicación, se recomienda agregar los siguientes campos al modelo de `Propiedad`:

| Campo nuevo | Tipo | Ejemplo |
|---|---|---|
| `comuna` | `string` | `"La Estrella"` |
| `provincia` | `string` | `"Litueche"` |
| `region` | `string` | `"O'Higgins"` |
| `region_numero` | `string` | `"VI"` |
| `slug_ubicacion` | `string` | `"la-estrella"` |

Esto permite generar rutas semánticas (`/propiedades/la-estrella`) en lugar de usar query params (`/propiedades?ciudad=la-estrella`), lo cual es mejor para el SEO.

---

## 5. 📝 Contenido Existente

| Sección | Estado | Notas |
|---|---|---|
| **Home** | ✅ Texto existente | Los textos son **completamente modificables**. Se recomienda optimizarlos con las keywords objetivo. |
| **Páginas de propiedades** | ✅ Datos de propiedad | Actualmente solo muestran datos (metraje, fotos, descripción, saneamientos). |
| **Descripciones de propiedades** | ⬜ Por definir | ¿Se generan dinámicamente o están hardcodeadas? Acción: migrar a dinámicas si no lo son. |
| **Textos SEO por ubicación** | ❌ No existen | Crear contenido optimizado para cada página de ciudad/comuna. |
| **Sección "Sobre el vendedor"** | ⬜ Opcional | El cliente desea mostrar información personal. Evaluar sección "Quién soy" con trayectoria. |

### Información clave del vendedor (para contenido)

- Empresario con experiencia en distribución de combustibles (ESSO / SHELL).
- Mejor vendedor en Chile por 2–3 años consecutivos.
- Venta directa, sin intermediarios — contacto directo con el dueño.
- Modalidades de venta: contado, crédito directo (con garantía hipotecaria), permuta.
- Modalidad de arriendo: canon en UF + IPC anual.

---

## 6. 📊 Google Search Console

| Estado | Detalle |
|---|---|
| **Registro en GSC** | ❌ No registrado aún |
| **Datos de impressions/clicks** | ❌ No disponibles (sitio aún no en producción) |
| **Próximos pasos** | Una vez en producción: (1) registrar dominio, (2) verificar propiedad, (3) enviar sitemap, (4) monitorear indexación |

---

## 🔍 Fases del Proyecto SEO (SDD)

| Fase | Entregable |
|---|---|
| **Explore** | Auditoría técnica completa: meta tags, sitemap, robots.txt, schema, URLs, Core Web Vitals |
| **Proposal** | Estrategia SEO (técnico + contenido) — este documento |
| **Specs** | Requisitos detallados: estructura de meta tags, formato schema.org, definición de slugs |
| **Design** | Arquitectura de páginas por ubicación (Melipilla, San Pedro, La Estrella, Longovilo) |
| **Tasks** | Checklist de implementación para el desarrollador |

---

## 🚀 Strategy Preview

### Oportunidades identificadas

1. **Páginas por ciudad/comuna** — Generar `/propiedades/melipilla`, `/propiedades/la-estrella`, etc. para capturar búsquedas locales.
2. **Schema.org `RealEstateListing`** — Datos estructurados JSON-LD en cada propiedad para rich snippets en Google.
3. **Canonical URLs** — Evitar contenido duplicado entre listados y filtros.
4. **Open Graph + Twitter Cards** — Optimizar la vista previa al compartir propiedades en redes sociales.
5. **Sitemap dinámico** — Incluir todas las propiedades y páginas de ciudades para acelerar la indexación.
6. **Meta tags dinámicos** — Generar `<title>` y `<description>` únicos por propiedad y por ciudad.
7. **Link building interno** — Desde homepage y listado general hacia páginas de ciudades y propiedades destacadas.
8. **Propiedad destacada** — La Casa Patronal de San Pedro de Melipilla debe tener mayor visibilidad (hero en home, schema con `featured`).
9. **Keyword de diferenciación** — "crédito directo sin banco" y "permuta de propiedades" son términos con baja competencia y alta intención.
10. **Alt text en imágenes** — Cada foto debe tener descripción con keywords y ubicación (ej: `"Parcela 5000 m2 con vista al río Maipo, Melipilla"`).

---

## ❓ Preguntas Pendientes del Cliente

| Pregunta | Relevancia para SEO |
|---|---|

| ¿Nombre comercial definido? | Recomendación: **"Propiedades y Asesorías RM"** (propuesto por el cliente — bien orientado para búsquedas) |

---

