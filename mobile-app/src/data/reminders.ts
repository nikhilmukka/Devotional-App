export type DailyPrayer = {
  day: string;
  title: string;
  deity: string;
  duration: string;
};

export type FestivalReminder = {
  date: string;
  festival: string;
  title: string;
  deity: string;
  duration: string;
};

export const dailyPrayerSchedule: DailyPrayer[] = [
  { day: "Sunday", title: "Surya Namaskar Mantra", deity: "Surya", duration: "4 min read" },
  { day: "Monday", title: "Mahamrityunjaya Mantra", deity: "Shiva", duration: "6 min read" },
  { day: "Tuesday", title: "Hanuman Chalisa", deity: "Hanuman", duration: "8 min read" },
  { day: "Wednesday", title: "Ganesh Aarti", deity: "Ganesha", duration: "3 min read" },
  { day: "Thursday", title: "Sri Suktam", deity: "Lakshmi", duration: "7 min read" },
  { day: "Friday", title: "Durga Aarti", deity: "Durga", duration: "5 min read" },
  { day: "Saturday", title: "Hare Krishna Mahamantra", deity: "Krishna", duration: "9 min read" },
];

export const mockFestivalReminders: FestivalReminder[] = [
  { date: "03-18", festival: "Holi", title: "Holi Ke Din", deity: "Krishna", duration: "5 min read" },
  {
    date: "08-27",
    festival: "Ganesh Chaturthi",
    title: "Ganesh Aarti",
    deity: "Ganesha",
    duration: "3 min read",
  },
  {
    date: "10-20",
    festival: "Diwali",
    title: "Lakshmi Puja Vidhi",
    deity: "Lakshmi",
    duration: "10 min read",
  },
];

export function getTodayReminder(now: Date = new Date()) {
  const monthDay = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const festivalReminder = mockFestivalReminders.find((item) => item.date === monthDay);

  if (festivalReminder) {
    return {
      type: "festival" as const,
      dayLabel: now.toLocaleDateString("en-US", { weekday: "long" }),
      festival: festivalReminder.festival,
      title: festivalReminder.title,
      deity: festivalReminder.deity,
      duration: festivalReminder.duration,
    };
  }

  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const dailyPrayer =
    dailyPrayerSchedule.find((item) => item.day === weekday) ?? dailyPrayerSchedule[0];

  return {
    type: "daily" as const,
    dayLabel: dailyPrayer.day,
    title: dailyPrayer.title,
    deity: dailyPrayer.deity,
    duration: dailyPrayer.duration,
  };
}
