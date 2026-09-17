import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function generateMealPlan(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Meal plan generation request received');

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        context.error('ANTHROPIC_API_KEY environment variable is not set');
        return {
            status: 500,
            jsonBody: {
                error: 'Server configuration error. API key not configured.'
            }
        };
    }

    try {
        // Parse request body
        const body = await request.json();
        const { profile } = body;

        if (!profile) {
            return {
                status: 400,
                jsonBody: {
                    error: 'Patient profile is required'
                }
            };
        }

        context.log(`Generating meal plan for patient: ${profile.name}`);

        // Build the prompt
        const prompt = buildPrompt(profile);

        // Call Anthropic API
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
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

        if (!anthropicResponse.ok) {
            const errorData = await anthropicResponse.json();
            context.error('Anthropic API error:', errorData);
            return {
                status: 502,
                jsonBody: {
                    error: 'Failed to generate meal plan. Please try again later.'
                }
            };
        }

        const data = await anthropicResponse.json();
        const textContent = data.content?.find((block: any) => block.type === 'text');

        if (!textContent || !textContent.text) {
            return {
                status: 502,
                jsonBody: {
                    error: 'Invalid response from AI service'
                }
            };
        }

        // Parse the meal plan JSON
        const mealPlan = parseMealPlanJSON(textContent.text, profile);

        return {
            status: 200,
            jsonBody: mealPlan
        };

    } catch (error) {
        context.error('Error generating meal plan:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'An error occurred while generating the meal plan. Please try again.'
            }
        };
    }
}

function buildPrompt(profile: any): string {
    const nonVegLine =
        profile.foodPreference === 'non-vegetarian'
            ? `\n- Non-Veg Days: ${profile.nonVegDays.join(', ')}`
            : '';

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
3. CRITICAL CONSTRAINTS (MUST FOLLOW):
   - NEVER include any allergens mentioned in "Allergies"
   - NEVER include any items from "Foods to Avoid"
   - Strictly follow "Kitchen Preferences" (if vegan: no dairy/eggs, if gluten-free: no wheat, etc.)
   - Follow "Food Preference" exactly (vegetarian/non-vegetarian/eggetarian)
   - Only include non-veg on specified "Non-Veg Days"
4. Health conditions MUST influence food choices:
   - Hypothyroid: include iodine-rich foods, selenium
   - Type 2 Diabetes: low glycemic index, controlled carbs
   - Hypertension: low sodium, high potassium
   - Iron deficiency: iron-rich foods with vitamin C
   - Vitamin D deficiency: fortified foods, fatty fish if non-veg
5. Consider hormonal phase in meal planning (PCOS: anti-inflammatory, perimenopause: calcium-rich, etc.)
6. Prioritize pantry staples mentioned - use them in most meals
7. Include DIVERSE food categories each day:
   - At least 1 fruit serving (papaya, apple, banana, pomegranate, guava, orange, etc.)
   - Seeds/nuts as snacks or toppings (flax, chia, sesame, almonds, walnuts)
   - Sprouts or salads where appropriate
   - Healthy beverages (buttermilk, lassi, coconut water)
   - Dal/legumes for protein
   - Whole grains (roti, rice, millets)
   - Vegetables (cooked and raw)
   - Dairy if not vegan (curd, milk, paneer)
8. Each meal needs: mealType, name, description, portionSize, calories, protein, carbs, fat, fibre, whyItWorks, ingredients
9. Provide a brief summary (2-3 sentences) that explicitly mentions:
   - How the plan addresses the primary goal
   - Key accommodations for health conditions
   - Confirmation that allergies and foods to avoid are excluded
   - Daily water target: ${profile.waterTarget} glasses

IMPORTANT: Keep descriptions and whyItWorks SHORT (1-2 sentences max). Keep ingredient lists to 3-5 items max.

Return ONLY this JSON structure (no markdown, no extra text, no code blocks):
{"summary":"brief description","dailyCalorieTarget":1800,"dailyPlan":[{"day":1,"meals":[{"mealType":"Early Morning","name":"Dish Name","description":"Brief desc","portionSize":"1 bowl","calories":150,"protein":5,"carbs":20,"fat":6,"fibre":3,"whyItWorks":"Why this helps","ingredients":["item1","item2"]}]}]}

Generate all 7 days with ${profile.mealsPerDay} meals each. Ensure variety across days.`;
}

function parseMealPlanJSON(rawText: string, profile: any): any {
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
        jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
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

    if (!parsed.dailyPlan || !Array.isArray(parsed.dailyPlan)) {
        throw new Error('Missing dailyPlan array in response');
    }

    if (parsed.dailyPlan.length === 0) {
        throw new Error('No days in meal plan');
    }

    return {
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
}

app.http('generateMealPlan', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'generate-meal-plan',
    handler: generateMealPlan
});
