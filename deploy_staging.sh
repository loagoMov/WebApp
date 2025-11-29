#!/bin/bash
set -e

PROJECT_ID="coverbots-b9f79"
REGION="us-central1"

echo "🚀 Starting Staging Deployment for Project: $PROJECT_ID"

# Check for gcloud authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ No active gcloud account found. Please run 'gcloud auth login' first."
    exit 1
fi

# Enable required services
echo "🔌 Enabling Cloud Build and Cloud Run APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com --project $PROJECT_ID

# Backend
echo "📦 Building and Deploying Backend..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/backend --project $PROJECT_ID
gcloud run deploy backend --image gcr.io/$PROJECT_ID/backend --platform managed --region $REGION --allow-unauthenticated --project $PROJECT_ID
cd ..

# AI Service
echo "🧠 Building and Deploying AI Service..."
cd ai-service
gcloud builds submit --tag gcr.io/$PROJECT_ID/ai-service --project $PROJECT_ID
gcloud run deploy ai-service --image gcr.io/$PROJECT_ID/ai-service --platform managed --region $REGION --allow-unauthenticated --project $PROJECT_ID
cd ..

# Frontend
echo "🎨 Deploying Frontend to Firebase Hosting (Staging)..."
cd frontend
npm run deploy:staging
cd ..

echo "✅ Deployment Complete!"
