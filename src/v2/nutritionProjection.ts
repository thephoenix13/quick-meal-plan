const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface NutritionProjection {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  waterGlasses: number;
  targetDate: string;
}

export function computeNutritionProjection(input: {
  age: string;
  heightCm: string;
  weightKg: string;
  activity: string;
  goal: string;
  timeline: string;
}): NutritionProjection | null {
  const weight = Number(input.weightKg);
  const height = Number(input.heightCm);
  const age = Number(input.age);
  if (!weight || !height || !age) return null;

  const bmrValue = 10 * weight + 6.25 * height - 5 * age - 161;
  const tdeeValue = bmrValue * (ACTIVITY_FACTORS[input.activity] || 1.375);
  const calories = Math.round(input.goal === 'weight_loss' ? tdeeValue - 300 : tdeeValue);
  const protein = Math.round(weight * 1.6);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4));
  const targetDate = new Date();
  const months: Record<string, number> = {
    '3_months': 3,
    '6_months': 6,
    '9_months': 9,
    '12_plus': 12,
  };
  targetDate.setMonth(targetDate.getMonth() + (months[input.timeline] || 3));

  return {
    bmr: Math.round(bmrValue),
    tdee: Math.round(tdeeValue),
    calories,
    protein,
    carbs,
    fat,
    fibre: 25,
    waterGlasses: Math.round(Math.round(weight * 35) / 250),
    targetDate: targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  };
}
