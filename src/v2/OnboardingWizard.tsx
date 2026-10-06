import React from 'react';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import Step01_Name from './steps/Step01_Name';
import Step02_Language from './steps/Step02_Language';
import Step03_BodyStats from './steps/Step03_BodyStats';
import Step04_Personalization from './steps/Step04_Personalization';
import Step05_PrimaryGoal from './steps/Step05_PrimaryGoal';
import Step06_HormonalPhase from './steps/Step06_HormonalPhase';
import Step07_Conditions from './steps/Step07_Conditions';
import Step08_Timeline from './steps/Step08_Timeline';
import Step09_GoalWeight from './steps/Step09_GoalWeight';
import Step10_NutritionProjection from './steps/Step10_NutritionProjection';
import Step11_KitchenPreferences from './steps/Step11_KitchenPreferences';
import Step12_RegionalCuisine from './steps/Step12_RegionalCuisine';
import Step13_Pantry from './steps/Step13_Pantry';
import Step14_KitchenPersonalization from './steps/Step14_KitchenPersonalization';
import Step15_NonVegDays from './steps/Step15_NonVegDays';
import Step16_FoodFrequency from './steps/Step16_FoodFrequency';
import Step17_MealFrequency from './steps/Step17_MealFrequency';
import Step18_RoutineHabits from './steps/Step18_RoutineHabits';
import Step19_HouseholdPortions from './steps/Step19_HouseholdPortions';
import Step20_Activity from './steps/Step20_Activity';
import Step21_Done from './steps/Step21_Done';

interface OnboardingWizardProps {
  onComplete: () => void;
}

function WizardContent({ onComplete }: OnboardingWizardProps) {
  const { state } = useOnboarding();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step01_Name />;
      case 2:
        return <Step02_Language />;
      case 3:
        return <Step03_BodyStats />;
      case 4:
        return <Step04_Personalization />;
      case 5:
        return <Step05_PrimaryGoal />;
      case 6:
        return <Step06_HormonalPhase />;
      case 7:
        return <Step07_Conditions />;
      case 8:
        return <Step08_Timeline />;
      case 9:
        return <Step09_GoalWeight />;
      case 10:
        return <Step10_NutritionProjection />;
      case 11:
        return <Step11_KitchenPreferences />;
      case 12:
        return <Step12_RegionalCuisine />;
      case 13:
        return <Step13_Pantry />;
      case 14:
        return <Step14_KitchenPersonalization />;
      case 15:
        return <Step15_NonVegDays />;
      case 16:
        return <Step16_FoodFrequency />;
      case 17:
        return <Step17_MealFrequency />;
      case 18:
        return <Step18_RoutineHabits />;
      case 19:
        return <Step19_HouseholdPortions />;
      case 20:
        return <Step20_Activity />;
      case 21:
        return <Step21_Done onComplete={onComplete} />;
      default:
        return <Step01_Name />;
    }
  };

  return <>{renderStep()}</>;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  return (
    <OnboardingProvider>
      <WizardContent onComplete={onComplete} />
    </OnboardingProvider>
  );
}
