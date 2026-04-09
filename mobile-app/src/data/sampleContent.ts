export const appLanguages = [
  "English",
  "Hindi",
  "Telugu",
  "Kannada",
  "Tamil",
  "Marathi",
];

export const prayerSourceLanguages = [
  "Hindi",
  "Telugu",
  "Kannada",
  "Tamil",
  "Marathi",
  "Sanskrit",
];

export const featuredPrayers = [
  {
    id: "hanuman-chalisa",
    title: "Hanuman Chalisa",
    deity: "Hanuman",
    category: "Chalisa",
    duration: "8 min read",
  },
  {
    id: "ganesh-aarti",
    title: "Ganesh Aarti",
    deity: "Ganesha",
    category: "Aarti",
    duration: "3 min read",
  },
  {
    id: "shiva-aarti",
    title: "Shiva Aarti",
    deity: "Shiva",
    category: "Aarti",
    duration: "3 min read",
  },
  {
    id: "hare-krishna-mahamantra",
    title: "Hare Krishna Mahamantra",
    deity: "Krishna",
    category: "Mantra",
    duration: "9 min read",
  },
  {
    id: "sai-baba-aarti",
    title: "Sai Baba Aarti",
    deity: "Sai Baba",
    category: "Aarti",
    duration: "4 min read",
  },
  {
    id: "surya-mantra",
    title: "Surya Namaskar Mantra",
    deity: "Surya",
    category: "Mantra",
    duration: "4 min read",
  },
];

export const prayerCatalog = [
  {
    id: "hanuman-chalisa",
    title: "Hanuman Chalisa",
    deity: "Hanuman",
    category: "Chalisa",
    duration: "8 min read",
    festivals: ["Hanuman Jayanti", "Diwali"],
  },
  {
    id: "ganesh-aarti",
    title: "Ganesh Aarti",
    deity: "Ganesha",
    category: "Aarti",
    duration: "3 min read",
    festivals: ["Ganesh Chaturthi"],
  },
  {
    id: "surya-mantra",
    title: "Surya Namaskar Mantra",
    deity: "Surya",
    category: "Mantra",
    duration: "4 min read",
    festivals: ["Makar Sankranti", "Ratha Saptami"],
  },
  {
    id: "mahamrityunjaya-mantra",
    title: "Mahamrityunjaya Mantra",
    deity: "Shiva",
    category: "Mantra",
    duration: "6 min read",
    festivals: ["Maha Shivaratri", "Shravan Somvar"],
  },
  {
    id: "durga-aarti",
    title: "Durga Aarti",
    deity: "Durga",
    category: "Aarti",
    duration: "5 min read",
    festivals: ["Navratri", "Durga Puja"],
  },
  {
    id: "lakshmi-puja",
    title: "Lakshmi Puja Vidhi",
    deity: "Lakshmi",
    category: "Puja",
    duration: "10 min read",
    festivals: ["Diwali", "Varalakshmi Vratham"],
  },
  {
    id: "shiva-aarti",
    title: "Shiva Aarti",
    deity: "Shiva",
    category: "Aarti",
    duration: "3 min read",
    festivals: ["Maha Shivaratri", "Shravan Somvar"],
  },
  {
    id: "rama-stuti",
    title: "Rama Stuti",
    deity: "Rama",
    category: "Stotram",
    duration: "5 min read",
    festivals: ["Rama Navami", "Diwali"],
  },
  {
    id: "sai-baba-aarti",
    title: "Sai Baba Aarti",
    deity: "Sai Baba",
    category: "Aarti",
    duration: "4 min read",
    festivals: ["Guru Purnima", "Sai Punyatithi"],
  },
  {
    id: "sri-suktam",
    title: "Sri Suktam",
    deity: "Lakshmi",
    category: "Stotram",
    duration: "7 min read",
    festivals: ["Varalakshmi Vratham", "Diwali"],
  },
  {
    id: "hare-krishna-mahamantra",
    title: "Hare Krishna Mahamantra",
    deity: "Krishna",
    category: "Mantra",
    duration: "9 min read",
    festivals: ["Janmashtami", "Ekadashi"],
  },
  {
    id: "holi-ke-din",
    title: "Holi Ke Din",
    deity: "Krishna",
    category: "Bhajan",
    duration: "5 min read",
    festivals: ["Holi"],
  },
];

export const festivalCatalog = [
  "Hanuman Jayanti",
  "Ganesh Chaturthi",
  "Makar Sankranti",
  "Maha Shivaratri",
  "Navratri",
  "Diwali",
  "Holi",
];

export const deityCatalog = ["Ganesha", "Shiva", "Krishna", "Lakshmi", "Durga", "Hanuman", "Rama", "Sai Baba"];

export const audioSchedule = [
  { day: "Sunday", prayer: "Surya Namaskar Mantra", deity: "Surya", meta: "4 min · 12 chants" },
  { day: "Monday", prayer: "Mahamrityunjaya Mantra", deity: "Shiva", meta: "6 min · 108 japam" },
  { day: "Tuesday", prayer: "Hanuman Chalisa", deity: "Hanuman", meta: "8 min · 40 verses" },
  { day: "Wednesday", prayer: "Ganesh Aarti", deity: "Ganesha", meta: "5 min · Morning aarti" },
  { day: "Thursday", prayer: "Sri Suktam", deity: "Lakshmi", meta: "7 min · Prosperity chant" },
  { day: "Friday", prayer: "Durga Aarti", deity: "Durga", meta: "5 min · Evening aarti" },
  { day: "Saturday", prayer: "Hare Krishna Mahamantra", deity: "Krishna", meta: "9 min · Maha mantra" },
];

export type PrayerDetailContent = {
  sourceLanguage: string;
  transliteratedVerses: string[];
  nativeVerses: string[];
  note: string;
};

export const prayerDetailContent: Record<string, PrayerDetailContent> = {
  "hanuman-chalisa": {
    sourceLanguage: "Hindi",
    note: "Tuesday Audio Prayer",
    transliteratedVerses: [
      "Shri guru charan saroj raj, nij manu mukuru sudhari.",
      "Baranau Raghubar bimal jasu, jo dayaku phal chari.",
      "Buddhi heen tanu janike, sumirau Pavan Kumar.",
      "Bal buddhi vidya dehu mohi, harahu kalesa vikar.",
    ],
    nativeVerses: [
      "श्री गुरु चरण सरोज रज, निज मनु मुकुरु सुधारि।",
      "बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥",
      "बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।",
      "बल बुद्धि विद्या देहु मोहि, हरहु कलेस विकार॥",
    ],
  },
  "ganesh-aarti": {
    sourceLanguage: "Hindi",
    note: "Wednesday Audio Prayer",
    transliteratedVerses: [
      "Jai Ganesh jai Ganesh jai Ganesh deva.",
      "Mata jaki Parvati, pita Mahadeva.",
      "Ek dant dayavant, char bhuja dhari.",
      "Mathe sindoor sohe, moose ki sawari.",
    ],
    nativeVerses: [
      "जय गणेश जय गणेश जय गणेश देवा।",
      "माता जाकी पार्वती, पिता महादेवा॥",
      "एक दंत दयावंत, चार भुजा धारी।",
      "माथे सिंदूर सोहे, मूसे की सवारी॥",
    ],
  },
  "surya-mantra": {
    sourceLanguage: "Sanskrit",
    note: "Sunday Audio Prayer",
    transliteratedVerses: [
      "Om Mitraya Namah.",
      "Om Ravaye Namah.",
      "Om Suryaya Namah.",
      "Om Bhanave Namah.",
    ],
    nativeVerses: [
      "ॐ मित्राय नमः।",
      "ॐ रवये नमः।",
      "ॐ सूर्याय नमः।",
      "ॐ भानवे नमः।",
    ],
  },
  "mahamrityunjaya-mantra": {
    sourceLanguage: "Sanskrit",
    note: "Monday Audio Prayer",
    transliteratedVerses: [
      "Om tryambakam yajamahe sugandhim pushtivardhanam.",
      "Urvarukamiva bandhanan mrityor mukshiya maamritat.",
    ],
    nativeVerses: [
      "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।",
      "उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥",
    ],
  },
  "durga-aarti": {
    sourceLanguage: "Hindi",
    note: "Friday Audio Prayer",
    transliteratedVerses: [
      "Jai Ambe Gauri, Maiya jai Shyama Gauri.",
      "Tumko nishdin dhyavat, Hari Brahma Shivri.",
      "Mang sindoor virajat, tiko mrigmad ko.",
      "Ujjwal se dou naina, chandravadan niko.",
    ],
    nativeVerses: [
      "जय अम्बे गौरी, मैया जय श्यामा गौरी।",
      "तुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी॥",
      "मांग सिंदूर विराजत, टीको मृगमद को।",
      "उज्ज्वल से दोउ नैना, चन्द्रवदन नीको॥",
    ],
  },
  "lakshmi-puja": {
    sourceLanguage: "Hindi",
    note: "Festival Prayer",
    transliteratedVerses: [
      "Mahalakshmi namastubhyam, namastubhyam sureshwari.",
      "Hari priye namastubhyam, namastubhyam daye nidhe.",
      "Padmasane padmakare, sarva lokaika pujite.",
    ],
    nativeVerses: [
      "महालक्ष्मि नमस्तुभ्यं, नमस्तुभ्यं सुरेश्वरि।",
      "हरिप्रिये नमस्तुभ्यं, नमस्तुभ्यं दयानिधे॥",
      "पद्मासने पद्मकरे, सर्व लोकैक पूजिते।",
    ],
  },
  "shiva-aarti": {
    sourceLanguage: "Hindi",
    note: "Featured Prayer",
    transliteratedVerses: [
      "Om jai Shiv Omkara, swami jai Shiv Omkara.",
      "Brahma Vishnu Sadashiv, ardhangi dhara.",
      "Ekanan chaturanan panchanan raje.",
      "Hansasan garudasan vrishvahan saje.",
    ],
    nativeVerses: [
      "ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा।",
      "ब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा॥",
      "एकानन चतुरानन पंचानन राजे।",
      "हंसासन गरुड़ासन वृषवाहन साजे॥",
    ],
  },
  "rama-stuti": {
    sourceLanguage: "Hindi",
    note: "Devotional Prayer",
    transliteratedVerses: [
      "Shri Ramchandra kripalu bhaj man, haran bhav bhay darunam.",
      "Nav kanj lochan, kanj mukh, kar kanj pad kanjarunam.",
    ],
    nativeVerses: [
      "श्री रामचन्द्र कृपालु भज मन, हरण भव भय दारुणम्।",
      "नव कंज लोचन, कंज मुख, कर कंज पद कंजारुणम्॥",
    ],
  },
  "sai-baba-aarti": {
    sourceLanguage: "Hindi",
    note: "Evening Prayer",
    transliteratedVerses: [
      "Aarti Sai Baba, saukhyadaataara jeeva.",
      "Charanrajatali dyava, dasa visava bhakta visava.",
    ],
    nativeVerses: [
      "आरती साईं बाबा, सौख्यदातार जीवा।",
      "चरणरजतळी द्यावा, दासा विसावा भक्तां विसावा॥",
    ],
  },
  "sri-suktam": {
    sourceLanguage: "Sanskrit",
    note: "Thursday Audio Prayer",
    transliteratedVerses: [
      "Hiranyavarnam harinim suvarna rajata srajam.",
      "Chandram hiranmayim Lakshmim jatavedo ma avaha.",
      "Tam ma avaha jatavedo Lakshmimanapagaminim.",
    ],
    nativeVerses: [
      "हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्।",
      "चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥",
      "तां म आवह जातवेदो लक्ष्मीमनपगामिनीम्।",
    ],
  },
  "hare-krishna-mahamantra": {
    sourceLanguage: "Sanskrit",
    note: "Saturday Audio Prayer",
    transliteratedVerses: [
      "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare.",
      "Hare Rama Hare Rama, Rama Rama Hare Hare.",
    ],
    nativeVerses: [
      "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।",
      "हरे राम हरे राम, राम राम हरे हरे॥",
    ],
  },
  "holi-ke-din": {
    sourceLanguage: "Hindi",
    note: "Festival Prayer",
    transliteratedVerses: [
      "Holi ke din dil khil jaate hain, rango mein rang mil jaate hain.",
      "Bhakti ke rang mein sab sajte, prem ke geet nikal jaate hain.",
    ],
    nativeVerses: [
      "होली के दिन दिल खिल जाते हैं, रंगों में रंग मिल जाते हैं।",
      "भक्ति के रंग में सब सजते, प्रेम के गीत निकल जाते हैं॥",
    ],
  },
};

export function getPrayerById(prayerId: string) {
  return prayerCatalog.find((prayer) => prayer.id === prayerId) ?? prayerCatalog[0];
}

export function getPrayerByTitle(title: string) {
  return prayerCatalog.find((prayer) => prayer.title === title);
}

export function getPrayerIdByTitle(title: string) {
  return getPrayerByTitle(title)?.id ?? "hanuman-chalisa";
}

export function getPrayerContentById(prayerId: string) {
  return prayerDetailContent[prayerId] ?? prayerDetailContent["hanuman-chalisa"];
}
