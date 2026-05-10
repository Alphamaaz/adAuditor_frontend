"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";

const navItems = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function PublicHeader() {
  const { data: auth, isLoading } = useCurrentUser();

  return (
    <header className="border-b border-[#e5ddd0] bg-[#fbfaf7]/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-[#171717]">
          AdAuditor Pro
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#4b5563] hover:text-[#171717]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
          ) : auth ? (
            <Link
              href={auth.user.internalRole === 'SUPER_ADMIN' ? "/admin" : "/dashboard"}
              className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#2f4f4f] hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183c2d]"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#e5ddd0] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-semibold text-[#171717]">AdAuditor Pro</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6b7280]">
            AI-assisted ad account audits for teams that need clear findings,
            prioritized fixes, and client-ready reporting across Meta, Google,
            and TikTok.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#171717]">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-[#6b7280]">
            <li>
              <Link href="/privacy" className="hover:text-[#1f4d3a]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#1f4d3a]">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/data-deletion" className="hover:text-[#1f4d3a]">
                Data Deletion
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#171717]">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#6b7280]">
            <Link href="/privacy" className="hover:text-[#171717]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#171717]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#ece7df] px-6 py-4 text-center text-xs text-[#6b7280]">
        © {new Date().getFullYear()} AdAuditor Pro. All rights reserved.
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#171717]">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9d5c2e]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#171717] md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-[#6b7280]">
          {description}
        </p>
      )}
    </div>
  );
}

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9d5c2e]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#171717]">{title}</h1>
        <p className="mt-3 text-sm text-[#6b7280]">Last updated: {updatedAt}</p>
        <div className="mt-8 space-y-8 rounded-lg border border-[#e5ddd0] bg-white p-6 text-sm leading-7 text-[#4b5563] md:p-8">
          {children}
        </div>
      </main>
    </PublicShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[#171717]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
