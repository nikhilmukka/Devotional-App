# RevenueCat Dashboard Setup

## Goal

Set up BhaktiVerse subscriptions in RevenueCat so the premium screen can show real plans and the app can start syncing real entitlements.

This guide is written for the current project configuration.

## Recommended Path Right Now

Use RevenueCat Test Store first.

Why:

- it lets us configure products and offerings before Apple Developer enrollment is active
- it unblocks premium plan testing earlier
- later we can connect the same entitlement model to App Store products

## Product Structure For BhaktiVerse

Use these three products exactly:

- `bhaktiverse_premium_individual_monthly`
- `bhaktiverse_premium_individual_yearly`
- `bhaktiverse_premium_family_yearly`

## Entitlements

Create these two entitlements exactly:

- `premium_individual`
- `premium_family`

Mapping:

- both individual products should unlock `premium_individual`
- the family yearly product should unlock `premium_family`

## Offering

Create one default offering:

- identifier: `default`

Recommended packages inside it:

- monthly:
  - product: `bhaktiverse_premium_individual_monthly`
- annual:
  - product: `bhaktiverse_premium_individual_yearly`
- family annual:
  - product: `bhaktiverse_premium_family_yearly`

This is enough for the current app because the premium screen reads RevenueCat offerings and packages directly.

## Dashboard Steps

1. Create a RevenueCat project for `BhaktiVerse`.
2. Add the app under that project.
3. Choose RevenueCat Test Store for the first setup path.
4. Create entitlements:
   - `premium_individual`
   - `premium_family`
5. Create the three products listed above.
6. Attach products to the correct entitlements.
7. Create the `default` offering.
8. Add the products to packages inside that offering.
9. Copy the public SDK key from RevenueCat.

## Local App Configuration

Add this to:

- `mobile-app/.env`

```env
EXPO_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY=your_revenuecat_public_sdk_key
```

Then restart Expo:

```bash
cd "/Users/nikhilmukka/Documents/Devotional App/mobile-app"
HOME=/tmp npx expo start --go -c
```

## What Should Happen After Setup

On the mobile premium screen:

- the billing setup status should move out of pending state
- real packages should appear
- each package should show title and price
- `Choose Plan` should target the correct package
- `Restore Purchases` should no longer be only a placeholder flow

## Important Notes

- Right now, without Apple Developer enrollment, this should be treated as RevenueCat-side setup and development readiness work.
- Real iOS App Store purchase testing will still need Apple-side setup later.
- The app now persists RevenueCat entitlement state into Supabase, so once RevenueCat is live, web and mobile can converge on the same premium source of truth.
