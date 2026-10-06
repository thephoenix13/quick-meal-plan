import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const MEAL_OPTIONS = [
  { value: '2', label: '2 meals a day' },
  { value: '3', label: '3 meals a day' },
  { value: '4', label: '4 meals a day' },
  { value: '5', label: '5 meals a day' },
  { value: '6', label: '6 small meals' },
];

export default function Step17_MealFrequency() {
  const { state, updateProfile, nextStep, setValidationError } = useOnboarding();
  const [selected, setSelected] = useState(state.profileData.mealsPerDay?.toString() || '');

  const handleContinue = () => {
    if (!selected) {
      setValidationError('meals', 'Please select meal frequency');
      return;
    }
    updateProfile({ mealsPerDay: Number(selected) });
    nextStep();
  };

  return (
    <StepWrapper
      title="Meal frequency"
      onContinue={handleContinue}
      disableContinue={!selected}
    >
      <RadioGroup
        options={MEAL_OPTIONS}
        value={selected}
        onChange={setSelected}
        name="mealFrequency"
      />
    </StepWrapper>
  );
}
