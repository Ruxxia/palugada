import { useState, useEffect } from "react";

function md5(string: string): string {
  function RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue: number) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string: string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  let x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}

async function generateSubtleDigest(algorithm: "SHA-1" | "SHA-256", text: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    return "Error generating hash";
  }
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [md5Hash, setMd5Hash] = useState("");
  const [sha1Hash, setSha1Hash] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");

  useEffect(() => {
    if (!input) {
      setMd5Hash("");
      setSha1Hash("");
      setSha256Hash("");
      return;
    }

    setMd5Hash(md5(input));
    generateSubtleDigest("SHA-1", input).then(setSha1Hash);
    generateSubtleDigest("SHA-256", input).then(setSha256Hash);
  }, [input]);

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");
  const [activeAlgo, setActiveAlgo] = useState<"md5" | "sha1" | "sha256">("sha256");

  const codeSnippets = {
    js: {
      md5: `// Node.js (Built-in crypto)
const crypto = require('crypto');

function getMd5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}`,
      sha1: `// Node.js (Built-in crypto)
const crypto = require('crypto');

function getSha1(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}`,
      sha256: `// Node.js (Built-in crypto)
const crypto = require('crypto');

function getSha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}`
    },
    python: {
      md5: `# Python (Built-in hashlib)
import hashlib

def get_md5(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()`,
      sha1: `# Python (Built-in hashlib)
import hashlib

def get_sha1(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest()`,
      sha256: `# Python (Built-in hashlib)
import hashlib

def get_sha256(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()`
    },
    php: {
      md5: `<?php
// PHP (Built-in md5 function)
function getMd5($text) {
    return md5($text);
}`,
      sha1: `<?php
// PHP (Built-in sha1 function)
function getSha1($text) {
    return sha1($text);
}`,
      sha256: `<?php
// PHP (Built-in hash function)
function getSha256($text) {
    return hash('sha256', $text);
}`
    },
    go: {
      md5: `package main

import (
	"crypto/md5"
	"encoding/hex"
)

func getMd5(text string) string {
	h := md5.New()
	h.Write([]byte(text))
	return hex.EncodeToString(h.Sum(nil))
}`,
      sha1: `package main

import (
	"crypto/sha1"
	"encoding/hex"
)

func getSha1(text string) string {
	h := sha1.New()
	h.Write([]byte(text))
	return hex.EncodeToString(h.Sum(nil))
}`,
      sha256: `package main

import (
	"crypto/sha256"
	"encoding/hex"
)

func getSha256(text string) string {
	h := sha256.New()
	h.Write([]byte(text))
	return hex.EncodeToString(h.Sum(nil))
}`
    },
    java: {
      md5: `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class HashUtil {
    public static String getMd5(String text) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hashBytes = md.digest(text.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}`,
      sha1: `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class HashUtil {
    public static String getSha1(String text) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] hashBytes = md.digest(text.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}`,
      sha256: `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class HashUtil {
    public static String getSha256(String text) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = md.digest(text.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}`
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">
          Teks Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
          placeholder="Tulis atau tempel teks yang ingin di-hash di sini..."
          aria-label="Input text to hash"
        />
      </div>

      <div className="space-y-4">
        {/* MD5 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">MD5</span>
            {md5Hash && (
              <button
                onClick={() => copyToClipboard(md5Hash)}
                className="text-[10px] font-mono uppercase tracking-wider text-primary hover:underline"
              >
                Copy Hash
              </button>
            )}
          </div>
          <div className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background break-all select-all min-h-12 flex items-center">
            {md5Hash || <span className="text-foreground/30">Hasil hash MD5 akan muncul di sini...</span>}
          </div>
        </div>

        {/* SHA-1 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">SHA-1</span>
            {sha1Hash && (
              <button
                onClick={() => copyToClipboard(sha1Hash)}
                className="text-[10px] font-mono uppercase tracking-wider text-primary hover:underline"
              >
                Copy Hash
              </button>
            )}
          </div>
          <div className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background break-all select-all min-h-12 flex items-center">
            {sha1Hash || <span className="text-foreground/30">Hasil hash SHA-1 akan muncul di sini...</span>}
          </div>
        </div>

        {/* SHA-256 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">SHA-256</span>
            {sha256Hash && (
              <button
                onClick={() => copyToClipboard(sha256Hash)}
                className="text-[10px] font-mono uppercase tracking-wider text-primary hover:underline"
              >
                Copy Hash
              </button>
            )}
          </div>
          <div className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background break-all select-all min-h-12 flex items-center">
            {sha256Hash || <span className="text-foreground/30">Hasil hash SHA-256 akan muncul di sini...</span>}
          </div>
        </div>
      </div>

      {/* Code Implementations */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Implementasi Kode</h3>
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk men-generate hash di program kamu.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between flex-wrap gap-2 items-center">
            {/* Algorithm selector */}
            <div className="flex gap-1 bg-foreground/5 p-1 rounded-lg">
              {(["md5", "sha1", "sha256"] as const).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setActiveAlgo(algo)}
                  className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-md transition-colors ${
                    activeAlgo === algo ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex gap-1 bg-foreground/5 p-1 rounded-lg">
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
          </div>

          <div className="relative">
            <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-60 leading-relaxed text-foreground/80">
              {codeSnippets[activeLang][activeAlgo]}
            </pre>
            <button
              onClick={() => copyToClipboard(codeSnippets[activeLang][activeAlgo])}
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
