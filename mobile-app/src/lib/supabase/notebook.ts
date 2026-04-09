import { getSupabaseClient } from "./client";
import { type UserPrivateShlokaRow, toDbLanguage, toUiLanguage } from "./types";

export type NotebookEntry = {
  id: string;
  title: string;
  sourceLanguage: string;
  script: "native" | "latin";
  body: string;
  notes: string;
  sortOrder: number;
  isPinned: boolean;
  recordingStoragePath: string | null;
  recordingDurationSeconds: number | null;
  recordingUploadedAt: string | null;
  recordingUrl: string | null;
  updatedAt: string;
};

type NotebookPayload = {
  title: string;
  sourceLanguage: string;
  script: "native" | "latin";
  body: string;
  notes?: string;
  sortOrder?: number;
  isPinned?: boolean;
};

function mapNotebookRow(row: UserPrivateShlokaRow): NotebookEntry {
  return {
    id: row.id,
    title: row.title,
    sourceLanguage: toUiLanguage(row.source_language),
    script: row.script,
    body: row.body_plain_text,
    notes: row.notes ?? "",
    sortOrder: row.sort_order,
    isPinned: row.is_pinned,
    recordingStoragePath: row.recording_storage_path,
    recordingDurationSeconds: row.recording_duration_seconds,
    recordingUploadedAt: row.recording_uploaded_at,
    recordingUrl: null,
    updatedAt: row.updated_at,
  };
}

export async function fetchUserNotebook(userId: string): Promise<NotebookEntry[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("user_private_shlokas")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("is_pinned", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const entries = ((data ?? []) as UserPrivateShlokaRow[]).map(mapNotebookRow);
  const recordingPaths = entries
    .map((entry) => entry.recordingStoragePath)
    .filter((path): path is string => Boolean(path));

  if (recordingPaths.length === 0) {
    return entries;
  }

  const { data: signedUrls, error: signedUrlError } = await client.storage
    .from("user-recitations")
    .createSignedUrls(recordingPaths, 3600);

  if (signedUrlError) {
    return entries;
  }

  const urlByPath = new Map(
    (signedUrls ?? [])
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path, item.signedUrl] as const)
  );

  return entries.map((entry) => ({
    ...entry,
    recordingUrl: entry.recordingStoragePath ? urlByPath.get(entry.recordingStoragePath) ?? null : null,
  }));
}

export async function upsertUserNotebookEntry(
  userId: string,
  payload: NotebookPayload,
  existingId?: string | null
) {
  const client = getSupabaseClient();
  const dbPayload = {
    user_id: userId,
    title: payload.title.trim(),
    source_language: toDbLanguage(payload.sourceLanguage),
    script: payload.script,
    body_plain_text: payload.body.trim(),
    notes: payload.notes?.trim() || null,
    sort_order: payload.sortOrder ?? 0,
    is_pinned: payload.isPinned ?? false,
    is_active: true,
  };

  const query = existingId
    ? client.from("user_private_shlokas").update(dbPayload).eq("id", existingId).eq("user_id", userId)
    : client.from("user_private_shlokas").insert(dbPayload);

  const { error } = await query;
  if (error) {
    throw error;
  }
}

export async function deleteUserNotebookEntry(userId: string, entryId: string) {
  const client = getSupabaseClient();
  const { error } = await client
    .from("user_private_shlokas")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function uploadNotebookRecording(
  userId: string,
  entryId: string,
  localUri: string,
  durationSeconds: number,
  previousStoragePath?: string | null
) {
  const client = getSupabaseClient();
  const recordingResponse = await fetch(localUri);
  const arrayBuffer = await recordingResponse.arrayBuffer();
  const storagePath = `${userId}/${entryId}/${Date.now()}.m4a`;

  const { error: uploadError } = await client.storage
    .from("user-recitations")
    .upload(storagePath, arrayBuffer, {
      contentType: "audio/x-m4a",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await client
    .from("user_private_shlokas")
    .update({
      recording_storage_path: storagePath,
      recording_duration_seconds: durationSeconds,
      recording_uploaded_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (updateError) {
    throw updateError;
  }

  if (previousStoragePath) {
    await client.storage.from("user-recitations").remove([previousStoragePath]);
  }
}

export async function deleteNotebookRecording(
  userId: string,
  entryId: string,
  storagePath?: string | null
) {
  const client = getSupabaseClient();

  const { error: updateError } = await client
    .from("user_private_shlokas")
    .update({
      recording_storage_path: null,
      recording_duration_seconds: null,
      recording_uploaded_at: null,
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (updateError) {
    throw updateError;
  }

  if (storagePath) {
    await client.storage.from("user-recitations").remove([storagePath]);
  }
}
