// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'destructive';
  size?: 'sm' | 'default';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    default: 'px-4 py-2 text-sm gap-2'
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};