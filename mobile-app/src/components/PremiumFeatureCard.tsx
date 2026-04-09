import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppColors } from "../theme/colors";

type PremiumFeatureCardProps = {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  ctaLabel: string;
  onPress: () => void;
  eyebrow?: string;
  bullets?: string[];
};

export function PremiumFeatureCard({
  title,
  body,
  icon,
  ctaLabel,
  onPress,
  eyebrow,
  bullets = [],
}: PremiumFeatureCardProps) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient colors={["#6B1717", "#8B241A", "#C85C20"]} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.copyWrap}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>

          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={22} color={AppColors.gold} />
          </View>
        </View>

        {bullets.length ? (
          <View style={styles.bulletList}>
            {bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFF5E4" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    shadowColor: AppColors.maroonDark,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  copyWrap: {
    flex: 1,
  },
  eyebrow: {
    color: "rgba(255,245,228,0.76)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFF5E4",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  body: {
    color: "rgba(255,245,228,0.84)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,245,228,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,245,228,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletList: {
    marginTop: 14,
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.gold,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: "#FFF5E4",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  footerRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  footerText: {
    color: "#FFF5E4",
    fontSize: 13,
    fontWeight: "800",
  },
});
