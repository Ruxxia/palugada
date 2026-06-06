export interface WeddingSettings {
  wedding_date: string;
  total_budget: number;
  auto_save?: boolean;
  wedding_title?: string;
  groom_name?: string;
  bride_name?: string;
  wedding_location?: string;
  location_maps_url?: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  estimated_cost: number;
  actual_cost: number;
  is_paid: boolean;
}

export interface GuestItem {
  id: string;
  name: string;
  category: string;
  rsvp_status: "Pending" | "Attending" | "Declined";
  contact_info?: string;
  notes?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  due_date?: string;
  is_completed: boolean;
  notes?: string;
}

export interface LogisticsMeta {
  status: "Belum Dibeli" | "Sedang Diproses" | "Siap (Ready)";
  source?: string;
  price?: number;
  notes?: string;
}
