// Searchable Select Component (Combobox)

import { useState, useRef, useEffect } from "react";

interface Option {
  id: number;
  name: string;
  mobile?: string;
  mfn?: string;
  mrn?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  label: string;
  placeholder?: string;
  required?: boolean;
  name: string;
  showMeta?: boolean; // Show mobile/mfn/mrn in dropdown
  allowCreate?: boolean; // Allow creating new records
  onCreateNew?: (name: string) => void; // Callback when creating new record
  displayText?: string; // Display this text when there's no valid ID (for newly created records)
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  disabled = false,
  label,
  placeholder = "Search...",
  required = false,
  name,
  showMeta = false,
  allowCreate = false,
  onCreateNew,
  displayText,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected option (handle undefined, null, "")
  const selectedOption = (value !== undefined && value !== null && value !== "")
    ? options.find((o) => o.id === Number(value))
    : undefined;

  // Debug logging
  useEffect(() => {
    if (name === "patientId" || name === "coupleId" || name === "primaryDoctorId") {
      console.log(`🟢 SearchableSelect [${name}]:`, {
        value,
        selectedOption: selectedOption?.name,
        optionsCount: options.length,
      });
    }
  }, [value, name, selectedOption, options.length]);

  // Filter options by search term (search in name, mobile, mfn, mrn)
  const filteredOptions = options.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.name.toLowerCase().includes(term) ||
      (o.mobile && o.mobile.toLowerCase().includes(term)) ||
      (o.mfn && o.mfn.toLowerCase().includes(term)) ||
      (o.mrn && o.mrn.toLowerCase().includes(term))
    );
  });

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

  const handleSelectOption = (optionId: number) => {
    // Create a synthetic event to maintain compatibility
    const syntheticEvent = {
      target: {
        name,
        value: String(optionId),
        type: "select-one",
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm(""); // Clear search after selection
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Field */}
      <div
        onClick={handleInputClick}
        className={`
          min-h-[42px] w-full px-3 py-2.5
          border border-gray-300 rounded-lg
          bg-white
          flex items-center gap-2
          cursor-text
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-emerald-400'}
          ${isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}
        `}
      >
        {/* Display selected or search input */}
        {!isOpen && (selectedOption || displayText) ? (
          <span className="flex-1 text-sm text-gray-900">
            {selectedOption?.name || displayText || ""}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            disabled={disabled}
            placeholder={selectedOption?.name || displayText || placeholder}
            className="flex-1 outline-none bg-transparent text-sm disabled:cursor-not-allowed"
          />
        )}

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
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 && !allowCreate ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No results found
            </div>
          ) : (
            <ul className="py-1">
              {/* Empty option */}
              {!required && (
                <li
                  onClick={() => handleSelectOption(0)}
                  className="px-3 py-2 text-sm cursor-pointer text-gray-500 hover:bg-gray-50"
                >
                  -- None --
                </li>
              )}

              {/* Options */}
              {filteredOptions.map((option) => {
                const isSelected = option.id === Number(value);
                return (
                  <li
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer
                      ${isSelected ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-gray-900 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.name}</span>
                      {showMeta && (option.mobile || option.mfn || option.mrn) && (
                        <span className="text-xs text-gray-500 ml-2">
                          {option.mfn && `MFN: ${option.mfn}`}
                          {option.mrn && ` • MRN: ${option.mrn}`}
                          {option.mobile && ` • ${option.mobile}`}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}

              {/* Create New Button */}
              {allowCreate && searchTerm && onCreateNew && (
                <li
                  onClick={() => {
                    onCreateNew(searchTerm);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 text-sm cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-t border-emerald-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create new: <strong>"{searchTerm}"</strong></span>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
