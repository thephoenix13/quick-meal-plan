# Fix Guide: API Location Locked & 405 Error

## Problem
1. **API Location field is locked** in Azure Portal
2. **405 Method Not Allowed** error when calling the API

## Root Cause
When using GitHub Actions for deployment, Azure locks the build configuration because it's controlled by the workflow file. The API needs to be properly configured in the workflow.

## Solution: Recreate Static Web App with Correct Settings

### Step 1: Delete Existing Static Web App

1. Go to Azure Portal → Your Static Web App
2. Click **"Delete"** at the top
3. Confirm deletion

### Step 2: Push Updated Code to GitHub

```bash
git add .
git commit -m "Fix API configuration for Azure Static Web Apps"
git push origin main
```

### Step 3: Create New Static Web App

1. Go to Azure Portal → Create "Static Web App"
2. **CRITICAL SETTINGS:**

| Setting | Value | Notes |
|---------|-------|-------|
| **App location** | `/` | Frontend root |
| **Api location** | `api` | ⚠️ MUST be set here |
| **Output location** | `dist` | Build output folder |

3. Complete the creation wizard
4. Azure will automatically:
   - Detect the `api/` folder
   - Build and deploy the Azure Function
   - Set up the `/api/*` routes

### Step 4: Add Environment Variable

1. Go to your new Static Web App
2. Click **"Environment variables"** (left menu)
3. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
4. Click **"Save"**

### Step 5: Wait for Deployment

- First deployment: ~5-10 minutes
- Check GitHub Actions tab for progress
- Once complete, your app will be live with working API

## Alternative: If You Can't Delete the App

If you can't delete the existing app, try this:

### Option A: Update via Azure CLI

```bash
# Install Azure CLI if not installed
# Login to Azure
az login

# Update the Static Web App configuration
az staticwebapp update \
  --name your-app-name \
  --resource-group your-resource-group \
  --api-location "api"
```

### Option B: Manual Workflow Trigger

1. Go to GitHub → Your repo → Actions tab
2. Click on the failed workflow run
3. Click **"Re-run jobs"**
4. Wait for completion

## Verification

After deployment, test the API:

```bash
curl -X POST https://your-app.azurestaticapps.net/api/generate-meal-plan \
  -H "Content-Type: application/json" \
  -d '{"profile":{"name":"Test","age":30,"height":160,"currentWeight":65,"goalWeight":60,"primaryGoal":"weight loss","hormonalPhase":"regular cycle","activityLevel":"moderately active","goalTimeline":"6 months","healthConditions":[],"foodPreference":"vegetarian","nonVegDays":[],"kitchenPreferences":[],"indianRegion":"North Indian (Punjab, Delhi, UP)","pantryStaples":["Atta (whole wheat flour)","Rice","Dal (lentils)"],"allergies":"","foodsToAvoid":"","mealsPerDay":4,"waterTarget":8}}'
```

Expected response: `200 OK` with meal plan JSON

## Troubleshooting

### Still getting 405?

1. **Check GitHub Actions logs:**
   - Go to GitHub → Actions → Click latest run
   - Look for "Deploy to Azure Static Web Apps" step
   - Check if API was deployed successfully

2. **Verify API deployment:**
   - Azure Portal → Your Static Web App
   - Click **"API Management"** or **"Functions"** (left menu)
   - You should see `generateMealPlan` function listed

3. **Check environment variable:**
   - Azure Portal → Environment variables
   - Verify `ANTHROPIC_API_KEY` is set
   - Try redeploying after adding it

### Function not showing up?

The Azure Function might not be recognized. Ensure:
- `api/package.json` exists
- `api/src/functions/generateMealPlan.ts` exists
- Workflow has `api_location: 'api'`

### Still locked fields?

This is normal when using GitHub Actions. The workflow controls the build config. You can only change:
- Environment variables
- Custom domains
- Authentication settings

Build settings (app/api/output location) are controlled by the GitHub Actions workflow.

## Expected Architecture After Fix

```
User Browser
    ↓
POST /api/generate-meal-plan
    ↓
Azure Static Web App (Frontend: dist/)
    ↓
Azure Function (api/src/functions/generateMealPlan.ts)
    ↓ (uses ANTHROPIC_API_KEY from env)
Anthropic API
    ↓
Returns meal plan JSON
```

## Cost Impact

- **Azure Functions**: Free tier (1M requests/month)
- **Static Web Apps**: Free tier (100GB bandwidth)
- **Anthropic API**: ~$0.01-0.05 per meal plan

Total: Very minimal, mostly Anthropic API usage.

## Next Steps

1. ✅ Delete existing Static Web App
2. ✅ Push updated code
3. ✅ Create new Static Web App with `api` location
4. ✅ Add `ANTHROPIC_API_KEY` environment variable
5. ✅ Test the app
6. ✅ Share with users

Your app will now work without users needing to enter an API key!
