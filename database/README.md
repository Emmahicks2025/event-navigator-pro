# Database Setup Guide

This directory contains the complete database schema and seed data for the Ticket Platform.

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema including tables, functions, triggers, RLS policies, and storage setup |
| `seed.sql` | Sample data for categories, venues, performers, and configuration |

## Quick Setup with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from **Settings → API**

### 2. Run the Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Copy the contents of `schema.sql` and execute it
3. This creates all tables, functions, triggers, and security policies

### 3. Run the Seed Data

1. Copy the contents of `seed.sql` and execute it
2. This populates categories, sample venues, and performers

### 4. Create Storage Buckets

Run this SQL to set up file storage:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-maps', 'venue-maps', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('performer-images', 'performer-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('temp-uploads', 'temp-uploads', true);

-- Public read policies
CREATE POLICY "Public can view venue maps" ON storage.objects FOR SELECT USING (bucket_id = 'venue-maps');
CREATE POLICY "Public can view performer images" ON storage.objects FOR SELECT USING (bucket_id = 'performer-images');
CREATE POLICY "Public can view temp uploads" ON storage.objects FOR SELECT USING (bucket_id = 'temp-uploads');

-- Admin upload policies
CREATE POLICY "Admins can upload venue maps" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'venue-maps');
CREATE POLICY "Admins can update venue maps" ON storage.objects FOR UPDATE USING (bucket_id = 'venue-maps');
CREATE POLICY "Admins can upload performer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'performer-images');
CREATE POLICY "Admins can update performer images" ON storage.objects FOR UPDATE USING (bucket_id = 'performer-images');
```

### 5. Enable Auth Trigger

After the schema is in place, run this to auto-create profiles:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Create Admin User

1. Sign up through the app or create a user in Supabase Auth
2. Get the user's UUID from **Authentication → Users**
3. Grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR-USER-UUID-HERE', 'admin');
```

---

## Database Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `categories` | Event categories (Concerts, Sports, Theater, Comedy) |
| `venues` | Event locations with optional SVG seating maps |
| `sections` | Venue sections (parsed from SVG maps) |
| `performers` | Artists, teams, and performers |
| `events` | Main events with date, venue, and pricing |

### Ticketing Tables

| Table | Description |
|-------|-------------|
| `event_sections` | Per-event section pricing and availability |
| `seats` | Individual seats within sections |
| `ticket_inventory` | Available tickets for purchase |

### User & Order Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `user_roles` | Role-based access (admin, moderator, user) |
| `orders` | Purchase orders |
| `order_items` | Individual items within orders |
| `sell_requests` | User ticket selling requests |

### Configuration

| Table | Description |
|-------|-------------|
| `featured_config` | Homepage and featured content settings |

---

## Security (RLS)

All tables have Row Level Security (RLS) enabled:

- **Public read**: categories, venues, performers, sections, active events
- **Authenticated**: users can view/create their own orders and profiles
- **Admin only**: full CRUD on all tables, user role management

---

## Database Functions

| Function | Description |
|----------|-------------|
| `is_admin()` | Check if current user is admin |
| `is_moderator_or_admin()` | Check if current user is moderator or admin |
| `has_role(user_id, role)` | Check if specific user has a role |
| `handle_new_user()` | Auto-create profile and role on signup |
| `generate_order_number()` | Generate unique order numbers |
| `update_updated_at_column()` | Auto-update timestamps |

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## Backup & Restore

### Export Data

```bash
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Import Data

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Migrations

For production deployments, use Supabase CLI:

```bash
supabase migration new my_migration
supabase db push
```
