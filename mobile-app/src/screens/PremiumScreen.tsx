import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FeedbackModal } from "../components/FeedbackModal";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import { AppColors } from "../theme/colors";
import { getBillingSetupSummary } from "../lib/billing/config";
import {
  fetchRevenueCatPackages,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchasesWithResult,
} from "../lib/billing/revenuecat";
import type { RevenueCatPackageSummary } from "../lib/billing/types";

function getPlanLabel(plan: string, tr: (path: string) => string) {
  switch (plan) {
    case "premium_individual":
      return tr("premium.premiumIndividual");
    case "premium_family":
      return tr("premium.premiumFamily");
    default:
      return tr("premium.freePlan");
  }
}

function getStatusLabel(status: string, tr: (path: string) => string) {
  switch (status) {
    case "active":
      return tr("premium.active");
    case "trial":
      return tr("premium.trial");
    case "grace_period":
      return tr("premium.gracePeriod");
    default:
      return tr("premium.inactive");
  }
}

export function PremiumScreen() {
  const {
    appLanguage,
    subscriptionTier,
    entitlementStatus,
    entitlementValidUntil,
    hasPremiumAccess,
    hasFamilyAccess,
  } = useApp();
  const [showNotice, setShowNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [availablePackages, setAvailablePackages] = useState<RevenueCatPackageSummary[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const tr = (path: string) => t(appLanguage, path);
  const billingSummary = getBillingSetupSummary();

  const premiumFeatures = useMemo(
    () => [
      tr("premium.featureFestivalGuides"),
      tr("premium.featureAudio"),
      tr("premium.featureSadhana"),
      tr("premium.featureKids"),
      tr("premium.featureNotebook"),
      tr("premium.featureVoice"),
    ],
    [appLanguage]
  );

  useEffect(() => {
    let active = true;

    async function loadPackages() {
      if (billingSummary.status !== "ready_for_integration") {
        setAvailablePackages([]);
        return;
      }

      setPackagesLoading(true);
      try {
        const nextPackages = await fetchRevenueCatPackages();
        if (!active) return;
        setAvailablePackages(nextPackages);
      } finally {
        if (active) {
          setPackagesLoading(false);
        }
      }
    }

    void loadPackages();

    return () => {
      active = false;
    };
  }, [billingSummary.status]);

  function openNotice(title: string, message: string) {
    setNoticeTitle(title);
    setNoticeMessage(message);
    setShowNotice(true);
  }

  async function handlePurchase(packageIdentifier: string) {
    setBillingBusy(true);
    try {
      const result = await purchaseRevenueCatPackage(packageIdentifier);
      if (result.ok) {
        openNotice(tr("premium.purchaseSuccessTitle"), tr("premium.purchaseSuccessBody"));
        return;
      }

      if (result.userCancelled) {
        openNotice(tr("premium.purchaseCanceledTitle"), tr("premium.purchaseCanceledBody"));
        return;
      }

      openNotice(tr("premium.purchaseErrorTitle"), result.message);
    } finally {
      setBillingBusy(false);
    }
  }

  async function handleRestore() {
    setBillingBusy(true);
    try {
      const result = await restoreRevenueCatPurchasesWithResult();
      if (result.ok) {
        openNotice(tr("premium.restoreSuccessTitle"), tr("premium.restoreSuccessBody"));
        return;
      }

      openNotice(tr("premium.restoreErrorTitle"), result.message);
    } finally {
      setBillingBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("premium.title")}
        subtitle={tr("premium.subtitle")}
        rightSlot={
          <View style={styles.headerBadge}>
            <Ionicons name="sparkles-outline" size={20} color={AppColors.gold} />
          </View>
        }
      />

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("premium.currentPlan")}</Text>
          <View style={styles.planRow}>
            <View style={[styles.planPill, hasPremiumAccess && styles.planPillActive]}>
              <Text style={[styles.planPillText, hasPremiumAccess && styles.planPillTextActive]}>
                {getPlanLabel(subscriptionTier, tr)}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {tr("premium.status")}: {getStatusLabel(entitlementStatus, tr)}
            </Text>
          </View>
          <Text style={styles.planBody}>
            {hasFamilyAccess
              ? tr("premium.familyBody")
              : hasPremiumAccess
                ? tr("premium.premiumBody")
                : tr("premium.freeBody")}
          </Text>
          {entitlementValidUntil ? (
            <Text style={styles.metaText}>
              {tr("premium.validUntil")}: {new Date(entitlementValidUntil).toLocaleDateString()}
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("premium.compareFree")}</Text>
          <View style={styles.compareCard}>
            <Text style={styles.compareTitle}>{tr("premium.freePlan")}</Text>
            <Text style={styles.compareBody}>{tr("premium.freeLine1")}</Text>
            <Text style={styles.compareBody}>{tr("premium.freeLine2")}</Text>
          </View>
          <View style={[styles.compareCard, styles.compareCardPremium]}>
            <Text style={styles.compareTitle}>{tr("premium.premiumIndividual")}</Text>
            <Text style={styles.compareBody}>{tr("premium.premiumLine1")}</Text>
            <Text style={styles.compareBody}>{tr("premium.premiumLine2")}</Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("premium.whyUpgrade")}</Text>
          <View style={styles.featureList}>
            {premiumFeatures.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark" size={14} color="#FFF5E4" />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>
            {billingSummary.status === "ready_for_integration"
              ? tr("premium.availablePlans")
              : tr("premium.comingSoon")}
          </Text>
          <Text style={styles.billingBody}>
            {billingSummary.status === "ready_for_integration"
              ? tr("premium.billingReadyBody")
              : tr("premium.billingNote")}
          </Text>
          <View style={styles.billingSetupCard}>
            <Text style={styles.billingSetupTitle}>Billing Setup</Text>
            <Text style={styles.billingSetupBody}>
              Provider: RevenueCat · Status:{" "}
              {billingSummary.status === "ready_for_integration"
                ? tr("premium.billingReady")
                : tr("premium.billingPending")}
            </Text>
            {billingSummary.status === "ready_for_integration" ? (
              packagesLoading ? (
                <Text style={styles.billingSetupItem}>{tr("premium.loadingPlans")}</Text>
              ) : availablePackages.length > 0 ? (
                availablePackages.map((rcPackage) => (
                  <View key={rcPackage.identifier} style={styles.packageCard}>
                    <View style={styles.packageHeader}>
                      <View style={styles.packageTitleWrap}>
                        <Text style={styles.packageTitle}>{rcPackage.displayTitle}</Text>
                        <Text style={styles.packageSubtitle}>{rcPackage.priceString}</Text>
                      </View>
                      <Pressable
                        style={[
                          styles.packageButton,
                          billingBusy && styles.packageButtonDisabled,
                        ]}
                        onPress={() => void handlePurchase(rcPackage.identifier)}
                        disabled={billingBusy}
                      >
                        <Text style={styles.packageButtonText}>{tr("premium.purchaseCta")}</Text>
                      </Pressable>
                    </View>
                    {rcPackage.description ? (
                      <Text style={styles.packageDescription}>{rcPackage.description}</Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.billingSetupItem}>{tr("premium.noPlansAvailable")}</Text>
              )
            ) : (
              billingSummary.products.map((product) => (
                <Text key={product.id} style={styles.billingSetupItem}>
                  • {product.label}
                </Text>
              ))
            )}
          </View>
          <View style={styles.ctaRow}>
            <Pressable
              style={[styles.ctaButton, hasPremiumAccess && styles.ctaButtonActive]}
              onPress={() =>
                billingSummary.status === "ready_for_integration"
                  ? void handleRestore()
                  : openNotice(tr("premium.comingSoon"), tr("premium.billingNote"))
              }
              disabled={billingBusy}
            >
              <Text style={styles.ctaButtonText}>
                {billingBusy ? tr("premium.processing") : tr("premium.restoreCta")}
              </Text>
            </Pressable>
            {billingSummary.status !== "ready_for_integration" ? (
              <Pressable
                style={[styles.secondaryButton, hasPremiumAccess && styles.secondaryButtonActive]}
                onPress={() => openNotice(tr("premium.comingSoon"), tr("premium.billingNote"))}
              >
                <Text style={styles.secondaryButtonText}>
                  {hasPremiumAccess ? tr("premium.activeCta") : tr("premium.exploreCta")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </SectionCard>
      </View>

      <FeedbackModal
        visible={showNotice}
        title={noticeTitle || (hasPremiumAccess ? tr("premium.activeCta") : tr("premium.comingSoon"))}
        message={noticeMessage || tr("premium.billingNote")}
        buttonLabel={tr("common.close")}
        onClose={() => setShowNotice(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(255,245,228,0.08)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  planRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  planPill: {
    borderRadius: 999,
    backgroundColor: AppColors.mutedChip,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  planPillActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  planPillText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  planPillTextActive: {
    color: "#FFF5E4",
  },
  statusText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  planBody: {
    marginTop: 14,
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  metaText: {
    marginTop: 8,
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  compareCard: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#FFF8EE",
    padding: 14,
  },
  compareCardPremium: {
    backgroundColor: "#FFF3EA",
  },
  compareTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  compareBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  featureList: {
    marginTop: 14,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.accent,
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  billingBody: {
    marginTop: 12,
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  billingSetupCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#FFF8EE",
    padding: 14,
    gap: 6,
  },
  billingSetupTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  billingSetupBody: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  billingSetupItem: {
    color: AppColors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  packageCard: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(122,30,30,0.08)",
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 8,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  packageTitleWrap: {
    flex: 1,
    gap: 2,
  },
  packageTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  packageSubtitle: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  packageDescription: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  packageButton: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
  },
  packageButtonDisabled: {
    opacity: 0.6,
  },
  packageButtonText: {
    color: "#FFF5E4",
    fontSize: 13,
    fontWeight: "700",
  },
  ctaRow: {
    marginTop: 18,
    gap: 12,
  },
  ctaButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonActive: {
    backgroundColor: AppColors.accent,
  },
  ctaButtonText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonActive: {
    backgroundColor: "#FFF3EA",
  },
  secondaryButtonText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
