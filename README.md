
A full-stack Task Management System built with **Node.js + TypeScript** (backend) and **Next.js + Tailwind CSS + shadcn/ui** (frontend).

---

## 🗂 Project Structure

```
task-management/
├── backend/          # Node.js + TypeScript + Prisma + PostgreSQL
└── frontend/         # Next.js 14 App Router + Tailwind + shadcn/ui
```

---

## ✅ Features

### Backend API
- **JWT Authentication** — Access token (15 min) + Refresh token (7 days) with rotation
- **bcrypt** password hashing (12 rounds)
- **Full Task CRUD** — create, read, update, delete, toggle status
- **Pagination** — page/limit
- **Filtering** — by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) and priority (`LOW`, `MEDIUM`, `HIGH`)
- **Search** — case-insensitive title search
- **Sorting** — by `createdAt`, `updatedAt`, `dueDate`, or `title`
- Input validation with `express-validator`
- Proper HTTP status codes (400, 401, 404, 409, 500)
- CORS configured for frontend URL

### Frontend
- **Login & Registration** with Zod form validation + password strength meter
- **Auto token refresh** — Axios interceptor silently refreshes on 401
- **Dashboard** with stats overview (total, pending, in-progress, completed)
- **Filters bar** — search, status, priority, sort — all in real-time
- **Toast notifications** via Sonner
- Fully **responsive** — mobile sidebar + desktop fixed sidebar
- **Loading skeletons** while data fetches

---

## 🚀 Quick Start


### 1. Backend Setup

```bash
cd task-management/backend

# Install dependencies
npm install

# Create your .env from the example of .env.example



# Push schema to DB and generate Prisma client
npm run db:push
npm run db:generate

# Start dev server (http://localhost:4000)
npm run dev
```

---

### 2. Frontend Setup

```bash

cd task-management/frontend

# Install dependencies
npm install

# Create your .env.local from the example of .env.example


# Start dev server
npm run dev
```
---

## API Endpoints

### Auth  `/auth`
| Method | Path              | Auth | Description                         |
|--------|-------------------|------|-------------------------------------|
| POST   | `/auth/register`  | —    | Register new user                   |
| POST   | `/auth/login`     | —    | Login, returns token pair           |
| POST   | `/auth/refresh`   | —    | Refresh tokens (body: refreshToken) |
| POST   | `/auth/logout`    | —    | Invalidate refresh token            |
| POST   | `/auth/logout-all`| ✅   | Invalidate all sessions             |
| GET    | `/auth/me`        | ✅   | Get current user                    |

### Tasks  `/tasks`
| Method | Path               | Auth | Description                      |
|--------|--------------------|------|----------------------------------|
| GET    | `/tasks`           | ✅   | List tasks (paginated, filtered) |
| GET    | `/tasks/stats`     | ✅   | Task count stats                 |
| GET    | `/tasks/:id`       | ✅   | Get single task                  |
| POST   | `/tasks`           | ✅   | Create task                      |
| PATCH  | `/tasks/:id`       | ✅   | Update task fields               |
| DELETE | `/tasks/:id`       | ✅   | Delete task                      |
| PATCH  | `/tasks/:id/toggle`| ✅   | Cycle status PENDING → IN_PROGRESS → COMPLETED → PENDING |

#### Query params for `GET /tasks`
| Param      | Type                              | Default      |
|------------|-----------------------------------|--------------|
| `page`     | integer                           | 1            |
| `limit`    | integer (1–100)                   | 10           |
| `status`   | `PENDING` / `IN_PROGRESS` / `COMPLETED` | —      |
| `priority` | `LOW` / `MEDIUM` / `HIGH`         | —            |
| `search`   | string                            | —            |
| `sortBy`   | `createdAt` / `updatedAt` / `dueDate` / `title` | `createdAt` |
| `sortOrder`| `asc` / `desc`                    | `desc`       |

---

## 🗄 Database Schema

```
User         id, email (unique), name, passwordHash, timestamps
Task         id, title, description?, status, priority, dueDate?, userId, timestamps
RefreshToken id, token (unique), userId, expiresAt, createdAt
```


## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Backend  | Node.js, Express, TypeScript                |
| ORM      | Prisma                                      |
| Database | PostgreSQL                                  |
| Auth     | JWT (jsonwebtoken), bcryptjs                |
| Validation | express-validator                         |
| Frontend | Next.js 14 (App Router), TypeScript        |
| Styling  | Tailwind CSS, shadcn/ui                     |
| Forms    | React Hook Form + Zod                       |
| HTTP     | Axios (with auto-refresh interceptor)       |
| Toasts   | Sonner                                      |



