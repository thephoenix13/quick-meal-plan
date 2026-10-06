import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Lose Weight', description: 'Reach a healthy weight sustainably' },
  { value: 'weight_gain', label: 'Gain Weight', description: 'Build mass and strength in a healthy way' },
  { value: 'pcos_thyroid', label: 'PCOS / Thyroid', description: 'Manage hormonal condition with targeted nutrition' },
  { value: 'sleep', label: 'Better Sleep', description: 'Improve sleep quality through food and habits' },
  { value: 'overall', label: 'Overall Wellness', description: 'Build lasting, sustainable healthy habits' },
];

export default function Step05_PrimaryGoal() {
  const { state, updateProfile, nextStep, setValidationError } = useOnboarding();
  const [selected, setSelected] = useState(state.profileData.primaryGoal);

  const handleContinue = () => {
    if (!selected) {
      setValidationError('goal', 'Please select a primary goal');
      return;
    }
    updateProfile({ primaryGoal: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="What's your primary goal?"
      onContinue={handleContinue}
      disableContinue={!selected}
    >
      <RadioGroup
        options={GOAL_OPTIONS}
        value={selected}
        onChange={setSelected}
        name="primaryGoal"
      />
    </StepWrapper>
  );
}
