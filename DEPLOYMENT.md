# Ticket Platform - Complete Deployment Guide

A full-featured ticket booking platform with interactive seat maps, event management, and admin dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- Git
- Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone <your-github-repo-url>
cd <project-folder>
npm install
```

### 2. Set Up Supabase

#### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization, name, database password, and region
4. Wait for project to be ready (~2 minutes)

#### Run Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Open `database/schema.sql` from this repo
3. Copy and paste the entire file into the SQL Editor
4. Click **Run** to execute

#### Run Seed Data
1. Open `database/seed.sql`
2. Copy and paste into SQL Editor
3. Click **Run** to execute

#### Enable Auth Trigger
Run this SQL to auto-create profiles for new users:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Create Storage Buckets
Run this SQL to set up file storage:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-maps', 'venue-maps', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('performer-images', 'performer-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('temp-uploads', 'temp-uploads', true);

-- Storage policies for public read access
CREATE POLICY "Public can view venue maps" ON storage.objects FOR SELECT USING (bucket_id = 'venue-maps');
CREATE POLICY "Public can view performer images" ON storage.objects FOR SELECT USING (bucket_id = 'performer-images');
CREATE POLICY "Public can view temp uploads" ON storage.objects FOR SELECT USING (bucket_id = 'temp-uploads');

-- Admin upload policies (uses is_moderator_or_admin function from schema)
CREATE POLICY "Admins can upload venue maps" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'venue-maps');
CREATE POLICY "Admins can update venue maps" ON storage.objects FOR UPDATE USING (bucket_id = 'venue-maps');
CREATE POLICY "Admins can upload performer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'performer-images');
CREATE POLICY "Admins can update performer images" ON storage.objects FOR UPDATE USING (bucket_id = 'performer-images');
```

### 3. Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-ID
```

Find these values in Supabase: **Settings → API**

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Create Admin User

1. Sign up through the app at `/auth`
2. Get your user ID from Supabase: **Authentication → Users**
3. Run in SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR-USER-UUID', 'admin');
```

4. Sign out and back in to refresh your session
5. Access admin dashboard at `/admin`

---

## 📁 Project Structure

```
├── database/
│   ├── schema.sql          # Complete database schema with RLS
│   ├── seed.sql            # Sample data (categories, venues, performers)
│   └── README.md           # Database documentation
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── admin/          # Admin-specific components
│   ├── pages/              # Route pages
│   │   └── admin/          # Admin dashboard pages
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context (Cart, Auth)
│   ├── types/              # TypeScript types
│   ├── data/               # Mock data and utilities
│   └── integrations/       # Supabase client
├── supabase/
│   ├── functions/          # Edge functions
│   └── config.toml         # Supabase configuration
├── public/
│   ├── performers/         # Performer images
│   └── temp/               # Temporary upload files
└── DEPLOYMENT.md           # This file
```

---

## ✨ Features

### Public Features
- 🎫 Browse events by category (Concerts, Sports, Theater, Comedy)
- 🔍 Search events, performers, and venues
- 🗺️ Interactive SVG venue maps with section selection
- 🛒 Shopping cart with seat selection
- 💳 Checkout flow with order confirmation
- 📱 Fully responsive design

### Admin Features (`/admin`)
- 📊 Dashboard with event statistics
- 🏟️ Venue management with SVG map upload
- 🎭 Performer management with image caching
- 📅 Event creation and editing
- 🎫 Ticket inventory management
- 📋 Bulk import from Excel files
- 🗃️ Bulk SVG map upload from ZIP files
- 📝 Sell request management
- 👥 Order viewing and management

---

## 🌐 Production Deployment

### Deploy Frontend

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

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

Edge functions in `supabase/functions/` deploy via Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-ID
supabase functions deploy
```

---

## 🔧 Edge Functions

| Function | Description |
|----------|-------------|
| `cache-performer-images` | Caches performer images to storage |
| `detect-venue-from-svg` | AI-powered venue detection from SVG maps |
| `fetch-venue-maps` | Fetches venue maps from external sources |
| `import-events-with-maps` | Bulk imports events with venue mapping |
| `parse-svg-sections` | Extracts sections from SVG venue maps |
| `populate-inventory` | Auto-generates ticket inventory for events |
| `process-uploaded-data` | Processes uploaded Excel/CSV files |
| `process-venue-maps` | Processes and stores venue SVG maps |
| `seed-events-data` | Seeds initial event data |
| `update-performer-images` | Updates performer images from URLs |

---

## 🔐 Security

All tables have Row Level Security (RLS) enabled:

| Access Level | Tables |
|--------------|--------|
| **Public read** | categories, venues, performers, sections, active events, event_sections, seats, ticket_inventory |
| **Authenticated** | Own orders, own profile, own order items |
| **Admin/Moderator** | Full CRUD on events, performers, venues, sections, inventory |
| **Admin only** | User roles, all profiles, categories management |

---

## 🔌 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

---

## 🐛 Troubleshooting

### "Permission denied" errors
- Check RLS policies are correctly set up
- Ensure user has correct role in `user_roles` table
- Sign out and back in after role changes

### Edge functions not working
- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs <function-name>`
- Ensure required secrets are set in Supabase dashboard

### SVG maps not displaying
- Use the "Venue Maps" admin page to bulk upload maps
- Ensure SVG files have proper id attributes on sections
- Check browser console for CORS or fetch errors

### Images not loading
- Verify storage buckets exist and have public policies
- Check image URLs in database point to valid locations
- Use performer image caching via admin tools

---

## 📊 Database Schema Overview

### Core Tables
- **categories** - Event categories (Concerts, Sports, Theater, Comedy)
- **venues** - Event locations with optional SVG seating maps
- **sections** - Venue sections (parsed from SVG maps)
- **performers** - Artists, teams, and performers
- **events** - Main events with date, venue, and pricing

### Ticketing Tables
- **event_sections** - Per-event section pricing and availability
- **seats** - Individual seats within sections
- **ticket_inventory** - Available tickets for purchase

### User & Order Tables
- **profiles** - User profile information
- **user_roles** - Role-based access (admin, moderator, user)
- **orders** - Purchase orders
- **order_items** - Individual items within orders
- **sell_requests** - User ticket selling requests

### Configuration
- **featured_config** - Homepage and featured content settings

---

## 📞 Support

For issues, please open a GitHub issue with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser console errors
4. Network request failures
5. Screenshots if applicable

---

## 📄 License

MIT License - see LICENSE file for details.
