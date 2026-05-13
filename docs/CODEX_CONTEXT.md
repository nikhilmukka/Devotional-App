1. App Goal
BhaktiVerse is a devotional mobile-first app with a supporting web admin portal. The product focus is:

daily prayer discovery and reading
audio and festival-guided practice
premium devotional features
reminders and push notifications
personalized flows like Daily Sadhana and Kids & Family Learning
web/admin mainly for content management and diagnostics

2. Tech Stack

Mobile: React Native + Expo
Web/admin: React + Vite
Backend/Auth/DB/Functions: Supabase
Billing: RevenueCat
Push: Expo Notifications
Language: TypeScript

3. Current Folder Structure
Main repo: Devotional App

Important areas:

Mobile app: mobile-app
Web app/admin: src
Supabase SQL/functions: supabase
Project docs: docs

4. Features Already Completed

Email/password auth with Supabase
Premium Test Store flow with RevenueCat for signed-in users
Premium gating for notebook and related mobile surfaces
Private Shloka Notebook
Personal recitation recording groundwork
Festival guides
Reminder backend:
device registration
queueing
dispatch edge function
scheduler
cleanup schedule
admin diagnostics
activity logging
Daily Sadhana:
settings
generated flow
completion tracking
streak/progress
Kids & Family Learning:
settings
generated flow
completion tracking
progress
Web admin/content management is in good shape
Web diagnostics tab for reminder backend health

5. Features Partially Completed

Google login:
browser OAuth opens
trust screen appears
callback path partly wired
still not completing sign-in in Expo Go
Push notifications:
backend send path works
Expo receipts return ok
local preview works
Expo Go remote push visibility is inconsistent, likely an Expo Go/dev-session limitation
Premium reminder settings:
festival preparation reminders now queue correctly once entitlement + festival data exist
end-to-end backend path works

6. Features Pending

Real store billing beyond RevenueCat Test Store
Google login final completion in a proper dev build / reliable Expo flow
Final push validation in dev/release build, not Expo Go
More premium features and polish
Content loading / production devotional content
Release cleanup:
remove/hide dev testing tools
remove temporary QA surfaces
Analytics/crash reporting/legal/store prep

7. Known Bugs / Issues

Main blocker: Google login in Expo Go still returns to the app without completing session; login screen remains in processing state
Expo Go often shows reconnecting / dev-session instability
Remote push may show as Sent in backend but not visibly appear in Expo Go; local notifications do work
Some reminder/dev tools are intentionally still visible and should be removed later
8. Important Decisions Already Made

Mobile is the main user product surface
Web is primarily for content management/admin/diagnostics, not full end-user subscription checkout
Keep temporary reminder QA/dev controls for now, but track them for later removal
Use Supabase as source of truth for entitlement sync
Treat Expo Go notification behavior as non-production-trustworthy; final validation should happen in a proper build

9. Commands Used To Run / Build
From repo root:

cd "/Users/nikhilmukka/Documents/Devotional App"
npm run dev
npm run build
From mobile app:

cd "/Users/nikhilmukka/Documents/Devotional App/mobile-app"
HOME=/tmp npx expo start --go -c
npx tsc --noEmit
Supabase function deploy:

cd "/Users/nikhilmukka/Documents/Devotional App"
npx supabase functions deploy dispatch-reminder-notifications

10. Files To Ask The Next Chat To Inspect First
For the current Google-login blocker:

mobile-app/src/lib/supabase/auth.ts
mobile-app/src/context/AppContext.tsx
mobile-app/src/screens/LoginScreen.tsx
mobile-app/app.json
For reminder/backend context:

supabase/functions/dispatch-reminder-notifications/index.ts
supabase/notification-dispatch-setup.sql
supabase/notification-dispatch-scheduler-setup.sql
src/app/pages/AdminContentPage.tsx
For recent premium/personalization work:

mobile-app/src/screens/DailySadhanaScreen.tsx
mobile-app/src/screens/KidsFamilyLearningScreen.tsx
docs/production-readiness-checklist.md
A good first instruction for the next chat would be:

“Please inspect the current Expo Go Google OAuth flow, especially auth.ts, AppContext.tsx, LoginScreen.tsx, and app.json, and fix the stuck processing issue without rewriting unrelated auth flows.”