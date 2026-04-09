import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppLanguage, PrayerSourceLanguage } from '../i18n';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo?: string;
  isGuest: boolean;
  authProvider: 'email' | 'google' | 'guest';
}

export interface AppPreferences {
  language: AppLanguage;
  prayerSourceLanguage: PrayerSourceLanguage;
  darkMode: boolean;
  notifications: boolean;
  calendarReminders: boolean;
  festivalReminders: boolean;
  reminderTime: string;
  fontSize: number; // 1 = small, 2 = medium, 3 = large
}

export type SubscriptionTier = 'free' | 'premium_individual' | 'premium_family';

interface AppContextType {
  user: UserProfile | null;
  preferences: AppPreferences;
  favorites: string[];
  subscriptionTier: SubscriptionTier;
  hasPremiumAccess: boolean;
  login: (name: string, email: string) => void;
  loginWithGoogle: (name: string, email: string, photo?: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addFavorite: (prayerId: string) => void;
  removeFavorite: (prayerId: string) => void;
  isFavorite: (prayerId: string) => boolean;
  setPreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
}

const defaultPreferences: AppPreferences = {
  language: 'english',
  prayerSourceLanguage: 'hindi',
  darkMode: false,
  notifications: true,
  calendarReminders: true,
  festivalReminders: true,
  reminderTime: '06:00',
  fontSize: 2,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('bhaktiverse_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return {
        phone: '',
        photo: '',
        authProvider: parsed?.isGuest ? 'guest' : 'email',
        ...parsed,
      };
    } catch {
      return null;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('bhaktiverse_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    try {
      const stored = localStorage.getItem('bhaktiverse_prefs');
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>(() => {
    try {
      const stored = localStorage.getItem('bhaktiverse_subscription_tier');
      if (stored === 'premium_individual' || stored === 'premium_family') {
        return stored;
      }
      return 'free';
    } catch {
      return 'free';
    }
  });

  const hasPremiumAccess = subscriptionTier !== 'free';

  useEffect(() => {
    if (user) localStorage.setItem('bhaktiverse_user', JSON.stringify(user));
    else localStorage.removeItem('bhaktiverse_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bhaktiverse_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('bhaktiverse_prefs', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('bhaktiverse_subscription_tier', subscriptionTier);
  }, [subscriptionTier]);

  const login = useCallback((name: string, email: string) => {
    setUser({ name, email, phone: '', photo: '', isGuest: false, authProvider: 'email' });
  }, []);

  const loginWithGoogle = useCallback((name: string, email: string, photo?: string) => {
    setUser({
      name,
      email,
      phone: '',
      photo: photo || '',
      isGuest: false,
      authProvider: 'google',
    });
  }, []);

  const loginAsGuest = useCallback(() => {
    setUser({
      name: 'Devotee',
      email: '',
      phone: '',
      photo: '',
      isGuest: true,
      authProvider: 'guest',
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFavorites([]);
  }, []);

  const addFavorite = useCallback((prayerId: string) => {
    setFavorites((prev) => (prev.includes(prayerId) ? prev : [...prev, prayerId]));
  }, []);

  const removeFavorite = useCallback((prayerId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== prayerId));
  }, []);

  const isFavorite = useCallback(
    (prayerId: string) => favorites.includes(prayerId),
    [favorites]
  );

  const setPreference = useCallback(
    <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const setSubscriptionTier = useCallback((tier: SubscriptionTier) => {
    setSubscriptionTierState(tier);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        preferences,
        favorites,
        subscriptionTier,
        hasPremiumAccess,
        login,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateProfile,
        addFavorite,
        removeFavorite,
        isFavorite,
        setPreference,
        setSubscriptionTier,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
