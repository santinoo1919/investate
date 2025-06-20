"use client";

import { useState } from "react";
import FiltersPanel from "@/components/Filters/FiltersPanel";

export default function TestFilters() {
  const [filters, setFilters] = useState({
    isSmallArea: true, // Default to true as per requirements
    isLowPrice: true, // Default to true as per requirements
  });

  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    console.log("Filters updated:", { ...filters, [key]: value });
  };

  return (
    <div className="flex h-screen">
      <FiltersPanel filters={filters} onFilterChange={handleFilterChange} />
      <div className="flex-1 p-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Test Filters</h1>
        <pre className="bg-white p-4 rounded shadow">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  );
}
