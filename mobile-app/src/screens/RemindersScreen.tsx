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
  fetchRecentNotificationActivity,
  type NotificationActivityItem,
} from "../lib/supabase/profile";
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
    reminderTime,
    pushRegistrationStatus,
    pushRegistrationMessage,
    setDailyReminderEnabled,
    setFestivalReminderEnabled,
    registerDeviceForNotifications,
    scheduleLocalNotificationPreview,
  } = useApp();

  const tr = (path: string) => t(appLanguage, path);
  const [liveReminder, setLiveReminder] = useState<HomeReminderItem | null>(null);
  const [notificationActivity, setNotificationActivity] = useState<NotificationActivityItem[]>([]);
  const [activityRefreshNonce, setActivityRefreshNonce] = useState(0);

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

  useEffect(() => {
    let active = true;

    async function loadNotificationActivity() {
      if (!user?.id || user.isGuest || !isSupabaseConnected) {
        if (active) {
          setNotificationActivity([]);
        }
        return;
      }

      try {
        const activity = await fetchRecentNotificationActivity(user.id);
        if (active) {
          setNotificationActivity(activity);
        }
      } catch (error) {
        console.warn("Failed to load notification activity", error);
      }
    }

    void loadNotificationActivity();

    return () => {
      active = false;
    };
  }, [activityRefreshNonce, isSupabaseConnected, pushRegistrationStatus, user?.id, user?.isGuest]);

  const fallbackReminder = getTodayReminder();
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
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{tr("reminders.dailyReminder")}</Text>
              <Text style={styles.settingBody}>
                {tr("reminders.reminderTime")}: {reminderTime}
              </Text>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={setDailyReminderEnabled}
              trackColor={{ false: "#D9C8AF", true: "#E7B082" }}
              thumbColor={dailyReminderEnabled ? AppColors.accent : "#FFF7EE"}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>{tr("reminders.festivalReminder")}</Text>
              <Text style={styles.settingBody}>{tr("reminders.todayWillShow")}</Text>
            </View>
            <Switch
              value={festivalReminderEnabled}
              onValueChange={setFestivalReminderEnabled}
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
            ctaLabel={tr("common.unlockPremium")}
            onPress={() => navigation.navigate("Premium")}
          />
        ) : null}

        <SectionCard>
          <Text style={styles.sectionTitle}>Device Notifications</Text>
          <Text style={styles.settingBody}>
            Register this iPhone for devotional push notifications. This is the groundwork step before we connect server-side sending.
          </Text>

          <View style={styles.deviceStatusBox}>
            <Text style={styles.deviceStatusLabel}>Status</Text>
            <Text style={styles.deviceStatusValue}>
              {pushRegistrationStatus === "registered"
                ? "Registered"
                : pushRegistrationStatus === "denied"
                  ? "Permission denied"
                  : pushRegistrationStatus === "missing_project_id"
                    ? "Expo project ID missing"
                    : pushRegistrationStatus === "unavailable"
                      ? "Physical device required"
                      : pushRegistrationStatus === "error"
                        ? "Registration failed"
                        : "Not registered"}
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
                setActivityRefreshNonce((current) => current + 1);
                Alert.alert("Notifications", result.message);
              }}
            >
              <Text style={styles.primaryActionButtonText}>Enable on This iPhone</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.secondaryActionButton]}
              onPress={async () => {
                const result = await scheduleLocalNotificationPreview(reminder?.prayerId ?? null);
                setActivityRefreshNonce((current) => current + 1);
                if (result.error) {
                  Alert.alert("Notification Preview", result.error);
                  return;
                }
                if (result.notice) {
                  Alert.alert("Notification Preview", result.notice);
                }
              }}
            >
              <Text style={styles.secondaryActionButtonText}>Preview Local Alert</Text>
            </Pressable>
          </View>
        </SectionCard>

        {user?.id && !user.isGuest ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>Recent Notification Activity</Text>
            {notificationActivity.length > 0 ? (
              <View style={styles.activityList}>
                {notificationActivity.map((item) => (
                  <View key={item.id} style={styles.activityRow}>
                    <View style={styles.activityIconWrap}>
                      <Ionicons
                        name={
                          item.status === "sent"
                            ? "checkmark"
                            : item.status === "failed"
                              ? "alert"
                              : "time-outline"
                        }
                        size={14}
                        color="#FFF5E4"
                      />
                    </View>
                    <View style={styles.activityTextWrap}>
                      <Text style={styles.activityTitle}>{item.message}</Text>
                      <Text style={styles.activityMeta}>
                        {item.prayerSlug ? `${item.prayerSlug} · ` : ""}
                        {item.sentAt
                          ? new Date(item.sentAt).toLocaleString()
                          : new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.activityStatus}>{item.status}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.settingBody}>
                Notification previews and future push sends will appear here once activity is logged for this account.
              </Text>
            )}
          </SectionCard>
        ) : null}

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
});
