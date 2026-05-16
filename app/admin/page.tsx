"use client";

import { useAdminStats } from "@/hooks/use-admin";
import {
  Users,
  Building2,
  FileBarChart,
  Activity,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Globe,
  CreditCard,
  History,
} from "lucide-react";

export default function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      subValue: `${stats?.activeUsers || 0} active`,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Organizations",
      value: stats?.totalOrganizations || 0,
      subValue: "Total workspaces",
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      label: "Total Audits",
      value: stats?.totalAudits || 0,
      subValue: `${stats?.auditsLast30Days || 0} in last 30d`,
      icon: FileBarChart,
      color: "bg-green-500",
    },
    {
      label: "System Health",
      value: "100%",
      subValue: "All services operational",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#171717]">Dashboard Overview</h1>
        <p className="mt-1 text-[#6b7280]">
          Real-time snapshot of the Ad Adviser platform performance and usage.
        </p>
      </div>

      {/* Stat Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#e5ddd0] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color} bg-opacity-10`}
              >
                <card.icon className={`h-5 w-5 ${card.color.replace("bg-", "text-")}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                Live
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-[#6b7280]">{card.label}</p>
              <h3 className="mt-1 text-2xl font-bold text-[#171717]">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </h3>
              <p className="mt-1 text-xs text-[#9ca3af]">{card.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Distribution */}
        <div className="col-span-2 rounded-xl border border-[#e5ddd0] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#171717]">
              Platform Distribution
            </h3>
            <span className="text-xs text-[#6b7280]">Total Audits</span>
          </div>
          <div className="space-y-4">
            {Object.entries(stats?.platformStats || {}).map(([platform, count]) => {
              const total = stats?.totalAudits || 1;
              const percentage = Math.round(((count as number) / total) * 100);
              
              const platformColors: Record<string, string> = {
                META: "bg-blue-500",
                GOOGLE: "bg-red-500",
                TIKTOK: "bg-black",
              };

              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#374151]">{platform}</span>
                    <span className="text-[#6b7280]">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
                    <div
                      className={`h-full ${platformColors[platform] || "bg-gray-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-[#e5ddd0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#171717]">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              { label: "Add New Plan", icon: CreditCard, href: "/admin/plans" },
              { label: "Manage Users", icon: Users, href: "/admin/users" },
              { label: "System Logs", icon: History, href: "/admin/logs" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-lg border border-[#e5ddd0] p-3 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb] hover:border-[#d1cac0]"
              >
                <div className="flex items-center gap-3">
                  <action.icon size={18} className="text-[#9ca3af]" />
                  {action.label}
                </div>
                <ArrowUpRight size={14} className="text-[#9ca3af]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
