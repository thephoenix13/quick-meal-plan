import React from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

interface Step21_DoneProps {
  onComplete: () => void;
}

export default function Step21_Done({ onComplete }: Step21_DoneProps) {
  const { state } = useOnboarding();

  return (
    <StepWrapper
      title="All set!"
      subtitle="Your profile is complete. Let's generate your personalized meal plan."
      onContinue={onComplete}
      continueLabel="See my plan"
    >
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-2">Summary</div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Name: {state.profileData.name}</div>
            <div>Age: {state.profileData.age} years</div>
            <div>Height: {state.profileData.height} cm</div>
            <div>Weight: {state.profileData.currentWeight} kg</div>
            <div>Goal: {state.profileData.primaryGoal}</div>
            <div>Region: {state.profileData.indianRegion || 'Not specified'}</div>
            <div>Meals per day: {state.profileData.mealsPerDay}</div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          We'll create a 7-day meal plan tailored to your preferences and goals.
        </p>
      </div>
    </StepWrapper>
  );
}
