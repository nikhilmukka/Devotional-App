# BhaktiVerse Build Plan

**App name:** BhaktiVerse  
**Primary repo:** https://github.com/nikhilmukka/Devotional-App  
**Backup repo:** https://github.com/nikhilmukka/BhaktiVerse-Backup  
**Last updated:** 2026-05-13  
**Constraint:** Apple Developer subscription purchased at the very end, after all feature and content work is complete.

---

## Project Overview

BhaktiVerse is a guided Hindu devotional app for busy individuals and families.

- **Mobile app:** React Native (Expo) — `mobile-app/` — production direction
- **Web app:** React + Vite — `src/` — admin portal and public preview surface
- **Backend:** Supabase (auth, database, storage, edge functions)
- **Billing:** RevenueCat (configured but not live yet)
- **Notifications:** Expo push + Supabase edge function dispatch

---

## What Is Already Built

- Email/password auth with Supabase
- Mobile screens: Home, Search, Prayer Detail, Audio, Reminders, Favorites, Profile, Login
- Premium screens: Premium, Daily Sadhana, Kids & Family Learning, Shloka Notebook, Recitation
- Festival guides module
- Admin portal (full CRUD: deities, festivals, prayers, audio, reminder rules)
- Supabase schema: profiles, user_preferences, deities, festivals, prayers, prayer_texts, audio_tracks, reminder_rules, user_favorites, user_devices, notification_logs
- Reminder backend: device registration, queue, dispatch edge function, scheduler, cleanup, diagnostics
- RevenueCat billing config and billing service abstraction (not live)
- Premium gating foundation (placeholder flags, not real entitlements)
- Multilingual support: English, Hindi, Telugu, Kannada, Tamil, Marathi
- Web admin portal and public browsing experience

---

## Build Phases

### Phase 1 — Premium Infrastructure
**Goal:** Replace placeholder premium flags with a real entitlement model. No real purchases yet, but the architecture must be production-ready.

**Tasks:**

- [ ] 1.1 Add `user_entitlements` table to Supabase schema
  - Fields: `user_id`, `plan` (free / premium_individual / premium_family), `source` (revenuecat / manual), `valid_until`, `created_at`
  - File: `supabase/schema.sql` + new migration file
- [ ] 1.2 Replace premium placeholder flags in `AppContext.tsx` with entitlement reads from Supabase
  - File: `mobile-app/src/context/AppContext.tsx`
- [ ] 1.3 Add billing config with final product identifiers
  - Products: `premium_individual_monthly`, `premium_individual_yearly`, `premium_family_yearly`
  - File: `mobile-app/src/lib/billing/config.ts`
- [ ] 1.4 Update billing service abstraction to handle free / premium_individual / premium_family tiers
  - File: `mobile-app/src/lib/billing/revenuecat.ts`
- [ ] 1.5 Update Premium screen with proper plan selection UI, restore purchases button, and pricing display
  - File: `mobile-app/src/screens/PremiumScreen.tsx`
- [ ] 1.6 Add family plan data model — shared entitlement recognition, multiple profiles groundwork
  - New Supabase table: `family_members`
- [ ] 1.7 Gate all premium features in mobile app using real entitlement state (not flags)

---

### Phase 2 — Premium Feature Modules
**Goal:** Build the premium features that drive subscription value. All testable in Expo Go.

**Tasks:**

- [ ] 2.1 Meaning / Pronunciation / Learning Mode
  - Add `transliteration`, `meaning`, `pronunciation_notes`, `usage_context` fields to `prayer_texts` table
  - Show line-by-line meaning on Prayer Detail screen (premium gated)
  - File: `mobile-app/src/screens/PrayerDetailScreen.tsx`
  - Admin: add meaning/transliteration fields to prayer text management
  - File: `src/app/pages/AdminContentPage.tsx`

- [ ] 2.2 Premium Audio Polish
  - Curated playlists UI — group audio by category/deity/festival
  - Audio categorization in admin
  - Background audio UI (lock screen controls — full validation deferred to dev build)
  - File: `mobile-app/src/screens/AudioScreen.tsx`

- [ ] 2.3 Kids & Family Learning — strengthen existing module
  - Beginner shloka sets with simple age-friendly explanations
  - Practice repetition flow (show shloka → hide → recall)
  - Parent-child session mode
  - File: `mobile-app/src/screens/FamilyLearningScreen.tsx`

- [ ] 2.4 Daily Sadhana v2
  - Stronger personalization: preferred deity, time available, routine length
  - Saved history and streak display
  - Better recommendation logic (match prayers to sadhana profile)
  - File: `mobile-app/src/screens/DailySadhanaScreen.tsx`

- [ ] 2.5 Personal Recitation Recording — polish and QA
  - Confirm record, save, replay flow works reliably
  - File: `mobile-app/src/lib/recitations.ts`

---

### Phase 3 — Notification Engine
**Goal:** Turn the existing reminder groundwork into a real server-side push delivery system.

**Tasks:**

- [ ] 3.1 Server-side reminder resolver (Supabase Edge Function)
  - Logic: if today is a festival and user has festival reminders on → send festival prayer notification; otherwise send daily prayer notification
  - File: `supabase/functions/dispatch-reminder-notifications/index.ts` (extend existing)

- [ ] 3.2 Push sending pipeline
  - Integrate Expo push API in edge function
  - Handle token lookup from `user_devices` table
  - Write result to `notification_logs`
  - Retry/backoff for failed sends

- [ ] 3.3 Notification copy templates
  - Define message templates for: daily reminder, festival reminder, festival preparation reminder, vrat reminder
  - Multilingual templates (English + Hindi at minimum)

- [ ] 3.4 Admin diagnostics — verify notification logs are visible in admin
  - File: `src/app/pages/AdminContentPage.tsx`

- [ ] 3.5 Remove dev-only reminder test controls from normal user UI
  - File: `mobile-app/src/screens/RemindersScreen.tsx`

---

### Phase 4 — Content Pipeline
**Goal:** Load real, reviewed, copyright-safe devotional content.

**Tasks:**

- [ ] 4.1 Define content sourcing strategy
  - Identify which texts are public domain (pre-1928 Sanskrit originals)
  - Identify which translations are original vs licensed
  - Create a rights ledger document: `docs/content-rights-ledger.md`

- [ ] 4.2 Load production deities via admin
  - Priority deities for launch set

- [ ] 4.3 Load production prayers and prayer texts
  - Source language versions
  - English translations
  - Transliterations and meanings (for learning mode)

- [ ] 4.4 Load festival records and festival calendar entries
  - 2026 and 2027 festival dates

- [ ] 4.5 Load festival pooja guides
  - Samagri checklist, preparation notes, step-by-step pooja flow, vrat notes
  - At minimum for: Navratri, Diwali, Ganesh Chaturthi, Janmashtami, Shivaratri

- [ ] 4.6 Load audio catalog
  - Upload audio files via admin audio management
  - Link audio to prayers

- [ ] 4.7 Review all devotional wording across the app for accuracy and consistency

---

### Phase 5 — Google Login, Polish & Legal
**Goal:** Complete auth, clean up UI, add observability, prepare legal assets.

**Tasks:**

- [ ] 5.1 Google login — finish Supabase Google provider flow
  - Final validation in Expo Go first
  - File: `mobile-app/src/lib/supabase/auth.ts`

- [ ] 5.2 UI cleanup
  - Layout review on small phones (SE) and large phones (Pro Max)
  - Copy review on: Premium screen, Reminders screen, Notebook screen, Sadhana screen
  - Confirm no broken layouts

- [ ] 5.3 Analytics — add for key funnels
  - Sign up, premium view, purchase attempt, reminder enable, notebook usage
  - Recommended: Expo analytics or PostHog

- [ ] 5.4 Crash reporting
  - Recommended: Sentry for React Native

- [ ] 5.5 Privacy policy page — add in-app link and host document
- [ ] 5.6 Terms of service — add in-app link
- [ ] 5.7 App Store metadata
  - App name, subtitle, description, keywords
  - Screenshots (6.7", 6.1", iPad if needed)
  - App icon final review
  - `app.json` metadata review

---

### Phase 6 — Apple Developer Subscription + Dev Build + Launch (Last)
**Goal:** Final validation on real device and App Store submission.

**Prerequisite:** Purchase Apple Developer Program ($99/year).

**Tasks:**

- [ ] 6.1 Purchase Apple Developer Program subscription
- [ ] 6.2 Configure EAS build profiles in `eas.json` (development, preview, production)
- [ ] 6.3 Create iPhone development build via EAS
- [ ] 6.4 Validate on real device:
  - Login / logout / session persistence
  - Audio playback
  - Notebook and recitation
  - Premium screens
  - Notification permission flow
- [ ] 6.5 Validate Google login on real device (deep link callback)
- [ ] 6.6 Validate push notifications on real device
- [ ] 6.7 Connect RevenueCat to real App Store products
  - Configure products in App Store Connect
  - Set up sandbox test accounts
  - Validate purchase / restore / expiry flows
- [ ] 6.8 Configure production Supabase settings (prod keys, RLS review)
- [ ] 6.9 Configure production RevenueCat keys
- [ ] 6.10 Final QA pass across all features and user types (guest, free, premium)
- [ ] 6.11 Create release build via EAS
- [ ] 6.12 Submit to App Store

---

## Git Workflow

- Primary repo: `origin` → `https://github.com/nikhilmukka/Devotional-App`
- Backup repo: `backup` → `https://github.com/nikhilmukka/BhaktiVerse-Backup`
- Push to backup after each phase completion: `git push backup main`
- Commit frequently, one logical change per commit

---

## Key File Reference

| Area | File |
|------|------|
| Mobile navigation | `mobile-app/src/navigation/AppNavigator.tsx` |
| App state / auth | `mobile-app/src/context/AppContext.tsx` |
| Supabase auth | `mobile-app/src/lib/supabase/auth.ts` |
| Supabase client | `mobile-app/src/lib/supabase/client.ts` |
| Billing config | `mobile-app/src/lib/billing/config.ts` |
| Billing service | `mobile-app/src/lib/billing/revenuecat.ts` |
| Billing types | `mobile-app/src/lib/billing/types.ts` |
| Notifications | `mobile-app/src/lib/notifications.ts` |
| Recitations | `mobile-app/src/lib/recitations.ts` |
| Theme colors | `mobile-app/src/theme/colors.ts` |
| Home screen | `mobile-app/src/screens/HomeScreen.tsx` |
| Prayer detail | `mobile-app/src/screens/PrayerDetailScreen.tsx` |
| Audio screen | `mobile-app/src/screens/AudioScreen.tsx` |
| Premium screen | `mobile-app/src/screens/PremiumScreen.tsx` |
| Reminders | `mobile-app/src/screens/RemindersScreen.tsx` |
| Daily Sadhana | `mobile-app/src/screens/DailySadhanaScreen.tsx` |
| Family Learning | `mobile-app/src/screens/FamilyLearningScreen.tsx` |
| Shloka Notebook | `mobile-app/src/screens/ShlokaNotebookScreen.tsx` |
| Admin portal | `src/app/pages/AdminContentPage.tsx` |
| Supabase schema | `supabase/schema.sql` |
| Notification fn | `supabase/functions/dispatch-reminder-notifications/index.ts` |
| Web content lib | `src/app/lib/webContent.ts` |

---

## Context Window Handover

When context becomes large, Claude will create `docs/HANDOVER.md` and ask you to start a new session. The handover document will contain everything a fresh Claude instance needs to continue without losing context.
