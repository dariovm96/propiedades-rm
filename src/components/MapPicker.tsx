"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const DEFAULT_CENTER: L.LatLngExpression = [-33.686, -71.216]

export type MapPickerProps = {
  lat: number | null
  lng: number | null
  onLatLngChange: (lat: number, lng: number) => void
}

export default function MapPicker({ lat, lng, onLatLngChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onLatLngChangeRef = useRef(onLatLngChange)

  useEffect(() => {
    onLatLngChangeRef.current = onLatLngChange
  }, [onLatLngChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const center: L.LatLngExpression =
      lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER

    const map = L.map(container).setView(center, 15)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const markerLatLng: L.LatLngExpression =
      lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#d4849a" stroke="#6f3848" stroke-width="1.5" width="28" height="28"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    })

    const marker = L.marker(markerLatLng, { draggable: true, icon: customIcon }).addTo(map)
    markerRef.current = marker

    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      onLatLngChangeRef.current(pos.lat, pos.lng)
    })

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newLatLng: L.LatLngExpression =
        lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER
      markerRef.current.setLatLng(newLatLng)
      mapRef.current.panTo(newLatLng)
    }
  }, [lat, lng])

  return <div ref={containerRef} style={{ height: "300px", width: "100%" }} />
}
