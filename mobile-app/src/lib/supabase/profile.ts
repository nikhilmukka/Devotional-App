import type { User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { getSupabaseClient } from "./client";
import {
  type ProfileRow,
  type UserSadhanaSessionRow,
  type UserEntitlementRow,
  type UserPreferencesRow,
  toDbLanguage,
  toUiLanguage,
} from "./types";

export type LoadedUserState = {
  user: {
    id: string;
    name: string;
    email: string;
    contactNumber?: string;
    photoUri?: string;
  };
  appLanguage: string;
  prayerSourceLanguage: string;
  dailyReminderEnabled: boolean;
  festivalReminderEnabled: boolean;
  festivalPreparationReminderEnabled: boolean;
  festivalPreparationLeadDays: number;
  dailySadhanaEnabled: boolean;
  dailySadhanaDurationMinutes: number;
  dailySadhanaFocus: string;
  dailySadhanaPreferredDeity: string | null;
  familyLearningEnabled: boolean;
  familyLearningAgeGroup: string;
  familyLearningMode: string;
  familyLearningPreferredDeity: string | null;
  reminderTime: string;
  favoritePrayerIds: string[];
  subscriptionTier: UserEntitlementRow["subscription_tier"];
  entitlementStatus: UserEntitlementRow["entitlement_status"];
  entitlementValidUntil: string | null;
  entitlementIsLifetime: boolean;
};

export type SadhanaProgress = {
  todayCompleted: boolean;
  currentStreak: number;
  recentDates: string[];
  lastCompletedAt: string | null;
};

function toReminderTimeLabel(time24: string | null | undefined) {
  if (!time24) return "6:30 AM";
  const [hourText = "6", minuteText = "30"] = time24.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time24;

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function toReminderTimeDb(timeLabel: string) {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "06:30";

  const [, hourText, minuteText, meridiem] = match;
  let hour = Number(hourText);
  if (meridiem.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minuteText}`;
}

function createDefaultEntitlement(userId: string): UserEntitlementRow {
  return {
    user_id: userId,
    subscription_tier: "free",
    entitlement_status: "inactive",
    provider: "manual",
    provider_customer_id: null,
    provider_subscription_id: null,
    product_code: null,
    valid_until: null,
    is_lifetime: false,
  };
}

function isMissingEntitlementsTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.message?.includes("user_entitlements") || false;
}

function formatSessionDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, delta: number) {
  const next = new Date(base);
  next.setDate(base.getDate() + delta);
  return next;
}

async function ensureProfile(user: User): Promise<ProfileRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    "Devotee";

  const { data: inserted, error: insertError } = await client
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      app_language: "english",
      prayer_source_language: "hindi",
    })
    .select("*")
    .single<ProfileRow>();

  if (insertError) {
    throw insertError;
  }

  return inserted;
}

async function ensurePreferences(userId: string): Promise<UserPreferencesRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserPreferencesRow>();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: inserted, error: insertError } = await client
    .from("user_preferences")
    .insert({
      user_id: userId,
      notifications_enabled: true,
      daily_reminder_enabled: true,
      festival_reminder_enabled: true,
      festival_preparation_reminder_enabled: false,
      festival_preparation_lead_days: 1,
      daily_sadhana_enabled: false,
      daily_sadhana_duration_minutes: 15,
      daily_sadhana_focus: "balanced",
      daily_sadhana_preferred_deity: null,
      family_learning_enabled: false,
      family_learning_age_group: "family",
      family_learning_mode: "meaning",
      family_learning_preferred_deity: null,
      reminder_time_local: "06:30",
    })
    .select("*")
    .single<UserPreferencesRow>();

  if (insertError) {
    throw insertError;
  }

  return inserted;
}

async function ensureEntitlement(userId: string): Promise<UserEntitlementRow> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("user_entitlements")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<UserEntitlementRow>();

  if (error) {
    if (isMissingEntitlementsTable(error)) {
      return createDefaultEntitlement(userId);
    }
    throw error;
  }

  if (data) {
    return data;
  }

  const defaultEntitlement = createDefaultEntitlement(userId);
  const { data: inserted, error: insertError } = await client
    .from("user_entitlements")
    .insert(defaultEntitlement)
    .select("*")
    .single<UserEntitlementRow>();

  if (insertError) {
    if (isMissingEntitlementsTable(insertError)) {
      return defaultEntitlement;
    }
    throw insertError;
  }

  return inserted;
}

async function getFavoritePrayerIds(userId: string): Promise<string[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("user_favorites")
    .select("prayer:prayers(slug)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (
    data?.flatMap((row: any) => (row.prayer?.slug ? [row.prayer.slug as string] : [])) ?? []
  );
}

export async function loadUserState(user: User): Promise<LoadedUserState> {
  const [profile, preferences, favoritePrayerIds, entitlement] = await Promise.all([
    ensureProfile(user),
    ensurePreferences(user.id),
    getFavoritePrayerIds(user.id),
    ensureEntitlement(user.id),
  ]);

  return {
    user: {
      id: user.id,
      name: profile.full_name || user.email?.split("@")[0] || "Devotee",
      email: profile.email || user.email || "",
      contactNumber: profile.contact_number ?? undefined,
      photoUri: profile.avatar_url ?? undefined,
    },
    appLanguage: toUiLanguage(profile.app_language),
    prayerSourceLanguage: toUiLanguage(profile.prayer_source_language),
    dailyReminderEnabled: preferences.daily_reminder_enabled,
    festivalReminderEnabled: preferences.festival_reminder_enabled,
    festivalPreparationReminderEnabled: preferences.festival_preparation_reminder_enabled,
    festivalPreparationLeadDays: preferences.festival_preparation_lead_days,
    dailySadhanaEnabled: preferences.daily_sadhana_enabled,
    dailySadhanaDurationMinutes: preferences.daily_sadhana_duration_minutes,
    dailySadhanaFocus: preferences.daily_sadhana_focus,
    dailySadhanaPreferredDeity: preferences.daily_sadhana_preferred_deity,
    familyLearningEnabled: preferences.family_learning_enabled,
    familyLearningAgeGroup: preferences.family_learning_age_group,
    familyLearningMode: preferences.family_learning_mode,
    familyLearningPreferredDeity: preferences.family_learning_preferred_deity,
    reminderTime: toReminderTimeLabel(preferences.reminder_time_local),
    favoritePrayerIds,
    subscriptionTier: entitlement.subscription_tier,
    entitlementStatus: entitlement.entitlement_status,
    entitlementValidUntil: entitlement.valid_until,
    entitlementIsLifetime: entitlement.is_lifetime,
  };
}

export async function saveProfileDetails(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    contactNumber?: string;
    photoUri?: string;
  }
) {
  const client = getSupabaseClient();
  const payload: Record<string, string | null> = {};

  if (updates.email !== undefined && updates.email) {
    const { error: authError } = await client.auth.updateUser({
      email: updates.email,
    });

    if (authError) {
      throw authError;
    }
  }

  if (updates.name !== undefined) payload.full_name = updates.name || null;
  if (updates.email !== undefined) payload.email = updates.email || "";
  if (updates.contactNumber !== undefined) payload.contact_number = updates.contactNumber || null;
  if (updates.photoUri !== undefined) payload.avatar_url = updates.photoUri || null;

  const { error } = await client.from("profiles").update(payload).eq("id", userId);
  if (error) {
    throw error;
  }
}

export async function saveLanguagePreferences(
  userId: string,
  appLanguage: string,
  prayerSourceLanguage: string
) {
  const client = getSupabaseClient();
  const { error } = await client
    .from("profiles")
    .update({
      app_language: toDbLanguage(appLanguage),
      prayer_source_language: toDbLanguage(prayerSourceLanguage),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function saveReminderPreferences(
  userId: string,
  updates: {
    dailyReminderEnabled?: boolean;
    festivalReminderEnabled?: boolean;
    festivalPreparationReminderEnabled?: boolean;
    festivalPreparationLeadDays?: number;
    reminderTime?: string;
  }
) {
  const client = getSupabaseClient();
  const payload: Record<string, boolean | string | number> = {};

  if (updates.dailyReminderEnabled !== undefined) {
    payload.daily_reminder_enabled = updates.dailyReminderEnabled;
  }
  if (updates.festivalReminderEnabled !== undefined) {
    payload.festival_reminder_enabled = updates.festivalReminderEnabled;
  }
  if (updates.festivalPreparationReminderEnabled !== undefined) {
    payload.festival_preparation_reminder_enabled = updates.festivalPreparationReminderEnabled;
  }
  if (updates.festivalPreparationLeadDays !== undefined) {
    payload.festival_preparation_lead_days = Math.min(
      2,
      Math.max(1, Math.floor(updates.festivalPreparationLeadDays))
    );
  }
  if (updates.reminderTime !== undefined) {
    payload.reminder_time_local = toReminderTimeDb(updates.reminderTime);
  }

  if (Object.keys(payload).length === 0) return;

  const { error } = await client.from("user_preferences").update(payload).eq("user_id", userId);
  if (error) {
    throw error;
  }
}

export async function saveSadhanaPreferences(
  userId: string,
  updates: {
    dailySadhanaEnabled?: boolean;
    dailySadhanaDurationMinutes?: number;
    dailySadhanaFocus?: string;
    dailySadhanaPreferredDeity?: string | null;
  }
) {
  const client = getSupabaseClient();
  const payload: Record<string, boolean | string | number | null> = {};

  if (updates.dailySadhanaEnabled !== undefined) {
    payload.daily_sadhana_enabled = updates.dailySadhanaEnabled;
  }
  if (updates.dailySadhanaDurationMinutes !== undefined) {
    payload.daily_sadhana_duration_minutes = Math.min(
      20,
      Math.max(10, Math.floor(updates.dailySadhanaDurationMinutes))
    );
  }
  if (updates.dailySadhanaFocus !== undefined) {
    payload.daily_sadhana_focus = updates.dailySadhanaFocus;
  }
  if (updates.dailySadhanaPreferredDeity !== undefined) {
    payload.daily_sadhana_preferred_deity = updates.dailySadhanaPreferredDeity || null;
  }

  if (Object.keys(payload).length === 0) return;

  const { error } = await client.from("user_preferences").update(payload).eq("user_id", userId);
  if (error) {
    throw error;
  }
}

export async function loadSadhanaProgress(
  userId: string,
  sessionType: UserSadhanaSessionRow["session_type"] = "daily_sadhana"
): Promise<SadhanaProgress> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("user_sadhana_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_type", sessionType)
    .order("session_date", { ascending: false })
    .limit(60)
    .returns<UserSadhanaSessionRow[]>();

  if (error) {
    throw error;
  }

  const sessions = data ?? [];
  const recentDates = sessions.map((session) => session.session_date);
  const lastCompletedAt = sessions[0]?.completed_at ?? null;
  const today = new Date();
  const todayKey = formatSessionDate(today);
  const yesterdayKey = formatSessionDate(addDays(today, -1));
  const dateSet = new Set(recentDates);
  const todayCompleted = dateSet.has(todayKey);

  let streakAnchor = todayCompleted ? today : dateSet.has(yesterdayKey) ? addDays(today, -1) : null;
  let currentStreak = 0;

  while (streakAnchor) {
    const streakKey = formatSessionDate(streakAnchor);
    if (!dateSet.has(streakKey)) {
      break;
    }

    currentStreak += 1;
    streakAnchor = addDays(streakAnchor, -1);
  }

  return {
    todayCompleted,
    currentStreak,
    recentDates,
    lastCompletedAt,
  };
}

export async function saveSadhanaCompletion(
  userId: string,
  sessionType: UserSadhanaSessionRow["session_type"] = "daily_sadhana",
  metadata: Record<string, unknown> = {}
) {
  const client = getSupabaseClient();
  const todayKey = formatSessionDate(new Date());
  const payload = {
    user_id: userId,
    session_type: sessionType,
    session_date: todayKey,
    completed_at: new Date().toISOString(),
    metadata,
  };

  const { error } = await client
    .from("user_sadhana_sessions")
    .upsert(payload, { onConflict: "user_id,session_type,session_date" });

  if (error) {
    throw error;
  }
}

export async function saveFamilyLearningPreferences(
  userId: string,
  updates: {
    familyLearningEnabled?: boolean;
    familyLearningAgeGroup?: string;
    familyLearningMode?: string;
    familyLearningPreferredDeity?: string | null;
  }
) {
  const client = getSupabaseClient();
  const payload: Record<string, boolean | string | null> = {};

  if (updates.familyLearningEnabled !== undefined) {
    payload.family_learning_enabled = updates.familyLearningEnabled;
  }
  if (updates.familyLearningAgeGroup !== undefined) {
    payload.family_learning_age_group = updates.familyLearningAgeGroup;
  }
  if (updates.familyLearningMode !== undefined) {
    payload.family_learning_mode = updates.familyLearningMode;
  }
  if (updates.familyLearningPreferredDeity !== undefined) {
    payload.family_learning_preferred_deity = updates.familyLearningPreferredDeity || null;
  }

  if (Object.keys(payload).length === 0) return;

  const { error } = await client.from("user_preferences").update(payload).eq("user_id", userId);
  if (error) {
    throw error;
  }
}

export async function saveUserEntitlement(
  userId: string,
  updates: {
    subscriptionTier: UserEntitlementRow["subscription_tier"];
    entitlementStatus: UserEntitlementRow["entitlement_status"];
    entitlementValidUntil?: string | null;
    entitlementIsLifetime?: boolean;
    provider?: string;
    providerCustomerId?: string | null;
    providerSubscriptionId?: string | null;
    productCode?: string | null;
  }
) {
  const client = getSupabaseClient();

  const payload: UserEntitlementRow = {
    user_id: userId,
    subscription_tier: updates.subscriptionTier,
    entitlement_status: updates.entitlementStatus,
    provider: updates.provider ?? "manual",
    provider_customer_id: updates.providerCustomerId ?? null,
    provider_subscription_id: updates.providerSubscriptionId ?? null,
    product_code: updates.productCode ?? null,
    valid_until: updates.entitlementValidUntil ?? null,
    is_lifetime: updates.entitlementIsLifetime ?? false,
  };

  const { error } = await client
    .from("user_entitlements")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    if (isMissingEntitlementsTable(error)) {
      return;
    }
    throw error;
  }
}

export async function addFavoritePrayer(userId: string, prayerId: string) {
  const client = getSupabaseClient();
  const { data: prayer, error: prayerError } = await client
    .from("prayers")
    .select("id")
    .eq("slug", prayerId)
    .maybeSingle<{ id: string }>();

  if (prayerError) {
    throw prayerError;
  }
  if (!prayer?.id) {
    return;
  }

  const { error } = await client.from("user_favorites").upsert({
    user_id: userId,
    prayer_id: prayer.id,
  });

  if (error) {
    throw error;
  }
}

export async function removeFavoritePrayer(userId: string, prayerId: string) {
  const client = getSupabaseClient();
  const { data: prayer, error: prayerError } = await client
    .from("prayers")
    .select("id")
    .eq("slug", prayerId)
    .maybeSingle<{ id: string }>();

  if (prayerError) {
    throw prayerError;
  }
  if (!prayer?.id) {
    return;
  }

  const { error } = await client
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("prayer_id", prayer.id);

  if (error) {
    throw error;
  }
}

export async function saveUserDevice(
  _userId: string,
  expoPushToken: string,
  deviceName?: string
) {
  const client = getSupabaseClient();
  const platform =
    Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
  const { error } = await client.rpc("register_my_device", {
    p_platform: platform,
    p_expo_push_token: expoPushToken,
    p_device_name: deviceName || null,
    p_app_version: null,
  });

  if (error) {
    throw error;
  }
}

export type NotificationActivityItem = {
  id: string;
  status: string;
  provider: string;
  createdAt: string;
  sentAt: string | null;
  message: string;
  prayerSlug: string | null;
};

export async function fetchRegisteredUserDevice(userId: string) {
  const client = getSupabaseClient();
  const platform =
    Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

  const { data, error } = await client
    .from("user_devices")
    .select("id, expo_push_token, last_seen_at, is_active")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string;
      expo_push_token: string | null;
      last_seen_at: string | null;
      is_active: boolean;
    }>();

  if (error) {
    throw error;
  }

  return {
    isRegistered: Boolean(data?.id && data?.expo_push_token),
    expoPushToken: data?.expo_push_token ?? null,
  };
}

export type NotificationDispatchJobItem = {
  id: string;
  status: string;
  provider: string;
  scheduledForLocal: string;
  createdAt: string;
  sentAt: string | null;
  lastError: string | null;
  prayerSlug: string | null;
  reminderType: "daily" | "festival" | null;
  reminderVariant: string | null;
};

export type NotificationDispatchRunResult = {
  ok: boolean;
  claimed: number;
  sent: number;
  failed: number;
  retried?: number;
  results: Array<{
    jobId: string;
    status: "sent" | "failed" | "queued";
    error?: string;
  }>;
};

async function extractFunctionInvokeErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "context" in error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      const text = await context.text().catch(() => "");
      if (text) {
        try {
          const parsed = JSON.parse(text) as { error?: string; details?: string; message?: string };
          return parsed.details || parsed.error || parsed.message || text;
        } catch {
          return text;
        }
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Unable to invoke reminder dispatch.";
}

function extractSupabaseRpcErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
      return candidate.message;
    }

    if (typeof candidate.details === "string" && candidate.details.trim().length > 0) {
      return candidate.details;
    }

    if (typeof candidate.hint === "string" && candidate.hint.trim().length > 0) {
      return candidate.hint;
    }

    if (typeof candidate.code === "string" && candidate.code.trim().length > 0) {
      return `Supabase error: ${candidate.code}`;
    }
  }

  return "Unable to complete the Supabase request.";
}

export async function logNotificationEvent(input: {
  userId: string;
  status: string;
  provider?: string;
  prayerSlug?: string | null;
  sentAt?: string | null;
  responsePayload?: Record<string, unknown> | null;
}) {
  const client = getSupabaseClient();

  let prayerId: string | null = null;
  if (input.prayerSlug) {
    const { data: prayer, error: prayerError } = await client
      .from("prayers")
      .select("id")
      .eq("slug", input.prayerSlug)
      .maybeSingle<{ id: string }>();

    if (prayerError) {
      throw prayerError;
    }

    prayerId = prayer?.id ?? null;
  }

  const { error } = await client.from("notification_logs").insert({
    user_id: input.userId,
    prayer_id: prayerId,
    status: input.status,
    provider: input.provider ?? "expo",
    response_payload: input.responsePayload ?? {},
    sent_at: input.sentAt ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function fetchRecentNotificationActivity(
  userId: string
): Promise<NotificationActivityItem[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("notification_logs")
    .select("id, status, provider, created_at, sent_at, response_payload, prayer:prayers(slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return (
    data?.map((row: any) => ({
      id: row.id as string,
      status: (row.status as string) || "queued",
      provider: (row.provider as string) || "expo",
      createdAt: row.created_at as string,
      sentAt: (row.sent_at as string | null) ?? null,
      message:
        typeof row.response_payload?.message === "string"
          ? row.response_payload.message
          : typeof row.response_payload?.title === "string"
            ? row.response_payload.title
            : "Devotional reminder activity",
      prayerSlug: (row.prayer?.slug as string | undefined) ?? null,
    })) ?? []
  );
}

export async function queueTodaysReminderJobs(
  targetDate?: string,
  targetRegionCode = "global"
): Promise<NotificationDispatchJobItem[]> {
  const client = getSupabaseClient();
  const payload: Record<string, string> = {
    target_region_code: targetRegionCode,
  };

  if (targetDate) {
    payload.target_date = targetDate;
  }

  const { data, error } = await client.rpc("queue_my_due_notification_jobs", payload);

  if (error) {
    throw new Error(extractSupabaseRpcErrorMessage(error));
  }

  return (
    (data as any[] | null)?.map((row) => ({
      id: row.job_id as string,
      status: (row.job_status as string) || "queued",
      provider: "expo_dispatch",
      scheduledForLocal: row.scheduled_for_local as string,
      createdAt: row.scheduled_for_local as string,
      sentAt: null,
      lastError: null,
      prayerSlug: (row.prayer_slug as string | null) ?? null,
      reminderType: (row.reminder_type as "daily" | "festival" | null) ?? null,
      reminderVariant: (row.reminder_variant as string | null) ?? null,
    })) ?? []
  );
}

export async function fetchRecentNotificationDispatchJobs(
  userId: string
): Promise<NotificationDispatchJobItem[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("notification_dispatch_jobs")
    .select(
      "id, job_status, provider, scheduled_for_local, created_at, sent_at, last_error, payload, reminder_rule:reminder_rules(rule_type), prayer:prayers(slug)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw error;
  }

  return (
    data?.map((row: any) => ({
      id: row.id as string,
      status: (row.job_status as string) || "queued",
      provider: (row.provider as string) || "expo_dispatch",
      scheduledForLocal: row.scheduled_for_local as string,
      createdAt: row.created_at as string,
      sentAt: (row.sent_at as string | null) ?? null,
      lastError: (row.last_error as string | null) ?? null,
      prayerSlug: (row.prayer?.slug as string | undefined) ?? null,
      reminderType: (row.reminder_rule?.rule_type as "daily" | "festival" | undefined) ?? null,
      reminderVariant:
        typeof row.payload?.reminder_variant === "string"
          ? (row.payload.reminder_variant as string)
          : null,
    })) ?? []
  );
}

export async function runNotificationDispatch(
  targetRegionCode = "global",
  maxJobs = 25
): Promise<NotificationDispatchRunResult> {
  const client = getSupabaseClient();
  const { data, error } = await client.functions.invoke("dispatch-reminder-notifications", {
    body: {
      regionCode: targetRegionCode,
      maxJobs,
    },
  });

  if (error) {
    throw new Error(await extractFunctionInvokeErrorMessage(error));
  }

  return {
    ok: Boolean((data as any)?.ok),
    claimed: Number((data as any)?.claimed ?? 0),
    sent: Number((data as any)?.sent ?? 0),
    failed: Number((data as any)?.failed ?? 0),
    retried: Number((data as any)?.retried ?? 0),
    results: Array.isArray((data as any)?.results) ? (data as any).results : [],
  };
}
