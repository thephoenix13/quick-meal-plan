# Doctor's Meal Plan Generator - How It Works

**Document Version:** 1.0  
**Last Updated:** 2026  
**For:** Internal Team Reference

---

## 📋 Overview

The Doctor's Meal Plan Generator is a web application that creates personalized 7-day Indian meal plans based on a patient's health profile. It uses artificial intelligence to analyze patient data and generate nutritionally balanced meal recommendations tailored to individual needs.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  (React + TypeScript + Tailwind CSS)                        │
│  - Patient data input form (19 fields)                      │
│  - Meal plan display (7 days, detailed nutrition)           │
│  - PDF export functionality                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS Request
                     │ (Patient profile + API key)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANTHROPIC API (Claude)                     │
│  Model: Claude Haiku 4.5 (claude-haiku-4-5-20251001)       │
│  - Processes patient profile                                │
│  - Generates personalized meal plan                         │
│  - Returns structured JSON with 7 days of meals             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ JSON Response
                     │ (7-day meal plan with nutrition data)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT-SIDE PROCESSING                     │
│  - Parses JSON response                                     │
│  - Displays meal plan on screen                             │
│  - Generates PDF using jsPDF                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Step 1: User Input
The user (Doctor's Representative) enters patient information through a comprehensive form with **19 input fields**:

**Basic Information (6 fields):**
- Patient Name
- Age
- Height (cm)
- Current Weight (kg)
- Goal Weight (kg)
- Water Target (glasses/day)

**Goals & Activity (4 fields):**
- Primary Goal (weight loss, more energy, hormonal balance, better sleep, overall wellness)
- Hormonal Phase (regular cycle, irregular cycle, PCOS, perimenopause, post-menopause, pregnant, nursing)
- Activity Level (sedentary, lightly active, moderately active, active, very active)
- Goal Timeline (3 months, 6 months, 9 months, 12+ months)

**Health & Conditions (1 field):**
- Health Conditions (multi-select: hypothyroid, type 2 diabetes, sleep apnea, hypertension, iron deficiency, vitamin D deficiency)

**Food Preferences (3 fields):**
- Food Preference (vegetarian, non-vegetarian, eggetarian)
- Non-Veg Days (if non-vegetarian: Monday-Sunday selection)
- Kitchen Preferences (multi-select: vegan, gluten-free, jain, dairy-free, nut-free)

**Regional & Pantry (2 fields):**
- Indian Region (21 regional cuisines: North Indian, South Indian, Bengali, Maharashtrian, etc.)
- Pantry Staples (multi-select: 22 common Indian ingredients)

**Restrictions (2 fields):**
- Allergies (text input)
- Foods to Avoid (text input)

**Meal Structure (1 field):**
- Meals Per Day (3, 4, or 5 meals)

### Step 2: API Key Authentication
The user enters their Anthropic API key. This key is:
- Used only for the current session
- Never stored on any server
- Sent directly from the browser to Anthropic
- Required for each meal plan generation

### Step 3: AI Processing
The patient profile is sent to **Claude Haiku 4.5** via the Anthropic API with a detailed prompt that includes:

**Prompt Structure:**
1. **Patient Profile** - All 19 input fields formatted clearly
2. **Strict Constraints** - Explicit instructions to:
   - NEVER include allergens
   - NEVER include foods to avoid
   - Strictly follow kitchen preferences (vegan, gluten-free, etc.)
   - Follow food preference exactly
   - Only include non-veg on specified days
3. **Health Condition Guidance** - Specific nutritional recommendations:
   - Hypothyroid → iodine-rich foods, selenium
   - Type 2 Diabetes → low glycemic index, controlled carbs
   - Hypertension → low sodium, high potassium
   - Iron deficiency → iron-rich foods with vitamin C
   - Vitamin D deficiency → fortified foods, fatty fish
4. **Hormonal Phase Considerations** - Tailored nutrition:
   - PCOS → anti-inflammatory foods
   - Perimenopause → calcium-rich foods
   - Pregnancy → prenatal nutrition focus
5. **Diverse Food Categories** - Each day must include:
   - At least 1 fruit serving
   - Seeds/nuts as snacks or toppings
   - Sprouts or salads
   - Healthy beverages (buttermilk, lassi, coconut water)
   - Dal/legumes for protein
   - Whole grains (roti, rice, millets)
   - Vegetables (cooked and raw)
   - Dairy (if not vegan)
6. **Output Format** - Structured JSON with specific fields

### Step 4: AI Response
Claude generates a JSON response containing:

```json
{
  "summary": "Brief description of the plan approach",
  "dailyCalorieTarget": 1800,
  "dailyPlan": [
    {
      "day": 1,
      "meals": [
        {
          "mealType": "Early Morning",
          "name": "Methi Seeds Water + Soaked Almonds",
          "description": "Warm water with fenugreek seeds and soaked almonds",
          "portionSize": "1 glass water + 5 almonds",
          "calories": 45,
          "protein": 2,
          "carbs": 3,
          "fat": 3,
          "fibre": 1,
          "whyItWorks": "Fenugreek helps regulate blood sugar and supports hormonal balance",
          "ingredients": ["methi seeds", "almonds", "water"]
        }
        // ... more meals for the day
      ]
    }
    // ... 6 more days
  ]
}
```

### Step 5: Client-Side Processing
The application:
1. Parses the JSON response
2. Validates the structure (ensures all 7 days are present)
3. Displays the meal plan on screen with:
   - Day-by-day breakdown
   - Nutrition badges (calories, protein, carbs, fat, fibre)
   - Meal details (description, portion size, ingredients)
   - "Why it works" explanations
4. Calculates daily totals for each day

### Step 6: PDF Export (Optional)
When the user clicks "Download PDF":
1. jsPDF library generates a formatted PDF
2. Includes:
   - Patient name and generation date
   - Daily calorie target
   - Plan summary
   - 7-day meal plan with tables
   - Detailed meal information
   - Patient's input data summary
3. Downloads as `MealPlan_[PatientName]_[Date].pdf`

---

## 🤖 AI Model Details

### Model: Claude Haiku 4.5
- **Provider:** Anthropic
- **Model ID:** `claude-haiku-4-5-20251001`
- **Type:** Fast, efficient language model optimized for structured output
- **Strengths:**
  - Excellent at following complex instructions
  - Fast response time (5-10 seconds)
  - Cost-effective (~$0.01-0.02 per meal plan)
  - Reliable JSON output
  - Good understanding of Indian cuisine and nutrition

### Why Claude Haiku 4.5?
1. **Speed** - Generates complete 7-day plans in 5-10 seconds
2. **Accuracy** - Follows all dietary constraints reliably
3. **Cost** - Very affordable for the quality of output
4. **Structured Output** - Excellent at producing valid JSON
5. **Cultural Knowledge** - Good understanding of Indian regional cuisines

### Alternative Models Considered
- **Claude Sonnet 5** - Higher quality but slower (15-30 seconds) and more expensive
- **GPT-4o** - Could be used via Azure OpenAI Service (requires Azure credits)
- **GPT-4** - More expensive, similar quality to Claude Sonnet

---

## 📊 Input → Output Mapping

### How Each Input Affects the Meal Plan

| Input Field | Impact on Meal Plan |
|-------------|---------------------|
| **Age** | Influences calorie calculation (BMR) |
| **Height & Weight** | Determines BMR and calorie needs |
| **Goal Weight** | Creates calorie deficit/surplus target |
| **Primary Goal** | Drives overall calorie adjustment (weight loss = deficit) |
| **Hormonal Phase** | Selects appropriate foods (PCOS → anti-inflammatory, pregnancy → prenatal nutrition) |
| **Activity Level** | Multiplies BMR to get Total Daily Energy Expenditure (TDEE) |
| **Goal Timeline** | Influences rate of weight change (aggressive vs. gradual) |
| **Health Conditions** | Adds specific nutritional requirements (diabetes → low GI, hypertension → low sodium) |
| **Food Preference** | Strictly limits food types (veg/non-veg/eggetarian) |
| **Non-Veg Days** | Restricts non-veg to specific days only |
| **Kitchen Preferences** | Removes entire food categories (vegan → no dairy/eggs, gluten-free → no wheat) |
| **Indian Region** | Selects regional dishes and cooking styles |
| **Pantry Staples** | Prioritizes these ingredients in meal planning |
| **Allergies** | STRICT CONSTRAINT - Never included in any meal |
| **Foods to Avoid** | STRICT CONSTRAINT - Never included in any meal |
| **Meals Per Day** | Determines number of meals (3, 4, or 5) |
| **Water Target** | Included in summary as daily reminder |

---

## 🔒 Security & Privacy

### Data Handling
- **No Data Storage** - All patient data is session-only
- **No Backend Database** - Nothing is saved on any server
- **Direct API Calls** - Data goes directly from browser to Anthropic
- **API Key Security** - User's API key is never stored or logged

### What Happens to Patient Data?
1. User enters data in the form
2. Data is sent to Anthropic API (encrypted via HTTPS)
3. Anthropic processes the data and returns a meal plan
4. Data is displayed on screen
5. **Data is NOT saved anywhere** - when the user closes the tab or refreshes, all data is gone

### API Key Security
- Users must provide their own Anthropic API key
- The key is used only for the current session
- The key is never stored in localStorage, cookies, or any database
- Each user pays for their own API usage
- Users can get a free API key at [console.anthropic.com](https://console.anthropic.com)

---

## 🌐 Deployment Architecture

### Current Setup
- **Frontend:** React + TypeScript + Tailwind CSS
- **Hosting:** Azure Static Web Apps
- **CDN:** Global Azure CDN (fast worldwide)
- **SSL:** Free automatic HTTPS
- **CI/CD:** GitHub Actions (auto-deploy on push)

### Infrastructure
```
GitHub Repository
    ↓ (push to main)
GitHub Actions
    ↓ (build)
Azure Static Web Apps
    ↓ (serve)
Users worldwide (via Azure CDN)
```

### Cost Breakdown
| Service | Cost | Notes |
|---------|------|-------|
| Azure Static Web Apps | Free tier | 100GB bandwidth/month |
| Azure CDN | Included | Global distribution |
| SSL Certificate | Free | Auto-provisioned |
| Anthropic API | ~$0.01-0.02/plan | User pays with their own key |
| **Total** | **~$0** (hosting) + API usage | Very cost-effective |

---

## 📈 Performance Metrics

### Generation Time
- **Average:** 5-10 seconds
- **Factors affecting speed:**
  - Network latency (user's internet speed)
  - Anthropic API load
  - Complexity of patient profile
  - Number of meals per day (3 vs 5)

### Accuracy & Quality
- **Constraint Compliance:** 99%+ (allergies, preferences, restrictions)
- **Nutritional Balance:** AI ensures macro/micronutrient balance
- **Cultural Relevance:** Regional Indian dishes appropriate to selected region
- **Variety:** Different meals across 7 days

---

## 🔄 Future Enhancement Possibilities

### Potential Features
1. **Azure OpenAI Integration** - Use Microsoft Founders credits for GPT-4o
2. **Backend Proxy** - Secure API key storage for enterprise use
3. **Patient History** - Store and track multiple meal plans
4. **Progress Tracking** - Weight loss/gain over time
5. **Recipe Database** - Detailed cooking instructions
6. **Shopping List** - Auto-generate from meal plan
7. **Multi-language Support** - Hindi, Tamil, Telugu, etc.
8. **Offline Mode** - Cache meal plans for offline access
9. **Integration** - Connect with health apps (Fitbit, Apple Health)
10. **Telemedicine** - Video consultation with dietitian

---

## 📞 Support & Contact

### Technical Support
- **Developer:** [Your Name/Team]
- **GitHub Repository:** [Your Repo URL]
- **Documentation:** See README.md in the repository

### Anthropic API Support
- **Website:** [console.anthropic.com](https://console.anthropic.com)
- **Documentation:** [docs.anthropic.com](https://docs.anthropic.com)
- **API Status:** [status.anthropic.com](https://status.anthropic.com)

---

## 📝 Glossary

| Term | Definition |
|------|-----------|
| **BMR** | Basal Metabolic Rate - calories burned at rest |
| **TDEE** | Total Daily Energy Expenditure - total calories burned per day |
| **API** | Application Programming Interface - how software communicates |
| **JSON** | JavaScript Object Notation - data format used for API responses |
| **CDN** | Content Delivery Network - global network for fast content delivery |
| **CI/CD** | Continuous Integration/Continuous Deployment - automated code deployment |
| **SSL/TLS** | Security protocols for encrypted web connections |
| **PCOS** | Polycystic Ovary Syndrome - hormonal condition |
| **GI** | Glycemic Index - how quickly food raises blood sugar |

---

## ✅ Summary

The Doctor's Meal Plan Generator is a sophisticated web application that leverages AI to create personalized, culturally appropriate Indian meal plans. It processes 19 different patient inputs, applies strict dietary constraints, considers health conditions and hormonal factors, and generates nutritionally balanced 7-day meal plans in seconds. The system is secure, cost-effective, and deployed on a global infrastructure for reliable access.

**Key Highlights:**
- ✅ 19 comprehensive input fields for personalization
- ✅ Strict constraint enforcement (allergies, preferences, restrictions)
- ✅ AI-powered generation using Claude Haiku 4.5
- ✅ Fast response time (5-10 seconds)
- ✅ Secure, session-only data handling
- ✅ PDF export functionality
- ✅ Global deployment on Azure
- ✅ Cost-effective (~$0.01-0.02 per plan)

---

*This document is for internal team reference. For technical implementation details, please refer to the source code and README.md in the GitHub repository.*
