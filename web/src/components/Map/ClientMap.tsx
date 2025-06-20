"use client";

import { useEffect, useState, useCallback } from "react";
import { LatLngTuple } from "leaflet";
import FiltersPanel from "../Filters/FiltersPanel";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { Property } from "@/types/property";
import { PropertyRepository } from "@/repositories/PropertyRepository";

const propertyRepository = new PropertyRepository();

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
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ClientMap({ center, zoom }: ClientMapProps) {
  const [properties, setProperties] = useState<Property[]>([]);
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

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await propertyRepository.findAll(filters);
      setProperties(data);
      console.log(`Loaded ${data.length} properties`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

  // Load properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
          {properties.map((property) =>
            property.latitude && property.longitude ? (
              <Marker
                key={property.id}
                position={[property.latitude, property.longitude]}
              >
                <Popup>
                  <div className="max-w-xs">
                    <h3 className="font-semibold mb-1">{property.address}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>{property.property_type}</div>
                      <div>
                        {property.area}m² • {property.rooms || "?"} pièces
                      </div>
                    </div>
                    <PriceHistoryChart priceHistory={property.price_history} />
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
