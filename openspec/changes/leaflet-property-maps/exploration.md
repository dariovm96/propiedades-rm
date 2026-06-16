# Exploration: Mapas con Leaflet para Propiedades RM

## Current State

### Modelo de datos
- `src/types/property.ts` define `Property` **sin campos de coordenadas** (`lat` / `lng`).
- `PropertyFormPayload` y `PropertyUpdatePayload` tampoco incluyen coordenadas.
- `src/lib/property-form.ts` define `PropertyFormValues` y `toPropertyPayload()` **sin lat/lng**.
- **No hay migraciones SQL ni schema local** de Supabase; el proyecto usa `.select("*")` con cast manual a `Property`.
- La tabla `properties` en Supabase **no tiene** columnas `lat`/`lng` (inferido de la ausencia en el tipo local y la falta de archivos de schema).

### Formularios de admin
- `PropertyFormFields.tsx` maneja: `title`, `description`, `location_text`, `price`, `status`, `area_m2`, `highlighted`, `contact_phone`. **No hay inputs para coordenadas**.
- `nueva/page.tsx` inicializa el estado con los campos anteriores; inserta en Supabase vía `PropertyInsertPayload`.
- `EditPropertyForm.tsx` inicializa el estado desde la propiedad existente; actualiza vía `PropertyUpdatePayload`.
- En ambos casos, las coordenadas no se capturan ni se persisten.

### Ficha de propiedad (público)
- `src/app/propiedades/[slug]/page.tsx` es un **Server Component** que muestra: título, ubicación (texto), precio, superficie, galería, highlights, y llama a `PropertyDetailTabs` pasando `locationText`.
- No recibe ni transmite `lat`/`lng`.

### Tabs de detalle
- `src/components/PropertyDetailTabs.tsx` tiene dos tabs: "Detalle" y "Ubicación".
- En la pestaña **Ubicación** existe un placeholder explícito:
  ```tsx
  <div className="mt-4 flex h-52 items-center justify-center ...">
    Mapa interactivo próximamente.
  </div>
  ```
  Este es el punto exacto de integración del mapa.

### Dependencias
- `package.json` **NO incluye** `leaflet`, `react-leaflet`, ni sus tipos `@types/leaflet` / `@types/react-leaflet`.
- React está en `19.2.3`. `react-leaflet` v4.x oficialmente soporta React 18. **Esto es un riesgo de compatibilidad** que debe verificarse antes de instalar.

### Configuración de imágenes
- `next.config.ts` solo permite `rzvayefzuqjgjvnlecqd.supabase.co`.
- Leaflet carga tiles vía `<img>` nativas (no `next/image`), por lo que `remotePatterns` **no afecta** directamente los tiles de OpenStreetMap. No se requiere cambio en `next.config.ts` para los tiles.

### Componentes existentes
- **No hay ningún componente de mapa** en `src/components/`.
- No hay hooks personalizados en `src/hooks/`.

---

## Affected Areas

| Archivo | Por qué se ve afectado |
|---------|------------------------|
| `src/types/property.ts` | Agregar `lat` y `lng` al tipo `Property` y a los payloads de formulario/actualización. |
| `src/lib/property-form.ts` | Agregar `lat`/`lng` a `PropertyFormValues` y a `toPropertyPayload()`. |
| `src/components/PropertyFormFields.tsx` | Agregar inputs (o picker) de coordenadas. |
| `src/app/admin/propiedades/nueva/page.tsx` | Inicializar `lat`/`lng` en el estado y payload de inserción. |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | Inicializar `lat`/`lng` desde la propiedad existente y enviar en update. |
| `src/app/propiedades/[slug]/page.tsx` | Pasar `lat`/`lng` al componente de tabs (o directamente al mapa). |
| `src/components/PropertyDetailTabs.tsx` | Reemplazar el placeholder por el componente de mapa real. |
| `src/app/layout.tsx` | Posiblemente importar CSS de Leaflet si se decide cargarlo globalmente. |
| Supabase (tabla `properties`) | Requiere columnas `lat` y `lng` (tipo `float` o `numeric`). |

---

## Approaches

### 1. Instalar `react-leaflet` + `leaflet` (wrapper oficial)
- **Descripción**: Usar la librería estándar `react-leaflet` (v4 o v5 si existe) para el mapa en cliente.
- **Pros**: API declarativa, marcadores y popups fáciles, comunidad grande.
- **Cons**: **Compatibilidad dudosa con React 19**. Si `react-leaflet` v4 no funciona, puede bloquear la implementación. Requiere importar CSS de Leaflet.
- **Effort**: Medium (si es compatible), High (si hay que hacer workarounds).

### 2. Usar `leaflet` vanilla con custom React wrapper
- **Descripción**: Instalar solo `leaflet` y crear un pequeño wrapper con `useRef` + `useEffect` para montar el mapa en un Client Component.
- **Pros**: Sin dependencia de `react-leaflet`, control total, evita problemas de compatibilidad con React 19. Es la estrategia más segura para versiones de React bleeding-edge.
- **Cons**: Más código propio. Sin embargo, para un mapa estático (mostrar punto + marker), el wrapper es mínimo (~30-50 líneas).
- **Effort**: Medium (implementación segura, React 19-friendly).

### 3. Mapa con `iframe` de OpenStreetMap (fallback sin librería)
- **Descripción**: Usar el embed de OpenStreetMap (`https://www.openstreetmap.org/export/embed.html`) con un `<iframe>`.
- **Pros**: Cero dependencias, cero problemas de compatibilidad, cero CSS que importar.
- **Cons**: No se puede personalizar marcadores, estilo, ni交互. No es "interactivo" en el sentido de Leaflet. Menos profesional.
- **Effort**: Low.

### 4. Mapa de selección en admin + Geocoding
- **Descripción**: Además del mapa en ficha, agregar un mapa picker en el formulario de admin para que el usuario elija la ubicación arrastrando un marcador.
- **Pros**: Mejor UX para el administrador; no requiere escribir coordenadas a mano.
- **Cons**: Aumenta el scope de la primera entrega. Puede hacerse en una fase posterior.
- **Effort**: High (como parte del mismo change) o Low (si se diferencia).

---

## Recommendation

1. **Para el mapa en ficha pública**: Usar **Approach 2 (Leaflet vanilla + custom wrapper)**. Es la opción más segura ante React 19. El wrapper es mínimo y nos da control total.
2. **Para el admin**: En una primera fase, agregar **inputs numéricos de texto para `lat` y `lng`** (similar a `price` y `area_m2`). El mapa picker en admin puede ser **fase 2** para no bloquear la entrega.
3. **Prioridad**: Schema de Supabase → Tipos TypeScript → Formularios admin → Componente de mapa → Integración en ficha.

---

## Risks

- **React 19 + react-leaflet**: Si se opta por `react-leaflet`, existe riesgo de incompatibilidad. Recomendación: usar wrapper vanilla.
- **Supabase schema manual**: No hay migraciones en el repo. El cambio de columnas en Supabase debe hacerse manualmente en el dashboard o via CLI; si no se hace, el código fallará al insertar/actualizar.
- **Datos faltantes**: Propiedades existentes no tienen coordenadas. El mapa debe manejar `lat == null || lng == null` ocultándose o mostrando un mensaje.
- **SSR / Hydration**: Leaflet usa `window` y `document`. El componente de mapa **debe ser forzosamente un Client Component** (`"use client"`) o cargarse con `next/dynamic` y `ssr: false`.
- **CSS de Leaflet**: Debe importarse en un Client Component. Importar en `layout.tsx` (Server Component) podría causar errores si Next.js no lo permite; aunque en Next.js 15/16 importar CSS global en `layout.tsx` es válido, hay que verificar que no cause FOUT.

---

## Ready for Proposal

**Yes** — con la salvedad de que se debe confirmar la estrategia de Supabase (cómo se agregan las columnas) y la decisión entre `react-leaflet` vs wrapper vanilla. El resto del análisis es suficiente para redactar el proposal.

## Files to Modify / Create

### Modificar
- `src/types/property.ts`
- `src/lib/property-form.ts`
- `src/components/PropertyFormFields.tsx`
- `src/app/admin/propiedades/nueva/page.tsx`
- `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx`
- `src/app/propiedades/[slug]/page.tsx`
- `src/components/PropertyDetailTabs.tsx`

### Crear
- `src/components/PropertyMap.tsx` (componente de mapa cliente)
- Posiblemente `src/components/MapPicker.tsx` (fase 2, admin)
- `package.json` (instalar `leaflet` y `@types/leaflet`)
- Migración SQL o cambio manual en Supabase para columnas `lat` / `lng`
