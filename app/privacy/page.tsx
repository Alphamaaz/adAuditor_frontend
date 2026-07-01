import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm lg:p-12">
        <h1 className="text-3xl font-bold text-[#171717]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#6b7280]">Last Updated: July 1, 2026</p>

        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-[#374151]">
          <section>
            <h2 className="text-xl font-semibold text-[#171717]">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, connect your advertising platforms (Meta/Facebook, Google Ads, and TikTok), and use our auditing services. This includes your name, email address, and advertising performance data (campaign, ad group, keyword, and spend metrics) retrieved via each platform&apos;s official API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">2. How We Use Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, specifically to generate audit reports, identify wasted ad spend, and provide recommendations for your advertising campaigns. We do not use advertising data obtained through platform APIs for advertising, resale, or any purpose unrelated to producing the audit you request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with third-party advertising platforms (Meta, Google, and TikTok) as necessary to perform the requested audits through their official API integrations. We do not transfer platform data to third parties except as required to operate the service (e.g., our cloud hosting provider), to comply with the law, or with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">4. Data Security</h2>
            <p>
              We protect the sensitive data we access — including advertising performance data retrieved from platform APIs — using the following mechanisms:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Encryption in transit:</strong> all data exchanged between your browser, our servers, and platform APIs is encrypted using TLS (HTTPS).</li>
              <li><strong>Encrypted credentials:</strong> OAuth access and refresh tokens for Meta, Google, and TikTok are encrypted with AES-256-GCM before they are stored, and are decrypted only in memory when performing an audit you requested.</li>
              <li><strong>Hashed secrets:</strong> account passwords are stored as salted scrypt hashes, and session and verification tokens are stored only as SHA-256 hashes — never in plaintext.</li>
              <li><strong>Access controls:</strong> access to production data is restricted to authorized personnel on a least-privilege basis, and each customer&apos;s data is isolated to their own workspace.</li>
              <li><strong>Minimal scope:</strong> we request only the read-only API scopes required to perform an audit and never request permission to create, edit, or pause your campaigns.</li>
              <li><strong>Secure deletion:</strong> when you delete your account or revoke access, the associated advertising data and stored tokens are permanently removed from our systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">5. Google API Services — Limited Use</h2>
            <p>
              AdAuditor Pro&apos;s use and transfer of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-[#1f4d3a] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. Data obtained from the Google Ads API is used solely to provide and improve the audit features you request, is not used for advertising, is not sold, and is not transferred to others except as necessary to provide or improve the service, to comply with applicable law, or as part of a merger or acquisition. We do not use Google user data to train generalized artificial-intelligence or machine-learning models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">6. Data Retention and Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time by visiting our <Link href="/data-deletion" className="text-[#1f4d3a] underline">Data Deletion Instructions</Link> page. You may also revoke our access to your Google account at any time through your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-[#1f4d3a] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account permissions
              </a>{" "}
              page.
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
