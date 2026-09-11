# SecureVault

SecureVault is a secure password manager application built with a React frontend and a Node.js + Express backend. It focuses on user security with multi-factor authentication, encrypted vault storage, and protected API access using JWT-based auth.

## Overview

This project allows users to:
- register and log in securely
- verify login with a 6-digit OTP sent by email
- store website credentials in a private vault
- access and manage saved credentials through a protected dashboard
- keep sensitive passwords encrypted at rest using AES-256-GCM

## Features

- User registration and login flow
- Email-based 2FA with OTP verification
- JWT authentication and protected routes
- Password hashing for master passwords
- AES-256-GCM encryption for saved credentials
- Vault CRUD operations for credentials
- Frontend dashboard with secure UX and animated UI
- MongoDB persistence for user and vault data

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Framer Motion
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Nodemailer
- Crypto (AES-256-GCM)

## Project Structure

```bash
Secure-Vault/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .gitignore
├── README.md
└── package.json (if added at root later)
```

## Security Implementation

SecureVault includes the following core security measures:

- Master passwords are hashed before storage.
- OTP codes are generated and stored temporarily with expiry handling.
- Email verification uses a short-lived MFA token before full login.
- Vault passwords are encrypted with AES-256-GCM before being saved to MongoDB.
- User ownership checks are enforced before reading, updating, or deleting vault entries.
- Protected routes require valid JWT authentication.

## Environment Setup

### Backend

1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   copy .env.example .env
   ```
   On Linux/macOS:
   ```bash
   cp .env.example .env
   ```
4. Update the values inside `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/securevault
   JWT_SECRET=your_jwt_secret_key_here
   ENCRYPTION_KEY=your_64_character_hex_encryption_key_here

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS="your 16 char app password"
   SMTP_FROM="SecureVault <your_email@gmail.com>"
   ```

> `ENCRYPTION_KEY` must be a valid 32-byte key or a 64-character hex string. The SMTP password should be a valid Gmail App Password for the email OTP flow.

### Frontend

1. Go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   copy .env.example .env
   ```
4. Confirm the Vite API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

### Access the app

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

## Main API Routes

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `GET /api/auth/profile`

### Vault
- `POST /api/vault`
- `GET /api/vault`
- `GET /api/vault/:id`
- `PUT /api/vault/:id`
- `DELETE /api/vault/:id`

## Notes

- The backend includes a development OTP log when email delivery is not configured, which helps testing locally.
- The system is designed for a personal or demo-grade secure vault and should be hardened further before production deployment.
- Secret values should never be committed to GitHub; keep them in `.env` files only.

## Future Improvements

- Add password strength checker and generator enhancements
- Add search and filter support for vault entries
- Add dark/light theme switch
- Add export/import of encrypted vault data
- Add role-based access or admin features
- Improve production deployment setup with Docker or Vercel/Render

## License

This project is for educational and personal project use.
