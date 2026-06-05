import { useState, useEffect, useRef } from "react";
import { getWeddingData, saveWeddingData } from "../../lib/api/wedding.functions";
import {
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  Save,
  CloudCheck,
  RefreshCw,
  Trash2,
  Plus,
  Edit3,
  Check,
  AlertCircle,
  Search,
  Filter,
  Info
} from "lucide-react";

// ==========================================
// Types
// ==========================================
interface WeddingSettings {
  wedding_date: string;
  total_budget: number;
}

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
}

interface GuestItem {
  id: string;
  name: string;
  category: string;
  rsvp_status: "Pending" | "Attending" | "Declined";
  contact_info?: string;
  notes?: string;
}

interface TodoItem {
  id: string;
  title: string;
  due_date?: string;
  is_completed: boolean;
  notes?: string;
}

// Default states
const DEFAULT_SETTINGS: WeddingSettings = {
  wedding_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 6 months from now
  total_budget: 100000000, // 100 Juta IDR
};

const DEFAULT_BUDGETS: BudgetItem[] = [];

const DEFAULT_GUESTS: GuestItem[] = [];

const DEFAULT_TODOS: TodoItem[] = [];

const CATEGORIES_BUDGET = ["Gedung", "Katering", "Pakaian", "Dokumentasi", "Undangan", "Souvenir", "Lainnya"];
const CATEGORIES_GUEST = ["Keluarga Utama", "Keluarga Besar", "Teman Dekat", "Rekan Kerja", "Tetangga", "Lainnya"];

export function WeddingPlanner() {
  // Authentication & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Planner States
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [budgets, setBudgets] = useState<BudgetItem[]>(DEFAULT_BUDGETS);
  const [guests, setGuests] = useState<GuestItem[]>(DEFAULT_GUESTS);
  const [todos, setTodos] = useState<TodoItem[]>(DEFAULT_TODOS);

  // Syncing / Loading States
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "error" | "unsaved">("idle");
  const [autoSave, setAutoSave] = useState(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist" | "guests" | "budget">("dashboard");

  // Filter/Search states
  const [todoFilter, setTodoFilter] = useState<"all" | "completed" | "pending">("all");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilterCategory, setGuestFilterCategory] = useState("all");
  const [guestFilterRSVP, setGuestFilterRSVP] = useState("all");
  const [budgetFilterCategory, setBudgetFilterCategory] = useState("all");

  // Form states (modals/drawers)
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", due_date: "", notes: "" });

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", category: "Keluarga Utama", rsvp_status: "Pending" as GuestItem["rsvp_status"], contact_info: "", notes: "" });

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: "", category: "Gedung", estimated_cost: 0, actual_cost: 0, is_paid: false });

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  // Refs for tracking changes (prevent infinite loops in auto-save)
  const isInitialMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Check login on mount & listen to storage/bookmark events
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setIsLoggedIn(true);
          setAuthToken(token);
          setUserId(userData.id);
          setUserName(userData.email || "Pengguna Palugada");
        } else {
          setIsLoggedIn(false);
          setAuthToken(null);
          setUserId(null);
          setUserName("");
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    // Listen for custom login events from login dialog if dispatched
    window.addEventListener("bookmark_change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("bookmark_change", checkAuth);
    };
  }, []);

  // Fetch wedding planner data from Supabase once logged in
  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Execute server function
        const res = await getWeddingData({ data: { token: authToken } });

        if (res.settings) setSettings(res.settings);
        setBudgets(res.budgets || []);
        setGuests(res.guests || []);
        setTodos(res.todos || []);
        setSavingStatus("idle");
      } catch (err) {
        console.error("Gagal memuat data dari cloud. Menggunakan data lokal.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, authToken]);

  // Calculate Countdown
  useEffect(() => {
    const target = new Date(settings.wedding_date);
    const updateCountdown = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown({ days, hours, minutes });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [settings.wedding_date]);

  // Handle Save Operation
  const triggerSave = async (silent = false) => {
    if (!isLoggedIn || !authToken) return;
    if (!silent) setSavingStatus("saving");

    try {
      await saveWeddingData({
        data: {
          token: authToken,
          payload: {
            settings,
            budgets,
            guests,
            todos
          }
        }
      });
      setSavingStatus("saved");
      setTimeout(() => {
        setSavingStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 3000);
    } catch (err) {
      console.error("Gagal sinkronisasi data.", err);
      setSavingStatus("error");
    }
  };

  // Track changes to trigger Save / Auto-Save status
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isLoggedIn) return;

    setSavingStatus("unsaved");

    if (autoSave) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        triggerSave(true);
      }, 2000);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [settings, budgets, guests, todos, autoSave]);

  // Dynamic calculations
  const totalEstimatedBudget = budgets.reduce((acc, curr) => acc + Number(curr.estimated_cost), 0);
  const totalActualBudget = budgets.reduce((acc, curr) => acc + Number(curr.actual_cost), 0);
  const totalPaidBudget = budgets.filter(b => b.is_paid).reduce((acc, curr) => acc + Number(curr.actual_cost), 0);

  const guestsAttending = guests.filter(g => g.rsvp_status === "Attending").length;
  const guestsDeclined = guests.filter(g => g.rsvp_status === "Declined").length;
  const guestsPending = guests.filter(g => g.rsvp_status === "Pending").length;
  const totalGuests = guests.length;

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.is_completed).length;
  const todoPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Formatting utility
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // Handlers for Todos
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    const newItem: TodoItem = {
      id: "t_" + Date.now(),
      title: newTodo.title,
      due_date: newTodo.due_date || undefined,
      is_completed: false,
      notes: newTodo.notes || undefined
    };
    setTodos(prev => [newItem, ...prev]);
    setNewTodo({ title: "", due_date: "", notes: "" });
    setShowTodoForm(false);
  };

  const handleDeleteTodo = (id: string) => {
    if (confirm("Hapus tugas ini?")) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  // Handlers for Guests
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;
    const newItem: GuestItem = {
      id: "g_" + Date.now(),
      name: newGuest.name,
      category: newGuest.category,
      rsvp_status: newGuest.rsvp_status,
      contact_info: newGuest.contact_info || undefined,
      notes: newGuest.notes || undefined
    };
    setGuests(prev => [newItem, ...prev]);
    setNewGuest({ name: "", category: "Keluarga Utama", rsvp_status: "Pending", contact_info: "", notes: "" });
    setShowGuestForm(false);
  };

  const updateGuestRSVP = (id: string, status: GuestItem["rsvp_status"]) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp_status: status } : g));
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm("Hapus tamu ini dari daftar?")) {
      setGuests(prev => prev.filter(g => g.id !== id));
    }
  };

  // Handlers for Budget items
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.name.trim()) return;
    const newItem: BudgetItem = {
      id: "b_" + Date.now(),
      name: newBudget.name,
      category: newBudget.category,
      estimated_cost: Number(newBudget.estimated_cost),
      actual_cost: Number(newBudget.actual_cost),
      is_paid: newBudget.is_paid
    };
    setBudgets(prev => [newItem, ...prev]);
    setNewBudget({ name: "", category: "Gedung", estimated_cost: 0, actual_cost: 0, is_paid: false });
    setShowBudgetForm(false);
  };

  const toggleBudgetPaid = (id: string) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, is_paid: !b.is_paid } : b));
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm("Hapus entri anggaran ini?")) {
      setBudgets(prev => prev.filter(b => b.id !== id));
    }
  };

  // Auth Gate UI
  if (!isLoggedIn) {
    return (
      <div className="py-12 px-4 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary text-4xl mb-6 shadow-tactile animate-bounce">
          💍
        </div>
        <h2 className="font-display text-3xl uppercase tracking-tight mb-3">Wedding Planner</h2>
        <p className="text-foreground/60 text-sm leading-relaxed mb-8">
          Mulai atur hari bahagia Anda. Kelola anggaran detail, list tamu RSVP, timeline tugas, dan pasang hitung mundur digital dalam satu dashboard.
        </p>
        <div className="bg-card border border-foreground/10 p-5 rounded-2xl shadow-sm mb-8">
          <p className="text-xs text-left text-foreground/70 leading-relaxed">
            🔒 **Penyimpanan Cloud Terproteksi:** Yuk login dulu ke Palugada untuk menggunakan fitur ini agar progress-mu tersimpan!
          </p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-login-dialog"));
          }}
          className="w-full h-12 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-xl tracking-widest shadow-tactile hover:opacity-95 transition-opacity cursor-pointer animate-float-pulse"
        >
          Masuk ke Akun Palugada
        </button>
        <div className="text-center mt-4 select-none">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-login-dialog", { detail: { mode: "register" } }));
            }}
            className="text-xs text-foreground/60 hover:text-foreground font-medium underline cursor-pointer"
          >
            Belum punya akun? Register dulu yuk
          </button>
        </div>
      </div>
    );
  }

  // Loading State UI
  if (loading) {
    return (
      <div className="py-24 px-4 text-center max-w-lg mx-auto flex flex-col items-center justify-center select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            💍
          </div>
        </div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-2">Menyelaraskan Data</h3>
        <p className="text-foreground/60 text-xs leading-relaxed animate-pulse">
          Sedang menyiapkan data rencana pernikahan Anda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Sync Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background border border-foreground/10 rounded-2xl p-4 shadow-sm select-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-foreground/50">AKTIF: {userName}</span>
          </div>
          <p className="text-[10px] text-foreground/60 mt-0.5">Semua data disinkronkan secara aman ke data center.</p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">

          {/* Auto Save Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-4 h-4 rounded border-foreground/15 accent-primary cursor-pointer"
            />
            <span>Auto Save</span>
          </label>

          {/* Sync indicator */}
          <div className="flex items-center gap-2">
            {savingStatus === "saving" && (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
              </span>
            )}
            {savingStatus === "saved" && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5" /> Cloud Tersinkron
              </span>
            )}
            {savingStatus === "error" && (
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Gagal Simpan
              </span>
            )}
            {savingStatus === "unsaved" && (
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Perubahan Lokal
              </span>
            )}
            {savingStatus === "idle" && (
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5" /> Tersimpan
              </span>
            )}

            {/* Manual Save Button */}
            {!autoSave && (
              <button
                onClick={() => triggerSave()}
                disabled={savingStatus === "saving"}
                className="px-3.5 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Simpan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bento Stats & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Countdown */}
        <div className="bg-card border-2 border-foreground rounded-2xl p-5 shadow-tactile flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 opacity-5 text-7xl translate-x-2 -translate-y-2">🔔</div>
          <div>
            <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Hari H Pernikahan</span>
            <input
              type="date"
              value={settings.wedding_date}
              onChange={(e) => setSettings(prev => ({ ...prev, wedding_date: e.target.value }))}
              className="text-xs font-mono font-bold mt-1.5 bg-background border border-foreground/15 rounded p-1 outline-none text-foreground cursor-pointer"
            />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-display font-bold leading-none">{countdown.days}</span>
            <span className="text-sm font-bold uppercase tracking-wide text-foreground/60">Hari Lagi</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-foreground/50">
            {countdown.hours} Jam {countdown.minutes} Menit tersisa
          </div>
        </div>

        {/* Budget Tracker Bento Card */}
        <div className="bg-card border-2 border-foreground rounded-2xl p-5 shadow-tactile flex flex-col justify-between select-none">
          <div>
            <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Target Anggaran</span>
            <input
              type="number"
              value={settings.total_budget}
              onChange={(e) => setSettings(prev => ({ ...prev, total_budget: Number(e.target.value) }))}
              className="text-lg font-display font-bold mt-1 bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground"
            />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-foreground/75 mb-1 font-bold">
              <span>Rencana Riil</span>
              <span>{Math.round((totalActualBudget / settings.total_budget) * 100)}%</span>
            </div>
            <div className="w-full bg-foreground/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalActualBudget / settings.total_budget) * 100))}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-foreground/50 flex justify-between">
            <span>Estimasi: {formatIDR(totalEstimatedBudget)}</span>
            <span>Riil: {formatIDR(totalActualBudget)}</span>
          </div>
        </div>

        {/* Guest RSVP Stats Bento Card */}
        <div className="bg-card border-2 border-foreground rounded-2xl p-5 shadow-tactile flex flex-col justify-between select-none">
          <div>
            <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Manajemen Undangan</span>
            <span className="text-3xl font-display font-bold block mt-1">{totalGuests} <span className="text-xs text-foreground/60 uppercase">Tamu Terdaftar</span></span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-xl">
              <span className="text-xs font-mono font-bold text-emerald-500 block">{guestsAttending}</span>
              <span className="text-[8px] uppercase font-bold text-foreground/50">Hadir</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl">
              <span className="text-xs font-mono font-bold text-rose-500 block">{guestsDeclined}</span>
              <span className="text-[8px] uppercase font-bold text-foreground/50">Menolak</span>
            </div>
            <div className="bg-foreground/5 border border-foreground/10 p-1.5 rounded-xl">
              <span className="text-xs font-mono font-bold text-foreground/60 block">{guestsPending}</span>
              <span className="text-[8px] uppercase font-bold text-foreground/50">Pending</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-foreground/50 text-right">
            Tingkat RSVP: {totalGuests > 0 ? Math.round(((guestsAttending + guestsDeclined) / totalGuests) * 100) : 0}%
          </div>
        </div>

        {/* Tasks Progress Bento Card */}
        <div className="bg-card border-2 border-foreground rounded-2xl p-5 shadow-tactile flex flex-col justify-between select-none">
          <div>
            <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Tugas & Timeline</span>
            <span className="text-3xl font-display font-bold block mt-1">{completedTodos} / {totalTodos} <span className="text-xs text-foreground/60 uppercase">Tugas Selesai</span></span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-foreground/75 mb-1 font-bold">
              <span>Progres</span>
              <span>{todoPercentage}%</span>
            </div>
            <div className="w-full bg-foreground/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${todoPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-foreground/50">
            Sisa tugas: {totalTodos - completedTodos} tugas lagi
          </div>
        </div>

      </div>

      {/* Main Content Tabs Navigation */}
      <div className="flex border-2 border-foreground rounded-xl bg-card overflow-hidden select-none shadow-sm">
        {(["dashboard", "checklist", "guests", "budget"] as const).map((tab) => {
          const tabLabel = {
            dashboard: "📊 Dashboard",
            checklist: "📝 Tugas & Timeline",
            guests: "👥 Daftar Tamu",
            budget: "💰 Anggaran Biaya"
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider border-r-2 border-foreground last:border-r-0 transition-colors cursor-pointer text-center ${activeTab === tab ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/5"
                }`}
            >
              {tabLabel[tab]}
            </button>
          );
        })}
      </div>

      {/* Tabs Panels Container */}
      <div className="bg-card border-2 border-foreground rounded-2xl p-6 shadow-tactile">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-foreground/60">Mengambil data pernikahan dari cloud...</p>
          </div>
        ) : (
          <>

            {/* Tab: Dashboard Overview */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="border-b border-foreground/10 pb-4">
                  <h3 className="font-display text-2xl uppercase">Dashboard Ringkasan</h3>
                  <p className="text-xs text-foreground/60 mt-1">Status dan pandangan umum kesiapan pernikahan Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Budget Summary Card */}
                  <div className="border border-foreground/15 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-sm uppercase text-foreground/75 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Rangkuman Anggaran</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-foreground/5 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-foreground/50 block">Anggaran Target</span>
                        <span className="text-sm font-mono font-bold">{formatIDR(settings.total_budget)}</span>
                      </div>
                      <div className="p-3 bg-foreground/5 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-foreground/50 block">Rencana Biaya Riil</span>
                        <span className="text-sm font-mono font-bold text-primary">{formatIDR(totalActualBudget)}</span>
                      </div>
                      <div className="p-3 bg-foreground/5 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-foreground/50 block">Sudah Dibayar</span>
                        <span className="text-sm font-mono font-bold text-emerald-600">{formatIDR(totalPaidBudget)}</span>
                      </div>
                      <div className="p-3 bg-foreground/5 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-foreground/50 block">Belum Dibayar</span>
                        <span className="text-sm font-mono font-bold text-rose-500">{formatIDR(totalActualBudget - totalPaidBudget)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Timeline Tasks Card */}
                  <div className="border border-foreground/15 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-sm uppercase text-foreground/75 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Tugas Penting Mendatang</h4>
                    <div className="space-y-3">
                      {todos.filter(t => !t.is_completed).slice(0, 3).map(todo => (
                        <div key={todo.id} className="flex justify-between items-center bg-foreground/5 p-3 rounded-xl border border-foreground/5">
                          <div>
                            <p className="text-xs font-bold text-foreground/85">{todo.title}</p>
                            {todo.due_date && (
                              <span className="text-[9px] font-mono text-foreground/45 mt-1 block">Batas: {todo.due_date}</span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className="w-6 h-6 border-2 border-foreground/30 rounded-md flex items-center justify-center hover:border-foreground transition-all cursor-pointer bg-background"
                          >
                          </button>
                        </div>
                      ))}
                      {todos.filter(t => !t.is_completed).length === 0 && (
                        <p className="text-xs text-foreground/50 text-center py-6">🎉 Semua tugas penting telah diselesaikan!</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab: Checklist / To-Dos */}
            {activeTab === "checklist" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase">Tugas & Timeline</h3>
                    <p className="text-xs text-foreground/60 mt-1">Daftar persiapan pernikahan terperinci berdasarkan deadline.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={todoFilter}
                      onChange={(e) => setTodoFilter(e.target.value as any)}
                      className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground"
                    >
                      <option value="all">Semua Tugas</option>
                      <option value="pending">Belum Selesai</option>
                      <option value="completed">Sudah Selesai</option>
                    </select>
                    <button
                      onClick={() => setShowTodoForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer ml-auto"
                    >
                      <Plus className="w-4 h-4" /> Tambah Tugas
                    </button>
                  </div>
                </div>

                {/* Todo Form Modal Drawer (in-place) */}
                {showTodoForm && (
                  <form onSubmit={handleAddTodo} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tugas Baru</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Tugas</label>
                        <input
                          type="text"
                          required
                          value={newTodo.title}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Contoh: Mengurus Berkas KUA"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Batas Waktu (Due Date)</label>
                        <input
                          type="date"
                          value={newTodo.due_date}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, due_date: e.target.value }))}
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowTodoForm(false)}
                        className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        Simpan Tugas
                      </button>
                    </div>
                  </form>
                )}

                {/* Todos List */}
                <div className="space-y-3">
                  {todos
                    .filter(t => {
                      if (todoFilter === "completed") return t.is_completed;
                      if (todoFilter === "pending") return !t.is_completed;
                      return true;
                    })
                    .map(todo => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between border rounded-xl p-4 transition-all ${todo.is_completed
                            ? "bg-foreground/5 border-foreground/10 opacity-70"
                            : "bg-background border-foreground/15 hover:border-foreground/30 shadow-sm"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all cursor-pointer ${todo.is_completed
                                ? "bg-foreground border-foreground text-background"
                                : "border-foreground/30 bg-background hover:border-foreground"
                              }`}
                          >
                            {todo.is_completed && <Check className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${todo.is_completed ? "line-through text-foreground/50" : "text-foreground"}`}>
                              {todo.title}
                            </p>
                            {todo.due_date && (
                              <span className="text-[9px] font-mono text-foreground/45 mt-1 block flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Batas: {todo.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  {todos.length === 0 && (
                    <p className="text-center text-xs text-foreground/50 py-12">Belum ada tugas dibuat. Klik "Tambah Tugas" untuk memulai.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Guest List */}
            {activeTab === "guests" && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-foreground/10 pb-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase">Daftar Tamu & RSVP</h3>
                    <p className="text-xs text-foreground/60 mt-1">Kelola undangan dan lacak konfirmasi kehadiran tamu.</p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">

                    {/* Search bar */}
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-foreground/40" />
                      <input
                        type="text"
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        placeholder="Cari nama tamu..."
                        className="pl-9 pr-3 py-2 w-full sm:w-48 border border-foreground/15 rounded-lg bg-background text-xs outline-none focus:border-primary text-foreground"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={guestFilterCategory}
                      onChange={(e) => setGuestFilterCategory(e.target.value)}
                      className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground"
                    >
                      <option value="all">Semua Kategori</option>
                      {CATEGORIES_GUEST.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    {/* RSVP Filter */}
                    <select
                      value={guestFilterRSVP}
                      onChange={(e) => setGuestFilterRSVP(e.target.value)}
                      className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground"
                    >
                      <option value="all">Semua RSVP</option>
                      <option value="Attending">Hadir</option>
                      <option value="Declined">Menolak</option>
                      <option value="Pending">Pending</option>
                    </select>

                    <button
                      onClick={() => setShowGuestForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer ml-auto"
                    >
                      <Plus className="w-4 h-4" /> Undang Tamu
                    </button>
                  </div>
                </div>

                {/* Add Guest Form (in-place drawer) */}
                {showGuestForm && (
                  <form onSubmit={handleAddGuest} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Undang Tamu Baru</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={newGuest.name}
                          onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nama Tamu / Keluarga"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori Hubungan</label>
                        <select
                          value={newGuest.category}
                          onChange={(e) => setNewGuest(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        >
                          {CATEGORIES_GUEST.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Info Kontak / HP</label>
                        <input
                          type="text"
                          value={newGuest.contact_info}
                          onChange={(e) => setNewGuest(prev => ({ ...prev, contact_info: e.target.value }))}
                          placeholder="0812xxxxxx"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowGuestForm(false)}
                        className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        Tambah Tamu
                      </button>
                    </div>
                  </form>
                )}

                {/* Guest Table */}
                <div className="overflow-x-auto border border-foreground/15 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs select-none">
                    <thead>
                      <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
                        <th className="p-3">Nama Tamu</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Kontak</th>
                        <th className="p-3">Status RSVP</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {guests
                        .filter(g => {
                          const matchesSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase());
                          const matchesCat = guestFilterCategory === "all" || g.category === guestFilterCategory;
                          const matchesRSVP = guestFilterRSVP === "all" || g.rsvp_status === guestFilterRSVP;
                          return matchesSearch && matchesCat && matchesRSVP;
                        })
                        .map(guest => (
                          <tr key={guest.id} className="hover:bg-foreground/5 transition-colors">
                            <td className="p-3 font-bold">{guest.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                                {guest.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-foreground/75">{guest.contact_info || "-"}</td>
                            <td className="p-3">
                              <select
                                value={guest.rsvp_status}
                                onChange={(e) => updateGuestRSVP(guest.id, e.target.value as any)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${guest.rsvp_status === "Attending"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                                    : guest.rsvp_status === "Declined"
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                                  }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Attending">Hadir</option>
                                <option value="Declined">Menolak</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {guests.length === 0 && (
                    <p className="text-center text-xs text-foreground/50 py-12">Belum ada tamu diundang. Klik "Undang Tamu" untuk memulai.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Budget Tracker */}
            {activeTab === "budget" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase">Manajemen Anggaran</h3>
                    <p className="text-xs text-foreground/60 mt-1">Lacak pengeluaran estimasi dan realisasi vendor pernikahan.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={budgetFilterCategory}
                      onChange={(e) => setBudgetFilterCategory(e.target.value)}
                      className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground"
                    >
                      <option value="all">Semua Kategori</option>
                      {CATEGORIES_BUDGET.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer ml-auto"
                    >
                      <Plus className="w-4 h-4" /> Tambah Alokasi
                    </button>
                  </div>
                </div>

                {/* Add Budget Form (in-place drawer) */}
                {showBudgetForm && (
                  <form onSubmit={handleAddBudget} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tambah Alokasi Anggaran</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Kebutuhan / Vendor</label>
                        <input
                          type="text"
                          required
                          value={newBudget.name}
                          onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Contoh: Booking DP Gedung Serbaguna"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori</label>
                        <select
                          value={newBudget.category}
                          onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        >
                          {CATEGORIES_BUDGET.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Estimasi Biaya (IDR)</label>
                        <input
                          type="number"
                          required
                          value={newBudget.estimated_cost}
                          onChange={(e) => setNewBudget(prev => ({ ...prev, estimated_cost: Number(e.target.value) }))}
                          placeholder="Estimasi"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Biaya Riil / Nego (IDR)</label>
                        <input
                          type="number"
                          value={newBudget.actual_cost}
                          onChange={(e) => setNewBudget(prev => ({ ...prev, actual_cost: Number(e.target.value) }))}
                          placeholder="Riil"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBudgetForm(false)}
                        className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        Simpan Entri
                      </button>
                    </div>
                  </form>
                )}

                {/* Budget Table */}
                <div className="overflow-x-auto border border-foreground/15 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs select-none">
                    <thead>
                      <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
                        <th className="p-3">Vendor / Keperluan</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Estimasi Biaya</th>
                        <th className="p-3">Biaya Riil</th>
                        <th className="p-3">Status Bayar</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {budgets
                        .filter(b => budgetFilterCategory === "all" || b.category === budgetFilterCategory)
                        .map(budget => (
                          <tr key={budget.id} className="hover:bg-foreground/5 transition-colors">
                            <td className="p-3 font-bold">{budget.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                                {budget.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{formatIDR(budget.estimated_cost)}</td>
                            <td className="p-3 font-mono text-primary font-bold">{formatIDR(budget.actual_cost)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => toggleBudgetPaid(budget.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${budget.is_paid
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold"
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold"
                                  }`}
                              >
                                {budget.is_paid ? "Lunas" : "Belum Lunas"}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {budgets.length === 0 && (
                    <p className="text-center text-xs text-foreground/50 py-12">Belum ada alokasi anggaran dibuat. Klik "Tambah Alokasi" untuk memulai.</p>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>

    </div>
  );
}
export default WeddingPlanner;
