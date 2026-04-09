import type { Festival } from './data/festivals';
import type { Prayer, PrayerContent, PrayerVerse, Deity } from './data/prayers';
import type { AppLanguage, PrayerSourceLanguage } from './i18n';
import type { AppPreferences } from './context/AppContext';

const deityNames: Record<Exclude<AppLanguage, 'english'>, Record<string, { name: string; tagline: string }>> = {
  hindi: {
    ganesha: { name: 'गणेश', tagline: 'विघ्नहर्ता' },
    shiva: { name: 'शिव', tagline: 'संहार और रूपांतरण के देव' },
    krishna: { name: 'कृष्ण', tagline: 'मुरलीधर भगवान' },
    lakshmi: { name: 'लक्ष्मी', tagline: 'धन और समृद्धि की देवी' },
    durga: { name: 'दुर्गा', tagline: 'दिव्य मातृ शक्ति' },
    hanuman: { name: 'हनुमान', tagline: 'रामभक्त वीर' },
    rama: { name: 'राम', tagline: 'मर्यादा पुरुषोत्तम' },
    saibaba: { name: 'साईं बाबा', tagline: 'शिरडी के संत' },
  },
  telugu: {
    ganesha: { name: 'గణేశుడు', tagline: 'విఘ్నాలను తొలగించే దేవుడు' },
    shiva: { name: 'శివుడు', tagline: 'లయం మరియు మార్పు యొక్క దేవుడు' },
    krishna: { name: 'కృష్ణుడు', tagline: 'దివ్య వేణుగానుడు' },
    lakshmi: { name: 'లక్ష్మి', tagline: 'సంపద దేవి' },
    durga: { name: 'దుర్గమ్మ', tagline: 'దివ్య తల్లి' },
    hanuman: { name: 'హనుమంతుడు', tagline: 'రామభక్తుడు' },
    rama: { name: 'రాముడు', tagline: 'ధర్మమూర్తి' },
    saibaba: { name: 'సాయిబాబా', tagline: 'శిర్డీ మహాసంత్' },
  },
  kannada: {
    ganesha: { name: 'ಗಣೇಶ', tagline: 'ವಿಘ್ನಹರ' },
    shiva: { name: 'ಶಿವ', tagline: 'ಲಯ ಮತ್ತು ರೂಪಾಂತರದ ದೇವರು' },
    krishna: { name: 'ಕೃಷ್ಣ', tagline: 'ದಿವ್ಯ ಬಾಸುರಿ ವಾದಕ' },
    lakshmi: { name: 'ಲಕ್ಷ್ಮೀ', tagline: 'ಸಂಪತ್ತಿನ ದೇವಿ' },
    durga: { name: 'ದುರ್ಗೆ', tagline: 'ದಿವ್ಯ ತಾಯಿ' },
    hanuman: { name: 'ಹನುಮಾನ್', tagline: 'ಶ್ರೇಷ್ಠ ರಾಮಭಕ್ತ' },
    rama: { name: 'ರಾಮ', tagline: 'ಮರ್ಯಾದಾ ಪುರುಷೋತ್ತಮ' },
    saibaba: { name: 'ಸಾಯಿ ಬಾಬಾ', tagline: 'ಶಿರಡಿಯ ಸಂತ' },
  },
  tamil: {
    ganesha: { name: 'கணேசர்', tagline: 'விநாயகர், தடைகள் நீக்குபவர்' },
    shiva: { name: 'சிவன்', tagline: 'அழித்து மாற்றும் இறைவன்' },
    krishna: { name: 'கிருஷ்ணர்', tagline: 'திவ்ய வீணை ஓசை கொண்டவன்' },
    lakshmi: { name: 'லட்சுமி', tagline: 'செல்வத்தின் தேவி' },
    durga: { name: 'துர்கை', tagline: 'தெய்வீக அன்னை' },
    hanuman: { name: 'ஆஞ்சநேயர்', tagline: 'இராம பக்த வீரர்' },
    rama: { name: 'ராமர்', tagline: 'தர்மத்தின் வடிவு' },
    saibaba: { name: 'சாய்பாபா', tagline: 'ஷிர்டி சந்நியாசி' },
  },
  marathi: {
    ganesha: { name: 'गणपती', tagline: 'विघ्नहर्ता' },
    shiva: { name: 'शिव', tagline: 'संहार व रूपांतरणाचे देव' },
    krishna: { name: 'कृष्ण', tagline: 'मुरलीधर' },
    lakshmi: { name: 'लक्ष्मी', tagline: 'समृद्धीची देवी' },
    durga: { name: 'दुर्गा', tagline: 'दिव्य मातृशक्ती' },
    hanuman: { name: 'हनुमान', tagline: 'रामभक्त वीर' },
    rama: { name: 'राम', tagline: 'मर्यादा पुरुषोत्तम' },
    saibaba: { name: 'साई बाबा', tagline: 'शिर्डीचे संत' },
  },
};

const festivalNames: Record<Exclude<AppLanguage, 'english'>, Record<string, { name: string; nativeName: string; description: string }>> = {
  hindi: {
    diwali: { name: 'दीवाली', nativeName: 'दीपावली', description: 'प्रकाश और समृद्धि का पर्व' },
    navratri: { name: 'नवरात्रि', nativeName: 'नवरात्रि', description: 'दिव्य शक्ति की नौ रातें' },
    'ganesh-chaturthi': { name: 'गणेश चतुर्थी', nativeName: 'गणेश चतुर्थी', description: 'भगवान गणेश का जन्मोत्सव' },
    janmashtami: { name: 'जन्माष्टमी', nativeName: 'जन्माष्टमी', description: 'भगवान कृष्ण का जन्मोत्सव' },
    mahashivratri: { name: 'महाशिवरात्रि', nativeName: 'महाशिवरात्रि', description: 'भगवान शिव की महान रात्रि' },
    'ram-navami': { name: 'राम नवमी', nativeName: 'राम नवमी', description: 'भगवान राम का जन्मोत्सव' },
    'hanuman-jayanti': { name: 'हनुमान जयंती', nativeName: 'हनुमान जयंती', description: 'भगवान हनुमान का जन्मोत्सव' },
    holi: { name: 'होली', nativeName: 'होली', description: 'रंगों और आनंद का त्योहार' },
    'makar-sankranti': { name: 'मकर संक्रांति', nativeName: 'मकर संक्रांति', description: 'सूर्य उपासना और फसल का पर्व' },
    'krishna-janmashtami-extra': { name: 'गोवर्धन पूजा', nativeName: 'गोवर्धन पूजा', description: 'दीवाली के अगले दिन की पूजा' },
  },
  telugu: {
    diwali: { name: 'దీపావళి', nativeName: 'దీపావళి', description: 'వెలుగులు మరియు ఐశ్వర్య పండుగ' },
    navratri: { name: 'నవరాత్రి', nativeName: 'నవరాత్రి', description: 'దివ్య తల్లికి తొమ్మిది రాత్రులు' },
    'ganesh-chaturthi': { name: 'వినాయక చవితి', nativeName: 'వినాయక చవితి', description: 'గణేశుడి జన్మోత్సవం' },
    janmashtami: { name: 'జన్మాష్టమి', nativeName: 'జన్మాష్టమి', description: 'కృష్ణుడి జన్మోత్సవం' },
    mahashivratri: { name: 'మహాశివరాత్రి', nativeName: 'మహాశివరాత్రి', description: 'శివుని మహారాత్రి' },
    'ram-navami': { name: 'రామ నవమి', nativeName: 'రామ నవమి', description: 'రాముడి జన్మోత్సవం' },
    'hanuman-jayanti': { name: 'హనుమాన్ జయంతి', nativeName: 'హనుమాన్ జయంతి', description: 'హనుమంతుడి జన్మోత్సవం' },
    holi: { name: 'హోళీ', nativeName: 'హోళీ', description: 'రంగుల పండుగ' },
    'makar-sankranti': { name: 'మకర సంక్రాంతి', nativeName: 'మకర సంక్రాంతి', description: 'సూర్యారాధన పండుగ' },
    'krishna-janmashtami-extra': { name: 'గోవర్ధన పూజ', nativeName: 'గోవర్ధన పూజ', description: 'దీపావళి తర్వాతి పూజ' },
  },
  kannada: {
    diwali: { name: 'ದೀಪಾವಳಿ', nativeName: 'ದೀಪಾವಳಿ', description: 'ಬೆಳಕು ಮತ್ತು ಸಮೃದ್ಧಿಯ ಹಬ್ಬ' },
    navratri: { name: 'ನವರಾತ್ರಿ', nativeName: 'ನವರಾತ್ರಿ', description: 'ದಿವ್ಯ ತಾಯಿಯ ಒಂಬತ್ತು ರಾತ್ರಿಗಳು' },
    'ganesh-chaturthi': { name: 'ಗಣೇಶ ಚತುರ್ಥಿ', nativeName: 'ಗಣೇಶ ಚತುರ್ಥಿ', description: 'ಗಣೇಶನ ಜನ್ಮೋತ್ಸವ' },
    janmashtami: { name: 'ಜನ್ಮಾಷ್ಟಮಿ', nativeName: 'ಜನ್ಮಾಷ್ಟಮಿ', description: 'ಕೃಷ್ಣನ ಜನ್ಮೋತ್ಸವ' },
    mahashivratri: { name: 'ಮಹಾಶಿವರಾತ್ರಿ', nativeName: 'ಮಹಾಶಿವರಾತ್ರಿ', description: 'ಶಿವನ ಮಹಾರಾತ್ರಿ' },
    'ram-navami': { name: 'ರಾಮನವಮಿ', nativeName: 'ರಾಮನವಮಿ', description: 'ರಾಮನ ಜನ್ಮೋತ್ಸವ' },
    'hanuman-jayanti': { name: 'ಹನುಮ ಜಯಂತಿ', nativeName: 'ಹನುಮ ಜಯಂತಿ', description: 'ಹನುಮಂತನ ಜನ್ಮೋತ್ಸವ' },
    holi: { name: 'ಹೋಳಿ', nativeName: 'ಹೋಳಿ', description: 'ಬಣ್ಣಗಳ ಹಬ್ಬ' },
    'makar-sankranti': { name: 'ಮಕರ ಸಂಕ್ರಾಂತಿ', nativeName: 'ಮಕರ ಸಂಕ್ರಾಂತಿ', description: 'ಸೂರ್ಯಾರಾಧನೆಯ ಹಬ್ಬ' },
    'krishna-janmashtami-extra': { name: 'ಗೋವರ್ಧನ ಪೂಜೆ', nativeName: 'ಗೋವರ್ಧನ ಪೂಜೆ', description: 'ದೀಪಾವಳಿಯ ಮುಂದಿನ ದಿನದ ಪೂಜೆ' },
  },
  tamil: {
    diwali: { name: 'தீபாவளி', nativeName: 'தீபாவளி', description: 'ஒளி மற்றும் வளத்தின் திருவிழா' },
    navratri: { name: 'நவராத்திரி', nativeName: 'நவராத்திரி', description: 'தெய்வ அன்னையின் ஒன்பது இரவுகள்' },
    'ganesh-chaturthi': { name: 'விநாயகர் சதுர்த்தி', nativeName: 'விநாயகர் சதுர்த்தி', description: 'கணேசரின் பிறந்த நாள்' },
    janmashtami: { name: 'ஜன்மாஷ்டமி', nativeName: 'ஜன்மாஷ்டமி', description: 'கிருஷ்ணரின் பிறந்த நாள்' },
    mahashivratri: { name: 'மகாசிவராத்திரி', nativeName: 'மகாசிவராத்திரி', description: 'சிவபெருமானின் மகா இரவு' },
    'ram-navami': { name: 'ராமநவமி', nativeName: 'ராமநவமி', description: 'ராமரின் பிறந்த நாள்' },
    'hanuman-jayanti': { name: 'அஞ்சநேயர் ஜெயந்தி', nativeName: 'அஞ்சநேயர் ஜெயந்தி', description: 'அஞ்சநேயரின் பிறந்த நாள்' },
    holi: { name: 'ஹோலி', nativeName: 'ஹோலி', description: 'வண்ணங்களின் திருவிழா' },
    'makar-sankranti': { name: 'மகர சங்கராந்தி', nativeName: 'மகர சங்கராந்தி', description: 'சூரிய வழிபாட்டு திருநாள்' },
    'krishna-janmashtami-extra': { name: 'கோவர்த்தன பூஜை', nativeName: 'கோவர்த்தன பூஜை', description: 'தீபாவளிக்குப் பிறந்த நாள் வழிபாடு' },
  },
  marathi: {
    diwali: { name: 'दिवाळी', nativeName: 'दीपावली', description: 'प्रकाश आणि समृद्धीचा सण' },
    navratri: { name: 'नवरात्री', nativeName: 'नवरात्री', description: 'दिव्य मातृशक्तीच्या नऊ रात्री' },
    'ganesh-chaturthi': { name: 'गणेश चतुर्थी', nativeName: 'गणेश चतुर्थी', description: 'गणपती बाप्पांचा जन्मोत्सव' },
    janmashtami: { name: 'जन्माष्टमी', nativeName: 'जन्माष्टमी', description: 'कृष्ण जन्मोत्सव' },
    mahashivratri: { name: 'महाशिवरात्री', nativeName: 'महाशिवरात्री', description: 'भगवान शिवांची महान रात्र' },
    'ram-navami': { name: 'राम नवमी', nativeName: 'राम नवमी', description: 'भगवान रामांचा जन्मोत्सव' },
    'hanuman-jayanti': { name: 'हनुमान जयंती', nativeName: 'हनुमान जयंती', description: 'हनुमान जन्मोत्सव' },
    holi: { name: 'होळी', nativeName: 'होळी', description: 'रंगांचा सण' },
    'makar-sankranti': { name: 'मकर संक्रांत', nativeName: 'मकर संक्रांत', description: 'सूर्य उपासनेचा सण' },
    'krishna-janmashtami-extra': { name: 'गोवर्धन पूजा', nativeName: 'गोवर्धन पूजा', description: 'दिवाळीनंतरची पूजा' },
  },
};

const subtitleLabels: Record<Exclude<AppLanguage, 'english'>, Record<string, string>> = {
  hindi: { Chalisa: 'चालीसा', Aarti: 'आरती', Stotram: 'स्तोत्र', Ashtak: 'अष्टक', Ashtakam: 'अष्टकम', Mantra: 'मंत्र', Bhajan: 'भजन', Shloka: 'श्लोक', Puja: 'पूजा' },
  telugu: { Chalisa: 'చాలీసా', Aarti: 'ఆరతి', Stotram: 'స్తోత్రం', Ashtak: 'అష్టకం', Ashtakam: 'అష్టకం', Mantra: 'మంత్రం', Bhajan: 'భజన', Shloka: 'శ్లోకం', Puja: 'పూజ' },
  kannada: { Chalisa: 'ಚಾಲೀಸಾ', Aarti: 'ಆರತಿ', Stotram: 'ಸ್ತೋತ್ರ', Ashtak: 'ಅಷ್ಟಕ', Ashtakam: 'ಅಷ್ಟಕಂ', Mantra: 'ಮಂತ್ರ', Bhajan: 'ಭಜನೆ', Shloka: 'ಶ್ಲೋಕ', Puja: 'ಪೂಜೆ' },
  tamil: { Chalisa: 'சாலிசா', Aarti: 'ஆரத்தி', Stotram: 'ஸ்தோத்திரம்', Ashtak: 'அஷ்டகம்', Ashtakam: 'அஷ்டகம்', Mantra: 'மந்திரம்', Bhajan: 'பஜன்', Shloka: 'ஸ்லோகம்', Puja: 'பூஜை' },
  marathi: { Chalisa: 'चालीसा', Aarti: 'आरती', Stotram: 'स्तोत्र', Ashtak: 'अष्टक', Ashtakam: 'अष्टक', Mantra: 'मंत्र', Bhajan: 'भजन', Shloka: 'श्लोक', Puja: 'पूजा' },
};

const prayerTitles: Partial<Record<Exclude<AppLanguage, 'english'>, Record<string, string>>> = {
  hindi: {
    'hanuman-chalisa': 'हनुमान चालीसा',
    'hanuman-aarti': 'हनुमान आरती',
    'bajrang-baan': 'बजरंग बाण',
    'sankat-mochan': 'संकट मोचन अष्टक',
    'ganesh-aarti': 'गणेश आरती',
    vakratunda: 'वक्रतुंड महाकाय',
    'ganpati-stavan': 'गणपति स्तवन',
    'shiva-aarti': 'शिव आरती',
    mahamrityunjaya: 'महामृत्युंजय मंत्र',
    'shiva-tandava': 'शिव तांडव स्तोत्र',
    'hare-krishna': 'हरे कृष्ण महामंत्र',
    'achyutam-keshavam': 'अच्युतम केशवं',
    'govinda-aarti': 'गोविंद आरती',
    'lakshmi-aarti': 'लक्ष्मी आरती',
    'mahalakshmi-ashtakam': 'महालक्ष्मी अष्टकम',
    'sri-suktam': 'श्री सूक्तम्',
    'durga-aarti': 'दुर्गा आरती',
    'durga-chalisa': 'दुर्गा चालीसा',
    'mahishasura-mardini': 'महिषासुर मर्दिनी',
    'ram-aarti': 'राम आरती',
    'ram-stuti': 'राम स्तुति',
    'ram-chalisa': 'राम चालीसा',
    'sai-aarti': 'साईं बाबा आरती',
    'om-sai-ram': 'ॐ साईं राम',
    'sai-stavan': 'साईं स्तवन',
    'diwali-puja': 'दिवाली पूजा पाठ',
    'kuber-mantra': 'कुबेर मंत्र',
    'jai-mata-di': 'जय माता दी',
    'navratri-aarti': 'नव दुर्गा आरती',
    'ganesh-chaturthi-prayer': 'गणेश चतुर्थी पूजा',
    'krishna-janmashtami-bhajan': 'नंद के आनंद भयो',
    'shivratri-prayer': 'शिवरात्रि स्तुति',
    'holi-bhajan': 'होली के दिन',
    'surya-namaskar-mantra': 'सूर्य नमस्कार मंत्र',
    'makar-sankranti-prayer': 'मकर संक्रांति प्रार्थना',
  },
  telugu: {
    'hanuman-chalisa': 'హనుమాన్ చాలీసా',
    'hanuman-aarti': 'హనుమాన్ ఆరతి',
    'bajrang-baan': 'బజరంగ్ బాణ్',
    'sankat-mochan': 'సంకట్ మోచన్ అష్టకం',
    'ganesh-aarti': 'గణేశ ఆరతి',
    vakratunda: 'వక్రతుండ మహాకాయ',
    'ganpati-stavan': 'గణపతి స్తవనం',
    'shiva-aarti': 'శివ ఆరతి',
    mahamrityunjaya: 'మహామృత్యుంజయ మంత్రం',
    'shiva-tandava': 'శివ తాండవ స్తోత్రం',
    'hare-krishna': 'హరే కృష్ణ మహామంత్రం',
    'achyutam-keshavam': 'అచ్యుతం కేశవం',
    'govinda-aarti': 'గోవింద ఆరతి',
    'lakshmi-aarti': 'లక్ష్మీ ఆరతి',
    'mahalakshmi-ashtakam': 'మహాలక్ష్మీ అష్టకం',
    'sri-suktam': 'శ్రీ సూక్తం',
    'durga-aarti': 'దుర్గ ఆరతి',
    'durga-chalisa': 'దుర్గ చాలీసా',
    'mahishasura-mardini': 'మహిషాసుర మర్దిని',
    'ram-aarti': 'రామ ఆరతి',
    'ram-stuti': 'రామ స్తుతి',
    'ram-chalisa': 'రామ చాలీసా',
    'sai-aarti': 'సాయి బాబా ఆరతి',
    'om-sai-ram': 'ఓం సాయి రామ్',
    'sai-stavan': 'సాయి స్తవనం',
    'diwali-puja': 'దీపావళి పూజా పాఠం',
    'kuber-mantra': 'కుబేర మంత్రం',
    'jai-mata-di': 'జై మాతా దీ',
    'navratri-aarti': 'నవ దుర్గ ఆరతి',
    'ganesh-chaturthi-prayer': 'గణేశ చతుర్థి పూజ',
    'krishna-janmashtami-bhajan': 'నంద్ కే ఆనంద్ భయో',
    'shivratri-prayer': 'శివరాత్రి స్తుతి',
    'holi-bhajan': 'హోళీ కె దిన్',
    'surya-namaskar-mantra': 'సూర్య నమస్కార మంత్రం',
    'makar-sankranti-prayer': 'మకర సంక్రాంతి ప్రార్థన',
  },
  kannada: {
    'hanuman-chalisa': 'ಹನುಮಾನ್ ಚಾಲೀಸಾ',
    'hanuman-aarti': 'ಹನುಮಾನ್ ಆರತಿ',
    'bajrang-baan': 'ಬಜರಂಗ್ ಬಾಣ್',
    'sankat-mochan': 'ಸಂಕಟ ಮೋಚನ ಅಷ್ಟಕ',
    'ganesh-aarti': 'ಗಣೇಶ ಆರತಿ',
    vakratunda: 'ವಕ್ರತುಂಡ ಮಹಾಕಾಯ',
    'ganpati-stavan': 'ಗಣಪತಿ ಸ್ತವನ',
    'shiva-aarti': 'ಶಿವ ಆರತಿ',
    mahamrityunjaya: 'ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ',
    'shiva-tandava': 'ಶಿವ ತಾಂಡವ ಸ್ತೋತ್ರ',
    'hare-krishna': 'ಹರೇ ಕೃಷ್ಣ ಮಹಾಮಂತ್ರ',
    'achyutam-keshavam': 'ಅಚ್ಯುತಂ ಕೇಶವಂ',
    'govinda-aarti': 'ಗೋವಿಂದ ಆರತಿ',
    'lakshmi-aarti': 'ಲಕ್ಷ್ಮೀ ಆರತಿ',
    'mahalakshmi-ashtakam': 'ಮಹಾಲಕ್ಷ್ಮೀ ಅಷ್ಟಕಂ',
    'sri-suktam': 'ಶ್ರೀ ಸೂಕ್ತಂ',
    'durga-aarti': 'ದುರ್ಗಾ ಆರತಿ',
    'durga-chalisa': 'ದುರ್ಗಾ ಚಾಲೀಸಾ',
    'mahishasura-mardini': 'ಮಹಿಷಾಸುರ ಮರ್ಧಿನಿ',
    'ram-aarti': 'ರಾಮ ಆರತಿ',
    'ram-stuti': 'ರಾಮ ಸ್ತುತಿ',
    'ram-chalisa': 'ರಾಮ ಚಾಲೀಸಾ',
    'sai-aarti': 'ಸಾಯಿ ಬಾಬಾ ಆರತಿ',
    'om-sai-ram': 'ಓಂ ಸಾಯಿ ರಾಮ್',
    'sai-stavan': 'ಸಾಯಿ ಸ್ತವನ',
    'diwali-puja': 'ದೀಪಾವಳಿ ಪೂಜಾ ಪಾಠ',
    'kuber-mantra': 'ಕುಬೇರ ಮಂತ್ರ',
    'jai-mata-di': 'ಜೈ ಮಾತಾ ದಿ',
    'navratri-aarti': 'ನವ ದುರ್ಗಾ ಆರತಿ',
    'ganesh-chaturthi-prayer': 'ಗಣೇಶ ಚತುರ್ಥಿ ಪೂಜೆ',
    'krishna-janmashtami-bhajan': 'ನಂದ್ ಕೆ ಆನಂದ್ ಭಯೋ',
    'shivratri-prayer': 'ಶಿವರಾತ್ರಿ ಸ್ತುತಿ',
    'holi-bhajan': 'ಹೋಳಿ ಕೆ ದಿನ್',
    'surya-namaskar-mantra': 'ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಂತ್ರ',
    'makar-sankranti-prayer': 'ಮಕರ ಸಂಕ್ರಾಂತಿ ಪ್ರಾರ್ಥನೆ',
  },
  tamil: {
    'hanuman-chalisa': 'ஹனுமான் சாலிசா',
    'hanuman-aarti': 'ஹனுமான் ஆரத்தி',
    'bajrang-baan': 'பஜரங் பாண்',
    'sankat-mochan': 'சங்கட் மோசன் அஷ்டகம்',
    'ganesh-aarti': 'கணேஷ் ஆரத்தி',
    vakratunda: 'வக்ரதுண்ட மகாகாய',
    'ganpati-stavan': 'கணபதி ஸ்தவனம்',
    'shiva-aarti': 'சிவ ஆரத்தி',
    mahamrityunjaya: 'மகா மிருத்யுஞ்ஜய மந்திரம்',
    'shiva-tandava': 'சிவ தாண்டவ ஸ்தோத்திரம்',
    'hare-krishna': 'ஹரே கிருஷ்ண மகாமந்திரம்',
    'achyutam-keshavam': 'அச்சுதம் கேசவம்',
    'govinda-aarti': 'கோவிந்த ஆரத்தி',
    'lakshmi-aarti': 'லட்சுமி ஆரத்தி',
    'mahalakshmi-ashtakam': 'மகாலட்சுமி அஷ்டகம்',
    'sri-suktam': 'ஸ்ரீ சூக்தம்',
    'durga-aarti': 'துர்கா ஆரத்தி',
    'durga-chalisa': 'துர்கா சாலிசா',
    'mahishasura-mardini': 'மகிஷாசுர மர்த்தினி',
    'ram-aarti': 'ராம ஆரத்தி',
    'ram-stuti': 'ராம ஸ்துதி',
    'ram-chalisa': 'ராம சாலிசா',
    'sai-aarti': 'சாய் பாபா ஆரத்தி',
    'om-sai-ram': 'ஓம் சாய் ராம்',
    'sai-stavan': 'சாய் ஸ்தவனம்',
    'diwali-puja': 'தீபாவளி பூஜா பாடம்',
    'kuber-mantra': 'குபேர மந்திரம்',
    'jai-mata-di': 'ஜய் மாதா தீ',
    'navratri-aarti': 'நவ துர்கா ஆரத்தி',
    'ganesh-chaturthi-prayer': 'விநாயகர் சதுர்த்தி பூஜை',
    'krishna-janmashtami-bhajan': 'நந்த் கே ஆனந்த் பயோ',
    'shivratri-prayer': 'சிவராத்திரி ஸ்துதி',
    'holi-bhajan': 'ஹோலி கே தின்',
    'surya-namaskar-mantra': 'சூர்ய நமஸ்கார மந்திரம்',
    'makar-sankranti-prayer': 'மகர சங்கராந்தி பிரார்த்தனை',
  },
  marathi: {
    'hanuman-chalisa': 'हनुमान चालीसा',
    'hanuman-aarti': 'हनुमान आरती',
    'bajrang-baan': 'बजरंग बाण',
    'sankat-mochan': 'संकट मोचन अष्टक',
    'ganesh-aarti': 'गणेश आरती',
    vakratunda: 'वक्रतुंड महाकाय',
    'ganpati-stavan': 'गणपती स्तवन',
    'shiva-aarti': 'शिव आरती',
    mahamrityunjaya: 'महामृत्युंजय मंत्र',
    'shiva-tandava': 'शिव तांडव स्तोत्र',
    'hare-krishna': 'हरे कृष्ण महामंत्र',
    'achyutam-keshavam': 'अच्युतम केशवम्',
    'govinda-aarti': 'गोविंद आरती',
    'lakshmi-aarti': 'लक्ष्मी आरती',
    'mahalakshmi-ashtakam': 'महालक्ष्मी अष्टक',
    'sri-suktam': 'श्री सूक्त',
    'durga-aarti': 'दुर्गा आरती',
    'durga-chalisa': 'दुर्गा चालीसा',
    'mahishasura-mardini': 'महिषासुर मर्दिनी',
    'ram-aarti': 'राम आरती',
    'ram-stuti': 'राम स्तुती',
    'ram-chalisa': 'राम चालीसा',
    'sai-aarti': 'साई बाबा आरती',
    'om-sai-ram': 'ॐ साई राम',
    'sai-stavan': 'साई स्तवन',
    'diwali-puja': 'दिवाळी पूजा पाठ',
    'kuber-mantra': 'कुबेर मंत्र',
    'jai-mata-di': 'जय माता दी',
    'navratri-aarti': 'नव दुर्गा आरती',
    'ganesh-chaturthi-prayer': 'गणेश चतुर्थी पूजा',
    'krishna-janmashtami-bhajan': 'नंद के आनंद भयो',
    'shivratri-prayer': 'शिवरात्री स्तुती',
    'holi-bhajan': 'होळी के दिन',
    'surya-namaskar-mantra': 'सूर्य नमस्कार मंत्र',
    'makar-sankranti-prayer': 'मकर संक्रांत प्रार्थना',
  },
};

const prayerLanguageLabels: Record<AppLanguage, Record<string, string>> = {
  english: {
    english: 'English',
    hindi: 'Hindi',
    telugu: 'Telugu',
    kannada: 'Kannada',
    tamil: 'Tamil',
    marathi: 'Marathi',
    sanskrit: 'Sanskrit',
  },
  hindi: {
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    telugu: 'तेलुगु',
    kannada: 'कन्नड़',
    tamil: 'तमिल',
    marathi: 'मराठी',
    sanskrit: 'संस्कृत',
  },
  telugu: {
    english: 'ఇంగ్లీష్',
    hindi: 'హిందీ',
    telugu: 'తెలుగు',
    kannada: 'కన్నడ',
    tamil: 'తమిళం',
    marathi: 'మరాఠీ',
    sanskrit: 'సంస్కృతం',
  },
  kannada: {
    english: 'ಇಂಗ್ಲಿಷ್',
    hindi: 'ಹಿಂದಿ',
    telugu: 'ತೆಲುಗು',
    kannada: 'ಕನ್ನಡ',
    tamil: 'ತಮಿಳು',
    marathi: 'ಮರಾಠಿ',
    sanskrit: 'ಸಂಸ್ಕೃತ',
  },
  tamil: {
    english: 'ஆங்கிலம்',
    hindi: 'இந்தி',
    telugu: 'தெலுங்கு',
    kannada: 'கன்னடம்',
    tamil: 'தமிழ்',
    marathi: 'மராத்தி',
    sanskrit: 'சமஸ்கிருதம்',
  },
  marathi: {
    english: 'इंग्रजी',
    hindi: 'हिंदी',
    telugu: 'तेलुगू',
    kannada: 'कन्नड',
    tamil: 'तमिळ',
    marathi: 'मराठी',
    sanskrit: 'संस्कृत',
  },
};

const readDurationSuffix: Record<AppLanguage, string> = {
  english: 'min read',
  hindi: 'मिन पढ़ें',
  telugu: 'నిమి పఠనం',
  kannada: 'ನಿಮಿ ಪಠಣ',
  tamil: 'நிமி வாசிப்பு',
  marathi: 'मि वाचन',
};

export function getLocalizedDeity(deity: Deity, language: AppLanguage): { name: string; tagline: string } {
  if (language === 'english') return { name: deity.name, tagline: deity.tagline };
  return deityNames[language][deity.id] || { name: deity.name, tagline: deity.tagline };
}

export function getLocalizedFestival(
  festival: Festival,
  language: AppLanguage
): { name: string; nativeName: string; description: string } {
  if (language === 'english') {
    return { name: festival.name, nativeName: festival.nameHindi, description: festival.description };
  }
  return festivalNames[language][festival.id] || {
    name: festival.name,
    nativeName: festival.nameHindi,
    description: festival.description,
  };
}

export function getLocalizedSubtitle(subtitle: string, language: AppLanguage): string {
  if (language === 'english') return subtitle;
  return subtitleLabels[language][subtitle] || subtitle;
}

export function getLocalizedPrayerTitle(prayer: Prayer, language: AppLanguage): string {
  if (language === 'english') return prayer.title;
  return prayerTitles[language]?.[prayer.id] || prayer.title;
}

export function getLocalizedPrayerDuration(duration: string, language: AppLanguage): string {
  if (language === 'english') return duration;
  const match = duration.match(/(\d+)\s*min(?:\s*read)?/i);
  if (!match) return duration;
  return `${match[1]} ${readDurationSuffix[language]}`;
}

export function getLocalizedPrayerLanguageLabel(contentLanguage: string, language: AppLanguage): string {
  return prayerLanguageLabels[language][contentLanguage] || contentLanguage;
}

const devanagariMap: Record<string, string> = {
  अ: 'a', आ: 'aa', इ: 'i', ई: 'ee', उ: 'u', ऊ: 'oo', ऋ: 'ri', ए: 'e', ऐ: 'ai', ओ: 'o', औ: 'au',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga', 'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na', 'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma', 'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
  'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'ळ': 'la',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
  'ं': 'm', 'ः': 'h', 'ँ': 'n', '्': '', '।': '.', '॥': '.', ' ': ' ', ',': ',', '-': '-', '\n': '\n',
};

function transliterateDevanagariText(text: string): string {
  return text
    .split('')
    .map((char) => devanagariMap[char] ?? char)
    .join('')
    .replace(/aaa/g, 'aa')
    .replace(/eee/g, 'ee')
    .replace(/ooo/g, 'oo');
}

export function getResolvedPrayerContent(
  prayer: Prayer,
  preferences: AppPreferences,
  selectedLang?: string
): { content: PrayerContent; renderedVerses: PrayerVerse[]; displayLabel: string } {
  const preferredSource: PrayerSourceLanguage =
    preferences.language === 'english' ? preferences.prayerSourceLanguage : preferences.language;

  const preferredOrder = [
    selectedLang,
    preferredSource,
    preferences.language,
    'hindi',
    'sanskrit',
    'english',
  ].filter(Boolean) as string[];

  const sourceContent =
    preferredOrder
      .map((lang) => prayer.content.find((content) => content.lang === lang))
      .find(Boolean) || prayer.content[0];

  const renderedVerses =
    preferences.language === 'english' && sourceContent.lang !== 'english'
      ? sourceContent.verses.map((verse) => ({
          ...verse,
          text: transliterateDevanagariText(verse.text),
        }))
      : sourceContent.verses;

  return {
    content: sourceContent,
    renderedVerses,
    displayLabel:
      preferences.language === 'english' && sourceContent.lang !== 'english'
        ? `${getLocalizedPrayerLanguageLabel(sourceContent.lang, preferences.language)} in English`
        : getLocalizedPrayerLanguageLabel(sourceContent.lang, preferences.language),
  };
}
