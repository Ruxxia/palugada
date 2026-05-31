import type { ComponentType } from "react";
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <nav className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-6">
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
