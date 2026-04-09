import { useNavigate, useLocation } from 'react-router';
import { Home, Search, Headphones, Heart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

const tabs = [
  { path: '/home', label: 'Home', Icon: Home },
  { path: '/search', label: 'Search', Icon: Search },
  { path: '/audio', label: 'Audio', Icon: Headphones },
  { path: '/favorites', label: 'Favorites', Icon: Heart },
  { path: '/profile', label: 'Profile', Icon: User },
];

export function BottomNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { preferences } = useApp();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderTop: '1px solid #F0E0C8',
        boxShadow: '0 -4px 20px rgba(122,30,30,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ path, label, Icon }) => {
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200"
              style={{
                background: active ? 'rgba(255,140,66,0.12)' : 'transparent',
                color: active ? '#FF8C42' : '#9B8B7A',
              }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                fill={active && label === 'Favorites' ? '#FF8C42' : 'none'}
              />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '10px',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.3px',
                }}
              >
                {t(preferences.language, `nav.${label.toLowerCase()}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
