# Multi-Step Onboarding Flow - Implementation Plan

## Overview

Replace the current single-page form with a guided, multi-step onboarding wizard that collects comprehensive patient data through 15+ screens with conditional branching logic.

---

## Architecture Decisions

### 1. Component Structure

**New Components:**
- `OnboardingWizard.tsx` - Main wizard container with step management
- `OnboardingStep.tsx` - Reusable step wrapper with navigation
- Individual step components (one file per step or grouped logically)

**State Management:**
- Use React Context for onboarding state (avoid prop drilling)
- Create `OnboardingContext` with:
  - `profileData` - All collected data
  - `currentStep` - Current step index
  - `updateProfile()` - Update profile data
  - `nextStep()` / `prevStep()` - Navigation
  - `validationErrors` - Current step validation

### 2. Step Flow & Conditional Logic

```
1. Name → 2. Language → 3. Body Stats → 4. Personalization Sheet → 5. Primary Goal
    ↓
6. Hormonal/Life Phase → 7. Conditions & Allergies
    ↓
8. Timeline (if NOT Better Sleep) OR Skip to 9
    ↓
9. Goal Weight (if Lose Weight) OR Wellness Confirmation (other goals)
    ↓
10. Nutrition Projection (read-only) → 11. Kitchen Preferences
    ↓
12. Regional Cuisine → 13. Pantry → 14. Kitchen Personalization Sheet
    ↓
15. Non-Veg Days (if NOT Vegetarian/Vegan/Jain) OR Skip
    ↓
16. Food Frequency → 17. Meal Frequency → 18. Routine Habits
    ↓
19. Household Portions → 20. Activity → 21. Done (Generate Plan)
```

**Conditional Branches:**
- Better Sleep goal → Skip Timeline (step 8)
- Non-weight goals → Skip Goal Weight (step 9), show wellness confirmation
- Vegetarian/Vegan/Jain → Skip Non-Veg Days (step 15)
- Mix (Non-veg) selected → Show meat/fish/egg subtypes in Non-Veg Days

### 3. Data Model

Extend `PatientProfile` interface:

```typescript
interface PatientProfile {
  // Existing fields
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  goalWeight: number;
  primaryGoal: string;
  hormonalPhase: string;
  activityLevel: string;
  goalTimeline: string;
  healthConditions: string[];
  foodPreference: string;
  nonVegDays: string[];
  kitchenPreferences: string[];
  indianRegion: string;
  pantryStaples: string[];
  allergies: string[];  // Changed from string to array
  foodsToAvoid: string;
  mealsPerDay: number;
  waterTarget: number;
  
  // New fields
  secondaryLanguage?: string;
  city?: string;
  state?: string;
  foodFrequency?: Record<string, string>; // { "pulses": "daily", "rice": "2x_week" }
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
  dietRichness?: string[]; // Vitamin D, Healthy Skin, Iron, Antioxidant-Rich
  nonVegProteinTypes?: {
    meat?: string[];
    fish?: string[];
    eggs?: string[];
  };
}
```

### 4. Step Components Breakdown

#### Step 1: Name
- **Input:** Text field (first name)
- **Validation:** Trimmed length >= 2
- **Transform:** Capitalize words
- **Next:** Language

#### Step 2: Language
- **Primary:** English (always selected, disabled)
- **Secondary:** Optional single selection from 7 languages
- **Validation:** None required
- **Next:** Body Stats

#### Step 3: Body Stats
- **Inputs:** Age (integer), Height (cm, integer), Weight (kg, decimal)
- **Validation:** All > 0, non-empty
- **Next:** Personalization Sheet (modal) → Primary Goal

#### Step 4: Personalization Sheet (Modal)
- **Purpose:** Brief interstitial before Primary Goal
- **Action:** Continue closes sheet, opens Primary Goal

#### Step 5: Primary Goal
- **Options:** 5 radio buttons with descriptions
- **Validation:** Exactly one selected
- **Next:** Hormonal/Life Phase

#### Step 6: Hormonal/Life Phase
- **Options:** 5 radio buttons with descriptions
- **Validation:** Exactly one selected
- **Next:** Conditions & Allergies

#### Step 7: Conditions & Allergies
- **Conditions:** Multi-select chips (5 options)
- **Allergies:** Multi-select chips (8 options)
- **Validation:** None required
- **Button Label:** "Skip" if empty, "Continue" if any selected
- **Next:** Timeline (if goal != Better Sleep) OR Goal Weight/Confirmation

#### Step 8: Timeline (Conditional)
- **Condition:** Show only if goal != Better Sleep
- **Options:** 4 radio buttons with timeframes
- **Validation:** Exactly one selected
- **Next:** Goal Weight/Confirmation

#### Step 9: Goal Weight / Wellness Confirmation
- **If Lose Weight:**
  - Input: Goal weight (decimal)
  - Display: Current weight, target weight, difference
  - Validation: Positive, different from current
  - Show: "X kg to lose" or "X kg to gain" or "Maintaining" (invalid)
- **If Other Goals:**
  - Display: Wellness confirmation message
  - No input required
- **Next:** Nutrition Projection

#### Step 10: Nutrition Projection (Read-Only)
- **Display:**
  - Calorie goal ring (visual)
  - Protein, Fat, Carbs, Fiber values
  - Target month/year based on timeline
  - kg/month pace (if weight loss)
- **Calculations:** Use existing BMR/TDEE logic
- **Action:** "Set up my kitchen" → Kitchen Preferences

#### Step 11: Kitchen Preferences
- **Options:** Multi-select chips (5 options)
- **Validation:** None required
- **Button Label:** "Skip" if empty, "Continue" if any selected
- **Next:** Regional Cuisine

#### Step 12: Regional Cuisine & Location
- **Cuisine:** Single-select chip (21 options)
- **Location:** Optional text fields (City, State)
- **Validation:** None required
- **Button Label:** "Skip" if no cuisine selected, "Continue" if selected
- **Next:** Pantry

#### Step 13: Pantry
- **Region-specific staples:** Show if region has staples
- **Categories:** 6 groups with multi-select items
- **Validation:** None required
- **Button Label:** "Skip" if empty, "Continue" if any selected
- **Next:** Kitchen Personalization Sheet (modal) → Non-Veg Days OR Food Frequency

#### Step 14: Kitchen Personalization Sheet (Modal)
- **Purpose:** Interstitial before Non-Veg Days or Food Frequency
- **Logic:** If Vegetarian/Vegan/Jain → Skip Non-Veg Days
- **Next:** Non-Veg Days (if applicable) OR Food Frequency

#### Step 15: Non-Veg Days (Conditional)
- **Condition:** Skip if Vegetarian/Vegan/Jain selected
- **Options:**
  - "I'm vegetarian" (special marker)
  - Weekday chips (Mon-Sun)
- **If Mix (Non-veg) selected:**
  - Show meat/fish/egg subtype groups
- **Validation:** None required
- **Next:** Food Frequency

#### Step 16: Food Frequency
- **Regular foods:** 6 rows with frequency options (Daily, 2x, 3x, Rarely, None)
- **Occasional foods:** 4 rows with same options
- **Validation:** None required
- **Next:** Meal Frequency

#### Step 17: Meal Frequency
- **Options:** 5 radio buttons (2-6 meals)
- **Validation:** Exactly one selected
- **Next:** Routine Habits

#### Step 18: Routine Habits
- **Categories:** 5 preset categories with frequency steppers (1-10)
- **Preferences:** Optional sub-selections per category
- **Custom habits:** Add custom habit with frequency
- **Validation:** None required
- **Button Label:** "Skip" if empty, "Continue" if any selected
- **Next:** Household Portions

#### Step 19: Household Portions
- **Options:** 3 independent selectors (Chapati, Rice, Dal)
- **Sizes:** Small/Medium/Large with kcal info
- **Validation:** None required
- **Button Label:** "Skip" if empty, "Continue" if any selected
- **Next:** Activity

#### Step 20: Activity
- **Options:** 5 radio buttons with descriptions
- **Validation:** Exactly one selected
- **Action:** "See my plan" → Done

#### Step 21: Done
- **Display:** Summary of collected data
- **Action:** Generate meal plan (calls existing API)
- **Next:** MealPlanDisplay

---

## UI/UX Design

### Visual Style
- **Minimalist:** Clean, white background with subtle borders
- **Progress indicator:** Step counter (e.g., "Step 3 of 21") or progress bar
- **Navigation:** Back button (except first step), Continue/Skip button
- **Inputs:** Large touch-friendly buttons, clear labels
- **Validation:** Inline error messages, disable Continue until valid
- **Transitions:** Smooth fade/slide between steps

### Component Reusability
- `StepWrapper` - Common layout with header, content, footer
- `RadioGroup` - Reusable radio button group
- `ChipSelect` - Multi-select chip component
- `SingleChipSelect` - Single-select chip component
- `StepperInput` - Number input with +/- buttons
- `ProgressIndicator` - Step counter/progress bar

### Mobile-First Design
- Full-screen steps on mobile
- Swipe gestures for navigation (optional)
- Large tap targets (min 44x44px)
- Keyboard handling for text inputs

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
1. Create `OnboardingContext` with state management
2. Build `OnboardingWizard` container with step navigation
3. Create `OnboardingStep` wrapper component
4. Implement progress indicator
5. Build reusable UI components (RadioGroup, ChipSelect, etc.)

### Phase 2: Core Steps (Day 3-5)
1. Implement Steps 1-7 (Name through Conditions)
2. Add validation logic for each step
3. Implement conditional branching (Better Sleep skip)
4. Test navigation flow

### Phase 3: Goal & Weight Steps (Day 6-7)
1. Implement Timeline step (conditional)
2. Implement Goal Weight / Wellness Confirmation
3. Build Nutrition Projection calculations
4. Add visual calorie ring component

### Phase 4: Kitchen & Region Steps (Day 8-10)
1. Implement Kitchen Preferences
2. Build Regional Cuisine & Location
3. Create Pantry step with categorized items
4. Add region-specific staple logic

### Phase 5: Diet & Frequency Steps (Day 11-13)
1. Implement Non-Veg Days (conditional)
2. Add Mix (Non-veg) protein subtypes
3. Build Food Frequency matrix
4. Implement Meal Frequency

### Phase 6: Habits & Portions (Day 14-15)
1. Implement Routine Habits with steppers
2. Add custom habit functionality
3. Build Household Portions selectors
4. Implement Activity level

### Phase 7: Integration & Polish (Day 16-17)
1. Connect to existing meal plan generation
2. Map onboarding data to PatientProfile
3. Update API prompt with new fields
4. Test end-to-end flow
5. Add loading states and error handling

### Phase 8: Testing & Refinement (Day 18-20)
1. Test all conditional branches
2. Validate all input constraints
3. Test on mobile devices
4. Performance optimization
5. Accessibility audit

---

## Technical Considerations

### State Persistence
- **Option A:** Keep in memory (lost on refresh) - Simple, current approach
- **Option B:** LocalStorage - Persist across refreshes
- **Option C:** URL params - Shareable links (complex)
- **Recommendation:** Start with Option A, add LocalStorage in Phase 8

### Validation Strategy
- **Per-step validation:** Validate before allowing Continue
- **Inline errors:** Show errors immediately on invalid input
- **Disable Continue:** Prevent progression until valid
- **Error messages:** Clear, actionable feedback

### Performance
- **Lazy loading:** Load step components on demand
- **Memoization:** Use React.memo for expensive calculations
- **Debounce:** Debounce text input validation
- **Code splitting:** Split onboarding into separate chunk

### Accessibility
- **Keyboard navigation:** Full keyboard support
- **Screen readers:** ARIA labels and roles
- **Focus management:** Auto-focus first input on step change
- **Color contrast:** WCAG AA compliance

---

## Testing Strategy

### Unit Tests
- Validation logic for each step
- Conditional branching logic
- Data transformation functions
- Nutrition calculations

### Integration Tests
- Step navigation flow
- State persistence
- Conditional skips
- Data mapping to PatientProfile

### E2E Tests
- Complete onboarding flow
- All conditional branches
- Error scenarios
- Mobile responsiveness

### Manual Testing Checklist
- [ ] All 21 steps work correctly
- [ ] Conditional branches skip correctly
- [ ] Validation prevents invalid data
- [ ] Back button preserves data
- [ ] Progress indicator accurate
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Data maps correctly to API

---

## Risk Mitigation

### Risk 1: Complexity Overload
**Mitigation:** Break into small, testable components. Use TypeScript for type safety.

### Risk 2: State Management Bugs
**Mitigation:** Use Context with useReducer for predictable state updates. Add comprehensive logging.

### Risk 3: Conditional Logic Errors
**Mitigation:** Create flow diagram. Write integration tests for all branches. Manual testing checklist.

### Risk 4: Performance Issues
**Mitigation:** Lazy load steps. Memoize calculations. Profile with React DevTools.

### Risk 5: User Confusion
**Mitigation:** Clear labels and descriptions. Progress indicator. Back button always available.

---

## Success Metrics

### Functional
- All 21 steps implemented and working
- All conditional branches correct
- All validations working
- Data correctly maps to meal plan generation

### UX
- Average completion time < 5 minutes
- < 5% drop-off rate
- < 3 support tickets per 100 users
- > 90% user satisfaction score

### Technical
- < 1% error rate
- < 2s step transition time
- 100% test coverage for validation logic
- Zero TypeScript errors

---

## Future Enhancements (Post-MVP)

1. **Save & Resume:** Allow users to save progress and return later
2. **Edit Previous Steps:** Allow going back and editing without losing data
3. **Import from Health Apps:** Pull data from Apple Health, Google Fit
4. **AI Suggestions:** AI suggests options based on previous inputs
5. **Multi-language Support:** Translate entire flow to selected language
6. **Accessibility Modes:** High contrast, large text, screen reader optimized
7. **Offline Support:** Service worker for offline onboarding
8. **Analytics:** Track drop-off points, optimize flow

---

## Conclusion

This onboarding flow is a significant enhancement that will greatly improve the user experience by breaking down a complex form into manageable, guided steps. The implementation requires careful planning, modular architecture, and thorough testing.

**Key Success Factors:**
- Modular, reusable components
- Clear state management
- Comprehensive validation
- Smooth conditional branching
- Excellent UX writing
- Thorough testing

**Estimated Timeline:** 20 days (1 developer)
**Risk Level:** Medium (complex logic, but well-defined requirements)
**Recommendation:** Proceed with implementation in phases, testing each phase before moving to next.
