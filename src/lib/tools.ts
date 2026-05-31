export type ToolCategory = "Developer" | "Image" | "Calculators" | "Generators" | "Converters" | "Utilities" | "WhatsApp" | "PDF";

export interface Tool {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  subcategory: string;
  icon: string;
  featured?: boolean;
  faqs: { q: string; a: string }[];
}

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Rapikan kode JSON yang berantakan dalam satu klik. Support minification.",
    longDescription:
      "JSON Formatter membantu kamu memformat, memvalidasi, dan meminimalkan kode JSON dengan cepat. Cocok untuk debugging API response atau merapikan konfigurasi.",
    category: "Developer",
    subcategory: "Formatting",
    icon: "{}",
    featured: true,
    faqs: [
      { q: "Apakah data JSON saya aman?", a: "100% aman. Semua proses berjalan di browser kamu, tidak dikirim ke server." },
      { q: "Bisa minify JSON juga?", a: "Bisa. Klik tombol Minify untuk menghapus whitespace." },
    ],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUID secara massal untuk keperluan database dan testing.",
    longDescription: "Buat satu atau banyak UUID v4 sekaligus. Cocok untuk seed data, primary key, atau testing.",
    category: "Generators",
    subcategory: "Content",
    icon: "ID",
    featured: true,
    faqs: [
      { q: "UUID versi berapa yang dipakai?", a: "Versi 4 (random) sesuai RFC 4122." },
      { q: "Berapa maksimum yang bisa di-generate?", a: "Sampai 1000 UUID sekaligus." },
    ],
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64 Codec",
    description: "Encoder dan Decoder Base64 yang cepat dan ringan untuk teks.",
    longDescription: "Konversi teks ke Base64 atau sebaliknya. Support UTF-8.",
    category: "Converters",
    subcategory: "Data",
    icon: "64",
    faqs: [
      { q: "Support karakter non-ASCII?", a: "Ya, semua karakter UTF-8 didukung." },
      { q: "Apa itu Base64?", a: "Skema encoding biner-ke-teks yang mengubah data jadi string ASCII." },
    ],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Hitung kata, karakter, dan estimasi waktu baca untuk konten artikelmu.",
    longDescription: "Hitung kata, karakter (dengan/tanpa spasi), kalimat, paragraf, dan estimasi waktu baca secara real-time.",
    category: "Converters",
    subcategory: "Text",
    icon: "AZ",
    featured: true,
    faqs: [
      { q: "Bagaimana waktu baca dihitung?", a: "Berdasarkan rata-rata 200 kata per menit." },
    ],
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    shortName: "Char Counter",
    description: "Hitung jumlah karakter spesifik termasuk spasi untuk batas tweet/meta.",
    longDescription: "Hitung karakter dengan dan tanpa spasi. Ada indikator batas Twitter, meta description, dan title tag.",
    category: "Converters",
    subcategory: "Text",
    icon: "#1",
    faqs: [
      { q: "Berapa batas karakter Twitter?", a: "280 karakter untuk akun standar." },
    ],
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    description: "Convert judul artikel jadi URL slug yang SEO friendly secara otomatis.",
    longDescription: "Ubah judul jadi slug URL yang bersih: lowercase, dash, tanpa karakter spesial.",
    category: "Converters",
    subcategory: "Text",
    icon: "/s",
    faqs: [
      { q: "Apa itu slug?", a: "Bagian URL yang mengidentifikasi halaman, biasanya pakai huruf kecil dan dash." },
    ],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    shortName: "Password Gen",
    description: "Buat password super kuat dan random. 100% aman, diproses di browser kamu.",
    longDescription: "Generator password yang aman dengan opsi panjang, simbol, angka, huruf besar/kecil.",
    category: "Generators",
    subcategory: "Content",
    icon: "**",
    featured: true,
    faqs: [
      { q: "Apakah password disimpan?", a: "Tidak. Semuanya di-generate di browser kamu, tidak dikirim ke server." },
      { q: "Berapa panjang yang direkomendasikan?", a: "Minimal 16 karakter untuk keamanan optimal." },
    ],
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    shortName: "QR Generator",
    description: "Bikin QR Code untuk link, WiFi, atau teks dengan kustomisasi simpel.",
    longDescription: "Generator QR Code cepat untuk URL, teks, atau data lainnya. Download sebagai PNG.",
    category: "Generators",
    subcategory: "QR & Links",
    icon: "QR",
    featured: true,
    faqs: [
      { q: "Format download?", a: "PNG dengan resolusi tinggi." },
      { q: "Ada batas panjang teks?", a: "QR Code mendukung sampai sekitar 2900 karakter alfanumerik." },
    ],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Hitung umur detail sampai ke detik. Pas buat verifikasi data atau iseng.",
    longDescription: "Hitung umur dalam tahun, bulan, hari, jam, menit, dan detik berdasarkan tanggal lahir.",
    category: "Calculators",
    subcategory: "Health",
    icon: "19",
    faqs: [
      { q: "Akurat sampai mana?", a: "Sampai ke detik berdasarkan waktu saat ini." },
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode token JSON Web Token (JWT) secara instan untuk melihat header, payload, dan signature.",
    longDescription: "Bongkar token JWT kamu secara aman untuk melihat detail algoritmanya, isi payload claims, serta info kedaluwarsa token.",
    category: "Developer",
    subcategory: "Encoding",
    icon: "JWT",
    featured: true,
    faqs: [
      { q: "Apakah token JWT saya dikirim ke server?", a: "Tidak. Decoder berjalan sepenuhnya secara lokal di browser kamu." },
      { q: "Bisa memverifikasi signature?", a: "Saat ini tool ini hanya melakukan decoding payload dan header, tidak memverifikasi signature dengan secret key." }
    ]
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, dan SHA-256 hash dari string teks apa saja.",
    longDescription: "Buat hash satu arah dengan cepat menggunakan algoritma standar industri seperti MD5, SHA-1, dan SHA-256 langsung di browser.",
    category: "Developer",
    subcategory: "Encoding",
    icon: "HS",
    featured: true,
    faqs: [
      { q: "Apa itu hash?", a: "Hash adalah fungsi satu arah yang mengubah string input menjadi representasi biner berukuran tetap (hex)." },
      { q: "Apakah aman digunakan untuk password?", a: "MD5 dan SHA-1 sudah tidak aman untuk password. Gunakan SHA-256 atau algoritma KDF seperti bcrypt/argon2 untuk keamanan optimal." }
    ]
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description: "Ubah Unix Epoch timestamp ke tanggal manusia dan sebaliknya secara real-time.",
    longDescription: "Konversi angka Unix epoch timestamp (dalam detik or milidetik) ke format tanggal lokal, UTC, dan ISO 8601, atau buat timestamp baru dari tanggal pilihan.",
    category: "Utilities",
    subcategory: "Time",
    icon: "TS",
    featured: true,
    faqs: [
      { q: "Apa itu Unix Timestamp?", a: "Jumlah detik yang telah berlalu sejak Unix Epoch pada 1 Januari 1970 00:00:00 UTC." },
      { q: "Apakah milidetik didukung?", a: "Ya. Tool ini secara otomatis mendeteksi timestamp 10 digit (detik) dan 13 digit (milidetik)." }
    ]
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV Converter",
    description: "Konversi data JSON array menjadi file tabel CSV dengan kustomisasi delimiter.",
    longDescription: "Ubah data terstruktur JSON (termasuk bersarang/nested) menjadi format baris kolom CSV secara praktis. Bisa didownload langsung.",
    category: "Converters",
    subcategory: "Data",
    icon: "J2C",
    faqs: [
      { q: "Bagaimana cara menangani nested object?", a: "Opsi 'Flatten' akan meratakan object bersarang menjadi kolom bertitik, misalnya 'address.city'." }
    ]
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON Converter",
    description: "Ubah teks tabel CSV menjadi data array JSON terstruktur secara instan.",
    longDescription: "Parsing data CSV kamu dan konversi ke bentuk JSON array. Dilengkapi deteksi otomatis tipe data angka dan boolean.",
    category: "Converters",
    subcategory: "Data",
    icon: "C2J",
    faqs: [
      { q: "Format pembatas (delimiter) apa saja yang didukung?", a: "Mendukung koma (,), titik koma (;), dan tab." }
    ]
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test dan uji regular expression kamu dengan highlight kecocokan dan detail grup tangkapan.",
    longDescription: "Uji ekspresi reguler (regex) kamu secara interaktif. Dilengkapi highlight kecocokan visual, support regex flags (g, i, m, s, u), serta list group capture.",
    category: "Developer",
    subcategory: "Testing",
    icon: "RX",
    featured: true,
    faqs: [
      { q: "Flags apa saja yang tersedia?", a: "g (global), i (insensitive), m (multiline), s (dotAll), dan u (unicode)." }
    ]
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    description: "Generate angka acak tunggal atau massal dengan rentang kustom.",
    longDescription: "Hasilkan deretan angka acak dalam rentang minimum dan maksimum tertentu. Mendukung bilangan bulat, bilangan desimal, serta opsi pencegahan nilai duplikat.",
    category: "Utilities",
    subcategory: "Random",
    icon: "#?",
    featured: true,
    faqs: [
      { q: "Bagaimana cara menghasilkan bilangan desimal?", a: "Aktifkan centang opsi desimal pada konfigurasi di bawah batas rentang." }
    ]
  },
  {
    slug: "random-string-generator",
    name: "Random String Generator",
    description: "Buat teks acak/password acak dengan pilihan panjang dan karakter kustom.",
    longDescription: "Hasilkan string acak secara massal. Cocok untuk token sementara, kode kupon acak, nama file acak, atau password sekali pakai.",
    category: "Utilities",
    subcategory: "Random",
    icon: "S?",
    featured: true,
    faqs: [
      { q: "Bisakah menggunakan kumpulan karakter kustom?", a: "Bisa, cukup masukkan karakter kustom pada input kolom opsional." }
    ]
  },
  {
    slug: "dice-roller",
    name: "Dice Roller",
    description: "Kocok dadu virtual dengan berbagai jumlah sisi (D4 sampai D100).",
    longDescription: "Simulasi pelemparan dadu secara virtual. Cocok untuk permainan papan, RPG Dungeons & Dragons (Dnd), atau pengambilan keputusan cepat.",
    category: "Utilities",
    subcategory: "Random",
    icon: "🎲",
    featured: true,
    faqs: [
      { q: "Tipe dadu apa saja yang didukung?", a: "Mendukung D4, D6, D8, D10, D12, D20, dan D100." }
    ]
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    description: "Lempar koin virtual untuk menentukan keputusan cepat (Angka vs Gambar).",
    longDescription: "Simulasikan lemparan koin 50:50 dengan statistik kumulatif lemparan angka dan gambar.",
    category: "Utilities",
    subcategory: "Random",
    icon: "🪙",
    faqs: [
      { q: "Berapa persen probabilitas koin?", a: "Menggunakan probabilitas murni 50:50 dari JavaScript Math.random()." }
    ]
  },
  {
    slug: "countdown-timer",
    name: "Countdown Timer",
    description: "Pasang hitung mundur dengan alarm suara saat waktu habis.",
    longDescription: "Atur jam, menit, dan detik untuk memulai timer hitung mundur. Dilengkapi bunyi sinyal notifikasi ketika selesai.",
    category: "Utilities",
    subcategory: "Time",
    icon: "⏱️",
    faqs: [
      { q: "Apakah browser harus tetap terbuka?", a: "Ya, karena timer berjalan secara lokal di client-side." }
    ]
  },
  {
    slug: "stopwatch",
    name: "Stopwatch",
    description: "Stopwatch digital dengan pencatatan waktu lap presisi.",
    longDescription: "Catat interval waktu secara akurat menggunakan stopwatch digital terintegrasi dengan milidetik dan fitur pencatatan lap.",
    category: "Utilities",
    subcategory: "Time",
    icon: "⏱️",
    faqs: [
      { q: "Apakah pencatatan lap terbatas?", a: "Tidak ada batasan jumlah lap yang direkam selama sesi aktif." }
    ]
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Konversi satuan panjang, berat, suhu, luas, dan volume.",
    longDescription: "Alat konversi satuan multifungsi untuk mempermudah perhitungan antar satuan metrik dan imperial secara instan.",
    category: "Converters",
    subcategory: "Units",
    icon: "⇄",
    featured: true,
    faqs: [
      { q: "Satuan apa saja yang tersedia?", a: "Mendukung panjang (m, km, ft, inch, dll), berat (kg, g, pound, dll), suhu (C, F, K, R), area, dan volume." }
    ]
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Hitung nilai persentase, persentase dari nilai, dan kenaikan/penurunan.",
    longDescription: "Selesaikan berbagai rumus matematika persentase dengan cepat dan mudah tanpa kalkulator manual.",
    category: "Calculators",
    subcategory: "Business",
    icon: "%",
    faqs: [
      { q: "Apakah support kenaikan negatif?", a: "Ya, hasil akan menampilkan persentase minus disertai label 'Penurunan'." }
    ]
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Kompres ukuran file gambar secara optimal tanpa mengurangi kualitas visual secara signifikan.",
    longDescription: "Kurangi ukuran file gambar JPG, PNG, atau WebP secara instan di browser. Sempurna untuk mempercepat loading website.",
    category: "Image",
    subcategory: "Compression",
    icon: "📸",
    featured: true,
    faqs: [
      { q: "Format gambar apa saja yang didukung?", a: "Mendukung JPG, JPEG, PNG, dan WebP." }
    ]
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Ubah dimensi lebar dan tinggi gambar dalam satuan piksel atau persentase.",
    longDescription: "Sesuaikan ukuran piksel gambar kamu secara cepat. Bisa mengunci aspect ratio agar tidak mendistorsi gambar asli.",
    category: "Image",
    subcategory: "Editing",
    icon: "📐",
    featured: true,
    faqs: [
      { q: "Bagaimana cara mempertahankan proporsi gambar?", a: "Aktifkan opsi 'Kunci Rasio Aspek' agar perubahan lebar menyesuaikan tinggi secara otomatis." }
    ]
  },
  {
    slug: "indonesian-meme-generator",
    name: "Meme Generator Netizen",
    description: "Buat meme ala netizen Indonesia dengan template viral terpopuler.",
    longDescription: "Hasilkan meme kocak lokal favorit warganet seperti template 'Nggak Bisa Yura', 'KTP Plesetan', 'Akreditasi BAN-PT', hingga classic meme dengan cepat.",
    category: "Image",
    subcategory: "Editing",
    icon: "🔥",
    featured: true,
    faqs: [
      { q: "Apakah gambar meme buatan saya aman?", a: "Sangat aman. Seluruh proses pembuatan meme, upload foto, dan download dilakukan secara lokal di browser Anda." }
    ]
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    description: "Konversi file gambar dari format JPG ke format PNG secara instan.",
    longDescription: "Ubah format file gambar JPG menjadi PNG dengan transparansi lossless tanpa perlu mengirim data ke server.",
    category: "Image",
    subcategory: "Conversion",
    icon: "J2P",
    faqs: [
      { q: "Apakah kualitas gambar akan berkurang?", a: "Tidak. Format PNG menggunakan kompresi lossless, menjaga kualitas gambar asli secara utuh." }
    ]
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    description: "Ubah format file gambar dari PNG ke JPG dengan pilihan warna latar belakang.",
    longDescription: "Ubah file gambar PNG menjadi JPG. Karena JPG tidak mendukung transparansi, kamu bisa memilih warna latar kustom (default: putih).",
    category: "Image",
    subcategory: "Conversion",
    icon: "P2J",
    faqs: [
      { q: "Apa yang terjadi pada bagian transparan di PNG?", a: "Bagian transparan akan otomatis diisi dengan warna latar belakang yang kamu pilih (default putih)." }
    ]
  },
  {
    slug: "jpg-to-webp",
    name: "JPG to WebP Converter",
    description: "Konversi format JPG ke WebP untuk ukuran file yang jauh lebih hemat di web.",
    longDescription: "Konversi gambar JPG ke format modern WebP dengan tingkat kompresi tinggi guna mengoptimalkan kinerja web.",
    category: "Image",
    subcategory: "Conversion",
    icon: "J2W",
    faqs: [
      { q: "Mengapa menggunakan format WebP?", a: "WebP memberikan ukuran file yang jauh lebih kecil dibandingkan JPG untuk kualitas visual yang setara." }
    ]
  },
  {
    slug: "webp-to-jpg",
    name: "WebP to JPG Converter",
    description: "Ubah format gambar WebP yang modern menjadi format universal JPG.",
    longDescription: "Konversi file gambar WebP kembali menjadi format standard JPG agar bisa dibuka di aplikasi yang belum support WebP.",
    category: "Image",
    subcategory: "Conversion",
    icon: "W2J",
    faqs: [
      { q: "Apakah tool ini bisa dijalankan offline?", a: "Ya. Konversi diproses 100% secara lokal di browser kamu." }
    ]
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    description: "Potong area gambar dengan bebas atau gunakan aspek rasio standar (seperti Pas Foto).",
    longDescription: "Pilih dan potong bagian terbaik gambar kamu. Menyediakan preset populer seperti 1:1, 3:4 (Pas Foto), dan 16:9.",
    category: "Image",
    subcategory: "Editing",
    icon: "✂️",
    featured: true,
    faqs: [
      { q: "Berapa ukuran rasio untuk pas foto?", a: "Gunakan preset rasio 3:4 yang umum digunakan untuk cetak pas foto." }
    ]
  },
  {
    slug: "image-rotator",
    name: "Image Rotator",
    description: "Putar arah gambar 90 derajat atau balikkan gambar secara horizontal dan vertikal.",
    longDescription: "Putar arah gambar searah jarum jam atau sebaliknya, serta simulasikan pencerminan gambar dengan flip horizontal/vertikal.",
    category: "Image",
    subcategory: "Editing",
    icon: "🔄",
    faqs: [
      { q: "Apakah rotasi mempengaruhi resolusi gambar?", a: "Tidak. Gambar diputar secara penuh sesuai ukuran dimensi aslinya." }
    ]
  },
  {
    slug: "image-watermark",
    name: "Image Watermark",
    description: "Tambahkan watermark teks atau logo kustom ke gambar Anda dengan mudah.",
    longDescription: "Lindungi hak cipta karya visual Anda dengan menambahkan cap watermark teks atau logo transparan pada posisi dan rotasi yang dapat diatur.",
    category: "Image",
    subcategory: "Editing",
    icon: "🛡️",
    faqs: [
      { q: "Apakah logo watermark bisa diatur tingkat transparansinya?", a: "Ya. Tersedia slider opacity untuk mengatur tingkat transparansi logo/teks watermark dengan presisi." }
    ]
  },
  {
    slug: "image-flip",
    name: "Image Flip",
    description: "Cerminkan gambar secara horizontal atau vertikal secara instan.",
    longDescription: "Balikkan orientasi gambar Anda dari kiri ke kanan (horizontal) atau dari atas ke bawah (vertikal) dengan pemrosesan lokal yang cepat.",
    category: "Image",
    subcategory: "Editing",
    icon: "↕️",
    faqs: [
      { q: "Apakah ada batas ukuran file?", a: "Tidak ada batasan ketat dari server, karena seluruh proses manipulasi gambar berjalan langsung di memori browser Anda." }
    ]
  },
  {
    slug: "image-blur",
    name: "Image Blur",
    description: "Berikan efek blur pada gambar Anda secara merata dengan slider radius.",
    longDescription: "Buat latar belakang gambar blur atau berikan efek kedalaman visual dengan mengatur radius blur menggunakan teknologi canvas modern.",
    category: "Image",
    subcategory: "Editing",
    icon: "💧",
    faqs: [
      { q: "Apakah file gambar saya diupload ke server?", a: "Tidak. Keamanan data Anda terjamin sepenuhnya karena kompresi dan efek blur diproses lokal." }
    ]
  },
  {
    slug: "image-grayscale",
    name: "Image Grayscale",
    description: "Ubah foto berwarna menjadi hitam-putih (grayscale) klasik.",
    longDescription: "Hilangkan saturasi warna dari gambar Anda untuk menghasilkan efek monokrom atau hitam-putih estetis secara instan.",
    category: "Image",
    subcategory: "Editing",
    icon: "⚫",
    faqs: [
      { q: "Apakah saya bisa mengatur tingkat keabu-abuan?", a: "Ya. Tersedia slider intensitas dari 0% (warna asli) hingga 100% (grayscale penuh)." }
    ]
  },
  {
    slug: "image-metadata-viewer",
    name: "Image Metadata Viewer",
    description: "Periksa metadata teknis detail, rasio, dan dimensi dari file gambar Anda.",
    longDescription: "Buka data teknis tersembunyi dari file gambar seperti nama file asli, ukuran penyimpanan, MIME type, resolusi piksel, dan aspect ratio.",
    category: "Image",
    subcategory: "Optimization",
    icon: "🔎",
    faqs: [
      { q: "Bagaimana aspect ratio dihitung?", a: "Diperoleh dengan membagi lebar dan tinggi gambar ke pembagi terbesar yang sama (FPB / GCD)." }
    ]
  },
  {
    slug: "image-color-picker",
    name: "Image Color Picker",
    description: "Ambil kode warna dari bagian manapun di gambar Anda secara presisi.",
    longDescription: "Ekstrak kode warna HEX, RGB, dan HSL dari gambar yang Anda upload dengan mengarahkan kursor dan mengklik area gambar secara interaktif.",
    category: "Image",
    subcategory: "Editing",
    icon: "🎨",
    featured: true,
    faqs: [
      { q: "Seberapa akurat penentuan kursornya?", a: "Sangat akurat. Gambar dirender di canvas piksel demi piksel, sehingga warna yang terdeteksi adalah warna nyata dari koordinat piksel tersebut." }
    ]
  },
  {
    slug: "svg-optimizer",
    name: "SVG Optimizer",
    description: "Optimalkan dan minify kode SVG agar ukuran file menjadi lebih kecil.",
    longDescription: "Hapus metadata editor, komentar HTML, dan bersihkan spasi putih tidak penting pada berkas SVG untuk mempercepat loading situs.",
    category: "Image",
    subcategory: "Optimization",
    icon: "⚡",
    featured: true,
    faqs: [
      { q: "Apakah optimasi ini merusak bentuk visual SVG?", a: "Tidak. Proses optimasi hanya menghapus tag non-visual (seperti metadata/comments) dan memadatkan kode tanpa mengubah path rendering." }
    ]
  },
  {
    slug: "kalkulator-thr",
    name: "Kalkulator THR",
    description: "Hitung besaran Tunjangan Hari Raya (THR) secara proporsional sesuai masa kerja.",
    longDescription: "Hitung nilai THR keagamaan secara akurat berdasarkan masa kerja bulanan dan total gaji pokok + tunjangan tetap sesuai regulasi Permenaker.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "🕌",
    featured: true,
    faqs: [
      { q: "Berapa minimal masa kerja untuk mendapatkan THR?", a: "Pekerja dengan masa kerja minimal 1 bulan terus-menerus sudah berhak menerima THR secara proporsional." }
    ]
  },
  {
    slug: "kalkulator-pph21",
    name: "Kalkulator PPh 21",
    description: "Simulasikan potongan Pajak Penghasilan Pasal 21 tahunan & bulanan terbaru.",
    longDescription: "Hitung estimasi potongan PPh 21 atas gaji Anda berdasarkan status PTKP (TK/0 s.d K/3) dan tarif progresif UU HPP terbaru secara transparan.",
    category: "Calculators",
    subcategory: "Tax",
    icon: "🧾",
    featured: true,
    faqs: [
      { q: "Apa dampak tidak memiliki NPWP?", a: "Wajib pajak yang tidak memiliki NPWP akan dikenakan tarif 20% lebih tinggi dari tarif normal." }
    ]
  },
  {
    slug: "kalkulator-gaji-bersih",
    name: "Kalkulator Gaji Bersih",
    description: "Hitung gaji bersih bulanan (Take Home Pay) setelah dipotong BPJS dan PPh 21.",
    longDescription: "Hitung sisa gaji bersih yang Anda bawa pulang dengan rincian potongan BPJS Kesehatan (1%), BPJS JHT (2%), BPJS JP (1%), dan PPh 21.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "💵",
    featured: true,
    faqs: [
      { q: "Berapa batas maksimal upah untuk potongan BPJS?", a: "BPJS Kesehatan maksimal upah Rp 12 juta (potongan maks Rp 120rb/bulan) dan BPJS JP maksimal upah Rp 10.061.300." }
    ]
  },
  {
    slug: "kalkulator-cicilan",
    name: "Kalkulator Cicilan",
    description: "Kalkulator simulasi cicilan pinjaman flat & efektif/anuitas dengan tabel amortisasi.",
    longDescription: "Simulasikan cicilan bulanan KPR, kredit mobil, atau pinjaman pribadi lengkap dengan rincian bunga dan tabel amortisasi pembayaran bulanan.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "📈",
    faqs: [
      { q: "Apa perbedaan bunga Flat dan Anuitas?", a: "Bunga Flat dihitung konstan dari plafon awal, sedangkan Anuitas porsi bunganya mengecil seiring saldo pokok yang menyusut." }
    ]
  },
  {
    slug: "kalkulator-margin-jualan",
    name: "Kalkulator Margin Jualan",
    description: "Hitung harga jual ideal berdasarkan margin profit atau markup persentase.",
    longDescription: "Bantu optimasi harga jual barang Anda dengan menghitung gross profit margin dan markup persentase secara instan.",
    category: "Calculators",
    subcategory: "Business",
    icon: "🏪",
    faqs: [
      { q: "Apa bedanya Margin dan Markup?", a: "Margin dihitung atas persentase untung dari Harga Jual, sedangkan Markup adalah kenaikan harga dihitung dari Harga Modal." }
    ]
  },
  {
    slug: "api-tester",
    name: "API Request Tester",
    description: "Kirim API request (GET, POST, PUT, DELETE) langsung dari browser.",
    longDescription: "Alat pengujian API interaktif untuk mengirim request dengan custom headers & body payload, serta menganalisa status kode dan response secara langsung.",
    category: "Developer",
    subcategory: "Testing",
    icon: "⚡",
    faqs: [
      { q: "Apakah alat ini mendukung CORS?", a: "Ya, namun request bergantung pada aturan CORS endpoint target. Gunakan endpoint publik yang mengizinkan CORS." }
    ]
  },
  {
    slug: "curl-generator",
    name: "cURL Generator",
    description: "Generate perintah cURL dan snippet kode multi-bahasa dari request HTTP.",
    longDescription: "Ubah parameter request HTTP Anda menjadi perintah cURL terminal serta code snippet siap pakai untuk JavaScript Fetch, Python Requests, Go, dan PHP.",
    category: "Developer",
    subcategory: "Generation",
    icon: "🐚",
    faqs: [
      { q: "Bahasa apa saja yang didukung?", a: "Mendukung cURL CLI, JavaScript Fetch, Python, Go, dan PHP cURL." }
    ]
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Rapikan dan format query SQL agar lebih mudah dibaca.",
    longDescription: "Format sintaks query database SQL kasar Anda dengan opsi indentasi baris baru untuk klausa SELECT, FROM, WHERE, JOIN, GROUP BY, dan case keywords (UPPERCASE/lowercase).",
    category: "Developer",
    subcategory: "Formatting",
    icon: "🔍",
    faqs: [
      { q: "Jenis database apa saja yang didukung?", a: "Mendukung query SQL standar dari PostgreSQL, MySQL, SQLite, dan database relational lainnya." }
    ]
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    description: "Format dan rapikan dokumen XML agar rapi dengan validasi sintaks.",
    longDescription: "Format dokumen XML Anda secara otomatis dengan struktur indentasi bertingkat yang rapi serta deteksi error sintaksis secara instan.",
    category: "Developer",
    subcategory: "Formatting",
    icon: "📦",
    faqs: [
      { q: "Apa yang terjadi jika XML tidak valid?", a: "Aplikasi akan menampilkan kotak notifikasi merah berisi detail error parsing dari browser." }
    ]
  },
  {
    slug: "yaml-formatter",
    name: "YAML Formatter",
    description: "Format dan validasi file konfigurasi YAML agar rapi.",
    longDescription: "Format indentasi, spasi di belakang titik dua (:), komentar, serta item list pada dokumen konfigurasi YAML Anda agar sesuai spesifikasi.",
    category: "Developer",
    subcategory: "Formatting",
    icon: "⚙️",
    faqs: [
      { q: "Apakah spasi indentasi dirapikan?", a: "Ya, spasi indentasi dan tanda hubung list diselaraskan agar rapi dan seragam." }
    ]
  },
  {
    slug: "yaml-json-converter",
    name: "YAML ↔ JSON Converter",
    description: "Konversi konfigurasi antara format YAML and JSON secara instan.",
    longDescription: "Ubah data konfigurasi Anda dari YAML ke JSON atau sebaliknya dalam sekejap tanpa memerlukan koneksi internet.",
    category: "Developer",
    subcategory: "Conversion",
    icon: "🔄",
    faqs: [
      { q: "Apakah konversi berjalan secara lokal?", a: "Ya. Proses konversi sepenuhnya diproses secara aman langsung di dalam web browser Anda." }
    ]
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Ubah format warna antara HEX, RGB, HSL, dan CMYK dengan color picker.",
    longDescription: "Alat pemilih warna interaktif dan konverter instan untuk menerjemahkan nilai warna HEX, RGB, HSL, dan CMYK secara akurat.",
    category: "Converters",
    subcategory: "Code",
    icon: "🎨",
    faqs: [
      { q: "Apakah format warna diperbarui langsung saat saya menggeser color picker?", a: "Ya. Nilai HEX, RGB, HSL, dan CMYK diperbarui secara real-time saat Anda memilih warna." }
    ]
  },
  {
    slug: "barcode-generator",
    name: "Barcode Generator",
    description: "Generate barcode standard industri (CODE128, CODE39, EAN, UPC) secara gratis.",
    longDescription: "Bikin barcode untuk produk, inventaris, atau ritel dengan kustomisasi lengkap lebar, tinggi, warna, dan format barcode standar.",
    category: "Generators",
    subcategory: "QR & Links",
    icon: "|||",
    featured: true,
    faqs: [
      { q: "Format barcode apa saja yang didukung?", a: "Mendukung CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, MSI, dan Pharmacode." },
      { q: "Bisa didownload format apa?", a: "Tersedia download dalam format PNG (resolusi tinggi) dan SVG (vektor)." }
    ]
  },
  {
    slug: "wifi-qr-generator",
    name: "WiFi QR Generator",
    description: "Generate QR Code otomatis untuk sambungan koneksi WiFi instan.",
    longDescription: "Bantu tamu atau pelanggan Anda terhubung ke jaringan WiFi Anda secara instan tanpa perlu mengetik password secara manual.",
    category: "Generators",
    subcategory: "QR & Links",
    icon: "📶",
    featured: true,
    faqs: [
      { q: "Apakah password WiFi saya aman?", a: "Sangat aman. Seluruh data diproses secara lokal di browser Anda, tidak ada informasi jaringan yang dikirim ke server." },
      { q: "Kamera HP apa saja yang bisa memindai?", a: "Hampir semua HP iOS (iPhone) dan Android modern mendukung pemindaian WiFi QR langsung dari aplikasi kamera bawaan." }
    ]
  },
  {
    slug: "whatsapp-link-generator",
    name: "WhatsApp Link Generator",
    description: "Buat link chat WhatsApp langsung secara instan.",
    longDescription: "Mudahkan calon pelanggan menghubungi Anda dengan membuat link wa.me kustom lengkap dengan pesan otomatis.",
    category: "WhatsApp",
    subcategory: "Link Tools",
    icon: "🔗",
    featured: true,
    faqs: [
      { q: "Apakah nomor handphone harus pakai kode negara?", a: "Ya. Namun tool ini akan otomatis memformat dan menambahkan kode negara jika Anda lupa memasukkannya." }
    ]
  },
  {
    slug: "faq-schema-generator",
    name: "FAQ Schema Generator",
    description: "Buat kode JSON-LD FAQ Page Schema untuk meningkatkan SEO di Google.",
    longDescription: "Hasilkan schema markup halaman tanya-jawab secara visual untuk mendapatkan snippet kaya (Rich Snippets) di halaman hasil pencarian Google.",
    category: "Generators",
    subcategory: "SEO",
    icon: "❓",
    faqs: [
      { q: "Mengapa harus menggunakan FAQ Schema?", a: "Membantu mesin pencari seperti Google memahami struktur tanya-jawab di halaman web Anda dan berpotensi menampilkan FAQ langsung di hasil pencarian." }
    ]
  },
  {
    slug: "open-graph-generator",
    name: "Open Graph Generator",
    description: "Generate meta tags Open Graph (Facebook) dan Twitter Cards untuk preview media sosial.",
    longDescription: "Buat tag meta optimasi media sosial agar konten website Anda tampil menarik dan profesional saat dibagikan ke platform seperti Facebook, Twitter, dan LinkedIn.",
    category: "Generators",
    subcategory: "SEO",
    icon: "🌐",
    faqs: [
      { q: "Apa kegunaan tag Open Graph?", a: "Mengontrol visualisasi konten Anda (gambar, judul, deskripsi) ketika link halaman Anda dibagikan di media sosial." }
    ]
  },
  {
    slug: "json-ld-generator",
    name: "JSON-LD Schema Generator",
    description: "Generate Schema.org JSON-LD terstruktur untuk Website, Bisnis Lokal, Artikel, dll.",
    longDescription: "Bantu optimasi SEO teknis Anda dengan meng-generate script data terstruktur terstandardisasi menggunakan format direkomendasikan Google (JSON-LD).",
    category: "Generators",
    subcategory: "SEO",
    icon: "JS",
    featured: true,
    faqs: [
      { q: "Tipe schema apa saja yang didukung?", a: "Mendukung Website, Local Business, Article, Product, dan Person." },
      { q: "Di mana saya harus menaruh kodenya?", a: "Salin kode script hasil generate ke dalam bagian <head> atau sebelum tag penutup </body> pada dokumen HTML Anda." }
    ]
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    description: "Buat meta tags SEO lengkap untuk website Anda secara instan.",
    longDescription: "Bantu robot pencari memahami konten situs Anda dengan cepat menggunakan meta tags standar seperti judul, deskripsi, kata kunci, penulis, dan konfigurasi indeks bot.",
    category: "Generators",
    subcategory: "SEO",
    icon: "🏷️",
    faqs: [
      { q: "Kenapa meta tags penting untuk SEO?", a: "Meta tags memberikan metadata penting tentang halaman web Anda kepada mesin pencari dan pengunjung, memengaruhi cara situs Anda terindeks dan ditampilkan di hasil pencarian." }
    ]
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Hasilkan file robots.txt kustom untuk mengontrol akses bot mesin pencari.",
    longDescription: "Buat panduan yang jelas untuk bot perayap (crawlers) seperti Googlebot dan Bingbot mengenai folder atau halaman mana saja yang boleh dan tidak boleh diindeks.",
    category: "Generators",
    subcategory: "SEO",
    icon: "🤖",
    faqs: [
      { q: "Apa fungsi utama robots.txt?", a: "Mengontrol lalu lintas bot perayap agar tidak membebani server Anda dan menyembunyikan halaman privat dari hasil pencarian publik." }
    ]
  },
  {
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    description: "Buat file sitemap.xml untuk mempermudah indeksasi seluruh halaman website.",
    longDescription: "Hasilkan sitemap terstruktur standar XML yang berisi seluruh tautan halaman Anda agar robot Google dapat mengindeks konten baru Anda lebih cepat.",
    category: "Generators",
    subcategory: "SEO",
    icon: "🗺️",
    faqs: [
      { q: "Berapa batas URL dalam satu file sitemap.xml?", a: "Satu file sitemap.xml dapat menampung hingga 50.000 URL atau memiliki ukuran file maksimal 50MB." }
    ]
  },
  {
    slug: "kalkulator-diskon",
    name: "Kalkulator Diskon",
    description: "Hitung harga akhir setelah diskon tunggal atau bertingkat (X% + Y%).",
    longDescription: "Bantu hitung potongan harga dan jumlah uang yang Anda hemat dari diskon tunggal maupun diskon ganda secara instan.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "🏷️",
    faqs: [
      { q: "Apakah mendukung diskon ganda?", a: "Ya. Mendukung diskon bertingkat seperti diskon 50% + 10%." }
    ]
  },
  {
    slug: "kalkulator-harga-jual",
    name: "Kalkulator Harga Jual",
    description: "Tentukan harga jual ideal menggunakan metode Markup atau Margin Target.",
    longDescription: "Hitung harga jual produk Anda dengan mudah berdasarkan modal (COGS) dan target keuntungan persentase.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "💰",
    faqs: [
      { q: "Apa bedanya Markup dan Margin?", a: "Markup dihitung berdasarkan persentase dari harga modal, sedangkan Margin dihitung berdasarkan persentase dari harga jual." }
    ]
  },
  {
    slug: "kalkulator-profit",
    name: "Kalkulator Profit",
    description: "Analisis laba kotor, laba bersih, serta persentase profit margin usaha Anda.",
    longDescription: "Masukkan omset, HPP, dan biaya operasional untuk mengetahui margin laba kotor dan laba bersih bisnis Anda secara detail.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "📈",
    faqs: [
      { q: "Apa itu Net Margin?", a: "Persentase laba bersih setelah dikurangi semua biaya operasional terhadap total pendapatan." }
    ]
  },
  {
    slug: "kalkulator-roi",
    name: "Kalkulator ROI",
    description: "Hitung Return on Investment (ROI) untuk mengukur efisiensi investasi Anda.",
    longDescription: "Analisis persentase tingkat pengembalian modal dari investasi Anda berdasarkan nilai awal dan nilai akhir investasi.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "📊",
    faqs: [
      { q: "Apakah nilai ROI bisa negatif?", a: "Ya, jika nilai pengembalian akhir lebih kecil daripada modal awal (mengalami kerugian)." }
    ]
  },
  {
    slug: "kalkulator-cashback",
    name: "Kalkulator Cashback",
    description: "Hitung nominal cashback yang didapatkan beserta diskon efektifnya.",
    longDescription: "Masukkan nilai belanja, persentase cashback, batas maksimal, dan minimum belanja untuk menghitung cashback riil Anda.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "🪙",
    faqs: [
      { q: "Mengapa cashback saya bernilai Rp0?", a: "Pastikan total belanja Anda sudah memenuhi batas minimum pembelian yang disyaratkan." }
    ]
  },
  {
    slug: "kalkulator-komisi-sales",
    name: "Kalkulator Komisi Sales",
    description: "Hitung pendapatan komisi penjualan sales beserta bonus pencapaian target.",
    longDescription: "Simulasikan total penghasilan agen penjualan berdasarkan gaji pokok, rate komisi, target penjualan, dan bonus kuota.",
    category: "Calculators",
    subcategory: "Finance",
    icon: "🤝",
    faqs: [
      { q: "Apakah bonus target otomatis ditambahkan?", a: "Ya, jika total penjualan mencapai atau melebihi kuota target yang ditentukan." }
    ]
  },
  {
    slug: "kalkulator-fee-shopee",
    name: "Kalkulator Fee Shopee",
    description: "Simulasi potongan biaya admin Shopee untuk tipe Star, Star+, Mall, dan Regular.",
    longDescription: "Hitung estimasi potongan biaya admin dan biaya program promo gratis ongkir/cashback ekstra untuk toko Shopee Anda.",
    category: "Calculators",
    subcategory: "Marketplace",
    icon: "🧡",
    faqs: [
      { q: "Mengapa potongan biaya admin setiap produk berbeda?", a: "Shopee membagi tarif biaya administrasi berdasarkan kategori grup produk A, B, C, D, dan E." }
    ]
  },
  {
    slug: "kalkulator-fee-tokopedia",
    name: "Kalkulator Fee Tokopedia",
    description: "Simulasikan potongan biaya layanan Tokopedia untuk Power Merchant dan OS.",
    longDescription: "Ketahui sisa saldo bersih hasil penjualan Tokopedia setelah dikurangi admin fee dan biaya bebas ongkir.",
    category: "Calculators",
    subcategory: "Marketplace",
    icon: "💚",
    faqs: [
      { q: "Berapa biaya admin Tokopedia terbaru?", a: "Biaya admin berkisar mulai dari 2% hingga 8% tergantung status seller dan kategori produk." }
    ]
  },
  {
    slug: "kalkulator-fee-tiktok-shop",
    name: "Kalkulator Fee TikTok Shop",
    description: "Hitung potongan komisi penjualan dan biaya transaksi di TikTok Shop (Tokopedia).",
    longDescription: "Simulasikan sisa pendapatan bersih toko TikTok Shop Anda setelah dikurangi komisi kategori produk, biaya transaksi 2%, dan campaign fee.",
    category: "Calculators",
    subcategory: "Marketplace",
    icon: "🖤",
    faqs: [
      { q: "Apakah biaya transaksi bersifat flat?", a: "Ya. Biaya transaksi di TikTok Shop saat ini flat sebesar 2% dari harga produk." }
    ]
  },
  {
    slug: "kalkulator-kpr",
    name: "Kalkulator KPR",
    description: "Simulasikan angsuran bulanan Kredit Pemilikan Rumah (KPR) Anda.",
    longDescription: "Hitung angsuran bulanan, total bunga yang dibayarkan, serta total pengeluaran untuk cicilan KPR rumah impian Anda.",
    category: "Calculators",
    subcategory: "Personal Finance",
    icon: "🏠",
    faqs: [
      { q: "Bagaimana cara memperkecil angsuran KPR?", a: "Anda bisa memperbesar nilai uang muka (DP) atau memilih tenor pinjaman yang lebih lama." }
    ]
  },
  {
    slug: "kalkulator-bunga-pinjaman",
    name: "Kalkulator Bunga Pinjaman",
    description: "Hitung angsuran bulanan untuk pinjaman dengan suku bunga flat atau efektif.",
    longDescription: "Simulasikan rincian pinjaman bank atau kredit lainnya untuk membandingkan angsuran menggunakan bunga flat maupun anuitas.",
    category: "Calculators",
    subcategory: "Personal Finance",
    icon: "💸",
    faqs: [
      { q: "Kapan sebaiknya memilih bunga flat?", a: "Bunga flat cocok untuk kredit jangka pendek karena perhitungan bunganya konstan dan cicilannya tetap." }
    ]
  },
  {
    slug: "kalkulator-deposito",
    name: "Kalkulator Deposito",
    description: "Hitung bagi hasil atau bunga deposito setelah dipotong pajak 20%.",
    longDescription: "Ketahui bunga bersih bulanan dan total dana jatuh tempo deposito Anda berdasarkan bunga tahunan dan durasi simpanan.",
    category: "Calculators",
    subcategory: "Personal Finance",
    icon: "🏦",
    faqs: [
      { q: "Apakah bunga deposito dikenakan pajak?", a: "Ya. Di Indonesia, bunga deposito di atas nominal Rp7,5 juta dikenakan pajak PPh final sebesar 20%." }
    ]
  },
  {
    slug: "kalkulator-tabungan",
    name: "Kalkulator Tabungan",
    description: "Rencanakan tabungan bulanan untuk mencapai target finansial Anda.",
    longDescription: "Hitung berapa uang yang harus Anda sisihkan per bulan atau berapa lama waktu yang diperlukan untuk mencapai saving goal Anda.",
    category: "Calculators",
    subcategory: "Personal Finance",
    icon: "🪙",
    faqs: [
      { q: "Apakah kalkulator ini memperhitungkan bunga bank?", a: "Tidak. Kalkulator ini menghitung tabungan murni tanpa asumsi bunga atau inflasi untuk kesederhanaan rencana." }
    ]
  },
  {
    slug: "kalkulator-bmi",
    name: "Kalkulator BMI",
    description: "Hitung indeks massa tubuh (BMI) untuk mengetahui status berat badan ideal.",
    longDescription: "Ketahui apakah berat badan Anda termasuk kategori kurang, normal, berlebih, atau obesitas berdasarkan standar WHO.",
    category: "Calculators",
    subcategory: "Health",
    icon: "⚖️",
    faqs: [
      { q: "Apakah BMI akurat untuk semua orang?", a: "BMI adalah indikator umum yang baik, namun kurang akurat untuk binaragawan atau ibu hamil karena tidak membedakan massa otot dan lemak." }
    ]
  },
  {
    slug: "kalkulator-bmr",
    name: "Kalkulator BMR",
    description: "Hitung Basal Metabolic Rate (BMR) berdasarkan rumus Harris-Benedict.",
    longDescription: "Ketahui kebutuhan kalori minimal yang diperlukan tubuh Anda saat istirahat total untuk menjalankan fungsi organ vital.",
    category: "Calculators",
    subcategory: "Health",
    icon: "🔥",
    faqs: [
      { q: "Apa kegunaan skor BMR?", a: "BMR membantu Anda merancang program diet penurunan atau kenaikan berat badan dengan menghitung kalori dasar tubuh." }
    ]
  },
  {
    slug: "kalkulator-kalori",
    name: "Kalkulator Kalori",
    description: "Hitung kebutuhan kalori harian (TDEE) berdasarkan tingkat aktivitas fisik.",
    longDescription: "Tentukan porsi kalori harian ideal Anda untuk menjaga berat badan, diet menurunkan berat badan, atau menambah masa tubuh.",
    category: "Calculators",
    subcategory: "Health",
    icon: "🍎",
    faqs: [
      { q: "Berapa batas aman defisit kalori harian?", a: "Defisit kalori yang aman adalah sekitar 500 kkal dari kebutuhan harian Anda untuk penurunan berat badan berkala." }
    ]
  },
  {
    slug: "kalkulator-berat-ideal",
    name: "Kalkulator Berat Ideal",
    description: "Hitung kisaran berat badan ideal Anda menggunakan rumus Devine, Robinson, dan Miller.",
    longDescription: "Dapatkan estimasi berat badan paling ideal dan sehat untuk Anda berdasarkan jenis kelamin dan tinggi badan.",
    category: "Calculators",
    subcategory: "Health",
    icon: "🧍",
    faqs: [
      { q: "Rumus mana yang paling umum digunakan?", a: "Rumus Devine adalah standar industri medis yang paling sering digunakan untuk mengukur berat badan ideal." }
    ]
  },
  {
    slug: "kalkulator-ipk",
    name: "Kalkulator IPK",
    description: "Hitung Indeks Prestasi Kumulatif (IPK) mahasiswa secara online dan praktis.",
    longDescription: "Masukkan nilai huruf matkul beserta jumlah SKS-nya untuk menghitung rata-rata nilai IP semester atau IPK akhir Anda.",
    category: "Calculators",
    subcategory: "Education",
    icon: "🎓",
    faqs: [
      { q: "Bagaimana cara konversi nilai huruf ke angka?", a: "Nilai A=4.00, A-=3.75, B+=3.50, B=3.00, B-=2.75, C+=2.50, C=2.00, D=1.00, E=0.00." }
    ]
  },
  {
    slug: "kalkulator-nilai-akhir",
    name: "Kalkulator Nilai Akhir",
    description: "Hitung nilai akhir mata kuliah berdasarkan persentase bobot tugas, UTS, dan UAS.",
    longDescription: "Bantu siswa/mahasiswa menghitung nilai akhir gabungan berdasarkan persentase bobot absensi, tugas kelompok/mandiri, UTS, dan UAS.",
    category: "Calculators",
    subcategory: "Education",
    icon: "📝",
    faqs: [
      { q: "Bagaimana jika total bobot melebihi 100%?", a: "Kalkulator akan menormalkan bobot, namun pastikan total bobot bernilai 100% agar perhitungan nilai akhir Anda akurat." }
    ]
  },
  {
    slug: "kalkulator-rata-rata-nilai",
    name: "Kalkulator Rata-Rata Nilai",
    description: "Hitung rata-rata (mean), median, nilai tertinggi, dan terendah dari sekumpulan angka.",
    longDescription: "Ukur performa nilai ujian kelas dengan menghitung rata-rata aritmetika, nilai tengah, rentang nilai minimum & maksimum secara instan.",
    category: "Calculators",
    subcategory: "Education",
    icon: "📊",
    faqs: [
      { q: "Pemisah karakter apa saja yang didukung?", a: "Anda bisa memisahkan angka dengan koma (,), spasi, titik koma (;), atau menaruhnya di baris baru." }
    ]
  },
  {
    slug: "kalkulator-zakat-profesi",
    name: "Kalkulator Zakat Profesi",
    description: "Hitung kewajiban zakat pendapatan/profesi bulanan berdasarkan harga emas terbaru.",
    longDescription: "Hitung zakat penghasilan bersih bulanan Anda sebesar 2.5% jika total pendapatan Anda telah mencapai batas nisab 85 gram emas.",
    category: "Calculators",
    subcategory: "Islamic",
    icon: "🕌",
    faqs: [
      { q: "Kapan saya wajib membayar zakat profesi?", a: "Zakat wajib ditunaikan jika pendapatan bersih setelah kebutuhan pokok mencapai atau melampaui nisab bulanan (setara 85g emas / 12 bulan)." }
    ]
  },
  {
    slug: "kalkulator-zakat-mal",
    name: "Kalkulator Zakat Mal",
    description: "Hitung zakat atas harta kekayaan simpanan (zakat mal) tahunan secara praktis.",
    longDescription: "Hitung zakat harta simpanan Anda (uang tunai, tabungan, investasi, emas) sebesar 2.5% jika telah haul 1 tahun dan melampaui nisab 85g emas.",
    category: "Calculators",
    subcategory: "Islamic",
    icon: "🕋",
    faqs: [
      { q: "Apa saja aset yang masuk hitungan Zakat Mal?", a: "Tabungan bank, emas/perak perhiasan yang tidak dipakai sehari-hari, saham, reksadana, dan piutang lancar abadi." }
    ]
  },
  {
    slug: "kalkulator-fidyah",
    name: "Kalkulator Fidyah",
    description: "Hitung besaran fidyah utang puasa Ramadhan berupa makanan pokok atau uang.",
    longDescription: "Hitung kewajiban fidyah puasa secara akurat berdasarkan jumlah hari puasa yang ditinggalkan, keterlambatan tahun, serta opsi nominal rupiah standar BAZNAS.",
    category: "Calculators",
    subcategory: "Islamic",
    icon: "🌾",
    faqs: [
      { q: "Berapa fidyah dalam bentuk beras per hari puasa?", a: "Berdasarkan mayoritas ulama (Madzhab Syafi'i), fidyah per hari puasa adalah 1 mud beras, atau setara dengan kurang lebih 675 gram beras." }
    ]
  },
  {
    slug: "kalkulator-waris",
    name: "Kalkulator Waris Sederhana",
    description: "Hitung pembagian harta waris (Faraid) sesuai aturan hukum Islam secara praktis.",
    longDescription: "Hitung pembagian warisan untuk ahli waris inti seperti suami, istri, ayah, ibu, anak laki-laki, dan anak perempuan secara presisi berdasarkan ketentuan Al-Qur'an.",
    category: "Calculators",
    subcategory: "Islamic",
    icon: "⚖️",
    faqs: [
      { q: "Apakah sisa waris (Asabah) dibagi sama rata untuk semua anak?", a: "Tidak. Dalam aturan Faraidh Islam, anak laki-laki mendapat bagian 2 kali lebih banyak dari anak perempuan (rasio 2:1)." }
    ]
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    description: "Generate CSS linear & radial gradients secara visual dan instan.",
    longDescription: "Buat gradien warna CSS (Linear & Radial) yang indah secara interaktif dengan kontrol sudut, warna, dan posisi persentase yang presisi.",
    category: "Developer",
    subcategory: "CSS & Layout",
    icon: "🌈",
    faqs: [
      { q: "Apakah mendukung gradien radial?", a: "Ya. Mendukung gradien bertipe radial (lingkaran) serta linear (sudut derajat)." }
    ]
  },
  {
    slug: "box-shadow-generator",
    name: "Box Shadow Generator",
    description: "Desain bayangan CSS (box-shadow) interaktif dengan live preview.",
    longDescription: "Sesuaikan offset horizontal & vertikal, radius blur, radius spread, warna, serta opsi inset shadow secara mudah dan salin kode CSS-nya langsung.",
    category: "Developer",
    subcategory: "CSS & Layout",
    icon: "👤",
    faqs: [
      { q: "Apa kegunaan opsi inset shadow?", a: "Opsi inset mengarahkan bayangan masuk ke bagian dalam kotak (bukan ke luar)." }
    ]
  },
  {
    slug: "border-radius-generator",
    name: "Border Radius Generator",
    description: "Desain bentuk sudut tumpul CSS (border-radius) secara instan.",
    longDescription: "Sesuaikan lengkungan sudut kotak secara individual atau bersamaan menggunakan satuan piksel (px) maupun persentase (%).",
    category: "Developer",
    subcategory: "CSS & Layout",
    icon: "🟢",
    faqs: [
      { q: "Apa bedanya satuan px dan %?", a: "PX memberikan ukuran lengkungan tetap, sedangkan % melengkungkan sudut relatif terhadap lebar dan tinggi elemen." }
    ]
  },
  {
    slug: "flexbox-generator",
    name: "Flexbox Generator",
    description: "Visualisasikan dan generate struktur layout CSS Flexbox secara interaktif.",
    longDescription: "Eksplorasi properti flex-direction, justify-content, align-items, flex-wrap, dan gap secara visual dengan render container interaktif.",
    category: "Developer",
    subcategory: "CSS & Layout",
    icon: "📦",
    faqs: [
      { q: "Apakah saya bisa mengatur jumlah item?", a: "Ya, Anda bisa menambah atau mengurangi jumlah item preview dari 2 sampai 12 item." }
    ]
  },
  {
    slug: "css-grid-generator",
    name: "CSS Grid Generator",
    description: "Generate layout grid CSS dua dimensi secara interaktif dan visual.",
    longDescription: "Bikin layout baris dan kolom (CSS Grid) kustom lengkap dengan pengaturan jumlah kolom, baris, column gap, dan row gap.",
    category: "Developer",
    subcategory: "CSS & Layout",
    icon: "🏁",
    faqs: [
      { q: "Apakah grid layout didukung semua browser?", a: "Ya, seluruh browser modern saat ini mendukung penuh spesifikasi CSS Grid standard." }
    ]
  },
  {
    slug: "whatsapp-bulk-link",
    name: "WhatsApp Bulk Link Generator",
    description: "Buat banyak link WhatsApp sekaligus dari daftar nomor.",
    longDescription: "Hasilkan link wa.me secara massal untuk mempermudah campaign pemasaran atau pembagian database prospek Anda secara otomatis.",
    category: "WhatsApp",
    subcategory: "Link Tools",
    icon: "📋",
    faqs: [
      { q: "Bagaimana cara memasukkan nomor massal?", a: "Cukup masukkan satu nomor per baris di area input yang telah disediakan." }
    ]
  },
  {
    slug: "whatsapp-text-formatter",
    name: "WhatsApp Text Formatter",
    description: "Format teks WhatsApp Anda jadi tebal, miring, coret, atau monospace.",
    longDescription: "Beri gaya pada pesan chat Anda menggunakan pemformatan resmi WhatsApp (Bold, Italic, Strikethrough, Monospace) dengan editor visual.",
    category: "WhatsApp",
    subcategory: "Text Tools",
    icon: "✍️",
    faqs: [
      { q: "Apakah tulisan hasil format bisa dibaca di semua HP?", a: "Ya, karena tool ini menggunakan format markdown bawaan resmi dari WhatsApp." }
    ]
  },
  {
    slug: "fancy-whatsapp-text",
    name: "Fancy WhatsApp Text Generator",
    description: "Ubah font teks WhatsApp Anda dengan berbagai gaya unik dan dekoratif.",
    longDescription: "Hasilkan tulisan bergaya unik seperti huruf lingkaran, kotak, sambung, tebal serif untuk status atau chat WhatsApp Anda agar lebih menarik.",
    category: "WhatsApp",
    subcategory: "Text Tools",
    icon: "✨",
    faqs: [
      { q: "Apakah semua karakter didukung?", a: "Hampir semua karakter latin dasar (A-Z, a-z) dan angka didukung untuk diubah gayanya." }
    ]
  },
  {
    slug: "whatsapp-qr-generator",
    name: "WhatsApp QR Generator",
    description: "Buat QR Code untuk chat WhatsApp Anda secara instan.",
    longDescription: "Hasilkan QR Code dinamis berkualitas tinggi yang dapat di-scan langsung oleh pelanggan untuk mulai chat dengan nomor Anda.",
    category: "WhatsApp",
    subcategory: "QR Tools",
    icon: "📸",
    faqs: [
      { q: "Format unduhan QR Code-nya apa?", a: "QR Code dapat diunduh langsung dalam format berkas gambar PNG berkualitas tinggi." }
    ]
  },
  {
    slug: "whatsapp-group-qr",
    name: "WhatsApp Group QR Generator",
    description: "Hasilkan QR Code scannable khusus untuk link grup WhatsApp Anda.",
    longDescription: "Ubah tautan undangan (invite link) grup chat WhatsApp menjadi QR Code siap scan dan unduh untuk ditempel di poster/flyer.",
    category: "WhatsApp",
    subcategory: "QR Tools",
    icon: "👥",
    faqs: [
      { q: "Dimana saya bisa mendapatkan link grup?", a: "Dari info grup WhatsApp, klik 'Undang via tautan' lalu salin link undangan tersebut." }
    ]
  },
  {
    slug: "whatsapp-cs-link",
    name: "WhatsApp CS Link Generator",
    description: "Buat link chat WhatsApp khusus untuk pembagian tugas agen Customer Service.",
    longDescription: "Bagi trafik chat pelanggan Anda dengan membuat daftar link chat terstruktur untuk masing-masing admin CS/agen penjualan Anda.",
    category: "WhatsApp",
    subcategory: "Business Tools",
    icon: "📞",
    faqs: [
      { q: "Apakah saya bisa menambahkan banyak agen?", a: "Bisa, tidak ada batasan jumlah agen CS yang bisa Anda tambahkan di halaman ini." }
    ]
  },
  {
    slug: "whatsapp-order-link",
    name: "WhatsApp Order Link Generator",
    description: "Buat link chat berisi format pemesanan produk otomatis untuk toko online.",
    longDescription: "Mudahkan transaksi toko online dengan meng-generate form pemesanan chat terstruktur berisi detail nama produk, harga, dan metode bayar.",
    category: "WhatsApp",
    subcategory: "Business Tools",
    icon: "🛍️",
    faqs: [
      { q: "Apakah harga otomatis terformat ke Rupiah?", a: "Ya, input angka harga akan otomatis dikonversikan ke dalam format rupiah (Rp)." }
    ]
  },
  {
    slug: "whatsapp-sticker-maker",
    name: "WA Sticker Maker",
    description: "Buat sticker kustom untuk WhatsApp secara instan.",
    longDescription: "Unggah gambar Anda, berikan teks kustom dengan pilihan warna dan outline, lalu unduh berkas WebP yang kompatibel untuk dijadikan sticker WhatsApp.",
    category: "WhatsApp",
    subcategory: "Sticker Tools",
    icon: "🎨",
    faqs: [
      { q: "Apakah sticker hasil unduhan langsung dalam format WebP?", a: "Ya. Hasil unduhan adalah berkas WebP berukuran 512x512 piksel yang merupakan format standar sticker WhatsApp." }
    ]
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Ubah satu atau beberapa gambar JPG/PNG/WebP menjadi satu file PDF.",
    longDescription: "Konversi galeri gambar Anda menjadi dokumen PDF secara cepat. Atur urutan gambar, orientasi halaman (potrait/landscape), dan ukuran kertas.",
    category: "PDF",
    subcategory: "Conversion",
    icon: "🖼️",
    faqs: [
      { q: "Format gambar apa saja yang bisa diconvert?", a: "Kalkulator ini mendukung format JPG, JPEG, PNG, dan WebP." }
    ]
  },
  {
    slug: "pdf-to-image",
    name: "PDF to Image",
    description: "Ekstrak semua halaman dokumen PDF menjadi file gambar PNG berkualitas tinggi.",
    longDescription: "Konversi berkas PDF Anda menjadi sekumpulan gambar PNG per halaman secara lokal tanpa perlu upload data ke server luar.",
    category: "PDF",
    subcategory: "Conversion",
    icon: "📸",
    faqs: [
      { q: "Apakah gambar hasil ekstrak beresolusi tinggi?", a: "Ya. Halaman PDF dirender dengan skala resolusi tajam yang nyaman untuk dibaca." }
    ]
  },
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    description: "Gabungkan beberapa file PDF terpisah menjadi satu dokumen utuh.",
    longDescription: "Beri kemudahan menyatukan laporan kerja dengan menggabungkan dua atau lebih file PDF secara berurutan dan terstruktur.",
    category: "PDF",
    subcategory: "Editing",
    icon: "🔀",
    faqs: [
      { q: "Apakah ada batasan jumlah file yang bisa digabung?", a: "Tidak ada batasan jumlah file. Anda dapat menggabungkan file sebanyak yang Anda perlukan secara lokal." }
    ]
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    description: "Pisahkan file PDF menjadi beberapa bagian berdasarkan rentang halaman.",
    longDescription: "Potong dokumen PDF yang panjang menjadi beberapa berkas baru berdasarkan nomor halaman atau pisahkan setiap halamannya satu per satu.",
    category: "PDF",
    subcategory: "Editing",
    icon: "✂️",
    faqs: [
      { q: "Bagaimana cara menulis rentang halaman?", a: "Anda dapat menggunakan format seperti '1-3' untuk halaman 1 sampai 3, atau angka tunggal '5' dipisahkan koma." }
    ]
  },
  {
    slug: "pdf-rotate",
    name: "PDF Rotate",
    description: "Putar arah orientasi halaman dokumen PDF Anda secara permanen.",
    longDescription: "Perbaiki orientasi halaman PDF yang terbalik atau miring dengan memutarnya 90, 180, atau 270 derajat secara instan.",
    category: "PDF",
    subcategory: "Editing",
    icon: "🔄",
    faqs: [
      { q: "Apakah rotasi disimpan secara permanen?", a: "Ya, file baru hasil download akan menyimpan sudut rotasi baru tersebut secara permanen." }
    ]
  },
  {
    slug: "pdf-page-extractor",
    name: "PDF Page Extractor",
    description: "Pilih dan ambil beberapa halaman tertentu saja dari satu dokumen PDF.",
    longDescription: "Ambil halaman-halaman penting dari file PDF tebal dan satukan menjadi sebuah berkas PDF baru secara praktis.",
    category: "PDF",
    subcategory: "Editing",
    icon: "📥",
    faqs: [
      { q: "Apakah file asli saya akan terhapus?", a: "Tidak, file asli Anda tetap aman tidak disentuh. Sistem hanya menyalin halaman yang Anda pilih ke file PDF baru." }
    ]
  }
];

export interface CategoryInfo {
  name: string;
  key: ToolCategory | "all";
  subcategories?: string[];
}

export const categories: CategoryInfo[] = [
  { name: "Semua", key: "all" },
  {
    name: "🛠️ Developer Tools",
    key: "Developer",
    subcategories: ["Formatting", "Conversion", "Testing", "Encoding", "Generation", "CSS & Layout"]
  },
  {
    name: "🖼️ Image Tools",
    key: "Image",
    subcategories: ["Compression", "Conversion", "Editing", "Optimization"]
  },
  {
    name: "🧮 Calculators",
    key: "Calculators",
    subcategories: ["Finance", "Business", "Marketplace", "Personal Finance", "Health", "Education", "Tax", "Islamic"]
  },
  {
    name: "🔐 Generators",
    key: "Generators",
    subcategories: ["Business", "SEO", "QR & Links", "Documents", "Content"]
  },
  {
    name: "📏 Converters",
    key: "Converters",
    subcategories: ["Data", "Text", "Code", "Units"]
  },
  {
    name: "⚙️ Utilities",
    key: "Utilities",
    subcategories: ["Time", "Random", "Productivity", "Events"]
  },
  {
    name: "💬 WhatsApp Tools",
    key: "WhatsApp",
    subcategories: ["Link Tools", "Text Tools", "QR Tools", "Business Tools", "Sticker Tools"]
  },
  {
    name: "📄 PDF Tools",
    key: "PDF",
    subcategories: ["Conversion", "Editing"]
  }
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string, limit = 3): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  return tools.filter((t) => t.slug !== slug && t.category === tool.category).slice(0, limit);
}
