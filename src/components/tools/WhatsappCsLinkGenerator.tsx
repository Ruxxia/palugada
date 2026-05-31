import { useState } from "react";

interface Agent {
  name: string;
  phone: string;
}

export function WhatsappCsLinkGenerator() {
  const [agents, setAgents] = useState<Agent[]>([
    { name: "Admin CS 1", phone: "08123456789" },
    { name: "Admin CS 2", phone: "08987654321" }
  ]);
  const [message, setMessage] = useState("Halo, saya ingin bertanya tentang layanan Anda...");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const addAgent = () => {
    setAgents([...agents, { name: `Admin CS ${agents.length + 1}`, phone: "" }]);
  };

  const removeAgent = (idx: number) => {
    setAgents(agents.filter((_, i) => i !== idx));
  };

  const updateAgent = (idx: number, field: keyof Agent, val: string) => {
    const updated = [...agents];
    updated[idx][field] = val;
    setAgents(updated);
  };

  const getWaLink = (phone: string) => {
    if (!phone) return "";
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    } else if (!clean.startsWith("62") && !clean.startsWith("1") && !clean.startsWith("44")) {
      clean = "62" + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  const copyLink = (link: string, idx: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Daftar Customer Service</h3>

        <div className="space-y-4">
          {agents.map((agent, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={agent.name}
                onChange={(e) => updateAgent(idx, "name", e.target.value)}
                placeholder="Nama CS"
                className="w-1/3 min-w-0 h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-bold"
              />
              <input
                type="text"
                value={agent.phone}
                onChange={(e) => updateAgent(idx, "phone", e.target.value)}
                placeholder="0812345..."
                className="flex-1 min-w-0 h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
              />
              {agents.length > 1 && (
                <button
                  onClick={() => removeAgent(idx)}
                  className="text-red-500 hover:text-red-600 font-bold w-10 h-10 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addAgent}
            className="w-full h-10 border border-dashed border-foreground/15 rounded-lg text-xs font-bold hover:bg-foreground/5 transition-colors"
          >
            + Tambah Agen CS
          </button>
        </div>

        <div className="space-y-2 pt-4 border-t border-foreground/10">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pesan Template</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pesan awal chat..."
            rows={3}
            className="w-full p-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
          />
        </div>
      </div>

      {/* Generated Output Links */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Link CS Terbuat</h3>

          <div className="space-y-3">
            {agents.map((agent, idx) => {
              const link = getWaLink(agent.phone);
              return (
                <div key={idx} className="bg-background border border-foreground/10 rounded-lg p-3 flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-primary font-bold uppercase">{agent.name || `Admin ${idx + 1}`}</span>
                    <p className="text-xs font-mono truncate text-foreground/60">{link || "Belum ada nomor HP"}</p>
                  </div>
                  {link && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(link, idx)}
                        className="px-2.5 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {copiedIndex === idx ? "Copied! ✓" : "Copy"}
                      </button>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded-lg hover:bg-primary/95 transition-all flex items-center"
                      >
                        Test
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-foreground/45 text-center mt-6">
          Gunakan tombol di atas untuk membagikan tautan chat WhatsApp masing-masing customer service agent.
        </p>
      </div>
    </div>
  );
}
