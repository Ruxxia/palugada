import { createFileRoute } from "@tanstack/react-router";
import { tools, categories } from "@/lib/tools";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/changelog", changefreq: "monthly", priority: "0.6" },
          ...categories
            .filter((c) => c.key !== "all")
            .map((c) => ({
              path: `/categories/${c.key.toLowerCase()}`,
              changefreq: "weekly" as const,
              priority: "0.9",
            })),
          ...tools.map((t) => ({
            path: `/tools/${t.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${origin}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
