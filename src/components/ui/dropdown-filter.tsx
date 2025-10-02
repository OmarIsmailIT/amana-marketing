"use client";
import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface DropdownFilterProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  multiSelect?: boolean;
}

export function DropdownFilter({
  title,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  multiSelect = true,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: string) => {
    if (multiSelect) {
      if (selectedValues.includes(option)) {
        onChange(selectedValues.filter((v) => v !== option));
      } else {
        onChange([...selectedValues, option]);
      }
    } else {
      onChange([option]);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border border-gray-700 relative ${className}`}
    >
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
        {title}
      </h3>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="sr-only">Toggle dropdown</span>
          <span
            className={
              selectedValues.length === 0 ? "text-gray-400" : "text-white"
            }
          >
            {displayText}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {selectedValues.length > 0 && (
          <button
            onClick={handleClearAll}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            title="Clear all selections"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                title={option}
                className="w-full px-3 py-2 text-left hover:bg-gray-600 flex items-center justify-between text-white"
              >
                <span>{option}</span>
                {selectedValues.includes(option) && (
                  <Check className="h-4 w-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-5" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
