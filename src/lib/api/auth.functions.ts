import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured");
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || error.message || "Login failed");
      }

      const authData = await response.json();
      return {
        success: true,
        access_token: authData.access_token,
        user: authData.user,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  });
