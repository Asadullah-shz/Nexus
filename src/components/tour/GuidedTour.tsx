import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  isRunning: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ steps, isRunning, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionTooltip = () => {
    const step = steps[currentStep];
    if (!step) return;

    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const placement = step.placement || 'bottom';
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const OFFSET = 12;
    const TOOLTIP_W = 300;
    const TOOLTIP_H = 150;

    setHighlightStyle({
      position: 'fixed',
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      borderRadius: 8,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
      zIndex: 9998,
      transition: 'all 0.3s',
    });

    let top = 0, left = 0;
    if (placement === 'bottom') {
      top = rect.bottom + scrollY + OFFSET;
      left = rect.left + scrollX + rect.width / 2 - TOOLTIP_W / 2;
    } else if (placement === 'top') {
      top = rect.top + scrollY - TOOLTIP_H - OFFSET;
      left = rect.left + scrollX + rect.width / 2 - TOOLTIP_W / 2;
    } else if (placement === 'right') {
      top = rect.top + scrollY + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.right + scrollX + OFFSET;
    } else {
      top = rect.top + scrollY + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.left + scrollX - TOOLTIP_W - OFFSET;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_W - 8));

    setTooltipStyle({
      position: 'absolute',
      top,
      left,
      width: TOOLTIP_W,
      zIndex: 9999,
    });

    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(positionTooltip, 100);
    return () => clearTimeout(timer);
  }, [currentStep, isRunning]);

  if (!isRunning || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <>
      {}
      <div style={highlightStyle} />

      {}
      <div ref={tooltipRef} style={tooltipStyle} className="animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
          {}
          <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-white/80" />
              <span className="text-white font-semibold text-sm">{step.title}</span>
            </div>
            <button onClick={onSkip} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {}
          <div className="px-4 py-3">
            <p className="text-sm text-gray-600">{step.content}</p>
          </div>

          {}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary-600' : 'bg-gray-300'}`} />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
                >
                  <ChevronLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={() => {
                  if (isLast) onComplete();
                  else setCurrentStep(s => s + 1);
                }}
                className="flex items-center gap-1 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700"
              >
                {isLast ? 'Finish' : 'Next'} {!isLast && <ChevronRight size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface TourTriggerProps {
  onStart: () => void;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({ onStart }) => (
  <button
    onClick={onStart}
    className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-all hover:scale-110"
    title="Start guided tour"
  >
    <HelpCircle size={22} />
  </button>
);

export const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="navbar"]',
    title: 'Welcome to Business Nexus! 🎉',
    content: 'This is the main navigation. Use it to access your profile, notifications, and messages.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    content: 'Use the sidebar to navigate between different sections: Find investors/startups, messages, documents, and more.',
    placement: 'right',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Your Dashboard',
    content: 'Your personalized dashboard shows key metrics, collaboration requests, and recommended connections.',
    placement: 'right',
  },
  {
    target: '[data-tour="messages"]',
    title: 'Messaging',
    content: 'Send and receive messages with investors and entrepreneurs directly through the platform.',
    placement: 'right',
  },
];