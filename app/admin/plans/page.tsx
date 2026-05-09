"use client";

import { useAdminPlans } from "@/hooks/use-admin";
import { 
  Plus, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Clock,
  Layers,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function AdminPlansPage() {
  const { data: plans, isLoading } = useAdminPlans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Subscription Plans</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage product pricing, audit limits, and feature availability.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#183c2d]">
          <Plus size={18} />
          Create New Plan
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1f4d3a]" />
            <p className="mt-2 text-[#6b7280]">Loading plans...</p>
          </div>
        ) : plans?.map((plan) => (
          <div key={plan.id} className="flex flex-col rounded-xl border border-[#e5ddd0] bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f3f4f6]">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.isActive ? 'Active' : 'Archived'}
                </span>
                <span className="text-xs text-[#9ca3af] font-mono">{plan.slug}</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-[#171717]">{plan.name}</h3>
              <p className="mt-2 text-sm text-[#6b7280] line-clamp-2">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#171717]">${plan.priceCents / 100}</span>
                <span className="text-sm text-[#6b7280]">/month</span>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Layers size={16} />
                    <span>Audit Limit</span>
                  </div>
                  <span className="font-bold text-[#171717]">{plan.monthlyAuditLimit || 'Unlimited'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#6b7280]">
                    <Clock size={16} />
                    <span>History Retention</span>
                  </div>
                  <span className="font-bold text-[#171717]">{plan.historyDays || 'Forever'} days</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f3f4f6]">
                <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Enabled Features</p>
                <ul className="mt-3 space-y-2">
                  {Object.entries(plan.features || {}).filter(([key, val]) => val && key !== 'notes').map(([key]) => (
                    <li key={key} className="flex items-center gap-2 text-xs text-[#374151]">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#faf9f7] border-t border-[#e5ddd0]">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1cac0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors">
                <Settings2 size={16} />
                Edit Plan Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
