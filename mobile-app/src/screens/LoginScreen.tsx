import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FeedbackModal } from "../components/FeedbackModal";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppColors } from "../theme/colors";
import { useApp } from "../context/AppContext";

type Mode = "login" | "signup";

export function LoginScreen() {
  const { signIn, signUp, loginWithGoogle, continueAsGuest, authBusy, isSupabaseConnected } = useApp();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [modalConfig, setModalConfig] = useState<{ title: string; message: string } | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signup" && !name.trim()) return false;
    return true;
  }, [email, password, name, mode]);

  const handlePrimaryAction = async () => {
    if (!canSubmit || authBusy) return;

    const result =
      mode === "login"
        ? await signIn(email.trim(), password)
        : await signUp(name.trim(), email.trim(), password);

    if (result.error) {
      setModalConfig({
        title: mode === "signup" ? "Unable to Create Account" : "Unable to Sign In",
        message: result.error,
      });
      return;
    }

    if (result.notice) {
      setModalConfig({
        title: mode === "signup" ? "Account Created" : "Notice",
        message: result.notice,
      });
      return;
    }

    if (mode === "signup") {
      setModalConfig({
        title: "Welcome",
        message: "Your account has been created successfully.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    if (authBusy) return;
    const result = await loginWithGoogle();
    if (result.error) {
      setModalConfig({
        title: "Google Sign-In",
        message: result.error,
      });
      return;
    }
    if (result.notice) {
      setModalConfig({
        title: "Google Sign-In",
        message: result.notice,
      });
    }
  };

  const handleGuest = () => {
    if (authBusy) return;
    continueAsGuest();
  };

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient colors={["#7A1E1E", "#3D0F0F", "#FF8C42"]} style={styles.header}>
            <View style={styles.omCircle}>
              <Text style={styles.omText}>ॐ</Text>
            </View>
            <Text style={styles.brandTitle}>BhaktiVerse</Text>
            <Text style={styles.brandSubtitle}>Begin your spiritual journey</Text>
          </LinearGradient>

          <View style={styles.content}>
            {!isSupabaseConnected ? (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>
                  Add your Supabase project URL and anon key to the Expo app env file to enable real authentication.
                </Text>
              </View>
            ) : null}

            <View style={styles.modeTabs}>
              {(["login", "signup"] as Mode[]).map((item) => {
                const active = mode === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.modeTab, active && styles.modeTabActive]}
                    onPress={() => setMode(item)}
                  >
                    <Text style={[styles.modeText, active && styles.modeTextActive]}>
                      {item === "login" ? "Sign In" : "Sign Up"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === "signup" ? (
              <View style={styles.fieldWrap}>
                <Ionicons name="person-outline" size={18} color="#C9A87C" style={styles.fieldIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  placeholderTextColor="#A48F7A"
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.fieldWrap}>
              <Ionicons name="mail-outline" size={18} color="#C9A87C" style={styles.fieldIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#A48F7A"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#C9A87C" style={styles.fieldIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#A48F7A"
                secureTextEntry={secure}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable style={styles.eyeButton} onPress={() => setSecure((current) => !current)}>
                <Ionicons
                  name={secure ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#C9A87C"
                />
              </Pressable>
            </View>

            {mode === "login" ? (
              <Pressable style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handlePrimaryAction}
              disabled={!canSubmit || authBusy}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canSubmit || authBusy) && styles.primaryButtonDisabled,
                pressed && canSubmit && !authBusy ? styles.primaryButtonPressed : null,
              ]}
            >
              <LinearGradient colors={["#7A1E1E", "#FF8C42"]} style={styles.primaryGradient}>
                {authBusy ? (
                  <ActivityIndicator color="#FFF5E4" />
                ) : (
                  <Text style={styles.primaryText}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable style={styles.secondaryButton} onPress={handleGoogleLogin}>
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeText}>G</Text>
              </View>
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable style={styles.guestButton} onPress={handleGuest}>
              <Text style={styles.guestIcon}>🙏</Text>
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Pressable>

            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={Boolean(modalConfig)}
        title={modalConfig?.title ?? ""}
        message={modalConfig?.message ?? ""}
        buttonLabel="Continue"
        onClose={() => setModalConfig(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  omCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "rgba(212,175,55,0.4)",
    backgroundColor: "rgba(212,175,55,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  omText: {
    color: AppColors.gold,
    fontSize: 40,
    fontWeight: "700",
  },
  brandTitle: {
    color: "#FFF5E4",
    fontSize: 32,
    fontWeight: "700",
  },
  brandSubtitle: {
    color: "rgba(255,245,228,0.7)",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginTop: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  banner: {
    borderRadius: 18,
    backgroundColor: "rgba(255,140,66,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,168,124,0.28)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  bannerText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(122,30,30,0.08)",
    padding: 4,
    borderRadius: 18,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  modeTabActive: {
    backgroundColor: AppColors.maroon,
  },
  modeText: {
    color: AppColors.maroon,
    fontWeight: "700",
    fontSize: 14,
  },
  modeTextActive: {
    color: "#FFF5E4",
  },
  fieldWrap: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 20,
    marginBottom: 14,
  },
  fieldIcon: {
    position: "absolute",
    left: 16,
    top: 17,
    zIndex: 1,
  },
  input: {
    minHeight: 54,
    paddingLeft: 44,
    paddingRight: 16,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 15,
    padding: 4,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 14,
  },
  forgotText: {
    color: AppColors.maroon,
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 4,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryGradient: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  googleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
  },
  googleBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  secondaryButtonText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  guestButton: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.gold,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  guestIcon: {
    fontSize: 18,
  },
  guestButtonText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  termsText: {
    marginTop: 24,
    textAlign: "center",
    color: AppColors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: AppColors.maroon,
    fontWeight: "700",
  },
});
