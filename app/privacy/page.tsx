import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/public-site";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="July 1, 2026">
      <LegalSection title="1. Information We Collect">
        <p>
          We collect information you provide when creating an account, connecting
          Meta, Google Ads, or TikTok, and using the audit service. This can include
          your name, email address, and advertising performance data retrieved
          through each platform&apos;s official API.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p>
          We use this information to provide, maintain, and improve requested audit
          services, including generating reports, identifying wasted spend, and
          producing recommendations. We do not use platform data for resale or for
          unrelated advertising.
        </p>
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>
          We do not sell personal data. Information is shared only where necessary
          to operate the service, comply with law, complete a business transaction
          subject to equivalent protections, or act with your consent.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Security">
        <ul className="list-disc space-y-2 pl-5">
          <li>Data in transit is protected with TLS.</li>
          <li>OAuth tokens are encrypted at rest and decrypted only when needed.</li>
          <li>Passwords and session secrets are stored as secure hashes.</li>
          <li>Production access is restricted using least-privilege controls.</li>
          <li>We request only the platform permissions required for the service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Google API Services - Limited Use">
        <p>
          Ad Adviser&apos;s use and transfer of information received from Google APIs
          adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-[#eaff00] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements. Google user data is not sold,
          used for targeted advertising, or used to train generalized AI models.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention and Deletion">
        <p>
          We retain user data only while the account is active or as needed to
          provide the requested service and meet legal obligations. Follow our{" "}
          <Link href="/data-deletion" className="text-[#eaff00] underline">
            Data Deletion Instructions
          </Link>{" "}
          to request removal. You may also revoke Google access from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            className="text-[#eaff00] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Account permissions
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
