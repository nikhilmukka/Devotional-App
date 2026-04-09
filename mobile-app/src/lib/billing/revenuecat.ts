import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import Purchases from "react-native-purchases";
import type { EntitlementStatus, SubscriptionTier } from "../supabase/types";
import { billingProducts } from "./config";
import type { BillingPurchaseResult, RevenueCatPackageSummary } from "./types";
import { getBillingSetupSummary, getRevenueCatPublicSdkKey } from "./config";

const PREMIUM_INDIVIDUAL_ENTITLEMENT = "premium_individual";
const PREMIUM_FAMILY_ENTITLEMENT = "premium_family";

export type RevenueCatEntitlementState = {
  subscriptionTier: SubscriptionTier;
  entitlementStatus: EntitlementStatus;
  entitlementValidUntil: string | null;
  entitlementIsLifetime: boolean;
  hasMappedEntitlement: boolean;
};

type RevenueCatBootstrapResult = {
  ok: boolean;
  message: string;
};

let isConfigured = false;

function mapEntitlementToState(customerInfo: CustomerInfo): RevenueCatEntitlementState {
  const familyActive = customerInfo.entitlements.active[PREMIUM_FAMILY_ENTITLEMENT];
  const individualActive = customerInfo.entitlements.active[PREMIUM_INDIVIDUAL_ENTITLEMENT];
  const familyKnown =
    familyActive || customerInfo.entitlements.all[PREMIUM_FAMILY_ENTITLEMENT] || null;
  const individualKnown =
    individualActive || customerInfo.entitlements.all[PREMIUM_INDIVIDUAL_ENTITLEMENT] || null;

  const entitlement = familyActive || individualActive || familyKnown || individualKnown;

  if (!entitlement) {
    return {
      subscriptionTier: "free",
      entitlementStatus: "inactive",
      entitlementValidUntil: null,
      entitlementIsLifetime: false,
      hasMappedEntitlement: false,
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

function mapPackageToSummary(rcPackage: PurchasesPackage): RevenueCatPackageSummary {
  const productIdentifier = rcPackage.product.identifier;
  const configuredProduct = billingProducts.find((product) => product.id === productIdentifier);

  return {
    identifier: rcPackage.identifier,
    offeringIdentifier:
      rcPackage.presentedOfferingContext?.offeringIdentifier || rcPackage.offeringIdentifier,
    packageType: String(rcPackage.packageType),
    productIdentifier,
    title: rcPackage.product.title,
    displayTitle: configuredProduct?.label || rcPackage.product.title,
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
  return getOfferingPackages(offerings).map(mapPackageToSummary);
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
