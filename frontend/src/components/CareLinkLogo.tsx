import React from 'react';

export const CareLinkLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; light?: boolean }> = ({
  size = 'md',
  light = true
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-2.5 group cursor-pointer">
      <div className={`${iconSizes[size]} bg-gradient-to-tr from-blue-600 via-hospital-500 to-cyan-400 rounded-xl p-1.5 shadow-lg shadow-cyan-950/60 flex items-center justify-center text-white relative transition-transform duration-300 group-hover:scale-105`}>
        {/* SVG Logo: Medical Cross + Pin + Heartbeat Animation */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full animate-heartbeat">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 7v6M9 10h6" stroke="white" />
          <path d="M6 10h2l1-2 2 4 1-2h2" stroke="#38BDF8" strokeWidth="1.8" />
        </svg>
      </div>

      <div>
        <div className={`font-extrabold ${textSizes[size]} leading-tight flex items-center tracking-tight text-white`}>
          CareLink<span className="text-cyan-400 font-bold ml-0.5 animate-pulse">ER</span>
        </div>
        <div className="text-[10px] font-extrabold text-cyan-300 tracking-wider uppercase leading-none">
          Medical Center
        </div>
      </div>
    </div>
  );
};
