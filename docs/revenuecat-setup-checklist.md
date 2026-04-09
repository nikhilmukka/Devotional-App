# RevenueCat Setup Checklist

## Purpose

This checklist describes the setup needed before BhaktiVerse can use live subscription billing.

The app-side scaffolding is already present.
These remaining steps are mostly dashboard and store configuration work.

## 1. RevenueCat Project

- create a RevenueCat project for BhaktiVerse
- for development, you can start with RevenueCat Test Store
- later, connect App Store products when Apple Developer enrollment is active
- keep product naming aligned with the app product IDs

## 2. Public SDK Key

Add the RevenueCat public SDK key to:

- `mobile-app/.env`

Use this variable:

```env
EXPO_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY=appl_or_rcb_your_revenuecat_public_sdk_key
```

Notes:

- `rcb_...` keys can be used for RevenueCat Test Store development
- `appl_...` keys can be used later when the iOS App Store app is connected

## 3. Planned Product Identifiers

The current planned products are:

- `bhaktiverse_premium_individual_monthly`
- `bhaktiverse_premium_individual_yearly`
- `bhaktiverse_premium_family_yearly`

These should be created consistently across:

- App Store Connect
- RevenueCat products
- app code

## 4. Entitlement Mapping

Recommended entitlements:

- `premium_individual`
- `premium_family`

These should map to BhaktiVerse subscription tiers in the app.

## 5. RevenueCat Dashboard Setup Order

Recommended order now:

1. create entitlements
2. create products
3. create an offering and add packages
4. copy the public SDK key into `.env`
5. reload the mobile app and confirm plans appear on the premium screen

## 6. App Store Connect

Before live billing works, we will need:

- paid applications agreement completed
- in-app purchase/subscription products created
- subscription groups configured
- sandbox test user ready

This can wait until Apple Developer enrollment is active.

## 7. Next Technical Step

Once the RevenueCat project and product IDs exist, the next code step is:

- install the RevenueCat SDK
- initialize it in the mobile app
- fetch offerings
- wire purchase, restore, and entitlement refresh into `AppContext`

## 8. Important Note

The current project is prepared for billing groundwork, but live checkout is not active yet.
