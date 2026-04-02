import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_OPTIONS,
} from "@/lib/constants"
import { PropertyFormValues } from "@/lib/property-form"

type PropertyFormFieldsProps = {
  form: PropertyFormValues
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onHighlightedChange: (checked: boolean) => void
  onOperationChange: (name: "for_sale" | "for_rent", checked: boolean) => void
  fieldErrors?: Partial<
    Record<"property_type" | "operation" | "region_slug" | "commune_slug" | "street" | "street_number" | "latitude" | "longitude", string>
  >
}

export default function PropertyFormFields({
  form,
  onChange,
  onHighlightedChange,
  onOperationChange,
  fieldErrors,
}: PropertyFormFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          Informacion principal
        </h2>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-brand-700 dark:text-slate-200">
            Titulo
          </label>
          <input
            id="title"
            name="title"
            placeholder="Ej: Departamento con vista al mar"
            required
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
            value={form.title}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-brand-700 dark:text-slate-200">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe los principales atributos de la propiedad"
            rows={4}
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location_text" className="text-sm font-medium text-brand-700 dark:text-slate-200">
            Ubicacion
          </label>
          <input
            id="location_text"
            name="location_text"
            placeholder="Ej: Las Condes, Santiago"
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
            value={form.location_text}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          Detalles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium text-brand-700 dark:text-slate-200">
              Precio
            </label>
            <input
              id="price"
              name="price"
              placeholder="Ej: 125000000"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
              value={form.price}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="area_m2" className="text-sm font-medium text-brand-700 dark:text-slate-200">
              Superficie (m2)
            </label>
            <input
              id="area_m2"
              name="area_m2"
              placeholder="Ej: 85"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
              value={form.area_m2}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium text-brand-700 dark:text-slate-200">
              Estado
            </label>
            <select
              id="status"
              name="status"
              className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600 dark:focus:ring-slate-500/40"
              value={form.status}
              onChange={onChange}
            >
              {PROPERTY_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {PROPERTY_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact_phone" className="text-sm font-medium text-brand-700 dark:text-slate-200">
            Telefono de contacto
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            placeholder="Ej: +56 9 1234 5678"
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
            value={form.contact_phone}
            onChange={onChange}
          />
          <p className="text-xs text-brand-muted dark:text-slate-400">Opcional. Si se muestra, se ve en el panel admin.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.highlighted}
            onChange={(event) => onHighlightedChange(event.target.checked)}
            className="accent-brand-700"
          />
          Destacar propiedad
        </label>

        <div className="space-y-4">
          <h3 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Dirección
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="property_type" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Tipo de propiedad
              </label>
              <select
                id="property_type"
                name="property_type"
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.property_type}
                onChange={onChange}
              >
                <option value="">Selecciona un tipo</option>
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="local-comercial">Local comercial</option>
              </select>
              {fieldErrors?.property_type && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.property_type}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-700 dark:text-slate-200">Operación</span>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-brand-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.for_sale}
                    onChange={(event) => onOperationChange("for_sale", event.target.checked)}
                    className="accent-brand-700"
                  />
                  Venta
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-brand-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.for_rent}
                    onChange={(event) => onOperationChange("for_rent", event.target.checked)}
                    className="accent-brand-700"
                  />
                  Arriendo
                </label>
              </div>
              {fieldErrors?.operation && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.operation}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="region" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Región
              </label>
              <input
                id="region"
                name="region"
                placeholder="Ej: Metropolitana de Santiago"
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.region}
                onChange={onChange}
              />
              {fieldErrors?.region_slug && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.region_slug}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="commune" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Comuna
              </label>
              <input
                id="commune"
                name="commune"
                placeholder="Ej: Las Condes"
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.commune}
                onChange={onChange}
              />
              {fieldErrors?.commune_slug && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.commune_slug}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="street" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Calle
              </label>
              <input
                id="street"
                name="street"
                placeholder="Ej: Avenida Apoquindo"
                required
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.street}
                onChange={onChange}
              />
              {fieldErrors?.street && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.street}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="street_number" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Número
              </label>
              <input
                id="street_number"
                name="street_number"
                placeholder="Ej: 1234"
                required
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.street_number}
                onChange={onChange}
              />
              {fieldErrors?.street_number && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.street_number}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="latitude" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Latitud
              </label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                placeholder="Ej: -33.4167"
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.latitude}
                onChange={onChange}
              />
              {fieldErrors?.latitude && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.latitude}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="longitude" className="text-sm font-medium text-brand-700 dark:text-slate-200">
                Longitud
              </label>
              <input
                id="longitude"
                name="longitude"
                type="text"
                placeholder="Ej: -70.65"
                className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-600 dark:focus:ring-slate-500/40"
                value={form.longitude}
                onChange={onChange}
              />
              {fieldErrors?.longitude && <p className="text-xs text-red-600 dark:text-red-300">{fieldErrors.longitude}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
