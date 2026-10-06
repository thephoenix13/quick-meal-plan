import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step01_Name() {
  const { state, updateProfile, nextStep, setValidationError, clearValidationError } = useOnboarding();
  const [name, setName] = useState(state.profileData.name);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setValidationError('name', 'Name must be at least 2 characters');
      return;
    }
    
    // Capitalize words
    const capitalized = trimmed
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    updateProfile({ name: capitalized });
    clearValidationError('name');
    nextStep();
  };

  const handleChange = (value: string) => {
    setName(value);
    if (value.trim().length >= 2) {
      clearValidationError('name');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim().length >= 2) {
      handleContinue();
    }
  };

  const isValid = name.trim().length >= 2;
  const error = state.validationErrors.name;

  return (
    <StepWrapper
      title="What should we call you?"
      onContinue={handleContinue}
      disableContinue={!isValid}
    >
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="First name"
          className="w-full px-4 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-gray-900"
          autoFocus
        />
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    </StepWrapper>
  );
}
