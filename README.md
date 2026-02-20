# Scowtt SWE Take-Home Exercise: Movie Memory

**Candidate:** Ishan Nimesh Patel  
**Email:** ipatel8@asu.edu | ipatel1400@gmail.com  
**Assessment Variant:** Variant B — Frontend/API-Focused (Client Orchestration)

---

## Overview

This repository contains my submission for the **Scowtt Software Engineering Take-Home Assessment**. *Movie Memory* is a modern, full-stack Next.js web application designed to track a user's favorite movie and dynamically generate bite-sized, interesting facts about it using the OpenAI API. 

The application architecture was specifically engineered to fulfill the **Variant B** requirements, heavily emphasizing strict API contracts, robust client-side orchestration, optimistic UI paradigms, and aggressive client-side caching.

---

## Evaluation Emphasis & Compliance

The project was built specifically to address the core evaluation criteria of the assignment:

### 1. API Contract Clarity
Implemented highly predictable, JSON-based REST endpoints (`GET /api/me`, `PUT /api/me/movie`, `GET /api/fact`). The contracts utilize standard HTTP status codes (200, 400, 401, 500) and enforce strict input validation before interacting with the database.

### 2. Typed Client Design
Replaced raw `fetch` calls with a dedicated, strictly-typed API client wrapper (`src/lib/api.ts`). This wrapper ensures end-to-end type safety using TypeScript interfaces (`GetMeResponse`, `User`, etc.) and seamlessly normalizes error propagation via a custom `ApiError` class.

### 3. Frontend State Reasoning & Optimistic UI
The `InteractiveDashboard` component leverages **SWR** and local React state to provide a zero-latency user experience. When a user edits their favorite movie, the UI applies the update *optimistically* in milliseconds, while syncing with the server in the background. If the API request fails, the component deterministically rolls back to the persistent server state.

### 4. Cache Invalidation Correctness
To protect the OpenAI API from redundant network requests and rate limits, SWR is configured with a strict `dedupingInterval` of 30 seconds for the `/api/fact` endpoint. 
- **Dynamic Invalidation**: When a user successfully updates their favorite movie, the cache key automatically fragments, instantly fetching a fresh fact for the newly inputted movie.
- **Explicit Bypassing**: Users can explicitly bypass the cache using the "Refresh Fact" button.

### 5. Loading, Error, and Empty States
Every UI segment accounts for edge cases. If OpenAI takes several seconds to respond, a dedicated, animated "Consulting the archives..." loading state appears. If an API call fails, errors are gracefully intercepted and presented via the UI without crashing the React component tree.

### 6. Security & Correctness
- **Server-Side Validation**: All movie inputs are sanitized and length-validated on the server.
- **Data Isolation**: Database queries are strictly scoped to the authenticated user's session (`getServerSession`). Users cannot access or modify data belonging to others.
- **Secret Management**: API keys (OpenAI, NextAuth, Google OAuth) are tightly guarded behind server boundaries and never exposed to the client bundle.
- **Graceful Fallbacks**: The UI defensively renders elegant fallbacks if a user's Google profile lacks a photo or name.

---

## Architecture Overview

This project implements a decoupled, API-driven architecture utilizing a Next.js (App Router) React frontend and a PostgreSQL database powered by Prisma.

### Why Variant B?
I selected **Variant B (Frontend/API-Focused)** because it provides the most authentic, native-feeling user experience. By shifting state orchestration to the client via SWR, we achieve instantaneous Optimistic UI updates, eliminate full-page reload flashes, and gain granular control over the caching lifecycle of expensive third-party APIs (OpenAI). It also enforces the creation of strict, reusable JSON REST contracts (`src/lib/api.ts`) rather than tightly coupling database logic directly into React Server Components.

### Schema Design

The application utilizes a PostgreSQL relational database accessed securely via Prisma.

```mermaid
erDiagram
    User ||--o{ Fact : "has many"
    User ||--o{ Account : "has many"
    User ||--o{ Session : "has many"

    User {
        String id PK
        String name
        String email UK
        DateTime emailVerified
        String image
        String favoriteMovie
        DateTime createdAt
        DateTime updatedAt
    }

    Fact {
        String id PK
        String content
        String userId FK
        DateTime createdAt
    }

    Account {
        String id PK
        String userId FK
        String type
        String provider
        String providerAccountId
        String refresh_token
        String access_token
        Int expires_at
        String token_type
        String scope
        String id_token
        String session_state
    }

    Session {
        String id PK
        String sessionToken UK
        String userId FK
        DateTime expires
    }

    VerificationToken {
        String identifier
        String token UK
        DateTime expires
    }
```

1. **`User` Model**: Acts as the central anchor. It handles standard OAuth profile properties but also inherently stores the `favoriteMovie` column. Deliberately denormalizing current state into this table prevents unnecessary `JOIN`s solely to render the primary application dashboard.
2. **`Fact` Model**: A dedicated table with a one-to-many relationship back to `User`. Given the latency and cost of OpenAI inference, separating `Fact` allows us to persist a historical ledger of AI facts with `createdAt` timestamps, maintaining a lean `User` entity while supporting historical caching.
3. **NextAuth Models**: Out-of-the-box OAuth provider persistence structures (`Account`, `Session`, `VerificationToken`).

### Key Tradeoffs
- **Optimistic UI vs. Eventual Consistency:** I prioritized perceived performance by updating the UI instantly when a user edits their movie. The tradeoff is the risk of displaying a state that hasn't fully persisted. This is mitigated by deterministic rollbacks via SWR's `mutate` API if the underlying `fetch` fails.
- **Client-Side Caching vs. Redis:** I relied on SWR's client-side caching (30-second `dedupingInterval`) for the OpenAI `/api/fact` endpoint rather than implementing a robust server-side caching layer like Redis. This tradeoff drastically reduced infrastructural complexity for a take-home assessment, while still effectively throttling API spam from aggressive client tab-switching or re-renders.
- **Denormalization in `User`:** I added `favoriteMovie` directly to the `User` model rather than a separate normalized `Profile` table. While slightly denormalizing the schema, this heavily optimizes dashboard loading, as the primary application state is fetched in a single query without requiring SQL `JOIN`s.

### What I Would Improve With 2 More Hours
1. **AI-Driven Tagging & Recommendation Engine (Product Focus):** I would leverage the existing OpenAI integration to generate structured JSON genre/mood tags whenever a user submits a new favorite movie. By normalizing and storing these tags in PostgreSQL, the application would organically build a crowdsourced movie taxonomy. We could then expose a new endpoint to recommend movies to users based on overlapping tags, transforming the app from a simple tracker into a dynamic discovery platform.
2. **Server-Side Rate Limiting (Infrastructure):** While SWR deduplicates identical client requests, a malicious actor could theoretically bypass the client and hit the `/api/fact` route directly. I would implement a strict Redis-based rate-limiting middleware (e.g., Upstash) to guard the OpenAI API quota.
3. **Server-Side Rendering for the Initial Fact (Performance):** Currently, the dashboard requires a client-side network waterfall to fetch the AI fact after the `InteractiveDashboard` mounts. I would refactor to pre-fetch the initial fact on the server and pass it as fallback data to SWR, reducing Time to Interactive and eliminating the loading spinner on the very first visit.

---

## Tech Stack

**Frontend Architecture:**
- **Framework:** Next.js 14 (App Router)
- **Library:** React 19
- **State Management & Fetching:** SWR (Stale-While-Revalidate)
- **Styling:** Tailwind CSS (v4)
- **Language:** TypeScript

**Backend Architecture:**
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v4 (with Prisma Adapter)
- **AI inference:** OpenAI Node SDK

**Testing & Quality Assurance:**
- **Runner:** Vitest
- **DOM Testing:** React Testing Library (`@testing-library/react`) & `jsdom`

---

## Getting Started

Follow these instructions to set up the project locally for review.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v20+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database running locally or remotely (e.g., Supabase, Neon)
- [OpenAI API Key](https://platform.openai.com/)
- [Google Cloud Console](https://console.cloud.google.com/) account (for OAuth credentials)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory. You will need to provide the following keys:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/movie_memory"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_random_secret_string" # Generate via: openssl rand -base64 32

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# OpenAI Configuration
OPENAI_API_KEY="sk-..."
```

### 3. Database Setup
Push the Prisma schema to your PostgreSQL database to construct the required tables:
```bash
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

---

## Testing

The application uses **Vitest** for fast, reliable unit and integration testing.

**Run the test suites:**
```bash
npx vitest run
```

**Test Coverage Highlights:**
- Verifies the `api.ts` typed client correctly intercepts 4xx and 5xx HTTP statuses and throws predictable `ApiError` instances.
- End-to-end integration tests for the `InteractiveDashboard.tsx` component, utilizing `@testing-library/user-event` to simulate the "Edit -> Type -> Save" flow and assert that the Optimistic UI mutates correctly prior to server resolution.

---

## Project Structure

A concise breakdown of the codebase architecture:

```text
src/
├── app/
│   ├── actions/          # Discrete Next.js Server Actions (e.g., initial onboarding save)
│   ├── api/              # RESTful backend API orchestration routes (me, me/movie, fact, auth)
│   ├── dashboard/        # Authenticated dashboard entry point
│   ├── onboarding/       # Mandatory first-time user setup view
│   └── page.tsx          # Public splash/login component
├── components/           # Reusable React components (InteractiveDashboard, LogoutButton)
├── lib/                  # Core utilities (Typed API Client Wrapper, Prisma Singleton, OpenAI setup)
└── __tests__/            # Vitest unit & integration test suites (.test.ts / .test.tsx)
prisma/
└── schema.prisma         # Relational database models (User, Fact, NextAuth structures)
```

---

## Note on AI Usage

1. **Rapid Boilerplate Generation:** Generated the initial Next.js App Router directory structure, database connection singletons (`/src/lib/prisma.ts`), and NextAuth.js Google Provider templates.
2. **Database Schema Ideation:** Acted as an architectural sounding board to weigh the tradeoffs between fully normalizing the relational schema versus denormalizing the `favoriteMovie` column directly onto the `User` model.
3. **Testing Infrastructure:** Rapidly scaffolded the initial `vitest.config.ts` integration and drafted the skeleton for `@testing-library/react` DOM interaction tests (specifically mocking `next/navigation` routing logic).
4. **Type Safety Assurance:** Assisted in defining robust, strict TypeScript interfaces (`GetMeResponse`, `GetFactResponse`) to ensure the custom `fetchWithHandling` API client was entirely end-to-end type safe.
