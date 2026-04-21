import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'outlined';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true
}) => {
  const baseClasses = 'rounded-2xl h-full transition-all duration-300';
  
  const variantClasses = {
    default: '!bg-[#eff7fe]',
    primary: '!bg-[#eff7fe] text-white',
    outlined: '!bg-[#eff7fe] border-2 border-blue-1'
  };

  const hoverClass = hover ? 'hover:-translate-y-1' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2 transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-blue-1 hover:bg-blue-1 text-white shadow-md hover:shadow-lg focus:ring-blue-1',
    secondary: 'bg-gray-900 hover:bg-black text-white shadow-md hover:shadow-lg focus:ring-gray-500',
    outline: 'bg-white hover:bg-gray-50 text-blue-1 border-2 border-blue-1 hover:border-blue-1 focus:ring-blue-1',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''
      }`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
};
