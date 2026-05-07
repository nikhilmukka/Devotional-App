import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  getSupabaseAnonKey,
  getSupabaseClient,
  getSupabaseHost,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./client";

export type AuthActionResult = {
  error?: string;
  notice?: string;
};

WebBrowser.maybeCompleteAuthSession();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseAuthResultUrl(resultUrl: string) {
  const url = new URL(resultUrl);
  const mergedParams = new URLSearchParams(url.search);

  if (url.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(url.hash.slice(1));
    hashParams.forEach((value, key) => {
      if (!mergedParams.has(key)) {
        mergedParams.set(key, value);
      }
    });
  }

  return mergedParams;
}

function hasAuthCallbackParams(url: string) {
  try {
    const params = parseAuthResultUrl(url);

    return Boolean(
      params.get("code") ||
        params.get("error") ||
        params.get("error_description") ||
        (params.get("access_token") && params.get("refresh_token"))
    );
  } catch {
    return false;
  }
}

async function verifySupabaseReachability(): Promise<AuthActionResult | null> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured in the app yet." };
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const supabaseHost = getSupabaseHost();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Supabase is not configured in the app yet." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) {
      return {
        error: `BhaktiVerse could reach Supabase, but the auth service responded with ${response.status}. Please verify the project URL and publishable key.`,
      };
    }

    return null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the Supabase authentication service.";

    return {
      error: `Unable to reach the Supabase authentication service for ${supabaseHost ?? "the configured project"}. Please verify the Supabase project URL in .env and make sure the project is still active. (${message})`,
    };
  }
}

async function completeOAuthCallbackUrl(resultUrl: string): Promise<AuthActionResult> {
  const client = getSupabaseClient();
  const params = parseAuthResultUrl(resultUrl);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const authCode = params.get("code");
  const returnedError =
    params.get("error_description") ?? params.get("error") ?? null;

  if (returnedError) {
    return { error: returnedError };
  }

  if (authCode) {
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(authCode);
    if (exchangeError) {
      return { error: exchangeError.message };
    }
    return {};
  }

  if (accessToken && refreshToken) {
    const { error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return { error: sessionError.message };
    }

    return {};
  }

  return { error: "Google sign-in callback did not return a valid session." };
}

export function isGoogleAuthCallbackUrl(url: string) {
  return url.includes("auth/callback") || hasAuthCallbackParams(url);
}

export async function consumeGoogleAuthCallback(url: string): Promise<AuthActionResult | null> {
  if (!isGoogleAuthCallbackUrl(url)) {
    return null;
  }

  return completeOAuthCallbackUrl(url);
}

export async function getInitialSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;

  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}

export async function waitForSupabaseSession(timeoutMs = 90000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const session = await getInitialSession();
      if (session?.user) {
        return true;
      }
    } catch {
      // Keep polling while the auth callback settles.
    }

    await delay(500);
  }

  return false;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return getSupabaseClient().auth.onAuthStateChange(callback);
}

export async function signInWithEmail(email: string, password: string): Promise<AuthActionResult> {
  const reachabilityError = await verifySupabaseReachability();
  if (reachabilityError) {
    return reachabilityError;
  }

  const client = getSupabaseClient();
  const { error } = await client.auth
    .signInWithPassword({
      email: email.trim(),
      password,
    })
    .catch((signInError: unknown) => ({
      error:
        signInError instanceof Error
          ? new Error(
              `Unable to reach the Supabase authentication service for ${getSupabaseHost() ?? "the configured project"}. Please verify the Supabase project URL in .env and make sure the project is still active. (${signInError.message})`
            )
          : new Error("Unable to reach the Supabase authentication service."),
    }));

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<AuthActionResult> {
  const reachabilityError = await verifySupabaseReachability();
  if (reachabilityError) {
    return reachabilityError;
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth
    .signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })
    .catch((signUpError: unknown) => ({
      data: null,
      error:
        signUpError instanceof Error
          ? new Error(
              `Unable to reach the Supabase authentication service for ${getSupabaseHost() ?? "the configured project"}. Please verify the Supabase project URL in .env and make sure the project is still active. (${signUpError.message})`
            )
          : new Error("Unable to reach the Supabase authentication service."),
    }));

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      notice: "Account created. If email confirmation is enabled, please verify your email before signing in.",
    };
  }

  return {};
}

export async function signOutFromSupabase() {
  if (!isSupabaseConfigured) return;

  const client = getSupabaseClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) {
    throw error;
  }

  await AsyncStorage.removeItem("supabase.auth.token");
}

export async function loginWithGoogle(): Promise<AuthActionResult> {
  const reachabilityError = await verifySupabaseReachability();
  if (reachabilityError) {
    return reachabilityError;
  }

  const isExpoGo = Constants.executionEnvironment === "storeClient";
  const returnUrl = makeRedirectUri({
    path: "auth/callback",
    ...(isExpoGo ? {} : { scheme: "bhaktiverse" }),
  });

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: returnUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.url) {
    return { error: "Google sign-in URL could not be created." };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, returnUrl);

  if (result.type === "success" && result.url) {
    return completeOAuthCallbackUrl(result.url);
  }

  if (isSupabaseConfigured) {
    try {
      const session = await getInitialSession();
      if (session?.user) {
        return {};
      }
    } catch {
      // Fall through to the standard notice/error handling below.
    }
  }

  if (result.type !== "success" || !result.url) {
    return {
      notice:
        result.type === "cancel" ? "Google sign-in was cancelled." : "Google sign-in did not complete.",
    };
  }

  return completeOAuthCallbackUrl(result.url);
}
