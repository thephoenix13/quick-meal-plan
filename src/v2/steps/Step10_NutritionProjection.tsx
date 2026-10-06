import React from 'react';
import StepWrapper from '../components/StepWrapper';
import { useOnboarding } from '../OnboardingContext';

export default function Step10_NutritionProjection() {
  const { state, nextStep } = useOnboarding();
  const { age, height, currentWeight, activityLevel, primaryGoal } = state.profileData;

  // Calculate BMR (Mifflin-St Jeor)
  const bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
  
  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'active': 1.725,
    'very_active': 1.9,
  };
  
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
  // Adjust for goal
  let calories = tdee;
  if (primaryGoal === 'weight_loss') calories = tdee - 500;
  else if (primaryGoal === 'weight_gain') calories = tdee + 300;

  // Macros
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);
  const fiber = 25;

  return (
    <StepWrapper
      title="Your nutrition projection"
      subtitle="Based on your profile, here's what we're targeting:"
      onContinue={nextStep}
      continueLabel="Set up my kitchen"
    >
      <div className="space-y-6">
        <div className="text-center p-6 border border-gray-200 rounded-lg">
          <div className="text-3xl font-bold text-gray-900">{Math.round(calories)}</div>
          <div className="text-sm text-gray-600 mt-1">calories per day</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{protein}g</div>
            <div className="text-xs text-gray-600 mt-1">Protein</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{carbs}g</div>
            <div className="text-xs text-gray-600 mt-1">Carbs</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{fat}g</div>
            <div className="text-xs text-gray-600 mt-1">Fat</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{fiber}g</div>
            <div className="text-xs text-gray-600 mt-1">Fiber</div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          These are estimates based on your profile. Your meal plan will be adjusted accordingly.
        </p>
      </div>
    </StepWrapper>
  );
}
