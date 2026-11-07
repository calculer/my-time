import React from 'react';
import { SUBJECT_PALETTE } from '../../data/seedData';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {SUBJECT_PALETTE.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C5CE7] dark:focus:ring-offset-slate-900 ${
                isSelected ? 'ring-2 ring-white dark:ring-slate-900 shadow-md scale-105' : 'opacity-90'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
