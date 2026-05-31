import { useState, useEffect } from "react";

export function FlexboxGenerator() {
  const [flexDirection, setFlexDirection] = useState<"row" | "row-reverse" | "column" | "column-reverse">("row");
  const [flexWrap, setFlexWrap] = useState<"nowrap" | "wrap" | "wrap-reverse">("nowrap");
  const [justifyContent, setJustifyContent] = useState<
    "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
  >("flex-start");
  const [alignItems, setAlignItems] = useState<"stretch" | "flex-start" | "flex-end" | "center" | "baseline">("center");
  const [alignContent, setAlignContent] = useState<"stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around">("stretch");
  const [gap, setGap] = useState(10);
  const [itemCount, setItemCount] = useState(4);

  const [cssCode, setCssCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCssCode(
      `display: flex;\nflex-direction: ${flexDirection};\nflex-wrap: ${flexWrap};\njustify-content: ${justifyContent};\nalign-items: ${alignItems};\nalign-content: ${alignContent};\ngap: ${gap}px;`
    );
  }, [flexDirection, flexWrap, justifyContent, alignItems, alignContent, gap]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Flex Direction</label>
            <select
              value={flexDirection}
              onChange={(e: any) => setFlexDirection(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background text-sm"
            >
              <option value="row">row</option>
              <option value="row-reverse">row-reverse</option>
              <option value="column">column</option>
              <option value="column-reverse">column-reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Flex Wrap</label>
            <select
              value={flexWrap}
              onChange={(e: any) => setFlexWrap(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background text-sm"
            >
              <option value="nowrap">nowrap</option>
              <option value="wrap">wrap</option>
              <option value="wrap-reverse">wrap-reverse</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Justify Content</label>
            <select
              value={justifyContent}
              onChange={(e: any) => setJustifyContent(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background text-sm"
            >
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
              <option value="center">center</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
              <option value="space-evenly">space-evenly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Align Items</label>
            <select
              value={alignItems}
              onChange={(e: any) => setAlignItems(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background text-sm"
            >
              <option value="stretch">stretch</option>
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
              <option value="center">center</option>
              <option value="baseline">baseline</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Align Content</label>
            <select
              value={alignContent}
              onChange={(e: any) => setAlignContent(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background text-sm"
            >
              <option value="stretch">stretch</option>
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
              <option value="center">center</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Gap</span>
              <span>{gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={gap}
              onChange={(e) => setGap(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
            <span>Jumlah Item</span>
            <span>{itemCount}</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            value={itemCount}
            onChange={(e) => setItemCount(parseInt(e.target.value))}
            className="w-full accent-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50">CSS Code</label>
          <div className="relative">
            <pre className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
              {cssCode}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex flex-col border border-foreground/10 rounded-2xl bg-foreground/[0.02] p-6 min-h-[350px]">
        <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4 text-center">Preview</span>
        <div
          className="flex-1 w-full bg-background border border-foreground/10 rounded-xl p-4 transition-all min-h-[250px]"
          style={{
            display: "flex",
            flexDirection,
            flexWrap,
            justifyContent,
            alignItems,
            alignContent,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: itemCount }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center w-12 h-12 bg-primary text-background font-mono font-bold text-sm rounded-lg shadow-sm"
              style={{
                height: alignItems === "stretch" && !flexDirection.includes("column") ? "auto" : undefined,
                width: alignItems === "stretch" && flexDirection.includes("column") ? "auto" : undefined,
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
