import React from 'react';

interface ChipProps {
  label: string;
  color?: string;
  variant?: 'solid' | 'subtle' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  color = '#6C5CE7',
  variant = 'subtle',
  size = 'md',
  icon,
  onRemove,
  className = '',
}) => {
  const sizeStyles = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs sm:text-sm px-3 py-1';

  let customStyle: React.CSSProperties = {};
  let variantClass = '';

  if (variant === 'subtle') {
    customStyle = {
      backgroundColor: `${color}18`,
      color: color,
    };
    variantClass = 'font-medium';
  } else if (variant === 'solid') {
    customStyle = {
      backgroundColor: color,
      color: '#FFFFFF',
    };
    variantClass = 'font-semibold shadow-xs';
  } else {
    customStyle = {
      borderColor: color,
      color: color,
    };
    variantClass = 'border font-medium';
  }

  return (
    <span
      style={customStyle}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors select-none ${sizeStyles} ${variantClass} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ms-1 hover:opacity-75 focus:outline-none"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
};
