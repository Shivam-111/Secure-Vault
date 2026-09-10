# SecureVault – Secure Password Manager

A clean and modular project foundation for **SecureVault**.

## Project Structure

```
SecureVault/
├── frontend/        # React + Vite Application
└── backend/         # Node.js + Express Application
```

## Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   # Production / standard mode
   npm start

   # Development mode (auto-reload)
   npm run dev
   ```
5. Health Check API:
   - Endpoint: `GET http://localhost:5000/api/health`

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.
