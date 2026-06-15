"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useLogin, useGoogleAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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

const OAUTH_ERRORS: Record<string, string> = {
  meta_auth_failed: "Meta sign-in was cancelled or failed. Please try again.",
  meta_token_failed: "Couldn't complete Meta sign-in. Please try again.",
  meta_userinfo_failed: "Couldn't retrieve your Meta account info. Please try again.",
  meta_no_email: "Your Meta account doesn't have a verified email address. Please sign up with email instead.",
  tiktok_auth_failed: "TikTok sign-in was cancelled or failed. Please try again.",
  tiktok_token_failed: "Couldn't complete TikTok sign-in. Please try again.",
  tiktok_userinfo_failed: "Couldn't retrieve your TikTok account info. Please try again.",
  tiktok_no_email: "Your TikTok account doesn't have a verified email address. Please sign up with email instead.",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const login = useLogin();
  const googleAuth = useGoogleAuth();
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";
  const oauthErrorKey = searchParams.get("error") ?? "";
  const oauthErrorMsg = OAUTH_ERRORS[oauthErrorKey] ?? "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { email, password },
      { onError: (err) => setError(getErrorMessage(err)) }
    );
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setError("");
      googleAuth.mutate(tokenResponse.access_token, {
        onError: (err) => setError(getErrorMessage(err)),
      });
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  const isPending = login.isPending || googleAuth.isPending;

  return (
    <div className="auth-wrap">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="auth-shell">
        <Link href="/" className="auth-home-link">Go to home</Link>
        <div className="auth-card">
          <div className="auth-badge"><span className="auth-badge-dot" />Welcome back</div>
          <h1 className="auth-title">Log in to <span className="em">AdAdvisor</span></h1>
          <p className="auth-sub">Pick up where you left off and keep your campaigns on key.</p>

          {justReset && (
            <div className="auth-alert-success">Password reset successfully. Log in with your new password.</div>
          )}
          {(error || oauthErrorMsg) && (
            <div className="auth-alert-error">
              {error || oauthErrorMsg}
              {(error || oauthErrorMsg).toLowerCase().includes("verify your email") && (
                <> <Link href={`/verify-email?email=${encodeURIComponent(email)}`} className="auth-link" style={{ fontSize: 13 }}>Verify now</Link></>
              )}
            </div>
          )}

          <div className="social-row">
            {GOOGLE_CLIENT_ID && (
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isPending}
              className="social-btn"
              title="Continue with Google"
            >
              <GoogleIcon />{googleAuth.isPending ? "Signing in…" : "Google"}
            </button>
            )}
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
              <label className="af-label">Email address</label>
              <input className="af-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="af">
              <label className="af-label">Password</label>
              <input className="af-input with-icon" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" className="af-toggle" onClick={() => setShowPass(s => !s)} aria-label="Toggle password">
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            <div className="auth-row-between">
              <span />
              <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="auth-link">Forgot password?</Link>
            </div>
            <button type="submit" className="btn-full" disabled={isPending}>
              {login.isPending ? "Logging in…" : "Log in →"}
            </button>
          </form>

          <p className="auth-footer">Don&apos;t have an account? <Link href="/signup" className="auth-link">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
