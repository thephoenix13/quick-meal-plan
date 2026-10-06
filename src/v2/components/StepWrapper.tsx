import React from 'react';
import { useOnboarding } from '../OnboardingContext';

interface StepWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
  showBack?: boolean;
  disableContinue?: boolean;
}

export default function StepWrapper({
  children,
  title,
  subtitle,
  onContinue,
  onBack,
  continueLabel = 'Continue',
  showBack = true,
  disableContinue = false,
}: StepWrapperProps) {
  const { state, prevStep } = useOnboarding();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      prevStep();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              Step {state.currentStep} of 21
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className="bg-gray-900 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(state.currentStep / 21) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-gray-600 mb-8">{subtitle}</p>
          )}
          {!subtitle && <div className="mb-8" />}
          
          <div className="mb-12">
            {children}
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            {showBack && state.currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            
            <button
              onClick={onContinue}
              disabled={disableContinue}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
