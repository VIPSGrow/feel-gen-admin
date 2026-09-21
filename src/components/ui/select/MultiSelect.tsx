"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import Button from '../button/Button';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className = '',
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectAll = () => {
    const allValues = filteredOptions.map(opt => opt.value);
    onChange([...new Set([...value, ...allValues])]);
  };

  const clearAll = () => onChange([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        className="w-full justify-between text-left"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {value.length > 0
          ? `${value.length} selected`
          : placeholder}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
          {/* Selected tags */}
          <div className="p-2 border-b border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 max-h-32 overflow-y-auto">
            {selectedOptions.slice(0, 5).map(option => (
              <div key={option.value} className="inline-flex items-center gap-1 px-2 py-1 mr-1 mb-1 bg-primary/10 text-primary rounded-full text-xs">
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                  className="ml-1 text-primary hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedOptions.length > 5 && (
              <span className="text-xs text-gray-500">+{selectedOptions.length - 5} more</span>
            )}
          </div>

          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              <>
                {(value.length > 0 || filteredOptions.length < options.length) && (
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                    Available
                  </div>
                )}
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${value.includes(option.value) ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100' : ''
                      }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => toggleOption(option.value)}
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => { }}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </div>
                ))}
              </>
            )}
            {filteredOptions.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex gap-2 text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation(); selectAll();
                    }}

                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearAll();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

