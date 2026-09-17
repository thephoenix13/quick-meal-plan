import { PatientProfile, MealPlan } from '../types';

export async function generateMealPlan(apiKey: string, profile: PatientProfile): Promise<MealPlan> {
  const prompt = buildPrompt(profile);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.content.find((block: any) => block.type === 'text');
  
  if (!textContent) {
    throw new Error('No text content in API response');
  }

  const text = textContent.text;
  
  // Extract JSON from the response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  
  if (!jsonMatch) {
    throw new Error('Could not parse meal plan from API response');
  }

  const mealPlan: MealPlan = JSON.parse(jsonMatch[1]);
  mealPlan.patientName = profile.name;
  mealPlan.generatedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return mealPlan;
}

function buildPrompt(profile: PatientProfile): string {
  const nonVegLine = profile.foodPreference === 'non-vegetarian' 
    ? `\n- Non-Veg Days: ${profile.nonVegDays.join(', ')}` 
    : '';

  const prompt = `You are a clinical nutritionist specializing in Indian diets. Generate a personalized 7-day Indian meal plan for the following patient:

PATIENT PROFILE:
- Name: ${profile.name}
- Age: ${profile.age} years
- Height: ${profile.height} cm
- Current Weight: ${profile.currentWeight} kg
- Goal Weight: ${profile.goalWeight} kg
- Primary Goal: ${profile.primaryGoal}
- Hormonal Phase: ${profile.hormonalPhase}
- Activity Level: ${profile.activityLevel}
- Goal Timeline: ${profile.goalTimeline}
- Health Conditions: ${profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : 'None'}
- Food Preference: ${profile.foodPreference}${nonVegLine}
- Kitchen Preferences: ${profile.kitchenPreferences.length > 0 ? profile.kitchenPreferences.join(', ') : 'None'}
- Indian Region: ${profile.indianRegion}
- Pantry Staples: ${profile.pantryStaples.join(', ')}
- Allergies: ${profile.allergies || 'None'}
- Foods to Avoid: ${profile.foodsToAvoid || 'None'}
- Meals Per Day: ${profile.mealsPerDay}
- Water Target: ${profile.waterTarget} glasses per day

REQUIREMENTS:
1. Calculate appropriate daily calorie target based on BMR, activity level, and goal
2. All meals must be Indian dishes appropriate for the specified region
3. Respect food preferences, allergies, and foods to avoid
4. Consider health conditions when planning meals
5. Consider hormonal phase in meal planning
6. Use pantry staples mentioned
7. Each meal must include: mealType, name, description, portionSize, calories, protein(g), carbs(g), fat(g), fibre(g), whyItWorks, ingredients[]
8. Provide a brief summary of the plan approach

Respond ONLY with a valid JSON object in this exact format (no other text):
\`\`\`json
{
  "summary": "Brief description of the plan approach",
  "dailyCalorieTarget": 1800,
  "dailyPlan": [
    {
      "day": 1,
      "meals": [
        {
          "mealType": "Early Morning",
          "name": "Dish Name",
          "description": "Brief description",
          "portionSize": "e.g., 1 bowl (200ml)",
          "calories": 150,
          "protein": 5,
          "carbs": 20,
          "fat": 6,
          "fibre": 3,
          "whyItWorks": "Why this is beneficial for this patient",
          "ingredients": ["ingredient 1", "ingredient 2"]
        }
      ]
    }
  ]
}
\`\`\`

Generate all 7 days with ${profile.mealsPerDay} meals each. Ensure variety across days while maintaining nutritional balance.`;

  return prompt;
}
