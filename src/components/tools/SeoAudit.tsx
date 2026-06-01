import { useState, useEffect } from "react";
import { fetchUrlHtml } from "../../lib/api/seo.functions";


interface AuditCheck {
  id: string;
  name: string;
  category: "content" | "technical" | "navigation" | "media";
  status: "pass" | "warning" | "error";
  score: number; // weight
  earned: number;
  message: string;
  explanation: string;
  howToFix: string;
}

interface HeadingItem {
  tag: string;
  text: string;
  level: number;
}

interface ImageItem {
  src: string;
  alt: string;
  hasAlt: boolean;
}

interface LinkItem {
  href: string;
  text: string;
  isExternal: boolean;
  isEmpty: boolean;
  isGeneric: boolean;
  missingRel: boolean;
}

interface AuditResult {
  score: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  checks: AuditCheck[];
  title: { text: string; length: number };
  description: { text: string; length: number };
  headings: HeadingItem[];
  images: ImageItem[];
  links: LinkItem[];
  canonical: string;
  robots: string;
  viewport: string;
  schemaTypes: string[];
  htmlSize: number;
  textToHtmlRatio: number;
}

export function SeoAudit() {
  const [inputType, setInputType] = useState<"url" | "html">("html");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "technical" | "links" | "media">("overview");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  // Pre-loaded imperfect HTML sample
  const sampleHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Toko Baju Murah & Sepatu Trendi - Sqwerly Shop</title>
  <meta name="description" content="Beli baju murah disini.">
  <link rel="canonical" href="http://sqwerly-shop.com/home">
  <!-- Missing Viewport tag! -->
  <!-- Missing Open Graph Image tag! -->
  <meta property="og:title" content="Sqwerly Shop">
</head>
<body>
  <h1>Toko Baju Murah & Sepatu Trendi</h1>
  <h1>Selamat Datang di Toko Kami!</h1> <!-- Multiple H1! -->
  
  <h2>Kategori Produk Unggulan</h2>
  <p>Kami menjual berbagai macam pakaian dan sepatu berkualitas tinggi dengan harga grosir langsung dari pabrik.</p>
  
  <h3>Sepatu Casual Pria</h3>
  <img src="sepatu-casual.jpg"> <!-- Missing alt tag! -->
  <a href="#">Klik disini</a> <!-- Generic anchor and empty link! -->
  
  <h3>Baju Gamis Wanita</h3>
  <img src="baju-gamis.jpg" alt="Baju Gamis Modern Warna Pastel"> <!-- Good image tag -->
  <a href="https://externalsite.com/partner" target="_blank">Lihat Detail Partner</a> <!-- Missing rel="noopener" -->
</body>
</html>`;

  const loadSampleHtml = () => {
    setHtml(sampleHtml);
    setInputType("html");
    setError("");
    setResult(null);
  };

  const loadSampleUrl = () => {
    setUrl("https://react.dev");
    setInputType("url");
    setError("");
    setResult(null);
  };

  const runAudit = (htmlString: string, siteUrl: string = "") => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const cleanUrl = siteUrl.trim();

      // Basic data extraction
      const titleTag = doc.querySelector("title");
      const titleText = titleTag?.textContent?.trim() || "";
      const titleLen = titleText.length;

      const descTag = doc.querySelector('meta[name="description"]');
      const descText = descTag?.getAttribute("content")?.trim() || "";
      const descLen = descText.length;

      const canonicalTag = doc.querySelector('link[rel="canonical"]');
      const canonicalHref = canonicalTag?.getAttribute("href") || "";

      const robotsTag = doc.querySelector('meta[name="robots"]');
      const robotsContent = robotsTag?.getAttribute("content") || "";

      const viewportTag = doc.querySelector('meta[name="viewport"]');
      const viewportContent = viewportTag?.getAttribute("content") || "";

      // Headings analysis
      const headings: HeadingItem[] = [];
      doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
        headings.push({
          tag: el.tagName.toUpperCase(),
          text: el.textContent?.trim() || "",
          level: parseInt(el.tagName.substring(1)),
        });
      });

      // Images analysis
      const images: ImageItem[] = [];
      doc.querySelectorAll("img").forEach((el) => {
        const src = el.getAttribute("src") || "";
        const alt = el.getAttribute("alt") || "";
        const hasAlt = el.hasAttribute("alt") && alt.trim().length > 0;
        images.push({ src, alt, hasAlt });
      });

      // Links analysis
      const links: LinkItem[] = [];
      const genericKeywords = ["click here", "klik disini", "klik di sini", "read more", "baca selengkapnya", "detail", "selengkapnya", "link", "tautan"];
      doc.querySelectorAll("a").forEach((el) => {
        const href = el.getAttribute("href") || "";
        const text = el.textContent?.trim() || "";
        const isExternal = /^https?:\/\//i.test(href) && (cleanUrl ? !href.includes(new URL(cleanUrl).hostname) : true);
        const isEmpty = href === "#" || href === "" || href.startsWith("javascript:");
        const isGeneric = genericKeywords.some((keyword) => text.toLowerCase().includes(keyword));
        const target = el.getAttribute("target") || "";
        const rel = el.getAttribute("rel") || "";
        const missingRel = isExternal && target === "_blank" && !rel.includes("noopener") && !rel.includes("noreferrer");

        links.push({
          href,
          text,
          isExternal,
          isEmpty,
          isGeneric,
          missingRel,
        });
      });

      // Schema analysis
      const schemaTypes: string[] = [];
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
        try {
          const json = JSON.parse(el.textContent || "{}");
          if (json["@type"]) {
            schemaTypes.push(json["@type"]);
          } else if (Array.isArray(json)) {
            json.forEach((item) => item["@type"] && schemaTypes.push(item["@type"]));
          }
        } catch (e) {}
      });
      // Microdata check
      if (doc.querySelector("[itemscope]")) {
        schemaTypes.push("Microdata (itemscope)");
      }

      // Open Graph and Twitter Cards
      const ogTags: { key: string; val: string }[] = [];
      const twitterTags: { key: string; val: string }[] = [];
      doc.querySelectorAll("meta").forEach((el) => {
        const property = el.getAttribute("property") || "";
        const name = el.getAttribute("name") || "";
        const content = el.getAttribute("content") || "";
        if (property.startsWith("og:") && content) {
          ogTags.push({ key: property, val: content });
        }
        if (name.startsWith("twitter:") && content) {
          twitterTags.push({ key: name, val: content });
        }
      });

      // Text and HTML ratios
      const htmlSize = htmlString.length;
      const textLength = doc.body?.innerText?.trim().length || 0;
      const textToHtmlRatio = htmlSize > 0 ? (textLength / htmlSize) * 100 : 0;

      // ----------------------------------------------------
      // AUDIT RULES ENGINE
      // ----------------------------------------------------
      const checks: AuditCheck[] = [];

      // 1. Title Tag
      let titleStatus: "pass" | "warning" | "error" = "pass";
      let titleMsg = "Tag title ditemukan dengan panjang optimal.";
      let titleEarned = 15;
      if (titleLen === 0) {
        titleStatus = "error";
        titleMsg = "Tag title tidak ditemukan!";
        titleEarned = 0;
      } else if (titleLen < 30) {
        titleStatus = "warning";
        titleMsg = `Tag title terlalu pendek (${titleLen} karakter). Rekomendasi: 50-60 karakter.`;
        titleEarned = 8;
      } else if (titleLen > 60) {
        titleStatus = "warning";
        titleMsg = `Tag title terlalu panjang (${titleLen} karakter) dan berpotensi terpotong di SERP Google. Rekomendasi: 50-60 karakter.`;
        titleEarned = 8;
      }
      checks.push({
        id: "title",
        name: "Tag Title Halaman",
        category: "content",
        status: titleStatus,
        score: 15,
        earned: titleEarned,
        message: titleMsg,
        explanation: "Title tag merupakan salah satu elemen SEO on-page terpenting yang dibaca pertama kali oleh mesin pencari dan calon pengunjung di hasil pencarian Google.",
        howToFix: "Pastikan tag <title> berada di dalam <head> dengan panjang antara 50 hingga 60 karakter yang mengandung kata kunci utama di bagian awal.",
      });

      // 2. Meta Description
      let descStatus: "pass" | "warning" | "error" = "pass";
      let descMsg = "Meta description ditemukan dengan panjang optimal.";
      let descEarned = 15;
      if (descLen === 0) {
        descStatus = "error";
        descMsg = "Meta description tidak ditemukan!";
        descEarned = 0;
      } else if (descLen < 80) {
        descStatus = "warning";
        descMsg = `Meta description terlalu pendek (${descLen} karakter). Rekomendasi: 120-160 karakter.`;
        descEarned = 8;
      } else if (descLen > 160) {
        descStatus = "warning";
        descMsg = `Meta description terlalu panjang (${descLen} karakter) dan berpotensi terpotong. Rekomendasi: 120-160 karakter.`;
        descEarned = 8;
      }
      checks.push({
        id: "description",
        name: "Meta Description",
        category: "content",
        status: descStatus,
        score: 15,
        earned: descEarned,
        message: descMsg,
        explanation: "Meta description memberikan rangkuman isi halaman di hasil pencarian. Deskripsi yang baik meningkatkan CTR (Click-Through Rate).",
        howToFix: "Tambahkan tag <meta name='description' content='...'> di dalam <head> dengan panjang 120-160 karakter yang relevan dan mengajak pembaca mengklik tautan.",
      });

      // 3. Headings Structure
      const h1Count = headings.filter((h) => h.tag === "H1").length;
      let h1Status: "pass" | "warning" | "error" = "pass";
      let h1Msg = "Halaman memiliki tepat satu tag H1.";
      let h1Earned = 15;
      if (h1Count === 0) {
        h1Status = "error";
        h1Msg = "Tag H1 tidak ditemukan pada halaman.";
        h1Earned = 0;
      } else if (h1Count > 1) {
        h1Status = "warning";
        h1Msg = `Ditemukan ${h1Count} tag H1. Disarankan hanya menggunakan satu H1 utama.`;
        h1Earned = 8;
      }
      checks.push({
        id: "headings",
        name: "Struktur Heading Utama (H1)",
        category: "content",
        status: h1Status,
        score: 15,
        earned: h1Earned,
        message: h1Msg,
        explanation: "Tag H1 mendefinisikan topik utama dari sebuah halaman. Memiliki lebih dari satu atau tidak sama sekali dapat membingungkan algoritma mesin pencari.",
        howToFix: "Gunakan hanya satu tag <h1> per halaman untuk judul utama artikel. Untuk sub-judul, gunakan urutan heading yang tepat (h2, h3, h4).",
      });

      // 4. Canonical URL
      let canonicalStatus: "pass" | "warning" | "error" = "pass";
      let canonicalMsg = "Tag Link Canonical valid terdeteksi.";
      let canonicalEarned = 10;
      if (!canonicalHref) {
        canonicalStatus = "error";
        canonicalMsg = "Tag link canonical tidak ditemukan.";
        canonicalEarned = 0;
      } else if (cleanUrl && !canonicalHref.startsWith("https://")) {
        canonicalStatus = "warning";
        canonicalMsg = "Canonical URL terdeteksi tetapi tidak menggunakan protokol HTTPS yang aman.";
        canonicalEarned = 5;
      }
      checks.push({
        id: "canonical",
        name: "Link Canonical",
        category: "technical",
        status: canonicalStatus,
        score: 10,
        earned: canonicalEarned,
        message: canonicalMsg,
        explanation: "Tag canonical mencegah masalah konten duplikat (duplicate content) dengan memberi tahu Google URL mana yang merupakan versi utama halaman tersebut.",
        howToFix: "Tambahkan tag <link rel='canonical' href='https://domain.com/halaman-utama'> di dalam <head>.",
      });

      // 5. Mobile Viewport
      let viewportStatus: "pass" | "warning" | "error" = "pass";
      let viewportMsg = "Tag meta viewport terdeteksi untuk kesesuaian mobile.";
      let viewportEarned = 10;
      if (!viewportContent) {
        viewportStatus = "error";
        viewportMsg = "Tag meta viewport tidak ditemukan!";
        viewportEarned = 0;
      }
      checks.push({
        id: "viewport",
        name: "Optimasi Mobile (Viewport)",
        category: "technical",
        status: viewportStatus,
        score: 10,
        earned: viewportEarned,
        message: viewportMsg,
        explanation: "Tag viewport memberi tahu browser bagaimana menyesuaikan skala konten dengan ukuran layar ponsel atau tablet. Penting untuk SEO mobile-first indexing Google.",
        howToFix: "Tambahkan tag <meta name='viewport' content='width=device-width, initial-scale=1.0'> ke dalam <head>.",
      });

      // 6. Image Alt Tags
      const missingAltCount = images.filter((img) => !img.hasAlt).length;
      let imgStatus: "pass" | "warning" | "error" = "pass";
      let imgMsg = "Semua gambar memiliki atribut alt yang deskriptif.";
      let imgEarned = 10;
      if (images.length === 0) {
        imgStatus = "pass";
        imgMsg = "Tidak ada tag gambar di halaman ini (lewat audit).";
        imgEarned = 10;
      } else if (missingAltCount > 0) {
        imgStatus = missingAltCount === images.length ? "error" : "warning";
        imgMsg = `${missingAltCount} dari ${images.length} gambar tidak memiliki atribut alt.`;
        imgEarned = missingAltCount === images.length ? 0 : 5;
      }
      checks.push({
        id: "image-alt",
        name: "Atribut Alt Gambar",
        category: "media",
        status: imgStatus,
        score: 10,
        earned: imgEarned,
        message: imgMsg,
        explanation: "Atribut alt mendeskripsikan konten gambar kepada robot mesin pencari dan perangkat pembaca layar untuk penyandang disabilitas (aksesibilitas).",
        howToFix: "Tambahkan atribut alt='Deskripsi Gambar' yang relevan dan mengandung kata kunci di setiap tag <img>.",
      });

      // 7. Schema Structured Data
      let schemaStatus: "pass" | "warning" | "error" = "pass";
      let schemaMsg = `Ditemukan schema structured data (${schemaTypes.join(", ")}).`;
      let schemaEarned = 10;
      if (schemaTypes.length === 0) {
        schemaStatus = "warning";
        schemaMsg = "Structured Data / Schema Markup tidak ditemukan.";
        schemaEarned = 0;
      }
      checks.push({
        id: "schema",
        name: "Schema Structured Data",
        category: "technical",
        status: schemaStatus,
        score: 10,
        earned: schemaEarned,
        message: schemaMsg,
        explanation: "Schema markup membantu mesin pencari memahami konteks data di halaman Anda, berpotensi memicu Rich Snippets (pencarian kaya) di SERP.",
        howToFix: "Gunakan JSON-LD untuk menambahkan metadata terstruktur seperti Product, Article, FAQPage, atau LocalBusiness di halaman Anda.",
      });

      // 8. HTTPS SSL Check
      let sslStatus: "pass" | "warning" | "error" = "pass";
      let sslMsg = "Website menggunakan koneksi HTTPS yang aman.";
      let sslEarned = 5;
      if (cleanUrl) {
        if (!cleanUrl.startsWith("https://")) {
          sslStatus = "error";
          sslMsg = "Koneksi tidak aman! Website menggunakan HTTP non-secure.";
          sslEarned = 0;
        }
      } else {
        sslMsg = "Audit HTTPS dilewati karena menggunakan input teks HTML.";
      }
      checks.push({
        id: "ssl",
        name: "Koneksi Aman (SSL/HTTPS)",
        category: "technical",
        status: sslStatus,
        score: 5,
        earned: sslEarned,
        message: sslMsg,
        explanation: "Protokol HTTPS melindungi integritas dan kerahasiaan data pengguna. Google mengonfirmasi HTTPS sebagai sinyal pemeringkatan SEO resmi.",
        howToFix: "Pasang sertifikat SSL di server hosting Anda dan buat pengalihan otomatis 301 dari HTTP ke HTTPS.",
      });

      // 9. Links Health (Anchor text, Empty Links, Security Target Rel)
      const emptyLinksCount = links.filter((l) => l.isEmpty).length;
      const genericLinksCount = links.filter((l) => l.isGeneric).length;
      const insecureLinksCount = links.filter((l) => l.missingRel).length;
      let linkStatus: "pass" | "warning" | "error" = "pass";
      let linkMsg = "Tautan halaman memiliki anchor text baik dan aman.";
      let linkEarned = 5;

      if (emptyLinksCount > 0 || genericLinksCount > 0 || insecureLinksCount > 0) {
        linkStatus = "warning";
        const issues = [];
        if (emptyLinksCount > 0) issues.push(`${emptyLinksCount} link kosong (#)`);
        if (genericLinksCount > 0) issues.push(`${genericLinksCount} link teks generik`);
        if (insecureLinksCount > 0) issues.push(`${insecureLinksCount} link target="_blank" tanpa rel="noopener"`);
        linkMsg = "Masalah link terdeteksi: " + issues.join(", ") + ".";
        linkEarned = 2;
      }
      checks.push({
        id: "links",
        name: "Kesehatan Link & Navigasi",
        category: "navigation",
        status: linkStatus,
        score: 5,
        earned: linkEarned,
        message: linkMsg,
        explanation: "Google melacak link jangkar (anchor text) untuk memahami hubungan konten. Link target blank tanpa rel='noopener' berisiko pada celah keamanan (tabnabbing) dan performa.",
        howToFix: "Hindari teks link generik seperti 'klik disini'. Berikan label teks deskriptif. Tambahkan rel='noopener' pada link eksternal yang membuka tab baru.",
      });

      // 10. Social Meta / Open Graph
      const hasOgTitle = ogTags.some((t) => t.key === "og:title");
      const hasOgDesc = ogTags.some((t) => t.key === "og:description");
      const hasOgImage = ogTags.some((t) => t.key === "og:image");
      const hasTwitter = twitterTags.length > 0;
      let socialStatus: "pass" | "warning" | "error" = "pass";
      let socialMsg = "Open Graph & Twitter Cards lengkap ditemukan.";
      let socialEarned = 5;

      if (!hasOgTitle || !hasOgDesc || !hasOgImage || !hasTwitter) {
        socialStatus = "warning";
        const missing = [];
        if (!hasOgTitle) missing.push("og:title");
        if (!hasOgDesc) missing.push("og:description");
        if (!hasOgImage) missing.push("og:image");
        if (!hasTwitter) missing.push("Twitter Cards");
        socialMsg = `Meta media sosial tidak lengkap. Kehilangan: ${missing.join(", ")}.`;
        socialEarned = 2;
      }
      checks.push({
        id: "social",
        name: "Meta Tags Sosial (OG & Twitter)",
        category: "technical",
        status: socialStatus,
        score: 5,
        earned: socialEarned,
        message: socialMsg,
        explanation: "Meta tags media sosial (Open Graph & Twitter Cards) memastikan link web Anda terformat dengan menarik ketika dibagikan ke Facebook, X/Twitter, LinkedIn, dan WhatsApp.",
        howToFix: "Gunakan Open Graph generator untuk menyalin markup lengkap tag meta og:title, og:description, og:image, dan twitter:card ke dalam bagian <head> website.",
      });

      // 11. Optional / Bonus Checks (Non-weight metadata check)
      // Robots txt meta
      let robotsStatus: "pass" | "warning" | "error" = "pass";
      let robotsMsg = `Direktif meta robots terdeteksi: "${robotsContent}".`;
      if (!robotsContent) {
        robotsStatus = "warning";
        robotsMsg = "Tidak ada direktif meta robots. Mesin pencari mengasumsikan halaman ini bisa diindeks dan diikuti link-nya.";
      }
      checks.push({
        id: "robots-meta",
        name: "Panduan Crawler (Meta Robots)",
        category: "technical",
        status: robotsStatus,
        score: 0, // Bonus, no weight
        earned: 0,
        message: robotsMsg,
        explanation: "Tag meta robots memberi instruksi spesifik kepada bot pencari apakah mereka boleh mengindeks halaman ini (index/noindex) dan mengikuti tautannya (follow/nofollow).",
        howToFix: "Tambahkan <meta name='robots' content='index, follow'> jika ingin diindeks, atau 'noindex, nofollow' jika halaman bersifat privat.",
      });

      // HTML size check
      let sizeStatus: "pass" | "warning" | "error" = "pass";
      let sizeMsg = `Ukuran berkas HTML baik (${(htmlSize / 1024).toFixed(1)} KB).`;
      if (htmlSize > 150 * 1024) {
        sizeStatus = "warning";
        sizeMsg = `Ukuran berkas HTML besar (${(htmlSize / 1024).toFixed(1)} KB). Risiko pemuatan lambat.`;
      }
      checks.push({
        id: "html-size",
        name: "Ukuran Kode HTML Halaman",
        category: "technical",
        status: sizeStatus,
        score: 0, // Bonus, no weight
        earned: 0,
        message: sizeMsg,
        explanation: "Pemuatan kode HTML awal yang ringan mempermudah bot merayapi situs Anda dengan cepat dan memberikan LCP (Largest Contentful Paint) yang lebih baik bagi pengguna.",
        howToFix: "Lakukan minifikasi kode HTML, hapus inline CSS/JS yang panjang, dan gunakan teknologi kompresi server (Gzip atau Brotli).",
      });

      // Calculate overall score
      const totalPossibleScore = checks.reduce((sum, c) => sum + c.score, 0);
      const totalEarnedScore = checks.reduce((sum, c) => sum + c.earned, 0);
      const overallScore = totalPossibleScore > 0 ? Math.round((totalEarnedScore / totalPossibleScore) * 100) : 0;

      const passedCount = checks.filter((c) => c.status === "pass" && c.score > 0).length;
      const warningCount = checks.filter((c) => c.status === "warning" && c.score > 0).length;
      const errorCount = checks.filter((c) => c.status === "error" && c.score > 0).length;

      setResult({
        score: overallScore,
        passedCount,
        warningCount,
        errorCount,
        checks,
        title: { text: titleText, length: titleLen },
        description: { text: descText, length: descLen },
        headings,
        images,
        links,
        canonical: canonicalHref,
        robots: robotsContent,
        viewport: viewportContent,
        schemaTypes,
        htmlSize,
        textToHtmlRatio,
      });

      setError("");
      setActiveTab("overview");
    } catch (e: any) {
      setError("Gagal melakukan audit konten: " + e.message);
    }
  };

  const fetchAndAuditUrl = async () => {
    if (!url.trim()) {
      setError("Silakan masukkan URL website yang ingin diaudit.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    let fetchedHtml = "";
    let success = false;

    // 1. Try fetching via our server-side function (CORS bypass)
    try {
      const serverRes = await fetchUrlHtml({ data: { url: targetUrl } });
      if (serverRes.success && serverRes.html) {
        fetchedHtml = serverRes.html;
        success = true;
      } else if (serverRes.error) {
        console.warn("Server-side fetch failed:", serverRes.error);
      }
    } catch (err: any) {
      console.warn("Server-side fetch exception:", err);
    }

    // 2. Fallback to client-side CORS Proxies if server function failed
    if (!success) {
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
      ];

      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (response.ok) {
            if (proxy.includes("allorigins")) {
              const data = await response.json();
              if (data.contents) {
                fetchedHtml = data.contents;
                success = true;
                break;
              }
            } else {
              fetchedHtml = await response.text();
              if (fetchedHtml && fetchedHtml.trim().length > 100) {
                success = true;
                break;
              }
            }
          }
        } catch (err) {
          // Fallback to next proxy
        }
      }
    }

    if (success && fetchedHtml) {
      runAudit(fetchedHtml, targetUrl);
    } else {
      setError(
        "Website target menolak permintaan akses (CORS/IP Block). Silakan gunakan tab 'Salin & Tempel HTML Source' untuk mengaudit kode HTML halaman Anda secara langsung dan andal."
      );
    }
    setLoading(false);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:bg-white print:text-black">
      {/* Title block for printing */}
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4">
        <h1 className="font-display text-4xl uppercase">Palugada SEO Audit Report</h1>
        <p className="text-sm font-mono mt-2">
          URL/Target: {inputType === "url" ? url : "HTML Source Code"} | Tanggal: {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* Form Input Header */}
      <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-foreground/10 pb-4 gap-4">
          <div>
            <h3 className="font-display text-xl uppercase tracking-tight">Website SEO Auditor</h3>
            <p className="text-xs text-foreground/50 mt-1">Audit on-page SEO, link, gambar, mobile responsif, dan optimasi teknis halaman secara instan.</p>
          </div>
          
          <div className="flex bg-foreground/5 p-1 rounded-lg self-start sm:self-auto shrink-0 border border-foreground/10">
            <button
              onClick={() => setInputType("html")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer ${
                inputType === "html" ? "bg-foreground text-background shadow-sm" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Paste HTML Source
            </button>
            <button
              onClick={() => setInputType("url")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer ${
                inputType === "url" ? "bg-foreground text-background shadow-sm" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Audit URL Website
            </button>
          </div>
        </div>

        {inputType === "url" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Target Halaman</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://www.namaweb.com/page"
                  className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={fetchAndAuditUrl}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Audit Berjalan..." : "Mulai Audit URL"}
                  </button>
                  <button
                    onClick={loadSampleUrl}
                    className="px-4 h-11 border border-foreground/20 rounded-lg text-xs font-bold uppercase hover:bg-foreground/5 transition-all cursor-pointer"
                  >
                    Contoh
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kode HTML Halaman</label>
                <button
                  onClick={loadSampleHtml}
                  className="text-xs font-mono font-bold text-primary hover:underline"
                >
                  Muat Contoh Kode HTML Bermasalah
                </button>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Salin seluruh source code HTML (Ctrl+U pada halaman target Anda) dan tempel di sini..."
                rows={8}
                className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => runAudit(html)}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer"
            >
              Jalankan SEO Audit Lokal
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg leading-relaxed animate-in fade-in duration-200">
            {error}
          </div>
        )}
      </div>

      {/* Audit Results Dashboard */}
      {result && (
        <div className="space-y-8">
          {/* Header Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Score Ring Gauge */}
            <div className="md:col-span-4 bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Skor SEO On-Page</h4>
              <div className="relative flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    strokeWidth="10"
                    stroke="var(--color-border)"
                    className="opacity-10"
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    strokeWidth="10"
                    stroke={result.score >= 80 ? "oklch(0.728 0.187 152)" : result.score >= 50 ? "#f59e0b" : "oklch(0.6 0.22 27)"}
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * result.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score Number overlay */}
                <div className="absolute text-center">
                  <span className="text-4xl font-display uppercase tracking-tight">{result.score}</span>
                  <span className="text-xs font-mono text-foreground/50 block">dari 100</span>
                </div>
              </div>
              
              <div className="text-xs font-bold uppercase px-3 py-1 rounded bg-foreground/5 border border-foreground/10">
                {result.score >= 80 ? (
                  <span className="text-[#25D366]">Status: Bagus Sekali</span>
                ) : result.score >= 50 ? (
                  <span className="text-amber-500">Status: Butuh Perbaikan</span>
                ) : (
                  <span className="text-destructive">Status: Kritis</span>
                )}
              </div>
            </div>

            {/* Check Breakdown Stats & Priority Fixes */}
            <div className="md:col-span-8 bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Ringkasan Hasil Audit</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#25D366]/5 border border-[#25D366]/20 text-center">
                    <span className="text-2xl font-display block text-[#25D366]">{result.passedCount}</span>
                    <span className="text-[10px] font-mono uppercase text-[#25D366]/80">Lolos</span>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                    <span className="text-2xl font-display block text-amber-500">{result.warningCount}</span>
                    <span className="text-[10px] font-mono uppercase text-amber-500/80">Peringatan</span>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                    <span className="text-2xl font-display block text-destructive">{result.errorCount}</span>
                    <span className="text-[10px] font-mono uppercase text-destructive/80">Isu Kritis</span>
                  </div>
                </div>
              </div>

              {/* PDF & Share action buttons */}
              <div className="flex gap-3 print:hidden">
                <button
                  onClick={printReport}
                  className="flex-1 py-2.5 px-4 bg-foreground text-background hover:bg-foreground/90 transition-all font-bold text-xs uppercase tracking-wider rounded-lg border border-foreground flex items-center justify-center gap-2 cursor-pointer shadow-tactile-sm"
                >
                  <span>🖨️</span> Cetak / Simpan Laporan PDF
                </button>
              </div>
            </div>

          </div>

          {/* Quick Wins / Priority Checklist */}
          {result.errorCount > 0 && (
            <div className="bg-destructive/5 border-2 border-destructive/30 p-6 rounded-2xl space-y-3 print:border-red-400">
              <h4 className="font-display text-sm text-destructive uppercase tracking-wide flex items-center gap-2">
                ⚠️ Tindakan Utama Yang Harus Diperbaiki
              </h4>
              <ul className="text-xs space-y-2 text-foreground/80 list-disc list-inside">
                {result.checks
                  .filter((c) => c.status === "error")
                  .map((check) => (
                    <li key={check.id}>
                      <span className="font-semibold text-foreground">{check.name}: </span>
                      {check.message}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Detailed Audits Tab Selector */}
          <div className="flex border-b border-foreground/10 overflow-x-auto no-scrollbar print:hidden">
            {[
              { id: "overview", label: "Semua Audit" },
              { id: "content", label: "Konten & On-Page" },
              { id: "technical", label: "Teknis & Mobile" },
              { id: "links", label: "Link & Navigasi" },
              { id: "media", label: "Gambar & Media" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-5 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Audit List */}
          <div className="space-y-4">
            {result.checks
              .filter((c) => activeTab === "overview" || c.category === activeTab)
              .map((check) => {
                const isExpanded = expandedCheck === check.id;
                
                let badgeClass = "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20";
                let badgeText = "Lolos";
                if (check.status === "warning") {
                  badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  badgeText = "Peringatan";
                } else if (check.status === "error") {
                  badgeClass = "bg-destructive/10 text-destructive border-destructive/20";
                  badgeText = "Isu Kritis";
                }

                return (
                  <div
                    key={check.id}
                    className="bg-card border-2 border-foreground rounded-2xl shadow-tactile-sm overflow-hidden transition-all"
                  >
                    {/* Accordion Trigger */}
                    <div
                      onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-foreground/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {check.status === "pass" ? "✅" : check.status === "warning" ? "⚠️" : "❌"}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm uppercase tracking-tight">{check.name}</h5>
                          <p className="text-xs text-foreground/60 mt-0.5">{check.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeClass} print:bg-transparent print:border-black`}>
                          {badgeText}
                        </span>
                        {check.score > 0 && (
                          <span className="text-xs font-mono text-foreground/40 shrink-0 print:hidden">
                            {check.earned} / {check.score} pt
                          </span>
                        )}
                        <span className="text-lg font-mono text-foreground/30 print:hidden">{isExpanded ? "−" : "+"}</span>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-3 border-t border-foreground/5 bg-foreground/[0.01] space-y-4 text-xs leading-relaxed animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <h6 className="font-bold uppercase tracking-wider text-foreground/40 text-[10px] mb-1">Mengapa Ini Penting?</h6>
                          <p className="text-foreground/80">{check.explanation}</p>
                        </div>
                        <div>
                          <h6 className="font-bold uppercase tracking-wider text-foreground/40 text-[10px] mb-1">Rekomendasi Perbaikan</h6>
                          <p className="text-foreground/80">{check.howToFix}</p>
                        </div>

                        {/* Extra Audit Specific Details */}
                        {check.id === "title" && result.title.text && (
                          <div className="bg-background border border-foreground/10 rounded-xl p-4 font-mono text-xs">
                            <span className="text-[9px] uppercase text-foreground/40 block mb-1">Konten Tag Title</span>
                            <span className="font-semibold text-foreground/90 select-all">{result.title.text}</span>
                          </div>
                        )}

                        {check.id === "description" && result.description.text && (
                          <div className="bg-background border border-foreground/10 rounded-xl p-4 font-mono text-xs">
                            <span className="text-[9px] uppercase text-foreground/40 block mb-1">Konten Meta Description</span>
                            <span className="text-foreground/80 select-all">{result.description.text}</span>
                          </div>
                        )}

                        {check.id === "headings" && result.headings.length > 0 && (
                          <div className="space-y-2 border border-foreground/10 rounded-xl p-4 bg-background">
                            <span className="text-[9px] font-mono uppercase text-foreground/40 block">Struktur Heading Temuan ({result.headings.length}):</span>
                            <div className="space-y-1 font-mono max-h-48 overflow-y-auto pr-1">
                              {result.headings.map((h, index) => (
                                <div key={index} className="flex gap-2 py-0.5 text-[11px]">
                                  <span className={`font-bold shrink-0 ${h.tag === "H1" ? "text-primary" : "text-foreground/40"}`}>
                                    {h.tag}:
                                  </span>
                                  <span className="text-foreground/80 truncate">{h.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {check.id === "image-alt" && result.images.length > 0 && (
                          <div className="space-y-2 border border-foreground/10 rounded-xl p-4 bg-background">
                            <span className="text-[9px] font-mono uppercase text-foreground/40 block">Daftar Gambar Halaman ({result.images.length}):</span>
                            <div className="space-y-1 font-mono max-h-48 overflow-y-auto pr-1 text-[11px]">
                              {result.images.map((img, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between border-b border-foreground/5 py-1 gap-1">
                                  <span className="text-foreground/60 truncate max-w-sm" title={img.src}>{img.src.split("/").pop() || img.src}</span>
                                  <span className={`font-bold shrink-0 ${img.hasAlt ? "text-[#25D366]" : "text-destructive"}`}>
                                    {img.hasAlt ? `alt: "${img.alt}"` : "❌ Tanpa Alt Tag"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {check.id === "links" && result.links.length > 0 && (
                          <div className="space-y-2 border border-foreground/10 rounded-xl p-4 bg-background">
                            <span className="text-[9px] font-mono uppercase text-foreground/40 block">Analisis Tautan ({result.links.length}):</span>
                            <div className="space-y-1 font-mono max-h-48 overflow-y-auto pr-1 text-[11px]">
                              {result.links.map((link, index) => {
                                const hasIssue = link.isEmpty || link.isGeneric || link.missingRel;
                                return (
                                  <div key={index} className="flex flex-col border-b border-foreground/5 py-1.5">
                                    <div className="flex justify-between gap-4">
                                      <span className="font-semibold text-foreground/80 truncate max-w-xs">{link.text || "(Link Gambar/Kosong)"}</span>
                                      <span className="text-foreground/40 truncate max-w-xs">{link.href}</span>
                                    </div>
                                    {hasIssue && (
                                      <div className="flex gap-2 flex-wrap mt-1">
                                        {link.isEmpty && <span className="text-[9px] font-bold uppercase px-1 bg-destructive/10 text-destructive rounded">Link Kosong</span>}
                                        {link.isGeneric && <span className="text-[9px] font-bold uppercase px-1 bg-amber-500/10 text-amber-500 rounded">Jangkar Generik</span>}
                                        {link.missingRel && <span className="text-[9px] font-bold uppercase px-1 bg-amber-500/10 text-amber-500 rounded">Missing rel="noopener"</span>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Quick Technical Overview Box */}
          <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Informasi Tambahan Dokumen</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-background border border-foreground/10 rounded-xl">
                <span className="text-[10px] text-foreground/40 block">Ukuran HTML</span>
                <span className="font-bold text-foreground">{(result.htmlSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="p-3 bg-background border border-foreground/10 rounded-xl">
                <span className="text-[10px] text-foreground/40 block">Ratio Teks ke HTML</span>
                <span className="font-bold text-foreground">{result.textToHtmlRatio.toFixed(1)}%</span>
              </div>
              <div className="p-3 bg-background border border-foreground/10 rounded-xl">
                <span className="text-[10px] text-foreground/40 block">Schema Terdeteksi</span>
                <span className="font-bold text-foreground truncate block">
                  {result.schemaTypes.length > 0 ? result.schemaTypes.join(", ") : "Tidak Ada"}
                </span>
              </div>
              <div className="p-3 bg-background border border-foreground/10 rounded-xl">
                <span className="text-[10px] text-foreground/40 block">Meta Robots</span>
                <span className="font-bold text-foreground truncate block">
                  {result.robots || "default (index, follow)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
