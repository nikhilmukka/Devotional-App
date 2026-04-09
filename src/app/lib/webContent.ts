import type { AppLanguage } from "../i18n";
import type { Deity, Prayer, PrayerContent, PrayerVerse } from "../data/prayers";
import type { Festival } from "../data/festivals";
import { isWebSupabaseConfigured, webSupabase } from "./webSupabase";

type DeityRow = {
  id: string;
  slug: string;
  icon_name: string | null;
  theme_start_color: string | null;
  theme_end_color: string | null;
  sort_order: number;
};

type DeityTranslationRow = {
  deity_id: string;
  language: string;
  name: string;
  tagline: string | null;
};

type PrayerRow = {
  id: string;
  slug: string;
  deity_id: string | null;
  category: string;
  estimated_duration_seconds: number | null;
  sort_order: number;
  is_featured_home: boolean;
  access_tier: "free" | "premium";
};

type PrayerTextRow = {
  prayer_id: string;
  language: string;
  script: string;
  title: string;
  subtitle: string | null;
  body_plain_text: string | null;
  body_json: string[] | null;
};

type AudioTrackRow = {
  prayer_id: string;
  language: string;
  storage_path: string;
  public_url: string | null;
  duration_seconds: number | null;
  narrator_name: string | null;
  artist_name: string | null;
  access_tier: "free" | "premium";
};

type ReminderRuleRow = {
  id: string;
  rule_type: "daily" | "festival";
  prayer_id: string;
  festival_id: string | null;
  day_of_week: number | null;
  region_code: string;
  is_enabled: boolean;
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
  access_tier: "free" | "premium";
  is_published: boolean;
};

type FestivalRow = {
  id: string;
  slug: string;
  symbol: string | null;
  theme_start_color: string | null;
  theme_end_color: string | null;
  sort_order: number;
  is_featured_home: boolean;
};

type FestivalTranslationRow = {
  festival_id: string;
  language: string;
  name: string;
  native_name: string | null;
  short_description: string | null;
};

type FestivalCalendarRow = {
  festival_id: string;
  festival_date: string;
};

type PrayerFestivalRow = {
  prayer_id: string;
  festival_id: string;
};

export type WebAudioTrack = {
  id: string;
  prayerId: string;
  title: string;
  deity: Deity | undefined;
  accent: string;
  durationMinutes: number;
  previewText: string;
  publicUrl: string | null;
  language: string;
  metaLabel: string;
  accessTier: "free" | "premium";
  isPremium: boolean;
};

export type WebPrayerCatalog = {
  deities: Deity[];
  festivals: Festival[];
  prayers: Prayer[];
  audioTracks: WebAudioTrack[];
};

export type WebResolvedReminder = {
  type: "daily" | "festival";
  prayerId: string;
  title: string;
  deityName: string;
  dayLabel: string;
  duration: string;
  festivalName?: string;
};

export type WebFestivalGuide = {
  id: string;
  festivalId: string;
  festivalName: string;
  title: string;
  subtitle: string;
  introText: string;
  preparationNotes: string;
  itemsNeeded: string[];
  stepByStep: string[];
  linkedPrayerId: string | null;
  linkedPrayerTitle: string | null;
  accessTier: "free" | "premium";
  isPremium: boolean;
};

const deityIconAliases: Record<string, string> = {
  elephant: "🐘",
  moon: "🌙",
  lotus: "🪷",
  flower: "✿",
  sword: "⚔️",
  hands: "🙏",
  bow: "🏹",
  star: "✦",
  spark: "✨",
  sun: "🌞",
  veena: "🎼",
  book: "📖",
  peacock: "🦚",
  swan: "🦢",
};

const festivalSymbolAliases: Record<string, string> = {
  lamp: "🪔",
  flower: "🌺",
  colors: "🎨",
  color: "🎨",
  lotus: "🪷",
  moon: "🌙",
  knot: "🪢",
  elephant: "🐘",
  spark: "✨",
  star: "✨",
};

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildLightBackground(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}18` : "#FFF5E4";
}

function normalizeDeityIcon(iconName: string | null) {
  if (!iconName) return "✦";

  if (iconName.length <= 3) {
    return iconName;
  }

  return deityIconAliases[iconName.trim().toLowerCase()] || "✦";
}

function normalizeFestivalSymbol(symbol: string | null) {
  if (!symbol) return "✨";

  if (symbol.length <= 3) {
    return symbol;
  }

  return festivalSymbolAliases[symbol.trim().toLowerCase()] || "✨";
}

function chooseTranslation(
  rows: DeityTranslationRow[],
  deityId: string,
  language: AppLanguage
) {
  return (
    rows.find((row) => row.deity_id === deityId && row.language === language) ||
    rows.find((row) => row.deity_id === deityId && row.language === "english") ||
    rows.find((row) => row.deity_id === deityId)
  );
}

function choosePrayerText(rows: PrayerTextRow[], prayerId: string, language: AppLanguage) {
  return (
    rows.find((row) => row.prayer_id === prayerId && row.language === language) ||
    rows.find((row) => row.prayer_id === prayerId && row.language === "english") ||
    rows.find((row) => row.prayer_id === prayerId && row.language === "hindi") ||
    rows.find((row) => row.prayer_id === prayerId)
  );
}

function chooseFestivalTranslation(
  rows: FestivalTranslationRow[],
  festivalId: string,
  language: AppLanguage
) {
  return (
    rows.find((row) => row.festival_id === festivalId && row.language === language) ||
    rows.find((row) => row.festival_id === festivalId && row.language === "english") ||
    rows.find((row) => row.festival_id === festivalId)
  );
}

function buildPrayerContentRows(rows: PrayerTextRow[], prayerId: string): PrayerContent[] {
  return rows
    .filter((row) => row.prayer_id === prayerId)
    .map((row) => {
      const verses: PrayerVerse[] = Array.isArray(row.body_json) && row.body_json.length > 0
        ? row.body_json.map((text) => ({ type: "verse", text }))
        : (row.body_plain_text || "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((text) => ({ type: "verse", text }));

      return {
        lang: row.language,
        langLabel: row.language.charAt(0).toUpperCase() + row.language.slice(1),
        verses,
      };
    });
}

function buildPrayerPreviewText(content: PrayerContent[], title: string) {
  const previewLines = content
    .flatMap((row) => row.verses)
    .filter((verse) => verse.type === "verse" || verse.type === "refrain")
    .slice(0, 2)
    .map((verse) => verse.text.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return previewLines.join(" ") || `${title}. A devotional audio experience.`;
}

function formatReadDuration(seconds: number | null) {
  const minutes = Math.max(1, Math.round((seconds || 180) / 60));
  return `${minutes} min read`;
}

function mapCategoryToSubtitle(category: string) {
  const normalized = category.trim().toLowerCase();
  if (normalized === "aarti") return "Aarti";
  if (normalized === "chalisa") return "Chalisa";
  if (normalized === "mantra") return "Mantra";
  if (normalized === "bhajan") return "Bhajan";
  if (normalized === "stotram") return "Stotram";
  if (normalized === "ashtakam") return "Ashtakam";
  if (normalized === "ashtak") return "Ashtak";
  if (normalized === "shloka") return "Shloka";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

async function loadWebCoreContent() {
  if (!isWebSupabaseConfigured || !webSupabase) {
    return null;
  }

  const [
    deitiesResult,
    deityTranslationsResult,
    festivalsResult,
    festivalTranslationsResult,
    festivalCalendarResult,
    prayerFestivalsResult,
    prayersResult,
    prayerTextsResult,
    audioTracksResult,
  ] = await Promise.all([
    webSupabase
      .from("deities")
      .select("id, slug, icon_name, theme_start_color, theme_end_color, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    webSupabase
      .from("deity_translations")
      .select("deity_id, language, name, tagline"),
    webSupabase
      .from("festivals")
      .select("id, slug, symbol, theme_start_color, theme_end_color, sort_order, is_featured_home")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    webSupabase
      .from("festival_translations")
      .select("festival_id, language, name, native_name, short_description"),
    webSupabase
      .from("festival_calendar")
      .select("festival_id, festival_date")
      .eq("is_active", true),
    webSupabase
      .from("prayer_festivals")
      .select("prayer_id, festival_id"),
    webSupabase
      .from("prayers")
      .select("id, slug, deity_id, category, estimated_duration_seconds, sort_order, is_featured_home, access_tier")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    webSupabase
      .from("prayer_texts")
      .select("prayer_id, language, script, title, subtitle, body_plain_text, body_json")
      .eq("is_published", true),
    webSupabase
      .from("prayer_audio_tracks")
      .select("prayer_id, language, storage_path, public_url, duration_seconds, narrator_name, artist_name, access_tier")
      .eq("is_active", true),
  ]);

  const firstError =
    deitiesResult.error ||
    deityTranslationsResult.error ||
    festivalsResult.error ||
    festivalTranslationsResult.error ||
    festivalCalendarResult.error ||
    prayerFestivalsResult.error ||
    prayersResult.error ||
    prayerTextsResult.error ||
    audioTracksResult.error;

  if (firstError) {
    throw firstError;
  }

  return {
    deities: (deitiesResult.data ?? []) as DeityRow[],
    deityTranslations: (deityTranslationsResult.data ?? []) as DeityTranslationRow[],
    festivals: (festivalsResult.data ?? []) as FestivalRow[],
    festivalTranslations: (festivalTranslationsResult.data ?? []) as FestivalTranslationRow[],
    festivalCalendarDates: (festivalCalendarResult.data ?? []) as FestivalCalendarRow[],
    prayerFestivals: (prayerFestivalsResult.data ?? []) as PrayerFestivalRow[],
    prayers: (prayersResult.data ?? []) as PrayerRow[],
    prayerTexts: (prayerTextsResult.data ?? []) as PrayerTextRow[],
    audioTracks: (audioTracksResult.data ?? []) as AudioTrackRow[],
  };
}

export async function fetchWebDeities(language: AppLanguage): Promise<Deity[]> {
  const core = await loadWebCoreContent();

  if (!core) {
    return [];
  }

  return core.deities.map((deity) => {
    const translation = chooseTranslation(core.deityTranslations, deity.id, language);
    const color1 = deity.theme_start_color || "#FF8C42";
    const color2 = deity.theme_end_color || "#D4AF37";

    return {
      id: deity.slug,
      name: translation?.name || titleizeSlug(deity.slug),
      symbol: normalizeDeityIcon(deity.icon_name),
      tagline: translation?.tagline || "Divine guide",
      color1,
      color2,
      bgLight: buildLightBackground(color1),
    };
  });
}

export async function fetchWebPrayerCatalog(language: AppLanguage): Promise<WebPrayerCatalog> {
  const core = await loadWebCoreContent();

  if (!core) {
    return { deities: [], festivals: [], prayers: [], audioTracks: [] };
  }

  const deities = await fetchWebDeities(language);
  const deityByInternalId = new Map(
    core.deities.map((deityRow) => [deityRow.id, deities.find((deity) => deity.id === deityRow.slug)])
  );
  const prayerByInternalId = new Map(core.prayers.map((prayer) => [prayer.id, prayer]));

  const prayers: Prayer[] = core.prayers.map((prayerRow) => {
    const textRow = choosePrayerText(core.prayerTexts, prayerRow.id, language);
    const deity = prayerRow.deity_id ? deityByInternalId.get(prayerRow.deity_id) : undefined;

    return {
      id: prayerRow.slug,
      deityId: deity?.id || "unknown",
      title: textRow?.title || titleizeSlug(prayerRow.slug),
      subtitle: textRow?.subtitle || mapCategoryToSubtitle(prayerRow.category || "Prayer"),
      duration: formatReadDuration(prayerRow.estimated_duration_seconds),
      featured: prayerRow.is_featured_home,
      accessTier: prayerRow.access_tier ?? 'free',
      isPremium: (prayerRow.access_tier ?? 'free') === 'premium',
      content: buildPrayerContentRows(core.prayerTexts, prayerRow.id),
    };
  });

  const prayersBySlug = new Map(prayers.map((prayer) => [prayer.id, prayer]));
  const prayerSlugByInternalId = new Map(core.prayers.map((prayer) => [prayer.id, prayer.slug]));

  const festivals: Festival[] = core.festivals.map((festivalRow) => {
    const translation = chooseFestivalTranslation(core.festivalTranslations, festivalRow.id, language);
    const calendarDates = core.festivalCalendarDates
      .filter((row) => row.festival_id === festivalRow.id)
      .map((row) => new Date(row.festival_date))
      .filter((date) => !Number.isNaN(date.getTime()));
    const prayerIds = core.prayerFestivals
      .filter((row) => row.festival_id === festivalRow.id)
      .map((row) => prayerSlugByInternalId.get(row.prayer_id))
      .filter(Boolean) as string[];
    const months = Array.from(
      new Set(calendarDates.map((date) => date.getMonth() + 1))
    ).sort((a, b) => a - b);
    const dateInfo =
      calendarDates.length > 0
        ? calendarDates
            .slice()
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) =>
              date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })
            )
            .join(" / ")
        : "Date to be updated";
    const color1 = festivalRow.theme_start_color || "#FF9500";
    const color2 = festivalRow.theme_end_color || "#D4572A";

    return {
      id: festivalRow.slug,
      name: translation?.name || titleizeSlug(festivalRow.slug),
      nameHindi: translation?.native_name || translation?.name || titleizeSlug(festivalRow.slug),
      symbol: normalizeFestivalSymbol(festivalRow.symbol),
      description: translation?.short_description || "Sacred celebration",
      dateInfo,
      months,
      color1,
      color2,
      bgLight: buildLightBackground(color1),
      prayerIds,
    };
  });

  const audioTracks: WebAudioTrack[] = core.audioTracks
    .map((track) => {
      const prayerRow = prayerByInternalId.get(track.prayer_id);
      if (!prayerRow) return null;

      const prayer = prayersBySlug.get(prayerRow.slug);
      if (!prayer) return null;

      const deity = prayerRow.deity_id ? deityByInternalId.get(prayerRow.deity_id) : undefined;
      const narrator = track.narrator_name || track.artist_name || track.language;

      return {
        id: `${prayer.id}-${track.language}`,
        prayerId: prayer.id,
        title: prayer.title,
        deity,
        accent: deity?.color1 || "#FF8C42",
        durationMinutes: Math.max(1, Math.round((track.duration_seconds || 180) / 60)),
        previewText: buildPrayerPreviewText(prayer.content, prayer.title),
        publicUrl: track.public_url,
        language: track.language,
        metaLabel: narrator,
        accessTier: track.access_tier ?? 'free',
        isPremium: (track.access_tier ?? 'free') === 'premium',
      };
    })
    .filter(Boolean) as WebAudioTrack[];

  return { deities, festivals, prayers, audioTracks };
}

export async function fetchWebResolvedReminder(language: AppLanguage): Promise<WebResolvedReminder | null> {
  const core = await loadWebCoreContent();
  if (!core || !webSupabase) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [resolvedResult, catalog] = await Promise.all([
    webSupabase.rpc('resolve_active_reminder', {
      target_date: today,
      target_region_code: 'global',
    }),
    fetchWebPrayerCatalog(language),
  ]);

  if (resolvedResult.error) {
    throw resolvedResult.error;
  }

  const match = (resolvedResult.data ?? [])[0] as
    | { rule_type: "daily" | "festival"; prayer_id: string; festival_id: string | null; matched_date: string }
    | undefined;

  if (!match) return null;

  const prayerRow = core.prayers.find((item) => item.id === match.prayer_id);
  if (!prayerRow) return null;

  const prayer = catalog.prayers.find((item) => item.id === prayerRow.slug);
  if (!prayer) return null;

  const deity = catalog.deities.find((item) => item.id === prayer.deityId);
  const festival = match.festival_id
    ? core.festivals.find((item) => item.id === match.festival_id)
    : null;
  const festivalName = festival
    ? chooseFestivalTranslation(core.festivalTranslations, festival.id, language)?.name || titleizeSlug(festival.slug)
    : undefined;

  return {
    type: match.rule_type,
    prayerId: prayer.id,
    title: prayer.title,
    deityName: deity?.name || 'Devotee',
    dayLabel: new Date(match.matched_date).toLocaleDateString('en-US', { weekday: 'long' }),
    duration: prayer.duration,
    festivalName,
  };
}

export async function fetchWebFestivalGuide(
  festivalSlug: string,
  language: AppLanguage
): Promise<WebFestivalGuide | null> {
  const core = await loadWebCoreContent();
  if (!core || !webSupabase) return null;

  const festival = core.festivals.find((item) => item.slug === festivalSlug);
  if (!festival) return null;

  const [{ data, error }, catalog] = await Promise.all([
    webSupabase
      .from('festival_pooja_guides')
      .select(
        'id, festival_id, language, title, subtitle, intro_text, preparation_notes, items_needed, step_by_step, linked_prayer_id, access_tier, is_published'
      )
      .eq('festival_id', festival.id)
      .eq('is_published', true),
    fetchWebPrayerCatalog(language),
  ]);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FestivalGuideRow[];
  const guide =
    rows.find((row) => row.language === language) ||
    rows.find((row) => row.language === 'english') ||
    rows[0];

  if (!guide) return null;

  const festivalName =
    chooseFestivalTranslation(core.festivalTranslations, festival.id, language)?.name ||
    titleizeSlug(festival.slug);

  const linkedPrayerSlug = guide.linked_prayer_id
    ? core.prayers.find((item) => item.id === guide.linked_prayer_id)?.slug || null
    : null;

  const linkedPrayerTitle = linkedPrayerSlug
    ? catalog.prayers.find((item) => item.id === linkedPrayerSlug)?.title || null
    : null;

  return {
    id: guide.id,
    festivalId: festival.slug,
    festivalName,
    title: guide.title,
    subtitle: guide.subtitle || '',
    introText: guide.intro_text || '',
    preparationNotes: guide.preparation_notes || '',
    itemsNeeded: guide.items_needed || [],
    stepByStep: guide.step_by_step || [],
    linkedPrayerId: linkedPrayerSlug,
    linkedPrayerTitle,
    accessTier: guide.access_tier ?? 'free',
    isPremium: (guide.access_tier ?? 'free') === 'premium',
  };
}
