export const DIET_PREFERENCES = [
  'Jain',
  'Vegetarian',
  'Vegan',
  'Eggitarian',
  'Mix (Non-veg)',
  'No specific preference',
] as const;

export type DietPreference = typeof DIET_PREFERENCES[number];

export type FormField =
  | 'name'
  | 'age'
  | 'height'
  | 'weight'
  | 'primaryGoal'
  | 'hormonalPhase'
  | 'goalTimeline'
  | 'goalWeight'
  | 'dietPreference'
  | 'pantryStaples'
  | 'foodFrequency'
  | 'routineHabits'
  | 'foodsToAvoid'
  | 'activityLevel'
  | 'mealsPerDay'
  | 'apiKey';

export type FormErrors = Partial<Record<FormField, string>>;

export interface ValidationInput {
  name: string;
  age: string;
  height: string;
  weight: string;
  primaryGoal: string;
  hormonalPhase: string;
  goalTimeline: string;
  goalWeight: string;
  dietPreference: string;
  nonVegDays: string[];
  pantryStaples: string[];
  foodFrequency: Record<string, string>;
  routineHabits: Array<{ category: string; frequency: number; preference?: string }>;
  routinePreferenceOptions: Record<string, string[]>;
  customHabit: string;
  foodsToAvoid: string;
  activityLevel: string;
  mealsPerDay: string;
  apiKey: string;
  allowedPantryStaples: string[];
}

export interface PantryExclusions {
  allowed: string[];
  excluded: string[];
}

const GOALS = ['weight_loss', 'weight_gain', 'pcos_thyroid', 'sleep', 'overall'];
const PHASES = ['regular', 'irregular', 'perimenopause', 'postmenopause', 'pregnant_nursing'];
const TIMELINES = ['3_months', '6_months', '9_months', '12_plus'];
const ACTIVITIES = ['sedentary', 'lightly_active', 'moderately_active', 'active', 'very_active'];
const MEALS_PER_DAY = ['2', '3', '4', '5', '6'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQUENCIES = ['Daily', '2× week', '3× week', 'Rarely', 'Not specified'];

const DIET_EXCLUSIONS: Record<DietPreference, RegExp[]> = {
  Jain: [/\b(meat|chicken|mutton|poultry|fish|seafood|egg|eggs)\b/i],
  Vegetarian: [/\b(meat|chicken|mutton|poultry|fish|seafood|egg|eggs)\b/i],
  Vegan: [/\b(meat|chicken|mutton|poultry|fish|seafood|egg|eggs|milk|paneer|ghee|butter|curd|yogurt|dairy|buttermilk|lassi|khoya|honey)\b/i],
  Eggitarian: [/\b(meat|chicken|mutton|poultry|fish|seafood)\b/i],
  'Mix (Non-veg)': [],
  'No specific preference': [],
};

const ALLERGY_MATCHES: Record<string, RegExp[]> = {
  Peanuts: [/\bpeanut/i],
  'Tree Nuts': [/\b(almond|cashew|dry fruits)\b/i],
  'Dairy / Lactose': [/\b(milk|paneer|ghee|butter|curd|yogurt|buttermilk|lassi|khoya)\b/i],
  'Gluten / Wheat': [/\b(wheat|atta|bread|semolina|suji)\b/i],
  Eggs: [/\beggs?\b/i],
  Soy: [/\b(tofu|soya|soy)\b/i],
  Sesame: [/\b(sesame|til)\b/i],
  Shellfish: [],
};

function dietRulesFor(preference: string): RegExp[] {
  return Object.prototype.hasOwnProperty.call(DIET_EXCLUSIONS, preference)
    ? DIET_EXCLUSIONS[preference as DietPreference]
    : [];
}

function allergyRulesFor(allergy: string): RegExp[] {
  return Object.prototype.hasOwnProperty.call(ALLERGY_MATCHES, allergy)
    ? ALLERGY_MATCHES[allergy]
    : [];
}

function matchesAvoidedFood(item: string, term: string): boolean {
  const normalizedItem = item.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const normalizedTerm = term.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!normalizedTerm) return false;

  const words = normalizedTerm.split(' ').map(word =>
    `${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${word.length > 3 && word.endsWith('s') ? '' : 's?'}`
  );
  const phrase = words.join('\\s+');
  return new RegExp(`(?:^|\\s)${phrase}(?:$|\\s)`, 'i').test(normalizedItem);
}

function isPositiveNumber(value: string): boolean {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number > 0;
}

export function validateOnboarding(input: ValidationInput): FormErrors {
  const errors: FormErrors = {};
  const age = Number(input.age);
  const weight = Number(input.weight);
  const goalWeight = Number(input.goalWeight);

  if (input.name.trim().length < 2) errors.name = 'Enter a name with at least 2 characters.';
  if (!isPositiveNumber(input.age) || !Number.isInteger(age)) errors.age = 'Enter a positive whole number for age.';
  if (!isPositiveNumber(input.height)) errors.height = 'Enter a positive height in centimetres.';
  if (!isPositiveNumber(input.weight)) errors.weight = 'Enter a positive current weight in kilograms.';

  if (!GOALS.includes(input.primaryGoal)) errors.primaryGoal = 'Choose one primary goal.';
  if (!PHASES.includes(input.hormonalPhase)) errors.hormonalPhase = 'Choose one life phase.';
  if (input.primaryGoal !== 'sleep' && !TIMELINES.includes(input.goalTimeline)) {
    errors.goalTimeline = 'Choose a goal timeline.';
  } else if (input.goalTimeline && !TIMELINES.includes(input.goalTimeline)) {
    errors.goalTimeline = 'Choose a valid goal timeline.';
  }
  if (input.primaryGoal === 'weight_loss') {
    if (!isPositiveNumber(input.goalWeight) || !isPositiveNumber(input.weight) || goalWeight >= weight) {
      errors.goalWeight = 'Enter a positive goal weight below the current weight.';
    }
  }
  if (input.hormonalPhase === 'pregnant_nursing' && input.primaryGoal === 'weight_loss') {
    errors.primaryGoal = 'Weight-loss plans are unavailable for pregnancy or nursing profiles. Choose another goal for this comparison.';
  }

  if (!DIET_PREFERENCES.includes(input.dietPreference as DietPreference)) {
    errors.dietPreference = 'Choose one dietary preference, including “No specific preference” if applicable.';
  }
  if (input.nonVegDays.some(day => !WEEKDAYS.includes(day))) {
    errors.dietPreference = 'Remove unrecognized non-vegetarian day selections.';
  } else if (input.nonVegDays.length && input.dietPreference !== 'Mix (Non-veg)') {
    errors.dietPreference = 'Non-vegetarian days can only be selected with Mix (Non-veg).';
  }
  if (
    input.pantryStaples.some(item => !input.allowedPantryStaples.includes(item)) ||
    new Set(input.pantryStaples).size !== input.pantryStaples.length
  ) {
    errors.pantryStaples = 'Remove pantry selections that are not available in the listed options.';
  }

  const foodKeys = ['pulses', 'millets', 'rice', 'meat', 'dairy', 'fruits', 'fried', 'sweets', 'ice_cream', 'chocolate'];
  if (Object.entries(input.foodFrequency).some(([key, value]) =>
    !foodKeys.includes(key) || !FREQUENCIES.includes(value)
  )) {
    errors.foodFrequency = 'Choose a listed frequency for each food group or select “Not specified”.';
  }

  const categories = new Set<string>();
  for (const habit of input.routineHabits) {
    const category = habit.category.trim();
    const preferenceOptions = Object.prototype.hasOwnProperty.call(input.routinePreferenceOptions, habit.category)
      ? input.routinePreferenceOptions[habit.category]
      : undefined;
    if (
      !category ||
      category.length > 40 ||
      categories.has(category.toLowerCase()) ||
      !Number.isInteger(habit.frequency) ||
      habit.frequency < 1 ||
      habit.frequency > 10 ||
      (preferenceOptions
        ? Boolean(habit.preference && !preferenceOptions.includes(habit.preference))
        : Boolean(habit.preference))
    ) {
      errors.routineHabits = 'Each routine needs a unique name, a valid preference, and a frequency from 1 to 10 times per day.';
      break;
    }
    categories.add(category.toLowerCase());
  }
  if (input.customHabit.trim()) {
    errors.routineHabits = [
      errors.routineHabits,
      'Add the custom routine or clear its draft before generating.',
    ].filter(Boolean).join(' ');
  }

  if (input.foodsToAvoid.trim()) {
    const items = input.foodsToAvoid.split(',');
    if (items.some(item => !item.trim())) {
      errors.foodsToAvoid = 'Remove empty entries; separate each food to avoid with a single comma.';
    } else {
      const normalized = items.map(item => item.trim().toLocaleLowerCase());
      if (new Set(normalized).size !== normalized.length) {
        errors.foodsToAvoid = 'Remove duplicate foods to avoid.';
      }
    }
  }
  if (!ACTIVITIES.includes(input.activityLevel)) errors.activityLevel = 'Choose one activity level.';
  if (!MEALS_PER_DAY.includes(input.mealsPerDay)) errors.mealsPerDay = 'Choose a meal frequency from 2 to 6 meals per day.';
  if (!input.apiKey.trim()) errors.apiKey = 'Enter an Anthropic API key to generate the test plan.';

  return errors;
}

export function getPantryExclusions(
  pantryStaples: string[],
  dietPreference: string,
  allergies: string[],
  foodsToAvoid: string,
): PantryExclusions {
  const dietRules = dietRulesFor(dietPreference);
  const hasAllergenConflict = (item: string) => allergies.some(allergy =>
    allergyRulesFor(allergy).some(rule =>
      rule.test(item) && !(allergy === 'Gluten / Wheat' && /\bmakki\b/i.test(item))
    )
  );
  const avoidTerms = foodsToAvoid.split(',').map(term => term.trim()).filter(Boolean);
  const excluded = pantryStaples.filter(item =>
    dietRules.some(rule => rule.test(item)) ||
    hasAllergenConflict(item) ||
    avoidTerms.some(term => matchesAvoidedFood(item, term))
  );

  return {
    allowed: pantryStaples.filter(item => !excluded.includes(item)),
    excluded,
  };
}

export function getConsistencyWarnings(input: {
  dietPreference: string;
  allergies: string[];
  pantryStaples: string[];
  foodFrequency: Record<string, string>;
  foodsToAvoid: string;
  routineHabits?: Array<{ category: string; preference?: string }>;
}): string[] {
  const exclusions = getPantryExclusions(
    input.pantryStaples,
    input.dietPreference,
    input.allergies,
    input.foodsToAvoid,
  );
  const warnings: string[] = [];

  if (exclusions.excluded.length) {
    warnings.push(
      `These selected pantry items will not be prioritized because they conflict with your diet, allergy, or avoid-food selections: ${exclusions.excluded.join(', ')}. Your original selections are kept for comparison.`
    );
  }

  const meatFrequency = input.foodFrequency.meat;
  const dairyFrequency = input.foodFrequency.dairy;
  if (meatFrequency && meatFrequency !== 'Not specified' &&
    ['Jain', 'Vegetarian', 'Vegan', 'Eggitarian'].includes(input.dietPreference)) {
    warnings.push(
      'Your meat / poultry / fish frequency is kept as historical context; the selected dietary preference takes precedence for generated meals.'
    );
  }
  if (dairyFrequency && dairyFrequency !== 'Not specified' && input.dietPreference === 'Vegan') {
    warnings.push(
      'Your dairy frequency is kept as historical context; the vegan preference takes precedence for generated meals.'
    );
  }

  const routineItems = input.routineHabits?.map(habit => `${habit.category} ${habit.preference || ''}`) ?? [];
  const incompatibleRoutines = routineItems.filter(item => {
    const dietRules = dietRulesFor(input.dietPreference);
    const allergyRules = input.allergies.flatMap(allergy => allergyRulesFor(allergy));
    return dietRules.some(rule => rule.test(item)) || allergyRules.some(rule => rule.test(item));
  });
  if (incompatibleRoutines.length) {
    warnings.push(
      'Routine preferences remain as historical context; diet and allergy restrictions take precedence when generating meals.'
    );
  }

  if (input.allergies.length) {
    warnings.push('Allergy selections take precedence over foods otherwise allowed by this dietary preference.');
  }

  return warnings;
}
