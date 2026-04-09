import { getPrayerById, type Prayer } from './prayers';

export interface AudioPrayerTrack {
  id: string;
  prayerId: string;
  weekday: number;
  title: string;
  accent: string;
  durationMinutes: number;
  chantKey:
    | 'audio.chants12'
    | 'audio.japam108'
    | 'audio.verses40'
    | 'audio.morningAarti'
    | 'audio.prosperityChant'
    | 'audio.eveningAarti'
    | 'audio.mahaMantra';
  previewText: string;
}

const trackConfigs = [
  { prayerId: 'surya-namaskar-mantra', accent: '#F57F17', durationMinutes: 4, chantKey: 'audio.chants12' as const },
  { prayerId: 'mahamrityunjaya', accent: '#5C6BC0', durationMinutes: 6, chantKey: 'audio.japam108' as const },
  { prayerId: 'hanuman-chalisa', accent: '#E64A19', durationMinutes: 8, chantKey: 'audio.verses40' as const },
  { prayerId: 'ganesh-aarti', accent: '#FF8C42', durationMinutes: 5, chantKey: 'audio.morningAarti' as const },
  { prayerId: 'sri-suktam', accent: '#D4AF37', durationMinutes: 7, chantKey: 'audio.prosperityChant' as const },
  { prayerId: 'durga-aarti', accent: '#C0392B', durationMinutes: 5, chantKey: 'audio.eveningAarti' as const },
  { prayerId: 'hare-krishna', accent: '#7B1FA2', durationMinutes: 9, chantKey: 'audio.mahaMantra' as const },
];

function buildPreviewText(prayer: Prayer): string {
  const firstContent = prayer.content[0];
  const verses = firstContent?.verses
    .filter((verse) => verse.type === 'verse' || verse.type === 'refrain')
    .slice(0, 2)
    .map((verse) => verse.text.replace(/\n/g, ' '))
    .join(' ');

  return verses || `${prayer.title}. A devotional audio experience for daily prayer.`;
}

export const audioPrayerTracks: AudioPrayerTrack[] = trackConfigs.map((config, weekday) => {
  const prayer = getPrayerById(config.prayerId);
  if (!prayer) {
    throw new Error(`Missing prayer for audio track: ${config.prayerId}`);
  }

  return {
    id: `audio-${weekday}`,
    prayerId: prayer.id,
    weekday,
    title: prayer.title,
    accent: config.accent,
    durationMinutes: config.durationMinutes,
    chantKey: config.chantKey,
    previewText: buildPreviewText(prayer),
  };
});

export const getTodayAudioPrayer = (): AudioPrayerTrack => {
  const weekday = new Date().getDay();
  return audioPrayerTracks[weekday];
};

export const getAudioPrayerForPrayerId = (
  prayerId: string
): AudioPrayerTrack | undefined => audioPrayerTracks.find((track) => track.prayerId === prayerId);
