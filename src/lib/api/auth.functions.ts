import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
        console.error("Supabase login error payload:", error);
        throw new Error(error.error_description || error.message || error.error || "Login failed");
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

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(6) }))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured");
    }

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
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
        console.error("Supabase registration error payload:", error);
        throw new Error(error.message || error.error_description || error.error || "Registration failed");
      }

      const signupData = await response.json();
      return {
        success: true,
        access_token: signupData.access_token || null,
        user: signupData.user,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  });

