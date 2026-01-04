# DIMERI.AI ERM - React + Express + PostgreSQL

This document explains how to set up and run the new React frontend with Express backend.

## Project Structure

```
MVP ERM/
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Zustand state stores
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── package.json
│
├── backend/            # Express + Prisma
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Seed data
│   └── package.json
│
├── database/           # SQL schema (reference)
│   └── schema.sql
│
└── (existing HTML/CSS/JS app)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Getting Started

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE dimeri_erm;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed demo data
npm run db:seed

# Start the server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dimeri_erm?schema=public"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Members
- `GET /api/workspaces/:id/members` - List members
- `POST /api/workspaces/:id/members` - Invite member
- `PUT /api/workspaces/:id/members/:memberId` - Update role
- `DELETE /api/workspaces/:id/members/:memberId` - Remove member

### Risk Registers
- `GET /api/workspaces/:id/registers` - List registers
- `POST /api/workspaces/:id/registers` - Create register

### Risks
- `GET /api/registers/:id/risks` - List risks
- `POST /api/registers/:id/risks` - Create risk
- `GET /api/risks/:id` - Get risk details
- `PUT /api/risks/:id` - Update risk
- `DELETE /api/risks/:id` - Delete risk

### Controls
- `GET /api/registers/:id/controls` - List controls
- `POST /api/registers/:id/controls` - Create control
- `GET /api/controls/:id` - Get control details
- `PUT /api/controls/:id` - Update control
- `DELETE /api/controls/:id` - Delete control

### Reports
- `GET /api/reports/workspace/:id` - List reports
- `POST /api/reports/workspace/:id/risk-summary` - Generate risk summary
- `POST /api/reports/workspace/:id/control-assessment` - Generate control assessment

## Demo Credentials

After running `npm run db:seed`:

- **Email:** demo@dimeri.ai
- **Password:** demo123

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Zustand (state management)
- React Query (data fetching)
- Lucide React (icons)
- React Hot Toast (notifications)

### Backend
- Express 5
- Prisma (ORM)
- PostgreSQL (database)
- JWT (authentication)
- bcryptjs (password hashing)

## Development Tips

1. **Prisma Studio** - Visual database browser:
   ```bash
   cd backend && npm run db:studio
   ```

2. **Database Changes** - After modifying `schema.prisma`:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **API Proxy** - Frontend proxies `/api` requests to backend automatically (configured in `vite.config.js`)

## Deployment (Vercel)

### Frontend
1. Connect repo to Vercel
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend
1. Use Vercel Serverless Functions or deploy to Railway/Render
2. Set environment variables in dashboard
3. Run migrations: `npx prisma migrate deploy`
