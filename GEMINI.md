# This should be a thing - Project Context

## Project Overview

"This Should Be A Thing" is a modern Idea Board application built with **Next.js 16**. It allows users to propose ideas, vote on them, and discuss them via comments. The application features a secure, passwordless admin interface using **WebAuthn (Passkeys)**.

## Key Features

*   **Idea Management:** Users can submit new ideas with titles and descriptions.
*   **Voting System:** Community voting mechanism to highlight popular ideas.
*   **Comments:** Threaded discussion support for each idea.
*   **Admin System:**
    *   **Passwordless Auth:** Uses WebAuthn (Passkeys) for secure, modern authentication.
    *   **First-run Setup:** Automatic prompt to register the first admin passkey if none exists.
    *   **Management:** Admins can reset votes and likely manage content (inferred).
*   **Multi-tenancy Support:** Data in Redis is namespaced by the request's `Host` header, allowing multiple instances or domains to share a Redis instance while keeping data separate.

## Technology Stack

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **UI Library:** Chakra UI v3 (with Emotion)
*   **Icons:** Lucide React, React Icons
*   **Database:** Redis (via `redis` client)
*   **Authentication:** `@simplewebauthn/browser` & `@simplewebauthn/server`
*   **State Management:** Server-side state via Redis, Client-side React hooks.

## Architecture & Directory Structure

*   `src/app/`: Next.js App Router pages and API routes.
    *   `api/`: Backend logic for Ideas, Comments, and Admin Auth.
    *   `admin/`: Admin-specific pages (if any specific ones exist distinct from modal flow).
*   `src/components/`: React UI components.
    *   `IdeaBoard.tsx`: Main container for the idea list.
    *   `IdeaCard.tsx`: Individual idea display.
    *   `IdeaForm.tsx`: Submission form.
    *   `ui/`: Reusable UI components (likely from a component library generator).
*   `src/lib/`: Core logic and utilities.
    *   `redis.ts`: Redis client configuration and connection handling.
    *   `store.ts`: Data access layer for Ideas (fetch/save logic).
    *   `admin.ts`: Admin authentication and session management logic.

## Key Commands

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Start Production Server:**
    ```bash
    npm run start
    ```
*   **Lint Code:**
    ```bash
    npm run lint
    ```

## Conventions

*   **Styling:** Uses Chakra UI components and styling system.
*   **Design:** Keep design clean and simple, whilst mainting a good look and feel. Keep consistency in design principles across the project.
*   **Data Fetching:** Server Components fetch data directly where possible; Client Components use API routes (`/api/...`) for mutations and updates.
*   **Type Safety:** Strict TypeScript usage for all interfaces (`Idea`, `Comment`, `AdminData`).
*   **Paths:** Use `@/` alias for imports from `src/` (e.g., `import ... from '@/components/...'`).

## General advices

*   Once finished making changes, run `npm run lint` and fix any errors or warnings that come up. Then run `npm run build` to confirm the project builds successfully.
*   Generate short but meaningful commit messages after completion of making changes. The first word should be a verb such as "add" or "fix" or "change" or "update" and keep the commit message lowercase.
