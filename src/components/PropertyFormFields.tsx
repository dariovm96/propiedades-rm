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
        <h2 className="text-sm font-semibold text-brand-900">Informacion principal</h2>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-brand-700">
            Titulo
          </label>
          <input
            id="title"
            name="title"
            placeholder="Ej: Departamento con vista al mar"
            required
            className="w-full border border-brand-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={form.title}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-brand-700">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe los principales atributos de la propiedad"
            rows={4}
            className="w-full border border-brand-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location_text" className="text-sm font-medium text-brand-700">
            Ubicacion
          </label>
          <input
            id="location_text"
            name="location_text"
            placeholder="Ej: Las Condes, Santiago"
            className="w-full border border-brand-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={form.location_text}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-brand-900">Detalles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium text-brand-700">
              Precio
            </label>
            <input
              id="price"
              name="price"
              placeholder="Ej: 125000000"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={form.price}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="area_m2" className="text-sm font-medium text-brand-700">
              Superficie (m2)
            </label>
            <input
              id="area_m2"
              name="area_m2"
              placeholder="Ej: 85"
              type="number"
              className="border border-brand-300 p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={form.area_m2}
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium text-brand-700">
              Estado
            </label>
            <select
              id="status"
              name="status"
              className="border border-brand-300 p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
          <label htmlFor="contact_phone" className="text-sm font-medium text-brand-700">
            Telefono de contacto
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            placeholder="Ej: +56 9 1234 5678"
            className="w-full border border-brand-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={form.contact_phone}
            onChange={onChange}
          />
          <p className="text-xs text-brand-muted">Opcional. Si se muestra, se ve en el panel admin.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700">
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