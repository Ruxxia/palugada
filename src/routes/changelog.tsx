import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getToolBySlug, type Tool } from "@/lib/tools";
import changelogData from "@/lib/changelog.json";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Palugada" },
      {
        name: "description",
        content: "Daftar pembaruan dan tools baru yang ditambahkan di platform Palugada.",
      },
      { property: "og:title", content: "Changelog — Palugada" },
      { property: "og:description", content: "Daftar pembaruan dan tools baru di platform Palugada." },
      { property: "og:url", content: "/changelog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/changelog" }],
  }),
  component: Changelog,
});

interface UpdateItem {
  date: string;
  title: string;
  description: string;
  tools: {
    slug: string;
    badge: string;
    details: string;
  }[];
}

function Changelog() {
  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({
    0: false, // first date expanded by default
    1: false, // second date expanded by default
  });

  const toggleExpand = (idx: number) => {
    setExpandedStates((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <SiteHeader />

        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="border-b-2 border-foreground pb-6 mb-12">
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight mb-4">
              Changelog
            </h1>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-[60ch]">
              Catatan pembaruan, perbaikan bug, dan peluncuran tools gratis baru di Palugada. Kami terus menambahkan utilitas baru untuk membantu produktivitas harian Anda.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-12 relative before:absolute before:left-4 md:before:left-1/2 before:top-4 before:bottom-4 before:w-0.5 before:bg-foreground/10">
            {changelogData.map((item, idx) => {
              const isExpanded = !!expandedStates[idx];
              const isEven = idx % 2 === 0;

              // Alternating layout and alignment classes for desktop
              const rowDirectionClass = isEven ? "" : "md:flex-row-reverse";
              const dateColClasses = isEven
                ? "md:pl-0 md:pr-8 md:text-right md:w-1/2"
                : "md:pr-0 md:pl-8 md:text-left md:w-1/2";
              const titleClasses = isEven ? "md:justify-end" : "md:justify-start";
              const descClasses = isEven ? "md:ml-auto" : "md:mr-auto md:ml-0";
              const contentColClasses = isEven
                ? "md:pl-8 md:pr-0 md:w-1/2"
                : "md:pr-8 md:pl-0 md:w-1/2";

              return (
                <div key={idx} className={`relative flex flex-col md:flex-row gap-6 md:gap-12 group ${rowDirectionClass}`}>
                  {/* Time Indicator dot */}
                  <button
                    onClick={() => toggleExpand(idx)}
                    aria-label={isExpanded ? "Collapse section" : "Expand section"}
                    className={`absolute left-4 md:left-1/2 -translate-x-[7px] w-[15px] h-[15px] rounded-full z-10 top-1.5 transition-all duration-300 ${isExpanded
                      ? "bg-primary border-2 border-background scale-110 shadow-[0_0_8px_rgba(255,77,0,0.5)]"
                      : "bg-foreground/30 border-2 border-background hover:bg-primary"
                      }`}
                  />

                  {/* Date column */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className={`pl-10 cursor-pointer select-none group/date ${dateColClasses}`}
                  >
                    <span className="font-mono text-sm text-foreground/40 block mb-1 group-hover/date:text-primary transition-colors">
                      {item.date} <span className="md:hidden text-xs text-primary/70 ml-2">{isExpanded ? "▲ sembunyikan" : "▼ tampilkan"}</span>
                    </span>
                    <h3 className={`font-display text-xl uppercase tracking-tight text-primary flex items-center gap-2 group-hover/date:opacity-90 transition-opacity ${titleClasses}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm text-foreground/60 mt-2 leading-relaxed md:max-w-[40ch] ${descClasses}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Content column */}
                  <div className={`pl-10 space-y-4 transition-all duration-300 ${contentColClasses} ${isExpanded
                    ? "opacity-100 max-h-[1000px] visible"
                    : "opacity-0 max-h-0 invisible overflow-hidden pointer-events-none"
                    }`}>
                    {item.tools.map((t) => {
                      const toolInfo = getToolBySlug(t.slug);
                      return (
                        <div
                          key={t.slug}
                          className="bg-card border border-foreground/10 p-5 rounded-xl hover:border-primary transition-all relative overflow-hidden group/card shadow-[2px_2px_0px_rgba(0,0,0,0.05)]"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary -translate-x-full group-hover/card:translate-x-0 transition-transform" />
                          <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                            <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {t.badge}
                            </span>
                            {toolInfo && (
                              <span className="text-[10px] font-mono text-foreground/30">
                                {toolInfo.icon} {toolInfo.subcategory}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base mb-1.5 flex items-center gap-2 group-hover/card:text-primary transition-colors">
                            {toolInfo?.name || t.slug}
                          </h4>
                          {/* <p className="text-xs text-foreground/60 leading-relaxed mb-4">
                            {t.details}
                          </p> */}
                          {toolInfo && (
                            <Link
                              to="/tools/$slug"
                              params={{ slug: t.slug }}
                              className="inline-flex items-center text-xs font-bold text-primary tracking-wider uppercase gap-1.5 hover:underline"
                            >
                              Buka Tool <span className="translate-y-[-0.5px]">→</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
