# BhaktiVerse Next Steps Action Plan

## Purpose

This document is the execution plan for the next phase of BhaktiVerse.

It is intended to answer:

- what is already strong enough to leave as-is for now
- what must be built next
- what order we should follow
- what depends on what
- what can wait until later

This should be the operational build plan we follow from here.

## Where We Are Now

The current project has a solid foundation across four areas:

### 1. Mobile app foundation

Built and working:

- login and signup with Supabase email auth
- home, search, prayer detail, audio, reminders, favorites, and profile
- multilingual app structure
- private shloka notebook
- record-your-own-recitation premium feature
- premium teaser and gating foundation

### 2. Backend and admin

Built and working:

- Supabase schema for core devotional content
- admin portal with create, edit, and delete
- deity, festival, prayer, prayer text, audio, reminder, and guide management
- duplicate checks in admin
- audio upload through admin

### 3. Premium groundwork

Built and working:

- premium content flags
- premium UI on mobile and web
- premium festival guide module
- notebook and personal recitation as premium features

### 4. Web prototype and review surface

Built and working:

- public web browsing flow
- admin portal
- visible premium experience on web

Important note:

- the mobile app remains the production product direction
- the web app is useful for review, content checks, premium visibility, and admin operations

## What Is Good Enough For Now

These areas do not need to be the immediate focus unless we hit a bug:

- basic mobile navigation and screen structure
- admin CRUD foundation
- audio upload foundation
- private notebook base flow
- basic premium page and premium teaser UI

These can be refined later, but they are no longer blockers.

## Main Objective For The Next Phase

The next phase should move BhaktiVerse from:

> a strong prototype plus backend foundation

to:

> a production-ready paid devotional app foundation

That means the focus should now shift from:

- broad UI building

to:

- production behavior
- subscription infrastructure
- push/reminder engine
- content-readiness architecture
- device-level testing

## Recommended Build Order

The recommended order is:

1. Development build and production-like testing
2. Subscription billing and real entitlements
3. Notification and reminder engine
4. Google login completion
5. Final premium modules
6. Real content onboarding
7. Release readiness

This order matters because several later tasks depend on earlier ones.

## Phase 1: Development Build

### Goal

Move beyond Expo Go for the core production-critical features.

### Why This Is First

Some important features are not reliable enough in Expo Go:

- Google login
- deep linking
- notification behavior
- some native flows

### What To Build

- create iPhone development build
- install and run the app as a development build on device
- confirm Supabase auth behavior
- confirm deep link behavior
- confirm premium flows still render correctly
- confirm audio, notebook, and recitation still work in dev build

### Deliverables

- development build installed on iPhone
- repeatable command/process for future testing
- checklist of what works and what still fails in dev build

### Exit Criteria

We should be able to test:

- login
- logout
- session persistence
- audio playback
- notebook and recitation
- premium screens
- notification permission flow

## Phase 2: Subscription Billing And Real Entitlements

### Goal

Replace the current premium placeholder behavior with real subscription state.

### Why This Is Next

We already have premium UI and premium-gated features.
What is missing is real payment and real entitlement syncing.

Without this, premium exists only as a product shell.

### What To Build

- RevenueCat integration
- App Store product configuration
- subscription products and entitlement names
- map RevenueCat entitlements into app state
- replace temporary premium flags with live entitlement checks
- support:
  - free
  - premium individual
  - premium family

### App Behavior To Add

- paywall entry points
- purchase flow
- restore purchases
- active subscription recognition
- premium downgrade/expiry handling

### Deliverables

- purchase-ready subscription architecture
- app state tied to real entitlements
- premium features unlocked only when entitlement is active

### Exit Criteria

As a test user we should be able to:

- see paywall
- purchase or test-purchase premium
- unlock premium content
- restore purchases on app reinstall

## Phase 3: Notification And Reminder Engine

### Goal

Turn the current reminder groundwork into real devotional notification behavior.

### Why This Is Important

BhaktiVerse should become habit-forming, not just browsable.
Reminders are central to that.

### What Is Already There

- reminder UI
- reminder preferences
- local notification groundwork
- user device groundwork
- daily vs festival logic concept

### What Still Needs To Be Built

- server-side reminder resolution
- scheduled notification sending
- daily prayer vs festival prayer override from live data
- notification logs and monitoring
- notification copy templates

### Desired Logic

Only one devotional reminder should be active at a time:

- if today is a festival and festival reminders are enabled:
  - send the festival prayer / guide reminder
- otherwise:
  - send the normal daily prayer reminder

### Deliverables

- backend reminder resolver
- push sending pipeline
- user-specific notification schedule logic

### Exit Criteria

We should be able to:

- register device token
- schedule/send reminder
- receive correct reminder on device
- confirm logs are stored

## Phase 4: Google Login Completion

### Goal

Finish Google login properly in the production-like environment.

### Why This Is Not First

Email auth already works.
Google login should be completed once the dev build is ready.

### What To Build

- final Supabase Google provider validation
- dev-build deep link callback handling
- successful round trip from app to Google and back
- user profile creation/update for Google-auth users

### Deliverables

- stable Google sign-in
- no fallback redirect issues
- clear login behavior for new and returning users

### Exit Criteria

A user should be able to:

- tap Google login
- complete Google auth
- return into the app successfully
- remain signed in

## Phase 5: Premium Product Expansion

### Goal

Build the next premium modules beyond what already exists.

### Already Built

- premium audio gating foundation
- festival pooja guide module
- private shloka notebook
- record-your-own-recitation

### Recommended Next Premium Features

#### 1. Personalized daily sadhana

Build:

- preferred deity
- preferred time available
- preferred routine length
- guided daily prayer sequence
- smarter devotional reminders

Why:

- this is one of the strongest premium habit features

#### 2. Meaning and learning mode

Build:

- line-by-line meaning
- pronunciation help
- transliteration
- where/when to recite
- simple explanation mode

Why:

- strong premium value for diaspora users, beginners, and parents

#### 3. Kids and family learning

Build:

- beginner shloka sets
- simple explanations
- practice repetition flow
- parent-child devotional mode

Why:

- strong long-term subscription value
- strong differentiation

#### 4. Family plan behavior

Build:

- shared entitlement recognition
- future support for multiple family profiles
- family devotional planning readiness

### Deliverables

- at least one major premium module beyond the current set
- a clearer distinction between free and premium value

### Exit Criteria

Premium should feel like:

- a meaningful upgrade
- not just locked content

## Phase 6: Content Readiness And Safe Content Pipeline

### Goal

Prepare for real content onboarding without copyright risk.

### Why This Is Deliberately Later

Content is the highest copyright and licensing risk area.
We should not rush it.

### What Needs To Be Done

- define approved content sourcing strategy
- create rights ledger for every text/audio/image source
- determine which content is:
  - original
  - public domain
  - licensed
  - user-created
- identify first curated launch set

### Content Types To Prepare

- deity records
- festival records
- prayer texts by language
- transliteration and meanings
- pooja guides
- audio tracks

### Deliverables

- copyright-safe sourcing plan
- first launch content checklist
- structured content import workflow

### Exit Criteria

We should know exactly:

- what content is safe to upload
- who owns it
- how it is licensed

## Phase 7: Release Readiness

### Goal

Prepare BhaktiVerse for App Store and Play Store launch.

### What Needs To Be Built

- privacy policy
- terms/support/contact pages
- analytics
- crash reporting
- environment separation
- production key management
- app icons / screenshots / marketing assets
- App Store and Play Store listing materials

### Technical Release Tasks

- production Supabase configuration review
- production notification credential setup
- RevenueCat production configuration
- final auth/provider review

### Product QA Tasks

- onboarding
- login/logout
- audio
- reminders
- favorites
- profile
- premium unlock
- premium downgrade handling

### Deliverables

- launch checklist
- release candidate build

## Immediate Next Sprint Recommendation

The next sprint should focus on:

### Sprint Focus

- development build
- billing groundwork
- notification engine design

### Reason

These three unlock the rest of the product.

Without them:

- premium cannot become a real business model
- reminders cannot become a true habit engine
- Google login and device flows remain incomplete

### Sprint Tasks

1. Create and validate iPhone development build
2. Integrate RevenueCat project structure
3. Define subscription products and entitlements
4. Wire app state to real entitlement flow
5. Finalize notification token/device registration review
6. Design server-side reminder sending approach

## What Can Wait

These should wait until the earlier phases are stable:

- smart speaker integration
- community/group features
- advanced AI voice generation
- heavy social features
- wide content expansion
- broad partner/ecosystem integrations

They are interesting, but they are not the best next build priorities.

## Risks To Watch

### 1. Premium without billing

Risk:

- users can see premium but it is not monetized yet

Action:

- prioritize RevenueCat and entitlement integration

### 2. Content before rights readiness

Risk:

- copyright exposure

Action:

- keep content onboarding late and deliberate

### 3. Expo Go limitations

Risk:

- false confidence around auth and notifications

Action:

- move key testing to development build

### 4. Too many premium ideas too early

Risk:

- fragmented product

Action:

- build only the strongest premium modules first

## Summary

The right next path is:

1. production-like device testing
2. real subscription infrastructure
3. real reminder engine
4. Google login completion
5. stronger premium modules
6. safe content onboarding
7. release preparation

This order gives BhaktiVerse the best chance to become:

- technically stable
- monetizable
- content-safe
- launch-ready
