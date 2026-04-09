import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react';
import { PrayerCard } from '../components/PrayerCard';
import { festivals as fallbackFestivals, isCurrent, isUpcoming, type Festival } from '../data/festivals';
import { prayers as fallbackPrayers, deities as fallbackDeities, type Prayer, type Deity } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { getLocalizedFestival } from '../contentLocalization';
import { t } from '../i18n';
import { fetchWebPrayerCatalog } from '../lib/webContent';

export function FestivalPrayerListScreen() {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const { preferences } = useApp();
  const [displayFestivals, setDisplayFestivals] = useState<Festival[]>(fallbackFestivals);
  const [displayPrayers, setDisplayPrayers] = useState<Prayer[]>(fallbackPrayers);
  const [displayDeities, setDisplayDeities] = useState<Deity[]>(fallbackDeities);
  const festival = displayFestivals.find((item) => item.id === (festivalId || ''));
  const prayers = useMemo(
    () => displayPrayers.filter((prayer) => festival?.prayerIds.includes(prayer.id)),
    [displayPrayers, festival]
  );
  const current = festival ? isCurrent(festival) : false;
  const upcoming = festival ? isUpcoming(festival) : false;
  const localizedFestival = festival ? getLocalizedFestival(festival, preferences.language) : undefined;
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setDisplayFestivals(catalog.festivals.length > 0 ? catalog.festivals : fallbackFestivals);
        setDisplayPrayers(catalog.prayers.length > 0 ? catalog.prayers : fallbackPrayers);
        setDisplayDeities(catalog.deities.length > 0 ? catalog.deities : fallbackDeities);
      })
      .catch(() => {
        if (!isMounted) return;
        setDisplayFestivals(fallbackFestivals);
        setDisplayPrayers(fallbackPrayers);
        setDisplayDeities(fallbackDeities);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  if (!festival) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{ background: '#FFF5E4' }}
      >
        <span style={{ fontSize: '48px' }}>🔍</span>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#9B8B7A' }}>{tr('festivals.notFound')}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            color: '#FF8C42',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {tr('festivals.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Festival header */}
      <div
        className="relative shrink-0 px-5 pt-12 pb-8"
        style={{
          background: `linear-gradient(150deg, ${festival.color2} 0%, ${festival.color1} 100%)`,
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute top-5 right-5 rounded-full opacity-15"
          style={{ width: '90px', height: '90px', border: '1.5px solid rgba(255,255,255,0.7)' }}
        />
        <div
          className="absolute top-10 right-10 rounded-full opacity-15"
          style={{ width: '52px', height: '52px', border: '1px solid rgba(255,255,255,0.7)' }}
        />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 relative z-10"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500 }}>
            {tr('common.festivals')}
          </span>
        </button>

        {/* Festival info */}
        <div className="flex items-start gap-4 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center rounded-3xl shrink-0"
            style={{
              width: '76px',
              height: '76px',
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.35)',
              fontSize: '36px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {festival.symbol}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {localizedFestival?.name || festival.name}
              </h1>
              {current && (
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,140,66,0.3)',
                    color: '#FFD9B0',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    border: '1px solid rgba(255,140,66,0.4)',
                  }}
                >
                  {tr('common.thisMonth').toUpperCase()}
                </span>
              )}
              {!current && upcoming && (
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  {tr('common.upcoming').toUpperCase()}
                </span>
              )}
            </div>

            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              {localizedFestival?.nativeName || festival.nameHindi} · {localizedFestival?.description || festival.description}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <CalendarDays size={11} color="rgba(255,255,255,0.8)" />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                  }}
                >
                  {festival.dateInfo}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                  }}
                >
                  {prayers.length} {tr('common.prayers')}
                </span>
              </div>
              <button
                onClick={() => navigate(`/festival-guide/${festival.id}`)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <BookOpen size={11} color="rgba(255,255,255,0.8)" />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                  }}
                >
                  View Guide
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer list */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-10" style={{ scrollbarWidth: 'none' }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#2D1B00',
            marginBottom: '14px',
          }}
        >
          {tr('common.prayers')} - {localizedFestival?.name || festival.name}
        </h2>

        {prayers.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span style={{ fontSize: '40px' }}>🙏</span>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: '#9B8B7A' }}>
              {tr('common.noPrayersFound')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {prayers.map((prayer, i) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <PrayerCard
                  prayer={prayer}
                  showDeity
                  deityOverride={displayDeities.find((deity) => deity.id === prayer.deityId)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Festival description card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="rounded-3xl p-4 mt-5"
          style={{
            background: `${festival.color1}0D`,
            border: `1.5px solid ${festival.color1}25`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '16px' }}>{festival.symbol}</span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: festival.color1,
                letterSpacing: '0.5px',
              }}
            >
              {tr('festivals.aboutThisFestival')}
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '15px',
              color: '#4A2C0A',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            {localizedFestival?.description || festival.description} — {tr('festivals.celebratedDuring')}{' '}
            {festival.dateInfo}. {tr('festivals.blessingMessage')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
