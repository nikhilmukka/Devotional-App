import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { GradientHeader } from "../components/GradientHeader";
import { SectionCard } from "../components/SectionCard";
import { useApp } from "../context/AppContext";
import { t } from "../i18n";
import { AppColors } from "../theme/colors";

type Props = {
  title: string;
  subtitle: string;
  description: string;
};

export function PlaceholderScreen({ title, subtitle, description }: Props) {
  const { appLanguage } = useApp();
  const tr = (path: string) => t(appLanguage, path);

  return (
    <ScreenContainer>
      <GradientHeader title={title} subtitle={subtitle} />
      <View style={styles.content}>
        <SectionCard>
          <Text style={styles.heading}>{tr("placeholder.workInProgress")}</Text>
          <Text style={styles.description}>{description}</Text>
        </SectionCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
