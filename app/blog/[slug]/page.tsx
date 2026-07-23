import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-site";
import { BLOG_ARTICLES, getBlogArticle } from "../data";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return { title: "Article not found | AdAdviser" };
  return {
    title: `${article.title} | AdAdviser`,
    description: article.excerpt,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-4xl px-6 py-14 md:py-20">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[#b49eff] hover:text-white"
        >
          &larr; All articles
        </Link>
        <header className="mt-10 border-b border-[#2b2340] pb-10">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#b49eff]">
            {article.category}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#b8aec8]">
            {article.excerpt}
          </p>
          <div className="mt-7 flex gap-4 font-mono text-xs text-[#756b86]">
            <span>{article.publishedAt}</span>
            <span aria-hidden="true">/</span>
            <span>{article.readTime}</span>
          </div>
        </header>

        <article className="py-10">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-12">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {section.heading}
              </h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-[#c8bfd6]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-6 space-y-3 border-l-2 border-[#7b5ef8] pl-6 text-base leading-7 text-[#c8bfd6]">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <aside className="rounded-lg border border-[#40345a] bg-[#15101f] p-7 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              Find the costly issues in your own account.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#a99fba]">
              Run a complete audit and get a prioritized, evidence-backed action plan.
            </p>
          </div>
          <Link
            href="/signup"
            className="mt-5 inline-flex shrink-0 rounded-full bg-[#eaff00] px-5 py-3 text-sm font-bold text-[#0b0712] hover:bg-white md:mt-0"
          >
            Get a free audit
          </Link>
        </aside>
      </main>
    </PublicShell>
  );
}
