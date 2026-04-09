export interface Deity {
  id: string;
  name: string;
  symbol: string;
  tagline: string;
  color1: string;
  color2: string;
  bgLight: string;
}

export interface PrayerVerse {
  type: 'header' | 'verse' | 'refrain' | 'note';
  text: string;
}

export interface PrayerContent {
  lang: string;
  langLabel: string;
  verses: PrayerVerse[];
}

export interface Prayer {
  id: string;
  deityId: string;
  title: string;
  subtitle: string;
  duration: string;
  featured?: boolean;
  accessTier?: 'free' | 'premium';
  isPremium?: boolean;
  content: PrayerContent[];
}

export const deities: Deity[] = [
  {
    id: 'ganesha',
    name: 'Ganesha',
    symbol: '🐘',
    tagline: 'Remover of Obstacles',
    color1: '#FF8C42',
    color2: '#D4AF37',
    bgLight: '#FFF3E0',
  },
  {
    id: 'shiva',
    name: 'Shiva',
    symbol: '☽',
    tagline: 'The Destroyer & Transformer',
    color1: '#5C6BC0',
    color2: '#3949AB',
    bgLight: '#E8EAF6',
  },
  {
    id: 'krishna',
    name: 'Krishna',
    symbol: '🪷',
    tagline: 'The Divine Flute Player',
    color1: '#7B1FA2',
    color2: '#4A148C',
    bgLight: '#F3E5F5',
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi',
    symbol: '✿',
    tagline: 'Goddess of Wealth & Fortune',
    color1: '#C2185B',
    color2: '#880E4F',
    bgLight: '#FCE4EC',
  },
  {
    id: 'durga',
    name: 'Durga',
    symbol: '⚔',
    tagline: 'The Divine Mother Warrior',
    color1: '#D32F2F',
    color2: '#B71C1C',
    bgLight: '#FFEBEE',
  },
  {
    id: 'hanuman',
    name: 'Hanuman',
    symbol: '🙏',
    tagline: 'The Devoted Servant of Rama',
    color1: '#E64A19',
    color2: '#BF360C',
    bgLight: '#FBE9E7',
  },
  {
    id: 'rama',
    name: 'Rama',
    symbol: '🏹',
    tagline: 'The Ideal King & Devotee',
    color1: '#2E7D32',
    color2: '#1B5E20',
    bgLight: '#E8F5E9',
  },
  {
    id: 'saibaba',
    name: 'Sai Baba',
    symbol: '✦',
    tagline: 'Saint of Shirdi',
    color1: '#F57F17',
    color2: '#E65100',
    bgLight: '#FFFDE7',
  },
];

export const prayers: Prayer[] = [
  // ── HANUMAN ──────────────────────────────────────────────────────────────
  {
    id: 'hanuman-chalisa',
    deityId: 'hanuman',
    title: 'Hanuman Chalisa',
    subtitle: 'Chalisa',
    duration: '8 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ दोहा ॥' },
          {
            type: 'verse',
            text: 'श्री गुरु चरण सरोज रज, निज मनु मुकुरु सुधारि।\nबरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥',
          },
          {
            type: 'verse',
            text: 'बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।\nबल बुद्धि विद्या देहु मोहि, हरहु कलेस विकार॥',
          },
          { type: 'note', text: '॥ चौपाई ॥' },
          {
            type: 'verse',
            text: 'जय हनुमान ज्ञान गुण सागर।\nजय कपीस तिहुँ लोक उजागर॥',
          },
          {
            type: 'verse',
            text: 'रामदूत अतुलित बल धामा।\nअंजनि-पुत्र पवनसुत नामा॥',
          },
          {
            type: 'verse',
            text: 'महावीर विक्रम बजरंगी।\nकुमति निवार सुमति के संगी॥',
          },
          {
            type: 'verse',
            text: 'कंचन बरन बिराज सुबेसा।\nकानन कुण्डल कुञ्चित केसा॥',
          },
          {
            type: 'verse',
            text: 'हाथ बज्र अरु ध्वजा बिराजे।\nकाँधे मूँज जनेऊ साजे॥',
          },
          {
            type: 'verse',
            text: 'संकर सुवन केसरी नंदन।\nतेज प्रताप महा जग बंदन॥',
          },
          {
            type: 'verse',
            text: 'विद्यावान गुणी अति चातुर।\nराम काज करिबे को आतुर॥',
          },
          {
            type: 'verse',
            text: 'प्रभु चरित्र सुनिबे को रसिया।\nराम लखन सीता मन बसिया॥',
          },
          {
            type: 'verse',
            text: 'सूक्ष्म रूप धरि सियहिं दिखावा।\nबिकट रूप धरि लंक जरावा॥',
          },
          {
            type: 'verse',
            text: 'भीम रूप धरि असुर सँहारे।\nरामचंद्र के काज सँवारे॥',
          },
          {
            type: 'verse',
            text: 'लाय संजीवन लखन जियाये।\nश्री रघुबीर हरषि उर लाये॥',
          },
          {
            type: 'verse',
            text: 'रघुपति कीन्ही बहुत बड़ाई।\nतुम मम प्रिय भरतहि सम भाई॥',
          },
          {
            type: 'verse',
            text: 'सहस बदन तुम्हरो जस गावें।\nअस कहि श्रीपति कंठ लगावें॥',
          },
          {
            type: 'verse',
            text: 'तुम उपकार सुग्रीवहिं कीन्हा।\nराम मिलाय राज पद दीन्हा॥',
          },
          {
            type: 'verse',
            text: 'तुम्हरो मंत्र बिभीषन माना।\nलंकेश्वर भए सब जग जाना॥',
          },
          {
            type: 'verse',
            text: 'जुग सहस्त्र जोजन पर भानू।\nलील्यो ताहि मधुर फल जानू॥',
          },
          {
            type: 'verse',
            text: 'प्रभु मुद्रिका मेलि मुख माहीं।\nजलधि लाँघि गये अचरज नाहीं॥',
          },
          {
            type: 'verse',
            text: 'दुर्गम काज जगत के जेते।\nसुगम अनुग्रह तुम्हरे तेते॥',
          },
          {
            type: 'verse',
            text: 'राम दुआरे तुम रखवारे।\nहोत न आज्ञा बिनु पैसारे॥',
          },
          {
            type: 'verse',
            text: 'सब सुख लहै तुम्हारी सरना।\nतुम रक्षक काहू को डरना॥',
          },
          {
            type: 'verse',
            text: 'आपन तेज सम्हारो आपे।\nतीनों लोक हाँक ते काँपे॥',
          },
          {
            type: 'verse',
            text: 'भूत पिशाच निकट नहिं आवे।\nमहाबीर जब नाम सुनावे॥',
          },
          {
            type: 'verse',
            text: 'नासे रोग हरे सब पीरा।\nजपत निरंतर हनुमत बीरा॥',
          },
          {
            type: 'verse',
            text: 'संकट ते हनुमान छुड़ावे।\nमन क्रम बचन ध्यान जो लावे॥',
          },
          {
            type: 'verse',
            text: 'सब पर राम तपस्वी राजा।\nतिनके काज सकल तुम साजा॥',
          },
          {
            type: 'verse',
            text: 'और मनोरथ जो कोई लावे।\nसोई अमित जीवन फल पावे॥',
          },
          {
            type: 'verse',
            text: 'चारों जुग परताप तुम्हारा।\nहै परसिद्ध जगत उजियारा॥',
          },
          {
            type: 'verse',
            text: 'साधु संत के तुम रखवारे।\nअसुर निकंदन राम दुलारे॥',
          },
          {
            type: 'verse',
            text: 'अष्ट सिद्धि नव निधि के दाता।\nअस बर दीन जानकी माता॥',
          },
          {
            type: 'verse',
            text: 'राम रसायन तुम्हरे पासा।\nसदा रहो रघुपति के दासा॥',
          },
          {
            type: 'verse',
            text: 'तुम्हरे भजन राम को पावे।\nजनम जनम के दुख बिसरावे॥',
          },
          {
            type: 'verse',
            text: 'अंत काल रघुबर पुर जाई।\nजहाँ जन्म हरि-भक्त कहाई॥',
          },
          {
            type: 'verse',
            text: 'और देवता चित्त न धरई।\nहनुमत सेई सर्व सुख करई॥',
          },
          {
            type: 'verse',
            text: 'संकट कटे मिटे सब पीरा।\nजो सुमिरे हनुमत बलबीरा॥',
          },
          {
            type: 'verse',
            text: 'जय जय जय हनुमान गोसाईं।\nकृपा करहु गुरुदेव की नाईं॥',
          },
          {
            type: 'verse',
            text: 'जो शत बार पाठ कर कोई।\nछूटहि बंदि महा सुख होई॥',
          },
          {
            type: 'verse',
            text: 'जो यह पढे हनुमान चालीसा।\nहोय सिद्धि साखी गौरीसा॥',
          },
          {
            type: 'verse',
            text: 'तुलसीदास सदा हरि चेरा।\nकीजे नाथ हृदय मँह डेरा॥',
          },
          { type: 'note', text: '॥ दोहा ॥' },
          {
            type: 'verse',
            text: 'पवनतनय संकट हरन, मंगल मूरति रूप।\nराम लखन सीता सहित, हृदय बसहु सुर भूप॥',
          },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          { type: 'note', text: '— Doha (Opening Couplet) —' },
          {
            type: 'verse',
            text: 'Cleansing the mirror of my mind with the dust of the lotus feet of my Guru,\nI recite the unblemished glory of Shri Rama, the bestower of the four fruits of life.',
          },
          {
            type: 'verse',
            text: 'Knowing myself to be ignorant, I recall you, O Son of the Wind.\nGrant me strength, wisdom and knowledge, and remove my afflictions and impurities.',
          },
          { type: 'note', text: '— Chaupai (Verses) —' },
          {
            type: 'verse',
            text: 'Victory to Hanuman, the ocean of wisdom and virtue.\nVictory to the Lord of monkeys, illuminating the three worlds.',
          },
          {
            type: 'verse',
            text: 'You are the messenger of Ram, the abode of immeasurable strength.\nSon of Anjani, you are known as the son of the Wind-god.',
          },
          {
            type: 'verse',
            text: 'Great hero of immense prowess, mighty like a thunderbolt.\nDispeller of evil thoughts and companion of the righteous.',
          },
          {
            type: 'verse',
            text: 'With golden complexion and splendid attire,\nYou wear ear-rings and have curly locks of hair.',
          },
          {
            type: 'verse',
            text: 'In your hands shine the thunderbolt and a flag,\nOn your shoulder gleams the sacred thread of munja grass.',
          },
          {
            type: 'verse',
            text: 'O son of Shankar, offspring of Kesari,\nYour glory is celebrated throughout the three worlds.',
          },
          {
            type: 'verse',
            text: 'You are learned, virtuous, and supremely wise,\nEager to fulfill the mission of Shri Rama.',
          },
          {
            type: 'verse',
            text: 'You delight in hearing the deeds of your Lord,\nRama, Lakshmana and Sita dwell in your heart.',
          },
          {
            type: 'verse',
            text: 'You appeared in a subtle form before Sita,\nAnd assuming a fearsome form, you set Lanka on fire.',
          },
          {
            type: 'verse',
            text: 'In a formidable form you slew the demons,\nAnd accomplished all the tasks of Rama.',
          },
          {
            type: 'verse',
            text: 'You brought the Sanjeevani herb and revived Lakshmana,\nAnd Shri Raghubir embraced you joyfully.',
          },
        ],
      },
    ],
  },
  {
    id: 'hanuman-aarti',
    deityId: 'hanuman',
    title: 'Hanuman Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'आरती कीजे हनुमान लला की।\nदुष्ट दलन रघुनाथ कला की॥',
          },
          {
            type: 'verse',
            text: 'जाके बल से गिरिवर काँपे।\nरोग दोष जाके निकट न झाँके॥',
          },
          {
            type: 'verse',
            text: 'अंजनि पुत्र महाबल दाई।\nसंतन के प्रभु सदा सहाई॥',
          },
          {
            type: 'verse',
            text: 'दे बीड़ा रघुनाथ पठाए।\nलंका जारि सिया सुधि लाए॥',
          },
          {
            type: 'verse',
            text: 'लंका सो कोट समुद्र-सी खाई।\nजात पवनसुत बार न लाई॥',
          },
          {
            type: 'verse',
            text: 'लाए सजीवन लखन जियाए।\nश्री रघुबीर हरषि उर लाए॥',
          },
          {
            type: 'refrain',
            text: 'आरती कीजे हनुमान लला की।\nदुष्ट दलन रघुनाथ कला की॥',
          },
        ],
      },
    ],
  },
  {
    id: 'bajrang-baan',
    deityId: 'hanuman',
    title: 'Bajrang Baan',
    subtitle: 'Stotram',
    duration: '5 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ निश्चय प्रेम प्रतीति ते, बिनय करें सनमान॥' },
          {
            type: 'verse',
            text: 'जय हनुमंत संत हितकारी।\nसुन लीजे प्रभु अरज हमारी॥',
          },
          {
            type: 'verse',
            text: 'जन के काज बिलंब न कीजे।\nआतुर दौरे महा सुख दीजे॥',
          },
          {
            type: 'verse',
            text: 'जैसे कूदि सिंधु महि पारा।\nसुरसा बदन पैठि बिस्तारा॥',
          },
          {
            type: 'verse',
            text: 'आगे जाय लंकिनी रोका।\nमारेहु लात गई सुर लोका॥',
          },
          {
            type: 'verse',
            text: 'जाय बिभीषन को सुख दीन्हा।\nसीता निरखि परम पद लीन्हा॥',
          },
          {
            type: 'verse',
            text: 'बाग उजारि सिंधु महँ बोरा।\nअति आतुर यम कातर तोरा॥',
          },
        ],
      },
    ],
  },
  {
    id: 'sankat-mochan',
    deityId: 'hanuman',
    title: 'Sankat Mochan Ashtak',
    subtitle: 'Ashtak',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'verse',
            text: 'प्रमोद भरे मन मांहि, भजो सुमिरो हनुमान।\nसंकट मोचन नाम सुनत ही, सब विधि संकट जाय॥',
          },
          {
            type: 'verse',
            text: 'बुद्धिहीन को बुद्धि देवे, कोढ़ी को करे निरोग।\nगूंगे के मुख में बोल भरे, करे दारिद्र को भोग॥',
          },
          {
            type: 'verse',
            text: 'जो पढ़े संकट मोचन को, भव सागर से तर जाय।\nपवनपुत्र की कृपा से, मुक्ति पद को पाय॥',
          },
        ],
      },
    ],
  },

  // ── GANESHA ──────────────────────────────────────────────────────────────
  {
    id: 'ganesh-aarti',
    deityId: 'ganesha',
    title: 'Ganesh Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'जय गणेश जय गणेश, जय गणेश देवा।\nमाता जाकी पार्वती, पिता महादेवा॥',
          },
          {
            type: 'verse',
            text: 'एकदंत दयावंत, चार भुजा धारी।\nमाथे सिंदूर सोहे, मूसे की सवारी॥',
          },
          {
            type: 'verse',
            text: 'पान चढ़े फूल चढ़े, और चढ़े मेवा।\nलड्डुअन का भोग लगे, संत करें सेवा॥',
          },
          {
            type: 'verse',
            text: 'अंधन को आँख देत, कोढ़िन को काया।\nबाँझन को पुत्र देत, निर्धन को माया॥',
          },
          {
            type: 'verse',
            text: "'सूर' श्याम शरण आए, सफल कीजे सेवा।\nमाता जाकी पार्वती, पिता महादेवा॥",
          },
          {
            type: 'refrain',
            text: 'जय गणेश जय गणेश, जय गणेश देवा।\nमाता जाकी पार्वती, पिता महादेवा॥',
          },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          {
            type: 'refrain',
            text: 'Glory to Ganesha, Glory to Ganesha, Glory to Ganesha, O Lord!\nWhose mother is Parvati, and father is Lord Mahadeva.',
          },
          {
            type: 'verse',
            text: 'The merciful one with a single tusk, bearer of four arms,\nWearing sindoor on his forehead, riding upon a mouse.',
          },
          {
            type: 'verse',
            text: 'Betel leaves, flowers, and fruits are offered to you,\nLaddus are given as offerings, devotees serve with love.',
          },
          {
            type: 'verse',
            text: 'You give sight to the blind, and health to the sick,\nYou bless the childless with offspring, and the poor with wealth.',
          },
        ],
      },
    ],
  },
  {
    id: 'vakratunda',
    deityId: 'ganesha',
    title: 'Vakratunda Mahakaya',
    subtitle: 'Shloka',
    duration: '1 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          {
            type: 'verse',
            text: 'वक्रतुण्ड महाकाय, सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव, सर्वकार्येषु सर्वदा॥',
          },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          {
            type: 'verse',
            text: 'O Lord Ganesha, with a curved trunk and a massive body,\nWhose splendour is equal to ten million suns —\nPlease bestow on me the grace of removing obstacles\nIn all my endeavours, always.',
          },
        ],
      },
    ],
  },
  {
    id: 'ganpati-stavan',
    deityId: 'ganesha',
    title: 'Ganpati Stavan',
    subtitle: 'Stotram',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'verse',
            text: 'गणपति बप्पा मोरया, मंगल मूर्ति मोरया।\nपुढच्या वर्षी लवकर या, गणपति बप्पा मोरया॥',
          },
          {
            type: 'verse',
            text: 'जय देव जय देव जय मंगलमूर्ती।\nदर्शनमात्रे मन कामना पुरती॥',
          },
          {
            type: 'verse',
            text: 'रत्नखचित फरा तू, गणराया।\nचंदनाची उटी कुमकुम केशरी॥',
          },
        ],
      },
    ],
  },

  // ── SHIVA ─────────────────────────────────────────────────────────────────
  {
    id: 'shiva-aarti',
    deityId: 'shiva',
    title: 'Shiva Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'जय शिव ओंकारा, ओम जय शिव ओंकारा।\nब्रह्मा विष्णु सदाशिव, अर्धांगी धारा॥',
          },
          {
            type: 'verse',
            text: 'एकानन चतुरानन पंचानन राजे।\nहंसासन गरुड़ासन वृषवाहन साजे॥',
          },
          {
            type: 'verse',
            text: 'दो भुज चार चतुर्भुज दसभुज अति सोहे।\nतीनों रूप निरखते त्रिभुवन-जन मोहे॥',
          },
          {
            type: 'verse',
            text: 'अक्षमाला बनमाला रुण्डमाला धारी।\nचंदन मृगमद सोहे, भाले शशिधारी॥',
          },
          {
            type: 'verse',
            text: 'श्वेताम्बर पीताम्बर बाघम्बर अंगे।\nसनकादिक गरुड़ादिक भूतादिक संगे॥',
          },
          {
            type: 'verse',
            text: 'कर मध्ये कमण्डलु चक्र त्रिशूल धर्ता।\nजगकर्ता जगभर्ता जगसंहार कर्ता॥',
          },
          {
            type: 'refrain',
            text: 'जय शिव ओंकारा, ओम जय शिव ओंकारा।\nब्रह्मा विष्णु सदाशिव, अर्धांगी धारा॥',
          },
        ],
      },
    ],
  },
  {
    id: 'mahamrityunjaya',
    deityId: 'shiva',
    title: 'Mahamrityunjaya Mantra',
    subtitle: 'Mantra',
    duration: '2 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ महामृत्युञ्जय मन्त्र ॥' },
          {
            type: 'verse',
            text: 'ॐ त्र्यम्बकं यजामहे\nसुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्\nमृत्योर्मुक्षीय मामृतात्॥',
          },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          {
            type: 'verse',
            text: 'Om. We worship the three-eyed one (Lord Shiva),\nWho is fragrant and who nourishes all beings.\nMay He liberate us from the bondage of death,\nAs a cucumber is severed from the vine —\nAnd grant us immortality.',
          },
          { type: 'note', text: 'Chant this mantra 108 times with devotion for maximum benefit.' },
        ],
      },
    ],
  },
  {
    id: 'shiva-tandava',
    deityId: 'shiva',
    title: 'Shiva Tandava Stotram',
    subtitle: 'Stotram',
    duration: '6 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          {
            type: 'verse',
            text: 'जटाटवीगलज्जल प्रवाहपावितस्थले\nगलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।\nडमड्डमड्डमड्डम न्निनादवड्डमर्वयं\nचकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥',
          },
          {
            type: 'verse',
            text: 'जटाकटाहसम्भ्रम भ्रमन्निलिम्पनिर्झरी-\nविलोलवीचिवल्लरी विराजमानमूर्धनि।\nधगद्धगद्धगज्ज्वल ल्ललाटपट्टपावके\nकिशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम॥',
          },
          {
            type: 'verse',
            text: 'धराधरेन्द्रनन्दिनी विलासबन्धुबन्धुर-\nस्फुरद्दिगन्तसन्तति प्रमोदमानमानसे।\nकृपाकटाक्षधोरणी निरुद्धदुर्धरापदि\nक्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि॥',
          },
        ],
      },
    ],
  },

  // ── KRISHNA ──────────────────────────────────────────────────────────────
  {
    id: 'hare-krishna',
    deityId: 'krishna',
    title: 'Hare Krishna Mahamantra',
    subtitle: 'Mantra',
    duration: '2 min read',
    featured: true,
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ महामन्त्र ॥' },
          {
            type: 'verse',
            text: 'हरे कृष्ण हरे कृष्ण\nकृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम\nराम राम हरे हरे॥',
          },
          { type: 'note', text: 'Chant continuously with full devotion and surrender.' },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          {
            type: 'verse',
            text: 'Hare Krishna, Hare Krishna,\nKrishna Krishna, Hare Hare.\nHare Rama, Hare Rama,\nRama Rama, Hare Hare.',
          },
          {
            type: 'note',
            text: 'This maha-mantra consists of the three names of the Supreme — Hara, Krishna and Rama. It is the most accessible path to spiritual liberation in the current age.',
          },
        ],
      },
    ],
  },
  {
    id: 'achyutam-keshavam',
    deityId: 'krishna',
    title: 'Achyutam Keshavam',
    subtitle: 'Bhajan',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'अच्युतम केशवम् कृष्ण दामोदरम्\nराम नारायणम् जानकी वल्लभम्॥',
          },
          {
            type: 'verse',
            text: 'कौसल्या नंदनम् दशरथात्मजम्\nशत्रुघ्न भरत लक्ष्मण अग्रजम्॥',
          },
          {
            type: 'verse',
            text: 'वेणुनादम् ब्रह्म गोविन्दम्\nमाधवम् मधुसूदनम् केशवम्॥',
          },
          {
            type: 'refrain',
            text: 'अच्युतम केशवम् कृष्ण दामोदरम्\nराम नारायणम् जानकी वल्लभम्॥',
          },
        ],
      },
    ],
  },
  {
    id: 'govinda-aarti',
    deityId: 'krishna',
    title: 'Govinda Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'आरती कुंजबिहारी की, श्री गिरिधर कृष्णमुरारी की।\nगले में बैजंती माला, बजावत बंशी मधुर बाला॥',
          },
          {
            type: 'verse',
            text: 'श्रवण में कुण्डल झलकाला, नंद के आनंद नंदाला।\nগগन सम अंग कान्ति काली, राधिका चमक रही आली॥',
          },
          {
            type: 'verse',
            text: 'लतन में ठाड़े बनमाली, भ्रमर कटि पीत पट वाली।\nसुवर्ण कर मुरली रंग दे, देव दानव मुनि मन हरती॥',
          },
          {
            type: 'refrain',
            text: 'आरती कुंजबिहारी की, श्री गिरिधर कृष्णमुरारी की।',
          },
        ],
      },
    ],
  },

  // ── LAKSHMI ──────────────────────────────────────────────────────────────
  {
    id: 'lakshmi-aarti',
    deityId: 'lakshmi',
    title: 'Lakshmi Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\nतुमको निसदिन सेवत, हरि विष्णु विधाता॥',
          },
          {
            type: 'verse',
            text: 'उमा रमा ब्रह्माणी, तुम ही जग-माता।\nसूर्य चंद्रमा ध्यावत, नारद ऋषि गाता॥',
          },
          {
            type: 'verse',
            text: 'दुर्गा रूप निरंजनी, सुख संपत्ति दाता।\nजो कोई तुमको ध्यावत, ऋद्धि-सिद्धि धन पाता॥',
          },
          {
            type: 'verse',
            text: 'तुम पाताल निवासिनि, तुम ही शुभदाता।\nकर्म-प्रभाव प्रकाशिनी, भवनिधि की त्राता॥',
          },
          {
            type: 'verse',
            text: 'जिस घर में तुम रहतीं, सब सद्गुण आता।\nसब संभव हो जाता, मन नहीं घबराता॥',
          },
          {
            type: 'refrain',
            text: 'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\nतुमको निसदिन सेवत, हरि विष्णु विधाता॥',
          },
        ],
      },
    ],
  },
  {
    id: 'mahalakshmi-ashtakam',
    deityId: 'lakshmi',
    title: 'Mahalakshmi Ashtakam',
    subtitle: 'Ashtakam',
    duration: '4 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ महालक्ष्म्यष्टकम् ॥' },
          {
            type: 'verse',
            text: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते।\nशङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥',
          },
          {
            type: 'verse',
            text: 'नमस्ते गरुडारूढे कोलासुरभयंकरि।\nसर्वपापहरे देवि महालक्ष्मि नमोऽस्तु ते॥',
          },
          {
            type: 'verse',
            text: 'सर्वज्ञे सर्ववरदे सर्वदुष्टभयंकरि।\nसर्वदुःखहरे देवि महालक्ष्मि नमोऽस्तु ते॥',
          },
        ],
      },
    ],
  },
  {
    id: 'sri-suktam',
    deityId: 'lakshmi',
    title: 'Sri Suktam',
    subtitle: 'Stotram',
    duration: '5 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ श्री सूक्तम् ॥' },
          {
            type: 'verse',
            text: 'हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्।\nचन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
          },
          {
            type: 'verse',
            text: 'तां म आवह जातवेदो लक्ष्मीमनपगामिनीम्।\nयस्यां हिरण्यं विन्देयं गामश्वं पुरुषानहम्॥',
          },
          {
            type: 'verse',
            text: 'अश्वपूर्वां रथमध्यां हस्तिनाद-प्रबोधिनीम्।\nश्रियं देवीमुपह्वये श्रीर्मा देवी जुषताम्॥',
          },
        ],
      },
    ],
  },

  // ── DURGA ─────────────────────────────────────────────────────────────────
  {
    id: 'durga-aarti',
    deityId: 'durga',
    title: 'Durga Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'जय अम्बे गौरी, मैया जय श्यामा गौरी।\nतुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी॥',
          },
          {
            type: 'verse',
            text: 'माँग सिंदूर बिराजत, टीको मृगमद को।\nउज्जवल से दोउ नैना, चंद्रवदन नीको॥',
          },
          {
            type: 'verse',
            text: 'कनक समान कलेवर, रक्ताम्बर राजे।\nरक्तपुष्प गल माला, कंठन पर साजे॥',
          },
          {
            type: 'verse',
            text: 'केहरि वाहन राजत, खड्ग खप्परधारी।\nसुर-नर मुनि-जन सेवत, तिनके दुखहारी॥',
          },
          {
            type: 'verse',
            text: 'कानन कुण्डल शोभित, नासाग्रे मोती।\nकोटिक चंद्र दिवाकर, राजत सम ज्योती॥',
          },
          {
            type: 'refrain',
            text: 'जय अम्बे गौरी, मैया जय श्यामा गौरी।\nतुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी॥',
          },
        ],
      },
    ],
  },
  {
    id: 'durga-chalisa',
    deityId: 'durga',
    title: 'Durga Chalisa',
    subtitle: 'Chalisa',
    duration: '7 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ दोहा ॥' },
          {
            type: 'verse',
            text: 'नमो नमो दुर्गे सुख करनी।\nनमो नमो अम्बे दुख हरनी॥',
          },
          { type: 'note', text: '॥ चौपाई ॥' },
          {
            type: 'verse',
            text: 'निरंकार है ज्योति तुम्हारी।\nतिहुँ लोक फैली उजियारी॥',
          },
          {
            type: 'verse',
            text: 'शशि ललाट मुख महाविशाला।\nनेत्र लाल भृकुटि विकराला॥',
          },
          {
            type: 'verse',
            text: 'रूप मातु को अधिक सुहावे।\nदरश करत जन अति सुख पावे॥',
          },
          {
            type: 'verse',
            text: 'तुम संसार शक्ति लय कीना।\nपालन हेतु अन्न धन दीना॥',
          },
          {
            type: 'verse',
            text: 'अन्नपूर्णा हुई जग पाला।\nतुम ही आदि सुन्दरी बाला॥',
          },
        ],
      },
    ],
  },
  {
    id: 'mahishasura-mardini',
    deityId: 'durga',
    title: 'Mahishasura Mardini',
    subtitle: 'Stotram',
    duration: '5 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          {
            type: 'verse',
            text: 'अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दनुते\nगिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते।\nभगवति हे शितिकण्ठकुटुम्बिनि भूरिकुटुम्बिनि भूरिकृते\nजय जय हे महिषासुरमर्दिनि रम्यकपर्दिनि शैलसुते॥',
          },
          {
            type: 'verse',
            text: 'सुरवरवर्षिणि दुर्धरधर्षिणि दुर्मुखमर्षिणि हर्षरते\nत्रिभुवनपोषिणि शङ्करतोषिणि किल्बिषमोषिणि घोषरते।\nदनुजनिरोषिणि दितिसुतरोषिणि दुर्मदशोषिणि सिन्धुसुते\nजय जय हे महिषासुरमर्दिनि रम्यकपर्दिनि शैलसुते॥',
          },
        ],
      },
    ],
  },

  // ── RAMA ─────────────────────────────────────────────────────────────────
  {
    id: 'ram-aarti',
    deityId: 'rama',
    title: 'Ram Aarti',
    subtitle: 'Aarti',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'आरती श्री रामचंद्र जी की। दशरथ सुत कौसल्या नंदन की॥',
          },
          {
            type: 'verse',
            text: 'जय रघुनन्दन जय जय रघुपति। जय सियावर जय जय जगपति॥',
          },
          {
            type: 'verse',
            text: 'राम रघुवर कारन जग सोभा। सीता माता देखत मन मोह॥',
          },
          {
            type: 'verse',
            text: 'वरदायक सुखदायक देवा। सेवक सुर नर मुनि जन सेवा॥',
          },
          {
            type: 'verse',
            text: 'अंजनि पुत्र नहीं रहे दूरे। भक्तन के संकट सब दूरे॥',
          },
          {
            type: 'refrain',
            text: 'आरती श्री रामचंद्र जी की। दशरथ सुत कौसल्या नंदन की॥',
          },
        ],
      },
    ],
  },
  {
    id: 'ram-stuti',
    deityId: 'rama',
    title: 'Ram Stuti',
    subtitle: 'Stotram',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'verse',
            text: 'श्री रामचंद्र कृपालु भजु मन, हरण भव भय दारुणम्।\nनव कंज लोचन, कंज मुख कर, कंज पद कंजारुणम्॥',
          },
          {
            type: 'verse',
            text: 'कंदर्प अगणित अमित छवि, नव नील नीरद सुन्दरम्।\nपट पीत मानहु तड़ित रुचि शुचि नौमि जनक सुतावरम्॥',
          },
          {
            type: 'verse',
            text: 'भजु दीन बन्धु दिनेश दानव दैत्य वंश निकन्दनम्।\nरघुनन्द आनंद कन्द कोशल चन्द दशरथ नन्दनम्॥',
          },
        ],
      },
    ],
  },
  {
    id: 'ram-chalisa',
    deityId: 'rama',
    title: 'Ram Chalisa',
    subtitle: 'Chalisa',
    duration: '7 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ दोहा ॥' },
          {
            type: 'verse',
            text: 'श्रीरामचन्द्र की दया, मन में बसे अपार।\nजानकी जीवन प्रिय प्रभु, लखन सहित हित कार॥',
          },
          { type: 'note', text: '॥ चौपाई ॥' },
          {
            type: 'verse',
            text: 'जय श्री राम रमा रमणं, भजन करू मन मेरा।\nसीता लक्ष्मण सहित प्रभु, आनंद का है डेरा॥',
          },
          {
            type: 'verse',
            text: 'अवध नगर के राजदुलारे। दशरथ नंदन सबके प्यारे॥',
          },
          {
            type: 'verse',
            text: 'माता कौशल्या के पुत्र अनूपम। भरत लखन शत्रुघ्न भ्राता सुउत्तम॥',
          },
        ],
      },
    ],
  },

  // ── SAI BABA ──────────────────────────────────────────────────────────────
  {
    id: 'sai-aarti',
    deityId: 'saibaba',
    title: 'Sai Baba Aarti',
    subtitle: 'Aarti',
    duration: '4 min read',
    featured: true,
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'आरती साई बाबा, सौख्य दाता जीवा।\nचरणरज नव घेवो, दासां नित रे सेवा॥',
          },
          {
            type: 'verse',
            text: 'जाळूनिया अनंग, स्वस्वरूपी राहे।\nजनी भेदाभेद नाही, सर्वां सम पाहे॥',
          },
          {
            type: 'verse',
            text: 'उदी माये जगाची, पापे नासे भारी।\nसकल संकट होती दूर, उदी हे मुरारी॥',
          },
          {
            type: 'verse',
            text: 'सबका मालिक एक, यही शिक्षा उनकी।\nसाईं प्रेम की रीत, सबको प्रिय उनकी॥',
          },
          {
            type: 'verse',
            text: 'श्रद्धा और सबुरी, दो नाम जपो मन में।\nसाई की कृपा होगी, रहो आनंद में॥',
          },
          {
            type: 'refrain',
            text: 'आरती साई बाबा, सौख्य दाता जीवा।\nचरणरज नव घेवो, दासां नित रे सेवा॥',
          },
        ],
      },
    ],
  },
  {
    id: 'om-sai-ram',
    deityId: 'saibaba',
    title: 'Om Sai Ram',
    subtitle: 'Mantra',
    duration: '1 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'verse',
            text: 'ॐ साई राम\nॐ साई राम\nॐ साई राम॥',
          },
          {
            type: 'note',
            text: 'Repeat this mantra with full devotion. "Sabka Malik Ek" — The Lord of all is One.',
          },
          {
            type: 'verse',
            text: 'श्रद्धा रखो, सबुरी रखो।\nसाई बाबा की कृपा सदा रहे॥',
          },
        ],
      },
    ],
  },
  {
    id: 'sai-stavan',
    deityId: 'saibaba',
    title: 'Sai Stavan',
    subtitle: 'Bhajan',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'साई बाबा तुम ही हो मेरे, मेरे मन के भगवान।\nतुमसे ही है मेरी दुनिया, तुमसे ही मेरा जहान॥',
          },
          {
            type: 'verse',
            text: 'शिरडी की पावन धरती पर, आए एक फकीर।\nदीन दुखियों का दर्द हरा, बनके उनके पीर॥',
          },
          {
            type: 'verse',
            text: 'हिंदू मुस्लिम सिख ईसाई, सबको दिया प्यार।\nभेद भाव से दूर रहे, करते सबका उद्धार॥',
          },
          {
            type: 'refrain',
            text: 'साई बाबा तुम ही हो मेरे, मेरे मन के भगवान।\nतुमसे ही है मेरी दुनिया, तुमसे ही मेरा जहान॥',
          },
        ],
      },
    ],
  },

  // ── FESTIVAL-SPECIFIC PRAYERS ─────────────────────────────────────────────
  {
    id: 'diwali-puja',
    deityId: 'lakshmi',
    title: 'Diwali Puja Path',
    subtitle: 'Puja',
    duration: '5 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ दीपावली पूजन ॥' },
          {
            type: 'verse',
            text: 'इस पावन दीपावली के अवसर पर,\nहम माँ लक्ष्मी को अपने घर में आमंत्रित करते हैं।\nदीपों की ज्योति जलाकर, फूलों से सजाकर,\nमाँ लक्ष्मी का भव्य स्वागत करें॥',
          },
          { type: 'refrain', text: 'ॐ महालक्ष्म्यै नमः\nॐ महालक्ष्म्यै नमः\nॐ महालक्ष्म्यै नमः॥' },
          {
            type: 'verse',
            text: 'सोने चाँदी के आभूषण धारण किए,\nकमल पर विराजित माँ लक्ष्मी।\nश्रद्धा और विश्वास से करें पूजन,\nधन-धान्य का आशीर्वाद पाएँ॥',
          },
          {
            type: 'verse',
            text: 'घर-घर दीये जलाओ, मन का अंधेरा मिटाओ।\nमाँ का आशीर्वाद लो, जीवन खुशहाल बनाओ।\nपंच-देव पूजन कर, माँ का स्मरण करो,\nदिवाली की इस रात में, मंगल भाव भरो॥',
          },
          { type: 'refrain', text: 'ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः\nॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥' },
        ],
      },
    ],
  },
  {
    id: 'kuber-mantra',
    deityId: 'lakshmi',
    title: 'Kuber Mantra',
    subtitle: 'Mantra',
    duration: '2 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ श्री कुबेर मन्त्र ॥' },
          {
            type: 'verse',
            text: 'ॐ यक्षाय कुबेराय वैश्रवणाय\nधनधान्याधिपतये\nधनधान्यसमृद्धिं मे\nदेहि दापय स्वाहा॥',
          },
          { type: 'note', text: '॥ कुबेर बीज मन्त्र ॥' },
          {
            type: 'verse',
            text: 'ॐ ह्रीं श्रीं क्रीं श्रीं कुबेराय\nअष्टलक्ष्मी मम गृहे धन\nपुरय पुरय नमः॥',
          },
          { type: 'note', text: 'Chant 108 times during Diwali Puja for prosperity.' },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          {
            type: 'verse',
            text: 'O Kuber, the Lord of Yakshas, son of Vishrava,\nO Lord of all wealth and grains —\nPlease grant me abundance of wealth and grain.\nGive and bestow it upon me. Svaha.',
          },
          {
            type: 'note',
            text: 'Lord Kuber is the divine treasurer and god of wealth. Worshipping him during Diwali alongside Goddess Lakshmi brings prosperity and financial well-being.',
          },
        ],
      },
    ],
  },
  {
    id: 'jai-mata-di',
    deityId: 'durga',
    title: 'Jai Mata Di',
    subtitle: 'Bhajan',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'refrain', text: 'जय माता दी, जय माता दी,\nजय माता दी, जय माता दी॥' },
          { type: 'verse', text: 'चलो बुलावा आया है, माता ने बुलाया है।\nअपने दरबार में, माँ ने बुलाया है॥' },
          { type: 'verse', text: 'पहाड़ों वाली माँ, दुर्गा भवानी माँ।\nचंडी भवानी माँ, जय जय भवानी माँ॥' },
          { type: 'refrain', text: 'जय माता दी, जय माता दी॥' },
          {
            type: 'verse',
            text: 'नव दुर्गा की शक्ति से, जग का उद्धार हो।\nभक्तों के मन में माँ, तेरा ही वास हो।\nशेरावाली माँ की, जय जय जयकार हो।\nनवरात्रि के इस पर्व में, जय जयकार हो॥',
          },
          { type: 'refrain', text: 'जय माता दी, जय माता दी,\nजय माता दी, जय माता दी॥' },
        ],
      },
    ],
  },
  {
    id: 'navratri-aarti',
    deityId: 'durga',
    title: 'Nav Durga Aarti',
    subtitle: 'Aarti',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'refrain', text: 'नवरात्रि में माँ की आरती करो।\nभक्ति भाव से हृदय भरो॥' },
          { type: 'note', text: '॥ नव दुर्गा के नौ रूप ॥' },
          { type: 'verse', text: 'प्रथम शैलपुत्री माँ की जय।\nद्वितीय ब्रह्मचारिणी माँ की जय॥' },
          { type: 'verse', text: 'तृतीय चंद्रघंटा माँ की जय।\nचतुर्थ कूष्माण्डा माँ की जय॥' },
          { type: 'verse', text: 'पञ्चम स्कंदमाता माँ की जय।\nषष्ठम कात्यायनी माँ की जय॥' },
          { type: 'verse', text: 'सप्तम कालरात्रि माँ की जय।\nअष्टम महागौरी माँ की जय॥' },
          { type: 'verse', text: 'नवम सिद्धिदात्री माँ की जय।\nनव दुर्गा माँ सदा जय॥' },
          {
            type: 'verse',
            text: 'कन्या पूजन करो, भोग लगाओ।\nहलवा-पूड़ी-चना खिलाओ।\nनौ दिन का उपवास करो,\nमाँ का आशीर्वाद पाओ॥',
          },
          { type: 'refrain', text: 'नवरात्रि में माँ की आरती करो।\nभक्ति भाव से हृदय भरो॥' },
        ],
      },
    ],
  },
  {
    id: 'ganesh-chaturthi-prayer',
    deityId: 'ganesha',
    title: 'Ganesh Chaturthi Puja',
    subtitle: 'Puja',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ गणेश चतुर्थी पूजन ॥' },
          { type: 'refrain', text: 'गणपति बप्पा मोरया!\nपुढच्या वर्षी लवकर या!\nगणपति बप्पा मोरया!!' },
          {
            type: 'verse',
            text: 'आज गणेश चतुर्थी का पावन पर्व है।\nघर में गणपति बाप्पा का स्वागत करें।\nफूल, फल और मोदक अर्पण करें,\nबाप्पा का आशीर्वाद लें॥',
          },
          {
            type: 'verse',
            text: 'एकदंत विनायक, गणेश गणपति।\nमंगलमूर्ति मोरया, देवों के देव।\nविघ्नहर्ता, सुखकर्ता, दुखहर्ता,\nसिद्धिविनायक तुम्हें नमन॥',
          },
          {
            type: 'verse',
            text: 'अथर्वशीर्ष का पाठ करें,\nपंचामृत से स्नान कराएँ।\nदूर्वा, सिंदूर, मोदक चढ़ाएँ,\nबाप्पा को प्रसन्न करें॥',
          },
          { type: 'refrain', text: 'गणपति बप्पा मोरया!\nमंगलमूर्ति मोरया!!' },
        ],
      },
    ],
  },
  {
    id: 'krishna-janmashtami-bhajan',
    deityId: 'krishna',
    title: 'Nand Ke Anand Bhayo',
    subtitle: 'Bhajan',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'refrain', text: 'नंद के आनंद भयो, जय कन्हैया लाल की।\nहाथी घोड़ा पालकी, जय कन्हैया लाल की॥' },
          {
            type: 'verse',
            text: 'बृजवासी सब मिल गाओ, कान्हा जन्मे हैं आज।\nनंद बाबा के घर में आया, देवों का महाराज॥',
          },
          {
            type: 'verse',
            text: 'देवकी के नंदन कान्हा, वसुदेव के लाल।\nयशोदा मैया के बेटे, माखन खाने वाले।\nगोपियों के मन को भाते, मुरली मनोहर वाले॥',
          },
          {
            type: 'verse',
            text: 'जन्माष्टमी की रात है यह, मिट्टी के दीप जलाओ।\nकान्हा का जन्मोत्सव मनाओ, खुशियाँ घर में लाओ।\nझाँकी सजाओ, प्रसाद बाँटो, कृष्ण का नाम गाओ॥',
          },
          { type: 'refrain', text: 'नंद के आनंद भयो, जय कन्हैया लाल की।\nहाथी घोड़ा पालकी, जय कन्हैया लाल की॥' },
        ],
      },
    ],
  },
  {
    id: 'shivratri-prayer',
    deityId: 'shiva',
    title: 'Shivratri Stuti',
    subtitle: 'Stotram',
    duration: '4 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ महाशिवरात्रि स्तुति ॥' },
          {
            type: 'verse',
            text: 'हर हर महादेव, जय जय शिव शंकर।\nभोले भंडारी, जगत के नटवर।\nकैलाश पर्वत पर तुम विराजो,\nपार्वती संग जगत को सजाओ॥',
          },
          {
            type: 'verse',
            text: 'शिवरात्रि की पावन रात में,\nजागकर शिव का ध्यान करें।\nबेलपत्र, धतूरा, जल चढ़ाएँ,\nशिव की कृपा को पाएँ॥',
          },
          { type: 'refrain', text: 'जय जय शिव शंकर,\nहर हर महादेव।\nनीलकंठ नागेश्वर,\nशिव के चरण में सेव॥' },
          {
            type: 'verse',
            text: 'पंचाक्षर मंत्र का जाप करो,\nनमः शिवाय बोलते रहो।\nशिवरात्रि के इस शुभ अवसर पर,\nशिव के चरणों में सीस नवाओ॥',
          },
          { type: 'refrain', text: 'हर हर महादेव,\nओम नमः शिवाय।\nजय जय शिव शंकर,\nशिव की जय जयकार हो॥' },
        ],
      },
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ शिव पञ्चाक्षर स्तोत्रम् ॥' },
          {
            type: 'verse',
            text: 'नागेन्द्रहाराय त्रिलोचनाय\nभस्माङ्गरागाय महेश्वराय।\nनित्याय शुद्धाय दिगम्बराय\nतस्मै नकाराय नमः शिवाय॥',
          },
          {
            type: 'verse',
            text: 'मन्दाकिनीसलिलचन्दनचर्चिताय\nनन्दीश्वरप्रमथनाथमहेश्वराय।\nमन्दारपुष्पबहुपुष्पसुपूजिताय\nतस्मै मकाराय नमः शिवाय॥',
          },
        ],
      },
    ],
  },
  {
    id: 'holi-bhajan',
    deityId: 'krishna',
    title: 'Holi Ke Din',
    subtitle: 'Bhajan',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          {
            type: 'refrain',
            text: 'होली खेले रघुवीरा अवध में,\nहोली खेले रघुवीरा।\nसंग लेके सिया लखन को,\nहोली खेले रघुवीरा॥',
          },
          {
            type: 'verse',
            text: 'गोकुल में होली रे, कान्हा ने रंग डारो।\nराधा के अंग भीगे, कान्हा मुस्काए।\nब्रज में बजे मृदंग, गोपियाँ झूमती जाएँ॥',
          },
          {
            type: 'verse',
            text: 'फागुन आया रे बाबुल, रंगों की बहार आई।\nकृष्ण की बंसुरी बजे, राधा प्रेम में खो जाई।\nब्रज की होली निराली, गोपियाँ गाती जाई॥',
          },
          {
            type: 'verse',
            text: 'अबीर-गुलाल उड़ावो, रंग-बिरंगा संसार।\nहोली के इस त्योहार में, बाँटो प्रेम का प्यार।\nकृष्ण-राधा की होली, जगत में है बेमिसाल॥',
          },
          { type: 'refrain', text: 'होली खेले रघुवीरा अवध में,\nहोली खेले रघुवीरा॥' },
        ],
      },
    ],
  },
  {
    id: 'surya-namaskar-mantra',
    deityId: 'shiva',
    title: 'Surya Namaskar Mantra',
    subtitle: 'Mantra',
    duration: '3 min read',
    content: [
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ द्वादश सूर्य नमस्कार मन्त्र ॥' },
          { type: 'verse', text: 'ॐ मित्राय नमः।\nॐ रवये नमः।\nॐ सूर्याय नमः।\nॐ भानवे नमः।' },
          { type: 'verse', text: 'ॐ खगाय नमः।\nॐ पूष्णे नमः।\nॐ हिरण्यगर्भाय नमः।\nॐ मरीचये नमः।' },
          { type: 'verse', text: 'ॐ आदित्याय नमः।\nॐ सवित्रे नमः।\nॐ अर्काय नमः।\nॐ भास्कराय नमः।' },
          { type: 'note', text: '॥ सूर्य प्रार्थना ॥' },
          {
            type: 'verse',
            text: 'ॐ आदित्यस्य नमस्कारं ये कुर्वन्ति दिने दिने।\nआयुः प्रज्ञा बलं वीर्यं तेजस्तेषां च जायते॥',
          },
        ],
      },
      {
        lang: 'english',
        langLabel: 'English',
        verses: [
          { type: 'note', text: '— Twelve Names of the Sun God —' },
          {
            type: 'verse',
            text: 'Om, salutation to Mitra (the friend of all).\nOm, salutation to Ravi (the shining one).\nOm, salutation to Surya (the radiant sun).\nOm, salutation to Bhanu (the luminous).',
          },
          {
            type: 'verse',
            text: 'Om, salutation to Khaga (sky traveler).\nOm, salutation to Pushna (the nourisher).\nOm, salutation to Hiranyagarbha (golden womb).\nOm, salutation to Marichi (ray of light).',
          },
          {
            type: 'verse',
            text: 'Om, salutation to Aditya (son of Aditi).\nOm, salutation to Savitri (the vivifier).\nOm, salutation to Arka (the radiant one).\nOm, salutation to Bhaskara (the illuminator).',
          },
          { type: 'note', text: 'Those who salute the Sun daily with these twelve names receive longevity, wisdom, strength, vitality, and radiance.' },
        ],
      },
    ],
  },
  {
    id: 'makar-sankranti-prayer',
    deityId: 'ganesha',
    title: 'Makar Sankranti Prayer',
    subtitle: 'Stotram',
    duration: '3 min read',
    content: [
      {
        lang: 'hindi',
        langLabel: 'Hindi',
        verses: [
          { type: 'note', text: '॥ मकर संक्रांति पर्व ॥' },
          {
            type: 'verse',
            text: 'उत्तरायण का पर्व आया, सूर्य देव का आशीर्वाद लाया।\nतिल और गुड़ की मिठास, जीवन में खुशियाँ बाँटो आज॥',
          },
          {
            type: 'verse',
            text: 'खिचड़ी खाओ, दान करो, पतंग उड़ाओ आकाश में।\nमकर संक्रांति का पर्व मनाओ, सूर्य देव की पूजा करो॥',
          },
          { type: 'refrain', text: 'जय सूर्य देव, जय सूर्य नारायण।\nउत्तरायण में तेरा आगमन॥' },
          {
            type: 'verse',
            text: 'गंगा स्नान का पर्व है यह, पुण्य की गंगा बहाओ।\nदान पुण्य और तप से, मोक्ष का मार्ग पाओ।\nतिल के लड्डू, गुड़ की मिठाई, संक्रांति की यह परंपरा॥',
          },
        ],
      },
      {
        lang: 'sanskrit',
        langLabel: 'Sanskrit',
        verses: [
          { type: 'note', text: '॥ सूर्य अर्घ्य मन्त्र ॥' },
          { type: 'verse', text: 'ॐ सूर्याय नमः।\nॐ आदित्याय नमः।\nॐ नमो भगवते श्री सूर्याय नमः॥' },
          {
            type: 'verse',
            text: 'एहि सूर्य सहस्रांशो तेजोराशे जगत्पते।\nअनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥',
          },
          { type: 'note', text: 'Offer water to the rising Sun facing East while chanting this mantra.' },
        ],
      },
    ],
  },
];

export const featuredPrayers = prayers.filter((p) => p.featured);

export const getDailyPrayer = (): Prayer => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return prayers[dayOfYear % prayers.length];
};

export const getPrayersByDeity = (deityId: string): Prayer[] =>
  prayers.filter((p) => p.deityId === deityId);

export const getPrayerById = (id: string): Prayer | undefined =>
  prayers.find((p) => p.id === id);

export const getDeityById = (id: string): Deity | undefined =>
  deities.find((d) => d.id === id);

export const searchPrayers = (query: string): Prayer[] => {
  const q = query.toLowerCase();
  return prayers.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      deities.find((d) => d.id === p.deityId)?.name.toLowerCase().includes(q)
  );
};
