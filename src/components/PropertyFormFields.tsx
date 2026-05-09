import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_OPTIONS,
} from "@/lib/constants"
import { PropertyFormValues } from "@/lib/property-form"

type PropertyFormFieldsProps = {
  form: PropertyFormValues
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onHighlightedChange: (checked: boolean) => void
}

export default function PropertyFormFields({
  form,
  onChange,
  onHighlightedChange,
}: PropertyFormFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-border-default dark:bg-surface-2 dark:text-content-primary">
          Informacion principal
        </h2>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-brand-700 dark:text-content-primary">
            Titulo
          </label>
          <input
            id="title"
            name="title"
            placeholder="Ej: Departamento con vista al mar"
            required
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
            value={form.title}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-brand-700 dark:text-content-primary">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe los principales atributos de la propiedad"
            rows={4}
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location_text" className="text-sm font-medium text-brand-700 dark:text-content-primary">
            Ubicacion
          </label>
          <input
            id="location_text"
            name="location_text"
            placeholder="Ej: Las Condes, Santiago"
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
            value={form.location_text}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-border-default dark:bg-surface-2 dark:text-content-primary">
          Detalles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium text-brand-700 dark:text-content-primary">
              Precio
            </label>
            <input
              id="price"
              name="price"
              placeholder="Ej: 125000000"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
              value={form.price}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="area_m2" className="text-sm font-medium text-brand-700 dark:text-content-primary">
              Superficie (m2)
            </label>
            <input
              id="area_m2"
              name="area_m2"
              placeholder="Ej: 85"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
              value={form.area_m2}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium text-brand-700 dark:text-content-primary">
              Estado
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                className="w-full appearance-none border border-brand-300 p-3 pr-9 rounded h-12 bg-white text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:border-border-default dark:focus:ring-border-strong/40"
                value={form.status}
                onChange={onChange}
              >
                {PROPERTY_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {PROPERTY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted dark:text-content-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact_phone" className="text-sm font-medium text-brand-700 dark:text-content-primary">
            Telefono de contacto
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            placeholder="Ej: +56 9 1234 5678"
            className="w-full border border-brand-300 p-3 rounded bg-white text-brand-900 placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-200 dark:bg-surface-1 dark:text-content-primary dark:placeholder:text-content-muted dark:border-border-default dark:focus:ring-border-strong/40"
            value={form.contact_phone}
            onChange={onChange}
          />
          <p className="text-xs text-brand-muted dark:text-content-muted">Opcional. Si se muestra, se ve en el panel admin.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700 dark:text-content-primary">
          <input
            type="checkbox"
            checked={form.highlighted}
            onChange={(event) => onHighlightedChange(event.target.checked)}
            className="accent-brand-700"
          />
          Destacar propiedad
        </label>
      </div>
    </>
  )
}