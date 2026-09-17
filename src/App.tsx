import { useState } from 'react';
import PatientForm from './components/PatientForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import { generateMealPlan } from './utils/api';
import { generatePDF } from './utils/pdf';
import { PatientProfile, MealPlan } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [lastProfile, setLastProfile] = useState<PatientProfile | null>(null);
  const [lastApiKey, setLastApiKey] = useState('');

  const handleSubmit = async (profile: PatientProfile, apiKey: string) => {
    setLoading(true);
    setError(null);
    setLastProfile(profile);
    setLastApiKey(apiKey);

    try {
      const plan = await generateMealPlan(apiKey, profile);
      setMealPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastProfile && lastApiKey) {
      handleSubmit(lastProfile, lastApiKey);
    }
  };

  const handleDownloadPDF = () => {
    if (mealPlan) {
      generatePDF(mealPlan);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🩺</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Doctor's Meal Plan Generator</h1>
              <p className="text-xs text-gray-500">AI-Powered Personalized Indian Diet Plans</p>
            </div>
          </div>
          {mealPlan && (
            <button
              onClick={() => { setMealPlan(null); setError(null); }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← New Plan
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {!mealPlan && !loading && (
          <>
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Create Personalized 7-Day Indian Meal Plans
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Enter your patient's health profile to generate a customized meal plan tailored to their goals,
                dietary preferences, health conditions, and regional cuisine. Powered by Claude AI.
              </p>
            </div>
            <PatientForm onSubmit={handleSubmit} loading={loading} />
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Meal Plan...</h3>
            <p className="text-gray-500 text-sm">Analyzing patient profile and creating personalized meals</p>
            <p className="text-gray-400 text-xs mt-2">This may take 15-30 seconds</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Error</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => { setError(null); }}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {mealPlan && !loading && (
          <MealPlanDisplay
            mealPlan={mealPlan}
            onDownloadPDF={handleDownloadPDF}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            For Doctor's Representatives only. This tool generates suggested meal plans and does not constitute medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
