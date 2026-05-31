import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categories, tools } from "@/lib/tools";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolCard } from "@/components/ToolCard";

export const Route = createFileRoute("/categories/$category")({
  loader: ({ params }) => {
    const categoryKey = params.category;
    const categoryObj = categories.find(
      (c) => c.key.toLowerCase() === categoryKey.toLowerCase()
    );

    if (!categoryObj || categoryObj.key === "all") {
      throw notFound();
    }

    const categoryTools = tools.filter((t) => t.category === categoryObj.key);
    return { category: categoryObj, categoryTools };
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category;
    const categoryTools = loaderData?.categoryTools;
    const title = category ? `${category.name} — Palugada` : "Kategori — Palugada";
    const description = category
      ? `Kumpulan tool gratis lengkap untuk kategori ${category.name}. Tanpa login, langsung pakai.`
      : "Kumpulan tool gratis lengkap berdasarkan kategori.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/categories/${category?.key ?? ""}` },
        { property: "og:type", content: "website" },
      ],
      links: category ? [{ rel: "canonical", href: `/categories/${category.key}` }] : [],
      scripts: category
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Ada berapa alat gratis yang tersedia di kategori ${category.name}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Ada total ${categoryTools?.length ?? 0} alat gratis di kategori ${category.name} pada Palugada, termasuk ${categoryTools?.slice(0, 3).map((t) => t.name).join(", ")}.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Apakah alat di kategori ${category.name} aman digunakan?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Sangat aman. Semua pemrosesan data dilakukan 100% secara lokal di browser Anda. Kami tidak menyimpan atau mengirim data apa pun ke server kami.`,
                    },
                  },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-6xl uppercase">404</p>
        <p className="mt-2 text-foreground/60">Kategori tidak ditemukan.</p>
        <Link to="/" className="inline-block mt-6 text-primary font-bold uppercase text-sm tracking-widest">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  ),
});

function CategoryPage() {
  const { category, categoryTools } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-24">
        {/* Breadcrumb */}
        <nav className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-10">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-6xl uppercase leading-[0.9] text-balance mb-4">
            {category.name}
          </h1>
          <p className="max-w-[50ch] text-foreground/60 text-base">
            Temukan semua tools yang didesain khusus untuk memudahkan pekerjaan Anda di bidang {category.name.replace(/^[^\w]*/, "")}.
          </p>
        </div>

        {/* Tools Grid */}
        {categoryTools.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 border border-foreground/10 rounded-xl bg-card">
            <p className="font-display text-2xl uppercase mb-2">Belum ada tool</p>
            <p className="text-sm">Silakan kembali lagi nanti untuk pembaruan tools baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        )}

        {/* Other Categories Links */}
        <section className="mt-16 pt-10 border-t border-foreground/10">
          <h2 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-6">
            Kategori Lainnya
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.key !== "all" && c.key.toLowerCase() !== category.key.toLowerCase())
              .map((c) => (
                <Link
                  key={c.key}
                  to="/categories/$category"
                  params={{ category: c.key.toLowerCase() }}
                  className="px-4 py-2 bg-card border border-foreground/10 hover:border-foreground/40 text-xs font-bold uppercase rounded-full tracking-wider transition-colors"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
