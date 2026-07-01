import Link from "next/link";

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm lg:p-12">
        <h1 className="text-3xl font-bold text-[#171717]">Data Deletion Instructions</h1>
        <p className="mt-2 text-sm text-[#6b7280]">How to remove your data from Ad Adviser</p>
        
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-[#374151]">
          <p>
            In line with the data-deletion requirements of the platforms we integrate with — including Meta, Google, and TikTok — we provide the instructions below so you can delete your data or remove our access at any time.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">1. Requesting Account Deletion</h2>
            <p>
              You can have your account and all associated data permanently deleted at any time. Send us a deletion request as described in section 4 below. Once we confirm the request comes from the registered account holder, we permanently remove your user profile, all connected platform tokens (Meta, Google, and TikTok), your business profile, and all stored audit reports from our servers <strong>within 30 days</strong>. This is a hard deletion and cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">2. Removing App via Google</h2>
            <p>
              You can revoke Ad Adviser&apos;s access to your Google account at any time. This also deletes the OAuth tokens we hold for you:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  className="text-[#1f4d3a] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Account permissions
                </a>{" "}
                page.
              </li>
              <li>Under &quot;Third-party apps with account access&quot;, find <strong>Ad Adviser</strong>.</li>
              <li>Click it, then choose <strong>Remove Access</strong>.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">3. Removing App via Facebook</h2>
            <p>
              You can also remove our access directly via Facebook:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your Facebook Profile&apos;s Settings & Privacy. Click Settings.</li>
              <li>Go to Apps and Websites and you will see all of your Apps.</li>
              <li>Search and click Ad Adviser in the search bar.</li>
              <li>Scroll and click Remove.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">4. Direct Request</h2>
            <p>
              If you are unable to access the dashboard, you can email us at <strong>support@adadviser.uk</strong> with the subject &quot;Data Deletion Request&quot; from your registered email address.
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
