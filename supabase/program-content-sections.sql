-- Jalankan setelah schema.sql di SQL Editor proyek Supabase.
alter table public.site_sections drop constraint if exists site_sections_key_check;
alter table public.site_sections add constraint site_sections_key_check
  check (key in ('profile','accommodation','team','contact','program-suara-anak-pulau','program-urx1'));

insert into public.site_sections(key, content) values
('program-suara-anak-pulau', jsonb_build_object(
  'eyebrow', 'Program / Pendidikan', 'kicker', 'Cahaya Haluan Pulau', 'title', 'Suara Anak Pulau',
  'subtitle', 'Membuka rumah bagi putra-putri daerah.',
  'description', 'Membuka rumah bagi putra-putri daerah untuk mendapatkan pendidikan, pelatihan, dan pengalaman hidup yang lebih luas di luar pulau mereka.',
  'heroButton', 'Hubungi kami', 'focusEyebrow', 'FOKUS KAMI',
  'focusTitle', 'Ruang untuk belajar dan bertumbuh',
  'focusDescription', 'Rumah yang mendukung anak muda untuk belajar, berlatih, dan menemukan berbagai kemungkinan baru.',
  'focus1', 'Pendidikan', 'focus2', 'Pelatihan', 'focus3', 'Pengalaman hidup yang lebih luas',
  'ctaEyebrow', 'JADI BAGIAN DARI PERJALANAN',
  'ctaTitle', 'Mari wujudkan masa depan yang lebih baik bersama.', 'ctaButton', 'Hubungi pengurus',
  'eyebrowEn', 'PROGRAM / EDUCATION', 'kickerEn', 'Cahaya Haluan Pulau', 'titleEn', 'Suara Anak Pulau',
  'subtitleEn', 'Opening our home to young people from the islands.',
  'descriptionEn', 'Opening our home to young people from their local communities, giving them access to education, training, and broader life experiences beyond their islands.',
  'heroButtonEn', 'Get in touch', 'focusEyebrowEn', 'OUR FOCUS',
  'focusTitleEn', 'Room to learn and grow',
  'focusDescriptionEn', 'A welcoming home where young people can learn, train, and discover new possibilities.',
  'focus1En', 'Education', 'focus2En', 'Training', 'focus3En', 'Broader life experiences',
  'ctaEyebrowEn', 'BE PART OF THE JOURNEY',
  'ctaTitleEn', 'Let us create a brighter future together.', 'ctaButtonEn', 'Contact our team'
)),
('program-urx1', jsonb_build_object(
  'eyebrow', 'Inisiatif / Kemanusiaan', 'kicker', 'Cahaya Haluan Pulau', 'title', 'URX1',
  'subtitle', 'Menjangkau pulau dan komunitas di seluruh Indonesia.',
  'description', 'Kunjungan rutin ke berbagai daerah dan pedalaman ke pulau-pulau di Indonesia dengan program kemanusiaan dan literasi, serta berbagai program kunjungan, pelatihan, dan kemanusiaan bagi kaum marginal.',
  'heroButton', 'Hubungi kami', 'focusEyebrow', 'FOKUS KAMI',
  'focusTitle', 'Hadir bersama komunitas',
  'focusDescription', 'Kami membangun hubungan bermakna melalui kunjungan, pembelajaran, dan aksi kemanusiaan.',
  'focus1', 'Kunjungan rutin ke daerah dan pedalaman',
  'focus2', 'Program kemanusiaan dan literasi',
  'focus3', 'Kunjungan, pelatihan, dan dukungan bagi kaum marginal',
  'ctaEyebrow', 'JADI BAGIAN DARI PERJALANAN',
  'ctaTitle', 'Mari wujudkan masa depan yang lebih baik bersama.', 'ctaButton', 'Hubungi pengurus',
  'eyebrowEn', 'INITIATIVE / HUMANITARIAN', 'kickerEn', 'Cahaya Haluan Pulau', 'titleEn', 'URX1',
  'subtitleEn', 'Reaching islands and communities across Indonesia.',
  'descriptionEn', 'Regular visits to regions and remote island communities across Indonesia through humanitarian and literacy programs, alongside visits, training, and humanitarian support for marginalized communities.',
  'heroButtonEn', 'Get in touch', 'focusEyebrowEn', 'OUR FOCUS',
  'focusTitleEn', 'Connecting with communities',
  'focusDescriptionEn', 'We build lasting connections through visits, learning, and humanitarian action.',
  'focus1En', 'Regular regional and remote island visits',
  'focus2En', 'Humanitarian and literacy programs',
  'focus3En', 'Training and support for marginalized communities',
  'ctaEyebrowEn', 'BE PART OF THE JOURNEY',
  'ctaTitleEn', 'Let us create a brighter future together.', 'ctaButtonEn', 'Contact our team'
))
on conflict (key) do nothing;
