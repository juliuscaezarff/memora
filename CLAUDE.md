# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Memora** is a bookmark management application that allows users to organize and share their bookmarks. Built with a monorepo architecture using Turborepo.

## Essential Commands

### Development

```bash
bun dev              # Start all apps (web + server)
bun dev:web          # Start only web app
bun dev:server       # Start only server
```

### Database

```bash
bun db:push          # Push schema changes to database
bun db:generate      # Generate Prisma client
bun db:migrate       # Run migrations
bun db:studio        # Open Prisma Studio
```

### Code Quality

```bash
bun run check        # Run Biome linter/formatter
```

### Build

```bash
bun run build        # Production build
bun run check-types  # TypeScript type checking
```

## Architecture Overview

### Monorepo Structure

```
apps/
  web/               # Next.js frontend (App Router)
  server/            # Hono backend server
  native/            # React Native app (if applicable)

packages/
  api/               # oRPC API routers and procedures
  auth/              # better-auth configuration
  db/                # Prisma client and schemas
  env/               # Environment variables validation
  config/            # Shared configs (TypeScript, etc.)
```

### Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend  | Hono, oRPC                                      |
| Database | PostgreSQL (Neon), Prisma ORM                   |
| Auth     | better-auth (GitHub, Google OAuth)              |
| Monorepo | Turborepo, Bun workspaces                       |
| Linting  | Biome                                           |

### Database Schema

Located in `packages/db/prisma/schema/`:

- **auth.prisma**: User, Session, Account, Verification (better-auth tables)
- **folder.prisma**: Folder model (user's bookmark folders)
- **bookmark.prisma**: Bookmark model (saved links with metadata)

Key relationships:

- User → Folders (1:N)
- Folder → Bookmarks (1:N)

### API Structure

The API uses **oRPC** with procedures defined in `packages/api/src/`:

```
routers/
  index.ts           # Main router aggregation
  folder.ts          # Folder CRUD operations
  bookmark.ts        # Bookmark CRUD operations
  public.ts          # Public endpoints (shared folders)
```

Two procedure types:

- `publicProcedure`: No auth required
- `protectedProcedure`: Requires authenticated session

### Frontend Structure

```
apps/web/src/
  app/               # Next.js App Router pages
    page.tsx         # Landing/login page
    bookmarks/       # Main bookmarks dashboard
    f/[folderId]/    # Public shared folder view
  components/
    ui/              # Reusable UI components (shadcn/ui style)
    *.tsx            # Feature components
  lib/
    auth-client.ts   # better-auth client
    orpc.ts          # oRPC client setup
    utils.ts         # Utility functions
```

## Development Guidelines

### TypeScript

- Use `type` alias instead of `interface`
- Leverage Zod for runtime validation (v4 syntax)
- Export types from API package for frontend consumption

### React Patterns

- Use React 19 features (React Compiler compatible)
- Prefer server components when possible
- Client components marked with `"use client"`
- Use Zustand for client state management

### API Development

- Define input schemas with Zod
- Use `protectedProcedure` for authenticated routes
- Access user via `context.session.user`
- Throw `ORPCError` for error handling

### Database

- Split schemas into separate `.prisma` files by domain
- Use `@@index` for frequently queried fields
- Use `onDelete: Cascade` for dependent relations
- Run `bun db:push` after schema changes

### Code Style

- Biome handles formatting and linting
- Run `bun run check` before committing
- No semicolons, tabs for indentation
- Double quotes for strings

## Design Principles

### Simplicity First

- Keep components small and focused
- Avoid premature abstractions
- Prefer explicit over implicit behavior

### Performance

- Minimize client-side JavaScript
- Use server components by default
- Lazy load heavy components (dialogs, drawers)

### Clean Code

- Functions should do one thing well
- Meaningful variable and function names
- Co-locate related code (component + styles + types)

## Environment Variables

Required variables (see `packages/env/`):

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

## Common Tasks

### Adding a new API route

1. Create router in `packages/api/src/routers/`
2. Add to `appRouter` in `packages/api/src/routers/index.ts`
3. Use `protectedProcedure` or `publicProcedure`

### Adding a new database model

1. Create `.prisma` file in `packages/db/prisma/schema/`
2. Run `bun db:push` to sync with database
3. Run `bun db:generate` to update Prisma client

### Adding OAuth provider

1. Add provider config in `packages/auth/src/index.ts`
2. Add environment variables
3. Configure OAuth app in provider's console
