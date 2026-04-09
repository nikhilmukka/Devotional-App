import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { FeedbackModal } from "../components/FeedbackModal";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import {
  deleteNotebookRecording,
  deleteUserNotebookEntry,
  fetchUserNotebook,
  upsertUserNotebookEntry,
  uploadNotebookRecording,
  type NotebookEntry,
} from "../lib/supabase/notebook";
import { getPrayerSourceLabel, t } from "../i18n";
import {
  formatAudioDuration,
  prepareAudioForPlayback,
  prepareAudioForRecording,
  requestMicrophoneAccess,
} from "../lib/recitations";
import { AppColors } from "../theme/colors";

const notebookLanguageOptions = ["Hindi", "Telugu", "Kannada", "Tamil", "Marathi", "Sanskrit"];
const scriptOptions: Array<"native" | "latin"> = ["native", "latin"];

function isNotebookSetupError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
        ? error.message.toLowerCase()
        : "";

  return [
    "user_private_shlokas",
    "user-recitations",
    "recording_storage_path",
    "recording_duration_seconds",
    "recording_uploaded_at",
    "storage",
    "bucket",
    "row-level security",
    "permission denied",
  ].some((pattern) => message.includes(pattern));
}

export function ShlokaNotebookScreen({ navigation }: { navigation: any }) {
  const { user, appLanguage, hasPremiumAccess } = useApp();
  const tr = (path: string) => t(appLanguage, path);
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingEntryId, setRecordingEntryId] = useState<string | null>(null);
  const [playingEntryId, setPlayingEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Hindi");
  const [script, setScript] = useState<"native" | "latin">("native");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [errorText, setErrorText] = useState("");
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const resetComposer = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setSourceLanguage("Hindi");
    setScript("native");
    setBody("");
    setNotes("");
    setIsPinned(false);
    setComposerOpen(false);
  }, []);

  const loadNotebook = useCallback(async () => {
    if (!user?.id || user.isGuest || !hasPremiumAccess) return;

    setLoading(true);
    setErrorText("");
    try {
      const nextEntries = await fetchUserNotebook(user.id);
      setEntries(nextEntries);
    } catch (error) {
      setErrorText(isNotebookSetupError(error) ? tr("notebook.setupError") : tr("notebook.loadError"));
    } finally {
      setLoading(false);
    }
  }, [appLanguage, hasPremiumAccess, user?.id, user?.isGuest]);

  useEffect(() => {
    void loadNotebook();
  }, [loadNotebook]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      }
      if (soundRef.current) {
        void soundRef.current.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const startEdit = (entry: NotebookEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setSourceLanguage(getPrayerSourceLabel(entry.sourceLanguage));
    setScript(entry.script);
    setBody(entry.body);
    setNotes(entry.notes);
    setIsPinned(entry.isPinned);
    setComposerOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id || user.isGuest || !hasPremiumAccess) return;
    if (!title.trim() || !body.trim()) {
      setErrorText(tr("notebook.loadError"));
      return;
    }

    setSaving(true);
    setErrorText("");
    try {
      await upsertUserNotebookEntry(user.id, {
        title,
        sourceLanguage,
        script,
        body,
        notes,
        isPinned,
      }, editingId);
      await loadNotebook();
      setNotice({
        title: editingId ? tr("notebook.update") : tr("notebook.save"),
        message: tr("notebook.saved"),
      });
      resetComposer();
    } catch (error) {
      setErrorText(isNotebookSetupError(error) ? tr("notebook.setupError") : tr("notebook.loadError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: NotebookEntry) => {
    if (!user?.id || user.isGuest) return;

    Alert.alert(
      tr("notebook.delete"),
      entry.title,
      [
        { text: tr("notebook.cancel"), style: "cancel" },
        {
          text: tr("notebook.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserNotebookEntry(user.id!, entry.id);
              await loadNotebook();
              setNotice({
                title: tr("notebook.delete"),
                message: tr("notebook.deleted"),
              });
              if (editingId === entry.id) {
                resetComposer();
              }
            } catch (error) {
              setErrorText(isNotebookSetupError(error) ? tr("notebook.setupError") : tr("notebook.loadError"));
            }
          },
        },
      ]
    );
  };

  const lockedBody = user?.isGuest ? tr("notebook.guestBody") : tr("notebook.lockedBody");

  const stopActivePlayback = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    } catch {
      // ignore cleanup issues
    } finally {
      soundRef.current = null;
      setPlayingEntryId(null);
    }
  }, []);

  const startRecordingForEntry = async (entry: NotebookEntry) => {
    if (!user?.id) return;

    const permission = await requestMicrophoneAccess();
    if (!permission.ok) {
      setErrorText(tr("notebook.microphonePermission"));
      return;
    }

    await stopActivePlayback();
    await prepareAudioForRecording();

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setRecordingEntryId(entry.id);
      setErrorText("");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : tr("notebook.loadError"));
      setRecordingEntryId(null);
    }
  };

  const stopRecordingForEntry = async (entry: NotebookEntry) => {
    if (!user?.id || !recordingRef.current) return;

    try {
      const recording = recordingRef.current;
      await recording.stopAndUnloadAsync();
      const status = await recording.getStatusAsync();
      const localUri = recording.getURI();
      recordingRef.current = null;
      setRecordingEntryId(null);
      await prepareAudioForPlayback();

      if (!localUri) {
        throw new Error(tr("notebook.loadError"));
      }

      await uploadNotebookRecording(
        user.id,
        entry.id,
        localUri,
        Math.max(1, Math.round((status.durationMillis ?? 0) / 1000)),
        entry.recordingStoragePath
      );
      await loadNotebook();
      setNotice({
        title: tr("notebook.stopRecording"),
        message: tr("notebook.recordingSaved"),
      });
    } catch (error) {
      setErrorText(isNotebookSetupError(error) ? tr("notebook.recitationSetupError") : tr("notebook.loadError"));
      setRecordingEntryId(null);
      await prepareAudioForPlayback();
    }
  };

  const togglePlaybackForEntry = async (entry: NotebookEntry) => {
    if (!entry.recordingUrl) return;

    if (playingEntryId === entry.id) {
      await stopActivePlayback();
      return;
    }

    await stopActivePlayback();
    await prepareAudioForPlayback();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: entry.recordingUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setPlayingEntryId(null);
            if (soundRef.current) {
              void soundRef.current.unloadAsync().catch(() => undefined);
              soundRef.current = null;
            }
          }
        }
      );
      soundRef.current = sound;
      setPlayingEntryId(entry.id);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : tr("notebook.loadError"));
      setPlayingEntryId(null);
    }
  };

  const handleDeleteRecording = (entry: NotebookEntry) => {
    if (!user?.id) return;

    Alert.alert(
      tr("notebook.deleteRecording"),
      entry.title,
      [
        { text: tr("notebook.cancel"), style: "cancel" },
        {
          text: tr("notebook.deleteRecording"),
          style: "destructive",
          onPress: async () => {
            try {
              await stopActivePlayback();
              await deleteNotebookRecording(user.id!, entry.id, entry.recordingStoragePath);
              await loadNotebook();
              setNotice({
                title: tr("notebook.deleteRecording"),
                message: tr("notebook.recordingDeleted"),
              });
            } catch (error) {
              setErrorText(isNotebookSetupError(error) ? tr("notebook.recitationSetupError") : tr("notebook.loadError"));
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("notebook.title")}
        subtitle={tr("notebook.subtitle")}
        rightSlot={
          <View style={styles.headerBadge}>
            <Ionicons name="book-outline" size={20} color={AppColors.gold} />
          </View>
        }
      />

      <View style={styles.content}>
        {!hasPremiumAccess ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("notebook.lockedTitle")}</Text>
            <Text style={styles.sectionBody}>{lockedBody}</Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Premium")}>
              <Text style={styles.primaryButtonText}>{tr("notebook.openPremium")}</Text>
            </Pressable>
          </SectionCard>
        ) : (
          <>
            <SectionCard>
              <View style={styles.rowBetween}>
                <View style={styles.flexText}>
                  <Text style={styles.sectionTitle}>{composerOpen ? tr("notebook.edit") : tr("notebook.add")}</Text>
                  <Text style={styles.sectionBody}>{tr("notebook.subtitle")}</Text>
                </View>
                {!composerOpen ? (
                  <Pressable style={styles.secondaryButton} onPress={() => setComposerOpen(true)}>
                    <Ionicons name="add" size={16} color={AppColors.maroon} />
                    <Text style={styles.secondaryButtonText}>{tr("notebook.add")}</Text>
                  </Pressable>
                ) : null}
              </View>

              {composerOpen ? (
                <View style={styles.composer}>
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{tr("notebook.titleLabel")}</Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder={tr("notebook.titlePlaceholder")}
                      placeholderTextColor="#A48F7A"
                      style={styles.input}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>{tr("notebook.sourceLanguage")}</Text>
                  <View style={styles.chipsWrap}>
                    {notebookLanguageOptions.map((language) => {
                      const active = sourceLanguage === language;
                      return (
                        <Pressable
                          key={language}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => setSourceLanguage(language)}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {getPrayerSourceLabel(language)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, styles.spacedLabel]}>{tr("notebook.script")}</Text>
                  <View style={styles.chipsWrap}>
                    {scriptOptions.map((option) => {
                      const active = script === option;
                      return (
                        <Pressable
                          key={option}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => setScript(option)}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {option === "native" ? tr("notebook.native") : tr("notebook.latin")}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{tr("notebook.bodyLabel")}</Text>
                    <TextInput
                      value={body}
                      onChangeText={setBody}
                      placeholder={tr("notebook.bodyPlaceholder")}
                      placeholderTextColor="#A48F7A"
                      multiline
                      textAlignVertical="top"
                      style={[styles.input, styles.multilineInput]}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{tr("notebook.notesLabel")}</Text>
                    <TextInput
                      value={notes}
                      onChangeText={setNotes}
                      placeholder={tr("notebook.notesPlaceholder")}
                      placeholderTextColor="#A48F7A"
                      multiline
                      textAlignVertical="top"
                      style={[styles.input, styles.notesInput]}
                    />
                  </View>

                  <Pressable style={styles.pinRow} onPress={() => setIsPinned((current) => !current)}>
                    <View style={[styles.pinBox, isPinned && styles.pinBoxActive]}>
                      {isPinned ? <Ionicons name="checkmark" size={14} color="#FFF5E4" /> : null}
                    </View>
                    <Text style={styles.pinText}>{tr("notebook.pin")}</Text>
                  </Pressable>

                  {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

                  <View style={styles.actionRow}>
                    <Pressable style={styles.primaryButton} onPress={() => void handleSave()} disabled={saving}>
                      <Text style={styles.primaryButtonText}>
                        {saving ? tr("notebook.saving") : editingId ? tr("notebook.update") : tr("notebook.save")}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.outlineButton} onPress={resetComposer}>
                      <Text style={styles.outlineButtonText}>{tr("notebook.cancel")}</Text>
                    </Pressable>
                  </View>

                  {editingId ? (
                    <View style={styles.recordingComposerCard}>
                      <Text style={styles.fieldLabel}>{tr("notebook.record")}</Text>
                      <Text style={styles.recordingHint}>{tr("notebook.recordingBody")}</Text>
                      <Pressable
                        style={[
                          styles.recordingButton,
                          recordingEntryId === editingId && styles.recordingButtonActive,
                        ]}
                        onPress={() => {
                          const currentEntry = entries.find((entry) => entry.id === editingId);
                          if (!currentEntry) {
                            setErrorText(tr("notebook.recordingMissingEntry"));
                            return;
                          }

                          if (recordingEntryId === editingId) {
                            void stopRecordingForEntry(currentEntry);
                          } else {
                            void startRecordingForEntry(currentEntry);
                          }
                        }}
                      >
                        <Ionicons
                          name={recordingEntryId === editingId ? "stop-circle" : "mic-outline"}
                          size={18}
                          color="#FFF5E4"
                        />
                        <Text style={styles.recordingButtonText}>
                          {recordingEntryId === editingId ? tr("notebook.stopRecording") : tr("notebook.record")}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </SectionCard>

            {loading ? (
              <SectionCard>
                <Text style={styles.sectionBody}>{tr("notebook.loading")}</Text>
              </SectionCard>
            ) : errorText ? (
              <SectionCard>
                <Text style={styles.errorText}>{errorText}</Text>
              </SectionCard>
            ) : entries.length === 0 ? (
              <SectionCard>
                <Text style={styles.sectionTitle}>{tr("notebook.emptyTitle")}</Text>
                <Text style={styles.sectionBody}>{tr("notebook.emptyBody")}</Text>
              </SectionCard>
            ) : (
              entries.map((entry) => (
                <SectionCard key={entry.id}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flexText}>
                      <View style={styles.entryTitleRow}>
                        <Text style={styles.entryTitle}>{entry.title}</Text>
                        {entry.isPinned ? (
                          <View style={styles.pinnedPill}>
                            <Ionicons name="bookmark" size={12} color="#FFF5E4" />
                            <Text style={styles.pinnedPillText}>{tr("notebook.pinned")}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.entryMeta}>
                        {getPrayerSourceLabel(entry.sourceLanguage)} · {entry.script === "native" ? tr("notebook.native") : tr("notebook.latin")}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <Pressable style={styles.iconButton} onPress={() => startEdit(entry)}>
                        <Ionicons name="create-outline" size={18} color={AppColors.maroon} />
                      </Pressable>
                      <Pressable style={styles.iconButton} onPress={() => handleDelete(entry)}>
                        <Ionicons name="trash-outline" size={18} color={AppColors.maroon} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.entryBody} numberOfLines={4}>
                    {entry.body}
                  </Text>
                  {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
                  <View style={styles.recordingCard}>
                    <View style={styles.recordingInfo}>
                      <Text style={styles.recordingTitle}>{tr("notebook.record")}</Text>
                      <Text style={styles.recordingMeta}>
                        {entry.recordingDurationSeconds
                          ? formatAudioDuration(entry.recordingDurationSeconds)
                          : tr("notebook.recordingBody")}
                      </Text>
                    </View>
                    <View style={styles.recordingActions}>
                      <Pressable
                        style={[
                          styles.recordingIconButton,
                          recordingEntryId === entry.id && styles.recordingIconButtonActive,
                        ]}
                        onPress={() =>
                          recordingEntryId === entry.id
                            ? void stopRecordingForEntry(entry)
                            : void startRecordingForEntry(entry)
                        }
                      >
                        <Ionicons
                          name={recordingEntryId === entry.id ? "stop-circle" : "mic-outline"}
                          size={18}
                          color={recordingEntryId === entry.id ? "#FFF5E4" : AppColors.maroon}
                        />
                      </Pressable>
                      <Pressable
                        style={[
                          styles.recordingIconButton,
                          !entry.recordingUrl && styles.recordingIconButtonDisabled,
                          playingEntryId === entry.id && styles.recordingIconButtonActive,
                        ]}
                        disabled={!entry.recordingUrl}
                        onPress={() => void togglePlaybackForEntry(entry)}
                      >
                        <Ionicons
                          name={playingEntryId === entry.id ? "stop" : "play"}
                          size={18}
                          color={playingEntryId === entry.id ? "#FFF5E4" : AppColors.maroon}
                        />
                      </Pressable>
                      <Pressable
                        style={[
                          styles.recordingIconButton,
                          !entry.recordingStoragePath && styles.recordingIconButtonDisabled,
                        ]}
                        disabled={!entry.recordingStoragePath}
                        onPress={() => handleDeleteRecording(entry)}
                      >
                        <Ionicons name="trash-outline" size={18} color={AppColors.maroon} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.updatedText}>
                    Updated {new Date(entry.updatedAt).toLocaleDateString()}
                  </Text>
                </SectionCard>
              ))
            )}
          </>
        )}
      </View>

      <FeedbackModal
        visible={Boolean(notice)}
        title={notice?.title || tr("notebook.title")}
        message={notice?.message || ""}
        buttonLabel={tr("common.close")}
        onClose={() => setNotice(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBadge: {
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
    gap: 18,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  flexText: {
    flex: 1,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionBody: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  composer: {
    marginTop: 16,
    gap: 14,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  spacedLabel: {
    marginTop: 4,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 150,
  },
  notesInput: {
    minHeight: 96,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: AppColors.mutedChip,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  chipText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#FFF5E4",
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pinBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF5E4",
    alignItems: "center",
    justifyContent: "center",
  },
  pinBoxActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  pinText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  secondaryButtonText: {
    color: AppColors.maroon,
    fontSize: 13,
    fontWeight: "700",
  },
  outlineButton: {
    minWidth: 96,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  outlineButtonText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  entryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  entryTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  entryMeta: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  entryBody: {
    color: AppColors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  entryNotes: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    fontStyle: "italic",
  },
  updatedText: {
    color: AppColors.textSecondary,
    fontSize: 11,
    marginTop: 12,
  },
  pinnedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: AppColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pinnedPillText: {
    color: "#FFF5E4",
    fontSize: 11,
    fontWeight: "700",
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  recordingComposerCard: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    gap: 10,
  },
  recordingHint: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  recordingButton: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  recordingButtonActive: {
    backgroundColor: AppColors.maroon,
  },
  recordingButtonText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
  recordingCard: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  recordingMeta: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 8,
  },
  recordingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  recordingIconButtonActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  recordingIconButtonDisabled: {
    opacity: 0.45,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
});
