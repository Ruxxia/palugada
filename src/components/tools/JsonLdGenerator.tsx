import { useState, useEffect } from "react";

type SchemaType = "Website" | "LocalBusiness" | "Article" | "Product" | "Person";

export function JsonLdGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Website");
  const [copied, setCopied] = useState(false);
  const [jsonOutput, setJsonOutput] = useState("");

  // Website State
  const [webName, setWebName] = useState("Palugada");
  const [webUrl, setWebUrl] = useState("https://palugada.sqwerly.com");

  // LocalBusiness State
  const [bizName, setBizName] = useState("Restoran Padang Enak");
  const [bizImage, setBizImage] = useState("https://palugada.sqwerly.com/resto.png");
  const [bizStreet, setBizStreet] = useState("Jl. Sudirman No. 10");
  const [bizLocality, setBizLocality] = useState("Jakarta Selatan");
  const [bizRegion, setBizRegion] = useState("DKI Jakarta");
  const [bizPostal, setBizPostal] = useState("12190");
  const [bizPhone, setBizPhone] = useState("+62-21-5551234");
  const [bizPrice, setBizPrice] = useState("$$");

  // Article State
  const [artHeadline, setArtHeadline] = useState("Cara Menggunakan JSON Formatter");
  const [artImage, setArtImage] = useState("https://palugada.sqwerly.com/article-image.jpg");
  const [artAuthor, setArtAuthor] = useState("Budi Santoso");
  const [artPublisher, setArtPublisher] = useState("Palugada Tech");
  const [artLogo, setArtLogo] = useState("https://palugada.sqwerly.com/logo.png");
  const [artDate, setArtDate] = useState("2026-05-31");

  // Product State
  const [prodName, setProdName] = useState("Keyboard Mechanical Neo");
  const [prodImage, setProdImage] = useState("https://palugada.sqwerly.com/keyboard.jpg");
  const [prodBrand, setProdBrand] = useState("NeoKeys");
  const [prodSku, setProdSku] = useState("NK-87X");
  const [prodPrice, setProdPrice] = useState("1500000");
  const [prodCurrency, setProdCurrency] = useState("IDR");
  const [prodAvail, setProdAvail] = useState("InStock");

  // Person State
  const [perName, setPerName] = useState("Budi Santoso");
  const [perUrl, setPerUrl] = useState("https://budisantoso.me");
  const [perJob, setPerJob] = useState("Lead Software Engineer");
  const [perOrg, setPerOrg] = useState("Palugada");
  const [perSameAs, setPerSameAs] = useState("https://linkedin.com/in/budisantoso");

  useEffect(() => {
    let schema: any = {
      "@context": "https://schema.org"
    };

    if (schemaType === "Website") {
      schema = {
        ...schema,
        "@type": "WebSite",
        "name": webName,
        "url": webUrl
      };
    } else if (schemaType === "LocalBusiness") {
      schema = {
        ...schema,
        "@type": "LocalBusiness",
        "name": bizName,
        "image": bizImage,
        "telephone": bizPhone,
        "priceRange": bizPrice,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": bizStreet,
          "addressLocality": bizLocality,
          "addressRegion": bizRegion,
          "postalCode": bizPostal,
          "addressCountry": "ID"
        }
      };
    } else if (schemaType === "Article") {
      schema = {
        ...schema,
        "@type": "Article",
        "headline": artHeadline,
        "image": [artImage],
        "datePublished": artDate,
        "author": {
          "@type": "Person",
          "name": artAuthor
        },
        "publisher": {
          "@type": "Organization",
          "name": artPublisher,
          "logo": {
            "@type": "ImageObject",
            "url": artLogo
          }
        }
      };
    } else if (schemaType === "Product") {
      schema = {
        ...schema,
        "@type": "Product",
        "name": prodName,
        "image": [prodImage],
        "sku": prodSku,
        "brand": {
          "@type": "Brand",
          "name": prodBrand
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": prodCurrency,
          "price": prodPrice,
          "availability": `https://schema.org/${prodAvail}`
        }
      };
    } else if (schemaType === "Person") {
      schema = {
        ...schema,
        "@type": "Person",
        "name": perName,
        "url": perUrl,
        "jobTitle": perJob,
        "worksFor": {
          "@type": "Organization",
          "name": perOrg
        },
        "sameAs": perSameAs ? perSameAs.split(",").map((s) => s.trim()) : []
      };
    }

    setJsonOutput(JSON.stringify(schema, null, 2));
  }, [
    schemaType,
    webName, webUrl,
    bizName, bizImage, bizStreet, bizLocality, bizRegion, bizPostal, bizPhone, bizPrice,
    artHeadline, artImage, artAuthor, artPublisher, artLogo, artDate,
    prodName, prodImage, prodBrand, prodSku, prodPrice, prodCurrency, prodAvail,
    perName, perUrl, perJob, perOrg, perSameAs
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonOutput}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Form */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tipe Schema</label>
          <select
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value as SchemaType)}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-bold"
          >
            <option value="Website">WebSite (Pencarian Situs)</option>
            <option value="LocalBusiness">Local Business (Bisnis Lokal)</option>
            <option value="Article">Article (Artikel / Berita)</option>
            <option value="Product">Product (Informasi Produk)</option>
            <option value="Person">Person (Profil Individu)</option>
          </select>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-4 pt-4 border-t border-foreground/10 max-h-[450px] overflow-y-auto pr-1">
          {schemaType === "Website" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Website</label>
                <input
                  type="text"
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Website</label>
                <input
                  type="text"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </>
          )}

          {schemaType === "LocalBusiness" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Bisnis</label>
                <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Foto Bisnis</label>
                <input type="text" value={bizImage} onChange={(e) => setBizImage(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">No Telepon</label>
                  <input type="text" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tingkat Harga (e.g. $, $$, $$$)</label>
                  <input type="text" value={bizPrice} onChange={(e) => setBizPrice(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Alamat Jalan</label>
                <input type="text" value={bizStreet} onChange={(e) => setBizStreet(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kota</label>
                  <input type="text" value={bizLocality} onChange={(e) => setBizLocality(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Provinsi</label>
                  <input type="text" value={bizRegion} onChange={(e) => setBizRegion(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kode Pos</label>
                  <input type="text" value={bizPostal} onChange={(e) => setBizPostal(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs" />
                </div>
              </div>
            </>
          )}

          {schemaType === "Article" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Judul Artikel (Headline)</label>
                <input type="text" value={artHeadline} onChange={(e) => setArtHeadline(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Gambar Utama</label>
                <input type="text" value={artImage} onChange={(e) => setArtImage(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Penulis</label>
                  <input type="text" value={artAuthor} onChange={(e) => setArtAuthor(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tanggal Rilis</label>
                  <input type="date" value={artDate} onChange={(e) => setArtDate(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Penerbit</label>
                  <input type="text" value={artPublisher} onChange={(e) => setArtPublisher(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Logo Penerbit</label>
                  <input type="text" value={artLogo} onChange={(e) => setArtLogo(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
            </>
          )}

          {schemaType === "Product" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Produk</label>
                <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Foto Produk</label>
                <input type="text" value={prodImage} onChange={(e) => setProdImage(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Merek (Brand)</label>
                  <input type="text" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">SKU / Model</label>
                  <input type="text" value={prodSku} onChange={(e) => setProdSku(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Harga</label>
                  <input type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Mata Uang</label>
                  <input type="text" value={prodCurrency} onChange={(e) => setProdCurrency(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Ketersediaan</label>
                  <select value={prodAvail} onChange={(e) => setProdAvail(e.target.value)} className="w-full h-11 px-2 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs">
                    <option value="InStock">Tersedia (In Stock)</option>
                    <option value="OutOfStock">Habis (Out of Stock)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {schemaType === "Person" && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Lengkap</label>
                <input type="text" value={perName} onChange={(e) => setPerName(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Personal Website</label>
                <input type="text" value={perUrl} onChange={(e) => setPerUrl(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pekerjaan (Job Title)</label>
                  <input type="text" value={perJob} onChange={(e) => setPerJob(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Organisasi / Perusahaan</label>
                  <input type="text" value={perOrg} onChange={(e) => setPerOrg(e.target.value)} className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Media Sosial (SameAs - pisahkan dengan koma)</label>
                <input type="text" value={perSameAs} onChange={(e) => setPerSameAs(e.target.value)} placeholder="e.g. https://twitter.com/budi, https://github.com/budi" className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* JSON-LD Script Output */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Schema JSON-LD</h3>

          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] leading-relaxed text-foreground/80">
              {`<!-- Masukkan kode script ini di bagian <head> halaman Anda -->\n`}
              {`<script type="application/ld+json">\n`}
              {jsonOutput}
              {`\n</script>`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy JSON-LD"}
          </button>
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
          >
            Tes Rich Results
          </a>
        </div>
      </div>
    </div>
  );
}
