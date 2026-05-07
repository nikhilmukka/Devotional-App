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

const focusPrayerMap: Record<string, string[]> = {
  balanced: ["hare-krishna-mahamantra", "ganesh-aarti", "shiva-aarti", "rama-stuti"],
  calm: ["mahamrityunjaya-mantra", "shiva-aarti", "sai-baba-aarti", "surya-mantra"],
  strength: ["hanuman-chalisa", "durga-aarti", "mahamrityunjaya-mantra", "rama-stuti"],
  prosperity: ["lakshmi-puja", "sri-suktam", "ganesh-aarti", "surya-mantra"],
  devotion: ["hare-krishna-mahamantra", "durga-aarti", "rama-stuti", "sai-baba-aarti"],
};

const durationOptions = [10, 15, 20];
const focusOptions = ["balanced", "calm", "strength", "prosperity", "devotion"];

function minutesFromDuration(durationLabel: string) {
  const match = durationLabel.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

export function DailySadhanaScreen({ navigation }: { navigation: any }) {
  const {
    user,
    appLanguage,
    hasPremiumAccess,
    dailySadhanaEnabled,
    dailySadhanaDurationMinutes,
    dailySadhanaFocus,
    dailySadhanaPreferredDeity,
    setDailySadhanaEnabled,
    setDailySadhanaDurationMinutes,
    setDailySadhanaFocus,
    setDailySadhanaPreferredDeity,
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
        const progress = await loadSadhanaProgress(userId, "daily_sadhana");
        if (!cancelled) {
          setTodayCompleted(progress.todayCompleted);
          setCurrentStreak(progress.currentStreak);
        }
      } catch (error) {
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
    const preferredOrder = focusPrayerMap[dailySadhanaFocus] ?? focusPrayerMap.balanced;
    const preferredSet = new Set(preferredOrder);
    const sorted = [...prayerCatalog].sort((left, right) => {
      const leftIndex = preferredOrder.indexOf(left.id);
      const rightIndex = preferredOrder.indexOf(right.id);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
    const filtered = sorted.filter((prayer) => {
      if (dailySadhanaPreferredDeity && prayer.deity !== dailySadhanaPreferredDeity) {
        return false;
      }

      if (preferredSet.has(prayer.id)) {
        return true;
      }

      if (dailySadhanaFocus === "balanced") {
        return true;
      }

      return false;
    });

    const selected: typeof prayerCatalog = [];
    let remaining = Math.max(4, dailySadhanaDurationMinutes - 4);

    for (const prayer of filtered) {
      const prayerMinutes = minutesFromDuration(prayer.duration);
      if (selected.length > 0 && prayerMinutes > remaining + 1) {
        continue;
      }

      selected.push(prayer);
      remaining -= prayerMinutes;

      if (remaining <= 0 || selected.length >= 3) {
        break;
      }
    }

    const totalPrayerMinutes = selected.reduce((sum, prayer) => sum + minutesFromDuration(prayer.duration), 0);

    return {
      prayers: selected,
      totalMinutes: totalPrayerMinutes + 4,
    };
  }, [dailySadhanaDurationMinutes, dailySadhanaFocus, dailySadhanaPreferredDeity]);

  async function handleCompleteToday() {
    const userId = user?.id;
    if (!user || user.isGuest || !userId) return;
    setSavingCompletion(true);
    try {
      await saveSadhanaCompletion(userId, "daily_sadhana", {
        duration_minutes: dailySadhanaDurationMinutes,
        focus: dailySadhanaFocus,
        preferred_deity: dailySadhanaPreferredDeity,
      });
      const progress = await loadSadhanaProgress(userId, "daily_sadhana");
      setTodayCompleted(progress.todayCompleted);
      setCurrentStreak(progress.currentStreak);
      Alert.alert(tr("sadhana.progressTitle"), tr("sadhana.completeSuccessBody"));
    } catch (error) {
      Alert.alert(tr("premium.purchaseErrorTitle"), error instanceof Error ? error.message : "Unable to save progress.");
    } finally {
      setSavingCompletion(false);
    }
  }

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("sadhana.title")}
        subtitle={tr("sadhana.subtitle")}
        rightSlot={
          <View style={styles.headerIconWrap}>
            <Ionicons name="leaf-outline" size={24} color={AppColors.gold} />
          </View>
        }
      />

      <View style={styles.content}>
        {user?.isGuest ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("sadhana.guestTitle")}</Text>
            <Text style={styles.sectionBody}>{tr("sadhana.guestBody")}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void logout()}>
              <Text style={styles.primaryButtonText}>{tr("common.signInToContinue")}</Text>
            </Pressable>
          </SectionCard>
        ) : !hasPremiumAccess ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("sadhana.lockedTitle")}</Text>
            <Text style={styles.sectionBody}>{tr("sadhana.lockedBody")}</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate("Premium", {
                  postPurchaseRedirect: "DailySadhana",
                })
              }
            >
              <Text style={styles.primaryButtonText}>{tr("common.unlockPremium")}</Text>
            </Pressable>
          </SectionCard>
        ) : (
          <>
            <SectionCard>
              <Text style={styles.sectionTitle}>{tr("sadhana.settingsTitle")}</Text>
              <Text style={styles.sectionBody}>{tr("sadhana.settingsBody")}</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingCopy}>
                  <Text style={styles.settingTitle}>{tr("sadhana.enabledTitle")}</Text>
                  <Text style={styles.settingBody}>{tr("sadhana.enabledBody")}</Text>
                </View>
                <Switch
                  value={dailySadhanaEnabled}
                  onValueChange={setDailySadhanaEnabled}
                  thumbColor="#FFF5E4"
                  trackColor={{ false: "#D7D1CB", true: "#F0B480" }}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("sadhana.durationTitle")}</Text>
              <Text style={styles.settingBody}>{tr("sadhana.durationBody")}</Text>
              <View style={styles.chipsWrap}>
                {durationOptions.map((minutes) => {
                  const active = dailySadhanaDurationMinutes === minutes;
                  return (
                    <Pressable
                      key={minutes}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setDailySadhanaDurationMinutes(minutes)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{minutes} min</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("sadhana.focusTitle")}</Text>
              <Text style={styles.settingBody}>{tr("sadhana.focusBody")}</Text>
              <View style={styles.chipsWrap}>
                {focusOptions.map((focus) => {
                  const active = dailySadhanaFocus === focus;
                  return (
                    <Pressable
                      key={focus}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setDailySadhanaFocus(focus)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {tr(`sadhana.focus${focus.charAt(0).toUpperCase()}${focus.slice(1)}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.settingTitle}>{tr("sadhana.deityTitle")}</Text>
              <Text style={styles.settingBody}>{tr("sadhana.deityBody")}</Text>
              <View style={styles.chipsWrap}>
                <Pressable
                  style={[styles.chip, !dailySadhanaPreferredDeity && styles.chipActive]}
                  onPress={() => setDailySadhanaPreferredDeity(null)}
                >
                  <Text style={[styles.chipText, !dailySadhanaPreferredDeity && styles.chipTextActive]}>
                    {tr("sadhana.anyDeity")}
                  </Text>
                </Pressable>
                {deityCatalog.map((deity) => {
                  const active = dailySadhanaPreferredDeity === deity;
                  return (
                    <Pressable
                      key={deity}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setDailySadhanaPreferredDeity(deity)}
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
                  <Text style={styles.progressLabel}>{tr("sadhana.progressTitle")}</Text>
                  {progressLoading ? (
                    <ActivityIndicator style={styles.progressSpinner} color={AppColors.accent} />
                  ) : (
                    <>
                      <Text style={styles.progressValue}>
                        {currentStreak} {tr("sadhana.streakDays")}
                      </Text>
                      <Text style={styles.progressHelper}>{tr("sadhana.streakBody")}</Text>
                    </>
                  )}
                </View>

                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>{tr("sadhana.todayStatusTitle")}</Text>
                  {progressLoading ? (
                    <ActivityIndicator style={styles.progressSpinner} color={AppColors.accent} />
                  ) : (
                    <>
                      <Text style={styles.progressStatusValue}>
                        {todayCompleted ? tr("sadhana.todayCompleted") : tr("sadhana.todayPending")}
                      </Text>
                      <Text style={styles.progressHelper}>{tr("sadhana.todayStatusBody")}</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.planHeaderRow}>
                <View style={styles.planHeaderCopy}>
                  <Text style={styles.sectionTitle}>{tr("sadhana.planTitle")}</Text>
                  <Text style={styles.sectionBody}>{tr("sadhana.planBody")}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeLabel}>{tr("sadhana.totalTime")}</Text>
                  <Text style={styles.timeBadgeValue}>{generatedPlan.totalMinutes} min</Text>
                </View>
              </View>

              {!dailySadhanaEnabled ? (
                <Text style={styles.emptyPlanText}>{tr("sadhana.enabledBody")}</Text>
              ) : generatedPlan.prayers.length === 0 ? (
                <Text style={styles.emptyPlanText}>{tr("sadhana.noPlanBody")}</Text>
              ) : (
                <View style={styles.planStack}>
                  {todayCompleted ? (
                    <View style={styles.completedBanner}>
                      <Text style={styles.completedBannerText}>{tr("sadhana.todayCompleted")}</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={[styles.completeButton, savingCompletion && styles.completeButtonDisabled]}
                      onPress={() => void handleCompleteToday()}
                      disabled={savingCompletion}
                    >
                      <Text style={styles.completeButtonText}>
                        {savingCompletion ? tr("sadhana.savingProgress") : tr("sadhana.completeCta")}
                      </Text>
                    </Pressable>
                  )}

                  <View style={styles.planCard}>
                    <Text style={styles.planCardTitle}>{tr("sadhana.startTitle")}</Text>
                    <Text style={styles.planCardBody}>{tr("sadhana.startBody")}</Text>
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
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={AppColors.accent} />
                      </View>
                    </Pressable>
                  ))}

                  <View style={styles.planCard}>
                    <Text style={styles.planCardTitle}>{tr("sadhana.endTitle")}</Text>
                    <Text style={styles.planCardBody}>{tr("sadhana.endBody")}</Text>
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
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.22)",
    backgroundColor: "rgba(255,245,228,0.08)",
    alignItems: "center",
    justifyContent: "center",
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
  sectionBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
  },
  settingRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 6,
  },
  settingBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  divider: {
    marginTop: 18,
    marginBottom: 4,
    height: 1,
    backgroundColor: "#F1E3CB",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF7EE",
  },
  chipActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  chipText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#FFF5E4",
  },
  planHeaderRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  planHeaderCopy: {
    flex: 1,
  },
  timeBadge: {
    minWidth: 92,
    borderRadius: 20,
    backgroundColor: "#FFF7EE",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  timeBadgeLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  timeBadgeValue: {
    color: AppColors.maroon,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  progressCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
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
    gap: 12,
    marginTop: 14,
  },
  completeButton: {
    minHeight: 52,
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
    borderWidth: 1.5,
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
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF9F2",
    padding: 14,
  },
  planCardTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  planCardBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  planPrayerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.maroon,
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
  },
  planPrayerCopy: {
    flex: 1,
  },
  planPrayerMeta: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  emptyPlanText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
});
