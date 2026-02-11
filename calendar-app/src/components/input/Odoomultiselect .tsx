// Odoo-style Multi-Select Component for Requested Services

import { useState, useRef, useEffect } from "react";

interface Service {
  id: number;
  name: string;
}

interface OdooMultiSelectProps {
  services: Service[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export default function OdooMultiSelect({
  services,
  selectedIds,
  onChange,
  disabled = false,
  label = "Requested Services",
  placeholder = "Select services...",
}: OdooMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected services
  const selectedServices = services.filter((s) => selectedIds.includes(s.id));

  // Filter services by search term
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleService = (serviceId: number) => {
    if (selectedIds.includes(serviceId)) {
      // Remove
      onChange(selectedIds.filter((id) => id !== serviceId));
    } else {
      // Add
      onChange([...selectedIds, serviceId]);
    }
  };

  const handleRemoveService = (serviceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== serviceId));
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Input Field with Chips */}
      <div
        onClick={handleInputClick}
        className={`
          min-h-[42px] w-full px-2 py-1.5 
          border border-gray-300 rounded-lg 
          bg-white
          flex flex-wrap gap-1.5 items-center
          cursor-text
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-emerald-400'}
          ${isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}
        `}
      >
        {/* Selected Service Chips */}
        {selectedServices.map((service) => (
          <span
            key={service.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded border border-emerald-200"
          >
            <span className="font-medium">{service.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => handleRemoveService(service.id, e)}
                className="hover:bg-emerald-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          disabled={disabled}
          placeholder={selectedServices.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm disabled:cursor-not-allowed"
        />

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredServices.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No services found
            </div>
          ) : (
            <ul className="py-1">
              {filteredServices.map((service) => {
                const isSelected = selectedIds.includes(service.id);
                return (
                  <li
                    key={service.id}
                    onClick={() => handleToggleService(service.id)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                      ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'text-gray-900 hover:bg-gray-50'}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {/* Checkbox */}
                      <div
                        className={`
                          w-4 h-4 border rounded flex items-center justify-center
                          ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={isSelected ? 'font-medium' : ''}>
                        {service.name}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Help Text */}
      {!disabled && (
        <p className="mt-1 text-xs text-gray-500">
          Click to select services. Search to filter options.
        </p>
      )}
    </div>
  );
}