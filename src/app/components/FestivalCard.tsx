import { useNavigate } from 'react-router';
import type { Festival } from '../data/festivals';
import { isCurrent, isUpcoming } from '../data/festivals';
import { useApp } from '../context/AppContext';
import { getLocalizedFestival } from '../contentLocalization';
import { t } from '../i18n';

interface FestivalCardProps {
  festival: Festival;
  variant?: 'scroll' | 'list';
}

export function FestivalCard({ festival, variant = 'scroll' }: FestivalCardProps) {
  const navigate = useNavigate();
  const current = isCurrent(festival);
  const upcoming = isUpcoming(festival);
  const { preferences } = useApp();
  const localized = getLocalizedFestival(festival, preferences.language);
  const tr = (key: string) => t(preferences.language, key);

  if (variant === 'list') {
    return (
      <button
        onClick={() => navigate(`/festival/${festival.id}`)}
        className="w-full flex items-center gap-4 rounded-3xl p-4 text-left transition-all active:scale-[0.98]"
        style={{
          background: '#FFFFFF',
          border: `1.5px solid ${festival.color1}28`,
          boxShadow: `0 2px 14px ${festival.color1}14`,
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-2xl shrink-0"
          style={{
            width: '60px',
            height: '60px',
            background: `linear-gradient(135deg, ${festival.color1} 0%, ${festival.color2} 100%)`,
            boxShadow: `0 4px 12px ${festival.color1}40`,
            fontSize: '28px',
          }}
        >
          {festival.symbol}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#2D1B00',
                lineHeight: 1.2,
              }}
            >
              {localized.name}
            </span>
            {current && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: '#FF8C4220',
                  color: '#FF8C42',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {tr('common.thisMonth').toUpperCase()}
              </span>
            )}
            {!current && upcoming && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: `${festival.color1}18`,
                  color: festival.color1,
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
              fontSize: '11px',
              color: '#9B8B7A',
              marginTop: '2px',
            }}
          >
            {localized.nativeName} · {festival.dateInfo}
          </p>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              color: '#6B4C1E',
              marginTop: '3px',
            }}
          >
            {localized.description}
          </p>
        </div>

        {/* Prayer count */}
        <div
          className="flex flex-col items-center shrink-0"
          style={{ minWidth: '44px' }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              fontWeight: 700,
              color: festival.color1,
              lineHeight: 1,
            }}
          >
            {festival.prayerIds.length}
          </span>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '9px',
              color: '#9B8B7A',
              fontWeight: 500,
            }}
          >
            {tr('common.prayers')}
          </span>
        </div>
      </button>
    );
  }

  // Scroll variant — compact vertical card
  return (
    <button
      onClick={() => navigate(`/festival/${festival.id}`)}
      className="flex flex-col rounded-3xl overflow-hidden transition-all active:scale-95 shrink-0"
      style={{
        width: '130px',
        background: `linear-gradient(155deg, ${festival.color1} 0%, ${festival.color2} 100%)`,
        boxShadow: `0 6px 20px ${festival.color1}40`,
      }}
    >
      {/* Top badge */}
      {(current || upcoming) && (
        <div
          className="px-3 py-1 self-end mt-2 mr-2 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.2)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '8px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.5px',
          }}
        >
          {current ? `● ${tr('common.thisMonth').toUpperCase()}` : `▲ ${tr('common.upcoming').toUpperCase()}`}
        </div>
      )}

      {/* Emoji */}
      <div
        className="flex items-center justify-center mx-auto mt-3 rounded-2xl"
        style={{
          width: '56px',
          height: '56px',
          background: 'rgba(255,255,255,0.18)',
          fontSize: '28px',
        }}
      >
        {festival.symbol}
      </div>

      {/* Name */}
      <div className="px-3 pb-4 pt-2 flex-1 flex flex-col">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '15px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.25,
            textAlign: 'center',
          }}
        >
          {localized.name}
        </p>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            marginTop: '3px',
          }}
        >
          {localized.nativeName}
        </p>
        <div
          className="mt-2 mx-auto rounded-full px-2 py-0.5"
          style={{
            background: 'rgba(255,255,255,0.15)',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '9px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
          }}
        >
          {festival.prayerIds.length} {tr('common.prayers')}
        </div>
      </div>
    </button>
  );
}
