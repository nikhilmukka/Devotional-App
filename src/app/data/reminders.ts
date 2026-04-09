import { getTodayFestival, getFestivalPrayers } from './festivals';
import { prayers, getDeityById } from './prayers';

export interface ReminderCard {
  id: string;
  title: string;
  description: string;
  prayerId: string;
  deityName: string;
  type: 'calendar' | 'festival';
  dayLabel: string;
  time: string;
  accent: string;
  symbol: string;
}

export const getTodayReminderCard = (): ReminderCard => {
  const today = new Date();
  const todayFestival = getTodayFestival(today);

  if (todayFestival) {
    const festivalPrayer = getFestivalPrayers(todayFestival.id)[0] || prayers[0];
    return {
      id: 'festival-today',
      title: `${todayFestival.name} Prayer Reminder`,
      description: `Today is ${todayFestival.name}. The reminder now switches to the festival prayer instead of the regular daily prayer.`,
      prayerId: festivalPrayer.id,
      deityName: getDeityById(festivalPrayer.deityId)?.name || todayFestival.name,
      type: 'festival',
      dayLabel: `Today · ${todayFestival.dateInfo}`,
      time: '06:00 AM',
      accent: todayFestival.color1,
      symbol: todayFestival.symbol,
    };
  }

  const dailyPrayer = prayers[today.getDate() % prayers.length];
  return {
    id: 'daily-today',
    title: 'Today\'s Prayer Reminder',
    description: 'No festival is scheduled for today, so the reminder shows the regular daily prayer.',
    prayerId: dailyPrayer.id,
    deityName: getDeityById(dailyPrayer.deityId)?.name || 'Divine',
    type: 'calendar',
    dayLabel: 'Today',
    time: '06:00 AM',
    accent: '#FF8C42',
    symbol: '🪔',
  };
};

export const getTodayReminderCount = (): number => 1;
