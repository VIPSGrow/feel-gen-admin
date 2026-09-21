import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  showPercentage = true,
}) => {
  const percentage = ((value / max) * 100).toFixed(1);

  return (
    <div className={`relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ${className}`}>
      <div
        className="bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 h-3 rounded-full transition-all duration-300 ease-in-out relative overflow-hidden"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white -translate-y-0.5 pointer-events-none">
          {percentage}%
        </div>
      )}
    </div>
  );
};

export default Progress;

