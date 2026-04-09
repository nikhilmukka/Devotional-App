import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { PrayerCard } from '../components/PrayerCard';
import { prayers as fallbackPrayers, deities as fallbackDeities, type Deity, type Prayer } from '../data/prayers';
import { t } from '../i18n';
import { fetchWebPrayerCatalog } from '../lib/webContent';

export function FavoritesScreen() {
  const { favorites, preferences } = useApp();
  const navigate = useNavigate();
  const [catalogPrayers, setCatalogPrayers] = useState<Prayer[]>(fallbackPrayers);
  const [catalogDeities, setCatalogDeities] = useState<Deity[]>(fallbackDeities);
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setCatalogPrayers(catalog.prayers.length > 0 ? catalog.prayers : fallbackPrayers);
        setCatalogDeities(catalog.deities.length > 0 ? catalog.deities : fallbackDeities);
      })
      .catch(() => {
        if (!isMounted) return;
        setCatalogPrayers(fallbackPrayers);
        setCatalogDeities(fallbackDeities);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  const savedPrayers = useMemo(
    () => catalogPrayers.filter((p) => favorites.includes(p.id)),
    [catalogPrayers, favorites]
  );

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Header */}
      <div
        className="shrink-0 px-5 pt-12 pb-6"
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
              {tr('favorites.title')}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.55)',
                marginTop: '2px',
              }}
            >
              {savedPrayers.length} {tr('common.prayers')} {tr('favorites.savedStat').toLowerCase()}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,140,66,0.2)',
              border: '1.5px solid rgba(255,140,66,0.4)',
            }}
          >
            <Heart size={22} fill="#FF8C42" color="#FF8C42" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        {savedPrayers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full gap-5 pt-12"
          >
            {/* Empty state illustration */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255,140,66,0.1)',
                border: '2px dashed rgba(255,140,66,0.3)',
              }}
            >
              <Heart size={40} color="rgba(255,140,66,0.4)" strokeWidth={1.5} />
            </div>

            <div className="text-center">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#4A2C0A',
                }}
              >
                {tr('favorites.emptyTitle')}
              </h2>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '13px',
                  color: '#9B8B7A',
                  marginTop: '8px',
                  lineHeight: 1.6,
                  textAlign: 'center',
                  maxWidth: '240px',
                }}
              >
                {tr('favorites.emptyMessage')}
              </p>
            </div>

            {/* Decorative lotus */}
            <div className="flex justify-center gap-2 mt-2 opacity-30">
              {['🌸', '🪷', '🌸'].map((e, i) => (
                <span key={i} style={{ fontSize: '22px' }}>
                  {e}
                </span>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/search')}
              className="px-8 py-3 rounded-2xl mt-2"
              style={{
                background: 'linear-gradient(135deg, #7A1E1E 0%, #FF8C42 100%)',
                color: '#FFF5E4',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(122,30,30,0.25)',
              }}
            >
              {tr('favorites.exploreButton')}
            </motion.button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: '#9B8B7A',
                marginBottom: '4px',
              }}
            >
              {tr('favorites.savedForDevotion')}
            </p>
            {savedPrayers.map((prayer, i) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <PrayerCard
                  prayer={prayer}
                  showDeity
                  deityOverride={catalogDeities.find((deity) => deity.id === prayer.deityId)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
}
