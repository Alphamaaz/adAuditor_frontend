import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5ddd0] bg-white p-8 shadow-sm lg:p-12">
        <h1 className="text-3xl font-bold text-[#171717]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#6b7280]">Last Updated: May 10, 2026</p>
        
        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-[#374151]">
          <section>
            <h2 className="text-xl font-semibold text-[#171717]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Ad Adviser, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">2. Use License</h2>
            <p>
              Permission is granted to temporarily use Ad Adviser for personal or commercial advertising audit purposes. This is the grant of a license, not a transfer of title, and under this license you may not attempt to decompile or reverse engineer any software contained on the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">3. Disclaimer</h2>
            <p>
              The materials on Ad Adviser are provided on an &apos;as is&apos; basis. Ad Adviser makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#171717]">4. Accuracy of Materials</h2>
            <p>
              The audit reports provided by Ad Adviser are based on data retrieved from third-party APIs (like Meta). While we strive for accuracy, we do not warrant that any of the materials on its website are accurate, complete or current.
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
