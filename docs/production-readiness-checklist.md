# Production Readiness Checklist

This checklist turns the current BhaktiVerse build into a production launch path.

Use it as the single checklist for:
- launch blockers
- sequencing
- QA signoff
- cleanup before App Store / Play Store submission

## 1. Billing And Entitlements

- [ ] Replace RevenueCat Test Store with real App Store / Play Store products
- [ ] Confirm final product identifiers and pricing
- [ ] Validate purchase flow on a real build
- [ ] Validate restore purchases flow on a real build
- [ ] Validate renewal / expiry / cancellation / grace period behavior
- [ ] Confirm premium entitlement sync writes correct state into `public.user_entitlements`
- [ ] Verify premium access parity across mobile and web account state

Definition of done:
- premium purchase works with real store products
- restore works
- premium state survives app restart and account refresh

## 2. Authentication

- [ ] Re-verify email sign in / sign up / logout in production-like builds
- [ ] Finish Google login implementation
- [ ] Validate Google login in a real build, not only Expo Go
- [ ] Confirm session restoration works cleanly after app restart
- [ ] Confirm guest flow remains clean and does not bypass personal premium features

Definition of done:
- email auth and Google auth both work reliably
- guest restrictions behave correctly

## 3. Push Notifications

- [ ] Verify remote push delivery in a proper development or release build
- [ ] Re-validate daily reminder delivery
- [ ] Re-validate festival reminder delivery
- [ ] Re-validate premium festival preparation reminder delivery
- [ ] Confirm retry/backoff behavior for failed jobs
- [ ] Confirm cleanup schedule works over time
- [ ] Keep admin diagnostics working for reminder operations

Definition of done:
- queued jobs dispatch automatically
- delivered reminders are visible on device in non-Expo-Go builds
- failures are traceable and retry safely

## 4. Premium Product Features

- [ ] Final QA for private shloka notebook
- [ ] Final QA for personal recitation recording and playback
- [ ] Final QA for premium audio gating
- [ ] Final QA for festival guide gating
- [ ] Final QA for Daily Sadhana first version
- [ ] Decide whether Daily Sadhana needs v2 additions before launch:
  - streaks
  - saved history
  - stronger recommendation logic
- [ ] Decide whether any premium teaser cards should become stronger product surfaces before launch

Definition of done:
- all premium features behave correctly for:
  - guest
  - free signed-in user
  - premium signed-in user

## 5. Admin And Content Operations

- [ ] Re-verify admin CRUD for:
  - deities
  - festivals
  - festival calendar
  - festival guides
  - prayers
  - prayer texts
  - audio
  - reminder rules
- [ ] Re-verify diagnostics tab
- [ ] Confirm admin content changes appear correctly on mobile and web where relevant
- [ ] Document simple admin operating procedure for content updates

Definition of done:
- admin is reliable as the main content management surface
- content changes reflect correctly downstream

## 6. Content Readiness

- [ ] Finalize copyright-safe content sourcing approach
- [ ] Load real production prayers
- [ ] Load translations / source-language texts
- [ ] Load real audio catalog
- [ ] Load real festival guides
- [ ] Review devotional wording and consistency across the app

Definition of done:
- enough real, reviewed content exists for launch
- content ownership / licensing risk is understood

## 7. UI And Cleanup Before Release

- [ ] Remove or hide developer-only reminder testing tools from normal user UI
- [ ] Review items listed in [Release Cleanup Checklist](./release-cleanup-checklist.md)
- [ ] Finalize copy on premium, reminders, notebook, and sadhana screens
- [ ] Re-check mobile layout on small and large phones
- [ ] Re-check web admin layout on common laptop widths

Definition of done:
- no internal QA/dev tools are exposed to normal users
- launch UI feels intentional and clean

## 8. Observability And Safety

- [ ] Add analytics for key funnels:
  - sign up
  - premium view
  - purchase
  - reminder enablement
  - notebook usage
- [ ] Add crash / error reporting
- [ ] Review logging for sensitive data exposure
- [ ] Confirm environment variables are documented and safe

Definition of done:
- production issues can be diagnosed quickly
- sensitive values are not exposed unnecessarily

## 9. Legal And Store Readiness

- [ ] Privacy policy
- [ ] Terms of service if needed
- [ ] App Store / Play Store screenshots
- [ ] App descriptions and metadata
- [ ] Icon / branding review
- [ ] Verify in-app purchase disclosures are clear enough

Definition of done:
- store submission assets and legal basics are ready

## 10. Build And Release Operations

- [ ] Create proper iOS development build
- [ ] Create proper Android development build if needed
- [ ] Validate production environment config
- [ ] Prepare release build flow for iOS
- [ ] Prepare release build flow for Android
- [ ] Smoke test release candidates before submission

Definition of done:
- we can generate and validate release candidates predictably

## Recommended Build Order

1. Real billing and entitlement validation
2. Real-build auth and push validation
3. Release cleanup of dev-only tooling
4. Content loading and review
5. Analytics / crash reporting / legal assets
6. Final release candidate QA

## What Is Already Strong

These are not the main blockers anymore:
- admin/content foundation
- premium gating foundation
- notebook and recitation flow
- reminder backend architecture
- diagnostics tooling
- Daily Sadhana first version

## Current Main Launch Blockers

If we were prioritizing only what blocks release today, the biggest items are:
- real store billing
- real-build notification verification
- Google login completion
- content readiness
- release cleanup
