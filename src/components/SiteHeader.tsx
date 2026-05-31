import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-sm">
            <div className="w-5 h-5 bg-background" />
          </div>
          <span className="font-display text-2xl tracking-tight uppercase">Palugada</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-foreground/5 h-8 w-px" />
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-primary">
            v1.0.0
          </span>
        </div>
      </div>
    </nav>
  );
}
