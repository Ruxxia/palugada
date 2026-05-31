import { useState } from "react";

interface HeirShare {
  name: string;
  fractionLabel: string;
  percent: number;
  amount: number;
  note: string;
}

export function WarisCalculator() {
  const [totalEstate, setTotalEstate] = useState<number>(100000000); // 100 jt default
  const [debts, setDebts] = useState<number>(0);
  const [spouseType, setSpouseType] = useState<"none" | "husband" | "wife">("none");
  const [hasFather, setHasFather] = useState<boolean>(false);
  const [hasMother, setHasMother] = useState<boolean>(false);
  const [numSons, setNumSons] = useState<number>(0);
  const [numDaughters, setNumDaughters] = useState<number>(0);

  const calculateInheritance = () => {
    const netEstate = Math.max(0, totalEstate - debts);
    if (netEstate <= 0) return { netEstate, heirs: [] as HeirShare[], errors: "Harta bersih warisan habis/nol." };

    const heirs: HeirShare[] = [];
    const hasChildren = numSons > 0 || numDaughters > 0;

    // Fractions trackers
    let husbandShare = 0;
    let wifeShare = 0;
    let fatherShare = 0;
    let motherShare = 0;

    // Notes trackers
    let husbandNote = "";
    let wifeNote = "";
    let fatherNote = "";
    let motherNote = "";

    // 1. Ashabul Furud calculations
    // Husband (Suami)
    if (spouseType === "husband") {
      if (hasChildren) {
        husbandShare = 1 / 4;
        husbandNote = "Mendapat 1/4 karena pewaris memiliki anak/cucu.";
      } else {
        husbandShare = 1 / 2;
        husbandNote = "Mendapat 1/2 karena pewaris tidak memiliki anak/cucu.";
      }
    }

    // Wife (Istri)
    if (spouseType === "wife") {
      if (hasChildren) {
        wifeShare = 1 / 8;
        wifeNote = "Mendapat 1/8 karena pewaris memiliki anak/cucu.";
      } else {
        wifeShare = 1 / 4;
        wifeNote = "Mendapat 1/4 karena pewaris tidak memiliki anak/cucu.";
      }
    }

    // Father (Ayah)
    if (hasFather) {
      if (numSons > 0) {
        fatherShare = 1 / 6;
        fatherNote = "Mendapat 1/6 karena pewaris memiliki anak laki-laki.";
      } else if (numDaughters > 0) {
        fatherShare = 1 / 6; // Will get Asabah later if there is residue
        fatherNote = "Mendapat 1/6 (fardh) + sisa asabah karena pewaris hanya memiliki anak perempuan.";
      } else {
        fatherShare = 0; // Father acts as full Asabah
        fatherNote = "Mendapat sisa harta (asabah) karena pewaris tidak memiliki anak.";
      }
    }

    // Mother (Ibu)
    if (hasMother) {
      if (hasChildren) {
        motherShare = 1 / 6;
        motherNote = "Mendapat 1/6 karena pewaris memiliki anak.";
      } else {
        motherShare = 1 / 3;
        motherNote = "Mendapat 1/3 karena pewaris tidak memiliki anak.";
      }
    }

    // Total fixed shares
    let totalFixedShares = husbandShare + wifeShare + fatherShare + motherShare;

    // Check Aul (Fractions total > 1)
    let aulFactor = 1;
    if (totalFixedShares > 1 && !hasChildren && numSons === 0 && numDaughters === 0) {
      // Simple Aul scaling
      aulFactor = totalFixedShares;
    }

    // Assign final values to Ashabul Furud based on fixed shares
    if (spouseType === "husband" && husbandShare > 0) {
      const share = husbandShare / aulFactor;
      heirs.push({
        name: "Suami",
        fractionLabel: `${husbandShare === 1/2 ? "1/2" : "1/4"}`,
        percent: share * 100,
        amount: share * netEstate,
        note: husbandNote,
      });
    }

    if (spouseType === "wife" && wifeShare > 0) {
      const share = wifeShare / aulFactor;
      heirs.push({
        name: "Istri",
        fractionLabel: `${wifeShare === 1/4 ? "1/4" : "1/8"}`,
        percent: share * 100,
        amount: share * netEstate,
        note: wifeNote,
      });
    }

    if (hasMother && motherShare > 0) {
      const share = motherShare / aulFactor;
      heirs.push({
        name: "Ibu",
        fractionLabel: `${motherShare === 1/3 ? "1/3" : "1/6"}`,
        percent: share * 100,
        amount: share * netEstate,
        note: motherNote,
      });
    }

    // For Father, if he got a fixed 1/6
    let fatherFinalShare = 0;
    if (hasFather && fatherShare > 0) {
      fatherFinalShare = fatherShare / aulFactor;
    }

    // Calculate residue (Asabah)
    const allocatedFixedFraction = (husbandShare + wifeShare + fatherShare + motherShare) / aulFactor;
    let residueFraction = Math.max(0, 1 - allocatedFixedFraction);

    // Distribution of Residue (Asabah)
    // Case A: Father inherits residue if no children, or if only daughters present
    if (hasFather && (numSons === 0)) {
      if (numDaughters > 0) {
        // Father gets 1/6 + residue after daughters take their share
        // Daughters share is fixed: 1/2 (if 1) or 2/3 (if >= 2)
        const daughtersFraction = numDaughters === 1 ? 1 / 2 : 2 / 3;
        const availableForResidue = Math.max(0, 1 - (husbandShare + wifeShare + fatherShare + motherShare + daughtersFraction));
        fatherFinalShare += availableForResidue;
        residueFraction = daughtersFraction; // Remaining is for daughters
      } else {
        // Father takes all residue (no children)
        fatherFinalShare += residueFraction;
        residueFraction = 0;
      }
    }

    // Add Father to heirs if he exists
    if (hasFather) {
      heirs.push({
        name: "Ayah",
        fractionLabel: fatherFinalShare > 0 ? "Asabah/Fardh" : "Asabah",
        percent: fatherFinalShare * 100,
        amount: fatherFinalShare * netEstate,
        note: fatherNote,
      });
    }

    // Children distribution
    if (hasChildren) {
      if (numSons > 0) {
        // Sons and Daughters share the residue in 2:1 ratio
        // Total parts = (Sons * 2) + Daughters
        const totalParts = numSons * 2 + numDaughters;
        const perPartFraction = residueFraction / totalParts;

        if (numSons > 0) {
          const sonShareFraction = perPartFraction * 2;
          heirs.push({
            name: `Anak Laki-laki (${numSons} orang)`,
            fractionLabel: `Asabah (Sisa), Rasio 2x`,
            percent: (sonShareFraction * numSons) * 100,
            amount: sonShareFraction * numSons * netEstate,
            note: `Masing-masing mendapat bagian setara dengan ${(sonShareFraction * 100).toFixed(2)}% (${formatRupiah(sonShareFraction * netEstate)}).`,
          });
        }

        if (numDaughters > 0) {
          const daughterShareFraction = perPartFraction;
          heirs.push({
            name: `Anak Perempuan (${numDaughters} orang)`,
            fractionLabel: `Asabah (Sisa), Rasio 1x`,
            percent: (daughterShareFraction * numDaughters) * 100,
            amount: daughterShareFraction * numDaughters * netEstate,
            note: `Masing-masing mendapat bagian setara dengan ${(daughterShareFraction * 100).toFixed(2)}% (${formatRupiah(daughterShareFraction * netEstate)}).`,
          });
        }
      } else {
        // Only daughters, no sons.
        // If there is no Father (who would take the remaining as Asabah), then daughters take their fixed share
        // and residue might go to others (e.g. brothers/sisters) or undergo Radd (distribution back to daughters/mother).
        // Let's assume daughters take their fixed share, and remaining is either taken by Father (if exists) or Radd.
        const daughtersFixedFraction = numDaughters === 1 ? 1 / 2 : 2 / 3;
        
        heirs.push({
          name: `Anak Perempuan (${numDaughters} orang)`,
          fractionLabel: numDaughters === 1 ? "1/2" : "2/3",
          percent: daughtersFixedFraction * 100,
          amount: daughtersFixedFraction * netEstate,
          note: numDaughters === 1 
            ? "Mendapat 1/2 bagian karena merupakan anak tunggal perempuan." 
            : `Masing-masing mendapat bagian sama rata dari total 2/3 bagian.`,
        });

        const remaining = Math.max(0, residueFraction - daughtersFixedFraction);
        if (remaining > 0 && !hasFather) {
          // If no father, remainder is scaled back (Radd) or noted as residue for other extended relatives.
          heirs.push({
            name: "Sisa Warisan (Baitul Mal / Ahli Waris Lain)",
            fractionLabel: "Sisa",
            percent: remaining * 100,
            amount: remaining * netEstate,
            note: "Sisa bagian diwariskan ke kerabat lain (saudara/paman) atau diserahkan ke Baitul Mal.",
          });
        }
      }
    }

    return { netEstate, heirs, errors: null };
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const { netEstate, heirs, errors } = calculateInheritance();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs Form */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Detail Harta & Ahli Waris</h3>

        {/* Estate Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
              Total Harta Warisan (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={totalEstate || ""}
              onChange={(e) => setTotalEstate(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
              Hutang & Biaya Jenazah (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={debts || ""}
              onChange={(e) => setDebts(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
        </div>

        {/* Spouse Option */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-2">
            Pasangan Hidup yang Ditinggalkan
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSpouseType("none")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase ${
                spouseType === "none" ? "bg-primary text-white border-primary" : "bg-background border-foreground/10"
              }`}
            >
              Tidak Ada
            </button>
            <button
              onClick={() => setSpouseType("husband")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase ${
                spouseType === "husband" ? "bg-primary text-white border-primary" : "bg-background border-foreground/10"
              }`}
            >
              Suami
            </button>
            <button
              onClick={() => setSpouseType("wife")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase ${
                spouseType === "wife" ? "bg-primary text-white border-primary" : "bg-background border-foreground/10"
              }`}
            >
              Istri
            </button>
          </div>
        </div>

        {/* Parents Option */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <label className="flex items-center gap-2 border border-foreground/10 rounded-lg p-3 bg-background cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasFather}
              onChange={(e) => setHasFather(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs font-bold uppercase tracking-wider">Ayah Hidup</span>
          </label>

          <label className="flex items-center gap-2 border border-foreground/10 rounded-lg p-3 bg-background cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasMother}
              onChange={(e) => setHasMother(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs font-bold uppercase tracking-wider">Ibu Hidup</span>
          </label>
        </div>

        {/* Children Option */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
              Jumlah Anak Laki-laki
            </label>
            <input
              type="number"
              min="0"
              value={numSons || ""}
              onChange={(e) => setNumSons(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
              Jumlah Anak Perempuan
            </label>
            <input
              type="number"
              min="0"
              value={numDaughters || ""}
              onChange={(e) => setNumDaughters(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center pb-4 border-b border-foreground/10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Harta Bersih Waris</span>
            <span className="text-2xl font-bold font-mono text-primary block mt-0.5">
              {formatRupiah(netEstate)}
            </span>
          </div>
          {debts > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/50">Dipotong Hutang</span>
              <span className="text-xs font-bold block text-red-500">-{formatRupiah(debts)}</span>
            </div>
          )}
        </div>

        {errors ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs">
            {errors}
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pembagian Ahli Waris</h4>
            <div className="space-y-2">
              {heirs.map((heir, idx) => (
                <div key={idx} className="p-4 bg-background border border-foreground/10 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm block">{heir.name}</span>
                      <span className="text-[10px] font-mono text-foreground/45 uppercase">Bagian: {heir.fractionLabel}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-primary block">{formatRupiah(heir.amount)}</span>
                      <span className="text-[10px] text-foreground/40 block font-mono">{heir.percent.toFixed(2)}%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground/60 leading-normal pt-1 border-t border-foreground/5">
                    {heir.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
