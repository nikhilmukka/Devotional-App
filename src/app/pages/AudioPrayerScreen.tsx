import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Headphones, ChevronRight, Lock } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { AudioPrayerPlayer } from '../components/AudioPrayerPlayer';
import { PremiumTeaserCard } from '../components/PremiumTeaserCard';
import { audioPrayerTracks, getTodayAudioPrayer } from '../data/audioPrayers';
import { deities, getPrayerById, type Prayer } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { formatAudioDuration, getWeekdayLabel, t } from '../i18n';
import { getLocalizedDeity, getLocalizedPrayerTitle } from '../contentLocalization';
import { fetchWebPrayerCatalog, type WebAudioTrack } from '../lib/webContent';

export function AudioPrayerScreen() {
  const navigate = useNavigate();
  const { preferences, hasPremiumAccess } = useApp();
  const [liveTracks, setLiveTracks] = useState<(WebAudioTrack & { weekday: number })[]>([]);
  const [livePrayers, setLivePrayers] = useState<Prayer[]>([]);
  const fallbackTodayTrack = getTodayAudioPrayer();
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setLivePrayers(catalog.prayers);
        setLiveTracks(
          catalog.audioTracks.map((track, index) => ({
            ...track,
            weekday: index % 7,
          }))
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setLivePrayers([]);
        setLiveTracks([]);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  const weeklyTracks = useMemo(() => {
    return audioPrayerTracks.map((fallbackTrack) => {
      const liveMatch = liveTracks.find((track) => track.prayerId === fallbackTrack.prayerId);
      if (!liveMatch) return fallbackTrack;

      return {
        ...liveMatch,
        weekday: fallbackTrack.weekday,
        accent: liveMatch.accent || fallbackTrack.accent,
        durationMinutes: liveMatch.durationMinutes || fallbackTrack.durationMinutes,
      };
    });
  }, [liveTracks]);

  const uploadedLibraryTracks = useMemo(() => {
    const scheduledPrayerIds = new Set(audioPrayerTracks.map((track) => track.prayerId));
    return liveTracks.filter((track) => !scheduledPrayerIds.has(track.prayerId));
  }, [liveTracks]);

  const todayTrack = useMemo(() => {
    return weeklyTracks.find((track) => track.prayerId === fallbackTodayTrack.prayerId) || weeklyTracks[0];
  }, [fallbackTodayTrack.prayerId, weeklyTracks]);
  const isTodayTrackLocked = !!todayTrack?.isPremium && !hasPremiumAccess;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      <div
        className="shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFF5E4',
              }}
            >
              {tr('audio.title')}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.6)',
                marginTop: '3px',
              }}
            >
              {tr('audio.subtitle')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,245,228,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <Headphones size={20} color="#D4AF37" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#2D1B00',
              }}
            >
              {tr('audio.today')}
            </h2>
            <button
              onClick={() =>
                navigate(
                  isTodayTrackLocked ? '/premium' : `/prayer/${todayTrack?.prayerId || fallbackTodayTrack.prayerId}`
                )
              }
              className="flex items-center gap-1"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: todayTrack?.accent || fallbackTodayTrack.accent,
                fontWeight: 600,
              }}
            >
              {tr('common.openPrayer')} <ChevronRight size={14} />
            </button>
          </div>
          {todayTrack ? (
            <AudioPrayerPlayer
              track={todayTrack}
              prayerOverride={livePrayers.find((prayer) => prayer.id === todayTrack.prayerId)}
              deityOverride={todayTrack.deity}
            />
          ) : (
            <AudioPrayerPlayer track={getTodayAudioPrayer()} />
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              fontWeight: 600,
              color: '#2D1B00',
            }}
          >
              {tr('audio.weeklySchedule')}
            </h2>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#FF8C42',
            }}
          >
            7 {tr('common.tracks')}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {weeklyTracks.map((track, index) => (
            (() => {
              const prayer = livePrayers.find((item) => item.id === track.prayerId) || getPrayerById(track.prayerId);
              const deity =
                'deity' in track && track.deity
                  ? track.deity
                  : prayer
                    ? deities.find((item) => item.id === prayer.deityId)
                    : undefined;
              const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
              const localizedTitle = prayer ? getLocalizedPrayerTitle(prayer, preferences.language) : track.title;
              const isTrackLocked = !!track.isPremium && !hasPremiumAccess;

              return (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => navigate(isTrackLocked ? '/premium' : `/prayer/${track.prayerId}`)}
                  className="w-full rounded-3xl p-4 text-left"
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${track.accent}22`,
                    boxShadow: `0 4px 16px ${track.accent}10`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '11px',
                          fontWeight: 700,
                          color: track.accent,
                          letterSpacing: '0.9px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {getWeekdayLabel(preferences.language, track.weekday)}
                      </p>
                      {track.isPremium ? (
                        <div className="mt-1">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{
                              background: '#7A1E1E15',
                              color: '#7A1E1E',
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: '10px',
                              fontWeight: 600,
                            }}
                          >
                            <Lock size={10} />
                            Premium
                          </span>
                        </div>
                      ) : null}
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '22px',
                          fontWeight: 600,
                          color: '#2D1B00',
                          marginTop: '4px',
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
                        {'metaLabel' in track && track.metaLabel
                          ? track.metaLabel
                          : ('chantKey' in track && track.chantKey ? tr(track.chantKey) : tr('audio.trackLabel'))}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center rounded-2xl shrink-0"
                      style={{
                        width: '46px',
                        height: '46px',
                        background: `${track.accent}14`,
                        color: track.accent,
                      }}
                    >
                      {isTrackLocked ? <Lock size={20} strokeWidth={2} /> : <Headphones size={20} strokeWidth={2} />}
                    </div>
                  </div>
                </motion.button>
              );
            })()
          ))}
        </div>

        {!hasPremiumAccess ? (
          <div className="mt-6">
            <PremiumTeaserCard
              eyebrow={tr('common.premium')}
              title={tr('audio.lockedTitle')}
              body={tr('audio.lockedBody')}
              icon={<Lock size={22} strokeWidth={1.8} />}
              ctaLabel={tr('common.unlockPremium')}
              onClick={() => navigate('/premium')}
            />
          </div>
        ) : null}

        {uploadedLibraryTracks.length > 0 ? (
          <>
            <div className="flex items-center justify-between mt-6 mb-3">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('audio.library')}
              </h2>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FF8C42',
                }}
              >
                {uploadedLibraryTracks.length} {tr('common.tracks')}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {uploadedLibraryTracks.map((track, index) => {
                const prayer = livePrayers.find((item) => item.id === track.prayerId) || getPrayerById(track.prayerId);
                const deity =
                  track.deity || (prayer ? deities.find((item) => item.id === prayer.deityId) : undefined);
                const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
                const localizedTitle = prayer ? getLocalizedPrayerTitle(prayer, preferences.language) : track.title;
                const isTrackLocked = !!track.isPremium && !hasPremiumAccess;

                return (
                  <motion.button
                    key={`${track.id}-library`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    onClick={() => navigate(isTrackLocked ? '/premium' : `/prayer/${track.prayerId}`)}
                    className="w-full rounded-3xl p-4 text-left"
                    style={{
                      background: '#FFFFFF',
                      border: `1.5px solid ${track.accent}22`,
                      boxShadow: `0 4px 16px ${track.accent}10`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '11px',
                            fontWeight: 700,
                            color: track.accent,
                            letterSpacing: '0.9px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tr('audio.trackLabel')}
                        </p>
                        {track.isPremium ? (
                          <div className="mt-1">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                              style={{
                                background: '#7A1E1E15',
                                color: '#7A1E1E',
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: '10px',
                                fontWeight: 600,
                              }}
                            >
                              <Lock size={10} />
                              Premium
                            </span>
                          </div>
                        ) : null}
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '22px',
                            fontWeight: 600,
                            color: '#2D1B00',
                            marginTop: '4px',
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
                          {track.metaLabel || tr('audio.trackLabel')}
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center rounded-2xl shrink-0"
                        style={{
                          width: '46px',
                          height: '46px',
                          background: `${track.accent}14`,
                          color: track.accent,
                        }}
                      >
                        {isTrackLocked ? <Lock size={20} strokeWidth={2} /> : <Headphones size={20} strokeWidth={2} />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <BottomNavBar />
    </div>
  );
}
