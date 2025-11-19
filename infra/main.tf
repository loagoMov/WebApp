provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "firestore" {
  service = "firestore.googleapis.com"
}

resource "google_project_service" "cloudrun" {
  service = "run.googleapis.com"
}

resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.firestore]
}

resource "google_cloud_run_service" "backend" {
  name     = "coverbots-backend"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/backend:latest"
        env {
            name = "NODE_ENV"
            value = "production"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  depends_on = [google_project_service.cloudrun]
}

resource "google_cloud_run_service" "ai_service" {
  name     = "coverbots-ai-service"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/ai-service:latest"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  depends_on = [google_project_service.cloudrun]
}
