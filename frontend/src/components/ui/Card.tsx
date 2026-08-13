import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100 transition-all duration-300 ease-out animate-fade-in ${
        hoverEffect ? 'hover:shadow-2xl hover:shadow-cyan-950/60 hover:border-cyan-500/50 hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
