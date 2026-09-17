import { PatientProfile, MealPlan } from '../types';

export interface StreamCallbacks {
  onProgress: (message: string) => void;
  onComplete: (mealPlan: MealPlan) => void;
  onError: (error: string) => void;
}

export async function generateMealPlanStreaming(
  _apiKey: string,
  profile: PatientProfile,
  callbacks: StreamCallbacks
): Promise<void> {
  callbacks.onProgress('Initializing meal plan generator...');

  let response: Response;
  try {
    // Call our Azure Function backend instead of Anthropic directly
    response = await fetch('/api/generate-meal-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile }),
    });
  } catch (err: any) {
    callbacks.onError('Network error. Please check your connection and try again.');
    return;
  }

  if (!response.ok) {
    try {
      const error = await response.json();
      callbacks.onError(error.error || `Request failed (${response.status})`);
    } catch {
      callbacks.onError(`Request failed with status ${response.status}`);
    }
    return;
  }

  callbacks.onProgress('Generating your personalized meal plan...');

  try {
    const mealPlan = await response.json();
    callbacks.onProgress('Finalizing meal plan...');
    callbacks.onComplete(mealPlan);
  } catch (err: any) {
    console.error('Parse error:', err.message);
    callbacks.onError(
      `Failed to parse meal plan: ${err.message}. Please try again.`
    );
  }
}
