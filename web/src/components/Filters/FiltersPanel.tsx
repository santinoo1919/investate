"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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

interface FiltersPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  propertyTypes: string[];
  priceRange: { min: number; max: number };
  dateRange: { start: string; end: string };
}

export default function FiltersPanel({
  filters: initialFilters,
  onFilterChange,
  propertyTypes,
  priceRange,
  dateRange,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [localFilters, setLocalFilters] = useState<Filters>(initialFilters);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (
    key: keyof Filters,
    value: string | number | string[] | undefined
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
    setIsDirty(true);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsDirty(false);
  };

  const handleReset = () => {
    const emptyFilters: Filters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsDirty(false);
  };

  return (
    <div className="absolute top-0 left-0 h-full p-2 z-[1000] pointer-events-none">
      <div
        className={`bg-white rounded-lg shadow-lg h-full flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto`}
        style={{
          width: "320px",
          transform: isOpen ? "translateX(0)" : "translateX(calc(-100% + 2px))",
        }}
      >
        <div className="relative h-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 transition-transform duration-300 ease-in-out"
            style={{ zIndex: 1 }}
            aria-label={isOpen ? "Collapse filters" : "Expand filters"}
          >
            <ChevronLeftIcon
              className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>

          <div className="w-full h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Filtres</h2>
            </div>

            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
              {/* Filter sections */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type de bien
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={localFilters.propertyTypes?.[0] || ""}
                  onChange={(e) =>
                    handleChange(
                      "propertyTypes",
                      e.target.value ? [e.target.value] : undefined
                    )
                  }
                >
                  <option value="">Tous les types</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prix (€)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={localFilters.minPrice || ""}
                      onChange={(e) =>
                        handleChange(
                          "minPrice",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={localFilters.maxPrice || ""}
                      onChange={(e) =>
                        handleChange(
                          "maxPrice",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de pièces
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={1}
                      value={localFilters.minRooms || ""}
                      onChange={(e) =>
                        handleChange(
                          "minRooms",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={1}
                      value={localFilters.maxRooms || ""}
                      onChange={(e) =>
                        handleChange(
                          "maxRooms",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Surface (m²)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={0}
                      value={localFilters.minArea || ""}
                      onChange={(e) =>
                        handleChange(
                          "minArea",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={0}
                      value={localFilters.maxArea || ""}
                      onChange={(e) =>
                        handleChange(
                          "maxArea",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de transaction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={dateRange.start}
                      max={dateRange.end}
                      value={localFilters.startDate || ""}
                      onChange={(e) =>
                        handleChange("startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min={dateRange.start}
                      max={dateRange.end}
                      value={localFilters.endDate || ""}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleApply}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !isDirty && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!isDirty}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
