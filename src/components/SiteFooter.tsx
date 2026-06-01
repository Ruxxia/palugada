import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { trackPWAEvent } from "@/lib/analytics";

export function SiteFooter() {
  const [canInstall, setCanInstall] = useState(false);

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
    console.log(`User response to footer install prompt: ${outcome}`);
    trackPWAEvent("prompt_accepted", { outcome, context: "footer" });
    if (outcome === "accepted") {
      setCanInstall(false);
    }
  };

  return (
    <footer className="bg-foreground text-background/40 py-16 px-4 border-t-8 border-primary">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary p-1 rounded-sm">
              <div className="w-4 h-4 bg-background" />
            </div>
            <span className="font-display text-2xl tracking-tight uppercase text-background">
              Palugada
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Project iseng yang jadi serius buat bantuin netizen Indonesia dapet tools gratis tanpa
            ribet iklan pop-up atau registrasi.
          </p>
        </div>
        <div>
          <h4 className="text-background font-bold text-xs uppercase tracking-widest mb-6">Kategori</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="/#developer" className="hover:text-primary">Developer Tools</a></li>
            <li><a href="/#text" className="hover:text-primary">Text Formatter</a></li>
            <li><a href="/#utility" className="hover:text-primary">Daily Utility</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-background font-bold text-xs uppercase tracking-widest mb-6">Lainnya</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/" className="hover:text-primary">Semua Tools</Link></li>
            <li><Link to="/changelog" className="hover:text-primary">Changelog</Link></li>
            {canInstall && (
              <li>
                <button
                  onClick={handleInstallClick}
                  className="hover:text-primary cursor-pointer text-left font-medium"
                >
                  📥 Install App
                </button>
              </li>
            )}
            <li><a href="/sitemap.xml" className="hover:text-primary">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-mono uppercase tracking-tighter">
          © {new Date().getFullYear()} Palugada Tools |  Developed by <a href="https://sqwerly.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Sqwerly</a>
        </p>
        <p className="text-[10px] font-mono uppercase tracking-tighter">Apa Lu Mau, Gua Ada.</p>
      </div>
    </footer>
  );
}
