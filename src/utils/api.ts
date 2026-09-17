import { PatientProfile, MealPlan } from '../types';

export interface StreamCallbacks {
  onProgress: (message: string) => void;
  onComplete: (mealPlan: MealPlan) => void;
  onError: (error: string) => void;
}

export async function generateMealPlanStreaming(
  apiKey: string,
  profile: PatientProfile,
  callbacks: StreamCallbacks
): Promise<void> {
  const prompt = buildPrompt(profile);

  callbacks.onProgress('Initializing meal plan generator...');

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10000,
        system: 'You are a clinical nutritionist specializing in Indian diets. Respond with ONLY valid JSON. No markdown, no explanation, just the raw JSON object starting with { and ending with }. Do not use code blocks or backticks.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
  } catch (err: any) {
    callbacks.onError('Network error. Please check your connection and API key.');
    return;
  }

  if (!response.ok) {
    try {
      const error = await response.json();
      callbacks.onError(error.error?.message || `API error (${response.status})`);
    } catch {
      callbacks.onError(`API request failed with status ${response.status}`);
    }
    return;
  }

  callbacks.onProgress('Generating your personalized meal plan...');

  let fullText: string;
  try {
    const data = await response.json();
    
    // Extract text from response
    const textContent = data.content?.find((block: any) => block.type === 'text');
    
    if (!textContent || !textContent.text) {
      callbacks.onError('No text content in API response');
      return;
    }
    
    fullText = textContent.text;
  } catch (err: any) {
    callbacks.onError('Failed to parse API response');
    return;
  }

  callbacks.onProgress('Finalizing meal plan...');

  // Parse the complete JSON response
  try {
    const mealPlan = parseMealPlanJSON(fullText, profile);
    callbacks.onComplete(mealPlan);
  } catch (err: any) {
    console.error('Parse error. Raw text length:', fullText.length);
    console.error('Raw text preview:', fullText.substring(0, 1000));
    console.error('Raw text end:', fullText.substring(fullText.length - 500));
    callbacks.onError(
      'Failed to parse the generated meal plan. The response may have been incomplete. Please try again.'
    );
  }
}

function parseMealPlanJSON(rawText: string, profile: PatientProfile): MealPlan {
  let jsonString = rawText.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  // If there's text before/after the JSON object, extract just the object
  if (!jsonString.startsWith('{')) {
    const objMatch = jsonString.match(/(\{[\s\S]*\})\s*$/);
    if (objMatch) {
      jsonString = objMatch[1];
    }
  }

  // Validate we have something to parse
  if (!jsonString || jsonString.length < 50) {
    throw new Error('Response too short or empty');
  }

  const parsed = JSON.parse(jsonString);

  // Validate structure
  if (!parsed.dailyPlan || !Array.isArray(parsed.dailyPlan)) {
    throw new Error('Missing dailyPlan array');
  }

  if (parsed.dailyPlan.length < 7) {
    throw new Error(`Expected 7 days, got ${parsed.dailyPlan.length}`);
  }

  const mealPlan: MealPlan = {
    patientName: profile.name,
    generatedDate: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    summary: parsed.summary || '',
    dailyCalorieTarget: parsed.dailyCalorieTarget || 0,
    dailyPlan: parsed.dailyPlan,
  };

  return mealPlan;
}

function buildPrompt(profile: PatientProfile): string {
  const nonVegLine =
    profile.foodPreference === 'non-vegetarian'
      ? `\n- Non-Veg Days: ${profile.nonVegDays.join(', ')}`
      : '';

  return `Generate a personalized 7-day Indian meal plan for this patient.

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
1. Calculate daily calorie target based on BMR, activity, and goal
2. All meals must be Indian dishes from the specified region
3. Respect food preferences, allergies, and foods to avoid
4. Consider health conditions and hormonal phase
5. Use pantry staples mentioned
6. Include DIVERSE food categories each day:
   - At least 1 fruit serving (papaya, apple, banana, pomegranate, guava, orange, etc.)
   - Seeds/nuts as snacks or toppings (flax, chia, sesame, almonds, walnuts)
   - Sprouts or salads where appropriate
   - Healthy beverages (buttermilk, lassi, coconut water)
   - Dal/legumes for protein
   - Whole grains (roti, rice, millets)
   - Vegetables (cooked and raw)
   - Dairy if not vegan (curd, milk, paneer)
7. Each meal needs: mealType, name, description, portionSize, calories, protein, carbs, fat, fibre, whyItWorks, ingredients
8. Provide a brief summary

Return ONLY this JSON structure (no markdown, no extra text, no code blocks):
{"summary":"brief description","dailyCalorieTarget":1800,"dailyPlan":[{"day":1,"meals":[{"mealType":"Early Morning","name":"Dish Name","description":"Brief desc","portionSize":"1 bowl","calories":150,"protein":5,"carbs":20,"fat":6,"fibre":3,"whyItWorks":"Why this helps","ingredients":["item1","item2"]}]}]}

Generate all 7 days with ${profile.mealsPerDay} meals each. Ensure variety across days.`;
}
