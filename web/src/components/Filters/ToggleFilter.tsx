"use client";

import { Switch } from "@headlessui/react";

interface ToggleFilterProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function ToggleFilter({
  label,
  checked,
  onChange,
}: ToggleFilterProps) {
  return (
    <Switch.Group>
      <div className="flex items-center justify-between">
        <Switch.Label className="mr-4">{label}</Switch.Label>
        <Switch
          checked={checked}
          onChange={onChange}
          className={`${
            checked ? "bg-blue-600" : "bg-gray-200"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              checked ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
