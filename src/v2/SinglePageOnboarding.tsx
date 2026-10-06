import React, { useState } from 'react';
import { useOnboarding } from './OnboardingContext';
import RadioGroup from './components/RadioGroup';
import ChipSelect from './components/ChipSelect';
import SingleChipSelect from './components/SingleChipSelect';
import StepperInput from './components/StepperInput';

interface SinglePageOnboardingProps {
  onComplete: () => void;
}

export default function SinglePageOnboarding({ onComplete }: SinglePageOnboardingProps) {
  const { state, updateProfile } = useOnboarding();
  const profile = state.profileData;

  // Local state for form fields
  const [name, setName] = useState(profile.name || '');
  const [secondaryLanguage, setSecondaryLanguage] = useState<string | null>(profile.secondaryLanguage || null);
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [height, setHeight] = useState(profile.height?.toString() || '');
  const [weight, setWeight] = useState(profile.currentWeight?.toString() || '');
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal || '');
  const [hormonalPhase, setHormonalPhase] = useState(profile.hormonalPhase || '');
  const [healthConditions, setHealthConditions] = useState<string[]>(profile.healthConditions || []);
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [goalTimeline, setGoalTimeline] = useState(profile.goalTimeline || '');
  const [goalWeight, setGoalWeight] = useState(profile.goalWeight?.toString() || '');
  const [kitchenPreferences, setKitchenPreferences] = useState<string[]>(profile.kitchenPreferences || []);
  const [indianRegion, setIndianRegion] = useState<string | null>(profile.indianRegion || null);
  const [city, setCity] = useState(profile.city || '');
  const [stateName, setStateName] = useState(profile.state || '');
  const [pantryStaples, setPantryStaples] = useState<string[]>(profile.pantryStaples || []);
  const [nonVegDays, setNonVegDays] = useState<string[]>(profile.nonVegDays || []);
  const [foodFrequency, setFoodFrequency] = useState<Record<string, string>>(profile.foodFrequency || {});
  const [mealsPerDay, setMealsPerDay] = useState(profile.mealsPerDay?.toString() || '3');
  const [routineHabits, setRoutineHabits] = useState<Array<{ category: string; frequency: number }>>(profile.routineHabits || []);
  const [householdPortions, setHouseholdPortions] = useState({
    chapatiSize: profile.householdPortions?.chapatiSize || null,
    riceBowl: profile.householdPortions?.riceBowl || null,
    dalKatori: profile.householdPortions?.dalKatori || null,
  });
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile with all data
    updateProfile({
      name: name.trim(),
      secondaryLanguage: secondaryLanguage || undefined,
      age: Number(age),
      height: Number(height),
      currentWeight: Number(weight),
      primaryGoal,
      hormonalPhase,
      healthConditions,
      allergies,
      goalTimeline: goalTimeline || undefined,
      goalWeight: goalWeight ? Number(goalWeight) : undefined,
      kitchenPreferences,
      indianRegion: indianRegion || '',
      city: city || undefined,
      state: stateName || undefined,
      pantryStaples,
      nonVegDays,
      foodFrequency,
      mealsPerDay: Number(mealsPerDay),
      routineHabits: routineHabits.length > 0 ? routineHabits : undefined,
      householdPortions: {
        chapatiSize: householdPortions.chapatiSize || undefined,
        riceBowl: householdPortions.riceBowl || undefined,
        dalKatori: householdPortions.dalKatori || undefined,
      },
      activityLevel,
    });

    onComplete();
  };

  const isVegetarianOnly = kitchenPreferences.some(p => 
    ['Vegetarian', 'Vegan', 'Jain'].includes(p)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Guided Onboarding</h1>
          <p className="text-sm text-gray-600 mt-1">Complete all sections below to generate your personalized meal plan</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8">
        {/* Section 1: Basic Information */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            1. Basic Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What should we call you? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language preference
              </label>
              <div className="p-3 border border-gray-200 rounded-md bg-gray-50 mb-2">
                <div className="text-sm text-gray-900">English (Primary)</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">Optional second language:</div>
              <div className="flex flex-wrap gap-2">
                {['Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSecondaryLanguage(secondaryLanguage === lang ? null : lang)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      secondaryLanguage === lang
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Goals & Health */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            2. Goals & Health
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Primary goal <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'weight_loss', label: 'Lose Weight', description: 'Reach a healthy weight sustainably' },
                  { value: 'weight_gain', label: 'Gain Weight', description: 'Build mass and strength in a healthy way' },
                  { value: 'pcos_thyroid', label: 'PCOS / Thyroid', description: 'Manage hormonal condition with targeted nutrition' },
                  { value: 'sleep', label: 'Better Sleep', description: 'Improve sleep quality through food and habits' },
                  { value: 'overall', label: 'Overall Wellness', description: 'Build lasting, sustainable healthy habits' },
                ]}
                value={primaryGoal}
                onChange={setPrimaryGoal}
                name="primaryGoal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Hormonal/life phase <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'regular', label: 'Regular cycle', description: '21–35 day cycles' },
                  { value: 'irregular', label: 'Irregular cycle', description: 'Unpredictable or frequently missed periods' },
                  { value: 'perimenopause', label: 'Perimenopause', description: 'Approaching menopause, shifting cycles' },
                  { value: 'postmenopause', label: 'Post-menopause', description: '12+ months since last period' },
                  { value: 'pregnant_nursing', label: 'Pregnant / Nursing', description: 'Currently pregnant or breastfeeding' },
                ]}
                value={hormonalPhase}
                onChange={setHormonalPhase}
                name="hormonalPhase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Health conditions (optional)
              </label>
              <ChipSelect
                options={['Hypothyroid', 'Type 2 Diabetes', 'Sleep Apnea', 'Hypertension', 'Gout']}
                selected={healthConditions}
                onChange={setHealthConditions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Food allergies (optional)
              </label>
              <ChipSelect
                options={['Peanuts', 'Tree Nuts', 'Dairy / Lactose', 'Gluten / Wheat', 'Eggs', 'Shellfish', 'Soy', 'Sesame']}
                selected={allergies}
                onChange={setAllergies}
              />
            </div>

            {primaryGoal !== 'sleep' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Timeline <span className="text-red-500">*</span>
                </label>
                <RadioGroup
                  options={[
                    { value: '3_months', label: 'Immediate', description: '~3 months' },
                    { value: '6_months', label: 'Quick', description: '~6 months' },
                    { value: '9_months', label: 'Medium Pace', description: '~9 months' },
                    { value: '12_months', label: 'Lifestyle', description: '12+ months' },
                  ]}
                  value={goalTimeline}
                  onChange={setGoalTimeline}
                  name="goalTimeline"
                />
              </div>
            )}

            {primaryGoal === 'weight_loss' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Goal weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  placeholder="Goal weight"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Kitchen & Food Preferences */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            3. Kitchen & Food Preferences
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Kitchen preferences
              </label>
              <ChipSelect
                options={['Vegetarian', 'Jain', 'Vegan', 'Eggitarian', 'Mix (Non-veg)']}
                selected={kitchenPreferences}
                onChange={setKitchenPreferences}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Regional cuisine
              </label>
              <SingleChipSelect
                options={[
                  'Maharashtrian', 'Konkani / Goan', 'Gujarati', 'Rajasthani', 'Marwari',
                  'Punjabi / North Indian', 'UP / Awadhi', 'Bihari', 'Kashmiri', 'Himachali / Pahadi',
                  'Bengali', 'Odia', 'Assamese / Northeast', 'Tamil', 'Keralite / Malayali',
                  'Kannadiga / Karnataka', 'Andhra / Telugu', 'Hyderabadi', 'Sindhi',
                  'Chhattisgarhi / Tribal', 'Mixed / Pan-Indian'
                ]}
                selected={indianRegion}
                onChange={setIndianRegion}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  City (optional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  State (optional)
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Your state"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Pantry staples (select what you have)
              </label>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Cereals & grains</div>
                  <ChipSelect
                    options={['Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina']}
                    selected={pantryStaples.filter(s => ['Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Lentils & pulses</div>
                  <ChipSelect
                    options={['Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal']}
                    selected={pantryStaples.filter(s => ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Proteins</div>
                  <ChipSelect
                    options={['Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt']}
                    selected={pantryStaples.filter(s => ['Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Vegetables</div>
                  <ChipSelect
                    options={['Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi']}
                    selected={pantryStaples.filter(s => ['Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Dairy & fats</div>
                  <ChipSelect
                    options={['Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil']}
                    selected={pantryStaples.filter(s => ['Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Nuts & seeds</div>
                  <ChipSelect
                    options={['Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed']}
                    selected={pantryStaples.filter(s => ['Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed'].includes(s))}
                    onChange={(selected) => {
                      const others = pantryStaples.filter(s => !['Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed'].includes(s));
                      setPantryStaples([...others, ...selected]);
                    }}
                  />
                </div>
              </div>
            </div>

            {!isVegetarianOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Non-vegetarian days
                </label>
                <ChipSelect
                  options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                  selected={nonVegDays}
                  onChange={setNonVegDays}
                />
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Food Frequency & Meals */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            4. Food Frequency & Meals
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Food frequency
              </label>
              <div className="space-y-3">
                {['Pulses (dal/chana/rajma/lentils)', 'Millets (bajra/jowar/ragi/nachni)', 'Rice (white or brown)', 'Meat / Poultry / Fish', 'Milk & Dairy', 'Fruits'].map((food) => (
                  <div key={food} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">{food}</div>
                    <div className="flex flex-wrap gap-2">
                      {['Daily', '2× week', '3× week', 'Rarely'].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setFoodFrequency({ ...foodFrequency, [food]: freq })}
                          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                            foodFrequency[food] === freq
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Meal frequency <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                options={[
                  { value: '2', label: '2 meals a day' },
                  { value: '3', label: '3 meals a day' },
                  { value: '4', label: '4 meals a day' },
                  { value: '5', label: '5 meals a day' },
                  { value: '6', label: '6 small meals' },
                ]}
                value={mealsPerDay}
                onChange={setMealsPerDay}
                name="mealsPerDay"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Lifestyle & Activity */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            5. Lifestyle & Activity
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Routine habits (optional)
              </label>
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Select habits:</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Tea', 'Coffee', 'Soft Drinks', 'Fast Food', 'Packaged snacks'].map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (routineHabits.find(h => h.category === category)) {
                          setRoutineHabits(routineHabits.filter(h => h.category !== category));
                        } else {
                          setRoutineHabits([...routineHabits, { category, frequency: 1 }]);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        routineHabits.find(h => h.category === category)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {routineHabits.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-2">Frequency per day:</div>
                    {routineHabits.map((habit) => (
                      <div key={habit.category} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">{habit.category}</span>
                        <StepperInput
                          value={habit.frequency}
                          onChange={(freq) => {
                            setRoutineHabits(routineHabits.map(h => 
                              h.category === habit.category ? { ...h, frequency: freq } : h
                            ));
                          }}
                          min={1}
                          max={10}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Household portions (optional)
              </label>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Chapati size</div>
                  <SingleChipSelect
                    options={['Small (~10 cm / 70 kcal)', 'Medium (~14 cm / 100 kcal)', 'Large (~18 cm / 130 kcal)']}
                    selected={householdPortions.chapatiSize}
                    onChange={(val) => setHouseholdPortions({ ...householdPortions, chapatiSize: val })}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Rice bowl</div>
                  <SingleChipSelect
                    options={['Small (150 ml / ~100 kcal)', 'Medium (200 ml / ~130 kcal)', 'Large (300 ml / ~195 kcal)']}
                    selected={householdPortions.riceBowl}
                    onChange={(val) => setHouseholdPortions({ ...householdPortions, riceBowl: val })}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Dal katori</div>
                  <SingleChipSelect
                    options={['Small (150 ml / ~80 kcal)', 'Medium (200 ml / ~110 kcal)', 'Large (250 ml / ~135 kcal)']}
                    selected={householdPortions.dalKatori}
                    onChange={(val) => setHouseholdPortions({ ...householdPortions, dalKatori: val })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Activity level <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                options={[
                  { value: 'sedentary', label: 'Sedentary', description: 'Desk job/little exercise' },
                  { value: 'lightly_active', label: 'Lightly active', description: '1–3 light workouts or walks/week' },
                  { value: 'moderately_active', label: 'Moderately active', description: '3–5 workouts/week' },
                  { value: 'active', label: 'Active', description: 'Hard exercise 5–6 days/week' },
                  { value: 'very_active', label: 'Very active', description: 'Physical job or twice-daily training' },
                ]}
                value={activityLevel}
                onChange={setActivityLevel}
                name="activityLevel"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-6 px-6">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Generate My Meal Plan
          </button>
        </div>
      </form>
    </div>
  );
}
