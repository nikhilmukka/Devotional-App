import { Audio } from "expo-av";

export type RecordingStartResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestMicrophoneAccess(): Promise<RecordingStartResult> {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      error: "Microphone permission is needed to record your own recitation.",
    };
  }

  return { ok: true };
}

export async function prepareAudioForRecording() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export async function prepareAudioForPlayback() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export function formatAudioDuration(seconds: number | null | undefined) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
