"use client";

import { useEffect, useState } from "react";
import { LatLngTuple } from "leaflet";
import FiltersPanel from "../Filters/FiltersPanel";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { Property } from "@/types/property";
import { PropertyRepository } from "@/repositories/PropertyRepository";
import L from "leaflet";

const propertyRepository = new PropertyRepository();

// --- Custom Marker Icons ---
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Filters {
  propertyTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  startDate?: string;
  endDate?: string;
}

interface ClientMapProps {
  center?: LatLngTuple;
  zoom?: number;
}

interface PriceHistoryChartProps {
  priceHistory: Property["price_history"];
  area: Property["area"];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  area,
}) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  const sortedHistory = [...priceHistory].sort(
    (a, b) =>
      new Date(a.transaction_date).getTime() -
      new Date(b.transaction_date).getTime()
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold mb-2">Historique des prix</h4>
      <div className="space-y-2">
        {sortedHistory.map((record, index) => (
          <div
            key={record.transaction_date}
            className="flex items-center space-x-2"
          >
            <div className="text-xs text-gray-600">
              {formatDate(record.transaction_date)}
            </div>
            <div className="flex-grow h-0.5 bg-gray-200 relative">
              {index > 0 && (
                <div
                  className={`absolute right-0 text-xs ${
                    record.price > sortedHistory[index - 1].price
                      ? "text-green-600"
                      : record.price < sortedHistory[index - 1].price
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {(
                    ((record.price - sortedHistory[index - 1].price) /
                      sortedHistory[index - 1].price) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              {formatPrice(record.price)}
              {area && area > 0 && (
                <div className="text-xs text-gray-500">
                  {formatPrice(record.price / area)}/m²
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ClientMap({ center, zoom }: ClientMapProps) {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000000,
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Load all properties once on initial render
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyRepository.findAll();
        setAllProperties(data);
        setFilteredProperties(data);
        console.log(`Loaded ${data.length} properties`);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Load metadata (property types, price range, date range)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [types, prices, dates] = await Promise.all([
          propertyRepository.getPropertyTypes(),
          propertyRepository.getPriceRange(),
          propertyRepository.getDateRange(),
        ]);

        setPropertyTypes(types);
        setPriceRange(prices);
        setDateRange(dates);
      } catch (error) {
        console.error("Error loading metadata:", error);
      }
    };

    loadMetadata();
  }, []);

  // Apply filters on the client side
  useEffect(() => {
    let result = allProperties;

    // Property Type
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      result = result.filter((p) =>
        filters.propertyTypes?.includes(p.property_type)
      );
    }

    // Price
    if (filters.minPrice) {
      result = result.filter(
        (p) => p.price_history[0]?.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (p) => p.price_history[0]?.price <= filters.maxPrice!
      );
    }

    // Area
    if (filters.minArea) {
      result = result.filter((p) => p.area >= filters.minArea!);
    }
    if (filters.maxArea) {
      result = result.filter((p) => p.area <= filters.maxArea!);
    }

    // Rooms
    if (filters.minRooms) {
      result = result.filter(
        (p) => p.rooms !== null && p.rooms >= filters.minRooms!
      );
    }
    if (filters.maxRooms) {
      result = result.filter(
        (p) => p.rooms !== null && p.rooms <= filters.maxRooms!
      );
    }

    // Date
    if (filters.startDate) {
      result = result.filter(
        (p) =>
          new Date(p.price_history[0]?.transaction_date) >=
          new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      result = result.filter(
        (p) =>
          new Date(p.price_history[0]?.transaction_date) <=
          new Date(filters.endDate!)
      );
    }

    setFilteredProperties(result);
  }, [filters, allProperties]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Chargement des biens...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <FiltersPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        propertyTypes={propertyTypes}
        priceRange={priceRange}
        dateRange={dateRange}
      />
      <div className="flex-1">
        <MapContainer
          center={center || [48.8147, 2.3833]}
          zoom={zoom || 14}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredProperties.map((property) => {
            if (!property.latitude || !property.longitude) return null;

            const latestPrice = property.price_history?.[0]?.price;
            const area = property.area;
            let icon = blueIcon;

            if (latestPrice && area && area > 0) {
              const pricePerSqm = latestPrice / area;
              if (pricePerSqm < 3500) {
                icon = greenIcon;
              }
            }

            return (
              <Marker
                key={property.id}
                position={[property.latitude, property.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-semibold mb-1">{property.address}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>{property.property_type}</div>
                      <div>{property.area}m²</div>
                    </div>
                    <PriceHistoryChart
                      priceHistory={property.price_history}
                      area={property.area}
                    />
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
