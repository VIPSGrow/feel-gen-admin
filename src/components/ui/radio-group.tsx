"use client"

import React from 'react';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className = '' }: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  name?: string;
  checked?: boolean;
}

export function RadioGroupItem({ value, id, name = "", className = '', disabled = false, checked = false }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      name={name}
      className={`mr-2 h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-brand-500 dark:focus:ring-offset-gray-800 ${className}`}
      disabled={disabled}
    />
  );
}

