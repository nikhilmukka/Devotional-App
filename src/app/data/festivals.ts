import { prayers, type Prayer } from './prayers';

export interface Festival {
  id: string;
  name: string;
  nameHindi: string;
  symbol: string;
  description: string;
  dateInfo: string;
  mockDate?: string; // MM-DD used for prototype reminder logic
  months: number[]; // 1=Jan … 12=Dec – used to show "Upcoming" badge
  color1: string;
  color2: string;
  bgLight: string;
  prayerIds: string[];
}

export const festivals: Festival[] = [
  {
    id: 'diwali',
    name: 'Diwali',
    nameHindi: 'दीपावली',
    symbol: '🪔',
    description: 'Festival of Lights & Prosperity',
    dateInfo: 'October – November',
    mockDate: '11-12',
    months: [10, 11],
    color1: '#FF8C00',
    color2: '#C0392B',
    bgLight: '#FFF3E0',
    prayerIds: ['lakshmi-aarti', 'ganesh-aarti', 'diwali-puja', 'kuber-mantra', 'mahalakshmi-ashtakam', 'sri-suktam'],
  },
  {
    id: 'navratri',
    name: 'Navratri',
    nameHindi: 'नवरात्रि',
    symbol: '🌺',
    description: 'Nine Nights of the Divine Goddess',
    dateInfo: 'March – April & October',
    mockDate: '10-03',
    months: [3, 4, 10],
    color1: '#C0392B',
    color2: '#7B1FA2',
    bgLight: '#FFEBEE',
    prayerIds: ['durga-aarti', 'durga-chalisa', 'mahishasura-mardini', 'jai-mata-di', 'navratri-aarti'],
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    nameHindi: 'गणेश चतुर्थी',
    symbol: '🐘',
    description: 'Birthday of Lord Ganesha',
    dateInfo: 'August – September',
    mockDate: '09-07',
    months: [8, 9],
    color1: '#FF8C42',
    color2: '#D4AF37',
    bgLight: '#FFF8E1',
    prayerIds: ['ganesh-aarti', 'vakratunda', 'ganpati-stavan', 'ganesh-chaturthi-prayer'],
  },
  {
    id: 'janmashtami',
    name: 'Janmashtami',
    nameHindi: 'जन्माष्टमी',
    symbol: '🎵',
    description: 'Birthday of Lord Krishna',
    dateInfo: 'August',
    mockDate: '08-16',
    months: [8],
    color1: '#6A1B9A',
    color2: '#4A148C',
    bgLight: '#F3E5F5',
    prayerIds: ['hare-krishna', 'achyutam-keshavam', 'govinda-aarti', 'krishna-janmashtami-bhajan'],
  },
  {
    id: 'mahashivratri',
    name: 'Mahashivratri',
    nameHindi: 'महाशिवरात्रि',
    symbol: '☽',
    description: 'The Great Night of Lord Shiva',
    dateInfo: 'February – March',
    mockDate: '02-26',
    months: [2, 3],
    color1: '#283593',
    color2: '#1A237E',
    bgLight: '#E8EAF6',
    prayerIds: ['shiva-aarti', 'mahamrityunjaya', 'shiva-tandava', 'shivratri-prayer'],
  },
  {
    id: 'ram-navami',
    name: 'Ram Navami',
    nameHindi: 'राम नवमी',
    symbol: '🏹',
    description: 'Birth of Lord Rama',
    dateInfo: 'March – April',
    mockDate: '04-06',
    months: [3, 4],
    color1: '#2E7D32',
    color2: '#1B5E20',
    bgLight: '#E8F5E9',
    prayerIds: ['ram-aarti', 'ram-stuti', 'ram-chalisa', 'hanuman-chalisa'],
  },
  {
    id: 'hanuman-jayanti',
    name: 'Hanuman Jayanti',
    nameHindi: 'हनुमान जयंती',
    symbol: '🙏',
    description: 'Birthday of Lord Hanuman',
    dateInfo: 'April',
    mockDate: '04-12',
    months: [4],
    color1: '#E64A19',
    color2: '#BF360C',
    bgLight: '#FBE9E7',
    prayerIds: ['hanuman-chalisa', 'hanuman-aarti', 'bajrang-baan', 'sankat-mochan'],
  },
  {
    id: 'holi',
    name: 'Holi',
    nameHindi: 'होली',
    symbol: '🌈',
    description: 'Festival of Colors & Joy',
    dateInfo: 'March',
    mockDate: '03-18',
    months: [3],
    color1: '#E91E63',
    color2: '#AD1457',
    bgLight: '#FCE4EC',
    prayerIds: ['holi-bhajan', 'hare-krishna', 'achyutam-keshavam', 'govinda-aarti'],
  },
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti',
    nameHindi: 'मकर संक्रांति',
    symbol: '🌞',
    description: 'Harvest & Sun Worship Festival',
    dateInfo: 'January 14',
    mockDate: '01-14',
    months: [1],
    color1: '#F57F17',
    color2: '#E65100',
    bgLight: '#FFFDE7',
    prayerIds: ['surya-namaskar-mantra', 'makar-sankranti-prayer', 'ganesh-aarti'],
  },
  {
    id: 'krishna-janmashtami-extra',
    name: 'Govardhan Puja',
    nameHindi: 'गोवर्धन पूजा',
    symbol: '⛰️',
    description: 'Day after Diwali — Worship of Govardhan',
    dateInfo: 'November',
    mockDate: '11-13',
    months: [11],
    color1: '#1565C0',
    color2: '#0D47A1',
    bgLight: '#E3F2FD',
    prayerIds: ['hare-krishna', 'achyutam-keshavam', 'govinda-aarti', 'ganesh-aarti'],
  },
];

/** Returns festivals occurring this month or within 2 months */
export const getUpcomingFestivals = (): Festival[] => {
  const m = new Date().getMonth() + 1; // 1-12
  return festivals.filter((f) =>
    f.months.some((fm) => {
      const diff = ((fm - m + 12) % 12);
      return diff <= 2;
    })
  );
};

export const getFestivalById = (id: string): Festival | undefined =>
  festivals.find((f) => f.id === id);

export const getTodayFestival = (date = new Date()): Festival | undefined => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;
  return festivals.find((festival) => festival.mockDate === dateKey);
};

export const getFestivalPrayers = (festivalId: string): Prayer[] => {
  const festival = getFestivalById(festivalId);
  if (!festival) return [];
  return festival.prayerIds
    .map((pid) => prayers.find((p) => p.id === pid))
    .filter(Boolean) as Prayer[];
};

export const isUpcoming = (festival: Festival): boolean => {
  const m = new Date().getMonth() + 1;
  return festival.months.some((fm) => {
    const diff = (fm - m + 12) % 12;
    return diff <= 1;
  });
};

export const isCurrent = (festival: Festival): boolean => {
  const m = new Date().getMonth() + 1;
  return festival.months.includes(m);
};
