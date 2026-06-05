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
  X,
  AlertCircle,
  Search,
  Filter,
  Info,
  Copy,
  Printer,
  FileSpreadsheet,
  Package,
  ShoppingBag,
  CheckCircle2
} from "lucide-react";

// ==========================================
// Types
// ==========================================
interface WeddingSettings {
  wedding_date: string;
  total_budget: number;
  auto_save?: boolean;
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
  auto_save: false,
};

const DEFAULT_BUDGETS: BudgetItem[] = [];

const DEFAULT_GUESTS: GuestItem[] = [];

const DEFAULT_TODOS: TodoItem[] = [];

const CATEGORIES_BUDGET = ["Gedung", "Katering", "Pakaian", "Dokumentasi", "Undangan", "Souvenir", "Lainnya"];
const CATEGORIES_GUEST = ["Keluarga Utama", "Keluarga Besar", "Teman Dekat", "Rekan Kerja", "Tetangga", "Lainnya"];

// ==========================================
// Logistics & Shopping List Types and Helpers
// ==========================================
interface LogisticsMeta {
  status: "Belum Dibeli" | "Sedang Diproses" | "Siap (Ready)";
  source?: string;
  price?: number;
  notes?: string;
}

const parseLogisticsNotes = (notesStr?: string): LogisticsMeta => {
  if (!notesStr) return { status: "Belum Dibeli" };
  try {
    if (notesStr.trim().startsWith("{")) {
      return JSON.parse(notesStr);
    }
  } catch (e) {
    // fallback if it was a plain text note
  }
  return { status: "Belum Dibeli", notes: notesStr };
};

const buildLogisticsNotes = (meta: LogisticsMeta): string => {
  return JSON.stringify(meta);
};

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
  const [autoSave, setAutoSave] = useState(true);

  // Tabs State
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist" | "guests" | "budget" | "logistics">("dashboard");

  // Filter/Search states
  const [todoFilter, setTodoFilter] = useState<"all" | "completed" | "pending">("all");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilterCategory, setGuestFilterCategory] = useState("all");
  const [guestFilterRSVP, setGuestFilterRSVP] = useState("all");
  const [budgetFilterCategory, setBudgetFilterCategory] = useState("all");
  const [logisticsFilterStatus, setLogisticsFilterStatus] = useState("all");

  // Form states (modals/drawers)
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", due_date: "", notes: "" });

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", category: "Keluarga Utama", rsvp_status: "Pending" as GuestItem["rsvp_status"], contact_info: "", notes: "" });

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: "", category: "Gedung", estimated_cost: 0, actual_cost: 0, is_paid: false });

  const [showLogisticsForm, setShowLogisticsForm] = useState(false);
  const [newLogistics, setNewLogistics] = useState({
    title: "",
    status: "Belum Dibeli" as LogisticsMeta["status"],
    source: "",
    price: 0,
    notes: ""
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  // Editing Logistics State
  const [editingLogisticsId, setEditingLogisticsId] = useState<string | null>(null);
  const [editingLogisticsData, setEditingLogisticsData] = useState<{
    title: string;
    source: string;
    price: number;
    notes: string;
  } | null>(null);

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { }
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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

        if (res.settings) {
          setSettings(res.settings);
          if (typeof res.settings.auto_save === "boolean") {
            setAutoSave(res.settings.auto_save);
          }
        }
        setBudgets(res.budgets || []);
        setGuests(res.guests || []);
        setTodos(res.todos || []);
        setSavingStatus("idle");
      } catch (err: any) {
        console.error("Gagal memuat data dari cloud. Menggunakan data lokal.", err);
        const errMsg = err?.message || "";
        if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("JWT expired") || errMsg.includes("Sesi tidak valid")) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setAuthToken(null);
          setUserId(null);
          setUserName("");
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("bookmark_change"));
        }
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

  const handleToggleAutoSave = async (checked: boolean) => {
    setAutoSave(checked);
    const updatedSettings = {
      ...settings,
      auto_save: checked
    };
    setSettings(updatedSettings);

    if (isLoggedIn && authToken) {
      setSavingStatus("saving");
      try {
        await saveWeddingData({
          data: {
            token: authToken,
            payload: {
              settings: updatedSettings,
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
      } catch (err: any) {
        console.error("Gagal sinkronisasi data.", err);
        setSavingStatus("error");
        const errMsg = err?.message || "";
        if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("JWT expired") || errMsg.includes("Sesi tidak valid")) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setAuthToken(null);
          setUserId(null);
          setUserName("");
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("bookmark_change"));
        }
      }
    }
  };

  // Handle Save Operation
  const triggerSave = async (silent = false) => {
    if (!isLoggedIn || !authToken) return;
    if (!silent) setSavingStatus("saving");

    try {
      await saveWeddingData({
        data: {
          token: authToken,
          payload: {
            settings: {
              ...settings,
              auto_save: autoSave
            },
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
    } catch (err: any) {
      console.error("Gagal sinkronisasi data.", err);
      setSavingStatus("error");
      const errMsg = err?.message || "";
      if (errMsg.includes("401") || errMsg.includes("Unauthorized") || errMsg.includes("JWT expired") || errMsg.includes("Sesi tidak valid")) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setAuthToken(null);
        setUserId(null);
        setUserName("");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("bookmark_change"));
      }
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

  const checklistTodos = todos.filter(t => !t.title.startsWith("LOGISTICS:"));
  const totalTodos = checklistTodos.length;
  const completedTodos = checklistTodos.filter(t => t.is_completed).length;
  const todoPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const logisticsTodos = todos.filter(t => t.title.startsWith("LOGISTICS:"));
  const totalLogistics = logisticsTodos.length;
  const completedLogistics = logisticsTodos.filter(t => {
    const meta = parseLogisticsNotes(t.notes);
    return meta.status === "Siap (Ready)";
  }).length;
  const logisticsPercentage = totalLogistics > 0 ? Math.round((completedLogistics / totalLogistics) * 100) : 0;

  const totalLogisticsEstimatedCost = logisticsTodos.reduce((acc, curr) => {
    const meta = parseLogisticsNotes(curr.notes);
    return acc + (meta.price || 0);
  }, 0);

  const totalLogisticsSpent = logisticsTodos.reduce((acc, curr) => {
    const meta = parseLogisticsNotes(curr.notes);
    return acc + (meta.status === "Siap (Ready)" ? (meta.price || 0) : 0);
  }, 0);

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
    requestConfirm(
      "Hapus Tugas",
      "Apakah Anda yakin ingin menghapus tugas persiapan pernikahan ini dari daftar?",
      () => {
        setTodos(prev => prev.filter(t => t.id !== id));
      }
    );
  };

  // Invite link clipboard utility
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const handleCopyInviteLink = (guestId: string) => {
    const inviteUrl = `${window.location.origin}/invite/${guestId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedGuestId(guestId);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

  // Handlers for Logistics
  const handleAddLogistics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogistics.title.trim()) return;

    const meta: LogisticsMeta = {
      status: newLogistics.status,
      source: newLogistics.source || undefined,
      price: newLogistics.price || undefined,
      notes: newLogistics.notes || undefined
    };

    const newItem: TodoItem = {
      id: "t_" + Date.now(),
      title: "LOGISTICS:" + newLogistics.title.trim(),
      is_completed: newLogistics.status === "Siap (Ready)",
      notes: buildLogisticsNotes(meta)
    };

    setTodos(prev => [newItem, ...prev]);
    setNewLogistics({ title: "", status: "Belum Dibeli", source: "", price: 0, notes: "" });
    setShowLogisticsForm(false);
  };

  const handleInitLogisticsTemplate = () => {
    const defaultItems = [
      { name: "Cincin Pernikahan", price: 5000000 },
      { name: "Seserahan: Perlengkapan Make-up & Skincare", price: 1500000 },
      { name: "Seserahan: Pakaian & Tas/Sepatu Hantaran", price: 2500000 },
      { name: "Mahar & Mas Kawin", price: 10000000 },
      { name: "Kotak Cincin & Hiasan Mahar", price: 500000 },
      { name: "Souvenir Pernikahan", price: 3000000 },
      { name: "Cetak Undangan Fisik", price: 1200000 },
      { name: "Seragam Keluarga & Panitia", price: 4000000 }
    ];

    const newTodos: TodoItem[] = defaultItems.map((item, index) => {
      const meta: LogisticsMeta = {
        status: "Belum Dibeli",
        price: item.price
      };
      return {
        id: `t_log_init_${Date.now()}_${index}`,
        title: "LOGISTICS:" + item.name,
        is_completed: false,
        notes: buildLogisticsNotes(meta)
      };
    });

    setTodos(prev => [...prev, ...newTodos]);
  };

  const updateLogisticsStatus = (id: string, status: LogisticsMeta["status"]) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const meta = parseLogisticsNotes(t.notes);
      meta.status = status;
      return {
        ...t,
        is_completed: status === "Siap (Ready)",
        notes: buildLogisticsNotes(meta)
      };
    }));
  };

  const handleDeleteLogistics = (id: string) => {
    requestConfirm(
      "Hapus Barang Logistik",
      "Apakah Anda yakin ingin menghapus barang logistik ini dari daftar belanja?",
      () => {
        setTodos(prev => prev.filter(t => t.id !== id));
      }
    );
  };

  const handleStartEditLogistics = (id: string, title: string, meta: LogisticsMeta) => {
    setEditingLogisticsId(id);
    setEditingLogisticsData({
      title: title.replace("LOGISTICS:", ""),
      source: meta.source || "",
      price: meta.price || 0,
      notes: meta.notes || ""
    });
  };

  const handleCancelEditLogistics = () => {
    setEditingLogisticsId(null);
    setEditingLogisticsData(null);
  };

  const handleSaveEditLogistics = (id: string) => {
    if (!editingLogisticsData) return;

    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const meta = parseLogisticsNotes(t.notes);
        const updatedMeta: LogisticsMeta = {
          ...meta,
          source: editingLogisticsData.source || undefined,
          price: editingLogisticsData.price || undefined,
          notes: editingLogisticsData.notes || undefined
        };
        return {
          ...t,
          title: "LOGISTICS:" + editingLogisticsData.title.trim(),
          notes: buildLogisticsNotes(updatedMeta)
        };
      }
      return t;
    }));

    setEditingLogisticsId(null);
    setEditingLogisticsData(null);
  };

  // CSV Export & Print Utilities
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportGuestsToCSV = () => {
    const headers = ["Nama Tamu", "Kategori", "Status RSVP", "Kontak", "Catatan"];
    const csvRows = [
      headers.join(","),
      ...guests.map(g => [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.category.replace(/"/g, '""')}"`,
        `"${g.rsvp_status}"`,
        `"${(g.contact_info || "").replace(/"/g, '""')}"`,
        `"${(g.notes || "").replace(/"/g, '""')}"`
      ].join(","))
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `daftar_tamu_pernikahan_${Date.now()}.csv`);
  };

  const exportBudgetToCSV = () => {
    const headers = ["Nama Kebutuhan", "Kategori", "Estimasi Biaya", "Biaya Riil", "Status Bayar"];
    const csvRows = [
      headers.join(","),
      ...budgets.map(b => [
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.category.replace(/"/g, '""')}"`,
        `"${b.estimated_cost}"`,
        `"${b.actual_cost}"`,
        `"${b.is_paid ? "Lunas" : "Belum Lunas"}"`
      ].join(","))
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `anggaran_pernikahan_${Date.now()}.csv`);
  };

  const exportLogisticsToCSV = () => {
    const headers = ["Nama Barang", "Status", "Sumber/Toko", "Harga", "Catatan"];
    const logisticsItems = todos.filter(t => t.title.startsWith("LOGISTICS:"));
    const csvRows = [
      headers.join(","),
      ...logisticsItems.map(t => {
        const meta = parseLogisticsNotes(t.notes);
        return [
          `"${t.title.replace("LOGISTICS:", "").replace(/"/g, '""')}"`,
          `"${meta.status}"`,
          `"${(meta.source || "").replace(/"/g, '""')}"`,
          `"${meta.price || 0}"`,
          `"${(meta.notes || "").replace(/"/g, '""')}"`
        ].join(",");
      })
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `logistik_pernikahan_${Date.now()}.csv`);
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
    requestConfirm(
      "Hapus Tamu Undangan",
      "Apakah Anda yakin ingin menghapus tamu ini dari daftar undangan pernikahan Anda?",
      () => {
        setGuests(prev => prev.filter(g => g.id !== id));
      }
    );
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
    requestConfirm(
      "Hapus Kebutuhan Anggaran",
      "Apakah Anda yakin ingin menghapus entri anggaran pengeluaran ini?",
      () => {
        setBudgets(prev => prev.filter(b => b.id !== id));
      }
    );
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
          <div className="absolute inset-0 flex items-center justify-center md:text-2xl">
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
              onChange={(e) => handleToggleAutoSave(e.target.checked)}
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
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 opacity-5 text-7xl translate-x-2 -translate-y-2">🔔</div>
          <div>
            <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Hari H Pernikahan</span>
            <input
              type="date"
              value={settings.wedding_date}
              onChange={(e) => setSettings(prev => ({ ...prev, wedding_date: e.target.value }))}
              className="text-xs font-mono font-bold mt-1.5 bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground cursor-pointer"
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
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
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
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
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
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
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
      <div className="flex border border-foreground/15 md:border-2 md:border-foreground rounded-xl bg-card overflow-hidden select-none shadow-sm overflow-x-auto">
        {(["dashboard", "checklist", "guests", "budget", "logistics"] as const).map((tab) => {
          const tabLabel = {
            dashboard: "📊 Dashboard",
            checklist: "📝 Tugas",
            guests: "👥 Tamu",
            budget: "💰 Anggaran",
            logistics: "📦 Logistik & Belanja"
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-2.5 md:py-3.5 text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-foreground/15 md:border-r-2 md:border-foreground last:border-r-0 transition-colors cursor-pointer text-center whitespace-nowrap ${activeTab === tab ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/5"
                }`}
            >
              {tabLabel[tab]}
            </button>
          );
        })}
      </div>

      {/* Tabs Panels Container */}
      <div id="wedding-planner-print-area" className="bg-card md:border-2 md:border-foreground border-none rounded-xl md:rounded-2xl p-3 md:p-6 shadow-none md:shadow-tactile">
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
                  <h3 className="font-display md:text-2xl uppercase">Dashboard Ringkasan</h3>
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
                      {todos.filter(t => !t.title.startsWith("LOGISTICS:") && !t.is_completed).slice(0, 3).map(todo => (
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
                      {todos.filter(t => !t.title.startsWith("LOGISTICS:") && !t.is_completed).length === 0 && (
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
                    <h3 className="font-display md:text-2xl uppercase">Tugas & Timeline</h3>
                    <p className="text-xs text-foreground/60 mt-1">Daftar persiapan pernikahan terperinci berdasarkan deadline.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                    .filter(t => !t.title.startsWith("LOGISTICS:"))
                    .filter(t => {
                      if (todoFilter === "completed") return t.is_completed;
                      if (todoFilter === "pending") return !t.is_completed;
                      return true;
                    })
                    .map(todo => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between border rounded-xl p-3 sm:p-4 transition-all ${todo.is_completed
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
                  {todos.filter(t => !t.title.startsWith("LOGISTICS:")).length === 0 && (
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
                    <h3 className="font-display md:text-2xl uppercase">Daftar Tamu & RSVP</h3>
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
                      onClick={exportGuestsToCSV}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Ekspor ke CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Cetak Laporan / PDF"
                    >
                      <Printer className="w-4 h-4" /> Cetak / PDF
                    </button>

                    <button
                      onClick={() => setShowGuestForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
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
                        <th className="p-2 sm:p-3">Nama Tamu</th>
                        <th className="p-2 sm:p-3">Kategori</th>
                        <th className="p-2 sm:p-3">Kontak</th>
                        <th className="p-2 sm:p-3">Status RSVP</th>
                        <th className="p-2 sm:p-3 text-right">Aksi</th>
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
                            <td className="p-2 sm:p-3 font-bold">{guest.name}</td>
                            <td className="p-2 sm:p-3">
                              <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                                {guest.category}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 font-mono text-foreground/75">{guest.contact_info || "-"}</td>
                            <td className="p-2 sm:p-3">
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
                            <td className="p-2 sm:p-3 text-right flex items-center justify-end gap-1.5">
                              {guest.id.startsWith("g_") ? (
                                <span className="text-[9px] text-foreground/40 font-bold font-mono uppercase select-none cursor-help" title="Simpan ke cloud untuk buat link">
                                  Belum Sync
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCopyInviteLink(guest.id)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${copiedGuestId === guest.id
                                    ? "text-emerald-500 bg-emerald-500/10"
                                    : "text-foreground/40 hover:text-primary hover:bg-primary/10"
                                    }`}
                                  title="Salin Link Undangan"
                                >
                                  {copiedGuestId === guest.id ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Hapus Tamu"
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
                    <h3 className="font-display md:text-2xl uppercase">Manajemen Anggaran</h3>
                    <p className="text-xs text-foreground/60 mt-1">Lacak pengeluaran estimasi dan realisasi vendor pernikahan.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                      onClick={exportBudgetToCSV}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Ekspor ke CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Cetak Laporan / PDF"
                    >
                      <Printer className="w-4 h-4" /> Cetak / PDF
                    </button>

                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
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
                        <th className="p-2 sm:p-3">Vendor / Keperluan</th>
                        <th className="p-2 sm:p-3">Kategori</th>
                        <th className="p-2 sm:p-3">Estimasi Biaya</th>
                        <th className="p-2 sm:p-3">Biaya Riil</th>
                        <th className="p-2 sm:p-3">Status Bayar</th>
                        <th className="p-2 sm:p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10">
                      {budgets
                        .filter(b => budgetFilterCategory === "all" || b.category === budgetFilterCategory)
                        .map(budget => (
                          <tr key={budget.id} className="hover:bg-foreground/5 transition-colors">
                            <td className="p-2 sm:p-3 font-bold">{budget.name}</td>
                            <td className="p-2 sm:p-3">
                              <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                                {budget.category}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 font-mono">{formatIDR(budget.estimated_cost)}</td>
                            <td className="p-2 sm:p-3 font-mono text-primary font-bold">{formatIDR(budget.actual_cost)}</td>
                            <td className="p-2 sm:p-3">
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
                            <td className="p-2 sm:p-3 text-right">
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

            {/* Tab: Logistics Tracker */}
            {activeTab === "logistics" && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-foreground/10 pb-4">
                  <div>
                    <h3 className="font-display md:text-2xl uppercase">Logistik & Belanja</h3>
                    <p className="text-xs text-foreground/60 mt-1">Kelola barang bawaan, mahar, seserahan, suvenir, dan perlengkapan lainnya.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
                    <select
                      value={logisticsFilterStatus}
                      onChange={(e) => setLogisticsFilterStatus(e.target.value)}
                      className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground"
                    >
                      <option value="all">Semua Status</option>
                      <option value="Belum Dibeli">Belum Dibeli</option>
                      <option value="Sedang Diproses">Sedang Diproses</option>
                      <option value="Siap (Ready)">Siap (Ready)</option>
                    </select>

                    <button
                      onClick={exportLogisticsToCSV}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Ekspor ke CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Cetak Laporan / PDF"
                    >
                      <Printer className="w-4 h-4" /> Cetak / PDF
                    </button>

                    <button
                      onClick={() => setShowLogisticsForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Barang
                    </button>
                  </div>
                </div>

                {/* Logistics Stats Bento Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
                    <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Total Barang</span>
                    <span className="md:text-2xl font-bold block mt-1">{totalLogistics}</span>
                  </div>
                  <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
                    <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Barang Siap</span>
                    <span className="md:text-2xl font-bold text-emerald-600 block mt-1">{completedLogistics}</span>
                  </div>
                  <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
                    <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Estimasi Belanja</span>
                    <span className="md:text-2xl font-bold block mt-1">{formatIDR(totalLogisticsEstimatedCost)}</span>
                  </div>
                  <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
                    <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Realisasi</span>
                    <span className="md:text-2xl font-bold text-primary block mt-1">{formatIDR(totalLogisticsSpent)}</span>
                  </div>
                </div>

                {/* Add Logistics Form */}
                {showLogisticsForm && (
                  <form onSubmit={handleAddLogistics} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tambah Barang Logistik & Belanja</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Barang / Keperluan</label>
                        <input
                          type="text"
                          required
                          value={newLogistics.title}
                          onChange={(e) => setNewLogistics(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Contoh: Cincin Kawin Emas 10gr"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Status Awal</label>
                        <select
                          value={newLogistics.status}
                          onChange={(e) => setNewLogistics(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary font-bold cursor-pointer"
                        >
                          <option value="Belum Dibeli">Belum Dibeli</option>
                          <option value="Sedang Diproses">Sedang Diproses</option>
                          <option value="Siap (Ready)">Siap (Ready)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Harga Estimasi (IDR)</label>
                        <input
                          type="number"
                          value={newLogistics.price}
                          onChange={(e) => setNewLogistics(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Sumber / Toko / Vendor</label>
                        <input
                          type="text"
                          value={newLogistics.source}
                          onChange={(e) => setNewLogistics(prev => ({ ...prev, source: e.target.value }))}
                          placeholder="Contoh: Toko Emas Melati"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Catatan Tambahan</label>
                        <input
                          type="text"
                          value={newLogistics.notes}
                          onChange={(e) => setNewLogistics(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Contoh: Perlu diukur ulang sebelum tanggal 10"
                          className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLogisticsForm(false)}
                        className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        Simpan Barang
                      </button>
                    </div>
                  </form>
                )}

                {/* Default Template Initialization Banner */}
                {totalLogistics === 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
                    <Package className="w-12 h-12 text-primary mx-auto opacity-75 animate-bounce" />
                    <div>
                      <h4 className="font-bold text-sm uppercase">Mulai dengan Templat Bawaan</h4>
                      <p className="text-xs text-foreground/60 max-w-md mx-auto mt-1">
                        Belum ada barang di daftar logistik Anda. Gunakan templat bawaan untuk memuat item standar seperti Cincin, Mahar, Seserahan, Souvenir, dan lainnya.
                      </p>
                    </div>
                    <button
                      onClick={handleInitLogisticsTemplate}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Inisialisasi Templat Bawaan
                    </button>
                  </div>
                )}

                {/* Logistics List Table */}
                {totalLogistics > 0 && (
                  <div className="overflow-x-auto border border-foreground/15 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs select-none">
                      <thead>
                        <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
                          <th className="p-2 sm:p-3">Nama Barang</th>
                          <th className="p-2 sm:p-3">Status</th>
                          <th className="p-2 sm:p-3">Sumber / Toko</th>
                          <th className="p-2 sm:p-3">Harga Estimasi</th>
                          <th className="p-2 sm:p-3">Catatan</th>
                          <th className="p-2 sm:p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/10">
                        {logisticsTodos
                          .filter(t => {
                            if (logisticsFilterStatus === "all") return true;
                            const meta = parseLogisticsNotes(t.notes);
                            return meta.status === logisticsFilterStatus;
                          })
                          .map(t => {
                            const meta = parseLogisticsNotes(t.notes);
                            const cleanTitle = t.title.replace("LOGISTICS:", "");
                            return (
                              <tr key={t.id} className="hover:bg-foreground/5 transition-colors">
                                <td className="p-2 sm:p-3 font-bold">
                                  {editingLogisticsId === t.id && editingLogisticsData ? (
                                    <input
                                      type="text"
                                      value={editingLogisticsData.title}
                                      onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, title: e.target.value } : null)}
                                      className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground font-bold outline-none w-full"
                                    />
                                  ) : (
                                    cleanTitle
                                  )}
                                </td>
                                <td className="p-2 sm:p-3">
                                  <select
                                    value={meta.status}
                                    onChange={(e) => updateLogisticsStatus(t.id, e.target.value as any)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${meta.status === "Siap (Ready)"
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold"
                                      : meta.status === "Sedang Diproses"
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold"
                                        : "bg-foreground/5 border-foreground/10 text-foreground/60 font-bold"
                                      }`}
                                  >
                                    <option value="Belum Dibeli">Belum Dibeli</option>
                                    <option value="Sedang Diproses">Sedang Diproses</option>
                                    <option value="Siap (Ready)">Siap (Ready)</option>
                                  </select>
                                </td>
                                <td className="p-2 sm:p-3 text-foreground/75 font-medium">
                                  {editingLogisticsId === t.id && editingLogisticsData ? (
                                    <input
                                      type="text"
                                      value={editingLogisticsData.source}
                                      onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, source: e.target.value } : null)}
                                      className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground outline-none w-full"
                                      placeholder="Vendor / Sumber"
                                    />
                                  ) : (
                                    meta.source || "-"
                                  )}
                                </td>
                                <td className="p-2 sm:p-3 font-mono font-bold">
                                  {editingLogisticsId === t.id && editingLogisticsData ? (
                                    <input
                                      type="number"
                                      value={editingLogisticsData.price || ""}
                                      onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                                      className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground font-mono outline-none w-28"
                                      placeholder="Harga"
                                    />
                                  ) : (
                                    formatIDR(meta.price || 0)
                                  )}
                                </td>
                                <td className="p-2 sm:p-3 text-foreground/60 italic">
                                  {editingLogisticsId === t.id && editingLogisticsData ? (
                                    <input
                                      type="text"
                                      value={editingLogisticsData.notes}
                                      onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                      className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground outline-none w-full"
                                      placeholder="Catatan"
                                    />
                                  ) : (
                                    meta.notes || "-"
                                  )}
                                </td>
                                <td className="p-2 sm:p-3 text-right">
                                  <div className="flex justify-end gap-1 select-none">
                                    {editingLogisticsId === t.id ? (
                                      <>
                                        <button
                                          onClick={() => handleSaveEditLogistics(t.id)}
                                          className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                          title="Simpan Perubahan"
                                        >
                                          <Check className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                          onClick={handleCancelEditLogistics}
                                          className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                          title="Batal"
                                        >
                                          <X className="w-4.5 h-4.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleStartEditLogistics(t.id, t.title, meta)}
                                          className="p-1.5 text-foreground/40 hover:text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
                                          title="Edit Barang"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLogistics(t.id)}
                                          className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                          title="Hapus Barang"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Printable Report Styles */}
            <style dangerouslySetInnerHTML={{
              __html: `
              @media print {
                body {
                  background: #ffffff !important;
                  color: #000000 !important;
                }
                body > div {
                  display: none !important;
                }
                #wedding-planner-print-area {
                  display: block !important;
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  background: transparent !important;
                }
                button, select, input, form, .no-print, [title="Ekspor ke CSV"], [title="Cetak Laporan / PDF"], [title="Undang Tamu"], [title="Tambah Barang"] {
                  display: none !important;
                }
                .text-foreground\/60, .text-foreground\/50, .text-foreground\/75 {
                  color: #333333 !important;
                }
              }
            `}} />

            {/* Reusable confirmation modal overlay */}
            <ConfirmationDialog
              isOpen={confirmState.isOpen}
              title={confirmState.title}
              message={confirmState.message}
              onConfirm={confirmState.onConfirm}
              onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
          </>
        )}
      </div>

    </div>
  );
}

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

export default WeddingPlanner;
