import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}; 