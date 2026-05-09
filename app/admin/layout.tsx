"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import {
  Users,
  LayoutDashboard,
  Building2,
  CreditCard,
  History,
  ShieldCheck,
  LogOut,
  Power,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f4d3a] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.user.internalRole !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-6 text-center">
        <ShieldCheck className="h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-[#171717]">Access Denied</h1>
        <p className="mt-2 text-[#6b7280]">
          You do not have permission to access the administrative dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#183c2d]"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
    {
      label: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
      active: pathname.startsWith("/admin/organizations"),
    },
    {
      label: "Subscription Plans",
      href: "/admin/plans",
      icon: CreditCard,
      active: pathname.startsWith("/admin/plans"),
    },
    {
      label: "Audit Logs",
      href: "/admin/logs",
      icon: History,
      active: pathname.startsWith("/admin/logs"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-[#e5ddd0] bg-white shadow-sm">
        <div className="flex h-16 items-center border-b border-[#e5ddd0] px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f4d3a] text-white">
              <ShieldCheck size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#171717]">
              Admin Panel
            </span>
          </Link>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? "bg-[#eff7f1] text-[#1f4d3a]"
                  : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]"
              }`}
            >
              <item.icon
                size={18}
                className={item.active ? "text-[#1f4d3a]" : "text-[#9ca3af]"}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-[#e5ddd0] p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]"
          >
            <LogOut size={18} className="text-[#9ca3af]" />
            Exit Admin
          </Link>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Power size={18} />
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e5ddd0] bg-white/80 px-8 backdrop-blur-md">
          <h2 className="text-sm font-medium text-[#6b7280]">
            System Administrator: {user.user.email}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
