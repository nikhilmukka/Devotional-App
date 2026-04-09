# BhaktiVerse Admin Workflow

## What This Adds

This project now includes a web admin route at `/admin` for managing:

- deities
- deity translations
- festivals
- festival translations
- festival calendar dates
- prayers
- prayer to festival links
- prayer texts
- audio metadata
- reminder rules

It also now supports uploading audio files directly into the `prayer-audio` Supabase bucket from the admin portal.
Existing records can be loaded back into the forms for editing, so content changes do not have to create duplicates.
Delete actions are also available across the main admin lists with confirmation prompts.

## One-Time Supabase Setup

Run this SQL file in your Supabase SQL Editor:

- [`supabase/admin-setup.sql`](/Users/nikhilmukka/Documents/Devotional%20App/supabase/admin-setup.sql)

That file:

- adds `profiles.is_admin`
- creates an `is_admin_user()` helper
- adds authenticated admin write policies for content tables
- configures the `prayer-audio` storage bucket for admin uploads and public test playback

## Grant Your Account Admin Access

After you have logged into the mobile app or admin once so your profile row exists, run:

```sql
update public.profiles
set is_admin = true
where email = 'your-email@example.com';
```

Replace the email with your real login email.

## Web Admin Environment

The web app uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are now set in the root `.env` file for local development.

## Run The Admin

```bash
cd "/Users/nikhilmukka/Documents/Devotional App"
npm run dev
```

Then open:

```text
http://localhost:5173/admin
```

## Current Scope

This version is ready for day-to-day content management across the main devotional catalog:

- create and edit catalog records
- delete catalog records with confirmation prompts
- maintain festival calendar dates
- link prayers to festivals
- upload audio into Supabase Storage
- manage daily and festival reminder rules

Still not included:

- role management UI
- audit logs
