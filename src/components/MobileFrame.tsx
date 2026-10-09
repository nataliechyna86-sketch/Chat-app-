import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="w-screen h-[100dvh] bg-gradient-to-br from-purple-100/60 via-purple-50/40 to-white flex items-center justify-center overflow-hidden">
      {/* Mobile App Container: 100% on phones, max-w-md phone shell on desktop */}
      <main className="w-full h-full sm:max-w-[430px] sm:h-[92dvh] sm:max-h-[880px] bg-white sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-200/80 overflow-hidden flex flex-col relative">
        {children}
      </main>
    </div>
  );
};
