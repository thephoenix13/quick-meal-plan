import React, { useState } from 'react';
import { PatientProfile } from '../types';

interface Props {
  onSubmit: (profile: PatientProfile, apiKey: string) => void;
  loading: boolean;
}

const INDIAN_REGIONS = [
  'North Indian (Punjab, Delhi, UP)',
  'South Indian (Tamil Nadu, Kerala)',
  'South Indian (Karnataka, Andhra)',
  'East Indian (Bengal, Odisha)',
  'West Indian (Maharashtra, Gujarat)',
  'Rajasthani',
  'Hyderabadi',
  'Kashmiri',
  'Goan',
  'Malwani/Konkani',
  'Chettinad',
  'Awadhi',
  'Mughlai',
  'Kerala Christian',
  'Parsi',
  'North-East Indian',
  'Bihari',
  'Jharkhandi',
  'Himachali',
  'Uttarakhandi',
  'Coorgi',
];

const PANTRY_STAPLES = [
  'Atta (whole wheat flour)',
  'Rice',
  'Dal (lentils)',
  'Paneer',
  'Curd/Yogurt',
  'Oil (mustard/sunflower/ghee)',
  'Spices (turmeric, cumin, coriander)',
  'Onion & Tomato',
  'Green vegetables',
  'Root vegetables',
  'Millets (jowar, bajra, ragi)',
  'Besan (gram flour)',
  'Jaggery',
  'Coconut',
  'Fresh fruits (seasonal)',
  'Dry fruits (almonds, walnuts, raisins)',
  'Seeds (flax, chia, sesame, pumpkin)',
  'Sprouts (moong, chana)',
  'Honey',
  'Buttermilk/Lassi',
  'Eggs',
  'Chicken/Fish',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const HEALTH_CONDITIONS = [
  'Hypothyroid',
  'Type 2 Diabetes',
  'Sleep Apnea',
  'Hypertension',
  'Iron Deficiency',
  'Vitamin D Deficiency',
];

export default function PatientForm({ onSubmit, loading }: Props) {
  const [profile, setProfile] = useState<PatientProfile>({
    name: '',
    age: 30,
    height: 160,
    currentWeight: 65,
    goalWeight: 60,
    primaryGoal: 'weight loss',
    hormonalPhase: 'regular cycle',
    activityLevel: 'moderately active',
    goalTimeline: '6 months',
    healthConditions: [],
    foodPreference: 'vegetarian',
    nonVegDays: [],
    kitchenPreferences: [],
    indianRegion: 'North Indian (Punjab, Delhi, UP)',
    pantryStaples: ['Atta (whole wheat flour)', 'Rice', 'Dal (lentils)', 'Fresh fruits (seasonal)', 'Seeds (flax, chia, sesame, pumpkin)'],
    allergies: '',
    foodsToAvoid: '',
    mealsPerDay: 4,
    waterTarget: 8,
  });

  const updateField = (field: keyof PatientProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'healthConditions' | 'nonVegDays' | 'kitchenPreferences' | 'pantryStaples', item: string) => {
    setProfile((prev) => {
      const arr = prev[field] as string[];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter((i) => i !== item) };
      }
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert('Please enter patient name');
      return;
    }
    onSubmit(profile, '');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">📋 Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={10}
              max={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => updateField('height', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={100}
              max={250}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
            <input
              type="number"
              value={profile.currentWeight}
              onChange={(e) => updateField('currentWeight', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={30}
              max={250}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Weight (kg)</label>
            <input
              type="number"
              value={profile.goalWeight}
              onChange={(e) => updateField('goalWeight', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={30}
              max={250}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Target (glasses/day)</label>
            <input
              type="number"
              value={profile.waterTarget}
              onChange={(e) => updateField('waterTarget', Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={4}
              max={20}
            />
          </div>
        </div>
      </section>

      {/* Goals & Activity */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🎯 Goals & Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
            <select
              value={profile.primaryGoal}
              onChange={(e) => updateField('primaryGoal', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weight loss">Weight Loss</option>
              <option value="more energy">More Energy</option>
              <option value="hormonal balance">Hormonal Balance</option>
              <option value="better sleep">Better Sleep</option>
              <option value="overall wellness">Overall Wellness</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hormonal Phase</label>
            <select
              value={profile.hormonalPhase}
              onChange={(e) => updateField('hormonalPhase', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="regular cycle">Regular Cycle</option>
              <option value="irregular cycle">Irregular Cycle</option>
              <option value="PCOS">PCOS</option>
              <option value="perimenopause">Perimenopause</option>
              <option value="post-menopause">Post-Menopause</option>
              <option value="pregnant">Pregnant</option>
              <option value="nursing">Nursing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              value={profile.activityLevel}
              onChange={(e) => updateField('activityLevel', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="active">Active</option>
              <option value="very active">Very Active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Timeline</label>
            <select
              value={profile.goalTimeline}
              onChange={(e) => updateField('goalTimeline', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="9 months">9 Months</option>
              <option value="12+ months">12+ Months</option>
            </select>
          </div>
        </div>
      </section>

      {/* Health Conditions */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🏥 Health Conditions</h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => toggleArrayItem('healthConditions', condition)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                profile.healthConditions.includes(condition)
                  ? 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </section>

      {/* Food Preferences */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🍽️ Food Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
            <select
              value={profile.foodPreference}
              onChange={(e) => {
                updateField('foodPreference', e.target.value);
                if (e.target.value !== 'non-vegetarian') {
                  updateField('nonVegDays', []);
                }
              }}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
            </select>
          </div>
          {profile.foodPreference === 'non-vegetarian' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Non-Veg Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleArrayItem('nonVegDays', day)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      profile.nonVegDays.includes(day)
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Kitchen Preferences */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">👨‍🍳 Kitchen Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {['Vegan', 'Gluten-Free', 'Jain', 'Dairy-Free', 'Nut-Free'].map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => toggleArrayItem('kitchenPreferences', pref)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                profile.kitchenPreferences.includes(pref)
                  ? 'bg-purple-100 border-purple-400 text-purple-800'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </section>

      {/* Region & Pantry */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🇮🇳 Region & Pantry</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indian Region</label>
            <select
              value={profile.indianRegion}
              onChange={(e) => updateField('indianRegion', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INDIAN_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pantry Staples</label>
            <div className="flex flex-wrap gap-2">
              {PANTRY_STAPLES.map((staple) => (
                <button
                  key={staple}
                  type="button"
                  onClick={() => toggleArrayItem('pantryStaples', staple)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    profile.pantryStaples.includes(staple)
                      ? 'bg-amber-100 border-amber-400 text-amber-800'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {staple}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Allergies & Avoid */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">⚠️ Allergies & Restrictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => updateField('allergies', e.target.value)}
              placeholder="e.g., peanuts, shellfish"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foods to Avoid (optional)</label>
            <input
              type="text"
              value={profile.foodsToAvoid}
              onChange={(e) => updateField('foodsToAvoid', e.target.value)}
              placeholder="e.g., brinjal, cabbage"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Meals Per Day */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">🍽️ Meal Structure</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Meals Per Day</label>
          <select
            value={profile.mealsPerDay}
            onChange={(e) => updateField('mealsPerDay', Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          >
            <option value={3}>3 Meals</option>
            <option value={4}>4 Meals</option>
            <option value={5}>5 Meals</option>
          </select>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Plan...
            </span>
          ) : (
            '🧠 Generate 7-Day Meal Plan'
          )}
        </button>
      </div>
    </form>
  );
}
