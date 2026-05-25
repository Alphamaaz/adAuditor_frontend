"use client";

import Link from "next/link";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useSignup, useGoogleAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const MetaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" fill="#1877F2"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" fill="currentColor"/>
  </svg>
);

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", organizationName: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const signup = useSignup();
  const googleAuth = useGoogleAuth();

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signup.mutate(
      { name: form.name || undefined, email: form.email, password: form.password, organizationName: form.organizationName || undefined },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setError("");
      googleAuth.mutate(tokenResponse.access_token, {
        onError: (err) => setError(getErrorMessage(err)),
      });
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  const isPending = signup.isPending || googleAuth.isPending;

  const strength = (() => {
    const v = form.password;
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
          <div className="auth-badge"><span className="auth-badge-dot" />Free 14-day trial</div>
          <h1 className="auth-title">Create your <span className="em">account</span></h1>
          <p className="auth-sub">Start recovering wasted ad spend in minutes. No credit card required.</p>

          {error && <div className="auth-alert-error">{error}</div>}

          <div className="social-row">
            <button type="button" onClick={() => handleGoogleSignup()} disabled={isPending} className="social-btn" title="Continue with Google">
              <GoogleIcon />Google
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = `${API_URL}/api/auth/meta/init`; }}
              disabled={isPending}
              className="social-btn meta"
              title="Continue with Facebook"
            >
              <MetaIcon />Facebook
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = `${API_URL}/api/auth/tiktok/init`; }}
              disabled={isPending}
              className="social-btn tiktok"
              title="Continue with TikTok"
            >
              <TikTokIcon />TikTok
            </button>
          </div>

          <div className="divider-or"><span>or</span></div>

          <form onSubmit={handleSubmit}>
            <div className="af">
              <label className="af-label">Full name</label>
              <input className="af-input" type="text" value={form.name} onChange={set("name")} placeholder="Jamie Liu" />
            </div>
            <div className="af">
              <label className="af-label">Work email <span style={{ color: "var(--coral)" }}>*</span></label>
              <input className="af-input" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required />
            </div>
            <div className="af">
              <label className="af-label">Password <span style={{ color: "var(--coral)" }}>*</span></label>
              <input className="af-input with-icon" type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Create a password" required minLength={8} />
              <button type="button" className="af-toggle" onClick={() => setShowPass(s => !s)} aria-label="Toggle password">{showPass ? "🙈" : "👁"}</button>
              {form.password && (
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
              <label className="af-label">Organization name</label>
              <input className="af-input" type="text" value={form.organizationName} onChange={set("organizationName")} placeholder="My Agency" />
            </div>
            <button type="submit" className="btn-full" disabled={isPending}>
              {signup.isPending ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <p className="auth-footer">Already have an account? <Link href="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
