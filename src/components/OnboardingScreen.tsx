import React, { useState } from 'react';
import { MochiiMascot, SparkleStar } from './MochiiMascot';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Meet new people',
      description: 'Chat, laugh and make new friends from around the world.',
      type: 'mascot',
    },
    {
      title: 'Video chat instantly',
      description: 'No need to add friends. Just tap and connect with someone new.',
      type: 'phone',
    },
    {
      title: 'Stay safe',
      description: 'We keep your chats private and safe. Have fun!',
      type: 'shield',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onFinish();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#734BFA] via-[#6638F6] to-[#5527E6] flex flex-col justify-between p-6 sm:p-7 text-white select-none animate-in fade-in duration-200">
      
      {/* Top Header Row with Skip button */}
      <div className="flex items-center justify-end h-8">
        {currentStep < steps.length - 1 ? (
          <button
            onClick={onFinish}
            className="text-white/80 hover:text-white font-medium text-sm px-2 py-1 rounded-full transition-colors cursor-pointer"
          >
            Skip
          </button>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Main Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto relative">
        {/* Floating Sparkle Stars */}
        <SparkleStar size={20} className="absolute top-2 right-12 opacity-80 animate-pulse" />
        <SparkleStar size={14} className="absolute top-20 left-10 opacity-70" />
        <SparkleStar size={16} className="absolute bottom-16 right-8 opacity-75 animate-bounce" />
        <SparkleStar size={12} className="absolute bottom-24 left-16 opacity-60" />

        {step.type === 'mascot' && (
          <div className="relative animate-in zoom-in-95 duration-300">
            <MochiiMascot variant="happy" size={170} />
          </div>
        )}

        {step.type === 'phone' && (
          // Phone mockup illustration with silhouette and mochii badge from Onboarding 2
          <div className="relative w-40 h-56 rounded-[28px] border-4 border-white/90 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-md p-2 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Speed lines around phone */}
            <span className="absolute -left-3 top-10 w-2.5 h-0.5 bg-white/70 rounded-full rotate-12" />
            <span className="absolute -left-4 top-16 w-3 h-0.5 bg-white/70 rounded-full" />
            <span className="absolute -right-3 top-12 w-2.5 h-0.5 bg-white/70 rounded-full -rotate-12" />
            <span className="absolute -right-4 top-18 w-3 h-0.5 bg-white/70 rounded-full" />

            {/* User silhouette inside phone */}
            <div className="w-24 h-24 rounded-full bg-[#351F78]/80 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="w-10 h-10 rounded-full bg-white/90 mb-6" />
              <div className="w-20 h-12 rounded-t-full bg-white/80 absolute bottom-0" />
            </div>

            {/* Mini Mochii Badge over phone */}
            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-white shadow-xl p-1 flex items-center justify-center rotate-6">
              <MochiiMascot variant="happy" size={42} />
            </div>
          </div>
        )}

        {step.type === 'shield' && (
          <div className="relative animate-in zoom-in-95 duration-300">
            <MochiiMascot variant="happy" size={170} />
            <SparkleStar size={24} className="absolute -top-3 right-0 text-white animate-pulse" />
            <SparkleStar size={18} className="absolute -bottom-2 left-2 text-white animate-pulse" />
          </div>
        )}
      </div>

      {/* Bottom Content Area: Title, Description, Dots & Button */}
      <div className="space-y-6 pb-4">
        {/* Texts */}
        <div className="text-center space-y-2 max-w-xs mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step.title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === currentStep
                  ? 'w-6 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Action Button: Crisp White Pill */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-full bg-white text-[#5D30F0] font-bold text-base shadow-xl hover:bg-white/95 active:scale-98 transition-all cursor-pointer flex items-center justify-center"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>

    </div>
  );
};
