import { LegalPage, LegalSection } from "@/components/public-site";

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updatedAt="May 10, 2026">
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using Ad Adviser, you agree to be bound by these Terms
          of Service and all applicable laws and regulations. If you do not agree
          with these terms, you may not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Use License">
        <p>
          Permission is granted to use Ad Adviser for personal or commercial
          advertising-audit purposes. This is a license, not a transfer of title.
          You may not attempt to decompile or reverse engineer software contained
          in the service.
        </p>
      </LegalSection>

      <LegalSection title="3. Disclaimer">
        <p>
          Ad Adviser is provided on an &quot;as is&quot; basis. To the extent permitted by
          law, Ad Adviser disclaims implied warranties, including merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
      </LegalSection>

      <LegalSection title="4. Accuracy of Materials">
        <p>
          Audit reports are based on data retrieved from third-party advertising
          platforms. We work to produce accurate and useful reports, but do not
          warrant that every item is complete, current, or suitable for every
          business decision.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
