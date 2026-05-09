import { LegalPage, LegalSection } from "@/components/public-site";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="May 8, 2026">
      <LegalSection title="1. Overview">
        <p>
          This Privacy Policy explains how AdAuditor Pro collects, uses, stores,
          and protects information when users access the application, create an
          account, upload advertising reports, or connect advertising platforms.
        </p>
        <p>
          This page is a product-ready policy draft and should be reviewed by
          the business owner and legal counsel before public launch.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>
          We may collect account information such as name, email address,
          organization name, authentication activity, and security-related
          session records.
        </p>
        <p>
          We may collect business profile and onboarding answers, including
          advertising goals, platforms used, funnel details, budgets, tracking
          setup, and other questionnaire responses provided by the user.
        </p>
        <p>
          We may collect uploaded advertising reports and normalized audit data
          from supported platforms including Meta Ads, Google Ads, and TikTok
          Ads. When OAuth integrations are enabled, we may collect platform data
          authorized by the user and permitted by the platform.
        </p>
      </LegalSection>

      <LegalSection title="3. How We Use Information">
        <p>
          We use information to create and manage user accounts, run ad account
          audits, validate uploaded files, generate findings, prepare AI-assisted
          summaries, provide reports, support subscriptions, enforce plan
          limits, troubleshoot issues, and improve the product.
        </p>
        <p>
          Advertising data is used to provide the audit service requested by the
          user. We do not sell uploaded ad account data.
        </p>
      </LegalSection>

      <LegalSection title="4. AI Processing">
        <p>
          Audit findings, normalized summaries, questionnaire context, and
          selected historical summaries may be sent to an AI provider to create
          report narratives and recommendations. The system is designed to send
          only the context needed for the requested audit output.
        </p>
      </LegalSection>

      <LegalSection title="5. Platform Data">
        <p>
          If a user connects a Meta, Google, or TikTok account, AdAuditor Pro
          will request only the permissions needed for audit, reporting, and
          account analysis features. Platform data is handled according to the
          applicable platform terms and permissions approved by the user.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Storage and Retention">
        <p>
          The product is planned to keep audit history and related reporting data
          for long-term account memory unless the business later defines a
          shorter retention policy. Sensitive tokens, when OAuth is enabled,
          should be encrypted before storage.
        </p>
      </LegalSection>

      <LegalSection title="7. Service Providers">
        <p>
          We may use infrastructure, database, payment, analytics, email, and AI
          service providers to operate the product. These providers may process
          information on our behalf only for product operation and support.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use reasonable technical and organizational safeguards to protect
          user accounts and audit data, including authentication controls,
          session management, access restrictions, and secure storage practices.
          No internet-based service can guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="9. User Choices">
        <p>
          Users may update profile information, change passwords, revoke active
          sessions, and manage the data they choose to upload or connect. Future
          releases may add additional account deletion and export workflows.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          For privacy questions, contact the AdAuditor Pro team using the
          official support channel provided by the business owner.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
