export type ToolCategory = "Developer" | "Image" | "Calculators" | "Generators" | "Converters" | "Utilities";

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
    description: "Buat link chat WhatsApp langsung beserta pesan template kustom.",
    longDescription: "Mudahkan calon pelanggan menghubungi Anda melalui chat WhatsApp dengan sekali klik. Dilengkapi link wa.me dan QR Code otomatis.",
    category: "Generators",
    subcategory: "QR & Links",
    icon: "💬",
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
    subcategories: ["Formatting", "Conversion", "Testing", "Encoding", "Generation"]
  },
  {
    name: "🖼️ Image Tools",
    key: "Image",
    subcategories: ["Compression", "Conversion", "Editing", "Optimization"]
  },
  {
    name: "🧮 Calculators",
    key: "Calculators",
    subcategories: ["Finance", "Business", "Health", "Education", "Tax", "Islamic"]
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
