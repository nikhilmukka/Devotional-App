import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationRegistrationResult = {
  status: "registered" | "denied" | "unavailable" | "missing_project_id" | "error";
  token?: string;
  message: string;
};

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    process.env.EXPO_PUBLIC_EXPO_PROJECT_ID
  );
}

export async function registerForPushNotificationsAsync(): Promise<NotificationRegistrationResult> {
  if (!Device.isDevice) {
    return {
      status: "unavailable",
      message: "Push notifications require a physical device.",
    };
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return {
      status: "missing_project_id",
      message: "Expo project ID is missing. Add EXPO_PUBLIC_EXPO_PROJECT_ID before enabling push tokens.",
    };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF7A2E",
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== "granted") {
    return {
      status: "denied",
      message: "Notification permission was not granted on this device.",
    };
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return {
      status: "registered",
      token,
      message: "Device notifications are enabled for this app.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get Expo push token.",
    };
  }
}

export async function scheduleLocalTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "BhaktiVerse Reminder",
      body: "This is a local notification preview for your devotional reminders.",
      data: { type: "local-preview" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
