import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { categories, tools } from "@/lib/tools";
import { version } from "../../package.json";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const list = JSON.parse(localStorage.getItem("palugada_bookmarks") || "[]");
        setBookmarks(list);
      } catch (e) {}
    };

    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bookmark_change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bookmark_change", handleStorageChange);
    };
  }, []);

  const bookmarkedTools = tools.filter((t) => bookmarks.includes(t.slug));

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-1.5 rounded-sm">
            <div className="w-5 h-5 bg-background" />
          </div>
          <span className="hidden sm:inline font-display text-2xl tracking-tight uppercase">Palugada</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Bookmarks Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBookmarkOpen(!isBookmarkOpen)}
              onBlur={() => setTimeout(() => setIsBookmarkOpen(false), 200)}
              className="text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">⭐</span> Bookmarks
              {bookmarks.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                  {bookmarks.length}
                </span>
              )}
            </button>

             {isBookmarkOpen && (
              <div className="absolute right-[-80px] sm:right-0 mt-2 w-56 sm:w-64 max-h-64 overflow-y-auto bg-card border border-foreground/10 rounded-xl p-2 shadow-tactile z-50 flex flex-col gap-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground/30 px-3 py-1.5 border-b border-foreground/5">
                  Saved Tools
                </span>
                {bookmarkedTools.length === 0 ? (
                  <span className="text-xs text-foreground/40 px-3 py-4 text-center">
                    Belum ada bookmark
                  </span>
                ) : (
                  bookmarkedTools.map((t) => (
                    <Link
                      key={t.slug}
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="px-3 py-2 hover:bg-foreground/5 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-colors flex items-center gap-2"
                    >
                      <span className="text-sm shrink-0">{t.icon}</span>
                      <span className="truncate">{t.name}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

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
          {/* Changelog Link */}
          <Link
            to="/changelog"
            className="hidden sm:block text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors"
          >
            Changelog
          </Link>
          <div className="hidden sm:block bg-foreground/5 h-8 w-px" />
          <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-primary">
            v{version}
          </span>
        </div>
      </div>
    </nav>
  );
}
