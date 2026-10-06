import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import StepperInput from '../components/StepperInput';
import { useOnboarding } from '../OnboardingContext';

const HABIT_CATEGORIES = ['Tea', 'Coffee', 'Soft Drinks', 'Fast Food', 'Packaged snacks'];

export default function Step18_RoutineHabits() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [habits, setHabits] = useState<Array<{ category: string; frequency: number }>>(
    state.profileData.routineHabits || []
  );

  const handleContinue = () => {
    updateProfile({ routineHabits: habits });
    nextStep();
  };

  const addHabit = (category: string) => {
    if (!habits.find((h) => h.category === category)) {
      setHabits([...habits, { category, frequency: 1 }]);
    }
  };

  const removeHabit = (category: string) => {
    setHabits(habits.filter((h) => h.category !== category));
  };

  const updateFrequency = (category: string, frequency: number) => {
    setHabits(habits.map((h) => (h.category === category ? { ...h, frequency } : h)));
  };

  return (
    <StepWrapper
      title="Routine habits"
      subtitle="Select any habits you have. You can skip if none apply."
      onContinue={handleContinue}
      continueLabel={habits.length > 0 ? 'Continue' : 'Skip'}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-700 mb-2">Select habits:</div>
        <div className="flex flex-wrap gap-2 mb-6">
          {HABIT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => addHabit(category)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                habits.find((h) => h.category === category)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {habits.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 mb-2">Frequency per day:</div>
            {habits.map((habit) => (
              <div key={habit.category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{habit.category}</span>
                  <button
                    type="button"
                    onClick={() => removeHabit(habit.category)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <StepperInput
                  value={habit.frequency}
                  onChange={(freq) => updateFrequency(habit.category, freq)}
                  min={1}
                  max={10}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
