import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { PrayerCard } from '../components/PrayerCard';
import { getPrayersByDeity, getDeityById, type Deity } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { getLocalizedDeity } from '../contentLocalization';
import { t } from '../i18n';
import { fetchWebDeities } from '../lib/webContent';

export function PrayerListScreen() {
  const { deityId } = useParams<{ deityId: string }>();
  const navigate = useNavigate();
  const { preferences } = useApp();
  const [liveDeity, setLiveDeity] = useState<Deity | null>(null);
  const deity = liveDeity || getDeityById(deityId || '');
  const prayers = getPrayersByDeity(deityId || '');
  const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebDeities(preferences.language)
      .then((liveDeities) => {
        if (!isMounted) return;
        setLiveDeity(liveDeities.find((item) => item.id === (deityId || '')) || null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLiveDeity(null);
      });

    return () => {
      isMounted = false;
    };
  }, [deityId, preferences.language]);

  if (!deity) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#FFF5E4' }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#9B8B7A' }}>{tr('common.deityNotFound')}</p>
        <button onClick={() => navigate(-1)} style={{ color: '#FF8C42', marginTop: '12px', fontFamily: "'Poppins', sans-serif" }}>
          {tr('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Deity header */}
      <div
        className="relative shrink-0 px-5 pt-12 pb-8"
        style={{
          background: `linear-gradient(150deg, ${deity.color2} 0%, ${deity.color1} 100%)`,
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-6 right-6 rounded-full opacity-15"
          style={{ width: '80px', height: '80px', border: '1.5px solid rgba(255,255,255,0.6)' }}
        />
        <div
          className="absolute top-10 right-10 rounded-full opacity-15"
          style={{ width: '45px', height: '45px', border: '1px solid rgba(255,255,255,0.6)' }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 relative z-10"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500 }}>
            {tr('common.back')}
          </span>
        </button>

        {/* Deity info */}
        <div className="flex items-center gap-4 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center rounded-3xl"
            style={{
              width: '72px',
              height: '72px',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.35)',
              fontSize: '34px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            {deity.symbol}
          </motion.div>
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '30px',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              {localizedDeity?.name || deity.name}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.7)',
                marginTop: '2px',
              }}
            >
              {localizedDeity?.tagline || deity.tagline}
            </p>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mt-2"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                }}
              >
                {prayers.length} {tr('common.prayers')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer list */}
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'none' }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#2D1B00',
            marginBottom: '14px',
          }}
        >
          {tr('common.prayers')} - {localizedDeity?.name || deity.name}
        </h2>

        <div className="flex flex-col gap-3 pb-8">
          {prayers.length > 0 ? (
            prayers.map((prayer, i) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <PrayerCard prayer={prayer} />
              </motion.div>
            ))
          ) : (
            <div
              className="rounded-3xl p-5"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #F0E0C8',
                boxShadow: '0 2px 12px rgba(122,30,30,0.06)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '14px',
                  color: '#6F5A45',
                  lineHeight: 1.6,
                }}
              >
                {tr('common.prayers')} {tr('common.found').toLowerCase()}: 0. Content for this deity can now be added from the admin portal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
