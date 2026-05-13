import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppLanguage, PrayerSourceLanguage } from '../i18n';
import { isWebSupabaseConfigured, webSupabase } from '../lib/webSupabase';

export interface UserProfile {
  id?: string;
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
  fontSize: number;
}

export type SubscriptionTier = 'free' | 'premium_individual' | 'premium_family';
export type EntitlementStatus =
  | 'inactive'
  | 'trial'
  | 'active'
  | 'grace_period'
  | 'canceled'
  | 'expired';

export type WebAuthActionResult = {
  ok: boolean;
  error?: string;
  notice?: string;
};

interface AppContextType {
  user: UserProfile | null;
  preferences: AppPreferences;
  favorites: string[];
  subscriptionTier: SubscriptionTier;
  entitlementStatus: EntitlementStatus;
  entitlementValidUntil: string | null;
  hasPremiumAccess: boolean;
  authReady: boolean;
  authBusy: boolean;
  isSupabaseConnected: boolean;
  refreshSessionState: () => Promise<void>;
  login: (email: string, password: string) => Promise<WebAuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<WebAuthActionResult>;
  loginWithGoogle: () => Promise<WebAuthActionResult>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<WebAuthActionResult>;
  addFavorite: (prayerId: string) => void;
  removeFavorite: (prayerId: string) => void;
  isFavorite: (prayerId: string) => boolean;
  setPreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
}

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  contact_number: string | null;
  avatar_url: string | null;
  app_language: string | null;
  prayer_source_language: string | null;
};

type UserPreferencesRow = {
  user_id: string;
  notifications_enabled: boolean;
  daily_reminder_enabled: boolean;
  festival_reminder_enabled: boolean;
  reminder_time_local: string;
};

type UserEntitlementRow = {
  user_id: string;
  subscription_tier: SubscriptionTier;
  entitlement_status: EntitlementStatus;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  product_code: string | null;
  valid_until: string | null;
  is_lifetime: boolean;
};

const USER_STORAGE_KEY = 'bhaktiverse_user';
const FAVORITES_STORAGE_KEY = 'bhaktiverse_favorites';
const PREFS_STORAGE_KEY = 'bhaktiverse_prefs';
const SUBSCRIPTION_STORAGE_KEY = 'bhaktiverse_subscription_tier';

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

function normalizeAppLanguage(value: string | null | undefined): AppLanguage {
  if (value === 'hindi' || value === 'telugu' || value === 'kannada' || value === 'tamil' || value === 'marathi') {
    return value;
  }
  return 'english';
}

function normalizePrayerSourceLanguage(value: string | null | undefined): PrayerSourceLanguage {
  if (
    value === 'hindi' ||
    value === 'telugu' ||
    value === 'kannada' ||
    value === 'tamil' ||
    value === 'marathi' ||
    value === 'sanskrit'
  ) {
    return value;
  }
  return 'english';
}

function readStoredGuestUser(): UserProfile | null {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed?.isGuest) return null;
    return {
      id: undefined,
      name: parsed.name || 'Devotee',
      email: '',
      phone: parsed.phone || '',
      photo: parsed.photo || '',
      isGuest: true,
      authProvider: 'guest',
    };
  } catch {
    return null;
  }
}

function readStoredFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function readStoredPreferences(): AppPreferences {
  try {
    const stored = localStorage.getItem(PREFS_STORAGE_KEY);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function readStoredSubscriptionTier(): SubscriptionTier {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (stored === 'premium_individual' || stored === 'premium_family') {
      return stored;
    }
  } catch {
    // Ignore malformed local storage.
  }
  return 'free';
}

function hasActivePremiumEntitlement(
  subscriptionTier: SubscriptionTier,
  entitlementStatus: EntitlementStatus,
  entitlementValidUntil: string | null,
  isLifetime: boolean
) {
  if (subscriptionTier === 'free') return false;
  if (isLifetime) return true;
  if (entitlementStatus === 'active' || entitlementStatus === 'trial' || entitlementStatus === 'grace_period') {
    return true;
  }

  if (entitlementStatus === 'canceled' && entitlementValidUntil) {
    return new Date(entitlementValidUntil).getTime() > Date.now();
  }

  return false;
}

function createDefaultEntitlement(userId: string): UserEntitlementRow {
  return {
    user_id: userId,
    subscription_tier: 'free',
    entitlement_status: 'inactive',
    provider: 'manual',
    provider_customer_id: null,
    provider_subscription_id: null,
    product_code: null,
    valid_until: null,
    is_lifetime: false,
  };
}

function isMissingEntitlementsTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42P01' || error.message?.includes('user_entitlements') || false;
}

async function ensureProfile(authUser: User): Promise<ProfileRow> {
  const { data, error } = await webSupabase!
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  if (data) return data;

  const fullName =
    (typeof authUser.user_metadata?.full_name === 'string' && authUser.user_metadata.full_name) ||
    authUser.email?.split('@')[0] ||
    'Devotee';

  const { data: inserted, error: insertError } = await webSupabase!
    .from('profiles')
    .insert({
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: fullName,
      app_language: 'english',
      prayer_source_language: 'hindi',
    })
    .select('*')
    .single<ProfileRow>();

  if (insertError) throw insertError;
  return inserted;
}

async function ensurePreferences(userId: string): Promise<UserPreferencesRow> {
  const { data, error } = await webSupabase!
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<UserPreferencesRow>();

  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertError } = await webSupabase!
    .from('user_preferences')
    .insert({
      user_id: userId,
      notifications_enabled: true,
      daily_reminder_enabled: true,
      festival_reminder_enabled: true,
      reminder_time_local: '06:00',
    })
    .select('*')
    .single<UserPreferencesRow>();

  if (insertError) throw insertError;
  return inserted;
}

async function ensureEntitlement(userId: string): Promise<UserEntitlementRow> {
  const { data, error } = await webSupabase!
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<UserEntitlementRow>();

  if (error) {
    if (isMissingEntitlementsTable(error)) {
      return createDefaultEntitlement(userId);
    }
    throw error;
  }

  if (data) return data;

  const defaultEntitlement = createDefaultEntitlement(userId);
  const { data: inserted, error: insertError } = await webSupabase!
    .from('user_entitlements')
    .insert(defaultEntitlement)
    .select('*')
    .single<UserEntitlementRow>();

  if (insertError) {
    if (isMissingEntitlementsTable(insertError)) {
      return defaultEntitlement;
    }
    throw insertError;
  }

  return inserted;
}

async function getFavoritePrayerIds(userId: string): Promise<string[]> {
  const { data, error } = await webSupabase!
    .from('user_favorites')
    .select('prayer:prayers(slug)')
    .eq('user_id', userId);

  if (error) throw error;

  return data?.flatMap((row: any) => (row.prayer?.slug ? [row.prayer.slug as string] : [])) ?? [];
}

async function addFavoritePrayer(userId: string, prayerId: string) {
  const { data: prayer, error: prayerError } = await webSupabase!
    .from('prayers')
    .select('id')
    .eq('slug', prayerId)
    .maybeSingle<{ id: string }>();

  if (prayerError) throw prayerError;
  if (!prayer?.id) return;

  const { error } = await webSupabase!.from('user_favorites').upsert({
    user_id: userId,
    prayer_id: prayer.id,
  });

  if (error) throw error;
}

async function removeFavoritePrayer(userId: string, prayerId: string) {
  const { data: prayer, error: prayerError } = await webSupabase!
    .from('prayers')
    .select('id')
    .eq('slug', prayerId)
    .maybeSingle<{ id: string }>();

  if (prayerError) throw prayerError;
  if (!prayer?.id) return;

  const { error } = await webSupabase!
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('prayer_id', prayer.id);

  if (error) throw error;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => readStoredGuestUser());
  const [preferences, setPreferences] = useState<AppPreferences>(() => readStoredPreferences());
  const [favorites, setFavorites] = useState<string[]>(() => readStoredFavorites());
  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>('free');
  const [entitlementStatus, setEntitlementStatus] = useState<EntitlementStatus>('inactive');
  const [entitlementValidUntil, setEntitlementValidUntil] = useState<string | null>(null);
  const [entitlementIsLifetime, setEntitlementIsLifetime] = useState(false);
  const [authReady, setAuthReady] = useState(!isWebSupabaseConfigured);
  const [authBusy, setAuthBusy] = useState(false);

  const applyLoadedUserState = useCallback(
    async (authUser: User) => {
      const [profile, persistedPreferences, favoritePrayerIds, entitlement] = await Promise.all([
        ensureProfile(authUser),
        ensurePreferences(authUser.id),
        getFavoritePrayerIds(authUser.id),
        ensureEntitlement(authUser.id),
      ]);

      const nextLanguage = normalizeAppLanguage(profile.app_language);
      const nextPrayerSourceLanguage = normalizePrayerSourceLanguage(profile.prayer_source_language);

      setUser({
        id: authUser.id,
        name: profile.full_name || authUser.email?.split('@')[0] || 'Devotee',
        email: profile.email || authUser.email || '',
        phone: profile.contact_number || '',
        photo: profile.avatar_url || '',
        isGuest: false,
        authProvider: 'email',
      });
      setPreferences((current) => ({
        ...current,
        language: nextLanguage,
        prayerSourceLanguage: nextPrayerSourceLanguage,
        notifications: persistedPreferences.notifications_enabled,
        calendarReminders: persistedPreferences.daily_reminder_enabled,
        festivalReminders: persistedPreferences.festival_reminder_enabled,
        reminderTime: persistedPreferences.reminder_time_local || current.reminderTime,
      }));
      setFavorites(favoritePrayerIds);
      setSubscriptionTierState(entitlement.subscription_tier);
      setEntitlementStatus(entitlement.entitlement_status);
      setEntitlementValidUntil(entitlement.valid_until);
      setEntitlementIsLifetime(entitlement.is_lifetime);
    },
    []
  );

  const resetToGuestOrSignedOut = useCallback(() => {
    const guestUser = readStoredGuestUser();
    setUser(guestUser);
    setFavorites(readStoredFavorites());
    setPreferences(readStoredPreferences());
    setSubscriptionTierState(guestUser ? readStoredSubscriptionTier() : 'free');
    setEntitlementStatus('inactive');
    setEntitlementValidUntil(null);
    setEntitlementIsLifetime(false);
  }, []);

  const refreshSessionState = useCallback(async () => {
    if (!isWebSupabaseConfigured || !webSupabase) {
      setAuthReady(true);
      return;
    }

    const {
      data: { session },
    } = await webSupabase.auth.getSession();

    if (session?.user) {
      await applyLoadedUserState(session.user);
    } else {
      resetToGuestOrSignedOut();
    }

    setAuthReady(true);
  }, [applyLoadedUserState, resetToGuestOrSignedOut]);

  useEffect(() => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user?.isGuest) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }
    localStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    if (user?.isGuest) {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, subscriptionTier);
      return;
    }

    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  }, [subscriptionTier, user]);

  useEffect(() => {
    if (!isWebSupabaseConfigured || !webSupabase) {
      setAuthReady(true);
      return;
    }

    let active = true;

    async function bootstrap() {
      try {
        await refreshSessionState();
      } catch (error) {
        console.warn('Failed to bootstrap web auth session', error);
        if (active) {
          resetToGuestOrSignedOut();
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = webSupabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        try {
          if (session?.user) {
            await applyLoadedUserState(session.user);
          } else {
            resetToGuestOrSignedOut();
          }
        } catch (error) {
          console.warn('Failed to refresh web auth session', error);
          resetToGuestOrSignedOut();
        } finally {
          setAuthReady(true);
        }
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshSessionState, applyLoadedUserState, resetToGuestOrSignedOut]);

  const login = useCallback(async (email: string, password: string): Promise<WebAuthActionResult> => {
    if (!isWebSupabaseConfigured || !webSupabase) {
      setUser({
        name: email.split('@')[0] || 'Devotee',
        email,
        phone: '',
        photo: '',
        isGuest: false,
        authProvider: 'email',
      });
      return { ok: true };
    }

    setAuthBusy(true);
    try {
      const { error } = await webSupabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<WebAuthActionResult> => {
      if (!isWebSupabaseConfigured || !webSupabase) {
        setUser({
          name: name || email.split('@')[0] || 'Devotee',
          email,
          phone: '',
          photo: '',
          isGuest: false,
          authProvider: 'email',
        });
        return { ok: true };
      }

      setAuthBusy(true);
      try {
        const { data, error } = await webSupabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          return { ok: false, error: error.message };
        }

        if (!data.session) {
          return {
            ok: true,
            notice: 'Your account was created. Please check your email to confirm your sign-in.',
          };
        }

        return { ok: true };
      } finally {
        setAuthBusy(false);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<WebAuthActionResult> => {
    if (!isWebSupabaseConfigured || !webSupabase) {
      return { ok: false, error: 'Google sign-in needs Supabase to be configured on the web app.' };
    }

    setAuthBusy(true);
    try {
      const { error } = await webSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      return { ok: true, notice: 'Continue the Google sign-in flow in the opened window.' };
    } finally {
      setAuthBusy(false);
    }
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
    setFavorites(readStoredFavorites());
    setSubscriptionTierState('free');
    setEntitlementStatus('inactive');
    setEntitlementValidUntil(null);
    setEntitlementIsLifetime(false);
  }, []);

  const logout = useCallback(async () => {
    setAuthBusy(true);
    try {
      if (user?.isGuest || !isWebSupabaseConfigured || !webSupabase) {
        setUser(null);
        setFavorites([]);
        setSubscriptionTierState('free');
        setEntitlementStatus('inactive');
        setEntitlementValidUntil(null);
        setEntitlementIsLifetime(false);
        localStorage.removeItem(USER_STORAGE_KEY);
        return;
      }

      const { error } = await webSupabase.auth.signOut();
      if (error) {
        console.warn('Failed to sign out from Supabase on web', error);
      }
      setFavorites([]);
    } finally {
      setAuthBusy(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<WebAuthActionResult> => {
      setUser((current) => (current ? { ...current, ...updates } : current));

      if (user?.isGuest || !user?.id || !isWebSupabaseConfigured || !webSupabase) {
        return { ok: true };
      }

      try {
        if (updates.email && updates.email !== user.email) {
          const { error: authError } = await webSupabase.auth.updateUser({
            email: updates.email,
          });
          if (authError) {
            return { ok: false, error: authError.message };
          }
        }

        const payload: Record<string, string | null> = {};
        if (updates.name !== undefined) payload.full_name = updates.name || null;
        if (updates.email !== undefined) payload.email = updates.email || '';
        if (updates.phone !== undefined) payload.contact_number = updates.phone || null;
        if (updates.photo !== undefined) payload.avatar_url = updates.photo || null;

        const { error } = await webSupabase.from('profiles').update(payload).eq('id', user.id);
        if (error) {
          return { ok: false, error: error.message };
        }

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Unable to update your profile right now.',
        };
      }
    },
    [user]
  );

  const addFavorite = useCallback(
    (prayerId: string) => {
      setFavorites((prev) => (prev.includes(prayerId) ? prev : [...prev, prayerId]));

      if (user?.id && !user.isGuest && isWebSupabaseConfigured && webSupabase) {
        void addFavoritePrayer(user.id, prayerId).catch((error) => {
          console.warn('Failed to sync favorite prayer on web', error);
        });
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    (prayerId: string) => {
      setFavorites((prev) => prev.filter((id) => id !== prayerId));

      if (user?.id && !user.isGuest && isWebSupabaseConfigured && webSupabase) {
        void removeFavoritePrayer(user.id, prayerId).catch((error) => {
          console.warn('Failed to remove favorite prayer on web', error);
        });
      }
    },
    [user]
  );

  const isFavorite = useCallback((prayerId: string) => favorites.includes(prayerId), [favorites]);

  const setPreference = useCallback(
    <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      const nextPreferences: AppPreferences = {
        ...preferences,
        [key]: value,
      };

      if (key === 'language' && value !== 'english') {
        nextPreferences.prayerSourceLanguage = value as PrayerSourceLanguage;
      }

      setPreferences(nextPreferences);

      if (!user?.id || user.isGuest || !isWebSupabaseConfigured || !webSupabase) {
        return;
      }

      if (key === 'language' || key === 'prayerSourceLanguage') {
        void webSupabase
          .from('profiles')
          .update({
            app_language: nextPreferences.language,
            prayer_source_language: nextPreferences.prayerSourceLanguage,
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.warn('Failed to save language preferences on web', error);
            }
          });
        return;
      }

      if (
        key === 'notifications' ||
        key === 'calendarReminders' ||
        key === 'festivalReminders' ||
        key === 'reminderTime'
      ) {
        void webSupabase
          .from('user_preferences')
          .update({
            notifications_enabled: nextPreferences.notifications,
            daily_reminder_enabled: nextPreferences.calendarReminders,
            festival_reminder_enabled: nextPreferences.festivalReminders,
            reminder_time_local: nextPreferences.reminderTime,
          })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) {
              console.warn('Failed to save reminder preferences on web', error);
            }
          });
      }
    },
    [preferences, user]
  );

  const hasPremiumAccess = useMemo(
    () => hasActivePremiumEntitlement(subscriptionTier, entitlementStatus, entitlementValidUntil, entitlementIsLifetime),
    [subscriptionTier, entitlementStatus, entitlementValidUntil, entitlementIsLifetime]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        preferences,
        favorites,
        subscriptionTier,
        entitlementStatus,
        entitlementValidUntil,
        hasPremiumAccess,
        authReady,
        authBusy,
        isSupabaseConnected: isWebSupabaseConfigured,
        refreshSessionState,
        login,
        signUp,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateProfile,
        addFavorite,
        removeFavorite,
        isFavorite,
        setPreference,
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
