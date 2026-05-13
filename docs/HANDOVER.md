# BhaktiVerse — Claude Code Context Handover

This document is maintained by Claude Code and updated whenever the conversation context grows large. When you see Claude ask you to start a new session, open a new Claude Code conversation and paste the contents of this file as your first message, then continue working.

---

## Project Identity

- **App name:** BhaktiVerse
- **Type:** Guided Hindu devotional app for busy individuals and families
- **Primary repo:** https://github.com/nikhilmukka/Devotional-App
- **Backup repo:** https://github.com/nikhilmukka/BhaktiVerse-Backup
- **Local path:** `/Users/nikhilmukka/Documents/Devotional App/`
- **Full plan:** `docs/BUILD_PLAN.md`

---

## Tech Stack

- **Mobile:** React Native (Expo) — `mobile-app/` — this is the production product
- **Web:** React + Vite + Tailwind — `src/` — admin portal and public preview only
- **Backend:** Supabase (auth, Postgres, Storage, Edge Functions)
- **Billing:** RevenueCat (config exists, not live yet)
- **Notifications:** Expo push + Supabase edge function dispatch
- **Languages supported:** English, Hindi, Telugu, Kannada, Tamil, Marathi

---

## Key Constraint

**Apple Developer subscription has not been purchased yet.** All work is being done to run and test in Expo Go. The dev build and App Store submission are the final phase, done only after all features and content are complete.

---

## Build Phase Status

Update the checkbox below as each phase completes.

- [ ] **Phase 1** — Premium Infrastructure (entitlements, billing config, family plan model)
- [ ] **Phase 2** — Premium Feature Modules (meaning/learning mode, audio polish, family learning, sadhana v2)
- [ ] **Phase 3** — Notification Engine (server-side resolver, push pipeline, copy templates)
- [ ] **Phase 4** — Content Pipeline (sourcing strategy, prayers, festivals, audio, pooja guides)
- [ ] **Phase 5** — Google Login, Polish, Legal (analytics, crash reporting, privacy policy, App Store metadata)
- [ ] **Phase 6** — Apple Developer subscription + dev build + App Store submission

---

## What Was Last Worked On

_Claude will update this section before asking for a context window reset._

**Last session date:** 2026-05-13  
**Last completed task:** Initial setup — committed all pending code, pushed to both repos, created BUILD_PLAN.md and HANDOVER.md  
**Next task to start:** Phase 1.1 — Add `user_entitlements` table to Supabase schema

---

## Decisions Already Made

- Apple Developer subscription purchased at the very end (Phase 6)
- Mobile app (Expo) is the production product; web is admin + preview only
- RevenueCat is the chosen billing provider
- Three subscription tiers: free, premium_individual, premium_family
- Product identifiers: `premium_individual_monthly`, `premium_individual_yearly`, `premium_family_yearly`
- Premium is NOT a content lock — it's guidance, convenience, personalization, and family value
- Google login deferred until dev build (email auth works now)
- Content upload deferred until copyright sourcing strategy is finalized
- Community features, smart speaker integration, AI voice cloning — all deferred post-launch

---

## Git Remotes

```
origin  → https://github.com/nikhilmukka/Devotional-App (primary)
backup  → https://github.com/nikhilmukka/BhaktiVerse-Backup (backup)
```

Push to backup after each phase: `git push backup main`

---

## Key Files Quick Reference

| Area | Path |
|------|------|
| App context / auth state | `mobile-app/src/context/AppContext.tsx` |
| Supabase auth | `mobile-app/src/lib/supabase/auth.ts` |
| Billing config | `mobile-app/src/lib/billing/config.ts` |
| Billing service | `mobile-app/src/lib/billing/revenuecat.ts` |
| Notifications | `mobile-app/src/lib/notifications.ts` |
| Premium screen | `mobile-app/src/screens/PremiumScreen.tsx` |
| Daily Sadhana | `mobile-app/src/screens/DailySadhanaScreen.tsx` |
| Family Learning | `mobile-app/src/screens/FamilyLearningScreen.tsx` |
| Prayer Detail | `mobile-app/src/screens/PrayerDetailScreen.tsx` |
| Audio screen | `mobile-app/src/screens/AudioScreen.tsx` |
| Reminders | `mobile-app/src/screens/RemindersScreen.tsx` |
| Shloka Notebook | `mobile-app/src/screens/ShlokaNotebookScreen.tsx` |
| Admin portal | `src/app/pages/AdminContentPage.tsx` |
| Supabase schema | `supabase/schema.sql` |
| Notification fn | `supabase/functions/dispatch-reminder-notifications/index.ts` |
| Full build plan | `docs/BUILD_PLAN.md` |
| This document | `docs/HANDOVER.md` |
