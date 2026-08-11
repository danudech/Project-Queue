# Frontend (Queue)

Next.js (App Router) + TypeScript

## Getting Started

This project uses `pnpm` through Corepack. Do not run `yarn install` or
`yarn build` in this workspace.

1. `corepack enable`
2. `corepack prepare pnpm@11.9.0 --activate`
3. `pnpm install`
4. `pnpm dev`

## Production

1. `pnpm install --frozen-lockfile`
2. `pnpm run build`
3. `pnpm start`

## Environment

Copy `.env.example` to `.env.local` and adjust values.
