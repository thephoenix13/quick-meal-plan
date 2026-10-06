import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍛</div>
          <div className="absolute top-20 right-20 text-7xl">🥗</div>
          <div className="absolute bottom-20 left-1/4 text-6xl">🍲</div>
          <div className="absolute bottom-10 right-1/3 text-8xl">🥘</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-medium">🩺 Doctor's Meal Plan Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Personalized 7-Day Indian<br />Meal Plans in Seconds
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Generate customized meal plans tailored to your patient's health profile, 
            dietary preferences, and regional cuisine — powered by AI.
          </p>
          
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
          >
            Generate Meal Plan →
          </button>
          
          <p className="mt-6 text-sm text-blue-200">
            No sign-up required. Just bring your Anthropic API key.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Four simple steps to create a personalized meal plan
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: '📋',
                title: 'Enter Patient Details',
                description: 'Age, weight, height, goals, health conditions, and more'
              },
              {
                step: '2',
                icon: '🍽️',
                title: 'Set Preferences',
                description: 'Food type, region, allergies, pantry staples, diet richness'
              },
              {
                step: '3',
                icon: '🧠',
                title: 'AI Generates Plan',
                description: '7 days of personalized Indian meals with full nutrition data'
              },
              {
                step: '4',
                icon: '📄',
                title: 'Download & Share',
                description: 'Export as professional PDF with complete patient profile'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 h-full border border-blue-100 hover:shadow-lg transition-shadow">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Key Features
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Everything you need for comprehensive meal planning
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Comprehensive Profiling',
                description: '19 input fields covering every aspect of patient health and preferences'
              },
              {
                icon: '🧠',
                title: 'AI-Powered Planning',
                description: 'Claude AI creates evidence-based, personalized meal plans'
              },
              {
                icon: '🍛',
                title: '28 Regional Cuisines',
                description: 'From Punjabi to Kerala to Bengali — authentic regional dishes'
              },
              {
                icon: '🌿',
                title: 'Diet Richness',
                description: 'Target specific nutrients: Vitamin D, Iron, Antioxidants & more'
              },
              {
                icon: '📊',
                title: 'Full Nutrition Data',
                description: 'Calories, protein, carbs, fat, and fibre for every meal'
              },
              {
                icon: '📄',
                title: 'Professional PDF Export',
                description: 'Downloadable reports with complete patient profile and meal details'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            What's Included
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            A complete meal planning solution
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📅 7-Day Meal Plan
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>2-6 meals per day (customizable)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Authentic Indian regional dishes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Portion sizes and ingredients</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>"Why it works" explanations</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📊 Nutrition Tracking
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Calories per meal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Protein, carbs, fat, fibre</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Daily totals and targets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>BMI and protein calculations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                📋 Patient Profile Summary
              </h3>
              <p className="text-gray-700 mb-4">
                Complete documentation of all input data including health conditions, 
                dietary restrictions, allergies, and preferences for reference and verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Who It's For
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Designed for healthcare professionals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '👨‍⚕️',
                title: 'Doctor\'s Representatives',
                description: 'Provide value-added services to healthcare providers'
              },
              {
                icon: '🥗',
                title: 'Nutrition Consultants',
                description: 'Create personalized plans for your clients'
              },
              {
                icon: '💪',
                title: 'Wellness Coaches',
                description: 'Support holistic health and wellness goals'
              },
              {
                icon: '🏥',
                title: 'Healthcare Professionals',
                description: 'Enhance patient care with tailored nutrition'
              }
            ].map((audience, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-5xl mb-4">{audience.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{audience.title}</h3>
                <p className="text-sm text-gray-600">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Your First Meal Plan?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start generating personalized, AI-powered meal plans for your patients today.
          </p>
          
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-xl"
          >
            Get Started Now →
          </button>
          
          <p className="mt-8 text-sm text-blue-200">
            Free to use • No sign-up required • Just need your Anthropic API key
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm">
            © 2026 Doctor's Meal Plan Generator. All rights reserved.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            This tool generates suggested meal plans and does not constitute medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
