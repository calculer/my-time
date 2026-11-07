import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  highlightColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  highlightColor,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        ...style,
        ...(highlightColor ? { borderInlineStartColor: highlightColor, borderInlineStartWidth: '4px' } : {}),
      }}
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
