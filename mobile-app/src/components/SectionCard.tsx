import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { AppColors } from "../theme/colors";

export function SectionCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    padding: 16,
    shadowColor: AppColors.maroon,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
