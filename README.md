# Wunschlachen CRM

Unified CRM for Wunschlachen - mobiler Zahnarztdienst.

## Architecture

Nuxt 3 Layers monorepo:
- `layers/base/` - Shared auth, data, types, components
- `layers/pflegeheime/` - B2B: Pflegeheim-Verwaltung
- `layers/patienten/` - B2C: Implantat-Lead-Pipeline + AI Voice
- `app/` - Main app (extends all layers)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Modules

| Module | Pfad | Zweck |
|--------|------|-------|
| Base | `/layers/base` | Auth, Types, Shared Components |
| Pflegeheime | `/layers/pflegeheime` | B2B Heim-Verwaltung, Vertraege |
| Patienten | `/layers/patienten` | B2C Implant-Leads, AI Voice, Pipeline |
| App | `/app` | Unified Dashboard, Navigation, Routing |
