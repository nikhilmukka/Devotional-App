import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, Volume2 } from 'lucide-react';
import type { Deity, Prayer } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { deities, getPrayerById } from '../data/prayers';
import { formatAudioDuration, getWeekdayLabel, t } from '../i18n';
import { getLocalizedDeity, getLocalizedPrayerTitle } from '../contentLocalization';

interface AudioPrayerTrackLike {
  id: string;
  prayerId: string;
  weekday: number;
  title: string;
  accent: string;
  durationMinutes: number;
  previewText: string;
  chantKey?: string;
  metaLabel?: string;
}

interface AudioPrayerPlayerProps {
  track: AudioPrayerTrackLike;
  compact?: boolean;
  prayerOverride?: Prayer;
  deityOverride?: Deity;
}

export function AudioPrayerPlayer({
  track,
  compact = false,
  prayerOverride,
  deityOverride,
}: AudioPrayerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { preferences } = useApp();
  const tr = (key: string) => t(preferences.language, key);
  const prayer = prayerOverride || getPrayerById(track.prayerId);
  const deity = deityOverride || (prayer ? deities.find((item) => item.id === prayer.deityId) : undefined);
  const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
  const localizedTitle = prayer ? getLocalizedPrayerTitle(prayer, preferences.language) : track.title;
  const weekdayLabel = getWeekdayLabel(preferences.language, track.weekday);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  };

  const startPlayback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `${weekdayLabel}. ${localizedTitle}. ${track.previewText}`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'hi-IN';
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  };

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: compact ? `${track.accent}10` : '#FFFFFF',
        border: `1.5px solid ${track.accent}${compact ? '25' : '18'}`,
        boxShadow: compact ? 'none' : `0 6px 18px ${track.accent}12`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              color: track.accent,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {weekdayLabel} {tr('audio.trackLabel')}
          </p>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: compact ? '20px' : '24px',
              fontWeight: 600,
              color: '#2D1B00',
              lineHeight: 1.15,
              marginTop: '3px',
            }}
          >
            {localizedTitle}
          </h3>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              color: '#7B6A56',
              marginTop: '4px',
            }}
            >
            {localizedDeity?.name || tr('home.devotee')} ·{' '}
            {formatAudioDuration(preferences.language, track.durationMinutes)} ·{' '}
            {track.metaLabel || (track.chantKey ? tr(track.chantKey) : tr('audio.trackLabel'))}
          </p>
        </div>

        <button
          onClick={togglePlayback}
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: '48px',
            height: '48px',
            background: `linear-gradient(135deg, ${track.accent} 0%, #FF8C42 100%)`,
            color: '#FFF5E4',
            boxShadow: `0 8px 18px ${track.accent}33`,
          }}
        >
          {isPlaying ? <Pause size={20} strokeWidth={2.2} /> : <Play size={20} strokeWidth={2.2} />}
        </button>
      </div>

      <div className="mt-4">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: `${track.accent}12` }}
        >
          <motion.div
            animate={{ width: isPlaying ? ['14%', '62%', '96%'] : '14%' }}
            transition={isPlaying ? { duration: 5, repeat: Infinity } : { duration: 0.25 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${track.accent} 0%, #FF8C42 100%)` }}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Volume2 size={14} color={track.accent} strokeWidth={2} />
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                color: '#7B6A56',
              }}
            >
              {tr('audio.browserPreview')}
            </p>
          </div>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: track.accent,
            }}
          >
            {isPlaying ? tr('audio.playing') : tr('audio.tapToListen')}
          </span>
        </div>
      </div>
    </div>
  );
}
