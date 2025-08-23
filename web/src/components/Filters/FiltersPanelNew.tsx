"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Menu, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface FiltersPanelNewProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  propertyTypes: string[];
  priceRange: { min: number; max: number };
  dateRange: { start: string; end: string };
}

export default function FiltersPanelNew({
  filters: initialFilters,
  onFilterChange,
  propertyTypes,
  priceRange,
  dateRange,
}: FiltersPanelNewProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(initialFilters);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (
    key: keyof Filters,
    value: string | number | string[] | undefined
  ) => {
    setLocalFilters((prev) => {
      const newValue = value === "" ? undefined : value;
      if (prev[key] === newValue) return prev; // Prevent unnecessary re-renders
      return {
        ...prev,
        [key]: newValue,
      };
    });
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

  const FilterContent = () => (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Filtres</h2>
      </div>

      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* Filter sections */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">Type de bien</Label>
          <Select
            value={localFilters.propertyTypes?.[0] || "all"}
            onValueChange={(value) =>
              handleChange(
                "propertyTypes",
                value === "all" ? undefined : [value]
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prix (€)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
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
              <Input
                type="number"
                placeholder="Max"
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
          <Label>Nombre de pièces</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
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
              <Input
                type="number"
                placeholder="Max"
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
          <Label>Surface (m²)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
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
              <Input
                type="number"
                placeholder="Max"
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
          <Label>Date de transaction</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDate ? (
                      format(new Date(localFilters.startDate), "dd/MM/yy")
                    ) : (
                      <span className="text-muted-foreground">Date début</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                >
                  <Calendar
                    mode="single"
                    selected={
                      localFilters.startDate
                        ? new Date(localFilters.startDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      console.log("Start date selected:", date);
                      handleChange(
                        "startDate",
                        date ? date.toISOString().split("T")[0] : undefined
                      );
                    }}
                    disabled={(date) => date.getFullYear() !== 2024}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDate ? (
                      format(new Date(localFilters.endDate), "dd/MM/yy")
                    ) : (
                      <span className="text-muted-foreground">Date fin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                >
                  <Calendar
                    mode="single"
                    selected={
                      localFilters.endDate
                        ? new Date(localFilters.endDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      console.log("End date selected:", date);
                      handleChange(
                        "endDate",
                        date ? date.toISOString().split("T")[0] : undefined
                      );
                    }}
                    disabled={(date) => date.getFullYear() !== 2024}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleReset} className="text-sm">
            Réinitialiser
          </Button>
          <Button onClick={handleApply} disabled={!isDirty} className="text-sm">
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full">
        <FilterContent />
      </div>

      {/* Mobile Sheet - Triggered by button */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-4 left-4 z-[9999] bg-white shadow-lg"
            >
              <Menu className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
