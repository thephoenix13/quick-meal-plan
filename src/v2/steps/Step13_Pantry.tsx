import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import ChipSelect from '../components/ChipSelect';
import { useOnboarding } from '../OnboardingContext';

const PANTRY_CATEGORIES = {
  'Cereals & grains': ['Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina'],
  'Lentils & pulses': ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal'],
  'Proteins': ['Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt'],
  'Vegetables': ['Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi'],
  'Dairy & fats': ['Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil'],
  'Nuts & seeds': ['Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed'],
};

export default function Step13_Pantry() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(state.profileData.pantryStaples || []);

  const handleContinue = () => {
    updateProfile({ pantryStaples: selected });
    nextStep();
  };

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <StepWrapper
      title="Pantry staples"
      subtitle="Select what you have in your kitchen. You can skip if you prefer to choose later."
      onContinue={handleContinue}
      continueLabel={selected.length > 0 ? 'Continue' : 'Skip'}
    >
      <div className="space-y-6">
        {Object.entries(PANTRY_CATEGORIES).map(([category, items]) => (
          <div key={category}>
            <div className="text-sm font-medium text-gray-900 mb-2">{category}</div>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    selected.includes(item)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
}
