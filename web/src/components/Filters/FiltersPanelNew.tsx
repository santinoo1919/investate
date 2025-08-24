"use client";

import { useState } from "react";
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
import { Menu, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
}

export default function FiltersPanelNew({
  filters: initialFilters,
  onFilterChange,
  propertyTypes,
  priceRange,
}: FiltersPanelNewProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(initialFilters);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
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

  const handleNumberChange =
    (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(key, e.target.value ? Number(e.target.value) : undefined);
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

  const renderFilterContent = () => (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-text-title">Filtres</h2>
      </div>

      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="propertyType" className="text-text-title">
            Type de bien
          </Label>
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
          <Label className="text-text-title">Prix (€)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                min={priceRange.min}
                max={priceRange.max}
                value={localFilters.minPrice || ""}
                onChange={handleNumberChange("minPrice")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                min={priceRange.min}
                max={priceRange.max}
                value={localFilters.maxPrice || ""}
                onChange={handleNumberChange("maxPrice")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-text-title">Nombre de pièces</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                min={1}
                value={localFilters.minRooms || ""}
                onChange={handleNumberChange("minRooms")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                min={1}
                value={localFilters.maxRooms || ""}
                onChange={handleNumberChange("maxRooms")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-text-title">Surface (m²)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                min={0}
                value={localFilters.minArea || ""}
                onChange={handleNumberChange("minArea")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                min={0}
                value={localFilters.maxArea || ""}
                onChange={handleNumberChange("maxArea")}
                className="focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-text-title">Date de transaction</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center font-normal focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDate ? (
                      format(new Date(localFilters.startDate), "dd/MM/yy")
                    ) : (
                      <span className="text-text-muted">Date début</span>
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
                      handleChange(
                        "startDate",
                        date ? date.toLocaleDateString("en-CA") : undefined
                      );
                      setStartDateOpen(false); // Close calendar after selection
                    }}
                    disabled={(date) => date.getFullYear() !== 2024}
                    defaultMonth={new Date(2024, 0, 1)}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center font-normal focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all duration-200"
                  >
                    <CalendarIcon className="mr-4 w-4" />
                    {localFilters.endDate ? (
                      format(new Date(localFilters.endDate), "dd/MM/yy")
                    ) : (
                      <span className="text-text-muted">Date fin</span>
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
                      handleChange(
                        "endDate",
                        date ? date.toLocaleDateString("en-CA") : undefined
                      );
                      setEndDateOpen(false); // Close calendar after selection
                    }}
                    disabled={(date) => date.getFullYear() !== 2024}
                    defaultMonth={new Date(2024, 0, 1)}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="text-sm font-normal"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isDirty}
            className="text-sm bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full">
        {renderFilterContent()}
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-4 left-4 z-[9999] bg-white shadow-lg font-normal"
            >
              <Menu className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            {renderFilterContent()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
