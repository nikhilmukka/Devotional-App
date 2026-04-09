import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { toDbLanguage } from "./types";

export type ContentAccessTier = "free" | "premium";

export type PrayerListItem = {
  id: string;
  title: string;
  deityKey: string;
  deity: string;
  category: string;
  duration: string;
  festivals: string[];
  festivalKeys: string[];
  accessTier: ContentAccessTier;
  isPremium: boolean;
};

export type BrowseItem = {
  key: string;
  label: string;
};

export type HomeReminderItem = {
  type: "daily" | "festival";
  prayerId: string;
  dayLabel: string;
  title: string;
  deityKey: string;
  deity: string;
  duration: string;
  festival?: string;
  festivalKey?: string;
};

export type PrayerDetailData = {
  prayer: PrayerListItem;
  sourceLanguage: string;
  note: string;
  verses: string[];
  isPremiumLocked?: boolean;
  isAudioPremiumLocked?: boolean;
  audioUrl?: string | null;
  audioLanguage?: string | null;
};

export type AudioScheduleItem = {
  day: string;
  prayerId: string;
  prayer: string;
  deityKey: string;
  deity: string;
  meta: string;
  language: string;
  accessTier: ContentAccessTier;
  isPremium: boolean;
  hasPlayableAudio: boolean;
  audioUrl?: string | null;
};

export type AudioLibraryItem = {
  prayerId: string;
  prayer: string;
  deityKey: string;
  deity: string;
  meta: string;
  language: string;
  accessTier: ContentAccessTier;
  isPremium: boolean;
  hasPlayableAudio: boolean;
  audioUrl?: string | null;
};

export type FestivalGuideData = {
  id: string;
  festivalKey: string;
  festivalName: string;
  title: string;
  subtitle: string;
  introText: string;
  preparationNotes: string;
  itemsNeeded: string[];
  stepByStep: string[];
  accessTier: ContentAccessTier;
  isPremium: boolean;
  isLocked: boolean;
  linkedPrayerId: string | null;
  linkedPrayerTitle: string | null;
};

type PrayerRow = {
  id: string;
  slug: string;
  deity_id: string | null;
  category: string;
  estimated_duration_seconds: number | null;
  sort_order: number;
  access_tier: ContentAccessTier;
  is_featured_home: boolean;
};

type TranslationRow = {
  prayer_id: string;
  language: string;
  script: string;
  title: string;
  subtitle: string | null;
  body_plain_text: string | null;
  body_json: string[] | null;
  notes: string | null;
};

type DeityRow = {
  id: string;
  slug: string;
  sort_order: number;
};

type DeityTranslationRow = {
  deity_id: string;
  language: string;
  name: string;
};

type FestivalRow = {
  id: string;
  slug: string;
  sort_order: number;
  is_featured_home: boolean;
};

type FestivalTranslationRow = {
  festival_id: string;
  language: string;
  name: string;
};

type PrayerFestivalRow = {
  prayer_id: string;
  festival_id: string;
};

type ReminderRuleRow = {
  prayer_id: string;
  festival_id: string | null;
  day_of_week: number | null;
};

type FestivalCalendarRow = {
  festival_id: string;
  festival_date: string;
};

type FestivalGuideRow = {
  id: string;
  festival_id: string;
  language: string;
  title: string;
  subtitle: string | null;
  intro_text: string | null;
  preparation_notes: string | null;
  items_needed: string[] | null;
  step_by_step: string[] | null;
  linked_prayer_id: string | null;
  access_tier: ContentAccessTier;
  sort_order: number;
  is_published: boolean;
};

type AudioTrackRow = {
  prayer_id: string;
  language: string;
  storage_path: string;
  public_url: string | null;
  duration_seconds: number | null;
  narrator_name: string | null;
  artist_name: string | null;
  access_tier: ContentAccessTier;
};

type ReminderResolutionOptions = {
  dailyEnabled?: boolean;
  festivalEnabled?: boolean;
  hasPremiumAccess?: boolean;
};

type ResolvedReminderRpcRow = {
  reminder_rule_id: string;
  rule_type: "daily" | "festival";
  prayer_id: string;
  festival_id: string | null;
  festival_calendar_id: string | null;
  matched_date: string;
  send_time_local: string;
  priority: number;
};

function hasAccessToTier(accessTier: ContentAccessTier | null | undefined, hasPremiumAccess: boolean) {
  return (accessTier ?? "free") === "free" || hasPremiumAccess;
}

function formatDuration(seconds: number | null | undefined) {
  const minutes = Math.max(1, Math.round((seconds ?? 180) / 60));
  return `${minutes} min read`;
}

function chooseTranslatedValue<T extends { language: string } & Record<string, any>>(
  rows: T[],
  matcher: (row: T) => boolean,
  language: string,
  field: keyof T
) {
  const target = rows.find((row) => matcher(row) && row.language === language);
  if (target?.[field]) return String(target[field]);

  const english = rows.find((row) => matcher(row) && row.language === "english");
  if (english?.[field]) return String(english[field]);

  const fallback = rows.find((row) => matcher(row));
  if (fallback?.[field]) return String(fallback[field]);

  return "";
}

function choosePrayerText(
  rows: TranslationRow[],
  prayerId: string,
  appLanguage: string,
  prayerSourceLanguage: string
) {
  const appDbLanguage = toDbLanguage(appLanguage).toString();
  const sourceDbLanguage = toDbLanguage(prayerSourceLanguage).toString();

  const candidates =
    appLanguage === "English"
      ? [
          { language: sourceDbLanguage, script: "latin" },
          { language: sourceDbLanguage, script: "native" },
          { language: "hindi", script: "latin" },
          { language: "sanskrit", script: "latin" },
          { language: "english", script: "native" },
        ]
      : [
          { language: appDbLanguage, script: "native" },
          { language: appDbLanguage, script: "latin" },
          { language: "hindi", script: "native" },
          { language: "sanskrit", script: "native" },
          { language: "english", script: "native" },
        ];

  for (const candidate of candidates) {
    const row = rows.find(
      (item) =>
        item.prayer_id === prayerId &&
        item.language === candidate.language &&
        item.script === candidate.script
    );
    if (row) return row;
  }

  return rows.find((item) => item.prayer_id === prayerId) ?? null;
}

function getPrayerVerses(textRow: TranslationRow | null) {
  if (!textRow) return [];

  if (Array.isArray(textRow.body_json) && textRow.body_json.length > 0) {
    return textRow.body_json;
  }

  if (textRow.body_plain_text) {
    return textRow.body_plain_text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

async function loadCoreContent() {
  const client = getSupabaseClient();

  const [
    prayersResult,
    prayerTextsResult,
    deitiesResult,
    deityTranslationsResult,
    festivalsResult,
    festivalTranslationsResult,
    prayerFestivalsResult,
    audioTracksResult,
  ] = await Promise.all([
    client
      .from("prayers")
      .select("id, slug, deity_id, category, estimated_duration_seconds, sort_order, access_tier, is_featured_home")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    client
      .from("prayer_texts")
      .select("prayer_id, language, script, title, subtitle, body_plain_text, body_json, notes")
      .eq("is_published", true),
    client.from("deities").select("id, slug, sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
    client.from("deity_translations").select("deity_id, language, name"),
    client
      .from("festivals")
      .select("id, slug, sort_order, is_featured_home")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    client.from("festival_translations").select("festival_id, language, name"),
    client.from("prayer_festivals").select("prayer_id, festival_id"),
    client
      .from("prayer_audio_tracks")
      .select("prayer_id, language, storage_path, public_url, duration_seconds, narrator_name, artist_name, access_tier")
      .eq("is_active", true),
  ]);

  const firstError =
    prayersResult.error ||
    prayerTextsResult.error ||
    deitiesResult.error ||
    deityTranslationsResult.error ||
    festivalsResult.error ||
    festivalTranslationsResult.error ||
    prayerFestivalsResult.error ||
    audioTracksResult.error;

  if (firstError) {
    throw firstError;
  }

  return {
    prayers: (prayersResult.data ?? []) as PrayerRow[],
    prayerTexts: (prayerTextsResult.data ?? []) as TranslationRow[],
    deities: (deitiesResult.data ?? []) as DeityRow[],
    deityTranslations: (deityTranslationsResult.data ?? []) as DeityTranslationRow[],
    festivals: (festivalsResult.data ?? []) as FestivalRow[],
    festivalTranslations: (festivalTranslationsResult.data ?? []) as FestivalTranslationRow[],
    prayerFestivals: (prayerFestivalsResult.data ?? []) as PrayerFestivalRow[],
    audioTracks: (audioTracksResult.data ?? []) as AudioTrackRow[],
  };
}

function chooseAudioTrack(
  rows: AudioTrackRow[],
  prayerId: string,
  appLanguage: string,
  prayerSourceLanguage: string
) {
  const appDbLanguage = toDbLanguage(appLanguage).toString();
  const sourceDbLanguage = toDbLanguage(prayerSourceLanguage).toString();

  const candidates =
    appLanguage === "English"
      ? [sourceDbLanguage, "hindi", "sanskrit", "english"]
      : [appDbLanguage, "hindi", "sanskrit", "english"];

  for (const language of candidates) {
    const row = rows.find((item) => item.prayer_id === prayerId && item.language === language);
    if (row) return row;
  }

  return rows.find((item) => item.prayer_id === prayerId) ?? null;
}

function chooseFestivalGuide(
  rows: FestivalGuideRow[],
  festivalId: string,
  appLanguage: string
) {
  const targetLanguage = toDbLanguage(appLanguage).toString();

  return (
    rows.find((row) => row.festival_id === festivalId && row.language === targetLanguage) ??
    rows.find((row) => row.festival_id === festivalId && row.language === "english") ??
    rows.find((row) => row.festival_id === festivalId) ??
    null
  );
}

function resolveFestivalByKey(
  festivals: FestivalRow[],
  festivalTranslations: FestivalTranslationRow[],
  festivalKey: string
) {
  const normalizedKey = festivalKey.trim().toLowerCase();
  return (
    festivals.find((festival) => festival.slug.toLowerCase() === normalizedKey) ??
    festivals.find((festival) => {
      const englishName =
        chooseTranslatedValue(
          festivalTranslations,
          (row) => row.festival_id === festival.id,
          "english",
          "name"
        ) || festival.slug;
      return englishName.trim().toLowerCase() === normalizedKey;
    }) ??
    null
  );
}

export async function fetchPrayerCatalog(
  appLanguage: string,
  prayerSourceLanguage: string
): Promise<PrayerListItem[]> {
  if (!isSupabaseConfigured) return [];

  const {
    prayers,
    prayerTexts,
    deities,
    deityTranslations,
    festivals,
    festivalTranslations,
    prayerFestivals,
    audioTracks,
  } = await loadCoreContent();

  const deityById = new Map(deities.map((deity) => [deity.id, deity]));
  const festivalById = new Map(festivals.map((festival) => [festival.id, festival]));

  return prayers.map((prayer) => {
    const text = choosePrayerText(prayerTexts, prayer.id, appLanguage, prayerSourceLanguage);
    const deity = prayer.deity_id ? deityById.get(prayer.deity_id) : null;
    const linkedFestivalIds = prayerFestivals
      .filter((item) => item.prayer_id === prayer.id)
      .map((item) => item.festival_id);

    return {
      id: prayer.slug,
      title: text?.title ?? prayer.slug,
      deityKey: deity
        ? chooseTranslatedValue(
            deityTranslations,
            (row) => row.deity_id === deity.id,
            "english",
            "name"
          ) || deity.slug
        : "",
      deity: deity
        ? chooseTranslatedValue(
            deityTranslations,
            (row) => row.deity_id === deity.id,
            toDbLanguage(appLanguage),
            "name"
          ) || deity.slug
        : "",
      category: prayer.category,
      duration: formatDuration(prayer.estimated_duration_seconds),
      accessTier: prayer.access_tier ?? "free",
      isPremium: (prayer.access_tier ?? "free") === "premium",
      festivals: linkedFestivalIds
        .map((festivalId) => {
          const festival = festivalById.get(festivalId);
          if (!festival) return "";
          return (
            chooseTranslatedValue(
              festivalTranslations,
              (row) => row.festival_id === festival.id,
              toDbLanguage(appLanguage),
              "name"
            ) || festival.slug
          );
        })
        .filter(Boolean),
      festivalKeys: linkedFestivalIds
        .map((festivalId) => {
          const festival = festivalById.get(festivalId);
          if (!festival) return "";
          return (
            chooseTranslatedValue(
              festivalTranslations,
              (row) => row.festival_id === festival.id,
              "english",
              "name"
            ) || festival.slug
          );
        })
        .filter(Boolean),
    };
  });
}

export async function fetchBrowseEntities(appLanguage: string): Promise<{
  deities: BrowseItem[];
  festivals: BrowseItem[];
}> {
  if (!isSupabaseConfigured) {
    return { deities: [], festivals: [] };
  }

  const core = await loadCoreContent();

  return {
    deities: core.deities.map((deity) => ({
      key:
        chooseTranslatedValue(
          core.deityTranslations,
          (row) => row.deity_id === deity.id,
          "english",
          "name"
        ) || deity.slug,
      label:
        chooseTranslatedValue(
          core.deityTranslations,
          (row) => row.deity_id === deity.id,
          toDbLanguage(appLanguage),
          "name"
        ) || deity.slug,
    })),
    festivals: core.festivals.map((festival) => ({
      key:
        chooseTranslatedValue(
          core.festivalTranslations,
          (row) => row.festival_id === festival.id,
          "english",
          "name"
        ) || festival.slug,
      label:
        chooseTranslatedValue(
          core.festivalTranslations,
          (row) => row.festival_id === festival.id,
          toDbLanguage(appLanguage),
          "name"
        ) || festival.slug,
    })),
  };
}

export async function fetchHomeContent(
  appLanguage: string,
  prayerSourceLanguage: string,
  hasPremiumAccess = false
) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const catalog = await fetchPrayerCatalog(appLanguage, prayerSourceLanguage);
  const core = await loadCoreContent();
  const featuredPrayers = core.prayers
    .filter((prayer) => prayer.is_featured_home)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((prayer) => catalog.find((item) => item.id === prayer.slug))
    .filter(Boolean) as PrayerListItem[];
  const reminder = await fetchResolvedReminder(appLanguage, prayerSourceLanguage, {
    dailyEnabled: true,
    festivalEnabled: true,
    hasPremiumAccess,
  });

  return {
    featuredPrayers,
    deityNames: core.deities.map((deity) => ({
      key:
        chooseTranslatedValue(
          core.deityTranslations,
          (row) => row.deity_id === deity.id,
          "english",
          "name"
        ) || deity.slug,
      label:
        chooseTranslatedValue(
          core.deityTranslations,
          (row) => row.deity_id === deity.id,
          toDbLanguage(appLanguage),
          "name"
        ) || deity.slug,
    })),
    festivalNames: core.festivals
      .filter((festival) => festival.is_featured_home)
      .map((festival) => ({
        key:
          chooseTranslatedValue(
            core.festivalTranslations,
            (row) => row.festival_id === festival.id,
            "english",
            "name"
          ) || festival.slug,
        label:
          chooseTranslatedValue(
            core.festivalTranslations,
            (row) => row.festival_id === festival.id,
            toDbLanguage(appLanguage),
            "name"
          ) || festival.slug,
      })),
    reminder,
    catalog,
  };
}

export async function fetchResolvedReminder(
  appLanguage: string,
  prayerSourceLanguage: string,
  options: ReminderResolutionOptions = {}
): Promise<HomeReminderItem | null> {
  if (!isSupabaseConfigured) return null;

  const { dailyEnabled = true, festivalEnabled = true, hasPremiumAccess = false } = options;
  if (!dailyEnabled && !festivalEnabled) return null;

  const client = getSupabaseClient();
  const [catalog, core, resolvedReminderResult, festivalCalendarResult, reminderRulesResult] =
    await Promise.all([
    fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
    loadCoreContent(),
    client.rpc("resolve_active_reminder", {
      target_date: new Date().toISOString().slice(0, 10),
      target_region_code: "global",
    }),
    client
      .from("festival_calendar")
      .select("festival_id, festival_date")
      .eq("festival_date", new Date().toISOString().slice(0, 10))
      .eq("region_code", "global")
      .eq("is_active", true),
    client
      .from("reminder_rules")
      .select("prayer_id, festival_id, day_of_week")
      .eq("is_enabled", true)
      .eq("region_code", "global"),
  ]);

  if (!resolvedReminderResult.error) {
    const rpcMatch = ((resolvedReminderResult.data ?? []) as ResolvedReminderRpcRow[])[0];
    if (rpcMatch) {
      const prayer = core.prayers.find((row) => row.id === rpcMatch.prayer_id);
      const listItem = prayer ? catalog.find((item) => item.id === prayer.slug) : null;
      const festival = rpcMatch.festival_id
        ? core.festivals.find((item) => item.id === rpcMatch.festival_id)
        : null;

      const allowedByToggle =
        (rpcMatch.rule_type === "festival" && festivalEnabled) ||
        (rpcMatch.rule_type === "daily" && dailyEnabled);

      if (
        prayer &&
        listItem &&
        allowedByToggle &&
        hasAccessToTier(prayer.access_tier, hasPremiumAccess)
      ) {
        return {
          type: rpcMatch.rule_type,
          prayerId: prayer.slug,
          dayLabel: new Date(rpcMatch.matched_date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          title: listItem.title,
          deityKey: listItem.deityKey,
          deity: listItem.deity,
          duration: listItem.duration,
          festivalKey: festival
            ? chooseTranslatedValue(
                core.festivalTranslations,
                (row) => row.festival_id === festival.id,
                "english",
                "name"
              ) || festival.slug
            : undefined,
          festival: festival
            ? chooseTranslatedValue(
                core.festivalTranslations,
                (row) => row.festival_id === festival.id,
                toDbLanguage(appLanguage),
                "name"
              ) || festival.slug
            : undefined,
        };
      }
    }
  }

  if (festivalCalendarResult.error) throw festivalCalendarResult.error;
  if (reminderRulesResult.error) throw reminderRulesResult.error;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const festivalRows = (festivalCalendarResult.data ?? []) as FestivalCalendarRow[];
  const reminderRows = (reminderRulesResult.data ?? []) as ReminderRuleRow[];

  if (festivalEnabled) {
    const activeFestival = festivalRows[0];
    if (activeFestival) {
      const rule = reminderRows.find((row) => row.festival_id === activeFestival.festival_id);
      const prayer = core.prayers.find((row) => row.id === rule?.prayer_id);
      const listItem = prayer ? catalog.find((item) => item.id === prayer.slug) : null;
      const festival = core.festivals.find((item) => item.id === activeFestival.festival_id);

      if (prayer && listItem && hasAccessToTier(prayer.access_tier, hasPremiumAccess)) {
        return {
          type: "festival",
          prayerId: prayer.slug,
          dayLabel: today.toLocaleDateString("en-US", { weekday: "long" }),
          title: listItem.title,
          deityKey: listItem.deityKey,
          deity: listItem.deity,
          duration: listItem.duration,
          festivalKey: festival
            ? chooseTranslatedValue(
                core.festivalTranslations,
                (row) => row.festival_id === festival.id,
                "english",
                "name"
              ) || festival.slug
            : undefined,
          festival: festival
            ? chooseTranslatedValue(
                core.festivalTranslations,
                (row) => row.festival_id === festival.id,
                toDbLanguage(appLanguage),
                "name"
              ) || festival.slug
            : undefined,
        };
      }
    }
  }

  if (dailyEnabled) {
    const rule = reminderRows.find(
      (row) => row.festival_id === null && row.day_of_week === dayOfWeek
    );
    const prayer = core.prayers.find((row) => row.id === rule?.prayer_id);
    const listItem = prayer ? catalog.find((item) => item.id === prayer.slug) : null;

    if (prayer && listItem && hasAccessToTier(prayer.access_tier, hasPremiumAccess)) {
      return {
        type: "daily",
        prayerId: prayer.slug,
        dayLabel: today.toLocaleDateString("en-US", { weekday: "long" }),
        title: listItem.title,
        deityKey: listItem.deityKey,
        deity: listItem.deity,
        duration: listItem.duration,
      };
    }
  }

  return null;
}

export async function fetchPrayerDetail(
  prayerSlug: string,
  appLanguage: string,
  prayerSourceLanguage: string,
  hasPremiumAccess = false
): Promise<PrayerDetailData | null> {
  if (!isSupabaseConfigured) return null;

  const [catalog, core] = await Promise.all([
    fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
    loadCoreContent(),
  ]);
  const listItem = catalog.find((item) => item.id === prayerSlug);
  if (!listItem) return null;

  const client = getSupabaseClient();
  const { data: prayerData, error: prayerError } = await client
    .from("prayers")
    .select("id, access_tier")
    .eq("slug", prayerSlug)
    .maybeSingle<{ id: string; access_tier: ContentAccessTier }>();

  if (prayerError) throw prayerError;
  if (!prayerData?.id) return null;

  if (!hasAccessToTier(prayerData.access_tier, hasPremiumAccess)) {
    return {
      prayer: listItem,
      sourceLanguage: appLanguage === "English" ? prayerSourceLanguage : appLanguage,
      note: "",
      verses: [],
      isPremiumLocked: true,
      audioUrl: null,
      audioLanguage: null,
    };
  }

  const { data: textRows, error: textError } = await client
    .from("prayer_texts")
    .select("prayer_id, language, script, title, subtitle, body_plain_text, body_json, notes")
    .eq("prayer_id", prayerData.id)
    .eq("is_published", true);

  if (textError) throw textError;

  const chosen = choosePrayerText(
    (textRows ?? []) as TranslationRow[],
    prayerData.id,
    appLanguage,
    prayerSourceLanguage
  );

  if (!chosen) return null;

  const selectedAudioTrack = chooseAudioTrack(
    core.audioTracks,
    prayerData.id,
    appLanguage,
    prayerSourceLanguage
  );
  const hasAudioAccess = selectedAudioTrack
    ? hasAccessToTier(selectedAudioTrack.access_tier, hasPremiumAccess)
    : false;

  return {
    prayer: {
      ...listItem,
      title: chosen.title || listItem.title,
    },
    sourceLanguage:
      appLanguage === "English" ? prayerSourceLanguage : appLanguage,
    note: chosen.notes ?? "",
    verses: getPrayerVerses(chosen),
    isAudioPremiumLocked: Boolean(selectedAudioTrack) && !hasAudioAccess,
    audioUrl: hasAudioAccess ? selectedAudioTrack?.public_url ?? null : null,
    audioLanguage: selectedAudioTrack?.language ?? null,
  };
}

export async function fetchAudioSchedule(
  appLanguage: string,
  prayerSourceLanguage: string,
  hasPremiumAccess = false
): Promise<AudioScheduleItem[]> {
  if (!isSupabaseConfigured) return [];

  const client = getSupabaseClient();
  const [catalog, reminderRulesResult, core] = await Promise.all([
          fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
    client
      .from("reminder_rules")
      .select("prayer_id, day_of_week")
      .eq("rule_type", "daily")
      .eq("is_enabled", true)
      .eq("region_code", "global"),
    loadCoreContent(),
  ]);

  if (reminderRulesResult.error) {
    throw reminderRulesResult.error;
  }

  const catalogBySlug = new Map(catalog.map((prayer) => [prayer.id, prayer]));
  const prayerIdByDbId = new Map<string, PrayerListItem>(
    core.prayers
      .map((row) => {
        const prayer = catalogBySlug.get(row.slug);
        return prayer ? ([row.id, prayer] as const) : null;
      })
      .filter(Boolean) as Array<readonly [string, PrayerListItem]>
  );

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return ((reminderRulesResult.data ?? []) as ReminderRuleRow[])
    .filter((row) => row.day_of_week !== null)
    .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
    .flatMap((row) => {
      const prayer = prayerIdByDbId.get(row.prayer_id);
      if (!prayer || row.day_of_week === null) return [];

      const audioTrack = chooseAudioTrack(
        core.audioTracks,
        row.prayer_id,
        appLanguage,
        prayerSourceLanguage
      );
      if (!audioTrack) return [];

      const durationMinutes = `${Math.max(
        1,
        Math.round((audioTrack.duration_seconds ?? 180) / 60)
      )} min`;
      const metaSuffix = audioTrack.narrator_name || audioTrack.artist_name || "Audio prayer";

      return [
        {
          day: weekdayNames[row.day_of_week] ?? "Sunday",
          prayerId: prayer.id,
          prayer: prayer.title,
          deityKey: prayer.deityKey,
          deity: prayer.deity,
          meta: `${durationMinutes} · ${metaSuffix}`,
          language: audioTrack.language,
          accessTier: audioTrack.access_tier ?? "free",
          isPremium: (audioTrack.access_tier ?? "free") === "premium",
          hasPlayableAudio:
            hasAccessToTier(audioTrack.access_tier, hasPremiumAccess) && Boolean(audioTrack.public_url),
          audioUrl: hasAccessToTier(audioTrack.access_tier, hasPremiumAccess) ? audioTrack.public_url : null,
        },
      ];
    });
}

export async function fetchAudioLibrary(
  appLanguage: string,
  prayerSourceLanguage: string,
  hasPremiumAccess = false
): Promise<AudioLibraryItem[]> {
  if (!isSupabaseConfigured) return [];

  const [catalog, core] = await Promise.all([
    fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
    loadCoreContent(),
  ]);

  const catalogBySlug = new Map(catalog.map((prayer) => [prayer.id, prayer]));

  return core.audioTracks
    .map((track) => {
      const prayerRow = core.prayers.find((row) => row.id === track.prayer_id);
      if (!prayerRow) return null;

      const prayer = catalogBySlug.get(prayerRow.slug);
      if (!prayer) return null;

      const durationMinutes = `${Math.max(
        1,
        Math.round((track.duration_seconds ?? 180) / 60)
      )} min`;
      const metaSuffix = track.narrator_name || track.artist_name || "Audio prayer";

      return {
        prayerId: prayer.id,
        prayer: prayer.title,
        deityKey: prayer.deityKey,
        deity: prayer.deity,
        meta: `${durationMinutes} · ${metaSuffix}`,
        language: track.language,
        accessTier: track.access_tier ?? "free",
        isPremium: (track.access_tier ?? "free") === "premium",
        hasPlayableAudio:
          hasAccessToTier(track.access_tier, hasPremiumAccess) && Boolean(track.public_url),
        audioUrl: hasAccessToTier(track.access_tier, hasPremiumAccess) ? track.public_url : null,
      };
    })
    .filter(Boolean) as AudioLibraryItem[];
}

export async function fetchFestivalGuide(
  festivalKey: string,
  appLanguage: string,
  prayerSourceLanguage: string,
  hasPremiumAccess = false
): Promise<FestivalGuideData | null> {
  if (!isSupabaseConfigured) return null;

  const client = getSupabaseClient();
  const [core, catalog, guideRowsResult] = await Promise.all([
    loadCoreContent(),
    fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
    client
      .from("festival_pooja_guides")
      .select(
        "id, festival_id, language, title, subtitle, intro_text, preparation_notes, items_needed, step_by_step, linked_prayer_id, access_tier, sort_order, is_published"
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (guideRowsResult.error) {
    throw guideRowsResult.error;
  }

  const festival = resolveFestivalByKey(core.festivals, core.festivalTranslations, festivalKey);
  if (!festival) return null;

  const guide = chooseFestivalGuide(
    (guideRowsResult.data ?? []) as FestivalGuideRow[],
    festival.id,
    appLanguage
  );
  if (!guide) return null;

  const linkedPrayerRow = guide.linked_prayer_id
    ? core.prayers.find((prayer) => prayer.id === guide.linked_prayer_id)
    : null;
  const linkedPrayer = linkedPrayerRow
    ? catalog.find((prayer) => prayer.id === linkedPrayerRow.slug) ?? null
    : null;
  const guideIsLocked = !hasAccessToTier(guide.access_tier, hasPremiumAccess);

  return {
    id: guide.id,
    festivalKey:
      chooseTranslatedValue(
        core.festivalTranslations,
        (row) => row.festival_id === festival.id,
        "english",
        "name"
      ) || festival.slug,
    festivalName:
      chooseTranslatedValue(
        core.festivalTranslations,
        (row) => row.festival_id === festival.id,
        toDbLanguage(appLanguage),
        "name"
      ) || festival.slug,
    title: guide.title,
    subtitle: guide.subtitle ?? "",
    introText: guide.intro_text ?? "",
    preparationNotes: guideIsLocked ? "" : guide.preparation_notes ?? "",
    itemsNeeded: guideIsLocked ? [] : guide.items_needed ?? [],
    stepByStep: guideIsLocked ? [] : guide.step_by_step ?? [],
    accessTier: guide.access_tier ?? "premium",
    isPremium: (guide.access_tier ?? "premium") === "premium",
    isLocked: guideIsLocked,
    linkedPrayerId: linkedPrayer?.id ?? null,
    linkedPrayerTitle: linkedPrayer?.title ?? null,
  };
}
