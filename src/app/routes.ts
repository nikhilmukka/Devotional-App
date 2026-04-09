import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { HomeScreen } from './pages/HomeScreen';
import { SearchScreen } from './pages/SearchScreen';
import { PrayerListScreen } from './pages/PrayerListScreen';
import { PrayerDetailScreen } from './pages/PrayerDetailScreen';
import { FavoritesScreen } from './pages/FavoritesScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { FestivalListScreen } from './pages/FestivalListScreen';
import { FestivalPrayerListScreen } from './pages/FestivalPrayerListScreen';
import { FestivalGuideScreen } from './pages/FestivalGuideScreen';
import { RemindersScreen } from './pages/RemindersScreen';
import { AudioPrayerScreen } from './pages/AudioPrayerScreen';
import { AdminContentPage } from './pages/AdminContentPage';
import { PremiumScreen } from './pages/PremiumScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: SplashScreen },
      { path: 'login', Component: LoginScreen },
      { path: 'home', Component: HomeScreen },
      { path: 'search', Component: SearchScreen },
      { path: 'deity/:deityId', Component: PrayerListScreen },
      { path: 'prayer/:prayerId', Component: PrayerDetailScreen },
      { path: 'favorites', Component: FavoritesScreen },
      { path: 'audio', Component: AudioPrayerScreen },
      { path: 'premium', Component: PremiumScreen },
      { path: 'reminders', Component: RemindersScreen },
      { path: 'profile', Component: ProfileScreen },
      { path: 'festivals', Component: FestivalListScreen },
      { path: 'festival/:festivalId', Component: FestivalPrayerListScreen },
      { path: 'festival-guide/:festivalId', Component: FestivalGuideScreen },
      { path: 'admin', Component: AdminContentPage },
    ],
  },
]);
