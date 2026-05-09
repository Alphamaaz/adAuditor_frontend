import { LegalPage, LegalSection } from "@/components/public-site";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updatedAt="May 8, 2026">
      <LegalSection title="1. Agreement">
        <p>
          These Terms of Service govern access to and use of AdAuditor Pro. By
          creating an account or using the service, users agree to these terms
          and any additional policies referenced by the product.
        </p>
        <p>
          This page is a product-ready terms draft and should be reviewed by the
          business owner and legal counsel before public launch.
        </p>
      </LegalSection>

      <LegalSection title="2. Service Description">
        <p>
          AdAuditor Pro provides tools for collecting advertising account
          context, uploading or connecting advertising data, running audit
          checks, generating findings, and preparing AI-assisted audit reports.
        </p>
      </LegalSection>

      <LegalSection title="3. Account Responsibilities">
        <p>
          Users are responsible for providing accurate account information,
          protecting login credentials, maintaining authorized access to any ad
          accounts they upload or connect, and ensuring that their use of the
          service complies with applicable laws and platform rules.
        </p>
      </LegalSection>

      <LegalSection title="4. Advertising Platform Access">
        <p>
          Users may only upload or connect advertising data that they own or are
          authorized to access. OAuth connections, when available, may be subject
          to Meta, Google, TikTok, and other platform requirements.
        </p>
      </LegalSection>

      <LegalSection title="5. AI-Generated Output">
        <p>
          AI-assisted summaries and recommendations are provided for business
          decision support. Users should review outputs before relying on them,
          presenting them to clients, or making advertising changes.
        </p>
      </LegalSection>

      <LegalSection title="6. Subscriptions and Billing">
        <p>
          Paid plans, usage limits, renewals, cancellations, and refunds will be
          governed by the pricing terms displayed at checkout or assigned by the
          product administrator. Stripe or another payment provider may process
          payments when billing is enabled.
        </p>
      </LegalSection>

      <LegalSection title="7. Acceptable Use">
        <p>
          Users may not misuse the service, attempt unauthorized access, upload
          malicious files, interfere with product infrastructure, violate
          platform policies, or use the service to process data they are not
          permitted to use.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual Property">
        <p>
          The service, product design, code, branding, and generated system
          templates belong to the product owner or its licensors. Users retain
          ownership of their uploaded business and advertising data.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers">
        <p>
          The service is provided as an audit and decision-support tool. We do
          not guarantee advertising performance, revenue increases, platform
          approval, or specific business outcomes.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to Terms">
        <p>
          We may update these terms as the product evolves. Continued use of the
          service after changes are posted means the user accepts the updated
          terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          For questions about these terms, contact the AdAuditor Pro team using
          the official support channel provided by the business owner.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
