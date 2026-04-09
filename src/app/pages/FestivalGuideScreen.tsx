import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen, Lock, Sparkles } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { PremiumTeaserCard } from '../components/PremiumTeaserCard';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { fetchWebFestivalGuide, type WebFestivalGuide } from '../lib/webContent';

export function FestivalGuideScreen() {
  const { festivalId } = useParams<{ festivalId: string }>();
  const navigate = useNavigate();
  const { preferences, hasPremiumAccess } = useApp();
  const tr = (key: string) => t(preferences.language, key);
  const [guide, setGuide] = useState<WebFestivalGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadGuide() {
      if (!festivalId) {
        if (active) {
          setGuide(null);
          setLoading(false);
        }
        return;
      }

      try {
        const nextGuide = await fetchWebFestivalGuide(festivalId, preferences.language);
        if (active) {
          setGuide(nextGuide);
        }
      } catch (error) {
        console.warn('Failed to load festival guide', error);
        if (active) {
          setGuide(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadGuide();

    return () => {
      active = false;
    };
  }, [festivalId, preferences.language]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#FFF5E4' }}>
        <div
          className="rounded-3xl px-8 py-6"
          style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
        >
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#2D1B00' }}>
            Preparing festival guide...
          </p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: '#FFF5E4' }}>
        <span style={{ fontSize: '42px' }}>📿</span>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#9B8B7A' }}>
          Festival guide is not available yet.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600, color: '#FF8C42' }}
        >
          {tr('festivals.goBack')}
        </button>
      </div>
    );
  }

  const isLocked = guide.isPremium && !hasPremiumAccess;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      <div
        className="shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5"
          style={{ color: 'rgba(255,245,228,0.82)' }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', fontWeight: 500 }}>
            {guide.festivalName}
          </span>
        </button>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '30px',
                fontWeight: 700,
                color: '#FFF5E4',
              }}
            >
              {guide.title}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.68)',
                marginTop: '4px',
              }}
            >
              {guide.subtitle || guide.festivalName}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,245,228,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#D4AF37',
            }}
          >
            {isLocked ? <Lock size={20} strokeWidth={1.8} /> : <BookOpen size={20} strokeWidth={1.8} />}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#7B6A56', lineHeight: 1.7 }}>
              {guide.introText || 'A guided festival worship flow will appear here as content is added.'}
            </p>
          </div>

          {isLocked ? (
            <PremiumTeaserCard
              eyebrow={tr('common.premium')}
              icon="sparkles-outline"
              title={tr('home.premiumGuidesTitle')}
              body={tr('home.premiumGuidesBody')}
              bullets={[tr('home.premiumGuidesPoint1'), tr('home.premiumGuidesPoint2')]}
              ctaLabel={tr('common.unlockPremium')}
              onClick={() => navigate('/premium')}
            />
          ) : (
            <>
              <div className="rounded-3xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#2D1B00',
                    marginBottom: '12px',
                  }}
                >
                  Items Needed
                </h2>
                <div className="flex flex-col gap-2">
                  {(guide.itemsNeeded.length > 0 ? guide.itemsNeeded : ['Items will appear here when added from admin.']).map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-2">
                      <Sparkles size={14} color="#FF8C42" strokeWidth={1.8} className="mt-1 shrink-0" />
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#2D1B00', lineHeight: 1.7 }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#2D1B00',
                    marginBottom: '12px',
                  }}
                >
                  Step by Step
                </h2>
                <div className="flex flex-col gap-3">
                  {(guide.stepByStep.length > 0 ? guide.stepByStep : ['Festival pooja steps will appear here when added from admin.']).map((step, index) => (
                    <div key={`${step}-${index}`} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: '24px', height: '24px', background: '#7A1E1E', color: '#FFF5E4' }}
                      >
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: 700 }}>
                          {index + 1}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#2D1B00', lineHeight: 1.7 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {guide.preparationNotes ? (
                <div className="rounded-3xl p-5" style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}>
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#2D1B00',
                      marginBottom: '12px',
                    }}
                  >
                    Preparation Notes
                  </h2>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#7B6A56', lineHeight: 1.7 }}>
                    {guide.preparationNotes}
                  </p>
                </div>
              ) : null}

              {guide.linkedPrayerId ? (
                <button
                  onClick={() => navigate(`/prayer/${guide.linkedPrayerId}`)}
                  className="rounded-3xl p-4 text-left"
                  style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
                >
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: 700, color: '#9B8B7A', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Linked Prayer
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: '#2D1B00', marginTop: '6px' }}>
                    {guide.linkedPrayerTitle || 'Open Prayer'}
                  </p>
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
