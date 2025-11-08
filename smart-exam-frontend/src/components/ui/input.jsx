import React from 'react';

export function Input({ 
  className = '', 
  type = 'text',
  ...props 
}) {
  return (
    <input
      type={type}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
      {...props}
    />
  );
}
