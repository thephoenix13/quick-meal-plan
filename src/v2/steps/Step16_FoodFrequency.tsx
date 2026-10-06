import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const FOOD_GROUPS = [
  'Pulses (dal/chana/rajma/lentils)',
  'Millets (bajra/jowar/ragi/nachni)',
  'Rice (white or brown)',
  'Meat / Poultry / Fish',
  'Milk & Dairy',
  'Fruits',
];

const FREQUENCIES = ['Daily', '2× week', '3× week', 'Rarely'];

export default function Step16_FoodFrequency() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [frequency, setFrequency] = useState<Record<string, string>>(state.profileData.foodFrequency || {});

  const handleContinue = () => {
    updateProfile({ foodFrequency: frequency });
    nextStep();
  };

  return (
    <StepWrapper
      title="Food frequency"
      subtitle="How often do you eat these food groups?"
      onContinue={handleContinue}
      continueLabel="Continue"
    >
      <div className="space-y-4">
        {FOOD_GROUPS.map((food) => (
          <div key={food} className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-3">{food}</div>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency({ ...frequency, [food]: freq })}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    frequency[food] === freq
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
}
