"use client";

import React from "react";
import { Property } from "@/types/property";
import { MapPin, Home, Ruler, Calendar, TrendingUp } from "lucide-react";

interface PriceHistoryChartProps {
  priceHistory?: Array<{
    price: number;
    transaction_date: string;
  }>;
  area?: number;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  area,
}) => {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucun historique des prix disponible
      </div>
    );
  }

  const latestPrice = priceHistory[0]?.price;
  const pricePerSqm = area && area > 0 ? latestPrice / area : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-blue-600">
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(latestPrice)}
        </span>
        {pricePerSqm && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-normal">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(pricePerSqm)}
            /m²
          </span>
        )}
      </div>

      {priceHistory.length > 1 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="h-3 w-3" />
            <span>Historique ({priceHistory.length} transactions)</span>
          </div>
          <div className="grid gap-1">
            {priceHistory.slice(0, 3).map((entry, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {new Date(entry.transaction_date).toLocaleDateString(
                    "fr-FR",
                    {
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(entry.price)}
                </span>
              </div>
            ))}
            {priceHistory.length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-1">
                +{priceHistory.length - 3} autres transactions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface PropertyPopupProps {
  property: Property;
}

export default function PropertyPopup({ property }: PropertyPopupProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <h3 className="text-base font-medium text-gray-800 leading-tight">
            {property.address}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Property Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Type:</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-normal">
              {property.property_type}
            </span>
          </div>
          {property.area && (
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Surface:</span>
              <span className="font-medium text-gray-800">
                {property.area}m²
              </span>
            </div>
          )}
          {property.rooms && (
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Pièces:</span>
              <span className="font-medium text-gray-800">
                {property.rooms}
              </span>
            </div>
          )}
        </div>

        {/* Dernière vente - Full width */}
        {property.price_history?.[0]?.transaction_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Dernière vente:</span>
            <span className="font-medium text-gray-800">
              {formatDate(property.price_history[0].transaction_date)}
            </span>
          </div>
        )}

        {/* Price History Chart */}
        <div className="border-t border-gray-100 pt-3">
          <PriceHistoryChart
            priceHistory={property.price_history}
            area={property.area}
          />
        </div>
      </div>
    </div>
  );
}
