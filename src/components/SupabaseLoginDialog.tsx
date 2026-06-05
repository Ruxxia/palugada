import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/lib/api/auth.functions";

interface SupabaseLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}

export function SupabaseLoginDialog({ open, onOpenChange, initialMode = "login" }: SupabaseLoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRegistering(initialMode === "register");
    }
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Silakan masukkan email dan password");
      return;
    }

    if (isRegistering && password.length < 6) {
      toast.error("Password minimal harus 6 karakter");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const result = await registerUser({ data: { email, password } });
        if (result.access_token) {
          localStorage.setItem("auth_token", result.access_token);
          localStorage.setItem("user", JSON.stringify(result.user));
          toast.success("Registrasi berhasil dan otomatis masuk!");
          window.dispatchEvent(new Event("storage"));
          handleClose();
        } else {
          toast.success("Registrasi sukses! Silakan cek inbox email Anda untuk verifikasi.");
          handleClose();
        }
      } else {
        const result = await loginUser({ data: { email, password } });
        localStorage.setItem("auth_token", result.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Login berhasil!");
        window.dispatchEvent(new Event("storage"));
        handleClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Proses gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegistering ? "Daftar Akun Baru" : "Masuk ke Akun"}</DialogTitle>
          <DialogDescription>
            {isRegistering 
              ? "Buat akun Palugada baru untuk menyimpan progres rencana pernikahan Anda." 
              : "Masukkan email dan password Anda untuk masuk."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
            {loading 
              ? (isRegistering ? "Mendaftarkan..." : "Memproses Masuk...") 
              : (isRegistering ? "Daftar Akun" : "Masuk")}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              {isRegistering 
                ? "Sudah punya akun? Login di sini" 
                : "Belum punya akun? Register dulu yuk"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
