# Auth0 Setup Guide for CoverBots

To make authentication work fully, you need to connect the app to a real Auth0 tenant.

## Step 1: Create Auth0 Account & Tenant
1.  Go to [Auth0.com](https://auth0.com/) and sign up (free tier is fine).
2.  Create a new **Tenant** (e.g., `coverbots-dev`).

## Step 2: Configure Frontend (Single Page App)
1.  In the Auth0 Dashboard, go to **Applications > Applications**.
2.  Click **Create Application**.
3.  Name it `CoverBots Frontend` and select **Single Page Web Applications**.
4.  Go to the **Settings** tab.
5.  **Allowed Callback URLs**: `http://localhost:5173`
6.  **Allowed Logout URLs**: `http://localhost:5173`
7.  **Allowed Web Origins**: `http://localhost:5173`
8.  Click **Save Changes**.
9.  Copy the **Domain** and **Client ID**.

## Step 3: Configure Backend (API)
1.  Go to **Applications > APIs**.
2.  Click **Create API**.
3.  **Name**: `CoverBots API`
4.  **Identifier**: `https://coverbots.api` (This matches `AUTH0_AUDIENCE` in backend code).
5.  Click **Create**.

## Step 4: Update Environment Variables

### Frontend (`frontend/.env`)
Replace the placeholders with your values from Step 2:
```ini
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_API_URL=http://localhost:3000
```

### Backend (`backend/.env`)
Update with your values:
```ini
PORT=3000
FIRESTORE_EMULATOR_HOST=firestore:8080
AUTH0_AUDIENCE=https://coverbots.api
AUTH0_ISSUER_BASE_URL=https://your-tenant.us.auth0.com/
AI_SERVICE_URL=http://ai-service:8000
```

## Step 5: Restart
After updating the `.env` files, restart your Docker containers to apply changes:
```bash
cd infra
docker compose down
docker compose up --build -d
```
