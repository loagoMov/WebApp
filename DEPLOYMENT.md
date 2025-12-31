# GitHub Pages Deployment Guide

This guide explains how to deploy the CoverBots frontend to GitHub Pages.

## 🌐 Live URL

Once deployed, your site will be available at:
**https://loagoMov.github.io/WebApp/**

## 📋 Prerequisites

Before deploying, you must configure GitHub repository secrets for your environment variables.

### Required GitHub Secrets

Go to your repository on GitHub: **Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

#### Auth0 Configuration
- `VITE_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-domain.auth0.com`)
- `VITE_AUTH0_CLIENT_ID` - Your Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Your Auth0 API audience

#### API Configuration
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.com` or Firebase Cloud Functions URL)

#### Stripe Configuration
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)

#### Firebase Configuration
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain (e.g., `your-app.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)

## 🚀 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

The GitHub Actions workflow will automatically deploy when you push to the `main` branch.

1. **Enable GitHub Pages**:
   - Go to **Settings → Pages**
   - Under "Build and deployment":
     - Source: **Deploy from a branch**
     - Branch: **gh-pages** / **(root)**
   - Click **Save**

2. **Add all required secrets** (see list above)

3. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

4. **Monitor deployment**:
   - Go to **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once complete, visit https://loagoMov.github.io/WebApp/

### Method 2: Manual Deployment

You can also deploy manually from your local machine:

```bash
cd frontend
npm run deploy:gh-pages
```

Note: This requires the `gh-pages` package and proper git authentication.

## 🔧 Configuration Details

### Vite Configuration
The `vite.config.js` has been updated with:
```javascript
base: '/WebApp/'
```
This ensures all assets load correctly from the GitHub Pages subdirectory.

### GitHub Actions Workflow
The workflow (`.github/workflows/deploy-gh-pages.yml`) automatically:
1. Checks out your code
2. Installs dependencies
3. Builds the app with environment variables from secrets
4. Deploys to the `gh-pages` branch

## 🐛 Troubleshooting

### Site shows 404
- Verify GitHub Pages is enabled in repository settings
- Ensure the `gh-pages` branch exists
- Check that the workflow completed successfully

### Assets not loading (404 errors)
- Verify the `base: '/WebApp/'` setting in `vite.config.js`
- Clear browser cache and try again

### API calls failing
- Check that all required secrets are configured
- Verify API URLs allow requests from `loagoMov.github.io`
- Update CORS settings if needed

### Authentication issues
- Update Auth0 allowed callback URLs to include:
  - `https://loagoMov.github.io/WebApp/`
- Update Firebase authorized domains:
  - `loagoMov.github.io`

## 🔄 Updating the Site

Simply push changes to the `main` branch:
```bash
git add .
git commit -m "Update site"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy.

## 📝 Notes

- The workflow triggers on:
  - Push to `main` branch
  - Manual workflow dispatch (Actions tab → Deploy to GitHub Pages → Run workflow)
- Build artifacts are stored in the `gh-pages` branch
- The production build uses environment variables from GitHub secrets
