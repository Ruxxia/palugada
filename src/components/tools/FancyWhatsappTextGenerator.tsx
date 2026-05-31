import { useState } from "react";

export function FancyWhatsappTextGenerator() {
  const [text, setText] = useState("Palugada");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Unicode font style maps
  const mapStyle = (str: string, normalAlphabet: string, styledAlphabet: string) => {
    return str
      .split("")
      .map((char) => {
        const idx = normalAlphabet.indexOf(char);
        return idx !== -1 ? styledAlphabet.slice(idx * 2, (idx + 1) * 2) || styledAlphabet[idx] : char;
      })
      .join("");
  };

  const mapStyleSingle = (str: string, normalAlphabet: string, styledAlphabet: string[]) => {
    return str
      .split("")
      .map((char) => {
        const idx = normalAlphabet.indexOf(char);
        return idx !== -1 ? styledAlphabet[idx] : char;
      })
      .join("");
  };

  const styles = [
    {
      name: "Bubble / Bulat",
      transform: (txt: string) => {
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        const bubblesLower = ["ⓐ","ⓑ","ⓒ","ⓓ","ⓔ","ⓕ","ⓖ","ⓗ","ⓘ","ⓙ","ⓚ","ⓛ","ⓜ","ⓝ","ⓞ","ⓟ","ⓠ","ⓡ","ⓢ","ⓣ","ⓤ","ⓥ","ⓦ","ⓧ","ⓨ","ⓩ"];
        const bubblesUpper = ["Ⓐ","Ⓑ","Ⓒ","Ⓓ","Ⓔ","Ⓕ","Ⓖ","Ⓗ","Ⓘ","Ⓙ","Ⓚ","Ⓛ","Ⓜ","Ⓝ","Ⓞ","Ⓟ","Ⓠ","Ⓡ","Ⓢ","Ⓣ","Ⓤ","Ⓥ","Ⓦ","Ⓧ","Ⓨ","Ⓩ"];
        const bubblesNums = ["⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨"];
        let res = mapStyleSingle(txt, lower, bubblesLower);
        res = mapStyleSingle(res, upper, bubblesUpper);
        res = mapStyleSingle(res, nums, bubblesNums);
        return res;
      }
    },
    {
      name: "Squared / Kotak",
      transform: (txt: string) => {
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const sqLower = ["[a]","[b]","[c]","[d]","[e]","[f]","[g]","[h]","[i]","[j]","[k]","[l]","[m]","[n]","[o]","[p]","[q]","[r]","[s]","[t]","[u]","[v]","[w]","[x]","[y]","[z]"];
        const sqUpper = ["🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄄","🄼","🄽","🄾","🄿","🅀","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉"];
        let res = mapStyleSingle(txt, lower, sqLower);
        res = mapStyleSingle(res, upper, sqUpper);
        return res;
      }
    },
    {
      name: "Monospace / Typewriter",
      transform: (txt: string) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const mono = "𝚠𝚡𝚢𝚣𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";
        // Since double byte emojis/unicode characters can be mapped, we will do a map of string values
        return txt.split("").map(c => {
          const idx = chars.indexOf(c);
          return idx !== -1 ? mono.substring(idx * 2, (idx + 1) * 2) : c;
        }).join("");
      }
    },
    {
      name: "Bold Serif",
      transform: (txt: string) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const bold = "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐉𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";
        return txt.split("").map(c => {
          const idx = chars.indexOf(c);
          return idx !== -1 ? bold.substring(idx * 2, (idx + 1) * 2) : c;
        }).join("");
      }
    },
    {
      name: "Italic Serif",
      transform: (txt: string) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const italic = "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍";
        return txt.split("").map(c => {
          const idx = chars.indexOf(c);
          return idx !== -1 ? italic.substring(idx * 2, (idx + 1) * 2) : c;
        }).join("");
      }
    },
    {
      name: "Bold Italic Serif",
      transform: (txt: string) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const boldItalic = "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁";
        return txt.split("").map(c => {
          const idx = chars.indexOf(c);
          return idx !== -1 ? boldItalic.substring(idx * 2, (idx + 1) * 2) : c;
        }).join("");
      }
    },
    {
      name: "Small Caps / Huruf Kecil Kapital",
      transform: (txt: string) => {
        const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const smallCaps = ["ᴀ","ʙ","ᴄ","ᴅ","ᴇ","ғ","ɢ","ʜ","ɪ","ᴊ","ᴋ","ʟ","ᴍ","ɴ","ᴏ","ᴘ","ǫ","ʀ","s","ᴛ","ᴜ","ᴠ","ᴡ","x","ʏ","ᴢ","ᴀ","ʙ","ᴄ","ᴅ","ᴇ","ғ","ɢ","ʜ","ɪ","ᴊ","ᴋ","ʟ","ᴍ","ɴ","ᴏ","ᴘ","ǫ","ʀ","s","ᴛ","ᴜ","ᴠ","ᴡ","x","ʏ","ᴢ"];
        return mapStyleSingle(txt, alphabet, smallCaps);
      }
    },
    {
      name: "Cursive / Sambung",
      transform: (txt: string) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const cursive = "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵";
        return txt.split("").map(c => {
          const idx = chars.indexOf(c);
          return idx !== -1 ? cursive.substring(idx * 2, (idx + 1) * 2) : c;
        }).join("");
      }
    }
  ];

  const copyToClipboard = (val: string, index: number) => {
    navigator.clipboard.writeText(val);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="p-6 border border-foreground/10 rounded-2xl bg-card">
        <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">Tulis Teks Anda</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Ketik teks di sini..."
          className="w-full h-12 px-4 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-primary text-base font-bold"
        />
      </div>

      {/* Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style, idx) => {
          const styledVal = style.transform(text || "Palugada");
          return (
            <div key={idx} className="p-4 border border-foreground/10 rounded-xl bg-card/65 flex justify-between items-center gap-4 hover:border-foreground/20 transition-all">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono text-foreground/45 uppercase mb-1">{style.name}</span>
                <p className="text-base font-mono font-medium truncate text-foreground">{styledVal}</p>
              </div>
              <button
                onClick={() => copyToClipboard(styledVal, idx)}
                className="px-3.5 py-2 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors shrink-0"
              >
                {copiedIndex === idx ? "Copied ✓" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
