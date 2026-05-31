import { type ComponentType, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolCard } from "@/components/ToolCard";
import { getRelatedTools, getToolBySlug, categories } from "@/lib/tools";
import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { WordCounter } from "@/components/tools/WordCounter";
import { CharacterCounter } from "@/components/tools/CharacterCounter";
import { SlugGenerator } from "@/components/tools/SlugGenerator";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";
import { QrGenerator } from "@/components/tools/QrGenerator";
import { AgeCalculator } from "@/components/tools/AgeCalculator";

import { JWTDecoder } from "@/components/tools/JWTDecoder";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { TimestampConverter } from "@/components/tools/TimestampConverter";
import { JsonToCsv } from "@/components/tools/JsonToCsv";
import { CsvToJson } from "@/components/tools/CsvToJson";
import { RegexTester } from "@/components/tools/RegexTester";

import { RandomNumberGenerator } from "@/components/tools/RandomNumberGenerator";
import { RandomStringGenerator } from "@/components/tools/RandomStringGenerator";
import { DiceRoller } from "@/components/tools/DiceRoller";
import { CoinFlip } from "@/components/tools/CoinFlip";
import { CountdownTimer } from "@/components/tools/CountdownTimer";
import { Stopwatch } from "@/components/tools/Stopwatch";
import { UnitConverter } from "@/components/tools/UnitConverter";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";

import { ImageCompressor } from "@/components/tools/ImageCompressor";
import { ImageResizer } from "@/components/tools/ImageResizer";
import { JpgToPng } from "@/components/tools/JpgToPng";
import { PngToJpg } from "@/components/tools/PngToJpg";
import { JpgToWebp } from "@/components/tools/JpgToWebp";
import { WebpToJpg } from "@/components/tools/WebpToJpg";
import { ImageCropper } from "@/components/tools/ImageCropper";
import { ImageRotator } from "@/components/tools/ImageRotator";
import { IndonesianMemeGenerator } from "@/components/tools/IndonesianMemeGenerator";

import { ThrCalculator } from "@/components/tools/ThrCalculator";
import { Pph21Calculator } from "@/components/tools/Pph21Calculator";
import { GajiBersihCalculator } from "@/components/tools/GajiBersihCalculator";
import { CicilanCalculator } from "@/components/tools/CicilanCalculator";
import { MarginCalculator } from "@/components/tools/MarginCalculator";

import { ApiTester } from "@/components/tools/ApiTester";
import { CurlGenerator } from "@/components/tools/CurlGenerator";
import { SqlFormatter } from "@/components/tools/SqlFormatter";
import { XmlFormatter } from "@/components/tools/XmlFormatter";
import { YamlFormatter } from "@/components/tools/YamlFormatter";
import { YamlJsonConverter } from "@/components/tools/YamlJsonConverter";
import { ColorConverter } from "@/components/tools/ColorConverter";

import { BarcodeGenerator } from "@/components/tools/BarcodeGenerator";
import { WifiQrGenerator } from "@/components/tools/WifiQrGenerator";
import { WhatsappLinkGenerator } from "@/components/tools/WhatsappLinkGenerator";
import { WhatsappBulkLinkGenerator } from "@/components/tools/WhatsappBulkLinkGenerator";
import { WhatsappTextFormatter } from "@/components/tools/WhatsappTextFormatter";
import { FancyWhatsappTextGenerator } from "@/components/tools/FancyWhatsappTextGenerator";
import { WhatsappQrGenerator } from "@/components/tools/WhatsappQrGenerator";
import { WhatsappGroupQrGenerator } from "@/components/tools/WhatsappGroupQrGenerator";
import { WhatsappCsLinkGenerator } from "@/components/tools/WhatsappCsLinkGenerator";
import { WhatsappOrderLinkGenerator } from "@/components/tools/WhatsappOrderLinkGenerator";
import { WhatsappStickerMaker } from "@/components/tools/WhatsappStickerMaker";
import { FaqSchemaGenerator } from "@/components/tools/FaqSchemaGenerator";
import { OpenGraphGenerator } from "@/components/tools/OpenGraphGenerator";
import { JsonLdGenerator } from "@/components/tools/JsonLdGenerator";
import { MetaTagGenerator } from "@/components/tools/MetaTagGenerator";
import { RobotsGenerator } from "@/components/tools/RobotsGenerator";
import { SitemapGenerator } from "@/components/tools/SitemapGenerator";

import { ImageWatermark } from "@/components/tools/ImageWatermark";
import { ImageFlip } from "@/components/tools/ImageFlip";
import { ImageBlur } from "@/components/tools/ImageBlur";
import { ImageGrayscale } from "@/components/tools/ImageGrayscale";
import { ImageMetadataViewer } from "@/components/tools/ImageMetadataViewer";
import { ImageColorPicker } from "@/components/tools/ImageColorPicker";
import { SvgOptimizer } from "@/components/tools/SvgOptimizer";

import { CssGradientGenerator } from "@/components/tools/CssGradientGenerator";
import { BoxShadowGenerator } from "@/components/tools/BoxShadowGenerator";
import { BorderRadiusGenerator } from "@/components/tools/BorderRadiusGenerator";
import { FlexboxGenerator } from "@/components/tools/FlexboxGenerator";
import { CssGridGenerator } from "@/components/tools/CssGridGenerator";

import { DiscountCalculator } from "@/components/tools/DiscountCalculator";
import { HargaJualCalculator } from "@/components/tools/HargaJualCalculator";
import { ProfitCalculator } from "@/components/tools/ProfitCalculator";
import { RoiCalculator } from "@/components/tools/RoiCalculator";
import { CashbackCalculator } from "@/components/tools/CashbackCalculator";
import { KomisiSalesCalculator } from "@/components/tools/KomisiSalesCalculator";
import { FeeShopeeCalculator } from "@/components/tools/FeeShopeeCalculator";
import { FeeTokopediaCalculator } from "@/components/tools/FeeTokopediaCalculator";
import { FeeTikTokShopCalculator } from "@/components/tools/FeeTikTokShopCalculator";
import { KprCalculator } from "@/components/tools/KprCalculator";
import { BungaPinjamanCalculator } from "@/components/tools/BungaPinjamanCalculator";
import { DepositoCalculator } from "@/components/tools/DepositoCalculator";
import { TabunganCalculator } from "@/components/tools/TabunganCalculator";
import { BmiCalculator } from "@/components/tools/BmiCalculator";
import { BmrCalculator } from "@/components/tools/BmrCalculator";
import { KaloriCalculator } from "@/components/tools/KaloriCalculator";
import { BeratIdealCalculator } from "@/components/tools/BeratIdealCalculator";
import { IpkCalculator } from "@/components/tools/IpkCalculator";
import { NilaiAkhirCalculator } from "@/components/tools/NilaiAkhirCalculator";
import { RataRataNilaiCalculator } from "@/components/tools/RataRataNilaiCalculator";
import { ZakatProfesiCalculator } from "@/components/tools/ZakatProfesiCalculator";
import { ZakatMalCalculator } from "@/components/tools/ZakatMalCalculator";
import { FidyahCalculator } from "@/components/tools/FidyahCalculator";
import { WarisCalculator } from "@/components/tools/WarisCalculator";

import { ImageToPdf } from "@/components/tools/ImageToPdf";
import { PdfToImage } from "@/components/tools/PdfToImage";
import { PdfMerge } from "@/components/tools/PdfMerge";
import { PdfSplit } from "@/components/tools/PdfSplit";
import { PdfRotate } from "@/components/tools/PdfRotate";
import { PdfPageExtractor } from "@/components/tools/PdfPageExtractor";

const toolComponents: Record<string, ComponentType> = {
  "json-formatter": JsonFormatter,
  "uuid-generator": UuidGenerator,
  base64: Base64Tool,
  "word-counter": WordCounter,
  "character-counter": CharacterCounter,
  "slug-generator": SlugGenerator,
  "password-generator": PasswordGenerator,
  "qr-generator": QrGenerator,
  "age-calculator": AgeCalculator,
  "jwt-decoder": JWTDecoder,
  "hash-generator": HashGenerator,
  "timestamp-converter": TimestampConverter,
  "json-to-csv": JsonToCsv,
  "csv-to-json": CsvToJson,
  "regex-tester": RegexTester,
  "random-number-generator": RandomNumberGenerator,
  "random-string-generator": RandomStringGenerator,
  "dice-roller": DiceRoller,
  "coin-flip": CoinFlip,
  "countdown-timer": CountdownTimer,
  "stopwatch": Stopwatch,
  "unit-converter": UnitConverter,
  "percentage-calculator": PercentageCalculator,
  "image-compressor": ImageCompressor,
  "image-resizer": ImageResizer,
  "jpg-to-png": JpgToPng,
  "png-to-jpg": PngToJpg,
  "jpg-to-webp": JpgToWebp,
  "webp-to-jpg": WebpToJpg,
  "image-cropper": ImageCropper,
  "image-rotator": ImageRotator,
  "indonesian-meme-generator": IndonesianMemeGenerator,
  "kalkulator-thr": ThrCalculator,
  "kalkulator-pph21": Pph21Calculator,
  "kalkulator-gaji-bersih": GajiBersihCalculator,
  "kalkulator-cicilan": CicilanCalculator,
  "kalkulator-margin-jualan": MarginCalculator,
  "api-tester": ApiTester,
  "curl-generator": CurlGenerator,
  "sql-formatter": SqlFormatter,
  "xml-formatter": XmlFormatter,
  "yaml-formatter": YamlFormatter,
  "yaml-json-converter": YamlJsonConverter,
  "color-converter": ColorConverter,
  "barcode-generator": BarcodeGenerator,
  "wifi-qr-generator": WifiQrGenerator,
  "whatsapp-link-generator": WhatsappLinkGenerator,
  "whatsapp-bulk-link": WhatsappBulkLinkGenerator,
  "whatsapp-text-formatter": WhatsappTextFormatter,
  "fancy-whatsapp-text": FancyWhatsappTextGenerator,
  "whatsapp-qr-generator": WhatsappQrGenerator,
  "whatsapp-group-qr": WhatsappGroupQrGenerator,
  "whatsapp-cs-link": WhatsappCsLinkGenerator,
  "whatsapp-order-link": WhatsappOrderLinkGenerator,
  "whatsapp-sticker-maker": WhatsappStickerMaker,
  "faq-schema-generator": FaqSchemaGenerator,
  "open-graph-generator": OpenGraphGenerator,
  "json-ld-generator": JsonLdGenerator,
  "meta-tag-generator": MetaTagGenerator,
  "robots-txt-generator": RobotsGenerator,
  "sitemap-generator": SitemapGenerator,
  "image-watermark": ImageWatermark,
  "image-flip": ImageFlip,
  "image-blur": ImageBlur,
  "image-grayscale": ImageGrayscale,
  "image-metadata-viewer": ImageMetadataViewer,
  "image-color-picker": ImageColorPicker,
  "svg-optimizer": SvgOptimizer,
  "kalkulator-diskon": DiscountCalculator,
  "kalkulator-harga-jual": HargaJualCalculator,
  "kalkulator-profit": ProfitCalculator,
  "kalkulator-roi": RoiCalculator,
  "kalkulator-cashback": CashbackCalculator,
  "kalkulator-komisi-sales": KomisiSalesCalculator,
  "kalkulator-fee-shopee": FeeShopeeCalculator,
  "kalkulator-fee-tokopedia": FeeTokopediaCalculator,
  "kalkulator-fee-tiktok-shop": FeeTikTokShopCalculator,
  "kalkulator-kpr": KprCalculator,
  "kalkulator-bunga-pinjaman": BungaPinjamanCalculator,
  "kalkulator-deposito": DepositoCalculator,
  "kalkulator-tabungan": TabunganCalculator,
  "kalkulator-bmi": BmiCalculator,
  "kalkulator-bmr": BmrCalculator,
  "kalkulator-kalori": KaloriCalculator,
  "kalkulator-berat-ideal": BeratIdealCalculator,
  "kalkulator-ipk": IpkCalculator,
  "kalkulator-nilai-akhir": NilaiAkhirCalculator,
  "kalkulator-rata-rata-nilai": RataRataNilaiCalculator,
  "kalkulator-zakat-profesi": ZakatProfesiCalculator,
  "kalkulator-zakat-mal": ZakatMalCalculator,
  "kalkulator-fidyah": FidyahCalculator,
  "kalkulator-waris": WarisCalculator,
  "css-gradient-generator": CssGradientGenerator,
  "box-shadow-generator": BoxShadowGenerator,
  "border-radius-generator": BorderRadiusGenerator,
  "flexbox-generator": FlexboxGenerator,
  "css-grid-generator": CssGridGenerator,
  "image-to-pdf": ImageToPdf,
  "pdf-to-image": PdfToImage,
  "pdf-merge": PdfMerge,
  "pdf-split": PdfSplit,
  "pdf-rotate": PdfRotate,
  "pdf-page-extractor": PdfPageExtractor,
};

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getToolBySlug(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => {
    const tool = loaderData?.tool;
    const title = tool ? `${tool.name} — Palugada` : "Tool — Palugada";
    const description = tool?.description ?? "Free online tool by Palugada.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/tools/${tool?.slug ?? ""}` },
        { property: "og:type", content: "website" },
      ],
      links: tool ? [{ rel: "canonical", href: `/tools/${tool.slug}` }] : [],
      scripts: tool
        ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: tool.name,
              description: tool.description,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: tool.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          },
        ]
        : [],
    };
  },
  component: ToolPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">Tool tidak bisa dimuat: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-6xl uppercase">404</p>
        <p className="mt-2 text-foreground/60">Tool tidak ditemukan.</p>
        <Link to="/" className="inline-block mt-6 text-primary font-bold uppercase text-sm tracking-widest">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  ),
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const related = getRelatedTools(tool.slug);
  const ToolComponent = toolComponents[tool.slug];

  const catObj = categories.find((c) => c.key === tool.category);
  const categoryName = catObj ? catObj.name : tool.category;

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://palugada.sqwerly.com/tools/${tool.slug}`;
  const embedCode = `<a href="${shareUrl}" target="_blank">Gunakan ${tool.name} Gratis di Palugada</a>`;

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <nav className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-6 flex flex-wrap items-center">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link
            to="/categories/$category"
            params={{ category: tool.category.toLowerCase() }}
            className="hover:text-primary"
          >
            {categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/60">{tool.subcategory}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{tool.name}</span>
        </nav>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-mono font-bold text-2xl shrink-0">
            {tool.icon}
          </div>
          <div>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight leading-none">
              {tool.name}
            </h1>
            <p className="text-foreground/60 mt-2 text-pretty">{tool.longDescription}</p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-card border-2 border-foreground rounded-2xl p-6 md:p-8 shadow-tactile">
          {ToolComponent ? <ToolComponent /> : <p>Tool sedang disiapkan.</p>}
        </div>

        {/* Share & Embed (Backlink Generator Hack) */}
        <section className="mt-16 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-display text-2xl uppercase tracking-tight">Bagikan Tool Ini</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Bantu teman atau kolega Anda dengan membagikan alat ini. Cepat, gratis, dan tanpa registrasi.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(shareUrl, setCopiedUrl)}
                  className="px-5 h-11 bg-foreground text-background text-xs font-bold uppercase rounded-lg tracking-wider hover:opacity-90 transition-opacity"
                >
                  {copiedUrl ? "Copied Link!" : "Salin Link URL"}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Coba tool ${tool.name} gratis di Palugada: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 h-11 bg-[#25D366] text-white text-xs font-bold uppercase rounded-lg tracking-wider flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Rekomendasi tool gratis ${tool.name} dari Palugada!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 h-11 bg-[#1DA1F2] text-white text-xs font-bold uppercase rounded-lg tracking-wider flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  Twitter / X
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-2xl uppercase tracking-tight">Sematkan di Website Anda</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Pasang backlink HTML di blog atau web resource Anda agar pengunjung Anda bisa langsung mengakses alat ini.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={embedCode}
                  className="flex-1 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono text-foreground/60 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(embedCode, setCopiedEmbed)}
                  className="px-4 bg-foreground text-background text-xs font-bold uppercase rounded-lg tracking-wider hover:opacity-90 transition-opacity shrink-0"
                >
                  {copiedEmbed ? "Copied!" : "Salin"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="font-display text-3xl uppercase tracking-tight mb-6">FAQ</h2>
          <div className="space-y-3">
            {tool.faqs.map((f: { q: string; a: string }, i: number) => (
              <details
                key={i}
                className="group bg-card border border-foreground/10 rounded-xl p-5 open:border-primary/40"
              >
                <summary className="cursor-pointer font-semibold flex items-center justify-between list-none">
                  {f.q}
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-foreground/70 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl uppercase tracking-tight mb-6">
              Related <span className="text-primary">Tools</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
