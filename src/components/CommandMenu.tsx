import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { tools, categories } from "@/lib/tools";
import { useNavigate } from "@tanstack/react-router";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Listen for custom trigger event
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-command-menu", handleOpen);
    return () => window.removeEventListener("open-command-menu", handleOpen);
  }, []);

  // Group tools by category
  const groupedTools = useMemo(() => {
    const groups: Record<string, typeof tools> = {};
    tools.forEach((tool) => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    });
    return groups;
  }, []);

  const handleSelect = (slug: string) => {
    setOpen(false);
    navigate({
      to: "/tools/$slug",
      params: { slug },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed top-[15%] translate-y-0 left-[50%] translate-x-[-50%] w-[calc(100%-2rem)] sm:w-full max-w-xl p-0 overflow-hidden border-4 border-foreground bg-background shadow-tactile-lg sm:rounded-none z-50 [&>button]:hidden">
        <Command className="w-full font-mono text-sm flex flex-col overflow-hidden" label="Search tools...">
          <div className="flex items-center border-b-4 border-foreground px-3 shrink-0">
            <span className="text-lg mr-2 select-none" aria-hidden="true">🔍</span>
            <Command.Input
              className="flex-1 w-full py-4 bg-transparent outline-none text-foreground placeholder:text-foreground/50 border-none font-bold uppercase tracking-wider focus:ring-0 focus:border-none focus:outline-none"
              placeholder="Cari nama alat / kategori..."
              autoFocus
            />
            <kbd className="hidden sm:inline-block bg-foreground/5 border border-foreground/15 rounded px-1.5 py-0.5 text-[9px] font-mono text-foreground/50 select-none">ESC</kbd>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-xs text-foreground/50">
              Tidak ada alat yang ditemukan.
            </Command.Empty>

            {Object.keys(groupedTools).map((categoryKey) => {
              const category = categories.find((c) => c.key === categoryKey);
              const categoryTools = groupedTools[categoryKey];
              if (!category || categoryTools.length === 0) return null;

              return (
                <Command.Group
                  key={categoryKey}
                  heading={category.name}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-foreground/45 border-b border-foreground/5 last:border-b-0 pb-2 mb-2 last:mb-0 last:pb-0"
                >
                  {categoryTools.map((tool) => (
                    <Command.Item
                      key={tool.slug}
                      value={`${tool.name} ${tool.subcategory || ""} ${tool.description} ${category.name}`}
                      onSelect={() => handleSelect(tool.slug)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-foreground hover:bg-foreground/5 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground aria-selected:bg-primary aria-selected:text-primary-foreground select-none"
                    >
                      <span className="text-lg shrink-0" aria-hidden="true">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold uppercase tracking-wider text-xs">{tool.name}</div>
                        <div className="text-[10px] text-foreground/70 truncate group-data-[selected=true]:text-primary-foreground/75 group-aria-selected:text-primary-foreground/75">
                          {tool.description}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded shrink-0">
                        {tool.subcategory || category.name}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
