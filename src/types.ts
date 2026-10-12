export interface PatientProfile {
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  goalWeight: number;
  primaryGoal: string;
  hormonalPhase: string;
  activityLevel: string;
  goalTimeline: string;
  healthConditions: string[];
  selectedAllergies?: string[];
  secondaryLanguage?: string;
  motivations?: string[];
  city?: string;
  state?: string;
  foodFrequency?: Record<string, string>;
  routineHabits?: Array<{
    name: string;
    timesPerDay: number;
    preference?: string;
  }>;
  householdPortions?: {
    chapatiSize?: string;
    riceBowlMl?: number;
    dalBowlMl?: number;
  };
  estimatedTargets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    waterGlasses: number;
  };
  foodPreference: string;
  nonVegCategories: string[];
  meatTypes: string[];
  eggTypes: string[];
  fishTypes: string[];
  nonVegDays: string[];
  dietRichness: string[];
  kitchenPreferences: string[];
  indianRegion: string;
  pantryStaples: string[];
  excludedPantryStaples?: string[];
  allergies: string;
  foodsToAvoid: string;
  mealsPerDay: number;
  waterTarget: number;
}

export interface Meal {
  mealType: string;
  name: string;
  description: string;
  portionSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  whyItWorks: string;
  ingredients: string[];
}

export interface DayPlan {
  day: number;
  meals: Meal[];
}

export interface MealPlan {
  patientName: string;
  generatedDate: string;
  summary: string;
  dailyCalorieTarget: number;
  dailyPlan: DayPlan[];
}
