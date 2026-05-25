"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useResetPassword } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    resetPassword.mutate(
      { email, otp, newPassword },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const strength = (() => {
    const v = newPassword;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] || "";
  const strengthClass = strength <= 1 ? "weak" : strength <= 3 ? "med" : "strong";

  return (
    <div className="auth-wrap">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-shell">
        <div className="auth-card">
          <div className="icon-circle lime">🔑</div>
          <h1 className="auth-title" style={{ textAlign: "center" }}>Set a new <span className="em">password</span></h1>
          <p className="auth-sub" style={{ textAlign: "center" }}>
            Enter the code we sent to <strong>{email || "your email"}</strong> and choose a new password.
          </p>

          {error && <div className="auth-alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!emailFromQuery && (
              <div className="af">
                <label className="af-label">Email</label>
                <input className="af-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}
            <div className="af">
              <label className="af-label">Reset code</label>
              <input
                className="otp-single"
                style={{ marginBottom: 0 }}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
              />
            </div>
            <div className="af">
              <label className="af-label">New password</label>
              <input className="af-input with-icon" type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required minLength={8} />
              <button type="button" className="af-toggle" onClick={() => setShowNew(s => !s)} aria-label="Toggle">{showNew ? "🙈" : "👁"}</button>
              {newPassword && (
                <div className="strength-wrap">
                  <div className="strength-bars">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`strength-bar ${i < strength ? strengthClass : ""}`} />
                    ))}
                  </div>
                  <span className="strength-text">{strengthLabel} password</span>
                </div>
              )}
            </div>
            <div className="af">
              <label className="af-label">Confirm password</label>
              <input className="af-input with-icon" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required />
              <button type="button" className="af-toggle" onClick={() => setShowConfirm(s => !s)} aria-label="Toggle">{showConfirm ? "🙈" : "👁"}</button>
            </div>
            <button type="submit" className="btn-full" disabled={resetPassword.isPending || otp.length < 6}>
              {resetPassword.isPending ? "Resetting…" : "Update password →"}
            </button>
          </form>

          <p className="auth-footer">Back to <Link href="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
