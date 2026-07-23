"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/brand-logo";

const navItems = [
  { href: "/#solutions", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

export function PublicHeader() {
  const { data: auth, isLoading } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-[#2b2340] bg-[#0b0712]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-white">
          <BrandLogo
            size={38}
            priority
            labelClassName="text-sm font-extrabold uppercase tracking-[0.14em]"
          />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#b8aec8] transition-colors hover:text-white"
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
              className="rounded-md bg-[#eaff00] px-4 py-2 text-sm font-semibold text-[#0b0712] hover:bg-white"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[#d8d1e6] hover:bg-[#21192f]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#eaff00] px-4 py-2 text-sm font-semibold text-[#0b0712] hover:bg-white"
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
    <footer className="border-t border-[#2b2340] bg-[#0b0712]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="/" className="text-white">
            <BrandLogo
              size={42}
              labelClassName="text-sm font-extrabold uppercase tracking-[0.14em]"
            />
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#a99fba]">
            AI-assisted ad account audits for teams that need clear findings,
            prioritized fixes, and client-ready reporting across Meta, Google,
            and TikTok.
          </p>
          <p className="mt-3 text-sm text-[#a99fba]">
            Contact:{" "}
            <a href="mailto:info@adadviser.uk" className="hover:text-[#eaff00]">
              info@adadviser.uk
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-[#a99fba]">
            <li>
              <Link href="/#solutions" className="hover:text-[#eaff00]">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-[#eaff00]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-[#eaff00]">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[#eaff00]">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Legal</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#a99fba]">
            <Link href="/privacy" className="hover:text-[#eaff00]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#eaff00]">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="hover:text-[#eaff00]">
              Data Deletion
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#2b2340] px-6 py-4 text-center text-xs text-[#756b86]">
        © {new Date().getFullYear()} Ad Adviser. All rights reserved.
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0712] text-[#f7f4ff]">
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b49eff]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-[#a99fba]">
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
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b49eff] transition-colors hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b49eff]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm text-[#a99fba]">Last updated: {updatedAt}</p>
        <div className="mt-8 space-y-8 rounded-lg border border-[#2b2340] bg-[#15101f] p-6 text-sm leading-7 text-[#c8bfd6] md:p-8">
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
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
