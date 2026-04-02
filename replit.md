# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with expo-router

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # LimeNova Expo mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## FORMULAB App — artifacts/mobile

**FORMULAB** is an AI-driven personal care mobile app (Expo/React Native) for Ireland's hard water and damp climate.

### Design System
- **European luxury light theme**: `bg: #FAF8F4`, `bgAlt: #F2EDE6`, `card: #FFFFFF`, `border: #E4DDD5`, `text: #1A1614`, `muted: #7C6F65`, `faded: #B5A99E`
- **Accent colours**: `sage: #6B9E7A` (deodorant), `rose: #B8706E` (shower gel), `gold: #B8882A`
- **Fonts**: Fraunces 700Bold (headings) + Inter 400/500/600 (body)
- Inspired by Aesop / Augustinus Bader / Glossier — warm ivory/cream, stone borders
- `useNativeDriver: false` (constant ND = false) for all animations

### Navigation Flow (Updated)
1. **Onboarding** (4 slides, first-launch only) → Home
2. **Home** → Fragrance Picker
3. **Fragrance Picker** → Analysis Mode (fragranceId passed forward)
4. **Analysis Mode** → Camera Analysis OR Questionnaire
5. **Generating** → Ingredient Picker
6. **Ingredient Picker** → Product Making (Virtual Bottle)
7. **Payment** → Formula

### Fragrance Options
Cool-named fragrances stored in `fragrance-picker.tsx`:
- Crystal Pure (unscented), Atlantic Mist (fresh), Citrus Surge, Emerald Forest (herbal), Bloom Ritual (floral), Midnight Oak (woody)

### Camera Analysis Fix
- `express.json({ limit: "15mb" })` in `api-server/src/app.ts` to handle base64 images
- Removed `responseMimeType: "application/json"` from Gemini API call (caused vision API failures)
- Image quality reduced to 0.35 to reduce upload size

### Features
- Home screen with product selection (deodorant / shower gel)
- Dual analysis mode: camera AI analysis (Gemini Vision) OR multi-step questionnaire
- Camera analysis: `expo-image-picker`, sends base64 image to `/api/analysis/skin` via Gemini Vision
- Multi-step skin questionnaire (8 steps for deodorant, 7 for shower gel)
- AI formulation engine powered by Google Gemini 2.5 Flash (via backend API)
- Ingredient picker with toggle controls (choose from AI-suggested add-ons)
- 3D animated bottle-fill product making screen (Animated API)
- Payment screen with card form (€24.99 deodorant / €29.99 shower gel) — demo flow
- Formula display with 4 sections: Base Formula, Odor Control, Skin-Care Actives, Fragrance Profile
- Order confirmed banner on formula screen when navigated with `paid=true` param
- History of past formulations (persisted via AsyncStorage)
- Irish climate/hard water optimisation

### Screens
- `app/index.tsx` — Home screen, product cards
- `app/analysis-mode.tsx` — Choose camera or questionnaire path
- `app/camera-analysis.tsx` — Take/pick photo → Gemini Vision analysis
- `app/questionnaire.tsx` — Multi-step questionnaire flow
- `app/generating.tsx` — Loading animation while AI generates formula
- `app/ingredient-picker.tsx` — Toggle optional add-on ingredients
- `app/product-making.tsx` — Animated bottle fill progress
- `app/payment.tsx` — Card form + order summary (demo)
- `app/formula.tsx` — Formula results display (with optional paid=true banner)
- `app/history.tsx` — Past formulations list
- `app/error.tsx` — Error fallback

### Components
- `components/FormulaCard.tsx` — Expandable formula section card (dark theme)
- `components/QuestionCard.tsx` — Multi/single-select option card (dark theme)
- `components/ProgressBar.tsx` — Step progress bar (dark theme)

### Context
- `context/FormulationContext.tsx` — App state with AsyncStorage (local) + Supabase (cloud) dual persistence

### Supabase Integration
- URL: `https://kqjaaumzufuthidfhcwd.supabase.co`
- Anon key stored as secret `SUPABASE_ANON_KEY` + env var `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `lib/supabase.ts` — Supabase client (no auth session, anonymous device-id based)
- `lib/deviceId.ts` — Persistent device UUID via AsyncStorage + expo-crypto
- `supabase-schema.sql` — Run in Supabase SQL Editor to create tables
- Tables: `user_profiles`, `formulas`, `orders` — all with RLS (anon all access)
- Strategy: load local cache first, then hydrate from Supabase; save locally immediately + cloud in background

### API Integration
- `lib/gemini.ts` — Calls `/api/formulation/generate` on the backend
- Backend routes:
  - `artifacts/api-server/src/routes/formulation.ts` — POST `/api/formulation/generate`
  - `artifacts/api-server/src/routes/analysis.ts` — POST `/api/analysis/skin` (Gemini Vision)
- Gemini AI via `AI_INTEGRATIONS_GEMINI_BASE_URL` + `AI_INTEGRATIONS_GEMINI_API_KEY`
- IMPORTANT: Use raw fetch (not `@google/genai` SDK) — the SDK is externalized by esbuild
- Gemini URL format: `${baseUrl}/models/gemini-2.5-flash:generateContent?key=${apiKey}` (no `/v1beta/`)

### Pending / Future
- Stripe real integration (currently demo 2s delay in payment.tsx)
- PostgreSQL storage for formulations (currently AsyncStorage only)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes: health check + formulation generation.

- Entry: `src/index.ts`
- App setup: `src/app.ts`
- Routes: `src/routes/formulation.ts` — POST `/api/formulation/generate`
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/mobile` (`@workspace/mobile`)

LimeNova Expo mobile app. Fonts: Fraunces + Inter (Google Fonts via expo-google-fonts).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval codegen config. Run: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
