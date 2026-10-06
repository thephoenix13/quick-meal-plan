import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const TIMELINE_OPTIONS = [
  { value: '3_months', label: 'Immediate', description: '~3 months' },
  { value: '6_months', label: 'Quick', description: '~6 months' },
  { value: '9_months', label: 'Medium Pace', description: '~9 months' },
  { value: '12_months', label: 'Lifestyle', description: '12+ months' },
];

export default function Step08_Timeline() {
  const { state, updateProfile, nextStep, setValidationError } = useOnboarding();
  const [selected, setSelected] = useState(state.profileData.goalTimeline || '');

  const handleContinue = () => {
    if (!selected) {
      setValidationError('timeline', 'Please select a timeline');
      return;
    }
    updateProfile({ goalTimeline: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="What's your timeline?"
      onContinue={handleContinue}
      disableContinue={!selected}
    >
      <RadioGroup
        options={TIMELINE_OPTIONS}
        value={selected}
        onChange={setSelected}
        name="timeline"
      />
    </StepWrapper>
  );
}
