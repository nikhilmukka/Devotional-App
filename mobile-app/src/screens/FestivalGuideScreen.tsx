import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../components/GradientHeader";
import { PremiumFeatureCard } from "../components/PremiumFeatureCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { fetchFestivalGuide, type FestivalGuideData } from "../lib/supabase/content";
import { t } from "../i18n";
import { AppColors } from "../theme/colors";

const festivalVisuals: Record<string, { symbol: string; colors: [string, string] }> = {
  Diwali: { symbol: "🪔", colors: ["#FF9500", "#D4572A"] },
  Navratri: { symbol: "🌺", colors: ["#C93A3A", "#9729A7"] },
  "Ganesh Chaturthi": { symbol: "🐘", colors: ["#FF9D4D", "#D9A037"] },
  Holi: { symbol: "🎨", colors: ["#C94565", "#FF8C42"] },
  "Gudi Padwa": { symbol: "🎏", colors: ["#F08C00", "#C44536"] },
};

export function FestivalGuideScreen({ navigation, route }: { navigation: any; route: any }) {
  const { appLanguage, prayerSourceLanguage, hasPremiumAccess } = useApp();
  const tr = (path: string) => t(appLanguage, path);
  const festivalKey = String(route?.params?.festivalKey || "");
  const [guide, setGuide] = useState<FestivalGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGuide() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchFestivalGuide(
          festivalKey,
          appLanguage,
          prayerSourceLanguage,
          hasPremiumAccess
        );
        if (!active) return;
        setGuide(data);
      } catch (loadError) {
        if (!active) return;
        setGuide(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : t(appLanguage, "festivalGuide.loadError")
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (!festivalKey) {
      setGuide(null);
      setLoading(false);
      setError(t(appLanguage, "festivalGuide.unavailableBody"));
      return;
    }

    void loadGuide();
    return () => {
      active = false;
    };
  }, [appLanguage, festivalKey, hasPremiumAccess, prayerSourceLanguage]);

  const visual = useMemo(() => {
    if (!guide?.festivalKey) {
      return festivalVisuals[festivalKey] ?? { symbol: "🙏", colors: ["#8B241A", "#C85C20"] as [string, string] };
    }

    return festivalVisuals[guide.festivalKey] ?? { symbol: "🙏", colors: ["#8B241A", "#C85C20"] as [string, string] };
  }, [festivalKey, guide?.festivalKey]);

  return (
    <ScreenContainer>
      <GradientHeader
        title={guide?.festivalName || festivalKey || tr("festivalGuide.title")}
        subtitle={guide?.title || tr("festivalGuide.subtitle")}
        rightSlot={
          <View style={styles.headerBadge}>
            <Text style={styles.headerEmoji}>{visual.symbol}</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <SectionCard>
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={AppColors.accent} />
              <Text style={styles.loadingText}>{tr("festivalGuide.loading")}</Text>
            </View>
          </SectionCard>
        ) : null}

        {!loading && error ? (
          <SectionCard>
            <Text style={styles.errorText}>{error}</Text>
          </SectionCard>
        ) : null}

        {!loading && !error && !guide ? (
          <SectionCard>
            <Text style={styles.emptyTitle}>{tr("festivalGuide.unavailableTitle")}</Text>
            <Text style={styles.emptyBody}>{tr("festivalGuide.unavailableBody")}</Text>
            <Pressable
              style={styles.browseButton}
              onPress={() =>
                navigation.navigate("MainTabs", {
                  screen: "SearchTab",
                  params: {
                    initialMode: "festival",
                    initialFestival: festivalKey,
                    initialQuery: "",
                  },
                })
              }
            >
              <Text style={styles.browseButtonText}>{tr("festivalGuide.browseFestivalPrayers")}</Text>
            </Pressable>
          </SectionCard>
        ) : null}

        {guide ? (
          <>
            <SectionCard>
              <View style={styles.guideHeaderRow}>
                <View style={styles.guideCopy}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  {guide.subtitle ? <Text style={styles.guideSubtitle}>{guide.subtitle}</Text> : null}
                </View>
                {guide.isPremium ? (
                  <View style={styles.premiumPill}>
                    <Text style={styles.premiumPillText}>{tr("common.premium")}</Text>
                  </View>
                ) : null}
              </View>
              {guide.introText ? <Text style={styles.introText}>{guide.introText}</Text> : null}
            </SectionCard>

            {guide.isLocked ? (
              <PremiumFeatureCard
                eyebrow={tr("common.premium")}
                icon="sparkles-outline"
                title={tr("festivalGuide.lockedTitle")}
                body={tr("festivalGuide.lockedBody")}
                bullets={[
                  tr("festivalGuide.lockedPoint1"),
                  tr("festivalGuide.lockedPoint2"),
                ]}
                ctaLabel={tr("common.unlockPremium")}
                onPress={() => navigation.navigate("Premium")}
              />
            ) : (
              <>
                {guide.itemsNeeded.length ? (
                  <SectionCard>
                    <Text style={styles.sectionTitle}>{tr("festivalGuide.itemsNeeded")}</Text>
                    <View style={styles.listWrap}>
                      {guide.itemsNeeded.map((item, index) => (
                        <View key={`${guide.id}-item-${index}`} style={styles.bulletRow}>
                          <View style={styles.dot} />
                          <Text style={styles.bulletText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </SectionCard>
                ) : null}

                {guide.preparationNotes ? (
                  <SectionCard>
                    <Text style={styles.sectionTitle}>{tr("festivalGuide.preparationNotes")}</Text>
                    <Text style={styles.preparationText}>{guide.preparationNotes}</Text>
                  </SectionCard>
                ) : null}

                {guide.stepByStep.length ? (
                  <SectionCard>
                    <Text style={styles.sectionTitle}>{tr("festivalGuide.stepByStep")}</Text>
                    <View style={styles.listWrap}>
                      {guide.stepByStep.map((step, index) => (
                        <View key={`${guide.id}-step-${index}`} style={styles.stepRow}>
                          <View style={styles.stepBadge}>
                            <Text style={styles.stepBadgeText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.bulletText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </SectionCard>
                ) : null}

                {guide.linkedPrayerId ? (
                  <SectionCard>
                    <Text style={styles.sectionTitle}>{tr("festivalGuide.followPrayer")}</Text>
                    <Text style={styles.linkedPrayerBody}>{tr("festivalGuide.followPrayerBody")}</Text>
                    <Pressable
                      style={styles.linkedPrayerButton}
                      onPress={() => navigation.navigate("PrayerDetail", { prayerId: guide.linkedPrayerId })}
                    >
                      <Ionicons name="musical-notes-outline" size={18} color="#FFF5E4" />
                      <Text style={styles.linkedPrayerButtonText}>
                        {guide.linkedPrayerTitle || tr("festivalGuide.openLinkedPrayer")}
                      </Text>
                    </Pressable>
                  </SectionCard>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(255,245,228,0.08)",
  },
  headerEmoji: {
    fontSize: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
    paddingBottom: 28,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#B3261E",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  browseButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  browseButtonText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
  guideHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  guideCopy: {
    flex: 1,
  },
  guideTitle: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  guideSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  premiumPill: {
    borderRadius: 999,
    backgroundColor: "#FFE7D2",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  premiumPillText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  introText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  listWrap: {
    marginTop: 14,
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accent,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  preparationText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepBadgeText: {
    color: "#FFF5E4",
    fontSize: 12,
    fontWeight: "800",
  },
  linkedPrayerBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 12,
  },
  linkedPrayerButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  linkedPrayerButtonText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
});
