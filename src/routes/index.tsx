import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolCard } from "@/components/ToolCard";
import { categories, tools, type ToolCategory } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palugada — Apa Lu Mau, Gua Ada." },
      {
        name: "description",
        content:
          "Kumpulan free online tools terlengkap untuk developer, writer, dan kebutuhan harian. JSON formatter, password generator, QR code, dan banyak lagi.",
      },
      { property: "og:title", content: "Palugada — Apa Lu Mau, Gua Ada." },
      {
        property: "og:description",
        content: "Directory tools gratis terlengkap. Tanpa login, langsung pake.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchCat = active === "all" || t.category === active;
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, active]);

  const featured = tools.filter((t) => t.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <header className="relative px-4 pt-16 pb-12 overflow-hidden animate-[entrance_0.6s_var(--ease-out-expo)_both]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-8xl uppercase leading-[0.9] text-balance mb-6">
            Apa Lu Mau,
            <br />
            <span className="text-primary">Gua Ada.</span>
          </h1>
          <p className="max-w-[45ch] mx-auto text-foreground/60 text-lg mb-10 text-pretty">
            Directory tools gratis terlengkap buat developer, writer, dan produktivitas harian.
            Tanpa login, langsung pake.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari tool... (e.g. JSON, Password, QR)"
              aria-label="Cari tool"
              className="w-full h-16 bg-card border-2 border-foreground rounded-xl pl-6 pr-28 text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-foreground/30 shadow-tactile"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-foreground text-background px-4 py-2 rounded-lg font-mono text-sm font-bold pointer-events-none">
              SEARCH
            </div>
          </div>
        </div>
      </header>

      {/* Featured / Populer */}
      <section className="px-4 mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40">
            Populer
          </span>
          <div className="flex-1 h-px bg-foreground/5" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {featured.map((t) => (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-foreground/10 rounded-full text-xs font-medium hover:border-primary transition-colors"
            >
              <span className="font-mono text-primary">{t.icon}</span>
              {t.shortName ?? t.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Category tabs */}
      <section className="px-4 mb-10 animate-[entrance_0.8s_var(--ease-out-expo)_both_200ms]">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 pb-2 justify-start">
          {categories.map((c) => {
            const isActive = active === c.key;
            return (
              <Link
                key={c.key}
                to={c.key === "all" ? "/" : "/categories/$category"}
                params={c.key === "all" ? undefined : { category: c.key.toLowerCase() }}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(c.key);
                }}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${isActive
                  ? "bg-foreground text-background"
                  : "bg-card border border-foreground/10 hover:border-foreground/40"
                  }`}
              >
                {c.name === "Semua" ? "Semua Tools" : c.name}
              </Link>
            );
          })}
        </div>
      </section>

      <main className="px-4 pb-24 max-w-6xl mx-auto animate-[entrance_1s_var(--ease-out-expo)_both_400ms]">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-foreground/50">
            <p className="font-display text-3xl uppercase mb-2">Tool gak ketemu</p>
            <p className="text-sm">Coba kata kunci lain atau pilih kategori berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
