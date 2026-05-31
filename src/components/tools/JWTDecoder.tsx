import { useState, useEffect } from "react";

function decodeJwtPart(part: string) {
  try {
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    return null;
  }
}

export function JWTDecoder() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [expiryInfo, setExpiryInfo] = useState<{ status: "expired" | "active" | "unknown"; text: string } | null>(null);

  useEffect(() => {
    const trimmed = token.trim();
    if (!trimmed) {
      setHeader(null);
      setPayload(null);
      setError("");
      setExpiryInfo(null);
      return;
    }

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      setError("Token JWT tidak valid. Format JWT harus berupa header.payload.signature");
      setHeader(null);
      setPayload(null);
      setExpiryInfo(null);
      return;
    }

    const decodedHeader = decodeJwtPart(parts[0]);
    const decodedPayload = decodeJwtPart(parts[1]);

    if (!decodedHeader || !decodedPayload) {
      setError("Gagal mendecode bagian JWT. Pastikan token valid.");
      setHeader(null);
      setPayload(null);
      setExpiryInfo(null);
      return;
    }

    setHeader(decodedHeader);
    setPayload(decodedPayload);
    setError("");

    // Calculate expiry
    if (decodedPayload && typeof decodedPayload === "object") {
      const exp = decodedPayload.exp;
      if (typeof exp === "number") {
        const expiryMs = exp * 1000;
        const nowMs = Date.now();
        const dateStr = new Date(expiryMs).toLocaleString("id-ID", { timeZoneName: "short" });
        if (nowMs > expiryMs) {
          setExpiryInfo({
            status: "expired",
            text: `Sudah Kedaluwarsa pada ${dateStr}`,
          });
        } else {
          setExpiryInfo({
            status: "active",
            text: `Aktif (Kedaluwarsa pada ${dateStr})`,
          });
        }
      } else {
        setExpiryInfo({
          status: "unknown",
          text: "Tidak ada klaim exp (expiration time) ditemukan.",
        });
      }
    }
  }, [token]);

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");

  const codeSnippets = {
    js: `// Decode JWT header/payload tanpa external library (Browser/Node)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}`,
    python: `# Python (Standard library decoding)
import base64
import json

def parse_jwt(token):
    try:
        payload_b64 = token.split('.')[1]
        payload_b64 += '=' * (4 - len(payload_b64) % 4) # Fix padding
        decoded_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(decoded_bytes.decode('utf-8'))
    except Exception:
        return None`,
    php: `<?php
// PHP (Decode JWT payload)
function parseJwt($token) {
    try {
        $parts = explode('.', $token);
        $payloadB64 = str_replace(['-', '_'], ['+', '/'], $parts[1]);
        $decoded = base64_decode($payloadB64);
        return json_decode($decoded, true);
    } catch (Exception $e) {
        return null;
    }
}`,
    go: `package main

import (
	"encoding/base64"
	"encoding/json"
	"strings"
)

func parseJwt(token string) (map[string]interface{}, error) {
	parts := strings.Split(token, ".")
	payloadB64 := parts[1]
	
	// Tambah padding jika kurang
	if l := len(payloadB64) % 4; l > 0 {
		payloadB64 += strings.Repeat("=", 4-l)
	}
	
	decoded, err := base64.URLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, err
	}
	
	var data map[string]interface{}
	err = json.Unmarshal(decoded, &data)
	return data, err
}`,
    java: `import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class JwtParser {
    public static String parseJwtPayload(String token) {
        try {
            String[] parts = token.split("\\\\.");
            byte[] decodedBytes = Base64.getUrlDecoder().decode(parts[1]);
            return new String(decodedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }
}`
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">
          Paste Token JWT
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={5}
          className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          aria-label="JWT token input"
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">
          {error}
        </div>
      )}

      {expiryInfo && (
        <div className={`p-4 border rounded-xl flex items-center justify-between text-sm ${
          expiryInfo.status === "expired"
            ? "bg-destructive/5 border-destructive/20 text-destructive"
            : expiryInfo.status === "active"
            ? "bg-primary/5 border-primary/20 text-primary"
            : "bg-foreground/5 border-foreground/10 text-foreground/60"
        }`}>
          <div>
            <span className="font-mono text-xs uppercase tracking-wider opacity-60 block">Status Token</span>
            <span className="font-bold">{expiryInfo.text}</span>
          </div>
        </div>
      )}

      {(header || payload) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Header (Algorithm & Type)</h3>
            <div className="relative">
              <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-80">
                {JSON.stringify(header, null, 2)}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(header, null, 2))}
                className="absolute top-3 right-3 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Payload (Data / Claims)</h3>
            <div className="relative">
              <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-80">
                {JSON.stringify(payload, null, 2)}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}
                className="absolute top-3 right-3 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Implementations */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Implementasi Kode</h3>
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk mendecode token JWT di program kamu tanpa library eksternal.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-1 bg-foreground/5 p-1 rounded-lg self-start">
            {(["js", "python", "php", "go", "java"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-md transition-colors ${
                  activeLang === lang ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {lang === "js" ? "JavaScript" : lang}
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-60 leading-relaxed text-foreground/80">
              {codeSnippets[activeLang]}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(codeSnippets[activeLang])}
              className="absolute top-3 right-3 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
