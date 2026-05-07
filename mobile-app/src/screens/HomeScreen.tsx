import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumFeatureCard } from "../components/PremiumFeatureCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { fetchHomeContent, type BrowseItem, type HomeReminderItem, type PrayerListItem } from "../lib/supabase/content";
import { getTodayReminder } from "../data/reminders";
import {
  appLanguages,
  deityCatalog,
  featuredPrayers,
  festivalCatalog,
  getPrayerIdByTitle,
  prayerCatalog,
} from "../data/sampleContent";
import {
  getLocalizedCategory,
  getLanguageOptionLabel,
  getLocalizedDeity,
  getLocalizedFestival,
  getLocalizedPrayerTitle,
  getLocalizedReadDuration,
  getLocalizedWeekday,
  t,
} from "../i18n";
import { AppColors } from "../theme/colors";

const deityVisuals: Record<
  string,
  { symbol: string; glow: string; bubble: [string, string]; border: string }
> = {
  Ganesha: { symbol: "🐘", glow: "#F8D2AE", bubble: ["#FFB347", "#D8A62A"], border: "#F3D9C2" },
  Shiva: { symbol: "☽", glow: "#D6DBFB", bubble: ["#6673D9", "#3947B1"], border: "#D6DBFB" },
  Krishna: { symbol: "🪷", glow: "#E0C8F6", bubble: ["#7C2BB4", "#5B159D"], border: "#E0C8F6" },
  Lakshmi: { symbol: "✿", glow: "#F4C7E0", bubble: ["#C51D6F", "#8B0049"], border: "#F4C7E0" },
  Durga: { symbol: "⚔️", glow: "#F7CCD1", bubble: ["#E03131", "#B3182E"], border: "#F7CCD1" },
  Hanuman: { symbol: "🙏", glow: "#FFD9C4", bubble: ["#F0591C", "#C8440B"], border: "#FFD9C4" },
  Rama: { symbol: "🏹", glow: "#CCE5D2", bubble: ["#348C3B", "#1F6C29"], border: "#CCE5D2" },
  "Sai Baba": { symbol: "✦", glow: "#F8E2C9", bubble: ["#FF8C00", "#F26B00"], border: "#F8E2C9" },
};

const festivalVisuals: Record<
  string,
  { symbol: string; colors: [string, string]; chip?: "thisMonth" }
> = {
  Diwali: { symbol: "🪔", colors: ["#FF9500", "#D4572A"] },
  Navratri: {
    symbol: "🌺",
    colors: ["#C93A3A", "#9729A7"],
    chip: "thisMonth",
  },
  "Ganesh Chaturthi": {
    symbol: "🐘",
    colors: ["#FF9D4D", "#D9A037"],
  },
  Holi: { symbol: "🎨", colors: ["#C94565", "#FF8C42"] },
};

const defaultFestivalVisual = { symbol: "✨", colors: ["#E07A2D", "#C95A2C"] as [string, string] };

export function HomeScreen({ navigation }: { navigation: any }) {
  const {
    user,
    appLanguage,
    prayerSourceLanguage,
    hasPremiumAccess,
    isSupabaseConnected,
    setAppLanguage,
    setPrayerSourceLanguage,
    isFavoritePrayer,
    toggleFavoritePrayer,
    logout,
  } = useApp();
  const tr = (path: string) => t(appLanguage, path);
  const displayName = (user?.name || "Bhakti").split(" ")[0];
  const [liveFeaturedPrayers, setLiveFeaturedPrayers] = useState<PrayerListItem[]>([]);
  const [liveCatalog, setLiveCatalog] = useState<PrayerListItem[]>([]);
  const [liveDeities, setLiveDeities] = useState<BrowseItem[]>([]);
  const [liveFestivals, setLiveFestivals] = useState<BrowseItem[]>([]);
  const [liveReminder, setLiveReminder] = useState<HomeReminderItem | null>(null);
  const [loadingLiveContent, setLoadingLiveContent] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      if (!isSupabaseConnected) return;
      setLoadingLiveContent(true);

      try {
        const content = await fetchHomeContent(appLanguage, prayerSourceLanguage, hasPremiumAccess);
        if (!active || !content) return;

        setLiveFeaturedPrayers(content.featuredPrayers);
        setLiveCatalog(content.catalog);
        setLiveDeities(content.deityNames);
        setLiveFestivals(content.festivalNames);
        setLiveReminder(content.reminder);
      } catch (error) {
        console.warn("Failed to load live home content", error);
      } finally {
        if (active) {
          setLoadingLiveContent(false);
        }
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, [appLanguage, hasPremiumAccess, isSupabaseConnected, prayerSourceLanguage]);

  const fallbackReminder = getTodayReminder();
  const todayReminder = useMemo<HomeReminderItem>(() => {
    if (liveReminder) {
      return liveReminder;
    }

    return {
      type: fallbackReminder.type,
      prayerId: getPrayerIdByTitle(fallbackReminder.title),
      dayLabel: fallbackReminder.dayLabel,
      title: fallbackReminder.title,
      deityKey: fallbackReminder.deity,
      deity: fallbackReminder.deity,
      duration: fallbackReminder.duration,
      festivalKey: fallbackReminder.festival,
      festival: fallbackReminder.festival,
    };
  }, [fallbackReminder, liveReminder]);

  const todayPrayerId = todayReminder.prayerId;
  const displayFestivals = liveFestivals.length
    ? liveFestivals
    : festivalCatalog.slice(0, 4).map((festival) => ({
        key: festival,
        label: getLocalizedFestival(appLanguage, festival),
      }));
  const displayDeities = liveDeities.length
    ? liveDeities
    : deityCatalog.map((deity) => ({
        key: deity,
        label: getLocalizedDeity(appLanguage, deity),
      }));
  const displayFeaturedPrayers = liveFeaturedPrayers.length
    ? liveFeaturedPrayers
    : featuredPrayers.map((prayer) => ({
        ...prayer,
        deityKey: prayer.deity,
        festivals: [],
        festivalKeys: [],
        accessTier: "free" as const,
        isPremium: false,
      }));
  const fullCatalog = liveCatalog.length
    ? liveCatalog
    : prayerCatalog.map((prayer) => ({
        ...prayer,
        deityKey: prayer.deity,
        festivalKeys: prayer.festivals,
        accessTier: "free" as const,
        isPremium: false,
      }));
  const festivalPrayerCounts = useMemo(
    () =>
      fullCatalog.reduce<Record<string, number>>((acc, prayer) => {
        prayer.festivalKeys.forEach((festivalKey) => {
          acc[festivalKey] = (acc[festivalKey] ?? 0) + 1;
        });
        return acc;
      }, {}),
    [fullCatalog]
  );
  const premiumEntryLabel = user?.isGuest ? tr("common.signInToContinue") : tr("common.unlockPremium");

  return (
    <ScreenContainer>
      <LinearGradient colors={["#651616", "#5A1313", "#B64712"]} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.greetingLabel}>☽ {tr("common.goodEvening").toUpperCase()}</Text>
            <Text style={styles.greetingName}>{displayName}</Text>
            <Text style={styles.mantraText}>{tr("home.mantraLine")}</Text>
          </View>

          <Pressable style={styles.notificationOrb} onPress={() => navigation.navigate("Reminders")}>
            <View style={styles.notificationRingLarge} />
            <View style={styles.notificationRingSmall} />
            <Text style={styles.omDecoration}>ॐ</Text>
            <Ionicons name="notifications-outline" size={22} color={AppColors.gold} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.languageTitle}>{tr("home.appLanguage")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
            {appLanguages.map((language) => {
              const active = appLanguage === language;
              return (
                <Pressable
                  key={language}
                  style={[styles.languageChip, active && styles.languageChipActive]}
                  onPress={() => setAppLanguage(language)}
                >
                  <Text style={[styles.languageChipText, active && styles.languageChipTextActive]}>
                    {getLanguageOptionLabel(language)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {appLanguage === "English" ? (
            <>
              <Text style={styles.sourceLabel}>{tr("home.prayerSourceLanguage").toUpperCase()}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
                {["Hindi", "Telugu", "Kannada", "Tamil", "Marathi"].map((language) => {
                  const active = prayerSourceLanguage === language;
                  return (
                    <Pressable
                      key={language}
                      style={[styles.languageChip, styles.sourceChip, active && styles.sourceChipActive]}
                      onPress={() => setPrayerSourceLanguage(language)}
                    >
                      <Text style={[styles.languageChipText, active && styles.sourceChipTextActive]}>
                        {language}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : null}
        </SectionCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr("home.todaysPrayer")}</Text>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              {todayReminder.type === "festival" ? tr("home.festivalPrayer") : tr("home.dailyPrayer")}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.todayCardWrap}
          onPress={() => navigation.navigate("PrayerDetail", { prayerId: todayPrayerId })}
        >
          <LinearGradient colors={["#96231C", "#C34B16", "#FF8935"]} style={styles.todayCard}>
            <View style={styles.todayCardText}>
              <Text style={styles.todayEyebrow}>
                {todayReminder.type === "festival" ? tr("home.festivalPrayer").toUpperCase() : tr("home.dailyPrayer").toUpperCase()}
              </Text>
              <Text style={styles.todayCardTitle}>{getLocalizedPrayerTitle(appLanguage, todayReminder.title)}</Text>
              <Text style={styles.todayCardMeta}>
                {todayReminder.type === "festival"
                  ? `${getLocalizedFestival(appLanguage, todayReminder.festival || "")} · ${getLocalizedReadDuration(appLanguage, todayReminder.duration)}`
                  : `${getLocalizedWeekday(appLanguage, todayReminder.dayLabel)} · ${getLocalizedReadDuration(appLanguage, todayReminder.duration)}`}
              </Text>
            </View>

            <View style={styles.todayIconWrap}>
              <Text style={styles.todayIconText}>
                {deityVisuals[todayReminder.deityKey]?.symbol ?? "🙏"}
              </Text>
            </View>

            <View style={styles.todayBottomRow}>
              <View style={styles.todayProgressTrack}>
                <View style={styles.todayProgressFill} />
              </View>
              <Text style={styles.readNowText}>{tr("home.readNow")} →</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {hasPremiumAccess ? (
          <>
            <PremiumFeatureCard
              eyebrow={tr("common.premium")}
              icon="leaf-outline"
              title={tr("home.sadhanaTitle")}
              body={tr("home.sadhanaBody")}
              bullets={[tr("home.sadhanaPoint1"), tr("home.sadhanaPoint2")]}
              ctaLabel={tr("home.sadhanaCta")}
              onPress={() => navigation.navigate("DailySadhana")}
            />

            <PremiumFeatureCard
              eyebrow={tr("common.premium")}
              icon="people-outline"
              title={tr("home.familyTitle")}
              body={tr("home.familyBody")}
              bullets={[tr("home.familyPoint1"), tr("home.familyPoint2")]}
              ctaLabel={tr("home.familyCta")}
              onPress={() => navigation.navigate("FamilyLearning")}
            />
          </>
        ) : null}

        {!hasPremiumAccess ? (
          <PremiumFeatureCard
            eyebrow={tr("common.premium")}
            icon="sparkles-outline"
            title={tr("home.premiumGuidesTitle")}
            body={tr("home.premiumGuidesBody")}
            bullets={[tr("home.premiumGuidesPoint1"), tr("home.premiumGuidesPoint2")]}
            ctaLabel={premiumEntryLabel}
            onPress={() => {
              if (user?.isGuest) {
                void logout();
                return;
              }

              navigation.navigate("Premium", {
                postPurchaseRedirect: {
                  name: "MainTabs",
                  params: { screen: "HomeTab" },
                },
              });
            }}
          />
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr("home.browseByFestival")}</Text>
          <Pressable
            onPress={() => navigation.navigate("SearchTab", { initialMode: "festival", initialQuery: "" })}
          >
            <Text style={styles.sectionAction}>{tr("common.seeAll")} ›</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.festivalScroll}>
          {displayFestivals.map((festival) => {
            const visual = festivalVisuals[festival.key] ?? defaultFestivalVisual;
            const prayerCount = festivalPrayerCounts[festival.key] ?? 0;
            return (
              <Pressable
                key={festival.key}
                onPress={() => navigation.navigate("FestivalGuide", { festivalKey: festival.key })}
              >
                <LinearGradient colors={visual.colors} style={styles.festivalCard}>
                  {visual.chip ? (
                    <View style={styles.festivalChip}>
                      <View style={styles.festivalChipDot} />
                      <Text style={styles.festivalChipText}>
                        {visual.chip === "thisMonth" ? tr("home.thisMonth") : visual.chip}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.festivalIconBox}>
                    <Text style={styles.festivalIcon}>{visual.symbol}</Text>
                  </View>
                  <Text style={styles.festivalTitle}>{getLocalizedFestival(appLanguage, festival.label || festival.key)}</Text>
                  <View style={styles.prayerCountPill}>
                    <Text style={styles.prayerCountText}>
                      {prayerCount} {tr("common.prayers")}
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr("home.browseByDeity")}</Text>
          <Pressable
            onPress={() => navigation.navigate("SearchTab", { initialMode: "deity", initialQuery: "" })}
          >
            <Text style={styles.sectionAction}>{tr("common.seeAll")} ›</Text>
          </Pressable>
        </View>

        <View style={styles.deityGrid}>
          {displayDeities.map((deity) => {
            const visual = deityVisuals[deity.key] ?? deityVisuals.Hanuman;
            return (
              <Pressable
                key={deity.key}
                style={[styles.deityCard, { borderColor: visual.border }]}
                onPress={() =>
                  navigation.navigate("SearchTab", {
                    initialMode: "deity",
                    initialDeity: deity.key,
                    initialQuery: "",
                  })
                }
              >
                <LinearGradient colors={visual.bubble} style={styles.deityIconBox}>
                  <Text style={styles.deityIcon}>{visual.symbol}</Text>
                </LinearGradient>
                <Text style={styles.deityName}>{getLocalizedDeity(appLanguage, deity.label || deity.key)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr("home.featuredPrayers")}</Text>
          {loadingLiveContent ? <ActivityIndicator size="small" color={AppColors.accent} /> : null}
        </View>

        {displayFeaturedPrayers.map((prayer) => {
          const visual = deityVisuals[prayer.deityKey] ?? deityVisuals.Hanuman;
          return (
            <Pressable
              key={prayer.id}
              style={styles.prayerCard}
              onPress={() => navigation.navigate("PrayerDetail", { prayerId: prayer.id })}
            >
              <LinearGradient colors={visual.bubble} style={styles.prayerIconBox}>
                <Text style={styles.prayerIcon}>{visual.symbol}</Text>
              </LinearGradient>

              <View style={styles.prayerTextWrap}>
                <Text style={styles.prayerTitle}>{getLocalizedPrayerTitle(appLanguage, prayer.title)}</Text>
                {prayer.isPremium ? <Text style={styles.premiumPill}>{tr("common.premium")}</Text> : null}
                <View style={styles.prayerMetaRow}>
                  <Text style={styles.prayerBadge}>{getLocalizedCategory(appLanguage, prayer.category)}</Text>
                  <Text style={styles.prayerMeta}>{getLocalizedDeity(appLanguage, prayer.deity)}</Text>
                  <Text style={styles.prayerMeta}>◷ {getLocalizedReadDuration(appLanguage, prayer.duration)}</Text>
                </View>
              </View>

              <View style={styles.trailingActions}>
                <Pressable onPress={() => toggleFavoritePrayer(prayer.id)} hitSlop={10}>
                  <Ionicons
                    name={isFavoritePrayer(prayer.id) ? "heart" : "heart-outline"}
                    size={22}
                    color={isFavoritePrayer(prayer.id) ? AppColors.accent : "#C7B59E"}
                  />
                </Pressable>
                <Ionicons name="chevron-forward" size={18} color="#C7B59E" />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  greetingLabel: {
    color: "rgba(255,245,228,0.72)",
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: "600",
  },
  greetingName: {
    color: "#FFF5E4",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },
  mantraText: {
    color: "rgba(255,245,228,0.72)",
    fontSize: 11,
    marginTop: 3,
  },
  notificationOrb: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationRingLarge: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.16)",
  },
  notificationRingSmall: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.22)",
    right: 7,
    top: 10,
  },
  omDecoration: {
    position: "absolute",
    right: 6,
    bottom: 2,
    fontSize: 36,
    color: "rgba(212,175,55,0.18)",
    fontWeight: "700",
  },
  notificationDot: {
    position: "absolute",
    top: 22,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.accent,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  languageTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  languageRow: {
    gap: 10,
    paddingRight: 16,
  },
  languageChip: {
    minWidth: 92,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E7CFA1",
    backgroundColor: "#FFF7EA",
    alignItems: "center",
    justifyContent: "center",
  },
  languageChipActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  languageChipText: {
    color: AppColors.maroon,
    fontSize: 11,
    fontWeight: "700",
  },
  languageChipTextActive: {
    color: "#FFF5E4",
  },
  sourceLabel: {
    color: "#9B8B7A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 10,
  },
  sourceChip: {
    minWidth: 110,
  },
  sourceChipActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  sourceChipTextActive: {
    color: "#FFF5E4",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionAction: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  headerPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFE7D2",
  },
  headerPillText: {
    color: AppColors.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  todayCardWrap: {
    borderRadius: 32,
    shadowColor: AppColors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  todayCard: {
    borderRadius: 32,
    padding: 16,
    overflow: "hidden",
  },
  todayCardText: {
    paddingRight: 82,
  },
  todayEyebrow: {
    color: "rgba(255,245,228,0.78)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  todayCardTitle: {
    color: "#FFF5E4",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  todayCardMeta: {
    color: "rgba(255,245,228,0.76)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
  todayIconWrap: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  todayIconText: {
    fontSize: 26,
  },
  todayBottomRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  todayProgressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,245,228,0.26)",
    overflow: "hidden",
  },
  todayProgressFill: {
    width: "72%",
    height: "100%",
    backgroundColor: "rgba(255,245,228,0.45)",
  },
  readNowText: {
    color: AppColors.gold,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 8,
  },
  festivalScroll: {
    gap: 12,
    paddingRight: 16,
  },
  festivalCard: {
    width: 150,
    minHeight: 216,
    borderRadius: 24,
    padding: 14,
    justifyContent: "flex-end",
  },
  festivalChip: {
    position: "absolute",
    top: 14,
    right: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,245,228,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,245,228,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  festivalChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF5E4",
  },
  festivalChipText: {
    color: "#FFF5E4",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  festivalIconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  festivalIcon: {
    fontSize: 24,
  },
  festivalTitle: {
    color: "#FFF5E4",
    fontSize: 18,
    fontWeight: "700",
  },
  festivalNative: {
    color: "rgba(255,245,228,0.86)",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  prayerCountPill: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  prayerCountText: {
    color: "#FFF5E4",
    fontSize: 10,
    fontWeight: "700",
  },
  deityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  deityCard: {
    width: "23%",
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    paddingVertical: 10,
    shadowColor: AppColors.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  deityIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  deityIcon: {
    fontSize: 22,
  },
  deityName: {
    color: AppColors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    minHeight: 28,
  },
  prayerCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: AppColors.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  prayerIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIcon: {
    fontSize: 24,
  },
  prayerTextWrap: {
    flex: 1,
  },
  prayerTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  premiumPill: {
    alignSelf: "flex-start",
    overflow: "hidden",
    color: "#FFF5E4",
    backgroundColor: AppColors.maroon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 8,
  },
  prayerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  prayerBadge: {
    overflow: "hidden",
    color: AppColors.maroon,
    backgroundColor: "#F8E8E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "800",
  },
  prayerMeta: {
    color: "#9B8B7A",
    fontSize: 10,
    fontWeight: "700",
  },
  trailingActions: {
    alignItems: "center",
    gap: 12,
  },
});
