import Link from "next/link";
import { PublicShell, SectionHeader } from "@/components/public-site";

const values = [
  {
    title: "Clarity over raw dashboards",
    text: "The product turns ad account exports and context answers into prioritized findings instead of another metrics table.",
  },
  {
    title: "Context before recommendations",
    text: "Business goals, funnel type, monthly spend, conversion volume, and platform setup matter before judging performance.",
  },
  {
    title: "Practical operator output",
    text: "Every audit should help the user decide what to fix first, what to monitor, and what can wait.",
  },
];

const roadmap = [
  "Manual upload audit engine",
  "OAuth imports for Meta, Google, and TikTok",
  "AI-assisted report writing",
  "PDF report generation",
  "Admin dashboard and subscription management",
  "Long-term memory and benchmarking across historical audits",
];

export default function AboutPage() {
  return (
    <PublicShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9d5c2e]">
              About
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#171717] md:text-5xl">
              Built to make paid media audits faster, more consistent, and more useful.
            </h1>
          </div>
          <div className="rounded-lg border border-[#e5ddd0] bg-white p-6">
            <p className="text-base leading-8 text-[#4b5563]">
              Ad Adviser is a SaaS tool for agencies, consultants, and
              growth teams that need to inspect ad accounts across Meta,
              Google, and TikTok. The system combines structured onboarding,
              platform-specific questionnaires, file uploads, future OAuth
              imports, deterministic audit rules, and AI-generated report
              narratives.
            </p>
            <p className="mt-4 text-base leading-8 text-[#4b5563]">
              The first product goal is a ready-to-sell audit workflow. The
              longer-term goal is to evolve into a broader AI ad agency
              operating system that can remember account history, recommend
              next actions, and support ongoing optimization.
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              eyebrow="Principles"
              title="What guides the product"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {values.map((value) => (
                <article
                  key={value.title}
                  className="rounded-lg border border-[#e5ddd0] bg-[#fbfaf7] p-5"
                >
                  <h2 className="text-base font-semibold text-[#171717]">
                    {value.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                    {value.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Roadmap"
                title="A foundation for a larger ad intelligence product"
                description="The current build focuses on the audit workflow while keeping the architecture ready for SaaS billing, admin controls, OAuth, and smarter memory."
              />
            </div>
            <div className="space-y-3">
              {roadmap.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#e5ddd0] bg-white p-4 text-sm font-semibold text-[#374151]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1f4d3a] px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Start with a clean audit workflow.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#d8eadf]">
            Create an account and run the first audit using manual platform
            exports while direct integrations are prepared.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#1f4d3a] hover:bg-[#f7f4ef]"
          >
            Create account
          </Link>
        </section>
      </main>
    </PublicShell>
  );
}
