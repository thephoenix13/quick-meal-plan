import React from 'react';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function StepperInput({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
}: StepperInputProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-gray-700 min-w-[100px]">{label}</span>}
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        −
      </button>
      <span className="text-sm font-medium text-gray-900 min-w-[40px] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
