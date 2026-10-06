import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PatientProfileV2 {
  // Basic Info
  name: string;
  secondaryLanguage?: string;
  age: number;
  height: number;
  currentWeight: number;
  
  // Goals
  primaryGoal: string;
  hormonalPhase: string;
  goalTimeline?: string;
  goalWeight?: number;
  
  // Health
  healthConditions: string[];
  allergies: string[];
  
  // Kitchen & Food
  kitchenPreferences: string[];
  indianRegion: string;
  city?: string;
  state?: string;
  pantryStaples: string[];
  
  // Non-Veg
  nonVegDays: string[];
  nonVegProteinTypes?: {
    meat?: string[];
    fish?: string[];
    eggs?: string[];
  };
  
  // Frequency
  foodFrequency?: Record<string, string>;
  mealsPerDay: number;
  
  // Habits
  routineHabits?: Array<{
    category: string;
    frequency: number;
    preference?: string;
  }>;
  
  // Portions
  householdPortions?: {
    chapatiSize?: string;
    riceBowl?: string;
    dalKatori?: string;
  };
  
  // Activity
  activityLevel: string;
  
  // Diet Richness
  dietRichness?: string[];
}

interface OnboardingState {
  currentStep: number;
  profileData: PatientProfileV2;
  validationErrors: Record<string, string>;
}

type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_PROFILE'; data: Partial<PatientProfileV2> }
  | { type: 'SET_VALIDATION_ERROR'; field: string; error: string }
  | { type: 'CLEAR_VALIDATION_ERROR'; field: string }
  | { type: 'RESET' };

const initialState: PatientProfileV2 = {
  name: '',
  age: 0,
  height: 0,
  currentWeight: 0,
  primaryGoal: '',
  hormonalPhase: '',
  healthConditions: [],
  allergies: [],
  kitchenPreferences: [],
  indianRegion: '',
  pantryStaples: [],
  nonVegDays: [],
  mealsPerDay: 3,
  activityLevel: '',
};

const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  profileData: initialState,
  validationErrors: {},
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profileData: { ...state.profileData, ...action.data },
      };
    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: { ...state.validationErrors, [action.field]: action.error },
      };
    case 'CLEAR_VALIDATION_ERROR':
      const { [action.field]: removed, ...rest } = state.validationErrors;
      return { ...state, validationErrors: rest };
    case 'RESET':
      return initialOnboardingState;
    default:
      return state;
  }
}

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateProfile: (data: Partial<PatientProfileV2>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);

  const nextStep = () => {
    if (state.currentStep < 21) {
      dispatch({ type: 'SET_STEP', step: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', step: state.currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 21) {
      dispatch({ type: 'SET_STEP', step });
    }
  };

  const updateProfile = (data: Partial<PatientProfileV2>) => {
    dispatch({ type: 'UPDATE_PROFILE', data });
  };

  const setValidationError = (field: string, error: string) => {
    dispatch({ type: 'SET_VALIDATION_ERROR', field, error });
  };

  const clearValidationError = (field: string) => {
    dispatch({ type: 'CLEAR_VALIDATION_ERROR', field });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        dispatch,
        nextStep,
        prevStep,
        goToStep,
        updateProfile,
        setValidationError,
        clearValidationError,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
