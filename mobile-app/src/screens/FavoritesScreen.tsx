import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { fetchPrayerCatalog, type PrayerListItem } from "../lib/supabase/content";
import { getPrayerById } from "../data/sampleContent";
import { getLocalizedCategory, getLocalizedDeity, getLocalizedPrayerTitle, t } from "../i18n";
import { AppColors } from "../theme/colors";

export function FavoritesScreen({ navigation }: { navigation: any }) {
  const { appLanguage, prayerSourceLanguage, isSupabaseConnected, favoritePrayerIds, toggleFavoritePrayer } = useApp();
  const tr = (path: string) => t(appLanguage, path);
  const [liveCatalog, setLiveCatalog] = useState<PrayerListItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      if (!isSupabaseConnected) return;

      try {
        const catalog = await fetchPrayerCatalog(appLanguage, prayerSourceLanguage);
        if (active) {
          setLiveCatalog(catalog);
        }
      } catch (error) {
        console.warn("Failed to load favorites catalog", error);
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [appLanguage, isSupabaseConnected, prayerSourceLanguage]);

  const favoritePrayers = useMemo(
    () =>
      favoritePrayerIds
        .map((id) =>
          liveCatalog.find((item) => item.id === id) ??
          {
            ...getPrayerById(id),
            deityKey: getPrayerById(id).deity,
            festivalKeys: getPrayerById(id).festivals,
            accessTier: "free" as const,
            isPremium: false,
          }
        )
        .filter(Boolean),
    [favoritePrayerIds, liveCatalog]
  );

  return (
    <ScreenContainer>
      <GradientHeader title={tr("favorites.title")} subtitle={tr("favorites.subtitle")} />

      <View style={styles.content}>
        {favoritePrayers.length ? (
          favoritePrayers.map((prayer) => (
            <Pressable
              key={prayer.id}
              style={styles.prayerCard}
              onPress={() => navigation.navigate("PrayerDetail", { prayerId: prayer.id })}
            >
              <View style={styles.prayerIcon}>
                <Text style={styles.prayerIconText}>🙏</Text>
              </View>
              <View style={styles.prayerTextWrap}>
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                {prayer.isPremium ? <Text style={styles.premiumPill}>{tr("common.premium")}</Text> : null}
                <View style={styles.prayerMetaRow}>
                  <Text style={styles.prayerBadge}>{getLocalizedCategory(appLanguage, prayer.category)}</Text>
                  <Text style={styles.prayerMeta}>{prayer.deity}</Text>
                  <Text style={styles.prayerMeta}>{prayer.duration}</Text>
                </View>
              </View>
              <Pressable
                style={styles.favoriteButton}
                onPress={() => toggleFavoritePrayer(prayer.id)}
                hitSlop={10}
              >
                <Ionicons name="heart" size={20} color={AppColors.accent} />
              </Pressable>
            </Pressable>
          ))
        ) : (
          <SectionCard>
            <Text style={styles.emptyTitle}>{tr("favorites.emptyTitle")}</Text>
            <Text style={styles.emptyBody}>{tr("favorites.emptyBody")}</Text>
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
    gap: 16,
  },
  prayerCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  prayerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerIconText: {
    fontSize: 24,
  },
  prayerTextWrap: {
    flex: 1,
  },
  prayerTitle: {
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
  prayerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    alignItems: "center",
  },
  prayerBadge: {
    overflow: "hidden",
    color: AppColors.maroon,
    backgroundColor: "#F8E8E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
  },
  prayerMeta: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  emptyBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
