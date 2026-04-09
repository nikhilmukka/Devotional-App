# BhaktiVerse Product Roadmap

## Purpose

This document is the working product roadmap for BhaktiVerse. It defines:

- the product vision
- target users
- free and premium feature boundaries
- product priorities
- what we should defer
- the order in which we should build

This should be the main product reference as we continue development.

## Product Vision

BhaktiVerse should be:

> a structured devotional companion for modern Hindu life

The product should help users:

- pray consistently despite a busy schedule
- know what to do, not only what to read
- follow festivals with confidence
- learn pronunciation and meaning gradually
- build devotional habits at home individually or as a family

BhaktiVerse should not become:

- a generic prayer dump
- a massive unmanaged content library
- a confusing spiritual super app

## Product Positioning

The strongest positioning is:

> guided Hindu devotional practice for busy individuals and families

This is stronger than positioning the app as only:

> a prayer and audio library

The main differentiators should be:

- structured daily practice
- guided festival worship
- multilingual simplicity
- strong reminder-led habit building
- children and family devotional learning

## Target Audience

## Primary Users

### 1. Busy working adults

Needs:

- quick devotional routines
- reminders
- daily guidance
- easy audio support

Why they matter:

- high convenience value
- strong habit potential
- good premium conversion potential

### 2. Hindu families outside India

Needs:

- festival guidance
- multilingual support
- family-friendly devotional flow
- child learning support

Why they matter:

- very strong long-term segment
- high need for structure and explanation

### 3. Young parents

Needs:

- simple shloka teaching
- meaning and pronunciation support
- repeatable family routines

Why they matter:

- strong premium value around family and children learning

## Secondary Users

### 4. Older parents and seniors

Yes, older parents should absolutely be part of the target audience.

They can use BhaktiVerse as:

- a digital prayer book
- a devotional playlist app
- a reminder tool
- a favorites-based daily prayer companion

If we want this segment to use the app well, we should continue designing for:

- larger text
- simpler flows
- clear labels
- easy favorites
- easy audio playback
- fewer technical screens

### 5. Ritual beginners

Needs:

- step-by-step pooja help
- samagri guidance
- “what to do today” clarity

This is an important premium segment, especially during festivals.

## Product Principles

1. Structure over volume
- Start with a smaller, high-utility devotional catalog.

2. Guidance over reference
- The app should actively guide practice, not just store content.

3. Habit over one-time usage
- Build around reminders, routines, and repeat sessions.

4. Family usefulness over novelty
- Favor practical household features over flashy extras.

5. Trust and simplicity
- Dates, rituals, meanings, and flows must feel respectful and reliable.

## Free Product

The free product must be genuinely useful so users build trust and habit.

### Free Features

- browse prayers by deity, festival, or prayer name
- basic prayer reading
- app language selection
- prayer source language behavior where applicable
- favorites
- basic daily reminder
- limited audio access
- a small set of core festival content

### Why Free Matters

Free should prove usefulness. Users should feel:

- “this app helps me practice”
- “this is trustworthy”
- “I want the deeper version”

Free should not feel empty, but it also should not remove the need for premium.

## Premium Product

Premium should focus on:

- guidance
- convenience
- personalization
- family value
- richer devotional experience

## Core Premium Features

These are the best premium features for BhaktiVerse.

### 1. Festival Pooja Guides

Include:

- samagri checklist
- preparation notes
- step-by-step pooja process
- vrat guidance
- practical do and don’t notes
- guided audio to follow along

Why it matters:

- solves a real problem
- especially useful for busy users and diaspora families

### 2. Personalized Daily Sadhana

Include:

- preferred deity
- available time
- preferred language
- daily or weekly devotional routines
- personalized reminders
- recommended chant / prayer sequence

Why it matters:

- builds habit
- increases retention
- gives subscription ongoing value

### 3. Premium Audio Experience

Include:

- full audio library
- longer recitation tracks
- festival-specific guided audio
- background play
- offline download
- curated playlists

Important:

- do not lock all audio behind premium
- keep some free audio for habit formation

### 4. Meaning, Pronunciation, and Learning Mode

Include:

- transliteration
- line-by-line meaning
- pronunciation support
- devotional context
- suggested usage guidance

Why it matters:

- strong value for diaspora users, beginners, and children

### 5. Children and Family Learning

Include:

- beginner shloka learning
- simple meaning for children
- recitation practice
- parent-child devotional flow
- family-friendly learning paths

Why it matters:

- emotionally strong premium use case
- very differentiated from basic prayer apps

### 6. Advanced Reminder Intelligence

Include:

- festival-aware reminder override
- preparation reminders
- vrat reminders
- family devotional reminders
- devotional routine-based reminders

### 7. Personal Shloka Notebook

Allow users to:

- write and save private shlokas or selected verses
- maintain personal recitation lists
- create their own daily devotional notebook

This is a strong premium feature because it makes the app personal, not only informational.

### 8. Record My Own Recitation

Allow users to:

- record their own voice reciting a saved shloka
- save it privately
- replay it for daily practice

Important recommendation:

- build direct voice recording first
- do not start with AI voice cloning

Reason:

- simpler
- safer
- lower privacy risk
- easier to ship well

## Features To Defer

These features may be useful later, but should not block the core roadmap:

- community groups
- smart speaker integration
- AI voice cloning
- broad social features
- temple-commerce integrations

These are later-stage ideas, not core launch requirements.

## Recommended Free vs Premium Split

### Free

- basic prayer discovery
- basic reading
- favorites
- basic reminder
- limited audio
- core devotional use

### Premium Individual

- festival pooja guides
- personalized daily sadhana
- full premium audio
- advanced reminders
- meanings and pronunciation
- personal shloka notebook
- own recitation recordings

### Premium Family

- everything in Premium Individual
- multiple family profiles
- children learning mode
- shared devotional routines
- family reminders

## Current Build Status

The product foundation already includes:

- web prototype and public web browsing experience
- Expo React Native mobile app
- Supabase auth and core backend
- admin portal for content management
- audio upload support
- reminder rule setup
- favorites, profile, and multilingual foundations

Still incomplete:

- production development build on iPhone
- final Google login completion
- production notification sending pipeline
- premium entitlement architecture
- RevenueCat integration
- final copyrighted-content-safe content upload

## Build Order From Here

## Phase 1. Finish Foundation

- complete any remaining product polish
- build iPhone development build
- finish Google login there
- complete real notification pipeline
- QA the full user journey

## Phase 2. Build Premium Infrastructure

- add entitlement model to database
- define free vs premium feature flags
- build paywall and locked-feature UX
- prepare individual and family plan logic

## Phase 3. Build Core Premium Features

- festival pooja guides
- personalized daily sadhana
- premium audio layer
- meanings and pronunciation

## Phase 4. Build Family Features

- children learning flows
- family plan support
- personal shloka notebook
- own recitation recording

## Phase 5. Billing And Launch Preparation

- RevenueCat integration
- subscription plans
- restore purchases
- pricing setup
- launch readiness

## Features We Should Avoid As The Main Paywall

Do not make premium feel like:

- “pay to read prayers”
- “pay to unlock all basic audio”
- “pay for generic positivity tips”

Premium should feel like:

- guided worship
- consistency
- convenience
- family devotional value

## Final Product Direction

BhaktiVerse should be built as:

> a guided devotional lifestyle product

The strongest premium proposition is:

- guided festival worship
- personalized daily practice
- premium audio
- family and children learning
- private devotional practice tools

This is the direction we should follow as we continue building the application.
