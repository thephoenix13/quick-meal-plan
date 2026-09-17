import { PatientProfile, MealPlan } from '../types';

export interface StreamCallbacks {
  onProgress: (message: string) => void;
  onDayComplete: (day: number, dayPlan: any) => void;
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
        system: 'You are a clinical nutritionist and dietitian specializing in Indian cuisine and dietary planning. You create evidence-based, personalized meal plans that respect cultural food preferences, health conditions, and nutritional science. Always respond with valid JSON only. No markdown, no explanation, just JSON.',
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
    const error = await response.json().catch(() => ({}));
    callbacks.onError(error.error?.message || `API request failed with status ${response.status}`);
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

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              fullText += event.delta.text;

              // Check for day completions to show progress
              const dayMatches = fullText.match(/"day"\s*:\s*(\d+)/g);
              if (dayMatches) {
                const currentDay = dayMatches.length;
                if (currentDay > lastDayNotified) {
                  lastDayNotified = currentDay;
                  callbacks.onProgress(`Day ${currentDay} of 7 generated...`);
                }
              }
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    }
  } catch (err: any) {
    callbacks.onError('Error reading response stream');
    return;
  }

  callbacks.onProgress('Finalizing meal plan...');

  // Parse the complete JSON
  try {
    const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) || fullText.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      callbacks.onError('Could not parse meal plan from AI response. Please try again.');
      return;
    }

    const mealPlan: MealPlan = JSON.parse(jsonMatch[1]);
    mealPlan.patientName = profile.name;
    mealPlan.generatedDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    callbacks.onComplete(mealPlan);
  } catch (err: any) {
    callbacks.onError('Failed to parse the generated meal plan. Please try again.');
  }
}

function buildPrompt(profile: PatientProfile): string {
  const nonVegLine = profile.foodPreference === 'non-vegetarian'
    ? `\n- Non-Veg Days: ${profile.nonVegDays.join(', ')}`
    : '';

  const prompt = `Generate a personalized 7-day Indian meal plan for this patient:

PATIENT:
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
1. Calculate daily calorie target based on BMR, activity level, and goal
2. All meals must be Indian dishes from the specified region
3. Respect food preferences, allergies, and foods to avoid
4. Consider health conditions and hormonal phase
5. Use pantry staples mentioned
6. IMPORTANT - Include DIVERSE food categories across the day:
   - Include at least 1 fruit serving per day (seasonal Indian fruits like papaya, apple, banana, pomegranate, guava, orange, etc.)
   - Include seeds/nuts as snacks or toppings (flax seeds, chia seeds, sesame, almonds, walnuts, etc.)
   - Include sprouts or salads where appropriate
   - Include healthy beverages (buttermilk, lassi, coconut water, herbal teas)
   - Include dal/legumes for protein
   - Include whole grains (roti, rice, millets)
   - Include vegetables (cooked and raw)
   - Include dairy (curd, milk, paneer) if not vegan
7. Each meal needs: mealType, name, description, portionSize, calories, protein(g), carbs(g), fat(g), fibre(g), whyItWorks, ingredients[]
8. Provide a brief summary of the plan approach

Respond with ONLY valid JSON in this format:
{
  "summary": "Brief plan description",
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
          "whyItWorks": "Why this benefits this patient",
          "ingredients": ["item 1", "item 2"]
        }
      ]
    }
  ]
}

Generate all 7 days with ${profile.mealsPerDay} meals each. Ensure variety across days.`;

  return prompt;
}
