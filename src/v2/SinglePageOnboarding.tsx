import React, { useEffect, useRef, useState } from 'react';
import { useOnboarding } from './OnboardingContext';
import RadioGroup from './components/RadioGroup';
import ChipSelect from './components/ChipSelect';
import SingleChipSelect from './components/SingleChipSelect';
import StepperInput from './components/StepperInput';
import { PatientProfile } from '../types';
import { computeNutritionProjection } from './nutritionProjection';
import {
  DIET_PREFERENCES,
  FormErrors,
  FormField,
  getConsistencyWarnings,
  getPantryExclusions,
  validateOnboarding,
} from './profileValidation';

interface SinglePageOnboardingProps {
  onComplete: (profile: PatientProfile, apiKey: string) => void;
}

const REGIONS = [
  'Maharashtrian', 'Konkani / Goan', 'Gujarati', 'Rajasthani', 'Marwari',
  'Punjabi / North Indian', 'UP / Awadhi', 'Bihari', 'Kashmiri', 'Himachali / Pahadi',
  'Bengali', 'Odia', 'Assamese / Northeast', 'Tamil', 'Keralite / Malayali',
  'Kannadiga / Karnataka', 'Andhra / Telugu', 'Hyderabadi', 'Sindhi',
  'Chhattisgarhi / Tribal', 'Mixed / Pan-Indian',
];

const REGIONAL_PANTRY: Record<string, string[]> = {
  'Maharashtrian': ['Jowar', 'Bajra', 'Poha', 'Kokum', 'Besan', 'Drumstick / Shevga', 'Peanut oil'],
  'Konkani / Goan': ['Kokum', 'Coconut', 'Cashew', 'Fresh fish', 'Tamarind', 'Coconut oil'],
  'Gujarati': ['Bajra', 'Jowar', 'Jaggery', 'Buttermilk', 'Besan', 'Fenugreek', 'Sesame'],
  'Rajasthani': ['Bajra', 'Besan', 'Ker Sangri', 'Lassi', 'Dry red chilli', 'Moong'],
  'Marwari': ['Bajra', 'Besan', 'Jaggery', 'Ghee', 'Dry fruits', 'Moong'],
  'Punjabi / North Indian': ['Makki atta', 'Sarson / Mustard greens', 'Lassi', 'Butter', 'Besan', 'Ajwain'],
  'UP / Awadhi': ['Wheat', 'Biryani spices', 'Lassi', 'Khoya', 'Rose water', 'Kewra'],
  'Bihari': ['Sattu', 'Chana', 'Maize', 'Gur / Jaggery', 'Mustard oil'],
  'Kashmiri': ['Saffron', 'Lotus stems', 'Dry fruits', 'Fennel / Saunf', 'Kashmiri red chilli'],
  'Himachali / Pahadi': ['Rajma', 'Madra spices', 'Ghee', 'Dry fruits', 'Buckwheat'],
  'Bengali': ['Mustard oil', 'Panch phoron', 'Hilsa fish', 'Posto / Poppy seeds', 'Moong'],
  'Odia': ['Rice', 'Mustard paste', 'Coconut', 'Panch phoron', 'Curry leaves'],
  'Assamese / Northeast': ['Rice', 'Bamboo shoot', 'Ginger', 'Lemon', 'Fish', 'Black sesame'],
  'Tamil': ['Tamarind', 'Curry leaves', 'Sambar powder', 'Coconut', 'Rice', 'Idli / Dosa batter'],
  'Keralite / Malayali': ['Coconut oil', 'Curry leaves', 'Tapioca / Kappa', 'Banana', 'Fish', 'Coconut'],
  'Kannadiga / Karnataka': ['Ragi', 'Coconut', 'Curry leaves', 'Tamarind', 'Urad Dal', 'Bisi bele spice'],
  'Andhra / Telugu': ['Tamarind', 'Red chilli', 'Sesame', 'Coconut', 'Fenugreek', 'Curry leaves'],
  'Hyderabadi': ['Basmati rice', 'Biryani spices', 'Saffron', 'Fried onion', 'Mint', 'Kewra'],
  'Sindhi': ['Wheat', 'Ladyfinger / Bhindi', 'Lotus seeds', 'Besan', 'Curry leaves'],
  'Chhattisgarhi / Tribal': ['Kodo millet', 'Tendu leaves', 'Mahua', 'Wild greens', 'Rice'],
  'Mixed / Pan-Indian': ['Basmati rice', 'Besan', 'Poha', 'Semolina', 'Ghee', 'Cumin'],
};

const UNIVERSAL_PANTRY = [
  'Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina',
  'Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal',
  'Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt',
  'Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot',
  'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi',
  'Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil',
  'Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed',
];

const FOOD_FREQUENCIES = [
  { key: 'pulses', label: 'Pulses', description: 'Dal, chana, rajma, lentils' },
  { key: 'millets', label: 'Millets', description: 'Bajra, jowar, ragi, nachni' },
  { key: 'rice', label: 'Rice', description: 'White or brown rice' },
  { key: 'meat', label: 'Meat / Poultry / Fish', description: 'Chicken, fish, eggs, mutton' },
  { key: 'dairy', label: 'Milk & Dairy', description: 'Milk, curd, paneer, cheese' },
  { key: 'fruits', label: 'Fruits', description: 'Fresh fruits, juices' },
  { key: 'fried', label: 'Fried snacks', description: 'Samosa, chakli, chips, pakoda' },
  { key: 'sweets', label: 'Sweets', description: 'Mithai, ladoo, halwa, burfi' },
  { key: 'ice_cream', label: 'Ice cream', description: 'Any frozen dessert' },
  { key: 'chocolate', label: 'Chocolate', description: 'Chocolate bars, cocoa drinks' },
];

const FREQUENCY_DISPLAY_VALUES: Record<string, string> = {
  daily: 'Daily',
  '2_weekly': '2× week',
  '3_weekly': '3× week',
  rarely: 'Rarely',
  not_specified: 'Not specified',
};

const HABIT_PREFERENCES: Record<string, string[]> = {
  Tea: ['With milk', 'Black', 'With jaggery', 'With sugar', 'Green tea'],
  Coffee: ['With milk', 'Black', 'Cold coffee', 'With sugar', 'Espresso'],
  'Soft Drinks': ['Cola', 'Lemon soda', 'Energy drink', 'Fruit juice'],
  'Fast Food': ['From home', 'Ordered in', 'Street food'],
  'Packaged snacks': ['Chips', 'Biscuits', 'Namkeen', 'Chocolates'],
};

const MOTIVATIONS = [
  'Feel better in my body', 'Manage PCOS or hormones', 'More energy',
  'Fit better in my clothes', 'Be stronger and fitter', 'Build healthy habits',
  'Sleep better', 'Manage stress',
];

const ERROR_LABELS: Record<FormField, string> = {
  name: 'Name',
  age: 'Age',
  height: 'Height',
  weight: 'Current weight',
  primaryGoal: 'Primary goal',
  hormonalPhase: 'Life phase',
  goalTimeline: 'Goal timeline',
  goalWeight: 'Goal weight',
  dietPreference: 'Dietary preference',
  pantryStaples: 'Pantry staples',
  foodFrequency: 'Food frequency',
  routineHabits: 'Routine habits',
  foodsToAvoid: 'Foods to avoid',
  activityLevel: 'Activity level',
  mealsPerDay: 'Meal frequency',
  apiKey: 'Anthropic API key',
};

function FieldError({ field, errors }: { field: FormField; errors: FormErrors }) {
  const message = errors[field];
  return message ? <p id={`${field}-error`} className="mt-2 text-sm text-red-700">{message}</p> : null;
}

export default function SinglePageOnboarding({ onComplete }: SinglePageOnboardingProps) {
  const { state, updateProfile } = useOnboarding();
  const profile = state.profileData;

  // Local state for form fields
  const [apiKey, setApiKey] = useState('');
  const [name, setName] = useState(profile.name || '');
  const [secondaryLanguage, setSecondaryLanguage] = useState<string | null>(profile.secondaryLanguage || null);
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [height, setHeight] = useState(profile.height?.toString() || '');
  const [weight, setWeight] = useState(profile.currentWeight?.toString() || '');
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal || '');
  const [motivations, setMotivations] = useState<string[]>(profile.motivations || []);
  const [hormonalPhase, setHormonalPhase] = useState(profile.hormonalPhase || '');
  const [healthConditions, setHealthConditions] = useState<string[]>(profile.healthConditions || []);
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [foodsToAvoid, setFoodsToAvoid] = useState('');
  const [goalTimeline, setGoalTimeline] = useState(profile.goalTimeline || '');
  const [goalWeight, setGoalWeight] = useState(profile.goalWeight?.toString() || '');
  const [kitchenPreferences, setKitchenPreferences] = useState<string[]>(profile.kitchenPreferences?.slice(0, 1) || []);
  const [indianRegion, setIndianRegion] = useState<string | null>(profile.indianRegion || null);
  const [city, setCity] = useState(profile.city || '');
  const [stateName, setStateName] = useState(profile.state || '');
  const [pantryStaples, setPantryStaples] = useState<string[]>(profile.pantryStaples || []);
  const [nonVegDays, setNonVegDays] = useState<string[]>(profile.nonVegDays || []);
  const [foodFrequency, setFoodFrequency] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(FOOD_FREQUENCIES.map(food => [food.key, 'Not specified'])),
    ...Object.fromEntries(Object.entries(profile.foodFrequency || {}).map(([key, value]) => [
      key,
      FREQUENCY_DISPLAY_VALUES[value] || value,
    ])),
  }));
  const [mealsPerDay, setMealsPerDay] = useState(profile.mealsPerDay?.toString() || '3');
  const [routineHabits, setRoutineHabits] = useState<Array<{ category: string; frequency: number; preference?: string }>>(profile.routineHabits || []);
  const [customHabit, setCustomHabit] = useState('');
  const [householdPortions, setHouseholdPortions] = useState({
    chapatiSize: profile.householdPortions?.chapatiSize || null,
    riceBowl: profile.householdPortions?.riceBowl || null,
    dalKatori: profile.householdPortions?.dalKatori || null,
  });
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || '');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dietPreference = kitchenPreferences[0] || '';
  const selectedPantryExclusions = getPantryExclusions(pantryStaples, dietPreference, allergies, foodsToAvoid);
  const consistencyWarnings = getConsistencyWarnings({
    dietPreference,
    allergies,
    pantryStaples,
    foodFrequency,
    foodsToAvoid,
    routineHabits,
  });

  useEffect(() => {
    if (submitAttempt > 0 && Object.keys(fieldErrors).length) errorSummaryRef.current?.focus();
  }, [submitAttempt, fieldErrors]);

  const clearFieldErrors = (...fields: FormField[]) => {
    setFieldErrors(current => {
      const next = { ...current };
      fields.forEach(field => delete next[field]);
      return next;
    });
  };

  const updatePantryGroup = (options: string[], selected: string[]) => {
    setPantryStaples(current => [
      ...new Set([...current.filter(item => !options.includes(item)), ...selected]),
    ]);
    clearFieldErrors('pantryStaples');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const allowedPantryStaples = [...new Set([...UNIVERSAL_PANTRY, ...Object.values(REGIONAL_PANTRY).flat()])];
    const errors = validateOnboarding({
      name,
      age,
      height,
      weight,
      primaryGoal,
      hormonalPhase,
      goalTimeline,
      goalWeight,
      dietPreference,
      nonVegDays,
      pantryStaples,
      foodFrequency,
      routineHabits,
      routinePreferenceOptions: HABIT_PREFERENCES,
      customHabit,
      foodsToAvoid,
      activityLevel,
      mealsPerDay,
      apiKey,
      allowedPantryStaples,
    });
    setFieldErrors(errors);
    setSubmitAttempt(attempt => attempt + 1);
    if (Object.keys(errors).length) return;

    const isVegetarian = ['Vegetarian', 'Jain', 'Vegan'].includes(dietPreference);
    const isEggetarian = dietPreference === 'Eggitarian';
    const isNoPreference = dietPreference === 'No specific preference';
    const isNonVegetarian = dietPreference === 'Mix (Non-veg)';
    const foodPreference = isVegetarian ? 'vegetarian' :
      isEggetarian ? 'eggetarian' :
      isNoPreference ? 'no preference' :
      'non-vegetarian';
    const nonVegCategories = isNonVegetarian
      ? ['Meat', 'Eggs', 'Fish']
      : isEggetarian ? ['Eggs'] : [];
    const activityLabels: Record<string, string> = {
      sedentary: 'sedentary',
      lightly_active: 'lightly active',
      moderately_active: 'moderately active',
      active: 'active',
      very_active: 'very active',
    };
    const goalLabels: Record<string, string> = {
      weight_loss: 'weight loss',
      weight_gain: 'weight gain',
      pcos_thyroid: 'PCOS / Thyroid',
      sleep: 'better sleep',
      overall: 'overall wellness',
    };
    const phaseLabels: Record<string, string> = {
      regular: 'regular cycle',
      irregular: 'irregular cycle',
      perimenopause: 'perimenopause',
      postmenopause: 'post-menopause',
      pregnant_nursing: 'pregnant / nursing',
    };
    const timelineLabels: Record<string, string> = {
      '3_months': '3 months',
      '6_months': '6 months',
      '9_months': '9 months',
      '12_plus': '12+ months',
    };
    const dayAbbreviations: Record<string, string> = {
      Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu',
      Friday: 'fri', Saturday: 'sat', Sunday: 'sun',
    };
    const selectedGoalWeight = primaryGoal === 'weight_loss' ? Number(goalWeight) : Number(weight);
    const selectedNonVegDays = isNonVegetarian
      ? nonVegDays.map(day => dayAbbreviations[day] || day)
      : [];
    const frequencyValues: Record<string, string> = {
      Daily: 'daily',
      '2× week': '2_weekly',
      '3× week': '3_weekly',
      Rarely: 'rarely',
      'Not specified': 'not_specified',
    };
    const normalizedFoodFrequency = Object.fromEntries(
      Object.entries(foodFrequency).map(([key, value]) => [key, frequencyValues[value] || value])
    );
    const nutritionProjection = computeNutritionProjection({
      age,
      heightCm: height,
      weightKg: weight,
      activity: activityLevel,
      goal: primaryGoal,
      timeline: goalTimeline,
    });

    const completedProfile: PatientProfile = {
      name: trimmedName,
      age: Number(age),
      height: Number(height),
      currentWeight: Number(weight),
      goalWeight: selectedGoalWeight,
      primaryGoal: goalLabels[primaryGoal],
      hormonalPhase: phaseLabels[hormonalPhase],
      activityLevel: activityLabels[activityLevel],
      goalTimeline: timelineLabels[goalTimeline] || '3 months',
      healthConditions,
      selectedAllergies: allergies,
      secondaryLanguage: secondaryLanguage || undefined,
      motivations,
      city: city.trim() || undefined,
      state: stateName.trim() || undefined,
      foodFrequency: normalizedFoodFrequency,
      routineHabits: routineHabits.map(habit => ({
        name: habit.category,
        timesPerDay: habit.frequency,
        preference: habit.preference,
      })),
      householdPortions: {
        chapatiSize: householdPortions.chapatiSize || undefined,
        riceBowlMl: householdPortions.riceBowl ? Number(householdPortions.riceBowl) : undefined,
        dalBowlMl: householdPortions.dalKatori ? Number(householdPortions.dalKatori) : undefined,
      },
      estimatedTargets: nutritionProjection ? {
        calories: nutritionProjection.calories,
        protein: nutritionProjection.protein,
        carbs: nutritionProjection.carbs,
        fat: nutritionProjection.fat,
        fibre: nutritionProjection.fibre,
        waterGlasses: nutritionProjection.waterGlasses,
      } : undefined,
      foodPreference,
      nonVegCategories,
      meatTypes: [],
      eggTypes: [],
      fishTypes: [],
      nonVegDays: selectedNonVegDays,
      dietRichness: [],
      kitchenPreferences: [dietPreference],
      indianRegion: indianRegion || 'Mixed / Pan-Indian',
      pantryStaples: selectedPantryExclusions.allowed,
      excludedPantryStaples: selectedPantryExclusions.excluded,
      allergies: '',
      foodsToAvoid: foodsToAvoid.split(',').map(item => item.trim()).filter(Boolean).join(', '),
      mealsPerDay: Number(mealsPerDay),
      waterTarget: nutritionProjection?.waterGlasses ?? Math.round((Number(weight) * 35) / 250),
    };

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
      motivations,
      // The legacy wizard context does not include all current-app profile fields.
      // The complete, typed profile is passed directly to the generator below.
      goalTimeline: goalTimeline || undefined,
      goalWeight: goalWeight ? Number(goalWeight) : undefined,
      kitchenPreferences: [dietPreference],
      indianRegion: indianRegion || '',
      city: city || undefined,
      state: stateName || undefined,
      pantryStaples,
      nonVegDays: selectedNonVegDays,
      foodFrequency: normalizedFoodFrequency,
      mealsPerDay: Number(mealsPerDay),
      routineHabits: routineHabits.length > 0 ? routineHabits : undefined,
      householdPortions: {
        chapatiSize: householdPortions.chapatiSize || undefined,
        riceBowl: householdPortions.riceBowl || undefined,
        dalKatori: householdPortions.dalKatori || undefined,
      },
      activityLevel,
    });

    onComplete(completedProfile, apiKey.trim());
  };

  const nonVegDaysAvailable = dietPreference === 'Mix (Non-veg)';
  const projection = computeNutritionProjection({
    age,
    heightCm: height,
    weightKg: weight,
    activity: activityLevel,
    goal: primaryGoal,
    timeline: goalTimeline,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Guided Onboarding</h1>
          <p className="text-sm text-gray-600 mt-1">Match the WomenFit profile flow, then generate a comparison plan.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-10 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="note">
          <strong>Testing only — use synthetic profiles.</strong> Profile details and your API key are sent from this browser to Anthropic to generate a plan. Generated nutrition and health guidance is not clinically validated, and AI prompts cannot guarantee allergy exclusion.
        </div>
        {Object.keys(fieldErrors).length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="validation-summary-title"
            className="mb-6 scroll-mt-24 rounded-lg border border-red-300 bg-red-50 p-4 text-red-950 focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <h2 id="validation-summary-title" className="font-semibold">There are {Object.keys(fieldErrors).length} issues to fix before generating a plan</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              {(Object.entries(fieldErrors) as [FormField, string][]).map(([field, message]) => (
                <li key={field}>
                  <a href={`#${field}`} className="underline focus-visible:outline focus-visible:outline-2">
                    {ERROR_LABELS[field]}: {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {consistencyWarnings.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status">
            <h2 className="font-semibold">Profile consistency notes</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {consistencyWarnings.map(warning => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        )}
        {/* Section 1: Basic Information */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            1. Basic Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                What should we call you? <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearFieldErrors('name'); }}
                placeholder="First name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                required
              />
              <FieldError field="name" errors={fieldErrors} />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-900 mb-2">
                Language preference
              </label>
              <div className="p-3 border border-gray-200 rounded-md bg-gray-50 mb-2">
                <div className="text-sm text-gray-900">English (Primary)</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">Optional second language:</div>
              <SingleChipSelect
                options={['Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada']}
                selected={secondaryLanguage}
                onChange={setSecondaryLanguage}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Why are you here? <span className="text-xs font-normal text-gray-500">(optional; not asked in the app's current route flow)</span>
              </label>
              <ChipSelect options={MOTIVATIONS} selected={motivations} onChange={setMotivations} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  min="1"
                  step="1"
                  value={age}
                  onChange={(e) => { setAge(e.target.value); clearFieldErrors('age'); }}
                  placeholder="Age"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.age ? 'border-red-500' : 'border-gray-200'}`}
                  required
                  aria-invalid={Boolean(fieldErrors.age)}
                  aria-describedby={fieldErrors.age ? 'age-error' : undefined}
                />
                <FieldError field="age" errors={fieldErrors} />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-900 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  min="0"
                  step="any"
                  value={height}
                  onChange={(e) => { setHeight(e.target.value); clearFieldErrors('height'); }}
                  placeholder="Height"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.height ? 'border-red-500' : 'border-gray-200'}`}
                  required
                  aria-invalid={Boolean(fieldErrors.height)}
                  aria-describedby={fieldErrors.height ? 'height-error' : undefined}
                />
                <FieldError field="height" errors={fieldErrors} />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-900 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); clearFieldErrors('weight', 'goalWeight'); }}
                  placeholder="Weight"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.weight ? 'border-red-500' : 'border-gray-200'}`}
                  required
                  aria-invalid={Boolean(fieldErrors.weight)}
                  aria-describedby={fieldErrors.weight ? 'weight-error' : undefined}
                />
                <FieldError field="weight" errors={fieldErrors} />
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
                  { value: 'pcos_thyroid', label: 'PCOS / Thyroid', description: 'A goal preference for plan personalization' },
                  { value: 'sleep', label: 'Better Sleep', description: 'Improve sleep quality through food and habits' },
                  { value: 'overall', label: 'Overall Wellness', description: 'Build lasting, sustainable healthy habits' },
                ]}
                value={primaryGoal}
                onChange={(value) => { setPrimaryGoal(value); clearFieldErrors('primaryGoal'); }}
                name="primaryGoal"
                ariaLabel="Primary goal"
                ariaDescribedBy={fieldErrors.primaryGoal ? 'primaryGoal-error' : undefined}
              />
              <div id="primaryGoal"><FieldError field="primaryGoal" errors={fieldErrors} /></div>
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
                onChange={(value) => { setHormonalPhase(value); clearFieldErrors('hormonalPhase', 'primaryGoal'); }}
                name="hormonalPhase"
                ariaLabel="Hormonal or life phase"
                ariaDescribedBy={fieldErrors.hormonalPhase ? 'hormonalPhase-error' : undefined}
              />
              <div id="hormonalPhase"><FieldError field="hormonalPhase" errors={fieldErrors} /></div>
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

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="foods-to-avoid">
                Other foods to avoid <span className="text-xs font-normal text-gray-500">(optional; Quick Meal Plan only)</span>
              </label>
              <input
                id="foods-to-avoid"
                type="text"
                value={foodsToAvoid}
                onChange={(e) => { setFoodsToAvoid(e.target.value); clearFieldErrors('foodsToAvoid'); }}
                aria-invalid={Boolean(fieldErrors.foodsToAvoid)}
                aria-describedby={fieldErrors.foodsToAvoid ? 'foodsToAvoid-error' : undefined}
                placeholder="Separate foods with commas"
                className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.foodsToAvoid ? 'border-red-500' : 'border-gray-200'}`}
              />
              <div id="foodsToAvoid"><FieldError field="foodsToAvoid" errors={fieldErrors} /></div>
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
                    { value: '12_plus', label: 'Lifestyle', description: '12+ months' },
                  ]}
                  value={goalTimeline}
                  onChange={(value) => { setGoalTimeline(value); clearFieldErrors('goalTimeline'); }}
                  name="goalTimeline"
                  ariaLabel="Goal timeline"
                  ariaDescribedBy={fieldErrors.goalTimeline ? 'goalTimeline-error' : undefined}
                />
                <div id="goalTimeline"><FieldError field="goalTimeline" errors={fieldErrors} /></div>
              </div>
            )}

            {primaryGoal === 'weight_loss' && (
              <div>
                <label htmlFor="goalWeight" className="block text-sm font-medium text-gray-900 mb-2">
                  Goal weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="goalWeight"
                  min="0"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => { setGoalWeight(e.target.value); clearFieldErrors('goalWeight'); }}
                  placeholder="Goal weight"
                  className={`w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:border-gray-900 ${fieldErrors.goalWeight ? 'border-red-500' : 'border-gray-200'}`}
                  required
                  aria-invalid={Boolean(fieldErrors.goalWeight)}
                  aria-describedby={fieldErrors.goalWeight ? 'goalWeight-error' : undefined}
                />
                <FieldError field="goalWeight" errors={fieldErrors} />
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
              <RadioGroup
                options={[
                  { value: 'Jain', label: 'Jain', description: 'No meat, fish, or eggs. Pantry answers incompatible with this choice remain as context but will not be prioritized.' },
                  { value: 'Vegetarian', label: 'Vegetarian', description: 'No meat, fish, or eggs.' },
                  { value: 'Vegan', label: 'Vegan', description: 'No animal-derived foods, including dairy and eggs.' },
                  { value: 'Eggitarian', label: 'Eggitarian', description: 'Eggs allowed; no meat or fish.' },
                  { value: 'Mix (Non-veg)', label: 'Mix (Non-veg)', description: 'Meat, eggs, and fish may be included; optional weekday limits apply.' },
                  { value: 'No specific preference', label: 'No specific preference', description: 'No vegetarian / non-vegetarian restriction; allergies and foods to avoid still apply.' },
                ]}
                value={dietPreference}
                onChange={(value) => {
                  setKitchenPreferences([value]);
                  if (value !== 'Mix (Non-veg)') setNonVegDays([]);
                  clearFieldErrors('dietPreference');
                }}
                name="dietPreference"
                ariaLabel="Dietary preference"
                ariaDescribedBy={fieldErrors.dietPreference ? 'dietPreference-error' : undefined}
              />
              <div id="dietPreference">
                <FieldError field="dietPreference" errors={fieldErrors} />
                <p className="mt-2 text-xs text-gray-600">
                  Choose one option. Changing it replaces the previous choice; incompatible pantry and food-frequency answers are preserved as historical context and warned about.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Regional cuisine
              </label>
              <SingleChipSelect
                options={REGIONS}
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
              <div id="pantryStaples">
              {indianRegion && REGIONAL_PANTRY[indianRegion] && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    {indianRegion} staples
                  </div>
                  <ChipSelect
                    options={REGIONAL_PANTRY[indianRegion]}
                    selected={pantryStaples.filter(item => REGIONAL_PANTRY[indianRegion].includes(item))}
                    onChange={(selected) => updatePantryGroup(REGIONAL_PANTRY[indianRegion], selected)}
                  />
                </div>
              )}
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Pantry staples (select what you have)
              </label>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Cereals & grains</div>
                  <ChipSelect
                    options={['Rice', 'Wheat / Atta', 'Oats', 'Bread', 'Ragi', 'Poha', 'Semolina']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(0, 7).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(0, 7), selected)}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Lentils & pulses</div>
                  <ChipSelect
                    options={['Toor Dal', 'Moong Dal', 'Chana Dal', 'Masoor Dal', 'Rajma', 'Chickpeas / Chole', 'Urad Dal']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(7, 14).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(7, 14), selected)}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Proteins</div>
                  <ChipSelect
                    options={['Eggs', 'Paneer', 'Chicken', 'Fish', 'Tofu', 'Soya chunks', 'Curd / Yogurt']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(14, 21).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(14, 21), selected)}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Vegetables</div>
                  <ChipSelect
                    options={['Onion', 'Tomato', 'Potato', 'Spinach / Palak', 'Cauliflower', 'Peas', 'Carrot', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Methi']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(21, 32).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(21, 32), selected)}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Dairy & fats</div>
                  <ChipSelect
                    options={['Milk', 'Ghee', 'Butter', 'Coconut oil', 'Mustard oil']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(32, 37).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(32, 37), selected)}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Nuts & seeds</div>
                  <ChipSelect
                    options={['Almonds', 'Peanuts', 'Sesame / Til', 'Coconut', 'Cashews', 'Flaxseed']}
                    selected={pantryStaples.filter(s => UNIVERSAL_PANTRY.slice(37).includes(s))}
                    onChange={(selected) => updatePantryGroup(UNIVERSAL_PANTRY.slice(37), selected)}
                  />
                </div>
              </div>
              <FieldError field="pantryStaples" errors={fieldErrors} />
              </div>
            </div>

            {nonVegDaysAvailable && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Non-vegetarian days
                </label>
                <ChipSelect
                  options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                  selected={nonVegDays}
                  onChange={(selected) => { setNonVegDays(selected); clearFieldErrors('dietPreference'); }}
                />
                <p className="mt-2 text-xs text-gray-600">Leave all days unselected to allow non-vegetarian meals any day.</p>
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
              <div id="foodFrequency" className="space-y-3" aria-describedby={fieldErrors.foodFrequency ? 'foodFrequency-error' : undefined}>
                {FOOD_FREQUENCIES.map((food) => (
                  <div key={food.key} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-1">{food.label}</div>
                    <div className="text-xs text-gray-500 mb-2">{food.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {['Daily', '2× week', '3× week', 'Rarely', 'Not specified'].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          aria-pressed={foodFrequency[food.key] === freq}
                          onClick={() => {
                            setFoodFrequency({ ...foodFrequency, [food.key]: freq });
                            clearFieldErrors('foodFrequency');
                          }}
                          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                            foodFrequency[food.key] === freq
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
                <FieldError field="foodFrequency" errors={fieldErrors} />
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
                onChange={(value) => { setMealsPerDay(value); clearFieldErrors('mealsPerDay'); }}
                name="mealsPerDay"
                ariaLabel="Meals per day"
                ariaDescribedBy={fieldErrors.mealsPerDay ? 'mealsPerDay-error' : undefined}
              />
              <div id="mealsPerDay"><FieldError field="mealsPerDay" errors={fieldErrors} /></div>
            </div>
          </div>
        </section>

        {/* Section 5: Lifestyle & Activity */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            5. Lifestyle & Activity
          </h2>

          <div className="space-y-6">
            <div id="routineHabits" aria-describedby={fieldErrors.routineHabits ? 'routineHabits-error' : undefined}>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Routine habits (optional)
              </label>
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Select habits:</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(HABIT_PREFERENCES).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (routineHabits.find(h => h.category === category)) {
                          setRoutineHabits(routineHabits.filter(h => h.category !== category));
                        } else {
                          setRoutineHabits([...routineHabits, { category, frequency: 1, preference: '' }]);
                        }
                        clearFieldErrors('routineHabits');
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
                      <div key={habit.category} className="space-y-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{habit.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">Times per day</span>
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
                            {!HABIT_PREFERENCES[habit.category] && (
                              <button
                                type="button"
                                onClick={() => setRoutineHabits(routineHabits.filter(item => item.category !== habit.category))}
                                aria-label={`Remove custom routine ${habit.category}`}
                                className="text-sm font-medium text-red-700 underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          {HABIT_PREFERENCES[habit.category] ? (
                            <>
                              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`habit-${habit.category}`}>
                                Usual preference
                              </label>
                              <select
                                id={`habit-${habit.category}`}
                                value={habit.preference || ''}
                                onChange={(e) => setRoutineHabits(routineHabits.map(h =>
                                  h.category === habit.category ? { ...h, preference: e.target.value } : h
                                ))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                              >
                                <option value="">Not specified</option>
                                {HABIT_PREFERENCES[habit.category].map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <p className="text-xs text-gray-600">Custom routine; no preset preference choices.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="sr-only" htmlFor="custom-habit">Add a custom habit</label>
                  <input
                    id="custom-habit"
                    type="text"
                    value={customHabit}
                    maxLength={40}
                    onChange={(e) => { setCustomHabit(e.target.value); clearFieldErrors('routineHabits'); }}
                    placeholder="Add another routine food or drink"
                    className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = customHabit.trim();
                      if (!trimmed || trimmed.length > 40 || routineHabits.some(h => h.category.toLowerCase() === trimmed.toLowerCase())) {
                        setFieldErrors(current => ({ ...current, routineHabits: 'Enter a unique custom routine name of 1–40 characters.' }));
                        return;
                      }
                      setRoutineHabits([...routineHabits, { category: trimmed, frequency: 1, preference: '' }]);
                      setCustomHabit('');
                      clearFieldErrors('routineHabits');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                <FieldError field="routineHabits" errors={fieldErrors} />
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
                    options={['Small', 'Medium', 'Large']}
                    selected={householdPortions.chapatiSize}
                    onChange={(val) => setHouseholdPortions({ ...householdPortions, chapatiSize: val })}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Rice bowl</div>
                  <SingleChipSelect
                    options={['Small bowl (150 ml)', 'Medium bowl (200 ml)', 'Large bowl (300 ml)']}
                    selected={householdPortions.riceBowl}
                    onChange={(val) => setHouseholdPortions({ ...householdPortions, riceBowl: val })}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Dal katori</div>
                  <SingleChipSelect
                    options={['Small katori (150 ml)', 'Medium katori (200 ml)', 'Large katori (250 ml)']}
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
                onChange={(value) => { setActivityLevel(value); clearFieldErrors('activityLevel'); }}
                name="activityLevel"
                ariaLabel="Activity level"
                ariaDescribedBy={fieldErrors.activityLevel ? 'activityLevel-error' : undefined}
              />
              <div id="activityLevel"><FieldError field="activityLevel" errors={fieldErrors} /></div>
            </div>
          </div>
        </section>

        {/* Section 6: Profile review and estimated targets */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            6. Profile Review & Nutrition Projection
          </h2>
          <p className="text-sm leading-6 text-gray-600 mb-4">
            A comparison preview based on the app's current target formulas. Estimates are not a prescription or medical advice.
          </p>
          <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Profile summary</h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div><dt className="inline text-gray-500">Name: </dt><dd className="inline font-medium text-gray-900">{name || '—'}</dd></div>
              <div><dt className="inline text-gray-500">Language: </dt><dd className="inline font-medium text-gray-900">{secondaryLanguage || 'English'}</dd></div>
              <div><dt className="inline text-gray-500">Age / height / weight: </dt><dd className="inline font-medium text-gray-900">{age || '—'} yrs / {height || '—'} cm / {weight || '—'} kg</dd></div>
              <div><dt className="inline text-gray-500">Goal: </dt><dd className="inline font-medium text-gray-900">{primaryGoal || '—'}{primaryGoal === 'weight_loss' && goalWeight ? ` · ${goalWeight} kg target` : ''}</dd></div>
              <div><dt className="inline text-gray-500">Life phase / timeline: </dt><dd className="inline font-medium text-gray-900">{hormonalPhase || '—'} / {goalTimeline || (primaryGoal === 'sleep' ? '3-month preview' : '—')}</dd></div>
              <div><dt className="inline text-gray-500">Activity / meals: </dt><dd className="inline font-medium text-gray-900">{activityLevel || '—'} / {mealsPerDay} per day</dd></div>
              <div><dt className="inline text-gray-500">Conditions: </dt><dd className="inline font-medium text-gray-900">{healthConditions.join(', ') || 'None selected'}</dd></div>
              <div><dt className="inline text-gray-500">Allergies: </dt><dd className="inline font-medium text-gray-900">{allergies.join(', ') || 'None selected'}</dd></div>
              <div><dt className="inline text-gray-500">Diet / region: </dt><dd className="inline font-medium text-gray-900">{dietPreference || 'Not selected'} / {indianRegion || 'Not specified'}</dd></div>
              <div><dt className="inline text-gray-500">City / state: </dt><dd className="inline font-medium text-gray-900">{[city, stateName].filter(Boolean).join(', ') || 'Not specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Pantry selection (context): </dt><dd className="inline font-medium text-gray-900">{pantryStaples.join(', ') || 'Not specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Compatible pantry to prioritize: </dt><dd className="inline font-medium text-gray-900">{selectedPantryExclusions.allowed.join(', ') || 'None selected'}</dd></div>
              {selectedPantryExclusions.excluded.length > 0 && (
                <div className="sm:col-span-2"><dt className="inline text-gray-500">Excluded from generation: </dt><dd className="inline font-medium text-gray-900">{selectedPantryExclusions.excluded.join(', ')}</dd></div>
              )}
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Non-veg days: </dt><dd className="inline font-medium text-gray-900">{nonVegDaysAvailable ? nonVegDays.join(', ') || 'Any day' : 'Not applicable for this diet choice'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Food frequency: </dt><dd className="inline font-medium text-gray-900">{Object.keys(foodFrequency).length ? Object.entries(foodFrequency).map(([food, value]) => `${food}: ${value}`).join('; ') : 'Not specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Other foods to avoid: </dt><dd className="inline font-medium text-gray-900">{foodsToAvoid.split(',').map(item => item.trim()).filter(Boolean).join(', ') || 'None specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Routine habits: </dt><dd className="inline font-medium text-gray-900">{routineHabits.length ? routineHabits.map(habit => `${habit.category} ${habit.frequency}×/day${habit.preference ? ` (${habit.preference})` : ''}`).join('; ') : 'Not specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Household portions: </dt><dd className="inline font-medium text-gray-900">{[
                householdPortions.chapatiSize && `Chapati ${householdPortions.chapatiSize}`,
                householdPortions.riceBowl && `Rice bowl ${householdPortions.riceBowl} ml`,
                householdPortions.dalKatori && `Dal katori ${householdPortions.dalKatori} ml`,
              ].filter(Boolean).join('; ') || 'Not specified'}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-gray-500">Motivations: </dt><dd className="inline font-medium text-gray-900">{motivations.join(', ') || 'Not specified'}</dd></div>
            </dl>
          </div>
          {projection && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <div><dt className="text-gray-500">BMR estimate</dt><dd className="font-semibold text-gray-900">{projection.bmr} kcal</dd></div>
                <div><dt className="text-gray-500">TDEE estimate</dt><dd className="font-semibold text-gray-900">{projection.tdee} kcal</dd></div>
                <div><dt className="text-gray-500">Daily calories</dt><dd className="font-semibold text-gray-900">{projection.calories} kcal</dd></div>
                <div><dt className="text-gray-500">Protein</dt><dd className="font-semibold text-gray-900">{projection.protein} g</dd></div>
                <div><dt className="text-gray-500">Carbohydrates</dt><dd className="font-semibold text-gray-900">{projection.carbs} g</dd></div>
                <div><dt className="text-gray-500">Fat</dt><dd className="font-semibold text-gray-900">{projection.fat} g</dd></div>
                <div><dt className="text-gray-500">Fibre</dt><dd className="font-semibold text-gray-900">{projection.fibre} g</dd></div>
                <div><dt className="text-gray-500">Water reference</dt><dd className="font-semibold text-gray-900">{projection.waterGlasses} glasses/day</dd></div>
                <div><dt className="text-gray-500">Target date preview</dt><dd className="font-semibold text-gray-900">{projection.targetDate}</dd></div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-gray-600">
                These numbers summarize the profile for comparison. The AI-generated plan may differ; review all outputs with a qualified clinician.
              </p>
            </div>
          )}

          <div id="apiKey" className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <label className="mb-2 block text-sm font-semibold text-blue-950" htmlFor="anthropic-api-key">
              Anthropic API key <span className="text-red-600">*</span>
            </label>
            <input
              id="anthropic-api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); clearFieldErrors('apiKey'); }}
              placeholder="sk-ant-..."
              aria-invalid={Boolean(fieldErrors.apiKey)}
              aria-describedby={fieldErrors.apiKey ? 'apiKey-error' : undefined}
              className={`w-full rounded-md border bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 ${fieldErrors.apiKey ? 'border-red-500' : 'border-blue-300'}`}
              required
            />
            <FieldError field="apiKey" errors={fieldErrors} />
            <p className="mt-2 text-xs leading-5 text-blue-900">
              Used for this request only and not saved by the app. The profile and API key are sent to Anthropic from this browser. Use synthetic test data only.
            </p>
          </div>
        </section>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-6 px-6">
          <button
            type="submit"
            className="w-full min-h-11 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Generate My Meal Plan
          </button>
        </div>
      </form>
    </div>
  );
}
