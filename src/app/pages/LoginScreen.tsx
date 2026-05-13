import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, signUp, loginAsGuest, loginWithGoogle, preferences, authBusy } = useApp();
  const tr = (key: string) => t(preferences.language, key);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'notice'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const result =
        mode === 'signup'
          ? await signUp(name || tr('home.devotee'), email, password)
          : await login(email, password);

      if (!result.ok) {
        setFeedback({
          tone: 'error',
          message: result.error || 'Unable to complete sign in right now.',
        });
        return;
      }

      if (result.notice) {
        setFeedback({ tone: 'notice', message: result.notice });
        if (mode === 'signup') {
          return;
        }
      }

      navigate('/home', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/home', { replace: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await loginWithGoogle();
      if (!result.ok) {
        setFeedback({
          tone: 'error',
          message: result.error || 'Google sign-in could not be started right now.',
        });
        return;
      }

      if (result.notice) {
        setFeedback({ tone: 'notice', message: result.notice });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-y-auto"
      style={{ background: '#FFF5E4' }}
    >
      {/* Header with gradient */}
      <div
        className="relative flex flex-col items-center pt-14 pb-10 px-6 shrink-0"
        style={{
          background: 'linear-gradient(160deg, #7A1E1E 0%, #3d0f0f 60%, #FF8C42 140%)',
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px',
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute top-8 right-8 rounded-full opacity-10"
          style={{ width: '80px', height: '80px', border: '2px solid #D4AF37' }}
        />
        <div
          className="absolute top-12 right-12 rounded-full opacity-10"
          style={{ width: '50px', height: '50px', border: '1.5px solid #D4AF37' }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center rounded-full mb-4"
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(212,175,55,0.15)',
            border: '2px solid rgba(212,175,55,0.4)',
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '42px',
              fontWeight: 700,
              color: '#D4AF37',
            }}
          >
            ॐ
          </span>
        </motion.div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '30px',
            fontWeight: 700,
            color: '#FFF5E4',
            letterSpacing: '1.5px',
          }}
        >
          BhaktiVerse
        </h1>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '12px',
            fontWeight: 300,
            color: 'rgba(255,245,228,0.65)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          {tr('login.subtitle')}
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 pt-6 pb-8">
        {/* Mode tabs */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: 'rgba(122,30,30,0.08)' }}
        >
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: mode === m ? '#7A1E1E' : 'transparent',
                color: mode === m ? '#FFF5E4' : '#7A1E1E',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              {m === 'login' ? tr('login.signIn') : tr('login.signUp')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {feedback ? (
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: feedback.tone === 'error' ? '#FFF0ED' : '#FFF8EE',
                border: `1.5px solid ${feedback.tone === 'error' ? '#F2B7A8' : '#E8D5B0'}`,
              }}
            >
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: feedback.tone === 'error' ? '#9F2F1E' : '#7A5C3F',
                  lineHeight: 1.6,
                }}
              >
                {feedback.message}
              </p>
            </div>
          ) : null}

          {mode === 'signup' && (
            <div className="relative">
              <User
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                color="#C9A87C"
              />
              <input
                type="text"
                placeholder={tr('login.fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl outline-none transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E8D5B0',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '14px',
                  color: '#2D1B00',
                }}
              />
            </div>
          )}

          <div className="relative">
            <Mail
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              color="#C9A87C"
            />
            <input
              type="email"
              placeholder={tr('login.emailAddress')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-4 rounded-2xl outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E8D5B0',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '14px',
                color: '#2D1B00',
              }}
            />
          </div>

          <div className="relative">
            <Lock
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              color="#C9A87C"
            />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={tr('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-11 pr-12 py-4 rounded-2xl outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E8D5B0',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '14px',
                color: '#2D1B00',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPass ? (
                <EyeOff size={17} color="#C9A87C" />
              ) : (
                <Eye size={17} color="#C9A87C" />
              )}
            </button>
          </div>

          {mode === 'login' && (
            <button
              type="button"
              className="self-end"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '12px',
                color: '#7A1E1E',
                fontWeight: 500,
              }}
            >
              {tr('login.forgotPassword')}
            </button>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={loading || authBusy}
            className="w-full py-4 rounded-2xl mt-1 flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #7A1E1E 0%, #FF8C42 100%)',
              color: '#FFF5E4',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              boxShadow: '0 6px 20px rgba(122,30,30,0.35)',
              opacity: loading || authBusy ? 0.75 : 1,
            }}
          >
            {loading || authBusy ? (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    className="rounded-full bg-white"
                    style={{ width: '7px', height: '7px' }}
                  />
                ))}
              </div>
            ) : (
              <>{mode === 'login' ? tr('login.signIn') : tr('login.createAccount')}</>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              color: '#9B8B7A',
            }}
          >
            {tr('login.or')}
          </span>
          <div className="flex-1 h-px" style={{ background: '#E8D5B0' }} />
        </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || authBusy}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 mb-3"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E8D5B0',
              color: '#2D1B00',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              opacity: loading || authBusy ? 0.75 : 1,
            }}
          >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: '22px',
              height: '22px',
              background: 'linear-gradient(135deg, #4285F4 0%, #EA4335 50%, #FBBC05 75%, #34A853 100%)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            G
          </div>
          {tr('login.continueWithGoogle')}
        </motion.button>

        {/* Guest button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGuest}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'transparent',
            border: '1.5px solid #D4AF37',
            color: '#7A1E1E',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: '18px' }}>🙏</span>
          {tr('login.continueAsGuest')}
        </motion.button>

        <p
          className="text-center mt-6"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '11px',
            color: '#9B8B7A',
          }}
        >
          {tr('login.termsPrefix')}{' '}
          <span style={{ color: '#7A1E1E', fontWeight: 500 }}>{tr('login.termsLink')}</span>
        </p>
      </div>
    </div>
  );
}
