import type { SubscriptionTier } from "../supabase/types";

export type BillingProductId =
  | "bhaktiverse_premium_individual_monthly"
  | "bhaktiverse_premium_individual_yearly"
  | "bhaktiverse_premium_family_yearly";

export type BillingSetupStatus = "not_configured" | "sdk_pending" | "ready_for_integration";

export type BillingProductDefinition = {
  id: BillingProductId;
  tier: SubscriptionTier;
  billingPeriod: "monthly" | "yearly";
  label: string;
  highlighted?: boolean;
};

export type BillingSetupSummary = {
  provider: "revenuecat";
  status: BillingSetupStatus;
  hasPublicSdkKey: boolean;
  products: BillingProductDefinition[];
};

export type BillingPurchaseResult = {
  ok: boolean;
  message: string;
  customerInfo?: unknown | null;
  userCancelled?: boolean;
};

export type RevenueCatPackageSummary = {
  identifier: string;
  offeringIdentifier: string;
  packageType: string;
  productIdentifier: string;
  title: string;
  displayTitle: string;
  description: string;
  priceString: string;
};
