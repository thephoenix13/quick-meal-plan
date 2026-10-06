import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import ChipSelect from '../components/ChipSelect';
import { useOnboarding } from '../OnboardingContext';

const KITCHEN_PREFS = ['Vegetarian', 'Jain', 'Vegan', 'Eggitarian', 'Mix (Non-veg)'];

export default function Step11_KitchenPreferences() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(state.profileData.kitchenPreferences || []);

  const handleContinue = () => {
    updateProfile({ kitchenPreferences: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="Kitchen preferences"
      subtitle="Select your dietary preferences. You can skip if none apply."
      onContinue={handleContinue}
      continueLabel={selected.length > 0 ? 'Continue' : 'Skip'}
    >
      <ChipSelect options={KITCHEN_PREFS} selected={selected} onChange={setSelected} />
    </StepWrapper>
  );
}
