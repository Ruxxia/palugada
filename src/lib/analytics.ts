declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-ZZBXNLB87Z";

/**
 * Check if the application is running in PWA (standalone) mode.
 */
export const isPWA = (): boolean => {
  if (typeof window === "undefined") return false;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isSafariStandalone = (window.navigator as any).standalone === true;
  const isAndroidTWA = document.referrer.includes("android-app://");

  return isStandalone || isSafariStandalone || isAndroidTWA;
};

/**
 * Initialize Google Analytics (gtag.js) script dynamically on the client side.
 */
export const initGA = () => {
  if (typeof window === "undefined") return;

  // Avoid duplicate scripts
  if (window.gtag) return;

  // Add the Google Analytics tag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  const gtagFunc = (...args: any[]) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtagFunc;

  // Configure GA4
  gtagFunc("js", new Date());
  gtagFunc("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // We handle SPA page views manually via trackPageView
    pwa_mode: isPWA() ? "standalone" : "browser",
  });

  // Set persistent user properties
  gtagFunc("set", "user_properties", {
    pwa_mode: isPWA() ? "standalone" : "browser",
  });
};

/**
 * Track page view events for client-side routing.
 */
export const trackPageView = (path: string) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag!("event", "page_view", {
    page_path: path,
    page_title: document.title,
    pwa_mode: isPWA() ? "standalone" : "browser",
  });
};

/**
 * Track custom events with PWA context.
 */
export const trackEvent = (action: string, params?: Record<string, any>) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag!("event", action, {
    ...params,
    pwa_mode: isPWA() ? "standalone" : "browser",
  });
};

/**
 * Track when a tool is loaded or accessed by the user.
 */
export const trackToolAccess = (toolSlug: string, toolName: string) => {
  trackEvent("tool_accessed", {
    tool_slug: toolSlug,
    tool_name: toolName,
  });
};

/**
 * Track when a PWA install prompt is shown, accepted, dismissed, or installed.
 */
export const trackPWAEvent = (
  action: "prompt_shown" | "prompt_accepted" | "prompt_dismissed" | "installed",
  details?: Record<string, any>
) => {
  trackEvent(`pwa_${action}`, {
    ...details,
  });
};
