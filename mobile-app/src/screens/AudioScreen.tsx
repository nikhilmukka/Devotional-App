import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { AudioSeekBar } from "../components/AudioSeekBar";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { fetchAudioLibrary, fetchAudioSchedule, type AudioLibraryItem, type AudioScheduleItem } from "../lib/supabase/content";
import { audioSchedule } from "../data/sampleContent";
import { useApp } from "../context/AppContext";
import { getLocalizedWeekday, t } from "../i18n";
import { AppColors } from "../theme/colors";

export function AudioScreen({ navigation }: { navigation: any }) {
  const { appLanguage, prayerSourceLanguage, isSupabaseConnected, hasPremiumAccess } = useApp();
  const [liveSchedule, setLiveSchedule] = useState<AudioScheduleItem[]>([]);
  const [liveLibrary, setLiveLibrary] = useState<AudioLibraryItem[]>([]);
  const [audioBusy, setAudioBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [previewRatio, setPreviewRatio] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const previewRatioRef = useRef<number | null>(null);
  const tr = (path: string) => t(appLanguage, path);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAudio() {
      if (!isSupabaseConnected) return;

      try {
        const [schedule, library] = await Promise.all([
          fetchAudioSchedule(appLanguage, prayerSourceLanguage, hasPremiumAccess),
          fetchAudioLibrary(appLanguage, prayerSourceLanguage, hasPremiumAccess),
        ]);

        if (!active) return;
        setLiveSchedule(schedule);
        setLiveLibrary(library);
      } catch (error) {
        console.warn("Failed to load live audio content", error);
      }
    }

    void loadAudio();

    return () => {
      active = false;
    };
  }, [appLanguage, hasPremiumAccess, isSupabaseConnected, prayerSourceLanguage]);

  const fallbackSchedule: AudioScheduleItem[] = useMemo(
    () =>
      audioSchedule.map((track) => ({
        day: track.day,
        prayerId:
          track.prayer === "Hare Krishna Mahamantra"
            ? "hare-krishna-mahamantra"
            : track.prayer === "Sri Suktam"
              ? "sri-suktam"
              : track.prayer === "Durga Aarti"
                ? "durga-aarti"
                : track.prayer === "Ganesh Aarti"
                  ? "ganesh-aarti"
                  : track.prayer === "Hanuman Chalisa"
                    ? "hanuman-chalisa"
                    : track.prayer === "Mahamrityunjaya Mantra"
                      ? "mahamrityunjaya-mantra"
                      : "surya-mantra",
        prayer: track.prayer,
        deityKey: track.deity,
        deity: track.deity,
        meta: track.meta,
        language: "hindi",
        accessTier: "free",
        isPremium: false,
        hasPlayableAudio: false,
      })),
    []
  );

  const schedule = liveSchedule.length ? liveSchedule : fallbackSchedule;
  const isUsingLiveLibrary = liveLibrary.length > 0;
  const library = liveLibrary.length
    ? liveLibrary
    : fallbackSchedule.map((track) => ({
        prayerId: track.prayerId,
        prayer: track.prayer,
        deityKey: track.deityKey,
        deity: track.deity,
        meta: track.meta,
        language: "hindi",
        accessTier: "free",
        isPremium: false,
        hasPlayableAudio: false,
      }));
  const visibleLibrary =
    hasPremiumAccess || !isUsingLiveLibrary ? library : library.slice(0, Math.min(2, library.length));
  const hiddenLibraryCount =
    !hasPremiumAccess && isUsingLiveLibrary ? Math.max(library.length - visibleLibrary.length, 0) : 0;
  const showPremiumTeaser = !hasPremiumAccess;
  const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const today =
    schedule.find((track) => track.day === todayWeekday) ??
    schedule[0] ??
    fallbackSchedule[0];
  const progressRatio = previewRatio ?? (durationMillis > 0 ? positionMillis / durationMillis : 0);
  const displayedPositionMillis =
    previewRatio !== null && durationMillis > 0 ? Math.floor(durationMillis * previewRatio) : positionMillis;

  const formatTime = (millis: number) => {
    const totalSeconds = Math.max(0, Math.floor(millis / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
      console.warn("Failed to seek audio prayer", error);
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
      console.warn("Failed to seek audio prayer", error);
    }
  };

  const toggleTodayPlayback = async () => {
    if (!today.audioUrl) return;

    try {
      setAudioBusy(true);

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        }

        if (status.isLoaded) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: today.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (previewRatioRef.current !== null) return;
          setIsPlaying(status.isPlaying);
          setPositionMillis(status.positionMillis ?? 0);
          setDurationMillis(status.durationMillis ?? 0);
          if (status.didJustFinish) {
            setPositionMillis(0);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.warn("Failed to play audio prayer", error);
      setIsPlaying(false);
    } finally {
      setAudioBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("audio.title")}
        subtitle={tr("audio.subtitle")}
        rightSlot={
          <View style={styles.headsetWrap}>
            <Ionicons name="headset-outline" size={20} color={AppColors.gold} />
          </View>
        }
      />

      <View style={styles.content}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{tr("audio.todaysAudioPrayer")}</Text>
          <Pressable onPress={() => navigation.navigate("PrayerDetail", { prayerId: today.prayerId })}>
            <Text style={styles.link}>{tr("audio.openPrayer")}</Text>
          </Pressable>
        </View>

        <SectionCard>
          <Text style={styles.todayLabel}>{getLocalizedWeekday(appLanguage, today.day)} {tr("audio.audioPrayer")}</Text>
          <Text style={styles.todayTitle}>{today.prayer}</Text>
          <Text style={styles.todayMeta}>
            {today.deity} · {today.meta}
          </Text>
          <View style={styles.playerRow}>
            <AudioSeekBar
              progressRatio={progressRatio}
              disabled={!today.audioUrl || audioBusy}
              onPreview={(ratio) => {
                previewRatioRef.current = ratio;
                setPreviewRatio(ratio);
              }}
              onSeekComplete={(ratio) => {
                previewRatioRef.current = null;
                setPreviewRatio(null);
                void seekToRatio(ratio);
              }}
              fillColor={AppColors.accent}
              trackColor="#F2E8DC"
              thumbColor={AppColors.accent}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(displayedPositionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMillis)}</Text>
          </View>
          <View style={styles.transportRow}>
            <Pressable
              style={[styles.transportButton, !today.audioUrl && styles.playButtonDisabled]}
              onPress={() => void seekBy(-10000)}
              disabled={!today.audioUrl || audioBusy}
            >
              <Ionicons name="play-back" size={20} color={AppColors.maroon} />
              <Text style={styles.transportText}>10</Text>
            </Pressable>
            <Pressable
              style={[styles.playButton, !today.audioUrl && styles.playButtonDisabled]}
              onPress={() => void toggleTodayPlayback()}
              disabled={!today.audioUrl || audioBusy}
            >
              {audioBusy ? (
                <ActivityIndicator color="#FFF5E4" />
              ) : (
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF5E4" />
              )}
            </Pressable>
            <Pressable
              style={[styles.transportButton, !today.audioUrl && styles.playButtonDisabled]}
              onPress={() => void seekBy(10000)}
              disabled={!today.audioUrl || audioBusy}
            >
              <Ionicons name="play-forward" size={20} color={AppColors.maroon} />
              <Text style={styles.transportText}>10</Text>
            </Pressable>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {today.hasPlayableAudio ? `Language: ${today.language}` : tr("audio.browserPreview")}
            </Text>
            <Text style={styles.footerAction}>
              {today.hasPlayableAudio ? (isPlaying ? "Pause Audio" : tr("audio.tapToListen")) : tr("audio.openPrayer")}
            </Text>
          </View>
        </SectionCard>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{tr("audio.weeklySchedule")}</Text>
          <Text style={styles.link}>7 {tr("audio.tracks")}</Text>
        </View>

        {schedule.map((track) => (
          <Pressable
            key={track.day}
            style={styles.scheduleCard}
            onPress={() =>
              !hasPremiumAccess && track.isPremium
                ? navigation.navigate("Premium")
                : navigation.navigate("PrayerDetail", { prayerId: track.prayerId })
            }
          >
            <View style={styles.scheduleText}>
              <View style={styles.scheduleLabelRow}>
                <Text style={styles.scheduleDay}>{getLocalizedWeekday(appLanguage, track.day)}</Text>
                {track.isPremium ? <Text style={styles.premiumPill}>{tr("common.premium")}</Text> : null}
              </View>
              <Text style={styles.scheduleTitle}>{track.prayer}</Text>
              <Text style={styles.scheduleMeta}>
                {track.deity} · {track.meta}
              </Text>
            </View>
            <View style={styles.scheduleIcon}>
              <Ionicons name="headset-outline" size={22} color={AppColors.accent} />
            </View>
          </Pressable>
        ))}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{tr("audio.library")}</Text>
          <Text style={styles.link}>
            {library.length} {tr("audio.tracks")}
          </Text>
        </View>

        {visibleLibrary.map((track) => (
          <Pressable
            key={`${track.prayerId}-${track.language}`}
            style={styles.scheduleCard}
            onPress={() =>
              !hasPremiumAccess && track.isPremium
                ? navigation.navigate("Premium")
                : navigation.navigate("PrayerDetail", { prayerId: track.prayerId })
            }
          >
            <View style={styles.scheduleText}>
              <View style={styles.scheduleLabelRow}>
                <Text style={styles.scheduleDay}>{track.language.toUpperCase()}</Text>
                {track.isPremium ? <Text style={styles.premiumPill}>{tr("common.premium")}</Text> : null}
              </View>
              <Text style={styles.scheduleTitle}>{track.prayer}</Text>
              <Text style={styles.scheduleMeta}>
                {track.deity} · {track.meta}
              </Text>
            </View>
            <View style={styles.scheduleIcon}>
              <Ionicons
                name={track.hasPlayableAudio ? "play-circle-outline" : "headset-outline"}
                size={24}
                color={AppColors.accent}
              />
            </View>
          </Pressable>
        ))}

        {showPremiumTeaser ? (
          <SectionCard>
            <View style={styles.premiumHeaderRow}>
              <View style={styles.premiumIconWrap}>
                <Ionicons name="lock-closed" size={16} color="#FFF5E4" />
              </View>
              <Text style={styles.premiumTitle}>{tr("audio.lockedTitle")}</Text>
            </View>
            <Text style={styles.premiumBody}>
              {hiddenLibraryCount > 0
                ? `${tr("audio.lockedBody")} ${hiddenLibraryCount} ${tr("audio.tracks")}.`
                : tr("audio.teaserBody")}
            </Text>
            <Pressable style={styles.premiumButton} onPress={() => navigation.navigate("Premium")}>
              <Text style={styles.premiumButtonText}>{tr("audio.explorePremium")}</Text>
            </Pressable>
          </SectionCard>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headsetWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    backgroundColor: "rgba(255,245,228,0.08)",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  link: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  todayLabel: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  todayTitle: {
    color: AppColors.textPrimary,
    fontSize: 32,
    fontWeight: "700",
    marginTop: 10,
  },
  todayMeta: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  playerRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  footerAction: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  premiumHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  premiumIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  premiumBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  premiumButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumButtonText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleText: {
    flex: 1,
    paddingRight: 12,
  },
  scheduleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  scheduleDay: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  premiumPill: {
    overflow: "hidden",
    color: "#FFF5E4",
    backgroundColor: AppColors.maroon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "800",
  },
  scheduleTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  scheduleMeta: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  scheduleIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FAF0E7",
    alignItems: "center",
    justifyContent: "center",
  },
});
