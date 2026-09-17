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

  callbacks.onProgress('Connecting to AI...');

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
        max_tokens: 8000,
        stream: true,
        system: 'You are a clinical nutritionist specializing in Indian diets. Respond with ONLY valid JSON. No markdown fences, no explanation text, just the raw JSON object.',
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

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('Failed to read response stream');
    return;
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let lastDayNotified = 0;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        // SSE format: lines starting with "data: "
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);

          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);

            if (event.type === 'content_block_delta' && event.delta?.text) {
              fullText += event.delta.text;

              // Track progress by counting completed days
              const dayMatches = fullText.match(/"day"\s*:\s*\d+/g);
              if (dayMatches) {
                const currentDay = dayMatches.length;
                if (currentDay > lastDayNotified && currentDay <= 7) {
                  lastDayNotified = currentDay;
                  callbacks.onProgress(`Day ${currentDay} of 7 generated...`);
                }
              }
            }

            if (event.type === 'error') {
              callbacks.onError(event.error?.message || 'Stream error from API');
              return;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    }
  } catch (err: any) {
    callbacks.onError('Error reading response stream. Please try again.');
    return;
  }

  callbacks.onProgress('Finalizing meal plan...');

  // Parse the complete JSON response
  try {
    const mealPlan = parseMealPlanJSON(fullText, profile);
    callbacks.onComplete(mealPlan);
  } catch (err: any) {
    console.error('Parse error. Raw text preview:', fullText.substring(0, 500));
    callbacks.onError(
      'Failed to parse the generated meal plan. The AI response may have been incomplete. Please try again.'
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

Return ONLY this JSON structure (no markdown, no extra text):
{"summary":"brief description","dailyCalorieTarget":1800,"dailyPlan":[{"day":1,"meals":[{"mealType":"Early Morning","name":"Dish Name","description":"Brief desc","portionSize":"1 bowl","calories":150,"protein":5,"carbs":20,"fat":6,"fibre":3,"whyItWorks":"Why this helps","ingredients":["item1","item2"]}]}]}

Generate all 7 days with ${profile.mealsPerDay} meals each. Ensure variety across days.`;
}
