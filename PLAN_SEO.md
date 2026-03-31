# Plan de Implementación SEO — Propiedades y Asesorías RM

## Contexto del Proyecto

**Cliente:** Ramón Muñoz (familia Muñoz)  
**Nombre comercial sugerido:** Propiedades y Asesorías RM  
**Stack técnico:** Next.js (App Router) + Supabase (PostgreSQL)  
**Objetivo principal:** Posicionamiento orgánico en Google para búsquedas de terrenos y propiedades en Chile, más visibilidad en redes sociales (Open Graph).  
**Modelo de negocio actual:** Inmobiliaria propia. A futuro: marketplace con propiedades de terceros.

---

## Inventario de Propiedades Actuales

> Esta información es relevante para construir slugs, metadatos y contenido de fichas desde el primer día.

| # | Tipo | Ubicación | Superficie | Operación | Estado |
|---|------|-----------|------------|-----------|--------|
| 1 | Terreno | La Estrella, Litueche, O'Higgins | 5.000 m² | Venta | Disponible |
| 2 | Terreno | La Estrella, Litueche, O'Higgins | 5.000 m² | Venta | Disponible |
| 3 | Terreno | La Estrella, Litueche, O'Higgins | 5.000 m² | Venta | Disponible |
| 4 | Terreno | La Estrella, Litueche, O'Higgins | 10.000 m² | Venta | Disponible |
| 5 | Terreno | La Estrella, Litueche, O'Higgins | 10.000 m² (con quebrada) | Venta | Disponible |
| 6 | Terreno | Melipilla, Región Metropolitana | 5.000 m² (vista valle) | Venta | Disponible |
| 7 | Terreno | Melipilla, Región Metropolitana | 5.000 m² (vista + agua pozo) | Venta | Disponible |
| 8 | Casa + Terreno ⭐ | San Pedro de Melipilla, R.M. | 5.000 m² + Casa 450 m² | Venta | Disponible |
| 9 | Local comercial | Centro de Melipilla, R.M. | 13 x 22 mts | Venta/Arriendo | Disponible |

> ⭐ = Propiedad destacada (la Casona de San Pedro, marcada con `highlighted = true`)

---

## Fase 1: Cambios en la Base de Datos

> **Prioridad máxima.** Todo el SEO depende de una estructura de datos correcta. Debe hacerse antes de indexar cualquier URL.

### 1.1 Agregar campos de clasificación a `properties`

```sql
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_type text
    CHECK (property_type IN ('terreno', 'casa', 'local_comercial', 'departamento')),
  ADD COLUMN IF NOT EXISTS operation_type text
    CHECK (operation_type IN ('venta', 'arriendo'));
```

**Por qué:** Hoy la tabla no distingue entre tipo de propiedad ni tipo de operación. Sin estos campos es imposible generar páginas de listado por categoría (`/terrenos/venta`, `/casas/arriendo`), que son fundamentales para el SEO de cola larga.

### 1.2 Reemplazar `location_text` por campos estructurados

```sql
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS region        text,
  ADD COLUMN IF NOT EXISTS region_slug   text,
  ADD COLUMN IF NOT EXISTS commune       text,
  ADD COLUMN IF NOT EXISTS commune_slug  text,
  ADD COLUMN IF NOT EXISTS street        text,
  ADD COLUMN IF NOT EXISTS street_number text;
```

**Por qué:** El campo `location_text` es una cadena libre que no puede usarse para generar URLs jerárquicas ni filtros de búsqueda. Al separar los componentes se habilita:
- URLs como `/terrenos/venta/ohiggins/la-estrella/...`
- Páginas de listado por región y comuna
- Metadatos `<title>` y `<description>` generados automáticamente
- Schema.org con `addressRegion` y `addressLocality` bien definidos

### 1.3 Valores de referencia para las propiedades actuales

| Propiedad | region | region_slug | commune | commune_slug |
|-----------|--------|-------------|---------|--------------|
| Terrenos La Estrella | Región del Libertador General Bernardo O'Higgins | `ohiggins` | La Estrella | `la-estrella` |
| Terrenos Melipilla | Región Metropolitana de Santiago | `metropolitana` | Melipilla | `melipilla` |
| Casona San Pedro | Región Metropolitana de Santiago | `metropolitana` | San Pedro | `san-pedro` |
| Local Melipilla centro | Región Metropolitana de Santiago | `metropolitana` | Melipilla | `melipilla` |

### 1.4 Migración de datos existentes (si aplica)

Si ya existen filas con `location_text`, ejecutar un script de migración que parsee el texto y pobле los nuevos campos. Una vez validados los nuevos campos, `location_text` puede mantenerse como fallback pero no debe usarse para lógica de negocio ni SEO.

### 1.5 Actualizar la generación del `slug`

El slug de cada propiedad debe incluir contexto geográfico y de tipo para ser significativo para Google:

**Formato sugerido:**
```
{tipo}-{superficie}m2-{commune_slug}-{descriptor-unico}

Ejemplos:
terreno-5000m2-la-estrella-parcela-san-gabriel-lote-1
terreno-10000m2-la-estrella-quebrada-vista-valle
casa-450m2-san-pedro-melipilla-casona-carretera-fruta
local-comercial-melipilla-centro-alta-plusvalia
```

**Query de ejemplo para generar el slug base:**
```sql
UPDATE properties
SET slug = lower(
  property_type || '-' ||
  area_m2 || 'm2-' ||
  commune_slug || '-' ||
  unaccent(regexp_replace(trim(title), '\s+', '-', 'g'))
)
WHERE slug IS NULL OR slug = '';
```

---

## Fase 2: Estructura de URLs

> Las URLs son el contrato público con Google. Deben definirse antes de lanzar el sitio.

### 2.1 Jerarquía de rutas en Next.js

```
/                                                    → Home
/propiedades                                         → Listado general
/[tipo]/[operacion]                                  → Ej: /terrenos/venta
/[tipo]/[operacion]/[region_slug]                    → Ej: /terrenos/venta/ohiggins
/[tipo]/[operacion]/[region_slug]/[commune_slug]     → Ej: /terrenos/venta/ohiggins/la-estrella
/[tipo]/[operacion]/[region_slug]/[commune_slug]/[slug] → Ficha individual
```

**Estructura de carpetas en Next.js App Router:**

```
app/
├── page.tsx                                    → Home
├── propiedades/
│   └── page.tsx                               → Listado general
└── [tipo]/
    └── [operacion]/
        ├── page.tsx                           → /terrenos/venta
        └── [region_slug]/
            ├── page.tsx                       → /terrenos/venta/ohiggins
            └── [commune_slug]/
                ├── page.tsx                   → /terrenos/venta/ohiggins/la-estrella
                └── [slug]/
                    └── page.tsx               → Ficha individual
```

### 2.2 Valores válidos para segmentos de ruta

```typescript
// lib/seo/constants.ts

export const PROPERTY_TYPES = ['terrenos', 'casas', 'locales-comerciales'] as const;
export const OPERATION_TYPES = ['venta', 'arriendo'] as const;

// Mapeo slug → label para mostrar en UI y metadatos
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'terrenos': 'Terrenos',
  'casas': 'Casas',
  'locales-comerciales': 'Locales Comerciales',
};

export const OPERATION_TYPE_LABELS: Record<string, string> = {
  'venta': 'en Venta',
  'arriendo': 'en Arriendo',
};

export const REGION_LABELS: Record<string, string> = {
  'ohiggins': "Región de O'Higgins",
  'metropolitana': 'Región Metropolitana',
};
```

---

## Fase 3: Metadatos Dinámicos en Next.js

> Cada URL del sitio debe tener un `<title>` y `<meta description>` únicos y descriptivos.

### 3.1 Página de inicio (`app/page.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'Propiedades y Asesorías RM | Terrenos y Propiedades en Chile',
  description:
    'Terrenos, casas y locales comerciales en venta y arriendo en la Región de O\'Higgins y Región Metropolitana. Trato directo con el propietario. Crédito directo disponible.',
  keywords: ['terrenos en venta Chile', 'parcelas La Estrella', 'propiedades Melipilla', 'terrenos O\'Higgins'],
};
```

### 3.2 Páginas de listado por categoría

```typescript
// app/[tipo]/[operacion]/[region_slug]/[commune_slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const { tipo, operacion, region_slug, commune_slug } = params;

  const tipoLabel = PROPERTY_TYPE_LABELS[tipo] ?? tipo;
  const opLabel = OPERATION_TYPE_LABELS[operacion] ?? operacion;
  const regionLabel = REGION_LABELS[region_slug] ?? region_slug;
  const communeLabel = commune_slug
    ? commune_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const title = communeLabel
    ? `${tipoLabel} ${opLabel} en ${communeLabel} | Propiedades RM`
    : `${tipoLabel} ${opLabel} en ${regionLabel} | Propiedades RM`;

  const description = `Encuentra ${tipoLabel.toLowerCase()} ${opLabel.toLowerCase()} en ${communeLabel ?? regionLabel}. Trato directo con propietario, crédito directo. Propiedades y Asesorías RM.`;

  return { title, description };
}
```

### 3.3 Ficha individual de propiedad

```typescript
// app/[tipo]/[operacion]/[region_slug]/[commune_slug]/[slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return { title: 'Propiedad no encontrada' };

  const title = `${property.title} | ${property.commune}, ${property.region} – Propiedades RM`;

  const description = [
    property.area_m2 ? `${property.area_m2.toLocaleString('es-CL')} m²` : null,
    property.operation_type === 'venta' ? 'en venta' : 'en arriendo',
    `en ${property.commune}, ${property.region}.`,
    property.price ? `Precio: $${property.price.toLocaleString('es-CL')} CLP.` : null,
    'Trato directo con propietario. Consulta disponibilidad.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.images?.[0] ? [{ url: property.images[0] }] : [],
      type: 'website',
      locale: 'es_CL',
    },
  };
}
```

---

## Fase 4: Open Graph para Redes Sociales

> Controla cómo se ve el enlace cuando se comparte en WhatsApp, Facebook e Instagram.

### 4.1 Metadatos globales (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://propiedadesrm.cl'), // Dominio real a confirmar
  openGraph: {
    siteName: 'Propiedades y Asesorías RM',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

### 4.2 Imagen OG por defecto

Crear una imagen estática (`public/og-default.jpg`, 1200×630 px) que muestre el nombre del portal y una foto representativa del campo/terreno. Se usa como fallback cuando una propiedad no tiene imágenes.

### 4.3 Imagen OG dinámica por propiedad (opcional, Fase 2)

Next.js permite generar imágenes OG dinámicas con `ImageResponse`. Para cada ficha se puede generar una imagen que incluya el título, superficie, comuna y precio. Esto mejora significativamente el CTR al compartir en redes.

```typescript
// app/[tipo]/[operacion]/[region_slug]/[commune_slug]/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export default async function OGImage({ params }) {
  const property = await getPropertyBySlug(params.slug);
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', padding: 40, background: '#1a1a2e' }}>
      <span style={{ fontSize: 48, color: 'white', fontWeight: 'bold' }}>{property.title}</span>
      <span style={{ fontSize: 32, color: '#e0e0e0' }}>{property.area_m2?.toLocaleString('es-CL')} m² · {property.commune}</span>
    </div>,
    { width: 1200, height: 630 }
  );
}
```

---

## Fase 5: Schema.org / JSON-LD (Rich Snippets)

> Permite que Google muestre precio, ubicación y disponibilidad directamente en los resultados de búsqueda.

### 5.1 Componente `PropertyJsonLd`

```typescript
// components/seo/PropertyJsonLd.tsx

interface Props {
  property: Property;
  url: string;
}

export function PropertyJsonLd({ property, url }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description ?? '',
    url,
    image: property.images ?? [],
    offers: property.price
      ? {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: 'CLP',
          availability:
            property.status === 'available'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
        }
      : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [property.street, property.street_number].filter(Boolean).join(' '),
      addressLocality: property.commune,
      addressRegion: property.region,
      addressCountry: 'CL',
    },
    floorSize: property.area_m2
      ? { '@type': 'QuantitativeValue', value: property.area_m2, unitCode: 'MTK' }
      : undefined,
    telephone: property.contact_phone,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 5.2 Schema para la organización (en `app/layout.tsx`)

```typescript
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Propiedades y Asesorías RM',
  url: 'https://propiedadesrm.cl',
  telephone: '+56XXXXXXXXX', // Número de llamadas directas
  areaServed: ['Región del Libertador General Bernardo O\'Higgins', 'Región Metropolitana de Santiago'],
  description: 'Terrenos, casas y locales comerciales en venta y arriendo. Trato directo con propietario.',
};
```

---

## Fase 6: Sitemap XML Dinámico

### 6.1 Implementación en Next.js

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllProperties } from '@/lib/db/properties';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getAllProperties();
  const baseUrl = 'https://propiedadesrm.cl';

  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/propiedades`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/terrenos/venta`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/terrenos/venta/ohiggins`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/terrenos/venta/ohiggins/la-estrella`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/terrenos/venta/metropolitana`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/terrenos/venta/metropolitana/melipilla`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/locales-comerciales/venta`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/locales-comerciales/arriendo`, priority: 0.7, changeFrequency: 'weekly' },
  ];

  // Fichas individuales
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/${p.property_type_slug}/${p.operation_type}/${p.region_slug}/${p.commune_slug}/${p.slug}`,
    lastModified: p.created_at,
    priority: p.highlighted ? 0.9 : 0.6,
    changeFrequency: 'monthly',
  }));

  return [...staticRoutes, ...propertyRoutes];
}
```

### 6.2 `robots.txt`

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://propiedadesrm.cl/sitemap.xml',
  };
}
```

---

## Fase 7: Consideraciones Adicionales de SEO

### 7.1 Página de propiedad vendida o arrendada

El cliente indicó que las propiedades vendidas/arrendadas deben seguir visibles con su nuevo estado. Esto es buena práctica SEO: **no eliminar URLs indexadas**, sino actualizarlas. Implementar:

- El campo `status` en la DB ya contempla esto (`'available'`, `'sold'`, `'rented'`).
- En la ficha mostrar un banner "Propiedad Vendida" o "Arrendada".
- Mantener la URL activa con un meta `noindex` opcional si se quiere evitar indexar propiedades inactivas en el futuro.
- En Schema.org actualizar `availability` a `SoldOut`.

### 7.2 Nombre de dominio

Se recomienda registrar `propiedadesrm.cl` (`.cl` refuerza la geolocalización en Chile para Google). Alternativas: `propiedadesyasesoriasrm.cl` o simplemente `ramonmuñoz.cl`. El dominio debe estar definido antes de implementar `metadataBase` y el sitemap.

### 7.3 Imágenes optimizadas para SEO

- Usar el componente `<Image>` de Next.js para todas las fotos de propiedades (genera WebP automáticamente y agrega lazy loading).
- El atributo `alt` de cada imagen debe ser descriptivo:  
  `alt="Terreno de 5.000 m² en La Estrella, O'Higgins – Vista panorámica"`
- Se recomienda contratar fotografía con dron para las propiedades principales (el cliente está dispuesto a hacerlo). Las fotos de alta calidad mejoran el tiempo de permanencia en la página, que es una señal indirecta de SEO.

### 7.4 Velocidad de carga (Core Web Vitals)

Google penaliza sitios lentos. Con Next.js App Router y las siguientes prácticas se obtiene buen puntaje base:
- Usar `generateStaticParams` en fichas de propiedad para prerenderizado estático (SSG).
- Activar caché en Supabase queries que no cambian con frecuencia.
- No cargar el carrusel de imágenes completo al inicio; usar `loading="lazy"` para fotos secundarias.

### 7.5 SEO Local (Google Business Profile)

Dado que el cliente opera en regiones específicas de Chile y recibe clientes por boca a boca, crear un **perfil de Google Business** es clave. Permite aparecer en búsquedas tipo "terrenos en venta Melipilla" con mapa. No requiere cambios en el código pero complementa todo el trabajo SEO.

---

## Hoja de Ruta y Prioridades

| Fase | Acción | Prioridad | Observación |
|------|--------|-----------|-------------|
| **1** | Migración DB: `property_type`, `operation_type`, campos de ubicación | 🔴 Crítica | Debe hacerse antes de publicar el sitio |
| **2** | Definir y asignar slugs con estructura geográfica | 🔴 Crítica | Define todas las URLs permanentes |
| **3** | Metadatos dinámicos (`title`, `description`) en Next.js | 🔴 Crítica | Necesario para indexación básica |
| **4** | Open Graph en fichas y listados | 🟠 Alta | Necesario para compartir en redes sociales |
| **5** | Schema.org JSON-LD en fichas individuales | 🟠 Alta | Habilita rich snippets en Google |
| **6** | Sitemap XML + robots.txt | 🟠 Alta | Acelera la indexación |
| **7** | Imágenes con `alt` descriptivo y componente `<Image>` | 🟡 Media | Impacto en Core Web Vitals y accesibilidad |
| **8** | OG Image dinámica por propiedad | 🟡 Media | Mejora CTR en redes sociales |
| **9** | Google Business Profile | 🟡 Media | SEO local, no requiere código |
| **10** | Fotografía profesional / dron | 🟢 Baja | Mejora tiempo de permanencia y conversión |

---

## Notas para el Agente de IA que Implementa Este Plan

1. **Verificar la estructura de carpetas actual** del proyecto antes de crear cualquier archivo. El App Router de Next.js usa la convención `app/` pero el proyecto podría estar usando `pages/` (router antiguo).

2. **Revisar si ya existe algún archivo** `metadata` o `generateMetadata` en el proyecto para no duplicar configuración.

3. **El campo `slug` ya existe** en la tabla `properties`. Solo se debe actualizar su generación para incluir contexto geográfico, no recrearlo desde cero.

4. **`location_text` debe mantenerse** durante la transición como columna de fallback. No eliminarla hasta validar que todos los registros tienen los nuevos campos de ubicación completos.

5. **El cliente no quiere mapa.** No implementar `MapComponent` ni integración con Google Maps/Leaflet como parte de este plan.

6. **Datos de contacto:** La propiedad usa `contact_phone` en la DB. El teléfono de llamadas y el de WhatsApp son diferentes. Evaluar si agregar un campo `whatsapp_phone` a la tabla o manejarlo como configuración global en variables de entorno.

7. **Propiedad destacada:** La Casona de San Pedro debe tener `highlighted = true`. Verificar que este valor esté cargado correctamente antes de generar el sitemap (las propiedades destacadas reciben `priority: 0.9`).
