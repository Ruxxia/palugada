import { useState, useEffect } from "react";

type UnitType = "length" | "weight" | "temperature" | "area" | "volume";

const conversionRates: Record<Exclude<UnitType, "temperature">, Record<string, number>> = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
  },
  area: {
    m2: 1,
    km2: 1000000,
    cm2: 0.0001,
    hectare: 10000,
    acre: 4046.86,
    sqMile: 2589988.11,
  },
  volume: {
    liter: 1,
    ml: 0.001,
    m3: 1000,
    gallon: 3.78541,
    quart: 0.946353,
    cup: 0.236588,
  },
};

const unitNames: Record<UnitType, Record<string, string>> = {
  length: {
    m: "Meter (m)",
    km: "Kilometer (km)",
    cm: "Centimeter (cm)",
    mm: "Milimeter (mm)",
    mile: "Mil (mile)",
    yard: "Yard (yd)",
    foot: "Kaki (ft)",
    inch: "Inci (in)",
  },
  weight: {
    kg: "Kilogram (kg)",
    g: "Gram (g)",
    mg: "Miligram (mg)",
    pound: "Pound (lb)",
    ounce: "Ounce (oz)",
    ton: "Ton (t)",
  },
  temperature: {
    C: "Celsius (°C)",
    F: "Fahrenheit (°F)",
    K: "Kelvin (K)",
    R: "Reamur (°R)",
  },
  area: {
    m2: "Meter Persegi (m²)",
    km2: "Kilometer Persegi (km²)",
    cm2: "Centimeter Persegi (cm²)",
    hectare: "Hektar (ha)",
    acre: "Ekar (acre)",
    sqMile: "Mil Persegi (sq mile)",
  },
  volume: {
    liter: "Liter (L)",
    ml: "Mililiter (mL)",
    m3: "Meter Kubik (m³)",
    gallon: "Galon (gal)",
    quart: "Quart (qt)",
    cup: "Cup",
  },
};

export function UnitConverter() {
  const [category, setCategory] = useState<UnitType>("length");
  const [value, setValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("m");
  const [result, setResult] = useState<number | null>(null);

  // Set default units when category changes
  useEffect(() => {
    const keys = Object.keys(unitNames[category]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  }, [category]);

  useEffect(() => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setResult(null);
      return;
    }

    if (category === "temperature") {
      // Custom temperature conversions
      if (fromUnit === toUnit) {
        setResult(numValue);
        return;
      }
      let celsius = numValue;
      if (fromUnit === "F") celsius = ((numValue - 32) * 5) / 9;
      else if (fromUnit === "K") celsius = numValue - 273.15;
      else if (fromUnit === "R") celsius = (numValue * 5) / 4;

      let converted = celsius;
      if (toUnit === "F") converted = (celsius * 9) / 5 + 32;
      else if (toUnit === "K") converted = celsius + 273.15;
      else if (toUnit === "R") converted = (celsius * 4) / 5;

      setResult(Number(converted.toFixed(6)));
    } else {
      const fromRate = conversionRates[category][fromUnit];
      const toRate = conversionRates[category][toUnit];
      if (fromRate && toRate) {
        const valInBase = numValue * fromRate;
        const converted = valInBase / toRate;
        setResult(Number(converted.toFixed(6)));
      }
    }
  }, [value, fromUnit, toUnit, category]);

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex gap-2 flex-wrap bg-foreground/5 p-1 rounded-lg">
        {(["length", "weight", "temperature", "area", "volume"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 text-xs font-mono uppercase font-bold rounded-md transition-colors ${
              category === cat ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Dari ({unitNames[category][fromUnit]})</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nilai awal"
                className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="bg-background border border-foreground/15 rounded-lg px-3 py-1 text-sm font-mono"
              >
                {Object.entries(unitNames[category]).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Ke ({unitNames[category][toUnit]})</label>
            <div className="flex gap-2">
              <div className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono min-h-12 flex items-center">
                {result !== null ? result : ""}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="bg-background border border-foreground/15 rounded-lg px-3 py-1 text-sm font-mono"
              >
                {Object.entries(unitNames[category]).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
