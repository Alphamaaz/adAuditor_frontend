"use client";

import { useCurrentUser } from "@/hooks/use-auth";
import { useStopImpersonation } from "@/hooks/use-admin";
import { LogOut, ShieldAlert } from "lucide-react";

export function ImpersonationBanner() {
  const { data: auth } = useCurrentUser();
  const stopImpersonation = useStopImpersonation();

  if (!auth?.isImpersonating) return null;

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-between bg-[#1f4d3a] px-4 py-2 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldAlert size={16} className="text-yellow-400" />
        <span>
          You are currently impersonating <span className="font-bold underline">{auth.user.name || auth.user.email}</span>
        </span>
      </div>
      
      <button
        onClick={() => stopImpersonation.mutate()}
        disabled={stopImpersonation.isPending}
        className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
      >
        <LogOut size={14} />
        {stopImpersonation.isPending ? "Restoring..." : "Return to Admin"}
      </button>
    </div>
  );
}
