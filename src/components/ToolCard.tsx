import { Link } from "@tanstack/react-router";
import type { Tool } from "@/lib/tools";

const categoryLabel: Record<Tool["category"], string> = {
  Developer: "DEV",
  Text: "TEXT",
  Generators: "GEN",
  Calculators: "CALC",
  Fun: "FUN",
  Time: "TIME",
  Converters: "CONV",
  Image: "IMG",
};

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="group block bg-card border border-foreground/10 p-6 rounded-2xl hover:border-primary transition-all hover:shadow-[0_12px_24px_-8px_rgba(255,77,0,0.15)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary -translate-x-full group-hover:translate-x-0 transition-transform" />
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-mono font-bold text-xl">
          {tool.icon}
        </div>
        <span className="text-[10px] font-mono bg-foreground/5 px-2 py-1 rounded text-foreground/40">
          {categoryLabel[tool.category]}
        </span>
      </div>
      <h3 className="font-display text-xl uppercase mb-2 tracking-tight">
        {tool.shortName ?? tool.name}
      </h3>
      <p className="text-foreground/60 text-sm leading-relaxed mb-6">{tool.description}</p>
      <div className="flex items-center text-xs font-bold text-primary tracking-widest uppercase gap-2">
        Buka Tool <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}
