interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/85 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative bg-card border border-foreground/15 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 select-none">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-[11px] text-foreground/60 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3 font-medium">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-foreground/10 hover:bg-foreground/5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer text-foreground"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 text-white font-bold uppercase tracking-wider hover:bg-rose-700 rounded-lg text-[10px] transition-colors cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
