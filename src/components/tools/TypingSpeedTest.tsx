import { useState, useEffect, useRef } from "react";

const QUOTES = [
  "Teknologi yang baik adalah teknologi yang tidak terlihat oleh pengguna karena bekerja begitu mulus.",
  "Keberhasilan bukanlah akhir, kegagalan bukanlah hal yang fatal: keberanian untuk terus berjuanglah yang terpenting.",
  "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia.",
  "Jangan takut berjalan lambat, takutlah jika Anda hanya berdiri diam di tempat tanpa ada kemajuan.",
  "Kreativitas adalah kecerdasan yang sedang bersenang-senang mengeksplorasi ide-ide baru.",
  "Cara terbaik untuk memprediksi masa depan adalah dengan menciptakan masa depan itu sendiri.",
  "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang Anda lakukan.",
];

export function TypingSpeedTest() {
  const [quote, setQuote] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeTest = () => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    setInputVal("");
    setStartTime(null);
    setTimeLeft(30);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    initializeTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer loop
  useEffect(() => {
    if (startTime !== null && timeLeft > 0 && !isFinished) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isFinished]);

  const finishTest = () => {
    setIsFinished(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (startTime === null) {
      setStartTime(Date.now());
    }

    // Measure errors
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== quote[i]) {
        errors++;
      }
    }
    setErrorCount(errors);

    // Calculate live Accuracy
    const totalTyped = val.length;
    const correct = totalTyped - errors;
    const acc = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;
    setAccuracy(acc);

    // Calculate live WPM
    if (startTime !== null) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0) {
        const words = correct / 5;
        setWpm(Math.round(words / elapsedMinutes));
      }
    }

    setInputVal(val);

    // Finish test early if typing matches full quote
    if (val === quote) {
      finishTest();
    }
  };

  // Generate character list for rich visual feedback
  const renderQuoteChars = () => {
    return quote.split("").map((char, index) => {
      let colorClass = "text-foreground/45";
      let cursorClass = "";

      if (index < inputVal.length) {
        colorClass = inputVal[index] === char ? "text-green-500 font-bold" : "text-destructive font-bold bg-destructive/10";
      } else if (index === inputVal.length) {
        cursorClass = "border-l-2 border-primary animate-pulse";
      }

      return (
        <span key={index} className={`${colorClass} ${cursorClass} font-mono text-sm md:text-base transition-colors`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Waktu Tersisa</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{timeLeft}s</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Kecepatan (WPM)</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{wpm}</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Akurasi</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{accuracy}%</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Kesalahan</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-destructive">{errorCount}</span>
          </div>
        </div>

        {/* Visual Quotes Box */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="p-5 bg-background border border-foreground/10 rounded-lg min-h-[100px] flex flex-wrap gap-x-0.5 gap-y-1 cursor-text select-none leading-relaxed"
        >
          {renderQuoteChars()}
        </div>

        {/* Real hidden/overlay input */}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          disabled={isFinished}
          placeholder="Mulai mengetik di sini..."
          className="w-full h-11 px-4 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary font-mono"
        />

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initializeTest}
            className="flex-1 h-11 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
          >
            🔄 Ulangi Tes
          </button>
        </div>

        {/* Finished Modal overlay */}
        {isFinished && (
          <div className="p-6 bg-green-500/10 border border-green-500/25 rounded-lg text-center space-y-3">
            <span className="text-sm font-bold text-green-600 dark:text-green-400 font-mono uppercase tracking-wider">
              🎉 Tes Kecepatan Mengetik Selesai!
            </span>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-md mx-auto">
              Anda meraih skor kecepatan mengetik sebesar <strong>{wpm} WPM</strong> dengan akurasi <strong>{accuracy}%</strong>. Bagus sekali!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
