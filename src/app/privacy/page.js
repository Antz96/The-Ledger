import LegalPage, { LegalSection, Placeholder } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy — The Ledger" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="2026-08-20">
      <LegalSection title="1. Who we are">
        <p>
          For the purposes of UK GDPR, the data controller is <Placeholder>legal entity name</Placeholder>,{" "}
          <Placeholder>registered address</Placeholder>. Contact: <Placeholder>privacy/DPO contact email</Placeholder>.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>Reflects what&apos;s actually built into Ledger today:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Account details</strong> — email address and display name.</li>
          <li>
            <strong className="text-[var(--text)]">Financial data you enter directly</strong> — assets, liabilities,
            transactions, savings goals, your financial constitution (savings rate target, cash buffer, priorities),
            credit profile fields you choose to enter, and your monthly allocation split.
          </li>
          <li>
            <strong className="text-[var(--text)]">Bank connection data</strong> — if you connect an account via
            Connections, we read your balance and transactions live from your bank each time you view them, via a
            third-party Open Banking provider. We don&apos;t permanently store a copy of your transaction history
            from connected banks separately from what you see in the app.
          </li>
          <li>
            <strong className="text-[var(--text)]">Onboarding assessment answers</strong> — your answers to the
            initial questionnaire, stored as a rough profile (interest tags) used only to show more relevant
            educational articles and in-app suggestions within Ledger itself.
          </li>
          <li>
            <strong className="text-[var(--text)]">Assistant conversations</strong> — messages you send the AI
            Assistant, its replies, and a compliance classification for each exchange, kept as an audit log.
          </li>
          <li>
            <strong className="text-[var(--text)]">Documents you upload</strong> — bank statements or payslips you
            choose to upload are sent to our AI provider to extract figures from, and are not stored as files after
            extraction — only the figures you review and confirm are saved.
          </li>
        </ul>
        <p>We don&apos;t collect location data, and we don&apos;t currently run any analytics or advertising trackers.</p>
      </LegalSection>

      <LegalSection title="3. How we use it">
        <p>
          To provide the service you&apos;re using — calculations, dashboards, the Assistant, and connected-account
          balances — and to maintain a compliance audit trail for AI interactions. We don&apos;t use your financial
          data for advertising, don&apos;t build advertising profiles, and don&apos;t sell your data.
        </p>
      </LegalSection>

      <LegalSection title="4. Legal basis (UK GDPR)">
        <p>
          <Placeholder>
            To be confirmed with counsel — likely &ldquo;performance of a contract&rdquo; for core account
            functionality and &ldquo;legitimate interests&rdquo; for compliance/audit logging, with
            &ldquo;consent&rdquo; specifically for connecting a bank account (which also involves your separate
            consent given directly to your bank/the Open Banking provider).
          </Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="5. Who we share it with">
        <p>We use a small number of service providers (&ldquo;processors&rdquo;) to run Ledger:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Supabase</strong> — database, authentication, and file storage.</li>
          <li><strong className="text-[var(--text)]">Anthropic</strong> — processes Assistant conversations and document uploads to generate replies and extract figures.</li>
          <li><strong className="text-[var(--text)]">Enable Banking</strong> — Open Banking provider used only if you choose to connect a bank account.</li>
          <li><strong className="text-[var(--text)]">Vercel</strong> — hosts the application.</li>
        </ul>
        <p>
          Each only receives the data needed to perform their function. We don&apos;t share your data with
          advertisers, data brokers, or anyone else outside this list.{" "}
          <Placeholder>Confirm each processor&apos;s own data processing agreement and hosting region before
          relying on this section.</Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="6. International transfers">
        <p>
          <Placeholder>
            Depends on the hosting regions actually configured for Supabase/Anthropic/Vercel at launch — needs
            confirming, along with the correct transfer safeguard (e.g. UK/EU adequacy or Standard Contractual
            Clauses) if any processor is outside the UK/EEA.
          </Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="7. How long we keep it">
        <p>
          <Placeholder>
            No retention policy has been set yet. Needs a decision on how long account data, Assistant audit logs,
            and closed-account data are kept, and a process for deleting data on request.
          </Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Under UK GDPR, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Have inaccurate data corrected</li>
          <li>Delete your data — you can do this yourself at any time from the &ldquo;Delete account&rdquo; link in the app footer, or by contacting us</li>
          <li>Restrict or object to certain processing</li>
          <li>Receive your data in a portable format</li>
          <li>Complain to the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline">Information Commissioner&apos;s Office (ICO)</a></li>
        </ul>
        <p>To exercise any of these, contact <Placeholder>privacy contact email</Placeholder>.</p>
      </LegalSection>

      <LegalSection title="9. Cookies and local storage">
        <p>
          Ledger stores your sign-in session in your browser&apos;s local storage so you stay signed in — this is
          essential to the service and can&apos;t be turned off without signing out. We don&apos;t use advertising
          or analytics cookies.
        </p>
      </LegalSection>

      <LegalSection title="10. Security">
        <p>
          Your data is protected by row-level access controls so only you can read or write your own records. No
          system is completely secure, and we can&apos;t guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="11. Children">
        <p>Ledger is not intended for use by anyone under <Placeholder>minimum age — likely 18</Placeholder>.</p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>We&apos;ll update the &ldquo;Last updated&rdquo; date above whenever this policy changes.</p>
      </LegalSection>

      <LegalSection title="13. Free debt help, independent of Ledger">
        <p>Ledger isn&apos;t a debt advice service. If you need debt help beyond what a calculator can give:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><a href="https://www.stepchange.org" target="_blank" rel="noopener noreferrer" className="underline">StepChange</a> — free debt advice charity</li>
          <li><a href="https://www.nationaldebtline.org" target="_blank" rel="noopener noreferrer" className="underline">National Debtline</a> — free, independent debt advice</li>
          <li><a href="https://www.moneyhelper.org.uk" target="_blank" rel="noopener noreferrer" className="underline">MoneyHelper</a> — government-backed money and debt guidance</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
