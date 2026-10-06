import React from 'react';

interface SingleChipSelectProps {
  options: string[];
  selected: string | null;
  onChange: (selected: string | null) => void;
}

export default function SingleChipSelect({ options, selected, onChange }: SingleChipSelectProps) {
  const handleSelect = (option: string) => {
    // If already selected, clear it
    if (selected === option) {
      onChange(null);
    } else {
      onChange(option);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`px-4 py-2 text-sm rounded-md border transition-colors ${
              isSelected
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
