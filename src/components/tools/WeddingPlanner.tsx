import { useState, useEffect, useRef } from "react";
import { getWeddingData, saveWeddingData } from "../../lib/api/wedding.functions";
import { RefreshCw } from "lucide-react";

// Types & Utilities
import { WeddingSettings, BudgetItem, GuestItem, TodoItem, LogisticsMeta } from "./weddingplanner/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_BUDGETS,
  DEFAULT_GUESTS,
  DEFAULT_TODOS,
  parseLogisticsNotes,
  buildLogisticsNotes
} from "./weddingplanner/utils";

// Subcomponents
import SyncHeader from "./weddingplanner/SyncHeader";
import WeddingHeader from "./weddingplanner/WeddingHeader";
import BentoStats from "./weddingplanner/BentoStats";
import DashboardTab from "./weddingplanner/DashboardTab";
import ChecklistTab from "./weddingplanner/ChecklistTab";
import GuestsTab from "./weddingplanner/GuestsTab";
import BudgetTab from "./weddingplanner/BudgetTab";
import LogisticsTab from "./weddingplanner/LogisticsTab";
import ConfirmationDialog from "./weddingplanner/ConfirmationDialog";

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

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  // Header editing and local identity states
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [weddingTitle, setWeddingTitle] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wedding_title") || "Wedding Planner & Tracker";
    }
    return "Wedding Planner & Tracker";
  });
  const [groomName, setGroomName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wedding_groom_name") || "Pengantin Pria";
    }
    return "Pengantin Pria";
  });
  const [brideName, setBrideName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wedding_bride_name") || "Pengantin Wanita";
    }
    return "Pengantin Wanita";
  });

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
        const res = await getWeddingData({ data: { token: authToken } });

        if (res.settings) {
          setSettings(res.settings);
          if (res.settings.wedding_title) {
            setWeddingTitle(res.settings.wedding_title);
            localStorage.setItem("wedding_title", res.settings.wedding_title);
          }
          if (res.settings.groom_name) {
            setGroomName(res.settings.groom_name);
            localStorage.setItem("wedding_groom_name", res.settings.groom_name);
          }
          if (res.settings.bride_name) {
            setBrideName(res.settings.bride_name);
            localStorage.setItem("wedding_bride_name", res.settings.bride_name);
          }
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
      auto_save: checked,
      wedding_title: weddingTitle,
      groom_name: groomName,
      bride_name: brideName
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
              auto_save: autoSave,
              wedding_title: weddingTitle,
              groom_name: groomName,
              bride_name: brideName
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
  }, [settings, budgets, guests, todos, autoSave, weddingTitle, groomName, brideName]);
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

  // Handlers for Todos
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
  };

  const handleAddTodo = (title: string, due_date: string, notes: string) => {
    const newItem: TodoItem = {
      id: "t_" + Date.now(),
      title,
      due_date: due_date || undefined,
      is_completed: false,
      notes: notes || undefined
    };
    setTodos(prev => [newItem, ...prev]);
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

  // Handlers for Logistics
  const handleAddLogistics = (title: string, status: LogisticsMeta["status"], source: string, price: number, notes: string) => {
    const meta: LogisticsMeta = {
      status,
      source: source || undefined,
      price: price || undefined,
      notes: notes || undefined
    };

    const newItem: TodoItem = {
      id: "t_" + Date.now(),
      title: "LOGISTICS:" + title.trim(),
      is_completed: status === "Siap (Ready)",
      notes: buildLogisticsNotes(meta)
    };

    setTodos(prev => [newItem, ...prev]);
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

  const handleUpdateLogisticsMeta = (id: string, title: string, meta: LogisticsMeta) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          title: "LOGISTICS:" + title.trim(),
          notes: buildLogisticsNotes(meta)
        };
      }
      return t;
    }));
  };

  // Handlers for Guests
  const handleAddGuest = (name: string, category: string, contactInfo: string) => {
    const newItem: GuestItem = {
      id: "g_" + Date.now(),
      name,
      category,
      rsvp_status: "Pending",
      contact_info: contactInfo || undefined
    };
    setGuests(prev => [newItem, ...prev]);
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
  const handleAddBudget = (name: string, category: string, estimatedCost: number, actualCost: number, isPaid: boolean) => {
    const newItem: BudgetItem = {
      id: "b_" + Date.now(),
      name,
      category,
      estimated_cost: estimatedCost,
      actual_cost: actualCost,
      is_paid: isPaid
    };
    setBudgets(prev => [newItem, ...prev]);
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
      <SyncHeader
        userName={userName}
        autoSave={autoSave}
        onToggleAutoSave={handleToggleAutoSave}
        savingStatus={savingStatus}
        onTriggerSave={() => triggerSave()}
      />

      <div className="space-y-6 pb-24 md:pb-6">
        {/* Print Area Header */}
        <div id="wedding-planner-print-area" className="hidden print:block font-serif text-center pb-8 border-b-4 border-double border-foreground select-none">
          <h1 className="text-4xl uppercase tracking-wider font-extrabold">Wedding Planner & Tracker</h1>
          <p className="text-sm italic mt-2">Laporan Persiapan Pernikahan Resmi</p>
          <p className="text-[10px] font-mono mt-1 text-foreground/75">Dibuat otomatis via Palugada SuperApp</p>
        </div>

        {/* Header Section (Editable Title & Names) */}
        <WeddingHeader
          isEditingHeader={isEditingHeader}
          onToggleEditing={() => setIsEditingHeader(!isEditingHeader)}
          weddingTitle={weddingTitle}
          onTitleChange={setWeddingTitle}
          groomName={groomName}
          onGroomNameChange={setGroomName}
          brideName={brideName}
          onBrideNameChange={setBrideName}
        />

        {/* Bento Stats & Countdown */}
        <BentoStats
          settings={settings}
          onSettingsChange={setSettings}
          countdown={countdown}
          totalEstimatedBudget={totalEstimatedBudget}
          totalActualBudget={totalActualBudget}
          totalGuests={totalGuests}
          guestsAttending={guestsAttending}
          guestsDeclined={guestsDeclined}
          guestsPending={guestsPending}
          completedTodos={completedTodos}
          totalTodos={totalTodos}
          todoPercentage={todoPercentage}
        />

        {/* Main Content Tabs Navigation (Desktop View) */}
        <div className="hidden md:flex border border-foreground/15 md:border-2 md:border-foreground rounded-xl bg-card overflow-hidden select-none shadow-sm overflow-x-auto">
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
                className={`flex-1 py-3 px-2.5 md:py-3.5 text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-foreground/15 md:border-r-2 md:border-foreground last:border-r-0 transition-colors cursor-pointer text-center whitespace-nowrap ${
                  activeTab === tab ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/5"
                }`}
              >
                {tabLabel[tab]}
              </button>
            );
          })}
        </div>

        {/* Tabs Panels Container */}
        <div id="wedding-planner-print-area" className="bg-card md:border-2 md:border-foreground border-none rounded-xl md:rounded-2xl p-3 md:p-6 shadow-none md:shadow-tactile">
          {activeTab === "dashboard" && (
            <DashboardTab
              settings={settings}
              totalActualBudget={totalActualBudget}
              totalPaidBudget={totalPaidBudget}
              todos={todos}
              onToggleTodo={toggleTodo}
              onSettingsChange={setSettings}
            />
          )}

          {activeTab === "checklist" && (
            <ChecklistTab
              todos={todos}
              onToggleTodo={toggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onAddTodo={handleAddTodo}
            />
          )}

          {activeTab === "guests" && (
            <GuestsTab
              guests={guests}
              onAddGuest={handleAddGuest}
              onUpdateGuestRSVP={updateGuestRSVP}
              onDeleteGuest={handleDeleteGuest}
            />
          )}

          {activeTab === "budget" && (
            <BudgetTab
              budgets={budgets}
              onAddBudget={handleAddBudget}
              onToggleBudgetPaid={toggleBudgetPaid}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {activeTab === "logistics" && (
            <LogisticsTab
              todos={todos}
              onAddLogistics={handleAddLogistics}
              onUpdateLogisticsStatus={updateLogisticsStatus}
              onDeleteLogistics={handleDeleteLogistics}
              onUpdateLogisticsMeta={handleUpdateLogisticsMeta}
              onInitLogisticsTemplate={handleInitLogisticsTemplate}
            />
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
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation (Native App Feel) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-foreground/10 py-2.5 px-4 flex justify-around items-center md:hidden pb-safe">
        {(["dashboard", "checklist", "guests", "budget", "logistics"] as const).map((tab) => {
          const tabLabel = {
            dashboard: "Dashboard",
            checklist: "Tugas",
            guests: "Tamu",
            budget: "Anggaran",
            logistics: "Logistik"
          };
          const TabIcon = {
            dashboard: () => <span className="text-base">📊</span>,
            checklist: () => <span className="text-base">📝</span>,
            guests: () => <span className="text-base">👥</span>,
            budget: () => <span className="text-base">💰</span>,
            logistics: () => <span className="text-base">📦</span>
          };
          const IconComponent = TabIcon[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === tab ? "bg-foreground text-background scale-110 shadow-sm" : "text-foreground/60"
              }`}>
                <IconComponent />
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase transition-colors ${
                activeTab === tab ? "text-foreground" : "text-foreground/40"
              }`}>
                {tabLabel[tab]}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

export default WeddingPlanner;
