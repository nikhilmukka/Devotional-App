# Supabase Integration Plan

## Goal

Move the current mobile app from mock data to real data by introducing:

- Supabase Auth for email/password and Google login
- Postgres tables for prayers, deities, festivals, translations, reminders, and user data
- Supabase Storage for avatars and prayer audio
- Row Level Security for all user-owned records

This plan keeps the UI you approved and replaces the hardcoded data layer underneath it.

## Build Phases

### Phase 1. Supabase Project Setup

Create a Supabase project and configure:

- authentication
- database
- storage
- row level security

Actions:

1. Create a new Supabase project.
2. Save the project URL and anon key.
3. Enable email/password auth.
4. Enable Google auth.
5. Create storage buckets:
   - `avatars`
   - `prayer-audio`
   - `festival-media`
   - `deity-icons`

## Phase 2. Database Schema

Run the SQL files in this order:

1. [supabase/schema.sql](/Users/nikhilmukka/Documents/Devotional%20App/supabase/schema.sql)
2. [supabase/seed.sql](/Users/nikhilmukka/Documents/Devotional%20App/supabase/seed.sql)

The schema is designed around these application needs:

- app language selection
- English UI with source-language prayer transliteration
- prayer search by prayer, deity, and festival
- daily and festival reminders
- user favorites and devices
- future audio and subscription support

## Phase 3. Mobile App Integration

Add Supabase to the Expo app and create a clean client layer.

Recommended mobile additions:

- `mobile-app/src/lib/supabase/client.ts`
- `mobile-app/src/lib/supabase/auth.ts`
- `mobile-app/src/lib/supabase/content.ts`
- `mobile-app/src/lib/supabase/reminders.ts`
- `mobile-app/src/lib/supabase/profile.ts`

Recommended environment variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Use the template in:

- [mobile-app/.env.example](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/.env.example)

## Phase 4. Replace Mock Data

Replace the hardcoded mobile app content in this order:

1. Auth state
2. Profile data
3. Home screen content
4. Search results
5. Prayer detail content
6. Favorites
7. Reminder settings
8. Audio metadata

Recommended sequence:

1. Login / signup with Supabase Auth
2. Profiles table sync after sign in
3. Real Home data from database
4. Real Search data from database
5. Real Prayer Detail data from database
6. Real Favorites using `user_favorites`
7. Real Reminders using `user_preferences`, `festival_calendar`, and `reminder_rules`

## Phase 5. Notifications

After content and auth are stable:

1. Register Expo push token in `user_devices`
2. Save user reminder preferences
3. Build scheduled reminder resolution
4. Send only one active reminder for a day:
   - festival prayer if a festival exists for today
   - otherwise daily prayer

The scheduler logic should resolve reminders from the database, not from app code.

## Data Model Summary

### Content

- `deities`
- `deity_translations`
- `festivals`
- `festival_translations`
- `festival_calendar`
- `prayers`
- `prayer_texts`
- `prayer_audio_tracks`
- `prayer_festivals`
- `reminder_rules`

### User

- `profiles`
- `user_preferences`
- `user_favorites`
- `user_devices`
- `notification_logs`

## Language Strategy

The mobile app should load prayer text this way:

1. If app language is not English:
   - load `prayer_texts` using that language and `script_code = 'native'`
2. If app language is English:
   - load `prayer_texts` using `prayer_source_language` and `script_code = 'latin'`

This matches the behavior we already agreed on.

## Recommended Implementation Order

### Immediate next development step

1. Create the Supabase project
2. Run schema and seed files
3. Add Supabase client to Expo app
4. Replace mock auth with real auth

### After that

1. Hook Home/Search/Prayer Detail to live data
2. Hook Favorites to live data
3. Hook Profile to live data
4. Hook Reminders and notifications

## Decisions Already Locked

- Mobile app: Expo React Native + TypeScript
- Backend: Supabase
- Database: Postgres
- Notifications: Expo Notifications
- Subscription later: RevenueCat
- Content-first app model with database-driven prayers, deities, festivals, and audio

## Practical Advice

Do not start with notifications or subscriptions next.

The cleanest and safest next implementation path is:

1. database schema
2. auth
3. live content reads
4. favorites/profile
5. reminders
6. push notifications
