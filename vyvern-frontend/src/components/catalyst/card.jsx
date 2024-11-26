import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm 
        border border-neutral-200 dark:border-neutral-700
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 