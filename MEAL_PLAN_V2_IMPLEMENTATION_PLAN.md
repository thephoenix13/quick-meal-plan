# Meal Plan Generator v2 - Onboarding Flow Implementation Plan

## Overview

Create a **new, alternative meal plan generator** (v2) with a guided, multi-step onboarding wizard. This coexists with the existing generator - users can choose between the original form-based approach OR the new conversational onboarding flow.

**Key Point:** This is NOT a replacement. Both generators will be available.

---

## User Journey

### Landing Page Update
Add two clear options:
```
┌─────────────────────────────────────┐
│  Choose Your Experience             │
│                                     │
│  [Quick Form]    [Guided Onboarding]│
│  (Existing v1)   (New v2)           │
└─────────────────────────────────────┘
```

- **Quick Form** → Existing form-based generator (unchanged)
- **Guided Onboarding** → New v2 wizard (21 steps)

### App Structure
```
App
├── Landing Page
│   ├── Option 1: Quick Form → PatientForm (existing)
│   └── Option 2: Guided Onboarding → OnboardingWizard (new)
│
├── Meal Plan Display (shared by both)
│   └── Same display component, different data sources
│
└── Navigation
    └── "Try v2" / "Try v1" toggle in header
```

---

## Architecture Decisions

### 1. Component Structure

**New Components (v2 only):**
```
src/
├── v2/
│   ├── OnboardingWizard.tsx          # Main wizard container
│   ├── OnboardingContext.tsx          # State management
│   ├── components/
│   │   ├── StepWrapper.tsx            # Reusable step layout
│   │   ├── RadioGroup.tsx             # Radio button group
│   │   ├── ChipSelect.tsx             # Multi-select chips
│   │   ├── SingleChipSelect.tsx       # Single-select chips
│   │   ├── StepperInput.tsx           # Number stepper
│   │   ├── ProgressIndicator.tsx      # Step counter
│   │   └── NutritionRing.tsx          # Calorie ring visualization
│   └── steps/
│       ├── Step01_Name.tsx
│       ├── Step02_Language.tsx
│       ├── Step03_BodyStats.tsx
│       ├── Step04_Personalization.tsx # Modal
│       ├── Step05_PrimaryGoal.tsx
│       ├── Step06_HormonalPhase.tsx
│       ├── Step07_Conditions.tsx
│       ├── Step08_Timeline.tsx        # Conditional
│       ├── Step09_GoalWeight.tsx      # Conditional
│       ├── Step10_NutritionProjection.tsx
│       ├── Step11_KitchenPreferences.tsx
│       ├── Step12_RegionalCuisine.tsx
│       ├── Step13_Pantry.tsx
│       ├── Step14_KitchenPersonalization.tsx # Modal
│       ├── Step15_NonVegDays.tsx      # Conditional
│       ├── Step16_FoodFrequency.tsx
│       ├── Step17_MealFrequency.tsx
│       ├── Step18_RoutineHabits.tsx
│       ├── Step19_HouseholdPortions.tsx
│       ├── Step20_Activity.tsx
│       └── Step21_Done.tsx
```

**Shared Components:**
- `MealPlanDisplay.tsx` - Used by both v1 and v2
- `utils/api.ts` - Same API, enhanced prompt for v2 data
- `utils/pdf.ts` - Same PDF generation, includes v2 fields

### 2. State Management

**OnboardingContext (v2 only):**
```typescript
interface OnboardingState {
  currentStep: number;
  profileData: PatientProfileV2;
  validationErrors: Record<string, string>;
}

interface PatientProfileV2 extends PatientProfile {
  // New v2-specific fields
  secondaryLanguage?: string;
  city?: string;
  state?: string;
  foodFrequency?: Record<string, string>;
  routineHabits?: Array<{
    category: string;
    frequency: number;
    preference?: string;
  }>;
  householdPortions?: {
    chapatiSize?: string;
    riceBowl?: string;
    dalKatori?: string;
  };
  dietRichness?: string[];
  nonVegProteinTypes?: {
    meat?: string[];
    fish?: string[];
    eggs?: string[];
  };
}
```

### 3. Step Flow & Conditional Logic

```
1. Name → 2. Language → 3. Body Stats → 4. Personalization Sheet
    ↓
5. Primary Goal → 6. Hormonal Phase → 7. Conditions & Allergies
    ↓
8. Timeline (if NOT Better Sleep) OR Skip to 9
    ↓
9. Goal Weight (if Lose Weight) OR Wellness Confirmation
    ↓
10. Nutrition Projection → 11. Kitchen Preferences → 12. Regional Cuisine
    ↓
13. Pantry → 14. Kitchen Personalization Sheet
    ↓
15. Non-Veg Days (if NOT Vegetarian/Vegan/Jain) OR Skip
    ↓
16. Food Frequency → 17. Meal Frequency → 18. Routine Habits
    ↓
19. Household Portions → 20. Activity → 21. Done
```

**Conditional Branches:**
- Better Sleep goal → Skip Timeline (step 8)
- Non-weight goals → Skip Goal Weight (step 9)
- Vegetarian/Vegan/Jain → Skip Non-Veg Days (step 15)
- Mix (Non-veg) → Show protein subtypes in step 15

### 4. Data Mapping

**v2 to v1 Mapping:**
```typescript
function mapV2ToV1(v2Data: PatientProfileV2): PatientProfile {
  return {
    // Direct mappings
    name: v2Data.name,
    age: v2Data.age,
    height: v2Data.height,
    currentWeight: v2Data.currentWeight,
    goalWeight: v2Data.goalWeight,
    primaryGoal: mapGoal(v2Data.primaryGoal), // weight_loss → weight loss
    hormonalPhase: mapHormonalPhase(v2Data.hormonalPhase),
    activityLevel: v2Data.activityLevel.toLowerCase(),
    goalTimeline: mapTimeline(v2Data.goalTimeline),
    healthConditions: mapConditions(v2Data.healthConditions),
    foodPreference: mapFoodPreference(v2Data.kitchenPreferences),
    nonVegDays: v2Data.nonVegDays,
    kitchenPreferences: v2Data.kitchenPreferences,
    indianRegion: v2Data.indianRegion,
    pantryStaples: v2Data.pantryStaples,
    allergies: v2Data.allergies.join(', '), // Array to string
    foodsToAvoid: '', // v2 doesn't have this field
    mealsPerDay: v2Data.mealsPerDay,
    waterTarget: 8, // Default, v2 doesn't collect this
    
    // v2-specific fields (passed to API but not in v1 type)
    secondaryLanguage: v2Data.secondaryLanguage,
    city: v2Data.city,
    state: v2Data.state,
    foodFrequency: v2Data.foodFrequency,
    routineHabits: v2Data.routineHabits,
    householdPortions: v2Data.householdPortions,
    dietRichness: v2Data.dietRichness,
    nonVegProteinTypes: v2Data.nonVegProteinTypes,
  };
}
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-3)
**Goal:** Set up v2 structure and core navigation

**Tasks:**
1. Create `src/v2/` directory structure
2. Build `OnboardingContext` with state management
3. Create `OnboardingWizard` container with step navigation
4. Build `StepWrapper` component (reusable layout)
5. Create `ProgressIndicator` component
6. Implement basic navigation (next/prev)
7. Update `App.tsx` to support both v1 and v2 views
8. Update `LandingPage.tsx` to offer both options

**Deliverables:**
- Working wizard shell with 21 empty steps
- Navigation between steps
- Progress indicator
- Landing page with v1/v2 choice

### Phase 2: Core Steps (Days 4-6)
**Goal:** Implement steps 1-7

**Tasks:**
1. Step 1: Name (text input, validation)
2. Step 2: Language (radio + optional secondary)
3. Step 3: Body Stats (3 inputs, validation)
4. Step 4: Personalization Sheet (modal)
5. Step 5: Primary Goal (5 radio options)
6. Step 6: Hormonal Phase (5 radio options)
7. Step 7: Conditions & Allergies (2 multi-select groups)

**Deliverables:**
- Steps 1-7 fully functional
- Validation logic
- Data collection working

### Phase 3: Goal & Weight Steps (Days 7-9)
**Goal:** Implement steps 8-10 with conditional logic

**Tasks:**
1. Step 8: Timeline (conditional - skip for Better Sleep)
2. Step 9: Goal Weight / Wellness Confirmation (conditional)
3. Step 10: Nutrition Projection (calculations + visualization)
4. Implement conditional branching logic
5. Build `NutritionRing` component
6. Add BMR/TDEE/macro calculations

**Deliverables:**
- Conditional branching working
- Nutrition calculations accurate
- Visual calorie ring

### Phase 4: Kitchen & Region Steps (Days 10-12)
**Goal:** Implement steps 11-14

**Tasks:**
1. Step 11: Kitchen Preferences (5 chips)
2. Step 12: Regional Cuisine (21 chips + city/state)
3. Step 13: Pantry (6 categories, 40+ items)
4. Step 14: Kitchen Personalization Sheet (modal)
5. Add region-specific staple logic
6. Implement skip logic for empty selections

**Deliverables:**
- All kitchen/region steps working
- Region-specific data
- Pantry categorization

### Phase 5: Diet & Frequency Steps (Days 13-15)
**Goal:** Implement steps 15-17

**Tasks:**
1. Step 15: Non-Veg Days (conditional + protein subtypes)
2. Step 16: Food Frequency (10 foods × 4 frequencies)
3. Step 17: Meal Frequency (5 radio options)
4. Implement Mix (Non-veg) protein subtype logic
5. Build food frequency matrix UI
6. Add conditional skip for Vegetarian/Vegan/Jain

**Deliverables:**
- Conditional non-veg logic
- Food frequency matrix
- Meal frequency selection

### Phase 6: Habits & Portions (Days 16-18)
**Goal:** Implement steps 18-21

**Tasks:**
1. Step 18: Routine Habits (5 categories + custom)
2. Step 19: Household Portions (3 selectors)
3. Step 20: Activity (5 radio options)
4. Step 21: Done (summary + generate)
5. Build stepper input component
6. Implement custom habit addition
7. Connect to meal plan generation API

**Deliverables:**
- All steps complete
- API integration working
- Meal plan generation from v2 data

### Phase 7: Integration & Polish (Days 19-21)
**Goal:** Connect everything and polish UX

**Tasks:**
1. Map v2 data to v1 format for API
2. Update API prompt to include v2 fields
3. Test end-to-end flow
4. Add loading states
5. Implement error handling
6. Add smooth transitions between steps
7. Mobile responsiveness
8. Keyboard navigation
9. Accessibility audit

**Deliverables:**
- Fully functional v2 generator
- Seamless integration with existing API
- Polished UX

### Phase 8: Testing & Refinement (Days 22-24)
**Goal:** Comprehensive testing and bug fixes

**Tasks:**
1. Test all conditional branches
2. Validate all input constraints
3. Test data mapping accuracy
4. Test on mobile devices
5. Performance optimization
6. Fix any bugs
7. User testing (if possible)

**Deliverables:**
- Bug-free v2 generator
- Tested on all devices
- Performance optimized

---

## UI/UX Design

### Visual Style
- **Minimalist:** Match landing page aesthetic
- **Clean:** White background, subtle borders
- **Focused:** One question per screen
- **Progressive:** Show progress, allow back navigation

### Key UI Elements

**Step Layout:**
```
┌─────────────────────────────────────┐
│  Step 3 of 21                       │
│  ████████░░░░░░░░░░░░░░            │
├─────────────────────────────────────┤
│                                     │
│  [Question/Prompt]                  │
│                                     │
│  [Input/Options]                    │
│                                     │
├─────────────────────────────────────┤
│  [← Back]          [Continue →]    │
└─────────────────────────────────────┘
```

**Component Examples:**

**Radio Group:**
```
○ Lose Weight
  Reach a healthy weight sustainably

○ Gain Weight
  Build mass and strength in a healthy way
```

**Chip Select (Multi):**
```
[ Hypothyroid ] [ Type 2 Diabetes ] [ Sleep Apnea ]
[ Hypertension ] [ Gout ]
```

**Stepper Input:**
```
Tea    [-] 3 [/] times/day
       [ With milk ] [ Black ] [ With jaggery ]
```

### Navigation
- **Back button:** Always visible (except step 1)
- **Continue button:** Disabled until validation passes
- **Skip button:** Shown when selection is optional
- **Progress:** Step counter + progress bar

### Transitions
- **Fade:** Smooth fade between steps
- **Slide:** Optional slide animation (left/right)
- **Duration:** 200-300ms

---

## Technical Considerations

### State Persistence
**Recommendation:** LocalStorage for v2 onboarding
- Save progress automatically
- Allow users to resume if they leave
- Clear on completion

**Implementation:**
```typescript
useEffect(() => {
  localStorage.setItem('v2_onboarding', JSON.stringify(state));
}, [state]);

useEffect(() => {
  const saved = localStorage.getItem('v2_onboarding');
  if (saved) {
    setState(JSON.parse(saved));
  }
}, []);
```

### Validation Strategy
- **Per-step:** Validate before allowing Continue
- **Inline errors:** Show immediately
- **Disable Continue:** Prevent progression until valid
- **Clear messages:** "Please enter a valid age" not "Invalid input"

### Performance
- **Lazy loading:** Load step components on demand
- **Code splitting:** v2 in separate chunk
- **Memoization:** Memoize expensive calculations
- **Debounce:** Debounce text input validation

### Accessibility
- **Keyboard:** Full keyboard navigation
- **Screen readers:** ARIA labels
- **Focus management:** Auto-focus first input
- **Contrast:** WCAG AA compliance

---

## Testing Strategy

### Unit Tests
- Validation logic for each step
- Conditional branching
- Data transformation functions
- Nutrition calculations

### Integration Tests
- Step navigation
- State persistence
- Conditional skips
- Data mapping to API

### E2E Tests
- Complete v2 flow
- All conditional branches
- Error scenarios
- Mobile responsiveness

### Manual Testing Checklist
- [ ] All 21 steps work
- [ ] Conditional branches correct
- [ ] Validation prevents invalid data
- [ ] Back button preserves data
- [ ] Progress indicator accurate
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Data maps correctly to API
- [ ] v1 still works (no regression)

---

## Risk Mitigation

### Risk 1: Complexity
**Mitigation:** Modular components, TypeScript, comprehensive tests

### Risk 2: State Bugs
**Mitigation:** Context + useReducer, logging, thorough testing

### Risk 3: Conditional Logic Errors
**Mitigation:** Flow diagram, integration tests, manual checklist

### Risk 4: Performance
**Mitigation:** Lazy loading, memoization, profiling

### Risk 5: User Confusion
**Mitigation:** Clear labels, progress indicator, back button

### Risk 6: v1 Regression
**Mitigation:** Separate code paths, test v1 after each phase

---

## Success Metrics

### Functional
- All 21 steps implemented
- All conditional branches correct
- All validations working
- Data correctly maps to meal plan
- v1 still works perfectly

### UX
- Average completion time < 5 minutes
- < 5% drop-off rate
- > 90% user satisfaction
- Smooth transitions

### Technical
- < 1% error rate
- < 2s step transition
- 100% test coverage for validation
- Zero TypeScript errors
- No v1 regression

---

## Timeline Summary

| Phase | Days | Focus |
|-------|------|-------|
| 1 | 1-3 | Foundation & navigation |
| 2 | 4-6 | Core steps (1-7) |
| 3 | 7-9 | Goal & weight (8-10) |
| 4 | 10-12 | Kitchen & region (11-14) |
| 5 | 13-15 | Diet & frequency (15-17) |
| 6 | 16-18 | Habits & portions (18-21) |
| 7 | 19-21 | Integration & polish |
| 8 | 22-24 | Testing & refinement |
| **Total** | **24 days** | |

---

## Key Decisions Needed

Before implementation, confirm:

1. **State Persistence:** Use LocalStorage for v2? (Recommended: Yes)

2. **Edit Previous Steps:** Allow going back without losing data? (Recommended: Yes)

3. **Nutrition Projection:** Calculate actual macros or show placeholders? (Recommended: Calculate)

4. **Pantry Staples:** Auto-select based on region or manual? (Recommended: Manual, show suggestions)

5. **v1/v2 Toggle:** Where to switch between generators? (Recommended: Landing page + header toggle)

---

## Conclusion

This plan creates a **new, alternative meal plan generator** (v2) that coexists with the existing v1. Users can choose their preferred experience:
- **v1:** Quick form-based (existing)
- **v2:** Guided onboarding wizard (new, 21 steps)

Both generators feed into the same meal plan display and API, ensuring consistency while offering different user experiences.

**Key Advantages:**
- No risk to existing v1 functionality
- Users can choose their preferred flow
- v2 offers more comprehensive data collection
- Shared components reduce duplication
- Easy to maintain and extend

**Recommendation:** Proceed with 24-day implementation plan, testing each phase before moving to next.
