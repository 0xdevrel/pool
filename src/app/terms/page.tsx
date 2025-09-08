import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Pool",
  description: "Terms governing the use of the Pool app gated by World ID.",
};

export default function TermsPage() {
  return (
    <main className="content-page">
      <h1 className="content-title">Terms of Use</h1>
      <p className="content-updated">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <section className="content-section">
        <h2 className="content-subtitle">Acceptance of Terms</h2>
        <p>
          By accessing or using this Pool app, you agree to be bound by these Terms of Use. If you
          do not agree, do not use the app.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Eligibility and Verification</h2>
        <p>
          Access to gameplay requires World ID verification via World App using Worldcoin MiniKit.
          You are responsible for ensuring your device and environment can complete verification.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">License and Use</h2>
        <ul>
          <li>You may use the app for personal, non-commercial purposes.</li>
          <li>Do not attempt to bypass verification, disrupt services, or reverse engineer the app.</li>
          <li>We may modify or discontinue features at any time without notice.</li>
          <li>Liquidity pool features are subject to additional terms and risks.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Disclaimers</h2>
        <p>
          The app is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind.
          We do not warrant uninterrupted operation, accuracy of pool data, or compatibility
          with all devices. Liquidity pool investments carry financial risks.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising out of or relating to your use of the
          app.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Third-Party Services</h2>
        <p>
          Verification and related functionality rely on Worldcoin MiniKit and World App. Their
          independent terms and policies apply to those interactions.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Changes to Terms</h2>
        <p>
          We may update these Terms of Use from time to time. Your continued use of the app after
          updates become effective constitutes acceptance of the revised terms.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Contact</h2>
        <p>
          Questions? Email <a href="mailto:introvertmac@gmail.com">introvertmac@gmail.com</a>
        </p>
      </section>

      <div className="content-back">
        <Link href="/" className="footer-link">← Back to Home</Link>
      </div>
    </main>
  );
}


