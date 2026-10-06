import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export default function RadioGroup({ options, value, onChange, name }: RadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{option.label}</div>
            {option.description && (
              <div className="text-xs text-gray-600 mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
