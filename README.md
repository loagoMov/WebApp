# CoverBots - Intelligent Insurance Marketplace

CoverBots is a youth-friendly insurance marketplace for Botswana, allowing users to get AI-powered insurance recommendations and connect with vendors.

## Project Structure

- `frontend/`: React + Vite + Tailwind CSS (PWA)
- `backend/`: Node.js + Express + Firebase Admin
- `ai-service/`: Python + FastAPI (Recommendation Engine)
- `infra/`: Terraform + Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Google Cloud SDK (optional, for deployment)

### Local Development

1.  **Clone the repository**
2.  **Start the stack**
    ```bash
    cd infra
    docker-compose up --build
    ```
3.  **Access the services**
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend: [http://localhost:3000](http://localhost:3000)
    - AI Service: [http://localhost:8000](http://localhost:8000)
    - Firestore Emulator: [http://localhost:8080](http://localhost:8080)

## Configuration

- **Frontend**: Create `frontend/.env` (see `.env.example`)
- **Backend**: Create `backend/.env` (see `.env.example`)
- **Auth0**: Configure Auth0 domain and client ID in frontend `.env`.
- **Firebase**: Set `FIRESTORE_EMULATOR_HOST` for local dev.

## Deployment

The project uses Terraform for GCP provisioning and GitHub Actions for CI/CD.

1.  **Infrastructure**:
    ```bash
    cd infra
    terraform init
    terraform apply
    ```
2.  **CI/CD**: Push to `main` branch to trigger deployment.

## Features

- **Recommendation Quiz**: Rule-based engine matches users to products.
- **Vendor Dashboard**: Manage products, leads, and bids.
- **Admin Dashboard**: Platform oversight.
- **PWA**: Installable on mobile devices.

## License

Proprietary - CoverBots
