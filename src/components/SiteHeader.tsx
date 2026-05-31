import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { categories } from "@/lib/tools";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-sm">
            <div className="w-5 h-5 bg-background" />
          </div>
          <span className="font-display text-2xl tracking-tight uppercase">Palugada</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              className="text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              Categories
              <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-foreground/10 rounded-xl p-2 shadow-tactile z-50 flex flex-col gap-1">
                {categories
                  .filter((c) => c.key !== "all")
                  .map((c) => (
                    <Link
                      key={c.key}
                      to="/categories/$category"
                      params={{ category: c.key.toLowerCase() }}
                      className="px-4 py-2 hover:bg-foreground/5 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-foreground/5 h-8 w-px" />
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-primary">
            v1.0.0
          </span>
        </div>
      </div>
    </nav>
  );
}
