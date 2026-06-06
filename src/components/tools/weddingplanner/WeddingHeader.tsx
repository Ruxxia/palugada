import { Check, Edit3 } from "lucide-react";

interface WeddingHeaderProps {
  isEditingHeader: boolean;
  onToggleEditing: () => void;
  weddingTitle: string;
  onTitleChange: (val: string) => void;
  groomName: string;
  onGroomNameChange: (val: string) => void;
  brideName: string;
  onBrideNameChange: (val: string) => void;
}

export function WeddingHeader({
  isEditingHeader,
  onToggleEditing,
  weddingTitle,
  onTitleChange,
  groomName,
  onGroomNameChange,
  brideName,
  onBrideNameChange
}: WeddingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-5 select-none">
      <div className="w-full sm:w-auto">
        {isEditingHeader ? (
          <div className="space-y-2 max-w-lg">
            <input
              type="text"
              value={weddingTitle}
              onChange={(e) => {
                onTitleChange(e.target.value);
                localStorage.setItem("wedding_title", e.target.value);
              }}
              placeholder="Judul Pernikahan"
              className="text-xl md:text-2xl font-display uppercase tracking-wider bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground"
            />
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={groomName}
                onChange={(e) => {
                  onGroomNameChange(e.target.value);
                  localStorage.setItem("wedding_groom_name", e.target.value);
                }}
                placeholder="Nama Pengantin Pria"
                className="text-xs font-bold bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground"
              />
              <span className="text-foreground/40 font-serif font-bold">&</span>
              <input
                type="text"
                value={brideName}
                onChange={(e) => {
                  onBrideNameChange(e.target.value);
                  localStorage.setItem("wedding_bride_name", e.target.value);
                }}
                placeholder="Nama Pengantin Wanita"
                className="text-xs font-bold bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground"
              />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl md:text-2xl font-display uppercase tracking-wider text-foreground">
              {weddingTitle}
            </h2>
            <p className="font-serif italic text-xs md:text-sm mt-1 text-foreground/70">
              Pernikahan <span className="font-bold font-sans not-italic uppercase tracking-wide text-[11px] px-1.5 py-0.5 border border-foreground/10 bg-foreground/5 rounded-md text-foreground">{groomName}</span> & <span className="font-bold font-sans not-italic uppercase tracking-wide text-[11px] px-1.5 py-0.5 border border-foreground/10 bg-foreground/5 rounded-md text-foreground">{brideName}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
        <button
          onClick={onToggleEditing}
          className="px-3.5 py-2 border border-foreground/15 text-foreground text-[10px] font-bold uppercase rounded-lg tracking-wider hover:bg-foreground/5 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {isEditingHeader ? (
            <>
              <Check className="w-3.5 h-3.5" /> Selesai
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Edit Nama
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default WeddingHeader;
