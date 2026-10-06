import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step09_GoalWeight() {
  const { state, updateProfile, nextStep, setValidationError, clearValidationError } = useOnboarding();
  const [goalWeight, setGoalWeight] = useState(state.profileData.goalWeight || '');

  const isWeightLoss = state.profileData.primaryGoal === 'weight_loss';
  const currentWeight = state.profileData.currentWeight;
  const goalNum = Number(goalWeight);
  const difference = currentWeight - goalNum;

  const handleContinue = () => {
    if (isWeightLoss) {
      if (!goalNum || goalNum <= 0) {
        setValidationError('goalWeight', 'Please enter a valid goal weight');
        return;
      }
      if (goalNum === currentWeight) {
        setValidationError('goalWeight', 'Goal weight must be different from current weight');
        return;
      }
    }
    
    updateProfile({ goalWeight: goalNum });
    clearValidationError('goalWeight');
    nextStep();
  };

  const isValid = !isWeightLoss || (goalNum > 0 && goalNum !== currentWeight);

  return (
    <StepWrapper
      title={isWeightLoss ? "What's your goal weight?" : "Wellness confirmation"}
      onContinue={handleContinue}
      disableContinue={!isValid}
    >
      {isWeightLoss ? (
        <div>
          <input
            type="number"
            step="0.1"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            placeholder="Enter goal weight (kg)"
            className="w-full px-4 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-gray-900"
          />
          
          {goalNum > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <div>Current weight: {currentWeight} kg</div>
              <div>Target weight: {goalNum} kg</div>
              <div className="font-medium mt-2">
                {difference > 0 ? `${difference.toFixed(1)} kg to lose` : `${Math.abs(difference).toFixed(1)} kg to gain`}
              </div>
            </div>
          )}
          
          {state.validationErrors.goalWeight && (
            <p className="text-sm text-red-600 mt-2">{state.validationErrors.goalWeight}</p>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          <p className="mb-4">
            You're focused on {state.profileData.primaryGoal === 'weight_gain' ? 'gaining weight' : 
               state.profileData.primaryGoal === 'pcos_thyroid' ? 'managing your hormonal health' :
               state.profileData.primaryGoal === 'sleep' ? 'improving your sleep' : 'overall wellness'}.
          </p>
          <p>We'll create a meal plan that supports your goals without focusing on weight changes.</p>
        </div>
      )}
    </StepWrapper>
  );
}
