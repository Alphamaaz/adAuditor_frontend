"use client";

import Link from "next/link";
import { PublicShell, SectionHeader } from "@/components/public-site";
import { fallbackPlans } from "@/lib/plans";
import { usePlans } from "@/hooks/use-plans";

const faqs = [
  {
    question: "Why is pricing custom?",
    answer:
      "The product owner can configure pricing and limits from the admin side. Final public prices can be added once the commercial packaging is approved.",
  },
  {
    question: "Can users start without OAuth?",
    answer:
      "Yes. Manual uploads are supported so users can audit exported platform reports while OAuth app approvals are being completed.",
  },
  {
    question: "Are plan limits per user or organization?",
    answer:
      "Limits are planned around the organization account, which matches the SaaS model for agencies and client teams.",
  },
];

export default function PricingPage() {
  const { data, isLoading } = usePlans();
  const plans = data && data.length > 0 ? data : fallbackPlans;

  return (
    <PublicShell>
      <main>
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeader
            eyebrow="Pricing"
            title="Plans for ad audit teams at different stages"
            description="AdAuditor Pro is built with dynamic pricing support, so audit limits, platform access, and plan features can be managed as the product evolves."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="flex flex-col rounded-lg border border-[#e5ddd0] bg-white p-6"
              >
                <h2 className="text-xl font-semibold text-[#171717]">
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  {plan.description}
                </p>
                <p className="mt-6 text-4xl font-semibold text-[#171717]">
                  {plan.formattedPrice}
                  <span className="text-base font-medium text-[#6b7280]">
                    /month
                  </span>
                </p>
                {isLoading && (
                  <p className="mt-2 text-xs text-[#9ca3af]">
                    Loading live plan details...
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-3">
                  {(plan.features?.notes || []).map((feature) => (
                    <li
                      key={feature}
                      className="border-t border-[#ece7df] pt-3 text-sm text-[#374151]"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex justify-center rounded-md bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#183c2d]"
                >
                  Get started
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <SectionHeader
              title="Pricing questions"
              description="These answers match the current product plan and can be updated when final packages are approved."
            />
            <div className="mt-10 space-y-4">
              {faqs.map((item) => (
                <article
                  key={item.question}
                  className="rounded-lg border border-[#e5ddd0] bg-[#fbfaf7] p-5"
                >
                  <h2 className="text-base font-semibold text-[#171717]">
                    {item.question}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
