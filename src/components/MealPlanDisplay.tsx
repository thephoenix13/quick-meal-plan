import { MealPlan as MealPlanType } from '../types';

import { PatientProfile } from '../types';

interface Props {
  mealPlan: MealPlanType;
  profile: PatientProfile;
  onDownloadPDF: () => void;
  onRegenerate: () => void;
}

export default function MealPlanDisplay({ mealPlan, profile, onDownloadPDF, onRegenerate }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">🍽️ 7-Day Meal Plan</h2>
        <div className="flex flex-wrap gap-4 text-sm opacity-90">
          <span>👤 {mealPlan.patientName}</span>
          <span>📅 {mealPlan.generatedDate}</span>
          <span>🔥 {mealPlan.dailyCalorieTarget} kcal/day</span>
        </div>
        {mealPlan.summary && (
          <p className="mt-3 text-sm bg-white/10 rounded-lg p-3">{mealPlan.summary}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={onDownloadPDF}
          className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onRegenerate}
          className="px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Regenerate Plan
        </button>
      </div>

      {/* Daily Plans */}
      <div className="space-y-6">
        {mealPlan.dailyPlan.map((dayPlan) => (
          <div key={dayPlan.day} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Day Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <h3 className="text-lg font-bold text-gray-800">Day {dayPlan.day}</h3>
              <p className="text-sm text-gray-500">
                Total: {dayPlan.meals.reduce((sum, m) => sum + m.calories, 0)} kcal |{' '}
                Protein: {dayPlan.meals.reduce((sum, m) => sum + m.protein, 0)}g |{' '}
                Carbs: {dayPlan.meals.reduce((sum, m) => sum + m.carbs, 0)}g |{' '}
                Fat: {dayPlan.meals.reduce((sum, m) => sum + m.fat, 0)}g
              </p>
            </div>

            {/* Meals */}
            <div className="divide-y divide-gray-100">
              {dayPlan.meals.map((meal, idx) => (
                <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Meal Type Badge */}
                    <div className="flex-shrink-0">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {meal.mealType}
                      </span>
                    </div>

                    {/* Meal Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base">{meal.name}</h4>
                      {meal.description && (
                        <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Portion: {meal.portionSize}</p>

                      {/* Nutrition */}
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
                          🔥 {meal.calories} kcal
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded">
                          🥩 {meal.protein}g protein
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded">
                          🍞 {meal.carbs}g carbs
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                          🧈 {meal.fat}g fat
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                          🌾 {meal.fibre}g fibre
                        </span>
                      </div>

                      {/* Why it works */}
                      {meal.whyItWorks && (
                        <p className="text-xs text-indigo-700 mt-2 italic bg-indigo-50 rounded p-2">
                          💡 {meal.whyItWorks}
                        </p>
                      )}

                      {/* Ingredients */}
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-500">Ingredients: </span>
                          <span className="text-xs text-gray-600">
                            {meal.ingredients.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Patient Profile Summary */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Your Input Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600"><span className="font-semibold">Patient Name:</span> {profile.name}</p>
            <p className="text-gray-600"><span className="font-semibold">Age:</span> {profile.age} years</p>
            <p className="text-gray-600"><span className="font-semibold">Height:</span> {profile.height} cm</p>
            <p className="text-gray-600"><span className="font-semibold">Current Weight:</span> {profile.currentWeight} kg</p>
            <p className="text-gray-600"><span className="font-semibold">Goal Weight:</span> {profile.goalWeight} kg</p>
          </div>
          <div>
            <p className="text-gray-600"><span className="font-semibold">Primary Goal:</span> {profile.primaryGoal}</p>
            <p className="text-gray-600"><span className="font-semibold">Hormonal Phase:</span> {profile.hormonalPhase}</p>
            <p className="text-gray-600"><span className="font-semibold">Activity Level:</span> {profile.activityLevel}</p>
            <p className="text-gray-600"><span className="font-semibold">Goal Timeline:</span> {profile.goalTimeline}</p>
            <p className="text-gray-600"><span className="font-semibold">Water Target:</span> {profile.waterTarget} glasses/day</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600"><span className="font-semibold">Health Conditions:</span> {profile.healthConditions.length > 0 ? profile.healthConditions.join(', ') : 'None'}</p>
            <p className="text-gray-600"><span className="font-semibold">Food Preference:</span> {profile.foodPreference}</p>
            {profile.foodPreference === 'non-vegetarian' && profile.nonVegDays.length > 0 && (
              <p className="text-gray-600"><span className="font-semibold">Non-Veg Days:</span> {profile.nonVegDays.join(', ')}</p>
            )}
            <p className="text-gray-600"><span className="font-semibold">Kitchen Preferences:</span> {profile.kitchenPreferences.length > 0 ? profile.kitchenPreferences.join(', ') : 'None'}</p>
            <p className="text-gray-600"><span className="font-semibold">Indian Region:</span> {profile.indianRegion}</p>
            <p className="text-gray-600"><span className="font-semibold">Pantry Staples:</span> {profile.pantryStaples.join(', ')}</p>
            <p className="text-gray-600"><span className="font-semibold">Allergies:</span> {profile.allergies || 'None'}</p>
            <p className="text-gray-600"><span className="font-semibold">Foods to Avoid:</span> {profile.foodsToAvoid || 'None'}</p>
            <p className="text-gray-600"><span className="font-semibold">Meals Per Day:</span> {profile.mealsPerDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
