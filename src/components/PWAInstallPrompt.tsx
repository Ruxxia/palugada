import { useEffect, useState } from "react";
import { Download, X, Laptop, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker safely
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Palugada ServiceWorker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("Palugada ServiceWorker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Check if already installed / running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 3. Listen for the PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser banner
      e.preventDefault();
      // Store event for triggering later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as any).deferredPrompt = e;
      window.dispatchEvent(new Event("pwa-prompt-available"));

      // Check localStorage for dismissal. If dismissed within last 7 days, don't show prompt.
      const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
      if (dismissedTime) {
        const diff = Date.now() - parseInt(dismissedTime, 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (diff < sevenDays) {
          return;
        }
      }

      // Show custom banner
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for successful app installation
    const handleAppInstalled = () => {
      console.log("Palugada PWA was installed successfully!");
      setIsVisible(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      window.dispatchEvent(new Event("pwa-prompt-installed"));
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    await deferredPrompt.prompt();

    // Wait for the user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Clear saved prompt event
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Persist dismissal for 7 days
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card border-4 border-foreground rounded-2xl p-6 shadow-tactile relative overflow-hidden">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 -z-10 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/60 hover:text-foreground"
          aria-label="Tutup prompt"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Logo container */}
          <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-xl flex items-center justify-center border-2 border-foreground shadow-tactile-sm">
            <svg viewBox="0 0 512 512" className="w-12 h-12">
              <rect x="156" y="156" width="200" height="200" rx="32" fill="#fdfcfb" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-display text-2xl uppercase tracking-wide leading-tight text-foreground">
              Pasang Aplikasi <span className="text-primary">Palugada</span>
            </h3>
            <p className="text-sm text-foreground/75 mt-1 leading-relaxed">
              Dapatkan akses instan ke semua developer tools, generator, dan game secara cepat, langsung dari desktop atau home screen HP lu.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-foreground/60">
              <div className="flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-primary" />
                <span>Support Desktop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Support Mobile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-foreground font-mono text-sm font-bold hover:bg-foreground/5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            NANTI AJA
          </button>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl border-2 border-foreground shadow-tactile-sm font-mono text-sm font-bold hover:-translate-y-0.5 hover:shadow-tactile hover:bg-primary/95 active:translate-y-0.5 active:shadow-tactile-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            PASANG SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}
