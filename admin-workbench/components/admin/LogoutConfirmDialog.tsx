"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuthStore } from "@/lib/admin/auth-store";

type LogoutConfirmDialogProps = {
  children: React.ReactNode;
  onAfterLogout?: () => void;
};

export function LogoutConfirmDialog({ children, onAfterLogout }: LogoutConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    onAfterLogout?.();
    setOpen(false);
    router.replace("/login");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border border-line bg-panel p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand">Confirm Logout</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted">
            You will be signed out of the admin dashboard and redirected to the login screen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
          >
            Logout
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
