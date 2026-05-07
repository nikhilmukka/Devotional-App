import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases from "react-native-purchases";
import type { EntitlementStatus, SubscriptionTier } from "../supabase/types";
import { billingProducts } from "./config";
import type {
  BillingPurchaseResult,
  RevenueCatPackageSummary,
  RevenueCatResolvedProduct,
} from "./types";
import { getBillingSetupSummary, getRevenueCatPublicSdkKey } from "./config";

const PREMIUM_INDIVIDUAL_ENTITLEMENT = "premium_individual";
const PREMIUM_FAMILY_ENTITLEMENT = "premium_family";

export type RevenueCatEntitlementState = {
  subscriptionTier: SubscriptionTier;
  entitlementStatus: EntitlementStatus;
  entitlementValidUntil: string | null;
  entitlementIsLifetime: boolean;
  hasMappedEntitlement: boolean;
  primaryProductCode: string | null;
};

type RevenueCatBootstrapResult = {
  ok: boolean;
  message: string;
};

let isConfigured = false;

function normalizeValue(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function resolveConfiguredBillingProduct(
  rcPackage: PurchasesPackage
): (typeof billingProducts)[number] | null {
  const productIdentifier = normalizeValue(rcPackage.product.identifier);
  const packageIdentifier = normalizeValue(rcPackage.identifier);
  const packageType = normalizeValue(String(rcPackage.packageType));

  const directMatch = billingProducts.find(
    (product) => normalizeValue(product.id) === productIdentifier
  );
  if (directMatch) {
    return directMatch;
  }

  if (packageIdentifier.includes("family")) {
    return (
      billingProducts.find(
        (product) => normalizeValue(product.id) === "bhaktiverse_premium_family_yearly"
      ) || null
    );
  }

  if (
    packageType.includes("monthly") ||
    packageIdentifier.includes("monthly") ||
    packageIdentifier.includes("$rc_monthly")
  ) {
    return (
      billingProducts.find(
        (product) => normalizeValue(product.id) === "bhaktiverse_premium_individual_monthly"
      ) || null
    );
  }

  if (
    packageType.includes("annual") ||
    packageType.includes("yearly") ||
    packageIdentifier.includes("annual") ||
    packageIdentifier.includes("yearly") ||
    packageIdentifier.includes("$rc_annual")
  ) {
    return (
      billingProducts.find(
        (product) => normalizeValue(product.id) === "bhaktiverse_premium_individual_yearly"
      ) || null
    );
  }

  return null;
}

function resolveProductFromIdentifier(productIdentifier: string): RevenueCatResolvedProduct | null {
  const normalized = normalizeValue(productIdentifier);

  if (
    normalized.includes("family") ||
    normalized.includes("family_annual") ||
    normalized.includes("premium_family")
  ) {
    return {
      tier: "premium_family",
      productCode: "bhaktiverse_premium_family_yearly",
    };
  }

  if (
    normalized.includes("monthly") ||
    normalized === "month" ||
    normalized === "monthly" ||
    normalized.includes("annual") ||
    normalized.includes("yearly") ||
    normalized.includes("premium_individual")
  ) {
    return {
      tier: "premium_individual",
      productCode:
        normalized.includes("monthly") || normalized === "month" || normalized === "monthly"
          ? "bhaktiverse_premium_individual_monthly"
          : "bhaktiverse_premium_individual_yearly",
    };
  }

  return null;
}

function isFutureDate(value: string | null | undefined) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function getFallbackProductFromCustomerInfo(
  customerInfo: CustomerInfo
): RevenueCatResolvedProduct | null {
  const activeSubscriptionIdentifiers = customerInfo.activeSubscriptions ?? [];
  const subscriptionsByIdentifier = customerInfo.subscriptionsByProductIdentifier ?? {};

  const activeSubscriptionKeys = Object.entries(subscriptionsByIdentifier)
    .filter(([, subscription]) => subscription?.isActive || isFutureDate(subscription?.expiresDate))
    .map(([identifier]) => identifier);

  const candidateIdentifiers = [
    ...activeSubscriptionIdentifiers,
    ...activeSubscriptionKeys,
    ...(isFutureDate(customerInfo.latestExpirationDate)
      ? customerInfo.allPurchasedProductIdentifiers ?? []
      : []),
  ];

  return (
    candidateIdentifiers
      .map(resolveProductFromIdentifier)
      .find((product): product is RevenueCatResolvedProduct => Boolean(product)) || null
  );
}

function mapEntitlementToState(customerInfo: CustomerInfo): RevenueCatEntitlementState {
  const familyActive = customerInfo.entitlements.active[PREMIUM_FAMILY_ENTITLEMENT];
  const individualActive = customerInfo.entitlements.active[PREMIUM_INDIVIDUAL_ENTITLEMENT];
  const familyKnown =
    familyActive || customerInfo.entitlements.all[PREMIUM_FAMILY_ENTITLEMENT] || null;
  const individualKnown =
    individualActive || customerInfo.entitlements.all[PREMIUM_INDIVIDUAL_ENTITLEMENT] || null;

  const entitlement = familyActive || individualActive || familyKnown || individualKnown;

  const fallbackProduct = getFallbackProductFromCustomerInfo(customerInfo);

  if (!entitlement) {
    const fallbackTier = fallbackProduct?.tier ?? null;

    if (fallbackTier) {
      return {
        subscriptionTier: fallbackTier,
        entitlementStatus: "active",
        entitlementValidUntil: customerInfo.latestExpirationDate,
        entitlementIsLifetime: customerInfo.latestExpirationDate == null,
        hasMappedEntitlement: true,
        primaryProductCode: fallbackProduct?.productCode ?? null,
      };
    }

    return {
      subscriptionTier: "free",
      entitlementStatus: "inactive",
      entitlementValidUntil: null,
      entitlementIsLifetime: false,
      hasMappedEntitlement: false,
      primaryProductCode: null,
    };
  }

  let entitlementStatus: EntitlementStatus = "inactive";
  if (entitlement.isActive) {
    if (String(entitlement.periodType).toUpperCase() === "TRIAL") {
      entitlementStatus = "trial";
    } else if (entitlement.billingIssueDetectedAt) {
      entitlementStatus = "grace_period";
    } else {
      entitlementStatus = "active";
    }
  } else if (entitlement.unsubscribeDetectedAt) {
    entitlementStatus = "canceled";
  } else if (entitlement.expirationDate) {
    entitlementStatus = "expired";
  }

  return {
    subscriptionTier:
      entitlement.identifier === PREMIUM_FAMILY_ENTITLEMENT
        ? "premium_family"
        : "premium_individual",
    entitlementStatus,
    entitlementValidUntil: entitlement.expirationDate,
    entitlementIsLifetime: entitlement.expirationDate == null,
    hasMappedEntitlement: true,
    primaryProductCode:
      fallbackProduct?.productCode ??
      (entitlement.identifier === PREMIUM_FAMILY_ENTITLEMENT
        ? "bhaktiverse_premium_family_yearly"
        : null),
  };
}

export function getRevenueCatEntitlementState(
  customerInfo: CustomerInfo
): RevenueCatEntitlementState {
  return mapEntitlementToState(customerInfo);
}

export async function initializeRevenueCat(
  appUserId?: string | null
): Promise<RevenueCatBootstrapResult> {
  const setup = getBillingSetupSummary();
  const apiKey = getRevenueCatPublicSdkKey();

  if (!apiKey || setup.status !== "ready_for_integration") {
    return {
      ok: false,
      message: "RevenueCat SDK key is not configured yet.",
    };
  }

  try {
    if (!isConfigured) {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({
        apiKey,
        appUserID: appUserId || undefined,
      });
      isConfigured = true;
      return { ok: true, message: "RevenueCat configured." };
    }

    if (appUserId) {
      await Purchases.logIn(appUserId);
    }

    return { ok: true, message: "RevenueCat already configured." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "RevenueCat could not be configured.",
    };
  }
}

export async function syncRevenueCatUser(
  appUserId?: string | null
): Promise<RevenueCatBootstrapResult> {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) {
    return {
      ok: false,
      message: "RevenueCat SDK key is not configured yet.",
    };
  }

  const bootstrap = await initializeRevenueCat(appUserId);
  if (!bootstrap.ok) {
    return bootstrap;
  }

  try {
    if (appUserId) {
      await Purchases.logIn(appUserId);
      return { ok: true, message: "RevenueCat user synced." };
    }

    await Purchases.logOut();
    return { ok: true, message: "RevenueCat user logged out." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "RevenueCat user sync failed.",
    };
  }
}

export async function fetchRevenueCatCustomerInfo(): Promise<CustomerInfo | null> {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) return null;

  try {
    await initializeRevenueCat();
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function fetchRevenueCatOfferings() {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) return null;

  try {
    await initializeRevenueCat();
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

function mapPackageToSummary(rcPackage: PurchasesPackage): RevenueCatPackageSummary | null {
  const productIdentifier = rcPackage.product.identifier;
  const configuredProduct = resolveConfiguredBillingProduct(rcPackage);

  if (!configuredProduct) {
    return null;
  }

  return {
    identifier: rcPackage.identifier,
    offeringIdentifier:
      rcPackage.presentedOfferingContext?.offeringIdentifier || rcPackage.offeringIdentifier,
    packageType: String(rcPackage.packageType),
    productIdentifier,
    title: rcPackage.product.title,
    displayTitle: configuredProduct.label,
    description: rcPackage.product.description,
    priceString: rcPackage.product.priceString,
  };
}

function getOfferingPackages(offerings: PurchasesOfferings | null): PurchasesPackage[] {
  if (!offerings?.current) return [];
  return offerings.current.availablePackages;
}

export async function fetchRevenueCatPackages(): Promise<RevenueCatPackageSummary[]> {
  const offerings = await fetchRevenueCatOfferings();
  const orderedIds = billingProducts.map((product) => product.id);

  return getOfferingPackages(offerings)
    .map(mapPackageToSummary)
    .filter((item): item is RevenueCatPackageSummary => Boolean(item))
    .sort(
      (left, right) =>
        orderedIds.indexOf(left.productIdentifier as (typeof orderedIds)[number]) -
        orderedIds.indexOf(right.productIdentifier as (typeof orderedIds)[number])
    );
}

export async function purchaseRevenueCatPackage(
  packageIdentifier: string
): Promise<BillingPurchaseResult> {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) {
    return {
      ok: false,
      message: "RevenueCat SDK key is not configured yet.",
    };
  }

  try {
    await initializeRevenueCat();
    const offerings = await Purchases.getOfferings();
    const targetPackage = getOfferingPackages(offerings).find(
      (rcPackage) => rcPackage.identifier === packageIdentifier
    );

    if (!targetPackage) {
      return {
        ok: false,
        message: "The selected subscription package could not be found.",
      };
    }

    const result = await Purchases.purchasePackage(targetPackage);
    return {
      ok: true,
      message: "Purchase completed successfully.",
      customerInfo: result.customerInfo,
    };
  } catch (error) {
    const userCancelled = Boolean((error as { userCancelled?: boolean } | null)?.userCancelled);
    return {
      ok: false,
      userCancelled,
      message: userCancelled
        ? "Purchase was canceled."
        : error instanceof Error
          ? error.message
          : "The purchase could not be completed.",
    };
  }
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo | null> {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) return null;

  try {
    await initializeRevenueCat();
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
}

export async function restoreRevenueCatPurchasesWithResult(): Promise<BillingPurchaseResult> {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) {
    return {
      ok: false,
      message: "RevenueCat SDK key is not configured yet.",
    };
  }

  try {
    await initializeRevenueCat();
    const customerInfo = await Purchases.restorePurchases();
    return {
      ok: true,
      message: "Purchases restored successfully.",
      customerInfo,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Purchases could not be restored.",
    };
  }
}

export function addRevenueCatCustomerInfoListener(
  listener: CustomerInfoUpdateListener
): (() => void) | null {
  const apiKey = getRevenueCatPublicSdkKey();
  if (!apiKey) return null;

  try {
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  } catch {
    return null;
  }
}
