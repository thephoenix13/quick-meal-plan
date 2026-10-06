import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import ChipSelect from '../components/ChipSelect';
import { useOnboarding } from '../OnboardingContext';

const CONDITIONS = ['Hypothyroid', 'Type 2 Diabetes', 'Sleep Apnea', 'Hypertension', 'Gout'];
const ALLERGIES = ['Peanuts', 'Tree Nuts', 'Dairy / Lactose', 'Gluten / Wheat', 'Eggs', 'Shellfish', 'Soy', 'Sesame'];

export default function Step07_Conditions() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [conditions, setConditions] = useState<string[]>(state.profileData.healthConditions || []);
  const [allergies, setAllergies] = useState<string[]>(state.profileData.allergies || []);

  const handleContinue = () => {
    updateProfile({ healthConditions: conditions, allergies });
    nextStep();
  };

  const hasSelections = conditions.length > 0 || allergies.length > 0;

  return (
    <StepWrapper
      title="Conditions and allergies"
      subtitle="Select any that apply. You can skip if none apply."
      onContinue={handleContinue}
      continueLabel={hasSelections ? 'Continue' : 'Skip'}
    >
      <div className="space-y-8">
        <div>
          <div className="text-sm font-medium text-gray-900 mb-3">Health conditions</div>
          <ChipSelect options={CONDITIONS} selected={conditions} onChange={setConditions} />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-900 mb-3">Food allergies</div>
          <ChipSelect options={ALLERGIES} selected={allergies} onChange={setAllergies} />
        </div>
      </div>
    </StepWrapper>
  );
}
