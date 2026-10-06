interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
            Personalized 7-Day Indian<br />Meal Plans
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate customized meal plans tailored to your patient's health profile, 
            dietary preferences, and regional cuisine.
          </p>
          
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Get started
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            No sign-up required
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900 tracking-tight">
            How it works
          </h2>
          <p className="text-center text-gray-600 mb-16 text-base">
            Four simple steps to create a personalized meal plan
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Enter patient details',
                description: 'Age, weight, height, goals, health conditions'
              },
              {
                step: '02',
                title: 'Set preferences',
                description: 'Food type, region, allergies, pantry staples'
              },
              {
                step: '03',
                title: 'AI generates plan',
                description: '7 days of personalized meals with nutrition data'
              },
              {
                step: '04',
                title: 'Download & share',
                description: 'Export as PDF with complete patient profile'
              }
            ].map((item) => (
              <div key={item.step} className="text-left">
                <div className="text-xs font-medium text-gray-400 mb-3 tracking-wide">
                  {item.step}
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900 tracking-tight">
            Features
          </h2>
          <p className="text-center text-gray-600 mb-16 text-base">
            Everything you need for comprehensive meal planning
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: 'Comprehensive profiling',
                description: '19 input fields covering every aspect of patient health and preferences'
              },
              {
                title: 'AI-powered planning',
                description: 'Claude AI creates evidence-based, personalized meal plans'
              },
              {
                title: '28 regional cuisines',
                description: 'From Punjabi to Kerala to Bengali — authentic regional dishes'
              },
              {
                title: 'Diet richness',
                description: 'Target specific nutrients: Vitamin D, Iron, Antioxidants & more'
              },
              {
                title: 'Full nutrition data',
                description: 'Calories, protein, carbs, fat, and fibre for every meal'
              },
              {
                title: 'Professional PDF export',
                description: 'Downloadable reports with complete patient profile and meal details'
              }
            ].map((feature, idx) => (
              <div key={idx}>
                <h3 className="text-base font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900 tracking-tight">
            What's included
          </h2>
          <p className="text-center text-gray-600 mb-16 text-base">
            A complete meal planning solution
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                7-day meal plan
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>2-6 meals per day</li>
                <li>Authentic regional dishes</li>
                <li>Portion sizes & ingredients</li>
                <li>Detailed explanations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Nutrition tracking
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Calories per meal</li>
                <li>Macronutrient breakdown</li>
                <li>Daily totals & targets</li>
                <li>BMI & protein calculations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Patient profile
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Complete input documentation</li>
                <li>Health conditions</li>
                <li>Dietary restrictions</li>
                <li>Allergies & preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-gray-900 tracking-tight">
            Who it's for
          </h2>
          <p className="text-center text-gray-600 mb-16 text-base">
            Designed for healthcare professionals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Doctor\'s representatives',
                description: 'Provide value-added services to healthcare providers'
              },
              {
                title: 'Nutrition consultants',
                description: 'Create personalized plans for your clients'
              },
              {
                title: 'Wellness coaches',
                description: 'Support holistic health and wellness goals'
              },
              {
                title: 'Healthcare professionals',
                description: 'Enhance patient care with tailored nutrition'
              }
            ].map((audience, idx) => (
              <div key={idx}>
                <h3 className="text-base font-medium text-gray-900 mb-2">{audience.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            Start generating personalized meal plans for your patients today.
          </p>
          
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Get started
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            Free to use • No sign-up required • Just need your Anthropic API key
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            © 2026 Doctor's Meal Plan Generator
          </p>
          <p className="text-xs mt-2 text-gray-400">
            This tool generates suggested meal plans and does not constitute medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
