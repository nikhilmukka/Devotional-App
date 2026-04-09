insert into public.deities (slug, icon_name, theme_start_color, theme_end_color, sort_order)
values
  ('ganesha', 'elephant', '#FFB347', '#D8A62A', 1),
  ('shiva', 'moon', '#6673D9', '#3947B1', 2),
  ('krishna', 'lotus', '#7C2BB4', '#5B159D', 3),
  ('lakshmi', 'flower', '#C51D6F', '#8B0049', 4),
  ('durga', 'sword', '#E03131', '#B3182E', 5),
  ('hanuman', 'hands', '#F0591C', '#C8440B', 6),
  ('rama', 'bow', '#348C3B', '#1F6C29', 7),
  ('sai-baba', 'star', '#FF8C00', '#F26B00', 8)
on conflict (slug) do nothing;

insert into public.deity_translations (deity_id, language, name, tagline)
select d.id, v.language::public.language_code, v.name, v.tagline
from public.deities d
join (
  values
    ('ganesha', 'english', 'Ganesha', 'Remover of obstacles'),
    ('ganesha', 'hindi', 'गणेश', 'विघ्नहर्ता'),
    ('shiva', 'english', 'Shiva', 'Lord of transformation'),
    ('shiva', 'hindi', 'शिव', 'रूपांतरण के देव'),
    ('krishna', 'english', 'Krishna', 'Divine guide'),
    ('krishna', 'hindi', 'कृष्ण', 'मुरलीधर भगवान'),
    ('lakshmi', 'english', 'Lakshmi', 'Goddess of prosperity'),
    ('lakshmi', 'hindi', 'लक्ष्मी', 'समृद्धि की देवी'),
    ('durga', 'english', 'Durga', 'Divine mother'),
    ('durga', 'hindi', 'दुर्गा', 'दिव्य मातृशक्ति'),
    ('hanuman', 'english', 'Hanuman', 'Devotion and strength'),
    ('hanuman', 'hindi', 'हनुमान', 'रामभक्त वीर'),
    ('rama', 'english', 'Rama', 'Embodiment of dharma'),
    ('rama', 'hindi', 'राम', 'मर्यादा पुरुषोत्तम'),
    ('sai-baba', 'english', 'Sai Baba', 'Saint of compassion'),
    ('sai-baba', 'hindi', 'साईं बाबा', 'श्रद्धा और सबूरी')
) as v(slug, language, name, tagline)
  on d.slug = v.slug
on conflict (deity_id, language) do nothing;

insert into public.festivals (slug, symbol, theme_start_color, theme_end_color, sort_order, is_featured_home)
values
  ('diwali', 'lamp', '#FF9500', '#D4572A', 1, true),
  ('navratri', 'flower', '#C93A3A', '#9729A7', 2, true),
  ('ganesh-chaturthi', 'elephant', '#FF9D4D', '#D9A037', 3, true),
  ('holi', 'color', '#C94565', '#FF8C42', 4, true),
  ('maha-shivaratri', 'moon', '#5B64C5', '#2E398D', 5, false)
on conflict (slug) do nothing;

insert into public.festival_translations (festival_id, language, name, native_name, short_description)
select f.id, v.language::public.language_code, v.name, v.native_name, v.short_description
from public.festivals f
join (
  values
    ('diwali', 'english', 'Diwali', 'Deepavali', 'Festival of lights and prosperity'),
    ('diwali', 'hindi', 'दीवाली', 'दीपावली', 'प्रकाश और समृद्धि का पर्व'),
    ('navratri', 'english', 'Navratri', 'Navratri', 'Nine nights of divine mother worship'),
    ('navratri', 'hindi', 'नवरात्रि', 'नवरात्रि', 'दिव्य शक्ति की नौ रातें'),
    ('ganesh-chaturthi', 'english', 'Ganesh Chaturthi', 'Ganesh Chaturthi', 'Festival for Lord Ganesha'),
    ('ganesh-chaturthi', 'hindi', 'गणेश चतुर्थी', 'गणेश चतुर्थी', 'भगवान गणेश का उत्सव'),
    ('holi', 'english', 'Holi', 'Holi', 'Festival of colors and joy'),
    ('holi', 'hindi', 'होली', 'होली', 'रंगों और आनंद का त्योहार'),
    ('maha-shivaratri', 'english', 'Maha Shivaratri', 'Maha Shivaratri', 'Great night of Lord Shiva'),
    ('maha-shivaratri', 'hindi', 'महाशिवरात्रि', 'महाशिवरात्रि', 'भगवान शिव की महान रात्रि')
) as v(slug, language, name, native_name, short_description)
  on f.slug = v.slug
on conflict (festival_id, language) do nothing;

insert into public.festival_calendar (festival_id, festival_date, region_code, source_name)
select f.id, v.festival_date, 'global', 'mock-seed'
from public.festivals f
join (
  values
    ('holi', date '2026-03-18'),
    ('ganesh-chaturthi', date '2026-08-27'),
    ('navratri', date '2026-10-20'),
    ('diwali', date '2026-11-08'),
    ('maha-shivaratri', date '2026-02-15')
) as v(slug, festival_date)
  on f.slug = v.slug
on conflict (festival_id, festival_date, region_code) do nothing;

insert into public.prayers (
  slug,
  deity_id,
  category,
  estimated_duration_seconds,
  verse_count,
  sort_order,
  is_featured_home,
  is_audio_available
)
select
  v.slug,
  d.id,
  v.category,
  v.estimated_duration_seconds,
  v.verse_count,
  v.sort_order,
  v.is_featured_home,
  v.is_audio_available
from (
  values
    ('hanuman-chalisa', 'hanuman', 'Chalisa', 480, 40, 1, true, true),
    ('ganesh-aarti', 'ganesha', 'Aarti', 180, 10, 2, true, true),
    ('shiva-aarti', 'shiva', 'Aarti', 180, 10, 3, true, false),
    ('hare-krishna-mahamantra', 'krishna', 'Mantra', 540, 2, 4, true, true),
    ('sri-suktam', 'lakshmi', 'Stotram', 420, 15, 5, false, true),
    ('durga-aarti', 'durga', 'Aarti', 300, 12, 6, false, true),
    ('lakshmi-puja-vidhi', 'lakshmi', 'Puja', 600, 20, 7, false, false),
    ('holi-ke-din', 'krishna', 'Bhajan', 300, 8, 8, false, false)
) as v(slug, deity_slug, category, estimated_duration_seconds, verse_count, sort_order, is_featured_home, is_audio_available)
join public.deities d
  on d.slug = v.deity_slug
on conflict (slug) do nothing;

insert into public.prayer_texts (prayer_id, language, script, title, subtitle, body_plain_text, body_json, notes)
select
  p.id,
  v.language::public.language_code,
  v.script::public.script_code,
  v.title,
  v.subtitle,
  v.body_plain_text,
  to_jsonb(v.verses::text[]),
  v.notes
from public.prayers p
join (
  values
    (
      'hanuman-chalisa', 'hindi', 'native', 'हनुमान चालीसा', 'चालीसा',
      'श्री गुरु चरण सरोज रज, निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥',
      array[
        'श्री गुरु चरण सरोज रज, निज मनु मुकुरु सुधारि।',
        'बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥',
        'बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।',
        'बल बुद्धि विद्या देहु मोहि, हरहु कलेस विकार॥'
      ],
      'Tuesday Audio Prayer'
    ),
    (
      'hanuman-chalisa', 'hindi', 'latin', 'Hanuman Chalisa', 'Chalisa',
      'Shri guru charan saroj raj, nij manu mukuru sudhari. Baranau Raghubar bimal jasu, jo dayaku phal chari.',
      array[
        'Shri guru charan saroj raj, nij manu mukuru sudhari.',
        'Baranau Raghubar bimal jasu, jo dayaku phal chari.',
        'Buddhi heen tanu janike, sumirau Pavan Kumar.',
        'Bal buddhi vidya dehu mohi, harahu kalesa vikar.'
      ],
      'English transliteration for English UI mode'
    ),
    (
      'ganesh-aarti', 'hindi', 'native', 'गणेश आरती', 'आरती',
      'जय गणेश जय गणेश जय गणेश देवा। माता जाकी पार्वती, पिता महादेवा॥',
      array[
        'जय गणेश जय गणेश जय गणेश देवा।',
        'माता जाकी पार्वती, पिता महादेवा॥',
        'एक दंत दयावंत, चार भुजा धारी।',
        'माथे सिंदूर सोहे, मूसे की सवारी॥'
      ],
      'Wednesday Audio Prayer'
    ),
    (
      'ganesh-aarti', 'hindi', 'latin', 'Ganesh Aarti', 'Aarti',
      'Jai Ganesh jai Ganesh jai Ganesh deva. Mata jaki Parvati, pita Mahadeva.',
      array[
        'Jai Ganesh jai Ganesh jai Ganesh deva.',
        'Mata jaki Parvati, pita Mahadeva.',
        'Ek dant dayavant, char bhuja dhari.',
        'Mathe sindoor sohe, moose ki sawari.'
      ],
      'English transliteration for English UI mode'
    ),
    (
      'sri-suktam', 'sanskrit', 'native', 'श्री सूक्तम्', 'स्तोत्र',
      'हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्। चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
      array[
        'हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्।',
        'चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
        'तां म आवह जातवेदो लक्ष्मीमनपगामिनीम्।'
      ],
      'Thursday Audio Prayer'
    ),
    (
      'sri-suktam', 'sanskrit', 'latin', 'Sri Suktam', 'Stotram',
      'Hiranyavarnam harinim suvarna rajata srajam. Chandram hiranmayim Lakshmim jatavedo ma avaha.',
      array[
        'Hiranyavarnam harinim suvarna rajata srajam.',
        'Chandram hiranmayim Lakshmim jatavedo ma avaha.',
        'Tam ma avaha jatavedo Lakshmimanapagaminim.'
      ],
      'English transliteration for English UI mode'
    ),
    (
      'hare-krishna-mahamantra', 'sanskrit', 'native', 'हरे कृष्ण महामंत्र', 'मंत्र',
      'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे। हरे राम हरे राम, राम राम हरे हरे॥',
      array[
        'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।',
        'हरे राम हरे राम, राम राम हरे हरे॥'
      ],
      'Saturday Audio Prayer'
    ),
    (
      'hare-krishna-mahamantra', 'sanskrit', 'latin', 'Hare Krishna Mahamantra', 'Mantra',
      'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare. Hare Rama Hare Rama, Rama Rama Hare Hare.',
      array[
        'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare.',
        'Hare Rama Hare Rama, Rama Rama Hare Hare.'
      ],
      'English transliteration for English UI mode'
    ),
    (
      'holi-ke-din', 'hindi', 'native', 'होली के दिन', 'भजन',
      'होली के दिन दिल खिल जाते हैं, रंगों में रंग मिल जाते हैं।',
      array[
        'होली के दिन दिल खिल जाते हैं, रंगों में रंग मिल जाते हैं।',
        'भक्ति के रंग में सब सजते, प्रेम के गीत निकल जाते हैं॥'
      ],
      'Festival Prayer'
    ),
    (
      'holi-ke-din', 'hindi', 'latin', 'Holi Ke Din', 'Bhajan',
      'Holi ke din dil khil jaate hain, rango mein rang mil jaate hain.',
      array[
        'Holi ke din dil khil jaate hain, rango mein rang mil jaate hain.',
        'Bhakti ke rang mein sab sajte, prem ke geet nikal jaate hain.'
      ],
      'English transliteration for English UI mode'
    )
) as v(slug, language, script, title, subtitle, body_plain_text, verses, notes)
  on p.slug = v.slug
on conflict (prayer_id, language, script) do nothing;

insert into public.prayer_audio_tracks (
  prayer_id,
  language,
  storage_path,
  public_url,
  duration_seconds,
  narrator_name,
  artist_name
)
select
  p.id,
  v.language::public.language_code,
  v.storage_path,
  v.public_url,
  v.duration_seconds,
  v.narrator_name,
  v.artist_name
from public.prayers p
join (
  values
    (
      'hanuman-chalisa',
      'hindi',
      'audio/hanuman-chalisa/hindi-morning.mp3',
      null,
      480,
      'Temple Morning Voice',
      'BhaktiVerse Seed Audio'
    ),
    (
      'ganesh-aarti',
      'hindi',
      'audio/ganesh-aarti/hindi-morning.mp3',
      null,
      300,
      'Aarti Narration',
      'BhaktiVerse Seed Audio'
    ),
    (
      'sri-suktam',
      'sanskrit',
      'audio/sri-suktam/sanskrit-chant.mp3',
      null,
      420,
      'Lakshmi Chant Voice',
      'BhaktiVerse Seed Audio'
    ),
    (
      'durga-aarti',
      'hindi',
      'audio/durga-aarti/hindi-evening.mp3',
      null,
      300,
      'Evening Aarti Voice',
      'BhaktiVerse Seed Audio'
    ),
    (
      'hare-krishna-mahamantra',
      'sanskrit',
      'audio/hare-krishna-mahamantra/sanskrit-chant.mp3',
      null,
      540,
      'Kirtan Chant Voice',
      'BhaktiVerse Seed Audio'
    )
) as v(prayer_slug, language, storage_path, public_url, duration_seconds, narrator_name, artist_name)
  on p.slug = v.prayer_slug
where not exists (
  select 1
  from public.prayer_audio_tracks pat
  where pat.prayer_id = p.id
    and pat.language = v.language::public.language_code
);

insert into public.prayer_festivals (prayer_id, festival_id, is_primary)
select p.id, f.id, v.is_primary
from (
  values
    ('hanuman-chalisa', 'diwali', false),
    ('ganesh-aarti', 'ganesh-chaturthi', true),
    ('lakshmi-puja-vidhi', 'diwali', true),
    ('holi-ke-din', 'holi', true),
    ('durga-aarti', 'navratri', true),
    ('shiva-aarti', 'maha-shivaratri', true)
) as v(prayer_slug, festival_slug, is_primary)
join public.prayers p on p.slug = v.prayer_slug
join public.festivals f on f.slug = v.festival_slug
on conflict (prayer_id, festival_id) do nothing;

insert into public.reminder_rules (rule_type, prayer_id, day_of_week, send_time_local, priority, region_code)
select 'daily', p.id, v.day_of_week, '06:30', 100, 'global'
from (
  values
    ('sri-suktam', 4),
    ('hanuman-chalisa', 2),
    ('ganesh-aarti', 3),
    ('hare-krishna-mahamantra', 6)
) as v(prayer_slug, day_of_week)
join public.prayers p on p.slug = v.prayer_slug
where not exists (
  select 1
  from public.reminder_rules rr
  where rr.rule_type = 'daily'
    and rr.region_code = 'global'
    and rr.day_of_week = v.day_of_week
    and rr.festival_id is null
);

insert into public.reminder_rules (rule_type, prayer_id, festival_id, send_time_local, priority, region_code)
select 'festival', p.id, f.id, '06:30', 10, 'global'
from (
  values
    ('holi-ke-din', 'holi'),
    ('ganesh-aarti', 'ganesh-chaturthi'),
    ('lakshmi-puja-vidhi', 'diwali'),
    ('durga-aarti', 'navratri')
) as v(prayer_slug, festival_slug)
join public.prayers p on p.slug = v.prayer_slug
join public.festivals f on f.slug = v.festival_slug
where not exists (
  select 1
  from public.reminder_rules rr
  where rr.rule_type = 'festival'
    and rr.region_code = 'global'
    and rr.festival_id = f.id
);
