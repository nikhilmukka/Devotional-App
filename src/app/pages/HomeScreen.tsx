import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Bell, ChevronRight, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { DeityCard } from '../components/DeityCard';
import { PrayerCard } from '../components/PrayerCard';
import { FestivalCard } from '../components/FestivalCard';
import { PremiumTeaserCard } from '../components/PremiumTeaserCard';
import { deities as fallbackDeities, featuredPrayers, getPrayerById, type Deity } from '../data/prayers';
import { festivals as fallbackFestivals, type Festival } from '../data/festivals';
import { getTodayReminderCard } from '../data/reminders';
import { appLanguageOptions, prayerSourceLanguageOptions, t } from '../i18n';
import { getLocalizedPrayerDuration, getLocalizedPrayerTitle, getLocalizedSubtitle } from '../contentLocalization';
import { fetchWebPrayerCatalog } from '../lib/webContent';

function getGreeting(language: Parameters<typeof t>[0]) {
  const h = new Date().getHours();
  if (h < 5) return { text: t(language, 'home.greetingNight'), emoji: '🌙' };
  if (h < 12) return { text: t(language, 'home.greetingMorning'), emoji: '🌅' };
  if (h < 17) return { text: t(language, 'home.greetingAfternoon'), emoji: '☀️' };
  if (h < 20) return { text: t(language, 'home.greetingEvening'), emoji: '🌆' };
  return { text: t(language, 'home.greetingEvening'), emoji: '🌙' };
}

export function HomeScreen() {
  const { user, preferences, setPreference, hasPremiumAccess } = useApp();
  const navigate = useNavigate();
  const [displayDeities, setDisplayDeities] = useState<Deity[]>(fallbackDeities);
  const [displayFestivals, setDisplayFestivals] = useState<Festival[]>(fallbackFestivals);
  const greeting = getGreeting(preferences.language);
  const todayReminder = getTodayReminderCard();
  const dailyPrayer = getPrayerById(todayReminder.prayerId);
  const tr = (key: string) => t(preferences.language, key);
  const firstName = user?.name?.split(' ')[0] || tr('home.devotee');

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        setDisplayDeities(catalog.deities.length > 0 ? catalog.deities : fallbackDeities);
        setDisplayFestivals(catalog.festivals.length > 0 ? catalog.festivals : fallbackFestivals);
      })
      .catch(() => {
        if (!isMounted) return;
        setDisplayDeities(fallbackDeities);
        setDisplayFestivals(fallbackFestivals);
      });

    return () => {
      isMounted = false;
    };
  }, [preferences.language]);

  if (!dailyPrayer) {
    return null;
  }

  const localizedPrayerTitle = getLocalizedPrayerTitle(dailyPrayer, preferences.language);
  const localizedPrayerDuration = getLocalizedPrayerDuration(dailyPrayer.duration, preferences.language);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#FFF5E4' }}>
      {/* Header */}
      <div
        className="relative shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-4 right-4 rounded-full opacity-10"
          style={{ width: '100px', height: '100px', border: '1.5px solid #D4AF37' }}
        />
        <div
          className="absolute top-8 right-8 rounded-full opacity-10"
          style={{ width: '60px', height: '60px', border: '1px solid #D4AF37' }}
        />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 400,
                color: 'rgba(255,245,228,0.6)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {greeting.emoji} {greeting.text}
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '26px',
                fontWeight: 600,
                color: '#FFF5E4',
                lineHeight: 1.2,
                marginTop: '2px',
              }}
            >
              {firstName}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                color: 'rgba(255,245,228,0.55)',
                marginTop: '2px',
              }}
            >
              ॐ नमः शिवाय
            </p>
          </div>
          <button
            onClick={() => navigate('/reminders')}
            className="relative flex items-center justify-center rounded-full mt-1"
            style={{
              width: '42px',
              height: '42px',
              background: 'rgba(255,245,228,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <Bell size={18} color="#D4AF37" strokeWidth={1.8} />
            {preferences.notifications && (
              <span
                className="absolute top-1 right-1 rounded-full"
                style={{ width: '8px', height: '8px', background: '#FF8C42' }}
              />
            )}
          </button>
        </div>

        {/* Om */}
        <div
          className="absolute right-6 bottom-4 flex items-center justify-center opacity-20"
          style={{ fontSize: '48px', color: '#D4AF37', fontFamily: 'serif' }}
        >
          ॐ
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
        <div className="px-5 py-5 flex flex-col gap-6">
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            onClick={() => navigate('/search')}
            className="w-full rounded-3xl px-4 py-4 text-left"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #F0E0C8',
              boxShadow: '0 4px 18px rgba(122,30,30,0.06)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-2xl shrink-0"
                style={{ width: '44px', height: '44px', background: '#FF8C4212' }}
              >
                <Search size={18} color="#FF8C42" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '14px',
                    color: '#2D1B00',
                    fontWeight: 500,
                  }}
                >
                  {tr('home.searchTitle')}
                </p>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '11px',
                    color: '#9B8B7A',
                    marginTop: '2px',
                  }}
                >
                  {tr('home.searchSubtitle')}
                </p>
              </div>
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div
              className="w-full rounded-3xl p-4"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #F0E0C8',
                boxShadow: '0 4px 18px rgba(122,30,30,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#2D1B00',
                  }}
                >
                  {tr('home.appLanguage')}
                </h2>
                <div />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {appLanguageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreference('language', option.value)}
                    className="shrink-0 rounded-full px-4 py-2"
                    style={{
                      background:
                        preferences.language === option.value ? '#7A1E1E' : '#FFF5E4',
                      color: preferences.language === option.value ? '#FFF5E4' : '#7A1E1E',
                      border: `1.5px solid ${
                        preferences.language === option.value ? '#7A1E1E' : '#E8D5B0'
                      }`,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {preferences.language === 'english' && (
                <div className="mt-4">
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#9B8B7A',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    {tr('home.prayerSourceLanguage')}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {prayerSourceLanguageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPreference('prayerSourceLanguage', option.value)}
                        className="shrink-0 rounded-full px-4 py-2"
                        style={{
                          background:
                            preferences.prayerSourceLanguage === option.value ? '#FF8C42' : '#FFF5E4',
                          color:
                            preferences.prayerSourceLanguage === option.value ? '#FFF5E4' : '#7A1E1E',
                          border: `1.5px solid ${
                            preferences.prayerSourceLanguage === option.value ? '#FF8C42' : '#E8D5B0'
                          }`,
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Daily Prayer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('home.todaysPrayer')}
              </h2>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '10px',
                  color: '#FF8C42',
                  fontWeight: 600,
                  background: '#FF8C4215',
                  padding: '3px 10px',
                  borderRadius: '20px',
                }}
              >
                {todayReminder.type === 'festival'
                  ? tr('home.festivalPick')
                  : tr('home.dailyPick')}
              </span>
            </div>
            <button
              onClick={() => navigate(`/prayer/${dailyPrayer.id}`)}
              className="w-full rounded-3xl p-5 text-left transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7A1E1E 0%, #AA4010 60%, #FF8C42 100%)',
                boxShadow: '0 6px 24px rgba(122,30,30,0.3)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '10px',
                      fontWeight: 500,
                      color: 'rgba(255,245,228,0.65)',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {todayReminder.type === 'festival'
                      ? tr('home.festivalPick')
                      : getLocalizedSubtitle(dailyPrayer.subtitle, preferences.language)}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#FFF5E4',
                      lineHeight: 1.2,
                      marginTop: '4px',
                    }}
                  >
                    {localizedPrayerTitle}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      color: 'rgba(255,245,228,0.55)',
                      marginTop: '4px',
                    }}
                  >
                    {todayReminder.dayLabel} · {localizedPrayerDuration}
                  </p>
                </div>
                <div
                  className="flex items-center justify-center rounded-2xl shrink-0"
                  style={{
                    width: '54px',
                    height: '54px',
                    background: 'rgba(255,245,228,0.12)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    fontSize: '28px',
                  }}
                >
                  🙏
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <div
                  className="flex-1 h-1 rounded-full"
                  style={{ background: 'rgba(255,245,228,0.2)' }}
                />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '10px',
                    color: '#D4AF37',
                    fontWeight: 500,
                  }}
                >
                  Read Now →
                </span>
              </div>
            </button>
          </motion.div>

          {!hasPremiumAccess ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              <PremiumTeaserCard
                eyebrow={tr('common.premium')}
                title={tr('home.premiumGuidesTitle')}
                body={tr('home.premiumGuidesBody')}
                icon={<Sparkles size={22} strokeWidth={1.8} />}
                bullets={[tr('home.premiumGuidesPoint1'), tr('home.premiumGuidesPoint2')]}
                ctaLabel={tr('common.unlockPremium')}
                onClick={() => navigate('/premium')}
              />
            </motion.div>
          ) : null}

          {/* Browse by Festival */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('home.browseByFestival')}
              </h2>
              <button
                onClick={() => navigate('/festivals')}
                className="flex items-center gap-1"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#FF8C42',
                  fontWeight: 500,
                }}
              >
                {tr('common.seeAll')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {displayFestivals.slice(0, 7).map((festival) => (
                <FestivalCard key={festival.id} festival={festival} variant="scroll" />
              ))}
            </div>
          </motion.div>

          {/* Browse by Deity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('home.browseByDeity')}
              </h2>
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-1"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#FF8C42',
                  fontWeight: 500,
                }}
              >
                {tr('common.seeAll')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {displayDeities.map((deity) => (
                <DeityCard key={deity.id} deity={deity} size="small" />
              ))}
            </div>
          </motion.div>

          {/* Featured Prayers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#2D1B00',
                }}
              >
                {tr('home.featuredPrayers')}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {featuredPrayers.slice(0, 4).map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} showDeity />
              ))}
            </div>
          </motion.div>

          {/* Inspirational quote */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-3xl p-5"
            style={{
              background: 'linear-gradient(135deg, #FFF5E4 0%, #FFE8C8 100%)',
              border: '1.5px solid #E8C97A',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '17px',
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#4A2C0A',
                lineHeight: 1.6,
                textAlign: 'center',
              }}
            >
              "सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः।"
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                color: '#9B8B7A',
                textAlign: 'center',
                marginTop: '6px',
              }}
            >
              {tr('home.quoteMeaning')}
            </p>
          </motion.div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
