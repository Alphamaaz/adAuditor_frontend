"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useBranding, useUpdateBranding, useUploadLogo, useDeleteLogo } from "@/hooks/use-branding";
import { getErrorMessage } from "@/lib/api";

const DEFAULT_COLOR = "#0F3A2C";
const MAX_LOGO_BYTES = 500 * 1024;

export default function BrandingSettingsPage() {
  const { data: branding, isLoading } = useBranding();
  const updateBranding = useUpdateBranding();
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();

  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [initialized, setInitialized] = useState(false);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form once branding loads
  if (!initialized && branding) {
    setCompanyName(branding.companyName ?? "");
    setTagline(branding.tagline ?? "");
    setPreparedBy(branding.preparedBy ?? "");
    setWebsite(branding.website ?? "");
    setPrimaryColor(branding.primaryColor ?? DEFAULT_COLOR);
    setInitialized(true);
  }

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      await updateBranding.mutateAsync({ companyName, tagline, preparedBy, website, primaryColor });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaveStatus("error");
    }
  };

  const handleLogoFile = async (file: File) => {
    setLogoError(null);
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 500 KB.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setLogoError("Use PNG, JPEG, WebP, or SVG.");
      return;
    }
    try {
      await uploadLogo.mutateAsync(file);
    } catch (err) {
      setLogoError(getErrorMessage(err));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  };

  const currentLogo = branding?.logoBase64;
  const mastheadBg = primaryColor || DEFAULT_COLOR;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <div className="text-sm text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      {/* Nav */}
      <nav className="border-b border-[#e5ddd0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-[#171717]">
            Ad Adviser
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f7f4ef]"
          >
            Back to dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Report branding</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Your logo and company details appear on every PDF audit report you export.
          </p>
        </div>

        {/* Logo upload */}
        <div className="rounded-lg border border-[#e5ddd0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#171717]">Company logo</h2>
          <p className="mt-1 text-xs text-[#6b7280]">PNG, JPEG, WebP, or SVG · max 500 KB · displayed at up to 48 × 180 px on reports</p>

          {currentLogo ? (
            <div className="mt-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentLogo}
                alt="Your logo"
                className="h-12 max-w-[180px] rounded border border-[#e5ddd0] object-contain p-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-[#d1cac0] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f7f4ef]"
                >
                  Replace
                </button>
                <button
                  onClick={() => deleteLogo.mutate()}
                  disabled={deleteLogo.isPending}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d1cac0] py-8 text-center hover:border-[#171717] hover:bg-[#f7f4ef]"
            >
              {uploadLogo.isPending ? (
                <span className="text-sm text-[#6b7280]">Uploading…</span>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-[#374151]">Click or drag to upload logo</p>
                  <p className="mt-1 text-xs text-[#6b7280]">PNG, JPEG, WebP, SVG · max 500 KB</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoFile(file);
              e.target.value = "";
            }}
          />

          {logoError && (
            <p className="mt-2 text-xs text-red-600">{logoError}</p>
          )}
        </div>

        {/* Text fields */}
        <div className="rounded-lg border border-[#e5ddd0] bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#171717]">Report details</h2>

          <Field
            label="Company / agency name"
            hint='Shown in the report header and footer instead of "AdAdviser"'
            value={companyName}
            onChange={setCompanyName}
            placeholder="Acme Digital Agency"
          />
          <Field
            label="Tagline"
            hint="Optional — shown under your logo in the header"
            value={tagline}
            onChange={setTagline}
            placeholder="Data-driven performance marketing"
          />
          <Field
            label="Prepared by"
            hint={`Replaces "AdAdviser Engine + AI Strategist" in the report metadata`}
            value={preparedBy}
            onChange={setPreparedBy}
            placeholder="Acme Agency Analytics Team"
          />
          <Field
            label="Website"
            hint="Shown in the report footer as a link"
            value={website}
            onChange={setWebsite}
            placeholder="https://acme.com"
            type="url"
          />

          {/* Color picker */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">
              Report accent color
              <span className="ml-2 text-xs font-normal text-[#6b7280]">Masthead background</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-[#d1cac0] p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setPrimaryColor(v);
                }}
                maxLength={7}
                className="w-28 rounded-md border border-[#d1cac0] px-3 py-1.5 text-sm font-mono focus:border-[#171717] focus:outline-none"
                placeholder="#0F3A2C"
              />
              <button
                onClick={() => setPrimaryColor(DEFAULT_COLOR)}
                className="text-xs text-[#6b7280] underline-offset-2 hover:underline"
              >
                Reset default
              </button>
            </div>
          </div>
        </div>

        {/* Live preview strip */}
        <div className="rounded-lg border border-[#e5ddd0] overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: mastheadBg }}
          >
            <div className="flex items-center gap-3">
              {currentLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentLogo} alt="Logo preview" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {companyName || "Your Company"}
                </span>
              )}
              {tagline && (
                <span className="text-xs text-white/60">{tagline}</span>
              )}
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-white/50">
              Performance Audit
            </span>
          </div>
          <div className="bg-white px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-[#6b7280]">
              Audited by <strong className="text-[#374151]">{preparedBy || "AdAdviser Engine + AI Strategist"}</strong>
            </span>
            <span className="text-xs text-[#9ca3af]">Preview</span>
          </div>
        </div>

        {/* Save */}
        {saveError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="rounded-xl bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d2d2d] disabled:opacity-40"
          >
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "Save branding"}
          </button>
          {saveStatus === "saved" && (
            <span className="text-sm text-green-600">Changes will apply to your next generated PDF.</span>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[#374151]">{label}</label>
      {hint && <p className="text-xs text-[#6b7280]">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#d1cac0] px-3 py-2 text-sm text-[#171717] placeholder:text-[#9ca3af] focus:border-[#171717] focus:outline-none"
      />
    </div>
  );
}
