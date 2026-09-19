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
        max_tokens: 16000,
        system: 'You are a clinical nutritionist specializing in Indian diets. Respond with ONLY valid JSON. No markdown, no explanation, just the raw JSON object starting with { and ending with }. Do not use code blocks or backticks. Keep all text fields concise.',
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
    console.error('Parse error:', err.message);
    console.error('Raw text length:', fullText.length);
    console.error('Raw text preview:', fullText.substring(0, 1000));
    console.error('Raw text end:', fullText.substring(fullText.length - 500));
    
    // Show detailed error for debugging
    const errorMsg = err.message || 'Unknown parsing error';
    callbacks.onError(
      `Failed to parse meal plan: ${errorMsg}. Please check the browser console (F12) for details.`
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

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseErr: any) {
    // Try to fix common JSON issues
    // Remove trailing commas
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
    // Add missing closing braces/brackets
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    if (openBraces > closeBraces) {
      jsonString += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      jsonString += ']'.repeat(openBrackets - closeBrackets);
    }
    
    try {
      parsed = JSON.parse(jsonString);
    } catch (retryErr: any) {
      throw new Error(`JSON parse error: ${parseErr.message}`);
    }
  }

  // Validate structure
  if (!parsed.dailyPlan || !Array.isArray(parsed.dailyPlan)) {
    throw new Error('Missing dailyPlan array in response');
  }

  // Be lenient - accept less than 7 days if that's what we got
  if (parsed.dailyPlan.length === 0) {
    throw new Error('No days in meal plan');
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

// Calculate Ideal Body Weight (IBW) using BMI-based formula
function calculateIBW(heightCm: number): number {
  const heightM = heightCm / 100;
  // Using BMI of 22 as ideal
  return 22 * heightM * heightM;
}

// Calculate protein target based on adjusted body weight
function calculateProteinTarget(profile: PatientProfile): number {
  const ibw = calculateIBW(profile.height);
  const excessWeight = Math.max(0, profile.currentWeight - ibw);
  const adjustedBW = ibw + (0.25 * excessWeight);
  
  // Protein factor based on activity level
  let proteinFactor = 1.0;
  switch (profile.activityLevel) {
    case 'sedentary':
      proteinFactor = 0.8;
      break;
    case 'lightly active':
      proteinFactor = 1.0;
      break;
    case 'moderately active':
      proteinFactor = 1.2;
      break;
    case 'active':
      proteinFactor = 1.4;
      break;
    case 'very active':
      proteinFactor = 1.6;
      break;
  }
  
  // Adjust for goals
  if (profile.primaryGoal === 'weight loss') {
    proteinFactor += 0.2; // Higher protein for satiety and muscle preservation
  } else if (profile.primaryGoal === 'more energy' || profile.primaryGoal === 'overall wellness') {
    proteinFactor += 0.1;
  }
  
  return Math.round(adjustedBW * proteinFactor);
}

function buildPrompt(profile: PatientProfile): string {
  const nonVegLine =
    profile.foodPreference === 'non-vegetarian'
      ? `\n- Non-Veg Days: ${profile.nonVegDays.join(', ')}`
      : '';

  // Clarify eggetarian restriction
  const eggetarianClarification = 
    profile.foodPreference === 'eggetarian'
      ? '\n- EGGETARIAN RESTRICTION: Include ONLY eggs as animal protein. NO fish, chicken, mutton, or any other meat. Eggs are allowed.'
      : '';

  // Calculate protein target
  const proteinTarget = calculateProteinTarget(profile);
  const ibw = calculateIBW(profile.height);
  const excessWeight = Math.max(0, profile.currentWeight - ibw);
  const adjustedBW = ibw + (0.25 * excessWeight);

  return `Generate a personalized 7-day Indian meal plan for this patient.

IMPORTANT: Allergies and "Foods to Avoid" are STRICT constraints. These items must NEVER appear in any meal. Kitchen preferences (vegan, gluten-free, etc.) must also be strictly followed.

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
- Food Preference: ${profile.foodPreference}${nonVegLine}${eggetarianClarification}
- Kitchen Preferences: ${profile.kitchenPreferences.length > 0 ? profile.kitchenPreferences.join(', ') : 'None'}
- Indian Region: ${profile.indianRegion}
- Pantry Staples: ${profile.pantryStaples.join(', ')}
- Allergies: ${profile.allergies || 'None'}
- Foods to Avoid: ${profile.foodsToAvoid || 'None'}
- Meals Per Day: ${profile.mealsPerDay}
- Water Target: ${profile.waterTarget} glasses per day

PROTEIN CALCULATION (MUST FOLLOW):
- Ideal Body Weight (IBW): ${ibw.toFixed(1)} kg
- Excess Weight: ${excessWeight.toFixed(1)} kg
- Adjusted Body Weight (AdjBW): ${adjustedBW.toFixed(1)} kg
- Daily Protein Target: ${proteinTarget} grams per day
- Distribute protein evenly across all meals to meet this daily target

REQUIREMENTS:
1. Calculate daily calorie target based on BMR, activity, and goal
2. All meals must be Indian dishes from the specified region
3. CRITICAL CONSTRAINTS (MUST FOLLOW):
   - NEVER include any allergens mentioned in "Allergies"
   - NEVER include any items from "Foods to Avoid"
   - Strictly follow "Kitchen Preferences" (if vegan: no dairy/eggs, if gluten-free: no wheat, etc.)
   - Follow "Food Preference" exactly:
     * Vegetarian: No eggs, no meat, no fish
     * Eggetarian: Eggs allowed, but NO meat, NO fish, NO chicken, NO mutton - ONLY eggs as animal protein
     * Non-vegetarian: Meat and fish allowed on specified "Non-Veg Days" only
   - Only include non-veg on specified "Non-Veg Days"
4. PROTEIN TARGET (CRITICAL):
   - Daily protein target is ${proteinTarget} grams
   - Distribute protein evenly across all ${profile.mealsPerDay} meals
   - Each meal should contribute approximately ${Math.round(proteinTarget / profile.mealsPerDay)}g of protein
   - Use high-protein ingredients: dal, paneer, eggs, Greek yogurt, nuts, seeds, legumes, soy
   - Ensure each meal's protein content adds up to meet the daily target
5. Health conditions MUST influence food choices:
   - Hypothyroid: include iodine-rich foods, selenium
   - Type 2 Diabetes: low glycemic index, controlled carbs
   - Hypertension: low sodium, high potassium
   - Iron deficiency: iron-rich foods with vitamin C
   - Vitamin D deficiency: fortified foods, fatty fish if non-veg
6. Consider hormonal phase in meal planning (PCOS: anti-inflammatory, perimenopause: calcium-rich, etc.)
7. Prioritize pantry staples mentioned - use them in most meals
8. Include DIVERSE food categories each day:
   - At least 1 fruit serving (papaya, apple, banana, pomegranate, guava, orange, etc.)
   - Seeds/nuts as snacks or toppings (flax, chia, sesame, almonds, walnuts)
   - Sprouts or salads where appropriate
   - Healthy beverages (buttermilk, lassi, coconut water)
   - Dal/legumes for protein
   - Whole grains (roti, rice, millets)
   - Vegetables (cooked and raw)
   - Dairy if not vegan (curd, milk, paneer)
9. Each meal needs: mealType, name, description, portionSize, calories, protein, carbs, fat, fibre, whyItWorks, ingredients
10. Provide a brief summary (2-3 sentences) that explicitly mentions:
   - How the plan addresses the primary goal
   - Key accommodations for health conditions
   - Confirmation that allergies and foods to avoid are excluded
   - Daily water target: ${profile.waterTarget} glasses

IMPORTANT: Keep descriptions and whyItWorks SHORT (1-2 sentences max). Keep ingredient lists to 3-5 items max.

Return ONLY this JSON structure (no markdown, no extra text, no code blocks):
{"summary":"brief description","dailyCalorieTarget":1800,"dailyPlan":[{"day":1,"meals":[{"mealType":"Early Morning","name":"Dish Name","description":"Brief desc","portionSize":"1 bowl","calories":150,"protein":5,"carbs":20,"fat":6,"fibre":3,"whyItWorks":"Why this helps","ingredients":["item1","item2"]}]}]}

CRITICAL: Generate exactly 7 days. Each day MUST have exactly ${profile.mealsPerDay} meals. No more, no less. Ensure variety across days.`;
}
