import { useMemo, useState } from "react";

export function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g)?.length ?? 1) : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    const readMin = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpace, sentences, paragraphs, readMin };
  }, [text]);

  const Stat = ({ label, value }: { label: string; value: number | string }) => (
    <div className="bg-background border border-foreground/10 rounded-lg p-4">
      <div className="font-display text-3xl text-primary leading-none">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mt-2">{label}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Mulai ngetik atau paste teks kamu di sini..."
        className="w-full p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="Kata" value={stats.words} />
        <Stat label="Karakter" value={stats.chars} />
        <Stat label="Tanpa Spasi" value={stats.charsNoSpace} />
        <Stat label="Kalimat" value={stats.sentences} />
        <Stat label="Paragraf" value={stats.paragraphs} />
        <Stat label="Waktu Baca" value={`${stats.readMin}m`} />
      </div>
    </div>
  );
}
