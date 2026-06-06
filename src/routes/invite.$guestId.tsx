import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getPublicGuest, submitPublicRSVP } from "@/lib/api/wedding.functions";

export const Route = createFileRoute("/invite/$guestId")({
  component: GuestInvitationPage,
});

function GuestInvitationPage() {
  const { guestId } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"Attending" | "Declined">("Attending");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Countdown State
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPublicGuest({ data: { guestId } });
        setGuest(res.guest);
        setSettings(res.settings);
        if (res.guest.rsvp_status && res.guest.rsvp_status !== "Pending") {
          setRsvpStatus(res.guest.rsvp_status as any);
        }
        if (res.guest.notes) {
          setNotes(res.guest.notes);
        }
      } catch (err: any) {
        console.error(err);
        setError("Maaf, link undangan ini tidak valid atau tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [guestId]);

  // Countdown timer logic
  useEffect(() => {
    if (!settings?.wedding_date) return;

    const target = new Date(settings.wedding_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setCountdown((prev) => ({ ...prev, finished: true }));
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds, finished: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.wedding_date]);

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitPublicRSVP({
        data: {
          guestId,
          rsvpStatus,
          notes,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gagal mengirim konfirmasi RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider text-foreground/60">
          Memuat Undangan Spesial...
        </p>
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="mt-4 font-display text-2xl uppercase text-destructive">Undangan Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-foreground/60 max-w-md">{error}</p>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-card border-2 border-foreground rounded-2xl shadow-tactile font-bold uppercase tracking-wider text-xs hover:bg-foreground/5 transition-all"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  // Generate QR Code URL
  const checkinUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestId)}`;

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Floating circles decoration */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-md w-full text-center z-10 bg-card/60 backdrop-blur-md border-2 border-foreground p-8 rounded-3xl shadow-tactile relative animate-fade-in">
          <span className="text-3xl">💍</span>
          <h2 className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            {settings?.wedding_title || "Undangan Pernikahan"}
          </h2>
          {(settings?.groom_name || settings?.bride_name) ? (
            <h1 className="mt-2 font-display text-3xl uppercase tracking-tight leading-none text-foreground">
              {settings.groom_name || "Pengantin Pria"} <span className="font-serif italic text-2xl lowercase block my-1">dan</span> {settings.bride_name || "Pengantin Wanita"}
            </h1>
          ) : (
            <h1 className="mt-2 font-display text-4xl uppercase tracking-tight leading-none text-foreground">
              The Wedding
            </h1>
          )}
          <div className="my-6 border-y border-foreground/10 py-4 flex flex-col items-center">
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground/40 mb-1">
              Kepada Yth. Bapak/Ibu/Saudara/i
            </p>
            <p className="font-body text-xl font-bold uppercase tracking-wide text-foreground px-4 text-center">
              {guest.name}
            </p>
            <span className="mt-2 bg-foreground/5 border border-foreground/10 text-foreground/75 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase">
              Kategori: {guest.category}
            </span>
          </div>

          <p className="text-xs text-foreground/60 mb-6 max-w-xs mx-auto leading-relaxed">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
          </p>

          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-4 bg-primary text-primary-foreground border-2 border-foreground rounded-2xl shadow-tactile font-mono text-xs font-bold uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 active:shadow-tactile hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✉️</span>
            <span>Buka Undangan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center py-12 px-4 relative">
      <div className="max-w-lg w-full space-y-8 z-10">

        {/* Core Header Card */}
        <div className="bg-card border-2 border-foreground p-8 rounded-3xl shadow-tactile text-center relative overflow-hidden">
          <span className="text-3xl">✨</span>
          <h2 className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            {settings?.wedding_title || "Walimatul 'Ursy"}
          </h2>
          {(settings?.groom_name || settings?.bride_name) ? (
            <h1 className="mt-2 font-display text-2xl md:text-3xl uppercase tracking-tight text-foreground leading-tight">
              {settings.groom_name || "Pengantin Pria"} & {settings.bride_name || "Pengantin Wanita"}
            </h1>
          ) : (
            <h1 className="mt-1 font-display text-3xl md:text-4xl uppercase tracking-tight text-foreground">
              Save The Date
            </h1>
          )}

          {settings?.wedding_date && (
            <div className="mt-4 font-mono text-sm font-bold bg-foreground/5 inline-block px-4 py-2 border border-foreground/10 rounded-xl">
              {new Date(settings.wedding_date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}

          {/* Countdown Clock */}
          {!countdown.finished ? (
            <div className="mt-6 grid grid-cols-4 gap-2">
              <div className="bg-foreground/5 border border-foreground/10 p-3 rounded-2xl">
                <span className="block font-display text-2xl text-primary">{countdown.days}</span>
                <span className="block text-[8px] font-mono uppercase tracking-wider text-foreground/50">Hari</span>
              </div>
              <div className="bg-foreground/5 border border-foreground/10 p-3 rounded-2xl">
                <span className="block font-display text-2xl text-primary">{countdown.hours}</span>
                <span className="block text-[8px] font-mono uppercase tracking-wider text-foreground/50">Jam</span>
              </div>
              <div className="bg-foreground/5 border border-foreground/10 p-3 rounded-2xl">
                <span className="block font-display text-2xl text-primary">{countdown.minutes}</span>
                <span className="block text-[8px] font-mono uppercase tracking-wider text-foreground/50">Menit</span>
              </div>
              <div className="bg-foreground/5 border border-foreground/10 p-3 rounded-2xl">
                <span className="block font-display text-2xl text-primary">{countdown.seconds}</span>
                <span className="block text-[8px] font-mono uppercase tracking-wider text-foreground/50">Detik</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 font-mono text-xs uppercase text-accent font-bold tracking-widest">
              🎉 Hari Pernikahan Telah Tiba! 🎉
            </div>
          )}
        </div>
        {/* Venue/Location Card */}
        <div className="bg-card border-2 border-foreground p-8 rounded-3xl shadow-tactile">
          <h3 className="font-display text-lg uppercase tracking-wide border-b border-foreground/10 pb-2 mb-4 flex items-center gap-2">
            <span>📍</span> Lokasi Acara
          </h3>
          {settings?.wedding_location ? (
            <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {settings.wedding_location}
            </p>
          ) : (
            <p className="font-body text-sm text-foreground/80 leading-relaxed">
              <strong>Gedung Pertemuan Utama</strong><br />
              Jl. Raya Kebahagiaan No. 77, Jakarta Selatan
            </p>
          )}
          {(settings?.location_maps_url || settings?.wedding_location) && (
            <a
              href={settings.location_maps_url || `https://maps.google.com/?q=${encodeURIComponent(settings.wedding_location || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-foreground text-xs font-bold uppercase bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors"
            >
              <span>🗺️</span> Buka Google Maps
            </a>
          )}
        </div>
        {/* RSVP Confirmation & Wishes Form */}
        <div className="bg-card border-2 border-foreground p-8 rounded-3xl shadow-tactile relative">
          <h3 className="font-display text-lg uppercase tracking-wide border-b border-foreground/10 pb-2 mb-6 flex items-center gap-2">
            <span>💌</span> Konfirmasi Kehadiran (RSVP)
          </h3>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <span className="text-4xl">🎉</span>
              <h4 className="font-display text-xl uppercase text-accent">Terima Kasih!</h4>
              <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                Konfirmasi RSVP Anda telah berhasil disimpan dan disinkronkan langsung ke dashboard pengantin.
              </p>

              {/* QR Code Check-in section */}
              {rsvpStatus === "Attending" && (
                <div className="mt-6 border-2 border-foreground p-4 bg-white inline-block rounded-2xl shadow-tactile-sm">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-black/60 mb-2">
                    Tunjukkan QR Code ini Saat Masuk
                  </p>
                  <img src={checkinUrl} alt="Check-in QR Code" className="w-40 h-40 mx-auto" />
                  <p className="text-[10px] font-mono font-bold text-black mt-2">
                    {guest.name}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-4 py-2 border border-foreground text-xs font-mono font-bold uppercase bg-foreground/5 hover:bg-foreground/10 rounded-xl"
              >
                Ubah RSVP
              </button>
            </div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 text-xs p-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/50">
                  Status Kehadiran
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("Attending")}
                    className={`py-3.5 border-2 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${rsvpStatus === "Attending"
                        ? "bg-accent text-accent-foreground border-foreground shadow-tactile-sm -translate-y-0.5"
                        : "bg-card border-foreground/20 hover:border-foreground/45"
                      }`}
                  >
                    👍 Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("Declined")}
                    className={`py-3.5 border-2 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${rsvpStatus === "Declined"
                        ? "bg-destructive text-destructive-foreground border-foreground shadow-tactile-sm -translate-y-0.5"
                        : "bg-card border-foreground/20 hover:border-foreground/45"
                      }`}
                  >
                    👎 Berhalangan
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="wishes" className="block text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/50">
                  Ucapan & Doa Restu
                </label>
                <textarea
                  id="wishes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kirimkan ucapan selamat dan doa restu yang tulus kepada kedua mempelai..."
                  className="w-full p-4 border-2 border-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl text-xs placeholder:text-foreground/30 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-primary-foreground border-2 border-foreground rounded-2xl shadow-tactile font-mono text-xs font-bold uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 active:shadow-tactile hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Mengirim Konfirmasi..." : "Kirim Konfirmasi Kehadiran"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center font-mono text-[9px] uppercase tracking-widest text-foreground/40 pt-4">
          Powered by <a href="/" className="font-bold underline text-foreground/60 hover:text-foreground">Palugada</a>
        </div>
      </div>
    </div>
  );
}
