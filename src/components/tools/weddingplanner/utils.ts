import { WeddingSettings, BudgetItem, GuestItem, TodoItem, LogisticsMeta } from "./types";

export const DEFAULT_SETTINGS: WeddingSettings = {
  wedding_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 6 months from now
  total_budget: 100000000, // 100 Juta IDR
  auto_save: false,
};

export const DEFAULT_BUDGETS: BudgetItem[] = [];
export const DEFAULT_GUESTS: GuestItem[] = [];
export const DEFAULT_TODOS: TodoItem[] = [];

export const CATEGORIES_BUDGET = ["Gedung", "Katering", "Pakaian", "Dokumentasi", "Undangan", "Souvenir", "Lainnya"];
export const CATEGORIES_GUEST = ["Keluarga Utama", "Keluarga Besar", "Teman Dekat", "Rekan Kerja", "Tetangga", "Lainnya"];

export const parseLogisticsNotes = (notesStr?: string): LogisticsMeta => {
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

export const buildLogisticsNotes = (meta: LogisticsMeta): string => {
  return JSON.stringify(meta);
};

export const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
};

export const downloadCSV = (content: string, filename: string) => {
  if (typeof window === "undefined") return;
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

