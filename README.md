# xiv.today

Event planner and showcase site for Final Fantasy XIV community events.

## What lives here

- `app/page.tsx` renders the public home page with upcoming events.
- `app/events/forked-tower/page.tsx` shows the sample Forked Tower event plan.
- `app/api/auth/[...nextauth]/route.ts` exposes the NextAuth handler.
- `db/schema.ts` defines the database tables used by the app.

## Setup

1. Install dependencies with `pnpm install`.
2. Set `DATABASE_URL` in your environment.
3. Run migrations with `pnpm run db:migrate`.
4. Seed sample events with `pnpm run db:seed`.
5. Start the app with `pnpm dev`.

## Scripts

- `pnpm dev` - start the development server
- `pnpm build` - build the app and run production migrations
- `pnpm start` - start the production server
- `pnpm lint` - run ESLint
- `pnpm run db:generate` - generate Drizzle migrations
- `pnpm run db:migrate` - apply migrations
- `pnpm run db:seed` - seed sample event data
- `pnpm run db:setup` - migrate and seed in one step

## Notes

- The app uses `next-auth` for sign-in, including username/password and Discord.
- If `DATABASE_URL` is missing, the home page falls back to an empty event list.
- The design uses the built-in Geist font family through `next/font`.
