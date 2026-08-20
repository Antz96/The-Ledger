import LegalPage, { LegalSection, Placeholder } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service — The Ledger" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="2026-08-20">
      <LegalSection title="1. Who we are">
        <p>
          The Ledger (&ldquo;Ledger&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by{" "}
          <Placeholder>legal entity name</Placeholder>, a company registered in{" "}
          <Placeholder>jurisdiction, company number</Placeholder> with its registered office at{" "}
          <Placeholder>registered address</Placeholder>. By creating an account or using Ledger, you agree to these
          Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. What Ledger is — and isn&apos;t">
        <p>
          Ledger is an educational and organisational tool. It helps you see what you own and owe, understand what
          job your money is doing, browse general categories of financial products, and calculate the consequences
          of choices you make yourself.
        </p>
        <p>
          Ledger is <strong className="text-[var(--text)]">not</strong> a financial adviser, is{" "}
          <strong className="text-[var(--text)]">not</strong> authorised or regulated by the Financial Conduct
          Authority, and does not provide personalised investment, pension, mortgage, insurance, or debt advice.
          Nothing in Ledger is a personal recommendation. Ledger cannot move money, place trades, or execute
          transactions on your behalf. Where Ledger shows calculations based on choices you&apos;ve made (for
          example, a debt payoff order, or a savings split you&apos;ve set), those calculations show the
          consequences of your own choice — they are not Ledger recommending that choice.
        </p>
        <p>
          For advice specific to your circumstances, speak to a licensed, FCA-authorised financial adviser or, for
          debt, a free debt advice charity (see our <a href="/privacy" className="underline">Privacy Policy</a> for
          links).
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility">
        <p>
          You must be at least <Placeholder>minimum age — likely 18</Placeholder> and a resident of{" "}
          <Placeholder>supported jurisdiction(s)</Placeholder> to use Ledger. By using Ledger you confirm you meet
          this requirement.
        </p>
      </LegalSection>

      <LegalSection title="4. Your account">
        <p>
          You&apos;re responsible for keeping your login credentials secure and for all activity under your
          account. Tell us immediately at <Placeholder>security contact email</Placeholder> if you suspect
          unauthorised access.
        </p>
      </LegalSection>

      <LegalSection title="5. Connecting a bank account">
        <p>
          Ledger&apos;s Connections feature uses a third-party Open Banking provider to read your account balance
          and transactions, with your explicit consent given directly to your bank during the connection flow.
          Ledger never sees or stores your banking login credentials — that step happens entirely on your
          bank&apos;s own site. You can disconnect an account at any time from the Connections page. This feature
          is experimental and provided as-is.
        </p>
      </LegalSection>

      <LegalSection title="6. The AI Assistant">
        <p>
          Ledger&apos;s Assistant is powered by a third-party AI model. It can look up your own data and perform
          calculations, but like any AI system it can make mistakes, and its replies are not verified by a human
          before you see them. Automated checks are in place to decline requests for personalised financial advice
          or to execute transactions, but these checks are not infallible. Don&apos;t treat anything the Assistant
          says as advice, and verify anything important independently.
        </p>
      </LegalSection>

      <LegalSection title="7. Acceptable use">
        <p>
          Don&apos;t use Ledger to break the law, attempt to access another user&apos;s data, interfere with the
          service, or reverse-engineer or scrape it. We can suspend or terminate accounts that misuse the service.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          The Ledger name, design, and underlying software are owned by <Placeholder>legal entity name</Placeholder>.
          Your own data — the transactions, assets, goals, and figures you enter — remains yours.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers and liability">
        <p>
          Ledger is provided &ldquo;as is&rdquo;. Educational content, rate information, and calculations are
          provided in good faith but may contain errors or become outdated — always verify figures independently
          before acting on them, especially rates and terms shown on the Rates page, which can change without
          notice.
        </p>
        <p>
          <Placeholder>
            Limitation-of-liability clause — the specific wording and any liability cap needs to be drafted by a
            solicitor and will depend on the jurisdiction and business structure chosen.
          </Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          You can stop using Ledger and delete your account at any time. We may suspend or close accounts that
          violate these Terms, with notice where reasonably possible.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these Terms">
        <p>
          We may update these Terms as Ledger changes. We&apos;ll update the &ldquo;Last updated&rdquo; date above;
          material changes will be flagged more prominently once Ledger has real users to notify.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of <Placeholder>jurisdiction — likely England and Wales</Placeholder>.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>Questions about these Terms: <Placeholder>contact email</Placeholder>.</p>
      </LegalSection>
    </LegalPage>
  );
}
