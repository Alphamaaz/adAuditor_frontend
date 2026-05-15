"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAudit } from "@/hooks/use-audits";
import { auditsApi } from "@/lib/audits";
import { getErrorMessage } from "@/lib/api";

const STEPS = [
  { icon: "✓", label: "Ad data imported successfully" },
  { icon: "⚙", label: "Running rule engine across all platforms" },
  { icon: "📊", label: "Analysing campaigns, ad groups & creatives" },
  { icon: "🏆", label: "Computing health scores & category grades" },
  { icon: "✨", label: "Generating AI-powered insights & recommendations" },
];

const STEP_DURATIONS = [0, 5000, 12000, 20000, 29000];

export default function AuditingPage() {
  const params = useParams<{ auditId: string }>();
  const router = useRouter();
  const { data: audit } = useAudit(params.auditId);

  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const ran = useRef(false);

  // Trigger audit once on mount
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // If already PROCESSING or COMPLETED (page refresh), skip run()
    if (
      audit?.status === "PROCESSING" ||
      audit?.status === "COMPLETED" ||
      audit?.status === "FAILED"
    ) {
      return;
    }

    auditsApi.run(params.auditId).catch((err) => {
      setError(getErrorMessage(err));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.auditId]);

  // Animate steps forward on a fixed timer (visual magic)
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DURATIONS.slice(1).forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, i]);
          setActiveStep(i + 1);
        }, delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Elapsed seconds counter
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Redirect when audit finishes
  useEffect(() => {
    if (audit?.status === "COMPLETED" || audit?.status === "FAILED") {
      router.push(`/dashboard/audits/${params.auditId}/results`);
    }
  }, [audit?.status, params.auditId, router]);

  const progressPct = Math.min(
    ((activeStep + 1) / STEPS.length) * 100,
    audit?.status === "COMPLETED" ? 100 : 95
  );

  return (
    <>
      <style>{`
        @keyframes orb-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          33%       { transform: translateY(-18px) translateX(8px); opacity: 0.9; }
          66%       { transform: translateY(8px) translateX(-12px); opacity: 0.6; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          40%       { transform: translateY(14px) translateX(-10px); opacity: 0.8; }
          70%       { transform: translateY(-10px) translateX(16px); opacity: 0.5; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50%       { transform: translateY(-22px) translateX(-6px); opacity: 0.7; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes step-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tick-pop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .orb-spin   { animation: orb-spin 6s linear infinite; }
        .orb-pulse  { animation: orb-pulse 3s ease-in-out infinite; }
        .float-1    { animation: float-1 7s ease-in-out infinite; }
        .float-2    { animation: float-2 9s ease-in-out infinite; }
        .float-3    { animation: float-3 11s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #171717 30%, #7c5cfc 50%, #171717 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .step-in  { animation: step-in 0.4s ease-out both; }
        .tick-pop { animation: tick-pop 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        @keyframes progress-fill {
          from { width: 4%; }
        }
      `}</style>

      <div className="min-h-screen bg-[#f7f4ef] relative overflow-hidden">
        {/* Floating background particles */}
        <div
          className="float-1 pointer-events-none absolute left-[12%] top-[20%] h-4 w-4 rounded-full bg-[#7c5cfc] opacity-30"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="float-2 pointer-events-none absolute right-[15%] top-[35%] h-6 w-6 rounded-full bg-[#06b6d4] opacity-20"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="float-3 pointer-events-none absolute left-[25%] bottom-[25%] h-3 w-3 rounded-full bg-[#f59e0b] opacity-25"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="float-1 pointer-events-none absolute right-[22%] bottom-[30%] h-5 w-5 rounded-full bg-[#10b981] opacity-20"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="float-2 pointer-events-none absolute left-[55%] top-[15%] h-3 w-3 rounded-full bg-[#f43f5e] opacity-20"
          style={{ animationDelay: "3.5s" }}
        />
        <div
          className="float-3 pointer-events-none absolute right-[8%] top-[60%] h-4 w-4 rounded-full bg-[#7c5cfc] opacity-20"
          style={{ animationDelay: "6s" }}
        />

        {/* Nav */}
        <nav className="border-b border-[#e5ddd0] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
              AdAuditor Pro
            </Link>
            <span className="text-sm text-[#6b7280]">Audit in progress…</span>
          </div>
        </nav>

        {/* Main */}
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {error ? (
              <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
                  !
                </div>
                <h2 className="text-lg font-semibold text-[#171717]">Couldn&rsquo;t start audit</h2>
                <p className="mt-2 text-sm text-[#6b7280]">{error}</p>
                <Link
                  href={`/dashboard/audits/${params.auditId}/upload`}
                  className="mt-6 inline-block rounded-xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d2d]"
                >
                  Back to upload
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e5ddd0] bg-white p-8 shadow-sm">

                {/* Orb */}
                <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
                  {/* Outer ring */}
                  <div className="orb-spin absolute inset-0 rounded-full border-4 border-dashed border-[#e5ddd0]" />
                  {/* Inner gradient orb */}
                  <div className="orb-pulse absolute inset-4 rounded-full bg-gradient-to-br from-[#7c5cfc] via-[#06b6d4] to-[#10b981] blur-[2px]" />
                  {/* Logo text */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl">✦</span>
                  </div>
                  {/* Orbiting dot */}
                  <div
                    className="orb-spin absolute inset-0 flex items-start justify-center pt-1"
                    style={{ animationDuration: "3s" }}
                  >
                    <div className="h-3 w-3 rounded-full bg-white shadow-md ring-2 ring-[#7c5cfc]" />
                  </div>
                </div>

                {/* Headline */}
                <div className="text-center">
                  <h1 className="shimmer-text text-2xl font-bold">
                    AI Audit in Progress
                  </h1>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    Sit tight — we&rsquo;re crunching your ad data.
                  </p>
                </div>

                {/* Steps */}
                <div className="mt-8 space-y-3">
                  {STEPS.map((step, i) => {
                    const isDone = completedSteps.includes(i);
                    const isActive = activeStep === i && !isDone;
                    const isPending = i > activeStep;

                    return (
                      <div
                        key={i}
                        className={`step-in flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ${
                          isDone
                            ? "bg-[#f0fdf4] border border-[#bbf7d0]"
                            : isActive
                            ? "bg-[#faf5ff] border border-[#e9d5ff]"
                            : "bg-[#fafaf9] border border-transparent opacity-50"
                        }`}
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        {/* Icon */}
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? "bg-[#22c55e] text-white tick-pop"
                              : isActive
                              ? "bg-[#7c5cfc] text-white"
                              : "bg-[#e5e7eb] text-[#9ca3af]"
                          }`}
                        >
                          {isDone ? "✓" : isActive ? (
                            <span className="block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            String(i + 1)
                          )}
                        </div>

                        {/* Label */}
                        <span
                          className={`text-sm ${
                            isDone
                              ? "font-medium text-[#15803d]"
                              : isActive
                              ? "font-medium text-[#6d28d9]"
                              : "text-[#9ca3af]"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="mt-6 overflow-hidden rounded-full bg-[#f3f4f6] h-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7c5cfc] to-[#06b6d4] transition-all duration-[1500ms] ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-[#9ca3af]">
                    Elapsed: {elapsed}s
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Typically 30–90 seconds
                  </p>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
