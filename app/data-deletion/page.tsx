import Link from "next/link";

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm lg:p-12">
        <h1 className="text-3xl font-bold text-[#171717]">Data Deletion Instructions</h1>
        <p className="mt-2 text-sm text-[#6b7280]">How to remove your data from Ad Adviser</p>
        
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-[#374151]">
          <p>
            According to Meta policy for User Data Deletion, we must provide instructions on how users can delete their data when it is no longer needed or if they wish to remove our access.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">1. Deleting via Ad Adviser</h2>
            <p>
              Log in to your account, go to <strong>Settings</strong>, and click <strong>Delete Account</strong>. This will immediately and permanently remove your user profile, all connected platform tokens, and all stored audit reports from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">2. Removing App via Facebook</h2>
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
            <h2 className="text-xl font-semibold text-[#171717]">3. Direct Request</h2>
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
