import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

const SECONDARY_LANGUAGES = ['Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada'];

export default function Step02_Language() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(state.profileData.secondaryLanguage || null);

  const handleContinue = () => {
    updateProfile({ secondaryLanguage: selected || undefined });
    nextStep();
  };

  const handleSelect = (lang: string) => {
    if (selected === lang) {
      setSelected(null);
    } else {
      setSelected(lang);
    }
  };

  return (
    <StepWrapper
      title="Language preference"
      subtitle="English is always included. Optionally add one more language."
      onContinue={handleContinue}
    >
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="text-sm font-medium text-gray-900">English</div>
          <div className="text-xs text-gray-600 mt-1">Primary language (always included)</div>
        </div>

        <div>
          <div className="text-sm text-gray-700 mb-3">Optional second language:</div>
          <div className="flex flex-wrap gap-2">
            {SECONDARY_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  selected === lang
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
