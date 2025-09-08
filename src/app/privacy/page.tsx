import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Pool",
  description: "Privacy practices for the Pool app gated by World ID.",
};

export default function PrivacyPage() {
  return (
    <main className="content-page">
      <h1 className="content-title">Privacy Policy</h1>
      <p className="content-updated">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <section className="content-section">
        <h2 className="content-subtitle">Overview</h2>
        <p>
          This Pool app uses World ID verification via Worldcoin MiniKit to access liquidity pool features. We
          aim to minimize data collection and handle verification in a privacy-preserving manner.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Information We Collect</h2>
        <ul>
          <li>We do not collect or store personal information such as name, phone number, or address.</li>
          <li>
            For verification, the app requests a proof from World App using Worldcoin MiniKit. The
            proof is sent to our verification endpoint solely to validate authenticity with
            Worldcoin’s servers.
          </li>
          <li>We do not persist verification payloads or link them to user identities.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Use of Information</h2>
        <p>
          Verification results are used only to determine whether to unlock pool access for the current
          session. We do not build profiles or perform analytics on verification data.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Retention</h2>
        <p>
          We do not retain verification payloads or store personal data on our servers. Logs may
          contain transient technical information for debugging and security, which are periodically
          rotated.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Third-Party Services</h2>
        <p>
          World ID verification is provided by Worldcoin MiniKit and World App. Their independent
          terms and policies apply to verification interactions.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Children’s Privacy</h2>
        <p>
          This app is not intended for children under the age of 13. If you believe a child has
          provided us with information, please contact us so we can address it.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-subtitle">Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of the app after
          changes become effective constitutes acceptance of the revised policy.
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


