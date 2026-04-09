import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { webSupabase, isWebSupabaseConfigured } from "../lib/webSupabase";
import "../../styles/admin.css";

type AdminTab =
  | "overview"
  | "deities"
  | "festivals"
  | "calendar"
  | "guides"
  | "prayers"
  | "texts"
  | "audio"
  | "reminders";

type DeityRow = {
  id: string;
  slug: string;
  icon_name: string | null;
  theme_start_color: string | null;
  theme_end_color: string | null;
  sort_order: number;
  is_active: boolean;
};

type DeityTranslationRow = {
  id: string;
  deity_id: string;
  language: string;
  name: string;
  tagline: string | null;
};

type FestivalRow = {
  id: string;
  slug: string;
  symbol: string | null;
  theme_start_color: string | null;
  theme_end_color: string | null;
  sort_order: number;
  is_featured_home: boolean;
  is_active: boolean;
};

type FestivalTranslationRow = {
  id: string;
  festival_id: string;
  language: string;
  name: string;
  native_name: string | null;
  short_description: string | null;
};

type FestivalCalendarRow = {
  id: string;
  festival_id: string;
  festival_date: string;
  region_code: string;
  calendar_system: string;
  source_name: string | null;
  source_url: string | null;
  is_active: boolean;
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
  sort_order: number;
  is_published: boolean;
};

type PrayerRow = {
  id: string;
  slug: string;
  deity_id: string | null;
  category: string;
  estimated_duration_seconds: number | null;
  verse_count: number | null;
  sort_order: number;
  access_tier: "free" | "premium";
  is_featured_home: boolean;
  is_audio_available: boolean;
  is_active: boolean;
};

type PrayerTextRow = {
  id: string;
  prayer_id: string;
  language: string;
  script: string;
  title: string;
  subtitle: string | null;
  body_plain_text: string | null;
  notes: string | null;
  is_published: boolean;
};

type AudioTrackRow = {
  id: string;
  prayer_id: string;
  language: string;
  storage_path: string;
  public_url: string | null;
  duration_seconds: number | null;
  artist_name: string | null;
  narrator_name: string | null;
  access_tier: "free" | "premium";
  is_active: boolean;
};

type PrayerFestivalRow = {
  prayer_id: string;
  festival_id: string;
  is_primary: boolean;
};

type ReminderRuleRow = {
  id: string;
  rule_type: "daily" | "festival";
  prayer_id: string;
  festival_id: string | null;
  day_of_week: number | null;
  send_time_local: string;
  region_code: string;
  timezone_mode: string;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  is_enabled: boolean;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin?: boolean;
};

const languageOptions = ["english", "hindi", "telugu", "kannada", "tamil", "marathi", "sanskrit"];
const scriptOptions = ["native", "latin"];
const accessTierOptions = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
] as const;
const tabs: { key: AdminTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "deities", label: "Deities" },
  { key: "festivals", label: "Festivals" },
  { key: "calendar", label: "Calendar" },
  { key: "guides", label: "Festival Guides" },
  { key: "prayers", label: "Prayers" },
  { key: "texts", label: "Prayer Texts" },
  { key: "audio", label: "Audio" },
  { key: "reminders", label: "Reminders" },
];

const weekdayOptions = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const colorOptions = [
  { value: "#FFB347", label: "Sunrise Gold" },
  { value: "#D8A62A", label: "Temple Gold" },
  { value: "#FF9500", label: "Festival Orange" },
  { value: "#D4572A", label: "Sacred Saffron" },
  { value: "#7A1E1E", label: "Maroon" },
  { value: "#C0392B", label: "Vermilion Red" },
  { value: "#E63946", label: "Sindoor Red" },
  { value: "#F77F00", label: "Deep Orange" },
  { value: "#F4A261", label: "Warm Sand" },
  { value: "#E9C46A", label: "Haldi Yellow" },
  { value: "#2A9D8F", label: "Teal" },
  { value: "#4F46E5", label: "Indigo" },
  { value: "#5B5FDE", label: "Royal Blue" },
  { value: "#3A86FF", label: "Sky Blue" },
  { value: "#2E7D32", label: "Leaf Green" },
  { value: "#6A994E", label: "Tulsi Green" },
  { value: "#8E44AD", label: "Lotus Purple" },
  { value: "#B56576", label: "Rosewood" },
  { value: "#6D597A", label: "Temple Plum" },
  { value: "#8D6E63", label: "Earth Brown" },
  { value: "#495057", label: "Stone Grey" },
];

const deityIconOptions = [
  { value: "🐘", label: "Elephant / Ganesha" },
  { value: "🌙", label: "Crescent / Shiva" },
  { value: "🪷", label: "Lotus / Lakshmi or Krishna" },
  { value: "🏹", label: "Bow / Rama" },
  { value: "🙏", label: "Folded Hands / Hanuman" },
  { value: "⚔️", label: "Sword / Durga" },
  { value: "✨", label: "Sacred Spark / Sai Baba" },
  { value: "🌞", label: "Sun / Surya" },
];

const festivalSymbolOptions = [
  { value: "🪔", label: "Lamp / Diwali" },
  { value: "🌺", label: "Flower / Navratri" },
  { value: "🎨", label: "Colors / Holi" },
  { value: "🪷", label: "Lotus / Janmashtami" },
  { value: "🌙", label: "Moon / Shivratri" },
  { value: "🪢", label: "Sacred Knot / Raksha Bandhan" },
  { value: "🐘", label: "Elephant / Ganesh Chaturthi" },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-");
}

function formatSeconds(seconds: number | null) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function isDuplicateHandledError(error: unknown) {
  return error instanceof Error && error.message === "__DUPLICATE_HANDLED__";
}

export function AdminContentPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [deities, setDeities] = useState<DeityRow[]>([]);
  const [festivals, setFestivals] = useState<FestivalRow[]>([]);
  const [deityTranslations, setDeityTranslations] = useState<DeityTranslationRow[]>([]);
  const [festivalTranslations, setFestivalTranslations] = useState<FestivalTranslationRow[]>([]);
  const [festivalCalendarEntries, setFestivalCalendarEntries] = useState<FestivalCalendarRow[]>([]);
  const [festivalGuides, setFestivalGuides] = useState<FestivalGuideRow[]>([]);
  const [prayers, setPrayers] = useState<PrayerRow[]>([]);
  const [prayerTexts, setPrayerTexts] = useState<PrayerTextRow[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrackRow[]>([]);
  const [prayerFestivalLinks, setPrayerFestivalLinks] = useState<PrayerFestivalRow[]>([]);
  const [reminderRules, setReminderRules] = useState<ReminderRuleRow[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [editingDeityId, setEditingDeityId] = useState<string | null>(null);
  const [editingFestivalId, setEditingFestivalId] = useState<string | null>(null);
  const [editingDeityTranslationId, setEditingDeityTranslationId] = useState<string | null>(null);
  const [editingFestivalTranslationId, setEditingFestivalTranslationId] = useState<string | null>(null);
  const [editingFestivalCalendarId, setEditingFestivalCalendarId] = useState<string | null>(null);
  const [editingFestivalGuideId, setEditingFestivalGuideId] = useState<string | null>(null);
  const [editingPrayerId, setEditingPrayerId] = useState<string | null>(null);
  const [editingPrayerFestivalKey, setEditingPrayerFestivalKey] = useState<string | null>(null);
  const [editingPrayerTextId, setEditingPrayerTextId] = useState<string | null>(null);
  const [editingAudioTrackId, setEditingAudioTrackId] = useState<string | null>(null);
  const [editingReminderRuleId, setEditingReminderRuleId] = useState<string | null>(null);

  const [deityForm, setDeityForm] = useState({
    slug: "",
    icon_name: "",
    theme_start_color: "#FFB347",
    theme_end_color: "#D8A62A",
    sort_order: "0",
  });

  const [festivalForm, setFestivalForm] = useState({
    slug: "",
    symbol: "",
    theme_start_color: "#FF9500",
    theme_end_color: "#D4572A",
    sort_order: "0",
    is_featured_home: true,
  });

  const [deityTranslationForm, setDeityTranslationForm] = useState({
    deity_id: "",
    language: "english",
    name: "",
    tagline: "",
  });

  const [festivalTranslationForm, setFestivalTranslationForm] = useState({
    festival_id: "",
    language: "english",
    name: "",
    native_name: "",
    short_description: "",
  });

  const [festivalCalendarForm, setFestivalCalendarForm] = useState({
    festival_id: "",
    festival_date: "",
    region_code: "global",
    calendar_system: "hindu_lunisolar",
    source_name: "",
    source_url: "",
    is_active: true,
  });

  const [festivalGuideForm, setFestivalGuideForm] = useState({
    festival_id: "",
    language: "english",
    title: "",
    subtitle: "",
    intro_text: "",
    preparation_notes: "",
    items_needed: "",
    step_by_step: "",
    linked_prayer_id: "",
    access_tier: "premium" as "free" | "premium",
    sort_order: "0",
    is_published: true,
  });

  const [prayerForm, setPrayerForm] = useState({
    slug: "",
    deity_id: "",
    category: "aarti",
    estimated_duration_seconds: "",
    verse_count: "",
    sort_order: "0",
    access_tier: "free" as "free" | "premium",
    is_featured_home: false,
    is_audio_available: false,
  });

  const [prayerFestivalForm, setPrayerFestivalForm] = useState({
    prayer_id: "",
    festival_id: "",
    is_primary: false,
  });

  const [prayerTextForm, setPrayerTextForm] = useState({
    prayer_id: "",
    language: "hindi",
    script: "native",
    title: "",
    subtitle: "",
    body_plain_text: "",
    notes: "",
    is_published: true,
  });

  const [audioForm, setAudioForm] = useState({
    prayer_id: "",
    language: "hindi",
    storage_path: "",
    public_url: "",
    duration_seconds: "",
    artist_name: "",
    narrator_name: "",
    access_tier: "free" as "free" | "premium",
    is_active: true,
  });

  const [reminderRuleForm, setReminderRuleForm] = useState({
    rule_type: "daily" as "daily" | "festival",
    prayer_id: "",
    festival_id: "",
    day_of_week: "0",
    send_time_local: "06:30",
    region_code: "global",
    timezone_mode: "user_local",
    priority: "100",
    start_date: "",
    end_date: "",
    is_enabled: true,
  });

  const adminEmail = profile?.email || session?.user?.email || "";

  const resetDeityForm = useCallback(() => {
    setEditingDeityId(null);
    setDeityForm({
      slug: "",
      icon_name: "",
      theme_start_color: "#FFB347",
      theme_end_color: "#D8A62A",
      sort_order: "0",
    });
  }, []);

  const resetFestivalForm = useCallback(() => {
    setEditingFestivalId(null);
    setFestivalForm({
      slug: "",
      symbol: "",
      theme_start_color: "#FF9500",
      theme_end_color: "#D4572A",
      sort_order: "0",
      is_featured_home: true,
    });
  }, []);

  const resetDeityTranslationForm = useCallback(() => {
    setEditingDeityTranslationId(null);
    setDeityTranslationForm({
      deity_id: "",
      language: "english",
      name: "",
      tagline: "",
    });
  }, []);

  const resetFestivalTranslationForm = useCallback(() => {
    setEditingFestivalTranslationId(null);
    setFestivalTranslationForm({
      festival_id: "",
      language: "english",
      name: "",
      native_name: "",
      short_description: "",
    });
  }, []);

  const resetFestivalCalendarForm = useCallback(() => {
    setEditingFestivalCalendarId(null);
    setFestivalCalendarForm({
      festival_id: "",
      festival_date: "",
      region_code: "global",
      calendar_system: "hindu_lunisolar",
      source_name: "",
      source_url: "",
      is_active: true,
    });
  }, []);

  const resetFestivalGuideForm = useCallback(() => {
    setEditingFestivalGuideId(null);
    setFestivalGuideForm({
      festival_id: "",
      language: "english",
      title: "",
      subtitle: "",
      intro_text: "",
      preparation_notes: "",
      items_needed: "",
      step_by_step: "",
      linked_prayer_id: "",
      access_tier: "premium",
      sort_order: "0",
      is_published: true,
    });
  }, []);

  const resetPrayerForm = useCallback(() => {
    setEditingPrayerId(null);
    setPrayerForm({
      slug: "",
      deity_id: "",
      category: "aarti",
      estimated_duration_seconds: "",
      verse_count: "",
      sort_order: "0",
      access_tier: "free",
      is_featured_home: false,
      is_audio_available: false,
    });
  }, []);

  const resetPrayerFestivalForm = useCallback(() => {
    setEditingPrayerFestivalKey(null);
    setPrayerFestivalForm({
      prayer_id: "",
      festival_id: "",
      is_primary: false,
    });
  }, []);

  const resetPrayerTextForm = useCallback(() => {
    setEditingPrayerTextId(null);
    setPrayerTextForm({
      prayer_id: "",
      language: "hindi",
      script: "native",
      title: "",
      subtitle: "",
      body_plain_text: "",
      notes: "",
      is_published: true,
    });
  }, []);

  const resetAudioForm = useCallback(() => {
    setEditingAudioTrackId(null);
    setAudioForm({
      prayer_id: "",
      language: "hindi",
      storage_path: "",
      public_url: "",
      duration_seconds: "",
      artist_name: "",
      narrator_name: "",
      access_tier: "free",
      is_active: true,
    });
    setAudioFile(null);
  }, []);

  const resetReminderRuleForm = useCallback(() => {
    setEditingReminderRuleId(null);
    setReminderRuleForm({
      rule_type: "daily",
      prayer_id: "",
      festival_id: "",
      day_of_week: "0",
      send_time_local: "06:30",
      region_code: "global",
      timezone_mode: "user_local",
      priority: "100",
      start_date: "",
      end_date: "",
      is_enabled: true,
    });
  }, []);

  const loadContent = useCallback(async () => {
    if (!webSupabase || !session) return;

    setLoadingData(true);
    try {
      const [
        deitiesResult,
        festivalsResult,
        deityTranslationsResult,
        festivalTranslationsResult,
        festivalCalendarResult,
        festivalGuidesResult,
        prayersResult,
        textsResult,
        audioResult,
        prayerFestivalsResult,
        reminderRulesResult,
      ] = await Promise.all([
        webSupabase.from("deities").select("*").order("sort_order", { ascending: true }),
        webSupabase.from("festivals").select("*").order("sort_order", { ascending: true }),
        webSupabase.from("deity_translations").select("*").order("updated_at", { ascending: false }),
        webSupabase.from("festival_translations").select("*").order("updated_at", { ascending: false }),
        webSupabase.from("festival_calendar").select("*").order("festival_date", { ascending: false }).limit(100),
        webSupabase.from("festival_pooja_guides").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
        webSupabase.from("prayers").select("*").order("sort_order", { ascending: true }),
        webSupabase.from("prayer_texts").select("*").order("updated_at", { ascending: false }).limit(50),
        webSupabase.from("prayer_audio_tracks").select("*").order("updated_at", { ascending: false }).limit(50),
        webSupabase.from("prayer_festivals").select("*"),
        webSupabase.from("reminder_rules").select("*").order("priority", { ascending: true }).limit(100),
      ]);

      if (deitiesResult.error) throw deitiesResult.error;
      if (festivalsResult.error) throw festivalsResult.error;
      if (deityTranslationsResult.error) throw deityTranslationsResult.error;
      if (festivalTranslationsResult.error) throw festivalTranslationsResult.error;
      if (festivalCalendarResult.error) throw festivalCalendarResult.error;
      if (festivalGuidesResult.error) throw festivalGuidesResult.error;
      if (prayersResult.error) throw prayersResult.error;
      if (textsResult.error) throw textsResult.error;
      if (audioResult.error) throw audioResult.error;
      if (prayerFestivalsResult.error) throw prayerFestivalsResult.error;
      if (reminderRulesResult.error) throw reminderRulesResult.error;

      setDeities((deitiesResult.data || []) as DeityRow[]);
      setFestivals((festivalsResult.data || []) as FestivalRow[]);
      setDeityTranslations((deityTranslationsResult.data || []) as DeityTranslationRow[]);
      setFestivalTranslations((festivalTranslationsResult.data || []) as FestivalTranslationRow[]);
      setFestivalCalendarEntries((festivalCalendarResult.data || []) as FestivalCalendarRow[]);
      setFestivalGuides((festivalGuidesResult.data || []) as FestivalGuideRow[]);
      setPrayers((prayersResult.data || []) as PrayerRow[]);
      setPrayerTexts((textsResult.data || []) as PrayerTextRow[]);
      setAudioTracks((audioResult.data || []) as AudioTrackRow[]);
      setPrayerFestivalLinks((prayerFestivalsResult.data || []) as PrayerFestivalRow[]);
      setReminderRules((reminderRulesResult.data || []) as ReminderRuleRow[]);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load admin content.",
      });
    } finally {
      setLoadingData(false);
    }
  }, [session]);

  const refreshProfile = useCallback(async (activeSession: Session | null) => {
    setLoadingProfile(true);

    if (!webSupabase || !activeSession?.user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    try {
      const { data, error } = await webSupabase
        .from("profiles")
        .select("id, email, full_name, is_admin")
        .eq("id", activeSession.user.id)
        .maybeSingle<ProfileRow>();

      if (error) {
        setNotice({
          type: "error",
          message: `Unable to verify admin access: ${error.message}`,
        });
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to verify admin access.",
      });
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!webSupabase) {
      setLoadingAuth(false);
      return;
    }

    let active = true;

    webSupabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoadingAuth(false);
        void refreshProfile(data.session);
      })
      .catch((error) => {
        if (!active) return;
        setNotice({
          type: "error",
          message: error instanceof Error ? error.message : "Unable to prepare admin session.",
        });
        setSession(null);
        setLoadingAuth(false);
      });

    const { data: subscription } = webSupabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoadingAuth(false);
      void refreshProfile(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (profile?.is_admin) {
      void loadContent();
    }
  }, [loadContent, profile?.is_admin]);

  const prayerMap = useMemo(
    () =>
      new Map(
        prayers.map((prayer) => [
          prayer.id,
          prayerTexts.find((text) => text.prayer_id === prayer.id && text.language === "hindi")?.title || prayer.slug,
        ])
      ),
    [prayerTexts, prayers]
  );

  const deityMap = useMemo(
    () => new Map(deities.map((deity) => [deity.id, deity.slug])),
    [deities]
  );

  const festivalMap = useMemo(
    () => new Map(festivals.map((festival) => [festival.id, festival.slug])),
    [festivals]
  );

  const weekdayMap = useMemo(
    () => new Map(weekdayOptions.map((option) => [Number(option.value), option.label])),
    []
  );

  const selectedAudioPrayer = useMemo(
    () => prayers.find((prayer) => prayer.id === audioForm.prayer_id) || null,
    [audioForm.prayer_id, prayers]
  );

  const generatedAudioPath = useMemo(() => {
    if (!selectedAudioPrayer || !audioFile) return "";
    return `audio/${selectedAudioPrayer.slug}/${audioForm.language}-${sanitizeFileName(audioFile.name)}`;
  }, [audioFile, audioForm.language, selectedAudioPrayer]);

  useEffect(() => {
    if (!audioFile || typeof window === "undefined") return;

    const objectUrl = URL.createObjectURL(audioFile);
    const audio = document.createElement("audio");

    audio.preload = "metadata";
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      const detectedSeconds = Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0;
      if (detectedSeconds > 0) {
        setAudioForm((current) =>
          current.duration_seconds.trim() ? current : { ...current, duration_seconds: String(detectedSeconds) }
        );
      }
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  const promptToEditExisting = useCallback(
    (message: string, onEdit: () => void) => {
      const shouldOpenEdit =
        typeof window !== "undefined" ? window.confirm(`${message}\n\nDo you want to open the existing record in edit mode?`) : false;

      if (shouldOpenEdit) {
        onEdit();
        setNotice({ type: "success", message: "Existing record loaded in edit mode." });
      } else {
        setNotice({ type: "error", message });
      }

      throw new Error("__DUPLICATE_HANDLED__");
    },
    []
  );

  const startEditDeity = (deity: DeityRow) => {
    setEditingDeityId(deity.id);
    setDeityForm({
      slug: deity.slug,
      icon_name: deity.icon_name || "",
      theme_start_color: deity.theme_start_color || "#FFB347",
      theme_end_color: deity.theme_end_color || "#D8A62A",
      sort_order: String(deity.sort_order ?? 0),
    });
  };

  const startEditFestival = (festival: FestivalRow) => {
    setEditingFestivalId(festival.id);
    setFestivalForm({
      slug: festival.slug,
      symbol: festival.symbol || "",
      theme_start_color: festival.theme_start_color || "#FF9500",
      theme_end_color: festival.theme_end_color || "#D4572A",
      sort_order: String(festival.sort_order ?? 0),
      is_featured_home: festival.is_featured_home,
    });
  };

  const startEditDeityTranslation = (translation: DeityTranslationRow) => {
    setEditingDeityTranslationId(translation.id);
    setDeityTranslationForm({
      deity_id: translation.deity_id,
      language: translation.language,
      name: translation.name,
      tagline: translation.tagline || "",
    });
  };

  const startEditFestivalTranslation = (translation: FestivalTranslationRow) => {
    setEditingFestivalTranslationId(translation.id);
    setFestivalTranslationForm({
      festival_id: translation.festival_id,
      language: translation.language,
      name: translation.name,
      native_name: translation.native_name || "",
      short_description: translation.short_description || "",
    });
  };

  const startEditFestivalCalendar = (entry: FestivalCalendarRow) => {
    setEditingFestivalCalendarId(entry.id);
    setFestivalCalendarForm({
      festival_id: entry.festival_id,
      festival_date: entry.festival_date,
      region_code: entry.region_code,
      calendar_system: entry.calendar_system,
      source_name: entry.source_name || "",
      source_url: entry.source_url || "",
      is_active: entry.is_active,
    });
  };

  const startEditFestivalGuide = (guide: FestivalGuideRow) => {
    setEditingFestivalGuideId(guide.id);
    setFestivalGuideForm({
      festival_id: guide.festival_id,
      language: guide.language,
      title: guide.title,
      subtitle: guide.subtitle || "",
      intro_text: guide.intro_text || "",
      preparation_notes: guide.preparation_notes || "",
      items_needed: (guide.items_needed || []).join("\n"),
      step_by_step: (guide.step_by_step || []).join("\n"),
      linked_prayer_id: guide.linked_prayer_id || "",
      access_tier: guide.access_tier ?? "premium",
      sort_order: String(guide.sort_order ?? 0),
      is_published: guide.is_published,
    });
  };

  const startEditPrayer = (prayer: PrayerRow) => {
    setEditingPrayerId(prayer.id);
    setPrayerForm({
      slug: prayer.slug,
      deity_id: prayer.deity_id || "",
      category: prayer.category,
      estimated_duration_seconds: prayer.estimated_duration_seconds ? String(prayer.estimated_duration_seconds) : "",
      verse_count: prayer.verse_count ? String(prayer.verse_count) : "",
      sort_order: String(prayer.sort_order ?? 0),
      access_tier: prayer.access_tier ?? "free",
      is_featured_home: prayer.is_featured_home,
      is_audio_available: prayer.is_audio_available,
    });
  };

  const startEditPrayerFestival = (link: PrayerFestivalRow) => {
    setEditingPrayerFestivalKey(`${link.prayer_id}-${link.festival_id}`);
    setPrayerFestivalForm({
      prayer_id: link.prayer_id,
      festival_id: link.festival_id,
      is_primary: link.is_primary,
    });
  };

  const startEditPrayerText = (text: PrayerTextRow) => {
    setEditingPrayerTextId(text.id);
    setPrayerTextForm({
      prayer_id: text.prayer_id,
      language: text.language,
      script: text.script,
      title: text.title,
      subtitle: text.subtitle || "",
      body_plain_text: text.body_plain_text || "",
      notes: text.notes || "",
      is_published: text.is_published,
    });
  };

  const startEditAudioTrack = (track: AudioTrackRow) => {
    setEditingAudioTrackId(track.id);
    setAudioFile(null);
    setAudioForm({
      prayer_id: track.prayer_id,
      language: track.language,
      storage_path: track.storage_path,
      public_url: track.public_url || "",
      duration_seconds: track.duration_seconds ? String(track.duration_seconds) : "",
      artist_name: track.artist_name || "",
      narrator_name: track.narrator_name || "",
      access_tier: track.access_tier ?? "free",
      is_active: track.is_active,
    });
  };

  const startEditReminderRule = (rule: ReminderRuleRow) => {
    setEditingReminderRuleId(rule.id);
    setReminderRuleForm({
      rule_type: rule.rule_type,
      prayer_id: rule.prayer_id,
      festival_id: rule.festival_id || "",
      day_of_week: rule.day_of_week !== null ? String(rule.day_of_week) : "0",
      send_time_local: rule.send_time_local,
      region_code: rule.region_code,
      timezone_mode: rule.timezone_mode,
      priority: String(rule.priority),
      start_date: rule.start_date || "",
      end_date: rule.end_date || "",
      is_enabled: rule.is_enabled,
    });
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    setSubmitting(true);
    setNotice(null);

    const { error } = await webSupabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    setSubmitting(false);

    if (error) {
      setNotice({ type: "error", message: error.message });
      return;
    }

    setNotice({ type: "success", message: "Signed in. Verifying admin access now." });
  };

  const handleLogout = async () => {
    if (!webSupabase) return;
    await webSupabase.auth.signOut();
    setNotice({ type: "success", message: "Admin session signed out." });
    setProfile(null);
    setSession(null);
  };

  const insertWithFeedback = async (runner: () => Promise<void>, successMessage: string) => {
    setSubmitting(true);
    setNotice(null);
    try {
      await runner();
      await loadContent();
      setNotice({ type: "success", message: successMessage });
    } catch (error) {
      if (isDuplicateHandledError(error)) {
        return;
      }
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong while saving.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteWithFeedback = async (
    confirmMessage: string,
    runner: () => Promise<void>,
    successMessage: string
  ) => {
    const shouldDelete = typeof window !== "undefined" ? window.confirm(confirmMessage) : false;
    if (!shouldDelete) return;

    setSubmitting(true);
    setNotice(null);
    try {
      await runner();
      await loadContent();
      setNotice({ type: "success", message: successMessage });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong while deleting.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDeity = async (deity: DeityRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete deity "${deity.slug}"?\n\nThis may fail if prayers or translations still depend on it.`,
      async () => {
        const { error } = await webSupabase.from("deities").delete().eq("id", deity.id);
        if (error) throw error;
        if (editingDeityId === deity.id) resetDeityForm();
      },
      "Deity deleted successfully."
    );
  };

  const deleteDeityTranslation = async (translation: DeityTranslationRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete deity translation "${translation.name}" (${translation.language})?`,
      async () => {
        const { error } = await webSupabase.from("deity_translations").delete().eq("id", translation.id);
        if (error) throw error;
        if (editingDeityTranslationId === translation.id) resetDeityTranslationForm();
      },
      "Deity translation deleted successfully."
    );
  };

  const deleteFestival = async (festival: FestivalRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete festival "${festival.slug}"?\n\nThis may fail if dates, translations, prayers, or reminder rules still depend on it.`,
      async () => {
        const { error } = await webSupabase.from("festivals").delete().eq("id", festival.id);
        if (error) throw error;
        if (editingFestivalId === festival.id) resetFestivalForm();
      },
      "Festival deleted successfully."
    );
  };

  const deleteFestivalTranslation = async (translation: FestivalTranslationRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete festival translation "${translation.name}" (${translation.language})?`,
      async () => {
        const { error } = await webSupabase.from("festival_translations").delete().eq("id", translation.id);
        if (error) throw error;
        if (editingFestivalTranslationId === translation.id) resetFestivalTranslationForm();
      },
      "Festival translation deleted successfully."
    );
  };

  const deleteFestivalCalendar = async (entry: FestivalCalendarRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete festival date "${entry.festival_date}" for ${festivalMap.get(entry.festival_id) || entry.festival_id}?`,
      async () => {
        const { error } = await webSupabase.from("festival_calendar").delete().eq("id", entry.id);
        if (error) throw error;
        if (editingFestivalCalendarId === entry.id) resetFestivalCalendarForm();
      },
      "Festival date deleted successfully."
    );
  };

  const deleteFestivalGuide = async (guide: FestivalGuideRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete festival guide "${guide.title}" (${guide.language})?`,
      async () => {
        const { error } = await webSupabase.from("festival_pooja_guides").delete().eq("id", guide.id);
        if (error) throw error;
        if (editingFestivalGuideId === guide.id) resetFestivalGuideForm();
      },
      "Festival guide deleted successfully."
    );
  };

  const deletePrayer = async (prayer: PrayerRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete prayer "${prayer.slug}"?\n\nThis may fail if prayer texts, audio, or links still depend on it.`,
      async () => {
        const { error } = await webSupabase.from("prayers").delete().eq("id", prayer.id);
        if (error) throw error;
        if (editingPrayerId === prayer.id) resetPrayerForm();
      },
      "Prayer deleted successfully."
    );
  };

  const deletePrayerFestival = async (link: PrayerFestivalRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete the link between "${prayerMap.get(link.prayer_id) || link.prayer_id}" and "${festivalMap.get(link.festival_id) || link.festival_id}"?`,
      async () => {
        const { error } = await webSupabase
          .from("prayer_festivals")
          .delete()
          .eq("prayer_id", link.prayer_id)
          .eq("festival_id", link.festival_id);
        if (error) throw error;
        if (editingPrayerFestivalKey === `${link.prayer_id}-${link.festival_id}`) resetPrayerFestivalForm();
      },
      "Prayer-festival link deleted successfully."
    );
  };

  const deletePrayerText = async (text: PrayerTextRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete prayer text "${text.title}" (${text.language} / ${text.script})?`,
      async () => {
        const { error } = await webSupabase.from("prayer_texts").delete().eq("id", text.id);
        if (error) throw error;
        if (editingPrayerTextId === text.id) resetPrayerTextForm();
      },
      "Prayer text deleted successfully."
    );
  };

  const deleteAudioTrack = async (track: AudioTrackRow) => {
    if (!webSupabase) return;
    await deleteWithFeedback(
      `Delete audio track for "${prayerMap.get(track.prayer_id) || track.prayer_id}" (${track.language})?\n\nThis deletes the metadata record from the portal.`,
      async () => {
        const { error } = await webSupabase.from("prayer_audio_tracks").delete().eq("id", track.id);
        if (error) throw error;
        if (editingAudioTrackId === track.id) resetAudioForm();
      },
      "Audio track deleted successfully."
    );
  };

  const deleteReminderRule = async (rule: ReminderRuleRow) => {
    if (!webSupabase) return;
    const label =
      rule.rule_type === "daily"
        ? `${weekdayMap.get(rule.day_of_week ?? 0)} at ${rule.send_time_local}`
        : `${festivalMap.get(rule.festival_id || "") || rule.festival_id} at ${rule.send_time_local}`;

    await deleteWithFeedback(
      `Delete reminder rule for "${prayerMap.get(rule.prayer_id) || rule.prayer_id}" (${label})?`,
      async () => {
        const { error } = await webSupabase.from("reminder_rules").delete().eq("id", rule.id);
        if (error) throw error;
        if (editingReminderRuleId === rule.id) resetReminderRuleForm();
      },
      "Reminder rule deleted successfully."
    );
  };

  const submitDeity = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    const slug = slugify(deityForm.slug);
    if (!editingDeityId) {
      const existing = deities.find((deity) => deity.slug === slug);
      if (existing) {
        promptToEditExisting("A deity with this slug already exists.", () => startEditDeity(existing));
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        slug,
        icon_name: deityForm.icon_name || null,
        theme_start_color: deityForm.theme_start_color || null,
        theme_end_color: deityForm.theme_end_color || null,
        sort_order: Number(deityForm.sort_order || 0),
      };
      const query = editingDeityId
        ? webSupabase.from("deities").update(payload).eq("id", editingDeityId)
        : webSupabase.from("deities").insert(payload);
      const { error } = await query;
      if (error) throw error;

      resetDeityForm();
    }, editingDeityId ? "Deity updated successfully." : "Deity created successfully.");
  };

  const submitFestival = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    const slug = slugify(festivalForm.slug);
    if (!editingFestivalId) {
      const existing = festivals.find((festival) => festival.slug === slug);
      if (existing) {
        promptToEditExisting("A festival with this slug already exists.", () => startEditFestival(existing));
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        slug,
        symbol: festivalForm.symbol || null,
        theme_start_color: festivalForm.theme_start_color || null,
        theme_end_color: festivalForm.theme_end_color || null,
        sort_order: Number(festivalForm.sort_order || 0),
        is_featured_home: festivalForm.is_featured_home,
      };
      const query = editingFestivalId
        ? webSupabase.from("festivals").update(payload).eq("id", editingFestivalId)
        : webSupabase.from("festivals").insert(payload);
      const { error } = await query;
      if (error) throw error;

      resetFestivalForm();
    }, editingFestivalId ? "Festival updated successfully." : "Festival created successfully.");
  };

  const submitDeityTranslation = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingDeityTranslationId) {
      const existing = deityTranslations.find(
        (translation) =>
          translation.deity_id === deityTranslationForm.deity_id && translation.language === deityTranslationForm.language
      );
      if (existing) {
        promptToEditExisting("This deity translation already exists for the selected language.", () =>
          startEditDeityTranslation(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const { error } = await webSupabase.from("deity_translations").upsert(
        {
          deity_id: deityTranslationForm.deity_id,
          language: deityTranslationForm.language,
          name: deityTranslationForm.name.trim(),
          tagline: deityTranslationForm.tagline.trim() || null,
        },
        { onConflict: "deity_id,language" }
      );
      if (error) throw error;

      resetDeityTranslationForm();
    }, editingDeityTranslationId ? "Deity translation updated successfully." : "Deity translation saved successfully.");
  };

  const submitFestivalTranslation = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingFestivalTranslationId) {
      const existing = festivalTranslations.find(
        (translation) =>
          translation.festival_id === festivalTranslationForm.festival_id &&
          translation.language === festivalTranslationForm.language
      );
      if (existing) {
        promptToEditExisting("This festival translation already exists for the selected language.", () =>
          startEditFestivalTranslation(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const { error } = await webSupabase.from("festival_translations").upsert(
        {
          festival_id: festivalTranslationForm.festival_id,
          language: festivalTranslationForm.language,
          name: festivalTranslationForm.name.trim(),
          native_name: festivalTranslationForm.native_name.trim() || null,
          short_description: festivalTranslationForm.short_description.trim() || null,
        },
        { onConflict: "festival_id,language" }
      );
      if (error) throw error;

      resetFestivalTranslationForm();
    }, editingFestivalTranslationId ? "Festival translation updated successfully." : "Festival translation saved successfully.");
  };

  const submitFestivalCalendar = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingFestivalCalendarId) {
      const existing = festivalCalendarEntries.find(
        (entry) =>
          entry.festival_id === festivalCalendarForm.festival_id &&
          entry.festival_date === festivalCalendarForm.festival_date &&
          entry.region_code === (festivalCalendarForm.region_code.trim() || "global")
      );
      if (existing) {
        promptToEditExisting("A calendar entry already exists for this festival, date, and region.", () =>
          startEditFestivalCalendar(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        festival_id: festivalCalendarForm.festival_id,
        festival_date: festivalCalendarForm.festival_date,
        region_code: festivalCalendarForm.region_code.trim() || "global",
        calendar_system: festivalCalendarForm.calendar_system.trim() || "hindu_lunisolar",
        source_name: festivalCalendarForm.source_name.trim() || null,
        source_url: festivalCalendarForm.source_url.trim() || null,
        is_active: festivalCalendarForm.is_active,
      };

      const query = editingFestivalCalendarId
        ? webSupabase.from("festival_calendar").update(payload).eq("id", editingFestivalCalendarId)
        : webSupabase.from("festival_calendar").insert(payload);
      const { error } = await query;
      if (error) throw error;

      resetFestivalCalendarForm();
    }, editingFestivalCalendarId ? "Festival calendar entry updated successfully." : "Festival calendar entry created successfully.");
  };

  const submitFestivalGuide = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingFestivalGuideId) {
      const existing = festivalGuides.find(
        (guide) =>
          guide.festival_id === festivalGuideForm.festival_id &&
          guide.language === festivalGuideForm.language
      );
      if (existing) {
        promptToEditExisting("A festival guide already exists for this festival and language.", () =>
          startEditFestivalGuide(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        festival_id: festivalGuideForm.festival_id,
        language: festivalGuideForm.language,
        title: festivalGuideForm.title.trim(),
        subtitle: festivalGuideForm.subtitle.trim() || null,
        intro_text: festivalGuideForm.intro_text.trim() || null,
        preparation_notes: festivalGuideForm.preparation_notes.trim() || null,
        items_needed: festivalGuideForm.items_needed
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
        step_by_step: festivalGuideForm.step_by_step
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
        linked_prayer_id: festivalGuideForm.linked_prayer_id || null,
        access_tier: festivalGuideForm.access_tier,
        sort_order: Number(festivalGuideForm.sort_order || 0),
        is_published: festivalGuideForm.is_published,
      };

      const query = editingFestivalGuideId
        ? webSupabase.from("festival_pooja_guides").update(payload).eq("id", editingFestivalGuideId)
        : webSupabase.from("festival_pooja_guides").insert(payload);
      const { error } = await query;
      if (error) throw error;

      resetFestivalGuideForm();
    }, editingFestivalGuideId ? "Festival guide updated successfully." : "Festival guide created successfully.");
  };

  const submitPrayer = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    const slug = slugify(prayerForm.slug);
    if (!editingPrayerId) {
      const existing = prayers.find((prayer) => prayer.slug === slug);
      if (existing) {
        promptToEditExisting("A prayer with this slug already exists.", () => startEditPrayer(existing));
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        slug,
        deity_id: prayerForm.deity_id || null,
        category: prayerForm.category.trim().toLowerCase(),
        estimated_duration_seconds: Number(prayerForm.estimated_duration_seconds || 0) || null,
        verse_count: Number(prayerForm.verse_count || 0) || null,
        sort_order: Number(prayerForm.sort_order || 0),
        access_tier: prayerForm.access_tier,
        is_featured_home: prayerForm.is_featured_home,
        is_audio_available: prayerForm.is_audio_available,
      };
      const query = editingPrayerId
        ? webSupabase.from("prayers").update(payload).eq("id", editingPrayerId)
        : webSupabase.from("prayers").insert(payload);
      const { error } = await query;
      if (error) throw error;

      resetPrayerForm();
    }, editingPrayerId ? "Prayer updated successfully." : "Prayer created successfully.");
  };

  const submitPrayerFestival = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingPrayerFestivalKey) {
      const existing = prayerFestivalLinks.find(
        (link) =>
          link.prayer_id === prayerFestivalForm.prayer_id && link.festival_id === prayerFestivalForm.festival_id
      );
      if (existing) {
        promptToEditExisting("This prayer is already linked to the selected festival.", () =>
          startEditPrayerFestival(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const { error } = await webSupabase.from("prayer_festivals").upsert(
        {
          prayer_id: prayerFestivalForm.prayer_id,
          festival_id: prayerFestivalForm.festival_id,
          is_primary: prayerFestivalForm.is_primary,
        },
        { onConflict: "prayer_id,festival_id" }
      );

      if (error) throw error;
      resetPrayerFestivalForm();
    }, editingPrayerFestivalKey ? "Prayer-festival link updated successfully." : "Prayer linked to festival successfully.");
  };

  const submitPrayerText = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingPrayerTextId) {
      const existing = prayerTexts.find(
        (text) =>
          text.prayer_id === prayerTextForm.prayer_id &&
          text.language === prayerTextForm.language &&
          text.script === prayerTextForm.script
      );
      if (existing) {
        promptToEditExisting("Prayer text already exists for this prayer, language, and script.", () =>
          startEditPrayerText(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const { error } = await webSupabase.from("prayer_texts").upsert(
        {
          prayer_id: prayerTextForm.prayer_id,
          language: prayerTextForm.language,
          script: prayerTextForm.script,
          title: prayerTextForm.title.trim(),
          subtitle: prayerTextForm.subtitle.trim() || null,
          body_plain_text: prayerTextForm.body_plain_text.trim() || null,
          body_json: prayerTextForm.body_plain_text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean),
          notes: prayerTextForm.notes.trim() || null,
          is_published: prayerTextForm.is_published,
        },
        {
          onConflict: "prayer_id,language,script",
        }
      );

      if (error) throw error;

      resetPrayerTextForm();
    }, editingPrayerTextId ? "Prayer text updated successfully." : "Prayer text saved successfully.");
  };

  const submitAudioTrack = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingAudioTrackId) {
      const existing = audioTracks.find(
        (track) => track.prayer_id === audioForm.prayer_id && track.language === audioForm.language
      );
      if (existing) {
        promptToEditExisting("An audio track already exists for this prayer and language.", () =>
          startEditAudioTrack(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      let storagePath = audioForm.storage_path.trim();
      let publicUrl = audioForm.public_url.trim() || null;

      if (audioFile) {
        const prayerSlug = selectedAudioPrayer?.slug;
        if (!prayerSlug) {
          throw new Error("Select a prayer before uploading audio.");
        }

        storagePath =
          audioForm.storage_path.trim() ||
          `audio/${prayerSlug}/${audioForm.language}-${sanitizeFileName(audioFile.name)}`;

        const { error: uploadError } = await webSupabase.storage
          .from("prayer-audio")
          .upload(storagePath, audioFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: audioFile.type || undefined,
          });

        if (uploadError) {
          throw new Error(`Audio upload failed: ${uploadError.message}`);
        }

        const publicUrlResult = webSupabase.storage.from("prayer-audio").getPublicUrl(storagePath);
        publicUrl = publicUrlResult.data.publicUrl;
      }

      const payload = {
        prayer_id: audioForm.prayer_id,
        language: audioForm.language,
        storage_path: storagePath,
        public_url: publicUrl,
        duration_seconds: Number(audioForm.duration_seconds || 0) || null,
        artist_name: audioForm.artist_name.trim() || null,
        narrator_name: audioForm.narrator_name.trim() || null,
        access_tier: audioForm.access_tier,
        is_active: audioForm.is_active,
      };
      const query = editingAudioTrackId
        ? webSupabase.from("prayer_audio_tracks").update(payload).eq("id", editingAudioTrackId)
        : webSupabase.from("prayer_audio_tracks").insert(payload);
      const { error } = await query;

      if (error) throw error;

      resetAudioForm();
    }, editingAudioTrackId ? "Audio track updated successfully." : "Audio metadata saved successfully.");
  };

  const submitReminderRule = async (event: FormEvent) => {
    event.preventDefault();
    if (!webSupabase) return;

    if (!editingReminderRuleId) {
      const targetFestivalId = reminderRuleForm.rule_type === "festival" ? reminderRuleForm.festival_id || null : null;
      const targetDayOfWeek = reminderRuleForm.rule_type === "daily" ? Number(reminderRuleForm.day_of_week) : null;

      const existing = reminderRules.find(
        (rule) =>
          rule.rule_type === reminderRuleForm.rule_type &&
          rule.prayer_id === reminderRuleForm.prayer_id &&
          (rule.festival_id || null) === targetFestivalId &&
          rule.day_of_week === targetDayOfWeek &&
          rule.region_code === (reminderRuleForm.region_code.trim() || "global")
      );

      if (existing) {
        promptToEditExisting("A reminder rule with the same prayer and schedule already exists.", () =>
          startEditReminderRule(existing)
        );
        return;
      }
    }

    await insertWithFeedback(async () => {
      const payload = {
        rule_type: reminderRuleForm.rule_type,
        prayer_id: reminderRuleForm.prayer_id,
        festival_id: reminderRuleForm.rule_type === "festival" ? reminderRuleForm.festival_id || null : null,
        day_of_week: reminderRuleForm.rule_type === "daily" ? Number(reminderRuleForm.day_of_week) : null,
        send_time_local: reminderRuleForm.send_time_local,
        region_code: reminderRuleForm.region_code.trim() || "global",
        timezone_mode: reminderRuleForm.timezone_mode.trim() || "user_local",
        priority: Number(reminderRuleForm.priority || 100),
        start_date: reminderRuleForm.start_date || null,
        end_date: reminderRuleForm.end_date || null,
        is_enabled: reminderRuleForm.is_enabled,
      };

      const query = editingReminderRuleId
        ? webSupabase.from("reminder_rules").update(payload).eq("id", editingReminderRuleId)
        : webSupabase.from("reminder_rules").insert(payload);
      const { error } = await query;

      if (error) throw error;
      resetReminderRuleForm();
    }, editingReminderRuleId ? "Reminder rule updated successfully." : "Reminder rule created successfully.");
  };

  if (!isWebSupabaseConfigured || !webSupabase) {
    return (
      <div className="admin-shell">
        <div className="admin-auth-card">
          <h1>Admin Setup Needed</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the root web app
            environment file before opening the admin workflow.
          </p>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="admin-shell">
        <div className="admin-auth-card">
          <h1>Preparing admin workspace…</h1>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-shell">
        <div className="admin-auth-card">
          <div className="admin-kicker">BhaktiVerse Admin</div>
          <h1>Content Workspace</h1>
          <p>Sign in with an admin-enabled email account to manage prayers, festivals, and audio metadata.</p>
          {notice ? <div className={`admin-notice ${notice.type}`}>{notice.message}</div> : null}
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                type="password"
                required
              />
            </label>
            <button className="admin-button primary" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="admin-shell">
        <div className="admin-auth-card">
          <h1>Verifying admin access…</h1>
          <p>We found a signed-in session and are checking the content workspace permissions now.</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="admin-shell">
        <div className="admin-auth-card">
          <div className="admin-kicker">Access restricted</div>
          <h1>Admin rights required</h1>
          <p>
            Your account is signed in, but it is not marked as a BhaktiVerse content admin yet. Run the SQL below in
            Supabase after you execute <code>supabase/admin-setup.sql</code>.
          </p>
          <pre className="admin-code">{`update public.profiles\nset is_admin = true\nwhere email = '${adminEmail || "your-email@example.com"}';`}</pre>
          <div className="admin-actions-row">
            <button className="admin-button secondary" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-page">
        <header className="admin-header">
          <div>
            <div className="admin-kicker">BhaktiVerse Admin</div>
            <h1>Content Workflow</h1>
            <p>
              Manage the devotional catalog in Supabase. This first version covers deities, festivals, prayers,
              prayer texts, and audio metadata.
            </p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-identity">
              <strong>{profile.full_name || profile.email}</strong>
              <span>{profile.email}</span>
            </div>
            <button className="admin-button secondary" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        {notice ? <div className={`admin-notice ${notice.type}`}>{notice.message}</div> : null}

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>Catalog snapshot</h2>
              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <span>Deities</span>
                  <strong>{deities.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Festivals</span>
                  <strong>{festivals.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Prayers</span>
                  <strong>{prayers.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Festival Dates</span>
                  <strong>{festivalCalendarEntries.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Festival Guides</span>
                  <strong>{festivalGuides.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Prayer Texts</span>
                  <strong>{prayerTexts.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Audio Tracks</span>
                  <strong>{audioTracks.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>Reminder Rules</span>
                  <strong>{reminderRules.length}</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <h2>Next recommended content steps</h2>
              <ul className="admin-list">
                <li>Create the core deity and festival records first.</li>
                <li>Add premium festival pooja guides once each major festival is defined.</li>
                <li>Add prayer base records with category and duration.</li>
                <li>Populate prayer texts language by language.</li>
                <li>Add audio metadata only after the file path or URL is finalized.</li>
                <li>Link prayers to festivals and set reminder rules for daily and festival flows.</li>
              </ul>
            </div>
          </section>
        ) : null}

        {activeTab === "deities" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingDeityId ? "Edit deity" : "Add deity"}</h2>
              <form className="admin-form" onSubmit={submitDeity}>
                <label>
                  Slug or name
                  <input
                    value={deityForm.slug}
                    onChange={(e) => setDeityForm((current) => ({ ...current, slug: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Icon
                  <span className="admin-field-note">
                    Choose the symbol shown on deity cards across the app. We can support custom uploaded images later.
                  </span>
                  <div className="admin-option-grid">
                    {deityIconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        className={`admin-option-card ${deityForm.icon_name === icon.value ? "selected" : ""}`}
                        type="button"
                        onClick={() => setDeityForm((current) => ({ ...current, icon_name: icon.value }))}
                      >
                        <span className="admin-option-emoji">{icon.value}</span>
                        <span>{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Start color
                    <span className="admin-field-note">
                      Start color is the left/top side of the gradient used on deity cards in the mobile app.
                    </span>
                    <div className="admin-color-grid">
                      {colorOptions.map((color) => (
                        <button
                          key={`deity-start-${color.value}`}
                          className={`admin-color-swatch ${deityForm.theme_start_color === color.value ? "selected" : ""}`}
                          type="button"
                          title={color.label}
                          onClick={() => setDeityForm((current) => ({ ...current, theme_start_color: color.value }))}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <span className="admin-field-note">{colorOptions.find((color) => color.value === deityForm.theme_start_color)?.label}</span>
                  </label>
                  <label>
                    End color
                    <span className="admin-field-note">
                      End color is the right/bottom side of the same gradient, used to give the card depth.
                    </span>
                    <div className="admin-color-grid">
                      {colorOptions.map((color) => (
                        <button
                          key={`deity-end-${color.value}`}
                          className={`admin-color-swatch ${deityForm.theme_end_color === color.value ? "selected" : ""}`}
                          type="button"
                          title={color.label}
                          onClick={() => setDeityForm((current) => ({ ...current, theme_end_color: color.value }))}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <span className="admin-field-note">{colorOptions.find((color) => color.value === deityForm.theme_end_color)?.label}</span>
                  </label>
                </div>
                <div
                  className="admin-gradient-preview"
                  style={{
                    background: `linear-gradient(135deg, ${deityForm.theme_start_color} 0%, ${deityForm.theme_end_color} 100%)`,
                  }}
                >
                  <span className="admin-gradient-preview-icon">{deityForm.icon_name || "✦"}</span>
                  <div>
                    <strong>{deityForm.slug || "Deity preview"}</strong>
                    <span>Preview of how this color combination may feel in the app.</span>
                  </div>
                </div>
                <label>
                  Sort order
                  <input
                    value={deityForm.sort_order}
                    onChange={(e) => setDeityForm((current) => ({ ...current, sort_order: e.target.value }))}
                    type="number"
                  />
                  <span className="admin-field-note">Lower numbers appear first in the app. Example: 1, 2, 3.</span>
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingDeityId ? "Update Deity" : "Create Deity"}
                </button>
                {editingDeityId ? (
                  <button className="admin-button secondary" type="button" onClick={resetDeityForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>{editingDeityTranslationId ? "Edit deity translation" : "Save deity translation"}</h2>
              <form className="admin-form" onSubmit={submitDeityTranslation}>
                <label>
                  Deity
                  <select
                    value={deityTranslationForm.deity_id}
                    onChange={(e) =>
                      setDeityTranslationForm((current) => ({ ...current, deity_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select deity</option>
                    {deities.map((deity) => (
                      <option key={deity.id} value={deity.id}>
                        {deity.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Language
                  <select
                    value={deityTranslationForm.language}
                    onChange={(e) =>
                      setDeityTranslationForm((current) => ({ ...current, language: e.target.value }))
                    }
                  >
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Display name
                  <input
                    value={deityTranslationForm.name}
                    onChange={(e) => setDeityTranslationForm((current) => ({ ...current, name: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Tagline
                  <input
                    value={deityTranslationForm.tagline}
                    onChange={(e) =>
                      setDeityTranslationForm((current) => ({ ...current, tagline: e.target.value }))
                    }
                  />
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingDeityTranslationId ? "Update Translation" : "Save Translation"}
                </button>
                {editingDeityTranslationId ? (
                  <button className="admin-button secondary" type="button" onClick={resetDeityTranslationForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Existing deities</h2>
              <div className="admin-record-list">
                {deities.map((deity) => (
                  <div key={deity.id} className="admin-record">
                    <div>
                      <strong>{deity.slug}</strong>
                      <span>{deity.theme_start_color || "—"} → {deity.theme_end_color || "—"}</span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{deity.icon_name || "—"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditDeity(deity)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteDeity(deity)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel">
              <h2>Recent deity translations</h2>
              <div className="admin-record-list">
                {deityTranslations.map((translation) => (
                  <div key={translation.id} className="admin-record">
                    <div>
                      <strong>{translation.name}</strong>
                      <span>
                        {deityMap.get(translation.deity_id) || translation.deity_id} · {translation.language}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{translation.tagline || "—"}</span>
                      <button
                        className="admin-button secondary"
                        type="button"
                        onClick={() => startEditDeityTranslation(translation)}
                      >
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteDeityTranslation(translation)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "festivals" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingFestivalId ? "Edit festival" : "Add festival"}</h2>
              <form className="admin-form" onSubmit={submitFestival}>
                <label>
                  Slug or name
                  <input
                    value={festivalForm.slug}
                    onChange={(e) => setFestivalForm((current) => ({ ...current, slug: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Symbol
                  <span className="admin-field-note">
                    Choose the symbol shown on festival cards and banners in the app.
                  </span>
                  <div className="admin-option-grid">
                    {festivalSymbolOptions.map((symbol) => (
                      <button
                        key={symbol.value}
                        className={`admin-option-card ${festivalForm.symbol === symbol.value ? "selected" : ""}`}
                        type="button"
                        onClick={() => setFestivalForm((current) => ({ ...current, symbol: symbol.value }))}
                      >
                        <span className="admin-option-emoji">{symbol.value}</span>
                        <span>{symbol.label}</span>
                      </button>
                    ))}
                  </div>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Start color
                    <span className="admin-field-note">
                      Start color is the first tone used in the festival card gradient on Home and related screens.
                    </span>
                    <div className="admin-color-grid">
                      {colorOptions.map((color) => (
                        <button
                          key={`festival-start-${color.value}`}
                          className={`admin-color-swatch ${festivalForm.theme_start_color === color.value ? "selected" : ""}`}
                          type="button"
                          title={color.label}
                          onClick={() => setFestivalForm((current) => ({ ...current, theme_start_color: color.value }))}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <span className="admin-field-note">{colorOptions.find((color) => color.value === festivalForm.theme_start_color)?.label}</span>
                  </label>
                  <label>
                    End color
                    <span className="admin-field-note">
                      End color blends with the start color to create the final festival card look.
                    </span>
                    <div className="admin-color-grid">
                      {colorOptions.map((color) => (
                        <button
                          key={`festival-end-${color.value}`}
                          className={`admin-color-swatch ${festivalForm.theme_end_color === color.value ? "selected" : ""}`}
                          type="button"
                          title={color.label}
                          onClick={() => setFestivalForm((current) => ({ ...current, theme_end_color: color.value }))}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                    <span className="admin-field-note">{colorOptions.find((color) => color.value === festivalForm.theme_end_color)?.label}</span>
                  </label>
                </div>
                <div
                  className="admin-gradient-preview"
                  style={{
                    background: `linear-gradient(135deg, ${festivalForm.theme_start_color} 0%, ${festivalForm.theme_end_color} 100%)`,
                  }}
                >
                  <span className="admin-gradient-preview-icon">{festivalForm.symbol || "✦"}</span>
                  <div>
                    <strong>{festivalForm.slug || "Festival preview"}</strong>
                    <span>Preview of how this festival theme may look in the app.</span>
                  </div>
                </div>
                <label>
                  Sort order
                  <input
                    value={festivalForm.sort_order}
                    onChange={(e) => setFestivalForm((current) => ({ ...current, sort_order: e.target.value }))}
                    type="number"
                  />
                  <span className="admin-field-note">Lower numbers appear first in festival lists and carousels.</span>
                </label>
                <label className="admin-checkbox">
                  <input
                    checked={festivalForm.is_featured_home}
                    onChange={(e) =>
                      setFestivalForm((current) => ({ ...current, is_featured_home: e.target.checked }))
                    }
                    type="checkbox"
                  />
                  Feature this festival on Home
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingFestivalId ? "Update Festival" : "Create Festival"}
                </button>
                {editingFestivalId ? (
                  <button className="admin-button secondary" type="button" onClick={resetFestivalForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>{editingFestivalTranslationId ? "Edit festival translation" : "Save festival translation"}</h2>
              <form className="admin-form" onSubmit={submitFestivalTranslation}>
                <label>
                  Festival
                  <select
                    value={festivalTranslationForm.festival_id}
                    onChange={(e) =>
                      setFestivalTranslationForm((current) => ({ ...current, festival_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select festival</option>
                    {festivals.map((festival) => (
                      <option key={festival.id} value={festival.id}>
                        {festival.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Language
                  <select
                    value={festivalTranslationForm.language}
                    onChange={(e) =>
                      setFestivalTranslationForm((current) => ({ ...current, language: e.target.value }))
                    }
                  >
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Display name
                  <input
                    value={festivalTranslationForm.name}
                    onChange={(e) =>
                      setFestivalTranslationForm((current) => ({ ...current, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Native name
                  <input
                    value={festivalTranslationForm.native_name}
                    onChange={(e) =>
                      setFestivalTranslationForm((current) => ({ ...current, native_name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Short description
                  <textarea
                    value={festivalTranslationForm.short_description}
                    onChange={(e) =>
                      setFestivalTranslationForm((current) => ({
                        ...current,
                        short_description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingFestivalTranslationId ? "Update Translation" : "Save Translation"}
                </button>
                {editingFestivalTranslationId ? (
                  <button className="admin-button secondary" type="button" onClick={resetFestivalTranslationForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Existing festivals</h2>
              <div className="admin-record-list">
                {festivals.map((festival) => (
                  <div key={festival.id} className="admin-record">
                    <div>
                      <strong>{festival.slug}</strong>
                      <span>{festival.is_featured_home ? "Featured on Home" : "Standard festival"}</span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{festival.symbol || "—"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditFestival(festival)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteFestival(festival)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel">
              <h2>Recent festival translations</h2>
              <div className="admin-record-list">
                {festivalTranslations.map((translation) => (
                  <div key={translation.id} className="admin-record">
                    <div>
                      <strong>{translation.name}</strong>
                      <span>
                        {festivalMap.get(translation.festival_id) || translation.festival_id} · {translation.language}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{translation.native_name || "—"}</span>
                      <button
                        className="admin-button secondary"
                        type="button"
                        onClick={() => startEditFestivalTranslation(translation)}
                      >
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteFestivalTranslation(translation)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "calendar" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingFestivalCalendarId ? "Edit festival date" : "Add festival date"}</h2>
              <form className="admin-form" onSubmit={submitFestivalCalendar}>
                <label>
                  Festival
                  <select
                    value={festivalCalendarForm.festival_id}
                    onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, festival_id: e.target.value }))}
                    required
                  >
                    <option value="">Select festival</option>
                    {festivals.map((festival) => (
                      <option key={festival.id} value={festival.id}>
                        {festival.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Festival date
                    <input
                      type="date"
                      value={festivalCalendarForm.festival_date}
                      onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, festival_date: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Region code
                    <input
                      value={festivalCalendarForm.region_code}
                      onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, region_code: e.target.value }))}
                      placeholder="global"
                    />
                  </label>
                </div>
                <label>
                  Calendar system
                  <input
                    value={festivalCalendarForm.calendar_system}
                    onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, calendar_system: e.target.value }))}
                  />
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Source name
                    <input
                      value={festivalCalendarForm.source_name}
                      onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, source_name: e.target.value }))}
                    />
                    <span className="admin-field-note">
                      Optional. Use this to record where the festival date came from, like Drik Panchang, a temple
                      calendar, or your own curated source.
                    </span>
                  </label>
                  <label>
                    Source URL
                    <input
                      value={festivalCalendarForm.source_url}
                      onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, source_url: e.target.value }))}
                    />
                    <span className="admin-field-note">
                      Optional. Save the supporting link so you can verify or revisit the date source later.
                    </span>
                  </label>
                </div>
                <label className="admin-checkbox">
                  <input
                    checked={festivalCalendarForm.is_active}
                    onChange={(e) => setFestivalCalendarForm((current) => ({ ...current, is_active: e.target.checked }))}
                    type="checkbox"
                  />
                  Active date entry
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingFestivalCalendarId ? "Update Festival Date" : "Create Festival Date"}
                </button>
                {editingFestivalCalendarId ? (
                  <button className="admin-button secondary" type="button" onClick={resetFestivalCalendarForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Festival calendar entries</h2>
              <div className="admin-record-list">
                {festivalCalendarEntries.map((entry) => (
                  <div key={entry.id} className="admin-record">
                    <div>
                      <strong>{festivalMap.get(entry.festival_id) || entry.festival_id}</strong>
                      <span>
                        {entry.festival_date} · {entry.region_code} · {entry.calendar_system}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{entry.is_active ? "Active" : "Inactive"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditFestivalCalendar(entry)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteFestivalCalendar(entry)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "guides" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingFestivalGuideId ? "Edit festival guide" : "Create festival guide"}</h2>
              <form className="admin-form" onSubmit={submitFestivalGuide}>
                <label>
                  Festival
                  <select
                    value={festivalGuideForm.festival_id}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, festival_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select festival</option>
                    {festivals.map((festival) => (
                      <option key={festival.id} value={festival.id}>
                        {festival.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Language
                    <select
                      value={festivalGuideForm.language}
                      onChange={(e) =>
                        setFestivalGuideForm((current) => ({ ...current, language: e.target.value }))
                      }
                    >
                      {languageOptions.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Access tier
                    <select
                      value={festivalGuideForm.access_tier}
                      onChange={(e) =>
                        setFestivalGuideForm((current) => ({
                          ...current,
                          access_tier: e.target.value as "free" | "premium",
                        }))
                      }
                    >
                      {accessTierOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="admin-field-note">
                      Premium guides are visible in the app but unlock the checklist and steps only for subscribers.
                    </span>
                  </label>
                </div>
                <label>
                  Guide title
                  <input
                    value={festivalGuideForm.title}
                    onChange={(e) => setFestivalGuideForm((current) => ({ ...current, title: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Subtitle
                  <input
                    value={festivalGuideForm.subtitle}
                    onChange={(e) => setFestivalGuideForm((current) => ({ ...current, subtitle: e.target.value }))}
                    placeholder="Short positioning line for the guide"
                  />
                </label>
                <label>
                  Intro text
                  <textarea
                    value={festivalGuideForm.intro_text}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, intro_text: e.target.value }))
                    }
                    rows={3}
                    placeholder="Short introduction to the festival and pooja intent"
                  />
                </label>
                <label>
                  Preparation notes
                  <textarea
                    value={festivalGuideForm.preparation_notes}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, preparation_notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Preparation timing, cleaning, fasting, or family setup notes"
                  />
                </label>
                <label>
                  Items needed
                  <textarea
                    value={festivalGuideForm.items_needed}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, items_needed: e.target.value }))
                    }
                    rows={6}
                    placeholder={"One item per line\nExample: Diya\nFlowers\nKumkum"}
                  />
                  <span className="admin-field-note">Write one required item per line.</span>
                </label>
                <label>
                  Step-by-step pooja flow
                  <textarea
                    value={festivalGuideForm.step_by_step}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, step_by_step: e.target.value }))
                    }
                    rows={8}
                    placeholder={"One step per line\nExample: Light the diya\nOffer flowers\nRecite the main prayer"}
                  />
                  <span className="admin-field-note">Write one pooja step per line in the exact order you want shown.</span>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Linked prayer
                    <select
                      value={festivalGuideForm.linked_prayer_id}
                      onChange={(e) =>
                        setFestivalGuideForm((current) => ({ ...current, linked_prayer_id: e.target.value }))
                      }
                    >
                      <option value="">No linked prayer</option>
                      {prayers.map((prayer) => (
                        <option key={prayer.id} value={prayer.id}>
                          {prayer.slug}
                        </option>
                      ))}
                    </select>
                    <span className="admin-field-note">
                      Optional. This gives the user a follow-along prayer button from the guide.
                    </span>
                  </label>
                  <label>
                    Sort order
                    <input
                      value={festivalGuideForm.sort_order}
                      onChange={(e) =>
                        setFestivalGuideForm((current) => ({ ...current, sort_order: e.target.value }))
                      }
                      type="number"
                    />
                    <span className="admin-field-note">Lower numbers appear first if we later show multiple guides together.</span>
                  </label>
                </div>
                <label className="admin-checkbox">
                  <input
                    checked={festivalGuideForm.is_published}
                    onChange={(e) =>
                      setFestivalGuideForm((current) => ({ ...current, is_published: e.target.checked }))
                    }
                    type="checkbox"
                  />
                  Published
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingFestivalGuideId ? "Update Festival Guide" : "Create Festival Guide"}
                </button>
                {editingFestivalGuideId ? (
                  <button className="admin-button secondary" type="button" onClick={resetFestivalGuideForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Existing festival guides</h2>
              <div className="admin-record-list">
                {festivalGuides.map((guide) => (
                  <div key={guide.id} className="admin-record">
                    <div>
                      <strong>{guide.title}</strong>
                      <span>
                        {festivalMap.get(guide.festival_id) || guide.festival_id} · {guide.language}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>
                        {guide.access_tier === "premium"
                          ? "Premium"
                          : guide.is_published
                            ? "Published"
                            : "Draft"}
                      </span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditFestivalGuide(guide)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteFestivalGuide(guide)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "prayers" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingPrayerId ? "Edit prayer" : "Add prayer"}</h2>
              <form className="admin-form" onSubmit={submitPrayer}>
                <label>
                  Slug or name
                  <input
                    value={prayerForm.slug}
                    onChange={(e) => setPrayerForm((current) => ({ ...current, slug: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Deity
                  <select
                    value={prayerForm.deity_id}
                    onChange={(e) => setPrayerForm((current) => ({ ...current, deity_id: e.target.value }))}
                  >
                    <option value="">None</option>
                    {deities.map((deity) => (
                      <option key={deity.id} value={deity.id}>
                        {deity.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <input
                    value={prayerForm.category}
                    onChange={(e) => setPrayerForm((current) => ({ ...current, category: e.target.value }))}
                  />
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Duration seconds
                    <input
                      value={prayerForm.estimated_duration_seconds}
                      onChange={(e) =>
                        setPrayerForm((current) => ({ ...current, estimated_duration_seconds: e.target.value }))
                      }
                      type="number"
                    />
                    <span className="admin-field-note">
                      Optional. Use an approximate reading or chanting time so the app can show “3 min read” style
                      metadata.
                    </span>
                  </label>
                  <label>
                    Verse count
                    <input
                      value={prayerForm.verse_count}
                      onChange={(e) => setPrayerForm((current) => ({ ...current, verse_count: e.target.value }))}
                      type="number"
                    />
                    <span className="admin-field-note">
                      Optional. Use this for stanza or verse totals when you want the app to show prayer length at a
                      glance.
                    </span>
                  </label>
                </div>
                <div className="admin-inline-grid">
                  <label>
                    Sort order
                    <input
                      value={prayerForm.sort_order}
                      onChange={(e) => setPrayerForm((current) => ({ ...current, sort_order: e.target.value }))}
                      type="number"
                    />
                    <span className="admin-field-note">Use this to control which prayers show first in admin-driven app lists.</span>
                  </label>
                  <label>
                    Access tier
                    <select
                      value={prayerForm.access_tier}
                      onChange={(e) =>
                        setPrayerForm((current) => ({
                          ...current,
                          access_tier: e.target.value as "free" | "premium",
                        }))
                      }
                    >
                      {accessTierOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="admin-field-note">
                      Use Premium only when this prayer itself should be locked behind subscription.
                    </span>
                  </label>
                </div>
                <label className="admin-checkbox">
                  <input
                    checked={prayerForm.is_featured_home}
                    onChange={(e) =>
                      setPrayerForm((current) => ({ ...current, is_featured_home: e.target.checked }))
                    }
                    type="checkbox"
                  />
                  Feature on Home
                </label>
                <label className="admin-checkbox">
                  <input
                    checked={prayerForm.is_audio_available}
                    onChange={(e) =>
                      setPrayerForm((current) => ({ ...current, is_audio_available: e.target.checked }))
                    }
                    type="checkbox"
                  />
                  Audio available
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingPrayerId ? "Update Prayer" : "Create Prayer"}
                </button>
                {editingPrayerId ? (
                  <button className="admin-button secondary" type="button" onClick={resetPrayerForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Existing prayers</h2>
              <div className="admin-record-list">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="admin-record">
                    <div>
                      <strong>{prayer.slug}</strong>
                      <span>
                        {prayer.category} · {formatSeconds(prayer.estimated_duration_seconds)}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{prayer.access_tier === "premium" ? "Premium" : prayer.is_featured_home ? "Featured" : "Standard"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditPrayer(prayer)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deletePrayer(prayer)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-panel">
              <h2>{editingPrayerFestivalKey ? "Edit prayer festival link" : "Link prayer to festival"}</h2>
              <form className="admin-form" onSubmit={submitPrayerFestival}>
                <label>
                  Prayer
                  <select
                    value={prayerFestivalForm.prayer_id}
                    onChange={(e) => setPrayerFestivalForm((current) => ({ ...current, prayer_id: e.target.value }))}
                    required
                  >
                    <option value="">Select prayer</option>
                    {prayers.map((prayer) => (
                      <option key={prayer.id} value={prayer.id}>
                        {prayer.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Festival
                  <select
                    value={prayerFestivalForm.festival_id}
                    onChange={(e) => setPrayerFestivalForm((current) => ({ ...current, festival_id: e.target.value }))}
                    required
                  >
                    <option value="">Select festival</option>
                    {festivals.map((festival) => (
                      <option key={festival.id} value={festival.id}>
                        {festival.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-checkbox">
                  <input
                    checked={prayerFestivalForm.is_primary}
                    onChange={(e) => setPrayerFestivalForm((current) => ({ ...current, is_primary: e.target.checked }))}
                    type="checkbox"
                  />
                  Mark as primary festival prayer
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingPrayerFestivalKey ? "Update Prayer Link" : "Save Prayer Link"}
                </button>
                {editingPrayerFestivalKey ? (
                  <button className="admin-button secondary" type="button" onClick={resetPrayerFestivalForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Prayer festival links</h2>
              <div className="admin-record-list">
                {prayerFestivalLinks.map((link) => (
                  <div key={`${link.prayer_id}-${link.festival_id}`} className="admin-record">
                    <div>
                      <strong>{prayerMap.get(link.prayer_id) || link.prayer_id}</strong>
                      <span>{festivalMap.get(link.festival_id) || link.festival_id}</span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{link.is_primary ? "Primary" : "Secondary"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditPrayerFestival(link)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deletePrayerFestival(link)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "texts" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingPrayerTextId ? "Edit prayer text" : "Save prayer text"}</h2>
              <form className="admin-form" onSubmit={submitPrayerText}>
                <label>
                  Prayer
                  <select
                    value={prayerTextForm.prayer_id}
                    onChange={(e) => setPrayerTextForm((current) => ({ ...current, prayer_id: e.target.value }))}
                    required
                  >
                    <option value="">Select prayer</option>
                    {prayers.map((prayer) => (
                      <option key={prayer.id} value={prayer.id}>
                        {prayer.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Language
                    <select
                      value={prayerTextForm.language}
                      onChange={(e) => setPrayerTextForm((current) => ({ ...current, language: e.target.value }))}
                    >
                      {languageOptions.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Script
                    <select
                      value={prayerTextForm.script}
                      onChange={(e) => setPrayerTextForm((current) => ({ ...current, script: e.target.value }))}
                    >
                      {scriptOptions.map((script) => (
                        <option key={script} value={script}>
                          {script}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Title
                  <input
                    value={prayerTextForm.title}
                    onChange={(e) => setPrayerTextForm((current) => ({ ...current, title: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Subtitle
                  <input
                    value={prayerTextForm.subtitle}
                    onChange={(e) => setPrayerTextForm((current) => ({ ...current, subtitle: e.target.value }))}
                  />
                </label>
                <label>
                  Prayer body
                  <textarea
                    value={prayerTextForm.body_plain_text}
                    onChange={(e) =>
                      setPrayerTextForm((current) => ({ ...current, body_plain_text: e.target.value }))
                    }
                    rows={8}
                  />
                </label>
                <label>
                  Notes
                  <textarea
                    value={prayerTextForm.notes}
                    onChange={(e) => setPrayerTextForm((current) => ({ ...current, notes: e.target.value }))}
                    rows={3}
                  />
                </label>
                <label className="admin-checkbox">
                  <input
                    checked={prayerTextForm.is_published}
                    onChange={(e) =>
                      setPrayerTextForm((current) => ({ ...current, is_published: e.target.checked }))
                    }
                    type="checkbox"
                  />
                  Published
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingPrayerTextId ? "Update Prayer Text" : "Save Prayer Text"}
                </button>
                {editingPrayerTextId ? (
                  <button className="admin-button secondary" type="button" onClick={resetPrayerTextForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Recent prayer texts</h2>
              <div className="admin-record-list">
                {prayerTexts.map((text) => (
                  <div key={text.id} className="admin-record">
                    <div>
                      <strong>{text.title}</strong>
                      <span>
                        {prayerMap.get(text.prayer_id) || text.prayer_id} · {text.language} · {text.script}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{text.is_published ? "Published" : "Draft"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditPrayerText(text)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deletePrayerText(text)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "audio" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingAudioTrackId ? "Edit audio track" : "Upload audio track"}</h2>
              <form className="admin-form" onSubmit={submitAudioTrack}>
                <label>
                  Prayer
                  <select
                    value={audioForm.prayer_id}
                    onChange={(e) => setAudioForm((current) => ({ ...current, prayer_id: e.target.value }))}
                    required
                  >
                    <option value="">Select prayer</option>
                    {prayers.map((prayer) => (
                      <option key={prayer.id} value={prayer.id}>
                        {prayer.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Audio file
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                </label>
                {audioFile ? (
                  <div className="admin-helper">
                    Selected file: <strong>{audioFile.name}</strong>
                    {generatedAudioPath ? (
                      <>
                        <br />
                        Upload path: <code>{generatedAudioPath}</code>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="admin-helper">
                    Choose an audio file to upload directly into the <code>prayer-audio</code> bucket, or leave it
                    empty and save metadata only.
                  </div>
                )}
                <label>
                  Language
                  <select
                    value={audioForm.language}
                    onChange={(e) => setAudioForm((current) => ({ ...current, language: e.target.value }))}
                  >
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Storage path
                  <input
                    value={audioForm.storage_path}
                    onChange={(e) => setAudioForm((current) => ({ ...current, storage_path: e.target.value }))}
                    placeholder="audio/hanuman-chalisa/hindi-chant.mp3"
                    required={!audioFile}
                  />
                </label>
                <label>
                  Public URL
                  <input
                    value={audioForm.public_url}
                    onChange={(e) => setAudioForm((current) => ({ ...current, public_url: e.target.value }))}
                    placeholder="Optional if using signed/private storage"
                  />
                </label>
                <div className="admin-inline-grid">
                  <label>
                    Duration seconds
                    <input
                      value={audioForm.duration_seconds}
                      onChange={(e) =>
                        setAudioForm((current) => ({ ...current, duration_seconds: e.target.value }))
                      }
                      type="number"
                    />
                    <span className="admin-field-note">
                      Optional. This is not capped to 180 seconds. Leave it blank or use the full audio length. If you
                      upload a file here, the form will try to detect the duration automatically.
                    </span>
                  </label>
                  <label>
                    Access tier
                    <select
                      value={audioForm.access_tier}
                      onChange={(e) =>
                        setAudioForm((current) => ({
                          ...current,
                          access_tier: e.target.value as "free" | "premium",
                        }))
                      }
                    >
                      {accessTierOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="admin-field-note">
                      Premium audio stays visible in the app but will ask the user to upgrade before playback.
                    </span>
                  </label>
                  <label>
                    Artist
                    <input
                      value={audioForm.artist_name}
                      onChange={(e) => setAudioForm((current) => ({ ...current, artist_name: e.target.value }))}
                    />
                  </label>
                </div>
                <label>
                  Narrator
                  <input
                    value={audioForm.narrator_name}
                    onChange={(e) => setAudioForm((current) => ({ ...current, narrator_name: e.target.value }))}
                  />
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingAudioTrackId ? "Update Audio Track" : "Save Audio Metadata"}
                </button>
                {editingAudioTrackId ? (
                  <button className="admin-button secondary" type="button" onClick={resetAudioForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Recent audio tracks</h2>
              <div className="admin-record-list">
                {audioTracks.map((track) => (
                  <div key={track.id} className="admin-record">
                    <div>
                      <strong>{prayerMap.get(track.prayer_id) || track.prayer_id}</strong>
                      <span>
                        {track.language} · {formatSeconds(track.duration_seconds)} · {track.storage_path}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>
                        {track.access_tier === "premium"
                          ? "Premium"
                          : track.public_url
                            ? "Playable"
                            : track.is_active
                              ? "Metadata only"
                              : "Inactive"}
                      </span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditAudioTrack(track)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteAudioTrack(track)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "reminders" ? (
          <section className="admin-grid two">
            <div className="admin-panel">
              <h2>{editingReminderRuleId ? "Edit reminder rule" : "Create reminder rule"}</h2>
              <form className="admin-form" onSubmit={submitReminderRule}>
                <label>
                  Rule type
                  <select
                    value={reminderRuleForm.rule_type}
                    onChange={(e) =>
                      setReminderRuleForm((current) => ({
                        ...current,
                        rule_type: e.target.value as "daily" | "festival",
                      }))
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="festival">Festival</option>
                  </select>
                </label>
                <label>
                  Prayer
                  <select
                    value={reminderRuleForm.prayer_id}
                    onChange={(e) => setReminderRuleForm((current) => ({ ...current, prayer_id: e.target.value }))}
                    required
                  >
                    <option value="">Select prayer</option>
                    {prayers.map((prayer) => (
                      <option key={prayer.id} value={prayer.id}>
                        {prayer.slug}
                      </option>
                    ))}
                  </select>
                </label>
                {reminderRuleForm.rule_type === "festival" ? (
                  <label>
                    Festival
                    <select
                      value={reminderRuleForm.festival_id}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, festival_id: e.target.value }))}
                      required
                    >
                      <option value="">Select festival</option>
                      {festivals.map((festival) => (
                        <option key={festival.id} value={festival.id}>
                          {festival.slug}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    Day of week
                    <select
                      value={reminderRuleForm.day_of_week}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, day_of_week: e.target.value }))}
                    >
                      {weekdayOptions.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="admin-inline-grid">
                  <label>
                    Send time
                    <input
                      type="time"
                      value={reminderRuleForm.send_time_local}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, send_time_local: e.target.value }))}
                    />
                  </label>
                  <label>
                    Region code
                    <input
                      value={reminderRuleForm.region_code}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, region_code: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="admin-inline-grid">
                  <label>
                    Timezone mode
                    <input
                      value={reminderRuleForm.timezone_mode}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, timezone_mode: e.target.value }))}
                    />
                  </label>
                  <label>
                    Priority
                    <input
                      type="number"
                      value={reminderRuleForm.priority}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, priority: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="admin-inline-grid">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={reminderRuleForm.start_date}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, start_date: e.target.value }))}
                    />
                  </label>
                  <label>
                    End date
                    <input
                      type="date"
                      value={reminderRuleForm.end_date}
                      onChange={(e) => setReminderRuleForm((current) => ({ ...current, end_date: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="admin-checkbox">
                  <input
                    checked={reminderRuleForm.is_enabled}
                    onChange={(e) => setReminderRuleForm((current) => ({ ...current, is_enabled: e.target.checked }))}
                    type="checkbox"
                  />
                  Enabled
                </label>
                <button className="admin-button primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingReminderRuleId ? "Update Reminder Rule" : "Create Reminder Rule"}
                </button>
                {editingReminderRuleId ? (
                  <button className="admin-button secondary" type="button" onClick={resetReminderRuleForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>

            <div className="admin-panel">
              <h2>Existing reminder rules</h2>
              <div className="admin-record-list">
                {reminderRules.map((rule) => (
                  <div key={rule.id} className="admin-record">
                    <div>
                      <strong>{prayerMap.get(rule.prayer_id) || rule.prayer_id}</strong>
                      <span>
                        {rule.rule_type === "daily"
                          ? `${weekdayMap.get(rule.day_of_week ?? 0)} · ${rule.send_time_local}`
                          : `${festivalMap.get(rule.festival_id || "") || rule.festival_id} · ${rule.send_time_local}`}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <span>{rule.is_enabled ? "Enabled" : "Disabled"}</span>
                      <button className="admin-button secondary" type="button" onClick={() => startEditReminderRule(rule)}>
                        Edit
                      </button>
                      <button className="admin-button danger" type="button" onClick={() => void deleteReminderRule(rule)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {loadingData ? <div className="admin-loading">Refreshing content…</div> : null}
      </div>
    </div>
  );
}
