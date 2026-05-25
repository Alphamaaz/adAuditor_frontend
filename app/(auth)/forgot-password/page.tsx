"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForgotPassword } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [error, setError] = useState("");

  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    forgotPassword.mutate(
      { email },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  return (
    <div className="auth-wrap">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-shell">
        <div className="auth-card">
          <Link href="/login" className="back-link">← Back to login</Link>
          <div className="icon-circle">🔒</div>
          <h1 className="auth-title" style={{ textAlign: "center" }}>Forgot <span className="em">password?</span></h1>
          <p className="auth-sub" style={{ textAlign: "center" }}>No worries. Enter your email and we&apos;ll send you a reset code.</p>

          {error && <div className="auth-alert-error">{error}</div>}

          {forgotPassword.isSuccess ? (
            <div className="auth-alert-success">
              Reset code sent! Check your inbox and follow the link to reset your password.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="af">
                <label className="af-label">Email address</label>
                <input className="af-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <button type="submit" className="btn-full" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? "Sending…" : "Send reset code →"}
              </button>
            </form>
          )}

          <p className="auth-footer">Remembered it? <Link href="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
