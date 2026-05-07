export type DbLanguageCode =
  | "english"
  | "hindi"
  | "telugu"
  | "kannada"
  | "tamil"
  | "marathi"
  | "sanskrit";

export type SubscriptionTier = "free" | "premium_individual" | "premium_family";
export type EntitlementStatus =
  | "inactive"
  | "trial"
  | "active"
  | "grace_period"
  | "canceled"
  | "expired";

export const dbLanguageToUiLanguage: Record<DbLanguageCode, string> = {
  english: "English",
  hindi: "Hindi",
  telugu: "Telugu",
  kannada: "Kannada",
  tamil: "Tamil",
  marathi: "Marathi",
  sanskrit: "Sanskrit",
};

export const uiLanguageToDbLanguage: Record<string, DbLanguageCode> = {
  English: "english",
  Hindi: "hindi",
  Telugu: "telugu",
  Kannada: "kannada",
  Tamil: "tamil",
  Marathi: "marathi",
  Sanskrit: "sanskrit",
};

export function toDbLanguage(language: string): DbLanguageCode {
  return uiLanguageToDbLanguage[language] ?? "english";
}

export function toUiLanguage(language: string | null | undefined): string {
  if (!language) return "English";
  return dbLanguageToUiLanguage[language as DbLanguageCode] ?? "English";
}

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  contact_number: string | null;
  avatar_url: string | null;
  app_language: DbLanguageCode;
  prayer_source_language: DbLanguageCode;
};

export type UserPreferencesRow = {
  user_id: string;
  notifications_enabled: boolean;
  daily_reminder_enabled: boolean;
  festival_reminder_enabled: boolean;
  festival_preparation_reminder_enabled: boolean;
  festival_preparation_lead_days: number;
  daily_sadhana_enabled: boolean;
  daily_sadhana_duration_minutes: number;
  daily_sadhana_focus: string;
  daily_sadhana_preferred_deity: string | null;
  family_learning_enabled: boolean;
  family_learning_age_group: string;
  family_learning_mode: string;
  family_learning_preferred_deity: string | null;
  reminder_time_local: string;
};

export type UserEntitlementRow = {
  user_id: string;
  subscription_tier: SubscriptionTier;
  entitlement_status: EntitlementStatus;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  product_code: string | null;
  valid_until: string | null;
  is_lifetime: boolean;
};

export type UserPrivateShlokaRow = {
  id: string;
  user_id: string;
  title: string;
  source_language: DbLanguageCode;
  script: "native" | "latin";
  body_plain_text: string;
  notes: string | null;
  sort_order: number;
  is_pinned: boolean;
  is_active: boolean;
  recording_storage_path: string | null;
  recording_duration_seconds: number | null;
  recording_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSadhanaSessionRow = {
  id: string;
  user_id: string;
  session_type: "daily_sadhana" | "family_learning";
  session_date: string;
  completed_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};
