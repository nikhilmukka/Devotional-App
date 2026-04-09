import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { FestivalCard } from '../components/FestivalCard';
import { festivals as fallbackFestivals, isCurrent } from '../data/festivals';
import { useApp } from '../context/AppContext';
import { getLocalizedFestival } from '../contentLocalization';
import { t } from '../i18n';
import { fetchWebPrayerCatalog } from '../lib/webContent';

export function FestivalListScreen() {
  const navigate = useNavigate();
  const { preferences } = useApp();
  const [displayFestivals, setDisplayFestivals] = useState(fallbackFestivals);
  const upcoming = useMemo(
    () =>
      displayFestivals.filter((f) => {
        const m = new Date().getMonth() + 1;
        return f.months.some((fm) => ((fm - m + 12) % 12) <= 2);
      }),
    [displayFestivals]
  );
  const currentFestival = displayFestivals.find((f) => isCurrent(f));
  const localizedCurrentFestival =
    currentFestival ? getLocalizedFestival(currentFestival, preferences.language) : undefined;
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setDisplayFestivals(catalog.festivals.length > 0 ? catalog.festivals : fallbackFestivals);
      })
      .catch(() => {
        if (!isMounted) return;
        setDisplayFestivals(fallbackFestivals);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Header */}
      <div
        className="relative shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
        }}
      >
        {/* Decorative */}
        <div
          className="absolute top-6 right-6 rounded-full opacity-10"
          style={{ width: '90px', height: '90px', border: '1.5px solid #D4AF37' }}
        />
        <div
          className="absolute top-12 right-12 rounded-full opacity-10"
          style={{ width: '50px', height: '50px', border: '1px solid #D4AF37' }}
        />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500 }}>
            {tr('common.home')}
          </span>
        </button>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '30px',
            fontWeight: 700,
            color: '#FFF5E4',
            lineHeight: 1.1,
          }}
        >
          {tr('common.festivals')}
        </h1>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            color: 'rgba(255,245,228,0.55)',
            marginTop: '4px',
          }}
        >
          {displayFestivals.length} {tr('common.festivals')} · {displayFestivals.reduce((s, f) => s + f.prayerIds.length, 0)}{' '}
          {tr('common.prayers')}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>

        {/* Currently happening */}
        {currentFestival && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} color="#FF8C42" />
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FF8C42',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {tr('festivals.celebratingThisMonth')}
              </h2>
            </div>
            <button
              onClick={() => navigate(`/festival/${currentFestival.id}`)}
              className="w-full rounded-3xl p-5 text-left transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${currentFestival.color2} 0%, ${currentFestival.color1} 100%)`,
                boxShadow: `0 8px 28px ${currentFestival.color1}45`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-2xl shrink-0"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255,255,255,0.18)',
                    fontSize: '32px',
                  }}
                >
                  {currentFestival.symbol}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.65)',
                      fontWeight: 600,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                  {localizedCurrentFestival?.nativeName || currentFestival.nameHindi} · {currentFestival.dateInfo}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '26px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.2,
                    }}
                  >
                    {localizedCurrentFestival?.name || currentFestival.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.7)',
                      marginTop: '2px',
                    }}
                  >
                    {localizedCurrentFestival?.description || currentFestival.description}
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}
              >
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  {currentFestival.prayerIds.length} {tr('common.prayers')}
                </span>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#D4AF37',
                  }}
                >
                  {tr('festivals.viewAllPrayers')} →
                </span>
              </div>
            </button>
          </motion.div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && !currentFestival && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '20px',
                fontWeight: 600,
                color: '#2D1B00',
                marginBottom: '12px',
              }}
            >
              {tr('festivals.comingUpSoon')}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {upcoming.map((f) => (
                <FestivalCard key={f.id} festival={f} variant="scroll" />
              ))}
            </div>
          </motion.div>
        )}

        {/* All festivals */}
        <div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px',
              fontWeight: 600,
              color: '#2D1B00',
              marginBottom: '14px',
            }}
          >
            {tr('festivals.allFestivals')}
          </h2>
          <div className="flex flex-col gap-3">
            {displayFestivals.map((festival, i) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <FestivalCard festival={festival} variant="list" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
