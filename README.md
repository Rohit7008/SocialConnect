SocialConnect - Next.js + Supabase backend (App Router)

## Getting Started

Quick start

1) Create Supabase project. Enable Realtime on `public.notifications`.
2) Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=dev-secret-change
JWT_ISSUER=socialconnect
JWT_AUDIENCE=socialconnect-users
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600
SUPABASE_STORAGE_BUCKET=avatars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3) Apply SQL: `sql/schema.sql` in Supabase SQL editor.

4) Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

API Overview

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/token/refresh`
- POST `/api/auth/logout`
- POST `/api/auth/password-reset`
- POST `/api/auth/password-reset-confirm`
- POST `/api/auth/change-password`
- GET `/api/users/:id`
- GET/PATCH `/api/users/me`
- GET `/api/users/:id/followers` | GET `/api/users/:id/following`
- POST/DELETE `/api/users/:id/follow`
- POST `/api/posts` | GET `/api/posts`
- GET/PATCH/DELETE `/api/posts/:post_id`
- POST/DELETE `/api/posts/:post_id/like` | GET `/api/posts/:post_id/like-status`
- POST/GET `/api/posts/:post_id/comments`
- DELETE `/api/comments/:comment_id`
- GET `/api/feed`
- GET `/api/notifications` | POST `/api/notifications/:id/read` | POST `/api/notifications/mark-all-read`
- Admin: GET `/api/admin/users`, GET `/api/admin/users/:id`, POST `/api/admin/users/:id/deactivate`, GET `/api/admin/posts`, DELETE `/api/admin/posts/:id`, GET `/api/admin/stats`

Minimal UI

- `/` login form (stores JWT in localStorage)
- `/feed` lists followed users' posts

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# SocialConnect
