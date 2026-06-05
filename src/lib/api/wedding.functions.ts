import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Helper to decode JWT sub claim (user UUID) on the server without external libs
function getUserIdFromToken(token: string): string {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Format token JWT tidak valid");
    
    // Support Node.js Buffer for base64 decoding
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);
    if (!payload.sub) throw new Error("Token JWT tidak memiliki sub claim");
    return payload.sub;
  } catch (err) {
    console.error("Gagal men-decode auth token:", err);
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }
}

// Get Supabase configuration from environment variables
function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase credentials not configured in environment variables");
  }
  return { url, anonKey };
}

// Helper for HTTP requests to Supabase PostgREST REST API
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const token = options.headers && (options.headers as any)["Authorization"];
  
  const headers: HeadersInit = {
    apikey: anonKey,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    console.error(`Supabase request error (${endpoint}):`, errorMsg);
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }

  // Some operations (like DELETE or single UPSERT with Prefer) might return empty body
  if (response.status === 204) return null;
  
  return response.json();
}

// ==========================================
// 1. Fetch Server Function
// ==========================================
export const getWeddingData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };

    try {
      // Fetch settings, budgets, guests, and todos in parallel
      const [settingsRes, budgetsRes, guestsRes, todosRes] = await Promise.all([
        supabaseRequest(`wedding_settings?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`wedding_budgets?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`wedding_guests?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`wedding_todos?user_id=eq.${userId}`, { headers: authHeader }),
      ]);

      return {
        settings: settingsRes && settingsRes.length > 0 ? settingsRes[0] : null,
        budgets: budgetsRes || [],
        guests: guestsRes || [],
        todos: todosRes || [],
      };
    } catch (err: any) {
      console.error("Error fetching wedding data:", err);
      throw new Error(err.message || "Gagal mengambil data dari Supabase");
    }
  });

// ==========================================
// 2. Save/Sync Server Function
// ==========================================
export const saveWeddingData = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      payload: z.object({
        settings: z.object({
          wedding_date: z.string(),
          total_budget: z.number(),
        }),
        budgets: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            category: z.string(),
            estimated_cost: z.number(),
            actual_cost: z.number(),
            is_paid: z.boolean(),
          })
        ),
        guests: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            category: z.string(),
            rsvp_status: z.enum(["Pending", "Attending", "Declined"]),
            contact_info: z.string().optional(),
            notes: z.string().optional(),
          })
        ),
        todos: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            due_date: z.string().optional(),
            is_completed: z.boolean(),
            notes: z.string().optional(),
          })
        ),
      }),
    })
  )
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };
    const { payload } = data;

    try {
      // 1. Sync Wedding Settings (Upsert)
      await supabaseRequest("wedding_settings", {
        method: "POST",
        headers: {
          ...authHeader,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          user_id: userId,
          wedding_date: payload.settings.wedding_date,
          total_budget: payload.settings.total_budget,
          updated_at: new Date().toISOString(),
        }),
      });

      // 2. Fetch existing records to calculate deletes
      const [dbBudgets, dbGuests, dbTodos] = await Promise.all([
        supabaseRequest(`wedding_budgets?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`wedding_guests?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`wedding_todos?user_id=eq.${userId}`, { headers: authHeader }),
      ]);

      const dbBudgetIds = new Set<string>((dbBudgets || []).map((b: any) => String(b.id)));
      const dbGuestIds = new Set<string>((dbGuests || []).map((g: any) => String(g.id)));
      const dbTodoIds = new Set<string>((dbTodos || []).map((t: any) => String(t.id)));

      // 3. Process Budgets
      const budgetsToUpsert = payload.budgets.map((b) => {
        const isTempId = b.id.startsWith("b_");
        return {
          ...(isTempId ? {} : { id: b.id }),
          user_id: userId,
          name: b.name,
          category: b.category,
          estimated_cost: b.estimated_cost,
          actual_cost: b.actual_cost,
          is_paid: b.is_paid,
        };
      });

      const budgetIdsToKeep = new Set(payload.budgets.map((b) => b.id));
      const budgetIdsToDelete = [...dbBudgetIds].filter((id) => !budgetIdsToKeep.has(id));

      // 4. Process Guests
      const guestsToUpsert = payload.guests.map((g) => {
        const isTempId = g.id.startsWith("g_");
        return {
          ...(isTempId ? {} : { id: g.id }),
          user_id: userId,
          name: g.name,
          category: g.category,
          rsvp_status: g.rsvp_status,
          contact_info: g.contact_info || null,
          notes: g.notes || null,
        };
      });

      const guestIdsToKeep = new Set(payload.guests.map((g) => g.id));
      const guestIdsToDelete = [...dbGuestIds].filter((id) => !guestIdsToKeep.has(id));

      // 5. Process Todos
      const todosToUpsert = payload.todos.map((t) => {
        const isTempId = t.id.startsWith("t_");
        return {
          ...(isTempId ? {} : { id: t.id }),
          user_id: userId,
          title: t.title,
          due_date: t.due_date || null,
          is_completed: t.is_completed,
          notes: t.notes || null,
        };
      });

      const todoIdsToKeep = new Set(payload.todos.map((t) => t.id));
      const todoIdsToDelete = [...dbTodoIds].filter((id) => !todoIdsToKeep.has(id));

      // 6. Perform DB Operations in parallel
      const operations: Promise<any>[] = [];

      // Upserts
      if (budgetsToUpsert.length > 0) {
        operations.push(
          supabaseRequest("wedding_budgets", {
            method: "POST",
            headers: { ...authHeader, Prefer: "resolution=merge-duplicates" },
            body: JSON.stringify(budgetsToUpsert),
          })
        );
      }
      if (guestsToUpsert.length > 0) {
        operations.push(
          supabaseRequest("wedding_guests", {
            method: "POST",
            headers: { ...authHeader, Prefer: "resolution=merge-duplicates" },
            body: JSON.stringify(guestsToUpsert),
          })
        );
      }
      if (todosToUpsert.length > 0) {
        operations.push(
          supabaseRequest("wedding_todos", {
            method: "POST",
            headers: { ...authHeader, Prefer: "resolution=merge-duplicates" },
            body: JSON.stringify(todosToUpsert),
          })
        );
      }

      // Deletes
      if (budgetIdsToDelete.length > 0) {
        operations.push(
          supabaseRequest(`wedding_budgets?id=in.(${budgetIdsToDelete.join(",")})`, {
            method: "DELETE",
            headers: authHeader,
          })
        );
      }
      if (guestIdsToDelete.length > 0) {
        operations.push(
          supabaseRequest(`wedding_guests?id=in.(${guestIdsToDelete.join(",")})`, {
            method: "DELETE",
            headers: authHeader,
          })
        );
      }
      if (todoIdsToDelete.length > 0) {
        operations.push(
          supabaseRequest(`wedding_todos?id=in.(${todoIdsToDelete.join(",")})`, {
            method: "DELETE",
            headers: authHeader,
          })
        );
      }

      await Promise.all(operations);

      return { success: true };
    } catch (err: any) {
      console.error("Error saving wedding data:", err);
      throw new Error(err.message || "Gagal menyimpan perubahan ke database");
    }
  });
