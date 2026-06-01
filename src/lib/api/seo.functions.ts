import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchUrlHtml = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      url: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    let targetUrl = data.url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PalugadaSEO/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Server target mengembalikan status HTTP ${response.status}`,
        };
      }

      const html = await response.text();
      return {
        success: true,
        html,
        resolvedUrl: response.url || targetUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Gagal menghubungi server target",
      };
    }
  });
