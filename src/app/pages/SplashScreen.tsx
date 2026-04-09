import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, preferences } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(user ? '/home' : '/login', { replace: true });
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #7A1E1E 0%, #3d0f0f 45%, #FF8C42 100%)',
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 rounded-full opacity-10"
        style={{
          width: '260px',
          height: '260px',
          background: '#D4AF37',
          transform: 'translate(80px, -80px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 rounded-full opacity-10"
        style={{
          width: '200px',
          height: '200px',
          background: '#D4AF37',
          transform: 'translate(-60px, 60px)',
        }}
      />

      {/* Lotus petal decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div
          className="rounded-full"
          style={{ width: '380px', height: '380px', border: '2px solid #D4AF37' }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div
          className="rounded-full"
          style={{ width: '320px', height: '320px', border: '1.5px solid #D4AF37' }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-6 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Om symbol */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '120px',
              height: '120px',
              background: 'rgba(212,175,55,0.15)',
              border: '2px solid rgba(212,175,55,0.5)',
              boxShadow:
                '0 0 40px rgba(212,175,55,0.3), 0 0 80px rgba(212,175,55,0.1), inset 0 0 30px rgba(212,175,55,0.1)',
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '64px',
                fontWeight: 700,
                color: '#D4AF37',
                lineHeight: 1,
                textShadow: '0 0 20px rgba(212,175,55,0.6)',
              }}
            >
              ॐ
            </span>
          </div>
        </motion.div>

        {/* App name */}
        <div className="flex flex-col items-center gap-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '40px',
              fontWeight: 700,
              color: '#FFF5E4',
              letterSpacing: '2px',
              lineHeight: 1.1,
            }}
          >
            BhaktiVerse
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '13px',
              fontWeight: 300,
              color: 'rgba(255,245,228,0.7)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            {t(preferences.language, 'splash.subtitle')}
          </motion.p>
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-16 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            className="rounded-full"
            style={{ width: '7px', height: '7px', background: '#D4AF37' }}
          />
        ))}
      </motion.div>

      {/* Temple silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-15">
        <svg width="390" height="60" viewBox="0 0 390 60" fill="none">
          {/* Simple temple silhouette */}
          <path
            d="M0 60 L0 40 L30 40 L30 30 L45 30 L45 20 L55 20 L55 15 L65 15 L65 10 L75 10 L75 5 L85 5 L85 10 L90 10 L90 20 L100 20 L100 30 L115 30 L115 40 L150 40 L150 60 Z"
            fill="#FFF5E4"
          />
          <path
            d="M240 60 L240 40 L270 40 L270 30 L285 30 L285 20 L295 20 L295 15 L305 15 L305 10 L315 10 L315 5 L325 5 L325 10 L330 10 L330 20 L340 20 L340 30 L355 30 L355 40 L390 40 L390 60 Z"
            fill="#FFF5E4"
          />
          <rect x="155" y="40" width="80" height="20" fill="#FFF5E4" />
        </svg>
      </div>
    </div>
  );
}
