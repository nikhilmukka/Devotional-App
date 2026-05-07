import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useApp } from "../context/AppContext";
import { HomeScreen } from "../screens/HomeScreen";
import { AudioScreen } from "../screens/AudioScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PlaceholderScreen } from "../screens/PlaceholderScreen";
import { PrayerDetailScreen } from "../screens/PrayerDetailScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RemindersScreen } from "../screens/RemindersScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { PremiumScreen } from "../screens/PremiumScreen";
import { ShlokaNotebookScreen } from "../screens/ShlokaNotebookScreen";
import { FestivalGuideScreen } from "../screens/FestivalGuideScreen";
import { DailySadhanaScreen } from "../screens/DailySadhanaScreen";
import { FamilyLearningScreen } from "../screens/FamilyLearningScreen";
import { t } from "../i18n";
import { AppColors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { appLanguage } = useApp();
  const tr = (path: string) => t(appLanguage, path);

  return (
    <Tab.Navigator
      key={appLanguage}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0E0C8",
          height: 86,
          paddingTop: 8,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: "#9B8B7A",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: "home-outline",
            SearchTab: "search-outline",
            AudioTab: "headset-outline",
            FavoritesTab: "heart-outline",
            ProfileTab: "person-outline",
          };

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: tr("nav.home") }} />
      <Tab.Screen
        name="SearchTab"
        options={{ title: tr("nav.search") }}
        component={SearchScreen}
      />
      <Tab.Screen
        name="AudioTab"
        options={{ title: tr("nav.audio") }}
        component={AudioScreen}
      />
      <Tab.Screen
        name="FavoritesTab"
        options={{ title: tr("nav.favorites") }}
        component={FavoritesScreen}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{ title: tr("nav.profile") }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, authReady } = useApp();

  if (!authReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={AppColors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Reminders"
            component={RemindersScreen}
          />
          <Stack.Screen name="PrayerDetail" component={PrayerDetailScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
          <Stack.Screen name="ShlokaNotebook" component={ShlokaNotebookScreen} />
          <Stack.Screen name="FestivalGuide" component={FestivalGuideScreen} />
          <Stack.Screen name="DailySadhana" component={DailySadhanaScreen} />
          <Stack.Screen name="FamilyLearning" component={FamilyLearningScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background,
  },
});
