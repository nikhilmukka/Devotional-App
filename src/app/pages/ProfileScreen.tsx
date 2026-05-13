import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  LogOut,
  Globe,
  Moon,
  Bell,
  Info,
  Shield,
  MessageCircle,
  ChevronRight,
  User,
  Camera,
  Save,
  Mail,
  Phone,
  Crown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNavBar } from '../components/BottomNavBar';
import { appLanguageOptions, prayerSourceLanguageOptions, t } from '../i18n';
import { fetchWebPrayerCatalog } from '../lib/webContent';

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

function SettingToggle({ icon, label, sublabel, value, onChange, color = '#7A1E1E' }: SettingToggleProps) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div
        className="flex items-center justify-center rounded-2xl shrink-0"
        style={{ width: '42px', height: '42px', background: `${color}12` }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500, color: '#2D1B00' }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', color: '#9B8B7A' }}>
            {sublabel}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative transition-all duration-300 shrink-0"
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          background: value
            ? `linear-gradient(135deg, ${color} 0%, #FF8C42 100%)`
            : '#E8D5B0',
        }}
      >
        <div
          className="absolute top-1 transition-all duration-300 rounded-full bg-white"
          style={{
            width: '20px',
            height: '20px',
            left: value ? '24px' : '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

interface SettingLinkProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color?: string;
  onClick?: () => void;
}

function SettingLink({ icon, label, sublabel, color = '#7A1E1E', onClick }: SettingLinkProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 py-1 w-full text-left active:opacity-70"
    >
      <div
        className="flex items-center justify-center rounded-2xl shrink-0"
        style={{ width: '42px', height: '42px', background: `${color}12` }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500, color: '#2D1B00' }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', color: '#9B8B7A' }}>
            {sublabel}
          </p>
        )}
      </div>
      <ChevronRight size={18} color="#C9B89A" />
    </button>
  );
}

function ProfileField({
  icon,
  label,
  value,
  type = 'text',
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
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
        {label}
      </p>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl py-3.5 pl-11 pr-4 outline-none"
          style={{
            background: '#FFF5E4',
            border: '1.5px solid #E8D5B0',
            color: '#2D1B00',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const {
    user,
    preferences,
    logout,
    setPreference,
    favorites,
    updateProfile,
    subscriptionTier,
    hasPremiumAccess,
  } = useApp();
  const navigate = useNavigate();
  const tr = (key: string) => t(preferences.language, key);
  const [savedPrayerCount, setSavedPrayerCount] = useState(favorites.length);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: user?.photo || '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      photo: user?.photo || '',
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    fetchWebPrayerCatalog(preferences.language)
      .then((catalog) => {
        if (!isMounted) return;
        const availableFavorites = catalog.prayers.filter((prayer) => favorites.includes(prayer.id));
        setSavedPrayerCount(availableFavorites.length || favorites.length);
      })
      .catch(() => {
        if (!isMounted) return;
        setSavedPrayerCount(favorites.length);
      });

    return () => {
      isMounted = false;
    };
  }, [favorites, preferences.language]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile({
      name: form.name || tr('home.devotee'),
      email: form.email,
      phone: form.phone,
      photo: form.photo,
    });

    if (!result.ok) {
      console.warn('Failed to save profile on web', result.error);
      return;
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, photo: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#FFF5E4' }}>
      {/* Header */}
      <div
        className="shrink-0 px-5 pt-12 pb-7"
        style={{
          background: 'linear-gradient(150deg, #7A1E1E 0%, #3d0f0f 55%, #AA4010 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFF5E4',
            marginBottom: '16px',
          }}
        >
          {tr('profile.title')}
        </h1>

        {/* User card */}
        <div
          className="flex items-center gap-4 p-4 rounded-3xl"
          style={{
            background: 'rgba(255,245,228,0.12)',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-3xl shrink-0"
            style={{
              width: '60px',
              height: '60px',
              background: 'rgba(212,175,55,0.2)',
              border: '2px solid rgba(212,175,55,0.4)',
            }}
          >
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.name || tr('profile.title')}
                className="h-full w-full rounded-3xl object-cover"
              />
            ) : user?.isGuest ? (
              <span style={{ fontSize: '28px' }}>🙏</span>
            ) : (
              <User size={28} color="#D4AF37" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: '#FFF5E4',
                lineHeight: 1.2,
              }}
            >
              {form.name || tr('home.devotee')}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,245,228,0.55)',
                marginTop: '2px',
              }}
            >
              {user?.isGuest ? tr('profile.guestUser') : form.email || ''}
            </p>
          </div>
          {/* Stats */}
          <div className="flex flex-col items-center shrink-0">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#D4AF37',
              }}
            >
              {savedPrayerCount}
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '10px',
                color: 'rgba(255,245,228,0.55)',
              }}
            >
              {tr('favorites.savedStat')}
            </span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => navigate('/premium')}
          className="w-full rounded-3xl p-5 mb-4 text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(145deg, #6B1717 0%, #8B241A 58%, #C85C20 100%)',
            boxShadow: '0 10px 28px rgba(107,23,23,0.18)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
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
                {tr('profile.currentPlan')}
              </p>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FFF5E4',
                  marginTop: '6px',
                }}
              >
                {tr('profile.premiumMember')}
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
                {tr('profile.premiumMemberBody')}
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
              <Crown size={22} strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <span
              className="rounded-full px-4 py-2"
              style={{
                background: hasPremiumAccess ? 'rgba(255,245,228,0.16)' : 'rgba(255,245,228,0.12)',
                border: '1px solid rgba(255,245,228,0.18)',
                color: '#FFF5E4',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {subscriptionTier === 'premium_family'
                ? tr('premium.premiumFamily')
                : subscriptionTier === 'premium_individual'
                  ? tr('premium.premiumIndividual')
                  : tr('premium.freePlan')}
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFF5E4',
              }}
            >
              {hasPremiumAccess ? tr('common.premium') : tr('common.unlockPremium')}
            </span>
          </div>
        </button>

        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#9B8B7A',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {tr('profile.profileDetails')}
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#2D1B00',
                  marginTop: '2px',
                }}
              >
                {tr('profile.updateProfile')}
              </p>
            </div>
            <label
              className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: '#FFF5E4',
                border: '1.5px solid #E8D5B0',
                color: '#7A1E1E',
              }}
            >
              <Camera size={16} strokeWidth={1.8} />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {tr('profile.photo')}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <ProfileField
              icon={<User size={17} color="#C9A87C" />}
              label={tr('profile.fullName')}
              value={form.name}
              onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              placeholder={tr('profile.enterName')}
            />
            <ProfileField
              icon={<Mail size={17} color="#C9A87C" />}
              label={tr('profile.emailAddress')}
              type="email"
              value={form.email}
              onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              placeholder={tr('profile.enterEmail')}
            />
            <ProfileField
              icon={<Phone size={17} color="#C9A87C" />}
              label={tr('profile.contactNumber')}
              type="tel"
              value={form.phone}
              onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              placeholder={tr('profile.enterContact')}
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7A1E1E 0%, #FF8C42 100%)',
                color: '#FFF5E4',
                boxShadow: '0 6px 18px rgba(122,30,30,0.22)',
              }}
            >
              {saved ? <Camera size={17} strokeWidth={2} /> : <Save size={17} strokeWidth={2} />}
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {saved ? tr('profile.profileSaved') : tr('profile.saveProfile')}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Preferences */}
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
        >
          <h3
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: '#9B8B7A',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            {tr('profile.preferences')}
          </h3>

          {/* Language */}
          <div className="flex items-center gap-4 py-1 mb-3">
            <div
              className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '42px', height: '42px', background: '#7A1E1E12' }}
            >
              <Globe size={19} color="#7A1E1E" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500, color: '#2D1B00' }}>
                {tr('profile.appLanguage')}
              </p>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => setPreference('language', e.target.value as typeof preferences.language)}
              className="rounded-xl px-3 py-1.5 outline-none"
              style={{
                background: '#FFF5E4',
                border: '1.5px solid #E8D5B0',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                color: '#7A1E1E',
                maxWidth: '110px',
              }}
            >
              {appLanguageOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {preferences.language === 'english' && (
            <>
              <div className="h-px mx-2 my-3" style={{ background: '#F0E0C8' }} />
              <div className="flex items-center gap-4 py-1 mb-1">
                <div
                  className="flex items-center justify-center rounded-2xl shrink-0"
                  style={{ width: '42px', height: '42px', background: '#FF8C4212' }}
                >
                  <Globe size={19} color="#FF8C42" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 500, color: '#2D1B00' }}>
                    {tr('profile.prayerSourceLanguage')}
                  </p>
                </div>
                <select
                  value={preferences.prayerSourceLanguage}
                  onChange={(e) =>
                    setPreference('prayerSourceLanguage', e.target.value as typeof preferences.prayerSourceLanguage)
                  }
                  className="rounded-xl px-3 py-1.5 outline-none"
                  style={{
                    background: '#FFF5E4',
                    border: '1.5px solid #E8D5B0',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#7A1E1E',
                    maxWidth: '130px',
                  }}
                >
                  {prayerSourceLanguageOptions.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="h-px mx-2 mb-3" style={{ background: '#F0E0C8' }} />

          <SettingToggle
            icon={<Moon size={19} color="#5C6BC0" strokeWidth={1.8} />}
            label={tr('profile.darkMode')}
            sublabel={tr('profile.easierReading')}
            value={preferences.darkMode}
            onChange={(v) => setPreference('darkMode', v)}
            color="#5C6BC0"
          />

          <div className="h-px mx-2 my-3" style={{ background: '#F0E0C8' }} />

          <SettingToggle
            icon={<Bell size={19} color="#FF8C42" strokeWidth={1.8} />}
            label={tr('profile.dailyReminders')}
            sublabel={tr('profile.prayerTimeNotifications')}
            value={preferences.notifications}
            onChange={(v) => setPreference('notifications', v)}
            color="#FF8C42"
          />

          <div className="h-px mx-2 my-3" style={{ background: '#F0E0C8' }} />

          <SettingLink
            icon={<Bell size={19} color="#D4AF37" strokeWidth={1.8} />}
            label={tr('profile.manageReminderSchedule')}
            sublabel={tr('profile.reminderScheduleHelp')}
            color="#D4AF37"
            onClick={() => navigate('/reminders')}
          />
        </div>

        {/* Support */}
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: '#FFFFFF', border: '1.5px solid #F0E0C8' }}
        >
          <h3
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: '#9B8B7A',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            {tr('profile.support')}
          </h3>

          <SettingLink
            icon={<Info size={19} color="#2E7D32" strokeWidth={1.8} />}
            label={tr('profile.aboutApp')}
            sublabel="Version 1.0.0"
            color="#2E7D32"
          />
          <div className="h-px mx-2 my-3" style={{ background: '#F0E0C8' }} />
          <SettingLink
            icon={<Shield size={19} color="#5C6BC0" strokeWidth={1.8} />}
            label={tr('profile.privacyPolicy')}
            color="#5C6BC0"
          />
          <div className="h-px mx-2 my-3" style={{ background: '#F0E0C8' }} />
          <SettingLink
            icon={<MessageCircle size={19} color="#FF8C42" strokeWidth={1.8} />}
            label={tr('profile.contactSupport')}
            sublabel={tr('profile.contactSupportHelp')}
            color="#FF8C42"
          />
        </div>

        {/* Sign out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
          style={{
            background: 'rgba(122,30,30,0.06)',
            border: '1.5px solid rgba(122,30,30,0.15)',
            color: '#7A1E1E',
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {tr('profile.signOut')}
          </span>
        </motion.button>

        {/* App tagline */}
        <div className="flex flex-col items-center mt-6 gap-1 opacity-50">
          <span style={{ fontSize: '20px' }}>ॐ</span>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '13px',
              fontStyle: 'italic',
              color: '#7A1E1E',
            }}
          >
            {tr('profile.tagline')}
          </p>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
