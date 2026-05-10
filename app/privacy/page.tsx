import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm lg:p-12">
        <h1 className="text-3xl font-bold text-[#171717]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#6b7280]">Last Updated: May 10, 2026</p>
        
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-[#374151]">
          <section>
            <h2 className="text-xl font-semibold text-[#171717]">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, connect your advertising platforms (Meta/Facebook), and use our auditing services. This includes your name, email address, and advertising performance data retrieved via official APIs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, specifically to generate audit reports, identify wasted ad spend, and provide recommendations for your advertising campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with third-party advertising platforms (like Meta) as necessary to perform the requested audits through their official API integrations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">4. Data Retention and Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time by visiting our <Link href="/data-deletion" className="text-[#1f4d3a] underline">Data Deletion Instructions</Link> page.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-[#e5ddd0] pt-8">
          <Link href="/" className="text-sm font-medium text-[#1f4d3a] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
