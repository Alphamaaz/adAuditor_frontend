"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useVerifyEmail, useResendOtp } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const verify = useVerifyEmail();
  const resend = useResendOtp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verify.mutate(
      { email, otp },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const handleResend = () => {
    setError("");
    setResendMessage("");
    resend.mutate(
      { email },
      {
        onSuccess: (data) => setResendMessage(data.message),
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  return (
    <div className="auth-wrap">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-shell">
        <div className="auth-card">
          <Link href="/login" className="back-link">← Back to login</Link>
          <div className="icon-circle lime">✉️</div>
          <h1 className="auth-title" style={{ textAlign: "center" }}>Verify your <span className="em">email</span></h1>
          <p className="auth-sub" style={{ textAlign: "center" }}>
            We sent a 6-digit code to <strong>{email || "your email"}</strong>. Enter it below.
          </p>

          {error && <div className="auth-alert-error">{error}</div>}
          {resendMessage && <div className="auth-alert-success">{resendMessage}</div>}

          <form onSubmit={handleSubmit}>
            {!emailFromQuery && (
              <div className="af">
                <label className="af-label">Email</label>
                <input className="af-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}
            <input
              className="otp-single"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
            />
            <button type="submit" className="btn-full" disabled={verify.isPending || otp.length < 6}>
              {verify.isPending ? "Verifying…" : "Verify email →"}
            </button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button type="button" onClick={handleResend} disabled={resend.isPending || !email} className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {resend.isPending ? "Sending…" : "Resend code"}
            </button>
            <Link href="/login" className="auth-link-muted">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
