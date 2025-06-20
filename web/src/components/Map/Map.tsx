"use client";

import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import { Icon, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

// Center of Ivry-sur-Seine
const IVRY_CENTER: LatLngTuple = [48.8147, 2.3836];

interface Property {
  id: string;
  price: number;
  address: string;
  city: string;
  postalCode: string;
  type: string;
  area?: number;
  latitude?: number;
  longitude?: number;
}

interface MapProps {
  properties: Property[];
  center?: LatLngTuple;
  zoom?: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
};

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function Map({
  properties,
  center = IVRY_CENTER,
  zoom = 14,
}: MapProps) {
  return (
    <div className="w-full h-screen">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;

          return (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude] as LatLngTuple}
              icon={customIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold mb-1">
                    {formatPrice(property.price)}
                  </h3>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  {property.area && (
                    <p className="text-sm text-gray-600">{property.area} m²</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
