import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin">
        <div className="w-full h-full rounded-full border-2 border-neutral-200 border-t-red-600 dark:border-neutral-700 dark:border-t-red-500"></div>
      </div>
    </div>
  );
}; 