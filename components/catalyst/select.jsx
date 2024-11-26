import React from 'react';

export const Select = ({ 
  value, 
  onChange, 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border border-neutral-300 dark:border-neutral-700 
        bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white
        focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:border-transparent
        px-4 py-2 appearance-none
        bg-no-repeat bg-right
        ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em'
      }}
      {...props}
    >
      {children}
    </select>
  );
}; 