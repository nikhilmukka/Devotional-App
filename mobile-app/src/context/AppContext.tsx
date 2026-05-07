import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Linking from "expo-linking";
import { AppState } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import {
  consumeGoogleAuthCallback,
  getInitialSession,
  isGoogleAuthCallbackUrl,
  loginWithGoogle as signInWithGoogleOAuth,
  signInWithEmail,
  signOutFromSupabase,
  signUpWithEmail,
  subscribeToAuthChanges,
  waitForSupabaseSession,
  type AuthActionResult,
} from "../lib/supabase/auth";
import { registerForPushNotificationsAsync, type NotificationRegistrationResult } from "../lib/notifications";
import { isSupabaseConfigured } from "../lib/supabase/client";
import {
  addFavoritePrayer,
  fetchRegisteredUserDevice,
  loadUserState,
  logNotificationEvent,
  removeFavoritePrayer,
  saveLanguagePreferences,
  saveProfileDetails,
  saveReminderPreferences,
  saveSadhanaPreferences,
  saveFamilyLearningPreferences,
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
  festivalPreparationReminderEnabled: boolean;
  festivalPreparationLeadDays: number;
  dailySadhanaEnabled: boolean;
  dailySadhanaDurationMinutes: number;
  dailySadhanaFocus: string;
  dailySadhanaPreferredDeity: string | null;
  familyLearningEnabled: boolean;
  familyLearningAgeGroup: string;
  familyLearningMode: string;
  familyLearningPreferredDeity: string | null;
  reminderTime: string;
  favoritePrayerIds: string[];
  pushRegistrationStatus: NotificationRegistrationResult["status"] | "idle";
  pushRegistrationMessage: string;
  expoPushToken: string | null;
  isDeviceRegistered: boolean;
  authReady: boolean;
  authBusy: boolean;
  isSupabaseConnected: boolean;
  refreshPremiumEntitlement: (customerInfo?: CustomerInfo | null) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  loginWithGoogle: () => Promise<AuthActionResult>;
  continueAsGuest: () => void;
  updateProfile: (updates: Partial<MobileUser>) => Promise<AuthActionResult>;
  setAppLanguage: (language: string) => void;
  setPrayerSourceLanguage: (language: string) => void;
  setDailyReminderEnabled: (enabled: boolean) => void;
  setFestivalReminderEnabled: (enabled: boolean) => void;
  setFestivalPreparationReminderEnabled: (enabled: boolean) => void;
  setFestivalPreparationLeadDays: (days: number) => void;
  setDailySadhanaEnabled: (enabled: boolean) => void;
  setDailySadhanaDurationMinutes: (minutes: number) => void;
  setDailySadhanaFocus: (focus: string) => void;
  setDailySadhanaPreferredDeity: (deity: string | null) => void;
  setFamilyLearningEnabled: (enabled: boolean) => void;
  setFamilyLearningAgeGroup: (ageGroup: string) => void;
  setFamilyLearningMode: (mode: string) => void;
  setFamilyLearningPreferredDeity: (deity: string | null) => void;
  toggleFavoritePrayer: (prayerId: string) => void;
  isFavoritePrayer: (prayerId: string) => boolean;
  registerDeviceForNotifications: () => Promise<NotificationRegistrationResult>;
  scheduleLocalNotificationPreview: (prayerSlug?: string | null) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const defaultFavoritePrayerIds = ["hanuman-chalisa", "ganesh-aarti"];

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

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
  const lastHandledAuthUrlRef = useRef<string | null>(null);
  const userRef = useRef<MobileUser | null>(null);
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
  const [festivalPreparationReminderEnabled, setFestivalPreparationReminderEnabledState] = useState(false);
  const [festivalPreparationLeadDays, setFestivalPreparationLeadDaysState] = useState(1);
  const [dailySadhanaEnabled, setDailySadhanaEnabledState] = useState(false);
  const [dailySadhanaDurationMinutes, setDailySadhanaDurationMinutesState] = useState(15);
  const [dailySadhanaFocus, setDailySadhanaFocusState] = useState("balanced");
  const [dailySadhanaPreferredDeity, setDailySadhanaPreferredDeityState] = useState<string | null>(null);
  const [familyLearningEnabled, setFamilyLearningEnabledState] = useState(false);
  const [familyLearningAgeGroup, setFamilyLearningAgeGroupState] = useState("family");
  const [familyLearningMode, setFamilyLearningModeState] = useState("meaning");
  const [familyLearningPreferredDeity, setFamilyLearningPreferredDeityState] = useState<string | null>(null);
  const [reminderTime] = useState("6:30 AM");
  const [favoritePrayerIds, setFavoritePrayerIds] = useState<string[]>(defaultFavoritePrayerIds);
  const [pushRegistrationStatus, setPushRegistrationStatus] =
    useState<AppContextValue["pushRegistrationStatus"]>("idle");
  const [pushRegistrationMessage, setPushRegistrationMessage] = useState("");
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);

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
    setFestivalPreparationReminderEnabledState(loaded.festivalPreparationReminderEnabled);
    setFestivalPreparationLeadDaysState(loaded.festivalPreparationLeadDays);
    setDailySadhanaEnabledState(loaded.dailySadhanaEnabled);
    setDailySadhanaDurationMinutesState(loaded.dailySadhanaDurationMinutes);
    setDailySadhanaFocusState(loaded.dailySadhanaFocus);
    setDailySadhanaPreferredDeityState(loaded.dailySadhanaPreferredDeity);
    setFamilyLearningEnabledState(loaded.familyLearningEnabled);
    setFamilyLearningAgeGroupState(loaded.familyLearningAgeGroup);
    setFamilyLearningModeState(loaded.familyLearningMode);
    setFamilyLearningPreferredDeityState(loaded.familyLearningPreferredDeity);
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
    setFestivalPreparationReminderEnabledState(false);
    setFestivalPreparationLeadDaysState(1);
    setDailySadhanaEnabledState(false);
    setDailySadhanaDurationMinutesState(15);
    setDailySadhanaFocusState("balanced");
    setDailySadhanaPreferredDeityState(null);
    setFamilyLearningEnabledState(false);
    setFamilyLearningAgeGroupState("family");
    setFamilyLearningModeState("meaning");
    setFamilyLearningPreferredDeityState(null);
    setFavoritePrayerIds(defaultFavoritePrayerIds);
    setExpoPushToken(null);
    setIsDeviceRegistered(false);
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
          productCode: next.primaryProductCode,
        });
      } catch (error) {
        console.warn("Failed to persist RevenueCat entitlement", error);
      }
    },
    []
  );

  const refreshPremiumEntitlement = useCallback(async (nextCustomerInfo?: CustomerInfo | null) => {
    if (!user?.id || user.isGuest) {
      applyRevenueCatEntitlement({
        subscriptionTier: "free",
        entitlementStatus: "inactive",
        entitlementValidUntil: null,
        entitlementIsLifetime: false,
        hasMappedEntitlement: false,
        primaryProductCode: null,
      });
      return false;
    }

    const customerInfo = nextCustomerInfo ?? (await fetchRevenueCatCustomerInfo());
    const mappedEntitlement = customerInfo
      ? getRevenueCatEntitlementState(customerInfo)
      : {
          subscriptionTier: "free" as const,
          entitlementStatus: "inactive" as const,
          entitlementValidUntil: null,
          entitlementIsLifetime: false,
          hasMappedEntitlement: false,
          primaryProductCode: null,
        };

    applyRevenueCatEntitlement(mappedEntitlement);
    await persistRevenueCatEntitlement(user.id, mappedEntitlement);
    return hasActivePremiumEntitlement(
      mappedEntitlement.subscriptionTier,
      mappedEntitlement.entitlementStatus,
      mappedEntitlement.entitlementValidUntil,
      mappedEntitlement.entitlementIsLifetime
    );
  }, [applyRevenueCatEntitlement, persistRevenueCatEntitlement, user]);

  const reconcileGoogleAuthSession = useCallback(async (incomingUrl?: string | null) => {
    if (!isSupabaseConfigured) {
      setAuthBusy(false);
      setAuthReady(true);
      return;
    }

    try {
      const existingSession = await getInitialSession();
      if (existingSession?.user) {
        await hydrateSessionUser(existingSession.user);
        return;
      }

      const callbackUrl =
        incomingUrl && isGoogleAuthCallbackUrl(incomingUrl)
          ? incomingUrl
          : await Linking.getInitialURL();
      const hasCallbackUrl = Boolean(callbackUrl && isGoogleAuthCallbackUrl(callbackUrl));

      const hasFreshCallbackUrl =
        Boolean(callbackUrl && isGoogleAuthCallbackUrl(callbackUrl)) &&
        callbackUrl !== lastHandledAuthUrlRef.current;

      if (hasFreshCallbackUrl && callbackUrl) {
        lastHandledAuthUrlRef.current = callbackUrl;
        const result = await consumeGoogleAuthCallback(callbackUrl);

        if (result?.error) {
          console.warn("Failed to complete Google auth callback", result.error);
          return;
        }
      }

      const sessionReady = await waitForSupabaseSession(
        hasFreshCallbackUrl ? 10000 : hasCallbackUrl ? 3000 : 2000
      );
      if (!sessionReady) {
        return;
      }

      const session = await getInitialSession();
      if (session?.user) {
        await hydrateSessionUser(session.user);
      }
    } catch (error) {
      console.warn("Failed to reconcile Google auth session", error);
    } finally {
      setAuthBusy(false);
      setAuthReady(true);
    }
  }, [hydrateSessionUser]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && isGoogleAuthCallbackUrl(initialUrl)) {
          setAuthBusy(true);
        }

        await reconcileGoogleAuthSession(initialUrl);
      } catch (error) {
        console.warn("Failed to bootstrap Supabase session", error);
      } finally {
        if (active) {
          setAuthReady(true);
          setAuthBusy(false);
        }
      }
    }

    bootstrap();

    const authCallbackSubscription = Linking.addEventListener("url", ({ url }) => {
      if (!isGoogleAuthCallbackUrl(url)) {
        return;
      }

      setAuthBusy(true);
      void reconcileGoogleAuthSession(url);
    });

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" || user) {
        return;
      }

      void reconcileGoogleAuthSession();
    });

    const subscription = subscribeToAuthChanges(async (_event, session) => {
      try {
        if (session?.user) {
          await hydrateSessionUser(session.user);
        } else if (userRef.current?.isGuest) {
          return;
        } else {
          resetLocalSessionState();
        }
      } catch (error) {
        console.warn("Failed to refresh auth session", error);
      } finally {
        setAuthReady(true);
        setAuthBusy(false);
      }
    });

    return () => {
      active = false;
      authCallbackSubscription.remove();
      appStateSubscription.remove();
      subscription.data.subscription.unsubscribe();
    };
  }, [hydrateSessionUser, reconcileGoogleAuthSession, resetLocalSessionState]);

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

  useEffect(() => {
    let active = true;

    async function hydrateRegisteredDevice() {
      if (!user?.id || user.isGuest || !isSupabaseConfigured) {
        if (active) {
          setIsDeviceRegistered(false);
        }
        return;
      }

      try {
        const registration = await fetchRegisteredUserDevice(user.id);
        if (!active) return;
        setIsDeviceRegistered(registration.isRegistered);
        if (registration.expoPushToken) {
          setExpoPushToken(registration.expoPushToken);
        }
        if (registration.isRegistered) {
          setPushRegistrationStatus("registered");
          setPushRegistrationMessage("Device notifications are enabled for this app.");
        }
      } catch (error) {
        console.warn("Failed to hydrate registered device state", error);
      }
    }

    void hydrateRegisteredDevice();

    return () => {
      active = false;
    };
  }, [user?.id, user?.isGuest]);

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
    setAuthBusy(true);
    try {
      const result = await signInWithGoogleOAuth();
      if (result.error || result.notice) {
        setAuthBusy(false);
      }
      return result;
    } catch (error) {
      setAuthBusy(false);
      throw error;
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    lastHandledAuthUrlRef.current = null;
    setAuthBusy(false);
    setAuthReady(true);
    setSubscriptionTier("free");
    setEntitlementStatus("inactive");
    setEntitlementValidUntil(null);
    setEntitlementIsLifetime(false);
    setDailyReminderEnabledState(true);
    setFestivalReminderEnabledState(true);
    setFestivalPreparationReminderEnabledState(false);
    setFestivalPreparationLeadDaysState(1);
    setDailySadhanaEnabledState(false);
    setDailySadhanaDurationMinutesState(15);
    setDailySadhanaFocusState("balanced");
    setDailySadhanaPreferredDeityState(null);
    setFamilyLearningEnabledState(false);
    setFamilyLearningAgeGroupState("family");
    setFamilyLearningModeState("meaning");
    setFamilyLearningPreferredDeityState(null);
    setFavoritePrayerIds(defaultFavoritePrayerIds);
    setExpoPushToken(null);
    setIsDeviceRegistered(false);
    setPushRegistrationStatus("idle");
    setPushRegistrationMessage("");
    setUser({
      name: "Guest Devotee",
      email: "",
      isGuest: true,
    });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<MobileUser>) => {
      if (!user) {
        return { error: "No active profile to update." };
      }

      if (user.isGuest || !user.id) {
        setUser((current) => {
          if (!current) return current;
          return { ...current, ...updates };
        });

        return {
          notice: "Saved for this guest session. Sign in to keep these details with your account.",
        };
      }

      try {
        await saveProfileDetails(user.id, {
          name: updates.name,
          email: updates.email,
          contactNumber: updates.contactNumber,
          photoUri: updates.photoUri,
        });

        setUser((current) => {
          if (!current) return current;
          return { ...current, ...updates };
        });

        return {
          notice:
            updates.email !== undefined && updates.email !== user.email
              ? "Profile updated. If you changed your email, follow any confirmation steps sent to your inbox."
              : "Profile updated.",
        };
      } catch (error) {
        console.warn("Failed to save profile details", error);
        return { error: getErrorMessage(error) };
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

  const setFestivalPreparationReminderEnabled = useCallback(
    (enabled: boolean) => {
      setFestivalPreparationReminderEnabledState(enabled);
      if (user?.id && !user.isGuest) {
        void saveReminderPreferences(user.id, {
          festivalPreparationReminderEnabled: enabled,
        }).catch((error) => {
          console.warn("Failed to save festival preparation reminder preference", error);
        });
      }
    },
    [user]
  );

  const setFestivalPreparationLeadDays = useCallback(
    (days: number) => {
      const nextDays = Math.min(2, Math.max(1, Math.floor(days)));
      setFestivalPreparationLeadDaysState(nextDays);
      if (user?.id && !user.isGuest) {
        void saveReminderPreferences(user.id, {
          festivalPreparationLeadDays: nextDays,
        }).catch((error) => {
          console.warn("Failed to save festival preparation lead days", error);
        });
      }
    },
    [user]
  );

  const setDailySadhanaEnabled = useCallback(
    (enabled: boolean) => {
      setDailySadhanaEnabledState(enabled);
      if (user?.id && !user.isGuest) {
        void saveSadhanaPreferences(user.id, { dailySadhanaEnabled: enabled }).catch((error) => {
          console.warn("Failed to save daily sadhana enabled state", error);
        });
      }
    },
    [user]
  );

  const setDailySadhanaDurationMinutes = useCallback(
    (minutes: number) => {
      const nextMinutes = Math.min(20, Math.max(10, Math.floor(minutes)));
      setDailySadhanaDurationMinutesState(nextMinutes);
      if (user?.id && !user.isGuest) {
        void saveSadhanaPreferences(user.id, {
          dailySadhanaDurationMinutes: nextMinutes,
        }).catch((error) => {
          console.warn("Failed to save daily sadhana duration", error);
        });
      }
    },
    [user]
  );

  const setDailySadhanaFocus = useCallback(
    (focus: string) => {
      setDailySadhanaFocusState(focus);
      if (user?.id && !user.isGuest) {
        void saveSadhanaPreferences(user.id, { dailySadhanaFocus: focus }).catch((error) => {
          console.warn("Failed to save daily sadhana focus", error);
        });
      }
    },
    [user]
  );

  const setDailySadhanaPreferredDeity = useCallback(
    (deity: string | null) => {
      setDailySadhanaPreferredDeityState(deity);
      if (user?.id && !user.isGuest) {
        void saveSadhanaPreferences(user.id, { dailySadhanaPreferredDeity: deity }).catch((error) => {
          console.warn("Failed to save daily sadhana preferred deity", error);
        });
      }
    },
    [user]
  );

  const setFamilyLearningEnabled = useCallback(
    (enabled: boolean) => {
      setFamilyLearningEnabledState(enabled);
      if (user?.id && !user.isGuest) {
        void saveFamilyLearningPreferences(user.id, { familyLearningEnabled: enabled }).catch((error) => {
          console.warn("Failed to save family learning enabled state", error);
        });
      }
    },
    [user]
  );

  const setFamilyLearningAgeGroup = useCallback(
    (ageGroup: string) => {
      setFamilyLearningAgeGroupState(ageGroup);
      if (user?.id && !user.isGuest) {
        void saveFamilyLearningPreferences(user.id, { familyLearningAgeGroup: ageGroup }).catch((error) => {
          console.warn("Failed to save family learning age group", error);
        });
      }
    },
    [user]
  );

  const setFamilyLearningMode = useCallback(
    (mode: string) => {
      setFamilyLearningModeState(mode);
      if (user?.id && !user.isGuest) {
        void saveFamilyLearningPreferences(user.id, { familyLearningMode: mode }).catch((error) => {
          console.warn("Failed to save family learning mode", error);
        });
      }
    },
    [user]
  );

  const setFamilyLearningPreferredDeity = useCallback(
    (deity: string | null) => {
      setFamilyLearningPreferredDeityState(deity);
      if (user?.id && !user.isGuest) {
        void saveFamilyLearningPreferences(user.id, {
          familyLearningPreferredDeity: deity,
        }).catch((error) => {
          console.warn("Failed to save family learning preferred deity", error);
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
          setIsDeviceRegistered(true);
          setPushRegistrationStatus("registered");
          setPushRegistrationMessage("Device notifications are enabled for this app.");
        } catch (error) {
          console.warn("Failed to save push token", error);
          setIsDeviceRegistered(false);
          return {
            status: "error" as const,
            message: `Notification token was created, but device registration failed. ${getErrorMessage(
              error
            )}`,
          };
        }

        void logNotificationEvent({
          userId: user.id,
          status: "registered",
          provider: "expo_device",
          responsePayload: {
            message: "Device notifications enabled on this iPhone.",
          },
        }).catch((error) => {
          console.warn("Failed to log notification registration result", error);
        });
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
      festivalPreparationReminderEnabled,
      festivalPreparationLeadDays,
      dailySadhanaEnabled,
      dailySadhanaDurationMinutes,
      dailySadhanaFocus,
      dailySadhanaPreferredDeity,
      familyLearningEnabled,
      familyLearningAgeGroup,
      familyLearningMode,
      familyLearningPreferredDeity,
      reminderTime,
      favoritePrayerIds,
      pushRegistrationStatus,
      pushRegistrationMessage,
      expoPushToken,
      isDeviceRegistered,
      authReady,
      authBusy,
      isSupabaseConnected: isSupabaseConfigured,
      refreshPremiumEntitlement,
      signIn,
      signUp,
      loginWithGoogle,
      continueAsGuest,
      updateProfile,
      setAppLanguage,
      setPrayerSourceLanguage,
      setDailyReminderEnabled,
      setFestivalReminderEnabled,
      setFestivalPreparationReminderEnabled,
      setFestivalPreparationLeadDays,
      setDailySadhanaEnabled,
      setDailySadhanaDurationMinutes,
      setDailySadhanaFocus,
      setDailySadhanaPreferredDeity,
      setFamilyLearningEnabled,
      setFamilyLearningAgeGroup,
      setFamilyLearningMode,
      setFamilyLearningPreferredDeity,
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
      dailySadhanaDurationMinutes,
      dailySadhanaEnabled,
      dailySadhanaFocus,
      dailySadhanaPreferredDeity,
      familyLearningAgeGroup,
      familyLearningEnabled,
      familyLearningMode,
      familyLearningPreferredDeity,
      entitlementStatus,
      entitlementValidUntil,
      expoPushToken,
      favoritePrayerIds,
      festivalReminderEnabled,
      festivalPreparationLeadDays,
      festivalPreparationReminderEnabled,
      hasFamilyAccess,
      hasPremiumAccess,
      loginWithGoogle,
      logout,
      prayerSourceLanguage,
      pushRegistrationMessage,
      pushRegistrationStatus,
      isDeviceRegistered,
      registerDeviceForNotifications,
      reminderTime,
      scheduleLocalNotificationPreview,
      setAppLanguage,
      setDailyReminderEnabled,
      setFestivalReminderEnabled,
      setFestivalPreparationLeadDays,
      setFestivalPreparationReminderEnabled,
      setDailySadhanaDurationMinutes,
      setDailySadhanaEnabled,
      setDailySadhanaFocus,
      setDailySadhanaPreferredDeity,
      setFamilyLearningAgeGroup,
      setFamilyLearningEnabled,
      setFamilyLearningMode,
      setFamilyLearningPreferredDeity,
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
