# Ticket Platform - Complete Deployment Guide

This guide covers deploying the complete ticket platform including frontend, backend, and database.

## Prerequisites

- Node.js 18+ and npm/bun
- Git
- Supabase account (free tier works)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd <project-folder>
npm install
```

### 2. Set Up Supabase

#### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization, name, password, and region
4. Wait for project to be ready (~2 minutes)

#### Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Open `database/schema.sql` from this repo
3. Copy and paste the entire file into the SQL Editor
4. Click "Run" to execute

#### Run Seed Data
1. Open `database/seed.sql`
2. Copy and paste into SQL Editor
3. Click "Run" to execute

#### Enable User Trigger
Run this SQL to auto-create profiles for new users:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-ID
```

Find these values in Supabase: Settings → API

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Create Admin User

1. Sign up through the app at `/auth`
2. Get your user ID from Supabase: Authentication → Users
3. Run in SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR-USER-UUID', 'admin');
```

4. Sign out and back in to refresh your session

## Production Deployment

### Deploy Frontend

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Deploy Edge Functions

Edge functions in `supabase/functions/` are deployed via Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-ID
supabase functions deploy
```

## Project Structure

```
├── database/
│   ├── schema.sql      # Complete database schema
│   ├── seed.sql        # Sample data
│   └── README.md       # Database documentation
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks (useEvents, etc.)
│   ├── context/        # React context (Cart)
│   ├── types/          # TypeScript types
│   └── integrations/   # Supabase client
├── supabase/
│   ├── functions/      # Edge functions
│   └── config.toml     # Supabase config
└── public/             # Static assets
```

## Features

### Public Features
- Browse events by category
- Search events
- View event details with venue map
- Select seats and add to cart
- Checkout flow

### Admin Features (`/admin`)
- Dashboard with stats
- Manage venues with SVG maps
- Auto-detect sections from SVG
- Create/edit events
- Manage performers
- Configure categories
- View orders
- Manage ticket inventory

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

## Troubleshooting

### "Permission denied" errors
- Check RLS policies are correctly set up
- Ensure user has correct role in `user_roles` table
- Sign out and back in after role changes

### Edge functions not working
- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs <function-name>`

### SVG sections not loading
- Use the "Auto-detect Sections" button in admin
- Ensure SVG has id attributes on section elements

## Support

For issues, please open a GitHub issue with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser console errors
4. Network request failures
