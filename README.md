# Nexora ERP - Mini ERP & CRM Operations Portal

A complete, full-stack ERP and CRM system for wholesale/distribution companies, built to demonstrate modern web development practices.

## Overview

This project includes:
- **Authentication & Roles**: Admin, Sales, Warehouse, and Accounts with specific permissions.
- **Customer CRM**: Manage leads, distributors, retailers, wholesalers, and follow-up tracking.
- **Product & Inventory**: SKU management, stock tracking, and automated movement logs.
- **Sales Challans**: Generate invoices/challans, auto-deduct stock upon confirmation, and export to PDF.
- **Activity & Audit Logs**: Full track record of system activities.
- **Settings**: Modular settings including Notification Preferences, UI Themes, and Profile management.

## Architecture

- **Backend**: Node.js + Express.js + TypeScript
- **Database**: Prisma ORM (currently SQLite via `dev.db`, easily swappable to PostgreSQL/MySQL via `.env`)
- **Frontend**: React 19 + Vite + Tailwind CSS + ShadCN UI
- **Auth**: JWT-based Authentication using HttpOnly cookies
- **PDF Generation**: `pdfkit` running on the backend

## Local Setup

### Running with Docker (Recommended)
You can run the entire application stack (Frontend + Backend + SQLite DB) using Docker.

```bash
docker-compose up --build
```
- The **Frontend** will be available at `http://localhost:3000`
- The **Backend API** will be available at `http://localhost:5000/api`

### Manual Setup (Without Docker)

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 1. Backend Setup

```bash
cd backend
npm install
# Set up database (SQLite is used by default for ease of local testing)
npx prisma db push
# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

**Backend (`backend/.env`)**
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_here"
NODE_ENV="development"
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL="http://localhost:5000/api"
```

## Test Credentials

The system seeds the database with the following demo accounts:
- **Admin**: `admin@nexora.co` / `admin123`
- **Sales**: `sales@nexora.co` / `sales123`
- **Warehouse**: `warehouse@nexora.co` / `warehouse123`
- **Accounts**: `accounts@nexora.co` / `accounts123`

## Deployment Instructions

### Deploying the Backend (Render / Railway)
1. Ensure your `.env` is configured with a PostgreSQL `DATABASE_URL` instead of the local SQLite path.
2. In `backend/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Push to GitHub and link the repo to Render/Railway as a Node Web Service.
4. Set the Build Command to: `npm install && npx prisma generate && npm run build`
5. Set the Start Command to: `npm start` (make sure you have a build script and start script in package.json compiling TS to JS, e.g. `tsc`).

### Deploying the Frontend (Vercel / Netlify)
1. Link the frontend folder to Vercel.
2. Set the Framework Preset to `Vite`.
3. Add the `VITE_API_URL` environment variable pointing to your deployed backend URL.
4. Deploy!

## Assumptions & Limitations
- SQLite is used locally for a zero-configuration setup, but Prisma allows easy migration to Postgres for production.
- "Logout from all devices" invalidates all refresh tokens for a user, forcing re-login.
- Demo data resets require the SQLite database file to be replaced/re-seeded, which is restricted in a true production DB environment.
