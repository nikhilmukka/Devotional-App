import { useNavigate } from 'react-router';
import { Heart, Clock, ChevronRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Deity, Prayer } from '../data/prayers';
import { deities } from '../data/prayers';
import { getLocalizedDeity, getLocalizedPrayerDuration, getLocalizedPrayerTitle, getLocalizedSubtitle } from '../contentLocalization';

const subtitleColors: Record<string, string> = {
  Chalisa: '#7A1E1E',
  Aarti: '#E64A19',
  Stotram: '#5C6BC0',
  Mantra: '#2E7D32',
  Bhajan: '#C2185B',
  Ashtakam: '#F57F17',
  Ashtak: '#7A1E1E',
  Shloka: '#2E7D32',
};

interface PrayerCardProps {
  prayer: Prayer;
  showDeity?: boolean;
  deityOverride?: Deity;
}

export function PrayerCard({ prayer, showDeity = false, deityOverride }: PrayerCardProps) {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, preferences } = useApp();
  const favd = isFavorite(prayer.id);
  const deity = deityOverride || deities.find((d) => d.id === prayer.deityId);
  const tagColor = subtitleColors[prayer.subtitle] || '#7A1E1E';
  const localizedDeity = deity ? getLocalizedDeity(deity, preferences.language) : undefined;
  const localizedSubtitle = getLocalizedSubtitle(prayer.subtitle, preferences.language);
  const localizedTitle = getLocalizedPrayerTitle(prayer, preferences.language);
  const localizedDuration = getLocalizedPrayerDuration(prayer.duration, preferences.language);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    favd ? removeFavorite(prayer.id) : addFavorite(prayer.id);
  };

  return (
    <button
      onClick={() => navigate(`/prayer/${prayer.id}`)}
      className="w-full flex items-center gap-3 rounded-3xl p-4 transition-all duration-200 active:scale-[0.98] text-left"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #F0E0C8',
        boxShadow: '0 2px 12px rgba(122,30,30,0.06)',
      }}
    >
      {/* Deity icon */}
      {showDeity && deity && (
        <div
          className="flex items-center justify-center rounded-2xl shrink-0"
          style={{
            width: '44px',
            height: '44px',
            background: `linear-gradient(135deg, ${deity.color1} 0%, ${deity.color2} 100%)`,
            fontSize: '20px',
          }}
        >
          {deity.symbol}
        </div>
      )}

      {/* Left color bar */}
      {!showDeity && (
        <div
          className="self-stretch rounded-full shrink-0"
          style={{ width: '4px', background: tagColor, minHeight: '40px' }}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '17px',
            fontWeight: 600,
            color: '#2D1B00',
            lineHeight: 1.3,
          }}
        >
          {localizedTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-block rounded-full px-2 py-0.5"
            style={{
              background: `${tagColor}15`,
              color: tagColor,
              fontFamily: "'Poppins', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.4px',
            }}
          >
            {localizedSubtitle}
          </span>
          {showDeity && localizedDeity && (
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                color: '#9B8B7A',
              }}
            >
              {localizedDeity.name}
            </span>
          )}
          <span className="flex items-center gap-0.5" style={{ color: '#9B8B7A' }}>
            <Clock size={10} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '10px' }}>
              {localizedDuration}
            </span>
          </span>
          {prayer.isPremium ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                background: '#7A1E1E15',
                color: '#7A1E1E',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              <Lock size={10} />
              Premium
            </span>
          ) : null}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleFav}
          className="p-2 rounded-full transition-all duration-200 active:scale-90"
          style={{ background: favd ? '#FF8C4215' : 'transparent' }}
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={favd ? '#FF8C42' : 'none'}
            color={favd ? '#FF8C42' : '#C9B89A'}
          />
        </button>
        <ChevronRight size={16} color="#C9B89A" />
      </div>
    </button>
  );
}
