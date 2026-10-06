import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Desk job/little exercise' },
  { value: 'lightly_active', label: 'Lightly active', description: '1–3 light workouts or walks/week' },
  { value: 'moderately_active', label: 'Moderately active', description: '3–5 workouts/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 5–6 days/week' },
  { value: 'very_active', label: 'Very active', description: 'Physical job or twice-daily training' },
];

export default function Step20_Activity() {
  const { state, updateProfile, nextStep, setValidationError } = useOnboarding();
  const [selected, setSelected] = useState(state.profileData.activityLevel);

  const handleContinue = () => {
    if (!selected) {
      setValidationError('activity', 'Please select your activity level');
      return;
    }
    updateProfile({ activityLevel: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="Activity level"
      onContinue={handleContinue}
      disableContinue={!selected}
    >
      <RadioGroup
        options={ACTIVITY_OPTIONS}
        value={selected}
        onChange={setSelected}
        name="activity"
      />
    </StepWrapper>
  );
}
