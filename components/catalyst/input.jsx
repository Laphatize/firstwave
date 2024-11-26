import React from 'react';

export const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={`w-full rounded-lg border border-neutral-300 dark:border-neutral-700 
          bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white
          focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:border-transparent
          ${leftIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-2
          placeholder-neutral-500 dark:placeholder-neutral-400
          ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}; 