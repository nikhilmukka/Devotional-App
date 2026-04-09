import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface PremiumTeaserCardProps {
  title: string;
  body: string;
  eyebrow?: string;
  icon: ReactNode;
  ctaLabel: string;
  bullets?: string[];
  onClick: () => void;
}

export function PremiumTeaserCard({
  title,
  body,
  eyebrow,
  icon,
  ctaLabel,
  bullets = [],
  onClick,
}: PremiumTeaserCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl p-5 text-left transition-all active:scale-[0.98]"
      style={{
        background: 'linear-gradient(145deg, #6B1717 0%, #8B241A 58%, #C85C20 100%)',
        boxShadow: '0 10px 28px rgba(107,23,23,0.22)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {eyebrow ? (
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,245,228,0.74)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </p>
          ) : null}
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#FFF5E4',
              lineHeight: 1.15,
              marginTop: eyebrow ? '6px' : 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '13px',
              color: 'rgba(255,245,228,0.84)',
              lineHeight: 1.7,
              marginTop: '8px',
            }}
          >
            {body}
          </p>
        </div>

        <div
          className="flex items-center justify-center rounded-2xl shrink-0"
          style={{
            width: '52px',
            height: '52px',
            background: 'rgba(255,245,228,0.12)',
            border: '1px solid rgba(255,245,228,0.14)',
            color: '#D4AF37',
          }}
        >
          {icon}
        </div>
      </div>

      {bullets.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2">
              <span
                className="rounded-full shrink-0"
                style={{
                  width: '6px',
                  height: '6px',
                  background: '#D4AF37',
                  marginTop: '7px',
                }}
              />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#FFF5E4',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                {bullet}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-1.5">
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            color: '#FFF5E4',
            letterSpacing: '0.4px',
          }}
        >
          {ctaLabel}
        </span>
        <ArrowRight size={16} color="#FFF5E4" strokeWidth={2.2} />
      </div>
    </button>
  );
}
