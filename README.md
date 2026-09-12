# Personal Financial Tracker (Full-Stack with Supabase)

A modern, production-ready Personal Financial Tracker web application built with a clear separation of frontend, backend REST API, Supabase Authentication, and Supabase PostgreSQL Database with Row Level Security (RLS).

---

## 1. Project Overview

The Personal Financial Tracker empowers users to record, categorize, visualize, and manage their income and expenditures securely. Every transaction belongs strictly to its authenticated user and is isolated at both the REST API layer and the PostgreSQL database engine via Supabase Row Level Security.

---

## 2. Architecture & Communication Flow

```text
                      ┌──────────────────────────────────────┐
                      │            React Frontend            │
                      │ (Vite, React Router, Recharts, Axios)│
                      └───────┬──────────────────────┬───────┘
                              │                      │
                   1. Direct Auth Session     2. Authenticated REST Requests
                   (SignUp, Login, Tokens)   (Bearer <Supabase-Access-Token>)
                              │                      │
                              ▼                      ▼
               ┌────────────────────────┐   ┌────────────────────────┐
               │     Supabase Auth      │   │    Express REST API    │
               │ (JWT, User Management) │   │ (Controllers, Services)│
               └──────────────┬─────────┘   └────────┬───────────────┘
                              │                      │
                              │             3. Token Verification
                              │             & PostgreSQL Queries
                              ▼                      ▼
                      ┌──────────────────────────────────────┐
                      │          Supabase PostgreSQL        │
                      │  (profiles, transactions, RLS engine)│
                      └──────────────────────────────────────┘
```

1. **User Authentication**: Handled client-side via `@supabase/supabase-js`. Supabase Auth generates a signed JSON Web Token (JWT) on sign-in.
2. **Authenticated API Calls**: All data mutations and queries route through the Express REST API (`/api/*`). The frontend passes the user's JWT via the `Authorization: Bearer <token>` header.
3. **Backend Verification**: The Express `requireAuth` middleware validates the token with Supabase Auth (`supabase.auth.getUser(token)`). The backend extracts the verified user identity (`user.id`) and executes scoped queries.
4. **Database-Level Protection (RLS)**: Row Level Security policies enforce that `user_id = auth.uid()` on every `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

---

## 3. Technology Stack

### Frontend
- **React (19)** & **Vite (6)**
- **React Router (v7)** for public and protected routing
- **Axios** with global interceptors for Bearer token authorization
- **Recharts** for real-time financial visualization (Bar, Line, Donut charts)
- **Lucide React** for modern UI icons
- **Tailwind CSS** for responsive styling

### Backend
- **Node.js** & **Express.js** REST API
- **@supabase/supabase-js** for Auth verification & PostgreSQL interaction
- **CORS** & **dotenv**
- Strict separation: Routes ➔ Middleware ➔ Controllers ➔ Services ➔ Database

### Database & Auth
- **Supabase Auth** (Email & Password)
- **Supabase PostgreSQL** with strict constraints and Row Level Security (RLS)

---

## 4. Folder Structure

```text
financial-tracker/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   ├── SupabaseSetupModal.jsx
│   │   │   └── TransactionModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Transactions.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .gitignore
│
├── backend/
│   │
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── dashboardController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── dashboardRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── dashboardService.js
│   │   ├── transactionService.js
│   │   └── userService.js
│   ├── utils/
│   │   └── response.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## 5. Supabase Setup & SQL Schema

### Step 1: Create a Supabase Project
1. Visit [supabase.com](https://supabase.com) and create a free project.
2. Under **Authentication** > **Providers**, ensure **Email** is enabled.

### Step 2: Run Database Migrations & RLS Policies
Navigate to the **SQL Editor** in your Supabase Dashboard and execute this script:

```sql
-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. High-performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 6. RLS Policies for Transactions
CREATE POLICY "Users can select own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid() = user_id);
```

### Step 3: Get Project Keys
Go to **Project Settings** ➔ **API**:
- **Project URL**: Used by both frontend and backend (`SUPABASE_URL`)
- **anon / public key**: Client-safe key for `frontend/.env`
- **Secret Key**: Secret key strictly for `backend/.env` (Never expose to frontend)

---

## 6. Local Setup & Running

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Configure `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure `backend/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

### Unified Full-Stack Running (Root)

The root environment includes an integrated proxy setup that runs both the Express backend and Vite frontend simultaneously:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 7. REST API Reference

All protected endpoints require the header `Authorization: Bearer <supabase-access-token>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check & uptime |
| `GET` | `/api/config/status` | Supabase connectivity status |
| `GET` | `/api/users/profile` | Retrieve verified user profile |
| `PUT` | `/api/users/profile` | Update user full name |
| `GET` | `/api/dashboard/summary` | Balance, Income, Expenses, Savings |
| `GET` | `/api/dashboard/charts` | Income vs Expense, Category donut, Monthly trend |
| `GET` | `/api/transactions` | Query transactions (supports filter & sort params) |
| `GET` | `/api/transactions/:id` | Fetch single transaction |
| `POST` | `/api/transactions` | Record new transaction |
| `PUT` | `/api/transactions/:id` | Update transaction record |
| `DELETE` | `/api/transactions/:id`| Remove transaction record |

---

## 8. Security Highlights

- **Zero Trust Client User ID**: The backend never accepts `user_id` from client payloads. The authenticated user ID is verified directly from the Supabase JWT.
- **Secret Key Isolation**: The Supabase Secret Key is kept strictly in server-side memory and never delivered to the client bundle.
- **Database Row Level Security (RLS)**: Even in case of misconfigured queries, PostgreSQL enforces record isolation at the kernel level.
- **Input Sanitization & Validation**: Required fields, numeric boundaries (`amount > 0`), and category whitelists are enforced on both client and server.
