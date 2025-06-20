"use client";

import { useState } from "react";

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

  if (!isOpen) {
    return (
      <button
        className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-80 bg-white h-full shadow-xl overflow-y-auto border-r border-gray-200">
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Filtres</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
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
                onChange={(e) => handleChange("startDate", e.target.value)}
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

        <div className="flex space-x-3 pt-4 border-t">
          <button
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleApply}
            disabled={!isDirty}
          >
            Appliquer
          </button>
          <button
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            onClick={handleReset}
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
