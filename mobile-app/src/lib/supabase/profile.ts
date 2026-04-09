import type { User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { getSupabaseClient } from "./client";
import {
  type ProfileRow,
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
  reminderTime: string;
  favoritePrayerIds: string[];
  subscriptionTier: UserEntitlementRow["subscription_tier"];
  entitlementStatus: UserEntitlementRow["entitlement_status"];
  entitlementValidUntil: string | null;
  entitlementIsLifetime: boolean;
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
    reminderTime?: string;
  }
) {
  const client = getSupabaseClient();
  const payload: Record<string, boolean | string> = {};

  if (updates.dailyReminderEnabled !== undefined) {
    payload.daily_reminder_enabled = updates.dailyReminderEnabled;
  }
  if (updates.festivalReminderEnabled !== undefined) {
    payload.festival_reminder_enabled = updates.festivalReminderEnabled;
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
  userId: string,
  expoPushToken: string,
  deviceName?: string
) {
  const client = getSupabaseClient();
  const platform =
    Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";

  const { data: existingByToken, error: existingByTokenError } = await client
    .from("user_devices")
    .select("id")
    .eq("expo_push_token", expoPushToken)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingByTokenError) {
    throw existingByTokenError;
  }

  if (existingByToken?.id) {
    const { error } = await client
      .from("user_devices")
      .update({
        user_id: userId,
        platform,
        device_name: deviceName || null,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existingByToken.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { data: existingForUser, error: existingForUserError } = await client
    .from("user_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingForUserError) {
    throw existingForUserError;
  }

  if (existingForUser?.id) {
    const { error } = await client
      .from("user_devices")
      .update({
        expo_push_token: expoPushToken,
        device_name: deviceName || null,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existingForUser.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await client.from("user_devices").insert({
    user_id: userId,
    platform,
    expo_push_token: expoPushToken,
    device_name: deviceName || null,
    is_active: true,
    last_seen_at: new Date().toISOString(),
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
