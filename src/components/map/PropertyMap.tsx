"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"

type PropertyMapProps = {
  latitude: number
  longitude: number
  title: string
  locationText?: string | null
}

export default function PropertyMap({ latitude, longitude, title, locationText }: PropertyMapProps) {
  const center: [number, number] = [latitude, longitude]

  return (
    <div className="h-52 overflow-hidden rounded-lg border border-border-subtle sm:h-64" aria-label="Mapa de ubicación de la propiedad">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <CircleMarker center={center} radius={10} pathOptions={{ color: "#2d4a6d", fillColor: "#2d4a6d", fillOpacity: 0.7 }}>
          <Popup>
            <strong>{title}</strong>
            {locationText ? <p>{locationText}</p> : null}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
