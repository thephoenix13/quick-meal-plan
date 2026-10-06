import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import RadioGroup from '../components/RadioGroup';
import { useOnboarding } from '../OnboardingContext';

const PHASE_OPTIONS = [
  { value: 'regular', label: 'Regular cycle', description: '21–35 day cycles' },
  { value: 'irregular', label: 'Irregular cycle', description: 'Unpredictable or frequently missed periods' },
  { value: 'perimenopause', label: 'Perimenopause', description: 'Approaching menopause, shifting cycles' },
  { value: 'postmenopause', label: 'Post-menopause', description: '12+ months since last period' },
  { value: 'pregnant_nursing', label: 'Pregnant / Nursing', description: 'Currently pregnant or breastfeeding' },
];

export default function Step06_HormonalPhase() {
  const { state, updateProfile, nextStep, setValidationError } = useOnboarding();
  const [selected, setSelected] = useState(state.profileData.hormonalPhase);

  const handleContinue = () => {
    if (!selected) {
      setValidationError('phase', 'Please select your hormonal/life phase');
      return;
    }
    updateProfile({ hormonalPhase: selected });
    nextStep();
  };

  return (
    <StepWrapper
      title="Hormonal/life phase"
      onContinue={handleContinue}
      disableContinue={!selected}
    >
      <RadioGroup
        options={PHASE_OPTIONS}
        value={selected}
        onChange={setSelected}
        name="hormonalPhase"
      />
    </StepWrapper>
  );
}
