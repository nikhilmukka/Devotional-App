# BhaktiVerse Sprint 1 Implementation Checklist

## Sprint Goal

Set up the foundation for:

- development-build testing on iPhone
- real subscription billing integration
- production-grade entitlement flow

This sprint does not finish billing or notifications end to end.
It prepares the project so the next implementation steps are faster and safer.

## Expected Outcome

At the end of this sprint, BhaktiVerse should have:

- EAS build configuration in the mobile app
- a documented development-build path
- billing product identifiers defined in code
- environment placeholders for RevenueCat
- a billing service abstraction ready for live integration
- premium screen updated to reflect billing readiness

## Checklist

### 1. Development Build Preparation

- [x] Confirm Expo project is linked to EAS
- [x] Confirm `app.json` has EAS project ID
- [ ] Add `eas.json`
- [ ] Define `development`, `preview`, and `production` build profiles
- [ ] Document the build commands for iPhone development testing
- [ ] Confirm app config still supports microphone, auth, and notifications

### 2. Billing Groundwork

- [ ] Define RevenueCat environment variables in `.env.example`
- [ ] Add billing config file for product identifiers and provider readiness
- [ ] Add a billing service abstraction layer
- [ ] Define planned products:
  - `premium_individual_monthly`
  - `premium_individual_yearly`
  - `premium_family_yearly`
- [ ] Map those products to BhaktiVerse subscription tiers
- [ ] Expose a basic billing setup status to the app

### 3. Premium Screen Readiness

- [ ] Update the premium screen to show billing setup status
- [ ] Show planned products in a non-destructive way
- [ ] Keep current premium UI intact while preparing for real checkout

### 4. Documentation

- [ ] Add a RevenueCat setup checklist document
- [ ] Add development build commands to project docs
- [ ] Note what still requires dashboard-side setup by the user

### 5. Validation

- [ ] Type-check the mobile app
- [ ] Confirm no existing premium flows are broken
- [ ] Confirm the premium screen still opens and renders correctly

## What Comes Immediately After This Sprint

Once this checklist is complete, the next implementation sprint should do:

1. RevenueCat SDK installation and live integration
2. App Store / sandbox product configuration
3. purchase and restore flow
4. entitlement refresh from provider into app state

## Notes

- This sprint intentionally avoids forcing live billing before the structure is ready.
- This sprint also does not depend on final devotional content.
- Development build setup and billing groundwork are the right first steps because both unlock later production work.
