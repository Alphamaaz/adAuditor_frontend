"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAuthSessions,
  useChangePassword,
  useCurrentUser,
  useLogout,
  useRevokeOtherSessions,
  useUpdateProfile,
} from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function SettingsPage() {
  const router = useRouter();
  const { data: auth, isLoading } = useCurrentUser();
  const { data: sessions = [] } = useAuthSessions();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const revokeOtherSessions = useRevokeOtherSessions();
  const logout = useLogout();

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    if (!isLoading && !auth) {
      router.replace("/login");
    }
  }, [auth, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="text-sm text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  if (!auth) return null;

  const user = auth.user;
  const organization = auth.organizations[0];
  const canEditOrganization = organization?.role === "OWNER";

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    const formData = new FormData(event.currentTarget);
    const nextName = String(formData.get("name") || "").trim();
    const nextOrganizationName = String(
      formData.get("organizationName") || ""
    ).trim();

    try {
      await updateProfile.mutateAsync({
        name: nextName || undefined,
        organizationName: canEditOrganization
          ? nextOrganizationName || undefined
          : undefined,
      });
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed. Other sessions were revoked.");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  };

  const onRevokeOtherSessions = async () => {
    setSessionMessage("");
    setSessionError("");

    try {
      const result = await revokeOtherSessions.mutateAsync();
      setSessionMessage(`${result.data.revokedCount} session(s) revoked.`);
    } catch (err) {
      setSessionError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            AdAuditor Pro
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
            >
              Dashboard
            </Link>
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef] disabled:opacity-60"
            >
              {logout.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#171717]">
            Account settings
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Manage your login profile, organization details, password, and
            active sessions.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#171717]">Profile</h2>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Role" value={user.internalRole} />
              <InfoItem label="Last login" value={formatDate(user.lastLoginAt)} />
            </div>

            <form onSubmit={onProfileSubmit} className="mt-6 grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151]">
                  Full name
                </label>
                <input
                  name="name"
                  defaultValue={user.name || ""}
                  className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151]">
                  Organization name
                </label>
                <input
                  name="organizationName"
                  defaultValue={organization?.name || ""}
                  disabled={!canEditOrganization}
                  className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20 disabled:opacity-60"
                />
                {!canEditOrganization && (
                  <p className="mt-2 text-xs text-[#6b7280]">
                    Only organization owners can update this field.
                  </p>
                )}
              </div>

              {profileError && <Alert tone="error" message={profileError} />}
              {profileMessage && <Alert tone="success" message={profileMessage} />}

              <div>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d] disabled:opacity-60"
                >
                  {updateProfile.isPending ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-lg font-semibold text-[#171717]">
                  Business profile
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                  These onboarding answers are used as default context for each
                  audit and AI report.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="rounded-md border border-[#d1cac0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f7f4ef]"
              >
                Edit business profile
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#171717]">
              Change password
            </h2>
            <form onSubmit={onPasswordSubmit} className="mt-6 grid gap-4">
              <PasswordInput
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              {passwordError && <Alert tone="error" message={passwordError} />}
              {passwordMessage && <Alert tone="success" message={passwordMessage} />}

              <div>
                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="rounded-md bg-[#171717] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                  {changePassword.isPending ? "Changing..." : "Change password"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-lg font-semibold text-[#171717]">
                  Active sessions
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Review where your account is signed in and revoke old sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={onRevokeOtherSessions}
                disabled={revokeOtherSessions.isPending}
                className="rounded-md border border-[#d1cac0] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f7f4ef] disabled:opacity-60"
              >
                {revokeOtherSessions.isPending
                  ? "Revoking..."
                  : "Revoke other sessions"}
              </button>
            </div>

            {sessionError && <Alert tone="error" message={sessionError} />}
            {sessionMessage && <Alert tone="success" message={sessionMessage} />}

            <div className="mt-5 divide-y divide-[#ece7df] rounded-md border border-[#eee7dc]">
              {sessions.length === 0 ? (
                <div className="p-4 text-sm text-[#6b7280]">
                  No active sessions found.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">
                        {session.isCurrent ? "Current session" : "Signed-in session"}
                      </p>
                      <p className="mt-1 text-xs text-[#6b7280]">
                        {session.userAgent || "Unknown browser"}
                      </p>
                      <p className="mt-1 text-xs text-[#9ca3af]">
                        IP: {session.ipAddress || "Unknown"} | Created:{" "}
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                    <span className="rounded bg-[#f7f4ef] px-2 py-1 text-xs font-semibold text-[#374151]">
                      Expires {formatDate(session.expiresAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#eee7dc] bg-[#faf9f7] p-3">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 break-words font-semibold text-[#171717]">{value}</p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151]">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-[#d1cac0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#171717] outline-none focus:border-[#1f4d3a] focus:ring-2 focus:ring-[#1f4d3a]/20"
      />
    </div>
  );
}

function Alert({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        tone === "success"
          ? "border-[#b8d9c3] bg-[#eff7f1] text-[#1f4d3a]"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}
