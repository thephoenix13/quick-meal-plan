import React, { useState } from 'react';
import StepWrapper from '../components/StepWrapper';
import SingleChipSelect from '../components/SingleChipSelect';
import { useOnboarding } from '../OnboardingContext';

const REGIONS = [
  'Maharashtrian', 'Konkani / Goan', 'Gujarati', 'Rajasthani', 'Marwari',
  'Punjabi / North Indian', 'UP / Awadhi', 'Bihari', 'Kashmiri', 'Himachali / Pahadi',
  'Bengali', 'Odia', 'Assamese / Northeast', 'Tamil', 'Keralite / Malayali',
  'Kannadiga / Karnataka', 'Andhra / Telugu', 'Hyderabadi', 'Sindhi',
  'Chhattisgarhi / Tribal', 'Mixed / Pan-Indian'
];

export default function Step12_RegionalCuisine() {
  const { state, updateProfile, nextStep } = useOnboarding();
  const [region, setRegion] = useState<string | null>(state.profileData.indianRegion || null);
  const [city, setCity] = useState(state.profileData.city || '');
  const [stateName, setStateName] = useState(state.profileData.state || '');

  const handleContinue = () => {
    updateProfile({
      indianRegion: region || '',
      city: city || undefined,
      state: stateName || undefined,
    });
    nextStep();
  };

  return (
    <StepWrapper
      title="Regional cuisine and location"
      subtitle="Select your preferred cuisine. You can skip if you prefer mixed cuisine."
      onContinue={handleContinue}
      continueLabel={region ? 'Continue' : 'Skip'}
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium text-gray-900 mb-3">Cuisine</div>
          <SingleChipSelect options={REGIONS} selected={region} onChange={setRegion} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">City (optional)</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
              className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">State (optional)</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Your state"
              className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
