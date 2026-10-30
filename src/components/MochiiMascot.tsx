import React from 'react';

interface MochiiMascotProps {
  variant?: 'happy' | 'peeking' | 'avatar' | 'icon';
  size?: number | string;
  className?: string;
}

export const MochiiMascot: React.FC<MochiiMascotProps> = ({
  variant = 'happy',
  size = 120,
  className = '',
}) => {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Main Body */}
        <circle cx="50" cy="54" r="36" fill="white" />
        {/* Left Sprout Leaf 1 */}
        <ellipse cx="28" cy="24" rx="8" ry="14" transform="rotate(-35 28 24)" fill="white" />
        {/* Left Sprout Leaf 2 */}
        <ellipse cx="40" cy="18" rx="7" ry="12" transform="rotate(-10 40 18)" fill="white" />
        {/* Happy Eyes */}
        <path d="M40 50 C40 45, 46 45, 46 50" stroke="#1F1A3A" strokeWidth="4" strokeLinecap="round" />
        <path d="M56 50 C56 45, 62 45, 62 50" stroke="#1F1A3A" strokeWidth="4" strokeLinecap="round" />
        {/* Happy Smile */}
        <path
          d="M44 60 Q51 72 58 60 Z"
          fill="#1F1A3A"
        />
        <path
          d="M47 64 Q51 70 55 64"
          fill="#FF7597"
        />
      </svg>
    );
  }

  if (variant === 'peeking') {
    // Peeking mascot at the bottom of Home screen with big cute black oval eyes looking up
    return (
      <svg
        viewBox="0 0 240 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full max-w-[280px] drop-shadow-xl ${className}`}
      >
        {/* Main Peeking Body (Curved dome rising from bottom) */}
        <path
          d="M20 130 C20 40, 220 40, 220 130 Z"
          fill="white"
        />
        {/* Left Sprout Leaf 1 */}
        <ellipse
          cx="62"
          cy="42"
          rx="12"
          ry="20"
          transform="rotate(-40 62 42)"
          fill="white"
        />
        {/* Left Sprout Leaf 2 */}
        <ellipse
          cx="82"
          cy="32"
          rx="10"
          ry="17"
          transform="rotate(-15 82 32)"
          fill="white"
        />

        {/* Big Curious Oval Eyes Looking Up */}
        <ellipse cx="102" cy="88" rx="8" ry="14" fill="#1A153A" />
        <ellipse cx="138" cy="88" rx="8" ry="14" fill="#1A153A" />

        {/* Eye Catchlights (sparkle reflection) */}
        <circle cx="104" cy="82" r="2.8" fill="white" />
        <circle cx="140" cy="82" r="2.8" fill="white" />
      </svg>
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`relative rounded-full bg-gradient-to-b from-[#8C6BFF] to-[#6A3FF5] p-1.5 shadow-lg flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-[#7547F8] flex items-center justify-center overflow-hidden">
          <MochiiMascot variant="happy" size="85%" />
        </div>
      </div>
    );
  }

  // Default 'happy' mascot (Full character with open happy smile)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-2xl ${className}`}
    >
      {/* Left Sprout Leaves */}
      <ellipse
        cx="54"
        cy="48"
        rx="15"
        ry="26"
        transform="rotate(-40 54 48)"
        fill="white"
      />
      <ellipse
        cx="78"
        cy="34"
        rx="13"
        ry="23"
        transform="rotate(-15 78 34)"
        fill="white"
      />

      {/* Main Body - Squishy Round Mochi Shape */}
      <path
        d="M100 48
           C144 48 178 78 178 120
           C178 158 144 178 100 178
           C56 178 28 158 28 120
           C28 78 56 48 100 48 Z"
        fill="white"
      />

      {/* Cheerful Crescent Eyes */}
      <path
        d="M74 102 C74 92, 88 92, 88 102"
        stroke="#1E1742"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M112 102 C112 92, 126 92, 126 102"
        stroke="#1E1742"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Rosy Cheeks */}
      <circle cx="62" cy="116" r="7" fill="#FFC7D8" opacity="0.85" />
      <circle cx="138" cy="116" r="7" fill="#FFC7D8" opacity="0.85" />

      {/* Joyful Open Laughing Smile */}
      <path
        d="M86 118 Q100 148 114 118 Z"
        fill="#1E1742"
      />
      {/* Tongue inside mouth */}
      <path
        d="M93 130 Q100 144 107 130 Q100 126 93 130 Z"
        fill="#FF6E94"
      />
    </svg>
  );
};

// Sparkle Star decorative component
export const SparkleStar: React.FC<{
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 20, className = '', style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-white pointer-events-none drop-shadow ${className}`}
      style={style}
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
};
