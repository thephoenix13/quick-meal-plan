# Protein Calculation & Eggetarian Updates

## Summary of Changes

This document describes the recent updates to the meal plan generator regarding protein calculation methodology and eggetarian diet restrictions.

---

## 1. Eggetarian Diet Clarification

### What Changed
- **Before**: Eggetarian was not clearly defined, leading to potential confusion
- **After**: Eggetarian now explicitly means **ONLY eggs as animal protein** - NO meat, NO fish, NO chicken, NO mutton

### Implementation Details

#### In the Form (PatientForm.tsx)
- Updated dropdown options to clearly describe each diet type:
  - **Vegetarian**: "No eggs, no meat, no fish"
  - **Non-Vegetarian**: "Eggs, meat, fish allowed"
  - **Eggetarian**: "Only eggs - NO meat, NO fish"

#### In the AI Prompt (api.ts)
- Added explicit eggetarian clarification when this option is selected:
  ```
  EGGETARIAN RESTRICTION: Include ONLY eggs as animal protein. 
  NO fish, chicken, mutton, or any other meat. Eggs are allowed.
  ```

- Updated food preference constraints to be explicit:
  ```
  * Vegetarian: No eggs, no meat, no fish
  * Eggetarian: Eggs allowed, but NO meat, NO fish, NO chicken, NO mutton - ONLY eggs as animal protein
  * Non-vegetarian: Meat and fish allowed on specified "Non-Veg Days" only
  ```

### Why This Matters
- Prevents AI from including fish/chicken in eggetarian meal plans
- Makes expectations clear to users selecting this option
- Ensures generated meal plans respect the user's dietary restrictions

---

## 2. Protein Calculation Methodology

### What Changed
- **Before**: Protein targets were estimated by the AI without a standardized formula
- **After**: Protein targets are calculated using a clinical formula based on adjusted body weight

### The Formula

#### Step 1: Calculate Ideal Body Weight (IBW)
```
IBW = 22 × (height in meters)²
```
Uses BMI of 22 as the ideal reference point.

**Example:**
- Height: 165 cm (1.65 m)
- IBW = 22 × (1.65)² = 22 × 2.7225 = **59.9 kg**

#### Step 2: Calculate Excess Weight
```
Excess Weight = Current Weight - IBW
```
If current weight is less than IBW, excess weight is 0.

**Example:**
- Current Weight: 80 kg
- IBW: 59.9 kg
- Excess Weight = 80 - 59.9 = **20.1 kg**

#### Step 3: Calculate Adjusted Body Weight (AdjBW)
```
AdjBW = IBW + (0.25 × Excess Weight)
```
This accounts for the fact that excess weight is not fully metabolically active.

**Example:**
- AdjBW = 59.9 + (0.25 × 20.1) = 59.9 + 5.025 = **64.9 kg**

#### Step 4: Determine Protein Factor
Based on activity level:
- **Sedentary**: 0.8 g/kg
- **Lightly active**: 1.0 g/kg
- **Moderately active**: 1.2 g/kg
- **Active**: 1.4 g/kg
- **Very active**: 1.6 g/kg

#### Step 5: Adjust for Goals
- **Weight loss**: +0.2 g/kg (higher protein for satiety and muscle preservation)
- **More energy / Overall wellness**: +0.1 g/kg
- **Other goals**: No adjustment

#### Step 6: Calculate Final Protein Target
```
Daily Protein Target = AdjBW × Protein Factor
```

**Example:**
- AdjBW: 64.9 kg
- Activity: Moderately active (1.2 g/kg)
- Goal: Weight loss (+0.2 g/kg)
- Final factor: 1.2 + 0.2 = 1.4 g/kg
- **Daily Protein Target = 64.9 × 1.4 = 91g per day**

### Implementation Details

#### In the Code (api.ts)
```typescript
// Calculate Ideal Body Weight (IBW) using BMI-based formula
function calculateIBW(heightCm: number): number {
  const heightM = heightCm / 100;
  return 22 * heightM * heightM;
}

// Calculate protein target based on adjusted body weight
function calculateProteinTarget(profile: PatientProfile): number {
  const ibw = calculateIBW(profile.height);
  const excessWeight = Math.max(0, profile.currentWeight - ibw);
  const adjustedBW = ibw + (0.25 * excessWeight);
  
  // Protein factor based on activity level
  let proteinFactor = 1.0;
  switch (profile.activityLevel) {
    case 'sedentary': proteinFactor = 0.8; break;
    case 'lightly active': proteinFactor = 1.0; break;
    case 'moderately active': proteinFactor = 1.2; break;
    case 'active': proteinFactor = 1.4; break;
    case 'very active': proteinFactor = 1.6; break;
  }
  
  // Adjust for goals
  if (profile.primaryGoal === 'weight loss') {
    proteinFactor += 0.2;
  } else if (profile.primaryGoal === 'more energy' || profile.primaryGoal === 'overall wellness') {
    proteinFactor += 0.1;
  }
  
  return Math.round(adjustedBW * proteinFactor);
}
```

#### In the AI Prompt
The calculated values are included in the prompt:
```
PROTEIN CALCULATION (MUST FOLLOW):
- Ideal Body Weight (IBW): 59.9 kg
- Excess Weight: 20.1 kg
- Adjusted Body Weight (AdjBW): 64.9 kg
- Daily Protein Target: 91 grams per day
- Distribute protein evenly across all meals to meet this daily target
```

And in the requirements:
```
4. PROTEIN TARGET (CRITICAL):
   - Daily protein target is 91 grams
   - Distribute protein evenly across all 4 meals
   - Each meal should contribute approximately 23g of protein
   - Use high-protein ingredients: dal, paneer, eggs, Greek yogurt, nuts, seeds, legumes, soy
   - Ensure each meal's protein content adds up to meet the daily target
```

#### In the User Interface (PatientForm.tsx)
Users now see their estimated daily protein target in real-time as they fill out the form:
```
Estimated Daily Protein: 91g
```

This calculation updates dynamically as users change:
- Height
- Current weight
- Activity level
- Primary goal

### Why This Methodology?

1. **Clinical Accuracy**: Uses adjusted body weight, which is the standard clinical approach for overweight/obese patients
2. **Prevents Overestimation**: Using actual body weight for overweight patients would result in excessive protein targets
3. **Personalized**: Accounts for activity level and goals
4. **Evidence-Based**: The 0.25 factor for adjusted body weight is widely used in clinical nutrition

### Example Scenarios

#### Scenario 1: Overweight Patient
- Height: 160 cm
- Current Weight: 85 kg
- Activity: Moderately active
- Goal: Weight loss

**Calculation:**
- IBW = 22 × (1.6)² = 56.3 kg
- Excess = 85 - 56.3 = 28.7 kg
- AdjBW = 56.3 + (0.25 × 28.7) = 63.5 kg
- Protein factor = 1.2 + 0.2 = 1.4 g/kg
- **Daily protein = 63.5 × 1.4 = 89g**

#### Scenario 2: Normal Weight Patient
- Height: 165 cm
- Current Weight: 60 kg
- Activity: Lightly active
- Goal: Hormonal balance

**Calculation:**
- IBW = 22 × (1.65)² = 59.9 kg
- Excess = 0 kg (current weight < IBW)
- AdjBW = 59.9 + 0 = 59.9 kg
- Protein factor = 1.0 g/kg (no adjustment for hormonal balance)
- **Daily protein = 59.9 × 1.0 = 60g**

#### Scenario 3: Very Active Patient
- Height: 170 cm
- Current Weight: 70 kg
- Activity: Very active
- Goal: More energy

**Calculation:**
- IBW = 22 × (1.7)² = 63.6 kg
- Excess = 70 - 63.6 = 6.4 kg
- AdjBW = 63.6 + (0.25 × 6.4) = 65.2 kg
- Protein factor = 1.6 + 0.1 = 1.7 g/kg
- **Daily protein = 65.2 × 1.7 = 111g**

---

## 3. Impact on Generated Meal Plans

### Before These Updates
- Protein targets were vague and inconsistent
- Eggetarian plans sometimes included fish/chicken
- No transparency in how protein targets were determined

### After These Updates
- **Precise protein targets** calculated using clinical formula
- **Clear eggetarian restrictions** - only eggs, no other animal protein
- **Transparent calculations** shown to users in real-time
- **Even protein distribution** across all meals
- **High-protein ingredient suggestions** provided to the AI

### Example Meal Plan Output

For a patient with 91g daily protein target and 4 meals per day:

**Early Morning (23g protein):**
- Moong dal chilla (2 pieces) - 12g protein
- Greek yogurt (100g) - 10g protein
- Almonds (10 pieces) - 3g protein

**Breakfast (23g protein):**
- Vegetable poha with peanuts - 8g protein
- 2 boiled eggs - 12g protein
- Buttermilk (200ml) - 6g protein

**Lunch (23g protein):**
- 2 multigrain rotis - 8g protein
- Paneer bhurji (100g) - 18g protein
- Dal (1 bowl) - 7g protein

**Snack (22g protein):**
- Roasted chana (50g) - 10g protein
- Protein shake with milk - 12g protein

**Total: 91g protein** ✅

---

## 4. Benefits

### For Users
1. **Clarity**: Understand exactly how their protein target is calculated
2. **Accuracy**: Clinical formula ensures appropriate protein levels
3. **Transparency**: See calculations in real-time as they fill the form
4. **Confidence**: Know that eggetarian means ONLY eggs, no confusion

### For Healthcare Professionals
1. **Evidence-based**: Uses accepted clinical methodology
2. **Defensible**: Can explain the calculation to patients
3. **Safe**: Prevents excessive protein intake in overweight patients
4. **Personalized**: Accounts for activity level and goals

### For the AI
1. **Clear targets**: Specific numbers to work towards
2. **Even distribution**: Knows how much protein per meal
3. **Ingredient guidance**: Suggestions for high-protein foods
4. **Validation**: Can verify total protein meets target

---

## 5. Technical Implementation

### Files Modified
1. **src/utils/api.ts**
   - Added `calculateIBW()` function
   - Added `calculateProteinTarget()` function
   - Updated prompt to include protein calculations
   - Added eggetarian clarification
   - Updated food preference constraints

2. **src/components/PatientForm.tsx**
   - Updated dropdown labels for clarity
   - Added real-time protein target display
   - Added protein calculation logic for UI

### No Breaking Changes
- All existing functionality preserved
- Backward compatible with existing meal plans
- No changes to data structures or types

---

## 6. Future Enhancements

### Potential Improvements
1. **Gender-specific IBW**: Use different formulas for male/female patients
2. **Age adjustments**: Modify protein factor for elderly patients
3. **Medical conditions**: Adjust for kidney disease, diabetes, etc.
4. **Protein quality**: Consider amino acid profiles and protein digestibility
5. **Timing**: Optimize protein distribution for muscle synthesis (leucine threshold)

---

## 7. References

1. **Adjusted Body Weight Formula**: 
   - Used in clinical nutrition for overweight/obese patients
   - Standard practice in dietetics

2. **Protein Requirements**:
   - WHO/FAO/UNU recommendations
   - ACSM guidelines for active individuals
   - Clinical nutrition textbooks

3. **BMI-based IBW**:
   - Alternative to Devine formula
   - More appropriate for diverse populations
   - Uses BMI of 22 as healthy reference

---

## 8. Testing Recommendations

### Test Cases
1. **Eggetarian diet**: Verify no meat/fish in generated plans
2. **Protein calculation**: Verify calculations match manual computation
3. **Edge cases**: 
   - Very underweight patients (excess weight = 0)
   - Very overweight patients (high excess weight)
   - Different activity levels
   - Different goals

### Validation
- Compare AI-generated protein totals with calculated targets
- Verify even distribution across meals
- Check that high-protein ingredients are used appropriately

---

## Conclusion

These updates significantly improve the accuracy and clarity of the meal plan generator:

✅ **Eggetarian diets** now correctly include only eggs as animal protein  
✅ **Protein targets** use clinical adjusted body weight methodology  
✅ **Transparency** with real-time calculations shown to users  
✅ **Precision** with specific gram targets distributed across meals  
✅ **Safety** by preventing excessive protein in overweight patients  

The implementation is robust, evidence-based, and provides clear value to both users and healthcare professionals.
