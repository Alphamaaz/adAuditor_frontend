import Link from "next/link";
import { PublicShell, SectionHeader } from "@/components/public-site";
import { fallbackPlans } from "@/lib/plans";

const platforms = ["Meta Ads", "Google Ads", "TikTok Ads"];

const features = [
  {
    title: "Manual upload and OAuth-ready flows",
    text: "Start with exported campaign reports today, then move the same audit pipeline to direct account connections after platform approvals are complete.",
  },
  {
    title: "Questionnaire-aware analysis",
    text: "Business goals, funnel details, tracking setup, and platform-specific answers become audit context so findings are judged against the client's real situation.",
  },
  {
    title: "Rule engine plus AI narration",
    text: "Deterministic checks identify the issues. The AI layer turns those findings into clear summaries, priorities, and client-ready recommendations.",
  },
  {
    title: "Cross-platform reporting",
    text: "Review spend, conversion quality, structure, creative fatigue, and tracking signals across the channels your client actually uses.",
  },
  {
    title: "Agency-ready workflow",
    text: "Create an audit, collect platform answers, upload or connect data, run the engine, and open a report where the team left off.",
  },
  {
    title: "SaaS controls foundation",
    text: "Built for organizations, subscriptions, admin oversight, plan limits, account security, and long-term audit history.",
  },
];

const steps = [
  "Create an organization account",
  "Complete the business and platform questionnaire",
  "Upload reports or connect ad platforms",
  "Run the audit engine",
  "Review priorities and export client-ready insights",
];

const auditAreas = [
  "Tracking and pixel/tag readiness",
  "Budget fragmentation and wasted spend",
  "Campaign structure and objective alignment",
  "Creative fatigue and refresh cadence",
  "Conversion volume and scaling readiness",
  "Platform-specific missing data warnings",
];

const pricingPreview = fallbackPlans.map((plan) => ({
  name: plan.name,
  price: `${plan.formattedPrice}/month`,
  text: plan.description || "A flexible plan for ad audit teams.",
}));

function ProductPreview() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#d8d1c7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#1f2937]">
            Audit report preview
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Meta, Google, TikTok - Manual upload
          </p>
        </div>
        <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#1f4d3a]">
          Completed
        </span>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        {[
          ["Health score", "84/100", "Strong"],
          ["Critical issues", "1", "Fix first"],
          ["Quick wins", "7", "Ready"],
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-md border border-[#ece7df] p-4">
            <p className="text-xs font-medium uppercase text-[#6b7280]">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#171717]">
              {value}
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">{note}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-[#ece7df] p-5">
        <div className="space-y-3">
          {[
            ["Critical", "Verify event tracking before scaling budgets"],
            ["High", "Consolidate campaigns with thin conversion data"],
            ["Medium", "Refresh fatigued creatives in the top ad sets"],
          ].map(([severity, issue]) => (
            <div
              key={issue}
              className="flex items-center justify-between gap-4 rounded-md bg-[#f7f4ef] px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#9d3b2f]">
                {severity}
              </span>
              <span className="text-right text-sm text-[#374151]">
                {issue}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#9d5c2e]">
              AI-powered ad account auditor
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-[#171717] md:text-6xl">
              Turn ad account data into a prioritized growth roadmap.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4b5563]">
              Ad Adviser helps agencies and marketers audit Meta, Google,
              and TikTok ad accounts with structured questionnaires, manual
              uploads, OAuth-ready data flows, deterministic checks, and AI
              report writing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-[#1f4d3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183c2d]"
              >
                Start your first audit
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-[#c9c1b8] px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-white"
              >
                View pricing
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-[#d8d1c7] bg-white px-3 py-1 text-sm font-medium text-[#4b5563]"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <ProductPreview />
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              eyebrow="Platform"
              title="Everything needed to turn messy ad data into a clear audit"
              description="The product is designed around the real workflow: capture client context, collect platform data, normalize it, find issues, and produce a report the team can act on."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-lg border border-[#e5ddd0] bg-[#fbfaf7] p-5"
                >
                  <h3 className="text-base font-semibold text-[#171717]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Workflow"
                title="Built for repeatable client audits"
                description="Every audit follows a clean path so teams can resume work, understand missing data, and keep reporting consistent."
              />
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-lg border border-[#e5ddd0] bg-white p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f4d3a] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#374151]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1f2937] py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f0c48b]">
                Audit coverage
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                Checks that map to business decisions
              </h2>
              <p className="mt-4 text-base leading-7 text-[#d1d5db]">
                Findings are grouped by severity and category, so the output is
                useful for operators, founders, agencies, and clients.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {auditAreas.map((area) => (
                <div
                  key={area}
                  className="rounded-lg border border-white/15 bg-white/8 p-4 text-sm font-medium text-[#f9fafb]"
                >
                  {area}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              eyebrow="Pricing"
              title="Flexible pricing managed by the product owner"
              description="Plans can be configured for audit volume, platform limits, history access, and team needs as the SaaS grows."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {pricingPreview.map((plan) => (
                <article
                  key={plan.name}
                  className="rounded-lg border border-[#e5ddd0] bg-[#fbfaf7] p-6"
                >
                  <h3 className="text-lg font-semibold text-[#171717]">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-3xl font-semibold text-[#171717]">
                    {plan.price}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#6b7280]">
                    {plan.text}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="inline-flex rounded-md bg-[#1f4d3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183c2d]"
              >
                See plan details
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-semibold text-[#171717]">
              Ready to make ad audits faster and more consistent?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6b7280]">
              Create an account, complete onboarding, and run the first audit
              using manual exports while OAuth platform approvals are prepared.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-[#1f4d3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183c2d]"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-[#c9c1b8] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fbfaf7]"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
