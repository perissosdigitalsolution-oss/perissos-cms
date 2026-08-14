'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingContextType {
  isOpen: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  completedSteps: string[];
  openOnboarding: () => void;
  closeOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Perissos!',
    description: 'Let\'s take a quick tour to get you up and running.',
    target: 'body',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center. View stats, recent activity, and quick actions.',
    target: '[data-onboarding="dashboard"]',
    position: 'bottom',
  },
  {
    id: 'pages',
    title: 'Manage Pages',
    description: 'Create and edit pages with our intuitive editor. Drag, drop, done.',
    target: '[data-onboarding="pages"]',
    position: 'right',
  },
  {
    id: 'blog',
    title: 'Blog Articles',
    description: 'Write and publish articles with rich text, media, and SEO controls.',
    target: '[data-onboarding="blog"]',
    position: 'right',
  },
  {
    id: 'activities',
    title: 'Activities & Events',
    description: 'Manage workshops, seminars, and events with full details.',
    target: '[data-onboarding="activities"]',
    position: 'right',
  },
  {
    id: 'settings',
    title: 'Client Settings',
    description: 'Customize your brand: logo, colors, domain, and contact info.',
    target: '[data-onboarding="settings"]',
    position: 'left',
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'Click "Preview" on any content to see changes instantly before publishing.',
    target: '[data-onboarding="preview"]',
    position: 'bottom',
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('perissos-onboarding');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const openOnboarding = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const closeOnboarding = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeOnboarding();
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
    localStorage.setItem('perissos-onboarding', JSON.stringify([...completedSteps, stepId]));
  };

  const skipOnboarding = () => {
    localStorage.setItem('perissos-onboarding', JSON.stringify(STEPS.map(s => s.id)));
    setCompletedSteps(STEPS.map(s => s.id));
    closeOnboarding();
  };

  const completeOnboarding = () => {
    localStorage.setItem('perissos-onboarding', JSON.stringify(STEPS.map(s => s.id)));
    setCompletedSteps(STEPS.map(s => s.id));
    closeOnboarding();
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        currentStep,
        steps: STEPS,
        completedSteps,
        openOnboarding,
        closeOnboarding,
        nextStep,
        previousStep,
        completeStep,
        skipOnboarding,
      }}
    >
      {children}
      {isOpen && <OnboardingUI />}
    </OnboardingContext.Provider>
  );
}

function OnboardingUI() {
  const { isOpen, currentStep, steps, closeOnboarding, nextStep, previousStep, skipOnboarding } =
    useContext(OnboardingContext)!;

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closeOnboarding} />
      
      {!step.target || step.target === 'body' ? (
        <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Step {currentStep + 1} of {steps.length}</h2>
            <button onClick={closeOnboarding} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{step.description}</p>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={previousStep}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
            <button
              onClick={skipOnboarding}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          </div>
          <div className="mt-6 flex gap-2 justify-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <OnboardingTooltip step={step} onNext={nextStep} onClose={closeOnboarding} onSkip={skipOnboarding} />
      )}
    </div>
  );
}

function OnboardingTooltip({
  step,
  onNext,
  onClose,
  onSkip,
}: {
  step: OnboardingStep;
  onNext: () => void;
  onClose: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed z-50 pointer-events-none">
      <div className="relative pointer-events-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
        <div className="flex gap-2">
          <button onClick={onNext} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            Next
          </button>
          <button onClick={onSkip} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
