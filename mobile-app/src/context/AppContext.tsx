import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getInitialSession,
  loginWithGoogle as unsupportedGoogleLogin,
  signInWithEmail,
  signOutFromSupabase,
  signUpWithEmail,
  subscribeToAuthChanges,
  type AuthActionResult,
} from "../lib/supabase/auth";
import { registerForPushNotificationsAsync, type NotificationRegistrationResult } from "../lib/notifications";
import { isSupabaseConfigured } from "../lib/supabase/client";
import {
  addFavoritePrayer,
  loadUserState,
  logNotificationEvent,
  removeFavoritePrayer,
  saveLanguagePreferences,
  saveProfileDetails,
  saveReminderPreferences,
  saveUserDevice,
  saveUserEntitlement,
} from "../lib/supabase/profile";
import type { EntitlementStatus, SubscriptionTier } from "../lib/supabase/types";
import {
  addRevenueCatCustomerInfoListener,
  fetchRevenueCatCustomerInfo,
  getRevenueCatEntitlementState,
  syncRevenueCatUser,
  type RevenueCatEntitlementState,
} from "../lib/billing/revenuecat";

export type MobileUser = {
  id?: string;
  name: string;
  email: string;
  isGuest?: boolean;
  contactNumber?: string;
  photoUri?: string;
};

type AppContextValue = {
  user: MobileUser | null;
  appLanguage: string;
  prayerSourceLanguage: string;
  subscriptionTier: SubscriptionTier;
  entitlementStatus: EntitlementStatus;
  entitlementValidUntil: string | null;
  hasPremiumAccess: boolean;
  hasFamilyAccess: boolean;
  dailyReminderEnabled: boolean;
  festivalReminderEnabled: boolean;
  reminderTime: string;
  favoritePrayerIds: string[];
  pushRegistrationStatus: NotificationRegistrationResult["status"] | "idle";
  pushRegistrationMessage: string;
  expoPushToken: string | null;
  authReady: boolean;
  authBusy: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  loginWithGoogle: () => Promise<AuthActionResult>;
  continueAsGuest: () => void;
  updateProfile: (updates: Partial<MobileUser>) => void;
  setAppLanguage: (language: string) => void;
  setPrayerSourceLanguage: (language: string) => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setFestivalReminderEnabled: (enabled: boolean) => void;
  toggleFavoritePrayer: (prayerId: string) => void;
  isFavoritePrayer: (prayerId: string) => boolean;
  registerDeviceForNotifications: () => Promise<NotificationRegistrationResult>;
  scheduleLocalNotificationPreview: (prayerSlug?: string | null) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const defaultFavoritePrayerIds = ["hanuman-chalisa", "ganesh-aarti"];

function hasActivePremiumEntitlement(
  subscriptionTier: SubscriptionTier,
  entitlementStatus: EntitlementStatus,
  entitlementValidUntil: string | null,
  isLifetime: boolean
) {
  if (subscriptionTier === "free") return false;
  if (isLifetime) return true;

  if (entitlementStatus === "active" || entitlementStatus === "trial" || entitlementStatus === "grace_period") {
    return true;
  }

  if (entitlementStatus === "canceled" && entitlementValidUntil) {
    return new Date(entitlementValidUntil).getTime() > Date.now();
  }

  return false;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [appLanguage, setAppLanguageState] = useState("English");
  const [prayerSourceLanguage, setPrayerSourceLanguageState] = useState("Hindi");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [entitlementStatus, setEntitlementStatus] = useState<EntitlementStatus>("inactive");
  const [entitlementValidUntil, setEntitlementValidUntil] = useState<string | null>(null);
  const [entitlementIsLifetime, setEntitlementIsLifetime] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabledState] = useState(true);
  const [festivalReminderEnabled, setFestivalReminderEnabledState] = useState(true);
  const [reminderTime] = useState("6:30 AM");
  const [favoritePrayerIds, setFavoritePrayerIds] = useState<string[]>(defaultFavoritePrayerIds);
  const [pushRegistrationStatus, setPushRegistrationStatus] =
    useState<AppContextValue["pushRegistrationStatus"]>("idle");
  const [pushRegistrationMessage, setPushRegistrationMessage] = useState("");
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const hydrateSessionUser = useCallback(async (authUser: { id: string } | null) => {
    if (!authUser || !isSupabaseConfigured) {
      return;
    }

    const loaded = await loadUserState(authUser as any);
    setUser(loaded.user);
    setAppLanguageState(loaded.appLanguage);
    setPrayerSourceLanguageState(loaded.prayerSourceLanguage);
    setSubscriptionTier(loaded.subscriptionTier);
    setEntitlementStatus(loaded.entitlementStatus);
    setEntitlementValidUntil(loaded.entitlementValidUntil);
    setEntitlementIsLifetime(loaded.entitlementIsLifetime);
    setDailyReminderEnabledState(loaded.dailyReminderEnabled);
    setFestivalReminderEnabledState(loaded.festivalReminderEnabled);
    setFavoritePrayerIds(
      loaded.favoritePrayerIds.length > 0 ? loaded.favoritePrayerIds : defaultFavoritePrayerIds
    );
  }, []);

  const resetLocalSessionState = useCallback(() => {
    setUser(null);
    setAppLanguageState("English");
    setPrayerSourceLanguageState("Hindi");
    setSubscriptionTier("free");
    setEntitlementStatus("inactive");
    setEntitlementValidUntil(null);
    setEntitlementIsLifetime(false);
    setDailyReminderEnabledState(true);
    setFestivalReminderEnabledState(true);
    setFavoritePrayerIds(defaultFavoritePrayerIds);
    setExpoPushToken(null);
    setPushRegistrationStatus("idle");
    setPushRegistrationMessage("");
  }, []);

  const applyRevenueCatEntitlement = useCallback(
    (next: RevenueCatEntitlementState) => {
      setSubscriptionTier(next.subscriptionTier);
      setEntitlementStatus(next.entitlementStatus);
      setEntitlementValidUntil(next.entitlementValidUntil);
      setEntitlementIsLifetime(next.entitlementIsLifetime);
    },
    []
  );

  const persistRevenueCatEntitlement = useCallback(
    async (userId: string, next: RevenueCatEntitlementState) => {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        await saveUserEntitlement(userId, {
          subscriptionTier: next.subscriptionTier,
          entitlementStatus: next.entitlementStatus,
          entitlementValidUntil: next.entitlementValidUntil,
          entitlementIsLifetime: next.entitlementIsLifetime,
          provider: "revenuecat",
          providerCustomerId: userId,
          providerSubscriptionId: null,
          productCode: next.subscriptionTier === "free" ? null : next.subscriptionTier,
        });
      } catch (error) {
        console.warn("Failed to persist RevenueCat entitlement", error);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        if (!isSupabaseConfigured) {
          return;
        }

        const session = await getInitialSession();
        if (active && session?.user) {
          await hydrateSessionUser(session.user);
        }
      } catch (error) {
        console.warn("Failed to bootstrap Supabase session", error);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    bootstrap();

    const subscription = subscribeToAuthChanges(async (_event, session) => {
      try {
        if (session?.user) {
          await hydrateSessionUser(session.user);
        } else {
          resetLocalSessionState();
        }
      } catch (error) {
        console.warn("Failed to refresh auth session", error);
      } finally {
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
      subscription.data.subscription.unsubscribe();
    };
  }, [hydrateSessionUser, resetLocalSessionState]);

  useEffect(() => {
    let active = true;

    async function syncBilling() {
      if (!user?.id || user.isGuest) {
        await syncRevenueCatUser(null);
        return;
      }

      const syncResult = await syncRevenueCatUser(user.id);
      if (!syncResult.ok) {
        return;
      }

      const customerInfo = await fetchRevenueCatCustomerInfo();
      if (!active || !customerInfo) return;

      const mappedEntitlement = getRevenueCatEntitlementState(customerInfo);
      applyRevenueCatEntitlement(mappedEntitlement);

      if (user.id) {
        await persistRevenueCatEntitlement(user.id, mappedEntitlement);
      }
    }

    void syncBilling();

    const unsubscribe =
      addRevenueCatCustomerInfoListener((customerInfo) => {
        if (!active) return;
        const mappedEntitlement = getRevenueCatEntitlementState(customerInfo);
        applyRevenueCatEntitlement(mappedEntitlement);

        if (user?.id && !user.isGuest) {
          void persistRevenueCatEntitlement(user.id, mappedEntitlement);
        }
      }) || undefined;

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [applyRevenueCatEntitlement, persistRevenueCatEntitlement, user?.id, user?.isGuest]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthBusy(true);
    try {
      const result = await signInWithEmail(email, password);
      return result;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setAuthBusy(true);
    try {
      const result = await signUpWithEmail(name, email, password);
      return result;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    return unsupportedGoogleLogin();
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser({
      name: "Guest Devotee",
      email: "",
      isGuest: true,
    });
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<MobileUser>) => {
      setUser((current) => {
        if (!current) return current;
        return { ...current, ...updates };
      });

      if (user?.id && !user.isGuest) {
        void saveProfileDetails(user.id, {
          name: updates.name,
          email: updates.email,
          contactNumber: updates.contactNumber,
          photoUri: updates.photoUri,
        }).catch((error) => {
          console.warn("Failed to save profile details", error);
        });
      }
    },
    [user]
  );

  const setAppLanguage = useCallback(
    (language: string) => {
      setAppLanguageState(language);
      if (language !== "English") {
        setPrayerSourceLanguageState(language);
      }

      if (user?.id && !user.isGuest) {
        void saveLanguagePreferences(
          user.id,
          language,
          language === "English" ? prayerSourceLanguage : language
        ).catch((error) => {
          console.warn("Failed to save app language", error);
        });
      }
    },
    [prayerSourceLanguage, user]
  );

  const setPrayerSourceLanguage = useCallback(
    (language: string) => {
      setPrayerSourceLanguageState(language);

      if (user?.id && !user.isGuest) {
        void saveLanguagePreferences(user.id, appLanguage, language).catch((error) => {
          console.warn("Failed to save prayer source language", error);
        });
      }
    },
    [appLanguage, user]
  );

  const setDailyReminderEnabled = useCallback(
    (enabled: boolean) => {
      setDailyReminderEnabledState(enabled);
      if (user?.id && !user.isGuest) {
        void saveReminderPreferences(user.id, { dailyReminderEnabled: enabled }).catch((error) => {
          console.warn("Failed to save daily reminder preference", error);
        });
      }
    },
    [user]
  );

  const setFestivalReminderEnabled = useCallback(
    (enabled: boolean) => {
      setFestivalReminderEnabledState(enabled);
      if (user?.id && !user.isGuest) {
        void saveReminderPreferences(user.id, { festivalReminderEnabled: enabled }).catch((error) => {
          console.warn("Failed to save festival reminder preference", error);
        });
      }
    },
    [user]
  );

  const toggleFavoritePrayer = useCallback(
    (prayerId: string) => {
      const alreadyFavorite = favoritePrayerIds.includes(prayerId);

      setFavoritePrayerIds((current) =>
        current.includes(prayerId)
          ? current.filter((id) => id !== prayerId)
          : [...current, prayerId]
      );

      if (user?.id && !user.isGuest) {
        const syncAction = alreadyFavorite
          ? removeFavoritePrayer(user.id, prayerId)
          : addFavoritePrayer(user.id, prayerId);

        void syncAction.catch((error) => {
          console.warn("Failed to sync favorite prayer", error);
        });
      }
    },
    [favoritePrayerIds, user]
  );

  const registerDeviceForNotifications = useCallback(async () => {
    const result = await registerForPushNotificationsAsync();
    setPushRegistrationStatus(result.status);
    setPushRegistrationMessage(result.message);

    if (result.token) {
      setExpoPushToken(result.token);

      if (user?.id && !user.isGuest) {
        try {
          await saveUserDevice(user.id, result.token);
          await logNotificationEvent({
            userId: user.id,
            status: "registered",
            provider: "expo_device",
            responsePayload: {
              message: "Device notifications enabled on this iPhone.",
            },
          });
        } catch (error) {
          console.warn("Failed to save push token", error);
          return {
            status: "error" as const,
            message: "Notification token was created, but saving the device failed.",
          };
        }
      }
    } else if (user?.id && !user.isGuest) {
      void logNotificationEvent({
        userId: user.id,
        status: result.status === "denied" ? "denied" : "failed",
        provider: "expo_device",
        responsePayload: {
          message: result.message,
        },
      }).catch((error) => {
        console.warn("Failed to log notification registration result", error);
      });
    }

    return result;
  }, [user]);

  const scheduleLocalNotificationPreview = useCallback(async (prayerSlug?: string | null) => {
    try {
      const notifications = await import("../lib/notifications");
      await notifications.scheduleLocalTestNotification();

      if (user?.id && !user.isGuest) {
        void logNotificationEvent({
          userId: user.id,
          prayerSlug: prayerSlug ?? null,
          status: "sent",
          provider: "local_preview",
          sentAt: new Date().toISOString(),
          responsePayload: {
            title: "BhaktiVerse Reminder",
            message: "Local preview notification triggered from reminders screen.",
          },
        }).catch((error) => {
          console.warn("Failed to log local notification preview", error);
        });
      }

      return { notice: "A local test notification will appear in a few seconds." };
    } catch (error) {
      if (user?.id && !user.isGuest) {
        void logNotificationEvent({
          userId: user.id,
          prayerSlug: prayerSlug ?? null,
          status: "failed",
          provider: "local_preview",
          responsePayload: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to schedule a local notification preview.",
          },
        }).catch((loggingError) => {
          console.warn("Failed to log local notification failure", loggingError);
        });
      }

      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to schedule a local test notification.",
      };
    }
  }, [user]);

  const logout = useCallback(async () => {
    resetLocalSessionState();

    if (user?.isGuest || !user?.id) {
      return;
    }

    try {
      await signOutFromSupabase();
    } catch (error) {
      console.warn("Failed to sign out from Supabase", error);
    }
  }, [resetLocalSessionState, user]);

  const hasPremiumAccess = useMemo(
    () =>
      hasActivePremiumEntitlement(
        subscriptionTier,
        entitlementStatus,
        entitlementValidUntil,
        entitlementIsLifetime
      ),
    [entitlementIsLifetime, entitlementStatus, entitlementValidUntil, subscriptionTier]
  );

  const hasFamilyAccess = hasPremiumAccess && subscriptionTier === "premium_family";

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      appLanguage,
      prayerSourceLanguage,
      subscriptionTier,
      entitlementStatus,
      entitlementValidUntil,
      hasPremiumAccess,
      hasFamilyAccess,
      dailyReminderEnabled,
      festivalReminderEnabled,
      reminderTime,
      favoritePrayerIds,
      pushRegistrationStatus,
      pushRegistrationMessage,
      expoPushToken,
      authReady,
      authBusy,
      isSupabaseConnected: isSupabaseConfigured,
      signIn,
      signUp,
      loginWithGoogle,
      continueAsGuest,
      updateProfile,
      setAppLanguage,
      setPrayerSourceLanguage,
      setDailyReminderEnabled,
      setFestivalReminderEnabled,
      toggleFavoritePrayer,
      isFavoritePrayer: (prayerId) => favoritePrayerIds.includes(prayerId),
      registerDeviceForNotifications,
      scheduleLocalNotificationPreview,
      logout,
    }),
    [
      appLanguage,
      authBusy,
      authReady,
      continueAsGuest,
      dailyReminderEnabled,
      entitlementStatus,
      entitlementValidUntil,
      expoPushToken,
      favoritePrayerIds,
      festivalReminderEnabled,
      hasFamilyAccess,
      hasPremiumAccess,
      loginWithGoogle,
      logout,
      prayerSourceLanguage,
      pushRegistrationMessage,
      pushRegistrationStatus,
      registerDeviceForNotifications,
      reminderTime,
      scheduleLocalNotificationPreview,
      setAppLanguage,
      setDailyReminderEnabled,
      setFestivalReminderEnabled,
      setPrayerSourceLanguage,
      signIn,
      signUp,
      subscriptionTier,
      toggleFavoritePrayer,
      updateProfile,
      user,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
