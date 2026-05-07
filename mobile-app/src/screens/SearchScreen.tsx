import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import {
  fetchBrowseEntities,
  fetchPrayerCatalog,
  type BrowseItem,
  type PrayerListItem,
} from "../lib/supabase/content";
import {
  deityCatalog,
  festivalCatalog,
  prayerCatalog,
} from "../data/sampleContent";
import {
  getLocalizedCategory,
  getLocalizedDeity,
  getLocalizedFestival,
  getLocalizedPrayerTitle,
  getLocalizedReadDuration,
  t,
} from "../i18n";
import { useApp } from "../context/AppContext";
import { AppColors } from "../theme/colors";

type SearchMode = "direct" | "festival" | "deity";

const modeLabels: Record<SearchMode, string> = {
  direct: "Direct Prayer",
  festival: "By Festival",
  deity: "By Deity",
};

const modePlaceholders: Record<SearchMode, string> = {
  direct: "Search prayer name",
  festival: "Search festival name",
  deity: "Search deity name",
};

export function SearchScreen({ navigation, route }: { navigation: any; route?: any }) {
  const { appLanguage, prayerSourceLanguage, isSupabaseConnected, isFavoritePrayer, toggleFavoritePrayer } = useApp();
  const [mode, setMode] = useState<SearchMode>("direct");
  const [query, setQuery] = useState("");
  const [selectedFestival, setSelectedFestival] = useState<string | null>(null);
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [liveCatalog, setLiveCatalog] = useState<PrayerListItem[]>([]);
  const [liveBrowseEntities, setLiveBrowseEntities] = useState<{ festivals: BrowseItem[]; deities: BrowseItem[] }>({
    festivals: [],
    deities: [],
  });
  const tr = (path: string) => t(appLanguage, path);

  useEffect(() => {
    const params = route?.params;
    if (!params) return;

    if (params.initialMode === "festival" || params.initialMode === "deity" || params.initialMode === "direct") {
      setMode(params.initialMode);
    }

    if (typeof params.initialQuery === "string") {
      setQuery(params.initialQuery);
    }

    if (typeof params.initialFestival === "string") {
      setSelectedFestival(params.initialFestival);
    }

    if (typeof params.initialDeity === "string") {
      setSelectedDeity(params.initialDeity);
    }
  }, [route?.params]);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      if (!isSupabaseConnected) return;

      try {
        const [catalog, browseEntities] = await Promise.all([
          fetchPrayerCatalog(appLanguage, prayerSourceLanguage),
          fetchBrowseEntities(appLanguage),
        ]);
        if (active) {
          setLiveCatalog(catalog);
          setLiveBrowseEntities(browseEntities);
        }
      } catch (error) {
        console.warn("Failed to load live search catalog", error);
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [appLanguage, isSupabaseConnected, prayerSourceLanguage]);

  const catalog = liveCatalog.length
    ? liveCatalog
    : prayerCatalog.map((prayer) => ({
        ...prayer,
        deityKey: prayer.deity,
        festivalKeys: prayer.festivals,
        accessTier: "free" as const,
        isPremium: false,
      }));

  const festivals = liveBrowseEntities.festivals.length
    ? liveBrowseEntities.festivals
    : festivalCatalog.map((festival) => ({
        key: festival,
        label: getLocalizedFestival(appLanguage, festival),
      }));

  const deities = liveBrowseEntities.deities.length
    ? liveBrowseEntities.deities
    : deityCatalog.map((deity) => ({
        key: deity,
        label: getLocalizedDeity(appLanguage, deity),
      }));

  const visiblePrayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalog.filter((prayer) => {
      if (mode === "direct") {
        if (!normalizedQuery) return true;
        return prayer.title.toLowerCase().includes(normalizedQuery);
      }

      if (mode === "festival") {
        const festivalMatch = selectedFestival
          ? prayer.festivalKeys.includes(selectedFestival)
          : true;
        const queryMatch = normalizedQuery
          ? prayer.festivals.some((festival) => festival.toLowerCase().includes(normalizedQuery)) ||
            prayer.festivalKeys.some((festival) => festival.toLowerCase().includes(normalizedQuery))
          : true;
        return festivalMatch && queryMatch;
      }

      const deityMatch = selectedDeity ? prayer.deityKey === selectedDeity : true;
      const queryMatch = normalizedQuery
        ? prayer.deity.toLowerCase().includes(normalizedQuery) ||
          prayer.deityKey.toLowerCase().includes(normalizedQuery)
        : true;
      return deityMatch && queryMatch;
    });
  }, [catalog, mode, query, selectedFestival, selectedDeity]);

  const visibleFestivals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return festivals.filter((festival) => {
      if (!normalizedQuery) return true;
      return (
        festival.label.toLowerCase().includes(normalizedQuery) ||
        festival.key.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [festivals, query]);

  const visibleDeities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return deities.filter((deity) => {
      if (!normalizedQuery) return true;
      return (
        deity.label.toLowerCase().includes(normalizedQuery) ||
        deity.key.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [deities, query]);

  const quickFilters =
    mode === "festival"
      ? festivals.map((item) => item.key)
      : mode === "deity"
        ? deities.map((item) => item.key)
        : [];

  const shouldShowPrayerResults =
    mode === "direct" ||
    Boolean(query.trim()) ||
    (mode === "festival" && Boolean(selectedFestival)) ||
    (mode === "deity" && Boolean(selectedDeity));

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("search.title")}
        subtitle={tr("search.subtitle")}
      />

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.sectionLabel}>{tr("common.searchPath")}</Text>
          <View style={styles.modeRow}>
            {(["direct", "festival", "deity"] as SearchMode[]).map((item) => {
              const active = mode === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.modeChip, active && styles.modeChipActive]}
                  onPress={() => {
                    setMode(item);
                    setQuery("");
                    setSelectedFestival(null);
                    setSelectedDeity(null);
                  }}
                >
                  <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                    {item === "direct"
                      ? tr("search.directPrayer")
                      : item === "festival"
                        ? tr("search.byFestival")
                        : tr("search.byDeity")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={18} color={AppColors.accent} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={
                mode === "direct"
                  ? tr("search.placeholderPrayer")
                  : mode === "festival"
                    ? tr("search.placeholderFestival")
                    : tr("search.placeholderDeity")
              }
              placeholderTextColor="#9B8B7A"
              style={styles.searchInput}
            />
          </View>

          {quickFilters.length ? (
            <>
              <Text style={styles.quickFilterLabel}>{tr("common.quickSelect")}</Text>
              <View style={styles.quickFilterWrap}>
                {quickFilters.map((item) => {
                  const active = mode === "festival" ? selectedFestival === item : selectedDeity === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.quickChip, active && styles.quickChipActive]}
                      onPress={() => {
                        if (mode === "festival") {
                          setSelectedFestival(active ? null : item);
                        } else {
                          setSelectedDeity(active ? null : item);
                        }
                      }}
                    >
                      <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>
                        {mode === "festival"
                          ? getLocalizedFestival(appLanguage, item)
                          : getLocalizedDeity(appLanguage, item)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {mode === "festival" && selectedFestival ? (
            <Pressable
              style={styles.guideCard}
              onPress={() => navigation.navigate("FestivalGuide", { festivalKey: selectedFestival })}
            >
              <View style={styles.guideCardCopy}>
                <Text style={styles.guideCardEyebrow}>{tr("common.premium")}</Text>
                <Text style={styles.guideCardTitle}>{tr("festivalGuide.title")}</Text>
                <Text style={styles.guideCardBody}>{tr("home.premiumGuidesPoint1")}</Text>
              </View>
              <Ionicons name="sparkles-outline" size={22} color={AppColors.gold} />
            </Pressable>
          ) : null}
        </SectionCard>

        {mode === "festival" ? (
          <SectionCard>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>{tr("search.festivalResults")}</Text>
              <Text style={styles.resultsCount}>{visibleFestivals.length}</Text>
            </View>

            {!visibleFestivals.length ? (
              <Text style={styles.helperText}>{tr("search.noResultsBody")}</Text>
            ) : (
              visibleFestivals.map((festival) => {
                const active = selectedFestival === festival.key;
                return (
                  <Pressable
                    key={festival.key}
                    style={[styles.entityCard, active && styles.entityCardActive]}
                    onPress={() => setSelectedFestival(active ? null : festival.key)}
                  >
                    <View style={styles.entityIcon}>
                      <Text style={styles.entityIconText}>🪔</Text>
                    </View>
                    <View style={styles.entityCopy}>
                      <Text style={styles.entityTitle}>{getLocalizedFestival(appLanguage, festival.label || festival.key)}</Text>
                      <Text style={styles.entityBody}>{tr("search.tapFestivalToBrowse")}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={active ? AppColors.accent : "#C9B89A"}
                    />
                  </Pressable>
                );
              })
            )}
          </SectionCard>
        ) : null}

        {mode === "deity" ? (
          <SectionCard>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>{tr("search.deityResults")}</Text>
              <Text style={styles.resultsCount}>{visibleDeities.length}</Text>
            </View>

            {!visibleDeities.length ? (
              <Text style={styles.helperText}>{tr("search.noResultsBody")}</Text>
            ) : (
              visibleDeities.map((deity) => {
                const active = selectedDeity === deity.key;
                return (
                  <Pressable
                    key={deity.key}
                    style={[styles.entityCard, active && styles.entityCardActive]}
                    onPress={() => setSelectedDeity(active ? null : deity.key)}
                  >
                    <View style={styles.entityIcon}>
                      <Text style={styles.entityIconText}>🙏</Text>
                    </View>
                    <View style={styles.entityCopy}>
                      <Text style={styles.entityTitle}>{getLocalizedDeity(appLanguage, deity.label || deity.key)}</Text>
                      <Text style={styles.entityBody}>{tr("search.tapDeityToBrowse")}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={active ? AppColors.accent : "#C9B89A"}
                    />
                  </Pressable>
                );
              })
            )}
          </SectionCard>
        ) : null}

        {shouldShowPrayerResults ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {mode === "direct" ? tr("search.results") : tr("search.relatedPrayers")}
              </Text>
              <Text style={styles.resultsCount}>
                {visiblePrayers.length} {tr("common.prayers")}
              </Text>
            </View>

            {visiblePrayers.map((prayer) => (
              <Pressable
                key={prayer.id}
                style={styles.resultCard}
                onPress={() => navigation.navigate("PrayerDetail", { prayerId: prayer.id })}
              >
                <View style={styles.resultIcon}>
                  <Text style={styles.resultIconText}>🙏</Text>
                </View>
                <View style={styles.resultTextWrap}>
                  <Text style={styles.resultTitle}>{getLocalizedPrayerTitle(appLanguage, prayer.title)}</Text>
                  {prayer.isPremium ? <Text style={styles.premiumPill}>{tr("common.premium")}</Text> : null}
                  <View style={styles.badgeRow}>
                    <Text style={styles.resultBadge}>{getLocalizedCategory(appLanguage, prayer.category)}</Text>
                    <Text style={styles.resultMeta}>{getLocalizedDeity(appLanguage, prayer.deity)}</Text>
                    <Text style={styles.resultMeta}>{getLocalizedReadDuration(appLanguage, prayer.duration)}</Text>
                  </View>
                  <Text style={styles.resultFestivalText}>
                    {prayer.festivals.map((festival) => getLocalizedFestival(appLanguage, festival)).join(" • ")}
                  </Text>
                </View>
                <Pressable
                  style={styles.favoriteButton}
                  onPress={() => toggleFavoritePrayer(prayer.id)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={isFavoritePrayer(prayer.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavoritePrayer(prayer.id) ? AppColors.accent : "#C9B89A"}
                  />
                </Pressable>
              </Pressable>
            ))}

            {!visiblePrayers.length ? (
              <SectionCard>
                <Text style={styles.emptyTitle}>{tr("search.noResults")}</Text>
                <Text style={styles.emptyText}>{tr("search.noResultsBody")}</Text>
              </SectionCard>
            ) : null}
          </>
        ) : null}
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
  sectionLabel: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  modeChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF7EE",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeChipActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  modeChipText: {
    color: AppColors.maroon,
    fontSize: 13,
    fontWeight: "700",
  },
  modeChipTextActive: {
    color: "#FFF5E4",
  },
  searchInputWrap: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 15,
    paddingVertical: 12,
  },
  quickFilterLabel: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },
  quickFilterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  guideCard: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: AppColors.maroon,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  guideCardCopy: {
    flex: 1,
  },
  guideCardEyebrow: {
    color: "rgba(255,245,228,0.74)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  guideCardTitle: {
    color: "#FFF5E4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  guideCardBody: {
    color: "rgba(255,245,228,0.84)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  quickChip: {
    borderRadius: 999,
    backgroundColor: AppColors.mutedChip,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quickChipActive: {
    backgroundColor: "#F8E8E2",
    borderColor: "#E7B69A",
  },
  quickChipText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  quickChipTextActive: {
    color: AppColors.maroon,
  },
  helperText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  entityCard: {
    marginTop: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  entityCardActive: {
    borderColor: "#E7B69A",
    backgroundColor: "#FFF6EF",
  },
  entityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  entityIconText: {
    fontSize: 22,
  },
  entityCopy: {
    flex: 1,
  },
  entityTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  entityBody: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsTitle: {
    color: AppColors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  resultsCount: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  resultIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  resultIconText: {
    fontSize: 24,
  },
  resultTextWrap: {
    flex: 1,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
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
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    alignItems: "center",
  },
  resultBadge: {
    overflow: "hidden",
    color: AppColors.maroon,
    backgroundColor: "#F8E8E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
  },
  resultMeta: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  resultFestivalText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
