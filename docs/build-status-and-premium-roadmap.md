# BhaktiVerse Build Status And Premium Roadmap

## Purpose

This document captures:

- what has already been built across web, mobile, backend, and admin
- what is still incomplete or intentionally deferred
- which premium and subscription features are worth building next
- the recommended order of execution before launch

This is the current working product and monetization reference for BhaktiVerse.

## Product Direction

BhaktiVerse should not position itself as a generic prayer-content library.

The stronger direction is:

> a guided devotional companion for modern Hindu individuals and families, especially those with busy schedules, limited ritual knowledge, or diaspora needs

The most defensible long-term value is:

- structured daily practice
- guided festival worship
- multilingual access
- premium audio and convenience
- family and children learning
- reminder-driven habit formation

## What Has Been Built So Far

## 1. Web Prototype And Public Experience

The web prototype is running from the root app and includes the main public browsing experience.

Built public screens:

- splash screen
- login screen
- home
- search
- festival list
- festival prayer list
- prayer list
- prayer detail
- audio
- reminders
- favorites
- profile

Current public web behavior:

- Home, Search, Festival pages, Audio, Favorites, Prayer Detail, and Profile now read from live Supabase-backed content where available
- fallback logic still exists in some places so the public experience does not break if live content is missing
- live deities, festivals, prayers, festival dates, prayer texts, and audio metadata are now flowing into the public web app

Important note:

- the web app is still partly a polished prototype layer and partly a live content surface
- it is useful for review, admin verification, and content checks
- the production app direction remains the Expo React Native mobile app

Key web files:

- [src/app/pages/HomeScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/HomeScreen.tsx)
- [src/app/pages/SearchScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/SearchScreen.tsx)
- [src/app/pages/AudioPrayerScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/AudioPrayerScreen.tsx)
- [src/app/pages/FestivalListScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/FestivalListScreen.tsx)
- [src/app/pages/FestivalPrayerListScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/FestivalPrayerListScreen.tsx)
- [src/app/pages/PrayerDetailScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/PrayerDetailScreen.tsx)
- [src/app/lib/webContent.ts](/Users/nikhilmukka/Documents/Devotional%20App/src/app/lib/webContent.ts)

## 2. Mobile App Foundation

A separate Expo React Native app has already been created and is the real production mobile base.

Built mobile screens:

- login and signup
- home
- search
- prayer detail
- audio
- reminders
- favorites
- profile

Built mobile behaviors:

- email signup and login with Supabase
- session persistence
- profile sync
- app language selection
- English UI with source-language prayer behavior
- favorites sync
- reminders preferences sync
- local notification groundwork
- audio playback UI with rewind, forward, and improved progress seeking

Key mobile files:

- [mobile-app/src/navigation/AppNavigator.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/navigation/AppNavigator.tsx)
- [mobile-app/src/context/AppContext.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/context/AppContext.tsx)
- [mobile-app/src/screens/HomeScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/HomeScreen.tsx)
- [mobile-app/src/screens/SearchScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/SearchScreen.tsx)
- [mobile-app/src/screens/PrayerDetailScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/PrayerDetailScreen.tsx)
- [mobile-app/src/screens/AudioScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/AudioScreen.tsx)
- [mobile-app/src/screens/RemindersScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/RemindersScreen.tsx)
- [mobile-app/src/screens/ProfileScreen.tsx](/Users/nikhilmukka/Documents/Devotional%20App/mobile-app/src/screens/ProfileScreen.tsx)

## 3. Supabase Backend

Supabase is already chosen and integrated as the backend foundation.

Current backend capabilities:

- email/password auth
- profile records
- user preferences
- favorites
- festival dates
- prayers
- prayer texts
- audio metadata
- reminder rules
- device registration groundwork
- notification logs groundwork

Current schema areas:

- `profiles`
- `user_preferences`
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
- `user_favorites`
- `user_devices`
- `notification_logs`

Key backend references:

- [supabase/schema.sql](/Users/nikhilmukka/Documents/Devotional%20App/supabase/schema.sql)
- [supabase/seed.sql](/Users/nikhilmukka/Documents/Devotional%20App/supabase/seed.sql)
- [docs/supabase-integration-plan.md](/Users/nikhilmukka/Documents/Devotional%20App/docs/supabase-integration-plan.md)

## 4. Admin Portal

The admin portal is now a meaningful content workspace at `/admin`.

Current admin capabilities:

- create, edit, and delete deities
- create, edit, and delete deity translations
- create, edit, and delete festivals
- create, edit, and delete festival translations
- create, edit, and delete festival calendar entries
- create, edit, and delete prayers
- create, edit, and delete prayer-festival links
- create, edit, and delete prayer texts
- upload audio files and manage audio metadata
- create, edit, and delete reminder rules
- duplicate detection with edit prompts instead of accidental duplicate creation

Admin UX improvements already done:

- icon and symbol selection
- broad named color choices with previews
- field helper notes
- duplicate warnings
- destructive delete confirmation prompts

Key admin files:

- [src/app/pages/AdminContentPage.tsx](/Users/nikhilmukka/Documents/Devotional%20App/src/app/pages/AdminContentPage.tsx)
- [src/styles/admin.css](/Users/nikhilmukka/Documents/Devotional%20App/src/styles/admin.css)
- [docs/admin-workflow.md](/Users/nikhilmukka/Documents/Devotional%20App/docs/admin-workflow.md)
- [supabase/admin-setup.sql](/Users/nikhilmukka/Documents/Devotional%20App/supabase/admin-setup.sql)

## 5. Language Strategy

The app supports:

- English
- Hindi
- Telugu
- Kannada
- Tamil
- Marathi

Agreed language behavior:

- if app language is English:
  - app UI is English
  - prayer content can come from the selected source language
  - prayer source language is a separate setting
- if app language is not English:
  - app UI and prayer content should follow that selected language where content exists

This language model is already reflected in both mobile and backend structure.

## 6. Audio Experience

Current audio state:

- public web audio page supports the weekly schedule and uploaded audio library
- mobile app supports play/pause, rewind, forward, and better progress interaction
- admin supports direct audio file upload into Supabase Storage plus metadata entry

Important note:

- audio is still in a strong prototype-to-production transition stage
- it is usable, but premium audio polish and background playback are still future work

## 7. Notifications And Reminders

What is built:

- reminder settings UI
- daily vs festival reminder logic concept
- user device registration groundwork
- Expo notifications groundwork
- local notification preview support

What is not yet complete:

- production push scheduling
- server-side reminder resolution and sending
- full dev-build notification validation on iPhone

## 8. Google Login

What is done:

- app-side Google login groundwork is wired
- Supabase and Google Cloud flow has been partially prepared

What is still pending:

- reliable end-to-end testing in a development build
- final deep-link behavior outside Expo Go

Practical status:

- email login is working
- Google login is intentionally deferred until the iPhone development build stage

## What Is Still Incomplete

These are the main unfinished or partially finished areas:

1. Production iPhone development build
2. Google login completion
3. Full push notification sending pipeline
4. Background audio / premium player polish
5. Real analytics and crash reporting
6. Premium entitlement architecture
7. RevenueCat integration
8. Final content upload process with copyright-safe source strategy
9. App Store / Play Store production packaging

## Content Status

Current content status should be treated as:

- seed data
- admin test data
- UI validation data

It should not yet be treated as the final public catalog.

Important constraint:

- real devotional text, translations, transliterations, meanings, and audio must only be uploaded after rights and copyright safety are verified

## Monetization Direction

BhaktiVerse should not monetize by simply locking basic prayers.

The stronger monetization path is:

- free access to essential prayer reading and limited devotional use
- subscription for guidance, convenience, personalization, family features, and richer devotional experience

The strongest positioning is:

> structured Hindu practice for busy individuals and families

This is stronger than:

> a large library of devotional content

## Premium Features To Build

## Premium Priority 1

These are the strongest premium features and should be considered the main subscription core.

### 1. Festival-Specific Pooja Guides

Include:

- samagri checklist
- preparation notes
- step-by-step pooja flow
- timing and vrat notes
- region variations
- audio guidance for the process

Why it matters:

- high urgency
- recurring seasonal value
- real problem-solving for busy users and diaspora households

### 2. Personalized Daily Sadhana

Include:

- user-selected deity focus
- time-based recommendations like 5 min, 10 min, 20 min
- weekday or goal-based routines
- personalized reminders
- suggested daily chant or prayer set

Why it matters:

- habit formation
- recurring value
- stronger retention than static content access

### 3. Premium Audio Experience

Include:

- full premium audio library
- longer guided recitation tracks
- festival-specific audio packs
- background play
- offline download
- curated playlists

Important strategy:

- do not lock all audio behind subscription
- keep some audio free
- make premium audio deeper, richer, and more convenient

### 4. Meaning, Pronunciation, And Learning Mode

Include:

- transliteration
- meaning by line or section
- pronunciation guidance
- chanting context
- when to chant and why

Why it matters:

- users want to learn correctly, not only read text
- this also supports children and diaspora use cases

### 5. Kids And Family Learning

Include:

- beginner shloka lessons
- age-friendly explanations
- memory / recitation practice
- parent-child mode
- family streaks or shared devotional routines

Why it matters:

- strong emotional and educational value
- especially useful for families outside India

## Premium Priority 2

These are valuable, but should follow after the core premium layer is built.

### 6. Advanced Reminder Intelligence

Include:

- festival-aware override logic
- preparation reminders
- vrat reminders
- time-of-day devotional suggestions
- home routine automation

### 7. Family Subscription Plan

Include:

- multiple household members
- kids profiles
- shared reminders
- shared favorites and curated routines

### 8. Home Positivity And Ritual Guidance

Include:

- room-by-room devotional suggestions
- simple daily positivity practices
- small family rituals

This is better bundled into the daily sadhana product rather than sold alone.

## Premium Priority 3

These are later-stage ideas and should not block the core subscription launch.

### 9. Smart Speaker / Home Integration

Examples:

- Alexa / Google Home style “play today’s prayer”
- auto-start devotional routine based on schedule

This is useful, but not a first monetization driver.

### 10. Community Features

Examples:

- groups
- local celebration circles
- family or festival communities

Caution:

- high moderation burden
- difficult to make central to early subscription value

## Recommended Free vs Premium Split

### Free

- basic prayer discovery
- basic prayer reading
- search by prayer, deity, and festival
- limited audio access
- basic daily reminder
- a small starter set of festival guidance

### Premium Individual

- festival pooja guides
- full premium audio
- advanced reminders
- personalized sadhana plan
- meanings, transliteration, pronunciation
- expanded festival support

### Premium Family

- everything in Premium Individual
- multiple profiles
- kids learning
- shared devotional routines
- family reminders and usage

## Features To Avoid As Primary Premium Hooks

These should not be the main paid proposition early:

- locking all prayer text
- generic positivity tips as a standalone paid feature
- community as the first premium pillar
- smart speaker integration as the first premium pillar

## Recommended Build Order From Here

### Phase A. Close The Product Foundation

1. final admin polish if needed
2. build the iPhone development build
3. finish Google login there
4. complete notification sending pipeline

### Phase B. Build Premium Infrastructure

1. add entitlement model to database
2. define free vs premium content flags
3. build paywall screens
4. gate premium features in mobile UI
5. prepare family-plan capable data model

### Phase C. Build Premium Features

1. festival pooja guides
2. personalized daily sadhana
3. premium audio features
4. meanings and pronunciation
5. kids and family learning

### Phase D. Connect Billing

1. integrate RevenueCat
2. add annual and family plans
3. test purchase and restore flows

### Phase E. Upload Final Content

Only after:

- copyright/source strategy is finalized
- content rights are documented
- premium feature structure is ready

## Suggested Immediate Next Step

The best next implementation step is:

> premium infrastructure and entitlement groundwork

Why:

- admin portal is now usable
- content upload is intentionally delayed
- the next major product question is how premium features will be structured and gated

That means the next concrete build should include:

- subscription data model
- free vs premium flags
- paywall UX
- entitlement handling in mobile app

## Final Recommendation

BhaktiVerse should be built as a devotional guidance platform, not a content dump.

The clearest premium value is:

- guided worship
- habit-building
- family use
- richer audio
- easier understanding and learning

If the app stays disciplined around that, subscriptions have a stronger chance of working than if the app becomes only a prayer archive.
