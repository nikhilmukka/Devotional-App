import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { PrayerCard } from '../components/PrayerCard';
import { DeityCard } from '../components/DeityCard';
import { FestivalCard } from '../components/FestivalCard';
import { prayers as fallbackPrayers, deities as fallbackDeities, type Deity, type Prayer } from '../data/prayers';
import { festivals as fallbackFestivals, type Festival } from '../data/festivals';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { getLocalizedDeity, getLocalizedFestival, getLocalizedPrayerTitle, getLocalizedSubtitle } from '../contentLocalization';
import { fetchWebPrayerCatalog } from '../lib/webContent';

type SearchMode = 'prayer' | 'festival' | 'deity';

const searchModes: { value: SearchMode; label: string; placeholder: string }[] = [
  { value: 'prayer', label: 'Direct Prayer', placeholder: 'Search prayer directly' },
  { value: 'festival', label: 'By Festival', placeholder: 'Search prayer by festival' },
  { value: 'deity', label: 'By Deity', placeholder: 'Search prayer by deity' },
];

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('prayer');
  const [displayPrayers, setDisplayPrayers] = useState<Prayer[]>(fallbackPrayers);
  const [displayDeities, setDisplayDeities] = useState<Deity[]>(fallbackDeities);
  const [displayFestivals, setDisplayFestivals] = useState<Festival[]>(fallbackFestivals);
  const { preferences } = useApp();
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setDisplayPrayers(catalog.prayers.length > 0 ? catalog.prayers : fallbackPrayers);
        setDisplayDeities(catalog.deities.length > 0 ? catalog.deities : fallbackDeities);
        setDisplayFestivals(catalog.festivals.length > 0 ? catalog.festivals : fallbackFestivals);
      })
      .catch(() => {
        if (!isMounted) return;
        setDisplayPrayers(fallbackPrayers);
        setDisplayDeities(fallbackDeities);
        setDisplayFestivals(fallbackFestivals);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  const prayerResults = useMemo(() => {
    if (!query.trim()) return displayPrayers;
    const q = query.toLowerCase();
    return displayPrayers.filter(
      (prayer) =>
        prayer.title.toLowerCase().includes(q) ||
        getLocalizedPrayerTitle(prayer, preferences.language).toLowerCase().includes(q) ||
        prayer.subtitle.toLowerCase().includes(q) ||
        getLocalizedSubtitle(prayer.subtitle, preferences.language).toLowerCase().includes(q)
    );
  }, [displayPrayers, query, preferences.language]);

  const festivalResults = useMemo(() => {
    if (!query.trim()) return displayFestivals;
    const q = query.toLowerCase();
    return displayFestivals.filter(
      (festival) => {
        const localized = getLocalizedFestival(festival, preferences.language);
        return (
          festival.name.toLowerCase().includes(q) ||
          festival.nameHindi.includes(q) ||
          festival.description.toLowerCase().includes(q) ||
          localized.name.toLowerCase().includes(q) ||
          localized.nativeName.toLowerCase().includes(q) ||
          localized.description.toLowerCase().includes(q)
        );
      }
    );
  }, [displayFestivals, query, preferences.language]);

  const deityResults = useMemo(() => {
    if (!query.trim()) return displayDeities;
    const q = query.toLowerCase();
    return displayDeities.filter(
      (deity) => {
        const localized = getLocalizedDeity(deity, preferences.language);
        return (
          deity.name.toLowerCase().includes(q) ||
          deity.tagline.toLowerCase().includes(q) ||
          localized.name.toLowerCase().includes(q) ||
          localized.tagline.toLowerCase().includes(q)
        );
      }
    );
  }, [displayDeities, query, preferences.language]);

  const activePlaceholder =
    searchMode === 'prayer'
      ? tr('search.placeholderPrayer')
      : searchMode === 'festival'
        ? tr('search.placeholderFestival')
        : tr('search.placeholderDeity');

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      <div
        className="shrink-0 px-5 pt-12 pb-5"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '26px',
            fontWeight: 700,
            color: '#FFF5E4',
            marginBottom: '14px',
          }}
        >
          {tr('search.title')}
        </h1>

        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,245,228,0.95)' }}
        >
          <Search size={18} color="#9B8B7A" />
          <input
            type="text"
            placeholder={activePlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              color: '#2D1B00',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={16} color="#9B8B7A" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto mt-4 pb-1" style={{ scrollbarWidth: 'none' }}>
          {searchModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSearchMode(mode.value)}
              className="shrink-0 rounded-full px-4 py-2"
              style={{
                background: searchMode === mode.value ? '#FFF5E4' : 'rgba(255,245,228,0.1)',
                color: searchMode === mode.value ? '#7A1E1E' : '#FFF5E4',
                border: `1.5px solid ${
                  searchMode === mode.value ? '#FFF5E4' : 'rgba(255,245,228,0.18)'
                }`,
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {mode.value === 'prayer'
                ? tr('search.directPrayer')
                : mode.value === 'festival'
                  ? tr('search.byFestival')
                  : tr('search.byDeity')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          {searchMode === 'prayer' && (
            <motion.div
              key="prayer-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#2D1B00',
                  }}
                >
                  {query ? `${tr('search.prayerResults')} "${query}"` : tr('search.allPrayers')}
                </h2>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#9B8B7A',
                  }}
                >
                  {prayerResults.length} {tr('common.found')}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {prayerResults.map((prayer) => (
                  <PrayerCard key={prayer.id} prayer={prayer} showDeity />
                ))}
              </div>
            </motion.div>
          )}

          {searchMode === 'festival' && (
            <motion.div
              key="festival-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#2D1B00',
                  }}
                >
                  {query ? `${tr('search.festivalResults')} "${query}"` : tr('search.browseFestivals')}
                </h2>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#9B8B7A',
                  }}
                >
                  {festivalResults.length} {tr('common.found')}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {festivalResults.map((festival, index) => (
                  <motion.div
                    key={festival.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.04 }}
                  >
                    <FestivalCard festival={festival} variant="list" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {searchMode === 'deity' && (
            <motion.div
              key="deity-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#2D1B00',
                  }}
                >
                  {query ? `${tr('search.deityResults')} "${query}"` : tr('search.browseDeity')}
                </h2>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#9B8B7A',
                  }}
                >
                  {deityResults.length} {tr('common.found')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {deityResults.map((deity) => (
                  <DeityCard key={deity.id} deity={deity} size="large" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavBar />
    </div>
  );
}
