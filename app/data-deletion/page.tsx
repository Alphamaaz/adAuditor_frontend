import { LegalPage, LegalSection } from "@/components/public-site";

export default function DataDeletionPage() {
  return (
    <LegalPage title="Data Deletion Instructions" updatedAt="July 18, 2026">
      <p>
        You can remove Ad Adviser&apos;s access or request deletion of your account
        data at any time. These instructions apply to connected Meta, Google,
        and TikTok accounts.
      </p>

      <LegalSection title="1. Request account deletion">
        <p>
          Email <strong>support@adadviser.uk</strong> from your registered email
          address with the subject &quot;Data Deletion Request&quot;. After verifying the
          request, we remove the associated profile, platform tokens, business
          profile, and stored audit data according to our retention obligations.
        </p>
      </LegalSection>

      <LegalSection title="2. Remove Google access">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Open your{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-[#eaff00] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Account permissions
            </a>
            .
          </li>
          <li>Find Ad Adviser under third-party access.</li>
          <li>Select the application and choose Remove Access.</li>
        </ol>
      </LegalSection>

      <LegalSection title="3. Remove Meta access">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open Facebook Settings &amp; privacy, then Settings.</li>
          <li>Open Apps and Websites.</li>
          <li>Find Ad Adviser and select Remove.</li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Need help?">
        <p>
          Contact <strong>support@adadviser.uk</strong> if you cannot access your
          account or need confirmation that a request has been completed.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
