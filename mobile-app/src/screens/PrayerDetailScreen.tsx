import { Share, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { AudioSeekBar } from "../components/AudioSeekBar";
import { GradientHeader } from "../components/GradientHeader";
import { PremiumFeatureCard } from "../components/PremiumFeatureCard";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { fetchPrayerDetail, type PrayerDetailData } from "../lib/supabase/content";
import { getPrayerById, getPrayerContentById } from "../data/sampleContent";
import {
  getLocalizedCategory,
  getLocalizedDeity,
  getLocalizedPrayerNote,
  getLocalizedPrayerTitle,
  getLocalizedReadDuration,
  getPrayerSourceLabel,
  t,
} from "../i18n";
import { AppColors } from "../theme/colors";

const fontSizes = [17, 20, 24];
const fontLabels = ["S", "M", "L"];

export function PrayerDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const {
    user,
    appLanguage,
    prayerSourceLanguage,
    hasPremiumAccess,
    isFavoritePrayer,
    toggleFavoritePrayer,
    isSupabaseConnected,
    logout,
  } = useApp();
  const prayerId = route?.params?.prayerId ?? "hanuman-chalisa";
  const tr = (path: string) => t(appLanguage, path);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [liveDetail, setLiveDetail] = useState<PrayerDetailData | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [previewRatio, setPreviewRatio] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const previewRatioRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!isSupabaseConnected) return;

      try {
        const detail = await fetchPrayerDetail(
          prayerId,
          appLanguage,
          prayerSourceLanguage,
          hasPremiumAccess
        );
        if (active) {
          setLiveDetail(detail);
        }
        
      } catch (error) {
        console.warn("Failed to load live prayer detail", error);
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [appLanguage, hasPremiumAccess, isSupabaseConnected, prayerId, prayerSourceLanguage]);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    return () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  const fallbackPrayer = getPrayerById(prayerId);
  const fallbackContent = getPrayerContentById(prayerId);
  const prayer = liveDetail?.prayer ?? {
    ...fallbackPrayer,
    deityKey: fallbackPrayer.deity,
    festivals: fallbackPrayer.festivals,
    festivalKeys: fallbackPrayer.festivals,
  };
  const localizedTitle = liveDetail?.prayer.title ?? getLocalizedPrayerTitle(appLanguage, fallbackPrayer.title);
  const localizedDeity = liveDetail?.prayer.deity ?? getLocalizedDeity(appLanguage, fallbackPrayer.deity);
  const localizedDuration = getLocalizedReadDuration(appLanguage, prayer.duration);
  const localizedNote = getLocalizedPrayerNote(appLanguage, liveDetail?.note || fallbackContent.note);
  const verses = useMemo(
    () =>
      liveDetail?.verses?.length
        ? liveDetail.verses
        : appLanguage === "English"
          ? fallbackContent.transliteratedVerses
          : fallbackContent.nativeVerses,
    [appLanguage, fallbackContent.nativeVerses, fallbackContent.transliteratedVerses, liveDetail]
  );
  const sourceLanguageLabel = liveDetail
    ? appLanguage === "English"
      ? `${getPrayerSourceLabel(liveDetail.sourceLanguage)} ${tr("prayerDetail.transliterated")}`
      : getPrayerSourceLabel(liveDetail.sourceLanguage)
    : appLanguage === "English"
      ? `${getPrayerSourceLabel(prayerSourceLanguage)} ${tr("prayerDetail.transliterated")}`
      : getPrayerSourceLabel(fallbackContent.sourceLanguage);
  const audioUrl = liveDetail?.audioUrl ?? null;
  const audioSourceLabel = liveDetail?.audioLanguage
    ? getPrayerSourceLabel(liveDetail.audioLanguage)
    : sourceLanguageLabel;
  const isPremiumLocked = Boolean(liveDetail?.isPremiumLocked);
  const premiumEntryLabel = user?.isGuest ? tr("common.signInToContinue") : tr("common.unlockPremium");
  const isAudioPremiumLocked = Boolean(liveDetail?.isAudioPremiumLocked);
  const progressRatio = previewRatio ?? (durationMillis > 0 ? positionMillis / durationMillis : 0);
  const displayedPositionMillis =
    previewRatio !== null && durationMillis > 0 ? Math.floor(durationMillis * previewRatio) : positionMillis;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.max(0, Math.floor(millis / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: localizedTitle,
        message: `${tr("prayerDetail.shareMessage")}: ${localizedTitle}`,
      });
    } catch {
      // ignore share dismissal in prototype mode
    }
  };

  const togglePlayback = async () => {
    if (!audioUrl || audioBusy) return;

    setAudioBusy(true);
    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (previewRatioRef.current !== null) return;
          setIsPlaying(status.isPlaying);
          setPositionMillis(status.positionMillis ?? 0);
          setDurationMillis(status.durationMillis ?? 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPositionMillis(0);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.warn("Failed to play prayer audio", error);
    } finally {
      setAudioBusy(false);
    }
  };

  const seekBy = async (offsetMillis: number) => {
    if (!soundRef.current || audioBusy) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      const nextPosition = Math.max(0, Math.min(status.positionMillis + offsetMillis, status.durationMillis ?? 0));
      await soundRef.current.setPositionAsync(nextPosition);
      setPositionMillis(nextPosition);
      if (status.durationMillis) {
        setDurationMillis(status.durationMillis);
      }
    } catch (error) {
      console.warn("Failed to seek prayer audio", error);
    }
  };

  const seekToRatio = async (ratio: number) => {
    if (!soundRef.current || audioBusy || durationMillis <= 0) return;

    try {
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const nextPosition = Math.floor(durationMillis * clampedRatio);
      await soundRef.current.setPositionAsync(nextPosition);
      setPositionMillis(nextPosition);
    } catch (error) {
      console.warn("Failed to seek prayer audio", error);
    }
  };

  return (
    <ScreenContainer>
      <GradientHeader
        title={localizedTitle}
        subtitle={localizedDuration}
        rightSlot={
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => toggleFavoritePrayer(prayer.id)}>
              <Ionicons
                name={isFavoritePrayer(prayer.id) ? "heart" : "heart-outline"}
                size={20}
                color="#FFF5E4"
              />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#FFF5E4" />
            </Pressable>
          </View>
        }
      >
        <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFF5E4" />
          <Text style={styles.backText}>{localizedDeity}</Text>
        </Pressable>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getLocalizedCategory(appLanguage, prayer.category)}</Text>
        </View>
      </GradientHeader>

      <View style={styles.controlsBar}>
        <View style={styles.languageChip}>
          <Text style={styles.languageText}>{sourceLanguageLabel}</Text>
        </View>
        <View style={styles.fontControls}>
          <Text style={styles.fontLabel}>{tr("prayerDetail.textSize")}</Text>
          <Pressable
            style={[styles.fontCircle, fontSizeIndex === 0 && styles.fontCircleDisabled]}
            disabled={fontSizeIndex === 0}
            onPress={() => setFontSizeIndex((value) => Math.max(0, value - 1))}
          >
            <Ionicons name="remove" size={18} color={AppColors.maroon} />
          </Pressable>
          <Text style={styles.fontCurrent}>{fontLabels[fontSizeIndex]}</Text>
          <Pressable
            style={[styles.fontCircle, fontSizeIndex === fontSizes.length - 1 && styles.fontCircleDisabled]}
            disabled={fontSizeIndex === fontSizes.length - 1}
            onPress={() => setFontSizeIndex((value) => Math.min(fontSizes.length - 1, value + 1))}
          >
            <Ionicons name="add" size={18} color={AppColors.maroon} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.audioLabel}>{localizedNote}</Text>
          <Text style={styles.audioTitle}>{localizedTitle}</Text>
          <Text style={styles.audioMeta}>
            {localizedDeity} · {localizedDuration}
          </Text>
          <View style={styles.audioRow}>
            <AudioSeekBar
              progressRatio={progressRatio}
              disabled={!audioUrl || audioBusy}
              onPreview={(ratio) => {
                previewRatioRef.current = ratio;
                setPreviewRatio(ratio);
              }}
              onSeekComplete={(ratio) => {
                previewRatioRef.current = null;
                setPreviewRatio(null);
                void seekToRatio(ratio);
              }}
              fillColor="#F36A1E"
              trackColor="#F5E9DB"
              thumbColor="#F36A1E"
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(displayedPositionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
          </View>
          <View style={styles.transportRow}>
            <Pressable
              style={[styles.transportButton, !audioUrl && styles.playButtonDisabled]}
              disabled={!audioUrl || audioBusy}
              onPress={() => void seekBy(-10000)}
            >
              <Ionicons name="play-back" size={20} color={AppColors.maroon} />
              <Text style={styles.transportText}>10</Text>
            </Pressable>
            <Pressable
              style={[styles.playButton, !audioUrl && styles.playButtonDisabled]}
              disabled={!audioUrl || audioBusy}
              onPress={() => void togglePlayback()}
            >
              <Ionicons
                name={audioBusy ? "hourglass-outline" : isPlaying ? "pause" : "play"}
                size={22}
                color="#FFF5E4"
              />
            </Pressable>
            <Pressable
              style={[styles.transportButton, !audioUrl && styles.playButtonDisabled]}
              disabled={!audioUrl || audioBusy}
              onPress={() => void seekBy(10000)}
            >
              <Ionicons name="play-forward" size={20} color={AppColors.maroon} />
              <Text style={styles.transportText}>10</Text>
            </Pressable>
          </View>
          <View style={styles.audioFooter}>
            <Text style={styles.audioFooterText}>
              {audioUrl
                ? audioSourceLabel
                : isAudioPremiumLocked
                  ? tr("audio.premiumAudioLocked")
                  : tr("audio.browserPreview")}
            </Text>
            <Text style={styles.audioFooterAction}>
              {audioUrl
                ? isPlaying
                  ? tr("audio.nowPlaying")
                  : tr("audio.tapToListen")
                : isAudioPremiumLocked
                  ? premiumEntryLabel
                  : tr("audio.browserPreview")}
            </Text>
          </View>
        </SectionCard>

        {isAudioPremiumLocked && !hasPremiumAccess ? (
          <PremiumFeatureCard
            eyebrow={tr("common.premium")}
            icon="headset-outline"
            title={tr("audio.premiumAudioLocked")}
            body={tr("audio.premiumAudioBody")}
            bullets={[
              tr("premium.featureAudio"),
              tr("premium.featureSadhana"),
            ]}
            ctaLabel={premiumEntryLabel}
            onPress={() => {
              if (user?.isGuest) {
                void logout();
                return;
              }

              navigation.navigate("Premium", {
                postPurchaseRedirect: {
                  name: "PrayerDetail",
                  params: { prayerId },
                },
              });
            }}
          />
        ) : null}

        {isPremiumLocked ? (
          <PremiumFeatureCard
            eyebrow={tr("common.premium")}
            icon="lock-closed-outline"
            title={tr("prayerDetail.lockedPrayerTitle")}
            body={tr("prayerDetail.lockedPrayerBody")}
            bullets={[
              tr("prayerDetail.premiumMeaningPoint1"),
              tr("prayerDetail.premiumMeaningPoint2"),
              tr("prayerDetail.premiumMeaningPoint3"),
            ]}
            ctaLabel={premiumEntryLabel}
            onPress={() => {
              if (user?.isGuest) {
                void logout();
                return;
              }

              navigation.navigate("Premium", {
                postPurchaseRedirect: {
                  name: "PrayerDetail",
                  params: { prayerId },
                },
              });
            }}
          />
        ) : (
          <SectionCard>
            <Text style={styles.verseHeading}>{tr("prayerDetail.prayerText")}</Text>
            {verses.map((verse, index) => (
              <Text
                key={`${prayerId}-${index}`}
                style={[
                  styles.verseText,
                  {
                    fontSize: fontSizes[fontSizeIndex],
                    lineHeight: fontSizes[fontSizeIndex] + 13,
                  },
                ]}
              >
                {verse}
              </Text>
            ))}
          </SectionCard>
        )}

        {!hasPremiumAccess ? (
          <PremiumFeatureCard
            eyebrow={tr("common.premium")}
            icon="school-outline"
            title={tr("prayerDetail.premiumMeaningTitle")}
            body={tr("prayerDetail.premiumMeaningBody")}
            bullets={[
              tr("prayerDetail.premiumMeaningPoint1"),
              tr("prayerDetail.premiumMeaningPoint2"),
              tr("prayerDetail.premiumMeaningPoint3"),
            ]}
            ctaLabel={premiumEntryLabel}
            onPress={() => {
              if (user?.isGuest) {
                void logout();
                return;
              }

              navigation.navigate("Premium", {
                postPurchaseRedirect: {
                  name: "PrayerDetail",
                  params: { prayerId },
                },
              });
            }}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#FFF5E4",
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  badgeText: {
    color: "#FFF5E4",
    fontSize: 13,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  controlsBar: {
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0C8",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageChip: {
    backgroundColor: "#FFF5E4",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexShrink: 1,
    marginRight: 14,
  },
  languageText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  fontControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fontLabel: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  fontCurrent: {
    color: AppColors.maroon,
    fontSize: 16,
    fontWeight: "800",
  },
  fontCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7EE",
  },
  fontCircleDisabled: {
    opacity: 0.45,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  audioLabel: {
    color: "#E65D1E",
    fontSize: 13,
    fontWeight: "700",
  },
  audioTitle: {
    color: AppColors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  audioMeta: {
    color: AppColors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  audioRow: {
    marginTop: 16,
    alignItems: "stretch",
  },
  timeRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  transportRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  transportButton: {
    minWidth: 64,
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: "#FFF5E4",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  transportText: {
    color: AppColors.maroon,
    fontSize: 13,
    fontWeight: "800",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF7A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonDisabled: {
    opacity: 0.4,
  },
  audioFooter: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  audioFooterText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  audioFooterAction: {
    color: "#F36A1E",
    fontSize: 12,
    fontWeight: "700",
  },
  verseHeading: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  verseText: {
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
});
