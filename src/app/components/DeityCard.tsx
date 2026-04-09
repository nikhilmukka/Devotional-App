import { useNavigate } from 'react-router';
import type { Deity } from '../data/prayers';
import { useApp } from '../context/AppContext';
import { getLocalizedDeity } from '../contentLocalization';

interface DeityCardProps {
  deity: Deity;
  size?: 'small' | 'large';
}

export function DeityCard({ deity, size = 'small' }: DeityCardProps) {
  const navigate = useNavigate();
  const { preferences } = useApp();
  const localized = getLocalizedDeity(deity, preferences.language);

  if (size === 'large') {
    return (
      <button
        onClick={() => navigate(`/deity/${deity.id}`)}
        className="flex flex-col items-center rounded-3xl p-4 transition-all duration-200 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${deity.color1}22 0%, ${deity.color2}15 100%)`,
          border: `1.5px solid ${deity.color1}40`,
          boxShadow: `0 4px 16px ${deity.color1}20`,
          minWidth: '100px',
          flex: '0 0 auto',
        }}
      >
        <div
          className="flex items-center justify-center rounded-2xl mb-2"
          style={{
            width: '56px',
            height: '56px',
            background: `linear-gradient(135deg, ${deity.color1} 0%, ${deity.color2} 100%)`,
            boxShadow: `0 4px 12px ${deity.color1}50`,
            fontSize: '26px',
          }}
        >
          {deity.symbol}
        </div>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            color: deity.color2,
            letterSpacing: '0.2px',
          }}
        >
          {localized.name}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/deity/${deity.id}`)}
      className="flex flex-col items-center gap-2 rounded-3xl p-3 transition-all duration-200 active:scale-95"
      style={{
        background: `linear-gradient(145deg, ${deity.bgLight} 0%, #ffffff 100%)`,
        border: `1.5px solid ${deity.color1}30`,
        boxShadow: `0 3px 12px ${deity.color1}18`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: '52px',
          height: '52px',
          background: `linear-gradient(135deg, ${deity.color1} 0%, ${deity.color2} 100%)`,
          boxShadow: `0 4px 10px ${deity.color1}45`,
          fontSize: '24px',
        }}
      >
        {deity.symbol}
      </div>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: '#4A2C0A',
          letterSpacing: '0.2px',
          textAlign: 'center',
        }}
      >
        {localized.name}
      </span>
    </button>
  );
}
