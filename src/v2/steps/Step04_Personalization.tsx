import React from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step04_Personalization() {
  const { nextStep } = useOnboarding();

  return (
    <StepWrapper
      title="Almost there!"
      subtitle="Let's personalize your meal plan based on your goals and preferences."
      onContinue={nextStep}
      continueLabel="Continue"
    >
      <div className="text-sm text-gray-600">
        We'll ask a few more questions to create the perfect meal plan for you.
      </div>
    </StepWrapper>
  );
}
