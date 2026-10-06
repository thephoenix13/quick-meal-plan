import React from 'react';

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ChipSelect({ options, selected, onChange }: ChipSelectProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
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
