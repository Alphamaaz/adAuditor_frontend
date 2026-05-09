"use client";

import { useState } from "react";
import { useAdminOrgs, useAdminPlans, useUpdateOrgPlan } from "@/hooks/use-admin";
import { 
  Search, 
  Building2, 
  User, 
  CreditCard, 
  BarChart3,
  Calendar,
  ChevronRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

export default function AdminOrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: response, isLoading } = useAdminOrgs({ page, search, limit: 10 });
  const { data: plans } = useAdminPlans();
  const updatePlan = useUpdateOrgPlan();

  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState<string>("");
  const [reason, setReason] = useState("");

  const handleOpenModal = (org: any) => {
    setSelectedOrg(org);
    setNewPlanId(org.subscription?.planId || "");
    setReason("");
    setIsModalOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedOrg) return;
    
    await updatePlan.mutateAsync({
      organizationId: selectedOrg.id,
      planId: newPlanId || null,
      reason
    });
    
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Organizations</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Monitor workspaces, member counts, and subscription status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="relative rounded-xl border border-[#e5ddd0] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
          <input
            type="text"
            placeholder="Search organizations..."
            className="w-full rounded-lg border border-[#e5ddd0] bg-[#f9fafb] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#1f4d3a] focus:ring-1 focus:ring-[#1f4d3a]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Organization Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-2 py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1f4d3a]" />
            <p className="mt-2 text-[#6b7280]">Loading organizations...</p>
          </div>
        ) : response?.data.map((org) => (
          <div key={org.id} className="rounded-xl border border-[#e5ddd0] bg-white p-6 shadow-sm hover:border-[#d1cac0] transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eff7f1] text-[#1f4d3a]">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#171717]">{org.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      Owned by: {org.owner?.name || org.owner?.email}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                org.subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                org.subscription?.status === 'TRIALING' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {org.subscription?.status || 'NO PLAN'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-y border-[#f3f4f6] py-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Members</p>
                <p className="mt-1 text-lg font-bold text-[#171717]">{org.memberCount}</p>
              </div>
              <div className="text-center border-x border-[#f3f4f6]">
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Audits</p>
                <p className="mt-1 text-lg font-bold text-[#171717]">{org.auditCount}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">Plan</p>
                <p className="mt-1 text-sm font-bold text-[#1f4d3a]">{org.subscription?.planName || 'Free'}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-[#6b7280]">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                Created {format(new Date(org.createdAt), 'MMM d, yyyy')}
              </div>
              <button 
                onClick={() => handleOpenModal(org)}
                className="flex items-center gap-1 font-semibold text-[#1f4d3a] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Manage Plan
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {response && response.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-md border border-[#d1cac0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[#6b7280]">
            Page {page} of {response.pagination.pages}
          </span>
          <button
            disabled={page >= response.pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-md border border-[#d1cac0] bg-white px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Plan Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4">
              <h3 className="text-lg font-bold text-[#171717]">Manage Organization Plan</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-[#9ca3af] hover:bg-gray-100 hover:text-[#171717]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-[#6b7280]">Organization</p>
                <p className="font-semibold text-[#171717]">{selectedOrg?.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">Assign Plan</label>
                <select 
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="w-full rounded-lg border border-[#e5ddd0] bg-[#faf9f7] px-3 py-2 text-sm outline-none focus:border-[#1f4d3a] focus:ring-1 focus:ring-[#1f4d3a]"
                >
                  <option value="">Revoke / Revert to Free</option>
                  {plans?.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — ${plan.priceCents / 100}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">Reason / Note (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Manual upgrade for enterprise client"
                  rows={3}
                  className="w-full rounded-lg border border-[#e5ddd0] bg-[#faf9f7] px-3 py-2 text-sm outline-none focus:border-[#1f4d3a] focus:ring-1 focus:ring-[#1f4d3a]"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 flex gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Overriding a plan will bypass Stripe billing. The organization will have the selected plan features until the override is removed.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-lg border border-[#e5ddd0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePlan}
                disabled={updatePlan.isPending}
                className="flex-1 rounded-lg bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatePlan.isPending && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
