import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../components/GradientHeader";
import { PremiumFeatureCard } from "../components/PremiumFeatureCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { fetchResolvedReminder, type HomeReminderItem } from "../lib/supabase/content";
import { getTodayReminder } from "../data/reminders";
import {
  getLocalizedPrayerTitle,
  getLocalizedWeekday,
  t,
} from "../i18n";
import { AppColors } from "../theme/colors";

export function RemindersScreen({ navigation }: { navigation: any }) {
  const {
    user,
    appLanguage,
    prayerSourceLanguage,
    hasPremiumAccess,
    isSupabaseConnected,
    dailyReminderEnabled,
    festivalReminderEnabled,
    festivalPreparationReminderEnabled,
    festivalPreparationLeadDays,
    reminderTime,
    pushRegistrationStatus,
    pushRegistrationMessage,
    isDeviceRegistered,
    setDailyReminderEnabled,
    setFestivalReminderEnabled,
    setFestivalPreparationReminderEnabled,
    setFestivalPreparationLeadDays,
    registerDeviceForNotifications,
    logout,
  } = useApp();

  const tr = (path: string) => t(appLanguage, path);
  const [liveReminder, setLiveReminder] = useState<HomeReminderItem | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReminder() {
      if (!isSupabaseConnected) return;

      try {
        const content = await fetchResolvedReminder(appLanguage, prayerSourceLanguage, {
          dailyEnabled: dailyReminderEnabled,
          festivalEnabled: festivalReminderEnabled,
          hasPremiumAccess,
        });
        if (active) {
          setLiveReminder(content);
        }
      } catch (error) {
        console.warn("Failed to load live reminder", error);
      }
    }

    void loadReminder();

    return () => {
      active = false;
    };
  }, [
    appLanguage,
    dailyReminderEnabled,
    festivalReminderEnabled,
    hasPremiumAccess,
    isSupabaseConnected,
    prayerSourceLanguage,
  ]);

  const fallbackReminder = getTodayReminder();
  const getPreparationLeadLabel = (days: number) =>
    days === 1 ? tr("reminders.preparationLeadOneDay") : tr("reminders.preparationLeadTwoDays");
  const deviceIsRegistered = isDeviceRegistered || pushRegistrationStatus === "registered";
  const reminder = useMemo<HomeReminderItem | null>(() => {
    if (liveReminder) return liveReminder;
    if (isSupabaseConnected) return null;

    return {
      type: fallbackReminder.type,
      prayerId:
        fallbackReminder.title === "Holi Ke Din"
          ? "holi-ke-din"
          : fallbackReminder.title === "Lakshmi Puja Vidhi"
            ? "lakshmi-puja"
            : fallbackReminder.title === "Sri Suktam"
              ? "sri-suktam"
              : fallbackReminder.title === "Hare Krishna Mahamantra"
                ? "hare-krishna-mahamantra"
                : fallbackReminder.title === "Durga Aarti"
                  ? "durga-aarti"
                  : fallbackReminder.title === "Ganesh Aarti"
                    ? "ganesh-aarti"
                    : fallbackReminder.title === "Mahamrityunjaya Mantra"
                      ? "mahamrityunjaya-mantra"
                      : fallbackReminder.title === "Surya Namaskar Mantra"
                        ? "surya-mantra"
                        : "hanuman-chalisa",
      dayLabel: fallbackReminder.dayLabel,
      title: fallbackReminder.title,
      deityKey: fallbackReminder.deity,
      deity: fallbackReminder.deity,
      duration: fallbackReminder.duration,
      festivalKey: fallbackReminder.festival,
      festival: fallbackReminder.festival,
    };
  }, [fallbackReminder, isSupabaseConnected, liveReminder]);
  const notificationsEnabled = (dailyReminderEnabled || festivalReminderEnabled) && Boolean(reminder);

  return (
    <ScreenContainer>
      <GradientHeader title={tr("reminders.title")} subtitle={tr("reminders.subtitle")} />

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("reminders.settings")}</Text>
          {user?.isGuest ? (
            <Text style={styles.settingNotice}>
              Sign in to turn on devotional reminders and keep them synced to your account.
            </Text>
          ) : null}
          <View style={[styles.settingRow, user?.isGuest && styles.settingRowDisabled]}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{tr("reminders.dailyReminder")}</Text>
              <Text style={styles.settingBody}>
                {tr("reminders.reminderTime")}: {reminderTime}
              </Text>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={setDailyReminderEnabled}
              disabled={Boolean(user?.isGuest)}
              trackColor={{ false: "#D9C8AF", true: "#E7B082" }}
              thumbColor={dailyReminderEnabled ? AppColors.accent : "#FFF7EE"}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast, user?.isGuest && styles.settingRowDisabled]}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{tr("reminders.festivalReminder")}</Text>
              <Text style={styles.settingBody}>{tr("reminders.todayWillShow")}</Text>
            </View>
            <Switch
              value={festivalReminderEnabled}
              onValueChange={setFestivalReminderEnabled}
              disabled={Boolean(user?.isGuest)}
              trackColor={{ false: "#D9C8AF", true: "#E7B082" }}
              thumbColor={festivalReminderEnabled ? AppColors.accent : "#FFF7EE"}
            />
          </View>
        </SectionCard>

        {!hasPremiumAccess ? (
          <PremiumFeatureCard
            eyebrow={tr("common.premium")}
            icon="notifications-outline"
            title={tr("reminders.advancedTitle")}
            body={tr("reminders.advancedBody")}
            bullets={[
              tr("reminders.advancedPoint1"),
              tr("reminders.advancedPoint2"),
              tr("reminders.advancedPoint3"),
            ]}
            ctaLabel={user?.isGuest ? tr("common.signInToContinue") : tr("common.unlockPremium")}
            onPress={() => {
              if (user?.isGuest) {
                void logout();
                return;
              }

              navigation.navigate("Premium", {
                postPurchaseRedirect: "Reminders",
              });
            }}
          />
        ) : null}

        {hasPremiumAccess ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("reminders.premiumSectionTitle")}</Text>
            <Text style={styles.settingBody}>{tr("reminders.premiumSectionBody")}</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>{tr("reminders.preparationReminderTitle")}</Text>
                <Text style={styles.settingBody}>{tr("reminders.preparationReminderBody")}</Text>
              </View>
              <Switch
                value={festivalPreparationReminderEnabled}
                onValueChange={setFestivalPreparationReminderEnabled}
                trackColor={{ false: "#D9C8AF", true: "#E7B082" }}
                thumbColor={festivalPreparationReminderEnabled ? AppColors.accent : "#FFF7EE"}
              />
            </View>

            <View style={styles.settingRowLast}>
              <Text style={styles.settingTitle}>{tr("reminders.preparationLeadTimeTitle")}</Text>
              <Text style={styles.settingBody}>{tr("reminders.preparationLeadTimeBody")}</Text>
              <View style={styles.optionButtonRow}>
                {[1, 2].map((days) => {
                  const active = festivalPreparationLeadDays === days;
                  return (
                    <Pressable
                      key={days}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                      onPress={() => setFestivalPreparationLeadDays(days)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          active && styles.optionButtonTextActive,
                        ]}
                      >
                        {getPreparationLeadLabel(days)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SectionCard>
        ) : null}

        <SectionCard>
          <Text style={styles.sectionTitle}>Device Notifications</Text>
          <Text style={styles.settingBody}>
            {user?.isGuest
              ? "Sign in to save your reminder preferences and receive devotional notifications on this iPhone."
              : "Enable devotional notifications on this iPhone so your daily and festival reminders can be delivered here."}
          </Text>

          {user?.isGuest ? (
            <View style={styles.deviceButtonRow}>
              <Pressable
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => void logout()}
              >
                <Text style={styles.primaryActionButtonText}>{tr("common.signInToContinue")}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.deviceStatusBox}>
                <Text style={styles.deviceStatusLabel}>Status</Text>
                <Text style={styles.deviceStatusValue}>
                  {deviceIsRegistered
                    ? "Enabled"
                    : pushRegistrationStatus === "denied"
                      ? "Permission needed"
                    : pushRegistrationStatus === "missing_project_id"
                        ? "Not available yet"
                        : pushRegistrationStatus === "unavailable"
                          ? "Requires this iPhone"
                          : pushRegistrationStatus === "error"
                            ? "Could not enable"
                            : "Not enabled"}
                </Text>
                {pushRegistrationMessage ? (
                  <Text style={styles.deviceStatusMessage}>{pushRegistrationMessage}</Text>
                ) : null}
              </View>

              <View style={styles.deviceButtonRow}>
                <Pressable
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={async () => {
                    const result = await registerDeviceForNotifications();
                    Alert.alert("Notifications", result.message);
                  }}
                >
                  <Text style={styles.primaryActionButtonText}>Enable on This iPhone</Text>
                </Pressable>
              </View>
            </>
          )}
        </SectionCard>

        {notificationsEnabled && reminder ? (
          <Pressable
            style={styles.activeCard}
            onPress={() =>
              navigation.navigate("PrayerDetail", {
                prayerId: reminder.prayerId,
              })
            }
          >
            <Text style={styles.activeLabel}>{tr("reminders.activeReminder")}</Text>
            <Text style={styles.activeType}>
              {reminder.type === "festival"
                ? tr("reminders.activeTypeFestival")
                : tr("reminders.activeTypeDaily")}
            </Text>
            <Text style={styles.activeTitle}>
              {getLocalizedPrayerTitle(appLanguage, reminder.title)}
            </Text>
            <Text style={styles.activeMeta}>
              {getLocalizedWeekday(appLanguage, reminder.dayLabel)} · {reminder.duration}
            </Text>
            <Text style={styles.activeMeta}>
              {reminder.deity}
              {reminder.type === "festival" && reminder.festival
                ? ` · ${reminder.festival}`
                : ""}
            </Text>
            <View style={styles.activeFooter}>
              <Text style={styles.activeFooterText}>{tr("reminders.prayerForToday")}</Text>
              <Ionicons name="chevron-forward" size={18} color={AppColors.gold} />
            </View>
          </Pressable>
        ) : (
          <SectionCard>
            <Text style={styles.offTitle}>{tr("reminders.notificationsOff")}</Text>
          </SectionCard>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0C8",
  },
  settingRowDisabled: {
    opacity: 0.55,
  },
  settingRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  settingTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  settingBody: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  settingNotice: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  deviceStatusBox: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: "#F0E0C8",
    padding: 14,
  },
  deviceStatusLabel: {
    color: AppColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  deviceStatusValue: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  deviceStatusMessage: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  deviceButtonRow: {
    marginTop: 14,
    gap: 10,
  },
  queueHeaderRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    marginBottom: 6,
  },
  devSubsection: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#F0E0C8",
  },
  devSubsectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  queueActionWrap: {
    alignItems: "stretch",
    gap: 8,
    width: "100%",
  },
  queueNowButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,168,124,0.32)",
    backgroundColor: "rgba(255,140,66,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  queueNowButtonText: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  runDispatchButton: {
    borderRadius: 14,
    backgroundColor: AppColors.maroon,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  runDispatchButtonText: {
    color: "#FFF5E4",
    fontSize: 12,
    fontWeight: "700",
  },
  activityList: {
    marginTop: 14,
    gap: 12,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#FFF9F1",
    padding: 12,
  },
  activityIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.maroon,
    marginTop: 2,
  },
  activityTextWrap: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  activityMeta: {
    color: AppColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  activityStatus: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButton: {
    backgroundColor: AppColors.maroon,
  },
  primaryActionButtonText: {
    color: "#FFF5E4",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryActionButton: {
    backgroundColor: "#FFF5E4",
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  secondaryActionButtonText: {
    color: AppColors.maroon,
    fontSize: 13,
    fontWeight: "700",
  },
  activeCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: AppColors.maroon,
  },
  activeLabel: {
    color: "rgba(255,245,228,0.72)",
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  activeType: {
    color: AppColors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  activeTitle: {
    color: "#FFF5E4",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  activeMeta: {
    color: "rgba(255,245,228,0.72)",
    fontSize: 13,
    marginTop: 8,
  },
  activeFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  activeFooterText: {
    color: AppColors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  offTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  optionButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  optionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E7C9A3",
    backgroundColor: "#FFF7EE",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionButtonActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  optionButtonText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  optionButtonTextActive: {
    color: "#FFF8ED",
  },
});
