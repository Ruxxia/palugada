import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { categories, tools } from "@/lib/tools";
import { version } from "../../package.json";
import { trackPWAEvent } from "@/lib/analytics";
import { SupabaseLoginDialog } from "./SupabaseLoginDialog";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [canInstall, setCanInstall] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const handleOpenLogin = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: "login" | "register" }>;
      const mode = customEvent.detail?.mode || "login";
      setLoginMode(mode);
      setLoginDialogOpen(true);
    };
    window.addEventListener("open-login-dialog", handleOpenLogin as EventListener);
    return () => window.removeEventListener("open-login-dialog", handleOpenLogin as EventListener);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const list = JSON.parse(localStorage.getItem("palugada_bookmarks") || "[]");
        setBookmarks(list);
      } catch (e) { }
    };

    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bookmark_change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bookmark_change", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanInstall(!!(window as any).deferredPrompt);

      const handlePromptAvailable = () => setCanInstall(true);
      const handlePromptInstalled = () => setCanInstall(false);

      window.addEventListener("pwa-prompt-available", handlePromptAvailable);
      window.addEventListener("pwa-prompt-installed", handlePromptInstalled);

      return () => {
        window.removeEventListener("pwa-prompt-available", handlePromptAvailable);
        window.removeEventListener("pwa-prompt-installed", handlePromptInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to header install prompt: ${outcome}`);
    trackPWAEvent("prompt_accepted", { outcome, context: "header" });
    if (outcome === "accepted") {
      setCanInstall(false);
    }
  };

  const bookmarkedTools = tools.filter((t) => bookmarks.includes(t.slug));

  return (
    <>
      <style>{`
        @keyframes float-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        .animate-float-pulse {
          animation: float-pulse 2s infinite ease-in-out;
        }
      `}</style>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative">
          {/* Mobile view: Hamburger Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border-2 border-foreground rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,0.15)] bg-card text-foreground hover:bg-foreground/5 cursor-pointer flex items-center justify-center shrink-0 transition-transform active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,0.15)]"
              aria-label="Toggle Menu"
            >
              <span className="text-xl leading-none">{isMobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>

          {/* Desktop view: Palugada Logo */}
          <Link to="/" className="hidden sm:flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-1.5 rounded-sm">
              <div className="w-5 h-5 bg-background" />
            </div>
            <span className="font-display text-2xl tracking-tight uppercase">Palugada</span>
          </Link>

          <div className="flex items-center gap-6">
            {/* Search Trigger Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
              className="text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer bg-foreground/5 hover:bg-foreground/10 px-2.5 py-1.5 rounded-lg border border-foreground/5 select-none"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Cari</span>
              <kbd className="hidden md:inline-flex bg-background border border-foreground/15 rounded px-1.5 py-0.5 text-[8px] font-mono text-foreground/50 select-none">
                Ctrl+K
              </kbd>
            </button>

            {/* Bookmarks Dropdown (Kept, only icon on mobile) */}
            <div className="relative">
              <button
                onClick={() => setIsBookmarkOpen(!isBookmarkOpen)}
                onBlur={() => setTimeout(() => setIsBookmarkOpen(false), 200)}
                className="text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <span>⭐</span>
                <span className="hidden sm:inline">Bookmarks</span>
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

            {/* Categories Dropdown (Desktop only) */}
            <div className="relative hidden sm:block">
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

            {/* Changelog Link (Desktop only) */}
            <Link
              to="/changelog"
              className="hidden sm:block text-xs font-bold uppercase tracking-wider text-foreground/75 hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
            <div className="hidden sm:block bg-foreground/5 h-8 w-px" />
            <span className="hidden sm:inline text-[10px] font-mono font-medium uppercase tracking-widest text-primary">
              v{version}
            </span>
          </div>
        </div>
      </nav>

      {/* Hamburger Drawer/Overlay for Mobile View */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col p-6 animate-in fade-in duration-200 sm:hidden">
          <div className="flex items-center justify-between pb-6 border-b border-foreground/10">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-primary p-1.5 rounded-sm">
                <div className="w-5 h-5 bg-background" />
              </div>
              <span className="font-display text-2xl tracking-tight uppercase">Palugada</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 border-2 border-foreground rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,0.15)] bg-card text-foreground hover:bg-foreground/5 cursor-pointer flex items-center justify-center shrink-0"
            >
              <span className="text-xl leading-none">✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6">
            {/* Featured Tools Links */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/30 px-1">
                Featured Tools
              </span>
              <div className="flex flex-col gap-2">
                <Link
                  to="/tools/$slug"
                  params={{ slug: "wedding-planner" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3.5 bg-primary/5 border-2 border-primary/30 hover:bg-primary/10 rounded-2xl text-sm font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between shadow-tactile-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">💍</span>
                    <span>Wedding Organizer</span>
                  </span>
                  <span className="text-primary font-bold">➔</span>
                </Link>
                <Link
                  to="/tools/$slug"
                  params={{ slug: "finance-tracker" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3.5 bg-primary/5 border-2 border-primary/30 hover:bg-primary/10 rounded-2xl text-sm font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between shadow-tactile-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">💰</span>
                    <span>Kelola Uang</span>
                  </span>
                  <span className="text-primary font-bold">➔</span>
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/30 px-1">
                Kategori Tools
              </span>
              <div className="grid grid-cols-2 gap-2">
                {categories
                  .filter((c) => c.key !== "all")
                  .map((c) => (
                    <Link
                      key={c.key}
                      to="/categories/$category"
                      params={{ category: c.key.toLowerCase() }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-3 bg-card border-2 border-foreground hover:bg-foreground/5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-colors truncate shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                    >
                      {c.name}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Changelog */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/30 px-1">
                Info & Update
              </span>
              <Link
                to="/changelog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-4 bg-card border-2 border-foreground hover:bg-foreground/5 rounded-2xl text-xs font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
              >
                <span>Changelog</span>
                <span>✨</span>
              </Link>
            </div>
          </div>

          {/* Version Footer */}
          <div className="pt-6 border-t border-foreground/10 text-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/70">
              v{version}
            </span>
          </div>
        </div>
      )}
      <SupabaseLoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} initialMode={loginMode} />
      {canInstall && (
        <button
          onClick={handleInstallClick}
          className="fixed top-18 right-4 z-50 bg-primary text-primary-foreground border-2 border-foreground px-4 py-2.5 rounded-xl shadow-tactile font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer animate-float-pulse hover:animate-none hover:-translate-y-0.5 hover:shadow-tactile-lg active:translate-y-0 active:shadow-tactile transition-all"
        >
          <span>📥</span>
          <span>Install App</span>
        </button>
      )}
    </>
  );
}
