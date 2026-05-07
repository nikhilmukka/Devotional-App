# Codebase Context — Hindu Devotional App

## Tech Stack
- **Framework:** React Native with Expo
- **Backend:** Supabase (auth, database, content)
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Billing:** RevenueCat
- **Language:** TypeScript
- **i18n:** Custom i18n module (src/i18n.ts)
- **Styling:** Custom theme (src/theme/colors.ts)

## Supported Languages
english, hindi, telugu, kannada, tamil, marathi, sanskrit

## Subscription Tiers
- free
- premium_individual
- premium_family

## Entitlement Statuses
inactive, trial, active, grace_period, canceled, expired

---

## Project Structure

### Screens (src/screens/)
| File | Purpose |
|------|---------|
| HomeScreen.tsx | Main home page — shows daily content, reminders, browse by deity/festival, featured prayers |
| AudioScreen.tsx | Audio playback for prayers and mantras |
| DailySadhanaScreen.tsx | Daily spiritual practice tracker |
| FamilyLearningScreen.tsx | Family learning features (premium) |
| FavoritesScreen.tsx | User saved/favourite prayers and shlokas |
| FestivalGuideScreen.tsx | Hindu festival guide and calendar |
| LoginScreen.tsx | Authentication screen (Google OAuth + Email) |
| PlaceholderScreen.tsx | Placeholder for screens under development |
| PrayerDetailScreen.tsx | Individual prayer detail view with full content |
| PremiumScreen.tsx | Premium subscription upsell screen |
| ProfileScreen.tsx | User profile, settings, language selection |
| RemindersScreen.tsx | Prayer reminder management |
| SearchScreen.tsx | Search across prayers, festivals, deities |
| ShlokaNotebookScreen.tsx | User's personal shloka collection/notebook |

### Navigation (src/navigation/)
| File | Purpose |
|------|---------|
| AppNavigator.tsx | Root navigator — Bottom Tab Navigator + Native Stack. Tabs: Home, Search, Favorites, Profile. Stack includes: PrayerDetail, Audio, Premium, Reminders, ShlokaNotebook, FestivalGuide, DailySadhana, FamilyLearning |

### State Management (src/context/)
| File | Purpose |
|------|---------|
| AppContext.tsx | Global app state — auth session, user profile, subscription status, language, favorites, push notifications, Google OAuth, RevenueCat customer info |

### Supabase (src/lib/supabase/)
| File | Purpose |
|------|---------|
| client.ts | Supabase client initialization and configuration check |
| auth.ts | Auth functions — Google OAuth, email sign in/up, sign out, session management, auth state subscription |
| content.ts | Content fetching — prayers list, home content, browse items, reminders. Types: PrayerListItem, BrowseItem, HomeReminderItem. Access tiers: free/premium |
| types.ts | Shared Supabase types — DbLanguageCode, SubscriptionTier, EntitlementStatus, language mapping utilities |
| profile.ts | User profile management |
| notebook.ts | Shloka notebook CRUD operations |

---

## Key Data Types

### Content Types (content.ts)
```typescript
PrayerListItem {
  id, title, deityKey, deity, category,
  duration, festivals, festivalKeys,
  accessTier, isPremium
}

BrowseItem { key, label }

HomeReminderItem {
  type: "daily" | "festival",
  prayerId, dayLabel, title, deityKey
}

ContentAccessTier: "free" | "premium"
```

### Auth & Subscription Types (types.ts)
```typescript
DbLanguageCode: english | hindi | telugu | kannada | tamil | marathi | sanskrit
SubscriptionTier: free | premium_individual | premium_family
EntitlementStatus: inactive | trial | active | grace_period | canceled | expired
```

---

## Feature Area to File Mapping

| Feature Area | Primary Files to Read |
|---|---|
| Home screen changes | HomeScreen.tsx, content.ts, AppContext.tsx |
| New screen/feature | AppNavigator.tsx, AppContext.tsx |
| Prayer related | PrayerDetailScreen.tsx, content.ts, types.ts |
| Audio/media | AudioScreen.tsx |
| Favourites | FavoritesScreen.tsx, profile.ts, AppContext.tsx |
| Reminders/notifications | RemindersScreen.tsx, AppContext.tsx |
| Shloka features | ShlokaNotebookScreen.tsx, notebook.ts |
| Festival features | FestivalGuideScreen.tsx, content.ts |
| Authentication | LoginScreen.tsx, auth.ts, AppContext.tsx |
| Premium/billing | PremiumScreen.tsx, AppContext.tsx, types.ts |
| Profile/settings | ProfileScreen.tsx, profile.ts, AppContext.tsx |
| Search | SearchScreen.tsx, content.ts |
| Daily practice | DailySadhanaScreen.tsx, AppContext.tsx |
| Family features | FamilyLearningScreen.tsx, AppContext.tsx |
| Database schema changes | types.ts, content.ts, profile.ts |
| Navigation changes | AppNavigator.tsx |
| Multilingual/i18n | i18n.ts, AppContext.tsx |

---

## Important Patterns

### Adding a New Screen
1. Create screen in `src/screens/`
2. Register in `AppNavigator.tsx`
3. Add to Bottom Tab or Stack navigator as appropriate
4. Add any global state to `AppContext.tsx`

### Adding Premium Content
1. Set `accessTier: "premium"` in content
2. Check `SubscriptionTier` in `AppContext`
3. Gate behind `PremiumScreen` if needed

### Adding Supabase Data
1. Define types in `types.ts`
2. Add fetch functions in `content.ts` or relevant lib file
3. Call from screen or `AppContext`

### Multilingual Support
- Use `t(appLanguage, path)` from `i18n.ts`
- All user-facing strings must support all 7 languages
- Language stored in `AppContext`
