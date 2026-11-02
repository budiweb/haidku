-- Demo & Educational Content Seeder for HaidKu
-- Educational articles reviewed for clinical accuracy (CDC / WHO / ACOG guidelines)

INSERT INTO educational_articles (id, slug, title, category, excerpt, body, reference_urls_json, version, status)
VALUES
(
    'art-01',
    'apa-itu-standard-days-method',
    'Mengenal Standard Days Method (SDM): Syarat & Batasannya',
    'metode_alami',
    'Standard Days Method adalah metode kesadaran kesuburan berbasis kalender dengan aturan baku untuk siklus 26-32 hari.',
    'Standard Days Method (SDM) dikembangkan oleh Institute for Reproductive Health, Georgetown University. Metode ini mengidentifikasi hari ke-8 sampai ke-19 dari siklus menstruasi sebagai periode dengan kemungkinan kehamilan paling tinggi.\n\nSyarat penting SDM:\n1. Hanya cocok untuk wanita yang panjang siklusnya konsisten antara 26 sampai 32 hari.\n2. Jika dalam setahun terdapat 2 siklus atau lebih yang kurang dari 26 hari atau lebih dari 32 hari, metode ini TIDAK lagi sesuai.\n3. Efektivitas penggunaan biasa (typical use) memiliki angka kegagalan sekitar 13 kehamilan per 100 wanita dalam setahun (CDC 2024).\n4. Tidak ada hari yang dijamin 100% bebas risiko untuk berhubungan seksual tanpa kontrasepsi.',
    '["https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html", "https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception"]',
    '1.0',
    'published'
),
(
    'art-02',
    'mitos-flek-dan-hari-pertama-haid',
    'Flek/Spotting vs Darah Menstruasi: Mana Hari Pertama Siklus?',
    'fisiologi_siklus',
    'Banyak yang mengira flek sebelum haid adalah hari ke-1 siklus. Faktanya, hari ke-1 dihitung sejak darah merah mengalir nyata.',
    'Hari ke-1 siklus menstruasi (Day 1) didefinisikan secara klinis sebagai hari pertama keluarnya darah menstruasi yang mengalir nyata (bukan sekadar bercak kecokelatan atau flek ringan).\n\nSpotting/flek di tengah siklus juga umum terjadi karena fluktuasi hormon estrogen saat ovulasi dan tidak boleh dianggap sebagai awal siklus baru. Mencatat flek sebagai haid baru dapat mengacaukan perhitungan panjang siklus dan estimasi kesuburan Anda.',
    '["https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding"]',
    '1.0',
    'published'
),
(
    'art-03',
    'mengapa-tidak-ada-hari-aman-mutlak',
    'Mengapa Tidak Ada Istilah "Hari Aman Mutlak" dalam Medis?',
    'edukasi_risiko',
    'Sperma dapat bertahan hidup hingga 5 hari dalam saluran reproduksi wanita, dan ovulasi dapat bergeser sewaktu-waktu.',
    'Tubuh manusia bukanlah jam digital. Waktu ovulasi dapat maju atau mundur karena stres, sakit, perjalanan, atau perubahan hormon.\n\nDitambah kemampuan bertahan hidup sel sperma yang mencapai 3-5 hari di lingkungan lendir serviks yang subur, hubungan seksual yang terjadi sebelum perkiraan masa subur masih berpotensi menyebabkan kehamilan jika ovulasi terjadi lebih awal.\n\nOleh karena itu, istilah "hari aman" tidak digunakan dalam standar klinis modern. HaidKu menggunakan istilah "peluang relatif lebih rendah namun tidak nol" untuk memberikan pemahaman yang jujur dan melindungi keselamatan pengguna.',
    '["https://www.cdc.gov/contraception/hcp/usmec/fertility-awareness-based-methods.html"]',
    '1.0',
    'published'
)
ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body);

