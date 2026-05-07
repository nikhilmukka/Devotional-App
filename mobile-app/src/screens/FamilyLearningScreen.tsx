import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { deityCatalog, prayerCatalog } from "../data/sampleContent";
import { t } from "../i18n";
import { loadSadhanaProgress, saveSadhanaCompletion } from "../lib/supabase/profile";
import { AppColors } from "../theme/colors";

const ageGroupOptions = ["4-6", "7-10", "11-14", "family"];
const learningModeOptions = ["meaning", "repeat", "story", "chant"];

const modePrayerMap: Record<string, string[]> = {
  meaning: ["ganesh-aarti", "durga-aarti", "shiva-aarti", "hare-krishna-mahamantra"],
  repeat: ["hare-krishna-mahamantra", "surya-mantra", "ganesh-aarti", "shiva-aarti"],
  story: ["rama-stuti", "hanuman-chalisa", "durga-aarti", "lakshmi-puja"],
  chant: ["hare-krishna-mahamantra", "mahamrityunjaya-mantra", "surya-mantra", "sai-baba-aarti"],
};

const ageGroupMaxItems: Record<string, number> = {
  "4-6": 1,
  "7-10": 2,
  "11-14": 2,
  family: 3,
};

function minutesFromDuration(durationLabel: string) {
  const match = durationLabel.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

function promptKeyForMode(mode: string) {
  switch (mode) {
    case "repeat":
      return "familyLearning.promptRepeat";
    case "story":
      return "familyLearning.promptStory";
    case "chant":
      return "familyLearning.promptChant";
    default:
      return "familyLearning.promptMeaning";
  }
}

export function FamilyLearningScreen({ navigation }: { navigation: any }) {
  const {
    user,
    appLanguage,
    hasPremiumAccess,
    familyLearningEnabled,
    familyLearningAgeGroup,
    familyLearningMode,
    familyLearningPreferredDeity,
    setFamilyLearningEnabled,
    setFamilyLearningAgeGroup,
    setFamilyLearningMode,
    setFamilyLearningPreferredDeity,
    logout,
  } = useApp();
  const tr = (path: string) => t(appLanguage, path);
  const [progressLoading, setProgressLoading] = useState(false);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProgress() {
      const userId = user?.id;
      if (!user || user.isGuest || !hasPremiumAccess || !userId) {
        if (!cancelled) {
          setTodayCompleted(false);
          setCurrentStreak(0);
        }
        return;
      }

      setProgressLoading(true);
      try {
        const progress = await loadSadhanaProgress(userId, "family_learning");
        if (!cancelled) {
          setTodayCompleted(progress.todayCompleted);
          setCurrentStreak(progress.currentStreak);
        }
      } catch {
        if (!cancelled) {
          setTodayCompleted(false);
          setCurrentStreak(0);
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    }

    void hydrateProgress();
    return () => {
      cancelled = true;
    };
  }, [hasPremiumAccess, user]);

  const generatedPlan = useMemo(() => {
    const preferredOrder = modePrayerMap[familyLearningMode] ?? modePrayerMap.meaning;
    const maxItems = ageGroupMaxItems[familyLearningAgeGroup] ?? 2;
    const sorted = [...prayerCatalog].sort((left, right) => {
      const leftIndex = preferredOrder.indexOf(left.id);
      const rightIndex = preferredOrder.indexOf(right.id);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });

    const selected = sorted
      .filter((prayer) => {
        if (familyLearningPreferredDeity && prayer.deity !== familyLearningPreferredDeity) {
          return false;
        }
        if (preferredOrder.includes(prayer.id)) {
          return true;
        }
        return familyLearningMode === "meaning";
      })
      .slice(0, maxItems);

    const totalMinutes = 3 + selected.reduce((sum, prayer) => sum + minutesFromDuration(prayer.duration), 0);

    return {
      prayers: selected,
      totalMinutes,
    };
  }, [familyLearningAgeGroup, familyLearningMode, familyLearningPreferredDeity]);

  async function handleCompleteToday() {
    const userId = user?.id;
    if (!user || user.isGuest || !userId) return;
    setSavingCompletion(true);
    try {
      await saveSadhanaCompletion(userId, "family_learning", {
        age_group: familyLearningAgeGroup,
        learning_mode: familyLearningMode,
        preferred_deity: familyLearningPreferredDeity,
      });
      const progress = await loadSadhanaProgress(userId, "family_learning");
      setTodayCompleted(progress.todayCompleted);
      setCurrentStreak(progress.currentStreak);
      Alert.alert(tr("familyLearning.progressTitle"), tr("familyLearning.completeSuccessBody"));
    } catch (error) {
      Alert.alert(
        tr("premium.purchaseErrorTitle"),
        error instanceof Error ? error.message : "Unable to save progress."
      );
    } finally {
      setSavingCompletion(false);
    }
  }

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("familyLearning.title")}
        subtitle={tr("familyLearning.subtitle")}
        rightSlot={
          <View style={styles.headerIconWrap}>
            <Ionicons name="people-outline" size={24} color={AppColors.gold} />
          </View>
        }
      />

      <View style={styles.content}>
        {user?.isGuest ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("familyLearning.guestTitle")}</Text>
            <Text style={styles.sectionBody}>{tr("familyLearning.guestBody")}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void logout()}>
              <Text style={styles.primaryButtonText}>{tr("common.signInToContinue")}</Text>
            </Pressable>
          </SectionCard>
        ) : !hasPremiumAccess ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("familyLearning.lockedTitle")}</Text>
            <Text style={styles.sectionBody}>{tr("familyLearning.lockedBody")}</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate("Premium", {
                  postPurchaseRedirect: "FamilyLearning",
                })
              }
            >
              <Text style={styles.primaryButtonText}>{tr("common.unlockPremium")}</Text>
            </Pressable>
          </SectionCard>
        ) : (
          <>
            <SectionCard>
              <Text style={styles.sectionTitle}>{tr("familyLearning.settingsTitle")}</Text>
              <Text style={styles.sectionBody}>{tr("familyLearning.settingsBody")}</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingCopy}>
                  <Text style={styles.settingTitle}>{tr("familyLearning.enabledTitle")}</Text>
                  <Text style={styles.settingBody}>{tr("familyLearning.enabledBody")}</Text>
                </View>
                <Switch
                  value={familyLearningEnabled}
                  onValueChange={setFamilyLearningEnabled}
                  thumbColor="#FFF5E4"
                  trackColor={{ false: "#D7D1CB", true: "#F0B480" }}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("familyLearning.ageGroupTitle")}</Text>
              <Text style={styles.settingBody}>{tr("familyLearning.ageGroupBody")}</Text>
              <View style={styles.chipsWrap}>
                {ageGroupOptions.map((ageGroup) => {
                  const active = familyLearningAgeGroup === ageGroup;
                  const labelKey =
                    ageGroup === "4-6"
                      ? "familyLearning.ageGroup46"
                      : ageGroup === "7-10"
                        ? "familyLearning.ageGroup710"
                        : ageGroup === "11-14"
                          ? "familyLearning.ageGroup1114"
                          : "familyLearning.ageGroupFamily";
                  return (
                    <Pressable
                      key={ageGroup}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setFamilyLearningAgeGroup(ageGroup)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{tr(labelKey)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("familyLearning.modeTitle")}</Text>
              <Text style={styles.settingBody}>{tr("familyLearning.modeBody")}</Text>
              <View style={styles.chipsWrap}>
                {learningModeOptions.map((mode) => {
                  const active = familyLearningMode === mode;
                  const labelKey =
                    mode === "repeat"
                      ? "familyLearning.modeRepeat"
                      : mode === "story"
                        ? "familyLearning.modeStory"
                        : mode === "chant"
                          ? "familyLearning.modeChant"
                          : "familyLearning.modeMeaning";
                  return (
                    <Pressable
                      key={mode}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setFamilyLearningMode(mode)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{tr(labelKey)}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("familyLearning.deityTitle")}</Text>
              <Text style={styles.settingBody}>{tr("familyLearning.deityBody")}</Text>
              <View style={styles.chipsWrap}>
                <Pressable
                  style={[styles.chip, !familyLearningPreferredDeity && styles.chipActive]}
                  onPress={() => setFamilyLearningPreferredDeity(null)}
                >
                  <Text style={[styles.chipText, !familyLearningPreferredDeity && styles.chipTextActive]}>
                    {tr("familyLearning.anyDeity")}
                  </Text>
                </Pressable>
                {deityCatalog.map((deity) => {
                  const active = familyLearningPreferredDeity === deity;
                  return (
                    <Pressable
                      key={deity}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setFamilyLearningPreferredDeity(deity)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{deity}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </SectionCard>

            <SectionCard>
              <View style={styles.progressRow}>
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>{tr("familyLearning.progressTitle")}</Text>
                  {progressLoading ? (
                    <ActivityIndicator style={styles.progressSpinner} color={AppColors.accent} />
                  ) : (
                    <>
                      <Text style={styles.progressValue}>
                        {currentStreak} {tr("familyLearning.streakDays")}
                      </Text>
                      <Text style={styles.progressHelper}>{tr("familyLearning.streakBody")}</Text>
                    </>
                  )}
                </View>

                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>{tr("familyLearning.todayStatusTitle")}</Text>
                  {progressLoading ? (
                    <ActivityIndicator style={styles.progressSpinner} color={AppColors.accent} />
                  ) : (
                    <>
                      <Text style={styles.progressStatusValue}>
                        {todayCompleted ? tr("familyLearning.todayCompleted") : tr("familyLearning.todayPending")}
                      </Text>
                      <Text style={styles.progressHelper}>{tr("familyLearning.todayStatusBody")}</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.planHeaderRow}>
                <View style={styles.planHeaderCopy}>
                  <Text style={styles.sectionTitle}>{tr("familyLearning.planTitle")}</Text>
                  <Text style={styles.sectionBody}>{tr("familyLearning.planBody")}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeLabel}>{tr("familyLearning.totalTime")}</Text>
                  <Text style={styles.timeBadgeValue}>{generatedPlan.totalMinutes} min</Text>
                </View>
              </View>

              {!familyLearningEnabled ? (
                <Text style={styles.emptyPlanText}>{tr("familyLearning.enabledBody")}</Text>
              ) : generatedPlan.prayers.length === 0 ? (
                <Text style={styles.emptyPlanText}>{tr("familyLearning.noPlanBody")}</Text>
              ) : (
                <View style={styles.planStack}>
                  {todayCompleted ? (
                    <View style={styles.completedBanner}>
                      <Text style={styles.completedBannerText}>{tr("familyLearning.todayCompleted")}</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={[styles.completeButton, savingCompletion && styles.completeButtonDisabled]}
                      onPress={() => void handleCompleteToday()}
                      disabled={savingCompletion}
                    >
                      <Text style={styles.completeButtonText}>
                        {savingCompletion
                          ? tr("familyLearning.savingProgress")
                          : tr("familyLearning.completeCta")}
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.planCard}>
                    <Text style={styles.planCardTitle}>{tr("familyLearning.openingTitle")}</Text>
                    <Text style={styles.planCardBody}>{tr("familyLearning.openingBody")}</Text>
                  </View>

                  {generatedPlan.prayers.map((prayer, index) => (
                    <Pressable
                      key={prayer.id}
                      style={styles.planCard}
                      onPress={() => navigation.navigate("PrayerDetail", { prayerId: prayer.id })}
                    >
                      <View style={styles.planPrayerTopRow}>
                        <Text style={styles.planStepNumber}>{index + 1}</Text>
                        <View style={styles.planPrayerCopy}>
                          <Text style={styles.planCardTitle}>{prayer.title}</Text>
                          <Text style={styles.planPrayerMeta}>
                            {prayer.deity} · {prayer.category} · {prayer.duration}
                          </Text>
                          <Text style={styles.planPromptText}>{tr(promptKeyForMode(familyLearningMode))}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={AppColors.accent} />
                      </View>
                    </Pressable>
                  ))}

                  <View style={styles.planCard}>
                    <Text style={styles.planCardTitle}>{tr("familyLearning.closingTitle")}</Text>
                    <Text style={styles.planCardBody}>{tr("familyLearning.closingBody")}</Text>
                  </View>
                </View>
              )}
            </SectionCard>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  headerIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(224, 172, 77, 0.28)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.textPrimary,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textSecondary,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 8,
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  settingBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppColors.textSecondary,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8D6BE",
    marginVertical: 22,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0C8A6",
    backgroundColor: "#FFF9F1",
  },
  chipActive: {
    borderColor: AppColors.accent,
    backgroundColor: "#FF914A",
  },
  chipText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.maroon,
  },
  chipTextActive: {
    color: "#FFF5EC",
  },
  planHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  planHeaderCopy: {
    flex: 1,
  },
  timeBadge: {
    minWidth: 120,
    alignSelf: "flex-start",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0C8A6",
    backgroundColor: "#FFF8EF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  timeBadgeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textSecondary,
  },
  timeBadgeValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.maroon,
  },
  progressRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  progressCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0C8A6",
    backgroundColor: "#FFF7EE",
    padding: 14,
  },
  progressLabel: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressValue: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
  },
  progressStatusValue: {
    color: AppColors.maroon,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  progressHelper: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  progressSpinner: {
    marginTop: 16,
  },
  planStack: {
    gap: 14,
    marginTop: 18,
  },
  completeButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
  },
  completedBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7B46F",
    backgroundColor: "#FFF4DB",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  completedBannerText: {
    color: AppColors.maroon,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  planCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7D3B5",
    backgroundColor: "#FFF9F2",
    padding: 20,
  },
  planCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: AppColors.textPrimary,
  },
  planCardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.textSecondary,
    marginTop: 10,
  },
  planPrayerTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  planStepNumber: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.maroon,
    color: "#FFF8EE",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontWeight: "800",
    overflow: "hidden",
    paddingTop: 8,
  },
  planPrayerCopy: {
    flex: 1,
  },
  planPrayerMeta: {
    marginTop: 6,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  planPromptText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.accent,
    fontWeight: "700",
  },
  emptyPlanText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textSecondary,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    backgroundColor: AppColors.maroon,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF7EE",
  },
});
