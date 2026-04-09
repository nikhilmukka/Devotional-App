import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedbackModal } from "../components/FeedbackModal";
import { GradientHeader } from "../components/GradientHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { appLanguages, prayerSourceLanguages } from "../data/sampleContent";
import { getLanguageOptionLabel, getPrayerSourceLabel, t } from "../i18n";
import { AppColors } from "../theme/colors";

const avatarOptions = ["🙏", "🪔", "🕉️", "🪷"];

export function ProfileScreen({ navigation }: { navigation: any }) {
  const {
    user,
    appLanguage,
    prayerSourceLanguage,
    subscriptionTier,
    entitlementStatus,
    hasPremiumAccess,
    hasFamilyAccess,
    isSupabaseConnected,
    updateProfile,
    setAppLanguage,
    setPrayerSourceLanguage,
    logout,
  } = useApp();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [contactNumber, setContactNumber] = useState(user?.contactNumber ?? "");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setContactNumber(user?.contactNumber ?? "");
  }, [user]);

  const tr = (path: string) => t(appLanguage, path);
  const planLabel =
    subscriptionTier === "premium_family"
      ? tr("premium.premiumFamily")
      : subscriptionTier === "premium_individual"
        ? tr("premium.premiumIndividual")
        : tr("premium.freePlan");
  const statusLabel =
    entitlementStatus === "active"
      ? tr("premium.active")
      : entitlementStatus === "trial"
        ? tr("premium.trial")
        : entitlementStatus === "grace_period"
          ? tr("premium.gracePeriod")
          : tr("premium.inactive");

  const handleSave = () => {
    updateProfile({
      name: name.trim() || "Devotee",
      email: email.trim(),
      contactNumber: contactNumber.trim(),
    });
    setShowSaveModal(true);
  };

  return (
    <ScreenContainer>
      <GradientHeader
        title={tr("profile.title")}
        subtitle={tr("profile.subtitle")}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.photoUri || name.trim().charAt(0).toUpperCase() || "D"}</Text>
          </View>
          <View style={styles.profileHeaderText}>
            <Text style={styles.profileName}>{name.trim() || "Devotee"}</Text>
            <Text style={styles.profileEmail}>{email.trim() || "Guest mode"}</Text>
          </View>
        </View>
      </GradientHeader>

      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("profile.membership")}</Text>
          <Text style={styles.sectionSubtitle}>{tr("profile.membershipBody")}</Text>
          <View style={styles.membershipRow}>
            <View style={[styles.membershipPill, hasPremiumAccess && styles.membershipPillActive]}>
              <Text style={[styles.membershipPillText, hasPremiumAccess && styles.membershipPillTextActive]}>
                {planLabel}
              </Text>
            </View>
            <Text style={styles.membershipStatus}>{statusLabel}</Text>
          </View>
          <View style={styles.membershipHighlights}>
            <View style={styles.membershipBulletRow}>
              <Ionicons name="sparkles-outline" size={16} color={AppColors.accent} />
              <Text style={styles.membershipBulletText}>{tr("premium.featureFestivalGuides")}</Text>
            </View>
            <View style={styles.membershipBulletRow}>
              <Ionicons name="headset-outline" size={16} color={AppColors.accent} />
              <Text style={styles.membershipBulletText}>{tr("premium.featureAudio")}</Text>
            </View>
            <View style={styles.membershipBulletRow}>
              <Ionicons name="book-outline" size={16} color={AppColors.accent} />
              <Text style={styles.membershipBulletText}>
                {hasFamilyAccess ? tr("premium.familyBody") : tr("premium.featureNotebook")}
              </Text>
            </View>
          </View>
          <Pressable style={styles.premiumButton} onPress={() => navigation.navigate("Premium")}>
            <Text style={styles.premiumButtonText}>{tr("profile.viewPremium")}</Text>
          </Pressable>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("profile.notebook")}</Text>
          <Text style={styles.sectionSubtitle}>{tr("profile.notebookBody")}</Text>
          <Pressable style={styles.outlinePrimaryButton} onPress={() => navigation.navigate("ShlokaNotebook")}>
            <Ionicons name="book-outline" size={18} color={AppColors.maroon} />
            <Text style={styles.outlinePrimaryButtonText}>{tr("profile.openNotebook")}</Text>
          </Pressable>
        </SectionCard>

        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{tr("profile.personalDetails")}</Text>
            <Pressable style={styles.photoButton} onPress={() => setAvatarPickerOpen(true)}>
              <Ionicons name="camera-outline" size={16} color={AppColors.maroon} />
              <Text style={styles.photoButtonText}>{tr("common.changePhoto")}</Text>
            </Pressable>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{tr("profile.fullName")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={tr("profile.enterFullName")}
              placeholderTextColor="#A48F7A"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{tr("profile.emailAddress")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={tr("profile.enterEmail")}
              placeholderTextColor="#A48F7A"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{tr("profile.contactNumber")}</Text>
            <TextInput
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder={tr("profile.enterContact")}
              placeholderTextColor="#A48F7A"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{tr("common.saveProfile")}</Text>
          </Pressable>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("profile.appLanguage")}</Text>
          <Text style={styles.sectionSubtitle}>
            {tr("profile.appLanguageBody")}
          </Text>
          <View style={styles.chipsWrap}>
            {appLanguages.map((language) => {
              const active = appLanguage === language;
              return (
                <Pressable
                  key={language}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setAppLanguage(language)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {getLanguageOptionLabel(language)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        {appLanguage === "English" ? (
          <SectionCard>
            <Text style={styles.sectionTitle}>{tr("profile.prayerSourceLanguage")}</Text>
            <Text style={styles.sectionSubtitle}>
              {tr("profile.prayerSourceBody")}
            </Text>
            <View style={styles.chipsWrap}>
              {prayerSourceLanguages.map((language) => {
                const active = prayerSourceLanguage === language;
                return (
                  <Pressable
                    key={language}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setPrayerSourceLanguage(language)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {getPrayerSourceLabel(language)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>
        ) : null}

        <SectionCard>
          <Text style={styles.sectionTitle}>{tr("profile.session")}</Text>
          <Text style={styles.sectionSubtitle}>
            {isSupabaseConnected
              ? "Supabase session is connected. Email sign-in is live and Google sign-in will be added next."
              : tr("common.mockAuthNote")}
          </Text>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={AppColors.maroon} />
            <Text style={styles.logoutButtonText}>{tr("common.logout")}</Text>
          </Pressable>
        </SectionCard>
      </View>

      <Modal transparent visible={avatarPickerOpen} animationType="fade" onRequestClose={() => setAvatarPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{tr("common.chooseAvatar")}</Text>
            <View style={styles.avatarGrid}>
              {avatarOptions.map((avatar) => (
                <Pressable
                  key={avatar}
                  style={styles.avatarChoice}
                  onPress={() => {
                    updateProfile({ photoUri: avatar });
                    setAvatarPickerOpen(false);
                  }}
                >
                  <Text style={styles.avatarChoiceText}>{avatar}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.modalCloseButton} onPress={() => setAvatarPickerOpen(false)}>
              <Text style={styles.modalCloseText}>{tr("common.close")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={showSaveModal}
        title="Profile Updated"
        message={tr("common.profileUpdated")}
        buttonLabel="Continue"
        onClose={() => setShowSaveModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,245,228,0.16)",
    borderWidth: 1.5,
    borderColor: "rgba(212,175,55,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF5E4",
    fontSize: 28,
    fontWeight: "700",
  },
  profileHeaderText: {
    flex: 1,
  },
  profileName: {
    color: "#FFF5E4",
    fontSize: 24,
    fontWeight: "700",
  },
  profileEmail: {
    color: "rgba(255,245,228,0.72)",
    fontSize: 13,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  membershipRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  membershipPill: {
    borderRadius: 999,
    backgroundColor: AppColors.mutedChip,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  membershipPillActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  membershipPillText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  membershipPillTextActive: {
    color: "#FFF5E4",
  },
  membershipStatus: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  membershipHighlights: {
    gap: 10,
    marginBottom: 14,
  },
  membershipBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  membershipBulletText: {
    flex: 1,
    color: AppColors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  premiumButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumButtonText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
  },
  outlinePrimaryButton: {
    marginTop: 6,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF7EE",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  outlinePrimaryButtonText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF7EE",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  photoButtonText: {
    color: AppColors.maroon,
    fontSize: 12,
    fontWeight: "700",
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: AppColors.textPrimary,
    fontSize: 15,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveButtonText: {
    color: "#FFF5E4",
    fontSize: 15,
    fontWeight: "700",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: AppColors.mutedChip,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: AppColors.maroon,
    borderColor: AppColors.maroon,
  },
  chipText: {
    color: AppColors.maroon,
    fontWeight: "600",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#FFF5E4",
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: "#FFF7EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: AppColors.maroon,
    fontSize: 14,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(45,27,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#FFF7EE",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 20,
  },
  modalTitle: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatarChoice: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarChoiceText: {
    fontSize: 28,
  },
  modalCloseButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: AppColors.maroon,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    color: "#FFF5E4",
    fontSize: 14,
    fontWeight: "700",
  },
});
