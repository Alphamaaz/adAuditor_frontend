import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-site";
import { BLOG_ARTICLES } from "./data";

export const metadata: Metadata = {
  title: "Paid media audit insights | AdAdviser",
  description:
    "Practical Google Ads, Meta Ads, TikTok Ads, benchmarking, and agency audit guidance from AdAdviser.",
};

export default function BlogPage() {
  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#b49eff] transition-colors hover:text-white"
        >
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#b49eff]">
            From the audit desk
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
            Practical thinking for stronger ad accounts.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#a99fba] md:text-lg">
            Field guides for finding waste, diagnosing root causes, and turning account evidence into decisions clients can trust.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="flex min-h-[340px] flex-col rounded-lg border border-[#2b2340] bg-[#15101f] p-7 transition hover:-translate-y-1 hover:border-[#604c88]"
            >
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#b49eff]">
                {article.category}
              </div>
              <h2 className="mt-5 text-xl font-bold leading-8 text-white">
                {article.title}
              </h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#a99fba]">
                {article.excerpt}
              </p>
              <div className="mt-7 flex items-center justify-between border-t border-[#2b2340] pt-5">
                <span className="font-mono text-xs text-[#756b86]">
                  {article.readTime}
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-sm font-semibold text-[#eaff00] hover:text-white"
                >
                  Read article &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
