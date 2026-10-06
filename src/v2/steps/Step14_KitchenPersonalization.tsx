import React from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step14_KitchenPersonalization() {
  const { nextStep } = useOnboarding();

  return (
    <StepWrapper
      title="Kitchen personalization"
      subtitle="Let's customize your kitchen setup."
      onContinue={nextStep}
      continueLabel="Continue"
    >
      <div className="text-sm text-gray-600">
        We'll use your preferences to create the perfect meal plan for your kitchen.
      </div>
    </StepWrapper>
  );
}
