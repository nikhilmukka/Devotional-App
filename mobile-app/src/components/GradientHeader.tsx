import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}>;

export function GradientHeader({ title, subtitle, rightSlot, children }: Props) {
  return (
    <LinearGradient colors={["#7A1E1E", "#3D0F0F", "#AA4010"]} style={styles.header}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#FFF5E4",
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,245,228,0.7)",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
  },
});
