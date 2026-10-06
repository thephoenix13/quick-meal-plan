# Doctor's Meal Plan Generator

A web application for Doctor's Representatives to generate personalized 7-day Indian meal plans using AI. Enter a patient's health profile and get a customized meal plan tailored to their goals, dietary preferences, health conditions, and regional cuisine.

## Features

- **Comprehensive Patient Profile**: 19 input fields covering demographics, goals, health conditions, food preferences, and more
- **AI-Powered Meal Planning**: Generates personalized 7-day Indian meal plans using Claude AI
- **Strict Constraint Enforcement**: Respects allergies, foods to avoid, dietary preferences, and health conditions
- **Detailed Nutrition Info**: Each meal includes calories, protein, carbs, fat, fibre, and explanation
- **PDF Export**: Download the complete meal plan as a formatted PDF
- **Fast Generation**: Uses Claude Haiku 4.5 for quick response times (5-10 seconds)
- **No Data Storage**: All data is session-only, nothing is stored permanently

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **PDF Generation**: jsPDF + jspdf-autotable
- **AI Backend**: Anthropic API (Claude Haiku 4.5)

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd doctors-meal-plan-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Deploy to Azure Static Web Apps

This app is optimized for Azure Static Web Apps deployment with GitHub Actions CI/CD.

#### Step-by-Step Guide

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Azure Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → Search for "Static Web App"
   - Click "Create"

3. **Configure the Static Web App**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Give your app a name (e.g., `doctors-meal-plan`)
   - **Hosting Plan**: Free (recommended for testing)
   - **Region**: Choose closest to your users
   - **Source**: GitHub
   - **Sign in with GitHub** and authorize Azure
   - **Organization**: Select your GitHub username/org
   - **Repository**: Select your repo
   - **Branch**: main
   - **Build Presets**: Select "React" (or leave as custom)
   - **App location**: `/`
   - **Api location**: (leave empty)
   - **Output location**: `dist`

4. **Review and Create**
   - Click "Review + create"
   - Click "Create"
   - Azure will automatically:
     - Create a GitHub Actions workflow
     - Build your app
     - Deploy it to a `.azurestaticapps.net` URL

5. **Get Your Deployment URL**
   - Once deployment completes, you'll get a URL like:
     `https://<random-name>.azurestaticapps.net`
   - Your app is now live!

6. **Configure API Key** (Optional)
   - Users will need to enter their own Anthropic API key in the app
   - Or you can set up Azure Key Vault for centralized key management

#### Using the Included GitHub Actions Workflow

The repository includes a pre-configured GitHub Actions workflow at `.github/workflows/azure-static-web-apps.yml`. When you create the Static Web App in Azure, it will:

1. Add a secret to your GitHub repo: `AZURE_STATIC_WEB_APPS_API_TOKEN`
2. Automatically trigger deployments on push to `main`
3. Create preview deployments for pull requests

#### Custom Domain (Optional)

1. In Azure Portal, go to your Static Web App
2. Click "Custom domains" in the left menu
3. Click "+ Add"
4. Follow the instructions to add your domain
5. Azure provides free SSL certificates

### Alternative Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

#### GitHub Pages
1. Install `gh-pages`: `npm install -D gh-pages`
2. Add to package.json: `"deploy": "gh-pages -d dist"`
3. Run: `npm run build && npm run deploy`

## Security Notes

- **API Key Handling**: Users enter their Anthropic API key directly in the browser. This is suitable for personal use but not recommended for production with multiple users.
- **CORS**: The app uses `anthropic-dangerous-direct-browser-access` header to enable browser-based API calls.
- **No Data Storage**: All patient data is session-only and never stored or transmitted to any backend.

## Usage

1. Enter your Anthropic API key (get one from [console.anthropic.com](https://console.anthropic.com))
2. Fill in the patient's health profile
3. Click "Generate 7-Day Meal Plan"
4. Review the generated plan
5. Download as PDF or regenerate if needed

## Input Fields

The app accepts 19 input fields:

**Basic Info**: Name, Age, Height, Current Weight, Goal Weight, Water Target

**Goals & Activity**: Primary Goal, Hormonal Phase, Activity Level, Goal Timeline

**Health**: Health Conditions (multi-select)

**Food Preferences**: Food Preference, Non-Veg Days, Kitchen Preferences

**Regional**: Indian Region (21 regions), Pantry Staples

**Restrictions**: Allergies, Foods to Avoid

**Structure**: Meals Per Day

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational and professional use by Doctor's Representatives.

## Disclaimer

This tool generates suggested meal plans and does not constitute medical advice. Always consult with qualified healthcare professionals before making dietary changes.

## Support

For issues or questions, please open an issue on GitHub.
