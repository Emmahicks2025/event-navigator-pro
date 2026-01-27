# Database Setup Guide

This directory contains the complete database schema and seed data for the Ticket Platform.

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema including tables, functions, triggers, and RLS policies |
| `seed.sql` | Sample data for categories, venues, performers, and configuration |

## Quick Setup with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

### 2. Run the Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `schema.sql` and execute it
3. This creates all tables, functions, triggers, and security policies

### 3. Run the Seed Data

1. Copy the contents of `seed.sql` and execute it
2. This populates categories and sample data

### 4. Enable Auth Trigger

After the schema is in place, run this to auto-create profiles:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Create Admin User

1. Sign up through the app or create a user in Supabase Auth
2. Get the user's UUID from the auth.users table
3. Grant admin role:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR-USER-UUID-HERE', 'admin');
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## Database Schema Overview

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

### Configuration

- **featured_config** - Homepage and featured content settings

## Security

All tables have Row Level Security (RLS) enabled:

- **Public read**: categories, venues, performers, sections, active events
- **Authenticated**: users can view/create their own orders and profiles
- **Admin only**: full CRUD on all tables, user role management

## Backup & Restore

### Export Data

```bash
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Import Data

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

## Migrations

For production deployments, use Supabase CLI:

```bash
supabase migration new my_migration
supabase db push
```
