# Conversation History

This file is a saved project history based on our collaboration from the beginning of this app build.

Important note:
- This is a structured project log, not a guaranteed exact export of every chat bubble from the interface.
- It is intended to preserve decisions, milestones, fixes, and agreed direction so work can continue safely later.

## 1. Initial Product Vision

The app started as a devotional Hindu prayer application with these core goals:
- multilingual prayers for different deities
- database-controlled content
- iOS App Store and Android Play Store launch
- login/signup with email storage
- Google login
- home search by deity, festival, or prayer name
- calendar-based reminders
- profile management

Future vision shared early:
- festival-specific step-by-step pooja guidance
- audio prayers and pooja audio
- children’s learning mode
- chatbot/understanding layer
- community features
- subscription model

## 2. Figma UI Intake

We first worked from the Figma design and exported UI assets/code.

What happened:
- the Figma zip was provided
- the design was turned into an initial working prototype
- the first pass focused on matching the UI before backend work

Early screens/features built in the prototype:
- login/signup UI
- home
- search
- reminders
- profile
- audio section

## 3. Major UI Refinements Agreed Early

We refined the product direction before backend integration.

Key decisions:
- audio prayers should live in a separate section, not clutter the home screen
- search should have 3 clear modes:
  - direct prayer
  - by festival
  - by deity
- reminders should show only one effective prayer:
  - festival prayer if today is a festival
  - otherwise daily prayer
- app language and prayer source language should be separate concerns
- when app language is English:
  - app UI remains English
  - prayer text comes from a chosen source language
  - source language selector should appear only in English mode

## 4. Language and Localization Direction

We spent significant time refining language behavior.

Agreed behavior:
- full app UI should change when app language changes
- deity names, festival names, and UI labels should localize too
- prayer text will later come from database-managed language-specific content
- English mode should support prayer source language selection

Languages planned in app UI:
- English
- Hindi
- Telugu
- Kannada
- Tamil
- Marathi

Several issues were fixed:
- remaining English labels in non-English modes
- prayer title localization on audio/detail/list screens
- mobile and web localization consistency

## 5. Technology Stack Decision

We decided the production app should use:
- React Native + Expo + TypeScript
- Supabase
- Expo Notifications
- RevenueCat later for subscriptions

Why this was chosen:
- one codebase for iOS and Android
- low starting cost
- PostgreSQL-backed structured data model
- easier path for reminders, auth, storage, and future premium features

Architecture docs created:
- `docs/architecture-simple.md`
- `docs/architecture-detailed.md`

## 6. Mobile App Foundation

A real Expo React Native app was created separately from the earlier web/Figma prototype.

Major mobile milestones:
- project created in `mobile-app`
- Expo SDK alignment fixed for Expo Go
- login/signup screen built
- search screen built
- profile built
- reminders built
- favorites built
- prayer detail built
- audio screen built
- bottom navigation wired

Important mobile fixes along the way:
- login screen layout collapsing on iPhone was fixed
- profile change photo feature was wired
- app language changes were made to actually affect UI
- Saturday audio localization issue was corrected
- logout/session persistence were corrected

## 7. Supabase Setup and Integration

We then moved from mock data to real backend integration.

Database planning and files created:
- `docs/supabase-integration-plan.md`
- `supabase/schema.sql`
- `supabase/seed.sql`
- `supabase/README.md`

Database supports:
- profiles
- preferences
- deities
- deity translations
- festivals
- festival translations
- festival calendar
- prayers
- prayer texts
- audio tracks
- prayer-festival links
- reminder rules
- favorites
- user devices
- notification logs

What was connected in the app:
- real email signup/login
- session persistence
- profile sync
- language and reminder preference sync
- favorite sync

Development note agreed at the time:
- email confirmation was temporarily disabled because deep-link setup was not finalized yet

## 8. Google Login Work

We prepared Google login on the app side and walked through:
- Google Cloud OAuth setup
- Supabase Google provider setup
- redirect URL configuration

Key conclusion:
- Expo Go is unreliable for full Google OAuth callback behavior
- email login should remain the working path during development
- Google login should be finalized later in a development build / production-like build

We explicitly agreed not to block the project on Google login.

## 9. Audio and Reminder Groundwork

Audio and reminders were moved from mock-only behavior toward real structure.

Work completed:
- audio metadata support from Supabase
- reminder toggles and active reminder logic
- notification groundwork
- local notification preview
- Expo push token capture and device registration groundwork

Important product decisions:
- only one reminder should be active at a time
- reminders should be festival-aware
- audio should later be tied to real uploaded content, not hardcoded preview behavior

## 10. Admin Portal Creation

We created a separate web admin workspace so content can be managed safely.

Admin capabilities built over time:
- admin login
- admin role check
- deity creation/edit/delete
- deity translation CRUD
- festival CRUD
- festival translation CRUD
- festival calendar CRUD
- prayer CRUD
- prayer text CRUD
- audio metadata CRUD
- audio file upload to Supabase Storage
- prayer-festival linking
- reminder rule CRUD

Admin files involved:
- `src/app/pages/AdminContentPage.tsx`
- `src/app/lib/webSupabase.ts`
- `src/styles/admin.css`
- `supabase/admin-setup.sql`
- `docs/admin-workflow.md`

Admin UX improvements requested and implemented:
- duplicate detection with “open existing in edit mode”
- delete actions with confirmation
- icon choices instead of raw text
- color selection via swatches instead of raw hex-only workflow
- explanation of sort order, source name, source URL, verse count, duration
- ability to edit instead of duplicate

## 11. Copyright and Licensing Principle

This became a standing product principle.

Agreed rule:
- avoid anything with copyright/licensing ambiguity
- prefer commercially usable code/packages
- be careful with religious content, translations, transliterations, and especially audio

Important strategic conclusion:
- content should be uploaded only after there is a safe copyright/right-to-use strategy
- content upload was intentionally postponed as a major production step

## 12. Making Public Screens Database-Driven

Once admin existed, we aligned the public app/web experience with the database so new content actually appears.

Examples of issues fixed:
- newly added deity not showing on Home or Search
- newly added festival not showing due to table mismatch
- text/icon alignment issues caused by stored symbolic values like `lamp`, `flower`, `elephant`
- audio showing only uploaded items and hiding weekly schedule

Result:
- Home, festival browsing, deity browsing, prayer detail, audio, favorites, and related screens were progressively made more database-driven

## 13. Premium Strategy Brainstorm

We then paused feature building to think seriously about monetization.

Strategic conclusion:
- the app should not be “pay to read prayers”
- the app should become a structured devotional companion for modern Hindu families

High-value premium directions identified:
- festival-specific pooja guides
- personalized daily sadhana
- richer audio experience
- kids/family learning
- advanced reminder/calendar intelligence
- private saved shlokas and personal recitation

Pricing discussion outcome:
- a very low India price like `INR 200/year` likely undervalues the product
- a more credible premium devotional positioning is needed

Product docs created:
- `docs/build-status-and-premium-roadmap.md`
- `docs/product-roadmap.md`

## 14. Premium Foundation Built

We then started implementing premium infrastructure before final content upload.

Built:
- entitlements model
- premium screen
- premium teaser cards
- premium/profile state
- content access tier support on prayers and audio
- admin ability to mark prayers/audio as free or premium
- mobile gating for premium prayers and premium audio

Important bug fixed:
- premium audio was initially still playable from prayer detail via search
- that bypass was closed

## 15. Private Shloka Notebook

A major premium feature was then built.

Feature:
- users can save private shlokas for daily recitation
- premium users can access notebook
- free users see premium gate

Then extended to:
- record own recitation
- upload/store private recording
- play back and delete recording

Setup files:
- `supabase/premium-setup.sql`
- `supabase/premium-notebook-setup.sql`

Important fixes:
- notebook screen flicker fixed
- notebook load hardened so storage/signing issues do not break entire screen

## 16. Festival Pooja Guides Module

We began implementing the first real premium content module after the premium foundation.

What was added:
- `festival_pooja_guides` model in Supabase
- admin CRUD for festival guides
- mobile festival guide screen
- guide route in navigation
- Home festival cards linked into guide flow
- festival-mode search got a guide entry point

Setup files:
- `supabase/festival-guides-setup.sql`
- updated `supabase/schema.sql`
- updated `supabase/admin-setup.sql`

## 17. Search Behavior Improvement

A usability issue was discovered:
- `By Festival` and `By Deity` were still basically showing only filtered prayers

This was corrected so that:
- festival search shows actual festival results first
- deity search shows actual deity results first
- related prayers appear as a secondary section

This made search behave like a true multi-path discovery flow.

## 18. Current Working Product State

As of this saved history, the app includes:

Mobile:
- email auth
- profile and preferences
- language switching
- prayer source language logic
- search
- favorites
- reminders groundwork
- audio with improved seeking
- premium screen
- private shloka notebook
- personal recitation recording
- festival guide flow

Web/Admin:
- authenticated admin portal
- CRUD across main content workflows
- audio upload
- duplicate/edit/delete management
- premium flags on content
- festival guide management

Backend:
- Supabase schema for core app entities
- premium entitlements
- notebook storage
- content access tiers
- festival guides

## 19. Known Deferred Items

These were intentionally not treated as fully complete yet:
- final Google login in a development build
- full push notification production pipeline
- actual content/legal sourcing workflow
- RevenueCat billing integration
- development build / App Store production testing
- final premium module expansion beyond the first set

## 20. Standing Product Principles Agreed

These were repeated and should continue guiding future work:
- prioritize clean structure over content flooding
- keep copyright/licensing safe
- do not ship a generic prayer-library app
- build for busy families, learners, and practical devotional use
- keep the free tier meaningful
- monetize guidance, structure, personalization, and convenience

## 21. Recommended Next Resume Point

If work resumes later, a sensible order is:

1. complete remaining premium modules and paywall/entitlement polish
2. finish development-build testing for Google login and notifications
3. refine premium/free content behavior across all surfaces
4. only then begin curated copyright-safe content loading at scale

## 22. Useful Run Commands

Mobile app:

```bash
cd "/Users/nikhilmukka/Documents/Devotional App/mobile-app"
HOME=/tmp npx expo start -c
```

Web/admin:

```bash
cd "/Users/nikhilmukka/Documents/Devotional App"
npm run dev
```

Admin URL:

```text
http://localhost:5173/admin
```
