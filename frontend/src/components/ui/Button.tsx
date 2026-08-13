import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';

  const variants = {
    primary: 'bg-hospital-500 hover:bg-hospital-600 text-white focus:ring-hospital-500 active:bg-hospital-700',
    secondary: 'bg-hospital-50 hover:bg-hospital-100 text-hospital-600 focus:ring-hospital-500 border border-hospital-100 dark:bg-navy-800 dark:text-hospital-100 dark:border-navy-700',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-100 text-navy-800 focus:ring-hospital-500 dark:border-navy-600 dark:text-slate-200 dark:hover:bg-navy-800',
    danger: 'bg-emergencyred hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-successgreen hover:bg-emerald-700 text-white focus:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-navy-800 shadow-none'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
};
