# Non-Vegetarian Food Preference Enhancement Plan

## Overview

Implement a granular, cascading checkbox system for non-vegetarian food preferences that allows users to:
1. Select which categories they consume (Meat, Eggs, Fish)
2. Select specific types within each category
3. Provide more precise meal plan generation

---

## Current State

**Current Implementation:**
- Food Preference dropdown: Vegetarian / Non-Vegetarian / Eggetarian
- If Non-Vegetarian selected: Shows "Non-Veg Days" multi-select (Monday-Sunday)
- AI receives: "Food Preference: non-vegetarian" and "Non-Veg Days: Monday, Wednesday, Friday"
- AI decides what meat/egg/fish to include (no user control)

**Limitations:**
- No control over which types of meat (chicken vs mutton vs lamb)
- No control over fish preferences
- No control over egg types
- AI makes assumptions about preferences

---

## Proposed Solution

### 1. Data Structure Changes

**Add to PatientProfile type:**

```typescript
interface PatientProfile {
  // ... existing fields ...
  
  // New fields for granular non-veg control
  nonVegCategories: string[];        // ['Meat', 'Eggs', 'Fish']
  meatTypes: string[];                // ['Chicken', 'Mutton', 'Lamb', 'Pork']
  eggTypes: string[];                 // ['Chicken Eggs', 'Duck Eggs', 'Quail Eggs']
  fishTypes: string[];                // ['Salmon', 'Tuna', 'Indian Fish (Rohu, Katla)', 'Prawns']
  
  // Keep existing field for scheduling
  nonVegDays: string[];               // ['Monday', 'Wednesday', 'Friday']
}
```

### 2. Category Options

**Meat Types:**
- Chicken
- Mutton (Goat)
- Lamb
- Pork
- Turkey
- Duck

**Egg Types:**
- Chicken Eggs (most common)
- Duck Eggs
- Quail Eggs
- Country Eggs (Nattu Kozhi)

**Fish Types:**
- Salmon
- Tuna
- Indian Fish (Rohu, Katla, Hilsa)
- Prawns/Shrimp
- Crab
- Pomfret
- Sardines

### 3. UI Changes

**Location:** PatientForm.tsx - Food Preferences section

**Flow:**

```
┌─────────────────────────────────────────┐
│ Food Preference                         │
│ [Dropdown: Non-Vegetarian ▼]           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Non-Vegetarian Categories               │
│ ☑ Meat    ☑ Eggs    ☐ Fish             │
└─────────────────────────────────────────┘
        ↓                    ↓
┌─────────────────┐  ┌─────────────────┐
│ Meat Options    │  │ Egg Options     │
│ ☑ Chicken       │  │ ☑ Chicken Eggs  │
│ ☑ Mutton        │  │ ☐ Duck Eggs     │
│ ☐ Lamb          │  │ ☐ Quail Eggs    │
│ ☐ Pork          │  │ ☐ Country Eggs  │
│ ☐ Turkey        │  └─────────────────┘
│ ☐ Duck          │
└─────────────────┘
```

**UI Components:**

1. **Main Category Checkboxes:**
   - Three checkboxes in a row: Meat, Eggs, Fish
   - Styled as pill buttons (similar to kitchen preferences)
   - When unchecked, sub-options are hidden

2. **Sub-Option Checkboxes:**
   - Appear below the selected category
   - Grouped by category with a label
   - Styled as smaller pill buttons
   - Multiple selections allowed

3. **Non-Veg Days (Keep Existing):**
   - Still show day selection for scheduling
   - Positioned after category selections

### 4. Validation Logic

**Rules:**

1. When Food Preference = "Non-Vegetarian":
   - At least one category must be selected (Meat OR Eggs OR Fish)
   - If Meat is selected, at least one meat type must be chosen
   - If Eggs is selected, at least one egg type must be chosen
   - If Fish is selected, at least one fish type must be chosen

2. When switching from Non-Vegetarian to Vegetarian/Eggetarian:
   - Clear all non-veg categories and sub-options
   - Clear non-veg days

3. When unchecking a category:
   - Clear all sub-options for that category

### 5. API Prompt Changes

**Current Prompt:**
```
- Food Preference: non-vegetarian
- Non-Veg Days: Monday, Wednesday, Friday
```

**New Prompt:**
```
- Food Preference: non-vegetarian
- Non-Vegetarian Categories: Meat, Eggs
- Meat Types: Chicken, Mutton
- Egg Types: Chicken Eggs
- Fish Types: (none selected)
- Non-Veg Days: Monday, Wednesday, Friday

CRITICAL CONSTRAINTS:
- Only include Chicken and Mutton on non-veg days
- Only include Chicken Eggs on non-veg days
- NEVER include Fish, Lamb, Pork, Turkey, Duck, Duck Eggs, Quail Eggs
```

### 6. Implementation Steps

**Phase 1: Data Structure (15 min)**
1. Update `types.ts` with new fields
2. Update default values in `PatientForm.tsx`

**Phase 2: UI Components (30 min)**
1. Add main category checkboxes (Meat, Eggs, Fish)
2. Add conditional rendering for sub-options
3. Add sub-option checkboxes for each category
4. Style components consistently

**Phase 3: State Management (20 min)**
1. Add handlers for category selection
2. Add handlers for sub-option selection
3. Add auto-clear logic when categories are unchecked
4. Add validation on form submit

**Phase 4: API Integration (15 min)**
1. Update prompt builder in `api.ts`
2. Include new fields in patient profile
3. Add explicit constraints for AI

**Phase 5: Display & PDF (15 min)**
1. Update `MealPlanDisplay.tsx` to show selected categories
2. Update `pdf.ts` to include in patient data section
3. Update "Your Input Data" display

**Phase 6: Testing (20 min)**
1. Test all combinations of selections
2. Test validation logic
3. Test AI output with different preferences
4. Test PDF generation

**Total Estimated Time: ~2 hours**

---

## Detailed Implementation Plan

### Step 1: Update Types

**File:** `src/types.ts`

```typescript
export interface PatientProfile {
  // ... existing fields ...
  nonVegCategories: string[];
  meatTypes: string[];
  eggTypes: string[];
  fishTypes: string[];
}
```

### Step 2: Add Constants

**File:** `src/components/PatientForm.tsx`

```typescript
const MEAT_TYPES = [
  'Chicken',
  'Mutton (Goat)',
  'Lamb',
  'Pork',
  'Turkey',
  'Duck'
];

const EGG_TYPES = [
  'Chicken Eggs',
  'Duck Eggs',
  'Quail Eggs',
  'Country Eggs (Nattu Kozhi)'
];

const FISH_TYPES = [
  'Salmon',
  'Tuna',
  'Indian Fish (Rohu, Katla, Hilsa)',
  'Prawns/Shrimp',
  'Crab',
  'Pomfret',
  'Sardines'
];
```

### Step 3: Update Default State

```typescript
const [profile, setProfile] = useState<PatientProfile>({
  // ... existing defaults ...
  nonVegCategories: [],
  meatTypes: [],
  eggTypes: [],
  fishTypes: [],
});
```

### Step 4: Add UI Components

```tsx
{profile.foodPreference === 'non-vegetarian' && (
  <div className="mt-4 space-y-4">
    {/* Main Categories */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Non-Vegetarian Categories
      </label>
      <div className="flex flex-wrap gap-2">
        {['Meat', 'Eggs', 'Fish'].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggleNonVegCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
              profile.nonVegCategories.includes(category)
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>

    {/* Meat Sub-Options */}
    {profile.nonVegCategories.includes('Meat') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meat Types
        </label>
        <div className="flex flex-wrap gap-2">
          {MEAT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayItem('meatTypes', type)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                profile.meatTypes.includes(type)
                  ? 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Egg Sub-Options */}
    {profile.nonVegCategories.includes('Eggs') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Egg Types
        </label>
        <div className="flex flex-wrap gap-2">
          {EGG_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayItem('eggTypes', type)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                profile.eggTypes.includes(type)
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Fish Sub-Options */}
    {profile.nonVegCategories.includes('Fish') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fish & Seafood Types
        </label>
        <div className="flex flex-wrap gap-2">
          {FISH_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayItem('fishTypes', type)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                profile.fishTypes.includes(type)
                  ? 'bg-blue-100 border-blue-400 text-blue-800'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

### Step 5: Add Handlers

```typescript
const toggleNonVegCategory = (category: string) => {
  setProfile((prev) => {
    const categories = prev.nonVegCategories.includes(category)
      ? prev.nonVegCategories.filter((c) => c !== category)
      : [...prev.nonVegCategories, category];
    
    // Clear sub-options when category is unchecked
    const updates: any = { nonVegCategories: categories };
    if (!categories.includes('Meat')) updates.meatTypes = [];
    if (!categories.includes('Eggs')) updates.eggTypes = [];
    if (!categories.includes('Fish')) updates.fishTypes = [];
    
    return { ...prev, ...updates };
  });
};
```

### Step 6: Add Validation

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... existing validations ...
  
  // Validate non-veg selections
  if (profile.foodPreference === 'non-vegetarian') {
    if (profile.nonVegCategories.length === 0) {
      alert('Please select at least one non-vegetarian category (Meat, Eggs, or Fish)');
      return;
    }
    
    if (profile.nonVegCategories.includes('Meat') && profile.meatTypes.length === 0) {
      alert('Please select at least one meat type');
      return;
    }
    
    if (profile.nonVegCategories.includes('Eggs') && profile.eggTypes.length === 0) {
      alert('Please select at least one egg type');
      return;
    }
    
    if (profile.nonVegCategories.includes('Fish') && profile.fishTypes.length === 0) {
      alert('Please select at least one fish type');
      return;
    }
  }
  
  onSubmit(profile, apiKey);
};
```

### Step 7: Update API Prompt

```typescript
const nonVegDetails = profile.foodPreference === 'non-vegetarian' ? `
- Non-Vegetarian Categories: ${profile.nonVegCategories.join(', ')}
${profile.meatTypes.length > 0 ? `- Meat Types: ${profile.meatTypes.join(', ')}` : ''}
${profile.eggTypes.length > 0 ? `- Egg Types: ${profile.eggTypes.join(', ')}` : ''}
${profile.fishTypes.length > 0 ? `- Fish Types: ${profile.fishTypes.join(', ')}` : ''}
- Non-Veg Days: ${profile.nonVegDays.join(', ')}

CRITICAL NON-VEG CONSTRAINTS:
- ONLY include selected meat types: ${profile.meatTypes.join(', ') || 'None'}
- ONLY include selected egg types: ${profile.eggTypes.join(', ') || 'None'}
- ONLY include selected fish types: ${profile.fishTypes.join(', ') || 'None'}
- NEVER include unselected types
- Only include non-veg items on: ${profile.nonVegDays.join(', ')}
` : '';
```

---

## User Experience Flow

### Example Scenario 1: Chicken & Eggs Only

1. User selects "Non-Vegetarian"
2. User checks "Meat" and "Eggs" (not "Fish")
3. Under Meat: User selects "Chicken" only
4. Under Eggs: User selects "Chicken Eggs" only
5. User selects non-veg days: Monday, Wednesday, Friday

**Result:**
- AI generates meal plan with:
  - Chicken dishes on Mon/Wed/Fri
  - Chicken egg dishes on Mon/Wed/Fri
  - NO mutton, lamb, pork, fish, prawns
  - NO duck eggs, quail eggs

### Example Scenario 2: All Categories

1. User selects "Non-Vegetarian"
2. User checks all three: "Meat", "Eggs", "Fish"
3. Under Meat: User selects "Chicken", "Mutton"
4. Under Eggs: User selects "Chicken Eggs", "Duck Eggs"
5. Under Fish: User selects "Salmon", "Prawns"
6. User selects non-veg days: Tuesday, Thursday, Saturday

**Result:**
- AI generates meal plan with:
  - Chicken/Mutton on Tue/Thu/Sat
  - Chicken/Duck eggs on Tue/Thu/Sat
  - Salmon/Prawns on Tue/Thu/Sat
  - NO lamb, pork, turkey, duck meat
  - NO quail eggs
  - NO tuna, Indian fish, crab, pomfret

---

## Benefits

1. **Precision:** Users get exactly what they want
2. **Cultural Sensitivity:** Accommodates regional preferences (e.g., no beef/pork)
3. **Dietary Restrictions:** Allergies, religious restrictions
4. **Variety Control:** Users can limit or expand variety
5. **Clearer AI Instructions:** Explicit constraints reduce AI guesswork

---

## Testing Scenarios

1. ✅ Select only Meat (Chicken) → Verify no eggs/fish in plan
2. ✅ Select only Eggs → Verify no meat/fish in plan
3. ✅ Select only Fish → Verify no meat/eggs in plan
4. ✅ Select all categories → Verify all selected types appear
5. ✅ Uncheck category → Verify sub-options clear
6. ✅ Switch to Vegetarian → Verify all non-veg data clears
7. ✅ Submit without selecting any category → Verify validation error
8. ✅ Submit with category but no sub-options → Verify validation error

---

## Future Enhancements

1. **Preparation Methods:**
   - Fried, Grilled, Curried, Roasted, etc.
   
2. **Frequency Preferences:**
   - "Chicken 2x/week, Mutton 1x/week"
   
3. **Portion Size Preferences:**
   - Small/Medium/Large portions of meat
   
4. **Budget Considerations:**
   - Premium (Salmon, Lamb) vs Economy (Chicken, Eggs)
   
5. **Health Goals:**
   - Lean proteins only (Chicken breast, Fish)
   - High protein (Eggs, Chicken)

---

## Implementation Checklist

- [ ] Update `types.ts` with new fields
- [ ] Add constants for meat/egg/fish types
- [ ] Update default state in PatientForm
- [ ] Add category checkboxes UI
- [ ] Add sub-option checkboxes UI
- [ ] Add toggle handlers
- [ ] Add auto-clear logic
- [ ] Add validation on submit
- [ ] Update API prompt builder
- [ ] Update MealPlanDisplay to show selections
- [ ] Update PDF to include in patient data
- [ ] Test all scenarios
- [ ] Update documentation

---

## Estimated Timeline

- **Development:** 2 hours
- **Testing:** 30 minutes
- **Documentation:** 15 minutes
- **Total:** ~2.75 hours

---

## Questions for Clarification

1. Should we include regional fish varieties (e.g., Hilsa for Bengal, Pomfret for Maharashtra)?
2. Should egg types be by animal (Chicken/Duck/Quail) or by preparation (Boiled/Fried/Omelette)?
3. Should we add "Other" option for custom entries?
4. Should there be a "Select All" option for each category?

---

**Ready to implement?** Let me know if you'd like me to proceed with this plan or if you have any modifications!
