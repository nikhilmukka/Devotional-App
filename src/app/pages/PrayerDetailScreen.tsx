import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Share2, Minus, Plus, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPrayerById, getDeityById, type Deity, type Prayer } from '../data/prayers';
import { getAudioPrayerForPrayerId } from '../data/audioPrayers';
import { AudioPrayerPlayer } from '../components/AudioPrayerPlayer';
import {
  getLocalizedDeity,
  getLocalizedPrayerDuration,
  getLocalizedPrayerLanguageLabel,
  getLocalizedPrayerTitle,
  getLocalizedSubtitle,
  getResolvedPrayerContent,
} from '../contentLocalization';
import { t } from '../i18n';
import { fetchWebPrayerCatalog, type WebAudioTrack } from '../lib/webContent';

const fontSizes = [14, 17, 20, 24];
const fontSizeLabels = ['S', 'M', 'L', 'XL'];

export function PrayerDetailScreen() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, preferences } = useApp();
  const [livePrayer, setLivePrayer] = useState<Prayer | null>(null);
  const [liveDeity, setLiveDeity] = useState<Deity | null>(null);
  const [liveAudioTrack, setLiveAudioTrack] = useState<(WebAudioTrack & { weekday: number }) | null>(null);
  const tr = (key: string) => t(preferences.language, key);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;

        const matchedPrayer = catalog.prayers.find((item) => item.id === (prayerId || '')) || null;
        const matchedDeity = matchedPrayer
          ? catalog.deities.find((item) => item.id === matchedPrayer.deityId) || null
          : null;
        const matchedAudio = catalog.audioTracks.find((item) => item.prayerId === (prayerId || '')) || null;

        setLivePrayer(matchedPrayer);
        setLiveDeity(matchedDeity);
        setLiveAudioTrack(matchedAudio ? { ...matchedAudio, weekday: 0 } : null);
      })
      .catch(() => {
        if (!isMounted) return;
        setLivePrayer(null);
        setLiveDeity(null);
        setLiveAudioTrack(null);
      });

    return () => {
      isMounted = false;
    };
  }, [prayerId, preferences.language]);

  const prayer = livePrayer || getPrayerById(prayerId || '');
  const deity = liveDeity || (prayer ? getDeityById(prayer.deityId) : undefined);
  const favd = prayer ? isFavorite(prayer.id) : false;
  const audioTrack = liveAudioTrack || (prayer ? getAudioPrayerForPrayerId(prayer.id) : undefined);
  const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
  const localizedTitle = prayer ? getLocalizedPrayerTitle(prayer, preferences.language) : '';
  const localizedDuration = prayer ? getLocalizedPrayerDuration(prayer.duration, preferences.language) : '';

  const defaultLang = useMemo(
    () =>
      prayer && preferences.language === 'english'
        ? preferences.prayerSourceLanguage
        : prayer?.content[0]?.lang || 'hindi',
    [prayer, preferences.language, preferences.prayerSourceLanguage]
  );
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    setSelectedLang(defaultLang);
  }, [defaultLang]);

  if (!prayer || !deity) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#FFF5E4' }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#9B8B7A' }}>{tr('common.prayerNotFound')}</p>
      </div>
    );
  }

  const { content, renderedVerses, displayLabel } = getResolvedPrayerContent(
    prayer,
    preferences,
    selectedLang
  );
  const fontSize = fontSizes[fontSizeIdx];

  const toggleFav = () => {
    favd ? removeFavorite(prayer.id) : addFavorite(prayer.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: localizedTitle,
        text: `Read "${localizedTitle}" on BhaktiVerse 🙏`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Top bar */}
      <div
        className="shrink-0 px-5 pt-12 pb-5 relative"
        style={{
          background: `linear-gradient(150deg, ${deity.color2} 0%, ${deity.color1} 100%)`,
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        {/* Decorative */}
        <div
          className="absolute bottom-4 right-6 opacity-15"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '56px',
            color: '#fff',
          }}
        >
          ॐ
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500 }}>
            {localizedDeity?.name || deity.name}
          </span>
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span
              className="inline-block rounded-full px-3 py-0.5 mb-2"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {getLocalizedSubtitle(prayer.subtitle, preferences.language)}
            </span>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              {localizedTitle}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)',
                marginTop: '4px',
              }}
            >
              {localizedDuration}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0 mt-1">
            <button
              onClick={toggleFav}
              className="flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.15)',
              }}
            >
              <Heart
                size={18}
                strokeWidth={2}
                fill={favd ? '#FF8C42' : 'none'}
                color={favd ? '#FF8C42' : 'rgba(255,255,255,0.9)'}
              />
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center rounded-full"
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.15)',
              }}
            >
              <Share2 size={18} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-3"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #F0E0C8',
        }}
      >
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              background: '#FFF5E4',
              border: '1.5px solid #E8D5B0',
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: '#7A1E1E',
              }}
            >
              {displayLabel}
            </span>
            <ChevronDown size={14} color="#7A1E1E" />
          </button>

          <AnimatePresence>
            {showLangPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden z-20"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E8D5B0',
                  boxShadow: '0 8px 24px rgba(122,30,30,0.12)',
                  minWidth: '140px',
                }}
              >
                {prayer.content.map((c) => (
                  <button
                    key={c.lang}
                    onClick={() => {
                      setSelectedLang(c.lang);
                      setShowLangPicker(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all"
                    style={{
                      background: selectedLang === c.lang ? '#FFF5E4' : 'transparent',
                      borderBottom: '1px solid #F5EBD8',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '13px',
                        fontWeight: selectedLang === c.lang ? 600 : 400,
                        color: selectedLang === c.lang ? '#7A1E1E' : '#4A2C0A',
                      }}
                      >
                      {preferences.language === 'english' && c.lang !== 'english'
                        ? `${getLocalizedPrayerLanguageLabel(c.lang, preferences.language)} in English`
                        : getLocalizedPrayerLanguageLabel(c.lang, preferences.language)}
                    </span>
                    {selectedLang === c.lang && (
                      <div
                        className="rounded-full"
                        style={{ width: '7px', height: '7px', background: '#FF8C42' }}
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Font size controls */}
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              color: '#9B8B7A',
              fontWeight: 500,
            }}
          >
            Aa
          </span>
          <button
            onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
            disabled={fontSizeIdx === 0}
            className="flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              width: '30px',
              height: '30px',
              background: fontSizeIdx === 0 ? '#F5EBD8' : '#FFF5E4',
              border: '1.5px solid #E8D5B0',
              opacity: fontSizeIdx === 0 ? 0.4 : 1,
            }}
          >
            <Minus size={13} color="#7A1E1E" />
          </button>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#7A1E1E',
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {fontSizeLabels[fontSizeIdx]}
          </span>
          <button
            onClick={() => setFontSizeIdx((i) => Math.min(fontSizes.length - 1, i + 1))}
            disabled={fontSizeIdx === fontSizes.length - 1}
            className="flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              width: '30px',
              height: '30px',
              background: fontSizeIdx === fontSizes.length - 1 ? '#F5EBD8' : '#FFF5E4',
              border: '1.5px solid #E8D5B0',
              opacity: fontSizeIdx === fontSizes.length - 1 ? 0.4 : 1,
            }}
          >
            <Plus size={13} color="#7A1E1E" />
          </button>
        </div>
      </div>

      {/* Prayer content */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ scrollbarWidth: 'none' }}
        onClick={() => showLangPicker && setShowLangPicker(false)}
      >
        {audioTrack && (
          <div className="mb-6">
            <AudioPrayerPlayer
              track={audioTrack}
              compact
              prayerOverride={prayer}
              deityOverride={deity}
            />
          </div>
        )}

        {/* Deity icon watermark */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '52px',
              height: '52px',
              background: `${deity.color1}18`,
              border: `2px solid ${deity.color1}30`,
              fontSize: '26px',
            }}
          >
            {deity.symbol}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
          <span style={{ color: '#D4AF37', fontSize: '16px' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
        </div>

        {/* Verses */}
        <div className="flex flex-col gap-6 pb-10">
          {renderedVerses.map((verse, i) => {
            if (verse.type === 'note') {
              return (
                <div key={i} className="flex justify-center">
                  <span
                    className="px-4 py-1 rounded-full"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      color: deity.color1,
                      background: `${deity.color1}15`,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {verse.text}
                  </span>
                </div>
              );
            }

            if (verse.type === 'header') {
              return (
                <h3
                  key={i}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: fontSize + 4,
                    fontWeight: 700,
                    color: '#2D1B00',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {verse.text}
                </h3>
              );
            }

            if (verse.type === 'refrain') {
              return (
                <div
                  key={i}
                  className="rounded-3xl p-4"
                  style={{
                    background: `${deity.color1}0E`,
                    border: `1.5px solid ${deity.color1}28`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: fontSize + 1,
                      fontWeight: 600,
                      color: deity.color2,
                      lineHeight: 1.9,
                      whiteSpace: 'pre-line',
                      textAlign: 'center',
                    }}
                  >
                    {verse.text}
                  </p>
                </div>
              );
            }

            // Regular verse
            return (
              <div key={i} className="flex gap-3">
                <div
                  className="rounded-full shrink-0 mt-2"
                  style={{ width: '4px', minHeight: '24px', background: `${deity.color1}40` }}
                />
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize,
                    fontWeight: 400,
                    color: '#3D2200',
                    lineHeight: 1.9,
                    whiteSpace: 'pre-line',
                    flex: 1,
                  }}
                >
                  {verse.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* End divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
          <span style={{ color: '#D4AF37', fontSize: '20px' }}>ॐ</span>
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
        </div>
      </div>
    </div>
  );
}
