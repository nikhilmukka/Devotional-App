import Constants from "expo-constants";
import type { BillingProductDefinition, BillingSetupSummary } from "./types";

const revenueCatPublicSdkKey =
  process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY ||
  (Constants.expoConfig?.extra as Record<string, string | undefined> | undefined)?.EXPO_PUBLIC_REVENUECAT_PUBLIC_SDK_KEY ||
  process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ||
  (Constants.expoConfig?.extra as Record<string, string | undefined> | undefined)?.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ||
  "";

export const billingProducts: BillingProductDefinition[] = [
  {
    id: "bhaktiverse_premium_individual_monthly",
    tier: "premium_individual",
    billingPeriod: "monthly",
    label: "Premium Individual Monthly",
  },
  {
    id: "bhaktiverse_premium_individual_yearly",
    tier: "premium_individual",
    billingPeriod: "yearly",
    label: "Premium Individual Yearly",
    highlighted: true,
  },
  {
    id: "bhaktiverse_premium_family_yearly",
    tier: "premium_family",
    billingPeriod: "yearly",
    label: "Premium Family Yearly",
  },
];

export function getBillingSetupSummary(): BillingSetupSummary {
  const hasPublicSdkKey = Boolean(revenueCatPublicSdkKey && !revenueCatPublicSdkKey.includes("your_"));

  return {
    provider: "revenuecat",
    status: hasPublicSdkKey ? "ready_for_integration" : "sdk_pending",
    hasPublicSdkKey,
    products: billingProducts,
  };
}

export function getRevenueCatPublicSdkKey() {
  return revenueCatPublicSdkKey;
}

// Backward compatibility for older code/docs while we migrate naming.
export function getRevenueCatAppleApiKey() {
  return revenueCatPublicSdkKey;
}
