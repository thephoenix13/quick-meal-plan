import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import SingleChipSelect from '../components/SingleChipSelect';
import { useOnboarding } from '../OnboardingContext';

const CHAPATI_SIZES = ['Small (~10 cm / 70 kcal)', 'Medium (~14 cm / 100 kcal)', 'Large (~18 cm / 130 kcal)'];
const RICE_BOWLS = ['Small (150 ml / ~100 kcal)', 'Medium (200 ml / ~130 kcal)', 'Large (300 ml / ~195 kcal)'];
const DAL_KATORIS = ['Small (150 ml / ~80 kcal)', 'Medium (200 ml / ~110 kcal)', 'Large (250 ml / ~135 kcal)'];

export default function Step19_HouseholdPortions() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [portions, setPortions] = useState({
    chapatiSize: state.profileData.householdPortions?.chapatiSize || null,
    riceBowl: state.profileData.householdPortions?.riceBowl || null,
    dalKatori: state.profileData.householdPortions?.dalKatori || null,
  });

  const handleContinue = () => {
    updateProfile({
      householdPortions: {
        chapatiSize: portions.chapatiSize || undefined,
        riceBowl: portions.riceBowl || undefined,
        dalKatori: portions.dalKatori || undefined,
      }
    });
    nextStep();
  };

  const hasSelection = portions.chapatiSize || portions.riceBowl || portions.dalKatori;

  return (
    <StepWrapper
      title="Household portions"
      subtitle="Select your typical portion sizes. You can skip if you prefer standard portions."
      onContinue={handleContinue}
      continueLabel={hasSelection ? 'Continue' : 'Skip'}
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium text-gray-900 mb-2">Chapati size</div>
          <SingleChipSelect
            options={CHAPATI_SIZES}
            selected={portions.chapatiSize}
            onChange={(val) => setPortions({ ...portions, chapatiSize: val })}
          />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-900 mb-2">Rice bowl</div>
          <SingleChipSelect
            options={RICE_BOWLS}
            selected={portions.riceBowl}
            onChange={(val) => setPortions({ ...portions, riceBowl: val })}
          />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-900 mb-2">Dal katori</div>
          <SingleChipSelect
            options={DAL_KATORIS}
            selected={portions.dalKatori}
            onChange={(val) => setPortions({ ...portions, dalKatori: val })}
          />
        </div>
      </div>
    </StepWrapper>
  );
}
