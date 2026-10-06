import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step03_BodyStats() {
  const { state, updateProfile, nextStep, setValidationError, clearValidationError } = useOnboarding();
  const [age, setAge] = useState(state.profileData.age || '');
  const [height, setHeight] = useState(state.profileData.height || '');
  const [weight, setWeight] = useState(state.profileData.currentWeight || '');

  const handleContinue = () => {
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (!ageNum || ageNum <= 0) {
      setValidationError('age', 'Please enter a valid age');
      return;
    }
    if (!heightNum || heightNum <= 0) {
      setValidationError('height', 'Please enter a valid height');
      return;
    }
    if (!weightNum || weightNum <= 0) {
      setValidationError('weight', 'Please enter a valid weight');
      return;
    }

    updateProfile({ age: ageNum, height: heightNum, currentWeight: weightNum });
    clearValidationError('age');
    clearValidationError('height');
    clearValidationError('weight');
    nextStep();
  };

  const isValid = Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;

  return (
    <StepWrapper
      title="Body stats"
      onContinue={handleContinue}
      disableContinue={!isValid}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-gray-900"
          />
          {state.validationErrors.age && (
            <p className="text-sm text-red-600 mt-2">{state.validationErrors.age}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter height"
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-gray-900"
          />
          {state.validationErrors.height && (
            <p className="text-sm text-red-600 mt-2">{state.validationErrors.height}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-gray-900"
          />
          {state.validationErrors.weight && (
            <p className="text-sm text-red-600 mt-2">{state.validationErrors.weight}</p>
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
