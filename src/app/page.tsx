"use client";

import { useState } from "react";
import { VerifyButton } from "@/components/VerifyButton";
import { SudokuGame } from "@/components/SudokuGame";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [isVerified, setIsVerified] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [seed, setSeed] = useState(0);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowWelcome(false);
    setSeed((s) => s + 1);
  };

  const handleStart = () => {
    setShowWelcome(false);
  };

  if (!isVerified) {
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="welcome-card">
            <div className="app-icon">
              <Image
                src="/sudoku.png"
                alt="Sudoku Logo"
                width={96}
                height={96}
                style={{ filter: "none" }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{color:"var(--foreground)"}}>Sudoku</h1>
            <p className="text-sm mb-3" style={{color:"var(--secondary)"}}>Win games to enter the monthly raffle.</p>
           
            <div className="features-card">
              <h2 className="text-lg font-semibold mb-4" style={{color:"var(--foreground)"}}>Features</h2>
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span style={{color:"var(--secondary)"}}>Fresh puzzle after verification</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span style={{color:"var(--secondary)"}}>Clean mobile interface</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span style={{color:"var(--secondary)"}}>Smart highlighting</span>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <span style={{color:"var(--secondary)"}}>Privacy-preserving verification</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-sm">
            <VerifyButton onVerificationSuccess={handleVerificationSuccess} />
          </div>
        </div>
        <div className="footer">
          <div className="footer-content">
           <p className="footer-text"> Check our new app <a href="https://worldcoin.org/mini-app?app_id=app_9b2891fd6d223a79bfad9249973455c1" target="_blank" rel="noopener noreferrer" className="footer-link link-success"> Frame </a> </p>
            <p className="footer-text" style={{ marginTop: 4 }}>
              Made with <span aria-hidden>❤️</span> by {" "}
              <a
                href="https://x.com/0xminiapps"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link bold link-accent"
              >
                IBRL Labs
              </a>
            </p>
            <div className="footer-links">
              <Link href="/privacy" className="footer-link link-success">
                Privacy Policy
              </Link>
              <span className="footer-separator">•</span>
              <Link href="/terms" className="footer-link link-purple">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome && isVerified) {
    return (
      <div className="success-screen">
        <div className="welcome-content">
          <div className="welcome-card">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Ready</h1>
            <p className="text-lg text-gray-600 mb-6">Tap to start playing.</p>
            <button onClick={handleStart} className="start-button">Start</button>
          </div>
        </div>
      </div>
    );
  }

  return <SudokuGame key={seed} onGameEnd={() => {}} />;
}