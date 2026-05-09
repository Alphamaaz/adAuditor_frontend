"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserStatus, useImpersonateUser } from "@/hooks/use-admin";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Calendar,
  ExternalLink,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: response, isLoading } = useAdminUsers({ page, search, limit: 10 });
  const updateStatus = useUpdateUserStatus();
  const impersonate = useImpersonateUser();
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleImpersonate = (userId: string) => {
    impersonate.mutate({ userId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">User Management</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage all platform users, their roles, and status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#e5ddd0] bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-[#e5ddd0] bg-[#f9fafb] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#1f4d3a] focus:ring-1 focus:ring-[#1f4d3a]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-[#e5ddd0] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-xl border border-[#e5ddd0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5ddd0] bg-[#faf9f7]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">User</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Role & Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Organizations</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ddd0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#6b7280]">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    <span className="mt-2 block">Loading users...</span>
                  </td>
                </tr>
              ) : response?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-[#6b7280]">
                    <div className="flex flex-col items-center">
                      <Search className="h-10 w-10 text-[#d1cac0] mb-3" />
                      <p className="font-medium text-[#171717]">No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                      <div className="mt-4 text-[10px] text-gray-400 font-mono">
                        Total: {response?.pagination?.total || '0'} | 
                        Data: {response?.data?.length || '0'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : response?.data.map((user) => (
                <tr key={user.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f4d3a] text-xs font-bold text-white">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#171717]">{user.name || "N/A"}</div>
                        <div className="flex items-center gap-1 text-xs text-[#6b7280]">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className={user.internalRole === 'SUPER_ADMIN' ? 'text-red-500' : 'text-blue-500'} />
                        <span className="text-xs font-medium text-[#374151]">{user.internalRole}</span>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#374151]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#9ca3af]" />
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {(user.organizations || []).slice(0, 3).map((org) => (
                        <div key={org.id} title={org.name} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600">
                          {org.name[0]}
                        </div>
                      ))}
                      {(user.organizations || []).length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-400">
                          +{(user.organizations || []).length - 3}
                        </div>
                      )}
                      {(user.organizations || []).length === 0 && (
                        <span className="text-xs text-[#9ca3af]">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleImpersonate(user.id)}
                        disabled={user.internalRole === 'SUPER_ADMIN' || impersonate.isPending}
                        className="rounded-md bg-[#1f4d3a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#183c2d] disabled:opacity-50"
                      >
                        {impersonate.isPending && selectedUser === user.id ? '...' : 'Impersonate'}
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="p-1 rounded-md hover:bg-gray-100 text-[#6b7280]"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {selectedUser === user.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#e5ddd0] bg-white py-1 shadow-lg z-20">
                            {user.status === 'ACTIVE' ? (
                              <button 
                                onClick={() => {
                                  updateStatus.mutate({ userId: user.id, status: 'SUSPENDED' });
                                  setSelectedUser(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <UserX size={16} /> Suspend User
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  updateStatus.mutate({ userId: user.id, status: 'ACTIVE' });
                                  setSelectedUser(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                              >
                                <UserCheck size={16} /> Activate User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#e5ddd0] bg-[#faf9f7] px-6 py-4">
          <div className="text-sm text-[#6b7280]">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, response?.pagination.total || 0)}</span> of <span className="font-medium">{response?.pagination.total || 0}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-md border border-[#d1cac0] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= (response?.pagination.pages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="rounded-md border border-[#d1cac0] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
