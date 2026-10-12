import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getConsistencyWarnings,
  getPantryExclusions,
  validateOnboarding,
} from './profileValidation.ts';

const validInput = {
  name: 'Test User',
  age: '30',
  height: '165',
  weight: '65',
  primaryGoal: 'overall',
  hormonalPhase: 'regular',
  goalTimeline: '3_months',
  goalWeight: '',
  dietPreference: 'Jain',
  nonVegDays: [],
  pantryStaples: ['Rice', 'Eggs', 'Paneer'],
  foodFrequency: {},
  routineHabits: [],
  routinePreferenceOptions: { Tea: ['With milk', 'Black'] },
  customHabit: '',
  foodsToAvoid: '',
  activityLevel: 'moderately_active',
  mealsPerDay: '3',
  apiKey: 'synthetic-test-key',
  allowedPantryStaples: ['Rice', 'Eggs', 'Paneer'],
};

test('validates a coherent profile without clinical thresholds', () => {
  assert.deepEqual(validateOnboarding(validInput), {});
});

test('blocks mutually incompatible non-vegetarian day selections', () => {
  const errors = validateOnboarding({
    ...validInput,
    nonVegDays: ['Monday'],
  });
  assert.match(errors.dietPreference, /only be selected with Mix/);
});

test('blocks pregnancy or nursing combined with weight-loss goal', () => {
  const errors = validateOnboarding({
    ...validInput,
    primaryGoal: 'weight_loss',
    hormonalPhase: 'pregnant_nursing',
    goalWeight: '60',
  });
  assert.match(errors.primaryGoal, /unavailable for pregnancy or nursing/);
});

test('requires a valid lower target weight for weight loss', () => {
  const errors = validateOnboarding({
    ...validInput,
    primaryGoal: 'weight_loss',
    goalWeight: '65',
  });
  assert.match(errors.goalWeight, /below the current weight/);
});

test('rejects invalid numeric, enum, frequency, and avoidance values', () => {
  const errors = validateOnboarding({
    ...validInput,
    age: '30.5',
    height: 'Infinity',
    activityLevel: 'sometimes',
    foodFrequency: { pulses: 'weekly-ish' },
    foodsToAvoid: 'rice, , rice',
  });
  assert.ok(errors.age);
  assert.ok(errors.height);
  assert.ok(errors.activityLevel);
  assert.ok(errors.foodFrequency);
  assert.match(errors.foodsToAvoid, /empty entries/);
});

test('rejects duplicate and uncommitted custom routines', () => {
  const errors = validateOnboarding({
    ...validInput,
    routineHabits: [
      { category: 'Tea', frequency: 1 },
      { category: ' tea ', frequency: 2 },
    ],
    customHabit: 'coffee',
  });
  assert.match(errors.routineHabits, /unique name/);
});

test('blocks an uncommitted custom routine even when no habits are selected yet', () => {
  const errors = validateOnboarding({
    ...validInput,
    customHabit: 'Coffee',
  });
  assert.match(errors.routineHabits, /Add the custom routine/);
});

test('rejects a preference value that is not valid for its selected routine', () => {
  const errors = validateOnboarding({
    ...validInput,
    routineHabits: [{ category: 'Tea', frequency: 1, preference: 'With soy' }],
  });
  assert.match(errors.routineHabits, /valid preference/);
});

test('keeps incompatible pantry entries as context but excludes them from priorities', () => {
  const result = getPantryExclusions(
    ['Rice', 'Eggs', 'Chicken', 'Paneer'],
    'Jain',
    [],
    '',
  );
  assert.deepEqual(result.allowed, ['Rice', 'Paneer']);
  assert.deepEqual(result.excluded, ['Eggs', 'Chicken']);
});

test('allows eggs for Eggitarian while excluding meat and fish', () => {
  const result = getPantryExclusions(['Eggs', 'Chicken', 'Fish', 'Paneer'], 'Eggitarian', [], '');
  assert.deepEqual(result.allowed, ['Eggs', 'Paneer']);
  assert.deepEqual(result.excluded, ['Chicken', 'Fish']);
});

test('allergies override otherwise permitted foods', () => {
  const result = getPantryExclusions(['Eggs', 'Chicken'], 'Eggitarian', ['Eggs'], '');
  assert.deepEqual(result.allowed, []);
  assert.deepEqual(result.excluded, ['Eggs', 'Chicken']);
});

test('no specific preference permits foods unless another restriction applies', () => {
  const result = getPantryExclusions(['Eggs', 'Chicken', 'Paneer'], 'No specific preference', [], '');
  assert.deepEqual(result.allowed, ['Eggs', 'Chicken', 'Paneer']);
  assert.deepEqual(result.excluded, []);
});

test('vegan, allergy, and explicit avoid rules remove matching pantry priorities', () => {
  const result = getPantryExclusions(
    ['Rice', 'Milk', 'Buttermilk', 'Eggs', 'Peanuts', 'Tofu'],
    'Vegan',
    ['Peanuts'],
    '',
  );
  assert.deepEqual(result.allowed, ['Rice', 'Tofu']);
  assert.deepEqual(result.excluded, ['Milk', 'Buttermilk', 'Eggs', 'Peanuts']);
});

test('does not treat corn flour as wheat for the existing wheat allergy grouping', () => {
  const result = getPantryExclusions(['Makki atta', 'Wheat / Atta'], 'No specific preference', ['Gluten / Wheat'], '');
  assert.deepEqual(result.allowed, ['Makki atta']);
  assert.deepEqual(result.excluded, ['Wheat / Atta']);
});

test('removes explicitly avoided pantry items from generator priorities', () => {
  const result = getPantryExclusions(['Rice', 'Ragi', 'Paneer'], 'No specific preference', [], 'rice, Ragi');
  assert.deepEqual(result.allowed, ['Paneer']);
  assert.deepEqual(result.excluded, ['Rice', 'Ragi']);
});

test('does not treat a short avoidance term as a substring match across all pantry items', () => {
  const result = getPantryExclusions(['Rice', 'Paneer'], 'No specific preference', [], 'a');
  assert.deepEqual(result.allowed, ['Rice', 'Paneer']);
  assert.deepEqual(result.excluded, []);
});

test('emits warnings while preserving historical food-frequency selections', () => {
  const warnings = getConsistencyWarnings({
    dietPreference: 'Vegan',
    allergies: [],
    pantryStaples: ['Paneer'],
    foodFrequency: { meat: 'Rarely', dairy: 'Daily' },
    foodsToAvoid: '',
  });
  assert.equal(warnings.length, 3);
  assert.match(warnings[0], /kept for comparison/);
  assert.match(warnings[1], /historical context/);
  assert.match(warnings[2], /historical context/);
});
