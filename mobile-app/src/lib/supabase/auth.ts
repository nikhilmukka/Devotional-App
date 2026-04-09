import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

export type AuthActionResult = {
  error?: string;
  notice?: string;
};

export async function getInitialSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;

  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
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
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured in the app yet." };
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

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
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured in the app yet." };
  }

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

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
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured in the app yet." };
  }

  const redirectTo = makeRedirectUri({
    path: "auth/callback",
    scheme: "bhaktiverse",
  });

  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.url) {
    return { error: "Google sign-in URL could not be created." };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !result.url) {
    return {
      notice:
        result.type === "cancel" ? "Google sign-in was cancelled." : "Google sign-in did not complete.",
    };
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  const accessToken = typeof params.access_token === "string" ? params.access_token : null;
  const refreshToken = typeof params.refresh_token === "string" ? params.refresh_token : null;
  const authCode = typeof params.code === "string" ? params.code : null;
  const returnedError =
    typeof params.error_description === "string"
      ? params.error_description
      : typeof params.error === "string"
        ? params.error
        : errorCode || null;

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
