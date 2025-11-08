import React from 'react';

export function Select({ 
  className = '', 
  children,
  value,
  onChange,
  ...props 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectItem({ children, ...props }) {
  return <option {...props}>{children}</option>;
}
