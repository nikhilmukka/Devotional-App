import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Crown, HeartHandshake, RefreshCcw, Sparkles, Volume2 } from 'lucide-react';
import { BottomNavBar } from '../components/BottomNavBar';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

function getPlanLabel(tier: string, tr: (key: string) => string) {
  if (tier === 'premium_individual') return tr('premium.premiumIndividual');
  if (tier === 'premium_family') return tr('premium.premiumFamily');
  return tr('premium.freePlan');
}

function getStatusLabel(status: string, tr: (key: string) => string) {
  switch (status) {
    case 'active':
      return tr('premium.active');
    case 'trial':
      return tr('premium.trial');
    case 'grace_period':
      return tr('premium.gracePeriod');
    default:
      return tr('premium.inactive');
  }
}

export function PremiumScreen() {
  const navigate = useNavigate();
  const {
    user,
    preferences,
    subscriptionTier,
    entitlementStatus,
    entitlementValidUntil,
    hasPremiumAccess,
    authReady,
    authBusy,
    refreshSessionState,
  } = useApp();
  const tr = (key: string) => t(preferences.language, key);
  const [refreshing, setRefreshing] = useState(false);

  const features = [
    tr('premium.featureFestivalGuides'),
    tr('premium.featureAudio'),
    tr('premium.featureSadhana'),
    tr('premium.featureKids'),
    tr('premium.featureNotebook'),
    tr('premium.featureVoice'),
  ];

  async function handleRefreshPlan() {
    setRefreshing(true);
    try {
      await refreshSessionState();
    } finally {
      setRefreshing(false);
    }
  }

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
              {tr('premium.title')}
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.68)',
                marginTop: '3px',
              }}
            >
              {tr('premium.subtitle')}
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
            <Sparkles size={20} strokeWidth={1.8} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-4">
          <div
            className="rounded-3xl p-5"
            style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
          >
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: '#9B8B7A',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {tr('premium.currentPlan')}
            </p>

            <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
              <div
                className="rounded-full px-4 py-2"
                style={{
                  background: hasPremiumAccess ? '#7A1E1E' : '#FFF5E4',
                  border: `1.5px solid ${hasPremiumAccess ? '#7A1E1E' : '#E8D5B0'}`,
                  color: hasPremiumAccess ? '#FFF5E4' : '#2D1B00',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {getPlanLabel(subscriptionTier, tr)}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#7B6A56',
                }}
              >
                {tr('premium.status')}: {getStatusLabel(entitlementStatus, tr)}
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '13px',
                color: '#7B6A56',
                lineHeight: 1.7,
                marginTop: '14px',
              }}
            >
              {user?.isGuest
                ? tr('premium.signInRequiredBody')
                : hasPremiumAccess
                  ? subscriptionTier === 'premium_family'
                    ? tr('premium.familyBody')
                    : tr('premium.premiumBody')
                  : tr('premium.freeBody')}
            </p>

            {entitlementValidUntil ? (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  color: '#9B8B7A',
                  marginTop: '10px',
                }}
              >
                {tr('premium.validUntil')}: {new Date(entitlementValidUntil).toLocaleDateString()}
              </p>
            ) : null}

            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={() => (user?.isGuest ? navigate('/login') : void handleRefreshPlan())}
                disabled={refreshing || !authReady || authBusy}
                className="rounded-full px-4 py-3 flex items-center gap-2"
                style={{
                  background: '#7A1E1E',
                  color: '#FFF5E4',
                  opacity: refreshing || !authReady || authBusy ? 0.6 : 1,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <RefreshCcw size={16} strokeWidth={2} />
                {user?.isGuest ? 'Sign In to Continue' : tr('premium.refreshCta')}
              </button>
            </div>
          </div>

          <div
            className="rounded-3xl p-5"
            style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#2D1B00',
              }}
            >
              {tr('premium.compareFree')}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <div
                className="rounded-3xl p-4"
                style={{ background: '#FFF8EE', border: '1.5px solid #F0E0C8' }}
              >
                <div className="flex items-center gap-2">
                  <HeartHandshake size={18} color="#7A1E1E" strokeWidth={1.8} />
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#2D1B00',
                    }}
                  >
                    {tr('premium.freePlan')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#7B6A56',
                    lineHeight: 1.7,
                    marginTop: '10px',
                  }}
                >
                  {tr('premium.freeLine1')}
                </p>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#7B6A56',
                    lineHeight: 1.7,
                    marginTop: '4px',
                  }}
                >
                  {tr('premium.freeLine2')}
                </p>
              </div>

              <div
                className="rounded-3xl p-4"
                style={{
                  background: 'linear-gradient(145deg, #FFF1E6 0%, #FFE8D4 100%)',
                  border: '1.5px solid #F2C99D',
                }}
              >
                <div className="flex items-center gap-2">
                  <Crown size={18} color="#AA4010" strokeWidth={1.8} />
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#2D1B00',
                    }}
                  >
                    {tr('premium.premiumIndividual')}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#7B6A56',
                    lineHeight: 1.7,
                    marginTop: '10px',
                  }}
                >
                  {tr('premium.premiumLine1')}
                </p>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    color: '#7B6A56',
                    lineHeight: 1.7,
                    marginTop: '4px',
                  }}
                >
                  {tr('premium.premiumLine2')}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl p-5"
            style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#2D1B00',
              }}
            >
              {tr('premium.whyUpgrade')}
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {features.map((feature, index) => (
                <div key={feature} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: '24px',
                      height: '24px',
                      background: index % 2 === 0 ? '#FF8C42' : '#7A1E1E',
                      color: '#FFF5E4',
                    }}
                  >
                    {index === 1 ? <Volume2 size={12} strokeWidth={2.4} /> : <Sparkles size={12} strokeWidth={2.2} />}
                  </div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '13px',
                      color: '#2D1B00',
                      lineHeight: 1.7,
                      fontWeight: 500,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-3xl p-5"
            style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#2D1B00',
              }}
            >
              {tr('premium.availablePlans')}
            </h2>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '13px',
                color: '#7B6A56',
                lineHeight: 1.7,
                marginTop: '10px',
              }}
            >
              {tr('premium.webBillingBody')}
            </p>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
