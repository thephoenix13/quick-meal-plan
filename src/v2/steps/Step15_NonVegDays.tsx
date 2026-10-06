import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import ChipSelect from '../components/ChipSelect';
import { useOnboarding } from '../OnboardingContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Step15_NonVegDays() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(state.profileData.nonVegDays || []);

  const handleContinue = () => {
    updateProfile({ nonVegDays: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="Non-vegetarian days"
      subtitle="Select days when you eat non-veg. You can skip if you're vegetarian."
      onContinue={handleContinue}
      continueLabel={selected.length > 0 ? 'Continue' : 'Skip'}
    >
      <ChipSelect options={DAYS} selected={selected} onChange={setSelected} />
    </StepWrapper>
  );
}
