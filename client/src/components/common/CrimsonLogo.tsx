import React from 'react';

interface CrimsonLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
}

export const CrimsonLogo: React.FC<CrimsonLogoProps> = ({
  size = 'md',
  className = '',
  withText = false,
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textMap = {
    xs: 'text-xs',
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Iconic Geometric Crimson AI Logo Emblem */}
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-2xl p-0.5 flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4B2B" />
              <stop offset="50%" stopColor="#EA4335" />
              <stop offset="100%" stopColor="#B71C1C" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF8A65" />
              <stop offset="100%" stopColor="#FF1744" />
            </linearGradient>
            <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Hexagon / Diamond Crest */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill="url(#crimsonGrad)"
          />

          {/* Inner Geometric Quantum Core */}
          <path
            d="M24 10L35 24L24 38L13 24L24 10Z"
            fill="white"
            fillOpacity="0.2"
          />

          {/* Glowing 4-Point Star Core */}
          <path
            d="M24 13C24 19 18 24 12 24C18 24 24 29 24 35C24 29 30 24 36 24C30 24 24 19 24 13Z"
            fill="white"
            filter="url(#crimsonGlow)"
          />

          {/* Micro Center Node */}
          <circle cx="24" cy="24" r="2.5" fill="#FFF8E7" />
        </svg>
      </div>

      {withText && (
        <span className={`${textMap[size]} text-white tracking-tight font-sans`}>
          Crimson<span className="text-[#ea4335] ml-1 font-bold">AI</span>
        </span>
      )}
    </div>
  );
};
