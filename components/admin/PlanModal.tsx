"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2, Plus } from "lucide-react";
import { useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/use-admin";

interface PlanModalProps {
  plan?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ plan, isOpen, onClose }: PlanModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    priceCents: number;
    monthlyAuditLimit: number | null;
    historyDays: number | null;
    isActive: boolean;
    features: Record<string, any>;
  }>({
    name: "",
    description: "",
    priceCents: 0,
    monthlyAuditLimit: 10,
    historyDays: 30,
    isActive: true,
    features: {
      standardAudits: true,
      aiInsights: false,
      prioritySupport: false,
      unlimitedHistory: false
    } as Record<string, any>
  });

  // Prefill data when the plan or modal open state changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: plan?.name || "",
        description: plan?.description || "",
        priceCents: plan?.priceCents || 0,
        monthlyAuditLimit: plan?.monthlyAuditLimit || 10,
        historyDays: plan?.historyDays || 30,
        isActive: plan?.isActive ?? true,
        features: plan?.features || ({
          standardAudits: true,
          aiInsights: false,
          prioritySupport: false,
          unlimitedHistory: false
        } as Record<string, any>)
      });
    }
  }, [plan, isOpen]);

  const [isDeleting, setIsDeleting] = useState(false);

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const isPending = createPlan.isPending || updatePlan.isPending || deletePlan.isPending;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan) {
      updatePlan.mutate(
        { id: plan.id, data: formData }, 
        { 
          onSuccess: () => {
            onClose();
          } 
        }
      );
    } else {
      createPlan.mutate(
        formData, 
        { 
          onSuccess: () => {
            onClose();
          } 
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      deletePlan.mutate(plan.id, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold text-[#171717]">
            {plan ? "Edit Subscription Plan" : "Create New Plan"}
          </h2>
          <div className="flex items-center gap-2">
            {plan && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Plan"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-semibold text-[#374151]">Plan Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-[#d1cac0] px-4 py-2 outline-none focus:ring-2 focus:ring-[#1f4d3a]/20"
                placeholder="e.g. Pro Monthly"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-semibold text-[#374151]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-[#d1cac0] px-4 py-2 outline-none focus:ring-2 focus:ring-[#1f4d3a]/20"
                rows={2}
                placeholder="Describe what's included in this plan..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]">Price (in cents)</label>
              <input
                type="number"
                required
                value={formData.priceCents}
                onChange={(e) => setFormData({ ...formData, priceCents: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-[#d1cac0] px-4 py-2 outline-none focus:ring-2 focus:ring-[#1f4d3a]/20"
                placeholder="9900 = $99.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]">Monthly Audit Limit</label>
              <input
                type="number"
                required
                value={formData.monthlyAuditLimit}
                onChange={(e) => setFormData({ ...formData, monthlyAuditLimit: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-[#d1cac0] px-4 py-2 outline-none focus:ring-2 focus:ring-[#1f4d3a]/20"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af]">Features</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New feature key..."
                  className="rounded-md border border-[#d1cac0] px-2 py-1 text-xs outline-none focus:border-[#1f4d3a]"
                  id="new-feature-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        const key = val.charAt(0).toLowerCase() + val.slice(1).replace(/\s+/g, '');
                        setFormData({
                          ...formData,
                          features: { ...formData.features, [key]: true }
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('new-feature-input') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val) {
                      const key = val.charAt(0).toLowerCase() + val.slice(1).replace(/\s+/g, '');
                      setFormData({
                        ...formData,
                        features: { ...formData.features, [key]: true }
                      });
                      input.value = '';
                    }
                  }}
                  className="rounded bg-[#1f4d3a] p-1 text-white hover:bg-[#183c2d]"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(formData.features).map((feature) => (
                <div key={feature} className="group relative flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={(formData.features as Record<string, any>)[feature]}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...(formData.features as Record<string, any>), [feature]: e.target.checked }
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-[#1f4d3a] focus:ring-[#1f4d3a]"
                  />
                  <span className="text-sm font-medium text-[#374151]">
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...formData.features };
                      delete next[feature];
                      setFormData({ ...formData, features: next });
                    }}
                    className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow-sm group-hover:block hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6b7280] hover:text-[#171717]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-50"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {plan ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
